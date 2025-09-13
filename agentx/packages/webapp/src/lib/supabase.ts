import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface UnifiedAgentDB {
  id: string
  token_id: string
  agent_contract_address: string
  name: string
  description: string
  image: string
  category: string
  price: string
  price_wei: string
  creator: string
  current_owner: string
  tx_hash: string
  storage_uri: string
  listing_id: number
  active: boolean
  created_at: string
  social?: {
    x?: string
    website?: string
  }
  capabilities?: string[]
  compute_model?: string
  views: number
  likes: number
  trending: boolean
}

// Helper function to transform DB data to UnifiedAgent
export function transformDBToUnifiedAgent(dbAgent: UnifiedAgentDB): any {
  return {
    id: dbAgent.id,
    tokenId: dbAgent.token_id,
    agentContractAddress: dbAgent.agent_contract_address,
    name: dbAgent.name,
    description: dbAgent.description,
    image: dbAgent.image,
    category: dbAgent.category,
    price: dbAgent.price,
    priceWei: dbAgent.price_wei,
    creator: dbAgent.creator,
    currentOwner: dbAgent.current_owner,
    txHash: dbAgent.tx_hash,
    storageUri: dbAgent.storage_uri,
    listingId: dbAgent.listing_id,
    active: dbAgent.active,
    createdAt: dbAgent.created_at,
    social: dbAgent.social || {},
    capabilities: dbAgent.capabilities || [],
    computeModel: dbAgent.compute_model || '',
    views: dbAgent.views || 0,
    likes: dbAgent.likes || 0,
    trending: dbAgent.trending || false
  };
}

// Helper function to transform UnifiedAgent to DB format
export function transformUnifiedAgentToDB(agent: any): Partial<UnifiedAgentDB> {
  return {
    id: agent.id,
    token_id: agent.tokenId,
    agent_contract_address: agent.agentContractAddress,
    name: agent.name,
    description: agent.description,
    image: agent.image,
    category: agent.category,
    price: agent.price,
    price_wei: agent.priceWei,
    creator: agent.creator,
    current_owner: agent.currentOwner,
    tx_hash: agent.txHash,
    storage_uri: agent.storageUri,
    listing_id: agent.listingId,
    active: agent.active,
    social: agent.social,
    capabilities: agent.capabilities,
    compute_model: agent.computeModel,
    views: agent.views,
    likes: agent.likes,
    trending: agent.trending
  };
}
