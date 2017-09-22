// TODO: Check if there was a reason to do this instead of import //require('../../../node_modules/gsap/src/uncompressed/plugins/ScrollToPlugin.js');

'use strict';

var rc_json = require('../../../truffle/build/contracts/RealityCheck.json');
var arb_json = require('../../../truffle/build/contracts/Arbitrator.json');

var contract = require("truffle-contract");
var BigNumber = require('bignumber.js');
var timeago = require('timeago.js');
var timeAgo = new timeago();
var jazzicon = require('jazzicon');
var vsprintf = require("sprintf-js").vsprintf

//console.log('jazzicon', jazzicon);

var submitted_question_id_timestamp = {};
var user_claimable = {}; 

var category = null;
var template_blocks = {};
var template_content = {
    0: '{"title": "%s", "type": "bool", "category": "%s"}',
    1: '{"title": "%s", "type": "uint", "decimals": 13, "category": "%s"}',
    2: '{"title": "%s", "type": "int", "decimals": 13, "category": "%s"}',
    3: '{"title": "%s", "type": "single-select", "outcomes": [%s], "category": "%s"}',
    4: '{"title": "%s", "type": "multiple-select", "outcomes": [%s], "category": "%s"}'
};
var QUESTION_DELIMITER = '\u241f'; // Thought about '\u0000' but it seems to break something;

const QUESTION_TYPE_TEMPLATES = {
    'bool': 0,
    'uint': 1,
    'int': 2,
    'single-select': 3,
    'multiple-select': 4
};

var network_id = null;

const EVENT_ACTOR_ARGS = {
    'LogNewQuestion': 'user',
    'LogNewAnswer': 'user',
    'LogFundAnswerBounty': 'user',
    'LogNotifyOfArbitrationRequest': 'user',
    'LogClaimBounty': 'user',
    'LogClaimBond': 'user'
};

const QUESTION_MAX_OUTCOMES = 128; 

// Assume we don't need blocks earlier than this, eg is when the contract was deployed.
const START_BLOCK = parseInt(document.body.getAttribute('data-start-block'));

const FETCH_NUMBERS = [100, 2500, 5000];

var last_displayed_block_number = 0;
var current_block_number = 1;

// Struct array offsets
// Assumes we unshift the ID onto the start

// Question, as returned by questions()
const Qi_question_id = 0;

// NB This has magic values - 0 for no answer, 1 for pending arbitration, 2 for pending arbitration with answer, otherwise timestamp
const Qi_finalization_ts = 1; 
const Qi_arbitrator = 2;
const Qi_timeout = 3;
const Qi_question_hash = 4;
const Qi_bounty = 5;
const Qi_best_answer = 6;
const Qi_bond = 7;
const Qi_history_hash = 8;
const Qi_question_json = 9; // We add this manually after we load the template data
const Qi_creation_ts = 10; // We add this manually from the event log
const Qi_question_creator = 11; // We add this manually from the event log
const Qi_question_created_block = 12;
const Qi_question_text = 13;
const Qi_template_id = 14;

BigNumber.config({ RABGE: 256});
const MIN_NUMBER = 0.000000000001;
const MAX_NUMBER = (2 ** 256 / 1000000000000) / 2;
const ONE_ETH = 1000000000000000000;

var block_timestamp_cache = {};

// Array of all questions that the user is interested in
var q_min_activity_blocks = {};

// These will be populated in onload, once web3 is loaded
var RealityCheck;
var Arbitrator;

var account;
var rc;

var display_entries = {
    'questions-latest':       {'ids': [], 'vals': [], 'max_store': 50, 'max_show': 3},
    'questions-resolved':     {'ids': [], 'vals': [], 'max_store': 50, 'max_show': 3},
    'questions-closing-soon': {'ids': [], 'vals': [], 'max_store': 50, 'max_show': 3},
    'questions-high-reward':  {'ids': [], 'vals': [], 'max_store': 50, 'max_show': 3}
}

// data for question detail window
var question_detail_list = [];
var question_event_times = {}; // Hold timer IDs for things we display that need to be moved when finalized

var window_position = [];

var $ = require('jquery-browserify')
require('jquery-expander')($);

import imagesLoaded from 'imagesloaded';
import interact from 'interactjs';
import Ps from 'perfect-scrollbar';
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

function formatForAnswer(answer, qtype) {
    if (typeof answer == 'BigNumber') {
        return answer;
    }
    //console.log('formatForAnswer', answer, qtype, typeof answer);
    return numToBytes32(new BigNumber(answer));
}

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

function secondsTodHms(sec) {
    sec = Number(sec);
    let d = Math.floor(sec / (3600 * 24));
    let h = Math.floor(sec % (3600 * 24) / 3600);
    let m = Math.floor(sec % (3600 * 24) % 3600 / 60);
    let s = Math.floor(sec % (3600 * 24) % 3600 % 60);

    let dDisplay = d > 0 ? d + (d == 1 ? " day " : " days ") : "";
    let hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
    let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
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
        var question_id = rcbrowser.attr('data-question-id');
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

// RCBrowser custom scrollbar
(function() {
    const rcbrowsers = document.querySelectorAll('.rcbrowser-inner');

    for (let i = 0, len = rcbrowsers.length; i < len; i += 1) {
        // Initialize anything that isn't part of a template item.
        // If it's a template item it should be initialized after it's cloned.
        if (!$(rcbrowsers[i]).closest('.template-item').length) {
            Ps.initialize(rcbrowsers[i]);
        }
    }

    function changeSize() {
        // TODO: Does this need to be added to items that are initialized later?
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
    $(this).find('.question-setting-warning').find('.balloon').css('z-index', ++zindex);
    $(this).find('.question-setting-info').find('.balloon').css('z-index', zindex);
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
let bounceEffect = function() {
    if (!$('body').hasClass('is-page-loaded')) {
        imagesLoaded(document.getElementById('cover'), {background: true}, function () {
            $('body').addClass('is-page-loaded');
        });
    }
}

/*-------------------------------------------------------------------------------------*/
// window for posting a question

$('#your-qa-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#your-question-answer-window').css('z-index', ++zindex);
    $('#your-question-answer-window').addClass('is-open');
    $('#your-question-answer-window').css('height', $('#your-question-answer-window').height()+'px');
    $('.tooltip').removeClass('is-visible');
    $('body').removeClass('pushing');
    markViewedToDate();
});

$('#help-center-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#help-center-window').css('z-index', ++zindex).addClass('is-open');
    //$('#help-center-window').css('height', $('#help-center-window').height()+'px');
});

function setViewedBlockNumber(network_id, block_number) {
    if (network_id == 1) {
        window.localStorage.setItem('viewedBlockNumberMain', block_number);
    } else if (network_id == 3) {
        window.localStorage.setItem('viewedBlockNumberRopsten', block_number);
    } else {
        window.localStorage.setItem('viewedBlockNumberOther', block_number);
    }
}

function getViewedBlockNumber(network_id) {
    if (network_id == 1) {
        return window.localStorage.getItem('viewedBlockNumberMain');
    } else if (network_id == 3) {
        return window.localStorage.getItem('viewedBlockNumberRopsten');
    } else {
        return window.localStorage.getItem('viewedBlockNumberOther');
    }
}

function markViewedToDate() {
    var vbn = parseInt(getViewedBlockNumber(network_id));
    if (vbn >= last_displayed_block_number) {
        last_displayed_block_number = vbn;
    } else {
        setViewedBlockNumber(network_id, last_displayed_block_number);
    }
}

$('#help-center-window .rcbrowser__close-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#help-center-window').css('z-index', 0).removeClass('is-open');
});

$('#your-question-answer-window .rcbrowser__close-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#your-question-answer-window').css('z-index', 0);
    $('#your-question-answer-window').removeClass('is-open');
    document.documentElement.style.cursor = ""; // Work around Interact draggable bug
    $('body').removeClass('pushing');
    $('.tooltip').removeClass('is-visible');
    markViewedToDate();
});

$('#post-a-question-button,#post-a-question-link').on('click', function(e){
    //console.log('click post');
    e.preventDefault();
    e.stopPropagation();
    let question_window = $('#post-a-question-window-template').clone().attr('id', 'post-a-question-window');
    question_window.find('.rcbrowser__close-button').click(function(){
        question_window.remove();
    });

    $('#post-a-question-window-template').before(question_window);
    //console.log('cloned window', question_window);
    if (!question_window.hasClass('is-open')) {
        question_window.css('z-index', ++zindex);
        question_window.addClass('is-open');
        question_window.css('height', question_window.height()+'px');
        setRcBrowserPosition(question_window);
    }
    if (category) {
        question_window.find("[name='question-category']").val(category);
    }
});

$('#browse-question-button,#browse-question-link').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('body').addClass('page-qa');
    $('#site-slogan-normal').css('display', 'none');
    $('#site-slogan-browse-qa').css('display', 'block');
    $('#site-introduction__buttons').css('visibility', 'hidden');
});

$('#site-logo').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('body').removeClass('page-qa');
    $('#site-slogan-normal').css('display', 'block');
    $('#site-slogan-browse-qa').css('display', 'none');
    $('#site-introduction__buttons').css('visibility', 'visible');
});

$(document).on('click', '#post-a-question-window .close-question-window', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('#post-a-question-window').css('z-index', 0);
    $('#post-a-question-window').removeClass('is-open');
});

$(document).on('click', '#post-a-question-window .post-question-submit', function(e){
    e.preventDefault();
    e.stopPropagation();

    var win = $('#post-a-question-window');
    var question_body = win.find('.question-body');
    var reward = win.find('.question-reward');
    var timeout = win.find('.step-delay');
    var timeout_val = parseInt(timeout.val());
    var arbitrator = win.find('.arbitrator');
    var question_type = win.find('.question-type');
    var answer_options = win.find('.answer-option');
    var category = win.find('div.select-container--question-category select');
    var outcomes = [];
    for (var i = 0; i < answer_options.length; i++) {
        outcomes[i] = answer_options[i].value;
    }

    if (validate(win)) {
        // TODO: Handle other types etc
        var qtext = question_body.val();
        var qtype = question_type.val()
        qtext = qtext + QUESTION_DELIMITER + category.val();
        var template_id = QUESTION_TYPE_TEMPLATES[qtype];
        //console.log('using template_id', template_id);
        if (qtype == 'single-select' || qtype == 'multiple-select') {
            var outcome_str = JSON.stringify(outcomes).replace(/^\[/, '').replace(/\]$/, '');
            //console.log('made outcome_str', outcome_str);
            qtext = qtext + QUESTION_DELIMITER + outcome_str;
            //console.log('made qtext', qtext);
        }
        /*
        var question = {
            title: question_body.val(),
            type: question_type.val(),
            decimals: 13,
            category: category.val(),
            outcomes: outcomes
        }
        */

        //console.log('getQuestionID', template_id, qtext, arbitrator.val(), timeout_val, account, 0);
        var question_id;
        rc.getQuestionID.call(template_id, qtext, arbitrator.val(), timeout_val, account, 0)
        .then(function(qid) {
            //console.log('made qid', qid);
            question_id = qid;
            //console.log('rc.askQuestion.sendTransaction(',template_id, qtext, arbitrator.val(), timeout_val, 0)
            //console.log('reward', reward.val());
            return rc.askQuestion.sendTransaction(template_id, qtext, arbitrator.val(), timeout_val, 0, {from: account, gas: 200000, value: web3.toWei(new BigNumber(reward.val()), 'ether')})
        }).then(function(txid) {
            //console.log('sent tx with id', txid);
            
            // Make a fake log entry
            var fake_log = {
                'entry': 'LogNewQuestion',
                'args': {
                    'question_id': question_id,
                    'user': account,
                    'arbitrator': arbitrator.val(),
                    'timeout': new BigNumber(timeout_val),
                    'question_hash': 'TODO',
                    'template_id': new BigNumber(template_id),
                    'question': qtext,
                    'created': new BigNumber(parseInt(new Date().getTime() / 1000))
                }
            }
            var fake_call = [];
            fake_call[Qi_finalization_ts-1] = new BigNumber(0);
            fake_call[Qi_arbitrator-1] = arbitrator.val();
            fake_call[Qi_timeout-1] = new BigNumber(timeout_val);
            fake_call[Qi_question_hash-1] = 'TODO';
            fake_call[Qi_bounty-1] = web3.toWei(new BigNumber(reward.val()), 'ether');
            fake_call[Qi_history_hash-1] = "0x0";

            var q = filledQuestionDetail(question_id, 'question_log', 0, fake_log); 
            q = filledQuestionDetail(question_id, 'question_call', 0, fake_call); 
            q = filledQuestionDetail(question_id, 'question_json', 0, populatedJSONForTemplate(template_content[template_id], qtext));

            // Turn the post question window into a question detail window
            var rcqa = $('.rcbrowser--qa-detail.template-item').clone();
            win.html(rcqa.html());
            win = populateQuestionWindow(win, q, false);
            //console.log('rcqa', win);
    
            // TODO: Once we have code to know which network we're on, link to a block explorer
            win.find('.pending-txid a').attr('href', 'https://ropsten.etherscan.io/tx/' + txid);
            win.find('.pending-txid a').text(txid.substr(0, 12) + "..." + txid.substr(txid.length-12));
            win.addClass('unconfirmed-transaction').addClass('has-warnings');
            win.attr('data-pending-txid', txid);

            win.find('.rcbrowser__close-button').on('click', function(){
                //console.log('closing');
                let parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
                let left = parseInt(parent_div.css('left').replace('px', ''));
                let top = parseInt(parent_div.css('top').replace('px', ''));
                let data_x = (parseInt(parent_div.attr('data-x')) || 0);
                let data_y = (parseInt(parent_div.attr('data-y')) || 0);
                left += data_x; top += data_y;
                window_position[question_id] = {};
                window_position[question_id]['x'] = left;
                window_position[question_id]['y'] = top;
                win.remove();
                document.documentElement.style.cursor = ""; // Work around Interact draggable bug
            });

            var window_id = 'qadetail-' + question_id;
            win.removeClass('rcbrowser--postaquestion').addClass('rcbrowser--qa-detail');
            win.attr('id', window_id);
            win.attr('data-question-id', question_id);
            Ps.initialize(win.find('.rcbrowser-inner').get(0));

        });
    }

});

