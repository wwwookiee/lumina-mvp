const hre = require("hardhat");


async function main() {

  // Get signers accounts
  const [owner] = await ethers.getSigners();
  const oracle = {target: ""};

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
  const lumi = await hre.ethers.deployContract("Lumi");
  await lumi.waitForDeployment();
  console.log(
    `lumi deployed to ${lumi.target}`
  );

  // Deploy LumiSwap.sol with Lumina token address as constructor argument
  const lumiSwap = await hre.ethers.deployContract("LumiSwap",[lumi.target, oracle.target]);
  await lumiSwap.waitForDeployment();
  console.log(
    `lumiSwap deployed to ${lumiSwap.target}`
  );

  // Deploy LumiSwap.sol with Lumina token address as constructor argument
  const staking = await hre.ethers.deployContract("Staking",[lumi.target]);
  await staking.waitForDeployment();
  console.log(
    `staking deployed to ${staking.target}`
  );

  // Deploy Lumina.sol with Lumina token address as constructor argument
  const lumina = await hre.ethers.deployContract("Lumina",[lumi.target]);
  await lumina.waitForDeployment();
  console.log(
    `Lumina deployed to ${lumina.target}`
  );

  console.log("--------------------------------------------------------------------------");

  // Get the initial LUMI balances of the owner
  const balance = await lumi.balanceOf(owner.address);
  console.log("Owner balance (LUMI) : ", balance.toString());

  const contractBalance = await lumi.balanceOf(lumiSwap.target);
  console.log("LumiSwap contract balance (LUMI) : ", contractBalance.toString());

  console.log(owner.address);

  console.log("--------------------------------------------------------------------------");
  console.log("Transfering minted LUMI to LumiSwap contract");
  // Transfer all lumi from owner to the LumiSwap contract
  await lumi.approve(lumiSwap.target, balance);
  const allowance = await lumi.allowance(owner.address, lumiSwap.target);
  await lumi.transfer(lumiSwap.target, balance);
  console.log("--------------------------------------------------------------------------");

    // Get the  LUMI balances of the owner after transfer
    const newBalance = await lumi.balanceOf(owner.address.toString());
    console.log("Owner balance (LUMI) : ", newBalance);

    const newContractBalance = await lumi.balanceOf(lumiSwap.target);
    console.log("LumiSwap contract balance (LUMI) : ", newContractBalance.toString());

    console.log("--------------------------------------------------------------------------");

    const ethPrice = await lumiSwap.getETHPrice();
    console.log("ETH Price : ", ethPrice.toString());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});