'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isMatchWith = require('./isMatchWith.js');

function isMatch(target, source) {
    return isMatchWith.isMatchWith(target, source);
}

exports.isMatch = isMatch;
