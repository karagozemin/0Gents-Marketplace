const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Enhanced INFT contract...");
  const [signer] = await ethers.getSigners();
  console.log("Deployer:", await signer.getAddress());
  
  const enhancedAddress = "0x1C45f11366e5A090C493CD3cb7DaFfAf7c5E0401";
  
  try {
    const EnhancedINFT = await ethers.getContractFactory("EnhancedINFT");
    const enhancedINFT = EnhancedINFT.attach(enhancedAddress);
    
    console.log("\n📋 Enhanced INFT Contract State:");
    const creationFee = await enhancedINFT.creationFee();
    const feeRecipient = await enhancedINFT.feeRecipient();
    
    console.log("Creation Fee:", ethers.formatEther(creationFee), "OG");
    console.log("Fee Recipient:", feeRecipient);
    
    // Test if mintAgent function exists
    console.log("\n🧪 Testing contract functions...");
    
    // Check if we can call view functions
    try {
      const name = await enhancedINFT.name();
      const symbol = await enhancedINFT.symbol();
      console.log("Name:", name);
      console.log("Symbol:", symbol);
      console.log("✅ Contract is accessible and functions work");
    } catch (error) {
      console.error("❌ Contract function test failed:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Enhanced contract check failed:", error.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
