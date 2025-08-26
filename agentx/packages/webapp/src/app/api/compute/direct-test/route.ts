// Test direct access to 0G Compute provider endpoint
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing direct provider endpoint access...');
    
    // Known endpoint from metadata test
    const endpoint = 'http://50.145.48.68:30081/v1/proxy';
    const model = 'phala/llama-3.3-70b-instruct';
    
    console.log(`🌐 Testing endpoint: ${endpoint}`);
    
    const testResults = [];
    
    // Test 1: Basic connectivity
    try {
      console.log('1️⃣ Testing basic connectivity...');
      const response = await fetch(endpoint, { 
        method: 'GET',
        timeout: 5000 
      });
      
      testResults.push({
        test: 'connectivity',
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      console.log(`✅ Connectivity: ${response.status} ${response.statusText}`);
      
    } catch (connectError) {
      testResults.push({
        test: 'connectivity',
        error: connectError instanceof Error ? connectError.message : 'Unknown error',
        cause: (connectError as any)?.cause?.code || 'Unknown'
      });
      console.error('❌ Connectivity failed:', connectError);
    }
    
    // Test 2: Chat completions without auth
    try {
      console.log('2️⃣ Testing chat completions without auth...');
      const chatResponse = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello, this is a test' }],
          model: model,
          temperature: 0.7,
          max_tokens: 50
        }),
      });
      
      console.log(`📡 Chat response status: ${chatResponse.status}`);
      
      if (chatResponse.ok) {
        const data = await chatResponse.json();
        testResults.push({
          test: 'chat_no_auth',
          status: 'success',
          responseStatus: chatResponse.status,
          responseData: data
        });
        console.log('✅ Chat without auth successful!');
      } else {
        const errorText = await chatResponse.text();
        testResults.push({
          test: 'chat_no_auth',
          status: 'http_error',
          responseStatus: chatResponse.status,
          error: errorText
        });
        console.log(`⚠️ Chat without auth failed: ${chatResponse.status}`);
      }
      
    } catch (chatError) {
      testResults.push({
        test: 'chat_no_auth',
        status: 'network_error',
        error: chatError instanceof Error ? chatError.message : 'Unknown error',
        cause: (chatError as any)?.cause?.code || 'Unknown'
      });
      console.error('❌ Chat request failed:', chatError);
    }
    
    // Test 3: Try different endpoints
    const alternativeEndpoints = [
      `${endpoint}/v1/chat/completions`,
      `${endpoint}/chat/completions`,
      `${endpoint}/completions`
    ];
    
    for (const altEndpoint of alternativeEndpoints) {
      try {
        console.log(`3️⃣ Testing alternative endpoint: ${altEndpoint}`);
        
        const response = await fetch(altEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Test' }],
            model: model,
            max_tokens: 10
          }),
        });
        
        testResults.push({
          test: 'alternative_endpoint',
          endpoint: altEndpoint,
          status: response.status,
          statusText: response.statusText
        });
        
        if (response.ok) {
          console.log(`✅ Alternative endpoint ${altEndpoint} works!`);
          break;
        }
        
      } catch (altError) {
        testResults.push({
          test: 'alternative_endpoint',
          endpoint: altEndpoint,
          error: altError instanceof Error ? altError.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Direct endpoint tests completed',
      details: {
        endpoint,
        model,
        testResults
      }
    });
    
  } catch (error) {
    console.error('❌ Direct endpoint test failed:', error);
    return NextResponse.json({
      success: false,
      message: `Direct endpoint test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
