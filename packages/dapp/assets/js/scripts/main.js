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

var timeline_best = [];
var timeline_latest = [];
var timeline_high_reward = [];
var timeline_resolved = [];
var timeline_pointer = {'latest':0, 'high-reward':0, 'resolved':0};

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

// get question type
(function() {

    $('#question-type').on('change', function(e){
        var container = $('#answer-option-container');
        if ($('#question-type').val() == 'select') {
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

// open/close add reward
(function() {
    const rcBrowsers = document.querySelectorAll('.rcbrowser');
    const openButtons = document.querySelectorAll('.add-reward-button');
    const closeButtons = document.querySelectorAll('.add-reward__close-button');

    function clickHandler() {
        const rcBrowserId = this.getAttribute('data-browser-id');
        for (let i = 0, len = rcBrowsers.length; i < len; i += 1) {
            var id = rcBrowsers[i].getAttribute('data-browser-id');
            if (id === rcBrowserId) {
                var currentBrowser = rcBrowsers[i];
            }
        }

        const container = currentBrowser.querySelector('.add-reward-container');

        if (container.hasClass('is-open')) {
            container.removeClass('is-open');
            container.style.display = 'none';
            container.removeClass('is-bounce');
        } else {
            container.addClass('is-open');
            container.style.display = 'block';
            container.addClass('is-bounce');
        }


        rcbrowserHeight();
    }

    for (let i = 0, len = openButtons.length; i < len; i += 1) {
        openButtons[i].addEventListener('click', clickHandler);
    }

    for (let i = 0, len = closeButtons.length; i < len; i += 1) {
        closeButtons[i].addEventListener('click', clickHandler);
    }
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

$('#post-a-question-button').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('#post-a-question-window').css('zindex', 10);
    $('#post-a-question-window').addClass('is-open');
    $('#post-a-question-window').css('height', '800px');
});

$('#close-question-window').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('#post-a-question-window').css('zindex', 0);
    $('#post-a-question-window').removeClass('is-open');
});

$('#post-question-submit').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();

    var question_body = $('#question-body');
    var reward = $('#question-reward');
    var step_delay = $('#step-delay');
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
        console.log('question json', question_json);

        RealityCheck.deployed().then(function (rc) {
            web3.eth.getBalance(account, function (err, result) {
                if (err === null) {
                    console.log('balance', result);
                }
            });

            console.log('askQuestion', question_json, arbitrator.val(), step_delay.val(), 0, 0, {from: account, value: reward.val()});
            return rc.askQuestion(question_json, arbitrator.val(), step_delay.val(), 0, 0, {from: account, value: reward.val()});
        }).then(function (result) {
            console.log(result);
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

function populateSection(section_name, question_data, initial) {
    var question_item_id = 'question-'+question_data[0];
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

function makeTimeline(question, initial) {
    return new Promise(function (resolve, reject) {
        RealityCheck.deployed().then(function (rc) {
            return rc.questions.call(question.args.question_id);
        }).then(function (question_data) {
            question_data.unshift(question.args.question_id);
            //console.log('question data', question_data);

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

$('#loadmore-latest').on('click', function(e){
    var from = timeline_pointer['latest'] - 1;
    var to = timeline_pointer['latest'] - 3;
    for (var i = from; i >= to; i--) {
        populateSection('questions-latest', timeline_latest[i], false);
    }
    timeline_pointer['latest'] = to;

    console.log(timeline_pointer);
});

$('#loadmore-high-reward').on('click', function(e){
    var from = timeline_pointer['high-reward'] - 1;
    var to = timeline_pointer['high-reward'] - 3;
    for (var i = from; i >= to; i--) {
        populateSection('questions-high-reward', timeline_high_reward[i], false);
    }
    timeline_pointer['high-reward'] = to;
});

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

    account = web3.eth.accounts[0];

    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.LogNewQuestion({}, {fromBlock:0, toBlock:'latest'});
    }).then(function(question_posted) {

        question_posted.get(function (error, result) {
            if (error === null) {
                console.log(result);

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