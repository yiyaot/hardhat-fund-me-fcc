const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { devChains } = require("../../helper-hardhat-config")

!devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let deployer
          let mockV3aggregator
          const sendValue = ethers.utils.parseEther("1") // parse 1 ETH
          beforeEach(async function () {
              // alternatively: const accounts = await ethers.getSigners(), account[0] is deployer
              deployer = (await getNamedAccounts()).deployer
              // executes all deployment functions with tag "all"
              await deployments.fixture(["all"])
              // assigns deployer to the contract
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("Constructor", function () {
              it("Sets aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3aggregator.address)
              })
          })

          describe("Fund", function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH"
                  )
              })
              it("Updated amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunders(0)
                  assert.equal(response, deployer)
              })
          })

          describe("Withdraw", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("Withdrew money correctly by founder", async function () {
                  // Arrange
                  const StartingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const StartingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Act
                  const transactionResponce = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponce.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  gasCost = gasUsed.mul(effectiveGasPrice)

                  const EndingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const EndingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(EndingFundMeBalance, 0)
                  assert.equal(
                      StartingFundMeBalance.add(
                          StartingDeployerBalance
                      ).toString(),
                      EndingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Withdrew money correctly by multiple founders", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 5; i++) {
                      // first, accounts need to be connected to fundMe in order to use it - before, only connected to deployer
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  // revtrieve starting balances
                  const StartingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const StartingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponce = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponce.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  gasCost = gasUsed.mul(effectiveGasPrice)

                  const EndingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const EndingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(EndingFundMeBalance, 0)
                  assert.equal(
                      StartingFundMeBalance.add(
                          StartingDeployerBalance
                      ).toString(),
                      EndingDeployerBalance.add(gasCost).toString()
                  )

                  // make sure funders array is reset
                  await expect(fundMe.getFunders(0)).to.be.reverted

                  for (i = 1; i < 5; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Declined withdrawal by any other account other than deployer", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const ConnectedAttacker = await fundMe.connect(attacker)

                  await expect(ConnectedAttacker.withdraw()).to.be.revertedWith(
                      "FundMe__NotOwner"
                  )
              })

              it("Cheaper withdraw by single account", async function () {
                  // Arrange
                  const StartingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const StartingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Act
                  const transactionResponce = await fundMe.cheap_withdraw()
                  const transactionReceipt = await transactionResponce.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  gasCost = gasUsed.mul(effectiveGasPrice)

                  const EndingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const EndingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(EndingFundMeBalance, 0)
                  assert.equal(
                      StartingFundMeBalance.add(
                          StartingDeployerBalance
                      ).toString(),
                      EndingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Cheaper withdraw...", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 5; i++) {
                      // first, accounts need to be connected to fundMe in order to use it - before, only connected to deployer
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  // revtrieve starting balances
                  const StartingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const StartingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponce = await fundMe.cheap_withdraw()
                  const transactionReceipt = await transactionResponce.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  gasCost = gasUsed.mul(effectiveGasPrice)

                  const EndingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const EndingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(EndingFundMeBalance, 0)
                  assert.equal(
                      StartingFundMeBalance.add(
                          StartingDeployerBalance
                      ).toString(),
                      EndingDeployerBalance.add(gasCost).toString()
                  )

                  // make sure funders array is reset
                  await expect(fundMe.getFunders(0)).to.be.reverted

                  for (i = 1; i < 5; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
