// TODO: Check if there was a reason to do this instead of import
//require('../../../node_modules/gsap/src/uncompressed/plugins/ScrollToPlugin.js');

'use strict';

var rc_json = require('../../../truffle/build/contracts/RealityCheck.json');
var arb_json = require('../../../truffle/build/contracts/Arbitrator.json');

var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'})

var multihash = require('multihashes');
var bs58 = require('bs58');

var contract = require("truffle-contract");
var BigNumber = require('bignumber.js');
var timeago = require('timeago.js');
var timeAgo = new timeago();

var submitted_question_id_timestamp = {};

const EVENT_ACTOR_ARGS = {
    'LogNewQuestion': 'questioner',
    'LogNewAnswer': 'answerer',
    'LogFundAnswerBounty': 'funder',
    'LogRequestArbitration': 'requester',
    'LogClaimBounty': 'receiver',
    'LogClaimBond': 'receiver',
    'LogFundCallbackRequest': 'caller',
    'LogSendCallback': 'caller',
};

// Assume we get logs from the server from earlier than this
const START_BLOCK = 0;

// Struct array offsets
// Assumes we unshift the ID onto the start

// Question, as returned by questions()
const Qi_question_id = 0;

// NB This has magic values - 0 for no answer, 1 for pending arbitration, 2 for pending arbitration with answer, otherwise timestamp
const Qi_finalization_ts = 1; 
const Qi_arbitrator = 2;
const Qi_step_delay = 3;
const Qi_question_ipfs = 4;
const Qi_bounty = 5;
const Qi_best_answer = 6;
const Qi_question_json = 7; // We add this manually after we load the ipfs data
const Qi_creation_ts = 8; // We add this manually from the event log

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
var account_balance;
var arbitration_fee;

var display_entries = {
    'questions-latest': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3},
    'questions-resolved': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3},
    'questions-closing-soon': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3},
    'questions-high-reward': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3}
}

// data for question detail window
var question_detail_list = [];
var question_event_times = {}; // Hold timer IDs for things we display that need to be moved when finalized

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

function ipfsHashToBytes32(ipfs_hash) {
    var h = multihash.decode(bs58.decode(ipfs_hash));
    //console.log(h);
    if (h.name != 'sha2-256') {
        //console.log('unexpected name', h.name);
        return null;
    }
    return '0x' + h.digest.toString('hex');
}

function bytes32ToIPFSHash(hash_hex) {
    //console.log('bytes32ToIPFSHash starts with hash_buffer', hash_hex.replace(/^0x/, ''));
    var buf = new Buffer(hash_hex.replace(/^0x/, ''), 'hex')
    return bs58.encode(multihash.encode(buf, 'sha2-256'))
}

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

/*
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
*/

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

/*-------------------------------------------------------------------------------------*/
// window for posting a question

$('#your-qa-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#your-question-answer-window').css('z-index', ++zindex);
    $('#your-question-answer-window').addClass('is-open');
    $('#your-question-answer-window').css('height', $('#your-question-answer-window').height()+'px');
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
        question_window.css('height', question_window.height()+'px');
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
    var step_delay_val = step_delay.val();
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
        ipfs.add(new Buffer(question_json), function(err, res) {
            if (err) {
                alert('ipfs save failed');
                //console.log('ipfs result', err, res)
                return;
            }
            RealityCheck.deployed().then(function (rc) {
                account = web3.eth.accounts[0];
                return rc.askQuestion(ipfsHashToBytes32(res[0].hash), arbitrator.val(), step_delay_val, {from: account, value: web3.toWei(new BigNumber(reward.val()), 'ether')});
            }).then(function (result) {

                let section_name = 'div#question-' + result.logs[0].args.question_id + ' .questions__item__title';
                let id = setInterval(function(){
                    let question_link = $('div#questions-latest').find(section_name);
                    if ('generated', question_link.length > 0) {
                        $('#close-question-window').trigger('click');
                        question_link.trigger('click');
                        clearInterval(id);
                    }
                }, 3000)
            }).catch(function (e) {
                console.log(e);
            });

        });
    }

});

function isArbitrationPending(question) {
    // finalization_ts has a magical timestamp of 1 meaning pending arbitration
    return (question[Qi_finalization_ts].toNumber() == 1);
}

function isAnswered(question) {
    // TODO: Change contract to be able to differentiate when in pending-arbitration state
    return (question[Qi_finalization_ts].toNumber() > 1);
}


function isFinalized(question) {
    var fin = question[Qi_finalization_ts].toNumber() 
    // 0: Unanswered
    // 1: Pending arbitration (unanswered)
    // 2: Pending arbitration (answered)
    // Below current date: Finalized
    // Above current date: Open for new answers or arbitration requests
    return ( (fin > 2) && (fin * 1000 < new Date().getTime()) );  
}

