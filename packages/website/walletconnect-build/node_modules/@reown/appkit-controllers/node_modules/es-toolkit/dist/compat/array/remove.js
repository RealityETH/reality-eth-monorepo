'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const remove$1 = require('../../array/remove.js');
const iteratee = require('../util/iteratee.js');

function remove(arr, shouldRemoveElement) {
    return remove$1.remove(arr, iteratee.iteratee(shouldRemoveElement));
}

exports.remove = remove;
