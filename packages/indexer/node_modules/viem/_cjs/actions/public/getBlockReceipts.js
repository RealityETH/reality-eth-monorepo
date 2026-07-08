"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockReceipts = getBlockReceipts;
const block_js_1 = require("../../errors/block.js");
const toHex_js_1 = require("../../utils/encoding/toHex.js");
const transactionReceipt_js_1 = require("../../utils/formatters/transactionReceipt.js");
async function getBlockReceipts(client, { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? 'latest', } = {}) {
    const blockNumberHex = blockNumber !== undefined ? (0, toHex_js_1.numberToHex)(blockNumber) : undefined;
    const receipts = await client.request({
        method: 'eth_getBlockReceipts',
        params: [blockHash || blockNumberHex || blockTag],
    }, { dedupe: Boolean(blockHash || blockNumberHex) });
    if (!receipts)
        throw new block_js_1.BlockNotFoundError({ blockHash, blockNumber });
    const format = client.chain?.formatters?.transactionReceipt?.format ||
        transactionReceipt_js_1.formatTransactionReceipt;
    return receipts.map((receipt) => format(receipt, 'getBlockReceipts'));
}
//# sourceMappingURL=getBlockReceipts.js.map