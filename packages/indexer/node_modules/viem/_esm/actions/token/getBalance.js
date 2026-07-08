import { parseAccount } from '../../accounts/utils/parseAccount.js';
import { erc20Abi } from '../../constants/abis.js';
import { AccountNotFoundError } from '../../errors/account.js';
import { readContract } from '../public/readContract.js';
import { defineCall, resolveToken, resolveTokenWithDecimals, toAmount, } from './internal.js';
/**
 * Gets the ERC-20 token balance of an account.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const balance = await token.getBalance(client, {
 *   account: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token balance, in base units and human-readable form.
 */
export async function getBalance(client, parameters) {
    const { account: account_ = client.account, decimals, token, ...rest } = parameters;
    if (!account_)
        throw new AccountNotFoundError();
    const account = parseAccount(account_).address;
    const [amount, { decimals: resolved }] = await Promise.all([
        readContract(client, {
            ...rest,
            ...getBalance.call(client, { account, token }),
        }),
        resolveTokenWithDecimals(client, {
            decimals,
            token,
        }),
    ]);
    return toAmount(amount, resolved);
}
(function (getBalance) {
    /**
     * Defines a call to the `balanceOf` function.
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
        const account_ = args.account ?? client.account;
        if (!account_)
            throw new AccountNotFoundError();
        const account = parseAccount(account_).address;
        return defineCall({
            address: resolveToken(client, args).address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [account],
        });
    }
    getBalance.call = call;
})(getBalance || (getBalance = {}));
//# sourceMappingURL=getBalance.js.map