import { NextRequest, NextResponse } from 'next/server';
import { UnifiedAgent } from '../route';

// Import the unified agents storage from parent route
// In production, this would be a database query
let unifiedAgents: UnifiedAgent[] = [];

// Temporary sync function (in production, this would be a database)
function syncWithParentStorage() {
  try {
    // This is a workaround for development - in production use database
    const parentModule = require('../route');
    // We'll handle this differently - use the API endpoint instead
  } catch (error) {
    console.log('Using local storage sync');
  }
}

/**
 * GET /api/agents/[id] - Get specific agent by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    
    console.log(`🔍 Looking for agent: ${agentId}`);
    
    // In development, we'll fetch from the main endpoint
    // In production, this would be a direct database query
    const response = await fetch(`${request.nextUrl.origin}/api/agents`);
    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch agents' 
      }, { status: 500 });
    }
    
    const agents = data.agents as UnifiedAgent[];
    const agent = agents.find(a => a.id === agentId);
    
    if (!agent) {
      console.log(`❌ Agent not found: ${agentId}`);
      return NextResponse.json({ 
        success: false, 
        error: 'Agent not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Agent found: ${agent.name}`);
    
    // Increment view count
    agent.views = (agent.views || 0) + 1;
    
    return NextResponse.json({ 
      success: true, 
      agent 
    });
    
  } catch (error) {
    console.error('❌ Failed to get agent by ID:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get agent' 
    }, { status: 500 });
  }
}

/**
 * PUT /api/agents/[id] - Update specific agent
 * Body: { updates: Partial<UnifiedAgent>, userAddress: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    const { updates, userAddress } = await request.json();
    
    if (!userAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing userAddress' 
      }, { status: 400 });
    }
    
    console.log(`📝 Updating agent: ${agentId} by ${userAddress}`);
    
    // Forward to main API endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/agents`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: agentId,
        updates,
        userAddress
      })
    });
    
    const result = await response.json();
    
    return NextResponse.json(result, { 
      status: response.status 
    });
    
  } catch (error) {
    console.error('❌ Failed to update agent:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update agent' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/agents/[id] - Deactivate agent (mark as inactive)
 * Body: { userAddress: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    const { userAddress } = await request.json();
    
    if (!userAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing userAddress' 
      }, { status: 400 });
    }
    
    console.log(`🗑️ Deactivating agent: ${agentId} by ${userAddress}`);
    
    // Forward to main API endpoint to deactivate
    const response = await fetch(`${request.nextUrl.origin}/api/agents`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: agentId,
        updates: { active: false },
        userAddress
      })
    });
    
    const result = await response.json();
    
    return NextResponse.json(result, { 
      status: response.status 
    });
    
  } catch (error) {
    console.error('❌ Failed to deactivate agent:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to deactivate agent' 
    }, { status: 500 });
  }
}
