# AgentX – Onchain AI Agent INFT Marketplace

## 1) Executive Summary

**One-line description:**
AgentX is an onchain marketplace where users can create, own, trade, rent, and use AI agents as Intelligent NFTs (INFTs). Each agent’s skills, data, and personality become a verifiable, portable asset.

**Why now:**
0G provides a modular stack across Chain, Compute, Storage, and Data Availability (DA), enabling AI agents to be verifiable, tradable, and scalable onchain.

**How we win on judging criteria:**
- **Working Demo & Functionality (30%)**: Ship a working demo every wave.
- **0G Technology Integration (30%)**: Increase integration each wave: Compute → Storage → Chain → DA → INFT → full integration.
- **Creativity & UX (15%)**: New asset class: tradable/rentable AI agents + clean UX.
- **Real Usage & Scalability (10%)**: Research, trading, gaming, support; scale via DA and marketplace mechanics.
- **Vision & Roadmap (10%)**: Clear 6-wave roadmap + post-hackathon plan.

**Target categories:**
- Dapps
- INFT
- Devtooling (contribute auxiliary tools as open source)

**Network strategy:**
- **Ethereum**: Distribution network (reach and compatibility)
- **0G Chain**: App logic (EVM-compatible)
- **0G Compute, Storage, DA**: Technical backbone

## 2) What is 0G?

- **0G Chain**: Fast, modular, EVM-compatible chain; runs AI transactions and smart contracts.
- **0G Compute**: Inference, training, and verifiable execution network for AI.
- **0G Storage**: Decentralized storage for AI datasets and models.
- **0G Data Availability (DA)**: High-throughput, real-time scaling for AI/blockchain apps.

Each service is composable or can be used independently, avoiding the cost, latency, and lock-in of centralized solutions.

**References:**
- GitHub: `https://github.com/0glabs`
- Website: `https://0g.ai/`
- Discord: `https://discord.gg/0glabs`
- X (Twitter): `https://x.com/0G_labs`
- Faucet: `https://faucet.0g.ai/`

## 3) Judging Criteria and Alignment

| Criterion | Weight | Target Score | Strategy |
| --- | --- | --- | --- |
| Working Demo & Functionality | 30% | 28–30% | Live demo + 1–2 min video each wave |
| 0G Technology Integration | 30% | 28–30% | Compute + Storage (Wave 1), Chain + INFT (Wave 2), DA (Wave 3), full (Waves 4–6) |
| Creativity & UX | 15% | 13–15% | Clean UX, innovative INFT agents, rental and revenue sharing |
| Real Usage & Scalability | 10% | 9–10% | Research, trading, gaming, support; scale with DA |
| Vision & Roadmap | 10% | 9–10% | Clear roadmap + change log + post-hackathon plan |
| Total | 100% | 87–95% | Consistent progress + full integration |

## 4) Product Scope

**Core flow:** Create → Mint (INFT) → Use → Rent / Sell.

**INFT contents:**
- Metadata (name, description, capabilities)
- Model pointer (storage reference, version)
- Skills & tools (e.g., web fetch, dataset binding)
- Access policy (owner, renter)
- Usage counters + revenue split configuration

**User journey:**
1. User creates an agent (choose base model or upload own model).
2. Add prompts and tools, save to Storage, mint INFT.
3. Another user buys or rents the agent.
4. Compute calls are metered; fees are auto-distributed onchain.

## 5) Architecture

- **Frontend (Web)**: Next.js/React, wagmi/ethers, minimal Tailwind UI
- **Smart Contracts (0G Chain, EVM)**: INFT (ERC-7857), Marketplace, Payments/Metering
- **Compute**: 0G Compute SDK (inference; fine-tuning later)
- **Storage**: 0G Storage SDK (models, datasets, config, logs)
- **DA**: Connect large datasets via 0G DA
- **Indexing**: Simple subgraph or backend indexer (optional)

## 6) Wave-by-Wave Roadmap and Targets

