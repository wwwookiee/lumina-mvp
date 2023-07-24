const hre = require("hardhat");

async function main() {
    let owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, transaction;

    [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10] = await ethers.getSigners()

    const contract = await hre.ethers.getContractAt("Lumina", "0xf5b5A498032BBaDf52aFC74Dd353B1a9A9941eED");

    transaction = await contract.connect(owner).getLatestPrice()
    transaction.wait()

    console.log(transaction)

   



    // console.log(myContract)
    // let number = await myContract.connect(addr1).getNumber()
    // console.log(number.toString())

    // const Test = await ethers.getContract("Test", owner);
    // console.log(Test);
}

main()
    .then(() => process.exit(0)) 
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })