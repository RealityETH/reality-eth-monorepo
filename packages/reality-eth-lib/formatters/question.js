'use strict;';

const BN = require('bn.js');
const BigNumber = require('bignumber.js');
const ethereumjs_abi = require('ethereumjs-abi')
const vsprintf = require("sprintf-js").vsprintf
const QUESTION_MAX_OUTCOMES = 128;
const TEMPLATE_MAX_PLACEHOLDERS = 128;
const marked = require('marked');
const DOMPurify = require('isomorphic-dompurify');
const { convert} = require('html-to-text');
marked.setOptions({headerIds: false});

exports.delimiter = function() {
    return '\u241f'; // Thought about '\u0000' but it seems to break something;
}

exports.contentHash = function(template_id, opening_ts, content) {
    return "0x" + ethereumjs_abi.soliditySHA3(
        ["uint256", "uint32", "string"],
        [ new BN(template_id), new BN(opening_ts), content]
    ).toString('hex');
}

exports.questionID = function(template_id, question, arbitrator, timeout, opening_ts, sender, nonce, min_bond, contract, version) {
    // If there's a min_bond or a contract, insist we also get a version parameter
    if (typeof version === 'undefined') {
        if (typeof min_bond === 'string' || typeof contract === 'string') {
            throw Error("Version not defined");
        }
    }
    if (!version) {
        version = '2.0';
    }
    const vernum = parseInt(version);
    if (isNaN(vernum) || vernum <2 || vernum > 4) {
        throw Error("Version not recognized");
    } 
    if (vernum >= 3) {
        if (typeof min_bond !== 'string') {
            throw Error('min_bond not supplied or invalid. Required in v3. Pass "0x0" for a zero bond')
        }
    } 

    var content_hash = module.exports.contentHash(template_id, opening_ts, question);

    let qid;
    if (vernum < 3) {
      qid = ethereumjs_abi.soliditySHA3(
        //["bytes32", "address", "uint256", "address", "uint256"],
        ["uint256", "address", "uint32", "address", "uint256"],
        [ new BN(content_hash.replace(/^0x/, ''), 16), arbitrator, new BN(timeout), sender, new BN(nonce)]
      );
    } else {
      // bytes32 question_id = keccak256(abi.encodePacked(content_hash, arbitrator, timeout, uint256(min_bond), address(this), msg.sender, nonce));
      qid = ethereumjs_abi.soliditySHA3(
        ["uint256", "address", "uint32", "uint256", "address", "address", "uint256"],
        [ new BN(content_hash.replace(/^0x/, ''), 16), arbitrator, new BN(timeout), new BN(min_bond.replace(/^0x/, ''), 16), contract, sender, new BN(nonce)]
      );
    }

    // The seems to be something wrong with how soliditySHA3 handles bytes32, so tell it we gave it uint256
    return "0x" + qid.toString('hex');
}

exports.minNumber = function(qjson) {
    var is_signed = (qjson['type'] == 'int');
    if (!is_signed) {
        return new BigNumber(0);
    }
    return module.exports.maxNumber(qjson).neg();
}

exports.maxNumber = function(qjson) {
    var is_signed = (qjson['type'] == 'int');
    var divby = new BigNumber(1);
    if (qjson['decimals']) {
        divby = new BigNumber(10).pow(new BigNumber(qjson['decimals']));
    }
    if (is_signed) {
        divby = divby.times(2);
    }
    return new BigNumber("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").dividedBy(divby);
}

exports.arrayToBitmaskBigNumber = function(selections) {
    // console.log('selections are ', selections);
    var bitstr = '';
    for (var i=0; i<selections.length; i++) {
        var item = selections[i] ? '1' : '0';
        bitstr = item + bitstr;
    }
    //console.log('bitstr',bitstr);
    return new BigNumber(bitstr, 2);
}

exports.answerToBytes32 = function(answer, qjson) {
    var qtype = qjson['type'];
    if (qtype == 'multiple-select') {
        answer = module.exports.arrayToBitmaskBigNumber(answer);
    }
    var decimals = (qtype == 'uint') ? parseInt(qjson['decimals']) : 0;
    if (!decimals) {
        decimals = 0;
    }
    if (decimals > 0) {
        var multiplier = new BigNumber(10).pow(new BigNumber(decimals));
        answer = new BigNumber(answer).times(multiplier).toString(16);
    } else {
        answer = new BigNumber(answer).toString(16);
    }
    //console.log('muliplied to ',answer.toString());
    var bn;
    if (qtype == 'int') {
        bn = new BN(answer, 16).toTwos(256);
    } else if (qtype == 'uint') {
        bn = new BN(answer, 16);
    } else {
        return module.exports.padToBytes32(new BigNumber(answer).toString(16));
    }
    return module.exports.padToBytes32(bn.toString(16));
}

