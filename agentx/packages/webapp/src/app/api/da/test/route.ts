// API route for testing 0G DA connection
import { NextResponse } from 'next/server';
import { testDAConnection } from '@/lib/realDA';

export async function GET() {
  try {
    console.log('📡 API: Testing 0G DA connection...');
    
    const result = await testDAConnection();
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ API: DA test failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: `DA test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      },
      { status: 500 }
    );
  }
}
