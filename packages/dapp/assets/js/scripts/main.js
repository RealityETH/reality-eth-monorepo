// TODO: Check if there was a reason to do this instead of import
//require('../../../node_modules/gsap/src/uncompressed/plugins/ScrollToPlugin.js');

'use strict';

var rc_json = require('../../../truffle/build/contracts/RealityCheck.json');
var arb_json = require('../../../truffle/build/contracts/Arbitrator.json');

var contract = require("truffle-contract");
var BigNumber = require('bignumber.js');
var timeago = require('timeago.js');
var timeAgo = new timeago();

// Struct array offsets
// Assumes we unshift the ID onto the start

// Question, as returned by questions()
const Qi_question_id = 0;
const Qi_created = 1;
const Qi_arbitrator = 2;
const Qi_step_delay = 3;
const Qi_question_text = 4;
const Qi_bounty = 5;
const Qi_is_arbitration_paid_for = 6;
const Qi_is_finalized = 7;
const Qi_best_answer_id = 8;

// Answer, as returned by answers()
const Ai_answer_id = 0;
const Ai_question_id = 1;
const Ai_answer = 2;
const Ai_answerer = 3;
const Ai_bond = 4;
const Ai_ts = 5;
const Ai_evidence = 6;

// BigNumber
BigNumber.config({ RABGE: 256});
const MIN_NUMBER = 0.000000000001;
const MAX_NUMBER = (2 ** 256 / 1000000000000) / 2;
const ONE_ETH = 1000000000000000000;

var block_timestamp_cache = {};

// These will be populated in onload, once web3 is loaded
var RealityCheck; 
var Arbitrator;

var account;
var arbitration_fee;

var display_entries = {
    'questions-latest': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3},
    'questions-resolved': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3},
    'questions-best': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3},
    'questions-high-reward': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3}
}

var user_question_ids = {'answered': [], 'asked': [], 'funded': []};

// data for question detail window
var question_detail_list = [];
var window_position = [];

var $ = require('jquery-browserify')

import imagesLoaded from 'imagesloaded';
import interact from 'interact.js';
import Ps from 'perfect-scrollbar';
import {TweenLite, Power3, ScrollToPlugin} from 'gsap';
//import {TweenLite, Power3} from 'gsap';

function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

var zindex = 10;

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

function numToBytes32(bignum) {
    var n = bignum.toString(16);
    while (n.length < 64) {
        n = "0" + n;
    }
    return "0x" + n;
}

function convertTsToString(ts) {
    let date = new Date();
    date.setTime(ts * 1000);
    return date.toISOString();
}

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

// set rcBrowser's position.
function setRcBrowserPosition(rcbrowser) {
    // when position has been stored.
    if (rcbrowser.hasClass('rcbrowser--qa-detail')) {
        var question_id = rcbrowser.attr('id').replace('qadetail-', '');
        if (typeof window_position[question_id] !== 'undefined') {
            let left =  parseInt(window_position[question_id]['x']) + 'px';
            let top = parseInt(window_position[question_id]['y']) + 'px';
            rcbrowser.css('left', left);
            rcbrowser.css('top', top);
            return;
        }
    }

    // when window is newly opend.
    const winWidth = document.documentElement.clientWidth;
    const winHeight = document.documentElement.clientHeight;
    const paddingLeft = winWidth * 0.1;
    const paddingTop = winHeight * 0.1;

    let rcb_width = parseInt(rcbrowser.css('width').replace('px', ''));
    let rcb_height = parseInt(rcbrowser.css('height').replace('px', ''));
    let itemWidth = Math.min(rcb_width, winWidth * 0.9);
    let itemHeight = Math.min(rcb_height, winHeight * 0.9);
    let leftMax = winWidth - itemWidth - paddingLeft;
    let topMax = winHeight - itemHeight - paddingTop;

    if (rcbrowser.attr('id') == 'post-a-question-window') {
        var leftMin = winWidth / 2;
        var left = winWidth / 2 + itemWidth / 10;
        var top = itemHeight / 10;
        left += 'px'; top += 'px';
    } else if (rcbrowser.hasClass('rcbrowser--qa-detail')) {
        left = parseInt(rand(paddingLeft, leftMax));
        top = parseInt(rand(paddingTop, topMax));
        window_position[question_id] = {'x': left, 'y': top};
        left += 'px'; top += 'px';
    }

    rcbrowser.css('left', left);
    rcbrowser.css('top', top);
}

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
        restriction: {
            left: 0,
            right: document.documentElement.clientWidth,
            top: 0,
            bottom: document.documentElement.clientHeight
        },
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // enable autoScroll
    autoScroll: false,

    // call this function on every dragmove event
    onmove: dragMoveListener
});
function dragMoveListener (event) {
    var target = event.target.parentNode.parentNode;
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    let top = parseInt(target.style.top);
    if (top + y < 1){
        target.style.webkitTransform =
            target.style.transform =
                'translate(' + x + 'px, -' + top + 'px)';
    } else {
        target.style.webkitTransform =
            target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)';
    }

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}
$(document).on('click', '.rcbrowser', function(){
    $(this).css('z-index', ++zindex);
});

