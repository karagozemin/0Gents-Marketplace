// Quick test API route for the fixed 0G Storage implementation
import { NextResponse } from 'next/server';
import { uploadAgentMetadataServer } from '@/lib/serverStorage';

export async function POST() {
  try {
    console.log('🧪 Testing fixed 0G Storage implementation...');
    
    // Create a small test metadata object
    const testMetadata = {
      name: 'Test Agent - Fixed Upload',
      description: 'Testing the improved upload implementation with better timeout handling',
      image: 'https://example.com/test.png',
      creator: '0x1234567890123456789012345678901234567890',
      category: 'test',
      capabilities: ['testing', 'debugging'],
      skills: ['timeout-handling', 'error-recovery'],
      price: '0.001',
      attributes: [
        { trait_type: 'Test Type', value: 'Timeout Fix' },
        { trait_type: 'Version', value: '2.0' }
      ]
    };
    
    console.log('📝 Test metadata prepared, size:', JSON.stringify(testMetadata).length, 'bytes');
    
    // Test the upload with improved error handling
    const result = await uploadAgentMetadataServer(testMetadata);
    
    return NextResponse.json({
      success: true,
      message: 'Fixed storage implementation test completed',
      result,
      improvements: [
        'Added proper timeout cleanup',
        'Implemented unhandled rejection handling',
        'Progressive timeout strategy (60s → 45s → 30s)',
        'Better resource cleanup with finally blocks',
        'Increased retry attempts to 3 total'
      ]
    });
    
  } catch (error) {
    console.error('❌ Fixed storage test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        message: 'Fixed storage implementation test failed',
        note: 'This helps identify if the timeout fixes resolved the issues'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test the fixed 0G Storage implementation',
    improvements: [
      'Fixed unhandled promise rejections',
      'Added proper timeout cleanup',
      'Progressive timeout strategy',
      'Better error handling and resource cleanup',
      'Increased retry attempts with shorter delays'
    ]
  });
}