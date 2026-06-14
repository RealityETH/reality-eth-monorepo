import { SOLANA_CHAINS } from './constants.js';
/**
 * Check if a chain corresponds with one of the Solana clusters.
 */
export function isSolanaChain(chain) {
    return SOLANA_CHAINS.includes(chain);
}
export function isVersionedTransaction(transaction) {
    return 'version' in transaction;
}
//# sourceMappingURL=utils.js.map