// see all notifications
$(function() {
    $('.see-all-notifications').click( function() {
        $(this).closest('#your-question-answer-window').removeClass('display-top-only').addClass('display-all');
        //$(this).closest('.rcbrowser--your-qa').rcBrowser.addClass('is-loading');
        return false;
    });
    $('.hide-lower-notifications').click( function() {
        $(this).closest('#your-question-answer-window').addClass('display-top-only').removeClass('display-all');
        //$(this).closest('.rcbrowser--your-qa').rcBrowser.addClass('is-loading');
        return false;
    });
});

// page loaded
(function() {
    function loadHandler() {
        imagesLoaded( document.getElementById('cover'), { background: true }, function() {
            $('body').addClass('is-page-loaded');
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

$('#your-qa-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#your-question-answer-window').css('z-index', ++zindex);
    $('#your-question-answer-window').addClass('is-open');
    $('#your-question-answer-window').css('height', '800px');
});

$('#your-question-answer-window .rcbrowser__close-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#your-question-answer-window').css('z-index', 0);
    $('#your-question-answer-window').removeClass('is-open');
});

$('#post-a-question-button').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    let question_window = $('#post-a-question-window');
    if (!question_window.hasClass('is-open')) {
        question_window.css('z-index', ++zindex);
        question_window.addClass('is-open');
        question_window.css('height', '800px');
        setRcBrowserPosition(question_window);
    }
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
            decimals: 13,
            outcomes: outcomes
        }
        var question_json = JSON.stringify(question);

        RealityCheck.deployed().then(function (rc) {
            account = web3.eth.accounts[0];
            return rc.askQuestion(question_json, arbitrator.val(), step_delay_val, {from: account, value: web3.toWei(new BigNumber(reward.val()), 'ether')});
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
// make questions list

$('div.loadmore-button').on('click', function(e) {
    var sec = $(this).attr('data-questions');
//console.log('loading more sec', sec);

    var old_max = display_entries[sec]['max_show'];
    var new_max = old_max + 3;

    var num_in_doc = $('#'+sec).find('.questions__item').length;

    display_entries[sec]['max_show'] = new_max;

    // TODO: We may need to refetch to populate this store
    display_entries[sec]['max_store'] = display_entries[sec]['max_store'] + 3;

    for (var i = num_in_doc; i < new_max && i < display_entries[sec]['ids'].length; i++) {
        var previd;
        var nextid = display_entries[sec]['ids'][i];
        var previd;
        if (i > 0) {
            previd = display_entries[sec]['ids'][i-1];
        }
        var qdata = question_detail_list[nextid];
        populateSection(sec, qdata, previd);
    }

});

function handleUserAction(acc, action, entry, rc) {
    if (window.localStorage) { 
        var lastViewedBlockNumber = 0;
        if (window.localStorage.getItem('viewedBlockNumber')) {
            lastViewedBlockNumber = parseInt(window.localStorage.getItem('viewedBlockNumber'));
        }
        console.log(lastViewedBlockNumber);
        if (entry.blockNumber > lastViewedBlockNumber) {
            //$('body').attr('last-update-block-number', entry.blockNumber);
            $('body').addClass('pushing');
        }
    }

    var question_id = entry.args['question_id'];
    if (user_question_ids[action].indexOf(question_id) === -1) {
        user_question_ids[action].push(question_id);
    }
    //console.log('user_question_ids', user_question_ids);

    // If we have already viewed the question, it should be loaded in the question_detail_list array
    // If not, we will need to load it and put it there
    // This is duplicated when you click on a question to view it

    var current_question;

    if (question_detail_list[question_id]) {
        renderUserAction(question_id, action, entry);
    } else {
        rc.questions.call(question_id).then(function(result){
            current_question = result;
            current_question.unshift(question_id);
            return rc.LogNewAnswer({question_id:question_id}, {fromBlock:0, toBlock:'latest'});
        }).then(function(answer_logs){
            answer_logs.get(function(error, answers){
                if (error === null && typeof answers !== 'undefined') {
                    question_detail_list[question_id] = current_question;
                    question_detail_list[question_id]['history'] = answers;
                    renderUserAction(question_id, action, entry);
                    //renderUserAction(question_id);
                    //displayAnswerHistoryYour(question_id);
                } else {
                    console.log(error);
                }
            });
        });
    } 

    rc.balanceOf.call(account).then(function(result){
        $('.account-balance').text(result.toString());
    });


}

function populateSection(section_name, question_data, before_item) {
    var question_id = question_data[0];

    var idx = display_entries[section_name].ids.indexOf(question_id);
//console.log('idx is ',idx);
    if (idx > display_entries[section_name].max_show) {
//console.log('over max show, skip');
        return;
    }

    var question_item_id = 'question-' + question_id;
    var target_question_id = 'qadetail-' + question_id;
    var section = $('#'+section_name);

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

    var posted_ts = question_data[Qi_created];
    var arbitrator = question_data[Qi_arbitrator];
    var step_delay = question_data[Qi_step_delay];
    var question_text_raw = question_data[Qi_question_text];
    var bounty = web3.fromWei(question_data[Qi_bounty], 'ether');
    var is_arbitration_paid_for = question_data[Qi_is_arbitration_paid_for];
    var is_finalized = question_data[Qi_is_finalized];
    var best_answer_id = question_data[Qi_best_answer_id];

    var entry = $('.questions__item.template-item').clone();
    entry.attr('data-question-id', question_id);
    entry.attr('id', question_item_id).removeClass('template-item');
    entry.find('.questions__item__title').attr('data-target-id', target_question_id);
    entry.find('.question-title').text(question_json['title']);
    entry.find('.question-bounty').text(bounty);
    entry.css('display', 'block');

    //console.log('adding entry', question_item_id, 'before item', before_item);
    if (before_item) {
        section.find('#question-'+before_item).before(entry);
    } else {
        section.children('.questions-list').append(entry);
    }

    $('div#question-'+question_id).find('.timeago').attr('datetime', convertTsToString(posted_ts));
    timeAgo.render($('div#question-'+question_id).find('.timeago'));

    //console.log('length is ',section.children('.questions-list').find('.questions__item').length);
//console.log(section_name);
    
    while (section.children('.questions-list').find('.questions__item').length > display_entries[section_name].max_show) {
//console.log('too long, removing');
        section.children('.questions-list').find('.questions__item:last-child').remove()
    }

    //if (display_entries[section_name].max_show) {
}

function handleQuestionLog(item, rc) {
    var question_id = item.args.question_id;
    var created = item.args.created
    //console.log('question_id', question_id);
    rc.questions.call(question_id).then( function(question_data) {
        //console.log('here is result', question_data, question_id)
        question_data.unshift(question_id);
        var bounty = question_data[Qi_bounty];
        var is_finalized = question_data[Qi_is_finalized];

        if (is_finalized) {
            var insert_before = update_ranking_data('questions-resolved', question_id, created);
            if (insert_before !== -1) {
                question_detail_list[question_id] = question_data;
                populateSection('questions-resolved', question_data, insert_before);
            }

        } else {
            var insert_before = update_ranking_data('questions-latest', question_id, created);
            if (insert_before !== -1) {
                question_detail_list[question_id] = question_data;
                populateSection('questions-latest', question_data, insert_before);
            }

            var insert_before = update_ranking_data('questions-high-reward', question_id, bounty);
            if (insert_before !== -1) {
                question_detail_list[question_id] = question_data;
                populateSection('questions-high-reward', question_data, insert_before);
            }
//console.log(display_entries);
        }



        //console.log('bounty', bounty, 'is_finalized', is_finalized);
    });
}

// Inserts into the right place in the stored rankings.
// If it comes after another stored item, return the ID of that item.
// If it doesn't belong in storage because it is too low for the ranking, return -1
// TODO: ??? If it is already in storage and does not need to be updated, return -2
function update_ranking_data(arr_name, id, val) {

    // Check if we already have it
    var existing_idx = display_entries[arr_name]['ids'].indexOf(id);
    if (existing_idx !== -1) {

        // If it is unchanged, return a code saying there is nothing to do
        if (val.equals(display_entries[arr_name]['vals'][existing_idx])) {
            return -1; // TODO: make this -2 so the caller can handle this case differently?
        }

        // If we are already in the list and have the same value, remove and try to add again
        // This can happen if the variable we sort by is updated
        display_entries[arr_name]['ids'].splice(existing_idx, 1);
        display_entries[arr_name]['vals'].splice(existing_idx, 1);
    }

    //console.log('update_ranking_data', arr_name, id, val.toString());
    var arr = display_entries[arr_name]['vals']
    //console.log('start with array ', arr);

    var max_entries = display_entries[arr_name]['max_store'];

    // If the list is full and we're lower, give up
    if (arr.length >= max_entries) {
        var last_entry = arr[arr.length-1];
        if (last_entry.gte(val)) {
            //  console.log('we are full and last entry is at least as high')
            return -1;
        }
    }

    // go through from the top until we find something we're higher than
    var i = 0;
    for (i = 0; i < arr.length; i++) {
        //console.log('see if ', val.toString(), ' is at least as great as ', arr[i].toString());
        if (val.gte(arr[i])) {
            // found a spot, we're higher than the current occupant of this index
            // we'll return its ID to know where to insert in the document
            var previd = display_entries[arr_name]['ids'][i];

            //console.log('found, splice in before ', previd, 'old', val.toString(), 'new', arr[i].toString());

            // insert at the replaced element's index, bumping everything down
            display_entries[arr_name]['ids'].splice(i, 0, id);
            display_entries[arr_name]['vals'].splice(i, 0, val);

            // if the array is now too long, dump the final element
            if (arr.length > max_entries) {
                display_entries[arr_name]['ids'].pop();
                display_entries[arr_name]['vals'].pop();
            }
            return previd;
        }

    }

//console.log('not found, add to end');
    // lower than everything but there's still space, so add to the end
    display_entries[arr_name]['ids'].push(id);
    display_entries[arr_name]['vals'].push(val);
    return null;

}

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

    e.preventDefault();
    e.stopPropagation();

    var question_id = $(this).closest('.questions__item').attr('data-question-id');

    if ($('#qadetail-'+question_id).size()) {
        console.log('already open');
    } else {
        openQuestionWindow(question_id); 
    }

});

