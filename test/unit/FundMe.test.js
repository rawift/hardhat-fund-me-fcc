
const { deployments,ethers,getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")



describe("FundMe", async function(){

     let fundme
     let deployer
     let mockV3Aggregator
     const sendValue = ethers.utils.parseEther("1")

    beforeEach(async function(){
      
   deployer = (await getNamedAccounts()).deployer
   await  deployments.fixture(["all"])
   fundme = await ethers.getContract("FundMe", deployer)
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer)
    })

    describe("constructor",async function(){
         it("sets the aggregator addresses correctly", async function(){
            const response = await fundme.priceFeed()
            assert.equal(response,mockV3Aggregator.address)
         })
    })
    
    describe("fund",async function(){
        it("it fails if you dont send enough eth", async function(){
          
        (await expect(fundme.fund()).to.be.revertedWith('You need to spend more ETH!'))

        })

        it("updated the amount funded data structure", async function(){
     
           await fundme.fund({value:sendValue})
           const response = await fundme.addressToAmountFunded(deployer)

           assert.equal(response.toString(), sendValue.toString())
    
            })

            
        it("Add funder to array of funders", async function(){
     
            await fundme.fund({value:sendValue})
            const funder = await fundme.funders(0)
 
            assert.equal(funder, deployer)
     
             })
   })

   
   describe("withdraw",async function(){
    beforeEach(async function(){
       await fundme.fund({value:sendValue}) 
    })

    it("withdraw ETH from a single founder", async function(){

    const startingFundeMeBalance = await fundme.provider.getBalance(
        fundme.address
    )

    const startingDeployerBalance = await fundme.provider.getBalance(
        deployer
    )

    const transactionResponse = await fundme.withdraw()
    const transactionReceipt = await transactionResponse.wait(1)

    const { gasUsed, effectiveGasPrice } =transactionReceipt
    const gasCost = gasUsed.mul(effectiveGasPrice) 

    const endingFundMeBalance = await fundme.provider.getBalance(fundme.address)
    const endingDeployerBalance = await fundme.provider.getBalance(deployer)

    assert.equal(endingFundMeBalance,0)
    assert.equal(startingFundeMeBalance.add(startingDeployerBalance).toString(),endingDeployerBalance.add(gasCost).toString())

    })

    it("is allows us to withdraw with multiple funders", async () => {
        // Arrange
        const accounts = await ethers.getSigners()
        for (i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundme.connect(
                accounts[i]
            )
            await fundMeConnectedContract.fund({ value: sendValue })
        }
        const startingFundMeBalance =
            await fundme.provider.getBalance(fundme.address)
        const startingDeployerBalance =
            await fundme.provider.getBalance(deployer)

        // Act
        const transactionResponse = await fundme.withdraw()
        const transactionReceipt = await transactionResponse.wait(1)
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)
       
        // Assert
        const endingFundMeBalance = await fundme.provider.getBalance(fundme.address)
        const endingDeployerBalance = await fundme.provider.getBalance(deployer)
        assert.equal(
            startingFundMeBalance
                .add(startingDeployerBalance)
                .toString(),
            endingDeployerBalance.add(gasCost).toString()
        )
        // Make a getter for storage variables
        await expect(fundme.funders(0)).to.be.reverted

        for (i = 1; i < 6; i++) {
            assert.equal(
                await fundme.addressToAmountFunded(
                    accounts[i].address
                ),
                0
            )
        }
    })

    it("Only allows the owner to withdraw", async function(){
        const accounts = await ethers.getSigners();
        const attacker = accounts[1]
        const attackerConnectedContract = await fundme.connect(attacker)
        await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(fundme,"FundMe__NotOwner")

    })

})




})