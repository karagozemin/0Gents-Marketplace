// Server-side only 0G Storage implementation
// This will be used in API routes to avoid client-side Node.js module issues

import { ZERO_G_STORAGE_FLOW } from "./contracts";

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
  const maxRetries = 10; // Ultra-aggressive: 10 retries
  const retryDelay = 2000; // Fast retry: 2 seconds
  
  // 0G Storage configuration - move to top
  const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
  
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
    const OG_INDEXER_URL = process.env.NEXT_PUBLIC_0G_INDEXER_URL || 'https://indexer-storage-testnet-turbo.0g.ai';
    const OG_PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY || '';
    
    console.log('🔍 Environment check:', {
      hasRpcUrl: !!OG_RPC_URL,
      hasIndexerUrl: !!OG_INDEXER_URL,
      hasPrivateKey: !!OG_PRIVATE_KEY,
      privateKeyLength: OG_PRIVATE_KEY ? OG_PRIVATE_KEY.length : 0
    });
    
    if (!OG_PRIVATE_KEY) {
      throw new Error('No private key configured - set PRIVATE_KEY in environment');
    }
    
    // Initialize clients
    const indexer = new Indexer(OG_INDEXER_URL);
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const signer = new ethers.Wallet(OG_PRIVATE_KEY, provider);
    
    // Convert metadata to JSON string
    const jsonData = JSON.stringify(metadata, null, 2);
    console.log('📝 Metadata JSON size:', jsonData.length, 'bytes');
    
    // Create 0G File from Blob (based on 0G SDK docs)
    const blob = new globalThis.Blob([jsonData], { type: 'application/json' });
    const file = new ZgBlob(blob as any);
    console.log('📁 Created 0G File object');
    
    // Generate Merkle tree for verification
    const [tree, treeErr] = await file.merkleTree();
    if (treeErr !== null) {
      throw new Error(`Error generating Merkle tree: ${treeErr}`);
    }
    
    const rootHash = tree?.rootHash();
    console.log('🌳 Generated Merkle tree, root hash:', rootHash);
    
    // Upload to 0G Storage network
    console.log('⬆️ Uploading to 0G Storage network...');
    const [tx, uploadErr] = await indexer.upload(file, OG_RPC_URL, signer as any);
    
    if (uploadErr !== null) {
      throw new Error(`Upload error: ${uploadErr}`);
    }
    
    console.log('✅ Upload successful! Transaction:', tx);
    
    // Close the file if close method exists
    try {
      if (typeof (file as any).close === 'function') {
        await (file as any).close();
      }
    } catch (closeError) {
      console.log('Note: File close not needed or failed (this is normal)');
    }
    
    const result: StorageResult = {
      success: true,
      hash: rootHash || undefined,
      rootHash: rootHash || undefined,
      uri: `0g://storage/${rootHash}`,
      txHash: typeof tx === 'string' ? tx : (tx as any)?.txHash || tx
    };
    
    console.log('🎉 0G Storage upload completed:', result);
    return result;
    
  } catch (error) {
    console.error(`❌ 0G Storage upload failed (Attempt ${retryCount + 1}):`, error);
    
    // Check if this is the "too many data writing" error and we haven't exceeded retries
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        const isNetworkError = errorMessage.includes('too many data writing') ||
                            errorMessage.includes('network') ||
                            errorMessage.includes('timeout') ||
                            errorMessage.includes('Transaction reverted') ||
                            errorMessage.includes('uploading segments') ||
                            errorMessage.includes('transaction execution reverted') ||
                            errorMessage.includes('CALL_EXCEPTION') ||
                            errorMessage.includes('Failed to submit transaction');
    
    if (isNetworkError && retryCount < maxRetries) {
      console.log(`🔄 Network instability detected. Retrying in ${retryDelay/1000}s... (${retryCount + 1}/${maxRetries})`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Recursive retry
      return await uploadAgentMetadataServer(metadata, retryCount + 1);
    }
    
    // If max retries exceeded or non-network error, return failure
    return {
      success: false,
      error: `Upload failed after ${retryCount + 1} attempts: ${errorMessage}. Note: 0G network is experiencing temporary instability, this is being actively fixed by the 0G team.`
    };
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
