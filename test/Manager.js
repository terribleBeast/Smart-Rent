const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
// import '../contracts/Property.sol'


describe("Manager", function () {

    async function deployManager() {
        // factories
        const Property = await ethers.getContractFactory("Property");
        const Agreement = await ethers.getContractFactory("Agreement")
        const Manager = await ethers.getContractFactory("Manager")

        const property = await Property.deploy()
        const agreement = await Agreement.deploy()

        // await property.deployed()
        // await agreement.deployed()

        const [owner, otherAccount] = await ethers.getSigners();

        const manager = await Manager.deploy(

            await property.getAddress(),
            await agreement.getAddress()

        )
        // await manager.deployed()

        return { manager, owner, otherAccount, Property, Agreement };
    }

    describe("Deployment", function () {
        it("Should deployment correctly", async function () {
            const { manager } = await loadFixture(deployManager);



            expect(manager.getAddress()).to.not.equal('0x');
            expect(manager.implementationProperty()).to.not.equal('0x');
            expect(manager.implementationAgreement()).to.not.equal('0x');

        });
    })

    describe("Creating property", function () {

        it("Should add a new property to propertyList", async function () {

            const { manager } = await loadFixture(deployManager)

            const length = await manager.getPropertiesListLength()

            await manager.createProperty(10, 15, "link")

            const newLength = await manager.getPropertiesListLength()
            // console.log(typeof length.toNumber())
            expect(Number(newLength)).to.equal(Number(length) + 1)
        })

    })
    describe("Creating agreement", function () {

        it("Should not add property does not exists", async function () {
            const { manager } = await loadFixture(deployManager)

            const randomPropertyAddress = "0xE451980132E65465d0a498c53f0b5227326Dd73F"

            await expect(manager.createAgreement(randomPropertyAddress, 10)).to.be.revertedWith(
                "Property does not exist"
            );
        })

        it("Shouldn't landlord rent own property", async function () {
            const { manager } = await loadFixture(deployManager)

            await manager.createProperty(10, 15, 'link')
            const propertyAddress = await manager.propertiesList(0)

            await expect(manager.createAgreement(propertyAddress, 10)).to.be.revertedWith(
                "Landlord cannot rent own property"
            );
        })
        it("Should add new agreement", async function () {
            const { manager, owner, otherAccount } = await loadFixture(deployManager)

            const pricePerDay = 10
            const deposit = 15
            await manager.connect(otherAccount).createProperty(pricePerDay, deposit, 'link')

            const daysCount = 10;
            const requiredAmount = pricePerDay * daysCount + deposit;

            const propertyAddress = await manager.propertiesList(0)

            // requiredAmount equivalent to sending value
            await manager.createAgreement(propertyAddress, 10, { value: requiredAmount })
            const addressNewAgreement0 = await manager.propertyAgreements(propertyAddress, 0)
            expect(addressNewAgreement0).to.not.equal('0x')

            // requiredAmount more than sending value 
            await expect(
                manager.createAgreement(propertyAddress, 10, { value: requiredAmount + 10 })
            ).to.emit(manager, "AgreementCreated")


            const addressNewAgreement1 = await manager.propertyAgreements(propertyAddress, 1)
            expect(addressNewAgreement1).to.not.equal('0x')

            // requiredAmount lower than sending value: "Incorrect payment amount"
            await expect(
                manager.createAgreement(propertyAddress, 10, { value: requiredAmount - 2 })).to.be.reverted
        })

        it("Should to landlord get payment of rent", async function () {
            const { manager, owner, otherAccount, Agreement } = await loadFixture(deployManager)

            const pricePerDay = 10
            const deposit = 15
            const daysCount = 10

            await manager.connect(owner).createProperty(pricePerDay, deposit, 'link')
            const propertyAddress = manager.propertiesList(0)

            await manager.connect(otherAccount).createAgreement(propertyAddress, daysCount, { value: pricePerDay * daysCount + deposit })
            const agreementAddress = await manager.propertyAgreements(propertyAddress, 0)

            const agreement = Agreement.attach(agreementAddress);

            const agrFeatures = await agreement.agrFeatures();

            // reverted with "WithdrawRentPayment"
            await expect(
                manager.connect(owner).getRentPayment(agreementAddress)
            ).to.be.reverted  

            await time.increaseTo(agrFeatures[1]);
            expect(
                await manager.connect(owner).getRentPayment(agreementAddress)
            ).to.emit(agreement, "WithdrawRentPayment")
        })

        
    })
})