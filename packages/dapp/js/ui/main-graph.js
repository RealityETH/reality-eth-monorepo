'use strict';

import interact from 'interactjs';
import Ps from 'perfect-scrollbar';

(function() {

const ethers = require("ethers");
const timeago = require('timeago.js');
const timeAgo = new timeago();
const jazzicon = require('jazzicon');
const axios = require('axios');
const crypto = require('crypto');

const $ = require('jquery-browserify');
require('jquery-expander')($);
require('jquery-datepicker');

$('body').addClass('via-graph');

let provider;
let signer;

const rc_question = require('@reality.eth/reality-eth-lib/formatters/question.js');
const rc_template = require('@reality.eth/reality-eth-lib/formatters/template.js');
const rc_contracts = require('@reality.eth/contracts');

// Never try to refetch data if we have some less than this many milliseconds old
let DEFAULT_MAX_CACHE_MS = 1000; 

// When we get stuff that was recently fetched, fetch from the last fetch we did, but make it a bit earlier in case there was a reorg
const REORG_ALLOWANCE_SECS = 180 

// When the user is doing something we poll fast for changes
// If they just leave the window open we slow down
const POLLING_INTERVAL_ACTIVE = 15;
const POLLING_INTERVAL_IDLE = 300;

// How many seconds things should be idle before we switch to the idle speed
const SECS_TO_UX_IDLE_STATE = 180;

let POLLING_INTERVAL = POLLING_INTERVAL_ACTIVE;

let LAST_ACTION_TS = 0;

let TOKEN_INFO = {};
let CHAIN_INFO = {};

let TOKEN_JSON = {};

let IS_TOKEN_NATIVE = false;
let IS_WEB3_FALLBACK = false;

let ARBITRATOR_LIST_BY_CONTRACT = {};
let ARBITRATOR_VERIFIED_BY_CONTRACT = {};
let ARBITRATOR_FAILED_BY_CONTRACT = {};
let FOREIGN_PROXY_DATA = {};
let ARBITRATOR_METADATA = require('./arbitrator_metadata_legacy.json'); // Old contracts don't have this so hard-code it

let PENDING_USER_TXES_BY_CQID = {};

const TEMPLATE_CONFIG = rc_contracts.templateConfig();
const QUESTION_TYPE_TEMPLATES = TEMPLATE_CONFIG.base_ids;

// Special ABIs for Kleros
const PROXIED_ARBITRATOR_ABI_OLD = require('../../abi/kleros/ProxiedArbitratorOld.json');
const PROXIED_ARBITRATOR_ABI_NEW = require('../../abi/kleros/ProxiedArbitratorNew.json');

let SUBMITTED_QUESTION_ID_BY_TIMESTAMP = {};
let USER_CLAIMABLE_BY_CONTRACT = {};

let CATEGORY = null;
let CONTRACT_TEMPLATE_CONTENT = {}; TEMPLATE_CONFIG.content;

let LAST_POLLED_BLOCK = null;
let LAST_POLLED_USER_TS = null;
let IS_INITIAL_LOAD_DONE = false;

let USE_COMMIT_REVEAL = false;

let HOSTED_RPC_NODE = null;

let START_BLOCKS = {};

let CHAIN_ID = null;
let BLOCK_EXPLORER = null;

const FETCH_NUMBERS = [100, 2500, 5000];

let LAST_DISPLAYED_BLOCK_NUMBER = 0;
let CURRENT_BLOCK_NUMBER = 1;

let TOKEN_TICKER = null;

// Question, as returned by questions()
const Qi_content_hash = 0;
const Qi_arbitrator = 1;
const Qi_opening_ts = 2;
const Qi_timeout = 3;
const Qi_finalization_ts = 4;
const Qi_is_pending_arbitration = 5;
const Qi_bounty = 6;
const Qi_best_answer = 7;
const Qi_history_hash = 8;
const Qi_bond = 9;
const Qi_min_bond = 10; // v3 or above only

let BLOCK_TIMESTAMP_CACHE = {};

// Array of all questions that the user is interested in
let Q_MIN_ACTIVITY_BLOCKS = {};

// These will be populated in onload, once the provider is loaded
let RC_INSTANCES = {};
let RC_INSTANCE_VERSIONS = {};
let RC_DEFAULT_ADDRESS = null;
let RC_DISPLAYED_CONTRACTS = [];

let ARBITRATOR_INSTANCE = null;

let ACCOUNT = null;

const MAX_STORE = 10;

let DISPLAY_ENTRIES = {
    'questions-active': {
        'ids': [],
        'vals': [],
        'max_show': 6,
        'max_store': MAX_STORE
    },
    'questions-resolved': {
        'ids': [],
        'vals': [],
        'max_show': 6,
        'max_store': MAX_STORE
    },
    'questions-closing-soon': {
        'ids': [],
        'vals': [],
        'max_show': 6,
        'max_store': MAX_STORE
    },
    'questions-upcoming': {
        'ids': [],
        'vals': [],
        'max_show': 6,
        'max_store': MAX_STORE
    }
}

// data for question detail window
let QUESTION_DETAIL_CACHE = {};
let QUESTION_EVENT_TIMES = {}; // Hold timer IDs for things we display that need to be moved when finalized

let WINDOW_POSITION = [];

function rand(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

function nonceFromSeed(paramstr) {

    let seed = window.localStorage.getItem('commitment-seed');
    if (seed == null) {
        seed = crypto.randomBytes(32).toString('hex');
        console.log('made seed', seed);
        window.localStorage.setItem('commitment-seed', seed);
    }

    return uiHash(paramstr + seed);

}

async function loadPendingTransactions(chain_id) {

    let txliststr = window.localStorage.getItem('tx-'+chain_id);
    //txliststr = '0x815a2c9da2280065fe317a913e0a6141c5a5e3342ec92e1e1c7115f3dd4d1ed6';
    if (!txliststr) {
        return;
    }
    // We don't use a delimiter as the 0x will delimit them
    const txlist = txliststr.split('0x');
    for (let i=0; i<txlist.length; i++) {
        const txid = '0x' + txlist[i];
        if (txid == '0x') {
            continue;
        }
        // console.log('loadPendingTransactions txid', txid);
        const tx = await provider.getTransaction(txid);
        fillPendingUserTX(tx);
    }
    // console.log('PENDING_USER_TXES_BY_CQID', PENDING_USER_TXES_BY_CQID);
    
}

function fillPendingUserTX(tx) {
    
    const txid = tx.hash;
    const inst = RCInstance(tx.to);
    if (!inst) {
	console.log('contract ',tx.to,' for txid not known', txid);
	return;
    }
    const inf = inst.interface;
    // console.log('inst is ', inst);
    const dec = inf.parseTransaction(tx);
    if (!dec) { 
	console.log('could not parse tx', txid);
    }
    if (dec.functionFragment.name != 'submitAnswer' && dec.functionFragment.name != 'submitAnswerERC20') {
	console.log('txid',txid,'not submitAnswer, ignoring');
    }
    const cqid = cqToID(tx.to, dec.args.question_id);

    // ERC20 will have the bond in the args, native will have it in the value
    // TODO: native may be wrong if the arbitrator has a question fee
    const bond = ('bond' in dec) ? dec.bond : dec.value;

    const fake_history = {
        'answer': dec.args.answer,
        'question_id': dec.args.question_id,
        'history_hash': null, // TODO Do we need this?
        'user': ACCOUNT,
        'bond': bond,
        'ts': ethers.BigNumber.from(parseInt(new Date().getTime() / 1000)), // todo
        'is_commitment': false, // TODO
	'event': 'LogNewAnswer',
	'blockNumber': tx.blockNumber,
	'txid': txid
    };

    if (!PENDING_USER_TXES_BY_CQID[cqid]) {
	PENDING_USER_TXES_BY_CQID[cqid] = {};
    }
    PENDING_USER_TXES_BY_CQID[cqid][bond.toHexString()] = fake_history;

    // If we already had the question displayed when we discovered the pending transaction, update the window
    if (QUESTION_DETAIL_CACHE[cqid]) {
        QUESTION_DETAIL_CACHE[cqid] = mergeConfirmedTXes(QUESTION_DETAIL_CACHE[cqid]);
        updateQuestionWindowIfOpen(QUESTION_DETAIL_CACHE[cqid]);
    }

    return true;

}

function mergeConfirmedTXes(question) {

    // Make a lookup table of the history by bond
    let history_bond_to_idx = {};
    let history_unconfirmed_bond_to_idx = {};
    if (question['history'] && question['history'].length > 0) {
        for(let hi=0; hi<question['history'].length; hi++) {
            if (!question['history'][hi]) {
                console.log('no args in history item',question['history'][hi]);
                continue;
            }
            history_bond_to_idx[question['history'][hi].bond.toHexString()] = hi;
        }
    }
    if (question['history_unconfirmed'] && question['history_unconfirmed'].length > 0) {
        for(let ui=0; ui<question['history_unconfirmed'].length; ui++) {
            if (!question['history_unconfirmed'][ui]) {
                console.log('no args in history_unconfirmed item',question['history_unconfirmed'][ui]);
                continue;
            }
            history_unconfirmed_bond_to_idx[question['history_unconfirmed'][ui].bond.toHexString()] = ui;
        }
    }


// If we have anything in the user pending pool that isn't in the unconfirmed list, add it to the unconfirmed pool
    let pending_entries_by_bond = PENDING_USER_TXES_BY_CQID[contractQuestionID(question)];
    if (pending_entries_by_bond) {
        // console.log('got relevant pending_entries_by_bond', contractQuestionID(question), pending_entries_by_bond);
        for (let b in pending_entries_by_bond) {
            // If there's a confirmed history entry at that level, boot it
            if (b in history_bond_to_idx) {
                // If we have a reasonably deep number of confirmations, boot our pending TX which will clearly never be mined
                // TODO: We might want to keep this somewhere and display that it failed instead of just pretending your failed tx never happened
                const idx = history_bond_to_idx[b];
                const purge_block_count = 20;
                if (true || (question['history'][idx].blockNumber + purge_block_count) < CURRENT_BLOCK_NUMBER) {
                    // console.log('purging confirmed bond at level (ignoring purge block count for now)', b);
                    clearPendingTXID(pending_entries_by_bond[b].txid, CHAIN_ID);
                } else {
                    // console.log('pending tx confirmed but not purging yet in case of reorg, will purge at ', question['history'][idx].blockNumber + purge_block_count,', only at ',CURRENT_BLOCK_NUMBER, question['history'][idx]);
                }
                continue;
            }
            if (b in history_unconfirmed_bond_to_idx) {
                // console.log('unconfirmed list already has pending tx', b);
                continue;
            }
            question['history_unconfirmed'].push(pending_entries_by_bond[b]);
            console.log('added entry for bond', b);
        }
    }
    return question;
}

function clearClobberedUnconfirmed(question) {
    const unconf = question['history_unconfirmed'];
    const conf = question['history'];
    if (!unconf || unconf.length == 0) {
        return question;
    }
    const highest_bond = question.bond;

    // console.log('highest_bond is ', highest_bond);

    // unconf = unconf.sort((a, b) => (a.bond.gt(b.bond)) ? 1 : -1);

    let unconf2 = [];
    for(const bidx in unconf) {
        const b = unconf[bidx];
        if (b.bond.lte(highest_bond)) {
            break;
        }
        unconf2.push(b);
    }

    question['history_unconfirmed'] = unconf2;
    return question;
}

function storePendingTXID(txid, chain_id) {
    const MAX_PENDING_STORE = 20;
    const ITEM_LENGTH = 66; // "0x" plus 32 hex characters
    if (txid.length != ITEM_LENGTH) {
        throw new Error("Unexpected txid length: "+txid);
    }
    let current = window.localStorage.getItem('tx-'+chain_id);
    if (current) {
        if (current.includes(txid)) {
            return true;
        }
        // To avoid running over storage, if we have more than MAX_PENDING_STORE, bin the earliest tx
        if (current.length > (MAX_PENDING_STORE*ITEM_LENGTH)) {
            current = current.substr(ITEM_LENGTH);
        }
    } else {
        current = '';
    }
    window.localStorage.setItem('tx-'+chain_id, current + txid);
    return true;
}

function clearPendingTXID(txid, chain_id) {
    console.log('clearPendingTXID', txid, chain_id);
    const ITEM_LENGTH = 66; // "0x" plus 32 hex characters
    if (txid.length != ITEM_LENGTH) {
        throw new Error("Unexpected txid length: "+txid);
    }
    let current = window.localStorage.getItem('tx-'+chain_id);
    window.localStorage.setItem('tx-'+chain_id, current.replace(txid, ''));
}


let ZINDEX = 10;

const MONTH_LIST = [
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

function formatPossibleIPFSLink(u) {
    if (!u) {
        return '';
    }
    if (u.toLowerCase().substr(0, 7) == 'ipfs://') {
        u = u.replace('ipfs://', 'https://ipfs.io/ipfs/');
    } else {
    }
    return u;
}

function markArbitratorFailed(contract, addr, contract_question_id) {
    ARBITRATOR_FAILED_BY_CONTRACT[contract.toLowerCase()][addr.toLowerCase()] = true;
    if (contract_question_id) {
        $('[data-contract-question-id="' + contract_question_id + '"]').addClass('failed-arbitrator');
    }
}

function setRcBrowserPosition(rcbrowser) {
    // when position has been stored.
    if (rcbrowser.hasClass('rcbrowser--qa-detail')) {
        const contract_question_id = rcbrowser.attr('data-contract-question-id');
        const [contract, question_id] = parseContractQuestionID(contract_question_id);
        if (typeof WINDOW_POSITION[contract_question_id] !== 'undefined') {
            const left = parseInt(WINDOW_POSITION[contract_question_id]['x']) + 'px';
            const top = parseInt(WINDOW_POSITION[contract_question_id]['y']) + 'px';
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

    if ((rcbrowser.attr('id') == 'post-a-question-window') || rcbrowser.hasClass('rcbrowser--qa-detail')) {
        const left = (winWidth / 2) - (itemWidth / 2) + 'px';
        const top = itemHeight / 10 + 'px';
        rcbrowser.css('left', left);
        rcbrowser.css('top', top);
    }

}

function initScrollBars() {
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
}

initScrollBars();


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
    const target = event.target.parentNode.parentNode;
    // keep the dragged position in the data-x/data-y attributes
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

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

function RCStartBlock(ctr) {
    return START_BLOCKS[ctr.toLowerCase()]; 
}

function RCInstance(ctr, signed) {
    if (!ctr) {
        throw new Error("contract address not supplied", ctr);
    }
    let ret = RC_INSTANCES[ctr.toLowerCase()];;
    if (!ret) {
        throw new Error("contract not found:" + ctr + ":"+ signed);
    }
    if (signed) {
        return ret.connect(signer);
    } 
    return ret;
}

function populateTOSSection(container, tos) {

    const tos_section = container.find('div.arbitrator-tos');
    if (tos) {
        tos_section.find('.arbitrator-tos-link').attr('href', formatPossibleIPFSLink(tos));
        container.addClass('has-arbitrator-tos');
    } else {
        tos_section.find('.arbitrator-tos-link').attr('href', '');
        container.removeClass('has-arbitrator-tos');
    }

}

$(document).on('change', 'input.arbitrator-other', function() {
    const arb_text = $(this).val();
    const sel_cont = $(this).closest('.select-container');
    if (/^(0x)?[0-9a-f]{1,40}$/i.test(arb_text)) {
        const ar = ARBITRATOR_INSTANCE.attach(arb_text);
        ar.functions.realitio().then(async function(rcaddr_arr) {
            const rcaddr = rcaddr_arr[0];
            if (rcaddr != RCInstance(RC_DEFAULT_ADDRESS).address) {
                console.log('reality check mismatch', rcaddr, RCInstance(RC_DEFAULT_ADDRESS).address);
                return;
            }

            const metadata = await loadArbitratorMetaData(arb_text);
            const tos = ('tos' in metadata) ? metadata['tos'] : null;

            populateTOSSection(sel_cont, tos);

            RCInstance(RC_DEFAULT_ADDRESS).functions.arbitrator_question_fees(arb_text).then(function(fee_arr) {
                const fee = fee_arr[0];
                populateArbitratorOptionLabel(sel_cont.find('option.arbitrator-other-select'), fee, null, tos);
            }).catch(function() {
                populateArbitratorOptionLabel(sel_cont.find('option.arbitrator-other-select'), ethers.BigNumber.from(0), null, tos);
            });

        }).catch(function(err) {
            markArbitratorFailed(RC_DEFAULT_ADDRESS, arb_text);
        });

    } else {
        populateArbitratorOptionLabel(sel_cont.find('option.arbitrator-other-select'), ethers.BigNumber.from(0));
    }
});

$(document).on('change', 'select.arbitrator', function() {
    console.log('arbitrator: ' + $(this).val());
    if ($(this).val() == 'other') {
        $(this).closest('form').find('input.arbitrator-other').show();
    } else {
        populateArbitratorOptionLabel($(this).find('option.arbitrator-other-select'), ethers.BigNumber.from(0));
        $(this).closest('form').find('input.arbitrator-other').hide();
    }
    const op = $(this).find('option:selected');
    const tos_url = op.attr('data-tos-url');
    // console.log('tos_url', tos_url, 'op', op);

    populateTOSSection($(this).closest('.select-container'), tos_url);
});

$(document).on('click', '.rcbrowser', function() {
    ZINDEX += 1;
    $(this).css('z-index', ZINDEX);
    $('.ui-datepicker').css('z-index', ZINDEX + 1);
    $(this).find('.question-setting-warning').find('.balloon').css('z-index', ++ZINDEX);
    $(this).find('.question-setting-info').find('.balloon').css('z-index', ZINDEX);
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


/*-------------------------------------------------------------------------------------*/
// window for posting a question

$('#your-qa-button,.your-qa-link').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    getAccount().then(function() {
        const yourwin = $('#your-question-answer-window');
        yourwin.css('z-index', ++ZINDEX);
        yourwin.addClass('is-open');
        const winheight = (yourwin.height() > $(window).height()) ? $(window).height() : yourwin.height();
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
    $('#help-center-window').css('z-index', ++ZINDEX).addClass('is-open');
});

function setViewedBlockNumber(network_id, block_number) {
    window.localStorage.setItem('viewedBlockNumber' + network_id, block_number);
}

function getViewedBlockNumber(network_id) {
    return window.localStorage.getItem('viewedBlockNumber' + network_id);
}

function markViewedToDate() {
    const vbn = parseInt(getViewedBlockNumber(CHAIN_ID));
    if (vbn >= LAST_DISPLAYED_BLOCK_NUMBER) {
        LAST_DISPLAYED_BLOCK_NUMBER = vbn;
    } else {
        setViewedBlockNumber(CHAIN_ID, LAST_DISPLAYED_BLOCK_NUMBER);
    }
}

function humanToDecimalizedBigNumber(num, force_eth) {
    const decimals = force_eth ? 18 : TOKEN_INFO[TOKEN_TICKER]['decimals'];
    return ethers.utils.parseUnits(num, decimals);
}

function decimalizedBigNumberToHuman(num, force_eth) {
    const decimals = force_eth ? 18 : TOKEN_INFO[TOKEN_TICKER]['decimals'];
    return ethers.utils.formatUnits(num, decimals).replace(/\.0+$/,'');
}

function humanReadableWei(amt) {
    return decimalizedBigNumberToHuman(amt, true) + ' ETH';
}

$('#help-center-window .rcbrowser__close-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#help-center-window').css('z-index', 0).removeClass('is-open');
    document.documentElement.style.cursor = ""; // Work around Interact draggable bug
});

$('#chain-list-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#chain-list-window').css('z-index', ++ZINDEX).addClass('is-open');
});

$('#chain-list-window .rcbrowser__close-button').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#chain-list-window').css('z-index', 0).removeClass('is-open');
    document.documentElement.style.cursor = ""; // Work around Interact draggable bug
});

$('.chain-item a').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    const cid = $(this).closest('.chain-item').attr('data-chain-id')
    window.location.hash = '!/network/'+cid;
    window.location.reload(true);
})

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
            question_window.css('z-index', ++ZINDEX);
            question_window.addClass('is-open');
            question_window.css('height', question_window.height() + 'px');
            setRcBrowserPosition(question_window);
        }
        if (CATEGORY) {
            question_window.find("[name='question-category']").val(CATEGORY);
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

            let optionLabel = "Category: ";

            $("option", this).each(function() {
                const option = $(this).text().split(optionLabel)[1];
                if (option){ $(this).text(option);}
            });

            const optionText = $("option:selected",this).text();
            $("option:selected", this).text(optionLabel + optionText);

            $(this).parent().removeClass('is-error');
        });

        $("select[name='question-type']").change(function(){
            let optionLabel = "Question Type: ";

            $("option", this).each(function() {
                const option = $(this).text().split(optionLabel)[1];
                if (option){ $(this).text(option);}
            });

            const optionText = $("option:selected",this).text();
            $("option:selected", this).text(optionLabel + optionText);
        });

        $("select[name='step-delay']").change(function(){
            let optionLabel = "Countdown: ";

            $("option", this).each(function() {
                const option = $(this).text().split(optionLabel)[1];
                if (option){ $(this).text(option);}
            });

            const optionText = $("option:selected",this).text();
            $("option:selected", this).text(optionLabel + optionText);
        });

        $("select[name='arbitrator']").change(function(){
            $(this).addClass("selected");
            let optionLabel = "Arbitrator: ";

            $("option", this).each(function() {
                const option = $(this).text().split(optionLabel)[1];
                if (option){ $(this).text(option);}
            });

            const optionText = $("option:selected",this).text();
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

$(document).on('click', '#post-a-question-window .post-question-submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();

    updateLastActionTS();

    await getAccount();

    let win = $('#post-a-question-window');
    const question_body = win.find('.question-body');
    const reward_val = win.find('.question-reward').val();
    const timeout = win.find('.step-delay');
    const timeout_val = parseInt(timeout.val());
    let arbitrator = win.find('.arbitrator').val();

    const expected_question_fee_attr = win.find('.arbitrator option:selected').attr('data-question-fee');
    const expected_question_fee = expected_question_fee_attr ? ethers.BigNumber.from(expected_question_fee_attr) : ethers.BigNumber.from(0);

    if (arbitrator == 'other') {
        arbitrator = win.find('input.arbitrator-other').val();
    }
    const question_type = win.find('.question-type');
    const answer_options = win.find('.answer-option');
    const opening_ts_val = win.find('.opening-ts').val();

    const category = win.find('div.select-container--question-category select');
    let outcomes = [];
    for (let i = 0; i < answer_options.length; i++) {
        outcomes[i] = answer_options[i].value;
    }
    const reward = (reward_val == '') ? ethers.BigNumber.from(0) : humanToDecimalizedBigNumber(reward_val);

    if (!validate(win)) {
        return;
    }

    const qtype = question_type.val();
    const template_id = rc_template.defaultTemplateIDForType(qtype);
    const qtext = rc_question.encodeText(qtype, question_body.val(), outcomes, category.val());
    let opening_ts = 0;
    if (opening_ts_val != '') {
        opening_ts = new Date(opening_ts_val);
        opening_ts = parseInt(opening_ts / 1000);
    }

    const rcver = RC_INSTANCE_VERSIONS[RC_DEFAULT_ADDRESS.toLowerCase()];

    let min_bond = ethers.BigNumber.from(0);
    if (win.hasClass('version-supports-min-bond')) {
        const min_bond_val = win.find('.question-min-bond').val();
        min_bond = humanToDecimalizedBigNumber(min_bond_val);
    }

    const question_id = rc_question.questionID(template_id, qtext, arbitrator, timeout_val, opening_ts, ACCOUNT, 0, min_bond.toHexString(), RC_DEFAULT_ADDRESS, rcver);
    //console.log('question_id inputs for id ', question_id, template_id, qtext, arbitrator, timeout_val, opening_ts, ACCOUNT, 0);
    //console.log('content_hash inputs for content hash ', rc_question.contentHash(template_id, opening_ts, qtext), template_id, opening_ts, qtext);

    const is_ok = await validateArbitratorForContract(RC_DEFAULT_ADDRESS, arbitrator);
    if (!is_ok) {
        console.log('bad arbitrator');
        return;
    }

    const fee_response = await RCInstance(RC_DEFAULT_ADDRESS).functions.arbitrator_question_fees(arbitrator);
    // console.log('got fee response', fee_response, 'for arb', arbitrator);
    const fee = fee_response[0];
    if (!fee.eq(expected_question_fee)) {
        console.log('fee has changed');
        populateArbitratorOptionLabel(win.find('.arbitrator option:selected'), fee);
        return;
    }

    const handleAskQuestionTX = async function(tx_response) {
        //console.log('sent tx with id', txid);

        const txid = tx_response.hash;
        const contract = RC_DEFAULT_ADDRESS;

        const fake_question = {
            id: contract + '-' + question_id,
            questionId: question_id,
            contract: contract,
            createdBlock: 0,
            createdTimestamp: ""+parseInt(new Date().getTime()/1000), // Make this look like graph does
            data: qtext,
            arbitrator: arbitrator,
            openingTimestamp: ethers.BigNumber.from(parseInt(opening_ts)),
            timeout: ethers.BigNumber.from(timeout_val),
            bounty: reward,
            currentAnswer: "0x0000000000000000000000000000000000000000000000000000000000000000",
            currentAnswerBond: null,
            currentAnswerTimestamp: null,
            historyHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
            contentHash: rc_question.contentHash(template_id, parseInt(opening_ts), qtext),
            lastBond: 0,
            minBond: min_bond,
            cumulativeBonds: 0,
            arbitrationRequestedTimestamp: 0,
            arbitrationRequestedBy: null,
            isPendingArbitration: false,
            arbitrationOccurred: false,
            answerFinalizedTimestamp: null,
            currentScheduledFinalizationTimestamp: null,
            template: {
                templateId: template_id, 
                questionText: CONTRACT_TEMPLATE_CONTENT[contract.toLowerCase()][template_id] // TODO: Make sure this is fetched - should be if we're only using existing questions or our listed templates
            }
        }

        let q = filledQuestion(fake_question)

        // Turn the post question window into a question detail window
        let rcqa = $('.rcbrowser--qa-detail.template-item').clone();
        win.html(rcqa.html());
        win = populateQuestionWindow(win, q, false);

        // TODO: Once we have code to know which network we're on, link to a block explorer
        win.find('.pending-question-txid a').attr('href', BLOCK_EXPLORER + '/tx/' + txid);
        win.find('.pending-question-txid a').text(txid.substr(0, 12) + "...");
        win.addClass('unconfirmed-transaction').addClass('has-warnings');
        win.attr('data-pending-txid', txid);

        const contract_question_id = contractQuestionID(q);

        win.find('.rcbrowser__close-button').on('click', function() {
            let parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
            let left = parseInt(parent_div.css('left').replace('px', ''));
            let top = parseInt(parent_div.css('top').replace('px', ''));
            let data_x = (parseInt(parent_div.attr('data-x')) || 0);
            let data_y = (parseInt(parent_div.attr('data-y')) || 0);
            left += data_x;
            top += data_y;
            WINDOW_POSITION[contract_question_id] = {};
            WINDOW_POSITION[contract_question_id]['x'] = left;
            WINDOW_POSITION[contract_question_id]['y'] = top;
            win.remove();
            document.documentElement.style.cursor = ""; // Work around Interact draggable bug
        });

        set_hash_param({'question': contractQuestionID(q)});

        const window_id = 'qadetail-' + contractQuestionID(q);
        win.removeClass('rcbrowser--postaquestion').addClass('rcbrowser--qa-detail');
        win.attr('id', window_id);
        win.attr('data-contract-question-id', contractQuestionID(q));
        Ps.initialize(win.find('.rcbrowser-inner').get(0));

        // Once confirmed, slot into the front page
        await tx_response.wait();
        await delay(3000);

        handleQuestion(fake_question);

    }

    const signedRC = RCInstance(RC_DEFAULT_ADDRESS, true);
    let tx_response = null;
    if (IS_TOKEN_NATIVE) { 
        if (min_bond.gt(0)) {
            tx_response = await signedRC.functions.askQuestionWithMinBond(template_id, qtext, arbitrator, timeout_val, opening_ts, 0, min_bond, {
                from: ACCOUNT,
                // gas: 200000,
                value: reward.add(fee)
            });
        } else {
            tx_response = await signedRC.functions.askQuestion(template_id, qtext, arbitrator, timeout_val, opening_ts, 0, {
                from: ACCOUNT,
                // gas: 200000,
                value: reward.add(fee)
            });
        }
    } else {
        const cost = reward.add(fee);
        await ensureAmountApproved(RCInstance(RC_DEFAULT_ADDRESS).address, ACCOUNT, cost);
        if (min_bond.gt(0)) {
            tx_response = await signedRC.functions.askQuestionWithMinBondERC20(template_id, qtext, arbitrator, timeout_val, opening_ts, 0, min_bond, cost, {
                from: ACCOUNT,
                // gas: 200000,
            })
        } else {
            tx_response = await signedRC.functions.askQuestionERC20(template_id, qtext, arbitrator, timeout_val, opening_ts, 0, cost, {
                from: ACCOUNT,
                // gas: 200000,
            })
        }
    }
    handleAskQuestionTX(tx_response);

});

function isArbitratorValid(arb) {
    let found = false;
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
function isArbitratorValidFast(contract, test_arb) {
    for (const a in ARBITRATOR_LIST_BY_CONTRACT[contract.toLowerCase()]) {
        if (a.toLowerCase() == test_arb.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function arbitratorAddressToText(contract, addr) {
    for (const a in ARBITRATOR_LIST_BY_CONTRACT[contract.toLowerCase()]) {
        if (a.toLowerCase() == addr.toLowerCase()) {
            return ARBITRATOR_LIST_BY_CONTRACT[contract.toLowerCase()][a.toLowerCase()];
        }
    }
    return addr;
}

function isArbitrationPending(question) {
    return (question.is_pending_arbitration);
}

// Return true if a user has started a commit or given an answer
// NB Returns true even if the answer has timed out
function isAnswerActivityStarted(question) {
    if (isAnswered(question)) {
        return true;
    }
    const history_hash = ethers.BigNumber.from(question.history_hash);
    return (history_hash.gt(0));
}

function historyItemForCurrentAnswer(question) {
    if (question['history'].length) {
        for (let i=question['history'].length-1; i >= 0; i--) {
            const item = question['history'][i];
            // console.log('considering item', item,' for question', question);
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
    const idx = question['history'].length - 1;
    const item = question['history'][idx];
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
        for (let i=0; i<question['history'].length; i++) {
            const item = question['history'][i];
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
    if (isAnswered(question)) {
        return true;
    }
    const history_hash = ethers.BigNumber.from(question.history_hash);
    return (history_hash.gt(0));
}

function isAnswered(question) {
    const finalization_ts = question.finalization_ts.toNumber();
    return (finalization_ts > 1);
}

function commitExpiryTS(question, posted_ts) {
    const commit_secs = question.timeout.div(8);
    return posted_ts.add(commit_secs);
}

function isCommitExpired(question, posted_ts) {
    const commit_secs = question.timeout.toNumber() / 8;
    // console.log('commit secs are ', commit_secs);
    return new Date().getTime() > (( posted_ts + commit_secs ) * 1000);
}

function isFinalized(question) {
    if (isArbitrationPending(question)) {
        return false;
    }
    const fin = question.finalization_ts.toNumber()
    const res = ((fin > 1) && (fin * 1000 < new Date().getTime()));
    return res;
}

// Return true if the question looks like it could be reopened.
// Doesn't check whether it already has been.
function isReopenCandidate(question) {
    if (!isFinalized(question)) {
        return false;
    }
    if (question.best_answer != rc_question.getAnsweredTooSoonValue()) {
        return false;
    }
    if (!rc_contracts.versionHasFeature(RC_INSTANCE_VERSIONS[question.contract.toLowerCase()], 'reopen-question')) {
        return false;
    }
    return true;
}

// Assumes we already filled the data
function isReopenable(question) {
    // TODO: Check if it can be re-reopened
    // console.log('reopened_by is ', question.reopened_by);
    // console.log('last_reopened_by is ', question.last_reopened_by);
    if (question.reopened_by && question.reopened_by != '0x0000000000000000000000000000000000000000000000000000000000000000') {
        // console.log('already reopened');
        return false;
    }
    if (question.is_reopener) {
        // console.log('already reopening something else');
        return false;
    }
    return isReopenCandidate(question);
}

$(document).on('click', '.answer-claim-button', async function() {

    updateLastActionTS();

    const contract = $(this).closest('.contract-claim-section').attr('data-contract');

    const is_single_question = !$(this).hasClass('claim-all');

    const doClaim = function(contract, is_single_question, question_detail) {

        let claim_args = {};
        let claiming = {};
        if (is_single_question) {

            claiming = possibleClaimableItems(question_detail);
            claim_args = claiming;

            //console.log('try9ing to claim ', claimable['total'].toString());
            if (claim_args['total'].isZero()) {
                //console.log('nothing to claim');
                // Nothing there, so force a refresh
                openQuestionWindow(contractQuestionID(question_detail));
                if (USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()]) {
                    delete USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()][question_id];
                }
            }

        } else {

            claiming = USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()];
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

        const gas = 140000 + (30000 * claim_args['history_hashes'].length);
        const signedRC = RCInstance(contract, true); 
        console.log('claiming:', claim_args['question_ids'], claim_args['answer_lengths'], claim_args['history_hashes'], claim_args['answerers'], claim_args['bonds'], claim_args['answers']);
        signedRC.functions.claimMultipleAndWithdrawBalance(claim_args['question_ids'], claim_args['answer_lengths'], claim_args['history_hashes'], claim_args['answerers'], claim_args['bonds'], claim_args['answers'], {
            from: ACCOUNT 
            //gas: gas
        }).then(function(tx_response) {
            const txid = tx_response.hash;
            //console.log('claiming is ',claiming);
            //console.log('claim result txid', txid);
            for (const qid in claiming) {
                if (claiming.hasOwnProperty(qid)) {
                    if (!USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()]) {
                        USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()] = {};
                    }
                    if (USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()][qid]) {
                        USER_CLAIMABLE_BY_CONTRACT[contract][qid].txid = txid;
                    }
                }
            }
            updateClaimableDisplay(contract);
            updateUserBalanceDisplay();
        });
    }

    if (is_single_question) {
        const contract_question_id = $(this).closest('.rcbrowser--qa-detail').attr('data-contract-question-id');
        const [ctr, question_id] = parseContractQuestionID(contract_question_id);
        if (ctr != contract) {
            throw new Error("Contract ID mismatch", ctr, contract);
        }
        await ensureQuestionDetailFetched(contract, question_id)
        doClaim(contract, is_single_question, qdata);
    } else {
        // TODO: Should we be refetching all the questions we plan to claim for?
        doClaim(contract, is_single_question);
    }

});

function validate(win) {
    let valid = true;

    const qtext = win.find('.question-body');
    if (qtext.val() == '') {
        qtext.closest('div').addClass('is-error');
        valid = false;
    } else {
        qtext.closest('div').removeClass('is-error');
    }

    let reward = win.find('.question-reward');
    if (reward.val() === '') {
        reward.parent().parent().addClass('is-error');
        valid = false;
    } else {
        reward.parent().parent().removeClass('is-error');
    }

    if (win.hasClass('version-supports-min-bond')) {
        let min_bond_inp = win.find('.question-min-bond');
        let is_bond_err = false;
        try {
            // Parse the number and make sure it works
            humanToDecimalizedBigNumber(min_bond_inp.val());
        } catch (e) {
            console.log('min bond parse err', e);
            is_bond_err = true;
        }
        if (is_bond_err) {
            min_bond_inp.parent().parent().addClass('is-error');
            valid = false;
        } else {
            min_bond_inp.parent().parent().removeClass('is-error');
        }
    }

    let options_num = 0;
    const question_type = win.find('.question-type');
    const answer_options = $('.answer-option').toArray();
    for (let i = 0; i < answer_options.length; i++) {
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

    const select_ids = ['.question-type', '.arbitrator', '.step-delay', '.question-category'];
    for (const id of select_ids) {
        if (win.find(id).val() == "default") {
            win.find(id).parent().addClass('is-error');
            valid = false;
        } else {
            win.find(id).parent().removeClass('is-error');
        }
    }

    //console.log('valid is ', valid);
    return valid;
}


$('div.loadmore-button').on('click', async function(e) {
    const sec = $(this).attr('data-questions');
    //console.log('loading more sec', sec);

    const old_max = DISPLAY_ENTRIES[sec]['max_show'];
    const new_max = old_max + 3;

    const num_in_doc = $('#' + sec).find('.questions__item').length;

    DISPLAY_ENTRIES[sec]['max_show'] = new_max;

    const old_max_store = DISPLAY_ENTRIES[sec]['max_store'];

    // TODO: We may need to refetch to populate this store
    DISPLAY_ENTRIES[sec]['max_store'] = DISPLAY_ENTRIES[sec]['max_store'] + 3;

    for (let i = num_in_doc; i < new_max && i < DISPLAY_ENTRIES[sec]['ids'].length; i++) {
        const nextid = DISPLAY_ENTRIES[sec]['ids'][i];
        const [next_ctr, next_question_id] = parseContractQuestionID(nextid);
        let previd = null;
        if (i > 0) {
            previd = DISPLAY_ENTRIES[sec]['ids'][i + 1];
        }

        // Mostly these will come direct from the cache
        let question = await ensureQuestionDetailFetched(next_ctr, next_question_id, (60*60*1000));
        populateSection(sec, question, previd);
    }

    // Increase storage for next time
    // TODO: Only fetch the relevant section
    fetchQuestionListsFromGraph(old_max_store);

});

function updateClaimableDataForQuestion(question) {
    const contract = question.contract;
    const poss = possibleClaimableItems(question);
    //console.log('made poss for question', poss, question.question_id);
    if (!USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()]) {
        USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()] = {};
    }
    if (poss['total'].isZero()) {
        delete USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()][question.question_id];
    } else {
        USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()][question.question_id] = poss;
    }
    return true; // TODO: Make this only return true if it changed something
}

