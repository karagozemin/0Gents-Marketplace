import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const OG_RPC_URL = process.env.OG_RPC_URL || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    og_galileo: {
      chainId: 16602, // Galileo testnet
      url: OG_RPC_URL || "https://evmrpc-testnet.0g.ai",
      accounts,
      gasPrice: 3000000000, // 3 gwei
      gas: 5000000,
    },
    og_mainnet: {
      chainId: 16600, // Aristotle mainnet (to be confirmed)
      url: process.env.OG_MAINNET_RPC_URL || "https://evmrpc.0g.ai",
      accounts,
      gasPrice: 3000000000, // 3 gwei
      gas: 5000000,
    },
    sepolia: {
      chainId: 11155111,
      url: SEPOLIA_RPC_URL || "",
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      // Fill when needed
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
};

export default config;


