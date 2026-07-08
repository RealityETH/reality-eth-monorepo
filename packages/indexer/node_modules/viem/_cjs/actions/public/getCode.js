"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCode = getCode;
const formatBlockParameter_js_1 = require("../../utils/block/formatBlockParameter.js");
async function getCode(client, { address, blockHash, blockNumber, blockTag = 'latest', requireCanonical, }) {
    const block = (0, formatBlockParameter_js_1.formatBlockParameter)({
        blockHash,
        blockNumber,
        blockTag,
        requireCanonical,
    });
    const hex = await client.request({
        method: 'eth_getCode',
        params: [address, block],
    }, {
        dedupe: typeof blockNumber === 'bigint' || blockHash !== undefined,
    });
    if (hex === '0x')
        return undefined;
    return hex;
}
//# sourceMappingURL=getCode.js.map