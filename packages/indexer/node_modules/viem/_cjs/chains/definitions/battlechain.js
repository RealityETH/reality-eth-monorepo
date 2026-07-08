"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.battlechain = void 0;
const defineChain_js_1 = require("../../utils/chain/defineChain.js");
const chainConfig_js_1 = require("../../zksync/chainConfig.js");
exports.battlechain = (0, defineChain_js_1.defineChain)({
    ...chainConfig_js_1.chainConfig,
    id: 626,
    name: 'BattleChain Mainnet',
    network: 'battlechain',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://mainnet.battlechain.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'BattleChain Explorer',
            url: 'https://explorer.battlechain.com',
            apiUrl: 'https://block-explorer-api.battlechain.com/api',
        },
    },
    contracts: {
        multicall3: {
            address: '0xcA11bde05977b3631167028862bE2a173976CA11',
            blockCreated: 40,
        },
    },
});
//# sourceMappingURL=battlechain.js.map