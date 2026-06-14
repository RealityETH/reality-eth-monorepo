'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

function endsWith(str, target, position = str.length) {
    return str.endsWith(target, position);
}

exports.endsWith = endsWith;
