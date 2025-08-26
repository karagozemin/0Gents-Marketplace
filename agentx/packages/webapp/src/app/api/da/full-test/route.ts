// Full 0G DA data submission test
import { NextResponse } from 'next/server';
import { submitToDA } from '@/lib/realDA';

export async function POST(request: Request) {
  try {
    console.log('🔍 Full 0G DA data submission test...');
    
    const body = await request.json();
    const testData = body.data || 'Test data for full 0G DA submission';
    
    // Test different data sizes
    const testCases = [
      {
        name: 'Small Data',
        data: JSON.stringify({ message: 'Hello 0G DA', timestamp: new Date().toISOString() })
      },
      {
        name: 'Medium Data',
        data: JSON.stringify({
          message: 'Medium size test for 0G DA',
          metadata: {
            version: '1.0',
            author: 'INFT Marketplace',
            description: 'Testing 0G DA with medium sized data',
            tags: ['test', '0g', 'da', 'blockchain', 'decentralized']
          },
          content: 'A'.repeat(1000), // 1KB data
          timestamp: new Date().toISOString()
        })
      },
      {
        name: 'Large Data',
        data: JSON.stringify({
          message: 'Large size test for 0G DA',
          metadata: {
            version: '1.0',
            author: 'INFT Marketplace',
            description: 'Testing 0G DA with large sized data',
            tags: ['test', '0g', 'da', 'blockchain', 'decentralized', 'large-data']
          },
          content: 'B'.repeat(10000), // 10KB data
          largeArray: Array(100).fill(0).map((_, i) => ({
            id: i,
            value: `Item ${i}`,
            data: 'X'.repeat(50)
          })),
          timestamp: new Date().toISOString()
        })
      },
      {
        name: 'Custom Data',
        data: testData
      }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`📊 Testing ${testCase.name}...`);
      
      try {
        const startTime = Date.now();
        
        const result = await submitToDA({
          data: testCase.data,
          metadata: {
            testCase: testCase.name,
            size: testCase.data.length,
            timestamp: new Date().toISOString()
          }
        });
        
        const duration = Date.now() - startTime;
        
        results.push({
          testCase: testCase.name,
          dataSize: testCase.data.length,
          duration: duration,
          success: result.success,
          dataHash: result.dataHash,
          txHash: result.txHash,
          blockNumber: result.blockNumber,
          error: result.error
        });
        
        console.log(`✅ ${testCase.name}: ${result.success ? 'Success' : 'Failed'} (${duration}ms)`);
        
      } catch (testError) {
        console.error(`❌ ${testCase.name} failed:`, testError);
        
        results.push({
          testCase: testCase.name,
          dataSize: testCase.data.length,
          success: false,
          error: testError instanceof Error ? testError.message : 'Unknown error'
        });
      }
    }
    
    // Summary
    const successCount = results.filter(r => r.success).length;
    const totalTests = results.length;
    
    return NextResponse.json({
      success: successCount > 0,
      message: `Full 0G DA test completed: ${successCount}/${totalTests} successful`,
      summary: {
        totalTests,
        successCount,
        failureCount: totalTests - successCount,
        successRate: `${Math.round((successCount / totalTests) * 100)}%`
      },
      results
    });
    
  } catch (error) {
    console.error('❌ Full 0G DA test failed:', error);
    return NextResponse.json({
      success: false,
      message: `Full 0G DA test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}

export async function GET() {
  // Default test with predefined data
  return POST(new Request('http://localhost:3000/api/da/full-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      data: JSON.stringify({
        message: 'Full 0G DA integration test',
        marketplace: 'INFT Marketplace',
        timestamp: new Date().toISOString(),
        testId: `full-test-${Date.now()}`
      })
    })
  }));
}
