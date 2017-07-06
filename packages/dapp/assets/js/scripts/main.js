// TODO: Check if there was a reason to do this instead of import
//require('../../../node_modules/gsap/src/uncompressed/plugins/ScrollToPlugin.js');

var rc_json = require('../../../truffle/build/contracts/RealityCheck.json');
var arb_json = require('../../../truffle/build/contracts/Arbitrator.json');

var contract = require("truffle-contract");
var BigNumber = require('bignumber.js');

// These will be populated in onload, once web3 is loaded
var RealityCheck; 
var Arbitrator;

var account;

// questions timeline
var timeline_best = [];
var timeline_latest = [];
var timeline_high_reward = [];
var timeline_resolved = [];
var timeline_pointer = {'latest':0, 'high-reward':0, 'resolved':0};

// data for question detail window
var question_detail_list = [];

var $ = require('jquery-browserify')

import imagesLoaded from 'imagesloaded';
import interact from 'interact.js';
import Ps from 'perfect-scrollbar';
import {TweenLite, Power3, ScrollToPlugin} from 'gsap';
//import {TweenLite, Power3} from 'gsap';

'use strict';

function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

var clickCounter = 9;
var isFirstFocusBond = true;
var isFirstErrorEditOption = true;
var editOptionId = 0;

var bondUnit = 0;
var _bondValue = 0;
var bondValue = bondUnit + _bondValue;

const monthList = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
        'Dec'
];

// set rcBrowser height
function rcbrowserHeight() {
console.log('skipping auto rcbrowserHeight');
return;
    const rcbrowserHeaders  = document.querySelectorAll('.rcbrowser-header');
    const rcbrowserMains  = document.querySelectorAll('.rcbrowser-main');
    var _maxHeight = document.documentElement.clientHeight * .9;
    for (let i = 0, len = rcbrowserHeaders.length; i < len; i += 1) {
        let parent = rcbrowserHeaders[i].parentNode.parentNode;
        let parentRect = parent.getBoundingClientRect();
        let parentRectTop = parentRect.top;
        let maxHeight = _maxHeight - parentRectTop;
        let _headerHeight = rcbrowserHeaders[i].clientHeight;
        let _mainHeight = rcbrowserMains[i].clientHeight + 15;
        let _height = _headerHeight + _mainHeight;
        let height = Math.min(_height, maxHeight);
        parent.style.height = height + 'px';
    }
}
rcbrowserHeight();

// initialize
(function() {
    const answerItems = document.querySelectorAll('.answer-item');

    function clickHandler() {
        let answerData = this.querySelector('.answer-data');
        if (!this.hasClass('is-open')) {
            this.addClass('is-open');
            answerData.style.display = 'block';
            answerData.addClass('is-bounce');
        } else {
            this.removeClass('is-open');
            answerData.style.display = 'none';
            answerData.removeClass('is-bounce');
        }

        rcbrowserHeight();
    }

    for (let i = 0, len = answerItems.length; i < len; i += 1) {
        answerItems[i].addEventListener('click', clickHandler);
    }
})();

// set rcBrowser
(function() {
    const items = document.querySelectorAll('.rcbrowser');
    const winWidth = document.documentElement.clientWidth;
    const winHeight = document.documentElement.clientHeight;
    const paddingTop = winHeight * 0.1;
    const paddingLeft = winWidth * 0.1;
    for (let i = 0, len = items.length; i < len; i += 1) {
        var itemWidth = Math.min(items[i].clientWidth, winWidth * 0.9);
        var itemHeight = Math.min(items[i].clientHeight, winHeight * 0.9);
        var topMax = document.documentElement.clientHeight - itemHeight - paddingTop;
        var leftMax = document.documentElement.clientWidth - itemWidth - paddingLeft;
        items[i].style.top = rand(paddingTop, topMax) + 'px';
        items[i].style.left = rand(paddingLeft, leftMax) + 'px';
    }
})();

