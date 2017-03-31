var accounts;
var account;

var rc = RealityCheck.deployed();

function refreshBalance() {
    RealityCheck.deployed().then(function (instance) {
        rc = instance;
        return rc.balanceOf.call(account);
    }).then(function (val) {
        $('.account-balance').text(val.toNumber());
        console.log('balance is', val.toNumber());
    }).catch(function (e) {
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
    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.LogNewQuestion({_sender: account}, {fromBlock:0x00, toBlock:'latest'});
    }).then(function(existing_questions) {
        console.log(existing_questions);
        existing_questions.get(function(error, results) {
            console.log('get existing questions');
            for (var i = 0; i < results.length; i++) {
                var question_text = JSON.stringify(results[i]['args']['question_text']);
                question_text = question_text.substr(1, question_text.length - 2);
                console.log("results ", i, question_text);
                var question_row = '<tr class="test">'
                    + '<td class="test2">'
                    + question_text
                    + '</td>'
                    + '<td>2017-01-01 12:34</td>'
                    + '<td>4</td>'
                    + '<td>10</td>'
                    + '<td>&nbsp;</td>'
                    + '<td><a href="">Detail</a></td>'
                    + '</tr>';
                $('#question-table').append(question_row);
            }
            console.log('error: ',error);
        });
    }).catch(function (e) {
      console.log(e);
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
