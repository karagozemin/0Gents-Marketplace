const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Debugging Factory transaction...");
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  console.log("Signer:", signerAddress);
  
  const factoryAddress = "0x7FC62946f03f42c721ae0237998c45b64872aD26";
  
  try {
    const AgentNFTFactory = await ethers.getContractFactory("AgentNFTFactory");
    const factory = AgentNFTFactory.attach(factoryAddress);
    
    console.log("\n📋 Factory Contract State:");
    const creationFee = await factory.creationFee();
    const marketplace = await factory.marketplace();
    const owner = await factory.owner();
    
    console.log("Creation Fee:", ethers.formatEther(creationFee), "OG");
    console.log("Marketplace:", marketplace);
    console.log("Factory Owner:", owner);
    console.log("Signer Address:", signerAddress);
    console.log("Is signer owner?", owner.toLowerCase() === signerAddress.toLowerCase());
    
    // Try actual createAgent call
    console.log("\n🧪 Attempting actual createAgent call...");
    
    const testArgs = [
      "Test Agent",           // agentName_
      "Test Description",     // agentDescription_
      "General",             // agentCategory_
      "gpt-4",              // computeModel_
      "test-hash",          // storageHash_
      ["AI", "Test"],       // capabilities_
      ethers.parseEther("0.075") // price_
    ];
    
    console.log("Calling createAgent with args:", testArgs);
    console.log("Value:", ethers.formatEther(ethers.parseEther("0.01")), "OG");
    
    const tx = await factory.createAgent(
      ...testArgs,
      { 
        value: ethers.parseEther("0.01"),
        gasLimit: 3000000
      }
    );
    
    console.log("Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction successful!");
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Check events
    const events = receipt.logs;
    console.log("Events:", events.length);
    
    for (let i = 0; i < events.length; i++) {
      try {
        const parsed = factory.interface.parseLog(events[i]);
        console.log(`Event ${i}:`, parsed.name, parsed.args);
      } catch (e) {
        console.log(`Event ${i}: Unparsed event`);
      }
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
    if (error.reason) {
      console.error("Reason:", error.reason);
    }
    if (error.data) {
      console.error("Data:", error.data);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
