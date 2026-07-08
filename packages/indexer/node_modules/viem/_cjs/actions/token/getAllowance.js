"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllowance = getAllowance;
const abis_js_1 = require("../../constants/abis.js");
const readContract_js_1 = require("../public/readContract.js");
const internal_js_1 = require("./internal.js");
async function getAllowance(client, parameters) {
    const { account, decimals, spender, token, ...rest } = parameters;
    const [amount, { decimals: resolved }] = await Promise.all([
        (0, readContract_js_1.readContract)(client, {
            ...rest,
            ...getAllowance.call(client, { account, spender, token }),
        }),
        (0, internal_js_1.resolveTokenWithDecimals)(client, {
            decimals,
            token,
        }),
    ]);
    return (0, internal_js_1.toAmount)(amount, resolved);
}
(function (getAllowance) {
    function call(client, args) {
        return (0, internal_js_1.defineCall)({
            address: (0, internal_js_1.resolveToken)(client, args).address,
            abi: abis_js_1.erc20Abi,
            functionName: 'allowance',
            args: [args.account, args.spender],
        });
    }
    getAllowance.call = call;
})(getAllowance || (exports.getAllowance = getAllowance = {}));
//# sourceMappingURL=getAllowance.js.map