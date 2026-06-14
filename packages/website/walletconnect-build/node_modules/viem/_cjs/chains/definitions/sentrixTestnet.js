"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentrixTestnet = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
exports.sentrixTestnet = (0, defineChain_js_1.defineChain)({
    id: 7120,
    name: 'Sentrix Testnet',
    nativeCurrency: { name: 'Sentrix', symbol: 'SRX', decimals: 18 },
    blockTime: 1_000,
    rpcUrls: {
        default: {
            http: ['https://testnet-rpc.sentrixchain.com'],
            webSocket: ['wss://testnet-rpc.sentrixchain.com/ws'],
        },
    },
    blockExplorers: {
        default: {
            name: 'SentrixScan Testnet',
            url: 'https://scan-testnet.sentrixchain.com',
        },
    },
    contracts: {
        multicall3: {
            address: '0x7900826De548425c6BE56caEbD4760AB0155Cd54',
            blockCreated: 723_191,
        },
    },
    testnet: true,
});
//# sourceMappingURL=sentrixTestnet.js.map