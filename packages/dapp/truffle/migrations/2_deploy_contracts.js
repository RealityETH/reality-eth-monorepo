var RealityCheck = artifacts.require("./RealityCheck.sol");
var Arbitrator = artifacts.require("./Arbitrator.sol");

module.exports = function(deployer) {
  deployer.deploy(RealityCheck, {overwrite: false});
  deployer.deploy(Arbitrator);
};
