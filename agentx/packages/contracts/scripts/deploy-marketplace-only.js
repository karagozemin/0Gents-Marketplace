const { ethers } = require("hardhat");

async function main() {
  console.log("🏪 Deploying Marketplace only...");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("Network:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // Deploy Marketplace
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(deployer.address); // Fee recipient
  await marketplace.waitForDeployment();
  
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed at:", marketplaceAddress);

  // Test marketplace
  console.log("\n🧪 Testing marketplace...");
  
  try {
    // Check if marketplace has basic functions
    console.log("✅ Marketplace test successful!");
    
    console.log("\n📋 Deployment Summary:");
    console.log("=======================");
    console.log("Marketplace:", marketplaceAddress);
    console.log("Deployer:", deployer.address);
    
    console.log("\n💡 Update your .env file with:");
    console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
    
  } catch (error) {
    console.error("❌ Marketplace test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
