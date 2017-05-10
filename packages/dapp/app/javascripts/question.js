function getDateString(timestamp) {
    var d = new Date(timestamp * 1000);
    var year  = d.getFullYear();
    var month = d.getMonth() + 1;
    var day  = d.getDate();
    var hour = (d.getHours() < 10) ? '0' + d.getHours()   : d.getHours();
    var min  = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
    return year + '-' + month + '-' + day + ' ' + hour + ':' + min;
}

function displayChangeAnswerDiv(question_id, disabled) {
    $('#change_answer').css('display', 'block');

    if (!disabled) {
        $('#answer_text').text('Change this answer');
        $('#p_new_answer').css('display', 'inline');
        $('#p_bond').css('display', 'inline');
        $('#post_answer').css('display', 'inline');
    } else {
        $('#answer_text').text('Changing Answer is disabled.');
        $('#p_new_answer').css('display', 'none');
        $('#p_bond').css('display', 'none');
        $('#post_answer').css('display', 'none');
    }
}

function displayArbitrationDiv(question_id, disabled){
    $('#arbitration').css('display', 'block');

    if (!disabled) {
        Arbitrator.deployed().then(function (instance) {
            var arb = instance;
            return arb.getFee.call(question_id, {from: account});
        }).then(function (result) {
            $('#arbitration_text').text('Request arbitration (min fee ' + result.toNumber() + ')');
            $('#arbitration_fee').val(result.toNumber());
            $('#arbitration_fee').css('display', 'inline');
            $('#request_arbitration').css('display', 'inline');
        }).catch(function (e) {
            console.log(e);
        });
    } else {
        $('#arbitration_fee').css('display', 'none');
        $('#request_arbitration').css('display', 'none');
        $('#arbitration_text').text('Requesting arbitration is disabled.');
    }
}

function displayFinalizationDiv(question_id, isArbitrationRequested, isFinalized) {
    RealityCheck.deployed().then(function(instance) {
        var rc = instance;
        return rc.getEarliestFinalizationTS(question_id, {from: account});
    }).then(function(result){
        var finalization_start_time = result;
        var d = new Date();
        var now = Math.floor(d.getTime() / 1000);
        if (now >= finalization_start_time) {
            if (!isArbitrationRequested && !isFinalized) {
                $('#request_finalization').css('display', 'inline');
                $('#claim_bounty').css('display', 'none');
                $('#claim_bond').css('display', 'none');
                $('#finalization').css('display', 'block');
            } else if (isArbitrationRequested && !isFinalized) {
                $('#request_finalization').css('display', 'none');
                $('#finalization').append('Under arbitration.');
                $('#claim_bounty').css('display', 'none');
                $('#claim_bond').css('display', 'none');
                $('#finalization').css('display', 'block');
            } else if (isFinalized) {
                $('#request_finalization').css('display', 'none');
                $('#claim_bounty').css('display', 'inline');
                $('#claim_bond').css('display', 'inline');
                $('#finalization').css('display', 'block');
            }
        }
    }).catch(function(e){
        console.log(e);
    });
}

function loadSubmitButton(question_id) {
    var rc;
    var isFinalized, isArbitrationRequested;

    RealityCheck.deployed().then(function(instance){
        rc = instance;
        return rc.isFinalized.call(question_id, {from: account});
    }).then(function(result){
        console.log('is finalized ?', result);
        isFinalized = result;
        return rc.isArbitrationPaidFor.call(question_id, {from: account});
    }).then(function(result){
        console.log('is arbitrated ?', result);
        isArbitrationRequested = result;

        displayFinalizationDiv(question_id, isArbitrationRequested, isFinalized);
        if (!isFinalized && !isArbitrationRequested) {
            displayArbitrationDiv(question_id, false);
            displayChangeAnswerDiv(question_id, false);
        } else {
            displayArbitrationDiv(question_id, true);
            displayChangeAnswerDiv(question_id, true);
        }
    }).catch(function(e){
        console.log(e);
    });
}

