"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monad = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
exports.monad = (0, defineChain_js_1.defineChain)({
    id: 143,
    name: 'Monad',
    blockTime: 400,
    nativeCurrency: {
        name: 'Monad',
        symbol: 'MON',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.monad.xyz', 'https://rpc1.monad.xyz'],
            webSocket: ['wss://rpc.monad.xyz', 'wss://rpc1.monad.xyz'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Monadscan',
            url: 'https://monadscan.com',
            apiUrl: 'https://api.etherscan.io/v2/api?chainid=143',
        },
        monadvision: {
            name: 'MonadVision',
            url: 'https://monadvision.com',
        },
    },
    testnet: false,
    contracts: {
        multicall3: {
            address: '0xcA11bde05977b3631167028862bE2a173976CA11',
            blockCreated: 9248132,
        },
    },
});
//# sourceMappingURL=monad.js.map