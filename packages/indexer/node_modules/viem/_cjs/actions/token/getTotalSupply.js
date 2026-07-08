"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalSupply = getTotalSupply;
const abis_js_1 = require("../../constants/abis.js");
const readContract_js_1 = require("../public/readContract.js");
const internal_js_1 = require("./internal.js");
async function getTotalSupply(client, parameters) {
    const { decimals, token, ...rest } = parameters;
    const [amount, { decimals: resolved }] = await Promise.all([
        (0, readContract_js_1.readContract)(client, {
            ...rest,
            ...getTotalSupply.call(client, { token }),
        }),
        (0, internal_js_1.resolveTokenWithDecimals)(client, {
            decimals,
            token,
        }),
    ]);
    return (0, internal_js_1.toAmount)(amount, resolved);
}
(function (getTotalSupply) {
    function call(client, args) {
        return (0, internal_js_1.defineCall)({
            address: (0, internal_js_1.resolveToken)(client, args).address,
            abi: abis_js_1.erc20Abi,
            args: [],
            functionName: 'totalSupply',
        });
    }
    getTotalSupply.call = call;
})(getTotalSupply || (exports.getTotalSupply = getTotalSupply = {}));
//# sourceMappingURL=getTotalSupply.js.map