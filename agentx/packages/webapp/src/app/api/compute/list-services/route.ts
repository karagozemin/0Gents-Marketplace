// List all available 0G Compute services
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Listing all 0G Compute services...');
    
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
    
    console.log('✅ Broker initialized for service listing');
    
    const results = [];
    
    // Try listService method
    try {
      console.log('📋 Calling broker.inference.listService()...');
      const services = await broker.inference.listService();
      
      console.log(`✅ Found ${services ? services.length : 'unknown'} services`);
      console.log('📋 Services:', services);
      
      // Convert BigInt values to strings for JSON serialization
      const serializedServices = JSON.parse(JSON.stringify(services, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
      
      results.push({
        method: 'listService',
        status: 'success',
        data: serializedServices,
        count: Array.isArray(services) ? services.length : 'unknown'
      });
      
      // If services is an array, try to get metadata for each
      if (Array.isArray(services)) {
        for (const service of services.slice(0, 5)) { // Limit to first 5
          try {
            console.log(`🔍 Getting metadata for service: ${service}`);
            
            const metadata = await broker.inference.getServiceMetadata(service);
            console.log(`  ✅ Service ${service}: ${metadata.endpoint}`);
            
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
            
            results.push({
              method: 'serviceMetadata',
              serviceAddress: service,
              endpoint: metadata.endpoint,
              model: metadata.model,
              connectivity: connectivityStatus,
              status: 'metadata_success'
            });
            
          } catch (metadataError) {
            console.log(`  ❌ Metadata failed for ${service}:`, metadataError instanceof Error ? metadataError.message : 'Unknown error');
            
            results.push({
              method: 'serviceMetadata',
              serviceAddress: service,
              error: metadataError instanceof Error ? metadataError.message : 'Unknown error',
              status: 'metadata_failed'
            });
          }
        }
      }
      
    } catch (listError) {
      console.log('❌ listService failed:', listError instanceof Error ? listError.message : 'Unknown error');
      
      results.push({
        method: 'listService',
        status: 'failed',
        error: listError instanceof Error ? listError.message : 'Unknown error'
      });
    }
    
    // Try other discovery methods
    const otherMethods = [
      'getAccount',
      'getAccountWithDetail',
      'userAcknowledged'
    ];
    
    for (const methodName of otherMethods) {
      try {
        console.log(`🔍 Trying ${methodName}()...`);
        
        const result = await (broker.inference as any)[methodName]();
        console.log(`✅ ${methodName} result:`, result);
        
        // Convert BigInt values to strings for JSON serialization
        const serializedResult = JSON.parse(JSON.stringify(result, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ));
        
        results.push({
          method: methodName,
          status: 'success',
          data: serializedResult
        });
        
      } catch (methodError) {
        console.log(`❌ ${methodName} failed:`, methodError instanceof Error ? methodError.message : 'Unknown error');
        
        results.push({
          method: methodName,
          status: 'failed',
          error: methodError instanceof Error ? methodError.message : 'Unknown error'
        });
      }
    }
    
    // Count working services
    const workingServices = results.filter(r => 
      r.status === 'metadata_success' && r.connectivity !== 'timeout/error'
    );
    
    return NextResponse.json({
      success: true,
      message: `Service listing completed. Found ${workingServices.length} working services.`,
      details: {
        totalResults: results.length,
        workingServices: workingServices.length,
        workingServicesList: workingServices.map(s => ({
          address: s.serviceAddress,
          endpoint: s.endpoint,
          model: s.model,
          connectivity: s.connectivity
        })),
        allResults: results
      }
    });
    
  } catch (error) {
    console.error('❌ Service listing failed:', error);
    return NextResponse.json({
      success: false,
      message: `Service listing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