**Timeline:**
- **Wave 1:** Aug 15–22 → Review Aug 23–25 ($3K)
- **Wave 2:** Aug 26 – Sep 2 → Review Sep 3–5 ($5K)
- **Wave 3:** Sep 6–13 → Review Sep 14–16 ($7K)
- **Wave 4:** Sep 17–26 → Review Sep 27–30 ($9K)
- **Wave 5:** Oct 1–10 → Review Oct 11–14 ($11K)
- **Wave 6:** Oct 15–24 → Review Oct 25–28 ($13K + $2K bonus)

**Wave 1 – MVP (Compute + Storage)**
- Wallet connect + minimal chat UI
- Inference via 0G Compute
- Persist chat logs to Storage
- Optional simple contract stub
- 1–2 min demo video

**Wave 2 – INFT Mint & Transfer (Chain + INFT)**
- Mint INFTs (ERC-7857)
- Register agent with storage reference
- Ownership and transfer functions
- Simple marketplace list
- Agent settings editor (name, prompt, skills)

**Wave 3 – DA + Multi-dataset Agents**
- Upload large datasets via DA
- Show dataset parts used by agent
- Faster responses + UX polish

**Wave 4 – Tokenized Metering & Revenue Sharing**
- Pay-per-use metering
- Prepaid credit system
- Revenue sharing (creator + dataset owner + marketplace)
- Leaderboard + analytics

**Wave 5 – Full Marketplace + Verifiable Compute (start)**
- Buy, rent, trial flows
- Reputation system for agents and creators
- Verifiable compute prototype (attestation; full in Wave 6)
- SDK snippet so other dapps can call agents

**Wave 6 – Cross-Chain, Social Graph, Final Polish**
- Bridge INFTs or usage rights between 0G ↔ Ethereum
- Social features (follow, share, agent cards)
- Final pitch + roadmap + bug bash

## 7) Delivery Package Checklist

- ✅ Project name + short description
- ✅ Public GitHub repo (README + setup)
- ✅ Demo video or live link
- ✅ List of used protocols/SDKs (Chain/Compute/Storage/DA/INFT)
- ✅ Team info + contacts (TG, X)
- ✅ Wave-based change notes
- ✅ Open-source contributions/attributions
- ✅ Testnet deployments

## 8) Repository Structure

```
agentx/
  packages/
    contracts/     # Solidity – INFT, Marketplace, Payments, Metering
    webapp/        # Next.js – UI, chat, marketplace
    sdk/           # Simple client – call agents from other dapps
  ops/
    deploy/        # Hardhat/Foundry scripts
    demo/          # Demo scripts, seed data
  docs/
    README.md      # Setup, links to 0G docs
    CHANGES.md     # Wave-based changes
    ARCHITECTURE.md
    JUDGING.md     # Alignment with judging criteria
```

## 9) Technical Details

- **INFT (ERC-7857) fields:** model pointer, config, skills, revenue splits
- **Storage schemas:**
  - `/agents/{id}.json`
  - `/models/{hash}`
  - `/datasets/{id}` (versioned)
- **Compute adapter:** REST/gRPC → 0G Compute; usage receipt onchain
- **DA adapter:** Dataset registration and referencing
- **Payments:** ERC-20 credits, usage accounting, withdraw
- **Security:** Permissions & rate limits; audit checklist

## 10) KPIs

- **Wave 1:** 1 model + working demo + 1 video
- **Wave 2:** INFT mint/transfer, testnet address, second video
- **Wave 3:** ≥1 dataset integration, provenance UI
- **Wave 4:** Pay-per-use metering, revenue distribution
- **Wave 5:** ≥10 agents listed, ≥5 rentals, SDK released
- **Wave 6:** Cross-chain demo, ≥50 test runs

## 11) Risks & Mitigations

- **Model size/latency** → Start with small models, cache, async processing
- **INFT standard complexity** → Strict adherence to ERC-7857 + tests
- **DA throughput** → Pre-index datasets, pagination, streaming
- **Verifiable compute** → Start with attestations; full proofs in Wave 6

## 12) Team Structure

- **Product & PM** → Roadmap, demo orchestration
- **Smart Contract Dev** → INFT, Marketplace, Metering
- **Frontend Dev** → UI, UX, demo integration
- **AI/Compute Specialist** → 0G Compute SDK, model integration
- **DevOps & Infra** → Deployments, testnet integration
- **Comms & Community** → Demo videos, TG/X comms

