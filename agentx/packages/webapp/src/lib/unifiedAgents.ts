// Unified Agent Management Library
// Tek merkezi agent sistemi için helper functions

export interface UnifiedAgent {
  id: string;
  tokenId: string;
  agentContractAddress: string;
  name: string;
  description: string;
  image: string;
  category: string;
  price: string;
  priceWei: string;
  creator: string;
  currentOwner: string;
  txHash: string;
  storageUri: string;
  listingId: number;
  active: boolean;
  createdAt: string;
  social?: {
    x?: string;
    website?: string;
  };
  capabilities?: string[];
  computeModel?: string;
  views?: number;
  likes?: number;
  trending?: boolean;
  history?: Array<{
    activity: string;
    date: string;
    priceEth?: string;
  }>;
}

/**
 * Save agent to unified system
 * Bu function create flow sonrasında çağrılır
 */
export async function saveUnifiedAgent(agentData: Partial<UnifiedAgent>): Promise<{
  success: boolean;
  agent?: UnifiedAgent;
  error?: string;
}> {
  try {
    console.log('🎯 Saving agent to unified system:', agentData.name);
    
    const response = await fetch('/api/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Agent saved to unified system: ${result.agent.name}`);
      return {
        success: true,
        agent: result.agent
      };
    } else {
      console.error('❌ Unified system rejected agent:', result.error);
      return {
        success: false,
        error: result.error
      };
    }

  } catch (error) {
    console.error('❌ Failed to save agent to unified system:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Get all agents from unified system
 */
export async function getAllUnifiedAgents(filters?: {
  creator?: string;
  owner?: string;
  active?: boolean;
  category?: string;
}): Promise<{
  success: boolean;
  agents?: UnifiedAgent[];
  error?: string;
}> {
  try {
    console.log('📋 Fetching agents from unified system');
    
    // Build query string
    const params = new URLSearchParams();
    if (filters?.creator) params.set('creator', filters.creator);
    if (filters?.owner) params.set('owner', filters.owner);
    if (filters?.active !== undefined) params.set('active', filters.active.toString());
    if (filters?.category) params.set('category', filters.category);
    
    const queryString = params.toString();
    const url = queryString ? `/api/agents?${queryString}` : '/api/agents';
    
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Fetched ${result.agents.length} agents from unified system`);
      return {
        success: true,
        agents: result.agents
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }

  } catch (error) {
    console.error('❌ Failed to fetch agents from unified system:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Get specific agent by ID from unified system
 */
export async function getUnifiedAgentById(id: string): Promise<{
  success: boolean;
  agent?: UnifiedAgent;
  error?: string;
}> {
  try {
    console.log(`🔍 Fetching agent ${id} from unified system`);
    
    const response = await fetch(`/api/agents/${id}`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Found agent: ${result.agent.name}`);
      return {
        success: true,
        agent: result.agent
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }

  } catch (error) {
    console.error('❌ Failed to fetch agent from unified system:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Update agent in unified system (only creator can update)
 */
export async function updateUnifiedAgent(
  id: string, 
  updates: Partial<UnifiedAgent>, 
  userAddress: string
): Promise<{
  success: boolean;
  agent?: UnifiedAgent;
  error?: string;
}> {
  try {
    console.log(`📝 Updating agent ${id} in unified system`);
    
    const response = await fetch(`/api/agents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        updates,
        userAddress
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Agent updated: ${result.agent.name}`);
      return {
        success: true,
        agent: result.agent
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }

  } catch (error) {
    console.error('❌ Failed to update agent in unified system:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Deactivate agent (mark as inactive)
 */
export async function deactivateUnifiedAgent(
  id: string, 
  userAddress: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`🗑️ Deactivating agent ${id}`);
    
    const response = await fetch(`/api/agents/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Agent deactivated`);
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error
      };
    }

  } catch (error) {
    console.error('❌ Failed to deactivate agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Transform CreatedAgent to UnifiedAgent format
 */
export function transformCreatedAgentToUnified(
  createdAgent: any, 
  agentContractAddress: string,
  listingId: number = 0
): Partial<UnifiedAgent> {
  return {
    id: createdAgent.id,
    tokenId: createdAgent.tokenId,
    agentContractAddress,
    name: createdAgent.name,
    description: createdAgent.description,
    image: createdAgent.image,
    category: createdAgent.category,
    price: createdAgent.price,
    priceWei: (parseFloat(createdAgent.price) * 1e18).toString(), // Convert to wei
    creator: createdAgent.creator,
    currentOwner: createdAgent.creator, // Initially creator is owner
    txHash: createdAgent.txHash,
    storageUri: createdAgent.storageUri,
    listingId,
    active: true,
    social: createdAgent.social,
    capabilities: ["chat", "analysis", "automation"],
    computeModel: "gpt-4",
    views: 0,
    likes: 0,
    trending: false,
    history: [
      {
        activity: "Agent Oluşturuldu",
        date: new Date().toLocaleDateString('tr-TR'),
        priceEth: createdAgent.price
      }
    ]
  };
}
