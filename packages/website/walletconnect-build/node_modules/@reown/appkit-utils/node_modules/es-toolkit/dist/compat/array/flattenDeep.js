'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const flatten = require('./flatten.js');

function flattenDeep(value) {
    return flatten.flatten(value, Infinity);
}

exports.flattenDeep = flattenDeep;
