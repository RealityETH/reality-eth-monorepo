import { formatUnits } from '../../utils/unit/formatUnits.js';
import { writeContractSync } from '../wallet/writeContractSync.js';
import { resolveAmountDecimals, resolveToken } from './internal.js';
import { transfer } from './transfer.js';
/**
 * Transfers ERC-20 tokens to another address, and waits for the transaction to
 * be confirmed.
 *
 * Pass `from` to transfer on behalf of another address using an allowance
 * (calls `transferFrom`); otherwise transfers from the caller (calls
 * `transfer`).
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
 * const { receipt, ...event } = await token.transferSync(client, {
 *   amount: 100000000n,
 *   to: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function transferSync(client, parameters) {
    const { amount, token, throwOnReceiptRevert = true } = parameters;
    const { decimals } = resolveToken(client, { token });
    const resolved = resolveAmountDecimals(amount, decimals);
    const receipt = await transfer.inner(writeContractSync, client, {
        ...parameters,
        throwOnReceiptRevert,
    });
    const { args } = transfer.extractEvent(receipt.logs);
    return {
        ...args,
        ...(resolved === undefined
            ? {}
            : { decimals: resolved, formatted: formatUnits(args.value, resolved) }),
        receipt,
    };
}
//# sourceMappingURL=transferSync.js.map