exports.bytes32ToString = function(bytes32str, qjson) {
    var qtype = qjson['type'];
    var decimals = parseInt(qjson['decimals']);
    if (!decimals) {
        decimals = 0;
    }
    bytes32str = bytes32str.replace(/^0x/, '');
    var bn;
    if (qtype == 'int') {
        var bn = new BN(bytes32str, 16).fromTwos(256);
    } else if (qtype == 'uint' || qtype == 'datetime') {
        var bn = new BN(bytes32str, 16);
    } else if (qtype == 'hash') {
        var bn = new BN(bytes32str, 16);
        return module.exports.padToBytes32(bn.toString('hex')).toLowerCase();
    } else {
        throw Error("Unrecognized answer type " + qtype);
    }
    var ans = bn.toString();
    // Do the decimals with BigNumber as it seems to work better
    if (decimals > 0) {
        var multiplier = new BigNumber(10).pow(new BigNumber(decimals));
        ans = new BigNumber(ans).dividedBy(multiplier).toString();
    }
    return ans.toString();
}

exports.padToBytes32 = function(n, raw) {
    while (n.length < 64) {
        n = "0" + n;
    }
    if (raw) {
        return n;
    }
    return "0x" + n;
}

exports.convertTsToString = function(ts) {
    if (typeof ts.toNumber === 'function') {
        ts = ts.toNumber();
    } 
    let date = new Date();
    date.setTime(ts * 1000);
    return date.toISOString();
}

