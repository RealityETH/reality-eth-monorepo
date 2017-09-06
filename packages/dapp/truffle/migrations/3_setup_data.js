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
       var step_delay = 7 * 24 * 60 * 60;

       var question1 = '0xddeba17826d59eeb072802782bca9869aee48454d094359780d5825c02115f09'; // '{"title":"What is 2 + 2?", "type":"number"}';
       var question2 = '0x215a9b47a549259edab8a31436c42146a24a035d4ade5fc84d37353791c74ebd'; // '{"title":"Who won the presidential election in the US?", "type":"single-select", "outcomes":["Hillary","Trump","Other"]}';

       RealityCheck.deployed().then(function (instance) {
           rc = instance;
           return rc.getQuestionID(question1, arb.address, step_delay, deadline, 5);
       }).then(function (result) {
           question_id1 = result;
           console.log("getQuestionID is", question_id1);
           return rc.askQuestion(question1, arb.address, step_delay, {from: accs[0], value: web3.toWei(1, 'ether')});
       }).then(function(){
           rc.sendTransaction({from: accs[0], to: accs[1], value: web3.toWei(1, 'ether')});
       }).then(function(){
           rc.sendTransaction({from: accs[0], to: accs[2], value: web3.toWei(1, 'ether')});
       }).then(function(){
           console.log("asked question");
           rc.submitAnswer(question_id1, "0x0000000000000000000000000000000000000000000000000000000000000004", 0, {from: accs[2]}, {value: web3.toWei(0.0002, 'ether')});
       }).then(function(){
           console.log("submitted answer");
           rc.submitAnswer(question_id1, "0x0000000000000000000000000000000000000000000000000000000000000008", 0, {from: accs[1]}, {value: web3.toWei(0.0004, 'ether')});
       });

        RealityCheck.deployed().then(function (instance) {
            rc = instance;
            return rc.getQuestionID(question2, arb.address, step_delay, deadline, 1);
       }).then(function(){
           rc.sendTransaction({from: accs[0], to: accs[1], value: web3.toWei(1, 'ether')});
        }).then(function (result) {
            question_id2 = result;
            console.log("getQuestionID 2 is", question_id2);
            return rc.askQuestion(question2, arb.address, step_delay, {from: accs[1], value: web3.toWei(0.0008, 'ether')});
        }).then(function(){
            console.log("asked question 2");
        });
    });

    console.log(err, accs);
  });
};
