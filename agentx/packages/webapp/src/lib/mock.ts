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
  {
    id: "1",
    name: "Research Agent",
    owner: "0x8a...52a",
    image: "/next.svg",
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
    image: "/globe.svg",
    priceEth: 0.05,
    description: "Analyzes market data and suggests opportunities.",
    category: "Trading",
    history: [{ activity: "Minted", date: "2025-08-18", priceEth: 0.03 }],
  },
  {
    id: "3",
    name: "NPC Companion",
    owner: "0xa9...1788",
    image: "/window.svg",
    priceEth: 0.015,
    description: "In-game agent for storytelling and quests.",
    category: "Gaming",
    history: [{ activity: "Minted", date: "2025-08-18", priceEth: 0.015 }],
  },
];


