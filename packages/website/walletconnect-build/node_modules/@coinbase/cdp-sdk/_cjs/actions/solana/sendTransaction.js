"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransaction = sendTransaction;
/**
 * Sends a Solana transaction using the Coinbase API.
 *
 * @param {CdpOpenApiClientType} apiClient - The API client to use.
 * @param {SendTransactionOptions} options - Parameters for sending the Solana transaction.
 * @param {string} options.network - The network to send the transaction to.
 * @param {string} options.transaction - The base64 encoded transaction to send.
 * @param {boolean} [options.useCdpSponsor] - Whether CDP should sponsor the transaction fees.
 * @param {string} [options.idempotencyKey] - An idempotency key.
 *
 * @returns A promise that resolves to the transaction result.
 *
 * @example
 * ```ts
 * const signature = await sendTransaction({
 *   network: "solana-devnet",
 *   transaction: "...",
 *   useCdpSponsor: true,
 * });
 * ```
 */
async function sendTransaction(apiClient, options) {
    const signature = await apiClient.sendSolanaTransaction({
        network: options.network,
        transaction: options.transaction,
        useCdpSponsor: options.useCdpSponsor,
    }, options.idempotencyKey);
    return {
        transactionSignature: signature.transactionSignature,
        signature: signature.transactionSignature,
    };
}
//# sourceMappingURL=sendTransaction.js.map