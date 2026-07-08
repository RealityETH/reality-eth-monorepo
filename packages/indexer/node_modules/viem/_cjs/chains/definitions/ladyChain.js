"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ladyChain = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
exports.ladyChain = (0, defineChain_js_1.defineChain)({
    id: 589,
    name: 'LadyChain',
    nativeCurrency: { name: 'Lady', symbol: 'LADY', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://ladyrpc.us/rpc'],
        },
    },
    blockExplorers: {
        default: {
            name: 'LadyScan',
            url: 'https://ladyscan.us',
        },
    },
    testnet: false,
});
//# sourceMappingURL=ladyChain.js.map