// arbitration
(function() {
    const buttons = document.querySelectorAll('.final-answer-button');
    const rcBrowsers = document.querySelectorAll('.rcbrowser');

    function clickHandler(e) {
        e.stopPropagation();

        const rcBrowserId = this.getAttribute('data-browser-id');
        var currentBrowser = null;
        for (let i = 0, len = rcBrowsers.length; i < len; i += 1) {
            var id = rcBrowsers[i].getAttribute('data-browser-id');
            if (id === rcBrowserId) {
                currentBrowser = rcBrowsers[i];
            }
        }

        // set Final Answer
        currentBrowser.querySelector('.current-answer-body').children[0].textContent = this.getAttribute('data-answer');

        // set resolved date
        const date = new Date();
        const resolvedDate = monthList[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
        currentBrowser.querySelector('.rcbrowser-main-header-subtitle').innerHTML = 'Resolved at ' + resolvedDate;

        // delete deadline
        currentBrowser.querySelector('.answer-deadline').parentNode.removeChild(currentBrowser.querySelector('.answer-deadline'));

        // delete apply for ...
        currentBrowser.querySelector('.arbitration-button--applied').parentNode.removeChild(currentBrowser.querySelector('.arbitration-button--applied'));

        // delete time
        currentBrowser.querySelector('.current-answer-time').parentNode.removeChild(currentBrowser.querySelector('.current-answer-time'));

        // change word current answer
        currentBrowser.querySelector('.current-answer-header').innerHTML = '<span>Final Answer</span>';

        // delete answer history container
        currentBrowser.querySelector('.answered-history-container').parentNode.removeChild(currentBrowser.querySelector('.answered-history-container'));

        currentBrowser.querySelector('.current-answer-container').style.marginTop = 0;

        currentBrowser.querySelector('.current-answer-item').addClass('is-bounce');

        for (let i = 0, len = buttons.length; i < len; i += 1) {
            buttons[i].parentNode.removeChild(buttons[i]);
        }

        rcbrowserHeight();
    }

    for (let i = 0, len = buttons.length; i < len; i += 1) {
        buttons[i].addEventListener('click', clickHandler);
    }
})();

// apply for arbitration
(function() {
    const arbitrationButtons = document.querySelectorAll('.arbitration-button');

    function clickOpenHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        metamask.addClass('is-open');

        setTimeout(function() {
            metamask.removeClass('is-open');
            this.parentNode.innerHTML = '<div class="arbitration-button" style="color: #fff;">Applied for arbitration at Jonh Doe.</div>';
            this.addClass('is-bounce');
        }.bind(this), 3000);

        setTimeout(function() {
            this.removeClass('is-bounce');
        }.bind(this), 5000);
    }

    for (let i = 0, len = arbitrationButtons.length; i < len; i += 1) {
        arbitrationButtons[i].addEventListener('click', clickOpenHandler);
    }
})();

// RCBrowser custom scrollbar
(function() {
    const rcbrowsers = document.querySelectorAll('.rcbrowser-inner');

    for (let i = 0, len = rcbrowsers.length; i < len; i += 1) {
        Ps.initialize(rcbrowsers[i]);
    }

    function changeSize() {
        for (let i = 0, len = rcbrowsers.length; i < len; i += 1) {
            Ps.update(rcbrowsers[i]);
        }
    }
    window.addEventListener('resize', changeSize);
})();

