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

        $('#question_text').text(question_json['title']);
        $('#question_posted').text('Posted ' + question_posted);
        $('#deadline').text('You have until ' + deadline + ' to answer this question');

        return rc.answers.call(answer_id, {from: account});
    }).then(function(result){
        var answer = result;
        var answerLabel = '';
        if (typeof question_json['outcomes'] !== 'undefined') {
            answerLabel = question_json['outcomes'][answer[1]];
        }
        var answer_text = 'Current answer: [' + answer[1] + ']' + answerLabel + ' (Bond 100 ETH)';
        $('#current_answer').text(answer_text);
    }).catch(function (e) {
        console.log(e);
    });
}