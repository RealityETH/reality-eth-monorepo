'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const isArrayLike = require('../predicate/isArrayLike.js');

function fromPairs(pairs) {
    if (!isArrayLike.isArrayLike(pairs) && !(pairs instanceof Map)) {
        return {};
    }
    const result = {};
    for (const [key, value] of pairs) {
        result[key] = value;
    }
    return result;
}

exports.fromPairs = fromPairs;
