function getDateString(timestamp) {
    var d = new Date(timestamp * 1000);
    var year  = d.getFullYear();
    var month = d.getMonth() + 1;
    var day  = d.getDate();
    var hour = (d.getHours() < 10) ? '0' + d.getHours()   : d.getHours();
    var min  = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
    return year + '-' + month + '-' + day + ' ' + hour + ':' + min;
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
        question_json = JSON.parse(result[3]);
        return rc.LogNewAnswer.call({_sender: account}, {question_id: question_id}, {fromBlock: 0x00, toBlock: 'latest'})
    }).then(function(result){
        answer_posted = result;
        answer_posted.watch(function(error, result) {
            if (error === null) {
                var option = '';
                if (typeof question_json['outcomes'] !== 'undefined') {
                    option = question_json['outcomes'][result.args.answer];
                }

                var table_row = '<tr class="answer_history_row">'
                    + '<td>' + getDateString(result.args.ts) + '</td>'
                    + '<td>[' + parseInt(result.args.answer) + '] ' + option + '</td>'
                    + '<td>' + result.args.answerer + '</td>'
                    + '<td>' + result.args.bond + '</td>'
                    + '</tr>';
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