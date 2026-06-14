'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const property = require('./property.js');
const identity = require('../../function/identity.js');
const mapValues$1 = require('../../object/mapValues.js');

function mapValues(object, getNewValue) {
    getNewValue = getNewValue ?? identity.identity;
    switch (typeof getNewValue) {
        case 'string':
        case 'symbol':
        case 'number':
        case 'object': {
            return mapValues$1.mapValues(object, property.property(getNewValue));
        }
        case 'function': {
            return mapValues$1.mapValues(object, getNewValue);
        }
    }
}

exports.mapValues = mapValues;
