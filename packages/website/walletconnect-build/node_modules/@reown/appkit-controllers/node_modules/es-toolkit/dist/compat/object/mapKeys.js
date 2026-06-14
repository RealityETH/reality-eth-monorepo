'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const property = require('./property.js');
const identity = require('../../function/identity.js');
const mapKeys$1 = require('../../object/mapKeys.js');

function mapKeys(object, getNewKey) {
    getNewKey = getNewKey ?? identity.identity;
    switch (typeof getNewKey) {
        case 'string':
        case 'symbol':
        case 'number':
        case 'object': {
            return mapKeys$1.mapKeys(object, property.property(getNewKey));
        }
        case 'function': {
            return mapKeys$1.mapKeys(object, getNewKey);
        }
    }
}

exports.mapKeys = mapKeys;
