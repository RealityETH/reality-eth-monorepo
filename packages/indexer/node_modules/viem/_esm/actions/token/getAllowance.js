import { erc20Abi } from '../../constants/abis.js';
import { readContract } from '../public/readContract.js';
import { defineCall, resolveToken, resolveTokenWithDecimals, toAmount, } from './internal.js';
/**
 * Gets the ERC-20 allowance a spender has over an account's tokens.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const allowance = await token.getAllowance(client, {
 *   account: '0x...',
 *   spender: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The allowance, in base units and human-readable form.
 */
export async function getAllowance(client, parameters) {
    const { account, decimals, spender, token, ...rest } = parameters;
    const [amount, { decimals: resolved }] = await Promise.all([
        readContract(client, {
            ...rest,
            ...getAllowance.call(client, { account, spender, token }),
        }),
        resolveTokenWithDecimals(client, {
            decimals,
            token,
        }),
    ]);
    return toAmount(amount, resolved);
}
(function (getAllowance) {
    /**
     * Defines a call to the `allowance` function.
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
            functionName: 'allowance',
            args: [args.account, args.spender],
        });
    }
    getAllowance.call = call;
})(getAllowance || (getAllowance = {}));
//# sourceMappingURL=getAllowance.js.map