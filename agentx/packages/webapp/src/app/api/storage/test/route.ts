// API route to test 0G Storage connection and configuration
import { NextResponse } from 'next/server';
import { testStorageConnectionServer } from '@/lib/serverStorage';

export async function GET() {
  try {
    console.log('🔍 Testing 0G Storage connection...');
    
    // Test basic configuration - Official 0G Galileo Testnet (Force official RPC)
    const config = {
      networkName: '0G-Galileo-Testnet',
      chainId: 16602,
      tokenSymbol: 'OG',
      rpcUrl: 'https://evmrpc-testnet.0g.ai', // Force official RPC
      explorer: 'https://chainscan-galileo.0g.ai',
      faucet: 'https://faucet.0g.ai',
      indexerUrl: process.env.NEXT_PUBLIC_0G_INDEXER_URL || 'https://indexer-storage-testnet-turbo.0g.ai',
      hasPrivateKey: !!(process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY),
      envRpcUrl: process.env.NEXT_PUBLIC_0G_RPC_URL // Show what env says
    };
    
    console.log('📋 Configuration check:', config);
    
    // Test server-side storage connection
    const serverTest = await testStorageConnectionServer();
    
    return NextResponse.json({
      success: true,
      message: 'Storage test completed',
      config,
      serverTest,
      recommendations: [
        'Ensure you have sufficient balance in your wallet',
        'Try using the fallback simulation if real storage fails',
        'Check if testnet is experiencing temporary issues',
        'Consider reducing file size if upload fails'
      ]
    });
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        message: 'Storage connection test failed'
      },
      { status: 500 }
    );
  }
}