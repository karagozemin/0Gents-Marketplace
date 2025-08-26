// API route for testing 0G Storage connection
import { NextResponse } from 'next/server';
import { testStorageConnectionServer } from '@/lib/serverStorage';

export async function GET() {
  try {
    console.log('📡 API: Testing 0G Storage connection...');
    
    const result = await testStorageConnectionServer();
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ API: Storage test failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Storage test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      },
      { status: 500 }
    );
  }
}