async function updateClaimableDisplay(contract) {

    if (!USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()]) {
        USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()] = {};
    }
    const unclaimed = mergePossibleClaimable(USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()], false);
    // console.log('updateClaimableDisplay with user_claimable, unclaimed', contract, USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()], unclaimed);
    const claiming = mergePossibleClaimable(USER_CLAIMABLE_BY_CONTRACT[contract.toLowerCase()], true);
    const sec = $('.contract-claim-section').filter('[data-contract=' + contract.toLowerCase() + ']'); 
    if (claiming.total.gt(0)) {
        const txids = claiming.txids;
        sec.find('.answer-claiming-container').find('.claimable-eth').text(decimalizedBigNumberToHuman(claiming.total));
        const txid = txids.join(', '); // TODO: Handle multiple links properly
        sec.find('.answer-claiming-container').find('a.txid').attr('href', BLOCK_EXPLORER + '/tx/' + txid);
        sec.find('.answer-claiming-container').find('a.txid').text(txid.substr(0, 12) + "...");
        sec.find('.answer-claiming-container').show();
    } else {
        sec.find('.answer-claiming-container').fadeOut();
    }

    const balance_arr = await RCInstance(contract).functions.balanceOf(ACCOUNT); 
    const balance = balance_arr[0];
    const ttl = balance.add(unclaimed.total);
//console.log('claimable ttol is ',ttl, ttl.toNumber());
    if (ttl.gt(0)) {
        sec.find('.answer-claim-button.claim-all').find('.claimable-eth').text(decimalizedBigNumberToHuman(ttl));
        sec.find('.answer-claim-button.claim-all').show();
    } else {
        sec.find('.answer-claim-button.claim-all').fadeOut();
    }

}

