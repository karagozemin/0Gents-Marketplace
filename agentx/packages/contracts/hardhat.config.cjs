const path = require("path");
// Load .env located at agentx/.env (one level up from packages)
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("@nomicfoundation/hardhat-toolbox");

const OG_RPC_URL = process.env.OG_RPC_URL || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    og_galileo: {
      chainId: 16601,
      url: OG_RPC_URL || "http://127.0.0.1:8545",
      accounts,
      timeout: 120000,
    },
    sepolia: {
      chainId: 11155111,
      url: SEPOLIA_RPC_URL || "",
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
  },
};

module.exports = config;


