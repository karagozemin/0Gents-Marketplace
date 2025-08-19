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
  const inft = await INFT.deploy();
  await inft.waitForDeployment();
  console.log("INFT deployed at:", await inft.getAddress());

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed at:", await marketplace.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


