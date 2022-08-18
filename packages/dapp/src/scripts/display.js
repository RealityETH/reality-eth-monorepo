'use strict';

import Ps from 'perfect-scrollbar';

const ethers = require("ethers");
const rc_question = require('@reality.eth/reality-eth-lib/formatters/question.js');
const rc_contracts = require('@reality.eth/contracts');

const MAX_STORE = 10;

const timeago = require('timeago.js');
const timeAgo = new timeago();

let WINDOW_POSITION = [];

import {
    isAddressInList
} from './util.js';

import {
    contractQuestionID,
    cqToID,
    isArbitrationPending,
    isFinalized,
    isAnswered,
    isAnswerActivityStarted,
    isAnsweredOrAnswerActive,
    isAnythingUnrevealed,
    isBeforeOpeningDate,
    isCommitExpired,
    isQuestionBeforeOpeningDate,
    isReopenCandidate,
    isReopenable,
    hasUnrevealedCommits,
    isTopAnswerRevealable,
    parseContractQuestionID,
} from './data.js';

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

// TODO sort out duplication
function decimalizedBigNumberToHuman(num, decimals) {
    return ethers.utils.formatUnits(num, decimals).replace(/\.0+$/,'');
}




function activateSection(section_name) {
    $('div#questions-container').find('.main-nav li a').each(function() {
        if ($(this).attr('data-menu') == section_name) {
            $(this).addClass('activated');
        }
    });
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

function calculateActiveRank(created, bounty, bond, small_number) {

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
        const small_num = ethers.BigNumber.from(small_number);
        const ms = secs.div(ethers.BigNumber.from(600));
        const boost = ms.mul(small_num);
        rank = rank.add(boost);
    }

    // Anything else goes by time posted
    rank = rank.add(created);

    // console.log('rank', rank.toNumber());
    return rank;

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

function depopulateSection(section_name, question_id, arbitrator_failed_by_contract, arbitrator_list) {
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
            populateSection(section_name, qdata, current_last_qid, arbitrator_failed_by_contract, arbitrator_list);
        }
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

function isAnswerInputLookingValid(parent_div, question_json) {

    if (parent_div.find('.invalid-selected').length > 0) {
        return true;
    }
    if (parent_div.find('.too-soon-selected').length > 0) {
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

function populateSection(section_name, question, before_item, arbitrator_failed_by_contract, arbitrator_list) {

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

    if (arbitrator_failed_by_contract[question.contract.toLowerCase()] && arbitrator_failed_by_contract[question.contract.toLowerCase()][question.arbitrator.toLowerCase()]) {
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
    if (isFinalized(question) && question.bounty.add(question.bond).lt(ethers.BigNumber.from(question.small_number))) {
        balloon_html += 'The reward was very low and no substantial bond was posted.<br /><br />This means there may not have been enough incentive to post accurate information.<br /><br />';
    }
    const valid_arbitrator = isAddressInList(arbitrator_list, question.arbitrator, question.contract);
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

function reflectDisplayEntryChanges(is_initial_load_done) {
    //console.log('checking DISPLAY_ENTRIES', DISPLAY_ENTRIES);
    //look at current sections and update blockchain scanning message to
    //no questions found if no items exist
    const detypes = Object.keys(DISPLAY_ENTRIES);
    // console.log('no questions cateogry, DISPLAY_ENTRIES for detype', DISPLAY_ENTRIES, detypes);
    for (let i=0; i<detypes.length; i++) {
        const detype = detypes[i];
        const has_items = ($('#' + detype).find('div.questions-list div.questions__item').length > 0);
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

function renderTimeAgo(i, ts) {
    const old_attr = i.find('.timeago').attr('datetime');
    if (old_attr != '') {
        timeago.cancel(i.find('.timeago'));
    }
    i.find('.timeago').attr('datetime', rc_question.convertTsToString(ts));
    timeAgo.render(i.find('.timeago'));
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

function uiHash(str) {
    return ethers.utils.solidityKeccak256(["string"], [str]);
}

function updateAnyDisplay(contract_question_id, txt, cls) {
    $("[data-contract-question-id='" + contract_question_id + "']").find('.' + cls).text(txt);
}

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

function updateRankingSections(question, changed_field, changed_val, arbitrator_failed_by_contract, arbitrator_list) {
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
                    depopulateSection(s, question_id, arbitrator_failed_by_contract, arbitrator_list);
                }
            }
            const insert_before = update_ranking_data('questions-resolved', contractQuestionID(question), question.finalization_ts, 'desc');
            //console.log('insert_before iss ', insert_before);
            if (insert_before !== -1) {
                //console.log('poulating', question);
                // TODO: If question may not be populated, maybe we should refetch here first
                populateSection('questions-resolved', question, insert_before, arbitrator_failed_by_contract, arbitrator_list);
            }
        } else {
            //console.log('updating closing soon with timestamp', question_id, question.finalization_ts.toString());
            const insert_before = update_ranking_data('questions-closing-soon', contractQuestionID(question), question.finalization_ts, 'asc');
            //console.log('insert_before was', insert_before);
            if (insert_before !== -1) {
                populateSection('questions-closing-soon', question, insert_before, arbitrator_failed_by_contract, arbitrator_list);
            }

        }

    } 
    if (changed_field == 'bounty' || changed_field == 'finalization_ts') {
        //var insert_before = update_ranking_data('questions-upcoming', question_id, question.bounty.add(question.bond), 'desc');
        const insert_before = update_ranking_data('questions-upcoming', contractQuestionID(question), question.opening_ts, 'desc');
        //console.log('update for new bounty', question.bounty, 'insert_before is', insert_before);
        if (insert_before !== -1) {
            populateSection('questions-upcoming', question, insert_before, arbitrator_failed_by_contract, arbitrator_list);
        }
    }

    // Things that don't need adding or removing, but may still need the content updating
    updateSectionEntryDisplay(question);
    reflectDisplayEntryChanges();
    // TODO: Need to update sections that haven't changed position, but changed data

}

function updateSectionEntryDisplay(question) {
    $('div.questions__item[data-contract-question-id="' + contractQuestionID(question) + '"]').each(function() {
        //console.log('updateSectionEntryDisplay update question', question.question_id);
        populateSectionEntry($(this), question);
    });
}

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

async function handleLoadMore(sec) {
// new functios moved

    //console.log('loading more sec', sec);

    const old_max = DISPLAY_ENTRIES[sec]['max_show'];
    const new_max = old_max + 3;

    const num_in_doc = $('#' + sec).find('.questions__item').length;

    DISPLAY_ENTRIES[sec]['max_show'] = new_max;

    const old_max_store = DISPLAY_ENTRIES[sec]['max_store'];
    let next_contract_question_ids = [];

    // TODO: We may need to refetch to populate this store
    DISPLAY_ENTRIES[sec]['max_store'] = DISPLAY_ENTRIES[sec]['max_store'] + 3;

    for (let i = num_in_doc; i < new_max && i < DISPLAY_ENTRIES[sec]['ids'].length; i++) {
        const nextid = DISPLAY_ENTRIES[sec]['ids'][i];
        const [next_ctr, next_question_id] = parseContractQuestionID(nextid);
        let previd = null;
        if (i > 0) {
            previd = DISPLAY_ENTRIES[sec]['ids'][i + 1];
        }

        next_question_ids.push({
            'nextid': nextid, 
            'previd': previd
        });
    }

    return [old_max_store, next_question_ids];

}


function countDisplayEntries(sec) {
    return DISPLAY_ENTRIES[sec]['ids'].length;
}

function countDisplayMaxStore(sec) {
    return DISPLAY_ENTRIES[sec]['max_store'];
}

// TODO: Check the posted_ts BigNumber works with rpc
// TODO: Make sure we're setting question.decimals everywhere we need to
function populateSectionEntry(entry, question) {

    const question_id = question.question_id;
    const question_json = question.question_json;
    const posted_ts = ethers.BigNumber.from(question.creation_ts);
    const arbitrator = question.arbitrator;
    const timeout = question.timeout;
    const bounty = decimalizedBigNumberToHuman(question.bounty, question.decimals);
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

    entry.find('.bond-value').text(decimalizedBigNumberToHuman(bond, question.decimals));

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

function closeRCWindow(parent_div) {
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
}

function closeRCQuestionWindow(parent_div, contract_question_id, rcqa) {
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
}

export {
    activateSection,
    appendBeforeOption,
    calculateActiveRank,
    category_text,
    clearForm,
    datetimeElementToTS,
    depopulateSection,
    displayQuestionDetail,
    displayWrongChain,
    dragMoveListener,
    formatPossibleIPFSLink,
    formattedAnswerFromForm,
    initContractSelect,
    initQuestionTypeUI,
    initScrollBars,
    isAnswerInputLookingValid,
    isArbitratorValid,
    isTitleLong,
    makeSelectAnswerInput,
    parseHash,
    populateArbitratorOptionLabel,
    // populateArbitratorSelect,
    populateSection,
    populateSectionEntry,
    populateTOSSection,
    reflectDisplayEntryChanges,
    renderTimeAgo,
    setRcBrowserPosition,
    set_hash_param,
    setupContractClaimSections,
    setupDatetimeDatePicker,
    uiHash,
    updateAnyDisplay,
    updateQuestionState,
    updateRankingSections,
    updateSectionEntryDisplay,
    update_ranking_data,

    handleLoadMore,
    countDisplayEntries,
    countDisplayMaxStore,

    closeRCWindow,
    closeRCQuestionWindow,
};

