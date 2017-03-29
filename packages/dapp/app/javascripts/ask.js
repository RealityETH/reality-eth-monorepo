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

$('form#ask-question-form').submit( function() {
  var qtext = $(this).find('#question-text').val();
  console.log('submitting question with value', qtext);

  Arbitrator.deployed().then(function (arb) {
      RealityCheck.deployed().then(function (rc) {
        return rc.askQuestion(qtext, arb.address, 1, 0, 6, {from: account});
      }).then(function (result) {
          for (var i = 0; i < result.logs.length; i++) {
              var log = result.logs[i];
              if (log.event == "LogNewQuestion") {
                  console.log("event", log.args.question_text);
                  break;
              }
          }
      }).catch(function (e) {
          console.log(e);
      });
  }).catch(function (e) {
    console.log(e);
    return;
  });

  return false;
});

window.onload = function() {
  web3.eth.getAccounts(function(err, accs) {
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

    refreshBalance();
  });
}
