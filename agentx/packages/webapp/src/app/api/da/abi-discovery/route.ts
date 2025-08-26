// Discover 0G DA contract ABI by analyzing contract calls
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Discovering 0G DA contract ABI...');
    
    const { ethers } = await import('ethers');
    
    // Configuration
    const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    
    const contracts = [
      { name: 'Precompiled DASigners', address: '0x0000000000000000000000000000000000001000' },
      { name: 'DA Entrance', address: '0xE75A073dA5bb7b0eC622170Fd268f35E675a957B' }
    ];
    
    const results = [];
    
    for (const contract of contracts) {
      console.log(`🔍 Analyzing ${contract.name}: ${contract.address}`);
      
      try {
        // Get contract code
        const code = await provider.getCode(contract.address);
        
        // Common function selectors to try
        const commonFunctions = [
          { name: 'owner()', selector: '0x8da5cb5b' },
          { name: 'paused()', selector: '0x5c975abb' },
          { name: 'totalSupply()', selector: '0x18160ddd' },
          { name: 'balanceOf(address)', selector: '0x70a08231' },
          { name: 'name()', selector: '0x06fdde03' },
          { name: 'symbol()', selector: '0x95d89b41' },
          { name: 'currentEpoch()', selector: '0x76671808' },
          { name: 'getEpoch()', selector: '0x757991a8' },
          { name: 'epoch()', selector: '0x900cf0cf' },
          { name: 'version()', selector: '0x54fd4d50' }
        ];
        
        const workingFunctions = [];
        const failedFunctions = [];
        
        for (const func of commonFunctions) {
          try {
            console.log(`  🔍 Testing ${func.name}...`);
            
            // Try calling the function
            const result = await provider.call({
              to: contract.address,
              data: func.selector
            });
            
            console.log(`    ✅ ${func.name} works! Result: ${result}`);
            workingFunctions.push({
              name: func.name,
              selector: func.selector,
              result: result,
              decoded: result !== '0x' ? result : 'empty'
            });
            
          } catch (error) {
            console.log(`    ❌ ${func.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            failedFunctions.push({
              name: func.name,
              selector: func.selector,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
        
        results.push({
          name: contract.name,
          address: contract.address,
          codeLength: code.length,
          workingFunctions,
          failedFunctions: failedFunctions.slice(0, 3) // Limit failed functions to avoid clutter
        });
        
      } catch (error) {
        console.error(`❌ ${contract.name} analysis failed:`, error);
        results.push({
          name: contract.name,
          address: contract.address,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Also try to find recent transactions to these contracts
    console.log('🔍 Looking for recent transactions...');
    const currentBlock = await provider.getBlockNumber();
    const recentTransactions = [];
    
    try {
      // Check last 10 blocks for transactions to these contracts
      for (let i = 0; i < 10; i++) {
        const blockNumber = currentBlock - i;
        const block = await provider.getBlock(blockNumber, true);
        
        if (block && block.transactions) {
          for (const tx of block.transactions) {
            if (typeof tx === 'object' && tx.to) {
              const isDAContract = contracts.some(c => c.address.toLowerCase() === tx.to?.toLowerCase());
              if (isDAContract) {
                recentTransactions.push({
                  hash: tx.hash,
                  to: tx.to,
                  data: tx.data?.slice(0, 10) + '...', // First 4 bytes + ...
                  blockNumber: blockNumber
                });
              }
            }
          }
        }
      }
    } catch (txError) {
      console.error('❌ Transaction analysis failed:', txError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'ABI discovery completed',
      details: {
        currentBlock,
        contracts: results,
        recentTransactions: recentTransactions.slice(0, 5) // Limit to 5 recent transactions
      }
    });
    
  } catch (error) {
    console.error('❌ ABI discovery failed:', error);
    return NextResponse.json({
      success: false,
      message: `ABI discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
