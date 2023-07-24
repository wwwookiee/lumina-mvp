const hre = require("hardhat");


async function main() {

  // Get signers accounts
  const [owner] = await ethers.getSigners();
  let oracle = {target: ""};

  if (hre.network.name === "localhost" || hre.network.name === "hardhat" ) {
    // Deploy contract Lumi.sol
    oracle = await hre.ethers.deployContract("MockV3Aggregator");
    await oracle.waitForDeployment();
    console.log(
      `oracle deployed to ${oracle.target}`
    );
  } else if (hre.network.name === "goerli" || hre.network.name === "mumbai" ) {
    //Goereli ETH/USD address : 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
    oracle.target = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43"
  //} else if (hre.network.name === "polygon" ) {

  } else {
    console.log("Network not supported");
  }

  // Deploy contract Lumi.sol
  const lumi = await hre.ethers.deployContract("LuminaToken");
  await lumi.waitForDeployment();
  console.log(
    `lumi deployed to ${lumi.target}`
  );

  // Deploy Lumina.sol with Lumina token address as constructor argument
  const lumina = await hre.ethers.deployContract("Lumina", [lumi.target, oracle.target]);
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