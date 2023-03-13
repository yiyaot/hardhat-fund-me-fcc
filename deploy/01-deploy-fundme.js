// // One way to do it
// function deployFunc(hre) {
//     console.log("Hi")
// }

const { getNamedAccounts, deployments, network } = require("hardhat")
const { networkConfig, devChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

// module.exports.default = deployFunc

// using anonymous functions
module.exports = async ({ getNamedAccounts, deployments }) => {
    // same as const {getNamedAccounts, deployments} = hre // same as hre.getNamedAccounts() and hre.deployments

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let EthUsdPriceFeedAddress
    if (devChains.includes(network.name)) {
        const ethAggregator = await deployments.get("MockV3Aggregator")
        EthUsdPriceFeedAddress = ethAggregator.address
        log("EthUsdPriceFeedAddress: " + EthUsdPriceFeedAddress)
        log("ethAggregator args:" + ethAggregator.args)
    } else {
        EthUsdPriceFeedAddress = networkConfig[chainId]["EthUsdPriceFeed"]
    }

    // mocks required for localhost/ hardhat testing
    args = [EthUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args)
    }

    log("_____________________________________")
}

module.exports.tags = ["all", "fundme"]
