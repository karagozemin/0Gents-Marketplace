// Test 0G Compute provider endpoints directly
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing 0G Compute provider endpoints...');
    
    // Import SDK
    const { createZGComputeNetworkBroker } = await import('@0glabs/0g-serving-broker');
    const { ethers } = await import('ethers');
    
    // Configuration
    const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const OG_PRIVATE_KEY = process.env.PRIVATE_KEY || process.env.NEXT_PUBLIC_0G_PRIVATE_KEY || '';
    
    // Initialize
    const provider = new ethers.JsonRpcProvider(OG_RPC_URL);
    const wallet = new ethers.Wallet(OG_PRIVATE_KEY, provider);
    const broker = await createZGComputeNetworkBroker(wallet);
    
    const providerAddress = '0xf07240Efa67755B5311bc75784a061eDB47165Dd';
    console.log(`🤖 Testing provider: ${providerAddress}`);
    
    const testResults = [];
    
    // Test 1: Acknowledge provider (this works)
    try {
      console.log('1️⃣ Acknowledging provider...');
      await broker.inference.acknowledgeProviderSigner(providerAddress);
      testResults.push({ step: 'acknowledge', status: 'success' });
      console.log('✅ Provider acknowledged');
    } catch (error) {
      testResults.push({ step: 'acknowledge', status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
      console.error('❌ Acknowledge failed:', error);
    }
    
    // Test 2: Get service metadata (this works)
    let endpoint = '';
    let model = '';
    try {
      console.log('2️⃣ Getting service metadata...');
      const metadata = await broker.inference.getServiceMetadata(providerAddress);
      endpoint = metadata.endpoint;
      model = metadata.model;
      testResults.push({ 
        step: 'metadata', 
        status: 'success', 
        data: { endpoint, model } 
      });
      console.log(`✅ Metadata: endpoint=${endpoint}, model=${model}`);
    } catch (error) {
      testResults.push({ step: 'metadata', status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
      console.error('❌ Metadata failed:', error);
      return NextResponse.json({ success: false, message: 'Metadata failed', testResults });
    }
    
    // Test 3: Generate auth headers (this works)
    let headers = {};
    try {
      console.log('3️⃣ Generating auth headers...');
      const testMessage = 'Hello test';
      headers = await broker.inference.getRequestHeaders(providerAddress, testMessage);
      testResults.push({ 
        step: 'headers', 
        status: 'success', 
        data: { headerKeys: Object.keys(headers) } 
      });
      console.log(`✅ Headers generated: ${Object.keys(headers).join(', ')}`);
    } catch (error) {
      testResults.push({ step: 'headers', status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
      console.error('❌ Headers failed:', error);
      return NextResponse.json({ success: false, message: 'Headers failed', testResults });
    }
    
    // Test 4: Direct endpoint test (this is where it fails)
    try {
      console.log('4️⃣ Testing direct endpoint access...');
      console.log(`🌐 Full endpoint URL: ${endpoint}/chat/completions`);
      
      // First, test if endpoint is reachable with a simple HEAD request
      console.log('🔍 Testing endpoint reachability...');
      const headResponse = await fetch(endpoint, { method: 'HEAD' });
      console.log(`📡 HEAD response: ${headResponse.status}`);
      
      testResults.push({ 
        step: 'endpoint_head', 
        status: 'success', 
        data: { 
          status: headResponse.status,
          headers: Object.fromEntries(headResponse.headers.entries())
        } 
      });
      
    } catch (headError) {
      console.error('❌ Endpoint HEAD test failed:', headError);
      testResults.push({ 
        step: 'endpoint_head', 
        status: 'failed', 
        error: headError instanceof Error ? headError.message : 'Unknown error',
        details: {
          endpoint,
          cause: (headError as any)?.cause?.code || 'Unknown cause'
        }
      });
    }
    
    // Test 5: Try the actual chat completions request
    try {
      console.log('5️⃣ Testing chat completions endpoint...');
      
      const chatResponse = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...headers 
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          model: model,
          temperature: 0.7,
          max_tokens: 50
        }),
      });
      
      console.log(`📡 Chat response: ${chatResponse.status}`);
      
      if (chatResponse.ok) {
        const data = await chatResponse.json();
        testResults.push({ 
          step: 'chat_request', 
          status: 'success', 
          data: { 
            status: chatResponse.status,
            responseKeys: Object.keys(data)
          } 
        });
      } else {
        const errorText = await chatResponse.text();
        testResults.push({ 
          step: 'chat_request', 
          status: 'http_error', 
          data: { 
            status: chatResponse.status,
            error: errorText
          } 
        });
      }
      
    } catch (chatError) {
      console.error('❌ Chat request failed:', chatError);
      testResults.push({ 
        step: 'chat_request', 
        status: 'failed', 
        error: chatError instanceof Error ? chatError.message : 'Unknown error',
        details: {
          endpoint: `${endpoint}/chat/completions`,
          cause: (chatError as any)?.cause?.code || 'Unknown cause'
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Provider endpoint tests completed',
      details: {
        providerAddress,
        endpoint,
        model,
        testResults
      }
    });
    
  } catch (error) {
    console.error('❌ Provider endpoint test failed:', error);
    return NextResponse.json({
      success: false,
      message: `Provider endpoint test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { error }
    }, { status: 500 });
  }
}
