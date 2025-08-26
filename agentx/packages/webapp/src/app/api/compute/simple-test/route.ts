// Simple 0G Compute broker test
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Simple 0G Compute test starting...');
    
    // Import SDK
    const { createZGComputeNetworkBroker } = await import('@0glabs/0g-serving-broker');
    const { ethers } = await import('ethers');
    console.log('✅ SDK imported successfully');
    
    // Configuration
    const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const OG_PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY || '';
    
    if (!OG_PRIVATE_KEY) {
      throw new Error('No private key configured');
    }
    
    console.log(`🌐 RPC URL: ${OG_RPC_URL}`);
    console.log(`🔑 Private Key length: ${OG_PRIVATE_KEY.length}`);
    
    // Initialize wallet
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const wallet = new ethers.Wallet(OG_PRIVATE_KEY, provider);
    console.log(`👤 Wallet address: ${wallet.address}`);
    
    // Test RPC connection
    try {
      const blockNumber = await provider.getBlockNumber();
      console.log(`📦 Current block number: ${blockNumber}`);
    } catch (rpcError) {
      console.error('❌ RPC connection failed:', rpcError);
      throw new Error(`RPC connection failed: ${rpcError instanceof Error ? rpcError.message : 'Unknown RPC error'}`);
    }
    
    // Try to create broker
    console.log('🤝 Creating ZG Compute Network Broker...');
    try {
      const broker = await createZGComputeNetworkBroker(wallet);
      console.log('✅ Broker created successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Successfully created 0G Compute broker',
        details: {
          rpcUrl: OG_RPC_URL,
          walletAddress: wallet.address,
          blockNumber: await provider.getBlockNumber()
        }
      });
    } catch (brokerError) {
      console.error('❌ Broker creation failed:', brokerError);
      throw new Error(`Broker creation failed: ${brokerError instanceof Error ? brokerError.message : 'Unknown broker error'}`);
    }
    
  } catch (error) {
    console.error('❌ Simple test failed:', error);
    return NextResponse.json({
      success: false,
      message: `Simple test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
