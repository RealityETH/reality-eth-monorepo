"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentrix = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
exports.sentrix = (0, defineChain_js_1.defineChain)({
    id: 7119,
    name: 'Sentrix Chain',
    nativeCurrency: { name: 'Sentrix', symbol: 'SRX', decimals: 18 },
    blockTime: 1_000,
    rpcUrls: {
        default: {
            http: ['https://rpc.sentrixchain.com'],
            webSocket: ['wss://rpc.sentrixchain.com/ws'],
        },
    },
    blockExplorers: {
        default: {
            name: 'SentrixScan',
            url: 'https://scan.sentrixchain.com',
        },
    },
    contracts: {
        multicall3: {
            address: '0xFd4b34b5763f54a580a0d9f7997A2A993ef9ceE9',
            blockCreated: 717_078,
        },
    },
});
//# sourceMappingURL=sentrix.js.map