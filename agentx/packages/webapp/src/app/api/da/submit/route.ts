// API route for 0G DA data submission
import { NextRequest, NextResponse } from 'next/server';
import { submitToDA, type DARequest } from '@/lib/realDA';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const daRequest: DARequest = body;
    
    if (!daRequest.data) {
      return NextResponse.json(
        { success: false, error: 'Missing data in request body' },
        { status: 400 }
      );
    }
    
    console.log('📡 API: Received DA submission request');
    
    // Submit to real 0G DA
    const result = await submitToDA(daRequest);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ API: DA submission failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
