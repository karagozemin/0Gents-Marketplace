// API route for testing 0G Compute connection
import { NextResponse } from 'next/server';
import { testComputeConnection } from '@/lib/realCompute';

export async function GET() {
  try {
    console.log('📡 API: Testing 0G Compute connection...');
    
    const result = await testComputeConnection();
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ API: Compute test failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Compute test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      },
      { status: 500 }
    );
  }
}
