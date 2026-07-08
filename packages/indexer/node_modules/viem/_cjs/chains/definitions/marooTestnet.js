"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marooTestnet = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
exports.marooTestnet = (0, defineChain_js_1.defineChain)({
    id: 450_815,
    name: 'Maroo Testnet',
    nativeCurrency: { name: 'Testnet OKRW', symbol: 'tOKRW', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://rpc-testnet.maroo.io'],
            webSocket: ['wss://ws-testnet.maroo.io'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Blockscout',
            url: 'https://explorer-testnet.maroo.io',
            apiUrl: 'https://explorer-testnet.maroo.io/blockscout/api',
        },
    },
    contracts: {
        multicall3: {
            address: '0xcA11bde05977b3631167028862bE2a173976CA11',
            blockCreated: 0,
        },
    },
    testnet: true,
});
//# sourceMappingURL=marooTestnet.js.map