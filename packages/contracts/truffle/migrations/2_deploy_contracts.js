var Realitio = artifacts.require("./Realitio.sol");
var Arbitrator = artifacts.require("./Arbitrator.sol");

module.exports = function(deployer) {
  deployer.deploy(Realitio);
  deployer.deploy(Arbitrator);
};