function mergePossibleClaimable(posses, pending) {
    const combined = {
        'txids': [],
        'total': ethers.BigNumber.from(0),
        'question_ids': [],
        'answer_lengths': [],
        'answers': [],
        'answerers': [],
        'bonds': [],
        'history_hashes': []
    }
    for (const qid in posses) {
        if (posses.hasOwnProperty(qid)) {
            if (!pending && posses[qid].txid) {
                continue;
            }
            if (pending && !posses[qid].txid) {
                continue;
            }
            combined['total'] = combined['total'].add(posses[qid].total);
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

function isAnythingUnrevealed(question) {
    console.log('isAnythingUnrevealed pretending everything is revealed');
    return false;
}

function filledAnswer(item, fetched_ms) {

    // For now we make this look like what we get from a log event
    let ans = {};
    if (item.isCommitment) {
        ans.commitment_id = item.commitmentId;
        ans.is_commitment = true;
        ans.revealed_block = item.revealedBlock
    } else {
        ans.is_commitment = false;
        ans.commitment_id = null;
        ans.revealed_block = null;
    }
    ans.answer = item.answer;
    // ans.isUnrevealed = = item.isUnrevealed; // TODO: use this later
    ans.bond = ethers.BigNumber.from(item.bond);
    ans.history_hash = item.historyHash;

    ans.user = item.user; 
    ans.ts = ethers.BigNumber.from(item.timestamp);

    // txid isn't filled from the graph, only from our unconfirmed transactions
    ans.txid = item.txid;

    ans.fetched_ms = fetched_ms;

    return ans;

}

function ensureTemplateCached(contract, template_id, content) {
    contract = contract.toLowerCase();
    template_id = parseInt(template_id);
    if (!CONTRACT_TEMPLATE_CONTENT[contract]) {
        CONTRACT_TEMPLATE_CONTENT[contract] = {};
    }
    CONTRACT_TEMPLATE_CONTENT[contract][""+template_id] = content;
}

function filledQuestion(item, fetched_ms) {

    let question = {'history_unconfirmed': []};

    const cqid = cqToID(item.contract, item.questionId);
    // console.log('filledQuestion', cqid);

    // If we already have a question cached, start with that so we don't clobber its unconfirmed history etc
    if (QUESTION_DETAIL_CACHE[cqid]) {
        question = QUESTION_DETAIL_CACHE[cqid];
    } 

    question.arbitrator = item.arbitrator;
    question.question_id = item.questionId;
    question.creation_ts = ethers.BigNumber.from(item.createdTimestamp);
    question.question_creator = item.user;
    question.question_created_block = item.createdBlock;
    question.content_hash = item.contentHash;
    question.question_text= item.data;
    question.template_id = item.template.templateId;
    question.block_mined = item.createdBlock;
    question.fetched_ms = fetched_ms;

    ensureTemplateCached(item.contract, item.template.templateId, item.template.questionText);

    if (item.openingTimestamp) {
        question.opening_ts = ethers.BigNumber.from(item.openingTimestamp);
    } else {
        question.opening_ts = ethers.BigNumber.from(0);
    }

    question.contract = item.contract;
    question.version_number = RC_INSTANCE_VERSIONS[question.contract.toLowerCase()];
    if (item.reopens) {
        question.reopener_of_question_id = item.reopens.id;
    }
    if (item.reopenedBy) {
        question.reopened_by = item.reopenedBy.id;
    }
    //question.bounty = data.args['bounty'];

    try {
        // question.question_json = JSON.parse(item.json_str);
        question.question_json = rc_question.populatedJSONForTemplate(item.template.questionText, item.data, true);
        question.has_invalid_option = rc_question.hasInvalidOption(question.question_json, question.version_number);
        question.has_too_soon_option = rc_question.hasAnsweredTooSoonOption(question.question_json, question.version_number);
    } catch (e) {
        console.log('error parsing json', e);
        return null;
        // question.question_json = null;
    }
  
    if (item.answerFinalizedTimestamp) {
        question.finalization_ts = ethers.BigNumber.from(item.answerFinalizedTimestamp); // GRAPH_TODO - check this is what we need
    } else {
        question.finalization_ts = ethers.BigNumber.from(0);
    }

    question.is_pending_arbitration = item.isPendingArbitration;
    question.timeout = ethers.BigNumber.from(item.timeout);
    question.bounty = ethers.BigNumber.from(item.bounty);
    question.best_answer = item.currentAnswer;
    question.bond = ethers.BigNumber.from(item.lastBond);
    question.history_hash = item.historyHash;

    if (!question.history_hash) {
        question.history_hash = "0x0000000000000000000000000000000000000000000000000000000000000000";
    }

    question.min_bond = ethers.BigNumber.from(item.minBond);
    question.history = [];
    for(let respi in item.responses) {
        question.history.push(filledAnswer(item.responses[respi], fetched_ms));
    }
    question.history = question.history.sort((a, b) => (a.bond.gt(b.bond)) ? 1 : -1);

    question = mergeConfirmedTXes(question);
    question = clearClobberedUnconfirmed(question);
    // console.log('filledQuestion made', question, item);

    // TODO: Make sure the graph knows whether a question still has funds and query that here
    if (ACCOUNT && isFinalized(question)) {
        updateClaimableDataForQuestion(question); 
    }

    QUESTION_DETAIL_CACHE[cqid] = question;

    return question;

}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureAmountApproved(spender, account, amount) {
    console.log('checking if we need extra approval for amount', amount.toHexString());
    const erc20 = getERC20TokenInstance();

    const mybal = await erc20.functions.balanceOf(account);
    console.log('balance is ', mybal.toString());

    const allowed_arr = await erc20.functions.allowance(account, spender);
    const allowed = allowed_arr[0];
    if (allowed.gte(amount)) {
        console.log('already got enough, continuing', allowed.toHexString());
        return allowed;
    } else {
        console.log('not enough to cover cost, approving', amount, spender);
        const signedERC20 = erc20.connect(signer);
        const tx = await signedERC20.functions.approve(spender, amount);
        await tx.wait(); 
        // At this point we have received the approval's transaction hash and can proceed with next transaction.
        // However, Metamask may need some time to pick up this transaction, 
        // which is needed to validate next transactions, and 3 seconds is considered a "safe" waiting time.
        // Metamask will still display the error however, but it can be ignored
        await delay(3000);
        console.log('approval done')
        return amount;
    }
}

async function updateUserBalanceDisplay() {
    if (!ACCOUNT) {
        return;
    }

    let bal = 0;
    if (IS_TOKEN_NATIVE) {
        // console.log('updating balacne for', account);
        bal = await provider.getBalance(ACCOUNT);
    } else {
            /*
            todo: should we have error handling
            if (error === null) {
                $('.account-balance').text(web3js.fromWei(result.toNumber(), 'ether'));
            }
            */
        const erc20 = getERC20TokenInstance();
        const bal_arr = await erc20.functions.balanceOf(ACCOUNT);
        bal = bal_arr[0];
    }

    $('.account-balance').text(decimalizedBigNumberToHuman(bal));
}

function getERC20TokenInstance() {
    return new ethers.Contract(TOKEN_JSON.address, TOKEN_JSON.abi, provider);
}

function populateSection(section_name, question, before_item) {

    const question_id = question.question_id;
    const idx = DISPLAY_ENTRIES[section_name].ids.indexOf(question_id);
    //console.log('idx is ',idx);
    if (idx > DISPLAY_ENTRIES[section_name].max_show) {
        //console.log('over max show, skip', question_id);
        return;
    }

    const question_item_id = section_name + '-question-' + contractQuestionID(question);
    const before_item_id = section_name + '-question-' + before_item

    const target_question_id = 'qadetail-' + contractQuestionID(question);

    const section = $('#' + section_name);

    // If the item is already in the document but in the wrong place, remove it.
    // If it's already in the right place, do nothing
    const existing_in_doc = section.find('#' + question_item_id);
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

    const is_found = (section.find('#' + before_item_id).length > 0);
    let entry = $('.questions__item.template-item').clone();

    entry = populateSectionEntry(entry, question);

    if (ARBITRATOR_FAILED_BY_CONTRACT[question.contract.toLowerCase()] && ARBITRATOR_FAILED_BY_CONTRACT[question.contract.toLowerCase()][question.arbitrator.toLowerCase()]) {
        entry.addClass('failed-arbitrator');
    } 

    entry.attr('id', question_item_id).removeClass('template-item');
    entry.css('display', 'none');

    //console.log('adding entry', question_item_id, 'before item', before_item);
    if (before_item && is_found) {
        section.find('#' + before_item_id).before(entry);
    } else {
        section.children('.questions-list').append(entry);
    }

    activateSection(section_name);

    entry.fadeIn(1000);
    if (DISPLAY_ENTRIES[section_name]['ids'].length > 3) {
        if (section.find('.loadmore-button').css('display') == 'none') {
            section.children('.questions-list').find('.questions__item:last-child').remove();
        }
    }
    if (section.children('.questions-list').find('.questions__item').length >= DISPLAY_ENTRIES[section_name]['ids'].length) {
        section.find('.loadmore-button').css('display', 'none');
    } else {
        section.find('.loadmore-button').css('display', 'block');
    }
    while (section.children('.questions-list').find('.questions__item').length > DISPLAY_ENTRIES[section_name].max_show) {
        //console.log('too long, removing');
        section.children('.questions-list').find('.questions__item:last-child').remove()
    }

    // question settings warning balloon
    let balloon_html = '';
    if (question.timeout < 86400) {
        balloon_html += 'The timeout is very low.<br /><br />This means there may not be enough time for people to correct mistakes or lies.<br /><br />';
    }
    if (isFinalized(question) && question.bounty.add(question.bond).lt(ethers.BigNumber.from(""+TOKEN_INFO[TOKEN_TICKER]['small_number']))) {
        balloon_html += 'The reward was very low and no substantial bond was posted.<br /><br />This means there may not have been enough incentive to post accurate information.<br /><br />';
    }
    const valid_arbitrator = isArbitratorValidFast(question.contract, question.arbitrator);
    if (!valid_arbitrator) {
        balloon_html += 'This arbitrator is unknown.';
    }
    const contract_question_id = contractQuestionID(question);
    if (balloon_html) {
        $('div[data-contract-question-id=' + contract_question_id + ']').find('.question-setting-warning').css('display', 'block');
        $('div[data-contract-question-id=' + contract_question_id + ']').find('.question-setting-warning').css('z-index', 5);
        $('div[data-contract-question-id=' + contract_question_id + ']').find('.question-setting-warning').find('.balloon').html(balloon_html);
    }

}

function activateSection(section_name) {
    $('div#questions-container').find('.main-nav li a').each(function() {
        if ($(this).attr('data-menu') == section_name) {
            $(this).addClass('activated');
        }
    });
}

function updateSectionEntryDisplay(question) {
    $('div.questions__item[data-contract-question-id="' + contractQuestionID(question) + '"]').each(function() {
        //console.log('updateSectionEntryDisplay update question', question.question_id);
        populateSectionEntry($(this), question);
    });
}

function populateSectionEntry(entry, question) {

    const question_id = question.question_id;
    const question_json = question.question_json;
    const posted_ts = ethers.BigNumber.from(question.creation_ts);
    const arbitrator = question.arbitrator;
    const timeout = question.timeout;
    const bounty = decimalizedBigNumberToHuman(question.bounty);
    const is_arbitration_pending = isArbitrationPending(question);
    const is_finalized = isFinalized(question);
    const best_answer = question.best_answer;
    const bond = question.bond;

    let options = '';
    if (typeof question_json['outcomes'] !== 'undefined') {
        for (let i = 0; i < question_json['outcomes'].length; i++) {
            options = options + i + ':' + question_json['outcomes'][i] + ', ';
        }
    }

    entry.attr('data-contract-question-id', contractQuestionID(question));
    //entry.find('.questions__item__title').attr('data-target-id', target_question_id);

    entry.find('.question-title').text(question_json['title']).expander({
        expandText: '',
        slicePoint: 140
    });
    entry.find('.question-bounty').text(bounty);

    entry.find('.bond-value').text(decimalizedBigNumberToHuman(bond));

    // For these purposes we just ignore any outstanding commits
    if (isAnswered(question)) {
        entry.find('.questions__item__answer').text(rc_question.getAnswerString(question_json, best_answer));
        entry.addClass('has-answer');
    } else {
        entry.find('.questions__item__answer').text('');
        entry.removeClass('has-answer');
    }

    if (isQuestionBeforeOpeningDate(question)) {
        entry.addClass('not-yet-open');
    }

    const is_answered = isAnswered(question);

    if (is_answered) {
        entry.addClass('has-answers').removeClass('no-answers');
    } else {
        entry.removeClass('has-answers').addClass('no-answers');
    }

    timeago.cancel(entry.find('.timeago'));
    if (isArbitrationPending(question)) {
        entry.addClass('arbitration-pending');
    } else {
        entry.removeClass('arbitration-pending');
        if (is_answered) {
            timeago.cancel(entry.find('.closing-time-label .timeago'));
            entry.find('.closing-time-label .timeago').attr('datetime', rc_question.convertTsToString(question.finalization_ts));
            timeAgo.render(entry.find('.closing-time-label .timeago'));
        } else {
            entry.find('.created-time-label .timeago').attr('datetime', rc_question.convertTsToString(question.creation_ts));
            timeAgo.render(entry.find('.created-time-label .timeago'));
        }
    }
    
    if (isQuestionBeforeOpeningDate(question)) {
        entry.find('.opening-time-label .timeago').attr('datetime', rc_question.convertTsToString(question.opening_ts));
        timeAgo.render(entry.find('.opening-time-label .timeago'));
    }

    return entry;

}

function depopulateSection(section_name, question_id) {
    //console.log('depopulating', section_name, question_id);

    const question_item_id = section_name + '-question-' + question_id;
    const section = $('#' + section_name);

    const item = section.find('#' + question_item_id);
    if (item.length) {
        item.remove();
        // Add the next entry to the bottom
        const current_last_qid = section.find('.questions__item').last().attr('data-contract-question-id');
        const current_last_idx = DISPLAY_ENTRIES[section_name]['ids'].indexOf(current_last_qid);
        const next_idx = current_last_idx + 1;
        if (DISPLAY_ENTRIES[section_name]['ids'].length > next_idx) {
            const add_qid = DISPLAY_ENTRIES[section_name]['ids'][next_idx];
            const qdata = QUESTION_DETAIL_CACHE[add_qid];
            populateSection(section_name, qdata, current_last_qid);
        }
    }

}

// Calculate a ranking to handle active display
// Intended to try to bring interesting open questions to the top
function calculateActiveRank(created, bounty, bond) {

    // Everything should be populated with BigNumbers but in the event that something isn't due to some log query issue etc, just skip that question
    const err = ethers.BigNumber.from(0);
    if (typeof created === 'undefined') {
        console.log('calculateActiveRank skipping undefined created');
        return err;
    }
    if (typeof bond === 'undefined') {
        console.log('calculateActiveRank skipping undefined bond');
        return err;
    }
    if (typeof bounty === 'undefined') {
        console.log('calculateActiveRank skipping undefined bounty');
        return err;
    }

    // Initial rank is bounty add bond.
    // Bond is uprated by 4 times compared to reward
    let rank = bounty.add(bond.mul(ethers.BigNumber.from(4)));

    const now = new Date();
    const now_bn = ethers.BigNumber.from(parseInt(now.getTime() / 1000));
    const age = now_bn.sub(created);

    // Scale up anything under 24 hours so that 10 mins counts as 0.01 ETH of reward,  or 0.002 of bond
    if (age.lt(ethers.BigNumber.from(86400))) {
        const secs = ethers.BigNumber.from(86400).sub(age);
        const boost = secs.div(ethers.BigNumber.from(600)).mul(ethers.BigNumber.from(""+TOKEN_INFO[TOKEN_TICKER]['small_number']));
        rank = rank.add(boost);
    }

    // Anything else goes by time posted
    rank = rank.add(created);

    // console.log('rank', rank.toNumber());
    return rank;

}

async function handleQuestion(item, fetched_ms) {

    const question_id = item.questionId;

    const contract = item.contract;
    //console.log('in handleQuestionLog', question_id);
    const created = item.createdTimestamp;

    // Populate with the data we got
    //console.log('before filling in handleQuestionLog', QUESTION_DETAIL_CACHE[question_id]);
    let question = filledQuestion(item, fetched_ms);
    if (!question) {
        console.log('skipping unparseable question', question.question_id);
        return;
    }
    updateQuestionWindowIfOpen(question);

//console.log('filledQuestion', question);
    //console.log('after filling in handleQuestionLog', QUESTION_DETAIL_CACHE[question_id]);

    // Then fetch anything else we need to display
//    question = await ensureQuestionDetailFetched(contract, question_id, 1, 1, item.blockNumber, -1)

    // console.log('updateQuestionWindowIfOpen after ensureQuestionDetailFetched for', contract, question_id, 'returned', question, 'block num is', item.blockNumber );
    // updateQuestionWindowIfOpen(question);

    if (CATEGORY && question.question_json.category != CATEGORY) {
        //console.log('mismatch for cat', category, question.question_json.category);
        return;
    } else {
        //console.log('category match', category, question.question_json.category);
    }

    const is_finalized = isFinalized(question);

    // Pending arbitration doesn't exactly fit but it fits better than the other categories
    const is_before_opening = isQuestionBeforeOpeningDate(question) || isArbitrationPending(question);
    const bounty = question.bounty;
    const opening_ts = question.opening_ts;

    if (is_finalized) {

        const insert_before = update_ranking_data('questions-resolved', contractQuestionID(question), question.finalization_ts, 'desc');
        if (insert_before !== -1) {
            // TODO: If we include this we have to handle the history too
            populateSection('questions-resolved', question, insert_before);
            $('#questions-resolved').find('.scanning-questions-category').css('display', 'none');
            if (DISPLAY_ENTRIES['questions-resolved']['ids'].length > 3 && $('#questions-resolved').find('.loadmore-button').css('display') == 'none') {
                $('#questions-resolved').find('.loadmore-button').css('display', 'block');
            }
        }

    } else if (is_before_opening) {

        const insert_before = update_ranking_data('questions-upcoming', contractQuestionID(question), opening_ts, 'asc');
        if (insert_before !== -1) {
            populateSection('questions-upcoming', question, insert_before);
            $('#questions-upcoming').find('.scanning-questions-category').css('display', 'none');
            if (DISPLAY_ENTRIES['questions-upcoming']['ids'].length > 3 && $('#questions-upcoming').find('.loadmore-button').css('display') == 'none') {
                $('#questions-upcoming').find('.loadmore-button').css('display', 'block');
            }
        }

    } else {

        if (!question.is_pending_arbitration) {
            const insert_before = update_ranking_data('questions-active', contractQuestionID(question), calculateActiveRank(created, question.bounty, question.bond), 'desc');
            if (insert_before !== -1) {
                populateSection('questions-active', question, insert_before);
                $('#questions-active').find('.scanning-questions-category').css('display', 'none');
                if (DISPLAY_ENTRIES['questions-active']['ids'].length > 3 && $('#questions-active').find('.loadmore-button').css('display') == 'none') {
                    $('#questions-active').find('.loadmore-button').css('display', 'block');
                }
            }
        }

        if (isAnswered(question)) {
            const insert_before = update_ranking_data('questions-closing-soon', contractQuestionID(question), question.finalization_ts, 'asc');
            if (insert_before !== -1) {
                populateSection('questions-closing-soon', question, insert_before);
                $('#questions-closing-soon').find('.scanning-questions-category').css('display', 'none');
                if (DISPLAY_ENTRIES['questions-closing-soon']['ids'].length > 3 && $('#questions-closing-soon').find('.loadmore-button').css('display') == 'none') {
                    $('#questions-closing-soon').find('.loadmore-button').css('display', 'block');
                }
            }
        }

    }

    reflectDisplayEntryChanges();

}

// Inserts into the right place in the stored rankings.
// If it comes after another stored item, return the ID of that item.
// If it doesn't belong in storage because it is too low for the ranking, return -1
// TODO: ??? If it is already in storage and does not need to be updated, return -2
function update_ranking_data(arr_name, id, val, ord) {

    // Check if we already have it
    const existing_idx = DISPLAY_ENTRIES[arr_name]['ids'].indexOf(id);
    if (existing_idx !== -1) {
        //console.log('not found in list');

        // If it is unchanged, return a code saying there is nothing to do
        if (val.eq(DISPLAY_ENTRIES[arr_name]['vals'][existing_idx])) {
            //console.log('nothing to do, val was unchanged at', val, DISPLAY_ENTRIES[arr_name]['vals'][existing_idx]);
            return -1; // TODO: make this -2 so the caller can handle this case differently?
        }

        // If we are already in the list and have the same value, remove and try to add again
        // This can happen if the variable we sort by is updated
        DISPLAY_ENTRIES[arr_name]['ids'].splice(existing_idx, 1);
        DISPLAY_ENTRIES[arr_name]['vals'].splice(existing_idx, 1);
    }

    //console.log('update_ranking_data', arr_name, id, val.toString());
    const arr = DISPLAY_ENTRIES[arr_name]['vals']
        //console.log('start with array ', arr);

    const max_entries = DISPLAY_ENTRIES[arr_name]['max_store'];

    // If the list is full and we're lower, give up
    if (arr.length >= max_entries) {
        //console.log('list full and lower, give up');
        const last_entry = arr[arr.length - 1];
        if (last_entry.gte(val)) {
            //  console.log('we are full and last entry is at least as high')
            return -1;
        }
    }

    // go through from the top until we find something we're higher than
    for (let i = 0; i < arr.length; i++) {
        //console.log('see if ', val.toString(), ' is at least as great as ', arr[i].toString());
        if ((ord == 'desc' && val.gte(arr[i])) || (ord == 'asc' && val.lte(arr[i]))) {
            // found a spot, we're higher than the current occupant of this index
            // we'll return its ID to know where to insert in the document
            const previd = DISPLAY_ENTRIES[arr_name]['ids'][i];

            //console.log('found, splice in before ', previd, 'old', val.toString(), 'new', arr[i].toString());

            // insert at the replaced element's index, bumping everything down
            DISPLAY_ENTRIES[arr_name]['ids'].splice(i, 0, id);
            DISPLAY_ENTRIES[arr_name]['vals'].splice(i, 0, val);

            // if the array is now too long, dump the final element
            if (arr.length > max_entries) {
                DISPLAY_ENTRIES[arr_name]['ids'].pop();
                DISPLAY_ENTRIES[arr_name]['vals'].pop();
            }
            return previd;
        }

    }

    //console.log('not found, add to end');
    // lower than everything but there's still space, so add to the end
    DISPLAY_ENTRIES[arr_name]['ids'].push(id);
    DISPLAY_ENTRIES[arr_name]['vals'].push(val);
    return null;

}

/*-------------------------------------------------------------------------------------*/
// question detail window

function initQuestionTypeUI() {

    $(document).on('change', '.question-type', function(e) {
        const win = $(this).closest('.rcbrowser');
        const container = win.find('.answer-option-container');
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
        const win = $(this).closest('.rcbrowser');
        const element = $('<div>');
        element.addClass('input-container input-container--answer-option');
        const input = '<input type="text" name="editOption0" class="rcbrowser-input answer-option form-item" placeholder="Enter an answer...">';
        element.append(input);
        win.find('.error-container--answer-option').before(element);
        element.addClass('is-bounce');
        Ps.update(win.find('.rcbrowser-inner').get(0));
    });

}

initQuestionTypeUI();


$(document).on('click', '.questions__item__title', function(e) {
    if ($(e.target).hasClass('more-link') || $(e.target).hasClass('less-link')) {
        return true;
    }

    e.preventDefault();
    e.stopPropagation();

    updateLastActionTS();

    const contract_question_id = $(this).closest('.questions__item').attr('data-contract-question-id');

console.log('open window', contract_question_id);
    // Should repopulate and bring to the front if already open
    openQuestionWindow(contract_question_id);

});

$(document).on('click', '.mini-action-link', function(e) {
    e.preventDefault();
    e.stopPropagation();

    updateLastActionTS();

    const contract_question_id = $(this).closest('.questions__item').attr('data-contract-question-id');

    // Should repopulate and bring to the front if already open
    openQuestionWindow(contract_question_id);

});

$(document).on('click', '.your-qa__questions__item', function(e) {
    if ($(e.target).hasClass('more-link') || $(e.target).hasClass('less-link')) {
        return true;
    }

    updateLastActionTS();

    e.preventDefault();
    e.stopPropagation();

    const contract_question_id = $(this).closest('.your-qa__questions__item').attr('data-contract-question-id');

    openQuestionWindow(contract_question_id);

});

function parseContractQuestionID(id, fallback_contract) {
    // console.log('fallback_contract', fallback_contract);
    id = id.toLowerCase();
    const bits = id.split('-');
    if (bits.length === 2) {
        return bits; 
    }
    if (bits.length === 1) {
        // console.log('try fallback');
        if (fallback_contract) {
            console.log('using fallback contract');
            return [fallback_contract.toLowerCase(), bits[0]]; 
        }
    } else {
        console.log('bits length was', bits.length, bits);
        throw new Error("Could not parse contract-question-id " + id); 
    }
}

function contractQuestionID(question) {
    return cqToID(question.contract, question.question_id);
}

function ctToId(contract, template_id) {
    const template_id_hex = ethers.BigNumber.from(template_id).toHexString(); // TODO: Check padding etc with bigger numbers
    return contract.toLowerCase() + template_id_hex;
}

function cqToID(contract, question_id) {
    return contract.toLowerCase() + '-' + question_id.toLowerCase();
}

async function openQuestionWindow(contract_question_id) {

    const [contract_addr, question_id] = parseContractQuestionID(contract_question_id);

    // console.log('quick load');
    // To respond quickly, start by fetching with even fairly old data and no logs
    let question = await ensureQuestionDetailFetched(contract_addr, question_id, 60*60*24*1000);

    displayQuestionDetail(question);

    // Get the window open first with whatever data we have
    // Then repopulate with the most recent of everything anything has changed
    console.log('Refetching with minimal caching to be sure');
    question = await ensureQuestionDetailFetched(contract_addr, question_id, 1000);
    updateQuestionWindowIfOpen(question);
}

function updateQuestionWindowIfOpen(question) {

    const window_id = 'qadetail-' + contractQuestionID(question);
    let rcqa = $('#' + window_id);
    if (rcqa.length) {
    console.log('updateQuestionWindowIfOpen', question);
        rcqa = populateQuestionWindow(rcqa, question, true);
    }

}

function displayQuestionDetail(question_detail) {

    const question_id = question_detail.question_id;
    const contract_question_id = contractQuestionID(question_detail);
    //console.log('question_id', question_id);

    // If already open, refresh and bring to the front
    const window_id = 'qadetail-' + contract_question_id
    let rcqa = $('#' + window_id);
    if (rcqa.length) {
        rcqa = populateQuestionWindow(rcqa, question_detail, true);
        rcqa.css('z-index', ++ZINDEX);
    } else {
        rcqa = $('.rcbrowser--qa-detail.template-item').clone();
        rcqa.attr('id', window_id);
        rcqa.attr('data-contract-question-id', contract_question_id);

        rcqa.find('.rcbrowser__close-button').on('click', function() {
            let parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
            let left = parseInt(parent_div.css('left').replace('px', ''));
            let top = parseInt(parent_div.css('top').replace('px', ''));
            let data_x = (parseInt(parent_div.attr('data-x')) || 0);
            let data_y = (parseInt(parent_div.attr('data-y')) || 0);
            left += data_x;
            top += data_y;
            WINDOW_POSITION[contract_question_id] = {
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
        rcqa.css('z-index', ++ZINDEX);
        rcqa.css('height', "80%");
        rcqa.css('max-height', "80%");
        setRcBrowserPosition(rcqa);
        Ps.initialize(rcqa.find('.rcbrowser-inner').get(0));
    }

    // console.log('set_hash_param', contractQuestionID(question_detail));
    set_hash_param({'question': contractQuestionID(question_detail)});

}

function setupDatetimeDatePicker(rcqa) {

    let precision = rcqa.attr('data-datetime-precision');
    if (!precision) {
        precision = 'd';
    }
    const date_format = (precision == 'Y') ? 'yy' : ( (precision == 'm') ? 'yy-mm' : 'yy-mm-dd' )

    if (precision == 'H' || precision == 'i' || precision == 's') {
        rcqa.addClass('has-time-input');
        const plh = {
            'H': '00',
            'i': '00:00',
            's': '00:00:00'
        }
        rcqa.find('input.datetime-input-time').attr('placeholder', plh[precision]).attr('maxlength', plh[precision].length);;
    }

    const dtplh = {
        'Y': '2000',
        'm': '2000-01',
        'd': '2000-01-01',
        'H': '2000-01-01',
        'i': '2000-01-01',
        's': '2000-01-01'
    }
    rcqa.find('input.datetime-input-date').attr('placeholder', dtplh[precision]).attr('maxlength', dtplh[precision].length).attr('data-precision', precision);

    // TODO: Set the precision of the date and use it for date and time
    if (rcqa.find('[name="input-answer"]').hasClass('rcbrowser-input--date--answer')) {
        rcqa.find('[name="input-answer"]').datepicker({
            dateFormat: date_format,
            beforeShow: function(input, inst) {
                if ($(this).closest('.input-container').hasClass('invalid-selected')) {
                    return false;
                }
            }, 
            onSelect: function(dateText) {
                $(this).closest('.input-container').removeClass('is-error');
            }
        });
    }

}

function category_text(question_json, target_el) {
    const cat = question_json['category'];
    let cat_txt = '';
    if (cat == '') {
        cat_txt = 'Unassigned';
    } else {
        cat_txt = $("#filter-list").find("[data-category='" + cat + "']").text();
        if (cat_txt == '') {
            cat_txt = '"' + cat + '"';
        }
    }
    if (target_el) {
        cat_txt = target_el.attr('data-prefix-text') + cat_txt;
    }
    return cat_txt;
}

// Returns arbitration metadata from the cache
// Assumes it's already been loaded
function arbitrationMetaDataFromCache(arb_addr) {
    if (arb_addr.toLowerCase() in ARBITRATOR_METADATA) {
        //console.log('found metadata for', arb_addr);
        return ARBITRATOR_METADATA[arb_addr.toLowerCase()];
    }
    if (arb_addr.toLowerCase() == '0x0000000000000000000000000000000000000000') {
        return {};
    }
    //console.log('no metadata for', arb_addr, ARBITRATOR_METADATA);
    return null;
}

async function loadArbitratorMetaData(arb_addr) {
    const cached_md = arbitrationMetaDataFromCache(arb_addr);
    if (cached_md) {
        return cached_md;
    }
    //console.log('fetching metadata for arbitrator', arb_addr);
    let metadata_json = {};
    try {
        const arb = ARBITRATOR_INSTANCE.attach(arb_addr);
        const md_arr = await arb.functions.metadata();
        const md = md_arr[0];
        try {
            if (md != '' && md != ' ') {
                metadata_json = JSON.parse(md);
            }
        } catch (e) {
            console.log('arbitrator', arb_addr, 'returned some metadata but it could not be parsed:', md);
        }
    } catch (e) {
        console.log('Got an error trying to fetch arbitrator metadata, this is expected with some arbitrators', arb_addr);
    }
    ARBITRATOR_METADATA[arb_addr.toLowerCase()] = metadata_json;
    // console.log('loaded metadata', arb_addr, metadata_json);
    return metadata_json;
}

function isTitleLong(title) {
    if (title.length > 300) {
        return true;
    }
    const words = title.split(' ');
    for (let i=0; i<words.length; i++) {
        if (words[i].length > 50) {
            return true;
        }
    }
    return false;
}

function populateQuestionWindow(rcqa, question_detail, is_refresh) {

    // console.log('populateQuestionWindow with detail ', question_detail, is_refresh);
    const question_id = question_detail.question_id;
    const question_json = question_detail.question_json;
    const question_type = question_json['type'];

    //console.log('current list last item in history, which is ', question_detail['history'])
    const idx = question_detail['history'].length - 1;

    if (question_detail.has_invalid_option) {
        rcqa.addClass('has-invalid-option');
    }
    if (question_detail.has_too_soon_option) {
        rcqa.addClass('has-too-soon-option');
    }

    const cat_el = rcqa.find('.rcbrowser-main-header-category');
    cat_el.text(category_text(question_json, cat_el)); 

    let date = new Date();
    date.setTime(question_detail.creation_ts * 1000);
    const date_str = MONTH_LIST[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

    rcqa.find('.rcbrowser-main-header-date').text(date_str);

    if (isTitleLong(question_json['title'])) {
        rcqa.addClass('long-title')
    } else {
        rcqa.removeClass('long-title')
    }
    rcqa.find('.question-title').text(question_json['title']).expander({
        slicePoint: 200
    });
    rcqa.find('.reward-value').text(decimalizedBigNumberToHuman(question_detail.bounty));

    if (question_detail.block_mined > 0) {
        rcqa.removeClass('unconfirmed-transaction').removeClass('has-warnings');
    }

    const metadata = arbitrationMetaDataFromCache(question_detail.arbitrator);
    if (metadata && 'tos' in metadata && metadata['tos']) {
        populateTOSSection(rcqa, metadata['tos']);
    } else {
        populateTOSSection(rcqa, null);
    }

    let bond = ethers.BigNumber.from(""+TOKEN_INFO[TOKEN_TICKER]['small_number']).div(2);
    if (question_detail.min_bond && question_detail.min_bond.gt(0)) {
        bond = question_detail.min_bond.div(2);
    } else if (question_detail.bounty && question_detail.bounty.gt(0)) {
        bond = question_detail.bounty.div(2);
    }

    if (isReopenable(question_detail)) {
        rcqa.addClass('reopenable').removeClass('reopened');
        console.log('add reopen section');
    } else {
        rcqa.removeClass('reopenable');
        if (question_detail.reopened_by) {
            rcqa.attr('data-reopened-by-question-id', question_detail.reopened_by);
            rcqa.addClass('reopened');
        } else {
            rcqa.removeClass('reopened');
        }
    }

    if (question_detail.reopener_of_question_id) {
        rcqa.addClass('reopener');
        rcqa.attr('data-reopener-of-question-id', question_detail.reopener_of_question_id);
    }

    if (isAnswerActivityStarted(question_detail)) {

        const current_container = rcqa.find('.current-answer-container');

        if (isAnswered(question_detail)) {
            // label for show the current answer.
            const label = rc_question.getAnswerString(question_json, question_detail.best_answer);
            current_container.find('.current-answer-body').find('.current-answer').text(label);
        }

        bond = question_detail.bond;

        if (question_detail['history'].length) {
            //console.log('updateing aunswer');
            const current_answer = historyItemForCurrentAnswer(question_detail);
            if (current_answer) {
                //console.log('current_answer is ', current_answer);
                current_container.attr('id', 'answer-' + current_answer.answer);

                timeago.cancel(current_container.find('.current-answer-item').find('.timeago')); // cancel the old timeago timer if there is one
                current_container.find('.current-answer-item').find('.timeago').attr('datetime', rc_question.convertTsToString(current_answer.ts));
                timeAgo.render(current_container.find('.current-answer-item').find('.timeago'));

                // answerer data
                const ans_data = rcqa.find('.current-answer-container').find('.answer-data');
                ans_data.find('.answerer').text(current_answer.user);
                const avjazzicon = jazzicon(32, parseInt(current_answer.user.toLowerCase().slice(2, 10), 16));
                ans_data.find('.answer-data__avatar').html(avjazzicon);
                if (current_answer.user == ACCOUNT) {
                    ans_data.addClass('current-account');
                } else {
                    ans_data.removeClass('current-account');
                }
                ans_data.find('.answer-bond-value').text(decimalizedBigNumberToHuman(current_answer.bond));
            }

            const last_ans = question_detail['history'][idx];
            const unrevealed_answer_container = rcqa.find('.unrevealed-top-answer-container');
            if (last_ans.is_commitment && !last_ans.revealed_block) {
                unrevealed_answer_container.find('.answer-bond-value').text(decimalizedBigNumberToHuman(last_ans.bond));
                unrevealed_answer_container.find('.reveal-time.timeago').attr('datetime', rc_question.convertTsToString(commitExpiryTS(question_detail, last_ans['ts'])));
                timeAgo.render(unrevealed_answer_container.find('.reveal-time.timeago'));
                unrevealed_answer_container.find('.answerer').text(last_ans['user']);
                const avjazzicon = jazzicon(32, parseInt(last_ans['user'].toLowerCase().slice(2, 10), 16));
                unrevealed_answer_container.find('.answer-data__avatar').html(avjazzicon);
            } else {
                unrevealed_answer_container.find('.answer-bond-value').text('');
                unrevealed_answer_container.find('.reveal-time.timeago').attr('datetime', 0);
                unrevealed_answer_container.find('.answer-data__avatar').html('');
                unrevealed_answer_container.find('.answerer').text('');
                timeago.cancel(unrevealed_answer_container.find('.reveal-time.timeago')); 
            }

            // TODO: Do duplicate checks and ensure order in case stuff comes in weird
            for (let i = 0; i < idx; i++) {
                const ans = question_detail['history'][i];
                const hist_id = 'question-window-history-item-' + uiHash(question_id + ans.answer + ans.bond.toHexString());
                if (rcqa.find('#' + hist_id).length) {
                    //console.log('already in list, skipping', hist_id, ans);
                    continue;
                }
                //console.log('not already in list, adding', hist_id, ans);
                const hist_tmpl = rcqa.find('.answer-item.answered-history-item.template-item');
                const hist_item = hist_tmpl.clone();
                hist_item.attr('id', hist_id);
                hist_item.find('.answerer').text(ans['user']);

                const avjazzicon = jazzicon(32, parseInt(ans['user'].toLowerCase().slice(2, 10), 16));

                hist_item.find('.answer-data__avatar').html(avjazzicon);

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

                hist_item.find('.answer-bond-value').text(decimalizedBigNumberToHuman(ans.bond));
                hist_item.find('.answer-time.timeago').attr('datetime', rc_question.convertTsToString(ans['ts']));
                timeAgo.render(hist_item.find('.answer-time.timeago'));
                hist_item.removeClass('template-item');
                hist_tmpl.after(hist_item);
            }

        }
    }

    rcqa.find('.bond-value').text(decimalizedBigNumberToHuman(question_detail.bond));
    // Set the dispute value on a slight delay
    // This ensures the latest entry was updated and the user had time to see it when arbitration was requested
    window.setTimeout(function() {
        rcqa.find('.arbitration-button').attr('data-last-seen-bond', question_detail.bond.toHexString());
    }, 2000);

    // question settings warning balloon
    let balloon_html = '';
    if (question_detail.timeout < 86400) {
        balloon_html += 'The timeout is very low.<br /><br />This means there may not be enough time for people to correct mistakes or lies.<br /><br />';
    }
    if (isFinalized(question_detail) && question_detail.bounty.add(question_detail.bond).lt(ethers.BigNumber.from(""+TOKEN_INFO[TOKEN_TICKER]['small_number']))) {
        balloon_html += 'The reward was very low and no substantial bond was posted.<br /><br />This means there may not have been enough incentive to post accurate information.<br /><br />';
    }
    let valid_arbirator = isArbitratorValid(question_detail.arbitrator);

    if (ARBITRATOR_FAILED_BY_CONTRACT[question_detail.contract.toLowerCase()] && ARBITRATOR_FAILED_BY_CONTRACT[question_detail.contract.toLowerCase()][question_detail.arbitrator.toLowerCase()]) {
        rcqa.addClass('failed-arbitrator');
    }

    if (!valid_arbirator) {
        balloon_html += 'We do not recognize this arbitrator.<br />Do not believe this information unless you trust them.';
    }
    if (balloon_html) {
        rcqa.find('.question-setting-warning').css('display', 'block');
        rcqa.find('.question-setting-warning').find('.balloon').css('z-index', ++ZINDEX);
        rcqa.find('.question-setting-warning').find('.balloon').html(balloon_html);
    }

    let questioner = question_detail.question_creator
    let timeout = question_detail.timeout;
    let balloon = rcqa.find('.question-setting-info').find('.balloon')
    balloon.find('.setting-info-bounty').text(decimalizedBigNumberToHuman(question_detail.bounty));
    balloon.find('.setting-info-min-bond').text(decimalizedBigNumberToHuman(question_detail.min_bond));
    balloon.find('.setting-info-bond').text(decimalizedBigNumberToHuman(question_detail.bond));
    balloon.find('.setting-info-timeout').text(rc_question.secondsTodHms(question_detail.timeout));
    balloon.find('.setting-info-content-hash').text(question_detail.content_hash);
    balloon.find('.setting-info-question-id').text(question_detail.question_id);
    balloon.find('.setting-info-contract-address').text(question_detail.contract);
    balloon.find('.setting-info-arbitrator').text(arbitratorAddressToText(question_detail.contract, question_detail.arbitrator));
    balloon.find('.setting-info-questioner').text(questioner);
    balloon.find('.setting-info-created-ts').text(new Date(question_detail.creation_ts*1000).toUTCString().replace('GMT', 'UTC'));
    let opening_ts_str = 'Unset';
    if (question_detail.opening_ts.gt(0)) {
        opening_ts_str = new Date(question_detail.opening_ts*1000).toUTCString().replace('GMT', 'UTC');
    }
    balloon.find('.setting-info-opening-ts').text(opening_ts_str);
    balloon.css('z-index', ++ZINDEX);

    const unconfirmed_container = rcqa.find('.unconfirmed-answer-container');
    if (question_detail['history_unconfirmed'].length) {

        const unconfirmed_answer = question_detail['history_unconfirmed'][question_detail['history_unconfirmed'].length - 1];

        const txid = unconfirmed_answer.txid;
        unconfirmed_container.find('.pending-answer-txid a').attr('href', BLOCK_EXPLORER + '/tx/' + txid);
        unconfirmed_container.find('.pending-answer-txid a').text(txid.substr(0, 12) + "...");
        unconfirmed_container.attr('data-pending-txid', txid);

        timeago.cancel(unconfirmed_container.find('.unconfirmed-answer-item').find('.timeago')); // cancel the old timeago timer if there is one
        unconfirmed_container.find('.unconfirmed-answer-item').find('.timeago').attr('datetime', rc_question.convertTsToString(unconfirmed_answer.ts));
        timeAgo.render(unconfirmed_container.find('.unconfirmed-answer-item').find('.timeago'));

        // answerer data
        const ans_data = rcqa.find('.unconfirmed-answer-container').find('.answer-data');
        ans_data.find('.answerer').text(unconfirmed_answer.user);
        const avjazzicon = jazzicon(32, parseInt(unconfirmed_answer.user.toLowerCase().slice(2, 10), 16));
        ans_data.find('.answer-data__avatar').html(avjazzicon);
        if (unconfirmed_answer.user == ACCOUNT) {
            ans_data.addClass('unconfirmed-account');
        } else {
            ans_data.removeClass('unconfirmed-account');
        }
        ans_data.find('.answer-bond-value').text(decimalizedBigNumberToHuman(unconfirmed_answer.bond));

        // label for show the unconfirmed answer.
        const label = rc_question.getAnswerString(question_json, unconfirmed_answer.answer);
        unconfirmed_container.find('.unconfirmed-answer-body').find('.unconfirmed-answer').text(label);

        rcqa.addClass('has-unconfirmed-answer');

    } else {

        rcqa.removeClass('has-unconfirmed-answer');

    }

    // Arbitrator
    if (question_detail.arbitrator.toLowerCase() == question_detail.contract.toLowerCase()) {
        rcqa.addClass('no-arbitrator');
    } else if (!isArbitrationPending(question_detail) && !isFinalized(question_detail)) {
        console.log('getting arb stuff')
        const arb = ARBITRATOR_INSTANCE.attach(question_detail.arbitrator);
        // Normal arbitrators should respond correctly to getDisputeFee()
        arb.functions.getDisputeFee(question_id).then(function(fee_arr) {
            const fee = fee_arr[0];
            console.log('got arbitration fee, rendering', fee)
            //rcqa.find('.arbitrator').text(question_detail.arbitrator);
            rcqa.find('.arbitration-fee').text(decimalizedBigNumberToHuman(fee, true));
            rcqa.find('.arbitration-button').removeClass('unpopulated');
            if (CHAIN_INFO.nativeCurrency && CHAIN_INFO.nativeCurrency.symbol) {
                rcqa.find('.token-always-native').text(CHAIN_INFO.nativeCurrency.symbol);
            }
        }).catch(async function(err) {
            // If it doesn't implement the getDisputeFee method, we might want to use foreignProxy
            // If anything about this fails we just mark the arbitrator failed and tell the user to be careful.
            // TODO: We should really be initially loading the metadata
            // This will tell us if we have a foreign proxy or not

            // Non-standard arbitrators should tell us how they're non-standard with their metadata
            // console.log('caught error with getDisputeFee, question was', question_detail, err);
            const metadata = await loadArbitratorMetaData(question_detail.arbitrator);
            if (metadata.foreignProxy) {
                const fp_abi = [
                  "function foreignProxy() view returns (address)",
                  "function foreignChainId() view returns (uint256)"
                ];
                const fpArb = new ethers.Contract(question_detail.arbitrator, fp_abi, provider);
                const foreign_proxy_arr = await fpArb.functions.foreignProxy();
                const foreign_proxy = foreign_proxy_arr[0];
                console.log('using foreign proxy', foreign_proxy);
                const foreign_chain_id_arr = await fpArb.functions.foreignChainId()
                const foreign_chain_id = foreign_chain_id_arr[0].toNumber();
                const btn = rcqa.find('.arbitration-button-foreign-proxy');
                btn.click(async function(evt) {
                    evt.preventDefault();
                    evt.stopPropagation();

                    updateLastActionTS();

                    const question_latest = await ensureQuestionDetailFetched(question_detail.contract, question_detail.question_id, 1, 1, CURRENT_BLOCK_NUMBER, CURRENT_BLOCK_NUMBER);
                    if (!question_latest) {
                        console.log('Error, question detail not found');
                        return false;
                    }
                    if (question_latest.bond.eq(0)) {
                        $('body').addClass('error-request-arbitration-without-answer-error').addClass('error');
                        return false;
                    }
                    const url_data = question_latest;
                    url_data['network_id'] = foreign_chain_id
                    url_data['foreign_proxy'] = foreign_proxy;
                    //delete url_data['history_unconfirmed'];
                    console.log('fpwin', url_data);
                    const proxy_url = 'index.html#!/foreign-proxy/' + encodeURIComponent(JSON.stringify(url_data));
                    console.log('proxy_url', proxy_url);
                    window.open(proxy_url);
                });
                btn.removeClass('unpopulated').attr('data-foreign-proxy', foreign_proxy).attr('data-foreign-chain-id', foreign_chain_id);
            } else {
                // If it doesn't implement foreign proxy either, it's a contract or address without the proper interface.
                // console.log('arbitrator failed with error', err);
                markArbitratorFailed(question_detail.contract, question_detail.arbitrator, contractQuestionID(question_detail));
            }
        });
    }

    if (isQuestionBeforeOpeningDate(question_detail)) {
        rcqa.find('.add-reward-button').removeClass('is-open')
    } else {
        rcqa.find('.add-reward-button').addClass('is-open')
    }
    
    if (!is_refresh) {
        // answer form
        const ans_frm = makeSelectAnswerInput(question_json, question_detail.opening_ts.toNumber(), question_detail.has_invalid_option, question_detail.has_too_soon_option);
        ans_frm.addClass('is-open');
        ans_frm.removeClass('template-item');
        rcqa.find('.answered-history-container').after(ans_frm);
    }

    // If the user has edited the field, never repopulate it underneath them
    const bond_field = rcqa.find('.rcbrowser-input--number--bond.form-item');
    if (!bond_field.hasClass('edited')) {
        // console.log('min bond /2', bond.toString());
        bond_field.val(decimalizedBigNumberToHuman(bond.mul(2)));
    }

    rcqa = updateQuestionState(question_detail, rcqa);

    if (isFinalized(question_detail)) {
        const tot = totalClaimable(question_detail);
        if (tot.eq(0)) {
            rcqa.removeClass('is-claimable');
        } else {
            rcqa.addClass('is-claimable');
            rcqa.find('.answer-claim-button .claimable-eth').text(decimalizedBigNumberToHuman(tot));
        }
    } else {
        rcqa.removeClass('is-claimable');
    }

    if (question_json.type == 'datetime') {
        let precision = 'd';
        if ('precision' in question_json) {
            precision = question_json['precision']; 
        }
        rcqa.attr('data-datetime-precision', precision);
    }
    
    setupDatetimeDatePicker(rcqa);

    //console.log(claimableItems(question_detail));

    return rcqa;

}

function totalClaimable(question_detail) {
    const poss = possibleClaimableItems(question_detail);
    return poss['total'];
}

function possibleClaimableItems(question_detail) {

    let ttl = ethers.BigNumber.from(0);
    let is_your_claim = false;

    if (ethers.BigNumber.from(question_detail.history_hash).eq(0)) {
        //console.log('everything already claimed', question_detail.history_hash);
        return {
            total: ethers.BigNumber.from(0)
        };
    }

    if (!isFinalized(question_detail)) {
        //console.log('not finalized', question_detail);
        return {
            total: ethers.BigNumber.from(0)
        };
    }

    //console.log('should be able to claim question ', question_detail);
    //console.log('history_hash', question_detail.history_hash);

    let question_ids = [];
    let answer_lengths = [];
    let claimable_bonds = [];
    let claimable_answers = [];
    let claimable_answerers = [];
    let claimable_history_hashes = [];

    let is_first = true;
    let num_claimed = 0;
    let is_yours = false;

    let final_answer = question_detail.best_answer;
    if (final_answer == null) {
        console.log('skipping item with no final answer due to commit-reveal stuff');
        return {
            total: ethers.BigNumber.from(0)
        };
    }



//console.log('final_answer', question_detail.best_answer, question_detail);
    for (let i = question_detail['history'].length - 1; i >= 0; i--) {

        // TODO: Check the history hash, and if we haven't reached it, keep going until we do
        // ...since someone may have claimed partway through

        // console.log('considering claimable from', question_detail['history'][i]);
        let answer = null;
        // Only set on reveal, otherwise the answer field still holds the commitment ID for commitments
        if (question_detail['history'][i].commitment_id) { 
            answer = question_detail['history'][i].commitment_id;
        } else {
            answer = question_detail['history'][i].answer;
        }
        const answerer = question_detail['history'][i].user;
        const bond = question_detail['history'][i].bond;
        const history_hash = question_detail['history'][i].history_hash;

        const is_answerer_you = (ACCOUNT && (answerer.toLowerCase() == ACCOUNT.toLowerCase()));
        if (is_yours) {
            // Somebody takes over your answer
            if (!is_answerer_you && final_answer == answer) {
                is_yours = false;
                //console.log(ttl.toString(), 'sub', bond.toString());
                ttl = ttl.sub(bond); // pay them their bond
            } else {
                //console.log(ttl.toString(), 'add', bond.toString());
                ttl = ttl.add(bond); // take their bond
            }
        } else {
            // You take over someone else's answer
//console.log('compare answers', final_answer, answer);
            if (is_answerer_you && final_answer == answer) {
                is_yours = true;
                //console.log(ttl.toString(), 'add', bond.toString());
                ttl = ttl.add(bond); // your bond back
            }
        }
        if (is_first && is_yours) {
            // console.log('adding your bounty');
            //console.log(ttl.toString(), 'add', question_detail.bounty.toString());
            ttl = ttl.add(question_detail.bounty);
        }

        claimable_bonds.push(bond);
        claimable_answers.push(answer);
        claimable_answerers.push(answerer);
        claimable_history_hashes.push(history_hash);

        is_first = false;
    }

    // Nothing for you to claim, so return nothing
    if (!ttl.gt(0)) {
    //console.log('claimable returns nothing');
        return {
            total: ethers.BigNumber.from(0)
        };
    }

    question_ids.push(question_detail.question_id);
    answer_lengths.push(claimable_bonds.length);

    //console.log('item 0 should match question', claimable_history_hashes[0], question_detail.history_hash);

    // For the history hash, each time we need to provide the previous hash in the history
    // So delete the first item, and add 0x0 to the end.
    claimable_history_hashes.shift();
    claimable_history_hashes.push("0x0000000000000000000000000000000000000000000000000000000000000000");

    // TODO: Someone may have claimed partway, so we should really be checking against the contract state

    const ret = {
        'txid': null,
        'total': ttl,
        'question_ids': question_ids,
        'answer_lengths': answer_lengths,
        'answers': claimable_answers,
        'answerers': claimable_answerers,
        'bonds': claimable_bonds,
        'history_hashes': claimable_history_hashes
    }

 //   console.log('claimable returns', ret);

    return ret;

}

function renderTimeAgo(i, ts) {
    const old_attr = i.find('.timeago').attr('datetime');
    if (old_attr != '') {
        timeago.cancel(i.find('.timeago'));
    }
    i.find('.timeago').attr('datetime', rc_question.convertTsToString(ts));
    timeAgo.render(i.find('.timeago'));
}

// Anything in the document with this class gets updated
// For when there's a single thing changed, and it's not worth doing a full refresh
function updateAnyDisplay(contract_question_id, txt, cls) {
    $("[data-contract-question-id='" + contract_question_id + "']").find('.' + cls).text(txt);
}

/*
Finds any item with timeago and the given block number
Fetches the timestamp for the block if not already cached
Populates the timestamp attribute
Calls the callback on it
*/
function populateWithBlockTimeForBlockNumber(item, num, cbk) {

    if (BLOCK_TIMESTAMP_CACHE[num]) {
        cbk(item, BLOCK_TIMESTAMP_CACHE[num]);
    } else {
        provider.getBlock('latest', function(err, result) {
            if (err || !result) {
                console.log('getBlock err', err, result);
                return;
            }
            BLOCK_TIMESTAMP_CACHE[num] = result.timestamp
            cbk(item, result.timestamp);
        });
    }

}

function answersByMaxBond(answer_logs) {
    let ans = {};
    for (let i = 0; i < answer_logs.length; i++) {
        const an = answer_logs[i];
        const aval = an.answer;
        const bond = an.bond;
        if (ans[aval] && ans[aval].bond.gt(bond)) {
            continue;
        }
        ans[aval] = an;
    }
    return ans;
}

function resetAccountUI() {
    USER_CLAIMABLE_BY_CONTRACT = {};
    Q_MIN_ACTIVITY_BLOCKS = {};
    $('#your-question-answer-window').find('.account-specific').remove();
    $('.answer-claim-button.claim-all').find('.claimable-eth').text('');
    $('.answer-claim-button.claim-all').hide();
}

function insertNotificationItem(evt, notification_id, ntext, block_number, contract, question_id, is_positive, timestamp) {

    // console.log('insertNotificationItem', evt, notification_id, ntext, block_number, contract, question_id, is_positive, timestamp);

    if ($('.no-notifications-item').length > 0) {
        $('.no-notifications-item').remove();
        $('.see-all-notifications').css('visibility', 'visible');
    }

    const notifications = $('#your-question-answer-window').find('.notifications');
    if (document.getElementById(notification_id)) {
        // Already in the doc;
        return true;
    }

    //console.log('insertNotificationItem has contractd', contract,' from evt', evt);

    const existing_notification_items = notifications.find('.notifications-item');

    const item_to_insert = $('#your-question-answer-window .notifications-template-container .notifications-item.template-item').clone();
    item_to_insert.addClass('notification-event-' + evt);
    item_to_insert.attr('id', notification_id);
    if (question_id) {
        item_to_insert.attr('data-contract-question-id', cqToID(contract, question_id));
    }
    item_to_insert.find('.notification-text').text(ntext).expander();
    item_to_insert.attr('data-timestamp', timestamp);
    item_to_insert.removeClass('template-item').addClass('populated-item');
    item_to_insert.addClass('account-specific');

    // Template item has a positive badge
    // Turn it from green to red if something bad happened
    if (!is_positive) {
        item_to_insert.find('.notification-badge').removeClass('notification-badge--positive').addClass('notification-badge--negative');
    }

    let inserted = false;
    existing_notification_items.each(function() {
        const exi = $(this);
        //console.log('compare', exi.attr('data-block-number'),' with our block number', block_number);
        if (ethers.BigNumber.from(exi.attr('data-timestamp')).lte(ethers.BigNumber.from(timestamp))) {
            exi.before(item_to_insert);
            inserted = true;
            return false;
        }
        return true;
    });

    if (!inserted) {
        notifications.append(item_to_insert);
    }

    renderTimeAgo(item_to_insert, timestamp);

}

// We use the standard ethereum hashing for IDs used in the UI but we could use anything, it's just to make unique IDs
function uiHash(str) {
    return ethers.utils.solidityKeccak256(["string"], [str]);
}

function userInvolvement(question) {
    console.log('TODO: go through this question and find out what the user did');
    if (!ACCOUNT) {
        return false;
    }
    const acc = ACCOUNT.toLowerCase();
    if (question.user.toLowerCase() == acc) {
        //return true;
    }
    for(let i = 0; i< question.history.length; i++) {
       console.log('hh', question.history[i]); 
    }
    return false;

}

// Finalization doesn't create an event (unless triggered by arbitration).
// So add the notification if required based on the (filled) question.
function insertFinalizationNotification(question, q_involvement) {
    // console.log('insert Finalization notification for', question, q_involvement);

    const q_title = question.question_json['title'];
    if (!q_title) {
        console.log('Skipping notification for question with no title', question);
        return;
    }

    let ntext = '';
    if (q_involvement['asked']) {
        ntext = 'A question you asked was finalized - ' + q_title;
    } else if (q_involvement['answered']) {
        ntext = 'A question you answered was finalized - ' + q_title;
    } else if (q_involvement['funded']) {
        ntext = 'A question you funded was finalized - ' + q_title;
    } else if (q_involvement['arbitration']) {
        ntext = 'A question you requested arbitration for was finalized - ' + q_title;
    } else {
        ntext = 'A question you were somehow involved in was finalized - ' + q_title;
    }

    // TODO: see if createdBlock is what we want  - if we don't have the block for finalization then see if we can avoid using blocks completely for ordering notifications
    insertNotificationItem('FinalizeQuestion', 'user-action-finalize-'+contractQuestionID(question), ntext, question.question_created_block, question.contract, question.question_id, true, question.finalization_ts);
}


function renderNotificationsGraph(entry, fetched_ms) {

    // This is the only case that doesn't involve a question
    if (entry.actionType == 'CreateTemplate') {
        ntext = 'You created a template - ' + entry.template.templateId + ': ' + entry.template.questionText;
        insertNotificationItem('CreateTemplate', 'user-action-CreateTemplate-'+entry.id, ntext, entry['createdBlock'], entry.address, null, true, entry['createdTimestamp']);
        return;
    }

    let question = filledQuestion(entry.question, fetched_ms);
    if (!question) {
        console.log('skipping notification for unparseable question');
        return;
    }

    updateClaimableDataForQuestion(question);

    const contract = question.contract;
    const question_id = question.question_id;
    //console.log('renderNotification', action, entry, qdata);

    const question_json = question.question_json;

    const your_qa_window = $('#your-question-answer-window');

    // TODO: Handle whether you asked the question

    let ntext = '';
    const evt = entry['actionType']
    let is_positive = true;
    const notification_id = 'user-action-'+evt+'-'+entry.id;
    // console.log('evt', evt);

    if (!question_json) {
        console.log('missing question_json for question, skipping notification', question);
        return;
    } else if (!question_json['title']) {
        console.log('missing title for question, skipping notification', question, question_json);
        return;
    }

    let q_involvement = {};

    switch (evt) {
        case 'AskQuestion':
            ntext = 'You asked a question - "' + question_json['title'] + '"';
            insertNotificationItem(evt, notification_id, ntext, entry.createdBlock, contract, question.question_id, true, entry['createdTimestamp']);
            renderUserQandA(question, entry); 
            q_involvement['asked'] = true;
            break;

        case 'AnswerQuestion':
            if (entry.user.toLowerCase() == ACCOUNT.toLowerCase()) {
                if (entry.isCommitment && !entry.revealedBlock) {
                    ntext = 'You committed to answering a question - "' + question_json['title'] + '"';
                } else {
                    if (entry.question.user == ACCOUNT) {
                        ntext = 'You answered your own question - "' + question_json['title'] + '"';
                    } else {
                        ntext = 'You answered a question - "' + question_json['title'] + '"';
                    }
                }
                insertNotificationItem(evt, notification_id, ntext, entry.createdBlock, contract, question.question_id, true, entry['createdTimestamp']);
                renderUserQandA(question, entry); 
                q_involvement['answered'] = true;
            } else {
                // We should have all the answers in the question object
                // NB We may have two notifications for this if somebody answers your question, overwriting your answer
                // One of the cases has a tweaked notification ID for this case.
                if (entry.question.user == ACCOUNT) {
                    ntext = 'Someone answered your question - "' + question_json['title'] + '"';;
                    insertNotificationItem(evt, notification_id+'-yourq', ntext, entry.blockNumber, contract, entry.question_id, true, entry['createdTimestamp']);
                }
                // TODO: Handle overwritten or not
                const responses = entry.responses;
                // Find out the point at which you start to care about this
                let is_relevant_from = null;
                for(const resp in responses) {
                    if (resp.user == ACCOUNT) {
                        is_relevant_from = ethers.BigNumber.from(entry.bond);;
                        break;
                    }
                }
                if (is_relevant_from) {
                    const bond = ethers.BigNumber.from(entry.bond);
                    if (bond.gt(is_relevant_from)) {
                        ntext = 'Your answer was overwritten - "' + question_json['title'] + '"';;;
                    }
                }

            }
            break;

        case 'FundAnswerBounty':
            if (entry.user.toLowerCase() == ACCOUNT.toLowerCase()) {
                ntext = 'You added reward - "' + question_json['title'] + '"';
                insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, contract, entry.question_id, true, entry['createdTimestamp']);
                q_involvement['funded'] = true;
            } else {
                ntext = 'Someone added a reward to the question - "' + question_json['title'] + '"';
                insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, contract, entry.question_id, true, entry['createdTimestamp']);
            }
            break;

        case 'RequestArbitration':
            if (entry.user.toLowerCase() == ACCOUNT.toLowerCase()) {
                ntext = 'You requested arbitration - "' + question_json['title'] + '"';
                insertNotificationItem(evt, notification_id, ntext, entry.blockNumber, contract, entry.question_id, true, entry['createdTimestamp']);
                q_involvement['arbitration'] = true;
            } else {
                ntext = 'Someone requested arbitration - "' + question_json['title'] + '"';
            }
            break;
    }

    // There isn't an event for this (except in case of arbitration), so just add a notification if we were involved in the question
    if (isFinalized(question)) {
        insertFinalizationNotification(question, q_involvement);
    }

}

function insertQAItem(contract, question_id, item_to_insert, question_section, block_number, ts) {

    const contract_question_id = cqToID(contract, question_id);
    question_section.find('.your-qa__questions__item[data-contract-question-id=' + contract_question_id + ']').remove();

    const question_items = question_section.find('.your-qa__questions__item');
    let inserted = false;
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

function renderQAItemAnswer(contract, question_id, answer_history, question_json, is_finalized) {
    const question_section = $('#your-question-answer-window').find('.your-qa__questions');
    const answer_section = $('#your-question-answer-window').find('.your-qa__answers');
    const sections = [question_section, answer_section];
    const contract_question_id = cqToID(contract, question_id);

    sections.forEach(function(section) {
        const target = section.find('div[data-contract-question-id=' + contract_question_id + ']');
        if (answer_history.length > 0) {
            let user_answer;
            for (let i = answer_history.length - 1; i >= 0; i--) {
                if (answer_history[i].user.toLowerCase() == ACCOUNT.toLowerCase()) {
                    user_answer = answer_history[i].answer;
                    break;
                }
            }
            let latest_answer = answer_history[answer_history.length - 1].answer;
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

function renderUserQandA(question, entry) {
    const question_id = question.question_id;
    const answer_history = question['history'];

    const question_json = question.question_json;
    const contract_question_id = contractQuestionID(question);

    let question_section;
    if (entry['actionType'] == 'AskQuestion') {
        question_section = $('#your-question-answer-window').find('.your-qa__questions .your-qa__questions-inner');
    } else if (entry['actionType'] == 'AnswerQuestion') {
        question_section = $('#your-question-answer-window').find('.your-qa__answers .your-qa__answers-inner');
    }
    if (question_section.find('.no-your-qa__questions__item').length > 0) {
        question_section.find('.no-your-qa__questions__item').remove();
    }

    const qitem = question_section.find('.your-qa__questions__item.template-item').clone();
    qitem.attr('data-contract-question-id', contract_question_id);
    qitem.find('.question-text').text(question_json['title']).expander();
    qitem.attr('data-block-number', entry.createdBlock);
    qitem.removeClass('template-item');
    qitem.addClass('account-specific');
    insertQAItem(question.contract, question_id, qitem, question_section, question.createdBlock, question.createdTimestamp);

    const is_finalized = isFinalized(question);
    renderQAItemAnswer(question.contract, question_id, answer_history, question_json, is_finalized);

    let date = new Date();
    date.setTime(entry.createdTimestamp * 1000);
    let date_str = MONTH_LIST[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() +
        ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    qitem.find('.item-date').text(date_str);
}

function makeSelectAnswerInput(question_json, opening_ts, has_invalid, has_answered_too_soon) {
    const type = question_json['type'];
    const options = question_json['outcomes'];

    let ans_frm;
    if (opening_ts && isBeforeOpeningDate(opening_ts)) {
        const template_name = '.answer-form-container.before-opening.template-item';
        ans_frm = $(template_name).clone();
        ans_frm.removeClass('template-item');
        ans_frm.find('.opening-time-label .timeago').attr('datetime', rc_question.convertTsToString(opening_ts));
        timeAgo.render(ans_frm.find('.opening-time-label .timeago'));
    } else {
        const template_name = '.answer-form-container.' + question_json['type'] + '.template-item';
        ans_frm = $(template_name).clone();
        ans_frm.removeClass('template-item');

        switch (type) {
            case 'single-select':
                for (let i = 0; i < options.length; i++) {
                    const option_elm = $('<option>');
                    option_elm.val(i);
                    option_elm.text(options[i]);
                    ans_frm.find('.select-answer').find('.invalid-select').before(option_elm);
                }
                break;
            case 'multiple-select':
                for (let i = options.length - 1; i >= 0; i--) {
                    const elmtpl = ans_frm.find('.input-entry.template-item');
                    const elm = elmtpl.clone();
                    elm.removeClass('template-item');
                    const elinput = elm.find('input');
                    elinput.attr('name', 'input-answer');
                    elinput.val(i);
                    const ellabel = elm.find('span');
                    ellabel.text(options[i]);
                    // Here we copy the content and throw away the container
                    elmtpl.after(elm);
                }
                break;
        }
    }

    if (!has_invalid) {
        ans_frm.find('.invalid-select').remove();
    }
    if (!has_answered_too_soon) {
        ans_frm.find('.too-soon-select').remove();
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
            question_window.find('.resolved-at-value').attr('datetime', rc_question.convertTsToString(question.finalization_ts));
            timeAgo.render(question_window.find('.resolved-at-value.timeago')); // TODO: Does this work if we haven't displayed the item yet?
        } else {
            timeago.cancel(question_window.find('.answer-deadline.timeago'));
            question_window.find('.answer-deadline').attr('datetime', rc_question.convertTsToString(question.finalization_ts));
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

function isBeforeOpeningDate(opening_ts) {
    const opening_date = opening_ts * 1000
    const now = new Date();
    
    return now.getTime() < opening_date
}

function isQuestionBeforeOpeningDate(question_detail) {    
    return isBeforeOpeningDate(question_detail.opening_ts.toNumber())
}

// TODO
// This is currently not called, as we just fetch everything back from logs
// Potentially resurrect it with a more efficient flow
// Also potentially do it before confirmation (See issue #44)
function pushWatchedAnswer(answer) {
    const question_id = answer.question_id;
    let already_exists = false;
    const length = QUESTION_DETAIL_CACHE[question_id]['history'].length;

    for (let i = 0; i < length; i++) {
        if (QUESTION_DETAIL_CACHE[question_id]['history'][i].answer == answer.answer) {
            already_exists = true;
            break;
        }
    }

    if (!already_exists) {
        QUESTION_DETAIL_CACHE[question_id]['history'].push(answer);
    }
}

$(document).on('click', '.answer-item', function() {

    updateLastActionTS();

    //console.log('.answer-item clicked');
    if ($(this).find('.answer-data').hasClass('is-bounce')) {
        $(this).find('.answer-data').removeClass('is-bounce');
        $(this).find('.answer-data').css('display', 'none');
    } else {
        $(this).find('.answer-data').addClass('is-bounce');
        $(this).find('.answer-data').css('display', 'block');
    }
});

// Do an initial validity check
function isAnswerInputLookingValid(parent_div, question_json) {

    if (parent_div.find('.invalid-selected').size() > 0) {
        return true;
    }
    if (parent_div.find('.too-soon-selected').size() > 0) {
        return true;
    }

    const answer_element = parent_div.find('[name="input-answer"]');
    if (question_json['type'] == 'uint') {
        if (answer_element.val() == '') {
            console.log('empty number');
            return false;
        } 
    } else if (question_json['type'] == 'bool') {
        if ((answer_element.val() == '') || (answer_element.val() == 'default')) {
            console.log('empty bool');
            return false;
        } 
    } else if (question_json['type'] == 'datetime') {
        const dt_invalids = areDatetimeElementsInvalid(answer_element);            
        if (dt_invalids[0] || dt_invalids[1]) {
            console.log('bad datetime');
            return false;
        }
    }
    return true;

}

function formattedAnswerFromForm(parent_div, question_json) {

    let new_answer;
    const answer_element = parent_div.find('[name="input-answer"]');

    // Selects will just have "invalid" as an option in the pull-down.
    // However, if there is no select we instead use a link underneath the input, and toggle the data-invalid-selected class on the input
    const has_invalid_selection = (answer_element.attr('data-invalid-selected') == '1');
    if (has_invalid_selection) {
        new_answer = rc_question.getInvalidValue(question_json);
        console.log('invalid selected, so submitting the invalid value ', new_answer);
        return new_answer;
    }

    // Selects will just have "invalid" as an option in the pull-down.
    // However, if there is no select we instead use a link underneath the input, and toggle the data-invalid-selected class on the input
    const has_answered_too_soon_select = (answer_element.attr('data-too-soon-selected') == '1');
    if (has_answered_too_soon_select) {
        new_answer = rc_question.getAnsweredTooSoonValue(question_json);
        console.log('answered too soon selected, so submitting the answered too soon value ', new_answer);
        return new_answer;
    }

    if (question_json['type'] == 'multiple-select') {
        let answer_input = [];
        parent_div.find('.input-container--checkbox input[type=checkbox]').each(function() {
            if ($(this).closest('label').hasClass('template-item')) {
                return;
            }
            answer_input.push($(this).is(':checked'));
        });
        new_answer = rc_question.answerToBytes32(answer_input, question_json);
    } else if (question_json['type'] == 'datetime') {
        if (answer_element.val() == '') {
            return null;
        }
        const ts = datetimeElementToTS(answer_element);
        new_answer = rc_question.answerToBytes32(ts, question_json);
    } else {
        new_answer = rc_question.answerToBytes32(answer_element.val(), question_json);
    }
    console.log('submitting answer', new_answer);
    return new_answer;

}

function areDatetimeElementsInvalid(answer_element) {
    const precision = answer_element.attr('data-precision');
    let ts;
    let is_date_invalid = false;
    let is_time_invalid = false;
    try {
        const dval = answer_element.val();
        if (dval == '') {
            throw new Exception("Date empty");
        }
        let answer_date = new Date(dval);
        ts = answer_date.getTime() / 1000;
    } catch (e) {
        is_date_invalid = true; 
    }
    if (precision == 'H' || precision == 'i' || precision == 's') {
        let time_element = answer_element.closest('.input-container').find('input.datetime-input-time');
        let timets;
        try {
            const tval = time_element.val();
            if (tval == '') {
                throw new Exception("time empty");
            }
            const dtd = new Date('1970-01-02T' + tval + 'Z'); // Use 02 not 01 because I'm not sure what happens if we're ahead of utc
            timets = (dtd.getTime() / 1000) - 86400;
        } catch (e) {
            is_time_invalid = true;
        }
        //console.log('made time', timets);
        // ts = ts + timets;
    }
    return [is_date_invalid, is_time_invalid];
}

function datetimeElementToTS(answer_element) {
    let answer_date = new Date(answer_element.val());
    let ts = answer_date.getTime() / 1000;
    const precision = answer_element.attr('data-precision');
    if (precision == 'H' || precision == 'i' || precision == 's') {
        let time_element = answer_element.closest('.input-container').find('input.datetime-input-time');
        //console.log('time el is ', time_element, 'val is ',time_element.val());
        const dtd = new Date('1970-01-02T' + time_element.val()+ 'Z'); // Use 02 not 01 because I'm not sure what happens if we're ahead of utc
        const timets = (dtd.getTime() / 1000) - 86400;
        //console.log('made time', timets);
        ts = ts + timets;
    }
    return ts; 
}

// post an answer
$(document).on('click', '.post-answer-button', async function(e) {
    e.preventDefault();
    e.stopPropagation();

    updateLastActionTS();

    const parent_div = $(this).parents('div.rcbrowser--qa-detail');
    await getAccount()

    const contract_question_id = parent_div.attr('data-contract-question-id');
    const [contract, question_id] = parseContractQuestionID(contract_question_id);

    let bond = ethers.BigNumber.from(0);
    const bond_field = parent_div.find('input[name="questionBond"]');
    try {
        bond = humanToDecimalizedBigNumber(bond_field.val());
    } catch (err) {
        console.log('Could not parse bond field value', bond_field.val());
    }
    console.log('continuing with bond as ', bond.toString());
    let is_err = false;

    const block_before_send = CURRENT_BLOCK_NUMBER;

    // console.log('refetching');
    const question = ensureQuestionDetailFetched(contract, question_id, 0)
    .catch(function() {
        // If the question is unconfirmed, go with what we have
        console.log('caught failure, trying unconfirmed');
        return ensureQuestionDetailFetched(contract, question_id, 0)
    })
    .then(function(current_question) {
        // console.log('refetching done');
        //console.log('got current_question', current_question);

        let current_answer;
        let new_answer;

        // This may not be defined for an unconfirmed question
        if (current_question.bond == null) {
            current_question.bond = ethers.BigNumber.from(0);
        }

        const question_json = current_question.question_json;
        //console.log('got question_json', question_json);

        if (!isAnswerInputLookingValid(parent_div, question_json)) {
            parent_div.find('div.input-container.input-container--answer').addClass('is-error');
            return;
        }


        const minNum = ethers.BigNumber.from('0x'+rc_question.minNumber(question_json).integerValue().toString(16));
        const maxNum = ethers.BigNumber.from('0x'+rc_question.maxNumber(question_json).integerValue().toString(16));
        new_answer = formattedAnswerFromForm(parent_div, question_json);
        const invalid_value = rc_question.getInvalidValue(question_json);
        const answered_too_soon_value = rc_question.getAnsweredTooSoonValue(question_json);

        let ans;
        let err = false;
        switch (question_json['type']) {
            case 'bool':
                try {
                    ans = ethers.BigNumber.from(new_answer);
                } catch(e) {
                    err = true;
                }
                if (err || !(ans.eq(ethers.BigNumber.from(0)) || ans.eq(ethers.BigNumber.from(1)) || ans.eq(ethers.BigNumber.from(invalid_value)) || ans.eq(ethers.BigNumber.from(answered_too_soon_value)))) {
                    parent_div.find('div.select-container.select-container--answer').addClass('is-error');
                    is_err = true;
                }
                break;
            case 'uint':
                try {
                    ans = ethers.BigNumber.from(new_answer);
                } catch(e) {
                    err = true;
                }
                if (!err) {
                    if (!ans.eq(ethers.BigNumber.from(invalid_value)) && !ans.eq(ethers.BigNumber.from(answered_too_soon_value)) && (ans.lt(minNum) || ans.gt(maxNum))) {
                        err = true;
                    } else if (ans.lt(ethers.BigNumber.from(0))) {
                        err = true;
                    }
                }
                if (err) {
                    parent_div.find('div.input-container.input-container--answer').addClass('is-error');
                    is_err = true;
                }
                break;
            case 'int':
                try {
                    ans = ethers.BigNumber.from(new_answer);
                } catch(e) {
                    err = true;
                }
                if (!err) {
                    if (!ans.eq(ethers.BigNumber.from(invalid_value)) && !ans.eq(ethers.BigNumber.from(answered_too_soon_value)) && (ans.lt(minNum) || ans.gt(maxNum))) {
                        err = true;
                    }
                }
                if (err) {
                    parent_div.find('div.input-container.input-container--answer').addClass('is-error');
                    is_err = true;
                }
                break;
            case 'single-select':
                const sing_container = parent_div.find('div.select-container.select-container--answer');
                const sing_select = sing_container.find('select[name="input-answer"]');
                if (sing_select.prop('selectedIndex') == 0) {
                    sing_container.addClass('is-error');
                    is_err = true;
                }
                break;
            case 'multiple-select':
                const mult_container = parent_div.find('div.input-container.input-container--checkbox');
                const checked = mult_container.find('input[name="input-answer"]:checked');
                if (!invalid_value && checked.length == 0) {
                    mult_container.addClass('is-error');
                    is_err = true;
                }
                break;
            case 'datetime': 
                // console.log('datetime is ', new_answer, ethers.BigNumber.from(new_answer).toString());
                if (new_answer === null) {
                    const dt_container = parent_div.find('div.input-container.input-container--answer');
                    dt_container.addClass('is-error');
                    is_err = true;
                }
        }

        // UI shouldn't let you do this
        if (new_answer == invalid_value && !rc_question.hasInvalidOption(question_json, current_question.version_number)) {
            console.log('invalid not supported');
            is_err = true;
        }

        if (new_answer == answered_too_soon_value && !rc_question.hasAnsweredTooSoonOption(question_json, current_question.version_number)) {
            console.log('answered too soon not supported');
            is_err = true;
        }

        let min_amount = current_question.bond.mul(2)
        if (bond.lt(min_amount)) {
            // console.log('val fail', min_amount, current_question);
            parent_div.find('div.input-container.input-container--bond').addClass('is-error');
            parent_div.find('div.input-container.input-container--bond').find('.min-amount').text(decimalizedBigNumberToHuman(min_amount));
            is_err = true;
        }

        if (is_err) throw ('err on submitting answer');

        SUBMITTED_QUESTION_ID_BY_TIMESTAMP[question_id] = new Date().getTime();

        // Remove the edited note to allow the field to be automatically populated again
        bond_field.removeClass('edited'); 

        const handleAnswerSubmit = function(tx_response) {
            const txid = tx_response.hash;
            storePendingTXID(txid, CHAIN_ID);
            const contract = tx_response.to;
            clearForm(parent_div, question_json);
            const fake_entry = {
                'answer': new_answer,
                'questionId': question_id,
                'historyHash': null, // TODO Do we need this?
                'user': ACCOUNT,
                'bond': bond,
                'timestamp': ethers.BigNumber.from(parseInt(new Date().getTime() / 1000)),
                'isCommitment': false,
                'userAction': 'AnswerQuestion',
                'blockNumber': block_before_send,
                'txid': txid
            };

	    //console.log('skip fillPendingUserTX', tx_response);
	    fillPendingUserTX(tx_response);
	    console.log('made PENDING_USER_TXES_BY_CQID', PENDING_USER_TXES_BY_CQID);

            const fake_ua = filledAnswer(fake_entry, 0);
            const cqid = contractQuestionID(current_question);

            QUESTION_DETAIL_CACHE[cqid]['history_unconfirmed'].push(fake_ua);

            updateQuestionWindowIfOpen(QUESTION_DETAIL_CACHE[cqid]);
        };

        const rc = RCInstance(contract, true);
        if (USE_COMMIT_REVEAL) {
            const answer_plaintext = new_answer;
            const nonce = nonceFromSeed(uiHash(question_id + answer_plaintext + bond));
            const answer_hash = rc_question.answerHash(answer_plaintext, nonce);

            console.log('answerHash for is ',rc_question.answerHash(answer_plaintext, nonce));

            console.log('made nonce', nonce);
            console.log('made answer plaintext', answer_plaintext);
            console.log('made bond', bond);
            console.log('made answer_hash', answer_hash);

            const commitment_id = rc_question.commitmentID(question_id, answer_hash, bond.toHexString());
            console.log('resulting  commitment_id', commitment_id);

            // TODO: We wait for the txid here, as this is not expected to be the main UI pathway.
            // If USE_COMMIT_REVEAL becomes common, we should add a listener and do everything asychronously....
            if (IS_TOKEN_NATIVE) {
                return rc.functions.submitAnswerCommitment(question_id, answer_hash, current_question.bond, ACCOUNT, {
                    from: ACCOUNT, 
                    // gas:200000, 
                    value:bond
                }).then( function(tx_res) {
                    console.log('got submitAnswerCommitment tx, waiting for confirmation', tx_res);
                    tx_res.wait().then(function(tx_res) {
                        rc.functions.submitAnswerReveal(question_id, answer_plaintext, nonce, bond, {
                            from: ACCOUNT
                            //gas:200000
                        })
                        .then(function(tx_res) { handleAnswerSubmit(tx_res) });
                    });
                });
            } else {
                ensureAmountApproved(rc.address, ACCOUNT, bond).then(function() {
                    return rc.functions.submitAnswerCommitmentERC20(question_id, answer_hash, current_question.bond, ACCOUNT, bond, {from:ACCOUNT}).then( function(tx_res) {
                        console.log('got submitAnswerCommitment tx_res, waiting for confirmation', tx_res);
                        tx_res.wait().then(function(tx_res) {
                            rc.functions.submitAnswerReveal(question_id, answer_plaintext, nonce, bond, {from: ACCOUNT})
                            .then(function(tx_res) { handleAnswerSubmit(tx_res) });
                        });
                    });
                });
            }
        } else {
            if (IS_TOKEN_NATIVE) {
                rc.functions.submitAnswer(question_id, new_answer, current_question.bond, {
                    from: ACCOUNT,
                    //gas: 200000,
                    value: bond
                }).then(function(tx_res) { handleAnswerSubmit(tx_res) });
            } else {
                ensureAmountApproved(rc.address, ACCOUNT, bond).then(function() {
                    rc.functions.submitAnswerERC20(question_id, new_answer, current_question.bond, bond, {
                        from: ACCOUNT
                        //gas: 200000,
                    }).then(function(tx_res) { handleAnswerSubmit(tx_res) });
                });
            }
        }
    });
    /*
    .catch(function(e){
        console.log(e);
    });
    */
});

$(document).on('click', '.reopen-question-submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();

    updateLastActionTS();

    const parent_div = $(this).parents('div.rcbrowser--qa-detail');

    const contract_question_id = parent_div.attr('data-contract-question-id');
    const [contract, question_id] = parseContractQuestionID(contract_question_id);

    // reopenQuestion(uint256 template_id, string memory question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 min_bond, bytes32 reopens_question_id)

    await getAccount()
    // TODO: Recheck in case it's already opened

    const old_question = await ensureQuestionDetailFetched(contract, question_id, 0);

    const handleReopenQuestionTX = async function(tx_response, old_question) {
        parent_div.addClass('reopening');
        await tx_response.wait();
        parent_div.removeClass('reopening');

        // Give the node time to catch up after we get the event
        await delay(6000);

        // Force a refresh
        const question = await ensureQuestionDetailFetched(old_question.contract, old_question.question_id);
        openQuestionWindow(contractQuestionID(old_question));
    };


    /*
    const handleReopenQuestionTX = function(tx_response, old_question) {
        //console.log('sent tx with id', txid);

        const txid = tx_response.hash;
        const contract = old_question.contract;

        // Make a fake log entry
        const fake_log = {
            'entry': 'LogNewQuestion',
            'blockNumber': 0, // unconfirmed
            'args': {
                'question_id': question_id,
                'user': ACCOUNT,
                'arbitrator': old_question.arbitrator,
                'timeout': ethers.BigNumber.from(old_question.timeout),
                'content_hash': old_question.content_hash,
                'template_id': old_question.template_id,
                'question': old_question.question_text,
                'created': ethers.BigNumber.from(parseInt(new Date().getTime() / 1000)),
                'opening_ts': old_question.opening_ts
            },
            'address': contract 
        }
        const fake_call = [];
        fake_call[Qi_finalization_ts] = ethers.BigNumber.from(0);
        fake_call[Qi_is_pending_arbitration] = false;
        fake_call[Qi_arbitrator] = old_question.arbitrator;
        fake_call[Qi_timeout] = ethers.BigNumber.from(old_question.timeout);
        fake_call[Qi_content_hash] = old_question.content_hash;
        fake_call[Qi_bounty] = ethers.BigNumber.from(0);;
        fake_call[Qi_best_answer] = "0x0000000000000000000000000000000000000000000000000000000000000000";
        fake_call[Qi_bond] = ethers.BigNumber.from(0);
        fake_call[Qi_min_bond] = old_question.min_bond;
        fake_call[Qi_history_hash] = "0x0000000000000000000000000000000000000000000000000000000000000000";
        fake_call[Qi_opening_ts] = ethers.BigNumber.from(old_question.opening_ts);

        let q = filledQuestionDetail(contract, question_id, 'question_log', 0, fake_log);
        q = filledQuestionDetail(contract, question_id, 'question_call', 0, fake_call);
        q = filledQuestionDetail(contract, question_id, 'question_json', 0, rc_question.populatedJSONForTemplate(CONTRACT_TEMPLATE_CONTENT[contract.toLowerCase()][old_question.template_id], old_question.question_text));

        // Turn the post question window into a question detail window
        let rcqa = $('.rcbrowser--qa-detail.template-item').clone();
        win.html(rcqa.html());
        win = populateQuestionWindow(win, q, false);

        // TODO: Once we have code to know which network we're on, link to a block explorer
        win.find('.pending-question-txid a').attr('href', BLOCK_EXPLORER + '/tx/' + txid);
        win.find('.pending-question-txid a').text(txid.substr(0, 12) + "...");
        win.addClass('unconfirmed-transaction').addClass('has-warnings');
        win.attr('data-pending-txid', txid);

        const contract_question_id = contractQuestionID(q);

        win.find('.rcbrowser__close-button').on('click', function() {
            let parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
            let left = parseInt(parent_div.css('left').replace('px', ''));
            let top = parseInt(parent_div.css('top').replace('px', ''));
            let data_x = (parseInt(parent_div.attr('data-x')) || 0);
            let data_y = (parseInt(parent_div.attr('data-y')) || 0);
            left += data_x;
            top += data_y;
            WINDOW_POSITION[contract_question_id] = {};
            WINDOW_POSITION[contract_question_id]['x'] = left;
            WINDOW_POSITION[contract_question_id]['y'] = top;
            win.remove();
            document.documentElement.style.cursor = ""; // Work around Interact draggable bug
        });

        set_hash_param({'question': contractQuestionID(q)});

        const window_id = 'qadetail-' + contractQuestionID(q);
        win.removeClass('rcbrowser--postaquestion').addClass('rcbrowser--qa-detail');
        win.attr('id', window_id);
        win.attr('data-contract-question-id', contractQuestionID(q));
        Ps.initialize(win.find('.rcbrowser-inner').get(0));

        // TODO: Add handling for tx_response.wait() 
        // See https://docs.ethers.io/v5/api/providers/types/#providers-TransactionResponse

    }
    */

    // TODO: Check if the arbitrator has a fee
    const fee = ethers.BigNumber.from(0);

    // We only want to reopen a question once, plus once for each time it was reopened then settled too soon.
    // Hash that we don't get a zero which clashes with the normal askQuestion
    let nonce_food = "0x0000000000000000000000000000000000000000000000000000000000000000";
    if (old_question.reopened_by) {
        const [rocon, ro_question_id] = parseContractQuestionID(old_question.reopened_by);
        nonce_food = ro_question_id;
    }
    const nonce = ethers.utils.keccak256('0x' + nonce_food.replace('0x', ''));
    // const nonce = ethers.utils.keccak256(ethers.BigNumber.from(parseInt(Date.now())).toHexString());

    // TODO: The same question may be asked multiple times by the same account, so set the nonce as something other than zero
    // You only ever want to 

    const signedRC = RCInstance(contract, true);
    //console.log(old_question.template_id, old_question.question_text, old_question.arbitrator, old_question.timeout, old_question.opening_ts, 0, old_question.min_bond);
    const tx_response = await signedRC.functions.reopenQuestion(old_question.template_id, old_question.question_text, old_question.arbitrator, old_question.timeout, old_question.opening_ts, nonce, old_question.min_bond, old_question.question_id, {
        from: ACCOUNT,
        // gas: 200000,
    //    value: fee
    });

    handleReopenQuestionTX(tx_response, old_question);

});

$(document).on('click', '.reopened-question-link', function(e) {
    e.preventDefault();
    e.stopPropagation();

    updateLastActionTS();

    const cqid = $(this).closest('div.rcbrowser.rcbrowser--qa-detail').attr('data-reopened-by-question-id');
    console.log('open window for', cqid);
    openQuestionWindow(cqid);
});

$(document).on('click', '.reopener-question-link', function(e) {
    e.preventDefault();
    e.stopPropagation();

    updateLastActionTS();

    const cqid = $(this).closest('div.rcbrowser.rcbrowser--qa-detail').attr('data-reopener-of-question-id');
    console.log('open window for', cqid);
    openQuestionWindow(cqid);
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
            const container = parent_div.find('div.input-container.input-container--checkbox');
            container.find('input[name="input-answer"]:checked').prop('checked', false);
            break;
    }
}


// open/close/add reward
$(document).on('click', '.add-reward-button', function(e) {

    updateLastActionTS();

    const container = $(this).closest('.rcbrowser--qa-detail').find('.add-reward-container');
    container.addClass('is-open');
    container.addClass('is-bounce');
    container.css('display', 'block');
});

$(document).on('click', '.add-reward__close-button', function(e) {

    updateLastActionTS();

    const container = $(this).closest('.rcbrowser--qa-detail').find('.add-reward-container');
    container.removeClass('is-open');
    container.removeClass('is-bounce');
    container.css('display', 'none');
});

$(document).on('click', '.notifications-item', function(e) {
    if ($(e.target).hasClass('more-link') || $(e.target).hasClass('less-link')) {
        return true;
    }

    updateLastActionTS();

    //console.log('notifications-item clicked');
    e.preventDefault();
    e.stopPropagation();
    const cqid = $(this).attr('data-contract-question-id');
    // Template creation notifications don't have this
    // TODO: Ideally we'd give you more detail about the template or something.
    if (!cqid) {
        return;
    }
    openQuestionWindow(cqid);
});

$(document).on('click', '.rcbrowser-submit.rcbrowser-submit--add-reward', async function(e) {
    e.preventDefault();
    e.stopPropagation();

    updateLastActionTS();

    const rcqa = $(this).closest('.rcbrowser--qa-detail');
    const [contract, question_id] = parseContractQuestionID(rcqa.attr('data-contract-question-id'));
    const reward_inp = $(this).parent('div').prev('div.input-container').find('input[name="question-reward"]').val();

    let err = false;
    let reward = ethers.BigNumber.from(0);
    try {
        reward = humanToDecimalizedBigNumber(reward_inp);
    } catch(e) {
        console.log('reward data conversion error', e);
        err = true;
    }

    const signedRC = RCInstance(contract, true);
    if (err || reward <= 0) {
        $(this).parent('div').prev('div.input-container').addClass('is-error');
    } else {
        await getAccount();
        if (!IS_TOKEN_NATIVE) {
            await ensureAmountApproved(contract, ACCOUNT, reward);
        }
        let tx_response = null;
        if (IS_TOKEN_NATIVE) {
            tx_response = await signedRC.fundAnswerBounty(question_id, {from: ACCOUNT, value: reward});
        } else {
            tx_response = await signedRC.fundAnswerBountyERC20(question_id, reward, {from: ACCOUNT})
        }
        await tx_response.wait();
        //console.log('fund bounty', result);
        const container = rcqa.find('.add-reward-container');
        //console.log('removing open', container.length, container);
        container.removeClass('is-open');
        container.removeClass('is-bounce');
        container.css('display', 'none');
    }
});

/*-------------------------------------------------------------------------------------*/
// arbitration
$(document).on('click', '.arbitration-button', async function(e) {
    e.preventDefault();
    e.stopPropagation();

    updateLastActionTS();

    const lnk = this;
    await getAccount();

    const contract_question_id = $(lnk).closest('div.rcbrowser.rcbrowser--qa-detail').attr('data-contract-question-id');
    const [contract, question_id] = parseContractQuestionID(contract_question_id);
    const question_detail = await ensureQuestionDetailFetched(contract, question_id, 1, 1, CURRENT_BLOCK_NUMBER, CURRENT_BLOCK_NUMBER);
    if (!question_detail) {
        console.log('Error, question detail not found');
        return false;
    }

    const last_seen_bond_hex = $(lnk).attr('data-last-seen-bond'); 
    if (!last_seen_bond_hex) {
        console.log('Error, last seen bond not populated, aborting arbitration request');
        return false;
    }

    if (question_detail.bond.gt(ethers.BigNumber.from(last_seen_bond_hex))) {
        console.log('Answer has changed, please click again');
        return false;
    }

    if (question_detail.bond.eq(0)) {
        $('body').addClass('error-request-arbitration-without-answer-error').addClass('error');
        return false;
    }

    //if (!question_detail.is_arbitration_pending) {}
    const arb = ARBITRATOR_INSTANCE.attach(question_detail.arbitrator);
    arb.functions.getDisputeFee(question_id).then(function(fee_arr) {
        const arbitration_fee = fee_arr[0];
        //console.log('got fee', arbitration_fee.toString());
        console.log('requestArbitration(',question_id, ethers.BigNumber.from(last_seen_bond_hex), ACCOUNT, arbitration_fee);

        const signed_arbitrator = arb.connect(signer);
        signed_arbitrator.requestArbitration(question_id, ethers.BigNumber.from(last_seen_bond_hex), {from: ACCOUNT, value: arbitration_fee}).then(function(result) {
            console.log('arbitration is requested.', result);
        });
    }).catch(function(err) {
        console.log('arbitrator failed with error', err);
        markArbitratorFailed(contract, question_detail.arbitrator, contract_question_id);
    });
});

function show_bond_payments(ctrl) {
    const frm = ctrl.closest('div.rcbrowser--qa-detail')
    const contract_question_id = frm.attr('data-contract-question-id');
    const [contract, question_id] = parseContractQuestionID(contract_question_id);
    //console.log('got question_id', question_id);
    ensureQuestionDetailFetched(contract, question_id).then(function(question) {
        const question_json = question.question_json;
        const existing_answers = answersByMaxBond(question['history']);
        const new_answer = formattedAnswerFromForm(frm, question_json);
        //console.log('new_answer', new_answer);
        //console.log('existing_answers', existing_answers);
        let payable = 0;
        if (existing_answers[new_answer]) {
            payable = existing_answers[new_answer].bond;
            if (existing_answers[new_answer].user == ACCOUNT) {
                frm.addClass('has-your-answer').removeClass('has-someone-elses-answer');
                frm.find('.answer-credit-info .answer-payment-value').text(decimalizedBigNumberToHuman(payable));
            } else {
                frm.addClass('has-someone-elses-answer').removeClass('has-your-answer');
                frm.find('.answer-debit-info .answer-payment-value').text(decimalizedBigNumberToHuman(payable));
            }
            frm.attr('data-answer-payment-value', payable.toHexString());
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
    let value = humanToDecimalizedBigNumber($(this).val());
    //console.log($(this));
    const bond_validation = function(ctrl){
        ctrl.addClass('edited');
        const contract_question_id = ctrl.closest('.rcbrowser.rcbrowser--qa-detail').attr('data-contract-question-id');
        const [contract, question_id] = parseContractQuestionID(contract_question_id);
        const current_idx = QUESTION_DETAIL_CACHE[contract_question_id]['history'].length - 1;
        let current_bond = ethers.BigNumber.from(QUESTION_DETAIL_CACHE[contract_question_id].min_bond.div(2));
        if (current_idx >= 0) {
            current_bond = QUESTION_DETAIL_CACHE[contract_question_id]['history'][current_idx].bond;
        }

        const min_bond = current_bond.mul(2);
        if (ctrl.val() === '' || value.lt(min_bond)) {
            // console.log('The minimum bond is ', min_bond, 'rejecting value ',value);
            ctrl.parent().parent().addClass('is-error');
            ctrl.parent('div').next('div').find('.min-amount').text(decimalizedBigNumberToHuman(min_bond));
        } else {
            // console.log('The minimum bond is ', min_bond, 'accepting value ',value);
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
    const cont = $(this).closest('.input-container');
    cont.find('input').each(function() {
        const inp = $(this);
        if (!cont.hasClass('invalid-selected') && !cont.hasClass('too-soon-selected')) {
            inp.attr('data-old-placeholder', inp.attr('placeholder'));
        }
        inp.val('');
        inp.attr('readonly', true);
        inp.attr('placeholder', 'Invalid');
        inp.removeAttr('data-too-soon-selected');
        inp.attr('data-invalid-selected', '1'); // will be read in processing
    });
    cont.addClass('invalid-selected').removeClass('too-soon-selected').removeClass('is-error');
});

$(document).on('click', '.invalid-switch-container a.valid-text-link', function(evt) {
    evt.stopPropagation();
    const cont = $(this).closest('.input-container');
    cont.find('input').each(function() {
        const inp = $(this);
        inp.attr('readonly', false);
        let placeholder = inp.attr('data-old-placeholder');
        if (typeof placeholder === typeof undefined || placeholder === false) {
            placeholder = '';
        }
        inp.attr('placeholder', placeholder);
        inp.removeAttr('data-old-placeholder');
        inp.removeAttr('data-invalid-selected'); // will be read in processing
    });
    cont.removeClass('invalid-selected').removeClass('too-soon-selected').removeClass('is-error')
});

$(document).on('click', '.too-soon-switch-container a.too-soon-text-link', function(evt) {
    evt.stopPropagation();
    const cont = $(this).closest('.input-container');
    cont.find('input').each(function() {
        const inp = $(this);
        if (!cont.hasClass('invalid-selected') && !cont.hasClass('too-soon-selected')) {
            inp.attr('data-old-placeholder', inp.attr('placeholder'));
        }
        inp.val('');
        inp.attr('readonly', true);
        inp.attr('placeholder', 'Answered too soon');
        inp.attr('data-too-soon-selected', '1'); // will be read in processing
        inp.removeAttr('data-invalid-selected');
    });
    cont.addClass('too-soon-selected').removeClass('invalid-selected').removeClass('is-error')
});

$(document).on('click', '.too-soon-switch-container a.not-too-soon-text-link', function(evt) {
    evt.stopPropagation();
    const cont = $(this).closest('.input-container');
    cont.find('input').each(function() {
        const inp = $(this);
        inp.attr('readonly', false);
        let placeholder = inp.attr('data-old-placeholder');
        if (typeof placeholder === typeof undefined || placeholder === false) {
            placeholder = '';
        }
        inp.attr('placeholder', placeholder);
        inp.removeAttr('data-old-placeholder');
        inp.removeAttr('data-too-soon-selected'); // will be read in processing
    });
    cont.removeClass('too-soon-selected').removeClass('invalid-selected').removeClass('is-error');
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
    const parent_div = $(this).closest('div.rcbrowser.rcbrowser--qa-detail');
    const container = parent_div.find('div.input-container.input-container--checkbox');
    const checked = container.find('input[name="input-answer"]:checked');
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
    const cat = $(this).attr('data-category');
    if (cat == 'all') {
        window.location.hash = '';
        set_hash_param({'category': null})
    } else {
        set_hash_param({'category': cat})
    }
    location.reload();
});


// This should be called with a question array containing, at a minimum, up-to-date versions of the changed_field and finalization_ts.
// A full repopulate will work, but so will an array with these fields overwritten from a log event.
function updateRankingSections(question, changed_field, changed_val) {
    //console.log('in updateRankingSections', question, changed_field, changed_val);
    // latest only change on new question
    // resolved changes on finalization, this happens either with a timer or with arbitration. Also removes items from other section.
    // closing soon changes when we add an answer
    // high reward changes if we add reward. TODO: Should maybe include bond value, in which case it would also change on new answer

    const question_id = question.question_id;
    //console.log('updateRankingSections', question_id, changed_field, changed_val);
    if (changed_field == 'finalization_ts') {
        if (isFinalized(question)) {
            //console.log('isFinalized');
            const sections = ['questions-active', 'questions-closing-soon', 'questions-upcoming'];
            for (let i = 0; i < sections.length; i++) {
                const s = sections[i];
                //console.log('doing section', s);
                const existing_idx = DISPLAY_ENTRIES[s].ids.indexOf(question_id);
                if (existing_idx !== -1) {
                    DISPLAY_ENTRIES[s].ids.splice(existing_idx, 1);
                    DISPLAY_ENTRIES[s].vals.splice(existing_idx, 1);
                    //console.log('depopulating', s, question_id);
                    depopulateSection(s, question_id);
                }
            }
            const insert_before = update_ranking_data('questions-resolved', contractQuestionID(question), question.finalization_ts, 'desc');
            //console.log('insert_before iss ', insert_before);
            if (insert_before !== -1) {
                //console.log('poulating', question);
                // TODO: If question may not be populated, maybe we should refetch here first
                populateSection('questions-resolved', question, insert_before);
            }
        } else {
            //console.log('updating closing soon with timestamp', question_id, question.finalization_ts.toString());
            const insert_before = update_ranking_data('questions-closing-soon', contractQuestionID(question), question.finalization_ts, 'asc');
            //console.log('insert_before was', insert_before);
            if (insert_before !== -1) {
                populateSection('questions-closing-soon', question, insert_before);
            }

        }

    } 
    if (changed_field == 'bounty' || changed_field == 'finalization_ts') {
        //var insert_before = update_ranking_data('questions-upcoming', question_id, question.bounty.add(question.bond), 'desc');
        const insert_before = update_ranking_data('questions-upcoming', contractQuestionID(question), question.opening_ts, 'desc');
        //console.log('update for new bounty', question.bounty, 'insert_before is', insert_before);
        if (insert_before !== -1) {
            populateSection('questions-upcoming', question, insert_before);
        }
    }

    // Things that don't need adding or removing, but may still need the content updating
    updateSectionEntryDisplay(question);
    reflectDisplayEntryChanges();
    // TODO: Need to update sections that haven't changed position, but changed data

}

/*-------------------------------------------------------------------------------------*/
// initial process

function pageInit(only_contract) {

    if ($('body').hasClass('foreign-proxy')) {
        return;
    }

    //console.log('in pageInit for account', account);

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

/*
TODO restore
    var RealityCheckRealitio = contract(rc_json);
    RealityCheckRealitio.setProvider(new Web3.providers.HttpProvider(HOSTED_RPC_NODE));
    console.log('using network', HOSTED_RPC_NODE);
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
*/

    fetchQuestionListsFromGraph(0);
};

function fetchQuestionListsFromGraph(offset) {
// TODO: Work out what to do about ranking - can we make this one query? If not how do we handle the paging?
// Option: We do the sorting ourselves from the top candidates, so just fetch the full number of both?
// 
    fetchAndDisplayQuestionFromGraph(RC_DISPLAYED_CONTRACTS, 'questions-active-answered', offset, DISPLAY_ENTRIES['questions-active']['max_store']); 
    fetchAndDisplayQuestionFromGraph(RC_DISPLAYED_CONTRACTS, 'questions-active-unanswered', offset, DISPLAY_ENTRIES['questions-active']['max_store']); 
    fetchAndDisplayQuestionFromGraph(RC_DISPLAYED_CONTRACTS, 'questions-upcoming', offset, DISPLAY_ENTRIES['questions-upcoming']['max_store']); 
    fetchAndDisplayQuestionFromGraph(RC_DISPLAYED_CONTRACTS, 'questions-resolved', offset, DISPLAY_ENTRIES['questions-resolved']['max_store']); 
    fetchAndDisplayQuestionFromGraph(RC_DISPLAYED_CONTRACTS, 'questions-awaiting-arbitration', offset, DISPLAY_ENTRIES['questions-upcoming']['max_store']); 
};

function reflectDisplayEntryChanges() {
    //console.log('checking DISPLAY_ENTRIES', DISPLAY_ENTRIES);
    //look at current sections and update blockchain scanning message to
    //no questions found if no items exist
    const detypes = Object.keys(DISPLAY_ENTRIES);
    // console.log('no questions cateogry, DISPLAY_ENTRIES for detype', DISPLAY_ENTRIES, detypes);
    for (let i=0; i<detypes.length; i++) {
        const detype = detypes[i];
        const has_items = ($('#' + detype).find('div.questions-list div.questions__item').size() > 0);
        if (has_items) {
            $('#' + detype).find('.no-questions-category').css('display', 'none');
            $('#' + detype).find('.scanning-questions-category').css('display', 'none');
        } else {
            if (IS_INITIAL_LOAD_DONE) {
                $('#' + detype).find('.no-questions-category').css('display', 'block');
                $('#' + detype).find('.scanning-questions-category').css('display', 'none');
            } else {
                $('#' + detype).find('.no-questions-category').css('display', 'none');
                $('#' + detype).find('.scanning-questions-category').css('display', 'none');
            }
        }

    } 
}

function questionFetchFields() {
    const txt = `
        id,
        questionId,
        contract,
        createdBlock,
        createdTimestamp,
        updatedBlock,
        updatedTimestamp,
        data,
        qJsonStr,
        qTitle,
        qCategory,
        qLang,
        qType,
        arbitrator,
        user,
        openingTimestamp,
        timeout,
        bounty,
        currentAnswer,
        currentAnswerBond,
        currentAnswerTimestamp,
        contentHash,
        historyHash,
        minBond,
        lastBond,
        cumulativeBonds,
        arbitrationRequestedTimestamp,
        arbitrationRequestedBy,
        isPendingArbitration,
        arbitrationOccurred,
        answerFinalizedTimestamp,
        currentScheduledFinalizationTimestamp,
        template {
            id, 
            templateId, 
            questionText
        },
        reopenedBy {
          id
        },
        reopens {
          id
        },
        responses {
          id,
          timestamp,
          answer,
          isUnrevealed,
          isCommitment,
          commitmentId,
          bond,
          user,
          historyHash,
          createdBlock,
          revealedBlock
        }
    `;
    return txt;
}

function userActionFields() {
    const question_fetch_fields = questionFetchFields();
    const txt = `
        id,
        actionType,
        user,
        question {
           ${question_fetch_fields}, 
        },
        template {
            templateId,
            questionText,
        },
        createdBlock,
        createdTimestamp,
        response {
          id,
          timestamp,
          answer,
          isUnrevealed,
          isCommitment,
          commitmentId,
          bond,
          user,
          historyHash,
          createdBlock,
          revealedBlock
      }
    `;
    return txt;
}

async function fetchAndDisplayQuestionFromGraph(displayed_contracts, ranking, offset, max_store) {
    //console.log('fetchAndDisplayQuestionFromGraph', displayed_contracts, ranking);

    const ts_now = parseInt(new Date()/1000);
    const contract_str = JSON.stringify(displayed_contracts);
    const ranking_where = {
        'questions-active-answered': `{contract_in: ${contract_str}, isPendingArbitration: false, answerFinalizedTimestamp_gt: ${ts_now}, openingTimestamp_lte: ${ts_now}}`,
        'questions-active-unanswered': `{contract_in: ${contract_str}, isPendingArbitration: false, answerFinalizedTimestamp: null, openingTimestamp_lte: ${ts_now}}`,
        'questions-upcoming': `{contract_in: ${contract_str}, isPendingArbitration: false, openingTimestamp_gt: ${ts_now}}`,
        'questions-resolved': `{contract_in: ${contract_str}, answerFinalizedTimestamp_lt: ${ts_now}}`,
        'questions-awaiting-arbitration': `{contract_in: ${contract_str}, isPendingArbitration: true}`,
    }

    const ranking_order = {
        'questions-active-answered': 'lastBond', 
        'questions-active-unanswered': 'createdTimestamp',
        'questions-upcoming': 'createdTimestamp',
        'questions-resolved': 'answerFinalizedTimestamp',
        'questions-awaiting-arbitration': 'lastBond'
    }

    const where = ranking_where[ranking];
    const orderBy = ranking_order[ranking];

    const network_graph_url = CHAIN_INFO.graphURL;
    if (!network_graph_url) {
        console.log('No graph endpoint found for this network, skipping graph fetch');
        return false;
    }
    // console.log('graph url is ', network_graph_url);
    const question_fetch_fields = questionFetchFields();

    const query = `
      {
        questions(first: ${max_store}, skip: ${offset}, where: ${where}, orderBy: ${orderBy}, orderDirection: desc) {
            ${question_fetch_fields}
        }
      }  
      `;


    const fetched_ms = Date.now();

     // console.log('sending graph query', ranking, query);
    const res = await axios.post(network_graph_url, {query: query});
    // console.log('graph res', ranking, res.data);
    for (const q of res.data.data.questions) {
        handleQuestion(q, fetched_ms)
        // const question_posted = RCInstance(q.contract).filters.LogNewQuestion(q.questionId);
        // const result = await RCInstance(q.contract).queryFilter(question_posted, parseInt(q.createdBlock), parseInt(q.createdBlock));
    }
    IS_INITIAL_LOAD_DONE = true;
    reflectDisplayEntryChanges();

}

async function ensureQuestionDetailFetched(ctr, question_id, max_cache_ms) {
    const cqid = cqToID(ctr, question_id);

    max_cache_ms = (typeof max_cache_ms === 'undefined') ? DEFAULT_MAX_CACHE_MS : parseInt(max_cache_ms);

    if (QUESTION_DETAIL_CACHE[cqid]) {
        // TODO: For closed and resolved questions we can probably be more aggressive, but be careful of what we need in claiming
        if (QUESTION_DETAIL_CACHE[cqid].fetched_ms > (Date.now() - max_cache_ms)) {
            return QUESTION_DETAIL_CACHE[cqid];
        }
    }

    const network_graph_url = CHAIN_INFO.graphURL;
    if (!network_graph_url) {
        console.log('No graph endpoint found for this network, skipping graph fetch');
        return false;
    }
    // console.log('graph url is ', network_graph_url);
    const question_fetch_fields = questionFetchFields();

    const fetched_ms = Date.now();
    const query = `
      {
        questions(where: {id: "${cqid}"}) {
            ${question_fetch_fields}
        }
      }  
      `;

     //console.log('sending single graph query', query);
    const res = await axios.post(network_graph_url, {query: query});
    // console.log('graph res ensureQuestionDetailFetched', res.data, query);
    for (const q of res.data.data.questions) {
        //console.log('got q data q');
        let question = filledQuestion(q, fetched_ms);

        // TODO: Should we run handleQuestion too?
        // handleQuestion(q)
        // console.log('filled individual qestion', question);
        // const question_posted = RCInstance(q.contract).filters.LogNewQuestion(q.questionId);
        // const result = await RCInstance(q.contract).queryFilter(question_posted, parseInt(q.createdBlock), parseInt(q.createdBlock));
        return question;
    }
}

async function fetchChangedQuestionsSince(last_ts) {

    const ts_now = parseInt(new Date()/1000);
    const displayed_contracts = RC_DISPLAYED_CONTRACTS
    const contract_str = JSON.stringify(displayed_contracts);

    const query_since_ts = last_ts - REORG_ALLOWANCE_SECS;

    const network_graph_url = CHAIN_INFO.graphURL;
    if (!network_graph_url) {
        console.log('No graph endpoint found for this network, skipping graph fetch');
        return false;
    }
    // console.log('graph url is ', network_graph_url);
    const question_fetch_fields = questionFetchFields();
    const query = `
      {
        questions(first: 100, where: {updatedTimestamp_gt: ${query_since_ts}, contract_in: ${contract_str}}, orderBy: updatedTimestamp, orderDirection: desc) {
            ${question_fetch_fields}
        }
      }  
      `;

    const fetched_ms = Date.now();

     // console.log('sending graph query', ranking, query);
    const res = await axios.post(network_graph_url, {query: query});
    //console.log('fetchChangedQuestionsSince result', last_ts, res.data, query);
    console.log('fetchChangedQuestionsSince result', last_ts, res.data, res.data.data.questions.length, fetched_ms);
    for (const q of res.data.data.questions) {
        console.log('handling updated question', q.id);
        handleQuestion(q, fetched_ms)
        // const question_posted = RCInstance(q.contract).filters.LogNewQuestion(q.questionId);
        // const result = await RCInstance(q.contract).queryFilter(question_posted, parseInt(q.createdBlock), parseInt(q.createdBlock));
    }

    return true;
 
}

// For normal fetches we check on loading whether finalized
// However they may finalize by the passage of time after the page is loaded.
// This doesn't trigger an event unless they're finalized by arbitration.
async function fetchFinalizedQuestionsSince(last_ts) {

    const ts_now = parseInt(new Date()/1000);
    const displayed_contracts = RC_DISPLAYED_CONTRACTS
    const contract_str = JSON.stringify(displayed_contracts);

    // Wait a few minutes after they should have been finalized in case they get answered at the last minute and graph is lagging
    // We'll also filter for below 2147483647 which is a fake value we put in for unanswered questions so we can query on them
    const ts_display_after = ts_now - (3*60);

    const ts_last_polled = last_ts; // TODO: check this is right

    const network_graph_url = CHAIN_INFO.graphURL;
    if (!network_graph_url) {
        console.log('No graph endpoint found for this network, skipping graph fetch');
        return false;
    }
    // console.log('graph url is ', network_graph_url);
    const question_fetch_fields = questionFetchFields();
    const query = `
      {
        questions(first: 100, where: {currentScheduledFinalizationTimestamp_gte: ${ts_last_polled}, currentScheduledFinalizationTimestamp_gte: ${ts_display_after}, currentScheduledFinalizationTimestamp_lt: 2147483647, contract_in: ${contract_str}}, orderBy: updatedTimestamp, orderDirection: desc) {
            ${question_fetch_fields}
        }
      }  
      `;

    const fetched_ms = Date.now();

     // console.log('sending graph query', ranking, query);
    const res = await axios.post(network_graph_url, {query: query});
    //console.log('fetchChangedQuestionsSince result', last_ts, res.data, query);
    console.log('fetchFinalizedSince result', last_ts, res.data, res.data.data.questions.length, fetched_ms);
    for (const q of res.data.data.questions) {
        console.log('handling updated question', q.id);
        handleQuestion(q, fetched_ms)
        // const question_posted = RCInstance(q.contract).filters.LogNewQuestion(q.questionId);
        // const result = await RCInstance(q.contract).queryFilter(question_posted, parseInt(q.createdBlock), parseInt(q.createdBlock));
    }

    return true;
 
}


async function runPollingLoop(displayed_contracts, last_fetch_ts) {

    const fetch_started_ts = parseInt(new Date().getTime()/1000);

    // NB The fetch timestamp is when we actually did the fetching per our clock.
    // The REORG_ALLOWANCE_SECS should be applied by the functions that do the fetching.
    fetchChangedQuestionsSince(last_fetch_ts);
    fetchFinalizedQuestionsSince(last_fetch_ts);

    fetchUserEventsAndHandleGraph();

    updatePollingInterval();
    await delay(POLLING_INTERVAL*1000);

    runPollingLoop(displayed_contracts, fetch_started_ts);
    
    /*
    window.setTimeout(function() {
        const to = (start_ts-interval);
        runPollingLoop(displayed_contracts, to)
    }, (interval*1000));
    */

    /*
    evts.get(function(error, result) {
        console.log('got evts', error, result);
        LAST_POLLED_BLOCK = CURRENT_BLOCK_NUMBER;
        if (error === null && typeof result !== 'undefined') {
            for (var i = 0; i < result.length; i++) {
                handleEvent(error, result[i]);
            }
        } else {
            console.log(error);
        }
        window.setTimeout(runPollingLoop, 30000, contract_instance);
    });
    */

}

function updateLastActionTS() {
    LAST_ACTION_TS = parseInt(new Date().getTime()/1000);
    updatePollingInterval();
}

function updatePollingInterval() {
console.log('updatePollingInterval');
    const tsnow = parseInt(new Date().getTime()/1000);
    const secs_since_last_action = tsnow - LAST_ACTION_TS 
    if (secs_since_last_action < SECS_TO_UX_IDLE_STATE) {
        POLLING_INTERVAL = POLLING_INTERVAL_ACTIVE; 
    } else {
        POLLING_INTERVAL = POLLING_INTERVAL_IDLE; 
    }
console.log('updatePollingInterval', POLLING_INTERVAL);
}


// Sometimes things go wrong getting events
// To mitigate the damage, run a refresh of the currently-open window etc


async function fetchUserEventsAndHandleGraph() {
    //console.log('fetchAndDisplayQuestionFromGraph', displayed_contracts, ranking);

    const acc = ACCOUNT;
    if (!acc) {
        console.log('No account found, not fetching user events');
        return;
    }

    const ts_now = parseInt(new Date()/1000); // TODO: Handle skipping stuff we already have
    //const contract_str = JSON.stringify(displayed_contracts);

    const fetch_start_ts = LAST_POLLED_USER_TS ? LAST_POLLED_USER_TS - REORG_ALLOWANCE_SECS : 0;
console.log('fetch user events from', fetch_start_ts);

    const network_graph_url = CHAIN_INFO.graphURL;
    if (!network_graph_url) {
        console.log('No graph endpoint found for this network, skipping graph fetch');
        return false;
    }
    // console.log('graph url is ', network_graph_url);


/*
id: ID!
actionType: String!
user: Bytes!
question: Question
response: Response
claim: Claim
withdrawal: Withdrawal
fund: Fund
template: Template
createdBlock: BigInt!
createdTimestamp: BigInt!
*/

    //  GRAPH_TODO Add contract field to UserAction
    const user_action_fields = userActionFields();
    const displayed_contracts = RC_DISPLAYED_CONTRACTS
    const contract_str = JSON.stringify(displayed_contracts);

    const query = `
      {
        userActions(first: 1000, where: {user: "${acc}", createdTimestamp_gt: ${fetch_start_ts} }, orderBy: createdBlock, orderDirection: desc) {
            ${user_action_fields}
        }
      }
      `;

    // console.log('sending usergraph query', query);
    const res = await axios.post(network_graph_url, {query: query});
    // console.log('graph res', res.data);
    let user_question_blocks = [];

    let active_contracts = {};
    for(let ci = 0; ci<RC_DISPLAYED_CONTRACTS.length; ci++) {
        const ct = RC_DISPLAYED_CONTRACTS[ci];
        active_contracts[ct.toLowerCase()] = true;
    }

    const fetched_ms = Date.now();

    if (typeof res.data.data === 'undefined') {
        console.log('Fetching user events from graph failed', res, query);
        return false;
    }

    for (const a of res.data.data.userActions) {
         // console.log('got useraction', a);

        // TODO: Move this logic to the query - we may need a graph update to put the contract in UserAction
        if (a.question) { // Anything except LogNewTemplate
            const contr = a.question.contract;
            if (!active_contracts[contr]) {
                // console.log('skip action', a);
                continue;
            }
        }

        renderNotificationsGraph(a, fetched_ms);
        const qid = a.questionId;
        if (!user_question_blocks[qid]) {
            user_question_blocks[qid] = a.createdTimestamp; // Should be the first time - TODO: Check we're getting these in ascending order
        }
        //handleQuestion(q)
        // const question_posted = RCInstance(q.contract).filters.LogNewQuestion(q.questionId);
        // const result = await RCInstance(q.contract).queryFilter(question_posted, parseInt(q.createdBlock), parseInt(q.createdBlock));
    }


    // Now fetch events for questions the user interacted with, but not done by the user

    let question_id_in_str = '';
    let delim = ''; 
    for(const qid in user_question_blocks) {
        question_id_in_str = question_id_in_str + delim + '"' + qid + '"';
        delim = ','; 
    }
    if (question_id_in_str == '') {
        console.log('no questions');
        return;
    }

    // NB We don't need AskQuestion as it must have happened prior to the user's involvement
    const query2 = `
      {
        userActions(first: 1000, where: {user_not: "${acc}", actionType_not: "AskQuestion", question_in: [${question_id_in_str}], createdTimestamp_gt: ${fetch_start_ts} }, orderBy: createdBlock, orderDirection: desc) {
           ${user_action_fields}
        }
      }
      `;

    // console.log('sending other graph query', query2);
    const res2 = await axios.post(network_graph_url, {query: query2});
    console.log('graph res', res2.data);
    for (const a of res2.data.data.userActions) {
        console.log('got useraction for other', a);
        renderNotificationsGraph(a);
        const qid = a.questionId;
        if (!user_question_blocks[qid]) {
            user_question_blocks[qid] = a.createdTimestamp; // Should be the first time - TODO: Check we're getting these in ascending order
        }
        //handleQuestion(q)
        // const question_posted = RCInstance(q.contract).filters.LogNewQuestion(q.questionId);
        // const result = await RCInstance(q.contract).queryFilter(question_posted, parseInt(q.createdBlock), parseInt(q.createdBlock));
    }

    for (const ctr in RC_DISPLAYED_CONTRACTS) {
        updateClaimableDisplay(RC_DISPLAYED_CONTRACTS[ctr]);
    }

    LAST_POLLED_USER_TS = ts_now;

}

async function changedQuestionsByUserEventStartingAt(displayed_contracts, start_ts) {
    //console.log('fetchAndDisplayQuestionFromGraph', displayed_contracts, ranking);

    //const contract_str = JSON.stringify(displayed_contracts);

    const network_graph_url = CHAIN_INFO.graphURL;
    if (!network_graph_url) {
        console.log('No graph endpoint found for this network, skipping graph fetch');
        return false;
    }
    // console.log('graph url is ', network_graph_url);

    //  GRAPH_TODO Add contract field to UserAction
    const user_action_fields = userActionFields();
    const contract_str = JSON.stringify(displayed_contracts);
console.log('made contract_str', contract_str);

    const query = `
      {
        userActions(first: 1000, where: {createdTimestamp_gt: "${start_ts}" }, orderBy: createdBlock, orderDirection: desc) {
           ${user_action_fields}
        }
      }
      `;

    // console.log('sending usergraph query', query);
    const res = await axios.post(network_graph_url, {query: query});
    // console.log('graph res', res.data);
    let user_question_blocks = [];


    let active_contracts = {};
    for(let ci = 0; ci<RC_DISPLAYED_CONTRACTS.length; ci++) {
        const ct = RC_DISPLAYED_CONTRACTS[ci];
        active_contracts[ct.toLowerCase()] = true;
    }

    const fetched_ms = Date.now();

    for (const a of res.data.data.userActions) {
         // console.log('got useraction', a);

        // TODO: Move this logic to the query - we may need a graph update to put the contract in UserAction
        if (a.question) { // Anything except LogNewTemplate
            const contr = a.question.contract;
            if (!active_contracts[contr]) {
                // console.log('skip action', a);
                continue;
            }
        }

        renderNotificationsGraph(a, fetched_ms);
        const qid = a.questionId;
        if (!user_question_blocks[qid]) {
            user_question_blocks[qid] = a.createdTimestamp; // Should be the first time - TODO: Check we're getting these in ascending order
        }
        //handleQuestion(q)
        // const question_posted = RCInstance(q.contract).filters.LogNewQuestion(q.questionId);
        // const result = await RCInstance(q.contract).queryFilter(question_posted, parseInt(q.createdBlock), parseInt(q.createdBlock));
    }


/*
    // Now fetch events for questions the user interacted with, but not done by the user

    let question_id_in_str = '';
    let delim = ''; 
    for(const qid in user_question_blocks) {
        question_id_in_str = question_id_in_str + delim + '"' + qid + '"';
        delim = ','; 
    }
    if (question_id_in_str == '') {
        console.log('no questions');
        return;
    }

    // NB We don't need AskQuestion as it must have happened prior to the user's involvement
    const query2 = `
      {
        userActions(first: 1000, where: {user_not: "${acc}", actionType_not: "AskQuestion", question_in: [${question_id_in_str}] }, orderBy: createdBlock, orderDirection: desc) {
            id,
            actionType,
            user,
            question {
               ${question_fetch_fields}, 
            }
            createdBlock
            createdTimestamp,
            response {
              id,
              timestamp,
              answer,
              isUnrevealed,
              isCommitment,
              commitmentId,
              bond,
              user,
              historyHash,
              createdBlock,
              revealedBlock
            }
        }
      }
      `;

    // console.log('sending other graph query', query2);
    const res2 = await axios.post(network_graph_url, {query: query2});
    console.log('graph res', res2.data);
    for (const a of res2.data.data.userActions) {
        console.log('got useraction for other', a);
        renderNotificationsGraph(a);
        const qid = a.questionId;
        if (!user_question_blocks[qid]) {
            user_question_blocks[qid] = a.createdTimestamp; // Should be the first time - TODO: Check we're getting these in ascending order
        }
        //handleQuestion(q)
        // const question_posted = RCInstance(q.contract).filters.LogNewQuestion(q.questionId);
        // const result = await RCInstance(q.contract).queryFilter(question_posted, parseInt(q.createdBlock), parseInt(q.createdBlock));
    }
*/

// TODO: This should probably be happening in a shared event handling function
    for (const ctr in RC_DISPLAYED_CONTRACTS) {
        updateClaimableDisplay(RC_DISPLAYED_CONTRACTS[ctr]);
    }

}



function isForCurrentUser(entry) {
    const actor_arg = 'user';
    return (entry[actor_arg] == ACCOUNT);
}

function parseHash() {
    // Alternate args should be names and values
    if (location.hash.substring(0, 3) != '#!/') {
        return {};
    }
    const arg_arr = location.hash.substring(3).split('/');
    const args = {};
    for (let i = 0; i < arg_arr.length + 1; i = i + 2) {
        const n = arg_arr[i];
        const v = arg_arr[i + 1];
        if (n && v) {
            args[n] = v;
        }
    }
    return args;
}

function set_hash_param(args) {
    let current_args = parseHash();
    let h = '!';
    for (const a in args) {
        if (args.hasOwnProperty(a)) {
            current_args[a] = args[a];
        }
    }
    for (const ca in current_args) {
        if (current_args.hasOwnProperty(ca)) {
            if (current_args[ca] != null) {
                h = h + '/' + ca + '/' + current_args[ca];
            }
        }
    }
    document.location.hash = h;
}

function populateArbitratorOptionLabel(op, fee, txt, tos) {
    if (txt) {
        op.attr('data-text-main', txt);
    } else {
        txt = op.attr('data-text-main');
    }
    if (fee.gt(ethers.BigNumber.from(0))) {
        txt = txt + ' (' + humanReadableWei(fee) + ')';
    }
    op.text(txt);
    op.attr('data-question-fee', fee.toHexString());
    if (tos) {
        op.attr('data-tos-url', formatPossibleIPFSLink(tos));
    }
}

function appendBeforeOption(sel, weight) {
    let last_el = null;
    // Go down the select until we find something with a higher weight than ourselves, then slot in before that
    // There should always be something there because we have the "other" option at 1000001
    sel.find('option').each(function(){
        const el = $(this);
        if (parseInt(el.attr('data-weight')) > parseInt(weight)) {
            last_el = el;
            return false;
        }
    });
    // Always append before the final option if there were no others
    return last_el;
}

function populateArbitratorSelect(arb_contract, network_arbs) {
    console.log('got network_arbs', network_arbs);
    $("select[name='arbitrator']").each(function() {
        const as = $(this);
        const a_template = as.find('.arbitrator-template-item');
        const a_select = $(this);
        const other_option = a_template.parent().find('.arbitrator-other-select');
        a_template.remove();

        // Assign weights governing the order in the select, lowest to be displayed last.
        // The contract address used for "no arbitrator" should be displayed last (and will be set to 1000000)
        // The "other" option will be 1000001, already in the HTML
        let arb_weights = {};
        let arb_i = 0;
        for(const na in network_arbs) {
            arb_weights[na.toLowerCase()] = arb_i;
            arb_i++;
        }

        $.each(network_arbs, function(na_addr, na_title) {
            if (na_addr.toLowerCase() == RCInstance(RC_DEFAULT_ADDRESS).address.toLowerCase()) {
                const arb_item = a_template.clone().removeClass('arbitrator-template-item').addClass('arbitrator-option');
                arb_item.attr('data-weight', '1000000');
                populateArbitratorOptionLabel(arb_item, ethers.BigNumber.from(0), na_title, "");
                arb_item.val(na_addr);
                other_option.before(arb_item);
                return true;
            }
            const mya = arb_contract.attach(na_addr);
            mya.functions.realitio().then(function(call_response) {
                const rc_addr = call_response[0];
                console.log('arb has rc addr', rc_addr);
                const is_arb_valid = (rc_addr.toLowerCase() == RCInstance(RC_DEFAULT_ADDRESS).address.toLowerCase());
                ARBITRATOR_VERIFIED_BY_CONTRACT[RC_DEFAULT_ADDRESS.toLowerCase()][na_addr.toLowerCase()] = is_arb_valid;
                // For faster loading, we give arbitrators in our list the benefit of the doubt when rendering the page list arbitrator warning
                // For this we'll check our original list for the network, then just check against the failed list
                // TODO: Once loaded, we should really go back through the page and update anything failed
                if (!is_arb_valid) {
                    markArbitratorFailed(RC_DEFAULT_ADDRESS, na_addr);
                }
                console.log(ARBITRATOR_VERIFIED_BY_CONTRACT);
                return is_arb_valid;
            }).then(function(is_arb_valid) {
                if (is_arb_valid) {
                    RCInstance(RC_DEFAULT_ADDRESS).functions.arbitrator_question_fees(na_addr).then(async function(fee_call_response) {
                        const fee = fee_call_response[0];
                        const metadata = await loadArbitratorMetaData(na_addr);
                        const tos = ('tos' in metadata) ? metadata['tos'] : null;
                        const arb_item = a_template.clone().removeClass('arbitrator-template-item').addClass('arbitrator-option');
                        arb_item.val(na_addr);
                        if (na_addr.toLowerCase() in arb_weights) {
                            arb_item.attr('data-weight', arb_weights[na_addr.toLowerCase()]);
                        }
                        populateArbitratorOptionLabel(arb_item, fee, na_title, tos);
                        //if (arb_item.attr('data-weight') == '1') {
                        //    arb_item.attr('selected', true);
                        //}
                        const append_before = appendBeforeOption(a_select, arb_item.attr('data-weight'));
                        // append before the item with the highest weight greater than this one
                        append_before.before(arb_item);
                    });
                } else {
                    console.log('Arbitrator does not work for this contract:', na_addr);
                }
            }).catch(function(err) {
                console.log('arbitrator failed with error', err);
                markArbitratorFailed(RC_DEFAULT_ADDRESS, na_addr);
            });
        });
    });
}

async function validateArbitratorForContract(contract, arb_addr) {
    if (ARBITRATOR_VERIFIED_BY_CONTRACT[contract.toLowerCase()] && ARBITRATOR_VERIFIED_BY_CONTRACT[contract.toLowerCase()][arb_addr.toLowerCase()]) {
        return true;
    }
    const ar = ARBITRATOR_INSTANCE.attach(arb_addr);
    const rslt_arr = await ar.functions.realitio();
    const rslt = rslt_arr[0];
    return (RCInstance(RC_DEFAULT_ADDRESS).address.toLowerCase() == rslt.toLowerCase());
}

function initChain(cid) {
    console.log('Initializing for chain', cid);
    CHAIN_ID = cid;
    const net_cls = '.network-id-' + cid;
    if ($('.network-status'+net_cls).size() == 0) {
        return false;
    }
    $('.network-status'+net_cls).show();
    $('.network-status-container').addClass('initialized');

    const current_chain_text = $('.network-status'+net_cls).text();
    $('.current-chain-text').text(current_chain_text);
    $('.chain-item.network-id-'+cid).addClass('selected-chain');

    if (typeof ethereum !== 'undefined') {
        ethereum.on('chainChanged', () => {
          document.location.reload()
        })
    }

    return true;
}

function getAccount(fail_soft) {
    console.log('in getAccount');
    return new Promise((resolve, reject)=>{
        if (ACCOUNT) {
            resolve(ACCOUNT);
        }

        if (typeof ethereum === 'undefined') {
            if (!fail_soft) {
                $('body').addClass('error-no-metamask-plugin').addClass('error');
            }
            reject('Could not find an up-to-date version of metamask, account functionality disabled.');
        }

        ethereum.enable().then(function() {

            ethereum.on('accountsChanged', function (accounts) {
                ACCOUNT = null;                     
                resetAccountUI();
                getAccount();
            })

            provider.listAccounts().then(function(acc) {
                console.log('accounts were', acc);
                if (acc && acc.length > 0) {
                    //console.log('accounts', acc);
                    ACCOUNT = acc[0];
                    $('.account-balance-link').attr('href', BLOCK_EXPLORER + '/address/' + ACCOUNT);
                } else {
                    if (!IS_WEB3_FALLBACK) {
                        console.log('no accounts');
                        $('body').addClass('error-no-metamask-accounts').addClass('error');
                    }
                }

                accountInit(ACCOUNT);
                resolve(ACCOUNT);
            });

        });
    });
}

function accountInit(account) {

    fetchUserEventsAndHandleGraph();

    updateUserBalanceDisplay();

}

function initContractSelect(available_configs, selected_config, show_all) {
    const sel = $('select#contract-selection');
    let only_have_default = true;
    for(const ac in available_configs) {
        const acobj = available_configs[ac];
        const is_selected = (ac.toLowerCase() == selected_config.address.toLowerCase());
        if (!is_selected) {
            only_have_default = false;
        }
        let op = $('<option>');
        op.attr('value', ac).text('reality.eth v'+acobj.version_number);
        if (!show_all) {
            if (is_selected) {
                op.prop('selected', 'selected');
            }
        }
        sel.append(op);
    }

    sel.attr('data-old-val', sel.val());
    if (only_have_default) {
        sel.find('.all-contracts').remove();
    }
    sel.removeClass('uninitialized');
}

// We show the claim button section for each contract
// It's a bit hokey but having multiple contracts to claim from should be pretty unusual
function setupContractClaimSections(rc_contracts) {
    for(let i=0; i<rc_contracts.length; i++) {
        const rcaddr = rc_contracts[i];
        const tmpl = $('.contract-claim-section-template');
        const sec = tmpl.clone();
        sec.attr('data-contract', rcaddr.toLowerCase());
        sec.removeClass('contract-claim-section-template');
        tmpl.after(sec);
    }
}

function initToken(curr) {
    $('.token-ticker-text').text(TOKEN_TICKER);
    for(const t in TOKEN_INFO) {
        const op = $('<option>');
        op.attr('value', t).text(t);
        if (t == curr) {
            if (TOKEN_INFO[t].is_native) {
                console.log('is_native');
                IS_TOKEN_NATIVE = true;
            } else {
                console.log('not native');
            }
            op.prop('selected', 'selected');
        }
        $('select#token-selection').append(op);
    }
    //$('select#token-selection').val(curr);
}

function displayForeignProxy(datastr) {
    $('body').addClass('foreign-proxy');
    const dec = decodeURIComponent(datastr);
    const qdata = JSON.parse(dec);
    for (const d in qdata) {
        if (qdata[d].type && qdata[d].type == 'BigNumber') {
            qdata[d] = ethers.BigNumber.from(qdata[d].hex); 
        }
    }
    FOREIGN_PROXY_DATA = qdata;
    $('body').attr('data-foreign-proxy-network-id', qdata['network_id']);
    const netid_label = 'network-id-'+parseInt(qdata['network_id']);
    const txt = $('.network-status-container .network-status.'+netid_label).first().text();
    console.log(netid_label, txt);
    const fpsec = $('div.foreign-proxy-section');
    const qjson = qdata.question_json;
    fpsec.find('.foreign-proxy-network-text').text(txt);
    fpsec.find('.question-title').text(qjson['title']);
    console.log('ss', $('div.foreign-proxy-section .foreign-proxy-network-text').size());
    console.log('displayForeignProxy', qdata);
}

async function foreignProxyInitChain(cid) {
console.log('in foreignProxyInitChain');
    if (!$('body').hasClass('foreign-proxy')) {
        return;
    }
    if (parseInt(cid) != $('body').attr('data-foreign-proxy-network-id')) {
        $('body').addClass('foreign-proxy-network-mismatch');
        return;
    }
    const arb_addr = FOREIGN_PROXY_DATA['foreign_proxy'];
    const question_id = FOREIGN_PROXY_DATA.question_id;
    let arbitrator;

    console.log('foreign proxy arbitrator is', arb_addr, 'bond', FOREIGN_PROXY_DATA.bond, 'qid', question_id);

    let dispute_exists = false;
    let old_version = false;

    // The Kleros mainnet contract for this has some extra features that we want to display like showing the status of the request
    let arb = new ethers.Contract(arb_addr, PROXIED_ARBITRATOR_ABI_NEW, provider);

    console.log('Checking for an existing dispute');
    try {
        console.log('Trying new contract API');
        const existing_arr = await arb.functions.arbitrationIDToDisputeExists(ethers.BigNumber.from(question_id));
        // console.log('got ', existing_arr, question_id);
        dispute_exists = existing_arr[0];
    } catch (e) {
        console.log('Error trying new contract API, trying old API');
        arb = new ethers.Contract(arb_addr, PROXIED_ARBITRATOR_ABI_OLD, provider);
        old_version = true;
        const existing_arr = await arb.functions.questionIDToDisputeExists(question_id);
        dispute_exists = existing_arr[0];
    }

    // See if it was requested but hasn't been handled yet
    if (!dispute_exists) {
        const arb_req_filter = arb.filters.ArbitrationRequested(question_id);
        const arb_requests = await arb.queryFilter(arb_req_filter);
        if (arb_requests.length > 0) {
            for(const arb_req in arb_requests) {
                const req_addr = arb_requests[arb_req].args._requester;
                const existing_2 = await arb.functions.arbitrationRequests(ethers.BigNumber.from(question_id), req_addr);
                if (existing_2.status && existing_2.status > 0 && existing_2.status < 4) { // Created and not failed
                    dispute_exists = true;
                    break;
                }
            }        
        }
    }

    console.log('existing dispute_exists?', dispute_exists);
    if (dispute_exists) {
        $('body').addClass('foreign-proxy-transaction-complete').removeClass('foreign-proxy-ready').removeClass('foreign-proxy-transaction-sent');
        return;
    } else {
        try {
            const fee_arr = await arb.functions.getDisputeFee(question_id);
            const fee = fee_arr[0];
            $('.proxy-arbitration-fee').text(humanReadableWei(fee));
            $('.proxy-request-arbitration-button').attr('data-question-fee', fee.toHexString());
            $('.proxy-contested-answer').text(rc_question.getAnswerString(FOREIGN_PROXY_DATA.question_json, FOREIGN_PROXY_DATA.best_answer));
           
            $('.proxy-request-arbitration-button').click(function() {
                console.log('fee si', fee.toHexString());
                // Normally would be, but Kleros didn't like the max_previous method
                //  arb.requestArbitration(question_id, ethers.BigNumber.from(last_seen_bond_hex, 16), {from:ACCOUNT, value: arbitration_fee})
                const SignedArbitrator = arb.connect(signer);
                if (false && old_version) {
                    console.log('Sending arbitration request using old API');
                    // console.log('using best answer', FOREIGN_PROXY_DATA.best_answer);
                    SignedArbitrator.functions.requestArbitration(question_id, FOREIGN_PROXY_DATA.best_answer, {from:ACCOUNT, value: fee}).then(function(result_tx) {
                        $('body').addClass('foreign-proxy-transaction-sent').removeClass('foreign-proxy-ready');
                    });
                } else {
                    console.log('Sending arbitration request using new API');
                    SignedArbitrator.functions.requestArbitration(question_id, FOREIGN_PROXY_DATA.bond, {from:ACCOUNT, value: fee}).then(function(result_tx) {
                        $('body').addClass('foreign-proxy-transaction-sent').removeClass('foreign-proxy-ready');
                    });
                }
            });

            $('body').addClass('foreign-proxy-ready');
        } catch (err) {
            console.log('Arbitrator failed with error', err);
            markArbitratorFailed(RC_DEFAULT_ADDRESS, arb_addr);
        }
    }
}

function displayWrongChain(specified, detected) {
    console.log('displayWrongChain', specified, detected);
    let specified_network_txt = $('.network-status.network-id-'+specified).text();
    let detected_network_txt = $('.network-status.network-id-'+detected).text();
    if (specified_network_txt == '') {
        specified_network_txt = '[unknown network]';
    }
    if (detected_network_txt == '') {
        detected_network_txt = 'another network';
    }
    console.log(specified_network_txt, detected_network_txt);

    const wallet_info = rc_contracts.walletAddParameters(specified);
    if (wallet_info) {
        const lnk = $('<a>');
        lnk.text($('.add-network-button').text());
        lnk.bind('click', function(evt) {
            console.log('add net');
            evt.stopPropagation();
            console.log('getting', specified);
            ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [wallet_info]
            }).then((result) => {
                console.log('result was', result);
                location.reload();	
            }).catch((error) => {
                console.log('error', error)
            });
            return false;
        });
        $('.add-network-button').empty().append(lnk);
    }

    $('.network-specified-text').text(specified_network_txt);
    $('.network-detected-text').text(detected_network_txt);
    $('body').addClass('error-not-specified-network').addClass('error');

    return;
}

window.addEventListener('load', async function() {

    let cid;

    const args = parseHash();
    if (args['token'] && args['token'] != 'ETH') {
        TOKEN_TICKER = args['token'];
    }
    
    // Get a provider from metamask etc if possible, we'll detect the network ID from it
    // If there isn't one, use the specified network with the hosted RPC node
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum)
    } else  {
        IS_WEB3_FALLBACK = true;

        // Default to mainnet
        let want_cid = 1;
        if (args['network'] && parseInt(args['network'])) {
            want_cid = parseInt(args['network']);
        }

        CHAIN_INFO = rc_contracts.chainData(want_cid);
        // TODO: Handle a supplied unsupported network
        HOSTED_RPC_NODE = CHAIN_INFO['hostedRPC'];
        cid = want_cid;

        provider = new ethers.providers.JsonRpcProvider(HOSTED_RPC_NODE);
        console.log('no window.ethereum, using node ', HOSTED_RPC_NODE);
    }

    signer = provider.getSigner()

    if (args['foreign-proxy']) {
        displayForeignProxy(args['foreign-proxy']);
    }

    provider.on("block", (blockNumber) => {
        if (blockNumber > CURRENT_BLOCK_NUMBER) {
            CURRENT_BLOCK_NUMBER = blockNumber;
            //console.log('updated CURRENT_BLOCK_NUMBER to ', CURRENT_BLOCK_NUMBER);
        }
    })

    provider.on("network", async function(network, old_network_id) {

        cid = network.chainId;

        if (old_network_id) {
            window.location.reload();
        }
        console.log('cid is ', cid);

        if (args['category']) {
            $("#filter-list").find("[data-category='" + args['category'] + "']").addClass("selected")
        } else {
            $("#filter-list").find("[data-category='all']").addClass("selected")
        }

        if (args['network'] && (parseInt(args['network']) != parseInt(cid))) {
            if (!rc_contracts.isChainSupported(parseInt(args['network']))) {
                $('body').addClass('error-invalid-network').addClass('error');
                return;
            } else {
                displayWrongChain(parseInt(args['network']), parseInt(cid));
            }
            return;
        }

        if (!rc_contracts.isChainSupported(cid)) {
            $('body').addClass('error-invalid-network').addClass('error');
            return;
        }

        if (!TOKEN_TICKER) {
            TOKEN_TICKER = rc_contracts.defaultTokenForChain(cid);
            console.log('picked token', TOKEN_TICKER);
        }

        const all_rc_configs = rc_contracts.realityETHConfigs(cid, TOKEN_TICKER);
        let rc_config = null;
        let show_all = true;
        if (args['contract']) {
            for(const cfg_addr in all_rc_configs) {
                // If we got a valid version number for the contract, switch that out for the address and pretend we got that
                if (args['contract'] == 'v' + all_rc_configs[cfg_addr].version_number) {
                    args['contract'] = cfg_addr;
                }
                if (cfg_addr.toLowerCase() == args['contract'].toLowerCase()) {
                    rc_config = all_rc_configs[cfg_addr];
                    show_all = false;
                    break;
                }
            }
        }

        for(const cfg_addr in all_rc_configs) {
            const cfg = all_rc_configs[cfg_addr]; 
            START_BLOCKS[cfg.address.toLowerCase()] = cfg.block;
            RC_INSTANCE_VERSIONS[cfg.address.toLowerCase()] = cfg.version_number;
        }

        // If not found, load the default
        if (!rc_config) {
            rc_config = rc_contracts.realityETHConfig(cid, TOKEN_TICKER);
        }
        
        if (!rc_config) {
            $('body').addClass('error-invalid-network-for-token').addClass('error');
            return;
        }

        initContractSelect(all_rc_configs, rc_config, show_all);

        TOKEN_INFO = rc_contracts.chainTokenList(cid);
console.log('TOKEN_INFO', TOKEN_INFO);
        console.log('got token info', TOKEN_INFO);

        const rc_json = rc_contracts.realityETHInstance(rc_config);
        const arb_json = rc_contracts.arbitratorInstance();

        if (!rc_json) {
            console.log('Token not recognized', TOKEN_TICKER);
            return;
        }

        initToken(TOKEN_TICKER);
        if (!IS_TOKEN_NATIVE) {
            TOKEN_JSON = rc_contracts.erc20Instance(rc_config);
        }

        CHAIN_INFO = rc_contracts.chainData(cid);
        HOSTED_RPC_NODE = CHAIN_INFO['hostedRPC'];
        BLOCK_EXPLORER = CHAIN_INFO['blockExplorerUrls'][0];

        if (!initChain(cid)) {
            $('body').addClass('error-invalid-network').addClass('error');
            return;
        } 

        if (!$('body').hasClass('foreign-proxy')) {
            $('select#token-selection').removeClass('uninitialized');
        }

        USE_COMMIT_REVEAL = (parseInt(args['commit']) == 1);

        if (args['category']) {
            CATEGORY = args['category'];
            $('body').addClass('category-' + category);
            const cat_txt = $("#filter-list").find("[data-category='" + category + "']").text();
            $('#filterby').text(cat_txt);
        }

        RC_DEFAULT_ADDRESS = rc_json.address;
        for(const cfg_addr in all_rc_configs) {
            const cfg = all_rc_configs[cfg_addr];
            const inst = rc_contracts.realityETHInstance(cfg);
            RC_INSTANCES[cfg_addr.toLowerCase()] = new ethers.Contract(cfg_addr, inst.abi, provider);
            if (show_all || cfg_addr == RC_DEFAULT_ADDRESS) {
                RC_DISPLAYED_CONTRACTS.push(cfg_addr);
            }

            // Everyone gets the initial config
            CONTRACT_TEMPLATE_CONTENT[cfg_addr.toLowerCase()] = TEMPLATE_CONFIG.content;

            ARBITRATOR_LIST_BY_CONTRACT[cfg_addr.toLowerCase()] = {}
            ARBITRATOR_LIST_BY_CONTRACT[cfg_addr.toLowerCase()][cfg_addr.toLowerCase()] = 'No arbitration (highest bond wins)';
            ARBITRATOR_VERIFIED_BY_CONTRACT[cfg_addr.toLowerCase()] = {}
            ARBITRATOR_VERIFIED_BY_CONTRACT[cfg_addr.toLowerCase()][cfg_addr.toLowerCase()] = true;
            ARBITRATOR_FAILED_BY_CONTRACT[cfg_addr.toLowerCase()] = {}
            if ('arbitrators' in cfg) {
                for(const arb_addr in cfg['arbitrators']) {
                    ARBITRATOR_LIST_BY_CONTRACT[cfg_addr.toLowerCase()][arb_addr.toLowerCase()] = cfg['arbitrators'][arb_addr];
                    ARBITRATOR_VERIFIED_BY_CONTRACT[cfg_addr.toLowerCase()][arb_addr.toLowerCase()] = true;
                }
            } else {
                console.log('no arbs in config', cfg);
            }

        }
        //console.log('arb init', ARBITRATOR_LIST_BY_CONTRACT, ARBITRATOR_FAILED_BY_CONTRACT, ARBITRATOR_VERIFIED_BY_CONTRACT);
        
        // Set up dummy contract objects, we'll make copies of them with the correct addresses when we need them
        ARBITRATOR_INSTANCE = new ethers.Contract(rc_json.address, arb_json.abi, provider); 
        populateArbitratorSelect(ARBITRATOR_INSTANCE, ARBITRATOR_LIST_BY_CONTRACT[RC_DEFAULT_ADDRESS.toLowerCase()]);
        foreignProxyInitChain(cid);

        const block = await provider.getBlock('latest');

        if (block.number > CURRENT_BLOCK_NUMBER) {
            CURRENT_BLOCK_NUMBER = block.number;
        }

        if (rc_contracts.versionHasFeature(RC_INSTANCE_VERSIONS[RC_DEFAULT_ADDRESS.toLowerCase()], 'min-bond')) {
            $('.rcbrowser--postaquestion').addClass('version-supports-min-bond');
        } 

        const limit_to_contract = show_all ? null : RC_DEFAULT_ADDRESS;

        // Keep a note of when we started fetching stuff so we know when to start fetching stuff that might have changed since from
        let fetch_start_ts = parseInt(new Date().getTime()/1000);

        pageInit(limit_to_contract);

        setupContractClaimSections(RC_DISPLAYED_CONTRACTS);

        //console.log('args', args);
        if (args['question']) {
            //console.log('loading question');
            try {
                const [ctr, qid] = parseContractQuestionID(args['question'], RC_DEFAULT_ADDRESS);
                const question = await ensureQuestionDetailFetched(ctr, qid);
                //console.log('display question', question);
                openQuestionWindow(contractQuestionID(question));
            } catch (err) {
                console.log('could not open question in URL', err);
            }
        }


        // NB If this fails we'll try again when we need to do something using the account
        getAccount(true);

        loadPendingTransactions(cid);
        
        runPollingLoop(RC_DISPLAYED_CONTRACTS, fetch_start_ts);
    });
});

$('.continue-read-only-message').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('body').removeClass('error-no-metamask-plugin').removeClass('error');
});

$('.continue-message').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    const clear_cls = $(this).attr('data-clear-error');
    if (clear_cls) {
        $('body').removeClass('error-' + clear_cls);
    }
    $('body').removeClass('error');
});

$('#token-selection').change(function(e) { 
    e.preventDefault();
    e.stopPropagation();
    const tkn = $(this).val();
    if (tkn == TOKEN_TICKER) {
        // already selected
        return;
    }
    window.location.hash = '#!/token/'+tkn;
    location.reload();
});

$('#contract-selection').change(function(e) { 
    e.preventDefault();
    e.stopPropagation();
    const ctr = $(this).val();
    if ($(this).attr('data-old-val') == ctr) {
        // already selected
        return;
    }
    if (ctr == '') {
        set_hash_param({'contract': null});
    } else {
        set_hash_param({'contract': ctr});
    }
    location.reload();
});

// When on the legacy site, show the moved warning, use the full link url
if (window.location.href.indexOf('realitio') != -1) {
    $('.moved-to-reality-eth').show();
    $('.logo .logo-link').attr('href', $('.logo .logo-link').attr('data-full-url'));
} else if (window.location.href.indexOf('ipfs.io') != -1) {
    $('.logo .logo-link').attr('href', $('.logo .logo-link').attr('data-full-url'));
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

$('.graph-node-switch-link').click(function() {
    if ($('body').hasClass('via-node')) {
        setCookie('graph', 1, 365*10);
    } else {
        setCookie('graph', 0, 365*10);
    }
    location.reload();
});

})();
