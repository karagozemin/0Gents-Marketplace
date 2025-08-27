// 0G Galileo Testnet Configuration
export const ZERO_G_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID) : 16601;
export const ZERO_G_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL;
export const ZERO_G_EXPLORER = process.env.NEXT_PUBLIC_0G_EXPLORER;

// Contract Addresses
export const AGENT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS;
export const INFT_ADDRESS = process.env.NEXT_PUBLIC_INFT_ADDRESS || "0xbD5C5a4947497f531a156DE720E04065362783ff"; // Enhanced INFT with mint()
export const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0xF36ae1c0eCfd2d9ecb56Adb402751Bdca1Cbe429"; // Factory Marketplace
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x9822af5443B3862ff1d4B22D11887edD3D7F0ac9"; // Agent NFT Factory

// 0G Storage Contract Addresses
export const ZERO_G_STORAGE_FLOW = process.env.NEXT_PUBLIC_0G_STORAGE_FLOW;
export const ZERO_G_STORAGE_MINE = process.env.NEXT_PUBLIC_0G_STORAGE_MINE;
export const ZERO_G_STORAGE_MARKET = process.env.NEXT_PUBLIC_0G_STORAGE_MARKET;
export const ZERO_G_STORAGE_REWARD = process.env.NEXT_PUBLIC_0G_STORAGE_REWARD;

// 0G DA Contract Address
export const ZERO_G_DA_ENTRANCE = process.env.NEXT_PUBLIC_0G_DA_ENTRANCE;

