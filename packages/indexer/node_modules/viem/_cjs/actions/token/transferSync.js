"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferSync = transferSync;
const formatUnits_js_1 = require("../../utils/unit/formatUnits.js");
const writeContractSync_js_1 = require("../wallet/writeContractSync.js");
const internal_js_1 = require("./internal.js");
const transfer_js_1 = require("./transfer.js");
async function transferSync(client, parameters) {
    const { amount, token, throwOnReceiptRevert = true } = parameters;
    const { decimals } = (0, internal_js_1.resolveToken)(client, { token });
    const resolved = (0, internal_js_1.resolveAmountDecimals)(amount, decimals);
    const receipt = await transfer_js_1.transfer.inner(writeContractSync_js_1.writeContractSync, client, {
        ...parameters,
        throwOnReceiptRevert,
    });
    const { args } = transfer_js_1.transfer.extractEvent(receipt.logs);
    return {
        ...args,
        ...(resolved === undefined
            ? {}
            : { decimals: resolved, formatted: (0, formatUnits_js_1.formatUnits)(args.value, resolved) }),
        receipt,
    };
}
//# sourceMappingURL=transferSync.js.map