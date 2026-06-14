import * as AbiEvent from '../core/AbiEvent.js';
import * as AbiParameters from '../core/AbiParameters.js';
import type * as Address from '../core/Address.js';
import type * as Errors from '../core/Errors.js';
import type * as Hex from '../core/Hex.js';
import type { Compute } from '../core/internal/types.js';
/**
 * A TIP-1028 receive-policy claim receipt: the ABI-encoded `ClaimReceiptV1`
 * witness emitted when an inbound transfer or mint violates the recipient's
 * receive policy.
 *
 * This is the canonical, on-chain representation – the value passed to the
 * `ReceivePolicyGuard`'s `claim` and `burn` functions. Use `decode` to read its
 * fields.
 */
export type ReceivePolicyReceipt = Hex.Hex;
/** Reason an inbound transfer or mint was blocked by a receive policy. */
export type BlockedReason = 'none' | 'tokenFilter' | 'receivePolicy';
/** Kind of inbound operation that was blocked. */
export type Kind = 'transfer' | 'mint';
/** A decoded {@link ox#ReceivePolicyReceipt.ReceivePolicyReceipt}. */
export type Decoded = Compute<{
    /** Receipt layout version. */
    version: number;
    /** TIP-20 token holding the blocked funds. */
    token: Address.Address;
    /** Recovery authority captured when the operation was blocked. */
    recoveryAuthority: Address.Address;
    /** Original sender (transfer) or issuer (mint). */
    originator: Address.Address;
    /** Addressed recipient (may be a virtual address). */
    recipient: Address.Address;
    /** Block timestamp when the operation was blocked. */
    blockedAt: bigint;
    /** Guard nonce assigned when the operation was blocked. */
    blockedNonce: bigint;
    /** Reason the operation was blocked. */
    blockedReason: BlockedReason;
    /** Whether the blocked operation was a transfer or mint. */
    kind: Kind;
    /** Application memo. */
    memo: Hex.Hex;
}>;
/**
 * Decodes a {@link ox#ReceivePolicyReceipt.ReceivePolicyReceipt} (ABI-encoded
 * `ClaimReceiptV1` witness) into its fields.
 *
 * [TIP-1028](https://docs.tempo.xyz/protocol/tips/tip-1028)
 *
 * @example
 * ```ts twoslash
 * import { ReceivePolicyReceipt } from 'ox/tempo'
 *
 * const decoded = ReceivePolicyReceipt.decode('0x...')
 * ```
 *
 * @param receipt - The receive-policy receipt.
 * @returns The decoded fields.
 */
export declare function decode(receipt: ReceivePolicyReceipt): Decoded;
export declare namespace decode {
    type ErrorType = AbiParameters.decode.ErrorType | Errors.GlobalErrorType;
}
/**
 * Encodes decoded fields into a
 * {@link ox#ReceivePolicyReceipt.ReceivePolicyReceipt}. Inverse of `decode`.
 *
 * [TIP-1028](https://docs.tempo.xyz/protocol/tips/tip-1028)
 *
 * @example
 * ```ts twoslash
 * // @noErrors
 * import { ReceivePolicyReceipt } from 'ox/tempo'
 *
 * const decoded = ReceivePolicyReceipt.decode('0x...')
 * const receipt = ReceivePolicyReceipt.encode(decoded)
 * ```
 *
 * @param decoded - The decoded fields.
 * @returns The receive-policy receipt.
 */
export declare function encode(decoded: Decoded): ReceivePolicyReceipt;
export declare namespace encode {
    type ErrorType = AbiParameters.encode.ErrorType | Errors.GlobalErrorType;
}
/**
 * Normalizes a {@link ox#ReceivePolicyReceipt.ReceivePolicyReceipt} from either
 * an encoded receipt (passthrough) or decoded fields.
 *
 * [TIP-1028](https://docs.tempo.xyz/protocol/tips/tip-1028)
 *
 * @example
 * ```ts twoslash
 * // @noErrors
 * import { ReceivePolicyReceipt } from 'ox/tempo'
 *
 * // From an encoded receipt (passthrough).
 * const a = ReceivePolicyReceipt.from('0x...')
 *
 * // From decoded fields.
 * const b = ReceivePolicyReceipt.from(ReceivePolicyReceipt.decode('0x...'))
 * ```
 *
 * @param value - An encoded receipt or decoded fields.
 * @returns The receive-policy receipt.
 */
export declare function from(value: ReceivePolicyReceipt | Decoded): ReceivePolicyReceipt;
export declare namespace from {
    type ErrorType = encode.ErrorType | Errors.GlobalErrorType;
}
/**
 * Extracts the {@link ox#ReceivePolicyReceipt.ReceivePolicyReceipt} from a
 * `ReceivePolicyGuard` `TransferBlocked` log.
 *
 * Throws if the log is not a `TransferBlocked` event. Use
 * `fromTransactionReceipt` to extract every blocked transfer in a transaction
 * (which skips unrelated logs).
 *
 * [TIP-1028](https://docs.tempo.xyz/protocol/tips/tip-1028)
 *
 * @example
 * ```ts twoslash
 * // @noErrors
 * import { ReceivePolicyReceipt } from 'ox/tempo'
 *
 * const receipt = ReceivePolicyReceipt.fromLog(log)
 * ```
 *
 * @param log - A `TransferBlocked` log (`data` & `topics`).
 * @returns The receive-policy receipt.
 */
export declare function fromLog(log: fromLog.Log): ReceivePolicyReceipt;
export declare namespace fromLog {
    type Log = AbiEvent.decode.Log;
    type ErrorType = AbiEvent.decode.ErrorType | Errors.GlobalErrorType;
}
/**
 * Extracts every {@link ox#ReceivePolicyReceipt.ReceivePolicyReceipt} from a
 * transaction receipt's logs.
 *
 * A single transaction may block multiple inbound transfers (e.g. a batched
 * transfer to several recipients), so this returns an array – one entry per
 * `TransferBlocked` log, in log order. Returns an empty array when no transfers
 * were blocked.
 *
 * [TIP-1028](https://docs.tempo.xyz/protocol/tips/tip-1028)
 *
 * @example
 * ```ts twoslash
 * // @noErrors
 * import { ReceivePolicyReceipt } from 'ox/tempo'
 *
 * const receipts = ReceivePolicyReceipt.fromTransactionReceipt(receipt)
 * // @log: ['0x...'] (pass each to `claim` / `burn`)
 * ```
 *
 * @param receipt - The transaction receipt (or any object with `logs`).
 * @returns The receive-policy receipts, one per blocked transfer.
 */
export declare function fromTransactionReceipt(receipt: fromTransactionReceipt.Receipt): readonly ReceivePolicyReceipt[];
export declare namespace fromTransactionReceipt {
    type Receipt = {
        /** Logs emitted by the transaction. */
        logs?: readonly AbiEvent.decode.Log[] | undefined;
    };
    type ErrorType = AbiEvent.getSelector.ErrorType | fromLog.ErrorType | Errors.GlobalErrorType;
}
//# sourceMappingURL=ReceivePolicyReceipt.d.ts.map