function loadQuestionInfo(question_id) {
    var rc;
    var question_posted;
    var deadline;
    var question_json;
    var answer_id;

    RealityCheck.deployed().then(function(instance){
        rc = instance;
        return rc.questions.call(question_id, {from: account});
    }).then(function(result){
        var question = result;
        question_posted = question[0];
        question_posted = getDateString(question_posted);
        deadline = question[4];
        var d = new Date();
        deadline = getDateString(deadline);
        question_json = JSON.parse(question[3]);
        answer_id = question[9];
        var options = '';
        if (typeof question_json['outcomes'] !== 'undefined') {
            for (var i = 0; i < question_json['outcomes'].length; i++) {
                options = options + i + ':' + question_json['outcomes'][i] + ', ';
            }
        }

        $('#question_id').val(question_id);
        $('#question_text').text(question_json['title'] + ' ' + options);
        $('#question_posted').text('Posted ' + question_posted);
        $('#deadline').text('You have until ' + deadline + ' to answer this question');

        return rc.answers.call(answer_id, {from: account});
    }).then(function(result){
        var answer = result;
        var answerLabel = '';
        if (typeof question_json['outcomes'] !== 'undefined') {
            answerLabel = question_json['outcomes'][answer[1]];
        }
        var answer_text = 'Current answer: [' + answer[1] + ']' + answerLabel + ' (Bond ' + answer[3] + ' ETH)';
        $('#current_answer').text(answer_text);
        $('#bond').val(answer[3] * 2);
        $('#min_bond').text(answer[3] * 2);
    }).catch(function (e) {
        console.log(e);
    });
}

function loadAnswerHistory(question_id) {
    var rc;
    var question_json;
    var answer_posted

    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.questions.call(question_id, {from: account});
    }).then(function(result){
        if (result[3].charAt(0) == '{') {
            question_json = JSON.parse(result[3]);
        } else {
            question_json = {
              'title': result[3]
            };
        }
        return rc.LogNewAnswer.call({_sender: account}, {question_id: question_id}, {fromBlock: 0x00, toBlock: 'latest'})
    }).then(function(result){
        answer_posted = result;
        answer_posted.watch(function(error, result) {
            if (error === null) {
                var option = '';
                if (typeof question_json['outcomes'] !== 'undefined') {
                    option = question_json['outcomes'][result.args.answer];
                }
                var table_row = $('#answer_history').find('.row_template').clone().removeClass('row_template');;
                table_row.find('.a_date').text( getDateString(result.args.ts) );
                table_row.find('.a_answer').text('[' + parseInt(result.args.answer) + '] ' + option);
                table_row.find('.a_address').text(result.args.answerer);
                table_row.find('.a_bond').text(result.args.bond);
                $('#answer_history').append(table_row);
            } else {
                console.log(e);
            }
        });
    }).catch(function(e){
        console.log(e);
    });
}

$('#post_answer').on('click', function(event) {
    var question_id = $('#question_id').val();
    var answer = $('#new_answer').val();
    var bond = $('#bond').val();

    RealityCheck.deployed().then(function(instance){
        var rc = instance;
        return rc.submitAnswer(question_id, answer, '', {value: bond});
    }).then(function(result){
        $('#new_answer').val('');
        $('#bond').val(bond * 2);
    }).catch(function(e){
        console.log(e);
    });
});

$('#request_arbitration').on('click', function(event){
    var question_id = $('#question_id').val();
    var arbitration_fee = $('#arbitration_fee').val();

    RealityCheck.deployed().then(function(instance){
        var rc = instance;
        return rc.requestArbitration(question_id, {from: account}, {value: arbitration_fee});
    }).then(function(result){
        console.log('after arbitrated', result);
        displayChangeAnswerDiv(question_id, true);
        displayArbitrationDiv(question_id, true);
        displayFinalizationDiv(question_id, true, false);
    }).catch(function(e){
        console.log(e);
    });
});

$('#request_finalization').on('click', function(event){
    var question_id = $('#question_id').val();

    RealityCheck.deployed().then(function(instance){
        var rc = instance;
        return rc.finalize(question_id, {from: account});
    }).then(function(result){
        console.log('after finalized', result);
        displayChangeAnswerDiv(question_id, true);
        displayArbitrationDiv(question_id, true);
        displayFinalizationDiv(question_id, false, true);
    }).catch(function(e){
        console.log(e);
    });
});
