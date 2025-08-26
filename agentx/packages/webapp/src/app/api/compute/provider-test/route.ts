// 0G Compute provider test
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 0G Compute provider test starting...');
    
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
    console.log('✅ Broker created');
    
    // Provider addresses
    const PROVIDERS = {
      'llama-3.3-70b-instruct': '0xf07240Efa67755B5311bc75784a061eDB47165Dd',
      'deepseek-r1-70b': '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3'
    };
    
    const providerAddress = PROVIDERS['llama-3.3-70b-instruct'];
    console.log(`🤖 Testing provider: ${providerAddress}`);
    
    try {
      // Test 1: Acknowledge provider
      console.log('1️⃣ Acknowledging provider...');
      await broker.inference.acknowledgeProviderSigner(providerAddress);
      console.log('✅ Provider acknowledged');
      
      // Test 2: Get service metadata
      console.log('2️⃣ Getting service metadata...');
      const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);
      console.log(`✅ Service metadata: endpoint=${endpoint}, model=${model}`);
      
      // Test 3: Generate auth headers
      console.log('3️⃣ Generating auth headers...');
      const testMessage = 'Hello, this is a test message';
      const headers = await broker.inference.getRequestHeaders(providerAddress, testMessage);
      console.log(`✅ Auth headers generated: ${Object.keys(headers).join(', ')}`);
      
      return NextResponse.json({
        success: true,
        message: 'Provider tests passed',
        details: {
          providerAddress,
          endpoint,
          model,
          headerKeys: Object.keys(headers)
        }
      });
      
    } catch (providerError) {
      console.error('❌ Provider test failed:', providerError);
      return NextResponse.json({
        success: false,
        message: `Provider test failed: ${providerError instanceof Error ? providerError.message : 'Unknown provider error'}`,
        details: { providerAddress, error: providerError }
      });
    }
    
  } catch (error) {
    console.error('❌ Provider test setup failed:', error);
    return NextResponse.json({
      success: false,
      message: `Provider test setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
