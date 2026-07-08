"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveSync = approveSync;
const formatUnits_js_1 = require("../../utils/unit/formatUnits.js");
const writeContractSync_js_1 = require("../wallet/writeContractSync.js");
const approve_js_1 = require("./approve.js");
const internal_js_1 = require("./internal.js");
async function approveSync(client, parameters) {
    const { amount, token, throwOnReceiptRevert = true } = parameters;
    const { decimals } = (0, internal_js_1.resolveToken)(client, { token });
    const resolved = (0, internal_js_1.resolveAmountDecimals)(amount, decimals);
    const receipt = await approve_js_1.approve.inner(writeContractSync_js_1.writeContractSync, client, {
        ...parameters,
        throwOnReceiptRevert,
    });
    const { args } = approve_js_1.approve.extractEvent(receipt.logs);
    return {
        ...args,
        ...(resolved === undefined
            ? {}
            : { decimals: resolved, formatted: (0, formatUnits_js_1.formatUnits)(args.value, resolved) }),
        receipt,
    };
}
//# sourceMappingURL=approveSync.js.map