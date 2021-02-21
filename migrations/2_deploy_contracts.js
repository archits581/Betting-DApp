
var Betting = artifacts.require("./Betting.sol");
var Betting1 = artifacts.require("./Betting1.sol");
var Betting2 = artifacts.require("./Betting2.sol");

module.exports = function(deployer) {
  deployer.deploy(Betting, "India", "England");
  deployer.deploy(Betting1, "Australia", "New Zealand");
  deployer.deploy(Betting2, "South Africa", "Sri Lanka");
};