// draggable
interact('.rcbrowser-header').draggable({
    // enable inertial throwing
    inertia: false,
    // keep the element within the area of it's parent
    restrict: {
        restriction: 'self',
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // enable autoScroll
    autoScroll: false,

    // call this function on every dragmove event
    onmove: dragMoveListener,
});
function dragMoveListener (event) {
    clickCounter += 1;
    var target = event.target.parentNode.parentNode;
    target.style.zIndex = clickCounter;
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}
// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;

// see all notifications
(function() {
    const rcBrowser = document.querySelector('.rcbrowser--your-qa');
    const container = document.querySelector('.rcbrowser-main-body--your-qa');
    const anchor = document.querySelector('.see-all-notifications');
    const notifications = [].slice.call(document.querySelectorAll('.notifications-item'));
    var notificationsList = [];
    const docFragment = document.createDocumentFragment();

    for (let i = 0; i < 4; i += 1) {
        for (let i = 0, len = notifications.length; i < len; i += 1) {
            notificationsList.push(notifications[i]);
        }
    }

    function clickHandler(e) {
        e.preventDefault();

        container.textContent = null;

        rcBrowser.addClass('is-loading');
        setTimeout(function() {
            const notificationsListLength = notificationsList.length;
            for (let i = 0; i < notificationsListLength; i += 1) {
                const elementContainer = document.createElement('div');
                elementContainer.setAttribute('class', 'notifications-item rcbrowser__open-button');
                elementContainer.setAttribute('data-target-id', 'id1');
                elementContainer.innerHTML = notificationsList[i].innerHTML;

                docFragment.appendChild(elementContainer);
            }
            container.appendChild(docFragment);
            setRCBAnchor();
            rcBrowser.removeClass('is-loading');
        }, 1500);
    }

    anchor.addEventListener('click', clickHandler);
})();

// page loaded
(function() {
    function loadHandler() {
        imagesLoaded( document.getElementById('cover'), { background: true }, function() {
            $('<body>').addClass('is-page-loaded');
        });
    }
    window.addEventListener('load', loadHandler);
})();

// smooth scroll
(function() {
    const elements = document.querySelectorAll('[href^="#"]');

    function clickHandler(e) {
        e.preventDefault();
        const duration = 2;
        const href = this.getAttribute('href');
        const target = href === '#' || href === null ? 'html' : href;
        const targetPosition = target === 'html' ? 0 : document.querySelectorAll(target)[0].getBoundingClientRect().top + window.pageYOffset;
        TweenLite.to(window, duration, { scrollTo: {y: targetPosition, autoKill: true}, ease: Power3.easeOut });
    }

    for (let i = 0, len = elements.length; i < len; i += 1) {
        elements[i].addEventListener('click', clickHandler);
    }
})();

// observe a search-form
(function() {
    const inputElement = document.getElementById('search-input');
    const formElement = document.getElementById('search-form');
    const reslutNumberElement = document.getElementById('result-number');
    var timer = null;

    function focusHandler() {
        function update() {
            if (inputElement.value === '') {
                formElement.style.borderColor = '#3a3c40';
                reslutNumberElement.textContent = '';
            } else if (inputElement.value === 'y' || inputElement.value === 'ya' || inputElement.value === 'yan') {
                formElement.style.borderColor = '#0d6ffc';
                reslutNumberElement.style.color = '#0d6ffc';
                reslutNumberElement.textContent = '6 Hit';
            } else if (inputElement.value === 'yank') {
                formElement.style.borderColor = '#0d6ffc';
                reslutNumberElement.style.color = '#0d6ffc';
                reslutNumberElement.textContent = '3 Hit';
            } else if (inputElement.value === 'yanke' || inputElement.value === 'yankee' || inputElement.value === 'yankees') {
                formElement.style.borderColor = '#0d6ffc';
                reslutNumberElement.style.color = '#0d6ffc';
                reslutNumberElement.textContent = '1 Hit';
            }
            // no hit
            else {
                formElement.style.borderColor = '#ff4444';
                reslutNumberElement.style.color = '#ff4444';
                reslutNumberElement.textContent = '0 Hit';
            }
            timer = setTimeout(update, 60);
        }
        update();
    }

    function blurHandler() {
        formElement.style.borderColor = '#3a3c40';
        reslutNumberElement.textContent = '';
        clearTimeout(timer);
    }

    inputElement.addEventListener('focus', focusHandler);
    inputElement.addEventListener('blur', blurHandler);
})();

/*-------------------------------------------------------------------------------------*/
// window for posting a question

$('#post-a-question-button').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('#post-a-question-window').css('z-index', 10);
    $('#post-a-question-window').addClass('is-open');
    $('#post-a-question-window').css('height', '800px');
});

$('#close-question-window').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('#post-a-question-window').css('z-index', 0);
    $('#post-a-question-window').removeClass('is-open');
});

$('#post-question-submit').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();

    var question_body = $('#question-body');
    var reward = $('#question-reward');
    var step_delay = $('#step-delay');
    var step_delay_val = step_delay.val() * 24 * 60 * 60;
    var arbitrator =$('#arbitrator');
    var question_type = $('#question-type');
    var answer_options = $('.answer-option');
    var outcomes = [];
    for (var i = 0; i < answer_options.length; i++) {
        outcomes[i] = answer_options[i].value;
    }

    if (validate()) {
        var question = {
            title: question_body.val(),
            type: question_type.val(),
            outcomes: outcomes
        }
        var question_json = JSON.stringify(question);

        RealityCheck.deployed().then(function (rc) {
            account = web3.eth.accounts[0];
            return rc.askQuestion(question_json, arbitrator.val(), step_delay_val, 0, 1, {from: account, value: parseInt(reward.val())});
        }).then(function (result) {
            question_body.val('');
            reward.val('0');
            step_delay.prop('selectedIndex', 0);
            arbitrator.prop('selectedIndex', 0);
            question_type.prop('selectedIndex', 0);
            $('#answer-option-container').removeClass('is-open');
            $('#answer-option-container').css('height', 0);
            $('.answer-option').remove();
        }).catch(function (e) {
            console.log(e);
        });

    }

});

function validate() {
    var valid = true;

    var qtext = $('#question-body');
    if (qtext.val() == '') {
        qtext.closest('div').addClass('is-error');
        valid = false;
    } else {
        qtext.closest('div').removeClass('is-error');
    }

    var reward = $('#question-reward');
    if (reward.val() === '' || reward.val() <= 0) {
        reward.parent().parent().addClass('is-error');
        valid = false;
    } else {
        reward.parent().parent().removeClass('is-error');
    }

    var options_num = 0;
    var question_type = $('#question-type');
    var answer_options = $('.answer-option').toArray();
    for (var i = 0; i < answer_options.length; i++) {
        if (answer_options[i].value !== '') {
            options_num += 1;
        }
    }
    if ($('#answer-option-container').hasClass('is-open') && question_type.val() == 'select' && options_num < 2) {
        $('.edit-option-inner').addClass('is-error');
        valid = false;
    } else {
        $('.edit-option-inner').removeClass('is-error');
    }

    var select_ids = ['#question-type', '#arbitrator', '#step-delay'];
    for (var id of select_ids) {
        if ($(id).prop('selectedIndex') == 0) {
            $(id).parent().addClass('is-error');
            valid = false;
        } else {
            $(id).parent().removeClass('is-error');
        }
    }


    return valid;
}

