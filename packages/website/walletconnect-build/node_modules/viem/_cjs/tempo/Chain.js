"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testnet = exports.tempoTestnet = exports.moderato = exports.tempoModerato = exports.localnet = exports.tempoLocalnet = exports.devnet = exports.tempoDevnet = exports.tempoMainnet = exports.mainnet = exports.tempo = void 0;
var tempo_js_1 = require("../chains/definitions/tempo.js");
Object.defineProperty(exports, "tempo", { enumerable: true, get: function () { return tempo_js_1.tempo; } });
Object.defineProperty(exports, "mainnet", { enumerable: true, get: function () { return tempo_js_1.tempo; } });
Object.defineProperty(exports, "tempoMainnet", { enumerable: true, get: function () { return tempo_js_1.tempo; } });
var tempoDevnet_js_1 = require("../chains/definitions/tempoDevnet.js");
Object.defineProperty(exports, "tempoDevnet", { enumerable: true, get: function () { return tempoDevnet_js_1.tempoDevnet; } });
Object.defineProperty(exports, "devnet", { enumerable: true, get: function () { return tempoDevnet_js_1.tempoDevnet; } });
var tempoLocalnet_js_1 = require("../chains/definitions/tempoLocalnet.js");
Object.defineProperty(exports, "tempoLocalnet", { enumerable: true, get: function () { return tempoLocalnet_js_1.tempoLocalnet; } });
Object.defineProperty(exports, "localnet", { enumerable: true, get: function () { return tempoLocalnet_js_1.tempoLocalnet; } });
var tempoModerato_js_1 = require("../chains/definitions/tempoModerato.js");
Object.defineProperty(exports, "tempoModerato", { enumerable: true, get: function () { return tempoModerato_js_1.tempoModerato; } });
Object.defineProperty(exports, "moderato", { enumerable: true, get: function () { return tempoModerato_js_1.tempoModerato; } });
Object.defineProperty(exports, "tempoTestnet", { enumerable: true, get: function () { return tempoModerato_js_1.tempoModerato; } });
Object.defineProperty(exports, "testnet", { enumerable: true, get: function () { return tempoModerato_js_1.tempoModerato; } });
//# sourceMappingURL=Chain.js.map