// Test all 0G Compute providers
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing all 0G Compute providers...');
    
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
    
    // All known providers
    const PROVIDERS = {
      'llama-3.3-70b-instruct': '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
      'deepseek-r1-70b': '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3',
      // Let's try some other potential addresses
      'provider-3': '0x1234567890123456789012345678901234567890',
      'provider-4': '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
    };
    
    const results = [];
    
    for (const [modelName, providerAddress] of Object.entries(PROVIDERS)) {
      console.log(`\n🤖 Testing ${modelName}: ${providerAddress}`);
      
      const providerResult = {
        model: modelName,
        address: providerAddress,
        tests: []
      };
      
      // Test 1: Get service metadata
      try {
        console.log(`  1️⃣ Getting metadata for ${modelName}...`);
        const metadata = await broker.inference.getServiceMetadata(providerAddress);
        
        providerResult.tests.push({
          test: 'metadata',
          status: 'success',
          data: {
            endpoint: metadata.endpoint,
            model: metadata.model
          }
        });
        
        console.log(`  ✅ Metadata: ${metadata.endpoint}`);
        
        // Test 2: Test endpoint connectivity
        try {
          console.log(`  2️⃣ Testing endpoint connectivity...`);
          
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          );
          
          const fetchPromise = fetch(metadata.endpoint, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(3000)
          });
          
          const response = await Promise.race([fetchPromise, timeoutPromise]);
          
          providerResult.tests.push({
            test: 'connectivity',
            status: 'success',
            data: {
              status: (response as Response).status,
              statusText: (response as Response).statusText
            }
          });
          
          console.log(`  ✅ Connectivity: ${(response as Response).status}`);
          
        } catch (connError) {
          providerResult.tests.push({
            test: 'connectivity',
            status: 'failed',
            error: connError instanceof Error ? connError.message : 'Unknown error'
          });
          
          console.log(`  ❌ Connectivity failed: ${connError instanceof Error ? connError.message : 'Unknown'}`);
        }
        
      } catch (metadataError) {
        providerResult.tests.push({
          test: 'metadata',
          status: 'failed',
          error: metadataError instanceof Error ? metadataError.message : 'Unknown error'
        });
        
        console.log(`  ❌ Metadata failed: ${metadataError instanceof Error ? metadataError.message : 'Unknown'}`);
      }
      
      results.push(providerResult);
    }
    
    // Find working providers
    const workingProviders = results.filter(p => 
      p.tests.some(t => t.test === 'metadata' && t.status === 'success') &&
      p.tests.some(t => t.test === 'connectivity' && t.status === 'success')
    );
    
    return NextResponse.json({
      success: true,
      message: `Tested ${results.length} providers, found ${workingProviders.length} working`,
      details: {
        totalTested: results.length,
        workingCount: workingProviders.length,
        workingProviders: workingProviders.map(p => ({
          model: p.model,
          address: p.address,
          endpoint: p.tests.find(t => t.test === 'metadata')?.data?.endpoint
        })),
        allResults: results
      }
    });
    
  } catch (error) {
    console.error('❌ All providers test failed:', error);
    return NextResponse.json({
      success: false,
      message: `All providers test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