$(document).on('click', '.answer-claim-button', function(){
    var question_id = $(this).closest('.rcbrowser--qa-detail').attr('data-question-id');

    var rc;
    //console.log(claimableItems(question_detail));


    console.log('answer-claim-button clicked for question');
    RealityCheck.deployed().then(function (instance) {
        rc = instance;
        return populateQuestionDetail(question_id, rc) 
    }).then(function(question_detail){
        var claimable = possibleClaimableItems(question_detail);
        console.log('try9ing to claim ', claimable['total'].toString());
        if (claimable['total'].isZero()) {
            console.log('nothing to claim');
            // Nothing there, so force a refresh
            openQuestionWindow(question_id);
        }
        console.log('claimMultipleAndWithdrawBalance', claimable['bounty_question_ids'], claimable['bond_question_ids'], claimable['bond_answers']);
        rc.claimMultipleAndWithdrawBalance(claimable['bounty_question_ids'], claimable['bond_question_ids'], claimable['bond_answers'], {from: account}).then(function(claim_result){
            console.log('claim result', claim_result);
        });
    });
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

// This gets called when we discover an event related to the user.
// We may or may not have already seen this event.
// We may or may not have known that the event was related to the user already.
// We may or may not have fetched information about the question.
function handleUserAction(entry, rc) {

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
            //console.log('entry', entry.args['question_id'], 'not interesting to account', entry, account);
            return;
        } 

        q_min_activity_blocks[question_id] = entry.blockNumber;
        var all_evts = rc.allEvents({question_id: question_id});
        all_evts.get(function(error, evts) {
            if (error === null && typeof evts !== 'undefined') {
                for(var i=0; i<evts.length; i++) {
                    handleUserAction(evts[i], rc);
                }
            } else {
                console.log('error getting all_evts', error);
            }
        });
    }

    //console.log('handling', entry.args['question_id'], 'entry', entry, account);

    if (window.localStorage) {
        var lastViewedBlockNumber = 0;
        if (window.localStorage.getItem('viewedBlockNumber')) {
            lastViewedBlockNumber = parseInt(window.localStorage.getItem('viewedBlockNumber'));
        }
        //console.log(lastViewedBlockNumber);
        if (entry.blockNumber > lastViewedBlockNumber) {
            //$('body').attr('last-update-block-number', entry.blockNumber);
            $('body').addClass('pushing');
        }
    }

    var is_population_done = false;

    // User action
    if (entry['event'] == 'LogNewAnswer') {
        // force refresh
        delete question_detail_list[question_id];
        if ( submitted_question_id_timestamp[question_id] > 0) {
            delete submitted_question_id_timestamp[question_id]; // Delete to force a new fetch
            populateQuestionDetail(question_id, rc).then(function(question) {
                displayQuestionDetail(question);
            });
        }
    } 
 
    // If we have already viewed the question, it should be loaded in the question_detail_list array
    // If not, we will need to load it and put it there
    // This is duplicated when you click on a question to view it

    populateQuestionDetail(question_id, rc).then(function(question) {
        renderUserAction(question, entry, rc);
    });

}

function scheduleFinalizationDisplayUpdate(question) {

console.log('in scheduleFinalizationDisplayUpdate', question);
    // TODO: The layering of this is a bit weird, maybe it should be somewhere else?
    if (!isFinalized(question) && isAnswered(question)) {
        console.log('going ahead with scheduling');
        var question_id = question[Qi_question_id];
        var is_done = false;
        if (question_event_times[question_id]) {
            if (question_event_times[question_id].finalization_ts == question[Qi_finalization_ts]) {
                console.log('leaving existing timeout for question', question_id)
                is_done = true;
            } else {
                clearTimeout(question_event_times[question_id].timeout_id);
                console.log('clearing timeout for question', question_id)
            }
        }
        if (!is_done) {
            console.log('scheduling');
            // Run 1 second after the finalization timestamp
            var update_time = (1000 + (question[Qi_finalization_ts].toNumber() * 1000) - new Date().getTime() );
            console.log('update_time is ', update_time);
            var timeout_id = setTimeout( function() {
                // TODO: Call again here in case it changed and we missed it
                clearTimeout(question_event_times[question_id].timeout_id);
                delete question_event_times[question_id];
                updateQuestionWindowIfOpen(question);
                updateRankingSections(question, Qi_finalization_ts, question[Qi_finalization_ts]); 
            }, update_time );
            question_event_times[question_id] = {'finalization_ts': question[Qi_finalization_ts], 'timeout_id': timeout_id };
            console.log(question_event_times);
        }
    } else {
        console.log('scheduling not doing: ', isFinalized(question), isAnswered(question));
    }

}