/*-------------------------------------------------------------------------------------*/
// for generating timelines

function makeTimeline(question, initial) {
    return new Promise(function (resolve, reject) {
        RealityCheck.deployed().then(function (rc) {
            return rc.questions.call(question.args.question_id);
        }).then(function (question_data) {
            question_data.unshift(question.args.question_id);

            // latest and resolved
            var found = false;
            for (var i = 0; i < timeline_latest.length; i++) {
                if (question_data[1].toNumber() < timeline_latest[i][1].toNumber()) {
                    if (question_data[9]) {
                        // resolved
                        //timeline_resolved.push(question_data);
                    }
                    timeline_latest.splice(i, 0, question_data);
                    found = true;
                    break;
                }
            }
            if (!found || timeline_latest.length == 0) {
                timeline_latest.push(question_data);
            }

            // high reward
            var found = false;
            for (var i = 0; i < timeline_high_reward.length; i++) {
                if (question_data[6].toNumber() < timeline_high_reward[i][6].toNumber()) {
                    timeline_high_reward.splice(i, 0, question_data);
                    found = true;
                    break;
                }
            }
            if (!found || timeline_high_reward.length == 0) {
                timeline_high_reward.push(question_data);
            }

            if (!initial) {
                populateSection('questions-latest', question_data);
                populateSection('questions-high-reward', question_data);
            }
            resolve();
        }).catch(function (e) {
            console.log(e);
        });
    });
};

function populateSection(section_name, question_data, initial) {
    var question_id = question_data[0];
    var question_item_id = 'question-' + question_id;
    var target_question_id = 'qadetail-' + question_id;
    section_name = '#' + section_name;
    var section = $(section_name);

    var question_json;
    try {
        question_json = JSON.parse(question_data[4]);
    } catch(e) {
        question_json = {
            'title': question_data[4]
        };
    }

    var options = '';
    if (typeof question_json['outcomes'] !== 'undefined') {
        for (var i = 0; i < question_json['outcomes'].length; i++) {
            options = options + i + ':' + question_json['outcomes'][i] + ', ';
        }
    }

    var posted_ts = question_data[1];
    var arbitrator = question_data[2];
    var step_delay = question_data[3];
    var question_text_raw = question_data[4];
    var deadline = question_data[5];
    var bounty = question_data[6];
    var arbitration_bounty = question_data[7];
    var is_arbitration_paid_for = question_data[8];
    var is_finalized = question_data[9];
    var best_answer_id = question_data[10];

    var entry = $('.questions__item.template-item').clone();
    entry.attr('id', question_item_id).removeClass('template-item');
    entry.find('.questions__item__title').attr('data-target-id', target_question_id);
    entry.find('.question-title').text(question_json['title']);
    entry.find('.question-age').text(posted_ts);
    entry.find('.question-bounty').text(bounty);
    entry.css('display', 'block');

    if (initial) {
        section.children('.questions-list').prepend(entry);
    } else {
        section.children('.questions-list').append(entry);
    }

}

$('#loadmore-latest').on('click', function(e){
    var from = timeline_pointer['latest'] - 1;
    var to = timeline_pointer['latest'] - 3;
    for (var i = from; i >= to; i--) {
        populateSection('questions-latest', timeline_latest[i], false);
    }
    timeline_pointer['latest'] = to;
});
$('#loadmore-high-reward').on('click', function(e){
    var from = timeline_pointer['high-reward'] - 1;
    var to = timeline_pointer['high-reward'] - 3;
    for (var i = from; i >= to; i--) {
        populateSection('questions-high-reward', timeline_high_reward[i], false);
    }
    timeline_pointer['high-reward'] = to;
});

/*-------------------------------------------------------------------------------------*/
// question detail window

(function() {

    $('#question-type').on('change', function(e){
        var container = $('#answer-option-container');
        if ($('#question-type').val() == 'single-select' || $('#question-type').val() == 'multiple-select') {
            if (!container.hasClass('is-open')) {
                container.css('display', 'block');
                container.addClass('is-open');
                container.addClass('is-bounce');
            }
        } else {
            container.css('display', 'none');
            container.removeClass('is-open');
            container.removeClass('is-bounce');
            $('#first-answer-option').children().val('');
            $('.input-container--answer-option').remove();
        }
    });

    $('.add-option-button').on('click', function(e){
        var element = $('<div>');
        element.addClass('input-container input-container--answer-option');
        var input = '<input type="text" name="editOption0" class="rcbrowser-input answer-option form-item" placeholder="Enter the option...">';
        element.append(input);
        $('#error-container--answer-option').before(element);
        element.addClass('is-bounce');
    });
})();

