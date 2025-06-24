// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("ManagerModule", (m) => {
    const agreement = m.contract("Agreement")
    const property = m.contract("Property")

    const manager = m.contract("Manager", [property, agreement])

    return { manager };
});
