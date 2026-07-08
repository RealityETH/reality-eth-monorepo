/**
 * Transfers a TIP-20 token. Discriminated on `editable`:
 *
 * - omitted or `false` (default): read-only. Uses an access key when
 *   one matches (signs without showing the wallet UI), otherwise falls
 *   back to a confirm dialog the user has to approve.
 * - `true`: editable. Opens the wallet send UI with the supplied fields
 *   pre-filled for the user to confirm or edit before signing.
 *
 * @example
 * ```ts
 * import { createClient, custom } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   transport: custom(window.ethereum),
 * })
 *
 * // Read-only (no UI when an access key matches)
 * const { receipt } = await Actions.wallet.transfer(client, {
 *   amount: '1.5',
 *   to: '0x...',
 *   token: '0x...',
 * })
 *
 * // Editable (opens wallet UI)
 * await Actions.wallet.transfer(client, {
 *   editable: true,
 *   token: 'pathUSD',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The submitted transfer receipt and chain ID.
 */
export async function transfer(client, parameters) {
    return client.request({
        method: 'wallet_transfer',
        params: [parameters],
    }, { retryCount: 0 });
}
/**
 * Opens the wallet swap flow with optional pre-filled swap fields.
 *
 * @example
 * ```ts
 * import { createClient, custom } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   transport: custom(window.ethereum),
 * })
 *
 * const { receipt } = await Actions.wallet.swap(client, {
 *   amount: '1.5',
 *   token: '0x...',
 *   type: 'sell',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The submitted swap receipt.
 */
export async function swap(client, parameters = {}) {
    return client.request({
        method: 'wallet_swap',
        params: [parameters],
    }, { retryCount: 0 });
}
/**
 * Opens the wallet deposit flow with optional pre-filled deposit fields.
 *
 * @example
 * ```ts
 * import { createClient, custom } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   transport: custom(window.ethereum),
 * })
 *
 * const result = await Actions.wallet.deposit(client, {
 *   amount: '1.5',
 *   token: 'pathusd',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Receipts for onchain deposit operations, when applicable.
 */
export async function deposit(client, parameters = {}) {
    return client.request({
        method: 'wallet_deposit',
        params: [parameters],
    }, { retryCount: 0 });
}
//# sourceMappingURL=wallet.js.map