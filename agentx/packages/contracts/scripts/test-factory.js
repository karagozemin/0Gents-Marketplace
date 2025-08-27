const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing Factory Contract...");
  
  const factoryAddress = "0x0c7E1717656d204dE5f168a6b615664Ab5518316";
  
  // Get the Factory contract
  const Factory = await ethers.getContractFactory("AgentNFTFactory");
  const factory = Factory.attach(factoryAddress);
  
  try {
    // Test getTotalAgents
    console.log("📊 Calling getTotalAgents()...");
    const totalAgents = await factory.getTotalAgents();
    console.log("Total Agents:", totalAgents.toString());
    
    // Test creation fee
    console.log("💰 Calling creationFee()...");
    const creationFee = await factory.creationFee();
    console.log("Creation Fee:", ethers.formatEther(creationFee), "ETH");
    
    // Test marketplace
    console.log("🏪 Calling marketplace()...");
    const marketplace = await factory.marketplace();
    console.log("Marketplace:", marketplace);
    
    if (totalAgents > 0) {
      console.log("📝 Getting first agent...");
      const firstAgent = await factory.getAgentAt(0);
      console.log("First Agent:", firstAgent);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });