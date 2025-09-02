# 🤖 0Gents - AI Agent INFT Marketplace

> **Decentralized marketplace for AI-powered Intelligent NFTs built on 0G Network**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://0-gents-marketplace.vercel.app)
[![Wave 2 Demo](https://img.shields.io/badge/Wave_2-Demo-red?style=for-the-badge)](https://youtu.be/rReR3pXp8No)
[![Wave 1 Demo](https://img.shields.io/badge/Wave_1-Demo-orange?style=for-the-badge)](https://youtu.be/Q8J8AylG4uA)
[![0G Network](https://img.shields.io/badge/Built_on-0G_Network-purple?style=for-the-badge)](https://0g.ai)

## 🌟 Overview

0Gents is a cutting-edge decentralized marketplace where users can create, trade, and interact with AI-powered Intelligent NFTs (INFTs). Built on the revolutionary 0G Network, it combines the power of AI agents with blockchain technology to create truly intelligent digital assets.

### ✨ Key Features

- 🎨 **Create AI Agent INFTs** - Mint intelligent NFTs with unique AI personalities
- 💬 **Interactive AI Chat** - Powered by 0G Compute for real-time conversations
- 🛒 **Decentralized Marketplace** - Buy, sell, and trade AI agents seamlessly
- 🔗 **0G Network Integration** - Leveraging 0G Storage, Chain, and Compute
- 💰 **Auto-Listing** - Automatic marketplace listing upon creation
- 🌐 **Cross-Browser Compatibility** - Global agent visibility across devices

## 🏗️ Architecture

### 0G Network Integration

- **0G Storage** - Decentralized metadata storage for AI agent data
- **0G Chain** - EVM-compatible blockchain for INFT minting and transactions
- **0G Compute** - AI inference network for agent interactions
- **0G DA** - High-throughput data availability layer

### Smart Contracts

- **INFT Contract** - ERC-721 based intelligent NFTs with creation fees
- **Marketplace Contract** - Decentralized trading with platform fees
- **Agent Registry** - Central registry for AI agent metadata

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/karagozemin/0Gents-Marketplace.git
cd 0Gents-Marketplace

# Install dependencies
cd agentx/packages/webapp
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Configuration

### Environment Variables

```env
# Wallet Connect
NEXT_PUBLIC_WC_PROJECT_ID=your_wallet_connect_project_id

# 0G Network Configuration
NEXT_PUBLIC_CHAIN_ID=16601
NEXT_PUBLIC_0G_RPC_URL=https://your-0g-rpc-url
NEXT_PUBLIC_0G_EXPLORER=https://chainscan-galileo.0g.ai

# Contract Addresses
NEXT_PUBLIC_INFT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...

# 0G Storage Contracts
NEXT_PUBLIC_0G_STORAGE_FLOW=0x...
NEXT_PUBLIC_0G_STORAGE_MINE=0x...
NEXT_PUBLIC_0G_STORAGE_MARKET=0x...
NEXT_PUBLIC_0G_STORAGE_REWARD=0x...

# 0G DA Contract
NEXT_PUBLIC_0G_DA_ENTRANCE=0x...
```

## 💡 How It Works

### 1. Create AI Agent INFT
1. Fill in agent details (name, description, category, price)
2. Add optional social links (X, Website)
3. Pay 0.005 OG creation fee
4. Metadata uploaded to 0G Storage
5. INFT minted on 0G Chain
6. Automatically listed on marketplace

### 2. Interact with AI Agents
- Chat with any AI agent using 0G Compute
- Each agent has unique personality and capabilities
- Real-time conversations with persistent context

### 3. Trade on Marketplace
- Browse featured agents and collections
- Filter by category, price, and creator
- Buy agents with 10% platform fee (90% to creator)
- Manage your collection in "My Collections"

## 💰 Fee Structure

| Operation | Fee | Recipient |
|-----------|-----|-----------|
| Creation Fee | 0.005 OG | Platform Wallet |
| Platform Fee | 10% of sale | Platform Wallet |
| Creator Earnings | 90% of sale | Original Creator |
| Network Fees | ~0.001 OG | 0G Network |

*All fees are configurable by administrators*

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Wagmi** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI

### Blockchain
- **0G Network** - Layer 1 blockchain
- **Solidity** - Smart contract development
- **Hardhat** - Development framework
- **OpenZeppelin** - Security standards

### AI & Storage
- **0G Compute** - Decentralized AI inference
- **0G Storage** - IPFS-like decentralized storage
- **0G DA** - Data availability layer

## 📁 Project Structure

```
0Gents/
├── agentx/packages/
│   ├── contracts/          # Smart contracts
│   │   ├── contracts/      # Solidity files
│   │   ├── scripts/        # Deployment scripts
│   │   └── artifacts/      # Compiled contracts
│   ├── webapp/             # Next.js frontend
│   │   ├── src/app/        # App Router pages
│   │   ├── src/components/ # React components
│   │   ├── src/lib/        # Utilities & integrations
│   │   └── public/         # Static assets
│   └── sdk/                # 0G SDK integrations
└── docs/                   # Documentation
```

## 🚧 Roadmap

### ✅ Wave 2 (Completed)
- [x] **Real Buy Functionality** - Complete blockchain-based purchase system with MetaMask integration
- [x] **Unified Agent System** - Centralized agent management for cross-user visibility
- [x] **Auto-Listing** - Automatic marketplace listing during NFT creation process
- [x] **Celebration Animation** - Success animations and modals for completed purchases
- [x] **Cross-User Visibility** - All users can see and purchase each other's created NFTs
- [x] **RPC Consistency** - Unified RPC endpoint usage for create and buy operations
- [x] **Real Validation** - Blockchain-based listing verification before purchase attempts
- [x] **Enhanced Error Handling** - User-friendly error messages for all transaction states

### Wave 3 (Advanced Features)
- [ ] Advanced marketplace filters and search
- [ ] Analytics dashboard for creators
- [ ] Mobile app development
- [ ] Multi-language support

### Wave 4 (Ecosystem Expansion)
- [ ] Cross-chain bridge integration
- [ ] Gaming SDK for AI agents
- [ ] Enterprise white-label solutions
- [ ] DAO governance implementation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🔗 Links

- **Live Demo**: https://0-gents-marketplace.vercel.app
- **Wave 2 Demo**: https://youtu.be/rReR3pXp8No
- **Wave 1 Demo**: https://youtu.be/Q8J8AylG4uA
- **0G Network**: https://0g.ai
- **Documentation**: [/docs](./docs)
- **GitHub**: https://github.com/karagozemin/0Gents-Marketplace
- **Twitter**: [@kaptan_web3](https://x.com/kaptan_web3)

## 🏆 Acknowledgments

- 0G Labs team for the revolutionary infrastructure
- OpenZeppelin for security standards
- The amazing Web3 and AI communities

---

**Built with ❤️ for the 0G Network ecosystem**

*Empowering the future of AI-powered digital assets*
