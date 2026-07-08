import type { Address } from 'abitype';
import type { Account } from '../../accounts/types.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import type { Tokens } from '../../tokens/defineToken.js';
import type { GetAccountParameter } from '../../types/account.js';
import type { Chain } from '../../types/chain.js';
import { type Amount, type ReadParameters, type TokenParameters } from './internal.js';
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
export declare function getBalance<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, parameters: getBalance.Parameters<chain, account, tokens>): Promise<getBalance.ReturnValue>;
export declare namespace getBalance {
    type Args<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined, tokens extends Tokens | undefined = Tokens | undefined> = GetAccountParameter<account, Account | Address> & TokenParameters<chain, tokens>;
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined, tokens extends Tokens | undefined = Tokens | undefined> = Omit<ReadParameters, 'account'> & Args<chain, account, tokens>;
    type ReturnValue = Amount;
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
    function call<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, args: Args<chain, account, tokens>): {
        abi: [{
            readonly type: "function";
            readonly name: "balanceOf";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly name: "account";
                readonly type: "address";
            }];
            readonly outputs: readonly [{
                readonly type: "uint256";
            }];
        }];
        functionName: "balanceOf";
    } & {
        args: readonly [account: `0x${string}`];
    } & {
        address: Address;
    } & {
        data: import("../../index.js").Hex;
        to: Address;
    };
}
//# sourceMappingURL=getBalance.d.ts.map