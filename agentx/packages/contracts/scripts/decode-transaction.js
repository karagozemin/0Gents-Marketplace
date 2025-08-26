const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Decoding failed transaction...");
  
  // Failed transaction input data from the explorer
  const inputData = "0x184a7544000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002200000000000000000000000000000000000000000000000000010a741a46270000000000000000000000000000000000000000000000000000000000000000000000";
  
  try {
    // Get the factory ABI
    const AgentNFTFactory = await ethers.getContractFactory("AgentNFTFactory");
    const iface = AgentNFTFactory.interface;
    
    // Decode the transaction data
    const decodedData = iface.parseTransaction({ data: inputData });
    
    console.log("Function name:", decodedData.name);
    console.log("Arguments:");
    
    const args = decodedData.args;
    console.log("  agentName_:", args[0]);
    console.log("  agentDescription_:", args[1]);
    console.log("  agentCategory_:", args[2]);
    console.log("  computeModel_:", args[3]);
    console.log("  storageHash_:", args[4]);
    console.log("  capabilities_:", args[5]);
    console.log("  price_:", ethers.formatEther(args[6]), "ETH");
    
    // Check for issues
    console.log("\n🔍 Checking for issues:");
    console.log("  agentName_ empty?", args[0] === "");
    console.log("  agentDescription_ empty?", args[1] === "");
    console.log("  storageHash_ empty?", args[4] === "");
    console.log("  capabilities_ empty?", args[5].length === 0);
    console.log("  price_ is zero?", args[6] === 0n);
    
  } catch (error) {
    console.error("❌ Decode failed:", error.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
