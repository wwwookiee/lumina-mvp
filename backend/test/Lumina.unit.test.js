const { ethers } = require('hardhat');
const { expect } = require('chai');

/**
 * @dev Unit testing for Lumina DAPP. This test intends to test the following contracts:
 *        - Lumi.sol      : Lumina ERC20 token contract (LUMI)
 *        - LumiSwap.sol  : This contract allows to swap ETH for LUMI.
 *        - Lumina.sol    : This contract holds the logic and functions used within the DAPP (Publications, contributors, etc.)
 *        - Staking.sol   : This contract allows to stake LUMI & ETH and earn rewards(LUMI).
 *
 *       The idea behind this file is to test the differents paths of the DAPP:
 *         - Contributor application
 *         - Research deposit & publication
 *         - Swap ETH for LUMI
 *         - Staking/unlumina ETH & LUMI
 *         - Read published researches
 *
 *      The contracts were developed using TDD (Test Driven Development) approach.
 */

// Global context for the tests
context("Test Lumi.sol contracts & contracts using the Lumina Token", function () {

    const   totalSupply = "115792089237316195423570985008687907853269984665640564039457584007913129639935",
    lumiToUsd = "1",
    ethPrice = "2000",
    amountLumi = ethers.parseEther("50"),
    amountEth = ethers.parseEther("1");

    let balance;

    beforeEach(async function() {
        // Get signers accounts
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
        // Deploy contract Lumi.sol
        let lumiContract = await ethers.getContractFactory("LuminaToken");
        lumi = await lumiContract.deploy();
    
        let mockContract = await ethers.getContractFactory("MockV3Aggregator");
        mock = await mockContract.deploy();
    
        let luminaContract = await ethers.getContractFactory("Lumina");
        lumina = await luminaContract.deploy(lumi.target, mock.target);
    
        // Transfer all lumi from owner to the LumiSwap contract
        await lumi.transfer(lumina.target, BigInt(totalSupply));
    });


    context ("Test on token", function () {

        it("Should return the correct name and symbol", async function () {
            expect(await lumi.name()).to.equal("Lumina");
            expect(await lumi.symbol()).to.equal("LUMI");
        });

        it("Should return the correct total supply", async function () {
            expect(await lumi.totalSupply()).to.equal(BigInt(totalSupply));
        });

        it("Should return the correct balance of the owner", async function () {
            expect(await lumi.balanceOf(owner.address)).to.be.equal(0);
        });
    });

    describe("Test swap part (swap ETH to LUMI)", function () {

        context("Check balances", function () {

            it("Should return the correct LUMI balance of the LumiSwap contract", async function () {
                expect(await lumi.balanceOf(lumina.target)).to.be.equal(BigInt(totalSupply));
            });

            it("Should return the correct owner balance of the LumiSwap contract", async function () {
                expect(await lumi.balanceOf(owner.address)).to.be.equal(0);
            });
        });

        describe("Test getContractBalances function (at init)", function () {

            it("Should return the correct balance (LUMI and ETH) of the LumiSwap contract ", async function () {
                expect(await lumina.getContractBalances()).to.deep.equal([BigInt("0"),BigInt(totalSupply)]);
            });
        });

        describe("Test getLatestPrice() function ", function () {

            it("Should return the correct ETH rate in USD", async function () {
                expect(await lumina.getLatestPrice()).to.be.equal(ethPrice);
            });
        });

        describe("Test convertEthToLumi() function ", function () {

            it("should revert if the amount of ETH is 0", async function () {
                await expect(lumina.convertETHToLumi(0)).to.be.revertedWith("You can only convert more than 0 ETH");
            });

            it("Should have the same value for _EthInUsd and getLatestPrice()", async function () {
                const ethInUsd = await lumina.getLatestPrice();
                expect(await lumina.getLatestPrice()).to.be.equal(BigInt(ethInUsd));
            });

            it("Should return the correct amount of LUMI", async function () {
                const ethInUsd = await lumina.getLatestPrice();
                const amountEth = ethers.parseEther("1") // Set the amount of ETH to swap
                const amountLumi = (amountEth * ethInUsd) / BigInt(lumiToUsd);
                expect(await lumina.convertETHToLumi(amountEth)).to.be.equal(amountLumi);
            });
        });

        describe("Test swap() function ", function () {
            it("Should revert if the amount of ETH is 0", async function () {
                await expect(lumina.swap({ value: 0 })).to.be.revertedWith("You can't swap 0 ETH");
            });

            it("Shouldn't revert if contract isn't locked", async function () {
                await expect(lumina.swap({ value: ethers.parseEther("1") })).to.not.be.revertedWith("Contract is locked");
            });

            it("Should transfer to the sender the correct amount of LUMI", async function () {
                const amountEth = ethers.parseEther("1");
                const amountLumi = await lumina.convertETHToLumi(amountEth);
                await lumina.swap({ value: amountEth });
                expect(await lumi.balanceOf(owner.address)).to.be.equal(amountLumi);
            });

            it("Should swap ETH for LUMI", async function () {
                const amountEth = ethers.parseEther("0.02345"); // Set the amount of ETH to swap
                await lumina.swap({ value: amountEth });
                const lumiToUsd = await lumina.getLatestPrice();
                const lumiBalanceExpected = amountEth * BigInt(lumiToUsd);
                const lumiBalance = await lumi.balanceOf(owner.address);
                expect(lumiBalance).to.be.equal(lumiBalanceExpected);
            });

            it("Should emit the lumina event", async function () {
                const amountEth = ethers.parseEther("1");
                await expect(lumina.swap({ value: amountEth }))
                .to.emit(lumina, "Swap")
                .withArgs(owner.address, amountEth, await lumina.convertETHToLumi(amountEth));
            });
        });

        describe("Test transferEthToOwner() function ", function () {

            it("Should revert if function isn't call by the owner", async function () {
                await expect(lumina.connect(addr1).transferEthToOwner()).to.be.revertedWith('Ownable: caller is not the owner');
            });

            it("Shouldn't revert if function call by the owner", async function () {
                await expect(lumina.connect(owner).transferEthToOwner()).to.be.not.revertedWith('Ownable: caller is not the owner');
            });

            it("Should revert if contract balance equal to 0 ETH", async function () {
                await expect(lumina.transferEthToOwner()).to.be.revertedWith("Contract has no ETH to transfer");
            });

            it("Should transfer the ETH from the contract to the contract's owner ", async function () {
                await owner.sendTransaction({
                    to: lumina.target,
                    value: ethers.parseEther("10"),
                });
                balance = await ethers.provider.getBalance(lumina.target);
                expect (await lumina.transferEthToOwner())
                .to.changeEtherBalance(owner, balance)
                .and.changeEtherBalance(lumina, ethers.parseEther("0"));
            });

        });

        describe ("Test receive function", function () {

            it("Should recieve ethers", async function () {
                expect (await owner.sendTransaction({
                    to: lumina.target,
                    value: ethers.parseEther("0.5"),
                })).to.changeEtherBalance(lumina, ethers.parseEther("0.5"));
            });

            it("Should swap ETH for LUMI", async function () {
                const amountEth = ethers.parseEther("0.02345"); // Set the amount of ETH to swap
                await lumina.swap({ value: amountEth });
                const lumiToUsd = await lumina.getLatestPrice();
                const lumiBalanceExpected = amountEth * BigInt(lumiToUsd);
                const lumiBalance = await lumi.balanceOf(owner.address);
                expect(lumiBalance).to.be.equal(lumiBalanceExpected);
            });
        });

        describe("Test the fallback function", function () {
            it("Should revert if the fallback function is called", async function () {
                await expect(lumina.fallback({})).to.be.reverted;
            });
        });
    });

    describe("Test Staking part", function () {


        describe("Test the getLatestPrice() function", function () {
            it("Should return the correct ETH rate in USD", async function () {
                expect(await lumina.getLatestPrice()).to.be.equal(ethPrice);
            });
        });

        describe("Test the getStakingBalance function", function () {
            it("Should return the correct lumina balance of an address", async function () {
                await lumina.swap({ value: amountEth });
                await lumi.approve(lumina.target, amountLumi);
                await lumina.stake(amountLumi, { value : amountEth });
                const luminaData = await lumina.getStakingData(owner.address);
                expect(luminaData.amountEth).to.be.equal(amountEth);
                expect(luminaData.amountLumi).to.be.equal(amountLumi);
            });

        });

        describe("Test the stake function", function () {

            context("No lumina seeded", function () {

                beforeEach(async function() {
                    lumina = await lumina.connect(addr2);
                });

                it("Should revert if the _amount (LUMI) is 0", async function () {
                    await expect(lumina.stake(0, { value: ethers.parseEther("1") })).to.be.revertedWith("You can only stake more than 0 LUMI");
                });

                it("Should revert if the amount of ETH is 0", async function () {
                    await expect(lumina.stake(ethers.parseEther("1"), { value: 0 })).to.be.revertedWith("You can only stake more than 0 ETH");
                });

                it("Should revert if the amount of LUMI is higher than the balance of the sender", async function () {
                    await expect(lumina.stake(ethers.parseEther("1"), {value : ethers.parseEther("1")}) ).to.be.revertedWith("You can't stake more LUMI than you have");
                });
            });

            context ("Staking seeded", function () {
                beforeEach(async function() {
                    lumina = await lumina.connect(addr3);
                    await lumina.swap({ value: ethers.parseEther("1") });
                    await lumi.connect(addr3).approve(lumina.target, ethers.parseEther("2000"));
                    let allowance = await lumi.allowance(addr3.address, lumina.target);
                    await lumina.stake(ethers.parseEther("25"), { value : ethers.parseEther("1") });
                });

                it("Should revert if the sender is already staking", async function () {
                    await expect(lumina.stake(ethers.parseEther("25"), { value: ethers.parseEther("1") })).to.be.revertedWith("You are already staking");
                });

                it("Should transfer ETH and LUMI from the sender to the contract", async function () {
                    const luminaData = await lumina.getStakingData(addr3.address);
                    expect(luminaData.amountEth).to.be.equal(ethers.parseEther("1"));
                    expect(luminaData.amountLumi).to.be.equal(ethers.parseEther("25"));
                });

                it("Should save the block timestamp in stakingData", async function () {
                    const blockNumber = await ethers.provider.getBlockNumber();  // Get the latest block number
                    const block = await ethers.provider.getBlock(blockNumber); // Get the latest block information
                    const timestamp = block.timestamp;
                    const luminaData = await lumina.getStakingData(addr3.address);
                    expect(luminaData.timestamp).to.be.equal(timestamp);
                });

                it("Should have the right contract's balance for ETH", async function () {
                    const balance = await ethers.provider.getBalance(lumina.target);
                    expect(balance).to.be.equal(ethers.parseEther("2"));
                });

                it("Should store the right amount of ETH", async function () {
                    const luminaData = await lumina.getStakingData(addr3.address);
                    expect(luminaData.amountEth).to.be.equal(amountEth);
                });

                it("Should store the right amount of LUMI", async function () {
                    const luminaData = await lumina.getStakingData(addr3.address);
                    expect(luminaData.amountLumi).to.be.equal(ethers.parseEther("25"));
                });

                it("Should store the right Price for ETH", async function () {
                    const luminaData = await lumina.getStakingData(addr3.address);
                    expect(luminaData.ethPrice).to.be.equal(ethPrice);
                });

                it("Should set the isStaking to true", async function () {
                    const luminaData = await lumina.getStakingData(addr3.address);
                    expect(luminaData.isStaking).to.be.true;
                });
            });
        });

        describe("Test the unstake function", function () {

            beforeEach(async function() {
                await lumina.swap({ value: ethers.parseEther("10") });
                await lumi.approve(lumina.target, ethers.parseEther("1000"));
            });

            context("No lumina seeded", function () {
                it("Should revert if the sender isn't staking", async function () {
                    await expect(lumina.unstake()).to.be.revertedWith("You are not staking");
                });

                it("should transfer ETH to the sender", async function (){

                    const balanceBefore = await ethers.provider.getBalance(owner.address);
                    await lumina.stake(amountLumi, { value: ethers.parseEther("10")  });
                    await lumina.unstake();
                    const balanceAfter = await ethers.provider.getBalance(owner.address);
                    expect(balanceBefore).to.be.closeTo(balanceAfter, ethers.parseEther("0.001"));
                });

                it("Should transfer LUMI to the sender", async function () {
                    const balanceBefore = await lumi.balanceOf(owner.address);
                    await lumina.stake(ethers.parseEther("500"), { value: ethers.parseEther("0.5") });
                    await lumina.unstake();
                    const balanceAfter = await lumi.balanceOf(owner.address);
                    expect(balanceAfter).to.be.equal(balanceBefore);
                });

                it("Should calculate the rewards", async function () {
                    const BlockNumberBefore = await ethers.provider.getBlockNumber();
                    const BlockBefore = await ethers.provider.getBlock(BlockNumberBefore);
                    const TimestampBefore = BlockBefore.timestamp;
                    const balanceBefore = await lumi.balanceOf(owner.address);
                    await lumina.stake(ethers.parseEther("500"), { value: ethers.parseEther("0.5") });

                    // Wait for some time (e.g., 1 day)
                    await ethers.provider.send("evm_increaseTime", [86400]);
                    await ethers.provider.send("evm_mine");

                    const BlockNumberAfter = await ethers.provider.getBlockNumber();
                    const BlockAfter = await ethers.provider.getBlock(BlockNumberAfter);
                    const TimestampAfter = BlockAfter.timestamp;
                    //const BlockDiff = BlockNumberAfter - BlockNumberBefore;
                    const TimestampDiff = TimestampAfter - TimestampBefore;

                    const luminaData = await lumina.getStakingData(owner.address);
                    const stakeAmount = luminaData.amountLumi + luminaData.amountEth * luminaData.ethPrice;
                    const rewardPerYear = stakeAmount * BigInt(15) / BigInt(100);
                    const rewardPerSecond = Number(rewardPerYear) / 31536000;
                    const reward = BigInt(Math.floor(rewardPerSecond * TimestampDiff));

                    // Define the acceptable range for the difference in reward calculation
                    const acceptableRange = ethers.parseEther("1");

                    await lumina.unstake();

                    let expectedReward = await lumina.getStakingData(owner.address);
                    expectedReward = BigInt(expectedReward.reward);

                    //const BlockTime = TimestampDiff / BlockDiff;

                    const balanceAfter = await lumi.balanceOf(owner.address);

                    // Assert that the calculated reward is within the acceptable range of the stored reward
                    expect(reward).to.be.closeTo(expectedReward, acceptableRange);
                   expect(balanceBefore + reward).to.be.closeTo(balanceAfter, acceptableRange);
                });
            });

            context("Staking seeded", function () {

                beforeEach(async function() {
                    await lumina.stake(ethers.parseEther("500"), { value: ethers.parseEther("0.5") });
                    await lumina.unstake();
                });

                it("Should set the isStaking to false", async function () {
                    const luminaData = await lumina.getStakingData(owner.address);
                    expect(luminaData.isStaking).to.be.false;
                });

                it("Should set the amountEth to 0", async function () {
                    const luminaData = await lumina.getStakingData(owner.address);
                    expect(luminaData.amountEth).to.be.equal(0);
                });

                it("Should set the amountLumi to 0", async function () {
                    const luminaData = await lumina.getStakingData(owner.address);
                    expect(luminaData.amountLumi).to.be.equal(0);
                });

                it("Should set the timestamp to 0", async function () {
                    const luminaData = await lumina.getStakingData(owner.address);
                    expect(luminaData.timestamp).to.be.equal(0);
                });

                it("Should set the ethPrice to 0", async function () {
                    const luminaData = await lumina.getStakingData(owner.address);
                    expect(luminaData.ethPrice).to.be.equal(0);
                });
            });
        });

        describe("Test the claimRewards function", function () {
            
            context("No rewards to claim", function () {
                it("Should revert if the sender has no rewrds", async function () {
                    await expect(lumina.claimRewards()).to.be.revertedWith("You don't have any rewards to claim");
                });
            });

            context ("has rewards to claim", function () {
                beforeEach(async function() {
                    await lumina.swap({ value: ethers.parseEther("10") });
                    await lumi.approve(lumina.target, ethers.parseEther("1000"));
                    await lumina.stake(ethers.parseEther("500"), { value: ethers.parseEther("0.5") });
                    await ethers.provider.send("evm_increaseTime", [86400]);
                    await ethers.provider.send("evm_mine");

                    await lumina.unstake();
                });

                it("Should transfer the rewards to the sender", async function () {
                    const balanceBefore = await lumi.balanceOf(owner.address);
                    await lumina.claimRewards();
                    const balanceAfter = await lumi.balanceOf(owner.address);
                    expect(balanceAfter).to.be.above(balanceBefore );
                });


            });

        });

    });

    describe("Test the publication part", function () {

        describe("Test the addResearch function", function () {

            it("Should revert if the sender balance is lower than 100 LUMI", async function () {
                await expect(lumina.addResearch("Dimain","Title", ethers.parseEther("100"))).to.be.revertedWith("You need at least 100 LUMI to add a research");
            });

            it("Should revert if the budget is lower than 100 LUMI", async function () {
                await lumina.swap({ value: ethers.parseEther("100") });
                await lumi.approve(lumina.target, ethers.parseEther("1000"));
                await expect(lumina.addResearch("Dimain","Title", "50")).to.be.revertedWith("The budget must be at least 100 LUMI");
            });

            it("Should transfer Lumi from sender to the contract", async function () {
                await lumina.swap({ value: ethers.parseEther("100") });
                await lumi.approve(lumina.target, ethers.parseEther("1000"));
                const balanceBefore = await lumi.balanceOf(lumina.target);
                await lumina.addResearch("Dimain","Title", ethers.parseEther("100"));
                const balanceAfter = await lumi.balanceOf(lumina.target);
                expect(balanceAfter).to.be.equal( balanceBefore + ethers.parseEther("100"));
            });

            it("Should add a new research", async function () {
                await lumina.swap({ value: ethers.parseEther("100") });
                await lumi.approve(lumina.target, ethers.parseEther("1000"));
                await lumina.addResearch("Dimain","Title", ethers.parseEther("100"));
                const research = await lumina.getResearches();
                expect(research[0].depositor).to.be.equal(owner.address);
                expect(research[0].domain).to.be.equal("Dimain");
                expect(research[0].title).to.be.equal("Title");
                expect(research[0].budget).to.be.equal(ethers.parseEther("100"));
            });

        });
    });

    describe ("Test the readingResearch function", function () {

            beforeEach(async function() {
                await lumina.swap({ value: ethers.parseEther("100") });
                await lumi.approve(lumina.target, ethers.parseEther("1000"));
                await lumina.addResearch("Dimain","Title", ethers.parseEther("100"));
                await lumina.connect(addr1).contributorApplication("Domain", "Link")
                await lumina.connect(owner).assignContributor(addr1.address, 0);
            });

            it("Should transfer the lumi to the contract", async function () {
                const balanceBefore = await lumi.balanceOf(lumina.target);
                await lumina.readingResearch(0);
                const balanceAfter = await lumi.balanceOf(lumina.target);
                expect(balanceAfter).to.be.equal(balanceBefore + ethers.parseEther("30"));
            });

            it("Should revert if the sender's balance is lower than 30 LUMI", async function () {
                instance = await lumina.connect(addr1);
                await expect(instance.readingResearch(0)).to.be.revertedWith("You need at least 30 LUMI to read a research");
            });


    });

    describe("Test the validateResearch function", function () {
        it("should revert if the message sender is not a contributor", async function () {
            await expect(lumina.validateResearch(0)).to.be.revertedWith("You are not a contributor");
        });

        it("should revert if the research is already published", async function () {
            await lumina.swap({ value: ethers.parseEther("100") });
            await lumi.approve(lumina.target, ethers.parseEther("1000"));
            await lumina.addResearch("Dimain","Title", ethers.parseEther("100"));
            await lumina.connect(addr1).contributorApplication("Domain", "Link")
            await lumina.connect(owner).assignContributor(addr1.address, 0);
            await lumina.connect(addr1).validateResearch(0);
            await expect(lumina.connect(addr1).validateResearch(0)).to.be.revertedWith("This research is already published");
        });

        it("should set the research as published", async function () {
            await lumina.swap({ value: ethers.parseEther("100") });
            await lumi.approve(lumina.target, ethers.parseEther("1000"));
            await lumina.addResearch("Dimain","Title", ethers.parseEther("100"));
            await lumina.connect(addr1).contributorApplication("Domain", "Link")
            await lumina.connect(owner).assignContributor(addr1.address, 0);
            await lumina.connect(addr1).validateResearch(0);
            const research = await lumina.getResearches();
            expect(research[0].isPublished).to.be.true;
        });

        it("Should add the research to the publishedResearches array", async function () {
            await lumina.swap({ value: ethers.parseEther("100") });
            await lumi.approve(lumina.target, ethers.parseEther("1000"));
            await lumina.addResearch("Dimain","Title", ethers.parseEther("100"));
            await lumina.connect(addr1).contributorApplication("Domain", "Link")
            await lumina.connect(owner).assignContributor(addr1.address, 0);
            await lumina.connect(addr1).validateResearch(0);
            const publishedResearches = await lumina.getPublishedResearches();
            expect(publishedResearches[0].depositor).to.be.equal(owner.address);
            expect(publishedResearches[0].domain).to.be.equal("Dimain");
            expect(publishedResearches[0].title).to.be.equal("Title");
            expect(publishedResearches[0].budget).to.be.equal(ethers.parseEther("100"));
        });
    });
    describe("Test the rejectResearch function", function () {
        it("should revert if the message sender is not a contributor", async function () {
            await expect(lumina.rejectResearch(0)).to.be.revertedWith("You are not a contributor");
        });

        it("should revert if the research is already rejected", async function () {
            await lumina.swap({ value: ethers.parseEther("100") });
            await lumi.approve(lumina.target, ethers.parseEther("1000"));
            await lumina.addResearch("Dimain","Title", ethers.parseEther("100"));
            await lumina.connect(addr1).contributorApplication("Domain", "Link")
            await lumina.connect(owner).assignContributor(addr1.address, 0);
            await lumina.connect(addr1).rejectResearch(0);
            await expect(lumina.connect(addr1).rejectResearch(0)).to.be.revertedWith("This research is already rejected");
        });

        it("should set the research as rejected", async function () {
            await lumina.swap({ value: ethers.parseEther("100") });
            await lumi.approve(lumina.target, ethers.parseEther("1000"));
            await lumina.addResearch("Dimain","Title", ethers.parseEther("100"));
            await lumina.connect(addr1).contributorApplication("Domain", "Link")
            await lumina.connect(owner).assignContributor(addr1.address, 0);
            await lumina.connect(addr1).rejectResearch(0);
            const research = await lumina.getResearches();
            expect(research[0].isRejected).to.be.true;
        });


    });

    describe("Test the getReadingPermissions    function", function () {
        it("Should return the correct reading permissions", async function () {
            await lumina.swap({ value: ethers.parseEther("100") });
            await lumi.approve(lumina.target, ethers.parseEther("1000"));
            await lumina.addResearch("Dimain","Title", ethers.parseEther("100"));
            await lumina.connect(addr1).contributorApplication("Domain", "Link")
            await lumina.connect(owner).assignContributor(addr1.address, 0);
            await lumina.connect(addr1).validateResearch(0);
            await lumina.connect(owner).readingResearch(0);
            const readingPermissions = await lumina.getReadingPermissions();
            expect(readingPermissions[0]).to.be.equal(0n);
        });
    });

    describe("Test the getUserBalance function", function () {
        it("Should return the correct user balance in LUMI", async function () {
            await lumina.swap({ value: ethers.parseEther("1") });
            const userBalance = await lumina.getUserBalance(owner.address);
            expect(userBalance).to.be.equal(ethers.parseEther("2000"));
        });
    });
});