$(document).on('click', '.questions__item__title', function(e){
    var rc;
    var current_question;

    if (e.target.nodeName.toLowerCase() == 'span') {
        var rcqa_id = e.target.parentNode.getAttribute('data-target-id');
    } else if (e.target.nodeName.toLowerCase() == 'a') {
        rcqa_id = e.target.getAttribute('data-target-id');
    }

    var question_id = rcqa_id.replace('qadetail-', '');
    RealityCheck.deployed().then(function(instance){
        rc = instance;
        return rc.questions.call(question_id);
    }).then(function(result){
        current_question = result;
        return rc.LogNewAnswer({question_id:question_id}, {fromBlock:0, toBlock:'latest'});
    }).then(function(answer_posted){
        answer_posted.get(function(error, result){
            if (error === null && typeof result !== 'undefined') {
                question_detail_list[question_id] = current_question;
                question_detail_list[question_id]['history'] = result;

                console.log('question_id', question_id);
                console.log('question detail', question_detail_list);

                displayQuestionDetail(question_id);
                displayAnswerHistory(question_id);
            } else {
                console.log(error);
            }
        });
    }).catch(function(e){
        console.log(e);
    });
});
$(document).on('click', '.rcbrowser__close-button', function(){
   var question_id = $(this).closest('div.rcbrowser--qa-detail').attr('id');
   $('div#' + question_id).remove();
   question_id = question_id.replace('qadetail-', '');
   delete question_detail_list[question_id]
});

function displayQuestionDetail(question_id) {
    var question_detail = question_detail_list[question_id];
    var idx = question_detail['history'].length - 1;
    var latest_answer = question_detail['history'][idx].args;
    var question_json;

    try {
        question_json = JSON.parse(question_detail[3]);
    } catch(e) {
        question_json = {
            'title': question_detail[3],
            'type': 'binary'
        };
    }
    var question_type = question_json['type'];

    var rcqa = $('.rcbrowser--qa-detail.template-item').clone();
    rcqa.attr('id', 'qadetail-' + question_id);
    rcqa.removeClass('template-item');

    rcqa.find('.question-title').text(question_json['title']);
    rcqa.find('.reward-value').text(question_detail[5]);
    rcqa.find('.arbitrator').text(question_detail[1]);
    rcqa.find('.current-answer-container').attr('id', 'answer-' + latest_answer.answer_id);

    // answerer data
    var ans_data = rcqa.find('.current-answer-container').find('.answer-data');
    ans_data.find('.answerer').text(latest_answer.answerer);
    ans_data.find('.answer-bond-value').text(latest_answer.bond);

    // label for show the current answer.
    var label = getAnswerString(question_json, latest_answer);
    rcqa.find('.current-answer-body').find('.current-answer').text(label);

    Arbitrator.at(question_detail[1]).then(function(arb) {
        return arb.getFee.call(question_id);
    }).then(function(fee) {
        rcqa.find('.arbitration-fee').text(fee.toString());
    });

    var ans_frm = makeSelectAnswerInput(question_json);
    ans_frm.css('display', 'block');
    ans_frm.addClass('is-open');
    ans_frm.removeClass('template-item');
    rcqa.find('.answered-history-container').after(ans_frm);

    $('#qa-detail-container').append(rcqa);
    rcqa.css('display', 'block');
    rcqa.addClass('is-open');
    rcqa.css('z-index',10);

    // final answer button
    showFAButton(question_id, question_detail[2], latest_answer.ts);

    var rc;
    RealityCheck.deployed().then(function(instance){
        rc = instance;
        return rc.LogNewAnswer({question_id:question_id}, {fromBlock:'latest', toBlock:'latest'});
    }).then(function(answer_posted){
        answer_posted.watch(function(error, result){
            question_detail_list[question_id][9] = result.args.answer_id;
            pushWatchedAnswer(result);
            rewriteQuestionDetail(question_id);
        });
    }).catch(function (e){
        console.log(e);
    });

}

function rewriteQuestionDetail(question_id) {
    var question_data = question_detail_list[question_id];
    var idx = question_data['history'].length - 1;
    var answer_data = question_data['history'][idx];
    var answer_id = 'answer-' + answer_data.args.answer_id;
    var answer = answer_data.args.answer.toNumber();

    try {
        var question_json = JSON.parse(question_data[3]);
    } catch(e) {
        question_json = {
            'title': question_data[3]
        };
    }

    var bond = answer_data.args.bond.toNumber();
    var section_name = 'div#qadetail-' + question_id + '.rcbrowser.rcbrowser--qa-detail';
    $(section_name).find('.current-answer-container').attr('id', answer_id);
    var label = getAnswerString(question_json, answer_data.args);
    $(section_name).find('.current-answer-container').find('.current-answer').text(label);
    $(section_name).find('input[name="numberAnswer"]').val(0);
    $(section_name).find('input[name="questionBond"]').val(bond * 2);

    // show final answer button
    showFAButton(question_id, question_data[2], answer_data.args.ts);

    var ans_data = $(section_name).find('.current-answer-container').find('.answer-data');
    ans_data.find('.answerer').text(answer_data.args.answerer);
    ans_data.find('.answer-bond-value').text(bond);

    displayAnswerHistory(question_id);

}

