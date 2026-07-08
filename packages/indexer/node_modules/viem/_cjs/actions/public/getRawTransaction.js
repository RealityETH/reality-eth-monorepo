"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRawTransaction = getRawTransaction;
const transaction_js_1 = require("../../errors/transaction.js");
async function getRawTransaction(client, { hash }) {
    const rawTransaction = await client.request({
        method: 'eth_getRawTransactionByHash',
        params: [hash],
    }, { dedupe: true });
    if (!rawTransaction)
        throw new transaction_js_1.TransactionNotFoundError({ hash });
    return rawTransaction;
}
//# sourceMappingURL=getRawTransaction.js.map