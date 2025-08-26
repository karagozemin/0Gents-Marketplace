const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing Factory contract...");
  const [signer] = await ethers.getSigners();
  console.log("Deployer:", await signer.getAddress());
  
  const factoryAddress = "0x7FC62946f03f42c721ae0237998c45b64872aD26";
  
  try {
    const AgentNFTFactory = await ethers.getContractFactory("AgentNFTFactory");
    const factory = AgentNFTFactory.attach(factoryAddress);
    
    console.log("\n📋 Factory Contract State:");
    const creationFee = await factory.creationFee();
    const marketplace = await factory.marketplace();
    const totalAgents = await factory.getTotalAgents();
    
    console.log("Creation Fee:", ethers.formatEther(creationFee), "OG");
    console.log("Marketplace:", marketplace);
    console.log("Total Agents:", totalAgents.toString());
    
    // Test createAgent function call (simulate)
    console.log("\n🧪 Testing createAgent function...");
    
    const testArgs = [
      "Test Agent",           // agentName_
      "Test Description",     // agentDescription_
      "General",             // agentCategory_
      "gpt-4",              // computeModel_
      "test-hash",          // storageHash_
      ["AI", "Test"],       // capabilities_
      ethers.parseEther("0.075") // price_
    ];
    
    console.log("Test args:", testArgs);
    
    // Try to estimate gas
    try {
      const gasEstimate = await factory.createAgent.estimateGas(
        ...testArgs,
        { value: ethers.parseEther("0.01") }
      );
      console.log("Gas estimate:", gasEstimate.toString());
    } catch (gasError) {
      console.error("❌ Gas estimation failed:", gasError.message);
      
      // Try with different args
      console.log("\n🔄 Trying with minimal args...");
      const minimalArgs = [
        "A",                   // agentName_
        "B",                   // agentDescription_
        "C",                   // agentCategory_
        "D",                   // computeModel_
        "E",                   // storageHash_
        ["F"],                 // capabilities_
        ethers.parseEther("0.01") // price_
      ];
      
      try {
        const minimalGas = await factory.createAgent.estimateGas(
          ...minimalArgs,
          { value: ethers.parseEther("0.01") }
        );
        console.log("Minimal gas estimate:", minimalGas.toString());
      } catch (minimalError) {
        console.error("❌ Even minimal args failed:", minimalError.message);
      }
    }
    
    console.log("✅ Factory is accessible");
  } catch (error) {
    console.error("❌ Factory test failed:", error.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
