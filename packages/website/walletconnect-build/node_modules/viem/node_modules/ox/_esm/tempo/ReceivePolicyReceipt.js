import * as AbiEvent from '../core/AbiEvent.js';
import * as AbiParameters from '../core/AbiParameters.js';
/** @internal */
const blockedReasons = ['none', 'tokenFilter', 'receivePolicy'];
/** @internal */
const kinds = ['transfer', 'mint'];
/** @internal ABI parameters for the `ClaimReceiptV1` witness. */
const parameters = [
    {
        type: 'tuple',
        components: [
            { name: 'version', type: 'uint8' },
            { name: 'token', type: 'address' },
            { name: 'recoveryAuthority', type: 'address' },
            { name: 'originator', type: 'address' },
            { name: 'recipient', type: 'address' },
            { name: 'blockedAt', type: 'uint64' },
            { name: 'blockedNonce', type: 'uint64' },
            { name: 'blockedReason', type: 'uint8' },
            { name: 'kind', type: 'uint8' },
            { name: 'memo', type: 'bytes32' },
        ],
    },
];
/** @internal `TransferBlocked` event emitted by the `ReceivePolicyGuard`. */
const transferBlocked = AbiEvent.from('event TransferBlocked(address indexed token, address indexed receiver, uint64 indexed blockedNonce, uint256 amount, uint8 receiptVersion, bytes receipt)');
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
export function decode(receipt) {
    const [decoded] = AbiParameters.decode(parameters, receipt);
    return {
        version: decoded.version,
        token: decoded.token,
        recoveryAuthority: decoded.recoveryAuthority,
        originator: decoded.originator,
        recipient: decoded.recipient,
        blockedAt: decoded.blockedAt,
        blockedNonce: decoded.blockedNonce,
        blockedReason: blockedReasons[decoded.blockedReason] ?? 'none',
        kind: kinds[decoded.kind] ?? 'transfer',
        memo: decoded.memo,
    };
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
export function encode(decoded) {
    return AbiParameters.encode(parameters, [
        {
            version: decoded.version,
            token: decoded.token,
            recoveryAuthority: decoded.recoveryAuthority,
            originator: decoded.originator,
            recipient: decoded.recipient,
            blockedAt: decoded.blockedAt,
            blockedNonce: decoded.blockedNonce,
            blockedReason: blockedReasons.indexOf(decoded.blockedReason),
            kind: kinds.indexOf(decoded.kind),
            memo: decoded.memo,
        },
    ]);
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
export function from(value) {
    if (typeof value === 'string')
        return value;
    return encode(value);
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
export function fromLog(log) {
    const { receipt } = AbiEvent.decode(transferBlocked, log);
    return receipt;
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
export function fromTransactionReceipt(receipt) {
    const selector = AbiEvent.getSelector(transferBlocked);
    const receipts = [];
    for (const log of receipt.logs ?? []) {
        if (log.topics[0] !== selector)
            continue;
        receipts.push(fromLog(log));
    }
    return receipts;
}
//# sourceMappingURL=ReceivePolicyReceipt.js.map