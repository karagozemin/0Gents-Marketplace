import { ethers } from "hardhat";

async function main() {
  console.log("PING start");
  const net = await ethers.provider.getNetwork();
  const gas = await ethers.provider.getGasPrice();
  console.log("chainId:", net.chainId.toString());
  console.log("gasPrice:", gas.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