## 13) Use Cases

- **Research agent** → Summarize over academic datasets
- **Trading agent** → Analyze market data and make recommendations
- **Gaming agent** → NPC or companion character
- **Support agent** → Domain-specific customer support

## 14) Vision – Post-Hackathon

- Move the marketplace to mainnet
- Productionize verifiable compute
- SDK integrations across ecosystem dapps
- DAO-based governance for INFT agents
- Multi-chain usage (Ethereum, Solana, 0G)

## 15) Success Metrics (Post-Hackathon)

- Active listed agent count
- Agent rentals/sales count
- Marketplace trading volume
- Cross-chain usage count
- Developer adoption (SDK installs & integrations)

## 16) Long-Term Opportunities

- **AI-as-a-Service market** → A SaaS-like AI agent marketplace
- **Data DAOs** → Dataset owners are incentivized via revenue sharing
- **Onchain reputation** → Performance metrics recorded onchain
- **Agent interoperability** → Agents can talk/compose with each other

## 17) Resource Needs

- 0G faucet & testnet access
- 0G Compute + Storage SDK support
- ERC-7857 documentation
- GPU compute for demos (small scale)
- TG/Discord support for team coordination

## 18) Value Add

- **For the 0G ecosystem** → Showcase: first marketplace integrating compute, storage, and DA
- **For developers** → Open-source SDKs & tools
- **For users** → New asset class: “AI agent NFT”
- **For investors** → Tokenized metering, revenue sharing, scalable business model

## 19) Roadmap (Beyond Hackathon)

- **Q4 2025** → Cross-chain support + NFT marketplace partnership
- **Q1 2026** → Production verifiable compute, first Data DAO
- **Q2 2026** → Enterprise integrations (support agents)
- **Q3 2026** → Game dev & onchain NPC ecosystem

## 20) Demo Strategy

- 2-minute video per wave
- Clear audio + screen capture + repo links
- Explicitly map to judging criteria during demo
- Share on TG + X and collect community feedback

## 21) Marketing / Distribution

- Announcements on X & Discord
- Share demos in TG communities
- Short post-demo blog (Mirror, Medium)
- 0G ecosystem partner mentions (aim for retweets)

## 22) Success Story

- First INFT agent is a “research agent” that summarizes over a paper dataset
- First buyer rents the agent for their research project
- Payments & revenue sharing execute automatically onchain
- This flow is clearly demonstrated in the demo video

## 23) Key Features

- INFT → Verifiable ownership of an AI agent
- Rental → Use rights without ownership
- Revenue sharing → Creator + dataset owners are rewarded
- Verifiable compute → Removes trust issues
- Cross-chain → Bridge between 0G and Ethereum

## 24) Extra Tools

- **Agent Cards** → Shareable agent profiles for social media
- **SDK** → Makes it easy for dapps to call agents
- **Analytics Dashboard** → Usage stats, popular agents
- **Leaderboard** → Most used / highest-earning agents

## 25) Community Involvement

- Open-source repo → Accept PRs
- Dedicated Discord channel → “AgentX Builders”
- Early access for users to upload agents
- Contests → Best agent, most creative use

## 26) Competitive Analysis

- **CharacterGPT / Alethea AI** → Single-chain, limited usage
- **Fetch.ai** → Agent economy but no NFT-based ownership
- **AgentX differentiation:**
  - INFT standard
  - Revenue sharing
  - Verifiable compute
  - Cross-chain integration

## 27) Go-to-Market / Exit Strategy

- Mainnet deploy → Partner marketplace integrations
- SDK release → Developer adoption
- Tokenized metering → Revenue model
- Data DAO collaborations → Ecosystem growth

## 28) Conclusion

AgentX uses the full 0G stack to define a new onchain asset class: INFT AI agents.

- Users create, own, rent, and trade agents.
- Creators and dataset owners receive revenue shares.
- Marketplace is secure with verifiable compute and scalable with DA.
- Cross-chain support bridges to Ethereum and other ecosystems.

👉 With the 6-wave roadmap, we deliver tangible value at every stage.
