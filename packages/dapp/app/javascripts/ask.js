$('form#ask-question-form').submit( function() {
    var qtext = $(this).find('#question-text').val();
    console.log('submitting question with value', qtext);

    Arbitrator.deployed().then(function(arb) {
        RealityCheck.deployed().then(function(rc) {
            return rc.askQuestion(qtext, arb.address, 1, 0, 6, {from: account});
        }).then(function (result) {
            for (var i = 0; i < result.logs.length; i++) {
                var log = result.logs[i];
                if (log.event == "LogNewQuestion") {
                    console.log("event", log.args.question_text);
                    break;
                }
            }
        }).catch(function(e) {
          console.log(e);
        });
    }).catch(function(e) {
        console.log(e);
        return;
    });

    return false;
});