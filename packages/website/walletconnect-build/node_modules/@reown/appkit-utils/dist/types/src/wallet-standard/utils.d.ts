import type { Transaction, VersionedTransaction } from '@solana/web3.js';
import type { IdentifierString } from '@wallet-standard/base';
import type { SolanaChain } from './WalletConnectAccount.js';
/**
 * Check if a chain corresponds with one of the Solana clusters.
 */
export declare function isSolanaChain(chain: IdentifierString): chain is SolanaChain;
export declare function isVersionedTransaction(transaction: Transaction | VersionedTransaction): transaction is VersionedTransaction;
