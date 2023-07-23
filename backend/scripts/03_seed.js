const hre = require("hardhat");

async function main() {
    let owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10, transaction;

    [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8, addr9, addr10] = await ethers.getSigners()

    const contract = await hre.ethers.getContractAt("Lumina", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    const token = await hre.ethers.getContractAt("LuminaToken", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");


    console.log("1. Registering contributors")
    transaction = await contract.connect(addr4).contributorApplication("Biology", "https://www.linkedin.com/in/jordandivita/")
    transaction.wait()
    transaction = await contract.connect(addr5).contributorApplication("Sociology", "https://www.linkedin.com/in/jordandivita/")
    transaction.wait()
    transaction = await contract.connect(addr6).contributorApplication("Physics", "https://www.linkedin.com/in/jordandivita/")
    transaction.wait()



    console.log("2. founding accounts for researches deposits & give allowances to contract")

    transaction = await contract.connect(addr7).swap({value: ethers.parseEther("1")})
    transaction.wait()
    transaction = await token.connect(addr7).approve(contract.target, ethers.parseEther("2000").toString())
    transaction.wait()
    transaction = await contract.connect(addr8).swap({value: ethers.parseEther("1")})
    transaction.wait()
    transaction = await token.connect(addr8).approve(contract.target, ethers.parseEther("2000").toString())
    transaction.wait()
    transaction = await contract.connect(addr9).swap({value: ethers.parseEther("1")})
    transaction.wait()
    transaction = await token.connect(addr9).approve(contract.target, ethers.parseEther("2000").toString())
    transaction.wait()



    console.log("3. Creating researches")
    transaction = await contract.connect(addr7).addResearch( "Research 1", ethers.parseEther("100"))
    transaction.wait()
    transaction = await contract.connect(addr8).addResearch("Sociology", "Research 2", ethers.parseEther("500"))
    transaction.wait()
    transaction = await contract.connect(addr9).addResearch("Physics", "Research 3", ethers.parseEther("200"))
    transaction.wait()




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