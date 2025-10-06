const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying to new Galileo testnet (16602)...");
  
  // Direct connection to 0G RPC
  const RPC_URL = process.env.OG_RPC_URL || "https://evmrpc-testnet.0g.ai";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in .env");
  }
  
  console.log("🔗 Connecting to:", RPC_URL);
  
  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  // Get network info
  const network = await provider.getNetwork();
  const balance = await provider.getBalance(signer.address);
  
  console.log("Network Chain ID:", network.chainId.toString());
  console.log("Deployer:", signer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  
  // Load compiled contracts
  const marketplaceArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/Marketplace.sol/Marketplace.json', 'utf8'));
  const factoryArtifact = JSON.parse(fs.readFileSync('./artifacts/contracts/AgentNFTFactory.sol/AgentNFTFactory.json', 'utf8'));
  
  console.log("\n🏪 Deploying Marketplace...");
  
  // Deploy Marketplace
  const MarketplaceFactory = new ethers.ContractFactory(
    marketplaceArtifact.abi, 
    marketplaceArtifact.bytecode, 
    signer
  );
  
  const marketplace = await MarketplaceFactory.deploy(signer.address, {
    gasPrice: ethers.parseUnits("3", "gwei"),
    gasLimit: 3000000
  });
  
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed at:", marketplaceAddress);
  
  console.log("\n🏭 Deploying AgentNFTFactory...");
  
  // Deploy Factory
  const FactoryFactory = new ethers.ContractFactory(
    factoryArtifact.abi,
    factoryArtifact.bytecode, 
    signer
  );
  
  const factory = await FactoryFactory.deploy(marketplaceAddress, {
    gasPrice: ethers.parseUnits("2", "gwei"),
    gasLimit: 2500000
  });
  
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ AgentNFTFactory deployed at:", factoryAddress);
  
  // Test the contracts
  console.log("\n🧪 Testing contracts...");
  try {
    const creationFee = await factory.creationFee();
    const totalAgents = await factory.getTotalAgents();
    
    console.log("Factory Creation Fee:", ethers.formatEther(creationFee), "ETH");
    console.log("Total Agents:", totalAgents.toString());
    console.log("✅ Contracts working!");
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
  }
  
  console.log("\n📋 Deployment Summary:");
  console.log("=======================");
  console.log("Network Chain ID:        ", network.chainId.toString());
  console.log("AgentNFTFactory:         ", factoryAddress);
  console.log("Marketplace:             ", marketplaceAddress);
  console.log("Deployer:                ", signer.address);
  
  console.log("\n💡 Update your contracts.ts with:");
  console.log(`export const FACTORY_ADDRESS = "${factoryAddress}";`);
  console.log(`export const MARKETPLACE_ADDRESS = "${marketplaceAddress}";`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
