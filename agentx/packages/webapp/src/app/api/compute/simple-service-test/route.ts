// Simple service test without complex serialization
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Simple 0G Compute service test...');
    
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
    
    console.log('✅ Broker initialized');
    
    const results = [];
    
    // Test listService without complex serialization
    try {
      console.log('📋 Calling listService...');
      const services = await broker.inference.listService();
      
      console.log(`✅ listService completed, type: ${typeof services}`);
      console.log(`✅ isArray: ${Array.isArray(services)}`);
      
      if (Array.isArray(services)) {
        console.log(`✅ Found ${services.length} services`);
        
        results.push({
          method: 'listService',
          status: 'success',
          serviceCount: services.length,
          firstFewServices: services.slice(0, 3).map(s => String(s)) // Convert to string
        });
        
      } else if (services) {
        console.log('✅ Services result is not array, type:', typeof services);
        
        results.push({
          method: 'listService',
          status: 'success',
          resultType: typeof services,
          hasResult: true
        });
        
      } else {
        console.log('❌ No services result');
        
        results.push({
          method: 'listService',
          status: 'success',
          hasResult: false
        });
      }
      
    } catch (listError) {
      console.log('❌ listService failed:', listError instanceof Error ? listError.message : 'Unknown error');
      
      results.push({
        method: 'listService',
        status: 'failed',
        error: listError instanceof Error ? listError.message : 'Unknown error'
      });
    }
    
    // Test getAccount
    try {
      console.log('👤 Calling getAccount...');
      const account = await broker.inference.getAccount();
      
      console.log(`✅ getAccount completed, type: ${typeof account}`);
      
      results.push({
        method: 'getAccount',
        status: 'success',
        hasAccount: !!account,
        accountType: typeof account
      });
      
    } catch (accountError) {
      console.log('❌ getAccount failed:', accountError instanceof Error ? accountError.message : 'Unknown error');
      
      results.push({
        method: 'getAccount',
        status: 'failed',
        error: accountError instanceof Error ? accountError.message : 'Unknown error'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Simple service test completed',
      results
    });
    
  } catch (error) {
    console.error('❌ Simple service test failed:', error);
    return NextResponse.json({
      success: false,
      message: `Simple service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
