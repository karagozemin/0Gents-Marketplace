import { ethers } from "hardhat";

async function main() {
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