$(document).on('click', '.your-qa__questions__item', function(e) {

    e.preventDefault();
    e.stopPropagation();

    var question_id = $(this).closest('.your-qa__questions__item').attr('data-question-id');
    openQuestionWindow(question_id);

});

function openQuestionWindow(question_id) {

    var rc;
    var current_question;

    RealityCheck.deployed().then(function(instance){
        rc = instance;
        return rc.questions.call(question_id);
    }).then(function(result){
        current_question = result;
        current_question.unshift(question_id);
        return rc.LogNewAnswer({question_id:question_id}, {fromBlock:0, toBlock:'latest'});
    }).then(function(answer_posted){
        answer_posted.get(function(error, answers){
            if (error === null && typeof answers !== 'undefined') {
                question_detail_list[question_id] = current_question;
                question_detail_list[question_id]['history'] = answers;

                for(var i=0; i<answers.length; i++) {
                    if (answers[i].args['answerer'] == account) {
                        handleUserAction(account, 'answered', answers[i], rc);
                    }
                }

                //console.log('question_id', question_id);
                //console.log('question detail', question_detail_list);

                displayQuestionDetail(question_id);
                displayAnswerHistory(question_id);
            } else {
                console.log(error);
            }
        });
    }).catch(function(e){
        console.log(e);
    });
}

