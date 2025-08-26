// Test direct endpoints from service discovery
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing direct endpoints from service discovery...');
    
    // Discovered endpoints (without /v1/proxy)
    const discoveredEndpoints = [
      {
        name: 'DeepSeek Direct',
        url: 'http://50.145.48.68:30082',
        model: 'phala/deepseek-chat-v3-0324'
      },
      {
        name: 'Llama Direct',
        url: 'http://50.145.48.68:30081',
        model: 'phala/llama-3.3-70b-instruct'
      }
    ];
    
    // Also test common variations
    const endpointVariations = [];
    
    for (const endpoint of discoveredEndpoints) {
      endpointVariations.push(
        // Direct endpoint
        { ...endpoint, url: endpoint.url },
        // With /v1
        { ...endpoint, name: endpoint.name + ' /v1', url: endpoint.url + '/v1' },
        // With /v1/proxy
        { ...endpoint, name: endpoint.name + ' /v1/proxy', url: endpoint.url + '/v1/proxy' },
        // With /chat/completions
        { ...endpoint, name: endpoint.name + ' /chat/completions', url: endpoint.url + '/chat/completions' },
        // With /v1/chat/completions
        { ...endpoint, name: endpoint.name + ' /v1/chat/completions', url: endpoint.url + '/v1/chat/completions' }
      );
    }
    
    const results = [];
    
    for (const endpoint of endpointVariations) {
      console.log(`🔍 Testing ${endpoint.name}: ${endpoint.url}`);
      
      const endpointResult = {
        name: endpoint.name,
        url: endpoint.url,
        model: endpoint.model,
        tests: []
      };
      
      // Test 1: Basic connectivity
      try {
        console.log(`  1️⃣ Basic connectivity test...`);
        
        const response = await Promise.race([
          fetch(endpoint.url, { method: 'HEAD' }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
        
        endpointResult.tests.push({
          test: 'connectivity',
          status: 'success',
          httpStatus: (response as Response).status,
          statusText: (response as Response).statusText
        });
        
        console.log(`  ✅ Connectivity: ${(response as Response).status}`);
        
        // Test 2: Try GET request for API info
        try {
          console.log(`  2️⃣ GET request test...`);
          
          const getResponse = await Promise.race([
            fetch(endpoint.url, { method: 'GET' }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
          ]);
          
          const responseText = await (getResponse as Response).text();
          
          endpointResult.tests.push({
            test: 'get_request',
            status: 'success',
            httpStatus: (getResponse as Response).status,
            responseLength: responseText.length,
            responsePreview: responseText.slice(0, 100)
          });
          
          console.log(`  ✅ GET: ${(getResponse as Response).status}, ${responseText.length} chars`);
          
        } catch (getError) {
          endpointResult.tests.push({
            test: 'get_request',
            status: 'failed',
            error: getError instanceof Error ? getError.message : 'Unknown error'
          });
          
          console.log(`  ❌ GET failed: ${getError instanceof Error ? getError.message : 'Unknown'}`);
        }
        
        // Test 3: Try POST to /chat/completions
        const chatEndpoints = [
          endpoint.url + '/chat/completions',
          endpoint.url + '/v1/chat/completions'
        ];
        
        for (const chatEndpoint of chatEndpoints) {
          try {
            console.log(`  3️⃣ Testing chat endpoint: ${chatEndpoint}`);
            
            const chatResponse = await Promise.race([
              fetch(chatEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messages: [{ role: 'user', content: 'Hello' }],
                  model: endpoint.model,
                  max_tokens: 10
                })
              }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            
            const chatText = await (chatResponse as Response).text();
            
            endpointResult.tests.push({
              test: 'chat_completions',
              endpoint: chatEndpoint,
              status: 'success',
              httpStatus: (chatResponse as Response).status,
              responseLength: chatText.length,
              responsePreview: chatText.slice(0, 200)
            });
            
            console.log(`  ✅ Chat: ${(chatResponse as Response).status}, ${chatText.length} chars`);
            
            // If successful, we found a working endpoint!
            if ((chatResponse as Response).ok) {
              console.log(`  🎉 WORKING ENDPOINT FOUND: ${chatEndpoint}`);
              break;
            }
            
          } catch (chatError) {
            endpointResult.tests.push({
              test: 'chat_completions',
              endpoint: chatEndpoint,
              status: 'failed',
              error: chatError instanceof Error ? chatError.message : 'Unknown error'
            });
            
            console.log(`  ❌ Chat failed: ${chatError instanceof Error ? chatError.message : 'Unknown'}`);
          }
        }
        
      } catch (connectError) {
        endpointResult.tests.push({
          test: 'connectivity',
          status: 'failed',
          error: connectError instanceof Error ? connectError.message : 'Unknown error'
        });
        
        console.log(`  ❌ Connectivity failed: ${connectError instanceof Error ? connectError.message : 'Unknown'}`);
      }
      
      results.push(endpointResult);
    }
    
    // Find working endpoints
    const workingEndpoints = results.filter(r => 
      r.tests.some(t => t.test === 'chat_completions' && t.status === 'success' && t.httpStatus === 200)
    );
    
    return NextResponse.json({
      success: true,
      message: `Direct endpoint testing completed. Found ${workingEndpoints.length} working chat endpoints.`,
      details: {
        totalTested: results.length,
        workingEndpoints: workingEndpoints.length,
        workingList: workingEndpoints.map(r => ({
          name: r.name,
          url: r.url,
          model: r.model,
          workingChatEndpoint: r.tests.find(t => t.test === 'chat_completions' && t.status === 'success')?.endpoint
        })),
        allResults: results
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
