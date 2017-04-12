function loadQuestions() {
    console.log('loading questions');
    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.LogNewQuestion({_sender: account}, {fromBlock:0x00, toBlock:'latest'});
    }).then(function(question_posted) {
        question_posted.watch(function(error, result) {
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
        return rc.questions.call(question_id, {from: account});
    }).then(function(result){
        console.log('in addQuestionRow');
        console.log('question_id', question_id);
        console.log(result);
        var question_json = JSON.parse(result[3]);
        var options = '';
        if (typeof question_json['outcomes'] !== 'undefined') {
            for (var i = 0; i < question_json['outcomes'].length; i++) {
                options = options + i + ':' + question_json['outcomes'][i] + ', ';
            }
        }

        var d = new Date(result[0] * 1000);
        var year  = d.getFullYear();
        var month = d.getMonth() + 1;
        var day  = d.getDate();
        var hour = (d.getHours() < 10) ? '0' + d.getHours()   : d.getHours();
        var min  = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
        var asked_datetime = year + '-' + month + '-' + day + ' ' + hour + ':' + min;

        var question_row = '<tr class="question-row">'
            + '<td class="test2">' + question_json['title'] + '<br>' + options + '</td>'
            + '<td>'+ asked_datetime + '</td>'
            + '<td>4</td>'
            + '<td>10</td>'
            + '<td>&nbsp;</td>'
            + '<td><a href="index.html#' + question_id + '">Detail</a></td>'
            + '</tr>';
        $('#question_table').append(question_row);
    }).catch(function (e) {
        console.log(e);
    });
}