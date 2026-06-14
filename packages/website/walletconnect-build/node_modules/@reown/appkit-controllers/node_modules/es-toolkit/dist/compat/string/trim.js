'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const trim$1 = require('../../string/trim.js');

function trim(str, chars, guard) {
    if (str == null) {
        return '';
    }
    if (guard != null || chars == null) {
        return str.toString().trim();
    }
    switch (typeof chars) {
        case 'string': {
            return trim$1.trim(str, chars.toString().split(''));
        }
        case 'object': {
            if (Array.isArray(chars)) {
                return trim$1.trim(str, chars.flatMap(x => x.toString().split('')));
            }
            else {
                return trim$1.trim(str, chars.toString().split(''));
            }
        }
    }
}

exports.trim = trim;
