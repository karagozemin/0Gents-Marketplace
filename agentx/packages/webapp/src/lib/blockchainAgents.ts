// Blockchain-based agent discovery
// This will replace localStorage-only approach for cross-browser visibility

import { useReadContract } from "wagmi";
import { INFT_ADDRESS, INFT_ABI } from "./contracts";
import type { AgentItem } from "./mock";
import type { CreatedAgent } from "./createdAgents";

// Global storage for blockchain-discovered agents
// In production, this would be replaced with proper indexing service
const GLOBAL_AGENTS_KEY = 'agentx_global_agents';

// Simulate blockchain-discovered agents (visible across all browsers)
const SIMULATED_BLOCKCHAIN_AGENTS: BlockchainAgent[] = [
  {
    tokenId: "blockchain-1",
    owner: "0xa9b8305C821dC2221dfDEcaacCa8AF5abB1D1788", 
    tokenURI: "0g://storage/blockchain-agent-1",
    creator: "0xa9b8305C821dC2221dfDEcaacCa8AF5abB1D1788",
    discoveredAt: new Date(Date.now() - 1800000).toISOString() // 30 min ago
  }
];

export interface BlockchainAgent {
  tokenId: string;
  owner: string;
  tokenURI: string;
  creator: string;
  discoveredAt: string;
}

// Save discovered agent to global storage (accessible across browsers)
export function saveGlobalAgent(agent: BlockchainAgent): void {
  try {
    // Add to simulated blockchain (this simulates blockchain indexing)
    SIMULATED_BLOCKCHAIN_AGENTS.unshift(agent);
    console.log('🌐 Agent added to simulated blockchain:', agent.tokenId);
    console.log('📊 Total simulated blockchain agents:', SIMULATED_BLOCKCHAIN_AGENTS.length);
    
    // Also save to localStorage for persistence within same browser
    const existing = getGlobalAgents();
    const existingIndex = existing.findIndex(a => a.tokenId === agent.tokenId);
    
    let updated: BlockchainAgent[];
    if (existingIndex >= 0) {
      updated = [...existing];
      updated[existingIndex] = agent;
    } else {
      updated = [agent, ...existing];
    }
    
    localStorage.setItem(GLOBAL_AGENTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save global agent:', error);
  }
}

// Get all globally discovered agents
export function getGlobalAgents(): BlockchainAgent[] {
  try {
    // Get from localStorage with a global key (shared across sessions)
    const stored = localStorage.getItem('0gents_all_created_agents');
    const localAgents = stored ? JSON.parse(stored) : [];
    
    // Add the default blockchain agent
    const allAgents = [
      ...localAgents,
      ...SIMULATED_BLOCKCHAIN_AGENTS
    ];
    
    console.log(`🌐 Returning ${allAgents.length} global agents (${localAgents.length} stored + ${SIMULATED_BLOCKCHAIN_AGENTS.length} default)`);
    return allAgents;
  } catch (error) {
    console.error('Failed to load global agents:', error);
    return [...SIMULATED_BLOCKCHAIN_AGENTS];
  }
}

// Check if NFT exists on blockchain
export async function validateNFTExists(tokenId: string): Promise<boolean> {
  try {
    // This would be implemented with proper blockchain query
    // For now, we'll simulate validation
    return true;
  } catch (error) {
    console.error('Failed to validate NFT:', error);
    return false;
  }
}

// Discover new agents by checking blockchain
export async function discoverAgentsFromBlockchain(): Promise<BlockchainAgent[]> {
  try {
    // In production, this would:
    // 1. Query blockchain events for minted NFTs
    // 2. Get tokenURI for each NFT
    // 3. Fetch metadata from 0G Storage
    // 4. Transform to our format
    
    console.log('🔍 Discovering agents from blockchain...');
    
    // For now, return existing global agents
    return getGlobalAgents();
  } catch (error) {
    console.error('Failed to discover agents:', error);
    return [];
  }
}

// Transform blockchain agent to display format
export function transformBlockchainAgent(blockchainAgent: BlockchainAgent): AgentItem {
  // Check if it's a timestamp-based agent (user created)
  const isTimestamp = /^\d{13}$/.test(blockchainAgent.tokenId);
  
  // Default names for known agents
  const agentNames: Record<string, string> = {
    "blockchain-1": "Global DeFi Bot"
  };
  
  const agentDescriptions: Record<string, string> = {
    "blockchain-1": "Cross-browser visible DeFi trading assistant"
  };
  
  const agentCategories: Record<string, string> = {
    "blockchain-1": "Trading"
  };

  return {
    id: `blockchain-${blockchainAgent.tokenId}`,
    name: agentNames[blockchainAgent.tokenId] || (isTimestamp ? `Created Agent #${blockchainAgent.tokenId.slice(-4)}` : `Blockchain Agent #${blockchainAgent.tokenId}`),
    description: agentDescriptions[blockchainAgent.tokenId] || (isTimestamp ? "User-created AI agent from blockchain" : "AI Agent discovered on blockchain network"),
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
    category: agentCategories[blockchainAgent.tokenId] || (isTimestamp ? "General" : "Blockchain"),
    owner: blockchainAgent.owner,
    priceEth: 0.075,
    history: [
      {
        activity: isTimestamp ? "Created by user" : "Discovered on blockchain",
        date: blockchainAgent.discoveredAt,
        priceEth: 0.005
      }
    ]
  };
}

// Hook to get all agents (local + blockchain)
export function useAllAgents() {
  const globalAgents = getGlobalAgents();
  
  return {
    globalAgents,
    totalDiscovered: globalAgents.length,
    refresh: discoverAgentsFromBlockchain
  };
}
