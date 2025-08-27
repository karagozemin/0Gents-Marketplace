import { NextRequest, NextResponse } from 'next/server';

// Geçici olarak memory-based storage (production'da veritabanı kullanılmalı)
// Bu tüm kullanıcılar tarafından görülebilen global storage
let globalAgents: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const agent = await request.json();
    
    // Agent'ı global storage'a ekle
    const newAgent = {
      ...agent,
      id: `global-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isGlobal: true
    };
    
    globalAgents.unshift(newAgent);
    
    console.log(`✅ Agent saved to global storage: ${agent.name}`);
    console.log(`📊 Total global agents: ${globalAgents.length}`);
    
    return NextResponse.json({ 
      success: true, 
      agent: newAgent,
      total: globalAgents.length 
    });
  } catch (error) {
    console.error('Failed to save agent:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save agent' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Tüm global agent'ları döndür
    return NextResponse.json({ 
      success: true, 
      agents: globalAgents,
      total: globalAgents.length 
    });
  } catch (error) {
    console.error('Failed to get agents:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get agents' 
    }, { status: 500 });
  }
}

// Development için reset endpoint
export async function DELETE() {
  globalAgents = [];
  return NextResponse.json({ 
    success: true, 
    message: 'All agents cleared' 
  });
}
