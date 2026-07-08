import { createClient as createClient_, } from '../clients/createClient.js';
import { publicActions, } from '../clients/decorators/public.js';
import { walletActions, } from '../clients/decorators/wallet.js';
import { http } from '../clients/transports/http.js';
import { tokens as tokenSets } from '../tokens/sets.js';
import { tempo, tempoTestnet } from './Chain.js';
import { decorator as tempoActions } from './Decorator.js';
/**
 * Creates a Tempo {@link Client}: an extension of Viem's `createClient`
 * decorated with `publicActions`, `walletActions`, and `tempoActions`.
 *
 * Defaults to the `tempo` mainnet chain and `http` transport, so a minimal
 * client can be created with `createClient()`. Pass `testnet` to use the
 * Tempo testnet, or `chain` to override the chain entirely. Pass `feeToken`
 * to set a default fee token for every transaction.
 *
 * @example
 * ```ts
 * import { createClient } from 'viem/tempo'
 *
 * // Minimal client (tempo mainnet, http transport).
 * const client = createClient()
 * ```
 *
 * @example
 * ```ts
 * import { Account, createClient, http } from 'viem/tempo'
 *
 * // Testnet client with an account and custom transport.
 * const client = createClient({
 *   account: Account.fromSecp256k1('0x...'),
 *   testnet: true,
 *   transport: http('https://rpc.example.com'),
 * })
 * ```
 *
 * @example
 * ```ts
 * import { createClient } from 'viem/tempo'
 *
 * // Client with a default fee token.
 * const client = createClient({
 *   feeToken: '0x20c0000000000000000000000000000000000001',
 * })
 * ```
 *
 * @param parameters - Parameters.
 * @returns The Tempo Client.
 */
export function createClient(parameters = {}) {
    const { chain, feeToken, testnet, tokens, transport, ...rest } = parameters;
    const baseChain = chain ?? (testnet ? tempoTestnet : tempo);
    const resolvedChain = feeToken && typeof baseChain.extend === 'function'
        ? baseChain.extend({
            feeToken,
        })
        : baseChain;
    return createClient_({
        ...rest,
        chain: resolvedChain,
        tokens: tokens ?? tokenSets.tempo,
        transport: transport ?? http(),
    })
        .extend(publicActions)
        .extend(walletActions)
        .extend(tempoActions());
}
//# sourceMappingURL=Client.js.map