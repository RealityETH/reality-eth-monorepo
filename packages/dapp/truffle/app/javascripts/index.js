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
        //setStatus("Error getting balance; see log.");
    });
};

var showScreen = function(hash) {
    if (hash == '') {
        $('#ask').css('display', 'block');
        $('#answer').css('display', 'none');
        $('#question').css('display', 'none');
        $('#yours').css('display', 'none');
    }
    if (hash == '#questions') {
        $('#ask').css('display', 'none');
        $('#answer').css('display', 'block');
        $('#question').css('display', 'none');
        $('#yours').css('display', 'none');
        $('.question-row').remove();
        loadQuestions({});
    }
    var re = /^#0x[0-9a-zA-Z]{64}$/;
    if (re.test(hash)) {
        var question_id = hash.replace('#', '');
        $('#ask').css('display', 'none');
        $('#answer').css('display', 'none');
        $('#question').css('display', 'block');
        $('#yours').css('display', 'none');
        $('.answer_history_row').remove();
        loadQuestionInfo(question_id);
        loadAnswerHistory(question_id);
        loadSubmitButton(question_id);
    }
    if (hash == '#yours') {
        $('#ask').css('display', 'none');
        $('#answer').css('display', 'none');
        $('#question').css('display', 'none');
        $('#yours').css('display', 'block');
        $('.your-question-row').remove();
        $('.answered-question-row').remove();
        loadYourQuestions();
        loadYourAnsweredQuestions();
    }
}

var routing = function(event) {
    var a = $(event.target);
    event.preventDefault();
    history.pushState('', 'Reality Check', a.attr('href'));

    // routing
    $.ajax({
        url: '/index.html',
        success: function () {
            var hash = window.location.hash;
            console.log('hash', hash);
            showScreen(hash);
        },
        error: function (xhr, status, error) {
            console.error(error);
        },
    });
}

$('#menu').on('click', 'a', routing);
$('#question_table').on('click', 'a', routing);

window.onload = function(){
    var hash = window.location.hash;
    showScreen(hash);

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
        console.log(accs);
        refreshBalance();
    });

}
