'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const flatten = require('./flatten.js');

function flattenDepth(value, depth = 1) {
    return flatten.flatten(value, depth);
}

exports.flattenDepth = flattenDepth;
