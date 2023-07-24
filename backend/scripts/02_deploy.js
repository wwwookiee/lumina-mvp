const hre = require("hardhat");


async function main() {

  // Get signers accounts
  const [owner] = await ethers.getSigners();

  // Deploy contract Lumi.sol
  const lumi = await hre.ethers.deployContract("LuminaToken");
  await lumi.waitForDeployment();
  console.log(
    `lumi deployed to ${lumi.target}`
  );
  0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
  // Deploy Lumina.sol with Lumina token address as constructor argument
  const lumina = await hre.ethers.deployContract("Lumina", [lumi.target, "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"]);
  await lumina.waitForDeployment();
  console.log(
    `Lumina deployed to ${lumina.target}`
  );

  console.log("Transfering minted LUMI to Lumina contract");
  // Transfer all lumi from owner to the LumiSwap contract
  const balance = await lumi.balanceOf(owner.address);
  await lumi.transfer(lumina.target, balance);





}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});