$('#post-a-question-window .rcbrowser__close-button').on('click', function(){
    let window = $('#post-a-question-window');
    window.css('z-index', 0);
    window.removeClass('is-open');
});

function displayQuestionDetail(question_id) {

    var question_detail = question_detail_list[question_id];
    //console.log('question_id', question_id);
    var is_arbitration_requested = question_detail[Qi_is_arbitration_paid_for];
    var idx = question_detail['history'].length - 1;
    var question_json;

    try {
        question_json = JSON.parse(question_detail[Qi_question_text]);
    } catch(e) {
        question_json = {
            'title': question_detail[Qi_question_text],
            'type': 'binary'
        };
    }
    var question_type = question_json['type'];

    var rcqa = $('.rcbrowser--qa-detail.template-item').clone();
    rcqa.attr('id', 'qadetail-' + question_id);
    rcqa.find('.need-data-target-id').attr('data-target-id', 'qadetail-' + question_id);

    rcqa.find('.rcbrowser__close-button').on('click', function(){
        let parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
        let left = parseInt(parent_div.css('left').replace('px', ''));
        let top = parseInt(parent_div.css('top').replace('px', ''));
        let data_x = (parseInt(parent_div.attr('data-x')) || 0);
        let data_y = (parseInt(parent_div.attr('data-y')) || 0);
        left += data_x; top += data_y;
        window_position[question_id]['x'] = left;
        window_position[question_id]['y'] = top;
        rcqa.remove();
        //console.log('clicked close');
        //$('div#' + question_id).remove();
        //question_id = question_id.replace('qadetail-', '');
        //delete question_detail_list[question_id]
    });

    rcqa.removeClass('template-item');

    let date = new Date();
    date.setTime(question_detail[Qi_created] * 1000);
    let date_str = monthList[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    rcqa.find('.rcbrowser-main-header-date').text(date_str);
    rcqa.find('.question-title').text(question_json['title']);
    rcqa.find('.reward-value').text(web3.fromWei(question_detail[Qi_bounty], 'ether'));
    if (!is_arbitration_requested) {
        rcqa.find('.arbitrator').text(question_detail[Qi_arbitrator]);
    } else {
        rcqa.find('.arbitration-button').css('display', 'none');
    }

    if (question_detail['history'].length) {
        var latest_answer = question_detail['history'][idx].args;
        rcqa.find('.current-answer-container').attr('id', 'answer-' + latest_answer.answer_id);
        rcqa.find('.current-answer-item').find('.timeago').attr('datetime', convertTsToString(latest_answer.ts));

        // answerer data
        var ans_data = rcqa.find('.current-answer-container').find('.answer-data');
        ans_data.find('.answerer').text(latest_answer.answerer);
        ans_data.find('.answer-bond-value').text(latest_answer.bond);

        // label for show the current answer.
        var label = getAnswerString(question_json, latest_answer);
        rcqa.find('.current-answer-body').find('.current-answer').text(label);

        // final answer button
        showFAButton(question_id, question_detail[Qi_step_delay], latest_answer.ts);
    } else {
        rcqa.find('.current-answer-container').hide();
    }

    Arbitrator.at(question_detail[Qi_arbitrator]).then(function(arb) {
        return arb.getFee.call(question_id);
    }).then(function(fee) {
        rcqa.find('.arbitration-fee').text(fee.toString());
        arbitration_fee = fee.toNumber();
    });

    var ans_frm = makeSelectAnswerInput(question_json);
    ans_frm.css('display', 'block');
    ans_frm.addClass('is-open');
    ans_frm.removeClass('template-item');
    rcqa.find('.answered-history-container').after(ans_frm);

    $('#qa-detail-container').append(rcqa);
    timeAgo.render($('#qadetail-' + question_id).find('.current-answer-item').find('.timeago'))
    rcqa.css('display', 'block');
    rcqa.addClass('is-open');
    rcqa.css('z-index', ++zindex);
    setRcBrowserPosition(rcqa);

    var rc;
    RealityCheck.deployed().then(function(instance){
        rc = instance;
        return rc.LogNewAnswer({question_id:question_id}, {fromBlock:'latest', toBlock:'latest'});
    }).then(function(answer_posted){
        answer_posted.watch(function(error, result){
            if (!error && result !== undefined) {
                question_detail_list[question_id][Qi_best_answer_id] = result.args.answer_id;
                pushWatchedAnswer(result);
                rewriteQuestionDetail(question_id);
            }
        });
    }).catch(function (e){
        console.log(e);
    });

}

function populateWithBlockTimeForBlockNumber(num, callback) {
    if (block_timestamp_cache[num]) {
        callback(block_timestamp_cache[num]);
    } else {
        web3.eth.getBlock(num, function(err, result) {
            block_timestamp_cache[num] = result.timestamp
            callback(block_timestamp_cache[num]);
        }); 
    }
}

// Data should already be stored in question_detail_list
function renderUserAction(question_id, action, entry) {

    var qdata = question_detail_list[question_id];
    //console.log('renderUserAction', qdata);

    var tmpl;
    if (action == 'asked') {

        tmpl = 'notifications-item-asked-question';

    } else if (action == 'answered') {
        if (entry.args.answerer == account) {
            tmpl = 'notifications-item-you-posted-answer';
        } else {
            tmpl = 'notifications-item-answer-overwritten';
        }
    }

    var item = $('#your-question-answer-window').find('.notifications-template-container .template-item.'+tmpl).clone();

    var question_json;
    try {
        question_json = JSON.parse(qdata[Qi_question_text]);
    } catch(e) {
        question_json = {
            'title': question_data[3]
        };
    }

    item.find('.question-text').text(question_json['title']);
    //console.log('get ts from here:', entry);
     
    var updateBlockAgoDisplay = function(ts) {
        item.find('.time-ago').text(ts); // TODO: Make this time ago
    }

    populateWithBlockTimeForBlockNumber(entry.blockNumber, updateBlockAgoDisplay);

    item.removeClass('template-item').addClass('populated-item');
    $('#your-question-answer-window').find('.notifications').append(item);

    //console.log('handling action ', action, question_id);
    if (action == 'asked') {

        //console.log('got an asked user action', question_id);
        var qitem;
        if (qdata[Qi_is_finalized]) {
            qitem = $('#your-question-answer-window .your-qa__questions .your-qa__questions__item.template-item.resolved-item').clone();
        } else {
            qitem = $('#your-question-answer-window .your-qa__questions .your-qa__questions__item.template-item.unresolved-item').clone();
        }
        var updateBlockTimestamp = function(ts) {
            qitem.find('.item-date').text(ts); // TODO: Format the date
        }
        populateWithBlockTimeForBlockNumber(entry.blockNumber, updateBlockTimestamp);

        qitem.attr('data-question-id', question_id);
        qitem.find('.question-text').text(question_json['title']);
        qitem.find('.count-answers').text(qdata['history'].length);

        qitem.removeClass('template-item');

        // TODO: Make this happen in some kind of order
        $('#your-question-answer-window .your-qa__questions .your-qa__questions-inner').append(qitem);

        // TODO: Fill in resolved finalization data
    } else if (action == 'answered' && account == entry.args['answerer']) {

        // TODO: The design calls for the question to be displayed here.
        // Should we be displaying the answer instead?
        // Probably needs to be changed, so leaving duplication for now

        var aitem;

        if (qdata[Qi_is_finalized]) {
            aitem = $('#your-question-answer-window .your-qa__answers .your-qa__questions__item.template-item.resolved-item').clone();
        } else {
            aitem = $('#your-question-answer-window .your-qa__answers .your-qa__questions__item.template-item.unresolved-item').clone();
        }
        var updateBlockTimestamp = function(ts) {
            aitem.find('.item-date').text(ts); // TODO: Format the date
        }
        populateWithBlockTimeForBlockNumber(entry.blockNumber, updateBlockTimestamp);

        aitem.attr('data-question-id', question_id);
        aitem.find('.question-text').text(question_json['title']);
        aitem.find('.count-answers').text(qdata['history'].length);

        aitem.removeClass('template-item');

        // TODO: Make this happen in some kind of order
        $('#your-question-answer-window .your-qa__answers-inner').append(aitem);
    } else {
        console.log('not rendering for user', account, ':', action, entry);
    }

}

function rewriteQuestionDetail(question_id) {
    var question_data = question_detail_list[question_id];
    var idx = question_data['history'].length - 1;
    var answer_data = question_data['history'][idx];
    var answer_id = 'answer-' + answer_data.args.answer_id;
    var answer = new BigNumber(answer_data.args.answer).toNumber();

    try {
        var question_json = JSON.parse(question_data[Qi_question_text]);
    } catch(e) {
        question_json = {
            'title': question_data[3]
        };
    }

    var bond = web3.fromWei(answer_data.args.bond.toNumber(), 'ether');
    var section_name = 'div#qadetail-' + question_id + '.rcbrowser.rcbrowser--qa-detail';
    $(section_name).find('.current-answer-container').attr('id', answer_id);
    var label = getAnswerString(question_json, answer_data.args);
    $(section_name).find('.current-answer-container').find('.current-answer').text(label);
    $(section_name).find('input[name="numberAnswer"]').val(0);
    $(section_name).find('input[name="questionBond"]').val(bond * 2);

    // show final answer button
    showFAButton(question_id, question_data[Qi_step_delay], answer_data.args.ts);

    var ans_data = $(section_name).find('.current-answer-container').find('.answer-data');
    ans_data.find('.answerer').text(answer_data.args.answerer);
    ans_data.find('.answer-bond-value').text(bond);

    displayAnswerHistory(question_id);

}

function getAnswerString(question_json, answer_data) {
    var label = '';
    switch (question_json['type']) {
        case 'number':
            label = new BigNumber(answer_data.answer).toString();
            break;
        case 'binary':
            if (new BigNumber(answer_data.answer).toNumber() === 1) {
                label = 'Yes';
            } else if (new BigNumber(answer_data.answer).toNumber() === 0) {
                label = 'No';
            }
            break;
        case 'single-select':
            if (typeof question_json['outcomes'] !== 'undefined' && question_json['outcomes'].length > 0) {
                var idx = new BigNumber(answer_data.answer).toNumber();
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
            for (var i = options.length-1; i >= 0; i-- ) {
                var elmtpl = ans_frm.find('.input-entry.template-item');
                var elm = elmtpl.clone();
                elm.removeClass('template-item');
                var elinput = elm.find('input');
                elinput.attr('name', 'input-answer');
                elinput.val(i);
                var ellabel = elm.find('span');
                ellabel.text(options[i]);
                // Here we copy the content and throw away the container
                elmtpl.after(elm);
            }
            //ans_frm.find('input:checkbox').wrap('<label></label>');
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
        if (answer.args.answer_id == question_data[Qi_best_answer_id]) {
            return;
        }

        var answer_id = 'answer-' + answer.args.answer_id;
        //console.log('answer orig', answer.args.answer);
        var ans = new BigNumber(answer.args.answer).toNumber();

        var container = $('.answered-history-item-container.template-item').clone();
        container.removeClass('template-item');
        container.css('display', 'block');
        container.attr('id', answer_id);

        section.find('.answered-history-header').after(container);

        try {
            var question_json = JSON.parse(question_data[Qi_question_text]);
        } catch(e) {
            question_json = {
                'title': question_data[Qi_question_text]
            };
        }

        section_name = 'div#' + answer_id;
        var label = getAnswerString(question_json, answer.args);
        var history_item = $(section_name).find('.answer-item.answered-history-item');
        history_item.find('.answered-history-body').text(label);
        history_item.find('.timeago').attr('datetime', convertTsToString(answer.args.ts));
        timeAgo.render($(section_name).find('.timeago'));

        var ans_data = $(section_name).find('.answer-item.answered-history-item').find('.answer-data');
        ans_data.find('.answerer').text(answer.args.answerer);
        ans_data.find('.answer-bond-value').text(new BigNumber(answer.args.bond).toNumber());

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
        return rc.finalize(question_id, {from: account});
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
    var bond = web3.toWei(new BigNumber(parent_div.find('input[name="questionBond"]').val()), 'ether');

    var account = web3.eth.accounts[0];
    var rc;
    var question, current_answer, new_answer;
    var question_json;
    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.questions.call(question_id);
    }).then(function(current_question) {
        current_question.unshift(question_id);

        try {
            question_json = JSON.parse(current_question[Qi_question_text]);
        } catch(e) {
            question_json = {
                'title': current_question[Qi_question_text],
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
        } else if (question_json['type'] == 'number') {
            new_answer = new BigNumber(parent_div.find('[name="input-answer"]').val());
        } else {
            new_answer = parseInt(parent_div.find('[name="input-answer"]').val());
        }

        return rc.answers.call(current_question[Qi_best_answer_id]);
    }).then(function(current_answer){
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
                if (new_answer.isNaN()) {
                    parent_div.find('div.input-container.input-container--answer').addClass('is-error');
                    is_err = true;
                } else if (new_answer.lt(MIN_NUMBER) || new_answer.gt(MAX_NUMBER)) {
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
        if (isNaN(bond) || (bond < min_amount) || (min_amount === 0 && bond  <  ONE_ETH)) {
            parent_div.find('div.input-container.input-container--bond').addClass('is-error');
            if (min_amount === 0) {
                min_amount = 1;
            }
            parent_div.find('div.input-container.input-container--bond').find('.min-amount').text(min_amount);
            is_err = true;
        }

        if (is_err) throw('err on submitting answer');

        // Converting to BigNumber here - ideally we should probably doing this when we parse the form
        return rc.submitAnswer(question_id, numToBytes32(new BigNumber(new_answer)), '', {from:account, value:bond});
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
    reward = web3.toWei(new BigNumber(reward), 'ether');

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
// arbitration
$(document).on('click', '.arbitrator', function(e){
    e.preventDefault();
    e.stopPropagation();

    var question_id = $(this).closest('div.rcbrowser.rcbrowser--qa-detail').attr('id').replace('qadetail-', '');

    RealityCheck.deployed().then(function(rc){
        return rc.requestArbitration(question_id, {from:web3.eth.accounts[0], value:arbitration_fee});
    }).then(function(result){
        console.log('arbitration is requestd.', result);
    }).catch(function(e){
        console.log(e);
    });
})

/*-------------------------------------------------------------------------------------*/
// show/delete error messages

$('.rcbrowser-textarea').on('keyup', function(e){
    if ($(this).val() !== '') {
        $(this).closest('div').removeClass('is-error');
    }
});
$(document).on('keyup', '.rcbrowser-input.rcbrowser-input--number', function(e){
    let value = $(this).val();
    if (value === '') {
        $(this).parent().parent().addClass('is-error');
    } else if (!$(this).hasClass('rcbrowser-input--number--answer') && (value <= 0 || value.substr(0,1) === '0')) {
        $(this).parent().parent().addClass('is-error');
    } else if($(this).hasClass('rcbrowser-input--number--bond')) {
        let question_id = $(this).closest('.rcbrowser.rcbrowser--qa-detail').attr('id').replace('qadetail-', '');
        let current_idx = question_detail_list[question_id]['history'].length - 1;
        let current_bond = web3.fromWei(question_detail_list[question_id]['history'][current_idx].args.bond.toNumber(), 'ether');
        if (value < current_bond * 2) {
            $(this).parent().parent().addClass('is-error');
        } else {
            $(this).parent().parent().removeClass('is-error');
        }
    } else {
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

function pageInit(account) {

    console.log('in pageInit for account', account);

    var rc;

    RealityCheck = contract(rc_json);
    RealityCheck.setProvider(web3.currentProvider);

    // Just used to get the default arbitator address
    Arbitrator = contract(arb_json);
    Arbitrator.setProvider(web3.currentProvider);
    Arbitrator.deployed().then(function(arb) {
        $('option.default-arbitrator-option').val(arb.address);
    });


    /* 
        1) Start watching for all actions.
           This will include questions that the user answered or funded, which will update list of user question_ids.
           These will be pass into the ranking tables as they come it.
           Ranking tables may temporarily flash with new actions, which will later be buried under others which we later fetch
           We can handle this on the display side if it turns out to be a problem.

        2) Get historical logs of user actions.
           These may include duplicates of things we got from the watch() call.

        3) Get other historical questions and update the rankings.
           These may include duplicates of things we got from the watch() call.

        NB When we come to display the user actions, we may have only a partial list of the questions they may have answered
           This may be because the question info hasn't arrived yet
           We will use a targetted get() to fill in anything we are missing at that time.

    */ 

    RealityCheck.deployed().then(function(instance) {

        rc = instance;

        return rc.LogNewAnswer({}, {fromBlock:'latest', toBlock:'latest'});

    }).then(function(all_answers_logger) {

        all_answers_logger.watch(function (error, result) {
            if (!error && result) {
                if (result.args['answerer'] == account) {
                    handleUserAction(account, 'answered', result, rc);
                }
                //console.log('got answer from watch', result);
            }
        });

        return rc.LogNewQuestion({}, {fromBlock:'latest', toBlock:'latest'});

    }).then(function(all_questions_logger) {

        all_questions_logger.watch(function (error, result) {
            if (!error && result) {
                if (result.args['questioner'] == account) {
                    handleUserAction(account, 'asked', result, rc);
                }
                handleQuestionLog(result, rc);
                //console.log('got question watch', result);
            }
        });

        return rc.LogFundAnswerBounty({}, {fromBlock:'latest', toBlock:'latest'});

    }).then(function(all_fund_answers_logger) {

        all_fund_answers_logger.watch(function (error, result) {
            if (!error && result) {
                if (result.args['funder'] == account) {
                    handleUserAction(account, 'funded', result, rc);
                }
                handleQuestionLog(result, rc); // will fetch question data for updating rankings
                console.log('got question watch', result);
            }
        });

        // TODO: add arbitration requests

        // Watchers all done, next we do the history gets
        // We start with the user's answers so we can tell when we see a relevant question ID

        return rc.LogNewAnswer({'answerer': account}, {fromBlock:0, toBlock:'latest'});

    }).then(function(answer_posted){
        answer_posted.get(function(error, result){
            var answers = result;
            if (error === null && typeof result !== 'undefined') {

                for(var i=0; i<answers.length; i++) {
                    if (result[i].args['answerer'] == account) {
                        handleUserAction(account, 'answered', answers[i], rc);
                    }
                }

            } else {
                console.log(error);
            }
        });

        // Next comes the user's funded questions
        return rc.LogFundAnswerBounty({'answerer': account}, {fromBlock:0, toBlock:'latest'});

    }).then(function(bounty_funded){

        for(var i=0; i<bounty_funded.length; i++) {
            if (result[i].args['answerer'] == account) {
                handleUserAction(account, 'answered', result[i], rc);
            }
        }

        // Now the rest of the questions
        return rc.LogNewQuestion({}, {fromBlock:0, toBlock:'latest'});

    }).then(function(question_posted) {

        question_posted.get(function (error, result) {

            if (error === null && typeof result !== 'undefined') {
                for(var i=0; i<result.length; i++) {
                    handleQuestionLog(result[i], rc);
                }
            } else {
                console.log(e);
            }
                
        });

    });

};


/*
                }, Promise.resolve()).then(function(result) {

                    return rc.LogNewQuestion({}, {fromBlock:'latest', toBlock:'latest'});

                }).catch(function(e){
                    console.log(e);
                });
            } else {
                console.log(error);
            }
        });
*/

window.onload = function() {
    web3.eth.getAccounts((err, acc) => {
        console.log('accounts', acc);
        account = acc[0];
        pageInit(account);
    });
}
