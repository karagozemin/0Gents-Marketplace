// Test real 0G DA data submission with all possible functions
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔥 Testing REAL 0G DA data submission...');
    
    const { ethers } = await import('ethers');
    
    // Configuration
    const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const OG_PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY || '';
    const DA_CONTRACT_ADDRESS = '0xE75A073dA5bb7b0eC622170Fd268f35E675a957B';
    
    // Enhanced ABI with all possible functions
    const ENHANCED_ABI = [
      "function currentEpoch() external view returns (uint256)",
      "function submitData(bytes calldata data) external returns (bytes32)",
      "function submitDataWithMetadata(bytes calldata data, bytes calldata metadata) external returns (bytes32)",
      "function storeData(bytes calldata data) external payable returns (bytes32)",
      "function upload(bytes calldata data) external returns (bytes32)",
      "function addData(bytes calldata data) external returns (bytes32)",
      "function getData(bytes32 dataHash) external view returns (bytes memory)",
      "function isDataAvailable(bytes32 dataHash) external view returns (bool)",
      "function owner() external view returns (address)",
      "function paused() external view returns (bool)",
    ];
    
    // Initialize
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const wallet = new ethers.Wallet(OG_PRIVATE_KEY, provider);
    const daContract = new ethers.Contract(DA_CONTRACT_ADDRESS, ENHANCED_ABI, wallet);
    
    console.log(`👤 Using wallet: ${wallet.address}`);
    console.log(`📄 Contract: ${DA_CONTRACT_ADDRESS}`);
    
    // Test data to submit
    const testData = JSON.stringify({
      message: 'Real 0G DA submission test',
      timestamp: new Date().toISOString(),
      submitter: wallet.address,
      testId: `real-test-${Date.now()}`
    });
    
    const dataBytes = ethers.toUtf8Bytes(testData);
    console.log(`📝 Data size: ${dataBytes.length} bytes`);
    
    const results = [];
    
    // Test 1: Check current epoch (we know this works)
    try {
      console.log('1️⃣ Testing currentEpoch()...');
      const epoch = await daContract.currentEpoch();
      results.push({
        function: 'currentEpoch',
        status: 'success',
        result: epoch.toString()
      });
      console.log(`✅ Current epoch: ${epoch.toString()}`);
    } catch (epochError) {
      results.push({
        function: 'currentEpoch',
        status: 'failed',
        error: epochError instanceof Error ? epochError.message : 'Unknown error'
      });
    }
    
    // Test 2: Try all data submission functions
    const submissionFunctions = [
      'submitData',
      'storeData', 
      'upload',
      'addData'
    ];
    
    for (const funcName of submissionFunctions) {
      try {
        console.log(`2️⃣ Testing ${funcName}()...`);
        
        // Estimate gas first
        let gasEstimate;
        try {
          if (funcName === 'storeData') {
            // This might be payable
            gasEstimate = await daContract[funcName].estimateGas(dataBytes, { value: ethers.parseEther('0.001') });
          } else {
            gasEstimate = await daContract[funcName].estimateGas(dataBytes);
          }
          console.log(`⛽ Gas estimate for ${funcName}: ${gasEstimate.toString()}`);
        } catch (gasError) {
          console.log(`⛽ Gas estimation failed for ${funcName}: ${gasError instanceof Error ? gasError.message : 'Unknown'}`);
          results.push({
            function: funcName,
            status: 'gas_estimation_failed',
            error: gasError instanceof Error ? gasError.message : 'Unknown error'
          });
          continue;
        }
        
        // Try the actual call
        let tx;
        if (funcName === 'storeData') {
          tx = await daContract[funcName](dataBytes, { 
            value: ethers.parseEther('0.001'),
            gasLimit: gasEstimate * BigInt(2) 
          });
        } else {
          tx = await daContract[funcName](dataBytes, {
            gasLimit: gasEstimate * BigInt(2)
          });
        }
        
        console.log(`📡 Transaction submitted: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block: ${receipt?.blockNumber}`);
        
        // Try to extract return value from logs
        let dataHash: string | undefined;
        if (receipt?.logs) {
          for (const log of receipt.logs) {
            try {
              const parsed = daContract.interface.parseLog(log);
              if (parsed && (parsed.name === 'DataSubmitted' || parsed.name === 'DataStored')) {
                dataHash = parsed.args[0];
                break;
              }
            } catch (e) {
              // Not our event, continue
            }
          }
        }
        
        results.push({
          function: funcName,
          status: 'success',
          txHash: tx.hash,
          blockNumber: receipt?.blockNumber,
          gasUsed: receipt?.gasUsed?.toString(),
          dataHash: dataHash,
          logs: receipt?.logs?.length || 0
        });
        
        console.log(`🎉 ${funcName} SUCCESS! Hash: ${dataHash || 'N/A'}`);
        
        // If we got a data hash, try to retrieve the data
        if (dataHash) {
          try {
            console.log(`3️⃣ Testing data retrieval for hash: ${dataHash}`);
            
            const retrievedData = await daContract.getData(dataHash);
            const retrievedString = ethers.toUtf8String(retrievedData);
            
            results.push({
              function: 'getData',
              status: 'success',
              dataHash: dataHash,
              retrievedData: retrievedString.slice(0, 100) + (retrievedString.length > 100 ? '...' : ''),
              dataMatches: retrievedString === testData
            });
            
            console.log(`✅ Data retrieval success! Matches: ${retrievedString === testData}`);
            
          } catch (retrieveError) {
            results.push({
              function: 'getData',
              status: 'failed',
              dataHash: dataHash,
              error: retrieveError instanceof Error ? retrieveError.message : 'Unknown error'
            });
          }
        }
        
        // We found a working function, that's enough for now
        break;
        
      } catch (submitError) {
        console.log(`❌ ${funcName} failed: ${submitError instanceof Error ? submitError.message : 'Unknown'}`);
        
        results.push({
          function: funcName,
          status: 'failed',
          error: submitError instanceof Error ? submitError.message : 'Unknown error'
        });
      }
    }
    
    // Summary
    const successfulSubmissions = results.filter(r => r.function !== 'currentEpoch' && r.function !== 'getData' && r.status === 'success');
    const workingFunction = successfulSubmissions[0];
    
    return NextResponse.json({
      success: successfulSubmissions.length > 0,
      message: workingFunction 
        ? `Real 0G DA submission SUCCESS! Working function: ${workingFunction.function}`
        : 'All submission functions failed, but connection works',
      details: {
        contractAddress: DA_CONTRACT_ADDRESS,
        walletAddress: wallet.address,
        dataSize: dataBytes.length,
        workingFunction: workingFunction?.function,
        successfulSubmissions: successfulSubmissions.length,
        totalTests: results.length,
        allResults: results
      }
    });
    
  } catch (error) {
    console.error('❌ Real 0G DA submission test failed:', error);
    return NextResponse.json({
      success: false,
      message: `Real 0G DA submission test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
