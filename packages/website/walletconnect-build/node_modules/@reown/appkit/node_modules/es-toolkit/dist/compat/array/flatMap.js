'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const flatten = require('./flatten.js');
const map = require('./map.js');
const isNil = require('../../predicate/isNil.js');

function flatMap(collection, iteratee) {
    if (isNil.isNil(collection)) {
        return [];
    }
    const mapped = isNil.isNil(iteratee) ? map.map(collection) : map.map(collection, iteratee);
    return flatten.flatten(mapped, 1);
}

exports.flatMap = flatMap;
