const { ethers } = require("hardhat");

async function main() {
  console.log("Start deploy (JS)");
  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const bal = await ethers.provider.getBalance(await signer.getAddress());
  console.log("Network:", network.chainId.toString());
  console.log("Deployer:", await signer.getAddress());
  console.log("Balance:", ethers.formatEther(bal), "ETH");

  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  console.log("AgentRegistry deployed at:", await agentRegistry.getAddress());

  const INFT = await ethers.getContractFactory("INFT");
  // Use deployer address as fee recipient for INFT as well
  const inftFeeRecipient = await signer.getAddress();
  const inft = await INFT.deploy(inftFeeRecipient);
  await inft.waitForDeployment();
  console.log("INFT deployed at:", await inft.getAddress());
  console.log("INFT fee recipient set to:", inftFeeRecipient);

  const Marketplace = await ethers.getContractFactory("Marketplace");
  // Use deployer address as fee recipient (you can change this to any address)
  const feeRecipient = await signer.getAddress();
  const marketplace = await Marketplace.deploy(feeRecipient);
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed at:", await marketplace.getAddress());
  console.log("Fee recipient set to:", feeRecipient);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


