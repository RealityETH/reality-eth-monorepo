function loadYourQuestions() {
    console.log('loading your questions.');
    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.LogNewQuestion.call({_sender: account}, {questioner: account}, {fromBlock:0x00, toBlock:'latest'});
    }).then(function(question_posted) {
        console.log(question_posted);
        question_posted.watch(function(error, result) {
            if (error === null) {
                var question_id = result.args.question_id;
                addYourQuestionRow(question_id);
            } else {
                console.log(e);
            }
        });
    }).catch(function (e) {
        console.log(e);
    });
}

function addYourQuestionRow(question_id) {
    var rc;
    var question;
    var answer;
    var asked_datetime;
    var question_json;
    var options = '';
    var bounty;
    var best_answer_id;
    var current_answer;
    var bond;

    RealityCheck.deployed().then(function(instance){
        rc = instance;
        return rc.questions.call(question_id, {from: account});
    }).then(function(result) {
        question = result;
        question_json = JSON.parse(question[3]);
        if (typeof question_json['outcomes'] !== 'undefined') {
            for (var i = 0; i < question_json['outcomes'].length; i++) {
                options = options + i + ':' + question_json['outcomes'][i] + ', ';
            }
        }
        bounty = question[5];
        best_answer_id = question[9];

        var d = new Date(question[0] * 1000);
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var hour = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
        var min = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
        asked_datetime = year + '-' + month + '-' + day + ' ' + hour + ':' + min;

        return rc.answers.call(best_answer_id, {from: account});
    }).then(function(result) {
        answer = result;
        current_answer = answer[1];
        bond = answer[3];

        var question_row = '<tr class="your-question-row">'
            + '<td class="test2">' + question_json['title'] + '<br>' + options + '</td>'
            + '<td>' + asked_datetime + '</td>'
            + '<td>' + parseInt(current_answer) + '</td>'
            + '<td>' + parseInt(bounty) + '</td>'
            + '<td>' + '?????' + '</td>'
            + '<td>' + parseInt(bond) + '</td>'
            + '<td><a href="index.html#' + question_id + '">Detail</a></td>'
            + '</tr>';
        $('#your_question_table').append(question_row);
    }).catch(function (e) {
        console.log(e);
    });
}

function loadYourAnsweredQuestions() {
    console.log('loading your answers.');
    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.LogNewAnswer.call({_sender: account}, {answerer: account}, {fromBlock:0x00, toBlock:'latest'});
    }).then(function(answer_posted) {
        var answer = [];
        answer_posted.watch(function(error, result) {
            if (error === null) {
                var question_id = result.args.question_id;
                var your_answer = result.args.answer;

                if (answer[question_id] < result.args.ts) {
                    addYourAnsweredRow(question_id, your_answer);
                }
            } else {
                console.log(e);
            }
        });
    }).catch(function (e) {
        console.log(e);
    });
}


function addYourAnsweredRow(question_id, your_answer) {
    var rc;
    var question;
    var answer;
    var asked_datetime;
    var question_json;
    var options = '';
    var bounty;
    var best_answer_id;
    var current_answer;
    var bond;

    RealityCheck.deployed().then(function(instance){
        rc = instance;
        return rc.questions.call(question_id, {from: account});
    }).then(function(result) {
        question = result;
        question_json = JSON.parse(question[3]);
        if (typeof question_json['outcomes'] !== 'undefined') {
            for (var i = 0; i < question_json['outcomes'].length; i++) {
                options = options + i + ':' + question_json['outcomes'][i] + ', ';
            }
        }
        bounty = question[5];
        best_answer_id = question[9];

        var d = new Date(question[0] * 1000);
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var hour = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
        var min = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
        asked_datetime = year + '-' + month + '-' + day + ' ' + hour + ':' + min;

        return rc.answers.call(best_answer_id, {from: account});
    }).then(function(result) {
        answer = result;
        current_answer = answer[1];
        bond = answer[3];

        var question_row = '<tr class="answered-question-row">'
            + '<td class="test2">' + question_json['title'] + '<br>' + options + '</td>'
            + '<td>' + asked_datetime + '</td>'
            + '<td>' + parseInt(current_answer) + '</td>'
            + '<td>' + parseInt(bounty) + '</td>'
            + '<td>' + parseInt(your_answer) + '</td>'
            + '<td>' + parseInt(bond) + '</td>'
            + '<td><a href="index.html#' + question_id + '">Detail</a></td>'
            + '</tr>';
        $('#answered_question_table').append(question_row);
    }).catch(function (e) {
        console.log(e);
    });
}