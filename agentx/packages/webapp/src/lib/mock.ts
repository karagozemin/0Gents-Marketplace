export type AgentItem = {
  id: string;
  name: string;
  owner: string;
  image: string;
  priceEth: number;
  description: string;
  category: string;
  history: Array<{ activity: string; date: string; priceEth?: number }>;
};

export const mockAgents: AgentItem[] = [
  // Cross-browser test agents (work in any browser)
  {
    id: "1755780653835",
    name: "Created Test Agent",
    owner: "0xa9b8305C821dC2221dfDEcaacCa8AF5abB1D1788",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.075,
    description: "Cross-browser test agent created via blockchain",
    category: "General",
    history: [
      { activity: "Created by user", date: "2025-08-21", priceEth: 0.005 }
    ]
  },
  {
    id: "1755780468531",
    name: "Another Test Agent", 
    owner: "0xa9b8305C821dC2221dfDEcaacCa8AF5abB1D1788",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.075,
    description: "Another cross-browser test agent",
    category: "General", 
    history: [
      { activity: "Created by user", date: "2025-08-21", priceEth: 0.005 }
    ]
  },
  {
    id: "1755780976768",
    name: "User Created Agent",
    owner: "0xa9b8305C821dC2221dfDEcaacCa8AF5abB1D1788", 
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.075,
    description: "Recently created agent by user",
    category: "General",
    history: [
      { activity: "Created by user", date: "2025-08-21", priceEth: 0.005 }
    ]
  },
  {
    id: "1755781297900",
    name: "New test",
    owner: "0x267C...99D7",
    image: "https://cdn.everythingrf.com/live/1574854414411_637104512178775834.jpeg", 
    priceEth: 0.0321,
    description: "0g",
    category: "Art",
    history: [
      { activity: "Created by user", date: "2025-08-21", priceEth: 0.005 }
    ]
  },
  {
    id: "1",
    name: "Research Agent",
    owner: "0x8a...52a",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.02,
    description: "Summarizes academic papers and extracts key insights.",
    category: "Research",
    history: [
      { activity: "Minted", date: "2025-08-17", priceEth: 0.01 },
      { activity: "Listed", date: "2025-08-18", priceEth: 0.02 },
    ],
  },
  {
    id: "2",
    name: "Trading Scout",
    owner: "0xb6...131a",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.05,
    description: "Analyzes market data and suggests opportunities.",
    category: "Trading",
    history: [{ activity: "Minted", date: "2025-08-18", priceEth: 0.03 }],
  },
  {
    id: "3",
    name: "NPC Companion",
    owner: "0xa9...1788",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.015,
    description: "In-game agent for storytelling and quests.",
    category: "Gaming",
    history: [{ activity: "Minted", date: "2025-08-18", priceEth: 0.015 }],
  },
  {
    id: "4",
    name: "Code Assistant",
    owner: "0xc2...94f",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.035,
    description: "Advanced AI for code review and optimization.",
    category: "Development",
    history: [{ activity: "Minted", date: "2025-08-19", priceEth: 0.035 }],
  },
  {
    id: "5",
    name: "Art Creator",
    owner: "0xd4...78b",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.08,
    description: "Generates stunning digital artwork and NFTs.",
    category: "Art",
    history: [{ activity: "Minted", date: "2025-08-19", priceEth: 0.06 }],
  },
  {
    id: "6",
    name: "Social Media Bot",
    owner: "0xe1...23c",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.025,
    description: "Manages and optimizes social media presence.",
    category: "Marketing",
    history: [{ activity: "Minted", date: "2025-08-20", priceEth: 0.025 }],
  },
  {
    id: "7",
    name: "Data Analyst",
    owner: "0xf5...67d",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.045,
    description: "Processes and analyzes complex datasets.",
    category: "Analytics",
    history: [{ activity: "Minted", date: "2025-08-20", priceEth: 0.04 }],
  },
  {
    id: "8",
    name: "Music Producer",
    owner: "0xa7...89e",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.06,
    description: "Creates original music and beats using AI.",
    category: "Music",
    history: [{ activity: "Minted", date: "2025-08-21", priceEth: 0.055 }],
  },
  {
    id: "9",
    name: "Fitness Coach",
    owner: "0xb8...12f",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.03,
    description: "Personalized workout plans and nutrition advice.",
    category: "Health",
    history: [{ activity: "Minted", date: "2025-08-21", priceEth: 0.028 }],
  },
  {
    id: "10",
    name: "Language Tutor",
    owner: "0xc9...34a",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.04,
    description: "Interactive language learning with AI feedback.",
    category: "Education",
    history: [{ activity: "Minted", date: "2025-08-22", priceEth: 0.035 }],
  },
  {
    id: "11",
    name: "Crypto Oracle",
    owner: "0xd0...56b",
    image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.12,
    description: "Predicts crypto market trends with high accuracy.",
    category: "DeFi",
    history: [{ activity: "Minted", date: "2025-08-22", priceEth: 0.1 }],
  },
  {
    id: "12",
    name: "Virtual Assistant",
    owner: "0xe2...78c",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop&crop=center",
    priceEth: 0.055,
    description: "All-purpose AI assistant for daily tasks.",
    category: "Productivity",
    history: [{ activity: "Minted", date: "2025-08-23", priceEth: 0.05 }],
  },
];


