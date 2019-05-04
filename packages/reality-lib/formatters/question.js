'use strict;';

const BN = require('bn.js');
const BigNumber = require('bignumber.js');
const ethereumjs_abi = require('ethereumjs-abi')
const vsprintf = require("sprintf-js").vsprintf
const QUESTION_MAX_OUTCOMES = 128;

exports.delimiter = function() {
    return '\u241f'; // Thought about '\u0000' but it seems to break something;
}

exports.contentHash = function(template_id, opening_ts, content) {
    return "0x" + ethereumjs_abi.soliditySHA3(
        ["uint256", "uint32", "string"],
        [ new BN(template_id), new BN(opening_ts), content]
    ).toString('hex');
}

exports.questionID = function(template_id, question, arbitrator, timeout, opening_ts, sender, nonce) {
    var content_hash = this.contentHash(template_id, opening_ts, question);
    // The seems to be something wrong with how soliditySHA3 handles bytes32, so tell it we gave it uint256
    return "0x" + ethereumjs_abi.soliditySHA3(
        //["bytes32", "address", "uint256", "address", "uint256"],
        ["uint256", "address", "uint32", "address", "uint256"],
        [ new BN(content_hash.replace(/^0x/, ''), 16), arbitrator, new BN(timeout), sender, new BN(nonce)]
    ).toString('hex');
}

exports.minNumber = function(qjson) {
    var is_signed = (qjson['type'] == 'int');
    if (!is_signed) {
        return new BigNumber(0);
    }
    return this.maxNumber(qjson).neg();
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
        answer = this.arrayToBitmaskBigNumber(answer);
    }
    var decimals = parseInt(qjson['decimals']);
    if (!decimals) {
        decimals = 0;
    }
    if (decimals > 0) {
        var multiplier = new BigNumber(10).pow(new BigNumber(decimals));
        answer = new BigNumber(answer).times(multiplier).toString(16);
    }
    //console.log('muliplied to ',answer.toString());
    var bn;
    if (qtype == 'int') {
        bn = new BN(answer, 16).toTwos(256);
    } else if (qtype == 'uint') {
        bn = new BN(answer, 16);
    } else {
        return this.padToBytes32(new BigNumber(answer).toString(16));
    }
    return this.padToBytes32(bn.toString(16));
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

exports.parseQuestionJSON = function(data) {

    var question_json;
    try {
        question_json = JSON.parse(data);
    } catch(e) {
        console.log('parse fail', e);
        console.log('parse fail', data);
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

exports.populatedJSONForTemplate = function(template, question) {
    var qbits = question.split(this.delimiter());
    //console.log('pp', template);
    //console.log('qbits', qbits);
    var interpolated = vsprintf(template, qbits);
    //console.log('resulting template', interpolated);
    return this.parseQuestionJSON(interpolated);
}

exports.encodeText = function(qtype, txt, outcomes, category, lang) {
    var qtext = JSON.stringify(txt).replace(/^"|"$/g, '');
    var delim = this.delimiter();
    //console.log('using template_id', template_id);
    if (qtype == 'single-select' || qtype == 'multiple-select') {
        var outcome_str = JSON.stringify(outcomes).replace(/^\[/, '').replace(/\]$/, '');
        //console.log('made outcome_str', outcome_str);
        qtext = qtext + delim + outcome_str;
        //console.log('made qtext', qtext);
    }
    if (typeof lang == 'undefined' || lang == '') {
        lang = 'en_US';
    }
    qtext = qtext + delim + category + delim + lang;
    return qtext;
}

// A value used to denote that the question is invalid or can't be answered
exports.getInvalidValue = function(question_json) {
    // equivalent to -1 in twos complement
    return '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
}

exports.getLanguage = function(question_json) {
    if ( typeof question_json['lang'] == 'undefined' || question_json['lang'] == '') {
        return 'en_US';
    }
    return question_json['lang'];
}

exports.getAnswerString = function(question_json, answer) {
    if (answer === null) {
        return 'null';
    }

    if (answer == this.getInvalidValue(question_json)) {
        return 'Invalid';
    }

    var label = '';
    switch (question_json['type']) {
        case 'uint':
            label = this.bytes32ToString(answer, question_json);
            break;
        case 'int':
            label = this.bytes32ToString(answer, question_json);
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
            let ts = parseInt(this.bytes32ToString(answer, question_json));
            let dateObj = new Date(ts * 1000);
            let year = dateObj.getFullYear();
            let month = dateObj.getMonth() + 1;
            let date = dateObj.getDate();
            label = year + '/' + month + '/' + date;
            break;
    }

    return label;
}

exports.commitmentID = function(question_id, answer_hash, bond) {
    return "0x" + ethereumjs_abi.soliditySHA3(
        ["uint256", "uint256", "uint256"],
        [ new BN(question_id.replace(/^0x/, ''), 16), new BN(answer_hash.replace(/^0x/, ''), 16), new BN(bond.toString(16), 16)]
    ).toString('hex');
}

exports.answerHash = function(answer_plaintext, nonce) {
    return "0x" + ethereumjs_abi.soliditySHA3(
        ["uint256", "uint256"],
        [ new BN(answer_plaintext.replace(/^0x/, ''), 16), new BN(nonce.replace(/^0x/, ''), 16)]
    ).toString('hex');
}
