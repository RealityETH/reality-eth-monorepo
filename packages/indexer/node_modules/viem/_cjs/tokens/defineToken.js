"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineToken = defineToken;
function defineToken(token) {
    const { addresses, currency, decimals, name, popular, symbol } = token;
    function fn(chainId) {
        const address = addresses[chainId];
        if (!address)
            throw new Error(`Token has no address for chain id "${chainId}".`);
        return { address, currency, decimals, name, popular, symbol };
    }
    return Object.defineProperties(fn, {
        addresses: { enumerable: true, value: addresses },
        currency: { enumerable: true, value: currency },
        decimals: { enumerable: true, value: decimals },
        name: { enumerable: true, value: name },
        popular: { enumerable: true, value: popular },
        symbol: { enumerable: true, value: symbol },
    });
}
//# sourceMappingURL=defineToken.js.map