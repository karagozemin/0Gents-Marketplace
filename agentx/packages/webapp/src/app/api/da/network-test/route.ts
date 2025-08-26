// 0G DA network endpoint test
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 0G DA network test starting...');
    
    const { ethers } = await import('ethers');
    
    // Different 0G network endpoints to test
    const ENDPOINTS = [
      'https://evmrpc-testnet.0g.ai',
      'https://quick-alien-shard.0g-galileo.quiknode.pro/34a3bedc56c56595f5f1053c6b159043c837ca6a/',
      'https://rpc-testnet.0g.ai'
    ];
    
    const DA_ADDRESSES = [
      '0x0000000000000000000000000000000000001000', // DASigners precompiled
      '0xE75A073dA5bb7b0eC622170Fd268f35E675a957B', // Original DA entrance
    ];
    
    const results = [];
    
    for (const endpoint of ENDPOINTS) {
      console.log(`🌐 Testing endpoint: ${endpoint}`);
      
      try {
        const provider = new ethers.JsonRpcProvider(endpoint);
        const blockNumber = await provider.getBlockNumber();
        console.log(`📦 Block number: ${blockNumber}`);
        
        for (const daAddress of DA_ADDRESSES) {
          console.log(`🔍 Testing DA contract: ${daAddress}`);
          
          try {
            // Test if contract exists
            const code = await provider.getCode(daAddress);
            const hasCode = code !== '0x';
            
            console.log(`📄 Contract code exists: ${hasCode}, length: ${code.length}`);
            
            results.push({
              endpoint,
              daAddress,
              blockNumber,
              hasCode,
              codeLength: code.length,
              status: 'success'
            });
            
          } catch (contractError) {
            console.error(`❌ Contract test failed:`, contractError);
            results.push({
              endpoint,
              daAddress,
              error: contractError instanceof Error ? contractError.message : 'Unknown contract error',
              status: 'contract_error'
            });
          }
        }
        
      } catch (endpointError) {
        console.error(`❌ Endpoint test failed:`, endpointError);
        results.push({
          endpoint,
          error: endpointError instanceof Error ? endpointError.message : 'Unknown endpoint error',
          status: 'endpoint_error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Network tests completed',
      results
    });
    
  } catch (error) {
    console.error('❌ Network test failed:', error);
    return NextResponse.json({
      success: false,
      message: `Network test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