function getAnswerString(question_json, answer_data) {
    var label = '';
    switch (question_json['type']) {
        case 'number':
            label = answer_data.answer.toString();
            break;
        case 'binary':
            if (answer_data.answer.toNumber() === 1) {
                label = 'Yes';
            } else if (answer_data.answer.toNumber() === 0) {
                label = 'No';
            }
            break;
        case 'single-select':
            if (typeof question_json['outcomes'] !== 'undefined' && question_json['outcomes'].length > 0) {
                var idx = answer_data.answer.toNumber();
                label = question_json['outcomes'][idx];
            }
            break;
        case 'multiple-select':
            if (typeof question_json['outcomes'] !== 'undefined' && question_json['outcomes'].length > 0) {
                var answer_bits = answer_data.answer.toString(2);
                var length = answer_bits.length;

                for (var i = answer_bits.length - 1; i >= 0; i--) {
                    if (answer_bits[i] === '1') {
                        var idx = answer_bits.length - 1 - i;
                        label += question_json['outcomes'][idx] + ' / ';
                    }
                }
                label = label.substr(0, label.length - 3);
            }
            break;
    }

    return label;
}

function makeSelectAnswerInput(question_json) {
    var type = question_json['type'];
    var options = question_json['outcomes'];
    var template_name = '.answer-form-container.' + question_json['type'] + '.template-item';
    var ans_frm = $(template_name).clone();
    ans_frm.removeClass('template-item');

    switch (type) {
        case 'single-select':
            for (var i = 0; i < options.length; i++ ) {
                var option_elm = $('<option>');
                option_elm.val(i);
                option_elm.text(options[i]);
                ans_frm.find('.select-answer').append(option_elm);
            }
            break;
        case 'multiple-select':
            for (var i = 0; i < options.length; i++ ) {
                var checkbox_elm = $('<input>');
                checkbox_elm.attr('type', 'checkbox');
                checkbox_elm.attr('name', 'input-answer');
                checkbox_elm.addClass('rcbrowser-input--checkbox form-item form-item-value');
                checkbox_elm.val(i);
                checkbox_elm.text('<span>' + options[i] + '</span>');
                ans_frm.find('.input-container.input-container--checkbox').children('.error-container').before(checkbox_elm);
            }
            ans_frm.find('input:checkbox').wrap('<label></label>');
            break;
    }

    return ans_frm;
}

function displayAnswerHistory(question_id) {
    var question_data = question_detail_list[question_id];
    var answer_log = question_data['history'];
    var section_name = 'div#qadetail-' + question_id + '.rcbrowser.rcbrowser--qa-detail';
    var section = $(section_name);

    section.find('.answered-history-item-container:not(".template-item")').remove();

    answer_log.forEach(function(answer){
        // skip current answer.
        if (answer.args.answer_id == question_data[9]) {
            return;
        }

        var answer_id = 'answer-' + answer.args.answer_id;
        var ans = answer.args.answer.toNumber();

        var container = $('.answered-history-item-container.template-item').clone();
        container.removeClass('template-item');
        container.css('display', 'block');
        container.attr('id', answer_id);

        section.find('.answered-history-header').after(container);

        try {
            var question_json = JSON.parse(question_data[3]);
        } catch(e) {
            question_json = {
                'title': question_data[3]
            };
        }

        section_name = 'div#' + answer_id;
        var label = getAnswerString(question_json, answer.args);
        $(section_name).find('.answer-item.answered-history-item').find('.current-answer').text(label);

        var ans_data = $(section_name).find('.answer-item.answered-history-item').find('.answer-data');
        ans_data.find('.answerer').text(answer.args.answerer);
        ans_data.find('.answer-bond-value').text(answer.args.bond.toNumber());

    });
}

// show final answer button
function showFAButton(question_id, step_delay, answer_created) {
    var d = new Date();
    var now = d.getTime();
    var section_name = 'div#qadetail-' + question_id + '.rcbrowser--qa-detail';
    if (now - answer_created * 1000 > step_delay * 1000) {
        $(section_name).find('.final-answer-button').css('display', 'block');
    }
}