function isArbitratorValid(arb) {
    var found = false;
    let arbitrator_addrs = $('select.arbitrator').children();
    arbitrator_addrs.each(function() {
        if ( $(this).val() == arb) {
            found = true;
            return false;
        } 
    });
    return found;
}

function isArbitrationPending(question) {
    // finalization_ts has a magical timestamp of 1 meaning pending arbitration (unanswered) or 2 meaning pending arbitration (answered)
    return ( (question[Qi_finalization_ts].toNumber() == 1) || (question[Qi_finalization_ts].toNumber() == 2) );
}

function isAnswered(question) {
    // TODO: Change contract to be able to differentiate when in pending-arbitration state
    return (question[Qi_finalization_ts].toNumber() > 1);
}

function isFinalized(question) {
    var fin = question[Qi_finalization_ts].toNumber() 
    var res = ( (fin > 2) && (fin * 1000 < new Date().getTime()) );  
    // 0: Unanswered
    // 1: Pending arbitration (unanswered)
    // 2: Pending arbitration (answered)
    // Below current date: Finalized
    // Above current date: Open for new answers or arbitration requests
    return res;
}

$(document).on('click', '.answer-claim-button', function(){
    var question_id = $(this).closest('.rcbrowser--qa-detail').attr('data-question-id');

    if ($(this).hasClass('claim-all')) {

        var claimable = mergePossibleClaimable(user_claimable);
        var gas = 140000 + (10000 * claimable['history_hashes'].length);
        gas = 600000
        rc.claimMultipleAndWithdrawBalance.sendTransaction(claimable['question_ids'], claimable['answer_lengths'], claimable['history_hashes'], claimable['answerers'], claimable['bonds'], claimable['answers'], {from: account, gas:gas})
        .then(function(claim_result){
            console.log('claim result txid', claim_result);
        });

    } else {

        ensureQuestionDetailFetched(question_id).then(function(question_detail){
            //console.log(question_detail);
            var claimable = possibleClaimableItems(question_detail);

            //console.log('try9ing to claim ', claimable['total'].toString());
            if (claimable['total'].isZero()) {
                //console.log('nothing to claim');
                // Nothing there, so force a refresh
                openQuestionWindow(question_id);
                delete user_claimable[question_id];
            }
            console.log('claiming with:', claimable)

            // estimateGas gives us a number that credits the eventual storage refund.
            // However, this is only supplied at the end of the transaction, so we need to send more to get us to that point.
            // MetaMask seems to add a bit extra, but it's not enough.
            // Get the number via estimateGas, then add 60000 per question, which should be the max storage we free.

            // For now hard-code a fairly generous allowance
            // Tried earlier with single answerer:
            //  1 answer 48860
            //  2 answers 54947
            //  5 answers 73702
            //var gas = 70000 + (10000 * claimable['history_hashes'].length);
            var gas = 140000 + (10000 * claimable['history_hashes'].length);
            rc.claimMultipleAndWithdrawBalance(claimable['question_ids'], claimable['answer_lengths'], claimable['history_hashes'], claimable['answerers'], claimable['bonds'], claimable['answers'], {from: account, gas:gas})
        .then(function(claim_result){
                //console.log('claim result', claim_result);
            });
        });
    }
});

function validate(win) {
    var valid = true;

    var qtext = win.find('.question-body');
    if (qtext.val() == '') {
        qtext.closest('div').addClass('is-error');
        valid = false;
    } else {
        qtext.closest('div').removeClass('is-error');
    }

    var reward = win.find('.question-reward');
    if (reward.val() === '' || reward.val() <= 0) {
        reward.parent().parent().addClass('is-error');
        valid = false;
    } else {
        reward.parent().parent().removeClass('is-error');
    }

    var options_num = 0;
    var question_type = win.find('.question-type');
    var answer_options = $('.answer-option').toArray();
    for (var i = 0; i < answer_options.length; i++) {
        if (answer_options[i].value !== '') {
            options_num += 1;
        }
    }
    if (win.find('.answer-option-container').hasClass('is-open') && question_type.val() == 'select' && options_num < 2) {
        $('.edit-option-inner').addClass('is-error');
        valid = false;
    } else {
        $('.edit-option-inner').removeClass('is-error');
    }

    var select_ids = ['.question-type', '.arbitrator', '.step-delay'];
    for (var id of select_ids) {
        if (win.find(id).prop('selectedIndex') == 0) {
            win.find(id).parent().addClass('is-error');
            valid = false;
        } else {
            win.find(id).parent().removeClass('is-error');
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
        var nextid = display_entries[sec]['ids'][i];
        var previd;
        if (i > 0) {
            previd = display_entries[sec]['ids'][i+1];
        }
        //console.log('populatewith', previd, nextid, question_detail_list);
        ensureQuestionDetailFetched(nextid, 1, 1, 1, -1).then(function(qdata) {
            populateSection(sec, qdata, previd);
        });
    }

});

// This gets called when we discover an event that may be related to the user.
// We may or may not have already seen this event.
// We may or may not have known that the event was related to the user already.
// We may or may not have fetched information about the question.
function handlePotentialUserAction(entry, is_watch) {
    //console.log('handlePotentialUserAction for entry', entry.args.user, entry, is_watch);

    if (!entry || !entry.args || !entry.args['question_id'] || !entry.blockNumber) {
        console.log('expected content not found in entry', !entry, !entry.args, !entry.args['question_id'], !entry.blockNumber);
        return;
    }

    // This is the same for all events
    var question_id = entry.args['question_id'];

    // If this is the first time we learned that the user is involved with this question, we need to refetch all the other related logs
    // ...in case we lost one due to a race condition (ie we had already got the event before we discovered we needed it)
    // TODO: The filter could be tigher on the case where we already knew we had it, but we didn't know how soon the user was interested in it
    if ( ( !q_min_activity_blocks[question_id]) || (entry.blockNumber < q_min_activity_blocks[question_id]) ) {
        // Event doesn't, in itself, have anything to show we are interested in it
        // NB we may be interested in it later if some other event shows that we should be interested in this question.
        if (!isForCurrentUser(entry)) {
            // console.log('entry', entry.args['question_id'], 'not interesting to account', entry, account);
            return;
        } 

        q_min_activity_blocks[question_id] = entry.blockNumber;

        fetchUserEventsAndHandle({question_id: question_id}, START_BLOCK, 'latest');

        updateUserBalanceDisplay();

    }

    //console.log('handling', entry.args['question_id'], 'entry', entry, account);
    //console.log('handlePotentialUserAction looks interesting, continuing', entry.args.user, entry,is_watch);

    var lastViewedBlockNumber = 0;
    if (getViewedBlockNumber(network_id)) {
        lastViewedBlockNumber = parseInt(getViewedBlockNumber(network_id));
    }
    //console.log(lastViewedBlockNumber);
    if (entry.blockNumber > lastViewedBlockNumber) {
        //$('body').attr('last-update-block-number', entry.blockNumber);
        $('body').addClass('pushing');
    }

    var is_population_done = false;

    //console.log('fetching', question_id);

    // User action
    if ( (entry['event'] == 'LogNewAnswer') && ( submitted_question_id_timestamp[question_id] > 0) ) {
        delete submitted_question_id_timestamp[question_id];
        ensureQuestionDetailFetched(question_id, 1, 1, entry.blockNumber, entry.blockNumber).then(function(question) {
            //question = filledQuestionDetail(question_id, 'answer_logs', entry.blockNumber, entry);
            displayQuestionDetail(question);
            renderUserAction(question, entry, is_watch);
        });
    } else {
     
        //console.log('fetch for notifications: ', question_id, current_block_number, current_block_number);
        ensureQuestionDetailFetched(question_id, 1, 1, current_block_number, current_block_number).then(function(question) {
            if ( (entry['event'] == 'LogNewAnswer') || (entry['event'] == 'LogClaimBond') || (entry['event'] == 'LogClaimBounty' ) || (entry['event'] == 'LogFinalize') ) {
                updateClaimableData(question, entry, is_watch);    
            }
            //console.log('rendering');
            renderUserAction(question, entry, is_watch);
        }).catch(function(e) {
            console.log('got error fetching: ', question_id, e);
        });

    }

}

function updateClaimableData(question, answer_entry, is_watch) {
    var poss = possibleClaimableItems(question);
    if (poss['total'].isZero()) {
        delete user_claimable[question[Qi_question_id]];
    } else {
        user_claimable[question[Qi_question_id]] = poss;
    }
    //console.log('user_claimable', user_claimable);
    var merged = mergePossibleClaimable(user_claimable);
    //console.log('merged', merged);
    //console.log('total merge:', merged.total.toNumber());

    rc.balanceOf.call(account).then(function(result) {
        var ttl = result.plus(merged.total);
        if (ttl.gt(0)) {
            $('.answer-claim-button.claim-all').find('.claimable-eth').text(web3.fromWei(ttl.toNumber(), 'ether'));
            $('.answer-claim-button.claim-all').show();
        } else {
            $('.answer-claim-button.claim-all').fadeOut();
        }
    });

}

function mergePossibleClaimable(posses) {
    var combined = {
        'total': new BigNumber(0),
        'question_ids': [],
        'answer_lengths': [],
        'answers': [],
        'answerers': [],
        'bonds': [],
        'history_hashes': [] 
    }
    for(var qid in posses) {
        if (posses.hasOwnProperty(qid)) {
            combined['total'] = combined['total'].plus(posses[qid].total);
            combined['question_ids'].push(...posses[qid].question_ids);
            combined['answer_lengths'].push(...posses[qid].answer_lengths);
            combined['answers'].push(...posses[qid].answers);
            combined['answerers'].push(...posses[qid].answerers);
            combined['bonds'].push(...posses[qid].bonds);
            combined['history_hashes'].push(...posses[qid].history_hashes);
        }
    }
    return combined;
}

function scheduleFinalizationDisplayUpdate(question) {
    //console.log('in scheduleFinalizationDisplayUpdate', question);
    // TODO: The layering of this is a bit weird, maybe it should be somewhere else?
    if (!isFinalized(question) && isAnswered(question) && !isArbitrationPending(question)) {
        var question_id = question[Qi_question_id];
        var is_done = false;
        if (question_event_times[question_id]) {
            if (question_event_times[question_id].finalization_ts == question[Qi_finalization_ts]) {
                //console.log('leaving existing timeout for question', question_id)
                is_done = true;
            } else {
                clearTimeout(question_event_times[question_id].timeout_id);
                //console.log('clearing timeout for question', question_id)
            }
        }
        if (!is_done) {
            //console.log('scheduling');
            // Run 1 second after the finalization timestamp
            var update_time = (1000 + (question[Qi_finalization_ts].toNumber() * 1000) - new Date().getTime() );
            //console.log('update_time is ', update_time);
            var timeout_id = setTimeout( function() {
                // TODO: Call again here in case it changed and we missed it
                clearTimeout(question_event_times[question_id].timeout_id);
                delete question_event_times[question_id];

                ensureQuestionDetailFetched(question_id, 1, 1, current_block_number, current_block_number).then(function(question) {

                    if (isFinalized(question)) { 
                        updateQuestionWindowIfOpen(question);
                        updateRankingSections(question, Qi_finalization_ts, question[Qi_finalization_ts]); 

                        // The notification code sorts by block number
                        // So get the current block
                        // But also add the timestamp for display
                        web3.eth.getBlock('latest', function(err, result) {
                            // There no blockchain event for this, but otherwise it looks to the UI like a normal event
                            // Make a pretend log to feed to the notifications handling function.
                            block_timestamp_cache[result.number] = result.timestamp
                            var fake_entry = {
                                event: 'LogFinalize',
                                blockNumber: result.number,
                                timestamp: question[Qi_finalization_ts].toNumber(),
                                args: {
                                    question_id: question[Qi_question_id],
                                }
                            }
                            //console.log('sending fake entry', fake_entry, question);
             
                            renderNotifications(question, fake_entry);
                        });
                    }

                });

            }, update_time );
            question_event_times[question_id] = {'finalization_ts': question[Qi_finalization_ts], 'timeout_id': timeout_id };
            //console.log(question_event_times);
        }
    } else {
        //console.log('scheduling not doing: ', isFinalized(question), isAnswered(question));
    }

}

