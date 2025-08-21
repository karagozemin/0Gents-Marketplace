const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking deployed contract state...");
  
  const [signer] = await ethers.getSigners();
  console.log("Deployer:", await signer.getAddress());
  
  const inftAddress = "0xE272083c61965B70892CcF1A664D7c2C219A5ee3";
  const marketplaceAddress = "0x0a3874E432F8Ab6B2b8f595b921E1C5ea32C5060";
  
  // Check INFT contract
  console.log("\n📋 INFT Contract State:");
  const INFT = await ethers.getContractFactory("INFT");
  const inft = INFT.attach(inftAddress);
  
  try {
    const creationFee = await inft.creationFee();
    const feeRecipient = await inft.feeRecipient();
    const owner = await inft.owner();
    
    console.log("Creation Fee:", ethers.formatEther(creationFee), "OG");
    console.log("Fee Recipient:", feeRecipient);
    console.log("Owner:", owner);
  } catch (error) {
    console.error("Error reading INFT contract:", error.message);
  }
  
  // Check Marketplace contract
  console.log("\n🏪 Marketplace Contract State:");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = Marketplace.attach(marketplaceAddress);
  
  try {
    const platformFeePercent = await marketplace.platformFeePercent();
    const feeRecipient = await marketplace.feeRecipient();
    const owner = await marketplace.owner();
    
    console.log("Platform Fee Percent:", platformFeePercent.toString(), "basis points");
    console.log("Fee Recipient:", feeRecipient);
    console.log("Owner:", owner);
  } catch (error) {
    console.error("Error reading Marketplace contract:", error.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
