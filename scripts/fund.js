const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    deployer = (await getNamedAccounts()).deployer
    fundMe = await ethers.getContract("FundMe", deployer)
    const transactionResponse = await fundMe.withdraw()
    const transactionReceipt = await transactionResponse.wait(1)
    console.log("Funded!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