function filledQuestionDetail(question_id, data_type, freshness, data) {

    if (!question_id) {
        //console.log(question_id, data_type, freshness, data);
        throw Error("filledQuestionDetail called without question_id, wtf")
    }

    // Freshness should look like this:
    // {question_log: 0, question_call: 12345, answers: -1} 

    // Data should look like this:
    // {question_log: {}, question_call: {}, answers: []} )

    // TODO: Maybe also need detected_last_changes for when we know data will change, but don't want to fetch it unless we need it

    var question = {'freshness': {'question_log': -1, 'question_json': -1, 'question_call': -1, 'answers': -1}, 'history': [], 'history_unconfirmed': []};
    question[Qi_question_id] = question_id;
    if (question_detail_list[question_id]) {
        question = question_detail_list[question_id];
    }

    switch (data_type) {
            
        case 'question_log':
            if (data && (freshness >= question.freshness.question_log)) {
                question.freshness.question_log = freshness;
                //question[Qi_question_id] = data.args['question_id'];
                question[Qi_creation_ts] = data.args['created'];
                question[Qi_question_creator] = data.args['user'];
                question[Qi_question_created_block] = data.blockNumber;
                question[Qi_question_hash] = data.args['question_hash'];
                question[Qi_question_text] = data.args['question'];
                question[Qi_template_id] = data.args['template_id'].toNumber();
                //question[Qi_bounty] = data.args['bounty'];
            }
            break;

        case 'question_json':
            if (data && (freshness >= question.freshness.question_json)) {
                question.freshness.question_json = freshness;
                question[Qi_question_json] = data;
            }
            break;

        case 'question_call':
            //console.log('in case question_call');
            if (data && (freshness >= question.freshness.question_call)) {
                //console.log('call data new, not setting', freshness, ' vs ', question.freshness.question_call, question)
                // Question ID is tacked on after the call.
                // This never changes, so it doesn't matter whether it's filled by the logs or by the call.
                question.freshness.question_call = freshness;
                //question[Qi_question_id] = question_id;
                question[Qi_finalization_ts] = data[Qi_finalization_ts-1];
                question[Qi_arbitrator] = data[Qi_arbitrator-1];
                question[Qi_timeout] = data[Qi_timeout-1];
                question[Qi_question_hash] = data[Qi_question_hash-1];
                question[Qi_bounty] = data[Qi_bounty-1];
                question[Qi_best_answer] = data[Qi_best_answer-1];
                question[Qi_bond] = data[Qi_bond-1];
                question[Qi_history_hash] = data[Qi_history_hash-1];
                //console.log('set question', question_id, question);
            }  else {
                //console.log('call data too old, not setting', freshness, ' vs ', question.freshness.question_call, question)
            }
            break;

        case 'answers':
            if (data && (freshness >= question.freshness.answers)) {
                question.freshness.answers = freshness;
                question['history'] = data;
            }
            if (data.length && question['history_unconfirmed'].length) {
                for(var j=0; j<question['history_unconfirmed'].length; j++) {
                    var ubond = question['history_unconfirmed'][j].args.bond;
                    for(var i=0; i<question['history'].length; i++) {
                        // If there's something unconfirmed with an equal or lower bond, remove it
                        if (data[i].args.bond.gte( ubond )) {
                            //console.log('removing unconfirmed entry due to higher bond from confirmed');
                            question['history_unconfirmed'].splice(j, 1);
                        }
                    }
                }
            }
            break;

        case 'answers_unconfirmed':
            //console.log('adding answers_unconfirmed');
            // Ignore the age and just see if we have it already
            for(var i=0; i<question['history'].length; i++) {
                //console.log('already have a higher bond, removing');
                // If there's something confirmed with an equal or higher bond, ignore the unconfirmed one
                if (question['history'][i].args.bond.gte( data.args.bond )) {
                    break;
                }
            }
            //console.log('adding data to history_unconfirmed');
            question['history_unconfirmed'].push(data);
            break;

    }

    question_detail_list[question_id] = question;

    //console.log('was called filledQuestionDetail', question_id, data_type, freshness, data); 
    //console.log('returning question', question);

    return question;

}

function isDataFreshEnough(question_id, data_type, freshness) {
    //console.log('looking at isDataFreshEnough for ', question_id, data_type, freshness);
    // We set -1 when we don't need the data at all
    if (freshness == -1) {
        //console.log('-1, not needed');
        return true;
    }
    if (!question_detail_list[question_id]) {
        //console.log('question not found, definitely fetch');
        return false;
    }
    if (question_detail_list[question_id].freshness[data_type] >= freshness) {
        //console.log('is fresh', question_detail_list[question_id].freshness, freshness) 
        return true;
    } else {
        //console.log('is not fresh', question_detail_list[question_id].freshness[data_type], freshness) 
        return false;
    }
}

// No freshness as this only happens once per question
function _ensureQuestionLogFetched(question_id, freshness) {
    var called_block = current_block_number;
    return new Promise((resolve, reject)=>{
        if (isDataFreshEnough(question_id, 'question_log', freshness)) {
            resolve(question_detail_list[question_id]);
        } else {
            var question_logs = rc.LogNewQuestion({question_id:question_id}, {fromBlock: START_BLOCK, toBlock:'latest'});
            question_logs.get(function(error, question_arr) {
                if (error || question_arr.length != 1) {
                    console.log('error in question log', error, question_arr, question_id, START_BLOCK);
                    reject(error);
                } else {
                    var question = filledQuestionDetail(question_id, 'question_log', called_block, question_arr[0]);
                    resolve(question);
                }
            });
        }
    });
}

function _ensureQuestionDataFetched(question_id, freshness) {
    var called_block = current_block_number;
    return new Promise((resolve, reject)=>{
        if (isDataFreshEnough(question_id, 'question_call', freshness)) {
            resolve(question_detail_list[question_id]);
        } else {
            rc.questions.call(question_id).then(function(result){
                var question = filledQuestionDetail(question_id, 'question_call', called_block, result);
                resolve(question);
            }).catch(function(err) {
                console.log('error in data');
                reject(err);
            });
        }
    });
}

function populatedJSONForTemplate(template, question) {
    var qbits = question.split(QUESTION_DELIMITER);
    //console.log('pp', template);
    //console.log('qbits', qbits);
    var interpolated = vsprintf(template, qbits);
    //console.log('resulting template', interpolated);
    return parseQuestionJSON(interpolated);
}

function _ensureQuestionTemplateFetched(question_id, template_id, qtext, freshness) {
    //console.log('ensureQuestionDetailFetched', template_id, template_content[template_id], qtext);
    return new Promise((resolve, reject)=>{
        if (isDataFreshEnough(question_id, 'question_json', freshness)) {
            resolve(question_detail_list[question_id]);
        } else {
            if (template_content[template_id]) {
                var question = filledQuestionDetail(question_id, 'question_json', 1, populatedJSONForTemplate(template_content[template_id], qtext));
                resolve(question);
            } else {
                // The category text should be in the log, but the contract has the block number
                // This allows us to make a more efficient pin-point log call for the template content
                rc.templates.call(template_id)
                .then(function(block_num) {
                    var cat_logs = rc.LogNewTemplate({template_id:template_id}, {fromBlock: block_num, toBlock:block_num});
                    cat_logs.get(function(error, cat_arr) {
                        if (cat_arr.length == 1) {
                            //console.log('adding template content', cat_arr, 'template_id', template_id);
                            template_content[template_id] = cat_arr[0].args.question_text;
                            //console.log(template_content);
                            var question = filledQuestionDetail(question_id, 'question_json', 1, populatedJSONForTemplate(template_content[template_id], qtext));
                            resolve(question);
                        } else {
                            console.log('error fetching template - unexpected cat length');
                            reject(new Error("Category response unexpected length"));
                        }
                    });
                }).catch(function(err) {
                    console.log('error fetching template');
                    reject(err);
                });
            }
        }
    });
}

function _ensureAnswersFetched(question_id, freshness, start_block) {
    var called_block = current_block_number;
    return new Promise((resolve, reject)=>{
        if (isDataFreshEnough(question_id, 'answers', freshness)) {
            resolve(question_detail_list[question_id]);
        } else {
            //console.log('fetching answers from start_block', start_block);
            var answer_logs = rc.LogNewAnswer({question_id:question_id}, {fromBlock: start_block, toBlock:'latest'});
            answer_logs.get(function(error, answer_arr) {
                if (error) {
                    console.log('error in get');
                    reject(error);
                } else {
                    var question = filledQuestionDetail(question_id, 'answers', called_block, answer_arr);
                    resolve(question);
                }
            });
        }
    });
}

// question_log is optional, pass it in when we already have it
function ensureQuestionDetailFetched(question_id, ql, qi, qc, al) {

    var params = {};
    if (ql == undefined) ql = 1;
    if (qi == undefined) qi = 1;
    if (qc == undefined) qc = current_block_number;
    if (al == undefined) al = current_block_number;

    var called_block = current_block_number;
    //console.log('ensureQuestionDetailFetched with called_block', called_block);
    return new Promise((resolve, reject)=>{
        _ensureQuestionLogFetched(question_id, ql).then(function(q) {
            return _ensureQuestionDataFetched(question_id, qc);
        }).then(function(q) {
            return _ensureQuestionTemplateFetched(question_id, q[Qi_template_id], q[Qi_question_text], qi);
        }).then(function(q) {
            return _ensureAnswersFetched(question_id, al, q[Qi_question_created_block]);
        }).then(function(q) {
            resolve(q);
        }).catch(function(e) {
            console.log('cauught error', question_id, e);
            reject(e);
        });
    });
}

// TODO: Fire this on a timer, and also on the withdrawal event
function updateUserBalanceDisplay() {
    if (!account) {
        return;
    }
    //console.log('updating balacne for', account);
    web3.eth.getBalance(account, function(error, result){
        //console.log('got updated balacne for', account, result.toNumber());
        if (error === null) {
            $('.account-balance').text(web3.fromWei(result.toNumber(), 'ether'));
        }
    });
}

function populateSection(section_name, question_data, before_item) {

    var question_id = question_data[Qi_question_id];

    var idx = display_entries[section_name].ids.indexOf(question_id);
    //console.log('idx is ',idx);
    if (idx > display_entries[section_name].max_show) {
        //console.log('over max show, skip', question_id);
        return;
    }

    var question_item_id = section_name + '-question-' + question_id;
    var before_item_id = section_name + '-question-' + before_item

    var target_question_id = 'qadetail-' + question_id;

    var section = $('#'+section_name);

    // If the item is already in the document but in the wrong place, remove it.
    // If it's already in the right place, do nothing
    var existing_in_doc = section.find('#' + question_item_id);
    if (existing_in_doc.length) {
        if (existing_in_doc.next().attr('id') == before_item_id) {
            //console.log('already before item', before_item_id);
            return;
        } else {
            //console.log('already in doc, removing', question_item_id);
            existing_in_doc.remove();
        }
    } else {
        //console.log('not in doc yet, adding', question_id,' at ', question_item_id);
        //console.log('item to insert before is here? ', before_item_id, section.find('#' + before_item_id).length);
    }

    var is_found = (section.find('#' + before_item_id).length > 0);
    var entry = $('.questions__item.template-item').clone();

    entry = populateSectionEntry(entry, question_data);

    entry.attr('id', question_item_id).removeClass('template-item');
    entry.css('display', 'none');

    //console.log('adding entry', question_item_id, 'before item', before_item);
    if (before_item && is_found) {
        section.find('#' + before_item_id).before(entry);
    } else {
        section.children('.questions-list').append(entry);
    }

    entry.fadeIn(1000);
    if (display_entries[section_name]['ids'].length > 3) {
        if (section.find('.loadmore-button').css('display') == 'none') {
            section.children('.questions-list').find('.questions__item:last-child').remove();
        }
    }
    if (section.children('.questions-list').find('.questions__item').length >= display_entries[section_name]['ids'].length) {
        section.find('.loadmore-button').css('display', 'none');
    } else {
        section.find('.loadmore-button').css('display', 'block');
    }
    while (section.children('.questions-list').find('.questions__item').length > display_entries[section_name].max_show) {
        //console.log('too long, removing');
        section.children('.questions-list').find('.questions__item:last-child').remove()
    }

    // question settings warning balloon
    let balloon_html = '';
    if (question_data[Qi_timeout] < 86400) {
        balloon_html += 'The timeout is very low.<br /><br />This means there may not be enough time for people to correct mistakes or lies.<br /><br />';
    }
    if (web3.fromWei(question_data[Qi_bounty], 'ether') < 0.01) {
        balloon_html += 'The reward is very low.<br /><br />This means there may not be enough incentive to enter the correct answer and back it up with a bond.<br /><br />';
    }
    let arbitrator_addrs = $('#arbitrator').children();
    let valid_arbirator = isArbitratorValid(question_data[Qi_arbitrator]);
    if (!valid_arbirator) {
        balloon_html += 'This arbitrator is unknown.';
    }
    if (balloon_html) {
        $('div[data-question-id='+question_id+']').find('.question-setting-warning').css('display', 'block');
        $('div[data-question-id='+question_id+']').find('.question-setting-warning').css('z-index', 5);
        $('div[data-question-id='+question_id+']').find('.question-setting-warning').find('.balloon').html(balloon_html);
    }

}

