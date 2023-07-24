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

  console.log("--------------------------------------------------------------------------");

  // Get the initial LUMI balances of the owner
  const balance = await lumi.balanceOf(owner.address);
  console.log("Owner balance (LUMI) : ", balance.toString());

  const contractBalance = await lumi.balanceOf(lumina.target);
  console.log("LumiSwap contract balance (LUMI) : ", contractBalance.toString());

  console.log("--------------------------------------------------------------------------");
  console.log("Transfering minted LUMI to Lumina contract");
  // Transfer all lumi from owner to the LumiSwap contract
  await lumi.transfer(lumina.target, balance);

  //await lumi.approve(lumina.target, balance);
  console.log("--------------------------------------------------------------------------");

    // Get the  LUMI balances of the owner after transfer
    const newBalance = await lumi.balanceOf(owner.address);
    console.log("Owner balance (LUMI) : ", newBalance.toString());

    const newContractBalance = await lumi.balanceOf(lumina.target);
    console.log("Lumina contract balance (LUMI) : ", newContractBalance.toString());

    console.log("--------------------------------------------------------------------------");

    const ethPrice = await lumina.getLatestPrice();
    console.log("ETH Price : ", ethPrice.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});