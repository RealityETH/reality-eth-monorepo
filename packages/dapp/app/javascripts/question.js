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
    RealityCheck.deployed().then(function(instance){
        var rc = instance;
        return rc.questions.call(question_id, {from: account});
    }).then(function(result){
        console.log('in loadQuestionInfo');
        console.log('question_id', question_id);
        console.log(result);
        console.log(getDateString(result[4]));
        var question_posted = result[0];
        var deadline = result[4];
        var question_text = result[3];

        question_posted = getDateString(question_posted);

        var d = new Date();
        deadline = getDateString(deadline);

        $('#question_text').text(question_text);
        $('#question_posted').text('Posted ' + question_posted);
        $('#deadline').text('You have until ' + deadline + ' to answer this question');
    }).catch(function (e) {
        console.log(e);
    });
}