function updateSectionEntryDisplay(question) {
    $('div.questions__item[data-question-id="'+question[Qi_question_id]+'"]').each(function() {
        //console.log('updateSectionEntryDisplay update question', question[Qi_question_id]);
        populateSectionEntry($(this), question);
    });
}

function populateSectionEntry(entry, question_data) {

    var question_id = question_data[Qi_question_id];
    var question_json = question_data[Qi_question_json];
    var posted_ts = question_data[Qi_creation_ts];
    var arbitrator = question_data[Qi_arbitrator];
    var timeout = question_data[Qi_timeout];
    var bounty = web3.fromWei(question_data[Qi_bounty], 'ether');
    var is_arbitration_pending = isArbitrationPending(question_data);
    var is_finalized = isFinalized(question_data);
    var best_answer = question_data[Qi_best_answer];

    var options = '';
    if (typeof question_json['outcomes'] !== 'undefined') {
        for (var i = 0; i < question_json['outcomes'].length; i++) {
            options = options + i + ':' + question_json['outcomes'][i] + ', ';
        }
    }

    entry.attr('data-question-id', question_id);
    //entry.find('.questions__item__title').attr('data-target-id', target_question_id);

    entry.find('.question-title').text(question_json['title']).expander({expandText: '', slicePoint:140});
    entry.find('.question-bounty').text(bounty);

    if (isAnswered(question_data)) {
        entry.find('.questions__item__answer').text(getAnswerString(question_json, best_answer));
        entry.addClass('has-answer');
    } else {
        entry.find('.questions__item__answer').text('');
        entry.removeClass('has-answer');
    }


    var is_answered = isAnswered(question_data);

    if (is_answered) {
        entry.addClass('has-answers').removeClass('no-answers');
    } else {
        entry.removeClass('has-answers').addClass('no-answers');
    }

    timeago.cancel(entry.find('.timeago'));
    if (isArbitrationPending(question_data)) {
        entry.addClass('arbitration-pending');
    } else {
        entry.removeClass('arbitration-pending');
        if (is_answered) {
            entry.find('.closing-time-label .timeago').attr('datetime', convertTsToString(question_data[Qi_finalization_ts]));
            timeAgo.render(entry.find('.closing-time-label .timeago'));
        } else {
            entry.find('.created-time-label .timeago').attr('datetime', convertTsToString(question_data[Qi_creation_ts]));
            timeAgo.render(entry.find('.created-time-label .timeago'));
        }
    }

    return entry;

}

function depopulateSection(section_name, question_id) {
    //console.log('depopulating', section_name, question_id);

    var question_item_id = section_name + '-question-' + question_id;
    var section = $('#'+section_name);

    var item = section.find('#'+question_item_id);
    if (item.length) {
        item.remove();
        // Add the next entry to the bottom
        var current_last_qid = section.find('.questions__item').last().attr('data-question-id');
        var current_last_idx = display_entries[section_name]['ids'].indexOf(current_last_qid);
        var next_idx = current_last_idx + 1;
        if (display_entries[section_name]['ids'].length > next_idx) {
            var add_qid = display_entries[section_name]['ids'][next_idx];
            var qdata = question_detail_list[add_qid];
            populateSection(section_name, qdata, current_last_qid);
        }
    }

}

function handleQuestionLog(item) {
    var question_id = item.args.question_id;
    //console.log('in handleQuestionLog', question_id);
    var created = item.args.created

    // Populate with the data we got
    //console.log('before filling in handleQuestionLog', question_detail_list[question_id]);
    var question_data = filledQuestionDetail(question_id, 'question_log', item.blockNumber, item);
    //console.log('after filling in handleQuestionLog', question_detail_list[question_id]);

    // Then fetch anything else we need to display
    ensureQuestionDetailFetched(question_id, 1, 1, item.blockNumber, -1).then(function(question_data) {

        updateQuestionWindowIfOpen(question_data);

        if (category && question_data[Qi_question_json].category != category) {
            //console.log('mismatch for cat', category, question_data[Qi_question_json].category);
            return;
        } else {
            //console.log('category match', category, question_data[Qi_question_json].category);
        }

        var is_finalized = isFinalized(question_data);
        var bounty = question_data[Qi_bounty];

        if (is_finalized) {
            var insert_before = update_ranking_data('questions-resolved', question_id, question_data[Qi_finalization_ts], 'desc');
            if (insert_before !== -1) {
                // TODO: If we include this we have to handle the history too
                // question_detail_list[question_id] = question_data;
                populateSection('questions-resolved', question_data, insert_before);
                if (display_entries['questions-resolved']['ids'].length > 3 && $('#questions-resolved').find('.loadmore-button').css('display') == 'none') {
                    $('#questions-resolved').find('.loadmore-button').css('display', 'block');
                }
            }

        } else {
            var insert_before = update_ranking_data('questions-latest', question_id, created, 'desc');
            if (insert_before !== -1) {
                // question_detail_list[question_id] = question_data;
                populateSection('questions-latest', question_data, insert_before);
                if (display_entries['questions-latest']['ids'].length > 3 && $('#questions-latest').find('.loadmore-button').css('display') == 'none') {
                    $('#questions-latest').find('.loadmore-button').css('display', 'block');
                }
            }

            var insert_before = update_ranking_data('questions-high-reward', question_id, bounty, 'desc');
            if (insert_before !== -1) {
                // question_detail_list[question_id] = question_data;
                populateSection('questions-high-reward', question_data, insert_before);
                if (display_entries['questions-high-reward']['ids'].length > 3 && $('#questions-high-reward').find('.loadmore-button').css('display') == 'none') {
                    $('#questions-high-reward').find('.loadmore-button').css('display', 'block');
                }
            }
            
            if (isAnswered(question_data)) {
                var insert_before = update_ranking_data('questions-closing-soon', question_id, question_data[Qi_finalization_ts], 'asc');
                if (insert_before !== -1) {
                    populateSection('questions-closing-soon', question_data, insert_before);
                    if (display_entries['questions-closing-soon']['ids'].length > 3 && $('#questions-closing-soon').find('.loadmore-button').css('display') == 'none') {
                        $('#questions-closing-soon').find('.loadmore-button').css('display', 'block');
                    }
                }
            }

            scheduleFinalizationDisplayUpdate(question_data);
            //console.log(display_entries);
        }

        //console.log('bounty', bounty, 'is_finalized', is_finalized);
    });
}

