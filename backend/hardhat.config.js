require("@nomicfoundation/hardhat-ignition");
require("hardhat-abi-exporter"); // Правильное место для подключения плагина

module.exports = {
  solidity: "0.8.24",
  abiExporter: {
    path: "../frontend/src/abis",
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [":Manager$", ":Agreement$", ":Property$"],
    spacing: 2,
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
    }
  }
};