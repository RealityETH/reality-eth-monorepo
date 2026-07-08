import { erc20Abi } from '../../constants/abis.js';
import { readContract } from '../public/readContract.js';
import { defineCall, resolveToken, resolveTokenWithDecimals, toAmount, } from './internal.js';
/**
 * Gets the total supply of an ERC-20 token.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const totalSupply = await token.getTotalSupply(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token total supply, in base units and human-readable form.
 */
export async function getTotalSupply(client, parameters) {
    const { decimals, token, ...rest } = parameters;
    const [amount, { decimals: resolved }] = await Promise.all([
        readContract(client, {
            ...rest,
            ...getTotalSupply.call(client, { token }),
        }),
        resolveTokenWithDecimals(client, {
            decimals,
            token,
        }),
    ]);
    return toAmount(amount, resolved);
}
(function (getTotalSupply) {
    /**
     * Defines a call to the `totalSupply` function.
     *
     * Can be passed as a parameter to `multicall`, `simulateContract`, or any
     * other action that accepts a contract call. The token is selected by `token`
     * symbol (resolved from the client's `tokens` array) or contract address.
     *
     * @param client - Client.
     * @param args - Arguments.
     * @returns The call.
     */
    function call(client, args) {
        return defineCall({
            address: resolveToken(client, args).address,
            abi: erc20Abi,
            args: [],
            functionName: 'totalSupply',
        });
    }
    getTotalSupply.call = call;
})(getTotalSupply || (getTotalSupply = {}));
//# sourceMappingURL=getTotalSupply.js.map