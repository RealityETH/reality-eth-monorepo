"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBlockParameter = formatBlockParameter;
const base_js_1 = require("../../errors/base.js");
const toHex_js_1 = require("../encoding/toHex.js");
function formatBlockParameter(parameters) {
    const { blockHash, blockNumber, blockTag, requireCanonical } = parameters;
    if (requireCanonical !== undefined && !blockHash)
        throw new base_js_1.BaseError('`requireCanonical` can only be provided when `blockHash` is set.');
    if (blockHash)
        return requireCanonical ? { blockHash, requireCanonical } : { blockHash };
    if (typeof blockNumber === 'bigint')
        return (0, toHex_js_1.numberToHex)(blockNumber);
    return blockTag ?? 'latest';
}
//# sourceMappingURL=formatBlockParameter.js.map