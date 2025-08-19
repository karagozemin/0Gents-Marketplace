import { ethers } from "hardhat";

async function main() {
  console.log("Start deploy script");
  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const bal = await ethers.provider.getBalance(await signer.getAddress());
  console.log("Network:", network.chainId.toString());
  console.log("Deployer:", await signer.getAddress());
  console.log("Balance:", ethers.formatEther(bal), "ETH");

  const agentRegistry = await (await ethers.getContractFactory("AgentRegistry")).deploy();
  await agentRegistry.waitForDeployment();
  console.log("AgentRegistry deployed at:", await agentRegistry.getAddress());

  const inft = await (await ethers.getContractFactory("INFT")).deploy();
  await inft.waitForDeployment();
  console.log("INFT deployed at:", await inft.getAddress());

  const marketplace = await (await ethers.getContractFactory("Marketplace")).deploy();
  await marketplace.waitForDeployment();
  console.log("Marketplace deployed at:", await marketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


