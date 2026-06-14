'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const trimEnd$1 = require('../../string/trimEnd.js');

function trimEnd(str, chars, guard) {
    if (str == null) {
        return '';
    }
    if (guard != null || chars == null) {
        return str.toString().trimEnd();
    }
    switch (typeof chars) {
        case 'string': {
            return trimEnd$1.trimEnd(str, chars.toString().split(''));
        }
        case 'object': {
            if (Array.isArray(chars)) {
                return trimEnd$1.trimEnd(str, chars.flatMap(x => x.toString().split('')));
            }
            else {
                return trimEnd$1.trimEnd(str, chars.toString().split(''));
            }
        }
    }
}

exports.trimEnd = trimEnd;
