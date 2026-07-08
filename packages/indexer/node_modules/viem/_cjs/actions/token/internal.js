"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAmount = toAmount;
exports.toBaseUnits = toBaseUnits;
exports.requireTokenDecimals = requireTokenDecimals;
exports.resolveAmountDecimals = resolveAmountDecimals;
exports.resolveToken = resolveToken;
exports.findDeclaredToken = findDeclaredToken;
exports.resolveTokenWithDecimals = resolveTokenWithDecimals;
exports.pickWriteParameters = pickWriteParameters;
exports.defineCall = defineCall;
const abis_js_1 = require("../../constants/abis.js");
const isAddress_js_1 = require("../../utils/address/isAddress.js");
const isAddressEqual_js_1 = require("../../utils/address/isAddressEqual.js");
const index_js_1 = require("../../utils/index.js");
const formatUnits_js_1 = require("../../utils/unit/formatUnits.js");
const parseUnits_js_1 = require("../../utils/unit/parseUnits.js");
const readContract_js_1 = require("../public/readContract.js");
function toAmount(amount, decimals) {
    return { amount, decimals, formatted: (0, formatUnits_js_1.formatUnits)(amount, decimals) };
}
function toBaseUnits(amount, decimals) {
    if (typeof amount === 'bigint')
        return amount;
    const resolved = amount.decimals ?? decimals;
    return (0, parseUnits_js_1.parseUnits)(amount.formatted, requireTokenDecimals(resolved));
}
function requireTokenDecimals(decimals) {
    if (decimals === undefined)
        throw new Error('Token decimals are required. Pass `amount.decimals` or select a declared token.');
    return decimals;
}
function resolveAmountDecimals(amount, decimals) {
    if (typeof amount === 'bigint')
        return decimals;
    return amount.decimals ?? decimals;
}
function resolveToken(client, parameters) {
    const { decimals, token } = parameters;
    const declared = findDeclaredToken(client, token);
    if (declared)
        return {
            address: declared.address,
            decimals: decimals ?? declared.decimals,
        };
    if ((0, isAddress_js_1.isAddress)(token, { strict: false }))
        return {
            address: token,
            decimals: decimals ?? inferDecimals(client, token),
        };
    throw new Error(`Token "${token}" is not a declared ERC-20 token on the client's \`tokens\` array (with an address for the client's chain), and is not a valid address.`);
}
function findDeclaredToken(client, token) {
    const tokens = client.tokens;
    const chainId = client.chain?.id;
    if (!tokens || chainId === undefined)
        return undefined;
    const bySymbol = findTokenBySymbol(tokens, token);
    if (bySymbol)
        return resolveTokenForChain(bySymbol, chainId);
    if ((0, isAddress_js_1.isAddress)(token, { strict: false }))
        for (const token_ of tokens) {
            const resolved = resolveTokenForChain(token_, chainId);
            if (resolved && (0, isAddressEqual_js_1.isAddressEqual)(resolved.address, token))
                return resolved;
        }
    return undefined;
}
function resolveTokenForChain(token, chainId) {
    const address = token.addresses[chainId];
    if (!address)
        return undefined;
    return {
        address,
        currency: token.currency,
        decimals: token.decimals,
        name: token.name,
        popular: token.popular,
        symbol: token.symbol,
    };
}
function findTokenBySymbol(tokens, symbol) {
    const lowerSymbol = symbol.toLowerCase();
    for (const token of tokens) {
        if (token.symbol?.toLowerCase() === lowerSymbol)
            return token;
    }
    return undefined;
}
function inferDecimals(client, address) {
    const tokens = client.tokens;
    const chainId = client.chain?.id;
    if (tokens && chainId !== undefined)
        for (const token of tokens) {
            const resolved = resolveTokenForChain(token, chainId);
            if (resolved && (0, isAddressEqual_js_1.isAddressEqual)(resolved.address, address))
                return resolved.decimals;
        }
    return undefined;
}
async function resolveTokenWithDecimals(client, parameters) {
    const { address, decimals } = resolveToken(client, parameters);
    if (decimals !== undefined)
        return { address, decimals };
    return {
        address,
        decimals: await (0, readContract_js_1.readContract)(client, {
            abi: abis_js_1.erc20Abi,
            address,
            functionName: 'decimals',
        }),
    };
}
function pickWriteParameters(parameters) {
    const { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce } = parameters;
    return { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce };
}
function defineCall(call) {
    return {
        ...call,
        data: (0, index_js_1.encodeFunctionData)(call),
        to: call.address,
    };
}
//# sourceMappingURL=internal.js.map