const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Enhanced INFT and Marketplace...");
  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const bal = await ethers.provider.getBalance(await signer.getAddress());
  console.log("Network:", network.chainId.toString());
  console.log("Deployer:", await signer.getAddress());
  console.log("Balance:", ethers.formatEther(bal), "ETH");

  // Deploy EnhancedINFT
  console.log("\n📦 Deploying EnhancedINFT...");
  const EnhancedINFT = await ethers.getContractFactory("EnhancedINFT");
  const feeRecipient = await signer.getAddress();
  const enhancedINFT = await EnhancedINFT.deploy(feeRecipient);
  await enhancedINFT.waitForDeployment();
  
  const enhancedINFTAddress = await enhancedINFT.getAddress();
  console.log("✅ EnhancedINFT deployed at:", enhancedINFTAddress);
  console.log("Fee recipient set to:", feeRecipient);

  // Deploy Marketplace
  console.log("\n🏪 Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(feeRecipient);
  await marketplace.waitForDeployment();
  
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed at:", marketplaceAddress);
  console.log("Marketplace fee recipient set to:", feeRecipient);
  
  // Test the contracts
  console.log("\n🧪 Testing contracts...");
  try {
    // Test EnhancedINFT
    const creationFee = await enhancedINFT.creationFee();
    const recipient = await enhancedINFT.feeRecipient();
    console.log("EnhancedINFT Creation Fee:", ethers.formatEther(creationFee), "OG");
    console.log("EnhancedINFT Fee Recipient:", recipient);
    
    // Test Marketplace
    const platformFee = await marketplace.platformFeePercent();
    const marketplaceFeeRecipient = await marketplace.feeRecipient();
    console.log("Marketplace Platform Fee:", platformFee.toString(), "%");
    console.log("Marketplace Fee Recipient:", marketplaceFeeRecipient);
    
    console.log("✅ All contract tests successful!");
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
  }

  console.log("\n📋 Deployment Summary:");
  console.log("=======================");
  console.log("EnhancedINFT Address:", enhancedINFTAddress);
  console.log("Marketplace Address: ", marketplaceAddress);
  console.log("Fee Recipient:       ", feeRecipient);
  console.log("\n💡 Update your .env file with these addresses:");
  console.log(`NEXT_PUBLIC_INFT_ADDRESS=${enhancedINFTAddress}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
