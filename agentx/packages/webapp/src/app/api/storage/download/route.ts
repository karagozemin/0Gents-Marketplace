// API route for 0G Storage downloads
import { NextRequest, NextResponse } from 'next/server';

async function getZgSDK() {
  if (typeof window !== 'undefined') {
    throw new Error('0G SDK can only be used on server side');
  }
  
  const { Blob, Indexer } = await import('@0glabs/0g-ts-sdk');
  const { ethers } = await import('ethers');
  
  return { ZgBlob: Blob, Indexer, ethers };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rootHash } = body;
    
    if (!rootHash) {
      return NextResponse.json(
        { success: false, error: 'Missing rootHash in request body' },
        { status: 400 }
      );
    }
    
    console.log('📥 API: Received download request for:', rootHash);
    
    // Download using server-side 0G SDK
    const result = await downloadFromStorage(rootHash);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ API: Download failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

async function downloadFromStorage(rootHash: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    console.log('🔥 Starting server-side 0G Storage download...');
    
    const { ZgBlob, Indexer, ethers } = await getZgSDK();
    const OG_INDEXER_URL = process.env.NEXT_PUBLIC_0G_INDEXER_URL || 'https://indexer-storage-testnet-turbo.0g.ai';
    
    // Initialize indexer
    const indexer = new Indexer(OG_INDEXER_URL);
    
    console.log('📥 Downloading from 0G Storage network...');
    
    // Create temporary file path for download
    const tmpPath = `/tmp/0g_download_${Date.now()}.json`;
    
    // Download file with proof verification
    const downloadErr = await indexer.download(rootHash, tmpPath, true);
    
    if (downloadErr !== null) {
      throw new Error(`Download error: ${downloadErr}`);
    }
    
    // Read the downloaded file
    const fs = await import('fs/promises');
    const data = await fs.readFile(tmpPath, 'utf-8');
    
    // Clean up temporary file
    await fs.unlink(tmpPath).catch(() => {}); // Ignore cleanup errors
    
    console.log('✅ Download successful!');
    
    return {
      success: true,
      data
    };
    
  } catch (error) {
    console.error('❌ 0G Storage download failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
