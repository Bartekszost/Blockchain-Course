require("@nomicfoundation/hardhat-toolbox");
require('hardhat-exposed');

module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: "bird case dutch erosion ability maid fiber satisfy shell chimney onion december",
      },
      chainId: 1337,
    },
  },
};
