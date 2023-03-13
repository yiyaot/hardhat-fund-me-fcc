const { getNamedAccounts, deployments, network } = require("hardhat")
const {
    networkConfig,
    devChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

// using anonymous functions
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (devChains.includes(network.name)) {
        console.log("Deploying Mock Aggregator...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        })
        console.log("Mocks deployed!")
    }
}

module.exports.tags = ["all", "mocks"]
