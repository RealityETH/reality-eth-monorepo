module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "4"
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
