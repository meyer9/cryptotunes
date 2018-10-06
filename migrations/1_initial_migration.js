var Migrations = artifacts.require("./Migrations.sol");
var MusicDAO = artifacts.require("./MusicDAO.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(MusicDAO, 10000, 100);
};
