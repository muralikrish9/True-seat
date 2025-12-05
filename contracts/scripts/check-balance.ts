import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("=== Wallet Information ===");
  console.log("Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("Wallet Address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log("Balance:", balanceInEth, "ETH");
  
  if (parseFloat(balanceInEth) < 0.001) {
    console.log("\n⚠️  WARNING: Low balance! You may not have enough ETH for deployment.");
    console.log("Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
  } else {
    console.log("\n✅ Balance looks good for deployment!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