// question_log is optional, pass it in when we already have it
function populateQuestionDetail(question_id, rc, question_log) {

    return new Promise((resolve, reject)=>{
        if (question_detail_list[question_id]) {
            resolve(question_detail_list[question_id]);
        } else {
            var current_question;
            rc.questions.call(question_id).then(function(result){
                current_question = result;
                current_question.unshift(question_id);

                var question_json_ipfs = current_question[Qi_question_ipfs];
                return ipfs.cat(bytes32ToIPFSHash(question_json_ipfs), {buffer: true})
            }).then(function (res) {
                current_question[Qi_question_json] = parseQuestionJSON(res.toString());
                return rc.LogNewAnswer({question_id:question_id}, {fromBlock: START_BLOCK, toBlock:'latest'})
            // TODO: Update this in real time as the answers come in
            }).then(function(answer_logs) {
                answer_logs.get(function(error, answers) {
                    if (error === null && typeof answers !== 'undefined') {
                        // We need the question log for the creation datetime
                        // Often we are populating in response to a question log event, so we had it passed in
                        // If we didn't, grab it before we return
                        if (question_log) {
                            current_question[Qi_creation_ts] = question_log.args['created'];
                            question_detail_list[question_id] = current_question;
                            question_detail_list[question_id]['history'] = answers;
                            resolve(question_detail_list[question_id]);
                        } else {
                            var question_logs = rc.LogNewQuestion({question_id:question_id}, {fromBlock: START_BLOCK, toBlock:'latest'});
                            question_logs.get(function(error, question_arr) {
                                if (error || question_arr.length != 1) {
                                    reject(error);
                                } else {
                                    current_question[Qi_creation_ts] = question_arr[0].args['created'];
                                    question_detail_list[question_id] = current_question;
                                    question_detail_list[question_id]['history'] = answers;
                                    resolve(question_detail_list[question_id]);
                                }
                            });
                        }
                    } else {
                        reject(error);
                    }
                });
            });
        }
    });

}

// TODO: Fire this on a timer, and also on the withdrawal event
function updateUserBalanceDisplay() {

    web3.eth.getBalance(account, function(error, result){
        if (error === null) {
            account_balance = web3.fromWei(result.toNumber(), 'ether');
            $('.account-balance').text(web3.fromWei(result.toNumber(), 'ether'));
        }
    });

}

function populateSection(section_name, question_data, before_item) {

    var question_id = question_data[Qi_question_id];

    var idx = display_entries[section_name].ids.indexOf(question_id);
//console.log('idx is ',idx);
    if (idx > display_entries[section_name].max_show) {
//console.log('over max show, skip');
        return;
    }

    var question_item_id = 'question-' + question_id;
    var target_question_id = 'qadetail-' + question_id;
    var section = $('#'+section_name);

    var question_json = question_data[Qi_question_json];

    var options = '';
    if (typeof question_json['outcomes'] !== 'undefined') {
        for (var i = 0; i < question_json['outcomes'].length; i++) {
            options = options + i + ':' + question_json['outcomes'][i] + ', ';
        }
    }

    var posted_ts = question_data[Qi_creation_ts];
    var arbitrator = question_data[Qi_arbitrator];
    var step_delay = question_data[Qi_step_delay];
    var bounty = web3.fromWei(question_data[Qi_bounty], 'ether');
    var is_arbitration_pending = isArbitrationPending(question_data);
    var is_finalized = isFinalized(question_data);
    var best_answer = question_data[Qi_best_answer];

    var entry = $('.questions__item.template-item').clone();
    entry.attr('data-question-id', question_id);
    entry.attr('id', question_item_id).removeClass('template-item');
    entry.find('.questions__item__title').attr('data-target-id', target_question_id);
    if (isAnswered(question_data)) {
        entry.find('.questions__item__answer').text(getAnswerString(question_json, best_answer));
        entry.addClass('has-answer');
    } else {
        entry.find('.questions__item__answer').text('');
        entry.removeClass('has-answer');
    }

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

    while (section.children('.questions-list').find('.questions__item').length > display_entries[section_name].max_show) {
        //console.log('too long, removing');
        section.children('.questions-list').find('.questions__item:last-child').remove()
    }

}

function depopulateSection(section_name, question_id) {
    console.log('depopulating', section_name, question_id);

    var question_item_id = 'question-' + question_id;
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
            populateSection(sec, qdata, previd);
        }
    }

}



