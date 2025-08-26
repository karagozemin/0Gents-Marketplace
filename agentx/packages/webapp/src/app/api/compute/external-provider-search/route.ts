// Search for external 0G Compute providers
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Searching for external 0G Compute providers...');
    
    // Import SDK
    const { createZGComputeNetworkBroker } = await import('@0glabs/0g-serving-broker');
    const { ethers } = await import('ethers');
    
    // Try different potential provider endpoints
    const externalEndpoints = [
      // Public compute providers (if any exist)
      'https://compute.0g.ai',
      'https://api.0g.ai',
      'https://inference.0g.ai',
      // Alternative ports on known IP
      'http://50.145.48.68:8080',
      'http://50.145.48.68:3000', 
      'http://50.145.48.68:8000',
      // Other potential IPs in same subnet
      'http://50.145.48.69:30081',
      'http://50.145.48.70:30081',
      'http://50.145.48.67:30081',
    ];
    
    const results = [];
    const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const OG_PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY || '';
    
    // Initialize broker
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const wallet = new ethers.Wallet(OG_PRIVATE_KEY, provider);
    const broker = await createZGComputeNetworkBroker(wallet);
    
    // Test external endpoints directly
    for (const endpoint of externalEndpoints) {
      console.log(`🔍 Testing external endpoint: ${endpoint}`);
      
      const endpointResult = {
        endpoint,
        tests: []
      };
      
      // Test 1: Basic connectivity
      try {
        console.log(`  1️⃣ Basic connectivity...`);
        
        const response = await Promise.race([
          fetch(endpoint, { method: 'HEAD' }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
        
        endpointResult.tests.push({
          test: 'connectivity',
          status: 'success',
          httpStatus: (response as Response).status,
          statusText: (response as Response).statusText
        });
        
        console.log(`  ✅ Connectivity: ${(response as Response).status}`);
        
        // Test 2: Try common AI endpoints
        const aiEndpoints = [
          '/v1/chat/completions',
          '/chat/completions', 
          '/api/v1/chat/completions',
          '/inference',
          '/api/inference'
        ];
        
        for (const aiPath of aiEndpoints) {
          try {
            console.log(`  2️⃣ Testing AI endpoint: ${endpoint}${aiPath}`);
            
            const aiResponse = await Promise.race([
              fetch(`${endpoint}${aiPath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messages: [{ role: 'user', content: 'Hello' }],
                  model: 'test',
                  max_tokens: 10
                })
              }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            const responseText = await (aiResponse as Response).text();
            
            endpointResult.tests.push({
              test: 'ai_endpoint',
              path: aiPath,
              status: 'success',
              httpStatus: (aiResponse as Response).status,
              responseLength: responseText.length,
              responsePreview: responseText.slice(0, 200)
            });
            
            console.log(`  ✅ AI Endpoint ${aiPath}: ${(aiResponse as Response).status}`);
            
            if ((aiResponse as Response).ok) {
              console.log(`  🎉 POTENTIAL WORKING ENDPOINT: ${endpoint}${aiPath}`);
              break; // Found working endpoint
            }
            
          } catch (aiError) {
            console.log(`  ❌ AI Endpoint ${aiPath} failed: ${aiError instanceof Error ? aiError.message : 'Unknown'}`);
          }
        }
        
      } catch (connectError) {
        endpointResult.tests.push({
          test: 'connectivity',
          status: 'failed',
          error: connectError instanceof Error ? connectError.message : 'Unknown error'
        });
        
        console.log(`  ❌ Connectivity failed: ${connectError instanceof Error ? connectError.message : 'Unknown'}`);
      }
      
      results.push(endpointResult);
    }
    
    // Also try to scan for providers in blockchain
    console.log('🔍 Scanning blockchain for provider events...');
    
    try {
      // Try to get recent blocks and look for provider-related events
      const latestBlock = await provider.getBlockNumber();
      const scanResults = [];
      
      // Scan last 100 blocks for any provider-related activity
      const startBlock = Math.max(0, latestBlock - 100);
      
      for (let blockNum = startBlock; blockNum <= latestBlock; blockNum += 10) {
        try {
          const block = await provider.getBlock(blockNum, true);
          
          if (block && block.transactions) {
            const providerTxs = block.transactions.filter(tx => {
              if (typeof tx === 'object' && tx.data) {
                // Look for provider-related function calls
                return tx.data.includes('provider') || 
                       tx.data.includes('service') ||
                       tx.data.includes('inference');
              }
              return false;
            });
            
            if (providerTxs.length > 0) {
              scanResults.push({
                block: blockNum,
                providerTxCount: providerTxs.length,
                transactions: providerTxs.slice(0, 2).map(tx => ({
                  hash: typeof tx === 'object' ? tx.hash : tx,
                  to: typeof tx === 'object' ? tx.to : 'unknown'
                }))
              });
            }
          }
        } catch (blockError) {
          // Skip failed blocks
        }
      }
      
      results.push({
        endpoint: 'blockchain_scan',
        tests: [{
          test: 'provider_events',
          status: 'success',
          scannedBlocks: latestBlock - startBlock,
          providerActivity: scanResults
        }]
      });
      
    } catch (scanError) {
      console.log('❌ Blockchain scan failed:', scanError);
    }
    
    // Find any working endpoints
    const workingEndpoints = results.filter(r => 
      r.tests.some(t => t.test === 'ai_endpoint' && t.status === 'success' && t.httpStatus === 200)
    );
    
    return NextResponse.json({
      success: workingEndpoints.length > 0,
      message: `External provider search completed. Found ${workingEndpoints.length} potential working endpoints.`,
      details: {
        totalTested: externalEndpoints.length,
        workingEndpoints: workingEndpoints.length,
        workingList: workingEndpoints.map(r => ({
          endpoint: r.endpoint,
          workingPaths: r.tests.filter(t => t.test === 'ai_endpoint' && t.status === 'success').map(t => t.path)
        })),
        allResults: results
      }
    });
    
  } catch (error) {
    console.error('❌ External provider search failed:', error);
    return NextResponse.json({
      success: false,
      message: `External provider search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
