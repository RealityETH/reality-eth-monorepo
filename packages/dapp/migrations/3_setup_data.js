module.exports = function(deployer) {
  rc = RealityCheck.deployed();
  arb = Arbitrator.deployed();
  //console.log(rc);
  web3.eth.getAccounts(function(err, accs) {

    rc.getQuestionID.call("What is 2 + 2?", arb.address, 2, 0, 5).then(
      function(question_id) {
        console.log('getQuestionID is ',question_id);
        rc.askQuestion("What is 2 + 2?", arb.address, 2, 0, 5, {from: accs[0]}).then(function() {
          console.log("asked question");
          rc.submitAnswer(question_id, 4, "basic maths", {from:accs[2], value: 100});
        });
      }
    );

    rc.getQuestionID.call("What is 3 + 3?", arb.address, 1, 0, 6).then(
      function(question_id) {
        console.log('getQuestionID 2 is ',question_id);
        rc.askQuestion("What is 3 + 3?", arb.address, 1, 0, 6, {from: accs[1]}).then(function() {
          console.log("asked question 2");
        });
    });
    //console.log(err, accs);
  });
};
