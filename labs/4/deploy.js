const { ethers } = require("hardhat");

async function main() {
    NAME = 'MyNFT';
    SYMBOL = 'MNFT';

  const owner = await ethers.getSigners();
  console.log(`Deploying contract from: ${owner.address}`);

  const NFT = await ethers.getContractFactory('NFT');

  console.log('Deploying NFT');
  const nft = await ethers.deployContract("NFT", [
    NAME,
    SYMBOL
  ]);
  console.log(`NFT deployed on ${nft.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });