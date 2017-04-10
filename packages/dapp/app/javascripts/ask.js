$('form#ask-question-form').submit( function() {
    var qtext = $(this).find('#question-text').val();
    console.log('submitting question with value', qtext);

    Arbitrator.deployed().then(function(arb) {
        RealityCheck.deployed().then(function(rc) {
            var d = new Date();
            var deadline = Math.floor(d.getTime()/1000) + 30 * 24 * 60 * 60;
            var step_delay = 7 * 24 * 60 * 60;
            return rc.askQuestion(qtext, arb.address, step_delay, deadline, 1, {from: account});
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