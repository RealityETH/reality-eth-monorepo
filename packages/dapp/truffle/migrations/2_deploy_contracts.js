var RealityCheck = artifacts.require("./RealityCheck.sol");
var Arbitrator = artifacts.require("./Arbitrator.sol");

module.exports = function(deployer) {
  deployer.deploy(RealityCheck);
  deployer.deploy(Arbitrator);
};
