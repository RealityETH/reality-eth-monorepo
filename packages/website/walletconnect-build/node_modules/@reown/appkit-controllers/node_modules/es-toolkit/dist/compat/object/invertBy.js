'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const identity = require('../../function/identity.js');
const isNil = require('../../predicate/isNil.js');

function invertBy(object, iteratee) {
    const result = {};
    if (isNil.isNil(object)) {
        return result;
    }
    if (iteratee == null) {
        iteratee = identity.identity;
    }
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = object[key];
        const valueStr = iteratee(value);
        if (Array.isArray(result[valueStr])) {
            result[valueStr].push(key);
        }
        else {
            result[valueStr] = [key];
        }
    }
    return result;
}

exports.invertBy = invertBy;
