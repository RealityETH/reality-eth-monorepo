"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mizuhikiTestnetAwaji = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
exports.mizuhikiTestnetAwaji = (0, defineChain_js_1.defineChain)({
    id: 6497,
    name: 'MIZUHIKI Testnet Awaji',
    nativeCurrency: { name: 'MIZU', symbol: 'MIZU', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://rpc.awaji.mizuhiki.io'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Blockscout',
            url: 'https://awaji.blockscout.com',
            apiUrl: 'https://awaji.blockscout.com/api',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 0,
        },
    },
    testnet: true,
});
//# sourceMappingURL=mizuhikiTestnetAwaji.js.map