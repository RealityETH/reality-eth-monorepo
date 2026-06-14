'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const uniqBy$1 = require('../../array/uniqBy.js');
const isArrayLikeObject = require('../predicate/isArrayLikeObject.js');
const iteratee = require('../util/iteratee.js');

function uniqBy(array, iteratee$1) {
    if (!isArrayLikeObject.isArrayLikeObject(array)) {
        return [];
    }
    return uniqBy$1.uniqBy(Array.from(array), iteratee.iteratee(iteratee$1));
}

exports.uniqBy = uniqBy;