exports.secondsTodHms = function(sec) {
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

exports.parseQuestionJSON = function(data, errors_to_title) {

    // Strip unicode null-terminated-string control characters if there are any.
    // These seem to be stripped already if we got data via The Graph, and only passed to us on RPC.
    data = data.replace(/\u0000/g, "");
    
    var question_json;
    try {
        question_json = JSON.parse(data);
    } catch(e) {
        question_json = {
            'title': '[Badly formatted question]: ' + data,
            'type': 'broken-question',
            'errors': {"json_parse_failed": true}
        };
    }

    if (question_json['outcomes'] && question_json['outcomes'].length > QUESTION_MAX_OUTCOMES) {
        if (!question_json['errors']) question_json['errors'] = {};
        question_json['errors']['too_many_outcomes'] = true;
    }
    if ('type' in question_json && question_json['type'] == 'datetime' && 'precision' in question_json) {
        if (!(['Y', 'm', 'd', 'H', 'i', 's'].includes(question_json['precision']))) {
            if (!question_json['errors']) question_json['errors'] = {};
            question_json['errors']['invalid_precision'] = true;
        }
    }
    // If errors_to_title is specified, we add any error message to the title to make sure we don't lose it
    if (errors_to_title) {
        if ('errors' in question_json) {
            const prependers = {
                'invalid_precision': 'Invalid date format',
                'too_many_outcomes': 'Too many outcomes'
            }
            for (const e in question_json['errors']) {
                if (e in prependers) {
                    question_json['title'] = '['+prependers[e]+'] ' + question_json['title'];
                }
            }
        }
    }

    if (!question_json['format']) {
        question_json['format'] = 'text/plain';
    }

    if (question_json['format'] == 'text/plain') {
        question_json['title_text'] = question_json['title'];
    } else if (question_json['format'] == 'text/markdown') {
        try{
            const safeMarkdown = DOMPurify.sanitize(question_json['title'], { USE_PROFILES: {html: false}});
            if (safeMarkdown !== question_json['title']) {
                if (!question_json['errors']) question_json['errors'] = {};
                question_json['errors']['unsafe_markdown'] = true;
            } else {
                question_json['title_html'] = marked.parse(safeMarkdown).replace(/<img.*src=\"(.*?)\".*alt=\"(.*?)\".*\/?>/, '<a href="$1">$2</a>');
                question_json['title_text'] = convert(question_json['title_html'], {
                    selectors: [
                        {selector: 'h1', options: { uppercase: false }}, 
                        {selector: 'h2', options: { uppercase: false }},
                        {selector: 'hr', format: 'skip'}
                    ]
                });
            }
        } catch(e){
            if (!question_json['errors']) question_json['errors'] = {};
            question_json['errors']['markdown_parse_failed'] = true
        }
    } else {
        if (!question_json['errors']) question_json['errors'] = {};
        question_json['errors']['invalid_format'] = true;
    }

    // If errors_to_title is specified, we add any error message to the title to make sure we don't lose it
    if (errors_to_title) {
        if ('errors' in question_json) {
            const prependers = {
                'invalid_format': 'Invalid format',
                'unsafe_markdown': 'Unsafe markdown',
                'markdown_parse_failed': 'Bad markdown parse'
            }
            for (const e in question_json['errors']) {
                if (e in prependers) {
                    question_json['title'] = '['+prependers[e]+'] ' + question_json['title'];
                }
            }
        }
    }

    return question_json;

}

exports.populatedJSONForTemplate = function(template, question, errors_to_title) {
    var qbits = question.split(module.exports.delimiter());
    //console.log('pp', template);
    //console.log('qbits', qbits);
    var interpolated = vsprintf(template, qbits);
    //console.log('resulting template', interpolated);
    return module.exports.parseQuestionJSON(interpolated, errors_to_title);
}

// Encode text, assuming the template has placeholders in the order specified in the params.
// Additional information about the template can be passed in as template_definitions.
// If not specified, we'll assume it works like our standard built-in templates.
exports.encodeCustomText = function(params) {

    var items = [];
    for (const p in params) {
        var val = params[p];
        if (typeof val === 'string') {
            // Stringify puts quotation marks around the string, so strip them
            val = JSON.stringify(val).replace(/^"|"$/g, '');
        } else if (typeof val === 'object') { 
            // An array of values should be stringified as a JSON array.
            // However template should do "outcomes: [%s]" instead of "outcomes: %s".
            // In that case strip the closing brackets.
            val = JSON.stringify(val).replace(/^\[/, '').replace(/\]$/, '');
        } else {
            val = null;
        } 
        items.push(val);
    }
    const ret = items.join(module.exports.delimiter());
    return ret;

}

exports.guessTemplateConfig = function(template) {
    // Use the hash of the template as a temporary placeholder
    // Since you can't hash yourself we can be confident this won't collide.
    const placeholder = '0x' + ethereumjs_abi.soliditySHA3(['string'], [template]).toString('hex');
    const arr_placeholder = '0x' + ethereumjs_abi.soliditySHA3(['string'], [template + "_arr"]).toString('hex');
    var pl_arr = new Array(TEMPLATE_MAX_PLACEHOLDERS);
    pl_arr.fill(placeholder);
    var interpolated = vsprintf(template, pl_arr);

    // Quote the placeholders in any arrays that didn't originally have quotes
    interpolated = interpolated.replaceAll('['+placeholder+']', '"'+arr_placeholder+'"');

    const fake_json = module.exports.parseQuestionJSON(interpolated, false);

    /*
    Meta example:
    {
        'labels': {'dog': 'Dogs', 'cat': 'Cats'},
        'tags': {'2': 'dog'}
        'defaults': {'lang': 'en_US'}
    }
    */


    // If there's a section called __META, use that for titling columns etc
    var meta = '__META' in fake_json ? fake_json['__META'] : {};
    var labels = 'labels' in meta ? meta['labels'] : {};

    var fields = {};
    for (const k in fake_json) {
        if (k == 'title_text' || k == 'title_html' || k == '__META') {
            // Fields we add automatically
            continue;
        }

        // We assume that every placeholder is either the value for a field, or contained in it.
        // ie we handle
        //    "myfield": "%s"
        //    "myfield": "A %s and another %s."
        //    "myfield": [%s]

        var fdef = {};
        fdef['label'] = (k in labels) ? labels[k] : k;
        const regexp = new RegExp('('+placeholder+'|'+arr_placeholder+')');
        //const regexp = new RegExp('('+placeholder+')');
        const bits = fake_json[k].split(regexp);
        // console.log(bits);
        var parts = [];
        var part_i = 0;
        for(const b in bits) {
            if (bits[b] == '') {
                continue;
            }
            if (bits[b] == placeholder || bits[b] == arr_placeholder) {
                let part_label = k + '_' + part_i;
                if (part_label in labels) {
                    part_label = labels[part_label];
                }
                if (bits[b] == placeholder) {
                    parts.push({'part': 'parameter', 'part_index': part_i, 'label': part_label})
                } else {
                    parts.push({'part': 'array_parameter', 'part_index': part_i, 'label': part_label})
                }
                part_i++;
            } else {
                parts.push({'part': 'text', 'value': bits[b]});
            }
        }
        fdef['parts'] = parts;
        fields[k] = fdef;
    }

    var tags = {};
    if ('tags' in meta) {
        tags = meta['tags']
    }

    return {
        'fields': fields,
        'tags': tags
    };

}

exports.encodeText = function(qtype, txt, outcomes, category, lang) {
    var def = {};
    def['title'] = txt;
    if (qtype == 'single-select' || qtype == 'multiple-select') {
        def['outcomes'] = outcomes;
    }
    def['category'] = category;
    def['lang'] = lang;

    return module.exports.encodeCustomText(def);
}

// A value used to denote that the question is invalid or can't be answered
exports.getInvalidValue = function(question_json) {
    // equivalent to -1 in twos complement
    return '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
}

// A value used to denote that the question is invalid or can't be answered
exports.getAnsweredTooSoonValue = function(question_json) {
    // equivalent to -2 in twos complement
    return '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
}

exports.getLanguage = function(question_json) {
    if ( typeof question_json['lang'] == 'undefined' || question_json['lang'] == '') {
        return 'en_US';
    }
    return question_json['lang'];
}

exports.hasInvalidOption = function(question_json, contract_version) {
    return !('has_invalid' in question_json && !question_json['has_invalid']);
}

exports.hasAnsweredTooSoonOption = function(question_json, contract_version) {
    const bits = contract_version.split('.');
    return (parseInt(bits[0]) >= 3);
}

exports.getAnswerString = function(question_json, answer) {
    if (answer === null) {
        return 'null';
    }

    if (answer == module.exports.getInvalidValue(question_json)) {
        return 'Invalid';
    }

    if (answer == module.exports.getAnsweredTooSoonValue(question_json)) {
        return 'Answered too soon';
    }

    var label = '';
    switch (question_json['type']) {
        case 'uint':
            label = module.exports.bytes32ToString(answer, question_json);
            break;
        case 'int':
            label = module.exports.bytes32ToString(answer, question_json);
            break;
        case 'hash':
            label = module.exports.bytes32ToString(answer, question_json);
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
                var entries = [];
                for (var i = question_json['outcomes'].length - 1; i >= 0; i--) {
                    if (answer_bits[i] === '1') {
                        var idx = answer_bits.length - 1 - i;
                        entries.push(question_json['outcomes'][idx]);
                    }
                }
                return entries.join(' / ');
            }
            break;
        case 'datetime':
            let precision = 'd';
            if ('precision' in question_json && ['Y', 'm', 'd', 'H', 'i', 's'].includes(question_json['precision'])) {
                precision = question_json['precision'];
            }
            let ts = parseInt(module.exports.bytes32ToString(answer, question_json));
            let dateObj = new Date(ts * 1000);

            const year = dateObj.getUTCFullYear();
            const month = dateObj.getUTCMonth() + 1;
            const date = dateObj.getUTCDate();
            const hour = dateObj.getUTCHours();
            const min = dateObj.getUTCMinutes();
            const sec = dateObj.getUTCSeconds();

            // We need whatever the precision states, plus anything above
            const needy = true;
            const needm = (precision != 'Y');
            const needd = needm && (precision != 'm');
            const needH = needd && (precision != 'd');
            const needi = needH && (precision != 'H');
            const needs = needi && (precision != 'i');

            // If anything is set then we've got it.
            // We also consider that anything required by the precision is there, but set to 0
            const hass = needs || sec > 0;
            const hasi = needi || hass || min > 0;
            const hasH = needH || hasi || hour > 0;
            const hasd = needd || hasH || date > 1;
            const hasm = needm || hasd || month > 1;
            const hasy = true;

            // We'll show an invalid warning if we've got a more precise date than the precision demands
            let invalid = false;
            if (!needm && hasm) invalid = true;
            if (!needd && hasd) invalid = true;
            if (!needH && hasH) invalid = true;
            if (!needi && hasi) invalid = true;
            if (!needs && hass) invalid = true;

            if (invalid) {
                label = '[Invalid datetime]: ';
            }

            function pad2(n) { return ("0" + n).slice(-2); }
    
            if (hasy) {
                label += year;
            }
            if (hasm) {
                label += '-'+pad2(month);
            }
            if (hasd) {
                label += '-'+pad2(date);
            }
            if (hasH) {
                label += ' '+pad2(hour);
            } 
            if (hasi) {
                label += ':'+pad2(min);
            } else if (hasH) {
                // "2021-12-23 11" without the minutes at the end is hard to understand so add "hr"
                label += 'hr';
            }
            if (hass) {
                label += ':'+pad2(sec);
            } 
            break;
    }

    return label;
}

exports.commitmentID = function(question_id, answer_hash, bond) {
    const bond_hex = (typeof(bond) === 'string') ? bond : bond.toString(16);
    return "0x" + ethereumjs_abi.soliditySHA3(
        ["uint256", "uint256", "uint256"],
        [ new BN(question_id.replace(/^0x/, ''), 16), new BN(answer_hash.replace(/^0x/, ''), 16), new BN(bond_hex.replace(/^0x/, ''), 16)]
    ).toString('hex');
}

exports.answerHash = function(answer_plaintext, nonce) {
    return "0x" + ethereumjs_abi.soliditySHA3(
        ["uint256", "uint256"],
        [ new BN(answer_plaintext.replace(/^0x/, ''), 16), new BN(nonce.replace(/^0x/, ''), 16)]
    ).toString('hex');
}

exports.shortDisplayQuestionID = function(question_id) {
    // Question ID may or may not have the contract address prepended
    const bits = question_id.split('-');
    const qid = bits[bits.length-1];
    return qid.substring(2,9) + '...' + qid.slice(-7);
}