// Inserts into the right place in the stored rankings.
// If it comes after another stored item, return the ID of that item.
// If it doesn't belong in storage because it is too low for the ranking, return -1
// TODO: ??? If it is already in storage and does not need to be updated, return -2
function update_ranking_data(arr_name, id, val, ord) {

    // Check if we already have it
    var existing_idx = display_entries[arr_name]['ids'].indexOf(id);
    if (existing_idx !== -1) {
        //console.log('not found in list');

        // If it is unchanged, return a code saying there is nothing to do
        if (val.equals(display_entries[arr_name]['vals'][existing_idx])) {
            //console.log('nothing to do, val was unchanged at', val, display_entries[arr_name]['vals'][existing_idx]);
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
        //console.log('list full and lower, give up');
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
        if ((ord == 'desc' && val.gte(arr[i])) || (ord == 'asc' && val.lte(arr[i]))) {
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
    $(document).on('change', '.question-type', function(e){
        var win = $(this).closest('.rcbrowser');
        var container = win.find('.answer-option-container');
        if (win.find('.question-type').val() == 'single-select' || win.find('.question-type').val() == 'multiple-select') {
            if (!container.hasClass('is-open')) {
                container.css('display', 'block');
                container.addClass('is-open');
                container.addClass('is-bounce');
            }
        } else {
            container.css('display', 'none');
            container.removeClass('is-open');
            container.removeClass('is-bounce');
            win.find('.first-answer-option').children().val('');
            win.find('.input-container--answer-option').remove();
        }
    });

    $(document).on('click', '.add-option-button', function(e){
        var win = $(this).closest('.rcbrowser');
        var element = $('<div>');
        element.addClass('input-container input-container--answer-option');
        var input = '<input type="text" name="editOption0" class="rcbrowser-input answer-option form-item" placeholder="Enter the option...">';
        element.append(input);
        win.find('.error-container--answer-option').before(element);
        element.addClass('is-bounce');
    });
})();

$(document).on('click', '.questions__item__title', function(e){
    if ( $(e.target).hasClass('more-link') || $(e.target).hasClass('less-link') ) {
        return true;
    }

    e.preventDefault();
    e.stopPropagation();

    var question_id = $(this).closest('.questions__item').attr('data-question-id');

    // Should repopulate and bring to the front if already open
    openQuestionWindow(question_id);

});

$(document).on('click', '.your-qa__questions__item', function(e) {
    if ( $(e.target).hasClass('more-link') || $(e.target).hasClass('less-link') ) {
        return true;
    }

    e.preventDefault();
    e.stopPropagation();

    var question_id = $(this).closest('.your-qa__questions__item').attr('data-question-id');

    openQuestionWindow(question_id);

});

function openQuestionWindow(question_id) {

    // To respond quickly, start by fetching with even fairly old data and no logs
    ensureQuestionDetailFetched(question_id, 1, 1, 1, -1).then(function(question) {
        displayQuestionDetail(question);
        // Get the window open first with whatever data we have
        // Then repopulate with the most recent of everything anything has changed
        ensureQuestionDetailFetched(question_id, 1, 1, current_block_number, current_block_number).then(function(question) {
            updateQuestionWindowIfOpen(question);
        });
    });
    /*
    .catch(function(e){
        console.log(e);
    });
    */
}

function parseQuestionJSON(data) {

    var question_json;
    try {
        question_json = JSON.parse(data);
    } catch(e) {
        console.log('parse fail', e);
        question_json = {
            'title': data,
            'type': 'bool'
        };
    }
    if (question_json['outcomes'] && question_json['outcomes'].length > QUESTION_MAX_OUTCOMES) {
        throw Error("Too many outcomes");
    }
    return question_json;
     

}

function updateQuestionWindowIfOpen(question) {

    var question_id = question[Qi_question_id];
    var window_id = 'qadetail-' + question_id;
    var rcqa = $('#'+window_id);
    if (rcqa.length) {
        rcqa = populateQuestionWindow(rcqa, question, true);
    }
    // TODO: This should probably be happening in populateQuestionWindow, based on some data indicated confirmed
    rcqa.removeClass('unconfirmed-transaction').removeClass('has-warnings');

}

function displayQuestionDetail(question_detail) {

    var question_id = question_detail[Qi_question_id];
    //console.log('question_id', question_id);

    // If already open, refresh and bring to the front
    var window_id = 'qadetail-' + question_id;
    var rcqa = $('#'+window_id);
    if (rcqa.length) {
        rcqa = populateQuestionWindow(rcqa, question_detail, true);
        //rcqa.css('display', 'block');
        //rcqa.addClass('is-open');
        rcqa.css('z-index', ++zindex);
        //rcqa.css('height', rcqa.height()+'px');
        //setRcBrowserPosition(rcqa);
        //Ps.initialize(rcqa.find('.rcbrowser-inner').get(0));

    } else {
        rcqa = $('.rcbrowser--qa-detail.template-item').clone();
        rcqa.attr('id', window_id);
        rcqa.attr('data-question-id', question_id);

        rcqa.find('.rcbrowser__close-button').on('click', function(){
            let parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
            let left = parseInt(parent_div.css('left').replace('px', ''));
            let top = parseInt(parent_div.css('top').replace('px', ''));
            let data_x = (parseInt(parent_div.attr('data-x')) || 0);
            let data_y = (parseInt(parent_div.attr('data-y')) || 0);
            left += data_x; top += data_y;
            window_position[question_id] = {'x': left, 'y': top};
            rcqa.remove();
            document.documentElement.style.cursor = ""; // Work around Interact draggable bug
            //console.log('clicked close');
            //$('div#' + question_id).remove();
            //question_id = question_id.replace('qadetail-', '');
            //delete question_detail_list[question_id]
        });

        rcqa.removeClass('template-item');

        rcqa = populateQuestionWindow(rcqa, question_detail, false);

        $('#qa-detail-container').append(rcqa);

        rcqa.css('display', 'block');
        rcqa.addClass('is-open');
        rcqa.css('z-index', ++zindex);
        rcqa.css('height', rcqa.height()+'px');
        setRcBrowserPosition(rcqa);
        Ps.initialize(rcqa.find('.rcbrowser-inner').get(0));
    }

}

function populateQuestionWindow(rcqa, question_detail, is_refresh) {

    //console.log('populateQuestionWindow with detail ', question_detail);
    //console.log('populateQuestionWindow question_json', question_detail[Qi_question_json]);
    var question_id = question_detail[Qi_question_id];
    var question_json = question_detail[Qi_question_json];
    var question_type = question_json['type'];

    //console.log('current list last item in history, which is ', question_detail['history'])
    var idx = question_detail['history'].length - 1;

    let date = new Date();
    date.setTime(question_detail[Qi_creation_ts] * 1000);
    let date_str = monthList[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    rcqa.find('.rcbrowser-main-header-date').text(date_str);
    rcqa.find('.question-title').text(question_json['title']).expander({slicePoint: 200});
    rcqa.find('.reward-value').text(web3.fromWei(question_detail[Qi_bounty], 'ether'));

    var bond = new BigNumber(web3.toWei(0.0001, 'ether'));
    if (isAnswered(question_detail)) {

        var current_container = rcqa.find('.current-answer-container');

        // label for show the current answer.
        var label = getAnswerString(question_json, question_detail[Qi_best_answer]);
        current_container.find('.current-answer-body').find('.current-answer').text(label);

        bond = question_detail[Qi_bond];

        // Default to something non-zero but very low
        if (question_detail['history'].length) {
            //console.log('updateing aunswer');
            var latest_answer = question_detail['history'][idx].args;

            current_container.attr('id', 'answer-' + latest_answer.answer);

            timeago.cancel(current_container.find('.current-answer-item').find('.timeago')); // cancel the old timeago timer if there is one
            current_container.find('.current-answer-item').find('.timeago').attr('datetime', convertTsToString(latest_answer.ts));
            timeAgo.render(current_container.find('.current-answer-item').find('.timeago'));

            // answerer data
            var ans_data = rcqa.find('.current-answer-container').find('.answer-data');
            ans_data.find('.answerer').text(latest_answer.user);
            var avjazzicon = jazzicon(32, parseInt(latest_answer.user.toLowerCase().slice(2,10), 16) );
            ans_data.find('.answer-data__avatar').html(avjazzicon);
            if (latest_answer.user == account) {
                ans_data.addClass('current-account');
            } else {
                ans_data.removeClass('current-account');
            }
            ans_data.find('.answer-bond-value').text(web3.fromWei(latest_answer.bond.toNumber(), 'ether'));

            // TODO: Do duplicate checks and ensure order in case stuff comes in weird
            for (var i = 0; i < idx; i++) {
                var ans = question_detail['history'][i].args;
                var hist_id = 'question-window-history-item-' + web3.sha3(question_id + ans.answer + ans.bond.toString());
                if (rcqa.find('#'+hist_id).length) {
                    //console.log('already in list, skipping', hist_id, ans);
                    continue;
                }
                //console.log('not already in list, adding', hist_id, ans);
                var hist_tmpl = rcqa.find('.answer-item.answered-history-item.template-item');
                var hist_item = hist_tmpl.clone();
                hist_item.attr('id', hist_id);
                hist_item.find('.answerer').text(ans['user']);

                var avjazzicon = jazzicon(32, parseInt(ans['user'].toLowerCase().slice(2,10), 16) );

                hist_item.find('.answer-data__avatar').html(avjazzicon);
                hist_item.find('.current-answer').text(getAnswerString(question_json, ans.answer));
                hist_item.find('.answer-bond-value').text(web3.fromWei(ans.bond.toNumber(), 'ether'));
                hist_item.find('.answer-time.timeago').attr('datetime', convertTsToString(ans['ts']));
                timeAgo.render(hist_item.find('.answer-time.timeago'));
                hist_item.removeClass('template-item');
                hist_tmpl.before(hist_item); 
            }

        } 
    }

    // question settings warning balloon
    let balloon_html = '';
    if (question_detail[Qi_timeout] < 86400) {
        balloon_html += 'The timeout is very low.<br /><br />This means there may not be enough time for people to correct mistakes or lies.<br /><br />';
    }
    if (web3.fromWei(question_detail[Qi_bounty], 'ether') < 0.01) {
        balloon_html += 'The reward is very low.<br /><br />This means there may not be enough incentive to enter the correct answer and back it up with a bond.<br /><br />';
    }
    let valid_arbirator = isArbitratorValid(question_detail[Qi_arbitrator]);
    
    if (!valid_arbirator) {
        balloon_html += 'We do not recognize this arbitrator.<br />Do not believe this information unless you trust them.';
    }
    if (balloon_html) {
        rcqa.find('.question-setting-warning').css('display', 'block');
        rcqa.find('.question-setting-warning').find('.balloon').css('z-index', ++zindex);
        rcqa.find('.question-setting-warning').find('.balloon').html(balloon_html);
    }

    let questioner = question_detail[Qi_question_creator]
    let timeout = question_detail[Qi_timeout];
    balloon_html = ''
        + 'Reward: ' + web3.fromWei(question_detail[Qi_bounty], 'ether') + ' ETH<br>'
        + 'Bond: ' + web3.fromWei(question_detail[Qi_bond], 'ether') + ' ETH<br>'
        + 'Timeout: ' + secondsTodHms(question_detail[Qi_timeout]) + '<br /><br />'
        + 'Created by: <br />' + questioner;
    rcqa.find('.question-setting-info').find('.balloon').css('z-index', ++zindex);
    rcqa.find('.question-setting-info').find('.balloon').html(balloon_html);


    var unconfirmed_container = rcqa.find('.unconfirmed-answer-container');
    if (question_detail['history_unconfirmed'].length) {

        var unconfirmed_answer = question_detail['history_unconfirmed'][question_detail['history_unconfirmed'].length-1].args;

        var txid = question_detail['history_unconfirmed'][question_detail['history_unconfirmed'].length-1].txid;
        unconfirmed_container.find('.pending-answer-txid a').attr('href', 'https://ropsten.etherscan.io/tx/' + txid);
        unconfirmed_container.find('.pending-answer-txid a').text(txid.substr(0, 12) + "...");
        unconfirmed_container.attr('data-pending-txid', txid);

        //unconfirmed_container.attr('id', 'answer-unconfirmed-' + unconfirmed_answer.answer);

        timeago.cancel(unconfirmed_container.find('.unconfirmed-answer-item').find('.timeago')); // cancel the old timeago timer if there is one
        unconfirmed_container.find('.unconfirmed-answer-item').find('.timeago').attr('datetime', convertTsToString(unconfirmed_answer.ts));
        timeAgo.render(unconfirmed_container.find('.unconfirmed-answer-item').find('.timeago'));

        // answerer data
        var ans_data = rcqa.find('.unconfirmed-answer-container').find('.answer-data');
        ans_data.find('.answerer').text(unconfirmed_answer.user);
        var avjazzicon = jazzicon(32, parseInt(unconfirmed_answer.user.toLowerCase().slice(2,10), 16) );
        ans_data.find('.answer-data__avatar').html(avjazzicon);
        if (unconfirmed_answer.user == account) {
            ans_data.addClass('unconfirmed-account');
        } else {
            ans_data.removeClass('unconfirmed-account');
        }
        ans_data.find('.answer-bond-value').text(web3.fromWei(unconfirmed_answer.bond.toNumber(), 'ether'));

        // label for show the unconfirmed answer.
        var label = getAnswerString(question_json, unconfirmed_answer.answer);
        unconfirmed_container.find('.unconfirmed-answer-body').find('.unconfirmed-answer').text(label);

        rcqa.addClass('has-unconfirmed-answer');

    } else {

        rcqa.removeClass('has-unconfirmed-answer');

    }

    // Arbitrator
    if (!isArbitrationPending(question_detail) && !isFinalized(question_detail)) {
        Arbitrator.at(question_detail[Qi_arbitrator]).then(function(arb) {
            return arb.getFee.call(question_id);
        }).then(function(fee) {
            //rcqa.find('.arbitrator').text(question_detail[Qi_arbitrator]);
            rcqa.find('.arbitration-fee').text(web3.fromWei(fee.toNumber(), 'ether')); 
        });
    } 

    if (!is_refresh) {
        // answer form
        var ans_frm = makeSelectAnswerInput(question_json);
        ans_frm.addClass('is-open');
        ans_frm.removeClass('template-item');
        rcqa.find('.answered-history-container').after(ans_frm);
    }

    rcqa.find('.rcbrowser-input--number--bond.form-item').val(web3.fromWei(bond.toNumber(), 'ether') * 2);

    //console.log('call updateQuestionState');
    rcqa = updateQuestionState(question_detail, rcqa);

    if (isFinalized(question_detail)) {    
        var tot = totalClaimable(question_detail);
        if (tot.toNumber() == 0) {
            rcqa.removeClass('is-claimable');
        } else {
            rcqa.addClass('is-claimable');
        } 
    } else {
        rcqa.removeClass('is-claimable');
    }
    
    //console.log(claimableItems(question_detail));

    return rcqa;

}

function totalClaimable(question_detail) {
    var poss = possibleClaimableItems(question_detail);
    return poss['total'];
}

function possibleClaimableItems(question_detail) {

    var ttl = new BigNumber(0); 
    var is_your_claim = false;

    if (new BigNumber(question_detail[Qi_history_hash]).equals(0)) {
        //console.log('everything already claimed', question_detail[Qi_history_hash]);
        return {total: new BigNumber(0)};
    }

    if (!isFinalized(question_detail)) {
        //console.log('not finalized', question_detail);
        return {total: new BigNumber(0)};
    }

    //console.log('should be able to claim question ', question_detail);
    //console.log('history_hash', question_detail[Qi_history_hash]);

    var question_ids = [];
    var answer_lengths = [];
    var claimable_bonds = [];
    var claimable_answers = [];
    var claimable_answerers = [];
    var claimable_history_hashes = [];

    var is_first = true;
    var num_claimed = 0;
    var is_yours = false;

    var final_answer = question_detail[Qi_best_answer];
    for(var i = question_detail['history'].length-1; i >= 0; i--) {
        var answer = question_detail['history'][i].args.answer;
        var answerer = question_detail['history'][i].args.user;
        var bond = question_detail['history'][i].args.bond;
        var history_hash = question_detail['history'][i].args.history_hash; 

        if (is_yours) {
            // Somebody takes over your answer
            if (answerer != account && final_answer == answer) {
                is_yours = false; 
                ttl = ttl.minus(bond); // pay them their bond
            } else {
                ttl = ttl.plus(bond); // take their bond
            }
        } else {
            // You take over someone else's answer
            if (final_answer == answer) {
                is_yours = true;
                ttl = ttl.plus(bond); // your bond back
                if (!is_first) {
                    ttl = ttl.plus(bond); // their takeover payment to you
                }
            }
            if (is_first) {
                ttl = ttl.plus(question_detail[Qi_bounty]);
            }
        }

        claimable_bonds.push(bond);
        claimable_answers.push(answer);
        claimable_answerers.push(answerer);
        claimable_history_hashes.push(history_hash);

        is_first = false;
    }

    if (ttl.gt(0)) {
        question_ids.push(question_detail[Qi_question_id]);
        answer_lengths.push(claimable_bonds.length);
    }

    //console.log('item 0 should match question_data', claimable_history_hashes[0], question_detail[Qi_history_hash]);

    // For the history hash, each time we need to provide the previous hash in the history
    // So delete the first item, and add 0x0 to the end.
    claimable_history_hashes.shift();
    claimable_history_hashes.push(0x0);

    // TODO: Someone may have claimed partway, so we should really be checking against the contract state

    return {
        'total': ttl,
        'question_ids': question_ids,
        'answer_lengths': answer_lengths,
        'answers': claimable_answers,
        'answerers': claimable_answerers,
        'bonds': claimable_bonds,
        'history_hashes': claimable_history_hashes
    }
    
}

function renderTimeAgo(i, ts) {
    var old_attr = i.find('.timeago').attr('datetime');
    if (old_attr != '') {
        timeago.cancel(i.find('.timeago'));
    } 
    i.find('.timeago').attr('datetime', convertTsToString(ts));
    timeAgo.render(i.find('.timeago'));
}

// Anything in the document with this class gets updated
// For when there's a single thing changed, and it's not worth doing a full refresh
function updateAnyDisplay(question_id, txt, cls) {
    $("[data-question-id='" + question_id+ "']").find('.'+cls).text(txt);
}

/*
Finds any item with timeago and the given block number
Fetches the timestamp for the block if not already cached
Populates the timestamp attribute
Calls the callback on it
*/
function populateWithBlockTimeForBlockNumber(item, num, cbk) {

    if (block_timestamp_cache[num]) {
        cbk(item, block_timestamp_cache[num]);
    } else {
        web3.eth.getBlock(num, function(err, result) {
            if (err || !result) {
                console.log('getBlock err', err, result);
                return;
            }
            block_timestamp_cache[num] = result.timestamp
            cbk(item, result.timestamp);
        });
    }

}

// At this point the data we need should already be stored in question_detail_list
function renderUserAction(question, entry, is_watch) {

    // Keep track of the last block number whose result we could see by clicking on the user link
    if (entry.blockNumber > last_displayed_block_number) {
        last_displayed_block_number = entry.blockNumber;
    }

    // This will include events that we didn't specifically trigger, but we are intereseted in
    renderNotifications(question, entry);

    // Only show here if we asked the question (questions section) or gave the answer (answers section)
    if (entry['event'] == 'LogNewQuestion' || entry['event'] == 'LogNewAnswer') {
        if (isForCurrentUser(entry)) {
            renderUserQandA(question, entry);
            if (is_watch) {
                if (entry.blockNumber > parseInt(getViewedBlockNumber(network_id))) {
                    $('.tooltip').addClass('is-visible');
                }
            }
        }
    }

}

function answersByMaxBond(answer_logs) {
    var ans = {};
    for (var i=0; i<answer_logs.length; i++) {
        var an = answer_logs[i];
        var aval = an.args.answer;
        var bond = an.args.bond;
        if (ans[aval] && ans[aval].args.bond >= bond) {
            continue;
        }
        ans[aval] = an;
    }
    return ans;
}

function insertNotificationItem(evt, notification_id, ntext, block_number, question_id, is_positive, timestamp) {

    if ($('.no-notifications-item').length > 0) {
        $('.no-notifications-item').remove();
        $('.see-all-notifications').css('visibility', 'visible');
    }

    var notifications = $('#your-question-answer-window').find('.notifications');
    if (document.getElementById(notification_id)) {
        // Already in the doc;
        return true;
    }

    var existing_notification_items = notifications.find('.notifications-item');

    var item_to_insert = $('#your-question-answer-window .notifications-template-container .notifications-item.template-item').clone();
    item_to_insert.addClass('notification-event-' + evt);
    item_to_insert.attr('id', notification_id);
    item_to_insert.attr('data-question-id', question_id);
    item_to_insert.find('.notification-text').text(ntext).expander();
    item_to_insert.attr('data-block-number', block_number);
    item_to_insert.removeClass('template-item').addClass('populated-item');

    // Template item has a positive badge
    // Turn it from green to red if something bad happened
    if (!is_positive) {
        item_to_insert.find('.notification-badge').removeClass('notification-badge--positive').addClass('notification-badge--negative');
    }

    var inserted = false;
    existing_notification_items.each( function(){
        var exi = $(this);
        //console.log('compare', exi.attr('data-block-number'),' with our block number', block_number);
        if (exi.attr('data-block-number') <= block_number) {
            exi.before(item_to_insert);
            inserted = true;
            return false;
        }
        return true;
    });
       
    if (!inserted) {
        notifications.append(item_to_insert);
    }

    // If we faked the event then we already have the timestamp
    // We still use the latest block number for sorting purposes.
    if (timestamp) {
        renderTimeAgo(item_to_insert, timestamp);
    } else {
        populateWithBlockTimeForBlockNumber(item_to_insert, block_number, renderTimeAgo);
    }

}

function renderNotifications(qdata, entry) {

    var question_id = qdata[Qi_question_id];
    //console.log('renderNotification', action, entry, qdata);

    var question_json = qdata[Qi_question_json];

    var your_qa_window = $('#your-question-answer-window');

    // TODO: Handle whether you asked the question

    var ntext;
    var evt = entry['event'] 
    switch (evt) {
        case 'LogNewQuestion':
            var notification_id = web3.sha3('LogNewQuestion' + entry.args.question_text + entry.args.arbitrator + entry.args.timeout.toString());
            ntext  = 'You asked a question - "' + question_json['title'] + '"';
            insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true);
            break;

        case 'LogNewAnswer':
            var is_positive = true;
            var notification_id = web3.sha3('LogNewAnswer' + entry.args.question_id + entry.args.user + entry.args.bond.toString());
            if (entry.args.user == account) {
                ntext = 'You answered a question - "' + question_json['title'] + '"';
                insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true);
            } else {
                var answered_question = rc.LogNewQuestion({question_id: question_id}, {
                    fromBlock: START_BLOCK,
                    toBlock: 'latest'
                });
                answered_question.get(function (error, result2) {
                    if (error === null && typeof result2 !== 'undefined') {
                        if (result2[0].args.user == account) {
                            ntext = 'Someone answered to your question';
                        } else if (qdata['history'][qdata['history'].length - 2].args.user == account) {
                            is_positive = false;
                            ntext = 'Your answer was overwritten';
                        }
                        if (typeof ntext !== 'undefined') {
                            ntext += ' - "' + question_json['title'] + '"';
                            insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, is_positive);
                        }
                    }
                });
            }
            break;

        case 'LogFundAnswerBounty':
            var notification_id = web3.sha3('LogFundAnswerBounty' + entry.args.question_id + entry.args.bounty.toString() + entry.args.bounty_added.toString() + entry.args.user);
            if (entry.args.user == account) {
                ntext = 'You added reward - "' + question_json['title'] + '"';
                insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true);
            } else {
                var funded_question = rc.LogNewQuestion({question_id: question_id}, {
                    fromBlock: START_BLOCK,
                    toBlock: 'latest'
                });
                // TODO: Should this really always be index 0?
                funded_question.get(function (error, result2) {
                    if (error === null && typeof result2 !== 'undefined') {
                        if (result2[0].args.user == account) {
                            ntext = 'Someone added reward to your question';
                        } else {
                            var prev_hist_idx = qdata['history'].length - 2;
                            if ( (prev_hist_idx >= 0) && (qdata['history'][prev_hist_idx].args.user == account) ) {
                                ntext = 'Someone added reward to the question you answered';
                            }
                        }
                        if (typeof ntext !== 'undefined') {
                            ntext += ' - "' + question_json['title'] + '"';
                            insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true);
                        }
                    }
                });
            }
            break;

        case 'LogNotifyOfArbitrationRequest':
            var notification_id = web3.sha3('LogNotifyOfArbitrationRequest' + entry.args.question_id);
            var is_positive = true;
            if (entry.args.user == account) {
                ntext = 'You requested arbitration - "' + question_json['title'] + '"';
                insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true);
            } else {
                var arbitration_requested_question = rc.LogNewQuestion({question_id: question_id}, {fromBlock: START_BLOCK, toBlock: 'latest'});
                arbitration_requested_question.get(function (error, result2) {
                    if (error === null && typeof result2 !== 'undefined') {
                        var history_idx = qdata['history'].length - 2;
                        if (result2[0].args.user == account) {
                            ntext = 'Someone requested arbitration to your question';
                        } else {
                            if ( (history_idx >= 0) && (qdata['history'][history_idx].args.user == account) ) {
                                ntext = 'Someone requested arbitration to the question you answered';
                                is_positive = false;
                            } else {
                                ntext = 'Someone requested arbitration to the question';
                            }
                        }
                        /*
                        if (typeof ntext !== 'undefined') {
                            ntext += ' - "' + question_json['title'] + '"';
                            insertNotificationItem(evt, notification_id, item, ntext, entry.blockNumber, entry.args.question_id, is_positive);
                        }
                        */
                    }
                });
            }
            break;

        case 'LogFinalize':
            //console.log('in LogFinalize', entry);
            var notification_id = web3.sha3('LogFinalize' + entry.args.question_id + entry.args.answer);
            var finalized_question = rc.LogNewQuestion({question_id: question_id}, {fromBlock: START_BLOCK, toBlock: 'latest'});
            var timestamp = null;
            // Fake timestamp for our fake finalize event
            if (entry.timestamp) {
                timestamp = entry.timestamp;
            }
            //console.log('getting question_id', question_id)
            finalized_question.get(function (error, result2) {
            //console.log('gotquestion_id', question_id)
                if (error === null && typeof result2 !== 'undefined') {
                    if (result2[0].args.user == account) {
                        ntext = 'Your question is finalized';
                    } else if (qdata['history'] && qdata['history'][qdata['history'].length - 2].args.user == account) {
                        ntext = 'The question you answered is finalized';
                    } else {
                        ntext = 'Some question was finalized';
                    }
                    if (typeof ntext !== 'undefined') {
                        ntext += ' - "' + question_json['title'] + '"';
                        insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true, timestamp);
                    }
                }
            });
    }

}

