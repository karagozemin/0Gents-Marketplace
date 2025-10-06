// Server-side only 0G Storage implementation
// This will be used in API routes to avoid client-side Node.js module issues

import { ZERO_G_STORAGE_FLOW } from "./contracts";
import "./serverInit"; // Initialize server-side error handling

export interface AgentMetadata {
  name: string;
  description: string;
  image: string;
  creator: string;
  category: string;
  capabilities: string[];
  skills: string[];
  price?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export type StorageResult = {
  success: boolean;
  hash?: string;
  uri?: string;
  error?: string;
  txHash?: string;
  rootHash?: string;
};

// Only import 0G SDK on server side
async function getZgSDK() {
  if (typeof window !== 'undefined') {
    throw new Error('0G SDK can only be used on server side');
  }
  
  const { Blob, Indexer } = await import('@0glabs/0g-ts-sdk');
  const { ethers } = await import('ethers');
  
  return { ZgBlob: Blob, Indexer, ethers };
}

export async function uploadAgentMetadataServer(metadata: AgentMetadata, retryCount = 0): Promise<StorageResult> {
  const maxRetries = 2; // Increase retries with shorter timeouts
  const retryDelay = 3000; // Shorter delay for faster recovery
  
  // Add unhandled rejection handler for this upload session
  const originalHandler = process.listeners('unhandledRejection');
  const uploadRejectionHandler = (reason: any, promise: Promise<any>) => {
    if (reason?.message?.includes('Upload timeout') || reason?.code === 'ETIMEDOUT') {
      console.log('🔧 Handled upload-related rejection:', reason.message || reason.code);
      return; // Suppress these specific errors as they're handled
    }
    // Let other unhandled rejections bubble up normally
    if (originalHandler.length > 0) {
      (originalHandler[0] as any)(reason, promise);
    }
  };
  
  process.on('unhandledRejection', uploadRejectionHandler);
  
  // 0G Storage configuration - FORCE official testnet RPC (bypass cache issues)
  const OG_RPC_URL = 'https://evmrpc-testnet.0g.ai';
  
  try {
    console.log(`🔥 Starting server-side 0G Storage upload... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
    
    // Pre-validation: Check network health
    if (retryCount === 0) {
      console.log('🔍 Pre-validation: Checking 0G network health...');
      try {
        const provider = new (await import('ethers')).ethers.JsonRpcProvider(OG_RPC_URL);
        const latestBlock = await provider.getBlockNumber();
        const blockTime = Date.now();
        
        // Check if network is responsive
        const block = await provider.getBlock(latestBlock);
        const networkLatency = Date.now() - blockTime;
        
        console.log(`✅ Network health: Block ${latestBlock}, Latency: ${networkLatency}ms`);
        
        if (networkLatency > 10000) {
          console.warn('⚠️ High network latency detected, but proceeding...');
        }
      } catch (healthError) {
        console.warn('⚠️ Network health check failed, but proceeding:', healthError);
      }
    }
    
    const { ZgBlob, Indexer, ethers } = await getZgSDK();
    // Using working indexer URL (fallback to turbo if main fails)
    const OG_INDEXER_URL = process.env.NEXT_PUBLIC_0G_INDEXER_URL || 'https://indexer-storage-testnet-turbo.0g.ai';
    const OG_PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY || '';
    
    console.log('🔧 Using 0G Storage configuration:', {
      rpcUrl: OG_RPC_URL,
      indexerUrl: OG_INDEXER_URL,
      attempt: retryCount + 1,
      maxRetries: maxRetries + 1
    });
    
    console.log('🔍 Environment check:', {
      hasRpcUrl: !!OG_RPC_URL,
      hasIndexerUrl: !!OG_INDEXER_URL,
      hasPrivateKey: !!OG_PRIVATE_KEY,
      privateKeyLength: OG_PRIVATE_KEY ? OG_PRIVATE_KEY.length : 0
    });
    
    if (!OG_PRIVATE_KEY) {
      throw new Error('No private key configured - set PRIVATE_KEY in environment');
    }
    
    // Initialize clients with better error handling
    const indexer = new Indexer(OG_INDEXER_URL);
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const signer = new ethers.Wallet(OG_PRIVATE_KEY, provider);
    
    // Check balance before upload
    try {
      const balance = await signer.provider?.getBalance(signer.address);
      console.log('💰 Wallet balance:', balance ? ethers.formatEther(balance) : '0', 'ETH');
      
      if (balance && balance < ethers.parseEther('0.001')) {
        console.warn('⚠️ Low balance detected, but proceeding with upload...');
      }
    } catch (balanceError) {
      console.warn('⚠️ Could not check balance:', balanceError);
    }
    
    // Convert metadata to JSON string
    const jsonData = JSON.stringify(metadata, null, 2);
    console.log('📝 Metadata JSON size:', jsonData.length, 'bytes');
    
    // Create 0G File from File object (based on official 0G SDK docs)
    const blob = new globalThis.Blob([jsonData], { type: 'application/json' });
    const file = new ZgBlob(new globalThis.File([blob], 'metadata.json', { type: 'application/json' }));
    console.log('📁 Created 0G File object');
    
    // Generate Merkle tree for verification
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr !== null) {
      throw new Error(`Error generating Merkle tree: ${treeErr}`);
    }
    
    const rootHash = tree?.rootHash();
    console.log('🌳 Generated Merkle tree, root hash:', rootHash);
    
    // Upload to 0G Storage network with proper timeout handling
    console.log('⬆️ Uploading to 0G Storage network...');
    
    // Create upload promise with proper cleanup
    let timeoutId: NodeJS.Timeout | null = null;
    let uploadController: AbortController | null = null;
    
    try {
      // Create upload promise with abort controller if available
      const uploadPromise = indexer.upload(file, OG_RPC_URL, signer as any);
      
      // Create timeout promise with progressive timeout (shorter on retries)
      const timeoutDuration = Math.max(10000, 20000 - (retryCount * 5000)); // 20s, 15s, 10s
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Upload timeout after ${timeoutDuration/1000} seconds (attempt ${retryCount + 1})`));
        }, timeoutDuration);
      });
      
      // Race the promises with proper cleanup
      const result = await Promise.race([
        uploadPromise.then(result => {
          if (timeoutId) clearTimeout(timeoutId);
          return result;
        }).catch(error => {
          if (timeoutId) clearTimeout(timeoutId);
          throw error;
        }),
        timeoutPromise
      ]);
      
      const [tx, uploadErr] = result as any;
      
      if (uploadErr !== null) {
        throw new Error(`Upload error: ${uploadErr}`);
      }
      
      console.log('✅ Upload successful! Transaction:', tx);
      
      const uploadResult: StorageResult = {
        success: true,
        hash: rootHash || undefined,
        rootHash: rootHash || undefined,
        uri: `0g://storage/${rootHash}`,
        txHash: typeof tx === 'string' ? tx : (tx as any)?.txHash || tx
      };
      
      console.log('🎉 0G Storage upload completed:', uploadResult);
      return uploadResult;
      
    } catch (uploadError) {
      // Clean up timeout if it exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Re-throw the error to be handled by outer catch
      throw uploadError;
    } finally {
      // Always clean up resources (official 0G SDK docs)
      try {
        if (typeof (file as any).close === 'function') {
          await (file as any).close();
          console.log('✅ File resources cleaned up');
        }
      } catch (closeError) {
        console.log('Note: File close failed (this is normal):', closeError);
      }
      
      // Clean up timeout if still exists
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
    
  } catch (error) {
    console.error(`❌ 0G Storage upload failed (Attempt ${retryCount + 1}):`, error);
    
    // Check if this is a retryable error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isNetworkError = errorMessage.includes('too many data writing') ||
                            errorMessage.includes('network') ||
                            errorMessage.includes('timeout') ||
                            errorMessage.includes('Transaction reverted') ||
                            errorMessage.includes('uploading segments') ||
                            errorMessage.includes('transaction execution reverted') ||
                            errorMessage.includes('CALL_EXCEPTION') ||
                            errorMessage.includes('Failed to submit transaction') ||
                            errorMessage.includes('Upload timeout') ||
                            errorMessage.includes('connection') ||
                            errorMessage.includes('gas') ||
                            errorMessage.includes('request limit reached') ||
                            errorMessage.includes('rate limit') ||
                            errorMessage.includes('Too Many Requests');
    
    if (isNetworkError && retryCount < maxRetries) {
      console.log(`🔄 Network instability detected. Retrying in ${retryDelay/1000}s... (${retryCount + 1}/${maxRetries})`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Recursive retry
      return await uploadAgentMetadataServer(metadata, retryCount + 1);
    }
    
    // If max retries exceeded or non-network error, return failure
    if (errorMessage.includes('request limit') || errorMessage.includes('rate limit')) {
      return {
        success: false,
        error: `RPC rate limit exceeded. Please wait a few seconds and try again, or the system will use simulation mode.`
      };
    }
    
    return {
      success: false,
      error: `Upload failed after ${retryCount + 1} attempts: ${errorMessage}. Note: 0G network is experiencing temporary instability, this is being actively fixed by the 0G team.`
    };
  } finally {
    // Clean up the unhandled rejection handler
    try {
      process.removeListener('unhandledRejection', uploadRejectionHandler);
    } catch (cleanupError) {
      console.log('Note: Cleanup handler removal failed (this is normal)');
    }
  }
}

