var accounts;
var account;

var rc = RealityCheck.deployed();

function refreshBalance() {
  var rc = RealityCheck.deployed();
  rc.balanceOf.call(account, {from: account}).then(function(value) {
    $('.account-balance').text(value.valueOf());
  }).catch(function(e) {
    console.log(e);
    setStatus("Error getting balance; see log.");
  });
};

/*

  var amount = parseInt(document.getElementById("amount").value);
  var receiver = document.getElementById("receiver").value;

  setStatus("Initiating transaction... (please wait)");

  meta.sendCoin(receiver, amount, {from: account}).then(function() {
    setStatus("Transaction complete!");
    refreshBalance();
  }).catch(function(e) {
    console.log(e);
    setStatus("Error sending coin; see log.");
  });
*/

/*
$('form#ask-question-form').submit( function() {
  var qtext = $(this).find('#question-text').val();
  console.log('submitting question with value', qtext);

  question_id = rc.getQuestionID.call(qtext, Arbitrator.deployed().address, 1, 0, 6)
  .then(function(question_id) {
    console.log('got question_id', question_id);
    return rc.askQuestion(qtext, Arbitrator.deployed().address, 1, 0, 6, {from: account})
  })
  .catch(function(e) {
    console.log(e);
    return;
  });
  return false;
});
*/

function loadQuestions() {
  console.log('loading questions');
  var existing_questions = rc.LogNewQuestion({ fromBlock: 0, toBlock: 'latest' });
  existing_questions.get(function(error, results) {
    console.log('get existing questions');
    console.log('results:', JSON.stringify(results));
    console.log('error: ',error);
  });
}

console.log('in ask');

window.onload = function() {
loadQuestions();
  web3.eth.getAccounts(function(err, accs) {
    console.log('got accounts');
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    account = accounts[0];

    //refreshBalance();
    //loadQuestions();
  });
}