function insertQAItem(question_id, item_to_insert, question_section, block_number) {

    question_section.find('.your-qa__questions__item[data-question-id=' + question_id + ']').remove();

    var question_items = question_section.find('.your-qa__questions__item');
    var inserted = false;
    question_items.each( function(idx, item) {
        if ($(item).hasClass('template-item')) {
            return true;
        }
        if ($(item).attr('data-block-number') <= block_number) {
            $(item).before(item_to_insert);
            inserted = true;
            //console.log('inserted in loop');
            return false;
        } else {
            return true;
        }
    });
    if (!inserted) {
        question_section.append(item_to_insert);
    //console.log('inserted through fall through');
    }
    populateWithBlockTimeForBlockNumber(item_to_insert, block_number, renderTimeAgo);

}

function renderQAItemAnswer(question_id, answer_history, question_json, is_finalized) {
    var question_section = $('#your-question-answer-window').find('.your-qa__questions');
    var answer_section = $('#your-question-answer-window').find('.your-qa__answers');
    var sections = [question_section, answer_section];

    sections.forEach(function(section){
        var target = section.find('div[data-question-id='+question_id+']');
        if (answer_history.length > 0) {
            let user_answer;
            for (let i = answer_history.length - 1; i >= 0 ; i--) {
                if (answer_history[i].args.user == account) {
                    user_answer = answer_history[i].args.answer;
                    break;
                }
            }
            let latest_answer = answer_history[answer_history.length - 1].args.answer;
            target.find('.latest-answer-text').text(getAnswerString(question_json, latest_answer));
            if (typeof user_answer !== 'undefined') {
                target.find('.user-answer-text').text(getAnswerString(question_json, user_answer));
            } else {
                target.find('.your-qa__questions__item-body--user').css('display', 'none');
            }

            if (user_answer == latest_answer) {
                target.find('.different-latest-answer-container').hide();
            }

            target.find('.your-qa__questions__item-body--latest').css('display', 'block');
        } else {
            target.find('.your-qa__questions__item-body--latest').css('display', 'none');
            target.find('.your-qa__questions__item-body--user').css('display', 'none');
        }

        if (is_finalized) {
            target.find('.your-qa__questions__item-status').addClass('.your-qa__questions__item-status--resolved');
            target.find('.your-qa__questions__item-status').text('Resolved');
        } else {
            target.find('.your-qa__questions__item-status').text(answer_history.length + ' Answers');
        }
    });

}

