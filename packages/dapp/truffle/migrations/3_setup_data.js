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

       var question1 = '{"title":"What is 2 + 2?", "type":"number"}';
       var question2 = '{"title":"Who won the presidential election in the US?", "type":"single-select", "outcomes":["Hillary","Trump","Other"]}';

       RealityCheck.deployed().then(function (instance) {
           rc = instance;
           return rc.getQuestionID(question1, arb.address, step_delay, deadline, 5);
       }).then(function (result) {
           question_id1 = result;
           console.log("getQuestionID is", question_id1);
           return rc.askQuestion(question1, arb.address, step_delay, deadline, 5, {from: accs[0], value:50});
       }).then(function(){
           console.log("asked question");
           rc.submitAnswer(question_id1, 4, "basic maths", {from: accs[2]}, {value: 100});
       }).then(function(){
           console.log("submitted answer");
           rc.submitAnswer(question_id1, 8, "basic maths", {from: accs[1]}, {value: 250});
       });

        RealityCheck.deployed().then(function (instance) {
            rc = instance;
            return rc.getQuestionID(question2, arb.address, step_delay, deadline, 1);
        }).then(function (result) {
            question_id2 = result;
            console.log("getQuestionID 2 is", question_id2);
            return rc.askQuestion(question2, arb.address, step_delay, deadline, 1, {from: accs[1], value:300});
        }).then(function(){
            console.log("asked question 2");
        });
    });

    console.log(err, accs);
  });
};
