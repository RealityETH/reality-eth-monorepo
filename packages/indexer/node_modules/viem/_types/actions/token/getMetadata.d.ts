import type { Account } from '../../accounts/types.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import type { Tokens } from '../../tokens/defineToken.js';
import type { Chain } from '../../types/chain.js';
import { type ReadParameters, type TokenParameter } from './internal.js';
/**
 * Gets the metadata (`decimals`, `name`, `symbol`) of an ERC-20 token.
 *
 * Fields declared on the Client's `tokens` array are used as-is; any missing
 * field is fetched from the token contract.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({ chain: mainnet, transport: http() })
 *
 * const metadata = await token.getMetadata(client, {
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The token metadata (`decimals`, `name`, `symbol`).
 */
export declare function getMetadata<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, parameters: getMetadata.Parameters<chain, tokens>): Promise<getMetadata.ReturnValue>;
export declare namespace getMetadata {
    type Args<chain extends Chain | undefined = Chain | undefined, tokens extends Tokens | undefined = Tokens | undefined> = TokenParameter<chain, tokens>;
    type Parameters<chain extends Chain | undefined = Chain | undefined, tokens extends Tokens | undefined = Tokens | undefined> = Omit<ReadParameters, 'account'> & Args<chain, tokens>;
    type ReturnValue = {
        /** Number of decimals the token uses. */
        decimals: number;
        /** Human-readable name of the token. */
        name: string;
        /** Ticker symbol of the token. */
        symbol: string;
    };
}
//# sourceMappingURL=getMetadata.d.ts.map