// Test 0G Compute with alternative network endpoints
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing 0G Compute with alternative networks...');
    
    // Import SDK
    const { createZGComputeNetworkBroker } = await import('@0glabs/0g-serving-broker');
    const { ethers } = await import('ethers');
    
    // Alternative 0G network endpoints
    const networks = [
      {
        name: '0G EVM Testnet',
        rpcUrl: 'https://evmrpc-testnet.0g.ai',
        chainId: 16602
      },
      {
        name: '0G QuickNode',
        rpcUrl: 'https://evmrpc-testnet.0g.ai/',
        chainId: 16602
      },
      // Try some other potential endpoints
      {
        name: '0G Mainnet (if exists)',
        rpcUrl: 'https://evmrpc.0g.ai',
        chainId: 16602
      },
      {
        name: '0G Alternative',
        rpcUrl: 'https://rpc.0g.ai',
        chainId: 16602
      }
    ];
    
    const OG_PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY || '';
    
    if (!OG_PRIVATE_KEY) {
      throw new Error('No private key configured');
    }
    
    const results: any[] = [];
    
    for (const network of networks) {
      console.log(`\n🌐 Testing network: ${network.name} (${network.rpcUrl})`);
      
      const networkResult = {
        name: network.name,
        rpcUrl: network.rpcUrl,
        chainId: network.chainId,
        tests: [] as any[]
      };
      
      try {
        // Test RPC connectivity first
        console.log(`  1️⃣ Testing RPC connectivity...`);
        
        const provider = new ethers.JsonRpcProvider(network.rpcUrl);
        
        const blockNumber = await Promise.race([
          provider.getBlockNumber(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('RPC Timeout')), 5000))
        ]);
        
        networkResult.tests.push({
          test: 'rpc_connectivity',
          status: 'success',
          blockNumber: blockNumber
        });
        
        console.log(`  ✅ RPC connected, block: ${blockNumber}`);
        
        // Test broker creation
        try {
          console.log(`  2️⃣ Creating broker...`);
          
          const wallet = new ethers.Wallet(OG_PRIVATE_KEY, provider);
          const broker = await createZGComputeNetworkBroker(wallet);
          
          networkResult.tests.push({
            test: 'broker_creation',
            status: 'success',
            walletAddress: wallet.address
          });
          
          console.log(`  ✅ Broker created for ${wallet.address}`);
          
          // Test service listing
          try {
            console.log(`  3️⃣ Listing services...`);
            
            const services = await broker.inference.listService();
            
            const serviceCount = Array.isArray(services) ? services.length : 0;
            const serviceAddresses = Array.isArray(services) ? 
              services.slice(0, 3).map(s => String(s).split(',')[0]) : [];
            
            networkResult.tests.push({
              test: 'service_listing',
              status: 'success',
              serviceCount: serviceCount,
              serviceAddresses: serviceAddresses
            });
            
            console.log(`  ✅ Found ${serviceCount} services: ${serviceAddresses.join(', ')}`);
            
            // Test first service metadata
            if (serviceAddresses.length > 0) {
              try {
                console.log(`  4️⃣ Testing first service metadata...`);
                
                const firstService = serviceAddresses[0];
                const metadata = await broker.inference.getServiceMetadata(firstService);
                
                networkResult.tests.push({
                  test: 'service_metadata',
                  status: 'success',
                  serviceAddress: firstService,
                  endpoint: metadata.endpoint,
                  model: metadata.model
                });
                
                console.log(`  ✅ Service metadata: ${metadata.endpoint}`);
                
                // Quick connectivity test to this provider
                try {
                  console.log(`  5️⃣ Testing provider connectivity...`);
                  
                  const providerResponse = await Promise.race([
                    fetch(metadata.endpoint, { method: 'HEAD' }),
                    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Provider Timeout')), 3000))
                  ]);
                  
                  networkResult.tests.push({
                    test: 'provider_connectivity',
                    status: 'success',
                    endpoint: metadata.endpoint,
                    httpStatus: (providerResponse as Response).status
                  });
                  
                  console.log(`  ✅ Provider connectivity: ${(providerResponse as Response).status}`);
                  
                } catch (providerError) {
                  networkResult.tests.push({
                    test: 'provider_connectivity',
                    status: 'failed',
                    endpoint: metadata.endpoint,
                    error: providerError instanceof Error ? providerError.message : 'Unknown error'
                  });
                  
                  console.log(`  ❌ Provider connectivity failed: ${providerError instanceof Error ? providerError.message : 'Unknown'}`);
                }
                
              } catch (metadataError) {
                networkResult.tests.push({
                  test: 'service_metadata',
                  status: 'failed',
                  error: metadataError instanceof Error ? metadataError.message : 'Unknown error'
                });
                
                console.log(`  ❌ Service metadata failed: ${metadataError instanceof Error ? metadataError.message : 'Unknown'}`);
              }
            }
            
          } catch (serviceError) {
            networkResult.tests.push({
              test: 'service_listing',
              status: 'failed',
              error: serviceError instanceof Error ? serviceError.message : 'Unknown error'
            });
            
            console.log(`  ❌ Service listing failed: ${serviceError instanceof Error ? serviceError.message : 'Unknown'}`);
          }
          
        } catch (brokerError) {
          networkResult.tests.push({
            test: 'broker_creation',
            status: 'failed',
            error: brokerError instanceof Error ? brokerError.message : 'Unknown error'
          });
          
          console.log(`  ❌ Broker creation failed: ${brokerError instanceof Error ? brokerError.message : 'Unknown'}`);
        }
        
      } catch (rpcError) {
        networkResult.tests.push({
          test: 'rpc_connectivity',
          status: 'failed',
          error: rpcError instanceof Error ? rpcError.message : 'Unknown error'
        });
        
        console.log(`  ❌ RPC connectivity failed: ${rpcError instanceof Error ? rpcError.message : 'Unknown'}`);
      }
      
      results.push(networkResult);
    }
    
    // Find working networks with accessible providers
    const workingNetworks = results.filter(r => 
      r.tests.some((t: any) => t.test === 'provider_connectivity' && t.status === 'success')
    );
    
    return NextResponse.json({
      success: true,
      message: `Alternative network testing completed. Found ${workingNetworks.length} networks with accessible providers.`,
      details: {
        totalNetworks: results.length,
        workingNetworks: workingNetworks.length,
        workingList: workingNetworks.map(r => ({
          name: r.name,
          rpcUrl: r.rpcUrl,
          serviceCount: r.tests.find((t: any) => t.test === 'service_listing')?.serviceCount || 0,
          workingEndpoint: r.tests.find((t: any) => t.test === 'provider_connectivity' && t.status === 'success')?.endpoint
        })),
        allResults: results
      }
    });
    
  } catch (error) {
    console.error('❌ Alternative network test failed:', error);
    return NextResponse.json({
      success: false,
      message: `Alternative network test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
