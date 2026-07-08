import { formatUnits } from '../../utils/unit/formatUnits.js';
import { writeContractSync } from '../wallet/writeContractSync.js';
import { approve } from './approve.js';
import { resolveAmountDecimals, resolveToken } from './internal.js';
/**
 * Approves a spender to transfer ERC-20 tokens on behalf of the caller, and
 * waits for the transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const { receipt, ...event } = await token.approveSync(client, {
 *   amount: 100000000n,
 *   spender: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function approveSync(client, parameters) {
    const { amount, token, throwOnReceiptRevert = true } = parameters;
    const { decimals } = resolveToken(client, { token });
    const resolved = resolveAmountDecimals(amount, decimals);
    const receipt = await approve.inner(writeContractSync, client, {
        ...parameters,
        throwOnReceiptRevert,
    });
    const { args } = approve.extractEvent(receipt.logs);
    return {
        ...args,
        ...(resolved === undefined
            ? {}
            : { decimals: resolved, formatted: formatUnits(args.value, resolved) }),
        receipt,
    };
}
//# sourceMappingURL=approveSync.js.map