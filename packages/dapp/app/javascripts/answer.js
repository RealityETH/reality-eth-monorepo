var accounts;
var account;

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

function loadQuestions() {
    console.log('loading questions');
    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.LogNewQuestion({_sender: account}, {fromBlock:0x00, toBlock:'latest'});
    }).then(function(question_posted) {
        question_posted.watch(function(error, result) {
            console.log('new question posted');
            var question_id = result.args.question_id;
            addQuestionRow(question_id);
            console.log('error: ',error);
        });
    }).catch(function (e) {
      console.log(e);
    });
}

function addQuestionRow(question_id) {
    RealityCheck.deployed().then(function(instance){
        var rc = instance;
        return rc.questions(question_id, {from: account});
    }).then(function(result){
        console.log('in addQuestionRow');
        console.log('question_id', question_id);
        console.log(result);
        var question_text = result[3];

        var d = new Date(result[0] * 1000);
        var year  = d.getFullYear();
        var month = d.getMonth() + 1;
        var day  = d.getDate();
        var hour = (d.getHours() < 10) ? '0' + d.getHours()   : d.getHours();
        var min  = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
        var asked_datetime = year + '-' + month + '-' + day + ' ' + hour + ':' + min;

        var question_row = '<tr class="test">'
            + '<td class="test2">' + question_text + '</td>'
            + '<td>'+ asked_datetime + '</td>'
            + '<td>4</td>'
            + '<td>10</td>'
            + '<td>&nbsp;</td>'
            + '<td><a href="question.html?id=' + question_id + '">Detail</a></td>'
            + '</tr>';
            $('#question-table').append(question_row);
    }).catch(function (e) {
        console.log(e);
    });
}

console.log('in ask');

window.onload = function() {
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

    refreshBalance();
    loadQuestions();
  });
}
