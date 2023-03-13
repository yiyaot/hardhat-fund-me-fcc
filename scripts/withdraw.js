const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const sendValue = ethers.utils.parseEther("0.1")
    deployer = (await getNamedAccounts()).deployer
    fundMe = await ethers.getContract("FundMe", deployer)
    const transactionResponse = await fundMe.fund({ value: sendValue })
    const transactionReceipt = await transactionResponse.wait(1)
    console.log("Withdrew!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