function renderUserQandA(qdata, entry) {

    var question_id = qdata[Qi_question_id];
    var answer_history = qdata['history'];

    var question_json = qdata[Qi_question_json];

    var question_section;
    if (entry['event'] == 'LogNewQuestion') {
        question_section = $('#your-question-answer-window').find('.your-qa__questions .your-qa__questions-inner');
    } else if (entry['event'] == 'LogNewAnswer') {
        question_section = $('#your-question-answer-window').find('.your-qa__answers .your-qa__answers-inner');
    }
    if (question_section.find('.no-your-qa__questions__item').length > 0) {
        question_section.find('.no-your-qa__questions__item').remove();
    }

    var qitem = question_section.find('.your-qa__questions__item.template-item').clone();
    qitem.attr('data-question-id', question_id);
    qitem.find('.question-text').text(question_json['title']).expander();
    qitem.attr('data-block-number', entry.blockNumber);
    qitem.removeClass('template-item');
    insertQAItem(question_id, qitem, question_section, entry.blockNumber);

    var is_finalized = isFinalized(qdata);
    renderQAItemAnswer(question_id, answer_history, question_json, is_finalized);

    var updateBlockTimestamp = function (item, ts) {
        let date = new Date();
        date.setTime(ts * 1000);
        let date_str = monthList[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
            + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        item.find('.item-date').text(date_str);
    }
    populateWithBlockTimeForBlockNumber(qitem, entry.blockNumber, updateBlockTimestamp);
}

function getAnswerString(question_json, answer) {
    var label = '';
    switch (question_json['type']) {
        case 'uint':
            label = new BigNumber(answer).toString();
            break;
        case 'bool':
            if (new BigNumber(answer).toNumber() === 1) {
                label = 'Yes';
            } else if (new BigNumber(answer).toNumber() === 0) {
                label = 'No';
            }
            break;
        case 'single-select':
            if (typeof question_json['outcomes'] !== 'undefined' && question_json['outcomes'].length > 0) {
                var idx = new BigNumber(answer).toNumber();
                label = question_json['outcomes'][idx];
            }
            break;
        case 'multiple-select':
            if (typeof question_json['outcomes'] !== 'undefined' && question_json['outcomes'].length > 0) {
                var answer_bits = new BigNumber(answer).toString(2);
                var length = answer_bits.length;

                for (var i = question_json['outcomes'].length - 1; i >= 0; i--) {
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

// show final answer button
// TODO: Pass in the current data from calling question if we have it to avoid the unnecessary call
function updateQuestionState(question, question_window) {
    if (question[Qi_finalization_ts] > 2) {
        question_window.addClass('has-answer');
        if (isFinalized(question)) {
            timeago.cancel(question_window.find('.resolved-at-value.timeago'));
            question_window.find('.resolved-at-value').attr('datetime', convertTsToString(question[Qi_finalization_ts]));
            timeAgo.render(question_window.find('.resolved-at-value.timeago')); // TODO: Does this work if we haven't displayed the item yet?
        } else {
            timeago.cancel(question_window.find('.answer-deadline.timeago'));
            question_window.find('.answer-deadline').attr('datetime', convertTsToString(question[Qi_finalization_ts]));
            timeAgo.render(question_window.find('.answer-deadline.timeago')); // TODO: Does this work if we haven't displayed the item yet?
        }
    } else {
        question_window.removeClass('has-answer');
    }

    // The first item is the current answer
    if (question['history'].length > 1) {
        question_window.addClass('has-history');
    } else {
        question_window.removeClass('has-history');
    }

    if (isArbitrationPending(question)) {
        question_window.removeClass('question-state-open').addClass('question-state-pending-arbitration').removeClass('question-state-finalized');
    } else {
        if ( !isFinalized(question) ) {
            question_window.addClass('question-state-open').removeClass('question-state-pending-arbitration').removeClass('question-state-finalized');
        } else {
            question_window.removeClass('question-state-open').removeClass('question-state-pending-arbitration').addClass('question-state-finalized');
        }
    }

    return question_window;

/*
    var id = setInterval(function(){
        if (Date.now() - answer_created.toNumber() * 1000 > timeout.toNumber() * 1000) {
            $(section_name).find('.final-answer-button').css('display', 'block');
            clearInterval(id);
        }
    }, 15000);
    */
}

// TODO
// This is currently not called, as we just fetch everything back from logs
// Potentially resurrect it with a more efficient flow
// Also potentially do it before confirmation (See issue #44)
function pushWatchedAnswer(answer) {
    var question_id = answer.args.question_id;
    var already_exists = false;
    var length = question_detail_list[question_id]['history'].length;

    for (var i = 0; i < length; i++) {
        if (question_detail_list[question_id]['history'][i].args.answer == answer.args.answer) {
            already_exists = true;
            break;
        }
    }

    if (!already_exists) {
        question_detail_list[question_id]['history'].push(answer);
    }
}

$(document).on('click', '.answer-item', function(){
    //console.log('.answer-item clicked');
    if ($(this).find('.answer-data').hasClass('is-bounce')) {
        $(this).find('.answer-data').removeClass('is-bounce');
        $(this).find('.answer-data').css('display', 'none');
     } else {
        $(this).find('.answer-data').addClass('is-bounce');
        $(this).find('.answer-data').css('display', 'block');
     }
});

// post an answer
$(document).on('click', '.post-answer-button', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var parent_div = $(this).parents('div.rcbrowser--qa-detail');
    var question_id = parent_div.attr('data-question-id');
    var bond = web3.toWei(new BigNumber(parent_div.find('input[name="questionBond"]').val()), 'ether');

    var question, current_answer, new_answer;
    var question_json;
    var current_question;
    var is_err = false;

    var block_before_send = current_block_number;
    var question_json;

    var question = ensureQuestionDetailFetched(question_id, 1, 1, 1, -1)
    .then(function(current_question) {

        question_json = current_question[Qi_question_json];
        //console.log('got question_json', question_json);

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
        } else if (question_json['type'] == 'uint') {
            new_answer = new BigNumber(parent_div.find('[name="input-answer"]').val());
        } else if (question_json['type'] == 'int') {
            new_answer = new BigNumber(parent_div.find('[name="input-answer"]').val());
        } else {
            new_answer = parseInt(parent_div.find('[name="input-answer"]').val());
        }

        switch (question_json['type']) {
            case 'bool':
                if (isNaN(new_answer) || (new_answer !== 0 && new_answer !== 1)) {
                    parent_div.find('div.select-container.select-container--answer').addClass('is-error');
                    is_err = true;
                }
                break;
            case 'uint':
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

        var min_amount = current_question[Qi_bond] * 2;
        if (bond.lt(min_amount)) {
            parent_div.find('div.input-container.input-container--bond').addClass('is-error');
            parent_div.find('div.input-container.input-container--bond').find('.min-amount').text(web3.fromWei(min_amount, 'ether'));
            is_err = true;
        }

        if (is_err) throw('err on submitting answer');

        submitted_question_id_timestamp[question_id] = new Date().getTime();

        console.log('submitAnswer',question_id, formatForAnswer(new_answer, question_json['type']), current_question[Qi_bond], {from:account, value:bond});

        // Converting to BigNumber here - ideally we should probably doing this when we parse the form
        return rc.submitAnswer.sendTransaction(question_id, formatForAnswer(new_answer, question_json['type']), current_question[Qi_bond], {from:account, gas:200000, value:bond});
    }).then(function(txid){
        clearForm(parent_div, question_json);
        var fake_history = {
            'args': {
                'answer': formatForAnswer(new_answer, question_json['type']),
                'question_id': question_id,
                'history_hash': null, // TODO Do we need this?
                'user': account,
                'bond': bond,
                'ts': new BigNumber(parseInt(new Date().getTime()/1000)),
                'is_commitment': false
            },
            'event': 'LogNewAnswer',
            'blockNumber': block_before_send,
            'txid': txid
        };

        var question_data = filledQuestionDetail(question_id, 'answers_unconfirmed', block_before_send, fake_history);
        //console.log('after answer made question_data', question_data);

        ensureQuestionDetailFetched(question_id, 1, 1, block_before_send, block_before_send).then(function(question) {
            updateQuestionWindowIfOpen(question);
        });

    });
    /*
    .catch(function(e){
        console.log(e);
    });
    */
});

function clearForm(parent_div, question_json) {
    parent_div.find('div.input-container.input-container--answer').removeClass('is-error');
    parent_div.find('div.select-container.select-container--answer').removeClass('is-error');
    parent_div.find('div.input-container.input-container--bond').removeClass('is-error');
    parent_div.find('div.input-container.input-container--checkbox').removeClass('is-error');
    parent_div.find('.answer-payment-value').text('');
    parent_div.removeClass('has-someone-elses-answer').removeClass('has-your-answer');

    switch (question_json['type']) {
        case 'bool':
            parent_div.find('select[name="input-answer"]').prop('selectedIndex', 0);
            break;
        case 'uint':
            parent_div.find('input[name="input-answer"]').val('');
            break;
        case 'int':
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
}


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

$(document).on('click', '.notifications-item', function(e){
    if ( $(e.target).hasClass('more-link') || $(e.target).hasClass('less-link') ) {
        return true;
    }
    //console.log('notifications-item clicked');
    e.preventDefault();
    e.stopPropagation();
    openQuestionWindow($(this).attr('data-question-id'));
});

$(document).on('click', '.rcbrowser-submit.rcbrowser-submit--add-reward', function(e){
    e.preventDefault();
    e.stopPropagation();

    var rcqa = $(this).closest('.rcbrowser--qa-detail');
    var question_id = rcqa.attr('data-question-id');
    var reward = $(this).parent('div').prev('div.input-container').find('input[name="question-reward"]').val();
    reward = web3.toWei(new BigNumber(reward), 'ether');

    if (isNaN(reward) || reward <= 0) {
        $(this).parent('div').prev('div.input-container').addClass('is-error');
    } else {
        rc.fundAnswerBounty(question_id, {from: account, value: reward})
        .then(function (result) {
            //console.log('fund bounty', result);
            var container = rcqa.find('.add-reward-container');
            //console.log('removing open', container.length, container);
            container.removeClass('is-open');
            container.removeClass('is-bounce');
            container.css('display', 'none');
        });
    }
});

/*-------------------------------------------------------------------------------------*/
// arbitration
$(document).on('click', '.arbitration-button', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var question_id = $(this).closest('div.rcbrowser.rcbrowser--qa-detail').attr('data-question-id');
    var question_detail = question_detail_list[question_id];
    if (!question_detail) {
        console.log('Error, question detail not found');
        return false;
    }

    var arbitration_fee;
    //if (!question_detail[Qi_is_arbitration_due]) {}
    var arbitrator;
    Arbitrator.at(question_detail[Qi_arbitrator]).then(function(arb) {
        arbitrator = arb;
        return arb.getFee.call(question_id);
    }).then(function(fee) {
        arbitration_fee = fee;
        //console.log('got fee', arbitration_fee.toString());
        arbitrator.requestArbitration(rc.address, question_id, {from:account, value: fee})
        .then(function(result){
            console.log('arbitration is requested.', result);
        });
    });
});

/*-------------------------------------------------------------------------------------*/
// show/delete error messages

function show_bond_payments(ctrl) {
    var frm = ctrl.closest('div.rcbrowser--qa-detail')
    var question_id = frm.attr('data-question-id'); 
    //console.log('got question_id', question_id);
    ensureQuestionDetailFetched(question_id).then(function(question) {
        var question_json = question[Qi_question_json];
        var existing_answers = answersByMaxBond(question['history']);
        var payable = 0;
        var new_answer;
        if (question_json['type'] == 'multiple-select') {
            var checkbox = frm.find('[name="input-answer"]');
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
        } else if (question_json['type'] == 'uint') {
            new_answer = new BigNumber(frm.find('[name="input-answer"]').val());
        } else {
            new_answer = parseInt(frm.find('[name="input-answer"]').val());
        }
        new_answer = formatForAnswer(new_answer, question_json['type'])
        //console.log('new_answer', new_answer);

        //console.log('existing_answers', existing_answers);
        if (existing_answers[new_answer]) {
            payable = existing_answers[new_answer].args.bond;
            if (existing_answers[new_answer].args.user == account) {
                frm.addClass('has-your-answer').removeClass('has-someone-elses-answer');
                frm.find('.answer-credit-info .answer-payment-value').text( web3.fromWei(payable, 'ether'))
            } else {
                frm.addClass('has-someone-elses-answer').removeClass('has-your-answer');
                frm.find('.answer-debit-info .answer-payment-value').text( web3.fromWei(payable, 'ether'))
            }
            frm.attr('data-answer-payment-value', payable.toString());
        } else {
            frm.removeClass('has-your-answer').removeClass('has-someone-elses-answer');
            frm.find('.answer-payment-value').text('');
            frm.attr('data-answer-payment-value', '');
        }
    });
}

$('.rcbrowser-textarea').on('keyup', function(e){
    if ($(this).val() !== '') {
        $(this).closest('div').removeClass('is-error');
    }
});
$(document).on('keyup', '.rcbrowser-input.rcbrowser-input--number', function(e){
    let value = new BigNumber(web3.toWei($(this).val()));
    //console.log($(this));
    if (value === '') {
        $(this).parent().parent().addClass('is-error');
    } else if (!$(this).hasClass('rcbrowser-input--number--answer') && (value <= 0)){
        $(this).parent().parent().addClass('is-error');
    } else if($(this).hasClass('rcbrowser-input--number--bond')) {
        let question_id = $(this).closest('.rcbrowser.rcbrowser--qa-detail').attr('data-question-id');
        let current_idx = question_detail_list[question_id]['history'].length - 1;
        let current_bond = 0;
        if (current_idx >= 0) {
            current_bond = question_detail_list[question_id]['history'][current_idx].args.bond;
        }
        if (value.lt(current_bond.times(2))) {
            $(this).parent().parent().addClass('is-error');
        } else {
            $(this).parent().parent().removeClass('is-error');
        }
        show_bond_payments($(this));
    } else {
        $(this).parent().parent().removeClass('is-error');
    }
});
$(document).on('change', '#post-question-window .question-type,.step-delay,.arbitrator', function (e) {
    if ($(this).prop('selectedIndex') != 0) {
        $(this).parent().removeClass('is-error');
    }
});
$(document).on('change', 'select[name="input-answer"]', function (e) {
    if ($(this).prop('selectedIndex') != 0) {
        $(this).parent().removeClass('is-error');
        show_bond_payments($(this));
    }
});
$(document).on('change', 'input[name="input-answer"]:checkbox', function(){
    var parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
    var container = parent_div.find('div.input-container.input-container--checkbox');
    var checked = container.find('input[name="input-answer"]:checked');
    if (checked.length > 0) {
        container.removeClass('is-error');
    }
    show_bond_payments($(this), checked);
});

// For now we force a reload
// Probably better to handle the section arrays per category and display without moving
$('#filter-list a').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var cat = $(this).attr('data-category');
    if (cat == 'all') {
        window.location.hash = '';
        //window.location.href = location.protocol+'//'+location.host+location.pathname; 
    } else {
        //window.location.href = location.protocol+'//'+location.host+location.pathname + '#!/category/' + cat;
        window.location.hash = '#!/category/' + cat;
    }
    location.reload();
});


// This should be called with a question array containing, at a minimum, up-to-date versions of the changed_field and Qi_finalization_ts.
// A full repopulate will work, but so will an array with these fields overwritten from a log event.
function updateRankingSections(question, changed_field, changed_val) {
//console.log('in updateRankingSections', question, changed_field, changed_val);
    // latest only change on new question
    // resolved changes on finalization, this happens either with a timer or with arbitration. Also removes items from other section.
    // closing soon changes when we add an answer
    // high reward changes if we add reward. TODO: Should maybe include bond value, in which case it would also change on new answer

    var question_id = question[Qi_question_id];
    //console.log('updateRankingSections', question_id, changed_field, changed_val);
    if (changed_field == Qi_finalization_ts) {
        if (isFinalized(question)) {
            //console.log('isFinalized');
            var sections = ['questions-latest', 'questions-closing-soon', 'questions-high-reward'];
            for (var i =0; i < sections.length; i++) {
                var s = sections[i];
                //console.log('doing section', s);
                var existing_idx = display_entries[s].ids.indexOf(question_id);
                if (existing_idx !== -1) {
                    display_entries[s].ids.splice(existing_idx, 1);
                    display_entries[s].vals.splice(existing_idx, 1);
                    //console.log('depopulating', s, question_id);
                    depopulateSection(s, question_id);
                }
            }
            var insert_before = update_ranking_data('questions-resolved', question_id, question[Qi_finalization_ts], 'desc');
            //console.log('insert_before iss ', insert_before);
            if (insert_before !== -1) {
                //console.log('poulating', question);
                // TODO: If question may not be populated, maybe we should refetch here first
                populateSection('questions-resolved', question, insert_before);
            }
        } else {
            //console.log('updating closing soon with timestamp', question_id, question[Qi_finalization_ts].toString());
            var insert_before = update_ranking_data('questions-closing-soon', question_id, question[Qi_finalization_ts], 'asc');
            //console.log('insert_before was', insert_before);
            if (insert_before !== -1) {
                populateSection('questions-closing-soon', question, insert_before);
            }

        }

    } else if (changed_field == Qi_bounty) {
        var insert_before = update_ranking_data('questions-high-reward', question_id, question[Qi_bounty], 'desc');
        //console.log('update for new bounty', question[Qi_bounty], 'insert_before is', insert_before);
        if (insert_before !== -1) {
            populateSection('questions-high-reward', question, insert_before);
        }
    }

    // Things that don't need adding or removing, but may still need the content updating
    updateSectionEntryDisplay(question);
    // TODO: Need to update sections that haven't changed position, but changed data

}



/*-------------------------------------------------------------------------------------*/
// initial process

function pageInit(account) {

    //console.log('in pageInit for account', account);

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

    var evts = rc.allEvents({}, {fromBlock:'latest', toBlock:'latest'})

    evts.watch(function (error, result) {
        if (!error && result) {
            //console.log('got watch event', error, result);

            // Check the action to see if it is interesting, if it is then populate notifications etc
            handlePotentialUserAction(result, true);

            // Handles front page event changes.
            // NB We need to reflect other changes too...
            var evt = result['event'];
            if (evt == 'LogNewQuestion') {
                handleQuestionLog(result);
            } else {
                var question_id = result.args.question_id;

                switch (evt) {

                    case ('LogNewAnswer'):
                        //console.log('got LogNewAnswer, block ', result.blockNumber);
                        ensureQuestionDetailFetched(question_id, 1, 1, result.blockNumber, result.blockNumber).then(function(question) {
                            updateQuestionWindowIfOpen(question);
                            //console.log('should be getting latest', question, result.blockNumber);
                            //question = filledQuestionDetail(question_id, 'answer_logs', result.blockNumber, result);
                            //question[Qi_finalization_ts] = result.args.ts.plus(question[Qi_timeout]); // TODO: find a cleaner way to handle this
                            scheduleFinalizationDisplayUpdate(question);
                            updateRankingSections(question, Qi_finalization_ts, question[Qi_finalization_ts])
                        });
                        break;

                    case ('LogFundAnswerBounty'): 
                        ensureQuestionDetailFetched(question_id, 1, 1, result.blockNumber, -1).then(function(question) {
                            //console.log('updating with question', question);
                            updateQuestionWindowIfOpen(question);
                            updateRankingSections(question, Qi_bounty, question[Qi_bounty])
                        });
                        break;

                    default:
                        ensureQuestionDetailFetched(question_id, 1, 1, result.blockNumber, -1).then(function(question) {
                            updateQuestionWindowIfOpen(question);
                            updateRankingSections(question, Qi_finalization_ts, question[Qi_finalization_ts])
                        });

                }

            }
        }
    });

    fetchUserEventsAndHandle({user: account}, START_BLOCK, 'latest');

    // Now the rest of the questions
    fetchAndDisplayQuestions(current_block_number, 0);


};

function fetchAndDisplayQuestions(end_block, fetch_i) {

    // get how many to fetch off fetch_numbers, until we run off the end then use the last num
    var fetch_num;
    if (fetch_i < FETCH_NUMBERS.length) {
        fetch_num = FETCH_NUMBERS[fetch_i];
    } else {
        fetch_num = FETCH_NUMBERS[FETCH_NUMBERS.length - 1];
    }

    var start_block = end_block - fetch_num;
    if (start_block < START_BLOCK) {
        start_block = START_BLOCK;
    }
    if (end_block <= START_BLOCK) {
        console.log('History read complete back to block', START_BLOCK);
        setTimeout(bounceEffect, 500);
        return;
    }

    //console.log('fetchAndDisplayQuestions', start_block, end_block, fetch_i);

    var question_posted = rc.LogNewQuestion({}, {fromBlock: start_block, toBlock: end_block});
    question_posted.get(function (error, result) {
        if (error === null && typeof result !== 'undefined') {
            for(var i=0; i<result.length; i++) {
                handlePotentialUserAction(result[i]);
                handleQuestionLog(result[i]);
            }
        } else {
            console.log(error);
        }

        //console.log('fetch start end ', start_block, end_block, fetch_i);
        fetchAndDisplayQuestions(start_block - 1, fetch_i + 1);
    });
}

function fetchUserEventsAndHandle(filter, start_block, end_block) {
    //console.log('fetching for filter', filter);

    var answer_posted = rc.LogNewAnswer(filter, {fromBlock: start_block, toBlock: end_block})
    answer_posted.get(function (error, result) {
        var answers = result;
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < answers.length; i++) {
                //console.log('handlePotentialUserAction', i, answers[i]);
                handlePotentialUserAction(answers[i]);
            }
        } else {
            console.log(error);
        }
    });

    var bounty_funded = rc.LogFundAnswerBounty(filter, {fromBlock: start_block, toBlock: end_block});
    bounty_funded.get(function (error, result) {
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < result.length; i++) {
                handlePotentialUserAction(result[i]);
            }
        } else {
            console.log(error);
        }
    });

    var arbitration_requested = rc.LogNotifyOfArbitrationRequest(filter, {fromBlock: start_block, toBlock: end_block});
    arbitration_requested.get(function (error, result) {
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < result.length; i++) {
                handlePotentialUserAction(result[i]);
            }
        } else {
            console.log(error);
        }
    });

    var finalized = rc.LogFinalize(filter, {fromBlock: start_block, toBlock: end_block});
    finalized.get(function (error, result) {
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < result.length; i++) {
                handlePotentialUserAction(result[i]);
            }
        } else {
            console.log(error);
        }
    });

    // Now the rest of the questions
    var question_posted = rc.LogNewQuestion(filter, {fromBlock: START_BLOCK, toBlock:'latest'});
    question_posted.get(function (error, result) {
        if (error === null && typeof result !== 'undefined') {
            for(var i=0; i<result.length; i++) {
                handlePotentialUserAction(result[i]);
            }
        } else {
            console.log(error);
        }

    });

}

