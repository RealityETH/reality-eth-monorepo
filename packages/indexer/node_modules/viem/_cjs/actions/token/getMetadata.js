"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadata = getMetadata;
const abis_js_1 = require("../../constants/abis.js");
const readContract_js_1 = require("../public/readContract.js");
const internal_js_1 = require("./internal.js");
async function getMetadata(client, parameters) {
    const { token, ...rest } = parameters;
    const { address } = (0, internal_js_1.resolveToken)(client, { token });
    const declared = (0, internal_js_1.findDeclaredToken)(client, token);
    const [decimals_, name, symbol] = await Promise.all([
        declared?.decimals ??
            (0, readContract_js_1.readContract)(client, {
                ...rest,
                abi: abis_js_1.erc20Abi,
                address,
                functionName: 'decimals',
            }),
        declared?.name ??
            (0, readContract_js_1.readContract)(client, {
                ...rest,
                abi: abis_js_1.erc20Abi,
                address,
                functionName: 'name',
            }),
        declared?.symbol ??
            (0, readContract_js_1.readContract)(client, {
                ...rest,
                abi: abis_js_1.erc20Abi,
                address,
                functionName: 'symbol',
            }),
    ]);
    return {
        decimals: decimals_,
        name: name,
        symbol: symbol,
    };
}
//# sourceMappingURL=getMetadata.js.map