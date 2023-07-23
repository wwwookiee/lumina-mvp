// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";


contract Lumina is Ownable {

    // @notice IERC20 Lumina token contract reference
    IERC20 public immutable lumi;
    // @notice LUMI to USD rate
    uint256 lumiToUsd;
    // @notice Chainlink V3 interface aggregator
    AggregatorV3Interface internal dataFeed;

/*****************************************************************
 * Events
*****************************************************************/

    /**
     * @notice Swap event
     * @param _from address of the sender
     * @param _amountETH amount of ETH swapped
     * @param _amountLUMI amount of LUMI swapped
     */
    event Swap (address indexed _from, uint256 _amountETH, uint256 _amountLUMI);
    event Stake(address indexed _from, uint256 _amountLumi, uint256 _amountEth);
    event UnStake(address indexed _from, uint256 _amountLumi, uint256 _amountEth);
    event ClaimRewards(address indexed _from, uint256 _amountLumi);
    event contributorHasApply(address indexed _from, string _domain, string _references);

/*****************************************************************
 * Structs
*****************************************************************/

    /**
     * @notice Staked tokens information struct
     * @param  amountEth amount of ETH staked
     * @param  amountLumi amount of LUMI staked
     * @param  time time of the stake
     * @param  ethPrice ETH to USD rate at the time of the stake
     * @param  reward amount of reward to claim
     * @param  isStaking is the address staking
     */
    struct StakedTokens {
        uint256 amountEth;
        uint256 amountLumi;
        uint256 timestamp;
        int256 ethPrice;
        uint256 reward;
        bool isStaking;
    }

    /**
     * @notice 	Contributor struct
     * @param 	contributorAddress address of the contributor
     * @param 	contributions array of contribution IDs
     * @param 	domain string of contributor's expertise
     * @param 	references string of links to contributor's CV, LinkedIn, etc.
     * @param 	isContributor bool to check if contributor was validated by the admin
     */
    struct Contributor {
        uint256[] contributions;
        string domain;
        string references;
        bool isContributor;
    }

    /**
     * @notice 	Research struct
     * @param 	id ID of the research
     * @param 	domain domain of the research
     * @param 	title title of the research
     * @param 	contributors array of contributor addresses
     * @param 	isValidated bool to check if research was validated by the contributors
     * @param 	isPublished bool to check if research was published
     */
    struct Research {
        uint256 id;
        address depositor;
        string domain;
        string title;
        address contributor;
        uint256 budget;
        bool isPublished;
        bool isRejected;
    }

/*****************************************************************
 * Mappings and arrays
*****************************************************************/

    /**
     * @notice mapping of the balance of staked tokens
     */
    mapping (address => StakedTokens) stakingData;

    /**
     * @notice mapping of contributors
     */
    mapping (address => Contributor) contributors;

    /**
     * @notice mapping of reading permissions for each address
     * @dev     address is the address of the user who paid the reading fee on an article.
     */
    mapping (address => uint256[]) readingPermissions;

    /**
     * @notice array of researches
     */
    Research [] researches;

    Research[] publishedResearches;


/*****************************************************************
 * Constructor
*****************************************************************/

    /**
     * @notice  Constructor
     * @param   _lumiAddress address of the LUMI token contract
     * @dev     This constructor will set the LUMI token contract address and the LUMI to USD rate
     */
    constructor(address _lumiAddress, address _dataFeedAddress) {
        lumi = IERC20(_lumiAddress);
        lumiToUsd = 1;
        /*
        * Goereli ETH/USD address : 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
        */
        dataFeed = AggregatorV3Interface(
            _dataFeedAddress
        );
    }

    function getUserBalance(address _address) external view returns (uint256) {
        return lumi.balanceOf(_address);
    }

/*****************************************************************
 * Token Swapping
 * Exchange ETH for LUMI
*****************************************************************/

    /**
     * @notice Get the contract's balances for ETH and LUMI
     * @return uint256[2] index 0 : ETH balance, index 1 : LUMI balance
     */
    function getContractBalances() external view returns (uint256[2] memory ) {
        uint256[2] memory balances;
        balances[0] = address(this).balance / 1 ether;
        balances[1] = lumi.balanceOf(address(this));
        return balances;
    }

    /**
     * @notice  Get the ETH to USD rate
     * @return  uint256 ETH to USD rate
     * @dev     This function will return the ETH to USD rate. It should be updated to an oracle
     */
    function getLatestPrice() public view returns (int) {
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;

       /* uint256 _ethPrice = 1800;
        return _ethPrice;*/
    }

    /**
     * @notice  Convert ETH to LUMI
     * @return  uint256 LUMI amount
     * @dev     This function will convert ETH to LUMI based on the ETH to USD rate
     *          1 LUMI  = 1 USD
     */
    function convertETHToLumi(uint256 _amountETH) public view returns (uint256) {
        require(_amountETH > 0, "You can only convert more than 0 ETH");
        uint256 _EthInUsd = uint256(getLatestPrice());
        uint256 _amountLumi = (_amountETH  * _EthInUsd) / lumiToUsd;
        return _amountLumi;
    }

    /**
     * @notice  Swap ETH for LUMI
     * @dev     This function will convert ETH to LUMI based on the ETH to USD rate
     *          by calling the internal function _transferLumi
     */
    function swap () public payable {
        require (msg.value > 0, "You can't swap 0 ETH");

        bool locked;
        require(!locked, "Reentrancy guard: locked");
        locked = true;

        uint256 _amountLumi = convertETHToLumi(msg.value);
        _transferLumi(_msgSender(),_amountLumi, msg.value);
        

        locked = false;
    }

    /**
     * @notice  Transfer LUMI to a recipient
     * @param   _recipient address of the recipient
     * @param   _amountLumi    amount of LUMI to send
     * @param   _amountETH     amount of ETH sent
     * @dev     This funciton will send LUMI directly from the contract to the recipient
     *          require amount to be > 0
     *          require contract balance to be >= amount
     *          require recipient to be != address(0)
     */
	function _transferLumi(address _recipient, uint256 _amountLumi, uint256 _amountETH) internal {
       // require (_amountLumi > 0, "Cannot swap 0 LUMI");
        //require (lumi.balanceOf(address(this)) >= _amountLumi, "Contract balance too low"); // a déplacer dans le swap? 
        //require (_recipient != address(0), "No transaction to address zero allowed");
		lumi.transfer(_recipient, _amountLumi);
        emit Swap(_recipient, _amountETH, _amountLumi);

	}

    // @notice Transfer contract's Eth to the owner of the contract
    function transferEthToOwner() external onlyOwner {
        require (address(this).balance > 0, "Contract has no ETH to transfer");
        payable(owner()).transfer(address(this).balance);
    }

/*****************************************************************
 * Token Staking
 * Stake ETH and LUMI for rewards (LUMI)
*****************************************************************/
    /**
     * @notice Get the ETH to USD rate
     * @return uint256 ETH to USD rate
     * @dev This function will return the ETH to USD rate. It should be updated to an oracle
     */

    /**
     * @notice Get an address balance for token staked
     * @param _address address to get the balance of
     * @return uint256[2] index 0 : ETH balance, index 1 : LUMI balance
     */
    function getStakingData (address _address) public view returns (StakedTokens memory) {
        return stakingData[_address];
    }

    /**
     * @notice  function that allow an address to stake LUMI and ETH
     * @param    _amount amount of LUMI to stake
     * @dev     This function will transfer the LUMI from the sender to the contract and store the amount of LUMI staked & ETH staked
     *          It will also store the time of the stake and the ETH to USD rate at the time of the stake
     *          require the sender to have enough LUMI and ETH to stake
     *          require the sender to have allowed the contract to transfer the amount of LUMI to stake
     *          require the amount of LUMI to stake to be greater than 0
     *          require the amount of ETH to stake to be greater than 0
     *          require the sender to have enough LUMI to stake
     */
    function stake(uint256 _amount) external payable {
        require (_amount > 0, "You can only stake more than 0 LUMI");
        require (msg.value > 0, "You can only stake more than 0 ETH");
        require (lumi.balanceOf(_msgSender()) >= _amount, "You can't stake more LUMI than you have");
        require(!stakingData[_msgSender()].isStaking, "You are already staking");

        // Transfer LUMI tokens to the contract
        lumi.transferFrom(_msgSender(), address(this), _amount);

        stakingData[_msgSender()].timestamp = block.timestamp;
        stakingData[_msgSender()].amountLumi += _amount;
        stakingData[_msgSender()].amountEth += msg.value;
        stakingData[_msgSender()].ethPrice = getLatestPrice();
        stakingData[_msgSender()].isStaking = true;

    }

    /**
     * @notice  function that allow an address to unstake LUMI and ETH
     * @dev     This function will transfer the LUMI and ETH previously staked by the sender to the sender
     *          It will also update the amount of LUMI staked & ETH staked
     *          require the sender to have enough LUMI staked
     *          require the sender to have enough ETH staked
     *          require the sender to have waited 1 day before unstaking
     */
    function unstake () external onlyStaker{
        uint256 _amountLumi = stakingData[_msgSender()].amountLumi;
        uint256 _amountEth = stakingData[_msgSender()].amountEth;

        stakingData[_msgSender()].isStaking = false;
        _rewardsCalculation();
        stakingData[_msgSender()].amountLumi = 0;
        stakingData[_msgSender()].amountEth = 0;
        stakingData[_msgSender()].ethPrice = 0;
        stakingData[_msgSender()].timestamp = 0;

        (bool success, ) = _msgSender().call{value: _amountEth}("");
        require(success, "ETH transfer failed");

        lumi.transfer(_msgSender(), _amountLumi);
    }

    /**
     * @notice  function that calculate the rewards to claim
     * @dev     This function should be triggered when the sender unstake
     *          require the sender to have rewards to claim
     */
    function _rewardsCalculation() private  {
        uint256 _stakingDuration = block.timestamp - stakingData[_msgSender()].timestamp;
        uint256 _stakedAmount = stakingData[_msgSender()].amountLumi + stakingData[_msgSender()].amountEth * uint256(stakingData[_msgSender()].ethPrice);
        uint256 numerator = 15; // APR 1.5%  (numerator)
        uint256 denominator = 100; // APR 1.5% (denominator)
        uint256 _rewardRatePerYear = _stakedAmount * numerator / denominator;
        uint256 _rewardRatePerSecond = _rewardRatePerYear / 3.154e7; // 3.154e7 is the number of seconds in a year (365 days * 24 hours * 60 minutes * 60 seconds)
        uint256 _rewardAmount = _stakingDuration * _rewardRatePerSecond;
        stakingData[_msgSender()].reward = _rewardAmount; // store the reward in the staking balance for futur claim
    }

    /**
     * @notice  function that allow an address to claim rewards
     * @dev     This function will transfer the earned rewards to the sender
     *          require the sender to have rewards to claim
     */
    function claimRewards() public onlyRewardClaimer{
        require (stakingData[_msgSender()].reward > 0, "You don't have any rewards to claim");
        uint256 rewardToClaim = stakingData[_msgSender()].reward;
        stakingData[_msgSender()].reward = 0;
        bool success = lumi.transfer(_msgSender(), rewardToClaim);
        require(success, "Failed to transfer rewards");
        emit ClaimRewards(_msgSender(), rewardToClaim);
    }


/*****************************************************************
 * Dapp logic
 * Read article, contributors, Researches, etc.
*****************************************************************/

    function getResearches() external view returns (Research[] memory) {
        return researches;
    }

    function getPublishedResearches() external view returns (Research[] memory) {
        return publishedResearches;
    }

    function getReadingPermissions() external view returns (uint256[] memory) {
        return readingPermissions[_msgSender()];
    }



    /**
     * @notice contributor application function
     * @param _domain  domain of expertise of the contributor
     * @param _references link to the contributor's CV, LinkedIn, etc.
     */
    function contributorApplication(string memory _domain, string memory _references) external {
        address _sender = _msgSender();
        
        require(bytes(_domain).length > 0, "You must provide a domain of expertise");
        require(bytes(_references).length > 0, "You must provide references");
        require( contributors[_sender].isContributor == false, "You are already a contributor");
        
        contributors[_sender].domain = _domain;
        contributors[_sender].references = _references;
        contributors[_sender].isContributor = true;

        emit contributorHasApply(_sender, _domain, _references);
    }

    /**
     * @notice assign contributor to a research by the admin
     * @param _address address of the contributor to assign
     * @param _researchId ID of the research to assign the contributor+
     */
    function assignContributor(address _address, uint256 _researchId) external onlyOwner{
        require(contributors[_address].isContributor == true, "This address is not a contributor");
        contributors[_address].contributions.push(_researchId);
        readingPermissions[_address].push(_researchId);
        researches[_researchId].contributor = _address;
    }

    function addResearch(string calldata _domain, string memory _title, uint256 _budget) external {
        require(lumi.balanceOf(msg.sender) >= 100, "You need at least 100 LUMI to add a research");
        require(_budget >= 100, "Budget must be greater than 100 LUMI");
        lumi.transferFrom(msg.sender, address(this), _budget);
        researches.push(Research(researches.length, msg.sender, _domain, _title, address(0), _budget, false, false));
    }

    function validateResearch(uint256 _researchId) external {
        require(contributors[msg.sender].isContributor, "You are not a contributor");
        require(researches[_researchId].isPublished == false, "This research is already published");
        researches[_researchId].isPublished = true;
        publishedResearches.push(researches[_researchId]);
    }

    function rejectResearch(uint256 _researchId) external {
        require(contributors[msg.sender].isContributor, "You are not a contributor");
        require(researches[_researchId].isPublished == false, "This research is already published");
        researches[_researchId].isPublished = false;
    }

    /**
     *
     * @param _researchId ID of the research to validate
     */
    function readingResearch(uint256 _researchId) external {
        address sender = _msgSender();
        require(lumi.balanceOf(sender) >= 30, "You need at least 30 LUMI to read a research");
        //require(readingPermissions[sender][_researchId] == _researchId, "You already have access to this research");
        //require(researches[_researchId].isPublished == true, "This research is not published yet");
        lumi.transferFrom(sender, address(this), 10 * 1 ether);
        lumi.transferFrom(sender, researches[_researchId].depositor, 10 * 1 ether);
        //lumi.transferFrom(sender, researches[_researchId].contributor, 10 * 1 ether);
        readingPermissions[sender].push(_researchId);
    }
/*****************************************************************
 * modifiers
*****************************************************************/
    modifier onlyStaker() {
        require (stakingData[_msgSender()].isStaking, "You are not staking");
        _;
    }

    modifier onlyRewardClaimer() {
        require (stakingData[_msgSender()].reward > 0, "You don't have any rewards to claim");
        _;
    }
/*****************************************************************
 * Receive and fallback functions
*****************************************************************/

    /**
     * @notice  Receive function to receive ETH
     * @dev     This function will call _transferLumi to send LUMI to the sender
     *          require msg.value to be > 0
     *          require sender balance to be >= msg.value
     *          require sender to be != address(0)
     */
    receive() external payable {
        swap();
    }

    // @notice Fallback function. Will revert if called
    fallback() external payable {}
}