var RealityCheck = artifacts.require("./RealityCheck.sol");
var Arbitrator = artifacts.require("./Arbitrator.sol");

module.exports = function(deployer) {
  web3.eth.getAccounts(function(err, accs) {

    Arbitrator.deployed().then(function (instance) {
       var rc;
       var arb = instance;
       var question_id1, question_id2;
       var d = new Date();
       var deadline = Math.floor(d.getTime() / 1000) + 30 * 24 * 60 * 60;
       var timeout = 7 * 24 * 60 * 60;

       var question1 = "What is 2 + 2?";
       var question2 = "Who won the presidential election in the US?";
       //, "type":"single-select", "outcomes":["Hillary","Trump","Other"]}';

       RealityCheck.deployed().then(function (instance) {
           rc = instance;
           return rc.askQuestion(0, question1, arb.address, timeout, {from: accs[0], value: web3.toWei(1, 'ether')});
       }).then(function(){
           web3.eth.sendTransaction({from: accs[0], to: accs[1], value: web3.toWei(1, 'ether')});
       }).then(function(){
           web3.eth.sendTransaction({from: accs[0], to: accs[2], value: web3.toWei(1, 'ether')});
       }).then(function(){
           console.log("asked question");
           rc.submitAnswer(question_id1, "0x0000000000000000000000000000000000000000000000000000000000000004", 0, {from: accs[2]}, {value: web3.toWei(0.0002, 'ether')});
       }).then(function(){
           console.log("submitted answer");
           rc.submitAnswer(question_id1, "0x0000000000000000000000000000000000000000000000000000000000000008", 0, {from: accs[1]}, {value: web3.toWei(0.0004, 'ether')});
       }).then(function(){
           web3.eth.sendTransaction({from: accs[0], to: accs[1], value: web3.toWei(1, 'ether')});
       }).then(function() {
            return rc.askQuestion(0, question2, arb.address, timeout, {from: accs[1], value: web3.toWei(0.0008, 'ether')});
        }).then(function(){
            console.log("asked question 2");
        });
    });

    console.log(err, accs);
  });
};
