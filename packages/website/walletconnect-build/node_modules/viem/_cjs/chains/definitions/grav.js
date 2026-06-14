"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.grav = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
exports.grav = (0, defineChain_js_1.defineChain)({
    id: 127001,
    name: 'Gravity',
    nativeCurrency: { name: 'Gravity', symbol: 'G', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://mainnet-rpc.gravity.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Gravity Mainnet Explorer',
            url: 'https://mainnet-explorer.gravity.xyz',
            apiUrl: 'https://mainnet-explorer.gravity.xyz/api',
        },
    },
    contracts: {},
    testnet: false,
});
//# sourceMappingURL=grav.js.map