function isForCurrentUser(entry) {
    var actor_arg = EVENT_ACTOR_ARGS[entry['event']];
    if (actor_arg) {
        return (entry.args[actor_arg] == account);
    } else {
        return false;
    }
}

function parseHash() {
    // Alternate args should be names and values
    if (location.hash.substring(0, 3) != '#!/') {
        return {};
    }
    var arg_arr = location.hash.substring(3).split('/');
    var args = {};
    for (var i=0; i<arg_arr.length+1; i = i+2) {
        var n = arg_arr[i];
        var v = arg_arr[i+1];
        if (n && v) {
            args[n] = v;
        }
    }
    return args;
}

window.onload = function() {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        console.log('got web3, go ahead');
        window.web3 = new Web3(web3.currentProvider);

        // Set up a filter so we always know the latest block number.
        // This helps us keep track of how fresh our question data etc is.
        web3.eth.filter('latest').watch( function(err, res) {
            web3.eth.getBlock('latest', function(err, result) {
                if (result.number > current_block_number) {
                    current_block_number = result.number;
                }
                // Should we do this?
                // Potentially calls later but grows indefinitely...
                // block_timestamp_cache[result.number] = result.timestamp;
            })
        });

        web3.eth.getAccounts((err, acc) => {
            web3.eth.getBlock('latest', function(err, result) {
                if (result.number > current_block_number) {
                    current_block_number = result.number;
                }

                if (acc && acc.length > 0) {


                    //console.log('accounts', acc);
                    account = acc[0];
                    
                } else {
                    console.log('no accounts');
                    $('body').addClass('error-no-metamask-accounts').addClass('error');
                }

                var args = parseHash();
                if (args['category']) {
                    category = args['category'];
                    $('body').addClass('category-' + category);
                    var cat_txt = $("#filter-list").find("[data-category='" + category+ "']").text();
                    $('#filterby').text(cat_txt);
                }
                //console.log('args:', args);


                RealityCheck = contract(rc_json);
                RealityCheck.setProvider(web3.currentProvider);
                RealityCheck.deployed().then(function(instance) {
                    rc = instance;
                    updateUserBalanceDisplay();
                    pageInit(account);
                    if (args['question']) {
                        //console.log('fetching question');
                        ensureQuestionDetailFetched(args['question']).then(function(question){
                            openQuestionWindow(question[Qi_question_id]);
                        })
                    }
                });
            })
        });


    } else {
// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/tSrhlXUe1sNEO5ZWhpUK"));
        console.log('no web3, using infura');
        $('body').addClass('error-no-metamask-plugin').addClass('error');
    }

    // Notification bar(footer)
    if (window.localStorage.getItem('got-it') == null) {
        $('#footer-notification-bar').css('display', 'block');
    }
    $('#got-it-button').on('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        window.localStorage.setItem('got-it', true);
        $('#footer-notification-bar').css('display', 'none');
    });

    setTimeout(bounceEffect, 8000);

    web3.version.getNetwork((err, net_id) => {
        let valid_ids = $('div.error-bar').find('span[data-network-id]').attr('data-network-id').split(',');

        if (err === null) {
            if (valid_ids.indexOf(net_id) === -1) {
                $('body').addClass('invalid-network').addClass('error');
                console.log('net id was', net_id);
            } else {
                network_id = net_id;
            }
        }
    });
}
