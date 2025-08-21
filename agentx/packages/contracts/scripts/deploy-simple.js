const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleINFT contract...");
  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const bal = await ethers.provider.getBalance(await signer.getAddress());
  console.log("Network:", network.chainId.toString());
  console.log("Deployer:", await signer.getAddress());
  console.log("Balance:", ethers.formatEther(bal), "ETH");

  // Deploy SimpleINFT
  const SimpleINFT = await ethers.getContractFactory("SimpleINFT");
  const feeRecipient = await signer.getAddress();
  const simpleINFT = await SimpleINFT.deploy(feeRecipient);
  await simpleINFT.waitForDeployment();
  
  const simpleINFTAddress = await simpleINFT.getAddress();
  console.log("SimpleINFT deployed at:", simpleINFTAddress);
  console.log("Fee recipient set to:", feeRecipient);
  
  // Test the contract
  console.log("\n🧪 Testing contract...");
  try {
    const creationFee = await simpleINFT.creationFee();
    const recipient = await simpleINFT.feeRecipient();
    console.log("Creation Fee:", ethers.formatEther(creationFee), "OG");
    console.log("Fee Recipient:", recipient);
    console.log("✅ Contract test successful!");
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