export const AGENT_REGISTRY_ABI = [
  {
    "type": "function",
    "name": "create",
    "inputs": [{ "name": "metadataURI", "type": "string" }],
    "outputs": [{ "name": "agentId", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "totalAgents",
    "inputs": [],
    "outputs": [{ "name": "total", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [{ "name": "agentId", "type": "uint256" }],
    "outputs": [{ "name": "owner", "type": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "metadataOf",
    "inputs": [{ "name": "agentId", "type": "uint256" }],
    "outputs": [{ "name": "metadataURI", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "agentId", "type": "uint256" },
      { "name": "to", "type": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "AgentCreated",
    "inputs": [
      { "name": "agentId", "type": "uint256", "indexed": true },
      { "name": "owner", "type": "address", "indexed": true },
      { "name": "metadataURI", "type": "string", "indexed": false }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "AgentTransferred",
    "inputs": [
      { "name": "agentId", "type": "uint256", "indexed": true },
      { "name": "from", "type": "address", "indexed": true },
      { "name": "to", "type": "address", "indexed": true }
    ],
    "anonymous": false
  }
] as const;

export const INFT_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [{ name: "tokenURI_", type: "string" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "payable", // Changed to payable for creation fee
  },
  { type: "function", name: "balanceOf", inputs: [{ name: "owner", type: "address" }], outputs: [{ name: "balance", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "ownerOf", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "owner", type: "address" }], stateMutability: "view" },
  { type: "function", name: "tokenURI", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "uri", type: "string" }], stateMutability: "view" },
  { type: "function", name: "approve", inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "getApproved", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "operator", type: "address" }], stateMutability: "view" },
  { type: "function", name: "setApprovalForAll", inputs: [{ name: "operator", type: "address" }, { name: "approved", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "creationFee", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "feeRecipient", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "event", name: "AgentCreated", inputs: [{ name: "tokenId", type: "uint256", indexed: true }, { name: "creator", type: "address", indexed: true }, { name: "tokenURI", type: "string" }], anonymous: false },
] as const;

// Enhanced INFT ABI with AI Agent capabilities  
export const ENHANCED_INFT_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [{ name: "tokenURI_", type: "string" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function", 
    name: "mintAgent",
    inputs: [
      { name: "tokenURI_", type: "string" },
      { name: "agentParams", type: "string[5]" }, // [name, description, category, computeModel, storageHash]
      { name: "capabilities_", type: "string[]" }
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "payable",
  },
  { type: "function", name: "balanceOf", inputs: [{ name: "owner", type: "address" }], outputs: [{ name: "balance", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "ownerOf", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "owner", type: "address" }], stateMutability: "view" },
  { type: "function", name: "tokenURI", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "uri", type: "string" }], stateMutability: "view" },
  { type: "function", name: "approve", inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "getApproved", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "operator", type: "address" }], stateMutability: "view" },
  { type: "function", name: "setApprovalForAll", inputs: [{ name: "operator", type: "address" }, { name: "approved", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "creationFee", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "feeRecipient", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "recordUsage", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "agentData", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [
    { name: "name", type: "string" },
    { name: "description", type: "string" },
    { name: "category", type: "string" },
    { name: "creator", type: "address" },
    { name: "createdAt", type: "uint256" },
    { name: "usageCount", type: "uint256" },
    { name: "isActive", type: "bool" },
    { name: "computeModel", type: "string" },
    { name: "storageHash", type: "string" }
  ], stateMutability: "view" },
  { type: "event", name: "AgentCreated", inputs: [
    { name: "tokenId", type: "uint256", indexed: true }, 
    { name: "creator", type: "address", indexed: true }, 
    { name: "name", type: "string" },
    { name: "tokenURI", type: "string" },
    { name: "storageHash", type: "string" }
  ], anonymous: false },
  { type: "event", name: "AgentUsed", inputs: [
    { name: "tokenId", type: "uint256", indexed: true }, 
    { name: "user", type: "address", indexed: true }, 
    { name: "usageCount", type: "uint256" }
  ], anonymous: false },
] as const;

// Agent NFT Factory ABI
export const FACTORY_ABI = [
  {
    type: "function",
    name: "createAgent",
    inputs: [
      { name: "agentName_", type: "string" },
      { name: "agentDescription_", type: "string" },
      { name: "agentCategory_", type: "string" },
      { name: "computeModel_", type: "string" },
      { name: "storageHash_", type: "string" },
      { name: "capabilities_", type: "string[]" },
      { name: "price_", type: "uint256" }
    ],
    outputs: [{ name: "agentContract", type: "address" }],
    stateMutability: "payable",
  },
  { type: "function", name: "creationFee", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "marketplace", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "getTotalAgents", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getAgentAt", inputs: [{ name: "index", type: "uint256" }], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "getCreatorAgents", inputs: [{ name: "creator", type: "address" }], outputs: [{ name: "", type: "address[]" }], stateMutability: "view" },
  { type: "event", name: "AgentContractCreated", inputs: [
    { name: "agentContract", type: "address", indexed: true },
    { name: "creator", type: "address", indexed: true },
    { name: "agentName", type: "string" },
    { name: "price", type: "uint256" }
  ], anonymous: false },
] as const;

// Individual Agent NFT ABI
export const AGENT_NFT_ABI = [
  {
    type: "function",
    name: "mint",
    inputs: [{ name: "tokenURI_", type: "string" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "listOnMarketplace",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  { type: "function", name: "agentName", inputs: [], outputs: [{ name: "", type: "string" }], stateMutability: "view" },
  { type: "function", name: "agentDescription", inputs: [], outputs: [{ name: "", type: "string" }], stateMutability: "view" },
  { type: "function", name: "agentCategory", inputs: [], outputs: [{ name: "", type: "string" }], stateMutability: "view" },
  { type: "function", name: "price", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "creator", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "isListed", inputs: [], outputs: [{ name: "", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "getCapabilities", inputs: [], outputs: [{ name: "", type: "string[]" }], stateMutability: "view" },
  { type: "function", name: "tokenURI", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "string" }], stateMutability: "view" },
  { type: "event", name: "AgentMinted", inputs: [
    { name: "tokenId", type: "uint256", indexed: true },
    { name: "owner", type: "address", indexed: true },
    { name: "tokenURI", type: "string" }
  ], anonymous: false },
  { type: "event", name: "AgentListed", inputs: [
    { name: "tokenId", type: "uint256", indexed: true },
    { name: "price", type: "uint256" }
  ], anonymous: false },
] as const;

export const MARKETPLACE_ABI = [
  {
    type: "function",
    name: "list",
    inputs: [
      { name: "nft", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    outputs: [{ name: "listingId", type: "uint256" }],
    stateMutability: "nonpayable", // No listing fee needed
  },
  {
    type: "function",
    name: "buy",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "cancel",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "listings",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [
      { name: "nft", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "seller", type: "address" },
      { name: "price", type: "uint256" },
      { name: "active", type: "bool" }
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "platformFeePercent",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "feeRecipient",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateFees",
    inputs: [{ name: "price", type: "uint256" }],
    outputs: [
      { name: "platformFee", type: "uint256" },
      { name: "sellerAmount", type: "uint256" }
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Listed",
    inputs: [
      { name: "listingId", type: "uint256", indexed: true },
      { name: "nft", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "seller", type: "address" },
      { name: "price", type: "uint256" }
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Purchased",
    inputs: [
      { name: "listingId", type: "uint256", indexed: true },
      { name: "buyer", type: "address" },
      { name: "platformFee", type: "uint256" }
    ],
    anonymous: false,
  },
] as const;


