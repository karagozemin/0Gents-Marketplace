// Global Agent Management - Server-side storage for cross-user visibility
// Bu dosya localStorage yerine server API kullanarak gerçek cross-user visibility sağlar

import type { AgentItem } from './mock';
import type { CreatedAgent } from './createdAgents';

export interface GlobalAgent extends CreatedAgent {
  isGlobal: boolean;
  globalId?: string;
}

// Server API'ye agent kaydet (tüm kullanıcılar görebilir)
export async function saveAgentToServer(agent: CreatedAgent): Promise<boolean> {
  try {
    console.log('🌐 Saving agent to global server storage...');
    
    const response = await fetch('/api/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agent),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Agent saved to server:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Failed to save agent to server:', error);
    return false;
  }
}

// Server'dan tüm agent'ları çek (tüm kullanıcıların agent'ları)
export async function getAgentsFromServer(): Promise<GlobalAgent[]> {
  try {
    console.log('🔄 Fetching agents from global server...');
    
    const response = await fetch('/api/agents', {
      method: 'GET',
      cache: 'no-store', // Always get fresh data
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`✅ Loaded ${result.agents?.length || 0} agents from server`);
    return result.agents || [];
  } catch (error) {
    console.error('❌ Failed to load agents from server:', error);
    return [];
  }
}

// Transform global agent to display format
export function transformGlobalAgent(globalAgent: GlobalAgent): AgentItem {
  return {
    id: globalAgent.globalId || globalAgent.id,
    name: globalAgent.name,
    owner: `${globalAgent.creator.slice(0, 6)}...${globalAgent.creator.slice(-4)}`,
    image: globalAgent.image,
    priceEth: parseFloat(globalAgent.price) || 0.01,
    description: globalAgent.description,
    category: globalAgent.category,
    history: [
      { 
        activity: "Created globally", 
        date: new Date(globalAgent.createdAt).toISOString().split('T')[0] 
      },
      { 
        activity: "Minted", 
        date: new Date(globalAgent.createdAt).toISOString().split('T')[0], 
        priceEth: parseFloat(globalAgent.price) || 0.01 
      },
    ],
  };
}

// Development helper - clear all server agents
export async function clearServerAgents(): Promise<boolean> {
  try {
    const response = await fetch('/api/agents', {
      method: 'DELETE',
    });
    
    const result = await response.json();
    console.log('🗑️ Server agents cleared:', result);
    return result.success;
  } catch (error) {
    console.error('❌ Failed to clear server agents:', error);
    return false;
  }
}
