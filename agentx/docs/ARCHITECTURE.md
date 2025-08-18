# Architecture

## Overview
AgentX is an onchain marketplace where users can create, own, trade, rent, and use AI agents as INFTs (Intelligent NFTs). It is built on 0G's modular stack: Chain, Compute, Storage, and Data Availability (DA).

## Components
- Frontend (Web): Next.js/React, wagmi/ethers, minimal Tailwind UI
- Smart Contracts (0G Chain, EVM): INFT (ERC-7857), Marketplace, Payments/Metering
- Compute: 0G Compute SDK (inference; fine-tuning in later waves)
- Storage: 0G Storage SDK (models, datasets, configuration, logs)
- DA: Connect large datasets via 0G Data Availability
- Indexing: Simple subgraph or backend indexer (optional)

## Data Model
- INFT (ERC-7857) fields: model pointer, config, skills, revenue splits, access policy, usage counters
- Storage schemas:
  - `/agents/{id}.json`
  - `/models/{hash}`
  - `/datasets/{id}` (versioned)

## Core Flow
Create → Mint (INFT) → Use → Rent / Sell. Compute calls are metered and fees are distributed onchain automatically.

## Security & Trust
- Permissions & rate limiting
- Usage accounting and withdrawals
- Verifiable compute: start with attestations; move to proofs in later waves