function handleQuestionLog(item, rc) {
    var question_id = item.args.question_id;
    var created = item.args.created
    var question_data;

    rc.questions.call(question_id).then( function(qdata) {
        //console.log('here is result', question_data, question_id)
        question_data = qdata;
        question_data.unshift(question_id);
        question_data[Qi_creation_ts] = created;
        var question_json_ipfs = question_data[Qi_question_ipfs];
        return ipfs.cat(bytes32ToIPFSHash(question_json_ipfs), {buffer: true})
    }).then(function (res) {
        if (!res) {
            //console.log('ipfs cat error', err, res)
            return;
        }
        question_data[Qi_question_json] = parseQuestionJSON(res.toString());
        var is_finalized = isFinalized(question_data);
        var bounty = question_data[Qi_bounty];

        if (is_finalized) {
            var insert_before = update_ranking_data('questions-resolved', question_id, question_data[Qi_finalization_ts], 'desc');
            if (insert_before !== -1) {
                // TODO: If we include this we have to handle the history too
                // question_detail_list[question_id] = question_data;
                populateSection('questions-resolved', question_data, insert_before);
            }

        } else {
            var insert_before = update_ranking_data('questions-latest', question_id, created, 'desc');
            if (insert_before !== -1) {
                // question_detail_list[question_id] = question_data;
                populateSection('questions-latest', question_data, insert_before);
            }

            var insert_before = update_ranking_data('questions-high-reward', question_id, bounty, 'desc');
            if (insert_before !== -1) {
                // question_detail_list[question_id] = question_data;
                populateSection('questions-high-reward', question_data, insert_before);
            }
            
            if (isAnswered(question_data)) {
                var insert_before = update_ranking_data('questions-closing-soon', question_id, question_data[Qi_finalization_ts], 'asc');
                if (insert_before !== -1) {
                    populateSection('questions-closing-soon', question_data, insert_before);
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

    // Should repopulate and bring to the front if already open
    openQuestionWindow(question_id);

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

    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return populateQuestionDetail(question_id, rc);
    }).then(function(question) {
        displayQuestionDetail(question);
    });
    /*
    .catch(function(e){
        console.log(e);
    });
    */
}

$('#post-a-question-window .rcbrowser__close-button').on('click', function(){
    let window = $('#post-a-question-window');
    window.css('z-index', 0);
    window.removeClass('is-open');
});

function parseQuestionJSON(data) {

    var question_json;
    try {
        question_json = JSON.parse(data);
    } catch(e) {
        question_json = {
            'title': data,
            'type': 'binary'
        };
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
            window_position[question_id]['x'] = left;
            window_position[question_id]['y'] = top;
            rcqa.remove();
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

    var question_id = question_detail[Qi_question_id];
    var question_json = question_detail[Qi_question_json];
    var question_type = question_json['type'];

console.log('current list last item in history, which is ', question_detail['history'])
    var idx = question_detail['history'].length - 1;

    let date = new Date();
    date.setTime(question_detail[Qi_creation_ts] * 1000);
    let date_str = monthList[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    rcqa.find('.rcbrowser-main-header-date').text(date_str);
    rcqa.find('.question-title').text(question_json['title']);
    rcqa.find('.reward-value').text(web3.fromWei(question_detail[Qi_bounty], 'ether'));

console.log('question_detail is', question_detail);

    // Default to something non-zero but very low
    var bond = new BigNumber(web3.toWei(0.0001, 'ether'));
    if (question_detail['history'].length) {
console.log('updateing aunswer');
        var latest_answer = question_detail['history'][idx].args;
        bond = latest_answer.bond;

        var current_container = rcqa.find('.current-answer-container');
        current_container.attr('id', 'answer-' + latest_answer.answer);

        timeago.cancel(current_container.find('.current-answer-item').find('.timeago')); // cancel the old timeago timer if there is one
        current_container.find('.current-answer-item').find('.timeago').attr('datetime', convertTsToString(latest_answer.ts));
        timeAgo.render(current_container.find('.current-answer-item').find('.timeago'));

        // answerer data
        var ans_data = rcqa.find('.current-answer-container').find('.answer-data');
        ans_data.find('.answerer').text(latest_answer.answerer);
        if (latest_answer.answerer == account) {
            ans_data.addClass('current-account');
        } else {
            ans_data.removeClass('current-account');
        }
        ans_data.find('.answer-bond-value').text(web3.fromWei(latest_answer.bond.toNumber(), 'ether'));

        // label for show the current answer.
        var label = getAnswerString(question_json, latest_answer.answer);
        current_container.find('.current-answer-body').find('.current-answer').text(label);

        // TODO: Do duplicate checks and ensure order in case stuff comes in weird
        for (var i = 0; i < idx; i++) {
            var ans = question_detail['history'][i].args;
            var hist_id = 'question-window-history-item-' + web3.sha3(question_id + ans.answer + ans.bond.toString());
            if (rcqa.find('#'+hist_id).length) {
                console.log('already in list, skipping', hist_id, ans);
                continue;
            }
            console.log('not already in list, adding', hist_id, ans);
            var hist_tmpl = rcqa.find('.answer-item.answered-history-item.template-item');
            var hist_item = hist_tmpl.clone();
            hist_item.attr('id', hist_id);
            hist_item.find('.answerer').text(ans['answerer']);
            hist_item.find('.current-answer').text(getAnswerString(question_json, ans.answer));
            hist_item.find('.answer-bond-value').text(web3.fromWei(ans.bond.toNumber(), 'ether'));
            hist_item.find('.answer-time.timeago').attr('datetime', convertTsToString(ans['ts']));
            timeAgo.render(hist_item.find('.answer-time.timeago'));
            hist_item.removeClass('template-item');
            hist_tmpl.before(hist_item); 
        }

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

    rcqa = updateQuestionState(question_detail, rcqa);

    if (isFinalized(question_detail)) {    
        totalClaimable(question_detail).then(function(tot) {
            console.log('tot is ', tot.toNumber());
            if (tot.toNumber() == 0) {
                rcqa.removeClass('is-claimable');
            } else {
                rcqa.addClass('is-claimable');
            } 
        });
    } else {
        rcqa.removeClass('is-claimable');
    }
    
    //console.log(claimableItems(question_detail));

    return rcqa;

}

function totalClaimable(question_detail) {
    return new Promise((resolve, reject)=>{
        var poss = possibleClaimableItems(question_detail);
        if (poss['total'].isZero()) {
            resolve(poss['total']);
        } else {
            RealityCheck.deployed().then(function(rc) {
                return rc.totalClaimable.call(account, poss['bounty_question_ids'], poss['bounty_question_ids'], poss['bond_answers'])
            }).then(function(tot) {
                resolve(tot);
            }).catch(function(err) {
                reject(err);
            });
        }
    });
}

function possibleClaimableItems(question_detail) {

    //console.log('in claimableItems', question_detail);
    var ttl = new BigNumber(0); 
    var is_your_claim = false;

    var your_question_ids = [];
    var claimable_question_ids = [];
    var claimable_answers = [];

    if (isFinalized(question_detail)) {
        for(var i=0; i<question_detail['history'].length; i++) {
            if (question_detail[Qi_best_answer] == question_detail['history'][i].args.answer) {
                is_your_claim = true;
            }
            break; 
        }
    }
    
    if (is_your_claim) {
        var claimable_bonds = {};
        for(var i=0; i<question_detail['history'].length; i++) {
            var a = question_detail['history'][i].args.answer;
            var b = question_detail['history'][i].args.bond;
            if (typeof claimable_answers[a] != 'BigNumber') {
                claimable_bonds[a] = new BigNumber(0);
            }
            claimable_bonds[a] = claimable_bonds[a].plus(b);
            ttl = ttl.plus(b);
        }

        ttl = ttl.plus(question_detail[Qi_bounty]);
        if (!question_detail[Qi_bounty].isZero()) {
            your_question_ids.push(question_detail[Qi_question_id]);
        }

        claimable_answers = Object.keys(your_question_ids);
        for(var i = 0; i<claimable_answers.length; i++) {
            claimable_question_ids.push(question_detail[Qi_question_id]);
        }

    }

    return {
        'total': ttl,
        'bounty_question_ids': your_question_ids,
        'bond_question_ids': claimable_question_ids,
        'bond_answers': claimable_answers
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


/*
Finds any item with timeago and the given block number
Fetches the timestamp for the block if not already cached
Populates the timestamp attribute
Calls the callback on it
*/
function populateWithBlockTimeForBlockNumber(item, num, callback) {

    if (block_timestamp_cache[num]) {
        callback(item, block_timestamp_cache[num]);
    } else {
        web3.eth.getBlock(num, function(err, result) {
            if (err || !result) {
                console.log('getBlock err', err, result);
                return;
            }
            block_timestamp_cache[num] = result.timestamp
            callback(item, result.timestamp);
        });
    }

}

// At this point the data we need should already be stored in question_detail_list
function renderUserAction(question, entry, rc) {

    // This will include events that we didn't specifically trigger, but we are intereseted in
    renderNotifications(question, entry, rc);

    // Only show here if we asked the question (questions section) or gave the answer (answers section)
    if (entry['event'] == 'LogNewQuestion' || entry['event'] == 'LogNewAnswer') {
        if (isForCurrentUser(entry)) {
            renderUserQandA(question, entry);
        }
    }

}

function insertNotificationItem(notification_id, item_to_insert, ntext, block_number, question_id) {

    var notifications = $('#your-question-answer-window').find('.notifications');
    var section_name = 'div[data-notification-id='+ notification_id + ']';
    if (notifications.find(section_name).length > 0) return;

    var notification_item = notifications.find('.notifications-item');

    if (notification_item.length == 0) {
        notifications.append(item_to_insert);
    } else {
        for (var i = 0; i < notification_item.length; i++) {
            var inserted = false;
            if (notification_item[i].getAttribute('data-block-number') <= block_number) {
                var id = notification_item[i].getAttribute('data-notification-id');
                $('#your-question-answer-window').find('.notifications-item[data-notification-id=' + id + ']').before(item_to_insert);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            notifications.append(item_to_insert);
        }
    }

    item_to_insert.attr('data-question-id', question_id);
    item_to_insert.attr('data-notification-id', notification_id);
    item_to_insert.find('.notification-text').text(ntext);
    item_to_insert.attr('data-block-number', block_number);
    item_to_insert.removeClass('template-item').addClass('populated-item');

    populateWithBlockTimeForBlockNumber(item_to_insert, block_number, renderTimeAgo);

}

function renderNotifications(qdata, entry, rc) {

    var question_id = qdata[Qi_question_id];
    //console.log('renderNotification', action, entry, qdata);

    var question_json = qdata[Qi_question_json];

    var your_qa_window = $('#your-question-answer-window');
    var item = your_qa_window.find('.notifications-template-container .template-item').clone();

    // TODO: Handle whether you asked the question

    var ntext;
    switch (entry['event']) {
        case 'LogNewQuestion':
            var notification_id = web3.sha3(entry.args.question_text + entry.args.arbitrator + entry.args.step_delay.toString());
            ntext  = 'You asked a question - "' + question_json['title'] + '"';
            insertNotificationItem(notification_id, item, ntext, entry.blockNumber, entry.args.question_id);
            break;

        case 'LogNewAnswer':
            var notification_id = web3.sha3(entry.args.question_id + entry.args.answerer + entry.args.bond.toString());
            if (entry.args.answerer == account) {
                ntext = 'You answered a question - "' + question_json['title'] + '"';
                insertNotificationItem(notification_id, item, ntext, entry.blockNumber, entry.args.question_id);
            } else {
                var answered_question = rc.LogNewQuestion({question_id: question_id}, {
                    fromBlock: START_BLOCK,
                    toBlock: 'latest'
                });
                answered_question.get(function (error, result2) {
                    if (error === null && typeof result2 !== 'undefined') {
                        if (result2[0].args.questioner == account) {
                            ntext = 'Someone answered to your question';
                        } else if (qdata['history'][qdata['history'].length - 2].args.answerer == account) {
                            ntext = 'Your answer was overwritten';
                        }
                        if (typeof ntext !== 'undefined') {
                            ntext += ' - "' + question_json['title'] + '"';
                            insertNotificationItem(notification_id, item, ntext, entry.blockNumber, entry.args.question_id);
                        }
                    }
                });
            }
        
            //console.log('notifications text', ntext);
            if (typeof ntext !== 'undefined') {
                item.find('.notification-text').text(ntext + ' - "' + question_json['title'] + '"');
                item.attr('data-answer-id', entry.args.question_id + '-' + entry.args.answer);
            }
            break;

        case 'LogFundAnswerBounty':
            var notification_id = web3.sha3(entry.args.question_id + entry.args.bounty.toString() + entry.args.bounty_added.toString() + entry.args.funder);
            if (entry.args.funder == account) {
                ntext = 'You added reward - "' + question_json['title'] + '"';
                insertNotificationItem(notification_id, item, ntext, entry.blockNumber, entry.args.question_id);
            } else {
                var funded_question = rc.LogNewQuestion({question_id: question_id}, {
                    fromBlock: START_BLOCK,
                    toBlock: 'latest'
                });
                // TODO: Should this really always be index 0?
                funded_question.get(function (error, result2) {
                    if (error === null && typeof result2 !== 'undefined') {
                        if (result2[0].args.questioner == account) {
                            ntext = 'Someone added reward to your question';
                        } else {
                            var prev_hist_idx = qdata['history'].length - 2;
                            if ( (prev_hist_idx >= 0) && (qdata['history'][prev_hist_idx].args.answerer == account) ) {
                                ntext = 'Someone added reward to the question you answered';
                            }
                        }
                        if (typeof ntext !== 'undefined') {
                            ntext += ' - "' + question_json['title'] + '"';
                            insertNotificationItem(notification_id, item, ntext, entry.blockNumber, entry.args.question_id);
                        }
                    }
                });
            }
            break;

        case 'LogRequestArbitration':
            var notification_id = web3.sha3(entry.args.question_id + entry.args.fee_paid.toString() + entry.args.requester);
            if (entry.args.requester == account) {
                ntext = 'You requested arbitration - "' + question_json['title'] + '"';
                insertNotificationItem(notification_id, item, ntext, entry.blockNumber, entry.args.question_id);
            } else {
                var arbitration_requested_question = rc.LogNewQuestion({question_id: question_id}, {fromBlock: START_BLOCK, toBlock: 'latest'});
                arbitration_requested_question.get(function (error, result2) {
                    if (error === null && typeof result2 !== 'undefined') {
                        var history_idx = qdata['history'].length - 2;
                        if (result2[0].args.questioner == account) {
                            ntext = 'Someone requested arbitration to your question';
                        } else {
                            if ( (history_idx >= 0) && (qdata['history'][history_idx].args.answerer == account) ) {
                                ntext = 'Someone requested arbitration to the question you answered';
                            }
                        }
                        if (typeof ntext !== 'undefined') {
                            ntext += ' - "' + question_json['title'] + '"';
                            insertNotificationItem(notification_id, item, ntext, entry.blockNumber, entry.args.question_id);
                        }
                    }
                });
            }
            break;

        case 'LogFinalize':
            var notification_id = web3.sha3(entry.args.question_id + entry.args.answer_id + entry.args.answer);
            var finalized_question = rc.LogNewQuestion({question_id: question_id}, {fromBlock: START_BLOCK, toBlock: 'latest'});
            finalized_question.get(function (error, result2) {
                if (error === null && typeof result2 !== 'undefined') {
                    if (result2[0].args.questioner == account) {
                        ntext = 'Your question is finalized';
                    } else if (qdata['history'][qdata['history'].length - 2].args.answerer == account) {
                        ntext = 'The question you answered is finalized';
                    }
                    if (typeof ntext !== 'undefined') {
                        ntext += ' - "' + question_json['title'] + '"';
                        insertNotificationItem(notification_id, item, ntext, entry.blockNumber, entry.args.question_id);
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
                if (answer_history[i].args.answerer == account) {
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

    var qitem = question_section.find('.your-qa__questions__item.template-item').clone();
    qitem.attr('data-question-id', question_id);
    qitem.find('.question-text').text(question_json['title']);
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
        case 'number':
            label = new BigNumber(answer).toString();
            break;
        case 'binary':
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
                var answer_bits = answer.toString(2);
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
        if (Date.now() - answer_created.toNumber() * 1000 > step_delay.toNumber() * 1000) {
            $(section_name).find('.final-answer-button').css('display', 'block');
            clearInterval(id);
        }
    }, 15000);
    */
}

$(document).on('click', '.final-answer-button', function(){
    var question_id = $(this).closest('div.rcbrowser--qa-detail').attr('data-question-id');
    RealityCheck.deployed().then(function(rc) {
        return rc.finalize(question_id, {from: account});
    }).then(function(result){
        //console.log('finalized!', result);
    }).catch(function(e){
       console.log('on click FA button', e);
    });
});

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
    console.log('.answer-item clicked');
    if ($(this).find('.answer-data').hasClass('is-bounce')) {
        $(this).find('.answer-data').removeClass('is-bounce');
        $(this).find('.answer-data').css('display', 'none');
     } else {
        $(this).find('.answer-data').addClass('is-bounce');
        $(this).find('.answer-data').css('display', 'block');
     }
});

// post an answer
$(document).on('click', '.post-answer-button', function(e){
    e.preventDefault();
    e.stopPropagation();

    var parent_div = $(this).parents('div.rcbrowser--qa-detail');
    var question_id = parent_div.attr('data-question-id');
    var bond = web3.toWei(new BigNumber(parent_div.find('input[name="questionBond"]').val()), 'ether');

    var account = web3.eth.accounts[0];
    var rc;
    var question, current_answer, new_answer;
    var question_json;
    var current_question;
    var is_err = false;
    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.questions.call(question_id);
    }).then(function(cq) {
        current_question = cq;
        current_question.unshift(question_id);
        var question_ipfs = current_question[Qi_question_ipfs];
        return ipfs.cat(bytes32ToIPFSHash(question_ipfs), {buffer: true})
    }).then(function (res) {
        current_question[Qi_question_json] = parseQuestionJSON(res.toString());
        question_json = current_question[Qi_question_json];
        console.log('got question_json', question_json);

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
        return rc.getMinimumBondForAnswer.call(question_id, formatForAnswer(new_answer, question_json['type']), account);
    }).then(function(min_amount){
        if (isNaN(bond) || (bond < min_amount) || (min_amount === 0)) {
            parent_div.find('div.input-container.input-container--bond').addClass('is-error');
            parent_div.find('div.input-container.input-container--bond').find('.min-amount').text(min_amount);
            is_err = true;
        }

        if (is_err) throw('err on submitting answer');

        submitted_question_id_timestamp[question_id] = new Date().getTime();

        // Converting to BigNumber here - ideally we should probably doing this when we parse the form
        return rc.submitAnswer(question_id, formatForAnswer(new_answer, question_json['type']), '', {from:account, value:bond});
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
    });
    /*
    .catch(function(e){
        console.log(e);
    });
    */
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

$(document).on('click', '.notifications-item', function(e){
    console.log('notifications-item clicked');
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
        RealityCheck.deployed().then(function (rc) {
            return rc.fundAnswerBounty(question_id, {from: account, value: reward});
        }).then(function (result) {
            console.log('fund bounty', result);
            var container = rcqa.find('.add-reward-container');
            console.log('removing open', container.length, container);
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
    Arbitrator.at(question_detail[Qi_arbitrator]).then(function(arb) {
        return arb.getFee.call(question_id);
    }).then(function(fee) {
        console.log('got fee', fee);
        RealityCheck.deployed().then(function(rc){
            return rc.requestArbitration(question_id, {from:account, value: arbitration_fee});
        }).then(function(result){
            //console.log('arbitration is requestd.', result);
        });
    });
});

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
        let question_id = $(this).closest('.rcbrowser.rcbrowser--qa-detail').attr('data-question-id');
        let current_idx = question_detail_list[question_id]['history'].length - 1;
        let current_bond = 0;
        if (current_idx >= 0) {
            web3.fromWei(question_detail_list[question_id]['history'][current_idx].args.bond.toNumber(), 'ether');
        }
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


// This should be called with a question array containing, at a minimum, up-to-date versions of the changed_field and Qi_finalization_ts.
// A full repopulate will work, but so will an array with these fields overwritten from a log event.
function updateRankingSections(question, changed_field, changed_val) {

//console.log('in updateRankingSections', question, changed_field, changed_val);
    // latest only change on new question
    // resolved changes on finalization, this happens either with a timer or with arbitration. Also removes items from other section.
    // closing soon changes when we add an answer
    // high reward changes if we add reward. TODO: Should maybe include bond value, in which case it would also change on new answer

    var question_id = question[Qi_question_id];
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
            //console.log('not finalized yet', question[Qi_finalization_ts].toNumber(), new Date().getTime());
        }

    } else {
        //console.log('not updating for changed field ',changed);
    }

    ///if (question[Qi_question_id] in display_entries['questions-

/*
var display_entries = {
        'questions-latest': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3},
            'questions-resolved': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3},
                'questions-closing-soon': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3},
                    'questions-high-reward': {'ids': [], 'vals': [], 'max_store': 5, 'max_show': 3}
}
*/
                                                                                      
}



/*-------------------------------------------------------------------------------------*/
// initial process

function pageInit(account) {

    //console.log('in pageInit for account', account);

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

        return rc.allEvents({}, {fromBlock:'latest', toBlock:'latest'});

    }).then(function(evts) {

        evts.watch(function (error, result) {
            if (!error && result) {

                // Check the action to see if it is interesting, if it is then populate notifications etc
                handleUserAction(result, rc);

                // Handles front page event changes.
                // NB We need to reflect other changes too...
                var evt = result['event'];
                if (evt == 'LogNewQuestion') {
                    handleQuestionLog(result, rc);
                } else {
                    var question_id = result.args.question_id;
                    if (evt == 'LogNewAnswer') {
                        // TODO: Tighten this up, we don't always need all this
                        populateQuestionDetail(question_id, rc).then(function(question) {
                            scheduleFinalizationDisplayUpdate(question);
                        });
                    }

                    // TODO: We shouldn't really need a full refresh for what may be a small event
                    var window_id = 'qadetail-' + question_id;
                    if (document.getElementById(window_id)) {
                        delete question_detail_list[question_id];
                        populateQuestionDetail(question_id, rc).then(function(question) {
                            displayQuestionDetail(question);
                            //updateRankingSections(question);
                        });
                    }
                }
            }
        });

        // Watchers all done, next we do the history gets
        // We start with the user's answers so we can tell when we see a relevant question ID
        return rc.LogNewAnswer({}, {fromBlock: START_BLOCK, toBlock:'latest'});

    }).then(function(answer_posted) {
        answer_posted.get(function (error, result) {
            var answers = result;
            if (error === null && typeof result !== 'undefined') {
                for (var i = 0; i < answers.length; i++) {
                    handleUserAction(answers[i], rc);
                }
            } else {
                console.log(error);
            }
        });

        // Next comes the user's funded questions
        return rc.LogFundAnswerBounty({}, {fromBlock: START_BLOCK, toBlock: 'latest'});

    }).then(function(bounty_funded) {

        bounty_funded.get(function (error, result) {
            if (error === null && typeof result !== 'undefined') {
                for (var i = 0; i < result.length; i++) {
                    handleUserAction(result[i], rc);
                }
            } else {
                console.log(error);
            }
        });

        return rc.LogRequestArbitration({}, {fromBlock: START_BLOCK, toBlock: 'latest'});

    }).then(function(arbitration_requested) {
        arbitration_requested.get(function (error, result) {
            if (error === null && typeof result !== 'undefined') {
                for (var i = 0; i < result.length; i++) {
                    handleUserAction(result[i], rc);
                }
            } else {
                console.log(error);
            }
        });

        return rc.LogFinalize({}, {fromBlock: START_BLOCK, toBlock: 'latest'});

    }).then(function(finalized){
        finalized.get(function (error, result) {
            if (error === null && typeof result !== 'undefined') {
                for (var i = 0; i < result.length; i++) {
                    handleUserAction(result[i], rc);
                }
            } else {
                console.log(error);
            }
        });

        // Now the rest of the questions
        return rc.LogNewQuestion({}, {fromBlock: START_BLOCK, toBlock:'latest'});

    }).then(function(question_posted) {

        question_posted.get(function (error, result) {
            if (error === null && typeof result !== 'undefined') {
                for(var i=0; i<result.length; i++) {
                    handleUserAction(result[i], rc);
                    handleQuestionLog(result[i], rc);
                }
            } else {
                console.log(e);
            }

        });

    });

};

function isForCurrentUser(entry) {
    var actor_arg = EVENT_ACTOR_ARGS[entry['event']];
    if (actor_arg) {
        return (entry.args[actor_arg] == account);
    } else {
        return false;
    }
}

window.onload = function() {
    web3.eth.getAccounts((err, acc) => {
        //console.log('accounts', acc);
        account = acc[0];
        pageInit(account);
    });
}
