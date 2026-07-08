import type { Address } from 'abitype';
import type { Account } from '../../accounts/types.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import type { Tokens } from '../../tokens/defineToken.js';
import type { Chain } from '../../types/chain.js';
import { type Amount, type ReadParameters, type TokenParameters } from './internal.js';
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
export declare function getAllowance<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, parameters: getAllowance.Parameters<chain, tokens>): Promise<getAllowance.ReturnValue>;
export declare namespace getAllowance {
    type Args<chain extends Chain | undefined = Chain | undefined, tokens extends Tokens | undefined = Tokens | undefined> = {
        /** Account that owns the tokens. */
        account: Address;
        /** Spender of the tokens. */
        spender: Address;
    } & TokenParameters<chain, tokens>;
    type Parameters<chain extends Chain | undefined = Chain | undefined, tokens extends Tokens | undefined = Tokens | undefined> = ReadParameters & Args<chain, tokens>;
    type ReturnValue = Amount;
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
    function call<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, args: Args<chain, tokens>): {
        abi: [{
            readonly type: "function";
            readonly name: "allowance";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly name: "owner";
                readonly type: "address";
            }, {
                readonly name: "spender";
                readonly type: "address";
            }];
            readonly outputs: readonly [{
                readonly type: "uint256";
            }];
        }];
        functionName: "allowance";
    } & {
        args: readonly [owner: `0x${string}`, spender: `0x${string}`];
    } & {
        address: Address;
    } & {
        data: import("../../index.js").Hex;
        to: Address;
    };
}
//# sourceMappingURL=getAllowance.d.ts.map