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

        const [managerAddr, landlordAddr, tenantAddr] = await ethers.getSigners();

        const manager = await Manager.deploy(

            await property.getAddress(),
            await agreement.getAddress()

        )
        // await manager.deployed()

        return { manager, landlordAddr, tenantAddr, Property, Agreement };
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

        // validations
        it("Should not add property does not exists", async function () {
            const { manager } = await loadFixture(deployManager)

            const randomPropertyAddr = "0xE451980132E65465d0a498c53f0b5227326Dd73F"

            await expect(manager.createAgreement(randomPropertyAddr, 10)).to.be.revertedWith(
                "Property does not exist"
            );
        })

        it("Shouldn't landlord rent own property", async function () {
            const { manager } = await loadFixture(deployManager)

            await manager.createProperty(10, 15, 'link')
            const propertyAddr = await manager.propertiesList(0)

            await expect(manager.createAgreement(propertyAddr, 10)).to.be.revertedWith(
                "Landlord cannot rent own property"
            );
        })

        // add new agreement
        it("Should add new agreement", async function () {
            const { manager, tenantAddr } = await loadFixture(deployManager)

            const pricePerDay = 10
            const deposit = 15
            await manager.connect(tenantAddr).createProperty(pricePerDay, deposit, 'link')

            const daysCount = 10;
            const requiredAmount = pricePerDay * daysCount + deposit;

            const propertyAddr = await manager.propertiesList(0)

            // requiredAmount equivalent to sending value
            await manager.createAgreement(propertyAddr, 10, { value: requiredAmount })
            const addrNewAgreement0 = await manager.propertyAgreements(propertyAddr, 0)
            expect(addrNewAgreement0).to.not.equal('0x')

            // requiredAmount more than sending value 
            await expect(
                manager.createAgreement(propertyAddr, 10, { value: requiredAmount + 10 })
            ).to.emit(manager, "AgreementCreated")


            const addrNewAgreement1 = await manager.propertyAgreements(propertyAddr, 1)
            expect(addrNewAgreement1).to.not.equal('0x')

            // requiredAmount lower than sending value: "Incorrect payment amount"
            await expect(
                manager.createAgreement(propertyAddr, 10, { value: requiredAmount - 2 })).to.be.reverted
        })

        it("Shouldn't work with agreement done existing", async function () {

            const { manager, landlordAddr, tenantAddr, Agreement } = await loadFixture(deployManager)

            const randomAgreementAddr = "0x5392A33F7F677f59e833FEBF4016cDDD88fF9E67"
            await expect(manager.connect(tenantAddr).extendRent(randomAgreementAddr, 10, { value: 10 ** 6 })).to.be.reverted


        })

        // functional 
        it("Should to landlord get payment of rent", async function () {
            const { manager, landlordAddr, tenantAddr, Agreement } = await loadFixture(deployManager)

            const pricePerDay = 10
            const deposit = 15
            const daysCount = 10

            await manager.connect(landlordAddr).createProperty(pricePerDay, deposit, 'link')
            const propertyAddr = manager.propertiesList(0)

            await manager.connect(tenantAddr).createAgreement(propertyAddr, daysCount, { value: pricePerDay * daysCount + deposit })
            const agreementAddr = await manager.propertyAgreements(propertyAddr, 0)

            const agreement = Agreement.attach(agreementAddr);

            const agrFeatures = await agreement.agrFeatures();

            // reverted with "WithdrawRentPayment"
            await expect(
                manager.connect(landlordAddr).getRentPayment(agreementAddr)
            ).to.be.reverted

            await time.increaseTo(agrFeatures[1]);
            expect(
                await manager.connect(landlordAddr).getRentPayment(agreementAddr)
            ).to.emit(agreement, "WithdrawRentPayment")
        })

        it("Should extend rent of additional days", async function () {

            const { manager, landlordAddr, tenantAddr, Agreement } = await loadFixture(deployManager)
            const pricePerDay = 10
            const deposit = 15
            const daysRent = 10
            const additionalRentDays = 5
            const secOnOneDay = 24 * 60 * 60

            await manager.connect(landlordAddr).createProperty(pricePerDay, deposit, 'link')
            const propertyAddr = manager.propertiesList(0)

            await manager.connect(tenantAddr).createAgreement(propertyAddr, daysRent, { value: pricePerDay * daysRent + deposit })
            const agreementAddr = await manager.propertyAgreements(propertyAddr, 0)

            const agreement = Agreement.attach(agreementAddr)
            const endRent = Number((await agreement.agrFeatures())[1])
            const requiredAmount = additionalRentDays * pricePerDay
            await manager.connect(tenantAddr).extendRent(agreementAddr, additionalRentDays, {
                value: requiredAmount
            })

            const newEndRent = Number((await agreement.agrFeatures())[1])

            expect(newEndRent - endRent).to.equal(additionalRentDays * secOnOneDay)

            // retrieved with "Only tenants can this action"
            await expect(
                manager.connect(landlordAddr).extendRent(agreementAddr, additionalRentDays)).to.be.reverted;

            await network.provider.send("hardhat_setBalance", [await tenantAddr.getAddress(), '0x51919786020000048'])

            // retrieved with "Incorrect payment amount"
            await expect(manager.connect(tenantAddr).extendRent(agreementAddr, additionalRentDays, {
                value: requiredAmount - 2
            })).to.be.reverted
        })

        it("Should cancel rent", async function () {
            const { manager, landlordAddr, tenantAddr, Agreement } = await loadFixture(deployManager)
            const pricePerDay = 10
            const deposit = 15
            const daysRent = 10
            const additionalRentDays = 5
            const secOnOneDay = 24 * 60 * 60

            await manager.connect(landlordAddr).createProperty(pricePerDay, deposit, 'link')
            const propertyAddr = manager.propertiesList(0)

            await manager.connect(tenantAddr).createAgreement(propertyAddr, daysRent, { value: pricePerDay * daysRent + deposit })
            const agreementAddr = await manager.propertyAgreements(propertyAddr, 0)

            const agreement = Agreement.attach(agreementAddr)

            // reverted with 'Only landlord can this action'
            await expect(manager.connect(tenantAddr).cancelByLandlord(agreement)).to.be.reverted


            await manager.connect(landlordAddr).cancelByLandlord(agreement)
            // reverted with 'The agreement is not active'
            await expect(manager.connect(tenantAddr).extendRent(await agreement.getAddress(), additionalRentDays, {
                value: additionalRentDays * pricePerDay * secOnOneDay
            })).to.be.reverted

        })
    })
})