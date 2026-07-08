"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marsCredit = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
exports.marsCredit = (0, defineChain_js_1.defineChain)({
    id: 110110,
    name: 'Mars Credit',
    nativeCurrency: {
        decimals: 18,
        name: 'Mars Credit',
        symbol: 'MARS',
    },
    rpcUrls: {
        default: { http: ['https://rpc.marscredit.xyz'] },
    },
    blockExplorers: {
        default: {
            name: 'Blockscout',
            url: 'https://blockscan.marscredit.xyz',
        },
    },
});
//# sourceMappingURL=marsCredit.js.map