$(document).on('click', '.final-answer-button', function(){
    var question_id = $(this).closest('div.rcbrowser--qa-detail').attr('id');
    question_id = question_id.replace('qadetail-', '');
    RealityCheck.deployed().then(function(rc) {
        return rc.finalize(question_id, {from: web3.eth.accounts[0]});
    }).then(function(result){
        console.log('finalized!', result);
    }).catch(function(e){
       console.log('on click FA button', e);
    });
});

function pushWatchedAnswer(answer) {
    var question_id = answer.args.question_id;
    var already_exists = false;
    var length = question_detail_list[question_id]['history'].length;

    for (var i = 0; i < length; i++) {
        if (question_detail_list[question_id]['history'][i].args.answer_id == answer.args.answer_id) {
            already_exists = true;
            break;
        }
    }

    if (!already_exists) {
        question_detail_list[question_id]['history'].push(answer);
    }
}

$(document).on('click', 'div.answered-history-item-container,div.current-answer-container', function(){
    var section_name = 'div#' + $(this).attr('id');
    if ($(section_name).find('.answer-data').hasClass('is-bounce')) {
         $(section_name).find('.answer-data').removeClass('is-bounce');
         $(section_name).find('.answer-data').css('display', 'none');
     } else {
        $(section_name).find('.answer-data').addClass('is-bounce');
        $(section_name).find('.answer-data').css('display', 'block');
     }
});

// post an answer
$(document).on('click', '.post-answer-button', function(e){
    e.preventDefault();
    e.stopPropagation();

    var parent_div = $(this).parents('div.rcbrowser--qa-detail');
    var question_id = parent_div.attr('id');
    question_id = question_id.replace('qadetail-', '');
    var bond = parseInt(parent_div.find('input[name="questionBond"]').val());

    var account = web3.eth.accounts[0];
    var rc;
    var question, current_answer, new_answer;
    var question_json;
    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.questions.call(question_id);
    }).then(function(result) {
        question = result;

        try {
            question_json = JSON.parse(question[3]);
        } catch(e) {
            question_json = {
                'title': question[3],
                'type': 'binary'
            };
        }

        if (question_json['type'] == 'multiple-select') {
            var checkbox = parent_div.find('[name="input-answer"]');
            var answers = checkbox.filter(':checked');
            var values = [];
            for (var i = 0; i < answers.length; i++) {
                values.push(parseInt(answers[i].value));
            }
            var answer_bits = '';
            for (var i = checkbox.length - 1; i >= 0; i--) {
                if (values.indexOf(i) == -1) {
                    answer_bits += '0';
                } else {
                    answer_bits += '1';
                }
            }
            new_answer = parseInt(answer_bits, 2);
        } else {
            new_answer = parseInt(parent_div.find('[name="input-answer"]').val());
        }

        return rc.answers.call(question[9]);
    }).then(function(result){
        current_answer = result;

        // check answer
        var is_err = false;
        switch (question_json['type']) {
            case 'binary':
                if (isNaN(new_answer) || (new_answer !== 0 && new_answer !== 1)) {
                    parent_div.find('div.select-container.select-container--answer').addClass('is-error');
                    is_err = true;
                }
                break;
            case 'number':
                if (isNaN(new_answer) || new_answer === '') {
                    parent_div.find('div.input-container.input-container--answer').addClass('is-error');
                    is_err = true;
                }
                break;
            case 'single-select':
                var container = parent_div.find('div.select-container.select-container--answer');
                var select = container.find('select[name="input-answer"]');
                if (select.prop('selectedIndex') == 0) {
                    container.addClass('is-error');
                    is_err = true;
                }
                break;
            case 'multiple-select':
                var container = parent_div.find('div.input-container.input-container--checkbox');
                var checked = container.find('input[name="input-answer"]:checked');
                if (checked.length == 0) {
                    container.addClass('is-error');
                    is_err = true;
                }
                break;
        }

        // check bond
        var min_amount = current_answer[3] * 2;
        if (isNaN(bond) || (bond < min_amount) || (min_amount === 0 && bond  < 1)) {
            parent_div.find('div.input-container.input-container--bond').addClass('is-error');
            if (min_amount === 0) {
                min_amount = 1;
            }
            parent_div.find('div.input-container.input-container--bond').find('.min-amount').text(min_amount);
            is_err = true;
        }

        if (is_err) throw('err on submitting answer');
        return rc.submitAnswer(question_id, new_answer, '', {from:account, value:bond});
    }).then(function(result){
        parent_div.find('div.input-container.input-container--answer').removeClass('is-error');
        parent_div.find('div.select-container.select-container--answer').removeClass('is-error');
        parent_div.find('div.input-container.input-container--bond').removeClass('is-error');
        parent_div.find('div.input-container.input-container--checkbox').removeClass('is-error');

        switch (question_json['type']) {
            case 'binary':
                parent_div.find('select[name="input-answer"]').prop('selectedIndex', 0);
                break;
            case 'number':
                parent_div.find('input[name="input-answer"]').val('');
                break;
            case 'single-select':
                parent_div.find('select[name="input-answer"]').prop('selectedIndex', 0);
                break;
            case 'multiple-select':
                var container = parent_div.find('div.input-container.input-container--checkbox');
                container.find('input[name="input-answer"]:checked').prop('checked', false);
                break;
        }
    }).catch(function(e){
        console.log(e);
    });
});

