/**
 * Creates a token from shared metadata (`currency`, `decimals`, `name`,
 * `popular`, `symbol`) and a map of per-chain contract `addresses`. The
 * returned value is callable with a chain id to produce a chain-specific token
 * config while also exposing the metadata and the full `addresses` map.
 *
 * @param token - {@link defineToken.Parameters}
 * @returns The token. {@link defineToken.ReturnType}
 *
 * @example
 * ```ts
 * import { defineToken } from 'viem/tokens'
 *
 * const usdc = defineToken({
 *   addresses: {
 *     1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
 *     8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
 *   },
 *   currency: 'USD',
 *   decimals: 6,
 *   name: 'USD Coin',
 *   popular: true,
 *   symbol: 'USDC',
 * })
 *
 * usdc(1)
 * // {
 * //   address: '0xA0b8…48',
 * //   currency: 'USD',
 * //   decimals: 6,
 * //   name: 'USD Coin',
 * //   popular: true,
 * //   symbol: 'USDC',
 * // }
 *
 * usdc.addresses[8453]
 * // '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
 * ```
 */
export function defineToken(token) {
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