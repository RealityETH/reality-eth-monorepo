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

var temp = function(event) {
    var a = $(event.target);
    event.preventDefault();
    history.pushState('', 'Reality Check', a.attr('href'));

    // routing
    $.ajax({
        url: '/index.html',
        success: function () {
            var pathname = window.location.pathname;
            console.log('pathname', pathname);
            var pathinfo = pathname.split('/');
            console.log('pathinfo', pathinfo);

            if (pathname == '/') {
                pathname = '/ask';
            }
            if (pathname == '/ask') {
                $('#ask').css('display', 'block');
                $('#answer').css('display', 'none');
                $('#question').css('display', 'none');
                $('#yours').css('display', 'none');
            }
            if (pathname == '/questions') {
                $('#ask').css('display', 'none');
                $('#answer').css('display', 'block');
                $('#question').css('display', 'none');
                $('#yours').css('display', 'none');
                $('.question-row').remove();
                loadQuestions();
            }
            if (pathinfo[1] == 'question') {
                var question_id = pathinfo[2];
                $('#ask').css('display', 'none');
                $('#answer').css('display', 'none');
                $('#question').css('display', 'block');
                $('#yours').css('display', 'none');
                loadQuestionInfo(question_id);
            }
            if (pathname == '/yours') {
                $('#ask').css('display', 'none');
                $('#answer').css('display', 'none');
                $('#question').css('display', 'none');
                $('#yours').css('display', 'block');
            }
        },
        error: function (xhr, status, error) {
            console.error(error);
        },
    });
}

$('#menu').on('click', 'a', temp);
$('#question_table').on('click', 'a', temp);

window.onload = function(){
    var pathname = window.location.pathname;
    if (pathname == '/') {
        $('#ask').css('display', 'block');
        $('#answer').css('display', 'none');
        $('#question').css('display', 'none');
        $('#yours').css('display', 'none');
    }

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