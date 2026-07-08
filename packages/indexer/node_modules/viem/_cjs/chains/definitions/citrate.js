"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.citrate = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
exports.citrate = (0, defineChain_js_1.defineChain)({
    id: 40_204,
    name: 'Citrate',
    nativeCurrency: { name: 'SALT', symbol: 'SALT', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://rpc.citrate.ai'],
            webSocket: ['wss://rpc.citrate.ai'],
        },
    },
    testnet: true,
});
//# sourceMappingURL=citrate.js.map