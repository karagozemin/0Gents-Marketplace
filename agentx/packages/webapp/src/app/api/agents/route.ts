import { NextRequest, NextResponse } from 'next/server';

// 🎯 UNIFIED AGENT INTERFACE - Tek merkezi agent storage
export interface UnifiedAgent {
  id: string;                    // Unique agent ID
  tokenId: string;              // NFT token ID  
  agentContractAddress: string; // Agent contract address
  name: string;
  description: string;
  image: string;
  category: string;
  price: string;                // Display price (e.g., "0.01")
  priceWei: string;            // Price in wei for contract calls
  creator: string;              // Original creator address (owner)
  currentOwner: string;         // Current NFT owner (creator initially, buyer after purchase)
  txHash: string;               // Creation transaction hash
  storageUri: string;           // 0G Storage URI
  listingId: number;           // Real marketplace listing ID
  active: boolean;             // Available for purchase
  createdAt: string;           // ISO timestamp
  social?: {                   // Optional social links
    x?: string;
    website?: string;
  };
  // Additional metadata
  capabilities?: string[];      // Agent capabilities
  computeModel?: string;       // AI model used
  views?: number;              // View count
  likes?: number;              // Like count
  trending?: boolean;          // Trending status
}

// 🏪 UNIFIED AGENT STORAGE - Cross-user visibility
// Memory-based storage (production'da database kullanılmalı)
let unifiedAgents: UnifiedAgent[] = [];

/**
 * POST /api/agents - Create new agent
 * Body: Partial<UnifiedAgent> (id will be auto-generated)
 */
export async function POST(request: NextRequest) {
  try {
    const agentData = await request.json();
    
    console.log('📝 Creating unified agent:', agentData.name);
    
    // Generate unique ID
    const timestamp = Date.now();
    const uniqueId = agentData.id || `agent-${timestamp}`;
    
    // Create unified agent
    const newAgent: UnifiedAgent = {
      id: uniqueId,
      tokenId: agentData.tokenId || timestamp.toString(),
      agentContractAddress: agentData.agentContractAddress || '',
      name: agentData.name || 'Unnamed Agent',
      description: agentData.description || '',
      image: agentData.image || 'https://images.unsplash.com/photo-1677442136019-1d7fd3f2aa3b?w=400',
      category: agentData.category || 'General',
      price: agentData.price || '0.01',
      priceWei: agentData.priceWei || '10000000000000000', // 0.01 ETH in wei
      creator: agentData.creator || '',
      currentOwner: agentData.currentOwner || agentData.creator || '',
      txHash: agentData.txHash || '',
      storageUri: agentData.storageUri || '',
      listingId: agentData.listingId || 0,
      active: agentData.active !== undefined ? agentData.active : true,
      createdAt: new Date().toISOString(),
      social: agentData.social || {},
      capabilities: agentData.capabilities || [],
      computeModel: agentData.computeModel || '',
      views: 0,
      likes: 0,
      trending: false
    };
    
    // Add to unified storage
    unifiedAgents.unshift(newAgent);
    
    console.log(`✅ Unified agent created: ${newAgent.name}`);
    console.log(`📊 Total unified agents: ${unifiedAgents.length}`);
    
    return NextResponse.json({ 
      success: true, 
      agent: newAgent,
      total: unifiedAgents.length 
    });
    
  } catch (error) {
    console.error('❌ Failed to create unified agent:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create agent' 
    }, { status: 500 });
  }
}

/**
 * GET /api/agents - Get all agents with optional filtering
 * Query params:
 * - creator=address : Get agents created by specific address
 * - owner=address : Get agents owned by specific address  
 * - active=true/false : Filter by active status
 * - category=string : Filter by category
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');
    const owner = searchParams.get('owner');
    const active = searchParams.get('active');
    const category = searchParams.get('category');
    
    let filteredAgents = [...unifiedAgents];
    
    // Filter by creator
    if (creator) {
      filteredAgents = filteredAgents.filter(agent => 
        agent.creator.toLowerCase() === creator.toLowerCase()
      );
      console.log(`🔍 Filtered by creator ${creator}: ${filteredAgents.length} agents`);
    }
    
    // Filter by current owner
    if (owner) {
      filteredAgents = filteredAgents.filter(agent => 
        agent.currentOwner.toLowerCase() === owner.toLowerCase()
      );
      console.log(`🔍 Filtered by owner ${owner}: ${filteredAgents.length} agents`);
    }
    
    // Filter by active status
    if (active !== null) {
      const isActive = active === 'true';
      filteredAgents = filteredAgents.filter(agent => agent.active === isActive);
      console.log(`🔍 Filtered by active=${isActive}: ${filteredAgents.length} agents`);
    }
    
    // Filter by category
    if (category) {
      filteredAgents = filteredAgents.filter(agent => 
        agent.category.toLowerCase() === category.toLowerCase()
      );
      console.log(`🔍 Filtered by category ${category}: ${filteredAgents.length} agents`);
    }
    
    console.log(`📋 Returning ${filteredAgents.length} unified agents`);
    
    return NextResponse.json({ 
      success: true, 
      agents: filteredAgents,
      total: filteredAgents.length,
      totalAll: unifiedAgents.length
    });
    
  } catch (error) {
    console.error('❌ Failed to get unified agents:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get agents' 
    }, { status: 500 });
  }
}

/**
 * PUT /api/agents - Update agent (only creator can update)
 * Body: { id: string, updates: Partial<UnifiedAgent>, userAddress: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, updates, userAddress } = await request.json();
    
    if (!id || !userAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing id or userAddress' 
      }, { status: 400 });
    }
    
    // Find agent
    const agentIndex = unifiedAgents.findIndex(agent => agent.id === id);
    if (agentIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Agent not found' 
      }, { status: 404 });
    }
    
    const agent = unifiedAgents[agentIndex];
    
    // Check permission - only creator can edit
    if (agent.creator.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Only creator can edit this agent' 
      }, { status: 403 });
    }
    
    // Update agent
    const updatedAgent = {
      ...agent,
      ...updates,
      // Protect critical fields
      id: agent.id,
      creator: agent.creator,
      tokenId: agent.tokenId,
      agentContractAddress: agent.agentContractAddress,
      txHash: agent.txHash,
      createdAt: agent.createdAt
    };
    
    unifiedAgents[agentIndex] = updatedAgent;
    
    console.log(`✅ Agent updated by creator: ${updatedAgent.name}`);
    
    return NextResponse.json({ 
      success: true, 
      agent: updatedAgent 
    });
    
  } catch (error) {
    console.error('❌ Failed to update unified agent:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update agent' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/agents - Development endpoint to clear all agents
 */
export async function DELETE() {
  unifiedAgents = [];
  console.log('🗑️ All unified agents cleared');
  return NextResponse.json({ 
    success: true, 
    message: 'All unified agents cleared' 
  });
}