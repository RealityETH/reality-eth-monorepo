"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionCount = getTransactionCount;
const formatBlockParameter_js_1 = require("../../utils/block/formatBlockParameter.js");
const fromHex_js_1 = require("../../utils/encoding/fromHex.js");
async function getTransactionCount(client, { address, blockHash, blockNumber, blockTag = 'latest', requireCanonical, }) {
    const block = (0, formatBlockParameter_js_1.formatBlockParameter)({
        blockHash,
        blockNumber,
        blockTag,
        requireCanonical,
    });
    const count = await client.request({
        method: 'eth_getTransactionCount',
        params: [address, block],
    }, {
        dedupe: typeof blockNumber === 'bigint' || blockHash !== undefined,
    });
    return (0, fromHex_js_1.hexToNumber)(count);
}
//# sourceMappingURL=getTransactionCount.js.map