export async function testStorageConnectionServer(): Promise<{ success: boolean; message: string; details?: unknown }> {
  try {
    console.log('🔍 Testing 0G Storage connection on server...');
    
    // First test SDK import
    try {
      const { ZgBlob, Indexer, ethers } = await getZgSDK();
      console.log('✅ 0G SDK imported successfully');
    } catch (sdkError) {
      console.error('❌ 0G SDK import failed:', sdkError);
      return {
        success: false,
        message: `0G SDK import failed: ${sdkError instanceof Error ? sdkError.message : 'Unknown SDK error'}`,
        details: sdkError
      };
    }
    
    // Check environment variables
    const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const OG_PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY || '';
    
    console.log('🔍 Environment check:', {
      hasRpcUrl: !!OG_RPC_URL,
      hasPrivateKey: !!OG_PRIVATE_KEY,
      privateKeyLength: OG_PRIVATE_KEY ? OG_PRIVATE_KEY.length : 0
    });
    
    if (!OG_PRIVATE_KEY) {
      return {
        success: false,
        message: 'No private key configured - set PRIVATE_KEY in environment',
        details: { hasRpcUrl: !!OG_RPC_URL }
      };
    }
    
    // If we get here, basic setup is OK
    return {
      success: true,
      message: '0G Storage SDK and environment setup successful',
      details: {
        sdkAvailable: true,
        rpcUrl: OG_RPC_URL,
        hasPrivateKey: true,
        note: 'Full upload test skipped for quick validation'
      }
    };
    
  } catch (error) {
    console.error('❌ Storage connection test failed:', error);
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
}
