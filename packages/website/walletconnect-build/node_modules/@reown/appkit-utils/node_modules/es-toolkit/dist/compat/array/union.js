'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const flatten = require('./flatten.js');
const uniq = require('../../array/uniq.js');
const isArrayLikeObject = require('../predicate/isArrayLikeObject.js');

function union(...arrays) {
    const validArrays = arrays.filter(isArrayLikeObject.isArrayLikeObject);
    const flattened = flatten.flatten(validArrays, 1);
    return uniq.uniq(flattened);
}

exports.union = union;
