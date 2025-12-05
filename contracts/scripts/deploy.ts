import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Deploying EventTickets contract...");
  console.log("Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const EventTickets = await ethers.getContractFactory("EventTickets");
  console.log("\nDeploying contract...");
  
  const eventTickets = await EventTickets.deploy();
  const deploymentTx = eventTickets.deploymentTransaction();

  await eventTickets.waitForDeployment();

  const address = await eventTickets.getAddress();
  
  console.log("\n=== Deployment Successful ===");
  console.log("Contract address:", address);
  if (deploymentTx) {
    console.log("Transaction hash:", deploymentTx.hash);
  }
  console.log("Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("\nSave this address to your .env file as NEXT_PUBLIC_CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 