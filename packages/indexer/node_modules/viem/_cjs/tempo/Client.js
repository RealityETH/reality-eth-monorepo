"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
const createClient_js_1 = require("../clients/createClient.js");
const public_js_1 = require("../clients/decorators/public.js");
const wallet_js_1 = require("../clients/decorators/wallet.js");
const http_js_1 = require("../clients/transports/http.js");
const sets_js_1 = require("../tokens/sets.js");
const Chain_js_1 = require("./Chain.js");
const Decorator_js_1 = require("./Decorator.js");
function createClient(parameters = {}) {
    const { chain, feeToken, testnet, tokens, transport, ...rest } = parameters;
    const baseChain = chain ?? (testnet ? Chain_js_1.tempoTestnet : Chain_js_1.tempo);
    const resolvedChain = feeToken && typeof baseChain.extend === 'function'
        ? baseChain.extend({
            feeToken,
        })
        : baseChain;
    return (0, createClient_js_1.createClient)({
        ...rest,
        chain: resolvedChain,
        tokens: tokens ?? sets_js_1.tokens.tempo,
        transport: transport ?? (0, http_js_1.http)(),
    })
        .extend(public_js_1.publicActions)
        .extend(wallet_js_1.walletActions)
        .extend((0, Decorator_js_1.decorator)());
}
//# sourceMappingURL=Client.js.map