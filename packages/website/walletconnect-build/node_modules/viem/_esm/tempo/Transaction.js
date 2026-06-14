// TODO: Find opportunities to make this file less duplicated + more simplified with Viem v3.
import * as Hex from 'ox/Hex';
import * as Secp256k1 from 'ox/Secp256k1';
import * as Signature from 'ox/Signature';
import { SignatureEnvelope, TxEnvelopeTempo as TxTempo, } from 'ox/tempo';
import { getTransactionType as viem_getTransactionType } from '../utils/transaction/getTransactionType.js';
import { parseTransaction as viem_parseTransaction, } from '../utils/transaction/parseTransaction.js';
import { serializeTransaction as viem_serializeTransaction } from '../utils/transaction/serializeTransaction.js';
export function getType(transaction) {
    const account = transaction.account;
    if ((account?.keyType && account.keyType !== 'secp256k1') ||
        account?.source === 'accessKey' ||
        account?.source === 'multisig' ||
        typeof transaction.calls !== 'undefined' ||
        typeof transaction.feePayer !== 'undefined' ||
        typeof transaction.feePayerSignature !== 'undefined' ||
        typeof transaction.feeToken !== 'undefined' ||
        typeof transaction.keyAuthorization !== 'undefined' ||
        typeof transaction.multisig !== 'undefined' ||
        typeof transaction.nonceKey !== 'undefined' ||
        typeof transaction.signature !== 'undefined' ||
        typeof transaction.signatures !== 'undefined' ||
        typeof transaction.validBefore !== 'undefined' ||
        typeof transaction.validAfter !== 'undefined')
        return 'tempo';
    if (transaction.type)
        return transaction.type;
    return viem_getTransactionType(transaction);
}
export function isTempo(transaction) {
    try {
        const type = getType(transaction);
        return type === 'tempo';
    }
    catch {
        return false;
    }
}
export function deserialize(serializedTransaction) {
    const type = Hex.slice(serializedTransaction, 0, 1);
    if (type === '0x76' || type === '0x78')
        return deserializeTempo(serializedTransaction);
    return viem_parseTransaction(serializedTransaction);
}
export async function serialize(transaction, signature) {
    // If the transaction is not a Tempo transaction, route to Viem serializer.
    if (!isTempo(transaction)) {
        if (signature && 'type' in signature && signature.type !== 'secp256k1')
            throw new Error('Unsupported signature type. Expected `secp256k1` but got `' +
                signature.type +
                '`.');
        if (signature && 'type' in signature) {
            const { r, s, yParity } = signature?.signature;
            return viem_serializeTransaction(transaction, {
                r: Hex.fromNumber(r, { size: 32 }),
                s: Hex.fromNumber(s, { size: 32 }),
                yParity,
            });
        }
        return viem_serializeTransaction(transaction, signature);
    }
    const type = getType(transaction);
    if (type === 'tempo')
        return serializeTempo(transaction, signature);
    throw new Error('Unsupported transaction type');
}
////////////////////////////////////////////////////////////////////////////////////
// Internal
/** @internal */
function deserializeTempo(serializedTransaction) {
    const { feePayerSignature, nonce, ...tx } = TxTempo.deserialize(serializedTransaction);
    return {
        ...tx,
        nonce: Number(nonce ?? 0n),
        feePayerSignature: feePayerSignature
            ? {
                r: Hex.fromNumber(feePayerSignature.r, { size: 32 }),
                s: Hex.fromNumber(feePayerSignature.s, { size: 32 }),
                yParity: feePayerSignature.yParity,
            }
            : feePayerSignature,
    };
}
/** @internal */
async function serializeTempo(transaction, sig) {
    const signature = (() => {
        if (transaction.signature)
            return transaction.signature;
        if (sig && 'type' in sig)
            return sig;
        if (sig)
            return SignatureEnvelope.from({
                r: BigInt(sig.r),
                s: BigInt(sig.s),
                yParity: Number(sig.yParity),
            });
        return undefined;
    })();
    const { chainId, feePayer, nonce, ...rest } = transaction;
    const feePayerSignature = (() => {
        const feePayerSignature = transaction.feePayerSignature;
        if (feePayerSignature)
            return {
                r: BigInt(feePayerSignature.r),
                s: BigInt(feePayerSignature.s),
                yParity: Number(feePayerSignature.yParity),
            };
        if (feePayerSignature === null || feePayer)
            return null;
        return undefined;
    })();
    const hasPrefilledFeePayerSignature = typeof transaction.feePayerSignature !== 'undefined' &&
        transaction.feePayerSignature !== null;
    const shouldStripFeeTokenForSponsorship = (feePayer === true && (!signature || !feePayerSignature)) ||
        (!signature && hasPrefilledFeePayerSignature);
    const transaction_ox = {
        ...rest,
        calls: rest.calls?.length
            ? rest.calls
            : [
                {
                    to: rest.to ||
                        (!rest.data || rest.data === '0x'
                            ? '0x0000000000000000000000000000000000000000'
                            : undefined),
                    value: rest.value,
                    data: rest.data,
                },
            ],
        chainId: Number(chainId),
        feePayerSignature,
        type: 'tempo',
        ...(nonce ? { nonce: BigInt(nonce) } : {}),
    };
    // Sender does not commit to `feeToken` under sponsorship. Strip it
    // for the sender sign payload and the partial sponsorship handoff envelope.
    // Keep it only on the final broadcast envelope so the chain can verify
    // the fee payer.
    if (shouldStripFeeTokenForSponsorship)
        delete transaction_ox.feeToken;
    // Native multisig (TIP-1061): combine the collected owner approvals into the
    // multisig signature envelope and serialize the broadcast transaction. The
    // approvals are recovered against the multisig owner digest and ordered into
    // the strictly-ascending owner address order the node requires.
    //
    // Bootstrap (`init`) is auto-detected from the nonce: the protocol requires
    // (and consumes) nonce `0` for the first transaction from a derived account,
    // so `nonce == 0` uniquely identifies a bootstrap. This matches the serialized
    // nonce above (a falsy `nonce` serializes as `0`). The owner approval digest
    // doesn't commit to `init`, so attaching it here (rather than at owner-signing)
    // is safe.
    // NOTE: fee-payer + multisig is handled in a later phase.
    if (transaction.multisig && transaction.signatures && !feePayer) {
        const payload = TxTempo.getSignPayload(TxTempo.from(transaction_ox));
        const signatures = transaction.signatures.map((approval) => SignatureEnvelope.from(approval));
        const sorted = SignatureEnvelope.sortMultisigApprovals({
            payload,
            signatures,
            genesisConfig: transaction.multisig,
        });
        const signature = SignatureEnvelope.from({
            genesisConfig: transaction.multisig,
            signatures: sorted,
            ...(nonce ? {} : { init: true }),
        });
        return TxTempo.serialize(transaction_ox, {
            feePayerSignature: undefined,
            signature,
        });
    }
    if (signature && typeof transaction.feePayer === 'object') {
        const tx = TxTempo.from(transaction_ox, {
            signature,
        });
        const sender = (() => {
            if (transaction.from)
                return transaction.from;
            if (signature.type === 'secp256k1')
                return Secp256k1.recoverAddress({
                    payload: TxTempo.getSignPayload(tx),
                    signature: signature.signature,
                });
            throw new Error('Unable to extract sender from transaction or signature.');
        })();
        const hash = TxTempo.getFeePayerSignPayload(tx, {
            sender,
        });
        const feePayerSignature = await transaction.feePayer.sign({
            hash,
        });
        return TxTempo.serialize(tx, {
            feePayerSignature: Signature.from(feePayerSignature),
        });
    }
    if (feePayer === true || (!signature && hasPrefilledFeePayerSignature)) {
        // Fee payer signature was prefilled during `eth_fillTransaction` -- emit
        // a full envelope with both signatures to skip `eth_signRawTransaction`.
        if (signature && feePayerSignature)
            return TxTempo.serialize(transaction_ox, {
                signature,
            });
        if (signature)
            return TxTempo.serialize(transaction_ox, {
                format: 'feePayer',
                sender: transaction.from,
                signature,
            });
        return TxTempo.serialize(transaction_ox, {
            feePayerSignature: null,
        });
    }
    return TxTempo.serialize(
    // If we have specified a fee payer, the user will not be signing over the fee token.
    // Defer the fee token signing to the fee payer. Once the fee payer has signed,
    // keep `feeToken` so the broadcast envelope carries the token the chain must charge.
    {
        ...transaction_ox,
        ...(feePayer && !feePayerSignature ? { feeToken: undefined } : {}),
    }, {
        feePayerSignature: undefined,
        signature,
    });
}
// Export types required for inference.
// biome-ignore lint/performance/noBarrelFile: _
export { 
/** @deprecated */
KeyAuthorization as z_KeyAuthorization, 
/** @deprecated */
SignatureEnvelope as z_SignatureEnvelope, 
/** @deprecated */
TxEnvelopeTempo as z_TxEnvelopeTempo, } from 'ox/tempo';
//# sourceMappingURL=Transaction.js.map