require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy")
require("hardhat-gas-reporter")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const PRIVATE_KEY= process.env.RINKEBY_PRIVATE_KEY
const  RINKEBY_RPC_URL= process.env.RPC_URL
const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY=process.env.COINMARKETCAP_API_KEY


module.exports = {
  solidity: "0.8.8",

  defaultNetwork:"hardhat", 

  
  networks:{
    rinkeby:{
url:RINKEBY_RPC_URL,
accounts:[PRIVATE_KEY],
chainId: 4,
blockConfirmation: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      // See its defaults
    }
  },
  solidity: {
    compilers:[
      {version: "0.8.8"},
      {version:"0.6.6"}
    ]
},
etherscan:{
  apiKey:ETHERSCAN_API_KEY
},
gasReporter: {
  enabled: true,
  currency: "USD",
  outputFile: "gas-report.txt",
  noColors: true,
  coinmarketcap: COINMARKETCAP_API_KEY,
},

  namedAccounts:{
    deployer : {
      default: 0,
    },
    user: {
      default: 1,
    }
  }
};
