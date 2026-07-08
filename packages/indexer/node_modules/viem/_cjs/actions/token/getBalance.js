"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = getBalance;
const parseAccount_js_1 = require("../../accounts/utils/parseAccount.js");
const abis_js_1 = require("../../constants/abis.js");
const account_js_1 = require("../../errors/account.js");
const readContract_js_1 = require("../public/readContract.js");
const internal_js_1 = require("./internal.js");
async function getBalance(client, parameters) {
    const { account: account_ = client.account, decimals, token, ...rest } = parameters;
    if (!account_)
        throw new account_js_1.AccountNotFoundError();
    const account = (0, parseAccount_js_1.parseAccount)(account_).address;
    const [amount, { decimals: resolved }] = await Promise.all([
        (0, readContract_js_1.readContract)(client, {
            ...rest,
            ...getBalance.call(client, { account, token }),
        }),
        (0, internal_js_1.resolveTokenWithDecimals)(client, {
            decimals,
            token,
        }),
    ]);
    return (0, internal_js_1.toAmount)(amount, resolved);
}
(function (getBalance) {
    function call(client, args) {
        const account_ = args.account ?? client.account;
        if (!account_)
            throw new account_js_1.AccountNotFoundError();
        const account = (0, parseAccount_js_1.parseAccount)(account_).address;
        return (0, internal_js_1.defineCall)({
            address: (0, internal_js_1.resolveToken)(client, args).address,
            abi: abis_js_1.erc20Abi,
            functionName: 'balanceOf',
            args: [account],
        });
    }
    getBalance.call = call;
})(getBalance || (exports.getBalance = getBalance = {}));
//# sourceMappingURL=getBalance.js.map