const { devChains } = require("../../helper-hardhat-config")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert } = require("chai")

// no mock as test net is used
// no fixtures as it is already deployed

devChains.includes(network.name)
    ? describe.skip // notation for one line if else
    : describe("FundMe", function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("1") // parse 1 ETH
          beforeEach(async function () {
              // alternatively: const accounts = await ethers.getSigners(), account[0] is deployer
              deployer = (await getNamedAccounts()).deployer
              // assigns deployer to the contract
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("It allows people to fund and withdraw...", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
