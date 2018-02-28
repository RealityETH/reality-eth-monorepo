var Arbitrator = artifacts.require("./Arbitrator.sol");

module.exports = function(deployer) {
  deployer.deploy(Arbitrator);
};