// open/close/add reward
$(document).on('click', '.add-reward-button', function(e){
    var container = $(this).closest('.rcbrowser--qa-detail').find('.add-reward-container');
    container.addClass('is-open');
    container.addClass('is-bounce');
    container.css('display', 'block');
});
$(document).on('click', '.add-reward__close-button', function(e){
    var container = $(this).closest('.rcbrowser--qa-detail').find('.add-reward-container');
    container.removeClass('is-open');
    container.removeClass('is-bounce');
    container.css('display', 'none');
});
$(document).on('click', '.rcbrowser-submit.rcbrowser-submit--add-reward', function(e){
    e.preventDefault();
    e.stopPropagation();

    var question_id = $(this).closest('.rcbrowser--qa-detail').attr('id');
    question_id = question_id.replace('qadetail-', '');
    var reward = $(this).parent('div').prev('div.input-container').find('input[name="question-reward"]').val();
    reward = parseInt(reward);

    if (isNaN(reward) || reward <= 0) {
        $(this).parent('div').prev('div.input-container').addClass('is-error');
    } else {
        RealityCheck.deployed().then(function (rc) {
            return rc.fundAnswerBounty(question_id, {from: web3.eth.accounts[0], value: reward});
        }).then(function (result) {
            console.log('fund bounty', result);
        });
    }
});

/*-------------------------------------------------------------------------------------*/
// reset error messages

$('.rcbrowser-textarea').on('keyup', function(e){
    if ($(this).val() !== '') {
        $(this).closest('div').removeClass('is-error');
    }
});
$('#question-reward').on('keyup', function(e){
    if ($(this).val() > 0) {
        $(this).parent().parent().removeClass('is-error');
    }
});
$('#question-type,#step-delay,#arbitrator').on('change', function (e) {
    if ($(this).prop('selectedIndex') != 0) {
        $(this).parent().removeClass('is-error');
    }
});
$(document).on('change', 'select[name="input-answer"]', function (e) {
    if ($(this).prop('selectedIndex') != 0) {
        $(this).parent().removeClass('is-error');
    }
});
$(document).on('change', 'input[name="input-answer"]:checkbox', function(){
    var parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
    var container = parent_div.find('div.input-container.input-container--checkbox');
    var checked = container.find('input[name="input-answer"]:checked');
    if (checked.length > 0) {
        container.removeClass('is-error');
    }
});

/*-------------------------------------------------------------------------------------*/
// initial process
window.onload = function() {
    var rc;

    RealityCheck = contract(rc_json);
    RealityCheck.setProvider(web3.currentProvider);

    // Just used to get the default arbitator address
    Arbitrator = contract(arb_json);
    Arbitrator.setProvider(web3.currentProvider);
    Arbitrator.deployed().then(function(arb) {
        $('option.default-arbitrator-option').val(arb.address);
    });

    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.LogNewQuestion({}, {fromBlock:0, toBlock:'latest'});
    }).then(function(question_posted) {

        question_posted.get(function (error, result) {
            if (error === null) {

                result.reduce(function (prevValue, currentValue) {
                    return prevValue.then(function () {
                        return makeTimeline(currentValue, true);
                    });
                }, Promise.resolve()).then(function(result){
                    var length = timeline_latest.length;
                    if (length < 4) {
                        var from = 0;
                        var to = length;
                    } else {
                        var from = length - 3;
                        var to = length;
                    }
                    for (var i = from; i < to; i++) {
                        populateSection('questions-latest', timeline_latest[i], true);
                    }
                    timeline_pointer['latest'] = from;

                    var length = timeline_high_reward.length;
                    if (length < 4) {
                        var from = 0;
                        var to = length;
                    } else {
                        var from = length - 3;
                        var to = length;
                    }
                    for (var i = from; i < to; i++) {
                        populateSection('questions-high-reward', timeline_high_reward[i], true);
                    }
                    timeline_pointer['high-reward'] = from;

                    return rc.LogNewQuestion({}, {fromBlock:'latest', toBlock:'latest'});
                }).then(function(question_posted) {
                    question_posted.watch(function (error, result) {
                        console.log('watch new questions', result);
                        if (error === null) {
                            makeTimeline(result, false);
                        } else {
                            console.log(error);
                        }
                    });
                }).catch(function(e){
                    console.log(e);
                });
            } else {
                console.log(error);
            }
        });

    }).catch(function (e) {
        console.log(e);
    });
};
