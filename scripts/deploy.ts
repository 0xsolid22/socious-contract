import { ethers } from "hardhat";

async function main() {
  const KingOfTheFools = await ethers.getContractFactory("KingOfTheFools");
  const kingOfTheFools = await KingOfTheFools.deploy();

  await kingOfTheFools.deployed();

  console.log(` deployed to ${kingOfTheFools.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
