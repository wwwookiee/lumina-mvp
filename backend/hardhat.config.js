require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("solidity-coverage");

const PK = process.env.PK || ""
const GOERLI_RPC_URL = process.env.RPC_URL || ""
const MUMBAI_RPC_URL = process.env.RPC_URL || ""

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey : "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
          balance: "10000000000000000000000"
        },
        {
          privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
          balance: "10000000000000000000000"
        },
        {
          privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
          balance: "100000000000000000"
        }
      ],
      //blockGasLimit: 100000000429720 // whatever you want here
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    test: {
      url: 'http://127.0.0.1:8546',
      chainId: 1337,
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PK],
      chainId: 5
    },
    mumbai: { 
      url: MUMBAI_RPC_URL,
      accounts: [PK],
      chainId: 80001
    },
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  },
  gasReporter: {
    enabled: false
  },
  providerOptions: {
    chain: {chainId: 31337},
    miner: {defaultTransactionGasLimit: "estimate"}
  }
};