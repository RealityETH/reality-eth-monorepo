// TODO: Check if there was a reason to do this instead of import //require('../../../node_modules/gsap/src/uncompressed/plugins/ScrollToPlugin.js');

'use strict';

const rc_question = require('@realitio/realitio-lib/formatters/question.js');
const rc_template = require('@realitio/realitio-lib/formatters/template.js');

// The library is Web3, metamask's instance will be web3, we instantiate our own as web3js
const Web3 = require('web3');
var web3js; // This should be the normal metamask instance
var web3realitio; // We run our own node to handle watch events that can't reliably be done with infura

const rc_json = require('@realitio/realitio-contracts/truffle/build/contracts/Realitio.json');
const arb_json = require('@realitio/realitio-contracts/truffle/build/contracts/Arbitrator.json');

// For now we have a json file hard-coding the TOS of known arbitrators.
// See https://github.com/realitio/realitio-dapp/issues/136 for the proper way to do it.
const arb_tos = require('./arbitrator_tos.json');

const arbitrator_list = require('@realitio/realitio-contracts/config/arbitrators.json');
const TEMPLATE_CONFIG = require('@realitio/realitio-contracts/config/templates.json');

const contract = require("truffle-contract");
const BigNumber = require('bignumber.js');
const timeago = require('timeago.js');
const timeAgo = new timeago();
const jazzicon = require('jazzicon');

const LEGACY_CONTRACT_ADDRESSES = require('../../v1/addresses.json');

// Cache the results of a call that checks each arbitrator is set to use the current realitycheck contract
var verified_arbitrators = {};
var failed_arbitrators = {};

var submitted_question_id_timestamp = {};
var user_claimable = {};

var category = null;
var template_blocks = {};
var template_content = TEMPLATE_CONFIG.content;

var last_polled_block;
var is_initial_load_done = false;

const QUESTION_TYPE_TEMPLATES = TEMPLATE_CONFIG.base_ids;
var USE_COMMIT_REVEAL = false;

const BLOCK_EXPLORERS = {
    1: 'https://etherscan.io',
    3: 'https://ropsten.etherscan.io',
    4: 'https://rinkeby.etherscan.io',
    42: 'https://kovan.etherscan.io',
    1337: 'https://etherscan.io'
};

const RPC_NODES = {
    1: 'https://rc-dev-3.socialminds.jp', // 'https://mainnet.infura.io/tSrhlXUe1sNEO5ZWhpUK',
    3: 'https://ropsten.infura.io/tSrhlXUe1sNEO5ZWhpUK',
    4: 'https://rc-dev-4.socialminds.jp', // 'https://rinkeby.infura.io/tSrhlXUe1sNEO5ZWhpUK',
    42: 'https://rc-dev-4.socialminds.jp:9545',
    1337: 'https://localhost:8545'
};

// The point where we deployed the contract on the network
// No point in looking for questions any further back than that
const START_BLOCKS = {
    1: 6531147,
    4: 3175028,
    42: 10350865
}
var START_BLOCK;

var network_id = null;
var block_explorer = null;

const FETCH_NUMBERS = [100, 2500, 5000];

var last_displayed_block_number = 0;
var current_block_number = 1;

// Struct array offsets
// Assumes we unshift the ID onto the start

// Question, as returned by questions()
const Qi_question_id = 0;

// NB This has magic values - 0 for no answer, 1 for pending arbitration, 2 for pending arbitration with answer, otherwise timestamp
const Qi_content_hash = 1;
const Qi_arbitrator = 2;
const Qi_opening_ts = 3;
const Qi_timeout = 4;
const Qi_finalization_ts = 5;
const Qi_is_pending_arbitration = 6;
const Qi_bounty = 7;
const Qi_best_answer = 8;
const Qi_history_hash = 9;
const Qi_bond = 10;
const Qi_question_json = 11; // We add this manually after we load the template data
const Qi_creation_ts = 12; // We add this manually from the event log
const Qi_question_creator = 13; // We add this manually from the event log
const Qi_question_created_block = 14;
const Qi_question_text = 15;
const Qi_template_id = 16;
const Qi_block_mined = 17;

BigNumber.config({
    RABGE: 256
});
const ONE_ETH = 1000000000000000000;

var block_timestamp_cache = {};

// Array of all questions that the user is interested in
var q_min_activity_blocks = {};

// These will be populated in onload, once web3js is loaded
var RealityCheck;
var Arbitrator;

var account;
var rc;
var rcrealitio; // Instance using our node

var display_entries = {
    'questions-latest': {
        'ids': [],
        'vals': [],
        'max_store': 50,
        'max_show': 6
    },
    'questions-resolved': {
        'ids': [],
        'vals': [],
        'max_store': 50,
        'max_show': 6
    },
    'questions-closing-soon': {
        'ids': [],
        'vals': [],
        'max_store': 50,
        'max_show': 6
    },
    'questions-high-reward': {
        'ids': [],
        'vals': [],
        'max_store': 50,
        'max_show': 6
    }
}

// data for question detail window
var question_detail_list = [];
var question_event_times = {}; // Hold timer IDs for things we display that need to be moved when finalized

var window_position = [];

var $ = require('jquery-browserify');
require('jquery-expander')($);
require('jquery-datepicker');

import imagesLoaded from 'imagesloaded';
import interact from 'interactjs';
import Ps from 'perfect-scrollbar';
//import {TweenLite, Power3} from 'gsap';

function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function nonceFromSeed(paramstr) {

    var seed = window.localStorage.getItem('commitment-seed');
    if (seed == null) {
        var crypto = require('crypto');
        seed = crypto.randomBytes(32).toString('hex');
        console.log('made seed', seed);
        window.localStorage.setItem('commitment-seed', seed);
    }

    return web3.sha3(paramstr + seed);

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

function rcbrowserHeight() {
    console.log('skipping auto rcbrowserHeight');
    return;
    const rcbrowserHeaders = document.querySelectorAll('.rcbrowser-header');
    const rcbrowserMains = document.querySelectorAll('.rcbrowser-main');
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

function setRcBrowserPosition(rcbrowser) {
    // when position has been stored.
    if (rcbrowser.hasClass('rcbrowser--qa-detail')) {
        var question_id = rcbrowser.attr('data-question-id');
        if (typeof window_position[question_id] !== 'undefined') {
            let left = parseInt(window_position[question_id]['x']) + 'px';
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
        var left = (winWidth / 2) - (itemWidth / 2);
        var top = itemHeight / 10;
        left += 'px';
        top += 'px';

    } else if (rcbrowser.hasClass('rcbrowser--qa-detail')) {
        var leftMin = winWidth / 2;
        var left = (winWidth / 2) - (itemWidth / 2);
        var top = itemHeight / 10;
        left += 'px';
        top += 'px';
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
        elementRect: {
            top: 0,
            left: 0,
            bottom: 1,
            right: 1
        }
    },
    // enable autoScroll
    autoScroll: false,

    // call this function on every dragmove event
    onmove: dragMoveListener
});

function dragMoveListener(event) {
    var target = event.target.parentNode.parentNode;
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    let top = parseInt(target.style.top);
    if (top + y < 1) {
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

$(document).on('change', 'input.arbitrator-other', function() {
    var arb_text = $(this).val();
    var sel_cont = $(this).closest('.select-container');
    if (/^(0x)?[0-9a-f]{1,40}$/i.test(arb_text)) {
        Arbitrator.at(arb_text).then(function(ar) {
            ar.realitycheck().call().then(function(rcaddr) {
                if (rcaddr != rc.address) {
                    console.log('reality check mismatch');
                    return;
                }
                rc.arbitrator_question_fees.call(arb_text).then(function(fee) {
                    populateArbitratorOptionLabel(sel_cont.find('option.arbitrator-other-select'), fee);
                }).catch(function() {
                    populateArbitratorOptionLabel(sel_cont.find('option.arbitrator-other-select'), new BigNumber(0));
                });
            });
        });
    } else {
        populateArbitratorOptionLabel(sel_cont.find('option.arbitrator-other-select'), new BigNumber(0));
    }
});

$(document).on('change', 'select.arbitrator', function() {
    console.log('arbitrator: ' + $(this).val());
    if ($(this).val() == 'other') {
        $(this).closest('form').find('input.arbitrator-other').show();
    } else {
        populateArbitratorOptionLabel($(this).find('option.arbitrator-other-select'), new BigNumber(0));
        $(this).closest('form').find('input.arbitrator-other').hide();
    }
    var tos_url;
    var op = $(this).find('option:selected');
    var tos_url = op.attr('data-tos-url');
    console.log('tos_url', tos_url, 'op', op);
    var tos_section = $(this).closest('.select-container').find('div.arbitrator-tos');
    if (tos_url) {
        tos_section.find('.arbitrator-tos-link').attr('href', tos_url);
        tos_section.show(); 
    } else {
        tos_section.find('.arbitrator-tos-link').attr('href', '');
        tos_section.hide(); 
    }
});

$(document).on('click', '.rcbrowser', function() {
    zindex += 1;
    $(this).css('z-index', zindex);
    $('.ui-datepicker').css('z-index', zindex + 1);
    $(this).find('.question-setting-warning').find('.balloon').css('z-index', ++zindex);
    $(this).find('.question-setting-info').find('.balloon').css('z-index', zindex);
});

// see all notifications
$(function() {
    $('.see-all-notifications').click(function() {
        $(this).closest('#your-question-answer-window').removeClass('display-top-only').addClass('display-all');
        return false;
    });
    $('.hide-lower-notifications').click(function() {
        $(this).closest('#your-question-answer-window').addClass('display-top-only').removeClass('display-all');
        return false;
    });
});


// page loaded
let bounceEffect = function() {
    if (!$('body').hasClass('is-page-loaded')) {
        imagesLoaded(document.getElementById('cover'), {
            background: true
        }, function() {
            $('body').addClass('is-page-loaded');
        });
    }
}


/*-------------------------------------------------------------------------------------*/
// window for posting a question

$('#your-qa-button,.your-qa-link').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    getAccount().then(function() {
        var yourwin = $('#your-question-answer-window');
        yourwin.css('z-index', ++zindex);
        yourwin.addClass('is-open');
        var winheight = (yourwin.height() > $(window).height()) ? $(window).height() : yourwin.height();
        yourwin.css('height', winheight + 'px');
        Ps.update(yourwin.find('.rcbrowser-inner').get(0));
        $('.tooltip').removeClass('is-visible');
        $('body').removeClass('pushing');
        markViewedToDate();
    });
});

$('#help-center-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#help-center-window').css('z-index', ++zindex).addClass('is-open');
});

function setViewedBlockNumber(network_id, block_number) {
    window.localStorage.setItem('viewedBlockNumber' + network_id, block_number);
}

function getViewedBlockNumber(network_id) {
    return window.localStorage.getItem('viewedBlockNumber' + network_id);
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
    document.documentElement.style.cursor = ""; // Work around Interact draggable bug
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

$('#post-a-question-button,.post-a-question-link').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    let question_window = $('#post-a-question-window-template').clone().attr('id', 'post-a-question-window');
    question_window.find('.rcbrowser__close-button').click(function() {
        question_window.remove();
        document.documentElement.style.cursor = ""; // Work around Interact draggable bug
    });

    getAccount().then(function() {

        $('#post-a-question-window-template').before(question_window);
        $('#opening-ts-datepicker').datepicker({
            dateFormat: 'yy-mm-dd',
            onSelect: function(dateText) {
                $(this).css('background-color', '#ffffff');
            }
        });

        if (!question_window.hasClass('is-open')) {
            question_window.css('z-index', ++zindex);
            question_window.addClass('is-open');
            question_window.css('height', question_window.height() + 'px');
            setRcBrowserPosition(question_window);
        }
        if (category) {
            question_window.find("[name='question-category']").val(category);
        }

        Ps.initialize(question_window.find('.rcbrowser-inner').get(0));

        $("textarea[name='question-body']").on('change keyup paste', function() {
            if ($(this).val()==""){
                $(this).parent().addClass('is-error');
            } else {
                $(this).parent().removeClass('is-error');
            }
        });

        $("select[name='question-category']").change(function(){
            $(this).addClass("selected");

            var optionLabel = "Category: ";

            $("option", this).each(function() {
                var option = $(this).text().split(optionLabel)[1];
                if (option){ $(this).text(option);}
            });

            var optionText = $("option:selected",this).text();
            $("option:selected", this).text(optionLabel + optionText);

            $(this).parent().removeClass('is-error');
        });

        $("select[name='question-type']").change(function(){
            var optionLabel = "Question Type: ";

            $("option", this).each(function() {
                var option = $(this).text().split(optionLabel)[1];
                if (option){ $(this).text(option);}
            });

            var optionText = $("option:selected",this).text();
            $("option:selected", this).text(optionLabel + optionText);
        });

        $("select[name='step-delay']").change(function(){
            var optionLabel = "Countdown: ";

            $("option", this).each(function() {
                var option = $(this).text().split(optionLabel)[1];
                if (option){ $(this).text(option);}
            });

            var optionText = $("option:selected",this).text();
            $("option:selected", this).text(optionLabel + optionText);
        });

        $("select[name='arbitrator']").change(function(){
            $(this).addClass("selected");
            var optionLabel = "Arbitrator: ";

            $("option", this).each(function() {
                var option = $(this).text().split(optionLabel)[1];
                if (option){ $(this).text(option);}
            });

            var optionText = $("option:selected",this).text();
            $("option:selected", this).text(optionLabel + optionText);
        });
    });
});

