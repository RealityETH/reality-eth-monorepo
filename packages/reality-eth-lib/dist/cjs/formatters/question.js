"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delimiter = delimiter;
exports.contentHash = contentHash;
exports.questionID = questionID;
exports.minNumber = minNumber;
exports.maxNumber = maxNumber;
exports.arrayToBitmaskBigNumber = arrayToBitmaskBigNumber;
exports.padToBytes32 = padToBytes32;
exports.answerToBytes32 = answerToBytes32;
exports.bytes32ToString = bytes32ToString;
exports.convertTsToString = convertTsToString;
exports.secondsTodHms = secondsTodHms;
exports.parseQuestionJSON = parseQuestionJSON;
exports.populatedJSONForTemplate = populatedJSONForTemplate;
exports.encodeCustomText = encodeCustomText;
exports.guessTemplateConfig = guessTemplateConfig;
exports.encodeText = encodeText;
exports.getInvalidValue = getInvalidValue;
exports.getAnsweredTooSoonValue = getAnsweredTooSoonValue;
exports.getLanguage = getLanguage;
exports.hasInvalidOption = hasInvalidOption;
exports.hasAnsweredTooSoonOption = hasAnsweredTooSoonOption;
exports.getAnswerString = getAnswerString;
exports.commitmentID = commitmentID;
exports.answerHash = answerHash;
exports.shortDisplayQuestionID = shortDisplayQuestionID;
const ethers_1 = require("ethers");
const marked_1 = require("marked");
const isomorphic_dompurify_1 = __importDefault(require("isomorphic-dompurify"));
const QUESTION_MAX_OUTCOMES = 128;
const TEMPLATE_MAX_PLACEHOLDERS = 128;
marked_1.marked.setOptions({ headerIds: false });
// Replace %s placeholders in order from args array
function vsprintf(template, args) {
    let i = 0;
    return template.replace(/%s/g, () => (i < args.length ? args[i++] : ''));
}
// Convert marked.js HTML output to plain text.
// Handles headings, paragraphs, blockquotes, lists; strips inline tags; skips hr.
function htmlToText(html) {
    function decodeEntities(str) {
        return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
    }
    function stripInline(h) {
        return decodeEntities(h.replace(/<[^>]+>/g, ''));
    }
    const blocks = [];
    const blockRe = /<(h[1-6]|p|blockquote|ul|ol)([^>]*)>([\s\S]*?)<\/\1>|<hr[^>]*\/?>/gi;
    let match;
    while ((match = blockRe.exec(html)) !== null) {
        const tag = match[1] ? match[1].toLowerCase() : 'hr';
        const content = match[3] || '';
        if (tag === 'hr')
            continue;
        let text = '', leading = 2, trailing = 2;
        if (/^h[1-6]$/.test(tag)) {
            text = stripInline(content).trim();
            leading = 3;
            trailing = 3;
        }
        else if (tag === 'p') {
            text = stripInline(content).trim();
        }
        else if (tag === 'blockquote') {
            const inner = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_m, pc) => stripInline(pc).trim()).trim();
            text = '> ' + inner;
        }
        else if (tag === 'ul') {
            const items = [];
            content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, item) => {
                items.push(' * ' + stripInline(item).trim());
                return '';
            });
            text = items.join('\n');
        }
        else if (tag === 'ol') {
            const items = [];
            let i = 1;
            content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, item) => {
                items.push(' ' + i + '. ' + stripInline(item).trim());
                i++;
                return '';
            });
            text = items.join('\n');
        }
        if (text !== '')
            blocks.push({ text, leading, trailing });
    }
    if (blocks.length === 0)
        return '';
    let result = blocks[0].text;
    for (let i = 1; i < blocks.length; i++) {
        result += '\n'.repeat(Math.max(blocks[i - 1].trailing, blocks[i].leading)) + blocks[i].text;
    }
    return result;
}
function delimiter() {
    return '␟';
}
function contentHash(template_id, opening_ts, content) {
    return ethers_1.ethers.utils.solidityKeccak256(['uint256', 'uint32', 'string'], [template_id, opening_ts, content]);
}
function questionID(template_id, question, arbitrator, timeout, opening_ts, sender, nonce, min_bond, contract, version) {
    if (typeof version === 'undefined') {
        if (typeof min_bond === 'string' || typeof contract === 'string') {
            throw Error('Version not defined');
        }
    }
    if (!version)
        version = '2.0';
    const vernum = parseInt(version);
    if (isNaN(vernum) || vernum < 2 || vernum > 4) {
        throw Error('Version not recognized');
    }
    if (vernum >= 3) {
        if (typeof min_bond !== 'string') {
            throw Error('min_bond not supplied or invalid. Required in v3. Pass "0x0" for a zero bond');
        }
    }
    const content_hash = contentHash(template_id, opening_ts, question);
    if (vernum < 3) {
        return ethers_1.ethers.utils.solidityKeccak256(['uint256', 'address', 'uint32', 'address', 'uint256'], [content_hash, arbitrator, timeout, sender, nonce]);
    }
    else {
        const contractAddr = ethers_1.ethers.utils.hexZeroPad(ethers_1.ethers.BigNumber.from(contract).toHexString(), 20);
        return ethers_1.ethers.utils.solidityKeccak256(['uint256', 'address', 'uint32', 'uint256', 'address', 'address', 'uint256'], [content_hash, arbitrator, timeout, min_bond, contractAddr, sender, nonce]);
    }
}
function minNumber(qjson) {
    if (qjson['type'] !== 'int')
        return 0n;
    return -maxNumber(qjson);
}
function maxNumber(qjson) {
    const is_signed = qjson['type'] === 'int';
    const uint256_max = (1n << 256n) - 1n;
    let divby = 1n;
    if (qjson['decimals']) {
        divby = 10n ** BigInt(qjson['decimals']);
    }
    if (is_signed)
        divby *= 2n;
    return uint256_max / divby;
}
function arrayToBitmaskBigNumber(selections) {
    let bitstr = '';
    for (let i = 0; i < selections.length; i++) {
        bitstr = (selections[i] ? '1' : '0') + bitstr;
    }
    return bitstr ? BigInt('0b' + bitstr) : 0n;
}
function padToBytes32(n, raw) {
    while (n.length < 64)
        n = '0' + n;
    return raw ? n : '0x' + n;
}
function answerToBytes32(answer, qjson) {
    const qtype = qjson['type'];
    if (qtype === 'hash') {
        return bytes32ToString(answer, qjson);
    }
    if (qtype === 'multiple-select') {
        answer = arrayToBitmaskBigNumber(answer);
    }
    let decimals = (qtype === 'uint') ? parseInt(String(qjson['decimals'])) : 0;
    if (!decimals)
        decimals = 0;
    let ans_hex;
    if (qtype === 'int') {
        const bi = BigInt(String(answer));
        ans_hex = (bi < 0n ? bi + (1n << 256n) : bi).toString(16);
    }
    else if (decimals > 0) {
        ans_hex = ethers_1.ethers.utils.parseUnits(String(answer), decimals).toHexString().replace(/^0x/, '');
    }
    else {
        ans_hex = BigInt(answer).toString(16);
    }
    return padToBytes32(ans_hex);
}
function bytes32ToString(bytes32str, qjson) {
    const qtype = qjson['type'];
    let decimals = parseInt(String(qjson['decimals']));
    if (!decimals)
        decimals = 0;
    bytes32str = bytes32str.replace(/^0x/, '');
    if (qtype === 'hash') {
        return padToBytes32(bytes32str).toLowerCase();
    }
    const bi = BigInt('0x' + bytes32str);
    let ans;
    if (qtype === 'int') {
        const threshold = 1n << 255n;
        ans = (bi >= threshold ? bi - (1n << 256n) : bi).toString();
    }
    else if (qtype === 'uint' || qtype === 'datetime') {
        ans = bi.toString();
    }
    else {
        throw Error('Unrecognized answer type ' + qtype);
    }
    if (decimals > 0) {
        const divisor = 10n ** BigInt(decimals);
        const bigAns = BigInt(ans);
        const whole = bigAns / divisor;
        const frac = bigAns % divisor;
        if (frac === 0n) {
            ans = whole.toString();
        }
        else {
            const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
            ans = whole.toString() + '.' + fracStr;
        }
    }
    return ans;
}
function convertTsToString(ts) {
    if (typeof ts.toNumber === 'function') {
        ts = ts.toNumber();
    }
    const date = new Date();
    date.setTime(ts * 1000);
    return date.toISOString();
}
function secondsTodHms(sec) {
    const s = Number(sec);
    const d = Math.floor(s / (3600 * 24));
    const h = Math.floor(s % (3600 * 24) / 3600);
    const m = Math.floor(s % (3600 * 24) % 3600 / 60);
    const r = Math.floor(s % (3600 * 24) % 3600 % 60);
    const dDisplay = d > 0 ? d + (d === 1 ? ' day ' : ' days ') : '';
    const hDisplay = h > 0 ? h + (h === 1 ? ' hour ' : ' hours ') : '';
    const mDisplay = m > 0 ? m + (m === 1 ? ' minute ' : ' minutes ') : '';
    const sDisplay = r > 0 ? r + (r === 1 ? ' second' : ' seconds') : '';
    return dDisplay + hDisplay + mDisplay + sDisplay;
}
function parseQuestionJSON(data, errors_to_title, vsprint_errors) {
    data = data.replace(/ /g, '');
    let question_json;
    try {
        question_json = JSON.parse(data);
    }
    catch (e) {
        question_json = {
            title: '[Badly formatted question]: ' + data,
            type: 'broken-question',
            errors: { json_parse_failed: true },
        };
    }
    if (question_json['outcomes'] && question_json['outcomes'].length > QUESTION_MAX_OUTCOMES) {
        if (!question_json['errors'])
            question_json['errors'] = {};
        question_json['errors']['too_many_outcomes'] = true;
    }
    if ('type' in question_json && question_json['type'] === 'datetime' && 'precision' in question_json) {
        if (!(['Y', 'm', 'd', 'H', 'i', 's'].includes(String(question_json['precision'])))) {
            if (!question_json['errors'])
                question_json['errors'] = {};
            question_json['errors']['invalid_precision'] = true;
        }
    }
    if (vsprint_errors && vsprint_errors['suspicious_extra_data']) {
        if (!question_json['errors'])
            question_json['errors'] = {};
        question_json['errors']['suspicious_extra_data'] = true;
    }
    if (errors_to_title) {
        if ('errors' in question_json) {
            const prependers = {
                invalid_precision: 'Invalid date format',
                too_many_outcomes: 'Too many outcomes',
            };
            for (const e in question_json['errors']) {
                if (e in prependers) {
                    question_json['title'] = '[' + prependers[e] + '] ' + question_json['title'];
                }
            }
        }
    }
    if (!question_json['format'])
        question_json['format'] = 'text/plain';
    if (question_json['format'] === 'text/plain') {
        question_json['title_text'] = question_json['title'];
    }
    else if (question_json['format'] === 'text/markdown') {
        try {
            const safeMarkdown = isomorphic_dompurify_1.default.sanitize(String(question_json['title']), { USE_PROFILES: { html: false } });
            if (safeMarkdown !== question_json['title']) {
                if (!question_json['errors'])
                    question_json['errors'] = {};
                question_json['errors']['unsafe_markdown'] = true;
            }
            else {
                question_json['title_html'] = marked_1.marked.parse(safeMarkdown).replace(/<img.*src="(.*?)".*alt="(.*?)".*\/?>/, '<a href="$1">$2</a>');
                question_json['title_text'] = htmlToText(String(question_json['title_html']));
            }
        }
        catch (e) {
            if (!question_json['errors'])
                question_json['errors'] = {};
            question_json['errors']['markdown_parse_failed'] = true;
        }
    }
    else {
        if (!question_json['errors'])
            question_json['errors'] = {};
        question_json['errors']['invalid_format'] = true;
    }
    if (errors_to_title) {
        if ('errors' in question_json) {
            const prependers = {
                invalid_format: 'Invalid format',
                unsafe_markdown: 'Unsafe markdown',
                markdown_parse_failed: 'Bad markdown parse',
                suspicious_extra_data: 'Suspicious Extra Data',
            };
            for (const e in question_json['errors']) {
                if (e in prependers) {
                    question_json['title'] = '[' + prependers[e] + '] ' + question_json['title'];
                }
            }
        }
    }
    return question_json;
}
function populatedJSONForTemplate(template, question, errors_to_title) {
    const qbits = question.split(delimiter());
    const interpolated = vsprintf(template, qbits);
    let vsprint_errors = null;
    if (question !== '') {
        const tweak_question = question + 'x';
        const qbits2 = tweak_question.split(delimiter());
        const interpolated2 = vsprintf(template, qbits2);
        if (interpolated === interpolated2) {
            vsprint_errors = { suspicious_extra_data: true };
        }
    }
    return parseQuestionJSON(interpolated, errors_to_title, vsprint_errors);
}
function encodeCustomText(params) {
    const items = [];
    for (const p in params) {
        let val = params[p];
        if (typeof val === 'string') {
            val = JSON.stringify(val).replace(/^"|"$/g, '');
        }
        else if (typeof val === 'object' && val !== null) {
            val = JSON.stringify(val).replace(/^\[/, '').replace(/\]$/, '');
        }
        else {
            val = null;
        }
        items.push(val);
    }
    return items.join(delimiter());
}
function guessTemplateConfig(template) {
    const placeholder = ethers_1.ethers.utils.solidityKeccak256(['string'], [template]);
    const arr_placeholder = ethers_1.ethers.utils.solidityKeccak256(['string'], [template + '_arr']);
    const pl_arr = new Array(TEMPLATE_MAX_PLACEHOLDERS).fill(placeholder);
    let interpolated = vsprintf(template, pl_arr);
    interpolated = interpolated.replaceAll('[' + placeholder + ']', '"' + arr_placeholder + '"');
    const fake_json = parseQuestionJSON(interpolated, false);
    const meta = '__META' in fake_json ? fake_json['__META'] : {};
    const labels = 'labels' in meta ? meta['labels'] : {};
    const fields = {};
    for (const k in fake_json) {
        if (k === 'title_text' || k === 'title_html' || k === '__META')
            continue;
        const fdef = {
            label: k in labels ? labels[k] : k,
            parts: [],
        };
        const regexp = new RegExp('(' + placeholder + '|' + arr_placeholder + ')');
        const bits = String(fake_json[k]).split(regexp);
        let part_i = 0;
        for (const b of bits) {
            if (b === '')
                continue;
            if (b === placeholder || b === arr_placeholder) {
                let part_label = k + '_' + part_i;
                if (part_label in labels)
                    part_label = labels[part_label];
                fdef.parts.push(b === placeholder
                    ? { part: 'parameter', part_index: part_i, label: part_label }
                    : { part: 'array_parameter', part_index: part_i, label: part_label });
                part_i++;
            }
            else {
                fdef.parts.push({ part: 'text', value: b });
            }
        }
        fields[k] = fdef;
    }
    const tags = 'tags' in meta ? meta['tags'] : {};
    return { fields, tags };
}
function encodeText(qtype, txt, outcomes, category, lang) {
    const def = { title: txt };
    if (qtype === 'single-select' || qtype === 'multiple-select') {
        def['outcomes'] = outcomes;
    }
    def['category'] = category;
    def['lang'] = lang;
    return encodeCustomText(def);
}
function getInvalidValue(_question_json) {
    return '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
}
function getAnsweredTooSoonValue(_question_json) {
    return '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
}
function getLanguage(question_json) {
    if (typeof question_json['lang'] === 'undefined' || question_json['lang'] === '') {
        return 'en_US';
    }
    return String(question_json['lang']);
}
function hasInvalidOption(question_json, _contract_version) {
    return !('has_invalid' in question_json && !question_json['has_invalid']);
}
function hasAnsweredTooSoonOption(_question_json, contract_version) {
    const bits = contract_version.split('.');
    return parseInt(bits[0]) >= 3;
}
function getAnswerString(question_json, answer) {
    if (answer === null)
        return 'null';
    if (answer === getInvalidValue(question_json))
        return 'Invalid';
    if (answer === getAnsweredTooSoonValue(question_json))
        return 'Answered too soon';
    let label = '';
    switch (question_json['type']) {
        case 'uint':
        case 'int':
        case 'hash':
            label = bytes32ToString(answer, question_json);
            break;
        case 'bool': {
            const boolVal = BigInt(answer);
            if (boolVal === 1n)
                label = 'Yes';
            else if (boolVal === 0n)
                label = 'No';
            break;
        }
        case 'single-select':
            if (question_json['outcomes'] && question_json['outcomes'].length > 0) {
                const idx = Number(BigInt(answer));
                label = question_json['outcomes'][idx];
            }
            break;
        case 'multiple-select':
            if (question_json['outcomes'] && question_json['outcomes'].length > 0) {
                const answer_bits = BigInt(answer).toString(2);
                const entries = [];
                for (let i = question_json['outcomes'].length - 1; i >= 0; i--) {
                    if (answer_bits[i] === '1') {
                        const idx = answer_bits.length - 1 - i;
                        entries.push(question_json['outcomes'][idx]);
                    }
                }
                return entries.join(' / ');
            }
            break;
        case 'datetime': {
            let precision = 'd';
            if ('precision' in question_json && ['Y', 'm', 'd', 'H', 'i', 's'].includes(String(question_json['precision']))) {
                precision = String(question_json['precision']);
            }
            const ts = parseInt(bytes32ToString(answer, question_json));
            const dateObj = new Date(ts * 1000);
            const year = dateObj.getUTCFullYear();
            const month = dateObj.getUTCMonth() + 1;
            const date = dateObj.getUTCDate();
            const hour = dateObj.getUTCHours();
            const min = dateObj.getUTCMinutes();
            const sec = dateObj.getUTCSeconds();
            const needm = precision !== 'Y';
            const needd = needm && precision !== 'm';
            const needH = needd && precision !== 'd';
            const needi = needH && precision !== 'H';
            const needs = needi && precision !== 'i';
            const hass = needs || sec > 0;
            const hasi = needi || hass || min > 0;
            const hasH = needH || hasi || hour > 0;
            const hasd = needd || hasH || date > 1;
            const hasm = needm || hasd || month > 1;
            let invalid = false;
            if (!needm && hasm)
                invalid = true;
            if (!needd && hasd)
                invalid = true;
            if (!needH && hasH)
                invalid = true;
            if (!needi && hasi)
                invalid = true;
            if (!needs && hass)
                invalid = true;
            if (invalid)
                label = '[Invalid datetime]: ';
            function pad2(n) { return ('0' + n).slice(-2); }
            label += year;
            if (hasm)
                label += '-' + pad2(month);
            if (hasd)
                label += '-' + pad2(date);
            if (hasH)
                label += ' ' + pad2(hour);
            if (hasi)
                label += ':' + pad2(min);
            else if (hasH)
                label += 'hr';
            if (hass)
                label += ':' + pad2(sec);
            break;
        }
    }
    return label;
}
function commitmentID(question_id, answer_hash, bond) {
    const bond_hex = (typeof bond === 'string') ? bond : ('0x' + bond.toString(16));
    return ethers_1.ethers.utils.solidityKeccak256(['uint256', 'uint256', 'uint256'], [question_id, answer_hash, bond_hex]);
}
function answerHash(answer_plaintext, nonce) {
    return ethers_1.ethers.utils.solidityKeccak256(['uint256', 'uint256'], [answer_plaintext, nonce]);
}
function shortDisplayQuestionID(question_id) {
    const bits = question_id.split('-');
    const qid = bits[bits.length - 1];
    return qid.substring(2, 9) + '...' + qid.slice(-7);
}
