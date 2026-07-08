"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whitechainSepolia = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
exports.whitechainSepolia = (0, defineChain_js_1.defineChain)({
    testnet: true,
    id: 1874,
    name: 'Whitechain Sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'WBT',
        symbol: 'WBT',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.testnet.whitechain.io'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Whitechain Testnet Explorer',
            url: 'https://explorer.testnet.whitechain.io',
        },
    },
    contracts: {
        multicall3: {
            address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        },
    },
});
//# sourceMappingURL=whitechainSepolia.js.map