// Simple 0G DA contract test
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Simple 0G DA test starting...');
    
    const { ethers } = await import('ethers');
    
    // Configuration
    const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const OG_PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY || '';
    
    if (!OG_PRIVATE_KEY) {
      throw new Error('No private key configured');
    }
    
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const wallet = new ethers.Wallet(OG_PRIVATE_KEY, provider);
    console.log(`👤 Wallet address: ${wallet.address}`);
    
    // Test both DA contracts
    const contracts = [
      { name: 'Precompiled DASigners', address: '0x0000000000000000000000000000000000001000' },
      { name: 'DA Entrance', address: '0xE75A073dA5bb7b0eC622170Fd268f35E675a957B' }
    ];
    
    const results = [];
    
    for (const contract of contracts) {
      console.log(`🔍 Testing ${contract.name}: ${contract.address}`);
      
      try {
        // Check contract code
        const code = await provider.getCode(contract.address);
        const hasCode = code !== '0x';
        
        // Check balance
        const balance = await provider.getBalance(contract.address);
        
        console.log(`📄 ${contract.name} - Code: ${hasCode}, Length: ${code.length}, Balance: ${ethers.formatEther(balance)} ETH`);
        
        results.push({
          name: contract.name,
          address: contract.address,
          hasCode,
          codeLength: code.length,
          balance: ethers.formatEther(balance),
          status: 'success'
        });
        
      } catch (error) {
        console.error(`❌ ${contract.name} test failed:`, error);
        results.push({
          name: contract.name,
          address: contract.address,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Simple DA tests completed',
      details: {
        rpcUrl: OG_RPC_URL,
        walletAddress: wallet.address,
        blockNumber: await provider.getBlockNumber(),
        contracts: results
      }
    });
    
  } catch (error) {
    console.error('❌ Simple DA test failed:', error);
    return NextResponse.json({
      success: false,
      message: `Simple DA test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
