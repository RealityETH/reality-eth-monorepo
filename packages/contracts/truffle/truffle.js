module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "4",
      gasPrice: 2000000000,
      gas: 3000000
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
