import type { Account } from '../../accounts/types.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import type { Tokens } from '../../tokens/defineToken.js';
import type { Chain } from '../../types/chain.js';
import { type Amount, type ReadParameters, type TokenParameters } from './internal.js';
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
export declare function getTotalSupply<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, parameters: getTotalSupply.Parameters<chain, tokens>): Promise<getTotalSupply.ReturnValue>;
export declare namespace getTotalSupply {
    type Args<chain extends Chain | undefined = Chain | undefined, tokens extends Tokens | undefined = Tokens | undefined> = TokenParameters<chain, tokens>;
    type Parameters<chain extends Chain | undefined = Chain | undefined, tokens extends Tokens | undefined = Tokens | undefined> = Omit<ReadParameters, 'account'> & Args<chain, tokens>;
    type ReturnValue = Amount;
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
    function call<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, args: Args<chain, tokens>): {
        abi: [{
            readonly type: "function";
            readonly name: "totalSupply";
            readonly stateMutability: "view";
            readonly inputs: readonly [];
            readonly outputs: readonly [{
                readonly type: "uint256";
            }];
        }];
        functionName: "totalSupply";
    } & {
        args?: readonly [] | undefined;
    } & {
        address: import("abitype").Address;
    } & {
        data: import("../../index.js").Hex;
        to: import("abitype").Address;
    };
}
//# sourceMappingURL=getTotalSupply.d.ts.map