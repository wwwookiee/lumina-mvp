// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title 	Lumi.sol
 * @notice 	This contract will create the ERC20 LUMI token
 * @dev 	This contract will mint the maximum uint256 value of LUMI tokens to the contract creator
 */
contract LuminaToken is ERC20, Ownable {

	/**
	 * @notice 	Constructor ERC20 LUMI token
	 * @dev 	This constructor will set the total supply to the maximum uint256 value.
	 * 			Token name is Lumina & token symbol is  LUMI
	 */
	constructor() ERC20('Lumina', 'LUMI') {
		 _mint(msg.sender, type(uint256).max ); // Mint the maximum uint256 value
	}


}