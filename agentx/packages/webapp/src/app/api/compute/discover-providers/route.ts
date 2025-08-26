// Discover all available 0G Compute providers on the network
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Discovering all 0G Compute providers on network...');
    
    // Import SDK
    const { createZGComputeNetworkBroker } = await import('@0glabs/0g-serving-broker');
    const { ethers } = await import('ethers');
    
    // Configuration
    const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const OG_PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY || '';
    
    // Initialize
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const wallet = new ethers.Wallet(OG_PRIVATE_KEY, provider);
    const broker = await createZGComputeNetworkBroker(wallet);
    
    console.log('✅ Broker initialized for provider discovery');
    
    // Try to discover providers through different methods
    const discoveryResults = [];
    
    // Method 1: Try common provider address patterns
    console.log('🔍 Method 1: Testing common provider address patterns...');
    
    const commonPatterns = [
      // Original providers
      '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
      '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3',
      // Try some variations
      '0xf07240Efa67755B5311bc75784a061eDB47165Da',
      '0xf07240Efa67755B5311bc75784a061eDB47165Db',
      '0xf07240Efa67755B5311bc75784a061eDB47165Dc',
      // Try different address ranges
      '0xa07240Efa67755B5311bc75784a061eDB47165Dd',
      '0xb07240Efa67755B5311bc75784a061eDB47165Dd',
      '0xc07240Efa67755B5311bc75784a061eDB47165Dd',
      // Try some random but structured addresses
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
    ];
    
    for (const address of commonPatterns) {
      try {
        console.log(`  Testing address: ${address}`);
        
        const metadata = await broker.inference.getServiceMetadata(address);
        
        console.log(`  ✅ Found provider: ${address} -> ${metadata.endpoint}`);
        
        // Test connectivity
        let connectivityStatus = 'unknown';
        try {
          const response = await Promise.race([
            fetch(metadata.endpoint, { method: 'HEAD' }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
          ]);
          connectivityStatus = `${(response as Response).status}`;
        } catch {
          connectivityStatus = 'timeout/error';
        }
        
        discoveryResults.push({
          address,
          endpoint: metadata.endpoint,
          model: metadata.model,
          connectivity: connectivityStatus,
          status: 'found'
        });
        
      } catch (error) {
        // This is expected for non-existent providers
        console.log(`  ❌ Not a provider: ${address}`);
      }
    }
    
    // Method 2: Try to get provider list from broker (if such method exists)
    console.log('🔍 Method 2: Trying to get provider list from broker...');
    
    try {
      // Check if broker has any provider listing methods
      const brokerMethods = Object.getOwnPropertyNames(broker).concat(
        Object.getOwnPropertyNames(Object.getPrototypeOf(broker))
      );
      
      console.log(`📋 Broker methods: ${brokerMethods.slice(0, 10).join(', ')}...`);
      
      // Try common provider listing method names
      const possibleMethods = ['listProviders', 'getProviders', 'getAllProviders', 'providers'];
      
      for (const methodName of possibleMethods) {
        if (typeof (broker as any)[methodName] === 'function') {
          try {
            console.log(`  Trying ${methodName}()...`);
            const result = await (broker as any)[methodName]();
            console.log(`  ✅ ${methodName} result:`, result);
            
            discoveryResults.push({
              method: methodName,
              result: result,
              status: 'broker_method_success'
            });
            
          } catch (methodError) {
            console.log(`  ❌ ${methodName} failed:`, methodError instanceof Error ? methodError.message : 'Unknown error');
          }
        }
      }
      
    } catch (brokerError) {
      console.log('❌ Broker method discovery failed:', brokerError);
    }
    
    // Method 3: Check inference object methods
    console.log('🔍 Method 3: Checking inference object methods...');
    
    try {
      const inferenceMethods = Object.getOwnPropertyNames(broker.inference).concat(
        Object.getOwnPropertyNames(Object.getPrototypeOf(broker.inference))
      );
      
      console.log(`📋 Inference methods: ${inferenceMethods.join(', ')}`);
      
      discoveryResults.push({
        inferenceMethods: inferenceMethods,
        status: 'method_discovery'
      });
      
    } catch (inferenceError) {
      console.log('❌ Inference method discovery failed:', inferenceError);
    }
    
    return NextResponse.json({
      success: true,
      message: `Provider discovery completed. Found ${discoveryResults.filter(r => r.status === 'found').length} potential providers.`,
      details: {
        totalTested: commonPatterns.length,
        foundProviders: discoveryResults.filter(r => r.status === 'found').length,
        workingProviders: discoveryResults.filter(r => r.status === 'found' && r.connectivity !== 'timeout/error').length,
        discoveryResults
      }
    });
    
  } catch (error) {
    console.error('❌ Provider discovery failed:', error);
    return NextResponse.json({
      success: false,
      message: `Provider discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
