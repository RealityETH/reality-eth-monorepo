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

       var question1 = 'QmdGwCmiPSvxU1dDsnaaVWdZMFK1EK5bKaU8dkfp2pHukk'; // '{"title":"What is 2 + 2?", "type":"number"}';
       var question2 = 'QmQarJ9ZrWvACLbRaHsVrZNhFy5FbyKgR8CjxQAumUW5qN'; // '{"title":"Who won the presidential election in the US?", "type":"single-select", "outcomes":["Hillary","Trump","Other"]}';

       RealityCheck.deployed().then(function (instance) {
           rc = instance;
           return rc.getQuestionID(question1, arb.address, step_delay, deadline, 5);
       }).then(function (result) {
           question_id1 = result;
           console.log("getQuestionID is", question_id1);
           return rc.askQuestion(question1, arb.address, step_delay, {from: accs[0], value: web3.toWei(1, 'ether')});
       }).then(function(){
           console.log("asked question");
           rc.submitAnswer(question_id1, "0x0000000000000000000000000000000000000000000000000000000000000004", "basic maths", {from: accs[2]}, {value: web3.toWei(2, 'ether')});
       }).then(function(){
           console.log("submitted answer");
           rc.submitAnswer(question_id1, "0x0000000000000000000000000000000000000000000000000000000000000008", "basic maths", {from: accs[1]}, {value: web3.toWei(4, 'ether')});
       });

        RealityCheck.deployed().then(function (instance) {
            rc = instance;
            return rc.getQuestionID(question2, arb.address, step_delay, deadline, 1);
        }).then(function (result) {
            question_id2 = result;
            console.log("getQuestionID 2 is", question_id2);
            return rc.askQuestion(question2, arb.address, step_delay, {from: accs[1], value: web3.toWei(8, 'ether')});
        }).then(function(){
            console.log("asked question 2");
        });
    });

    console.log(err, accs);
  });
};