$('#browse-question-button,.browse-question-link').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('body').addClass('page-qa');
    $('#site-slogan-normal').css('display', 'none');
    $('#site-slogan-browse-qa').css('display', 'block');
    $('#site-introduction__buttons').css('visibility', 'hidden');
});

$('#site-logo').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('body').removeClass('page-qa');
    $('#site-slogan-normal').css('display', 'block');
    $('#site-slogan-browse-qa').css('display', 'none');
    $('#site-introduction__buttons').css('visibility', 'visible');
});

$(document).on('click', '#post-a-question-window .close-question-window', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#post-a-question-window').css('z-index', 0);
    $('#post-a-question-window').removeClass('is-open');
});

$(document).on('click', '#post-a-question-window .post-question-submit', function(e) {
    e.preventDefault();
    e.stopPropagation();

    getAccount().then(function() {

        var win = $('#post-a-question-window');
        var question_body = win.find('.question-body');
        var reward_val = win.find('.question-reward').val();
        var timeout = win.find('.step-delay');
        var timeout_val = parseInt(timeout.val());
        var arbitrator = win.find('.arbitrator').val();

        var expected_question_fee_attr = win.find('.arbitrator option:selected').attr('data-question-fee');
        var expected_question_fee = expected_question_fee_attr ? new BigNumber(expected_question_fee_attr) : new BigNumber(0);

        if (arbitrator == 'other') {
            arbitrator = win.find('input.arbitrator-other').val();
        }
        var question_type = win.find('.question-type');
        var answer_options = win.find('.answer-option');
        var opening_ts_val = win.find('.opening-ts').val();

        var category = win.find('div.select-container--question-category select');
        var outcomes = [];
        for (var i = 0; i < answer_options.length; i++) {
            outcomes[i] = answer_options[i].value;
        }
        var reward = (reward_val == '') ? new BigNumber(0) : new BigNumber(web3js.toWei(reward_val, 'ether'));

        if (validate(win)) {
            var qtype = question_type.val();
            var template_id = rc_template.defaultTemplateIDForType(qtype);
            var qtext = rc_question.encodeText(qtype, question_body.val(), outcomes, category.val());
            var opening_ts = 0;
            if (opening_ts_val != '') {
                opening_ts = new Date(opening_ts_val);
                opening_ts = parseInt(opening_ts / 1000);
            }

            var question_id = rc_question.questionID(template_id, qtext, arbitrator, timeout_val, opening_ts, account, 0);
            console.log('question_id inputs for id ', question_id, template_id, qtext, arbitrator, timeout_val, opening_ts, account, 0);
            console.log('content_hash inputs for content hash ', rc_question.contentHash(template_id, opening_ts, qtext), template_id, opening_ts, qtext);

            validateArbitratorForContract(arbitrator).then(function(is_ok) {
                if (!is_ok) {
                    console.log('bad arbitrator');
                    return;
                }
                rc.arbitrator_question_fees.call(arbitrator).then(function(fee) {
                    if (!fee.equals(expected_question_fee)) {
                        console.log('fee has changed');
                        populateArbitratorOptionLabel(win.find('.arbitrator option:selected'), fee);
                        return;
                    }

                    rc.askQuestion.sendTransaction(template_id, qtext, arbitrator, timeout_val, opening_ts, 0, {
                            from: account,
                            gas: 200000,
                            value: reward.plus(fee)
                        })
                        .then(function(txid) {
                            //console.log('sent tx with id', txid);

                            // Make a fake log entry
                            var fake_log = {
                                'entry': 'LogNewQuestion',
                                'blockNumber': 0, // unconfirmed
                                'args': {
                                    'question_id': question_id,
                                    'user': account,
                                    'arbitrator': arbitrator,
                                    'timeout': new BigNumber(timeout_val),
                                    'content_hash': rc_question.contentHash(template_id, opening_ts, qtext),
                                    'template_id': new BigNumber(template_id),
                                    'question': qtext,
                                    'created': new BigNumber(parseInt(new Date().getTime() / 1000)),
                                    'opening_ts': new BigNumber(parseInt(opening_ts))
                                }
                            }
                            var fake_call = [];
                            fake_call[Qi_finalization_ts - 1] = new BigNumber(0);
                            fake_call[Qi_is_pending_arbitration] = false;
                            fake_call[Qi_arbitrator - 1] = arbitrator;
                            fake_call[Qi_timeout - 1] = new BigNumber(timeout_val);
                            fake_call[Qi_content_hash - 1] = rc_question.contentHash(template_id, parseInt(opening_ts), qtext),
                            fake_call[Qi_bounty - 1] = reward;
                            fake_call[Qi_best_answer - 1] = "0x0";
                            fake_call[Qi_bond - 1] = new BigNumber(0);
                            fake_call[Qi_history_hash - 1] = "0x0";
                            fake_call[Qi_opening_ts - 1] = new BigNumber(opening_ts);

                            var q = filledQuestionDetail(question_id, 'question_log', 0, fake_log);
                            q = filledQuestionDetail(question_id, 'question_call', 0, fake_call);
                            q = filledQuestionDetail(question_id, 'question_json', 0, rc_question.populatedJSONForTemplate(template_content[template_id], qtext));

                            // Turn the post question window into a question detail window
                            var rcqa = $('.rcbrowser--qa-detail.template-item').clone();
                            win.html(rcqa.html());
                            win = populateQuestionWindow(win, q, false);

                            // TODO: Once we have code to know which network we're on, link to a block explorer
                            win.find('.pending-question-txid a').attr('href', block_explorer + '/tx/' + txid);
                            win.find('.pending-question-txid a').text(txid.substr(0, 12) + "...");
                            win.addClass('unconfirmed-transaction').addClass('has-warnings');
                            win.attr('data-pending-txid', txid);

                            win.find('.rcbrowser__close-button').on('click', function() {
                                let parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
                                let left = parseInt(parent_div.css('left').replace('px', ''));
                                let top = parseInt(parent_div.css('top').replace('px', ''));
                                let data_x = (parseInt(parent_div.attr('data-x')) || 0);
                                let data_y = (parseInt(parent_div.attr('data-y')) || 0);
                                left += data_x;
                                top += data_y;
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
                });
            });
        }
    })

});

function isArbitratorValid(arb) {
    var found = false;
    let arbitrator_addrs = $('select.arbitrator').children();
    arbitrator_addrs.each(function() {
        if ($(this).val().toLowerCase() == arb.toLowerCase()) {
            found = true;
            return false;
        }
    });
    return found;
}

// Check if an arbitrator is valid when we have not yet had time to contact all the arbitrator contracts
// This is used for fast rendering of the warnings on the list page.
// TODO: We should really go back through them later and set warnings on anything that turned out to be bad
function isArbitratorValidFast(test_arb) {
    for (var a in arbitrator_list[""+network_id]) {
        if (a.toLowerCase() == test_arb.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function isArbitrationPending(question) {
    return (question[Qi_is_pending_arbitration]);
}

// Return true if a user has started a commit or given an answer
// NB Returns true even if the answer has timed out
function isAnswerActivityStarted(question) {
    if (isAnswered(question)) {
        return true;
    }
    var history_hash = new BigNumber(question[Qi_history_hash]);
    return (history_hash.gt(0));
}

function historyItemForCurrentAnswer(question) {
    if (question['history'].length) {
        for (var i=question['history'].length-1; i >= 0; i--) {
            var item = question['history'][i].args;
            if (!item.is_commitment || item.revealed_block) {
                return item;
            }
        }
    }
    return null;
}

function isTopAnswerRevealable(question) {
    // console.log('in isTopAnswerRevealable');
    if (!isAnswerActivityStarted(question)) {
        return false;
    }
    // console.log('history', question['history']);
    if (question['history'].length == 0) {
        return false;
    }
    var idx = question['history'].length - 1;
    var item = question['history'][idx].args;
    if (!item.is_commitment) {
        return false;
    }
    if (item.revealed_block) {
        return false;
    }
    if (isCommitExpired(question, item['ts'].toNumber())) {
        return false;
    }
    return true;
}

function hasUnrevealedCommits(question) {
    if (!isAnswerActivityStarted(question)) {
        return false;
    }
    if (question['history'].length) {
        for (var i=0; i<question['history'].length; i++) {
            var item = question['history'][i].args;
            if (item.is_commitment && !item.revealed_block) {
                return true;
            }
        }
    }
    return false;
}

// Return true if there's a completed answer...
// ...or if there's an uncommitted answer that hasn't timed out yet
// TODO: Check for timeouts
function isAnsweredOrAnswerActive(question) {
    var history_hash = new BigNumber(question[Qi_history_hash]);
    return (history_hash.gt(0));
}

function isAnswered(question) {
    var finalization_ts = question[Qi_finalization_ts].toNumber();
    return (finalization_ts > 1);
}

function commitExpiryTS(question, posted_ts) {
    var commit_secs = question[Qi_timeout].div(8);
    return posted_ts.plus(commit_secs);
}

function isCommitExpired(question, posted_ts) {
    var commit_secs = question[Qi_timeout].toNumber() / 8;
    // console.log('commit secs are ', commit_secs);
    return new Date().getTime() > (( posted_ts + commit_secs ) * 1000);
}


function isFinalized(question) {
    if (isArbitrationPending(question)) {
        return false;
    }
    var fin = question[Qi_finalization_ts].toNumber()
    var res = ((fin > 1) && (fin * 1000 < new Date().getTime()));
    return res;
}

$(document).on('click', '.answer-claim-button', function() {

    var is_single_question = !$(this).hasClass('claim-all');

    var doClaim = function(is_single_question, question_detail) {

        var claim_args;
        var claiming;
        if (is_single_question) {

            claiming = possibleClaimableItems(question_detail);
            claim_args = claiming;

            //console.log('try9ing to claim ', claimable['total'].toString());
            if (claim_args['total'].isZero()) {
                //console.log('nothing to claim');
                // Nothing there, so force a refresh
                openQuestionWindow(question_id);
                delete user_claimable[question_id];
            }

        } else {

            claiming = user_claimable;
            claim_args = mergePossibleClaimable(claiming);

        }

        // estimateGas gives us a number that credits the eventual storage refund.
        // However, this is only supplied at the end of the transaction, so we need to send more to get us to that point.
        // MetaMask seems to add a bit extra, but it's not enough.
        // Get the number via estimateGas, then add 60000 per question, which should be the max storage we free.

        // For now hard-code a fairly generous allowance
        // Tried earlier with single answerer:
        //  1 answer 48860
        //  2 answers 54947
        //  5 answers 73702

        var gas = 140000 + (30000 * claim_args['history_hashes'].length);
        rc.claimMultipleAndWithdrawBalance.sendTransaction(claim_args['question_ids'], claim_args['answer_lengths'], claim_args['history_hashes'], claim_args['answerers'], claim_args['bonds'], claim_args['answers'], {
                from: account,
                gas: gas
            })
            .then(function(txid) {
                //console.log('claiming is ',claiming);
                //console.log('claim result txid', txid);
                for (var qid in claiming) {
                    if (claiming.hasOwnProperty(qid)) {
                        if (user_claimable[qid]) {
                            user_claimable[qid].txid = txid;
                        }
                    }
                }
                updateClaimableDisplay();
                updateUserBalanceDisplay();
            });
    }

    if (is_single_question) {
        var question_id = $(this).closest('.rcbrowser--qa-detail').attr('data-question-id');
        ensureQuestionDetailFetched(question_id).then(function(qdata) {
            doClaim(is_single_question, qdata);
        });
    } else {
        // TODO: Should we be refetching all the questions we plan to claim for?
        doClaim(is_single_question);
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
    if (reward.val() === '') {
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

    if (win.find('.answer-option-container').hasClass('is-open') && question_type.val().indexOf('select') != -1 && options_num < 2) {
        $('.edit-option-inner').addClass('is-error');
        valid = false;
    } else {
        $('.edit-option-inner').removeClass('is-error');
    }

    var select_ids = ['.question-type', '.arbitrator', '.step-delay', '.question-category'];
    for (var id of select_ids) {
        if (win.find(id).val() == "default") {
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

    var num_in_doc = $('#' + sec).find('.questions__item').length;

    display_entries[sec]['max_show'] = new_max;

    // TODO: We may need to refetch to populate this store
    display_entries[sec]['max_store'] = display_entries[sec]['max_store'] + 3;

    for (var i = num_in_doc; i < new_max && i < display_entries[sec]['ids'].length; i++) {
        var nextid = display_entries[sec]['ids'][i];
        var previd;
        if (i > 0) {
            previd = display_entries[sec]['ids'][i + 1];
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

    if (!account) {
        return;
    }

    if ((entry['event'] == 'LogNewTemplate') || (entry['event'] == 'LogWithdraw')) {
        return;
    }

    if (!entry || !entry.args || !entry.args['question_id'] || !entry.blockNumber) {
        console.log('expected content not found in entry', !entry, !entry.args, !entry.args['question_id'], !entry.blockNumber, entry);
        return;
    }

    // This is the same for all events
    var question_id = entry.args['question_id'];

    // If this is the first time we learned that the user is involved with this question, we need to refetch all the other related logs
    // ...in case we lost one due to a race condition (ie we had already got the event before we discovered we needed it)
    // TODO: The filter could be tigher on the case where we already knew we had it, but we didn't know how soon the user was interested in it
    if ((!q_min_activity_blocks[question_id]) || (entry.blockNumber < q_min_activity_blocks[question_id])) {
        // Event doesn't, in itself, have anything to show we are interested in it
        // NB we may be interested in it later if some other event shows that we should be interested in this question.
        if (!isForCurrentUser(entry)) {
            // console.log('entry', entry.args['question_id'], 'not interesting to account', entry, account);
            return;
        }

        q_min_activity_blocks[question_id] = entry.blockNumber;

        fetchUserEventsAndHandle({
            question_id: question_id
        }, START_BLOCK, 'latest');

        updateUserBalanceDisplay();

    }

    var lastViewedBlockNumber = 0;
    if (getViewedBlockNumber(network_id)) {
        lastViewedBlockNumber = parseInt(getViewedBlockNumber(network_id));
    }
    if (entry.blockNumber > lastViewedBlockNumber) {
        $('body').addClass('pushing');
    }

    var is_population_done = false;

    // User action
    //console.log('got event as user action', entry);
    if ((entry['event'] == 'LogNewAnswer') && (submitted_question_id_timestamp[question_id] > 0)) {
        delete submitted_question_id_timestamp[question_id];
        ensureQuestionDetailFetched(question_id, 1, 1, entry.blockNumber, entry.blockNumber).then(function(question) {
            displayQuestionDetail(question);
            renderUserAction(question, entry, is_watch);
        });
    } else {

        //console.log('fetch for notifications: ', question_id, current_block_number, current_block_number);
        ensureQuestionDetailFetched(question_id, 1, 1, current_block_number, current_block_number).then(function(question) {
            if ((entry['event'] == 'LogNewAnswer') || (entry['event'] == 'LogClaim') || (entry['event'] == 'LogFinalize')) {
                //console.log('got event, checking effect on claims', entry);
                if (updateClaimableDataForQuestion(question, entry, is_watch)) {
                    updateClaimableDisplay();
                    updateUserBalanceDisplay();
                }
            }
            //console.log('rendering');
            renderUserAction(question, entry, is_watch);
        }).catch(function(e) {
            console.log('got error fetching: ', question_id, e);
        });

    }

}

function updateClaimableDataForQuestion(question, answer_entry, is_watch) {
    var poss = possibleClaimableItems(question);
    //console.log('made poss for question', poss, question[Qi_question_id]);
    if (poss['total'].isZero()) {
        delete user_claimable[question[Qi_question_id]];
    } else {
        user_claimable[question[Qi_question_id]] = poss;
    }
    return true; // TODO: Make this only return true if it changed something
}

function updateClaimableDisplay() {
    var unclaimed = mergePossibleClaimable(user_claimable, false);
    //console.log('updateClaimableDisplay with user_claimable, unclaimed', user_claimable, unclaimed);
    var claiming = mergePossibleClaimable(user_claimable, true);
    if (claiming.total.gt(0)) {
        var txids = claiming.txids;
        $('.answer-claiming-container').find('.claimable-eth').text(web3js.fromWei(claiming.total.toNumber(), 'ether'));
        var txid = txids.join(', '); // TODO: Handle multiple links properly
        $('.answer-claiming-container').find('a.txid').attr('href', block_explorer + '/tx/' + txid);
        $('.answer-claiming-container').find('a.txid').text(txid.substr(0, 12) + "...");
        $('.answer-claiming-container').show();
    } else {
        $('.answer-claiming-container').fadeOut();
    }

    rc.balanceOf.call(account).then(function(result) {
        var ttl = result.plus(unclaimed.total);
        if (ttl.gt(0)) {
            $('.answer-claim-button.claim-all').find('.claimable-eth').text(web3js.fromWei(ttl.toNumber(), 'ether'));
            $('.answer-claim-button.claim-all').show();
        } else {
            $('.answer-claim-button.claim-all').fadeOut();
        }
    });

}

function mergePossibleClaimable(posses, pending) {
    var combined = {
        'txids': [],
        'total': new BigNumber(0),
        'question_ids': [],
        'answer_lengths': [],
        'answers': [],
        'answerers': [],
        'bonds': [],
        'history_hashes': []
    }
    for (var qid in posses) {
        if (posses.hasOwnProperty(qid)) {
            if (!pending && posses[qid].txid) {
                continue;
            }
            if (pending && !posses[qid].txid) {
                continue;
            }
            combined['total'] = combined['total'].plus(posses[qid].total);
            combined['question_ids'].push(...posses[qid].question_ids);
            combined['answer_lengths'].push(...posses[qid].answer_lengths);
            combined['answers'].push(...posses[qid].answers);
            combined['answerers'].push(...posses[qid].answerers);
            combined['bonds'].push(...posses[qid].bonds);
            combined['history_hashes'].push(...posses[qid].history_hashes);
            if (posses[qid].txid) {
                if (combined['txids'].indexOf(posses[qid].txid) === -1) {
                    combined['txids'].push(posses[qid].txid);
                }
            }
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
            var update_time = (1000 + (question[Qi_finalization_ts].toNumber() * 1000) - new Date().getTime());
            //console.log('update_time is ', update_time);
            var timeout_id = setTimeout(function() {
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
                        web3js.eth.getBlock('latest', function(err, result) {
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
                            if (updateClaimableDataForQuestion(question, fake_entry, true)) {
                                updateClaimableDisplay();
                                updateUserBalanceDisplay();
                            }

                            renderNotifications(question, fake_entry);
                        });
                    }

                });

            }, update_time);
            question_event_times[question_id] = {
                'finalization_ts': question[Qi_finalization_ts],
                'timeout_id': timeout_id
            };
        }
    } else {
        //console.log('scheduling not doing: ', isFinalized(question), isAnswered(question));
    }

}

function isAnythingUnrevealed(question) {
    console.log('isAnythingUnrevealed pretending everything is revealed');
    return false;
}

function _ensureAnswerRevealsFetched(question_id, freshness, start_block, question) {
    var called_block = current_block_number;
    var earliest_block = 0;
    var bond_indexes = {};
    for (var i=0; i<question['history'].length; i++) {
        if (question['history'][i].args['is_commitment']) {
            if (!question['history'][i].args['revealed_block']) {
                var bond = question['history'][i].args['bond'].toString(16);
                console.log('_ensureAnswerRevealsFetched found commitment, block', earliest_block, 'bond', bond);
                bond_indexes[bond] = i;
                if (earliest_block == 0 || earliest_block > question['history'][i].blockNumber) {
                    earliest_block = question['history'][i].blockNumber;
                }
            }
        }
    }
    // console.log('earliest_block', earliest_block);
    if (earliest_block > 0) {
        return new Promise((resolve, reject)=>{
            var reveal_logs = rc.LogAnswerReveal({question_id:question_id}, {fromBlock: earliest_block, toBlock:'latest'});
            reveal_logs.get(function(error, answer_arr) {
                if (error) {
                    console.log('error in get reveal_logs');
                    reject(error);
                } else {
                    console.log('got reveals');
                    for(var j=0; j<answer_arr.length; j++) {
                        var bond = answer_arr[j].args['bond'].toString(16);
                        var idx = bond_indexes[bond];
                        // console.log(question_id, bond.toString(16), 'update answer, before->after:', question['history'][idx].answer, answer_arr[j].args['answer']);
                        question['history'][idx].args['revealed_block'] = answer_arr[j].blockNumber;
                        question['history'][idx].args['answer'] = answer_arr[j].args['answer'];

                        var commitment_id = rc_question.commitmentID(question_id, answer_arr[j].args['answer_hash'], bond);
                        question['history'][idx].args['commitment_id'] = commitment_id;
                        delete bond_indexes[bond];
                    }
                    question_detail_list[question_id] = question; // TODO : use filledQuestionDetail here? 
                    //console.log('populated question, result is', question);
                    //console.log('bond_indexes once done', bond_indexes);
                    resolve(question);
                }
            });
        });
    } else {
        return new Promise((resolve, reject)=>{
            resolve(question);
        });
    }
}





function filledQuestionDetail(question_id, data_type, freshness, data) {

    if (!question_id) {
        console.log(question_id, data_type, freshness, data);
        throw Error("filledQuestionDetail called without question_id, wtf")
    }

    // Freshness should look like this:
    // {question_log: 0, question_call: 12345, answers: -1}

    // Data should look like this:
    // {question_log: {}, question_call: {}, answers: []} )

    // TODO: Maybe also need detected_last_changes for when we know data will change, but don't want to fetch it unless we need it

    var question = {
        'freshness': {
            'question_log': -1,
            'question_json': -1,
            'question_call': -1,
            'answers': -1
        },
        'history': [],
        'history_unconfirmed': []
    };
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
                question[Qi_content_hash] = data.args['content_hash'];
                question[Qi_question_text] = data.args['question'];
                question[Qi_template_id] = data.args['template_id'].toNumber();
                question[Qi_block_mined] = data.blockNumber;
                question[Qi_opening_ts] = data.args['opening_ts'];
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
                question[Qi_finalization_ts] = data[Qi_finalization_ts - 1];
                question[Qi_is_pending_arbitration] = data[Qi_is_pending_arbitration - 1];
                question[Qi_arbitrator] = data[Qi_arbitrator - 1];
                question[Qi_timeout] = data[Qi_timeout - 1];
                question[Qi_content_hash] = data[Qi_content_hash - 1];
                question[Qi_bounty] = data[Qi_bounty - 1];
                question[Qi_best_answer] = data[Qi_best_answer - 1];
                question[Qi_bond] = data[Qi_bond - 1];
                question[Qi_history_hash] = data[Qi_history_hash - 1];
                //console.log('set question', question_id, question);
            } else {
                //console.log('call data too old, not setting', freshness, ' vs ', question.freshness.question_call, question)
            }
            break;

        case 'answers':
            if (data && (freshness >= question.freshness.answers)) {
                question.freshness.answers = freshness;
                question['history'] = data;
            }
            if (data.length && question['history_unconfirmed'].length) {
                for (var j = 0; j < question['history_unconfirmed'].length; j++) {
                    var ubond = question['history_unconfirmed'][j].args.bond;
                    for (var i = 0; i < question['history'].length; i++) {
                        // If there's something unconfirmed with an equal or lower bond, remove it
                        if (data[i].args.bond.gte(ubond)) {
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
            for (var i = 0; i < question['history'].length; i++) {
                //console.log('already have a higher bond, removing');
                // If there's something confirmed with an equal or higher bond, ignore the unconfirmed one
                if (question['history'][i].args.bond.gte(data.args.bond)) {
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
    return new Promise((resolve, reject) => {
        if (isDataFreshEnough(question_id, 'question_log', freshness)) {
            resolve(question_detail_list[question_id]);
        } else {
            var question_logs = rc.LogNewQuestion({
                question_id: question_id
            }, {
                fromBlock: START_BLOCK,
                toBlock: 'latest'
            });
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
    return new Promise((resolve, reject) => {
        if (isDataFreshEnough(question_id, 'question_call', freshness)) {
            resolve(question_detail_list[question_id]);
        } else {
            rc.questions.call(question_id).then(function(result) {
                var question = filledQuestionDetail(question_id, 'question_call', called_block, result);
                resolve(question);
            }).catch(function(err) {
                console.log('error in data');
                reject(err);
            });
        }
    });
}

function _ensureQuestionTemplateFetched(question_id, template_id, qtext, freshness) {
    //console.log('ensureQuestionDetailFetched', template_id, template_content[template_id], qtext);
    return new Promise((resolve, reject) => {
        if (isDataFreshEnough(question_id, 'question_json', freshness)) {
            resolve(question_detail_list[question_id]);
        } else {
            if (template_content[template_id]) {
                var question = filledQuestionDetail(question_id, 'question_json', 1, rc_question.populatedJSONForTemplate(template_content[template_id], qtext));
                resolve(question);
            } else {
                // The category text should be in the log, but the contract has the block number
                // This allows us to make a more efficient pin-point log call for the template content
                rc.templates.call(template_id)
                    .then(function(block_num) {
                        var cat_logs = rc.LogNewTemplate({
                            template_id: template_id
                        }, {
                            fromBlock: block_num,
                            toBlock: block_num
                        });
                        cat_logs.get(function(error, cat_arr) {
                            if (cat_arr.length == 1) {
                                //console.log('adding template content', cat_arr, 'template_id', template_id);
                                template_content[template_id] = cat_arr[0].args.question_text;
                                //console.log(template_content);
                                var question = filledQuestionDetail(question_id, 'question_json', 1, rc_question.populatedJSONForTemplate(template_content[template_id], qtext));
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

function _ensureAnswersFetched(question_id, freshness, start_block, injected_data) {
    var called_block = current_block_number;
    return new Promise((resolve, reject) => {
        if (isDataFreshEnough(question_id, 'answers', freshness)) {
            resolve(question_detail_list[question_id]);
        } else {
            //console.log('fetching answers from start_block', start_block);
            var answer_logs = rc.LogNewAnswer({
                question_id: question_id
            }, {
                fromBlock: start_block,
                toBlock: 'latest'
            });
            answer_logs.get(function(error, answer_arr) {
                if (error) {
                    console.log('error in get');
                    reject(error);
                } else {
                    // In theory this should get us everything but sometimes it seems to lag
                    // If this is triggered by an event, and the get didn't return the event, add it to the list ourselves
                    var done_txhashes = {};
                    if (injected_data && injected_data['answers'] && injected_data['answers'].length) {
                        var inj_ans_arr = injected_data['answers'];
                        for (var i=0; i<inj_ans_arr.length; i++ ) {
                            var inj_ans = inj_ans_arr[i];
                            for (var j=0; j<answer_arr.length; j++ ) {
                                var ans = answer_arr[j];
                                if (ans.args.bond.equals(inj_ans.args.bond)) {
                                    if (ans.transactionHash != inj_ans.transactionHash) {
                                        // Replaced by a new entry, old one got orphaned
                                        answer_arr[j] = inj_ans_arr[i];
                                    }
                                }
                                done_txhashes[answer_arr[j].transactionHash] = true;
                            }
                            if (!done_txhashes[inj_ans.transactionHash]) {
                                answer_arr.push(inj_ans);
                            }
                        }
                    }
                    var question = filledQuestionDetail(question_id, 'answers', called_block, answer_arr);
                    _ensureAnswerRevealsFetched(question_id, freshness, start_block, question).then(function(q){
                        resolve(q);
                    });
                }
            });
        }
    });
}

// question_log is optional, pass it in when we already have it
function ensureQuestionDetailFetched(question_id, ql, qi, qc, al, injected_data) {

    var params = {};
    if (ql == undefined) ql = 1;
    if (qi == undefined) qi = 1;
    if (qc == undefined) qc = current_block_number;
    if (al == undefined) al = current_block_number;

    if (!question_id) {
        throw new Error('no questin_id, wtf');
    }

    var called_block = current_block_number;
    //console.log('ensureQuestionDetailFetched with called_block', called_block);
    return new Promise((resolve, reject) => {
        _ensureQuestionLogFetched(question_id, ql).then(function(q) {
            return _ensureQuestionDataFetched(question_id, qc);
        }).then(function(q) {
            return _ensureQuestionTemplateFetched(question_id, q[Qi_template_id], q[Qi_question_text], qi);
        }).then(function(q) {
            return _ensureAnswersFetched(question_id, al, q[Qi_question_created_block], injected_data);
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
    // console.log('updating balacne for', account);
    web3js.eth.getBalance(account, function(error, result) {
        // console.log('got updated balacne for', account, result.toNumber());
        if (error === null) {
            $('.account-balance').text(web3js.fromWei(result.toNumber(), 'ether'));
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

    var section = $('#' + section_name);

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
    if (web3js.fromWei(question_data[Qi_bounty], 'ether') < 0.01) {
        balloon_html += 'The reward is very low.<br /><br />This means there may not be enough incentive to enter the correct answer and back it up with a bond.<br /><br />';
    }
    let arbitrator_addrs = $('#arbitrator').children();
    let valid_arbirator = isArbitratorValidFast(question_data[Qi_arbitrator]);
    if (!valid_arbirator) {
        balloon_html += 'This arbitrator is unknown.';
    }
    if (balloon_html) {
        $('div[data-question-id=' + question_id + ']').find('.question-setting-warning').css('display', 'block');
        $('div[data-question-id=' + question_id + ']').find('.question-setting-warning').css('z-index', 5);
        $('div[data-question-id=' + question_id + ']').find('.question-setting-warning').find('.balloon').html(balloon_html);
    }

}

function updateSectionEntryDisplay(question) {
    $('div.questions__item[data-question-id="' + question[Qi_question_id] + '"]').each(function() {
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
    var bounty = web3js.fromWei(question_data[Qi_bounty], 'ether');
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

    entry.find('.question-title').text(question_json['title']).expander({
        expandText: '',
        slicePoint: 140
    });
    entry.find('.question-bounty').text(bounty);

    // For these purposes we just ignore any outstanding commits
    if (isAnswered(question_data)) {
        entry.find('.questions__item__answer').text(rc_question.getAnswerString(question_json, best_answer));
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
            entry.find('.closing-time-label .timeago').attr('datetime', rc_question.convertTsToString(question_data[Qi_finalization_ts]));
            timeAgo.render(entry.find('.closing-time-label .timeago'));
        } else {
            entry.find('.created-time-label .timeago').attr('datetime', rc_question.convertTsToString(question_data[Qi_creation_ts]));
            timeAgo.render(entry.find('.created-time-label .timeago'));
        }
    }

    return entry;

}

function depopulateSection(section_name, question_id) {
    //console.log('depopulating', section_name, question_id);

    var question_item_id = section_name + '-question-' + question_id;
    var section = $('#' + section_name);

    var item = section.find('#' + question_item_id);
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
                populateSection('questions-resolved', question_data, insert_before);
                $('#questions-resolved').find('.scanning-questions-category').css('display', 'none');
                if (display_entries['questions-resolved']['ids'].length > 3 && $('#questions-resolved').find('.loadmore-button').css('display') == 'none') {
                    $('#questions-resolved').find('.loadmore-button').css('display', 'block');
                }
            }

        } else {
            var insert_before = update_ranking_data('questions-latest', question_id, created, 'desc');
            if (insert_before !== -1) {
                populateSection('questions-latest', question_data, insert_before);
                $('#questions-latest').find('.scanning-questions-category').css('display', 'none');
                if (display_entries['questions-latest']['ids'].length > 3 && $('#questions-latest').find('.loadmore-button').css('display') == 'none') {
                    $('#questions-latest').find('.loadmore-button').css('display', 'block');
                }
            }

            var insert_before = update_ranking_data('questions-high-reward', question_id, bounty, 'desc');
            if (insert_before !== -1) {
                populateSection('questions-high-reward', question_data, insert_before);
                $('#questions-high-reward').find('.scanning-questions-category').css('display', 'none');
                if (display_entries['questions-high-reward']['ids'].length > 3 && $('#questions-high-reward').find('.loadmore-button').css('display') == 'none') {
                    $('#questions-high-reward').find('.loadmore-button').css('display', 'block');
                }
            }

            if (isAnswered(question_data)) {
                var insert_before = update_ranking_data('questions-closing-soon', question_id, question_data[Qi_finalization_ts], 'asc');
                if (insert_before !== -1) {
                    populateSection('questions-closing-soon', question_data, insert_before);
                    $('#questions-closing-soon').find('.scanning-questions-category').css('display', 'none');
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
        var last_entry = arr[arr.length - 1];
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
    $(document).on('change', '.question-type', function(e) {
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
        Ps.update(win.find('.rcbrowser-inner').get(0));
    });

    $(document).on('click', '.add-option-button', function(e) {
        var win = $(this).closest('.rcbrowser');
        var element = $('<div>');
        element.addClass('input-container input-container--answer-option');
        var input = '<input type="text" name="editOption0" class="rcbrowser-input answer-option form-item" placeholder="Enter an answer...">';
        element.append(input);
        win.find('.error-container--answer-option').before(element);
        element.addClass('is-bounce');
        Ps.update(win.find('.rcbrowser-inner').get(0));
    });
})();

$(document).on('click', '.questions__item__title', function(e) {
    if ($(e.target).hasClass('more-link') || $(e.target).hasClass('less-link')) {
        return true;
    }

    e.preventDefault();
    e.stopPropagation();

    var question_id = $(this).closest('.questions__item').attr('data-question-id');

    // Should repopulate and bring to the front if already open
    openQuestionWindow(question_id);

});

$(document).on('click', '.your-qa__questions__item', function(e) {
    if ($(e.target).hasClass('more-link') || $(e.target).hasClass('less-link')) {
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

function updateQuestionWindowIfOpen(question) {

    var question_id = question[Qi_question_id];
    var window_id = 'qadetail-' + question_id;
    var rcqa = $('#' + window_id);
    if (rcqa.length) {
        rcqa = populateQuestionWindow(rcqa, question, true);
    }

}

function displayQuestionDetail(question_detail) {

    var question_id = question_detail[Qi_question_id];
    //console.log('question_id', question_id);

    // If already open, refresh and bring to the front
    var window_id = 'qadetail-' + question_id;
    var rcqa = $('#' + window_id);
    if (rcqa.length) {
        rcqa = populateQuestionWindow(rcqa, question_detail, true);
        rcqa.css('z-index', ++zindex);
    } else {
        rcqa = $('.rcbrowser--qa-detail.template-item').clone();
        rcqa.attr('id', window_id);
        rcqa.attr('data-question-id', question_id);

        rcqa.find('.rcbrowser__close-button').on('click', function() {
            let parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
            let left = parseInt(parent_div.css('left').replace('px', ''));
            let top = parseInt(parent_div.css('top').replace('px', ''));
            let data_x = (parseInt(parent_div.attr('data-x')) || 0);
            let data_y = (parseInt(parent_div.attr('data-y')) || 0);
            left += data_x;
            top += data_y;
            window_position[question_id] = {
                'x': left,
                'y': top
            };
            rcqa.remove();
            document.documentElement.style.cursor = ""; // Work around Interact draggable bug
        });

        rcqa.removeClass('template-item');

        rcqa = populateQuestionWindow(rcqa, question_detail, false);

        $('#qa-detail-container').append(rcqa);

        rcqa.css('display', 'block');
        rcqa.addClass('is-open');
        rcqa.css('z-index', ++zindex);
        rcqa.css('height', "80%");
        rcqa.css('max-height', "80%");
        setRcBrowserPosition(rcqa);
        Ps.initialize(rcqa.find('.rcbrowser-inner').get(0));
    }

    if (rcqa.find('[name="input-answer"]').hasClass('rcbrowser-input--date--answer')) {
        rcqa.find('[name="input-answer"]').datepicker({
            dateFormat: 'yy-mm-dd'
        });
    }
}

function populateQuestionWindow(rcqa, question_detail, is_refresh) {

    //console.log('populateQuestionWindow with detail ', question_detail);
    var question_id = question_detail[Qi_question_id];
    var question_json = question_detail[Qi_question_json];
    var question_type = question_json['type'];

    //console.log('current list last item in history, which is ', question_detail['history'])
    var idx = question_detail['history'].length - 1;

    let date = new Date();
    date.setTime(question_detail[Qi_creation_ts] * 1000);
    let date_str = monthList[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    rcqa.find('.rcbrowser-main-header-date').text(date_str);
    rcqa.find('.question-title').text(question_json['title']).expander({
        slicePoint: 200
    });
    rcqa.find('.reward-value').text(web3js.fromWei(question_detail[Qi_bounty], 'ether'));

    if (question_detail[Qi_block_mined] > 0) {
        rcqa.removeClass('unconfirmed-transaction').removeClass('has-warnings');
    }

    var bond = new BigNumber(web3js.toWei(0.0001, 'ether'));
    if (isAnswerActivityStarted(question_detail)) {

        var current_container = rcqa.find('.current-answer-container');

        if (isAnswered(question_detail)) {
            // label for show the current answer.
            var label = rc_question.getAnswerString(question_json, question_detail[Qi_best_answer]);
            current_container.find('.current-answer-body').find('.current-answer').text(label);
        }

        bond = question_detail[Qi_bond];

        if (question_detail['history'].length) {
            //console.log('updateing aunswer');
            var current_answer = historyItemForCurrentAnswer(question_detail);
            if (current_answer) {
                current_container.attr('id', 'answer-' + current_answer.answer);

                timeago.cancel(current_container.find('.current-answer-item').find('.timeago')); // cancel the old timeago timer if there is one
                current_container.find('.current-answer-item').find('.timeago').attr('datetime', rc_question.convertTsToString(current_answer.ts));
                timeAgo.render(current_container.find('.current-answer-item').find('.timeago'));

                // answerer data
                var ans_data = rcqa.find('.current-answer-container').find('.answer-data');
                ans_data.find('.answerer').text(current_answer.user);
                var avjazzicon = jazzicon(32, parseInt(current_answer.user.toLowerCase().slice(2, 10), 16));
                ans_data.find('.answer-data__avatar').html(avjazzicon);
                if (current_answer.user == account) {
                    ans_data.addClass('current-account');
                } else {
                    ans_data.removeClass('current-account');
                }
                ans_data.find('.answer-bond-value').text(web3js.fromWei(current_answer.bond.toNumber(), 'ether'));
            }

            var last_ans = question_detail['history'][idx].args;
            var unrevealed_answer_container = rcqa.find('.unrevealed-top-answer-container');
            if (last_ans.is_commitment && !last_ans.revealed_block) {
                unrevealed_answer_container.find('.answer-bond-value').text(web3js.fromWei(last_ans.bond.toNumber(), 'ether'));
                unrevealed_answer_container.find('.reveal-time.timeago').attr('datetime', rc_question.convertTsToString(commitExpiryTS(question_detail, last_ans['ts'])));
                timeAgo.render(unrevealed_answer_container.find('.reveal-time.timeago'));
                unrevealed_answer_container.find('.answerer').text(last_ans['user']);
                var avjazzicon = jazzicon(32, parseInt(last_ans['user'].toLowerCase().slice(2, 10), 16));
                unrevealed_answer_container.find('.answer-data__avatar').html(avjazzicon);
            } else {
                unrevealed_answer_container.find('.answer-bond-value').text('');
                unrevealed_answer_container.find('.reveal-time.timeago').attr('datetime', 0);
                unrevealed_answer_container.find('.answer-data__avatar').html('');
                unrevealed_answer_container.find('.answerer').text('');
                timeago.cancel(unrevealed_answer_container.find('.reveal-time.timeago')); 
            }

            // TODO: Do duplicate checks and ensure order in case stuff comes in weird
            for (var i = 0; i < idx; i++) {
                var ans = question_detail['history'][i].args;
                var hist_id = 'question-window-history-item-' + web3js.sha3(question_id + ans.answer + ans.bond.toString());
                if (rcqa.find('#' + hist_id).length) {
                    //console.log('already in list, skipping', hist_id, ans);
                    continue;
                }
                //console.log('not already in list, adding', hist_id, ans);
                var hist_tmpl = rcqa.find('.answer-item.answered-history-item.template-item');
                var hist_item = hist_tmpl.clone();
                hist_item.attr('id', hist_id);
                hist_item.find('.answerer').text(ans['user']);

                var avjazzicon = jazzicon(32, parseInt(ans['user'].toLowerCase().slice(2, 10), 16));

                hist_item.find('.answer-data__avatar').html(avjazzicon);

console.log(ans);
                if (ans.is_commitment && !ans.revealed_block) {
                    console.log('got a commitmet');
                    if (isCommitExpired(question_detail, ans['ts'].toNumber())) {
                        hist_item.find('.current-answer').text('Reveal timed out');
                        hist_item.addClass('expired-commit');
                    } else {
                        hist_item.find('.current-answer').text('Wait for reveal...');
                        hist_item.addClass('unrevealed-commit');
                    }
                } else {
                    hist_item.find('.current-answer').text(rc_question.getAnswerString(question_json, ans.answer));
                    hist_item.removeClass('unrevealed-commit');
                }

                hist_item.find('.answer-bond-value').text(web3js.fromWei(ans.bond.toNumber(), 'ether'));
                hist_item.find('.answer-time.timeago').attr('datetime', rc_question.convertTsToString(ans['ts']));
                timeAgo.render(hist_item.find('.answer-time.timeago'));
                hist_item.removeClass('template-item');
                hist_tmpl.after(hist_item);
            }

        }
    }

    rcqa.find('.bond-value').text(web3js.fromWei(question_detail[Qi_bond], 'ether'));
    // Set the dispute value on a slight delay
    // This ensures the latest entry was updated and the user had time to see it when arbitration was requested
    window.setTimeout(function() {
        rcqa.find('.arbitration-button').attr('data-last-seen-bond', '0x' + question_detail[Qi_bond].toString(16));
    }, 2000);

    // question settings warning balloon
    let balloon_html = '';
    if (question_detail[Qi_timeout] < 86400) {
        balloon_html += 'The timeout is very low.<br /><br />This means there may not be enough time for people to correct mistakes or lies.<br /><br />';
    }
    if (web3js.fromWei(question_detail[Qi_bounty], 'ether') < 0.01) {
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
    var balloon = rcqa.find('.question-setting-info').find('.balloon')
    balloon.find('.setting-info-bounty').text(web3js.fromWei(question_detail[Qi_bounty], 'ether'));
    balloon.find('.setting-info-bond').text(web3js.fromWei(question_detail[Qi_bond], 'ether'));
    balloon.find('.setting-info-timeout').text(rc_question.secondsTodHms(question_detail[Qi_timeout]));
    balloon.find('.setting-info-content-hash').text(question_detail[Qi_content_hash]);
    balloon.find('.setting-info-question-id').text(question_detail[Qi_question_id]);
    balloon.find('.setting-info-arbitrator').text(question_detail[Qi_arbitrator]);
    balloon.find('.setting-info-questioner').text(questioner);
    balloon.css('z-index', ++zindex);

    var unconfirmed_container = rcqa.find('.unconfirmed-answer-container');
    if (question_detail['history_unconfirmed'].length) {

        var unconfirmed_answer = question_detail['history_unconfirmed'][question_detail['history_unconfirmed'].length - 1].args;

        var txid = question_detail['history_unconfirmed'][question_detail['history_unconfirmed'].length - 1].txid;
        unconfirmed_container.find('.pending-answer-txid a').attr('href', block_explorer + '/tx/' + txid);
        unconfirmed_container.find('.pending-answer-txid a').text(txid.substr(0, 12) + "...");
        unconfirmed_container.attr('data-pending-txid', txid);

        timeago.cancel(unconfirmed_container.find('.unconfirmed-answer-item').find('.timeago')); // cancel the old timeago timer if there is one
        unconfirmed_container.find('.unconfirmed-answer-item').find('.timeago').attr('datetime', rc_question.convertTsToString(unconfirmed_answer.ts));
        timeAgo.render(unconfirmed_container.find('.unconfirmed-answer-item').find('.timeago'));

        // answerer data
        var ans_data = rcqa.find('.unconfirmed-answer-container').find('.answer-data');
        ans_data.find('.answerer').text(unconfirmed_answer.user);
        var avjazzicon = jazzicon(32, parseInt(unconfirmed_answer.user.toLowerCase().slice(2, 10), 16));
        ans_data.find('.answer-data__avatar').html(avjazzicon);
        if (unconfirmed_answer.user == account) {
            ans_data.addClass('unconfirmed-account');
        } else {
            ans_data.removeClass('unconfirmed-account');
        }
        ans_data.find('.answer-bond-value').text(web3js.fromWei(unconfirmed_answer.bond.toNumber(), 'ether'));

        // label for show the unconfirmed answer.
        var label = rc_question.getAnswerString(question_json, unconfirmed_answer.answer);
        unconfirmed_container.find('.unconfirmed-answer-body').find('.unconfirmed-answer').text(label);

        rcqa.addClass('has-unconfirmed-answer');

    } else {

        rcqa.removeClass('has-unconfirmed-answer');

    }

    // Arbitrator
    if (!isArbitrationPending(question_detail) && !isFinalized(question_detail)) {
        Arbitrator.at(question_detail[Qi_arbitrator]).then(function(arb) {
            return arb.getDisputeFee.call(question_id);
        }).then(function(fee) {
            //rcqa.find('.arbitrator').text(question_detail[Qi_arbitrator]);
            rcqa.find('.arbitration-fee').text(web3js.fromWei(fee.toNumber(), 'ether'));
            rcqa.find('.arbitration-button').removeClass('unpopulated');
        });
    }

    if (!is_refresh) {
        // answer form
        var ans_frm = makeSelectAnswerInput(question_json, question_detail[Qi_opening_ts].toNumber());
        ans_frm.addClass('is-open');
        ans_frm.removeClass('template-item');
        rcqa.find('.answered-history-container').after(ans_frm);
    }

    // If the user has edited the field, never repopulate it underneath them
    var bond_field = rcqa.find('.rcbrowser-input--number--bond.form-item');
    if (!bond_field.hasClass('edited')) {
        bond_field.val(web3js.fromWei(bond.toNumber(), 'ether') * 2);
    }

    //console.log('call updateQuestionState');
    rcqa = updateQuestionState(question_detail, rcqa);

    if (isFinalized(question_detail)) {
        var tot = totalClaimable(question_detail);
        if (tot.toNumber() == 0) {
            rcqa.removeClass('is-claimable');
        } else {
            rcqa.addClass('is-claimable');
            rcqa.find('.answer-claim-button .claimable-eth').text(web3js.fromWei(tot.toNumber(), 'ether'));
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

/*
If you get anything from the list, return the whole thing
*/
function possibleClaimableItems(question_detail) {

    var ttl = new BigNumber(0);
    var is_your_claim = false;

    if (new BigNumber(question_detail[Qi_history_hash]).equals(0)) {
        //console.log('everything already claimed', question_detail[Qi_history_hash]);
        return {
            total: new BigNumber(0)
        };
    }

    if (!isFinalized(question_detail)) {
        //console.log('not finalized', question_detail);
        return {
            total: new BigNumber(0)
        };
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
    for (var i = question_detail['history'].length - 1; i >= 0; i--) {

        // TODO: Check the history hash, and if we haven't reached it, keep going until we do
        // ...since someone may have claimed partway through

        var answer;
        // Only set on reveal, otherwise the answer field still holds the commitment ID for commitments
        if (question_detail['history'][i].args.commitment_id) { 
            answer = question_detail['history'][i].args.commitment_id;
        } else {
            answer = question_detail['history'][i].args.answer;
        }
        var answerer = question_detail['history'][i].args.user;
        var bond = question_detail['history'][i].args.bond;
        var history_hash = question_detail['history'][i].args.history_hash;

        if (is_yours) {
            // Somebody takes over your answer
            if (answerer != account && final_answer == answer) {
                is_yours = false;
                //console.log(ttl.toString(), 'minus', bond.toString());
                ttl = ttl.minus(bond); // pay them their bond
            } else {
                //console.log(ttl.toString(), 'plus', bond.toString());
                ttl = ttl.plus(bond); // take their bond
            }
        } else {
            // You take over someone else's answer
            if (answerer == account && final_answer == answer) {
                is_yours = true;
                //console.log(ttl.toString(), 'plus', bond.toString());
                ttl = ttl.plus(bond); // your bond back
            }
        }
        if (is_first && is_yours) {
            //console.log('adding your bounty');
            //console.log(ttl.toString(), 'plus', question_detail[Qi_bounty].toString());
            ttl = ttl.plus(question_detail[Qi_bounty]);
        }

        claimable_bonds.push(bond);
        claimable_answers.push(answer);
        claimable_answerers.push(answerer);
        claimable_history_hashes.push(history_hash);

        is_first = false;
    }

    // Nothing for you to claim, so return nothing
    if (!ttl.gt(0)) {
        return {
            total: new BigNumber(0)
        };
    }

    question_ids.push(question_detail[Qi_question_id]);
    answer_lengths.push(claimable_bonds.length);

    //console.log('item 0 should match question_data', claimable_history_hashes[0], question_detail[Qi_history_hash]);

    // For the history hash, each time we need to provide the previous hash in the history
    // So delete the first item, and add 0x0 to the end.
    claimable_history_hashes.shift();
    claimable_history_hashes.push(0x0);

    // TODO: Someone may have claimed partway, so we should really be checking against the contract state

    return {
        'txid': null,
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
    i.find('.timeago').attr('datetime', rc_question.convertTsToString(ts));
    timeAgo.render(i.find('.timeago'));
}

// Anything in the document with this class gets updated
// For when there's a single thing changed, and it's not worth doing a full refresh
function updateAnyDisplay(question_id, txt, cls) {
    $("[data-question-id='" + question_id + "']").find('.' + cls).text(txt);
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
        web3js.eth.getBlock(num, function(err, result) {
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
    for (var i = 0; i < answer_logs.length; i++) {
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

function resetAccountUI() {
    user_claimable = {};
    q_min_activity_blocks = {};
    $('#your-question-answer-window').find('.account-specific').remove();
    $('.answer-claim-button.claim-all').find('.claimable-eth').text('');
    $('.answer-claim-button.claim-all').hide();

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
    item_to_insert.addClass('account-specific');

    // Template item has a positive badge
    // Turn it from green to red if something bad happened
    if (!is_positive) {
        item_to_insert.find('.notification-badge').removeClass('notification-badge--positive').addClass('notification-badge--negative');
    }

    var inserted = false;
    existing_notification_items.each(function() {
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
            var notification_id = web3js.sha3('LogNewQuestion' + entry.args.question_text + entry.args.arbitrator + entry.args.timeout.toString());
            ntext = 'You asked a question - "' + question_json['title'] + '"';
            insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true);
            break;

        case 'LogNewAnswer':
            var is_positive = true;
            var notification_id = web3js.sha3('LogNewAnswer' + entry.args.question_id + entry.args.user + entry.args.bond.toString());
            if (entry.args.user == account) {
                if (entry.args.is_commitment) {
                    ntext = 'You committed to answering a question - "' + question_json['title'] + '"';
                } else {
                    ntext = 'You answered a question - "' + question_json['title'] + '"';
                }
                insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true);
            } else {
                var answered_question = rc.LogNewQuestion({
                    question_id: question_id
                }, {
                    fromBlock: START_BLOCK,
                    toBlock: 'latest'
                });
                answered_question.get(function(error, result2) {
                    if (error === null && typeof result2 !== 'undefined') {
                        if (result2[0].args.user == account) {
                            ntext = 'Someone answered your question';
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

        case 'LogAnswerReveal':
            var is_positive = true;
            var notification_id = web3.sha3('LogAnswerReveal' + entry.args.question_id + entry.args.user + entry.args.bond.toString());
            if (entry.args.user == account) {
                ntext = 'You revealed an answer to a question - "' + question_json['title'] + '"';
                insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true);
            } else {
                var answered_question = rc.LogNewQuestion({question_id: question_id}, {
                    fromBlock: START_BLOCK,
                    toBlock: 'latest'
                });
                answered_question.get(function (error, result2) {
                    if (error === null && typeof result2 !== 'undefined') {
                        if (result2[0].args.user == account) {
                            ntext = 'Someone revealed their answer to your question';
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
            var notification_id = web3js.sha3('LogFundAnswerBounty' + entry.args.question_id + entry.args.bounty.toString() + entry.args.bounty_added.toString() + entry.args.user);
            if (entry.args.user == account) {
                ntext = 'You added reward - "' + question_json['title'] + '"';
                insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true);
            } else {
                var funded_question = rc.LogNewQuestion({
                    question_id: question_id
                }, {
                    fromBlock: START_BLOCK,
                    toBlock: 'latest'
                });
                // TODO: Should this really always be index 0?
                funded_question.get(function(error, result2) {
                    if (error === null && typeof result2 !== 'undefined') {
                        if (result2[0].args.user == account) {
                            ntext = 'Someone added reward to your question';
                        } else {
                            var prev_hist_idx = qdata['history'].length - 2;
                            if ((prev_hist_idx >= 0) && (qdata['history'][prev_hist_idx].args.user == account)) {
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
            var notification_id = web3js.sha3('LogNotifyOfArbitrationRequest' + entry.args.question_id);
            var is_positive = true;
            if (entry.args.user == account) {
                ntext = 'You requested arbitration - "' + question_json['title'] + '"';
                insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, entry.args.question_id, true);
            } else {
                var arbitration_requested_question = rc.LogNewQuestion({
                    question_id: question_id
                }, {
                    fromBlock: START_BLOCK,
                    toBlock: 'latest'
                });
                arbitration_requested_question.get(function(error, result2) {
                    if (error === null && typeof result2 !== 'undefined') {
                        var history_idx = qdata['history'].length - 2;
                        if (result2[0].args.user == account) {
                            ntext = 'Someone requested arbitration to your question';
                        } else {
                            if ((history_idx >= 0) && (qdata['history'][history_idx].args.user == account)) {
                                ntext = 'Someone requested arbitration to the question you answered';
                                is_positive = false;
                            } else {
                                ntext = 'Someone requested arbitration to the question';
                            }
                        }
                    }
                });
            }
            break;

        case 'LogFinalize':
            //console.log('in LogFinalize', entry);
            var notification_id = web3js.sha3('LogFinalize' + entry.args.question_id + entry.args.answer);
            var finalized_question = rc.LogNewQuestion({
                question_id: question_id
            }, {
                fromBlock: START_BLOCK,
                toBlock: 'latest'
            });
            var timestamp = null;
            // Fake timestamp for our fake finalize event
            if (entry.timestamp) {
                timestamp = entry.timestamp;
            }
            //console.log('getting question_id', question_id)
            finalized_question.get(function(error, result2) {
                //console.log('gotquestion_id', question_id)
                if (error === null && typeof result2 !== 'undefined') {
                    if (result2[0].args.user == account) {
                        ntext = 'Your question is finalized';
                    } else if (qdata['history'] && qdata['history'][qdata['history'].length - 2].args.user == account) {
                        ntext = 'The question you answered is finalized';
                    } else {
                        ntext = 'A question was finalized';
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
    question_items.each(function(idx, item) {
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

    sections.forEach(function(section) {
        var target = section.find('div[data-question-id=' + question_id + ']');
        if (answer_history.length > 0) {
            let user_answer;
            for (let i = answer_history.length - 1; i >= 0; i--) {
                if (answer_history[i].args.user == account) {
                    user_answer = answer_history[i].args.answer;
                    break;
                }
            }
            let latest_answer = answer_history[answer_history.length - 1].args.answer;
            target.find('.latest-answer-text').text(rc_question.getAnswerString(question_json, latest_answer));
            if (typeof user_answer !== 'undefined') {
                target.find('.user-answer-text').text(rc_question.getAnswerString(question_json, user_answer));
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
    qitem.addClass('account-specific');
    insertQAItem(question_id, qitem, question_section, entry.blockNumber);

    var is_finalized = isFinalized(qdata);
    renderQAItemAnswer(question_id, answer_history, question_json, is_finalized);

    var updateBlockTimestamp = function(item, ts) {
        let date = new Date();
        date.setTime(ts * 1000);
        let date_str = monthList[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() +
            ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        item.find('.item-date').text(date_str);
    }
    populateWithBlockTimeForBlockNumber(qitem, entry.blockNumber, updateBlockTimestamp);
}

function makeSelectAnswerInput(question_json, opening_ts) {
    var type = question_json['type'];
    var options = question_json['outcomes'];

    var now = new Date();
    if (opening_ts && now.getTime() < opening_ts * 1000) {
        var template_name = '.answer-form-container.before-opening.template-item';
        var ans_frm = $(template_name).clone();
        ans_frm.removeClass('template-item');
        ans_frm.find('.opening-time-label .timeago').attr('datetime', rc_question.convertTsToString(opening_ts));
        timeAgo.render(ans_frm.find('.opening-time-label .timeago'));
    } else {
        var template_name = '.answer-form-container.' + question_json['type'] + '.template-item';
        var ans_frm = $(template_name).clone();
        ans_frm.removeClass('template-item');

        switch (type) {
            case 'single-select':
                for (var i = 0; i < options.length; i++) {
                    var option_elm = $('<option>');
                    option_elm.val(i);
                    option_elm.text(options[i]);
                    ans_frm.find('.select-answer').find('.invalid-select').before(option_elm);
                }
                break;
            case 'multiple-select':
                for (var i = options.length - 1; i >= 0; i--) {
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
                break;
        }
    }

    return ans_frm;
}

// show final answer button
// TODO: Pass in the current data from calling question if we have it to avoid the unnecessary call
function updateQuestionState(question, question_window) {
    if (isAnswered(question)) {
        question_window.addClass('has-answer');
    } else {
        question_window.removeClass('has-answer');
    }

    if (hasUnrevealedCommits(question)) {
        question_window.addClass('has-unrevealed-commits');
    } else {
        question_window.removeClass('has-unrevealed-commits');
    }

    if (isTopAnswerRevealable(question)) {
        question_window.addClass('top-entry-unrevealed');
    } else {
        question_window.removeClass('top-entry-unrevealed');
    }

    if (isAnsweredOrAnswerActive(question)) {
        if (isFinalized(question)) {
            timeago.cancel(question_window.find('.resolved-at-value.timeago'));
            question_window.find('.resolved-at-value').attr('datetime', rc_question.convertTsToString(question[Qi_finalization_ts]));
            timeAgo.render(question_window.find('.resolved-at-value.timeago')); // TODO: Does this work if we haven't displayed the item yet?
        } else {
            timeago.cancel(question_window.find('.answer-deadline.timeago'));
            question_window.find('.answer-deadline').attr('datetime', rc_question.convertTsToString(question[Qi_finalization_ts]));
            timeAgo.render(question_window.find('.answer-deadline.timeago')); // TODO: Does this work if we haven't displayed the item yet?
        }
    } 

    // The first item is the current answer
    // However we don't show it as current answer if it's unrevealed
    if (question['history'].length > 1 || (question['history'].length  == 1 && hasUnrevealedCommits(question) ) ) {
        question_window.addClass('has-history');
    } else {
        question_window.removeClass('has-history');
    }

    if (isArbitrationPending(question)) {
        question_window.removeClass('question-state-open').addClass('question-state-pending-arbitration').removeClass('question-state-finalized');
    } else {
        if (!isFinalized(question)) {
            question_window.addClass('question-state-open').removeClass('question-state-pending-arbitration').removeClass('question-state-finalized');
        } else {
            question_window.removeClass('question-state-open').removeClass('question-state-pending-arbitration').addClass('question-state-finalized');
        }
    }

    return question_window;

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

$(document).on('click', '.answer-item', function() {
    //console.log('.answer-item clicked');
    if ($(this).find('.answer-data').hasClass('is-bounce')) {
        $(this).find('.answer-data').removeClass('is-bounce');
        $(this).find('.answer-data').css('display', 'none');
    } else {
        $(this).find('.answer-data').addClass('is-bounce');
        $(this).find('.answer-data').css('display', 'block');
    }
});

function formattedAnswerFromForm(parent_div, question_json) {

    var new_answer;
    var answer_element = parent_div.find('[name="input-answer"]');

    // Selects will just have "invalid" as an option in the pull-down.
    // However, if there is no select we instead use a link underneath the input, and toggle the data-invalid-selected class on the input
    var has_invalid_selection = (answer_element.attr('data-invalid-selected') == '1');
    if (has_invalid_selection) {
        new_answer = rc_question.getInvalidValue(question_json);
        console.log('invalid selected, so submitting the invalid value ', new_answer);
        return new_answer;
    }

    if (question_json['type'] == 'multiple-select') {
        var answer_input = [];
        parent_div.find('.input-container--checkbox input[type=checkbox]').each(function() {
            if ($(this).closest('label').hasClass('template-item')) {
                return;
            }
            answer_input.push($(this).is(':checked'));
        });
        new_answer = rc_question.answerToBytes32(answer_input, question_json);
    } else if (question_json['type'] == 'datetime') {
        let answer_date = new Date(answer_element.val());
        new_answer = rc_question.answerToBytes32(answer_date.getTime() / 1000, question_json);
    } else {
        new_answer = rc_question.answerToBytes32(answer_element.val(), question_json);
    }
    console.log('submitting answer', new_answer);
    return new_answer;

}

// post an answer
$(document).on('click', '.post-answer-button', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var parent_div = $(this).parents('div.rcbrowser--qa-detail');
    getAccount().then(function() {

        var question_id = parent_div.attr('data-question-id');

        var bond = new BigNumber(0);
        var bond_field = parent_div.find('input[name="questionBond"]');
        try {
            bond  = web3js.toWei(new BigNumber(bond_field.val()), 'ether');
        } catch (err) {
            console.log('Could not parse bond field value', bond_field.val());
        }

        var question, current_answer, new_answer;
        var question_json;
        var current_question;
        var is_err = false;

        var block_before_send = current_block_number;
        var question_json;

        var new_answer;

        var question = ensureQuestionDetailFetched(question_id, 1, 1, 1, -1)
        .catch(function() {
            // If the question is unconfirmed, go with what we have
            console.log('caught failure, trying unconfirmed');
            return ensureQuestionDetailFetched(question_id, 0, 0, 0, -1)
        })
        .then(function(current_question) {
            //console.log('got current_question', current_question);

            // This may not be defined for an unconfirmed question
            if (current_question[Qi_bond] == null) {
                current_question[Qi_bond] = new BigNumber(0);
            }

            question_json = current_question[Qi_question_json];
            //console.log('got question_json', question_json);

            new_answer = formattedAnswerFromForm(parent_div, question_json);
            const invalid_value = rc_question.getInvalidValue(question_json);

            switch (question_json['type']) {
                case 'bool':
                    var ans = new BigNumber(new_answer);
                    if (ans.isNaN() || !(ans.equals(new BigNumber(0)) || ans.equals(new BigNumber(1)) || ans.equals(new BigNumber(invalid_value)))) {
                        parent_div.find('div.select-container.select-container--answer').addClass('is-error');
                        is_err = true;
                    }
                    break;
                case 'uint':
                    var ans = new BigNumber(new_answer);
                    var err = false;
                    if (ans.isNaN()) {
                        err = true;
                    } else if (!ans.equals(new BigNumber(invalid_value)) && (ans.lt(rc_question.minNumber(question_json)) || ans.gt(rc_question.maxNumber(question_json)))) {
                        err = true;
                    } else if (ans.lt(new BigNumber(0))) {
                        err = true;
                    }
                    if (err) {
                        parent_div.find('div.input-container.input-container--answer').addClass('is-error');
                        is_err = true;
                    }
                    break;
                case 'int':
                    var ans = new BigNumber(new_answer);
                    var err = false;
                    if (ans.isNaN()) {
                        err = true;
                    } else if (!ans.equals(new BigNumber(invalid_value)) && (ans.lt(rc_question.minNumber(question_json)) || ans.gt(rc_question.maxNumber(question_json)))) {
                        err = true;
                    }
                    if (err) {
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
                    if (!invalid_value && checked.length == 0) {
                        container.addClass('is-error');
                        is_err = true;
                    }
                    break;
            }

            var min_amount = current_question[Qi_bond] * 2;
            if (bond.lt(min_amount)) {
                parent_div.find('div.input-container.input-container--bond').addClass('is-error');
                parent_div.find('div.input-container.input-container--bond').find('.min-amount').text(web3js.fromWei(min_amount, 'ether'));
                is_err = true;
            }

            if (is_err) throw ('err on submitting answer');

            submitted_question_id_timestamp[question_id] = new Date().getTime();

            // Remove the edited note to allow the field to be automatically populated again
            bond_field.removeClass('edited'); 

            if (USE_COMMIT_REVEAL) {
                var answer_plaintext = new_answer;
                var nonce = nonceFromSeed(web3.sha3(question_id + answer_plaintext + bond));
                var answer_hash = rc_question.answerHash(answer_plaintext, nonce);

                console.log('answerHash for is ',rc_question.answerHash(answer_plaintext, nonce));

                console.log('made nonce', nonce);
                console.log('made answer plaintext', answer_plaintext);
                console.log('made bond', bond);
                console.log('made answer_hash', answer_hash);

                var commitment_id = rc_question.commitmentID(question_id, answer_hash, bond);
                console.log('resulting  commitment_id', commitment_id);

                // TODO: We wait for the txid here, as this is not expected to be the main UI pathway.
                // If USE_COMMIT_REVEAL becomes common, we should add a listener and do everything asychronously....
                return rc.submitAnswerCommitment(question_id, answer_hash, current_question[Qi_bond], account, {from:account, gas:200000, value:bond}).then( function(txid) {
                    console.log('got submitAnswerCommitment txid', txid);
                    return rc.submitAnswerReveal.sendTransaction(question_id, answer_plaintext, nonce, bond, {from:account, gas:200000});
                });
            } else {
                return rc.submitAnswer.sendTransaction(question_id, new_answer, current_question[Qi_bond], {
                    from: account,
                    gas: 200000,
                    value: bond
                });
            }
        }).then(function(txid) {
            clearForm(parent_div, question_json);
            var fake_history = {
                'args': {
                    'answer': new_answer,
                    'question_id': question_id,
                    'history_hash': null, // TODO Do we need this?
                    'user': account,
                    'bond': bond,
                    'ts': new BigNumber(parseInt(new Date().getTime() / 1000)),
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
            }).catch(function() {
                // Question may be unconfirmed, if so go with what we have
                ensureQuestionDetailFetched(question_id, 0, 0, 0, -1).then(function(question) {
                    updateQuestionWindowIfOpen(question);
                });
            });

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
$(document).on('click', '.add-reward-button', function(e) {
    var container = $(this).closest('.rcbrowser--qa-detail').find('.add-reward-container');
    container.addClass('is-open');
    container.addClass('is-bounce');
    container.css('display', 'block');
});

$(document).on('click', '.add-reward__close-button', function(e) {
    var container = $(this).closest('.rcbrowser--qa-detail').find('.add-reward-container');
    container.removeClass('is-open');
    container.removeClass('is-bounce');
    container.css('display', 'none');
});

$(document).on('click', '.notifications-item', function(e) {
    if ($(e.target).hasClass('more-link') || $(e.target).hasClass('less-link')) {
        return true;
    }
    //console.log('notifications-item clicked');
    e.preventDefault();
    e.stopPropagation();
    openQuestionWindow($(this).attr('data-question-id'));
});

$(document).on('click', '.rcbrowser-submit.rcbrowser-submit--add-reward', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var rcqa = $(this).closest('.rcbrowser--qa-detail');
    var question_id = rcqa.attr('data-question-id');
    var reward = $(this).parent('div').prev('div.input-container').find('input[name="question-reward"]').val();
    reward = web3js.toWei(new BigNumber(reward), 'ether');

    if (isNaN(reward) || reward <= 0) {
        $(this).parent('div').prev('div.input-container').addClass('is-error');
    } else {
        getAccount().then(function() {
            rc.fundAnswerBounty(question_id, {
                from: account,
                value: reward
            })
            .then(function(result) {
                //console.log('fund bounty', result);
                var container = rcqa.find('.add-reward-container');
                //console.log('removing open', container.length, container);
                container.removeClass('is-open');
                container.removeClass('is-bounce');
                container.css('display', 'none');
            });
        });
    }
});

/*-------------------------------------------------------------------------------------*/
// arbitration
$(document).on('click', '.arbitration-button', function(e) {
    e.preventDefault();
    e.stopPropagation();

    getAccount().then(function() {
        var question_id = $(this).closest('div.rcbrowser.rcbrowser--qa-detail').attr('data-question-id');
        var question_detail = question_detail_list[question_id];
        if (!question_detail) {
            console.log('Error, question detail not found');
            return false;
        }

        var last_seen_bond_hex = $(this).attr('data-last-seen-bond'); 
        if (!last_seen_bond_hex) {
            console.log('Error, last seen bond not populated, aborting arbitration request');
            return false;
        }

        var arbitration_fee;
        //if (!question_detail[Qi_is_arbitration_due]) {}
        var arbitrator;
        Arbitrator.at(question_detail[Qi_arbitrator]).then(function(arb) {
            arbitrator = arb;
            return arb.getDisputeFee.call(question_id);
        }).then(function(fee) {
            arbitration_fee = fee;
            //console.log('got fee', arbitration_fee.toString());
            arbitrator.requestArbitration(question_id, new BigNumber(last_seen_bond_hex, 16), {from:account, value: arbitration_fee})
            .then(function(result){
                console.log('arbitration is requested.', result);
            });

        });
    });
});

function show_bond_payments(ctrl) {
    var frm = ctrl.closest('div.rcbrowser--qa-detail')
    var question_id = frm.attr('data-question-id');
    //console.log('got question_id', question_id);
    ensureQuestionDetailFetched(question_id).then(function(question) {
        var question_json = question[Qi_question_json];
        var existing_answers = answersByMaxBond(question['history']);
        var payable = 0;
        var new_answer = formattedAnswerFromForm(frm, question_json);
        //console.log('new_answer', new_answer);
        //console.log('existing_answers', existing_answers);
        if (existing_answers[new_answer]) {
            payable = existing_answers[new_answer].args.bond;
            if (existing_answers[new_answer].args.user == account) {
                frm.addClass('has-your-answer').removeClass('has-someone-elses-answer');
                frm.find('.answer-credit-info .answer-payment-value').text(web3js.fromWei(payable, 'ether'))
            } else {
                frm.addClass('has-someone-elses-answer').removeClass('has-your-answer');
                frm.find('.answer-debit-info .answer-payment-value').text(web3js.fromWei(payable, 'ether'))
            }
            frm.attr('data-answer-payment-value', payable.toString());
        } else {
            frm.removeClass('has-your-answer').removeClass('has-someone-elses-answer');
            frm.find('.answer-payment-value').text('');
            frm.attr('data-answer-payment-value', '');
        }
    }).catch(function(e) {
        console.log('Could not fetch question, but continuing as it may be unconfirmed', question_id, e);
    });

}

$('.rcbrowser-textarea').on('keyup', function(e) {
    if ($(this).val() !== '') {
        $(this).closest('div').removeClass('is-error');
    }
});
$(document).on('keyup', '.rcbrowser-input.rcbrowser-input--number', function(e) {
    let value = new BigNumber(web3js.toWei($(this).val()));
    //console.log($(this));
    let bond_validation = function(ctrl){
        ctrl.addClass('edited');
        let question_id = ctrl.closest('.rcbrowser.rcbrowser--qa-detail').attr('data-question-id');
        let current_idx = question_detail_list[question_id]['history'].length - 1;
        let current_bond = new BigNumber(0);
        if (current_idx >= 0) {
            current_bond = question_detail_list[question_id]['history'][current_idx].args.bond;
        }

        if (ctrl.val() === '' || value.lt(current_bond.times(2))) {
            ctrl.parent().parent().addClass('is-error');
            let min_bond = current_bond.times(2);
            min_bond = web3js.fromWei(min_bond, 'ether');
            ctrl.parent('div').next('div').find('.min-amount').text(min_bond.toNumber());
        } else {
            ctrl.parent().parent().removeClass('is-error');
        }
        show_bond_payments(ctrl);
    }

    if ($(this).val() === '') {
        if ($(this).hasClass('rcbrowser-input--number--bond')) {
            bond_validation($(this));
        } else {
            $(this).parent().parent().addClass('is-error');
        }
    }

    if (($(this).closest('#post-a-question-window').length || $(this).hasClass('rcbrowser-input--number--answer'))
        && value.lt(0)) {
        $(this).parent().parent().addClass('is-error');
    } else if ($(this).hasClass('rcbrowser-input--add-reward') && value.lte(0)) {
        $(this).parent().parent().addClass('is-error');
    } else if ($(this).hasClass('rcbrowser-input--number--bond')) {
        bond_validation($(this));
    } else {
        $(this).parent().parent().removeClass('is-error');
    }
});

$(document).on('click', '.invalid-switch-container a.invalid-text-link', function(evt) {
    evt.stopPropagation();
    var inp = $(this).closest('.input-container').addClass('invalid-selected').find('input');
    inp.attr('readonly', true);
    inp.attr('data-old-placeholder', inp.attr('placeholder'));
    inp.attr('placeholder', 'Invalid');
    inp.attr('data-invalid-selected', '1'); // will be read in processing
});

$(document).on('click', '.invalid-switch-container a.valid-text-link', function(evt) {
    evt.stopPropagation();
    var inp = $(this).closest('.input-container').removeClass('invalid-selected').find('input');
    inp.attr('readonly', false);
    inp.attr('placeholder', inp.attr('data-old-placeholder'));
    inp.removeAttr('data-old-placeholder');
    inp.removeAttr('data-invalid-selected'); // will be read in processing
});


$(document).on('change', '#post-question-window .question-type,.step-delay,.arbitrator', function(e) {
    if ($(this).prop('selectedIndex') != 0) {
        $(this).parent().removeClass('is-error');
    }
});
$(document).on('change', 'select[name="input-answer"]', function(e) {
    if ($(this).prop('selectedIndex') != 0) {
        $(this).parent().removeClass('is-error');
        show_bond_payments($(this));
    }
});
$(document).on('change', 'input[name="input-answer"]:checkbox', function() {
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
    } else {
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
            for (var i = 0; i < sections.length; i++) {
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

    } 
    if (changed_field == Qi_bounty || changed_field == Qi_finalization_ts) {
        var insert_before = update_ranking_data('questions-high-reward', question_id, question[Qi_bounty].plus(question[Qi_bond]), 'desc');
        //console.log('update for new bounty', question[Qi_bounty], 'insert_before is', insert_before);
        if (insert_before !== -1) {
            populateSection('questions-high-reward', question, insert_before);
        }
    }

    // Things that don't need adding or removing, but may still need the content updating
    updateSectionEntryDisplay(question);
    reflectDisplayEntryChanges();
    // TODO: Need to update sections that haven't changed position, but changed data

}


function handleEvent(error, result) {

    // Check the action to see if it is interesting, if it is then populate notifications etc
    handlePotentialUserAction(result, true);

    // Handles front page event changes.
    // NB We need to reflect other changes too...
    var evt = result['event'];
    if (evt == 'LogNewTemplate') {
        var template_id = result.args.template_id;
        var question_text = result.args.question_text;
        template_content[template_id] = question_text;
        return;
    } else if (evt == 'LogNewQuestion') {
        handleQuestionLog(result);
    } else if (evt == 'LogWithdraw') {
        updateUserBalanceDisplay();
    } else {
        var question_id = result.args.question_id;

        switch (evt) {

            case ('LogNewAnswer'):
                if (result.args.is_commitment) {
                    console.log('got commitment', result);
                    result.args.commitment_id = result.args.answer;
                    // TODO: Get deadline
                    result.args.answer = null;
                    // break;
                }

                //console.log('got LogNewAnswer, block ', result.blockNumber);
                ensureQuestionDetailFetched(question_id, 1, 1, result.blockNumber, result.blockNumber, {'answers': [result]}).then(function(question) {
                    updateQuestionWindowIfOpen(question);
                    //console.log('should be getting latest', question, result.blockNumber);
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


/*-------------------------------------------------------------------------------------*/
// initial process

function pageInit(account) {

    //console.log('in pageInit for account', account);

    // Just used to get the default arbitator address
    Arbitrator = contract(arb_json);
    Arbitrator.setProvider(web3js.currentProvider);

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

    var RealityCheckRealitio = contract(rc_json);
    RealityCheckRealitio.setProvider(new Web3.providers.HttpProvider(RPC_NODES[network_id]));
    console.log('using network', RPC_NODES[network_id]);
    RealityCheckRealitio.deployed().then(function(instance) {
        rcrealitio = instance;

        var evts = rcrealitio.allEvents({}, {
            fromBlock: 'latest',
            toBlock: 'latest'
        })

        evts.watch(function(error, result) {
            if (!error && result) {
                console.log('got watch event', error, result);
                // Give the node we're calling some time to catch up
                window.setTimeout(
                    function() {
                        handleEvent(error, result);
                    }, 5000
                );
            }
        });

    });

    // Now the rest of the questions
    last_polled_block = current_block_number;
    fetchAndDisplayQuestions(current_block_number, 0);

};


function reflectDisplayEntryChanges() {
    //console.log('checking display_entries', display_entries);
    //look at current sections and update blockchain scanning message to
    //no questions found if no items exist
    var detypes = Object.keys(display_entries);
    //console.log('no questions cateogry, display_entries for detype', display_entries, detype);
    for (var i=0; i<detypes.length; i++) {
        var detype = detypes[i];
        var has_items = ($('#' + detype).find('div.questions-list div.questions__item').size() > 0);
        if (has_items) {
            $('#' + detype).find('.no-questions-category').css('display', 'none');
            $('#' + detype).find('.scanning-questions-category').css('display', 'none');
        } else {
            if (is_initial_load_done) {
                $('#' + detype).find('.no-questions-category').css('display', 'block');
                $('#' + detype).find('.scanning-questions-category').css('display', 'none');
            } else {
                $('#' + detype).find('.no-questions-category').css('display', 'none');
                $('#' + detype).find('.scanning-questions-category').css('display', 'none');
            }
        }

    } 
}

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

        is_initial_load_done = true;
        window.setTimeout( reflectDisplayEntryChanges, 1000 );

        scheduleFallbackTimer();
        runPollingLoop(rc);

        //setTimeout(bounceEffect, 500);

        //$('body').addClass('is-page-loaded');

        return;
    }

    //console.log('fetchAndDisplayQuestions', start_block, end_block, fetch_i);

    var question_posted = rc.LogNewQuestion({}, {
        fromBlock: start_block,
        toBlock: end_block
    });
    question_posted.get(function(error, result) {
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < result.length; i++) {
                handlePotentialUserAction(result[i]);
                handleQuestionLog(result[i]);
            }
        } else {
            console.log(error);
        }

        console.log('fetch start end ', start_block, end_block, fetch_i);
        fetchAndDisplayQuestions(start_block - 1, fetch_i + 1);
    });
}

function runPollingLoop(contract_instance) {

    console.log('in runPollingLoop from ', last_polled_block);
    var evts = contract_instance.allEvents({}, {
        fromBlock: last_polled_block - 20, // account for lag
        toBlock: 'latest'
    })

    evts.get(function(error, result) {
        console.log('got evts', error, result);
        last_polled_block = current_block_number;
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < result.length; i++) {
                handleEvent(error, result[i]);
            }
        } else {
            console.log(error);
        }
        window.setTimeout(runPollingLoop, 30000, contract_instance);
    });

}


// Sometimes things go wrong getting events
// To mitigate the damage, run a refresh of the currently-open window etc
function scheduleFallbackTimer() {
     window.setInterval(function() {
        //console.log('checking for open windows');
        $('div.rcbrowser--qa-detail.is-open').each(function() {
             var question_id = $(this).attr('data-question-id');
             console.log('updating window on timer for question', question_id);
             if (question_id) {
                 ensureQuestionDetailFetched(question_id, 1, 1, current_block_number, current_block_number).then(function(question) {
                    updateQuestionWindowIfOpen(question);
                    scheduleFinalizationDisplayUpdate(question);
                    updateRankingSections(question, Qi_finalization_ts, question[Qi_finalization_ts])
                 });
             }
        });
    }, 20000);
}

function fetchUserEventsAndHandle(filter, start_block, end_block) {
    //console.log('fetching for filter', filter);

    var answer_posted = rc.LogNewAnswer(filter, {
        fromBlock: start_block,
        toBlock: end_block
    })
    answer_posted.get(function(error, result) {
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

    var answer_revealed = rc.LogAnswerReveal(filter, {fromBlock: start_block, toBlock: end_block})
    answer_revealed.get(function (error, result) {
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

    var bounty_funded = rc.LogFundAnswerBounty(filter, {
        fromBlock: start_block,
        toBlock: end_block
    });
    bounty_funded.get(function(error, result) {
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < result.length; i++) {
                handlePotentialUserAction(result[i]);
            }
        } else {
            console.log(error);
        }
    });

    var arbitration_requested = rc.LogNotifyOfArbitrationRequest(filter, {
        fromBlock: start_block,
        toBlock: end_block
    });
    arbitration_requested.get(function(error, result) {
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < result.length; i++) {
                handlePotentialUserAction(result[i]);
            }
        } else {
            console.log(error);
        }
    });

    var finalized = rc.LogFinalize(filter, {
        fromBlock: start_block,
        toBlock: end_block
    });
    finalized.get(function(error, result) {
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < result.length; i++) {
                handlePotentialUserAction(result[i]);
            }
        } else {
            console.log(error);
        }
    });

    // Now the rest of the questions
    var question_posted = rc.LogNewQuestion(filter, {
        fromBlock: START_BLOCK,
        toBlock: 'latest'
    });
    question_posted.get(function(error, result) {
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < result.length; i++) {
                handlePotentialUserAction(result[i]);
            }
        } else {
            console.log(error);
        }

    });

}

function isForCurrentUser(entry) {
    var actor_arg = 'user';
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
    for (var i = 0; i < arg_arr.length + 1; i = i + 2) {
        var n = arg_arr[i];
        var v = arg_arr[i + 1];
        if (n && v) {
            args[n] = v;
        }
    }
    return args;
}

function populateArbitratorOptionLabel(op, fee, txt, tos) {
    if (txt) {
        op.attr('data-text-main', txt);
    } else {
        txt = op.attr('data-text-main');
    }
    if (fee.gt(new BigNumber(0))) {
        txt = txt + ' (' + humanReadableWei(fee) + ')';
    }
    op.text(txt);
    op.attr('data-question-fee', '0x' + fee.toString(16));
    if (tos) {
        op.attr('data-tos-url', tos);
    }
}

function populateArbitratorSelect(network_arbs) {
    $("select[name='arbitrator']").each(function() {
        var as = $(this);
        var is_first = true;
        var a_template = as.find('.arbitrator-template-item');
        var append_before = a_template.parent().find('.arbitrator-other-select');
        a_template.remove();

        is_first = false;
        // Global RealityCheck setup is done in the getAccounts handler, do it here too to allow those to work in parallel for faster loading
        const myr = contract(rc_json);
        myr.setProvider(web3js.currentProvider);

        const mya = contract(arb_json);
        mya.setProvider(web3js.currentProvider);

        myr.deployed().then(function(myri) {
            $.each(network_arbs, function(na_addr, na_title) {
                mya.at(na_addr).then(function(arb_inst) {
                    return arb_inst.realitycheck.call();
                }).then(function(rc_addr) {
                    console.log('arb has rc addr', rc_addr);
                    var is_arb_valid = (rc_addr.toLowerCase() == myr.address.toLowerCase());
                    verified_arbitrators[na_addr] = is_arb_valid;
                    // For faster loading, we give arbitrators in our list the benefit of the doubt when rendering the page list arbitrator warning
                    // For this we'll check our original list for the network, then just check against the failed list
                    // TODO: Once loaded, we should really go back through the page and update anything failed
                    if (!is_arb_valid) {
                        failed_arbitrators[na_addr] = true;
                    }
                    console.log(verified_arbitrators);
                    return is_arb_valid;
                }).then(function(is_arb_valid) {
                    if (is_arb_valid) {
                        myri.arbitrator_question_fees.call(na_addr).then(function(fee) {
                            var arb_item = a_template.clone().removeClass('arbitrator-template-item').addClass('arbitrator-option');
                            arb_item.val(na_addr);
                            var tos;
                            if (arb_tos[na_addr]) {
                                tos = arb_tos[na_addr];
                            }
                            populateArbitratorOptionLabel(arb_item, fee, na_title, tos);
                            if (is_first) {
                                arb_item.attr('selected', true);
                                is_first = false;
                            }
                            append_before.before(arb_item);
                        });
                    } else {
                        console.log('Arbitrator does not work for this contract:', na_addr);
                    }
                });
            });
        });
    });
}

function validateArbitratorForContract(arb_addr) {
    return new Promise((resolve, reject) => {
        if (verified_arbitrators[arb_addr]) {
            resolve(true);
        }

        const mya = contract(arb_json);
        mya.setProvider(web3js.currentProvider);
        mya.at(arb_addr).then(function(myainst) {
            myainst.realitycheck.call().then(function(rslt) {
                resolve(arb_addr == rslt);
            });
        });
    })
}


function humanReadableWei(amt) {
    var unit;
    var displ;
    if (amt.gt(web3js.toWei(0.01, 'ether'))) {
        unit = 'ether';
        displ = 'ETH';
    } else if (amt.gt(web3js.toWei(0.01, 'gwei'))) {
        unit = 'gwei';
        displ = 'Gwei';
    } else {
        unit = 'wei';
        displ = 'Wei';
    }
    return web3js.fromWei(amt, unit).toString() + ' ' + unit;
}

function initNetwork(net_id) {
    console.log('Initializing for network', net_id);
    network_id = net_id;
    var net_cls = '.network-id-' + net_id;
    if ($('.network-status'+net_cls).size() == 0) {
        return false;
    }
    $('.network-status'+net_cls).show();
    if (BLOCK_EXPLORERS[net_id]) {
        block_explorer = BLOCK_EXPLORERS[net_id];
    } else {
        // If you've got some unknown test network then we'll just link to main net
        block_explorer = BLOCK_EXPLORERS[1];
    }
    if (START_BLOCKS[net_id]) {
        START_BLOCK = START_BLOCKS[net_id];
    } else {
        START_BLOCK = 1;
    }
    return true;
}

function getAccount(fail_soft) {
    console.log('in getAccount');
    return new Promise((resolve, reject)=>{
        if (account) {
            resolve(account);
        }

        if (typeof ethereum === 'undefined') {
            if (!fail_soft) {
                $('body').addClass('error-no-metamask-plugin').addClass('error');
            }
            reject('Could not find an up-to-date version of metamask, account functionality disabled.');
        }

        ethereum.enable().then(function() {

            ethereum.on('accountsChanged', function (accounts) {
                account = null;                     
                resetAccountUI();
                getAccount();
            })

            web3js.eth.getAccounts((err, acc) => {
                    if (acc && acc.length > 0) {
                        //console.log('accounts', acc);
                        account = acc[0];
                        $('.account-balance-link').attr('href', block_explorer + '/address/' + account);
                    } else {
                        if (!is_web3_fallback) {
                            console.log('no accounts');
                            $('body').addClass('error-no-metamask-accounts').addClass('error');
                        }
                    }

                if (LEGACY_CONTRACT_ADDRESSES[acc[0].toLowerCase()]) {
                    // Notification bar(footer)
                    if (window.localStorage.getItem('v1-got-it') == null) {
                        $('#footer-notification-bar').css('display', 'block');
                    }
                    $('#got-it-button').on('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.localStorage.setItem('v1-got-it', true);
                        $('#footer-notification-bar').css('display', 'none');
                    });
                }

                accountInit(account);
                resolve(account);

            });
        });
    });
}


function accountInit(account) {

    fetchUserEventsAndHandle({
        user: account
    }, START_BLOCK, 'latest');

    updateUserBalanceDisplay();

}

window.addEventListener('load', function() {

    var is_web3_fallback = false;

    web3realitio = new Web3(new Web3.providers.HttpProvider("https://rc-dev-3.socialminds.jp"));

    if (typeof web3 === 'undefined') {
        var is_web3_fallback = true;
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3js = new Web3(new Web3.providers.HttpProvider(RPC_NODES["1"]));
        console.log('no web3js, using infura on network', "1");
    } else {
        // Use Mist/MetaMask's provider
        console.log('got web3js, go ahead');
        web3js = new Web3(web3.currentProvider);
    }

    // Set up a filter so we always know the latest block number.
    // This helps us keep track of how fresh our question data etc is.
    web3js.eth.filter('latest').watch(function(err, res) {
        web3js.eth.getBlock('latest', function(err, result) {
            if (result.number > current_block_number) {
                current_block_number = result.number;
            }
            // Should we do this?
            // Potentially calls later but grows indefinitely...
            // block_timestamp_cache[result.number] = result.timestamp;
        })
    });

    web3js.version.getNetwork((err, net_id) => {
        if (err === null) {
            if (!initNetwork(net_id)) {
                $('body').addClass('error-invalid-network').addClass('error');
                return;
            } 
            populateArbitratorSelect(arbitrator_list[net_id]);
        }

        var args = parseHash();
        USE_COMMIT_REVEAL = (parseInt(args['commit']) == 1);
        if (args['category']) {
            category = args['category'];
            $('body').addClass('category-' + category);
            var cat_txt = $("#filter-list").find("[data-category='" + category + "']").text();
            $('#filterby').text(cat_txt);
        }
        //console.log('args:', args);
        web3js.eth.getBlock('latest', function(err, result) {
            if (result.number > current_block_number) {
                current_block_number = result.number;
            }

            RealityCheck = contract(rc_json);
            RealityCheck.setProvider(web3js.currentProvider);
            RealityCheck.deployed().then(function(instance) {
                rc = instance;
                pageInit();
                if (args['question']) {
                    //console.log('fetching question');
                    ensureQuestionDetailFetched(args['question']).then(function(question) {
                        openQuestionWindow(question[Qi_question_id]);

                    })
                }

                // NB If this fails we'll try again when we need to do something using the account
                getAccount(true);
            });
        });

    });

    var args = parseHash()
    if (args['category']) {
        $("#filter-list").find("[data-category='" + args['category'] + "']").addClass("selected")
    } else {
        $("#filter-list").find("[data-category='all']").addClass("selected")
    }


    //setTimeout(bounceEffect, 8000);
});

$('.continue-read-only-message').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('body').removeClass('error-no-metamask-plugin').removeClass('error');
});
