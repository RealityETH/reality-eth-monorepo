import * as AbiItem from '../core/AbiItem.js';
import * as Hash from '../core/Hash.js';
import * as Hex from '../core/Hex.js';
import * as Rlp from '../core/Rlp.js';
import * as SignatureEnvelope from './SignatureEnvelope.js';
import * as TempoAddress from './TempoAddress.js';
/**
 * Converts a Key Authorization object into a typed {@link ox#KeyAuthorization.KeyAuthorization}.
 *
 * Use this to create an unsigned key authorization, then sign it with the root key using
 * {@link ox#KeyAuthorization.(getSignPayload:function)} and attach the signature. The signed authorization
 * can be included in a {@link ox#TxEnvelopeTempo.TxEnvelopeTempo} via the
 * `keyAuthorization` field to provision the access key on-chain.
 *
 * [Access Keys Specification](https://docs.tempo.xyz/protocol/transactions/spec-tempo-transaction#access-keys)
 *
 * @example
 * ### Secp256k1 Key
 *
 * Standard Ethereum ECDSA key using the secp256k1 curve.
 *
 * ```ts twoslash
 * import { Address, Secp256k1, Value } from 'ox'
 * import { KeyAuthorization } from 'ox/tempo'
 *
 * const privateKey = Secp256k1.randomPrivateKey()
 * const address = Address.fromPublicKey(Secp256k1.getPublicKey({ privateKey }))
 *
 * const authorization = KeyAuthorization.from({
 *   address,
 *   chainId: 4217n,
 *   expiry: 1234567890,
 *   type: 'secp256k1',
 *   limits: [{
 *     token: '0x20c0000000000000000000000000000000000001',
 *     limit: Value.from('10', 6),
 *   }],
 * })
 * ```
 *
 * @example
 * ### WebCryptoP256 Key
 *
 * ```ts twoslash
 * import { Address, WebCryptoP256, Value } from 'ox'
 * import { KeyAuthorization } from 'ox/tempo'
 *
 * const keyPair = await WebCryptoP256.createKeyPair()
 * const address = Address.fromPublicKey(keyPair.publicKey)
 *
 * const authorization = KeyAuthorization.from({
 *   address,
 *   chainId: 4217n,
 *   expiry: 1234567890,
 *   type: 'p256',
 *   limits: [{
 *     token: '0x20c0000000000000000000000000000000000001',
 *     limit: Value.from('10', 6),
 *   }],
 * })
 * ```
 *
 * @example
 * ### Attaching Signatures (Secp256k1)
 *
 * Attach a signature to a Key Authorization using a Secp256k1 private key to
 * authorize another Secp256k1 key on the account.
 *
 * ```ts twoslash
 * import { Address, Secp256k1, Value } from 'ox'
 * import { KeyAuthorization } from 'ox/tempo'
 *
 * const privateKey = '0x...'
 * const address = Address.fromPublicKey(Secp256k1.getPublicKey({ privateKey }))
 *
 * const authorization = KeyAuthorization.from({
 *   address,
 *   chainId: 4217n,
 *   expiry: 1234567890,
 *   type: 'secp256k1',
 *   limits: [{
 *     token: '0x20c0000000000000000000000000000000000001',
 *     limit: Value.from('10', 6),
 *   }],
 * })
 *
 * const rootPrivateKey = '0x...'
 * const signature = Secp256k1.sign({
 *   payload: KeyAuthorization.getSignPayload(authorization),
 *   privateKey: rootPrivateKey,
 * })
 *
 * const authorization_signed = KeyAuthorization.from(authorization, { signature })
 * ```
 *
 * @example
 * ### Attaching Signatures (WebAuthn)
 *
 * Attach a signature to a Key Authorization using a WebAuthn credential to
 * authorize a new WebCryptoP256 key on the account.
 *
 * ```ts twoslash
 * // @noErrors
 * import { Address, Value, WebCryptoP256, WebAuthnP256 } from 'ox'
 * import { KeyAuthorization, SignatureEnvelope } from 'ox/tempo'
 *
 * const keyPair = await WebCryptoP256.createKeyPair()
 * const address = Address.fromPublicKey(keyPair.publicKey)
 *
 * const authorization = KeyAuthorization.from({
 *   address,
 *   chainId: 4217n,
 *   expiry: 1234567890,
 *   type: 'p256',
 *   limits: [{
 *     token: '0x20c0000000000000000000000000000000000001',
 *     limit: Value.from('10', 6),
 *   }],
 * })
 *
 * const credential = await WebAuthnP256.createCredential({ name: 'Example' })
 *
 * const { metadata, signature } = await WebAuthnP256.sign({
 *   challenge: KeyAuthorization.getSignPayload(authorization),
 *   credentialId: credential.id,
 * })
 *
 * const signatureEnvelope = SignatureEnvelope.from({ // [!code focus]
 *   signature, // [!code focus]
 *   publicKey: credential.publicKey, // [!code focus]
 *   metadata, // [!code focus]
 * })
 * const authorization_signed = KeyAuthorization.from(
 *   authorization,
 *   { signature: signatureEnvelope }, // [!code focus]
 * )
 * ```
 *
 * @param authorization - A Key Authorization tuple in object format.
 * @param options - Key Authorization options.
 * @returns The {@link ox#KeyAuthorization.KeyAuthorization}.
 */
export function from(authorization, options = {}) {
    if ('keyId' in authorization)
        return fromRpc(authorization);
    const auth = authorization;
    if (auth.witness !== undefined)
        assertWitness(auth.witness);
    const resolved = {
        ...auth,
        address: TempoAddress.resolve(auth.address),
        ...(auth.limits
            ? {
                limits: auth.limits.map((l) => ({
                    ...l,
                    token: TempoAddress.resolve(l.token),
                })),
            }
            : {}),
        ...(auth.scopes
            ? {
                scopes: auth.scopes.map((scope) => ({
                    ...scope,
                    address: TempoAddress.resolve(scope.address),
                    selector: resolveSelector(scope.selector),
                    ...(scope.recipients
                        ? {
                            recipients: scope.recipients.map((r) => TempoAddress.resolve(r)),
                        }
                        : {}),
                })),
            }
            : {}),
    };
    if (options.signature)
        return {
            ...resolved,
            signature: SignatureEnvelope.from(options.signature),
        };
    return resolved;
}
/**
 * Converts an {@link ox#AuthorizationTempo.Rpc} to an {@link ox#AuthorizationTempo.AuthorizationTempo}.
 *
 * @example
 * ```ts twoslash
 * import { KeyAuthorization } from 'ox/tempo'
 *
 * const keyAuthorization = KeyAuthorization.fromRpc({
 *   chainId: '0x1079',
 *   expiry: '0x174876e800',
 *   keyId: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
 *   keyType: 'secp256k1',
 *   limits: [{ token: '0x20c0000000000000000000000000000000000001', limit: '0xf4240' }],
 *   signature: {
 *     type: 'secp256k1',
 *     r: '0x635dc2033e60185bb36709c29c75d64ea51dfbd91c32ef4be198e4ceb169fb4d',
 *     s: '0x50c2667ac4c771072746acfdcf1f1483336dcca8bd2df47cd83175dbe60f0540',
 *     yParity: '0x0'
 *   },
 * })
 * ```
 *
 * @param authorization - The RPC-formatted Key Authorization.
 * @returns A signed {@link ox#AuthorizationTempo.AuthorizationTempo}.
 */
export function fromRpc(authorization) {
    const { allowedCalls, chainId, keyId, expiry, limits, keyType } = authorization;
    const witness = authorization.witness ?? undefined;
    const isAdmin = authorization.isAdmin ?? undefined;
    const account = authorization.account ?? undefined;
    const signature = SignatureEnvelope.fromRpc(authorization.signature);
    if (witness !== undefined)
        assertWitness(witness);
    // Unflatten nested allowedCalls into flat scopes
    const scopes = allowedCalls
        ? allowedCalls.flatMap((callScope) => {
            if (!callScope.selectorRules || callScope.selectorRules.length === 0)
                return [{ address: callScope.target }];
            return callScope.selectorRules.map((rule) => ({
                address: callScope.target,
                selector: normalizeSelector(rule.selector),
                ...(rule.recipients && rule.recipients.length > 0
                    ? { recipients: rule.recipients }
                    : {}),
            }));
        })
        : undefined;
    return {
        address: keyId,
        chainId: chainId === '0x' ? 0n : Hex.toBigInt(chainId),
        ...(expiry != null ? { expiry: Number(expiry) } : {}),
        limits: limits?.map((limit) => ({
            token: limit.token,
            limit: BigInt(limit.limit),
            ...(limit.period && hexToNumber(limit.period) > 0
                ? { period: hexToNumber(limit.period) }
                : {}),
        })),
        ...(scopes ? { scopes } : {}),
        signature,
        type: keyType,
        ...(witness !== undefined ? { witness } : {}),
        ...(isAdmin ? { isAdmin: true } : {}),
        ...(account !== undefined ? { account } : {}),
    };
}
/**
 * Converts an {@link ox#KeyAuthorization.Tuple} to an {@link ox#KeyAuthorization.KeyAuthorization}.
 *
 * @example
 * ```ts twoslash
 * import { KeyAuthorization } from 'ox/tempo'
 *
 * const authorization = KeyAuthorization.fromTuple([
 *   [
 *     '0x',
 *     '0x00',
 *     '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
 *     '0x174876e800',
 *     [['0x20c0000000000000000000000000000000000001', '0xf4240']],
 *   ],
 *   '0x01a068a020a209d3d56c46f38cc50a33f704f4a9a10a59377f8dd762ac66910e9b907e865ad05c4035ab5792787d4a0297a43617ae897930a6fe4d822b8faea52064',
 * ])
 * ```
 *
 * @example
 * Unsigned Key Authorization tuple (no signature):
 *
 * ```ts twoslash
 * import { KeyAuthorization } from 'ox/tempo'
 *
 * const authorization = KeyAuthorization.fromTuple([
 *   [
 *     '0x',
 *     '0x00',
 *     '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
 *     '0x174876e800',
 *     [['0x20c0000000000000000000000000000000000001', '0xf4240']],
 *   ],
 * ])
 * ```
 *
 * @param tuple - The Key Authorization tuple.
 * @returns The {@link ox#KeyAuthorization.KeyAuthorization}.
 */
export function fromTuple(tuple) {
    const [authorization, signatureSerialized] = tuple;
    const [chainId, keyType_hex, keyId, ...trailing] = authorization;
    const keyType = (() => {
        switch (keyType_hex) {
            case '0x':
            case '0x00':
                return 'secp256k1';
            case '0x01':
                return 'p256';
            case '0x02':
                return 'webAuthn';
            default:
                throw new Error(`Invalid key type: ${keyType_hex}`);
        }
    })();
    // Trailing optional fields in wire order. Each entry pulls one slot off the
    // trailing array and decodes it (treating absent or RLP-null placeholders as
    // missing). To add a new optional trailing field, append a single entry.
    const [rawExpiry, rawLimits, rawScopes, rawWitness, rawIsAdmin, rawAccount] = trailing;
    const expiry = isAbsent(rawExpiry)
        ? undefined
        : hexToNumber(rawExpiry) || undefined;
    const limits = Array.isArray(rawLimits) && rawLimits.length > 0
        ? rawLimits.map((limitTuple) => {
            const [token, limit, period] = limitTuple;
            return {
                token,
                limit: hexToBigint(limit),
                ...(period !== undefined ? { period: hexToNumber(period) } : {}),
            };
        })
        : undefined;
    const scopes = Array.isArray(rawScopes)
        ? rawScopes.flatMap((scopeTuple) => {
            const [address, selectorRules] = scopeTuple;
            // If no selector rules, this is an address-only scope.
            if (!Array.isArray(selectorRules) || selectorRules.length === 0)
                return [{ address }];
            // Flatten each selector rule into a separate scope entry.
            return selectorRules.map((ruleTuple) => {
                const [selector, recipients] = ruleTuple;
                return {
                    address,
                    selector,
                    ...(Array.isArray(recipients) && recipients.length > 0
                        ? { recipients }
                        : {}),
                };
            });
        })
        : undefined;
    const witness = isAbsent(rawWitness) ? undefined : rawWitness;
    if (witness !== undefined)
        assertWitness(witness);
    const isAdmin = (() => {
        if (isAbsent(rawIsAdmin))
            return undefined;
        // TIP-1049: the admin marker is strictly `0x01`. Any other value is a
        // protocol-level decode error on the node, so reject it here too.
        if (rawIsAdmin !== '0x01')
            throw new InvalidAdminMarkerError(rawIsAdmin);
        return true;
    })();
    const account = isAbsent(rawAccount)
        ? undefined
        : rawAccount;
    // TIP-1049 admin fields are paired: only emit both when both are present on
    // the wire. Wire shapes carrying only one are tolerated for forward-compat
    // but the orphan field is dropped (since the public API requires both).
    const adminPair = account !== undefined && isAdmin ? { account, isAdmin: true } : {};
    const args = {
        address: keyId,
        chainId: chainId === '0x' ? 0n : Hex.toBigInt(chainId),
        type: keyType,
        ...(expiry !== undefined ? { expiry } : {}),
        ...(limits !== undefined ? { limits } : {}),
        ...(scopes !== undefined ? { scopes } : {}),
        ...(witness !== undefined ? { witness } : {}),
        ...adminPair,
    };
    if (signatureSerialized)
        args.signature = SignatureEnvelope.deserialize(signatureSerialized);
    return from(args);
}
/**
 * Computes the sign payload for an {@link ox#KeyAuthorization.KeyAuthorization}.
 *
 * The root key must sign this payload to authorize the access key. The resulting signature
 * is attached to the key authorization via {@link ox#KeyAuthorization.(from:function)} with the
 * `signature` option.
 *
 * [Access Keys Specification](https://docs.tempo.xyz/protocol/transactions/spec-tempo-transaction#access-keys)
 *
 * @example
 * ```ts twoslash
 * import { Address, Secp256k1, Value } from 'ox'
 * import { KeyAuthorization } from 'ox/tempo'
 *
 * const privateKey = '0x...'
 * const address = Address.fromPublicKey(Secp256k1.getPublicKey({ privateKey }))
 *
 * const authorization = KeyAuthorization.from({
 *   address,
 *   chainId: 4217n,
 *   expiry: 1234567890,
 *   type: 'secp256k1',
 *   limits: [{
 *     token: '0x20c0000000000000000000000000000000000001',
 *     limit: Value.from('10', 6),
 *   }],
 * })
 *
 * const payload = KeyAuthorization.getSignPayload(authorization) // [!code focus]
 * ```
 *
 * @param authorization - The {@link ox#KeyAuthorization.KeyAuthorization}.
 * @returns The sign payload.
 */
export function getSignPayload(authorization) {
    return hash(authorization);
}
/**
 * Deserializes an RLP-encoded {@link ox#KeyAuthorization.KeyAuthorization}.
 *
 * @example
 * ```ts twoslash
 * import { KeyAuthorization } from 'ox/tempo'
 * import { Value } from 'ox'
 *
 * const authorization = KeyAuthorization.from({
 *   address: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
 *   chainId: 4217n,
 *   expiry: 1234567890,
 *   type: 'secp256k1',
 *   limits: [{
 *     token: '0x20c0000000000000000000000000000000000001',
 *     limit: Value.from('10', 6)
 *   }],
 * })
 *
 * const serialized = KeyAuthorization.serialize(authorization)
 * const deserialized = KeyAuthorization.deserialize(serialized) // [!code focus]
 * ```
 *
 * @param serialized - The RLP-encoded Key Authorization.
 * @returns The {@link ox#KeyAuthorization.KeyAuthorization}.
 */
export function deserialize(serialized) {
    const tuple = Rlp.toHex(serialized);
    return fromTuple(tuple);
}
/**
 * Computes the hash for an {@link ox#KeyAuthorization.KeyAuthorization}.
 *
 * @example
 * ```ts twoslash
 * import { KeyAuthorization } from 'ox/tempo'
 * import { Value } from 'ox'
 *
 * const authorization = KeyAuthorization.from({
 *   address: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
 *   chainId: 4217n,
 *   expiry: 1234567890,
 *   type: 'secp256k1',
 *   limits: [{
 *     token: '0x20c0000000000000000000000000000000000001',
 *     limit: Value.from('10', 6)
 *   }],
 * })
 *
 * const hash = KeyAuthorization.hash(authorization) // [!code focus]
 * ```
 *
 * @param authorization - The {@link ox#KeyAuthorization.KeyAuthorization}.
 * @returns The hash.
 */
export function hash(authorization) {
    const [authorizationTuple] = toTuple(authorization);
    const serialized = Rlp.fromHex(authorizationTuple);
    return Hash.keccak256(serialized);
}
/**
 * Serializes a {@link ox#KeyAuthorization.KeyAuthorization} to RLP-encoded hex.
 *
 * @example
 * ```ts twoslash
 * import { KeyAuthorization } from 'ox/tempo'
 * import { Value } from 'ox'
 *
 * const authorization = KeyAuthorization.from({
 *   address: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
 *   chainId: 4217n,
 *   expiry: 1234567890,
 *   type: 'secp256k1',
 *   limits: [{
 *     token: '0x20c0000000000000000000000000000000000001',
 *     limit: Value.from('10', 6)
 *   }],
 * })
 *
 * const serialized = KeyAuthorization.serialize(authorization) // [!code focus]
 * ```
 *
 * @param authorization - The {@link ox#KeyAuthorization.KeyAuthorization}.
 * @returns The RLP-encoded Key Authorization.
 */
export function serialize(authorization) {
    const tuple = toTuple(authorization);
    return Rlp.fromHex(tuple);
}
/**
 * Converts an {@link ox#KeyAuthorization.KeyAuthorization} to an {@link ox#KeyAuthorization.Rpc}.
 *
 * @example
 * ```ts twoslash
 * import { KeyAuthorization } from 'ox/tempo'
 * import { Value } from 'ox'
 *
 * const authorization = KeyAuthorization.toRpc({
 *   address: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
 *   chainId: 4217n,
 *   expiry: 1234567890,
 *   type: 'secp256k1',
 *   limits: [{
 *     token: '0x20c0000000000000000000000000000000000001',
 *     limit: Value.from('10', 6)
 *   }],
 *   signature: {
 *     type: 'secp256k1',
 *     signature: {
 *       r: 44944627813007772897391531230081695102703289123332187696115181104739239197517n,
 *       s: 36528503505192438307355164441104001310566505351980369085208178712678799181120n,
 *       yParity: 0,
 *     },
 *   },
 * })
 * ```
 *
 * @param authorization - A Key Authorization.
 * @returns An RPC-formatted Key Authorization.
 */
export function toRpc(authorization) {
    const { address, scopes, chainId, expiry, limits, type, signature, witness, isAdmin, account, } = authorization;
    if (witness !== undefined)
        assertWitness(witness);
    // Group flat scopes by address into nested allowedCalls wire format
    const allowedCalls = (() => {
        if (!scopes)
            return undefined;
        const grouped = new Map();
        for (const scope of scopes) {
            const key = scope.address;
            if (!grouped.has(key))
                grouped.set(key, []);
            if (scope.selector) {
                grouped.get(key).push({
                    selector: resolveSelector(scope.selector),
                    ...(scope.recipients && scope.recipients.length > 0
                        ? { recipients: scope.recipients }
                        : {}),
                });
            }
        }
        return [...grouped.entries()].map(([target, selectorRules]) => ({
            target: target,
            ...(selectorRules.length > 0 ? { selectorRules } : {}),
        }));
    })();
    return {
        chainId: chainId === 0n ? '0x' : Hex.fromNumber(chainId),
        expiry: typeof expiry === 'number' ? Hex.fromNumber(expiry) : null,
        keyId: TempoAddress.resolve(address),
        keyType: type,
        limits: limits?.map(({ token, limit, period }) => ({
            token,
            limit: Hex.fromNumber(limit),
            ...(period ? { period: numberToHex(period) } : {}),
        })),
        signature: SignatureEnvelope.toRpc(signature),
        ...(allowedCalls ? { allowedCalls } : {}),
        ...(witness !== undefined ? { witness } : {}),
        ...(isAdmin ? { isAdmin: true } : {}),
        ...(account !== undefined ? { account } : {}),
    };
}
/**
 * Converts an {@link ox#KeyAuthorization.KeyAuthorization} to an {@link ox#KeyAuthorization.Tuple}.
 *
 * @example
 * ```ts twoslash
 * import { KeyAuthorization } from 'ox/tempo'
 * import { Value } from 'ox'
 *
 * const authorization = KeyAuthorization.from({
 *   address: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
 *   chainId: 4217n,
 *   expiry: 1234567890,
 *   type: 'secp256k1',
 *   limits: [{
 *     token: '0x20c0000000000000000000000000000000000001',
 *     limit: Value.from('10', 6)
 *   }],
 * })
 *
 * const tuple = KeyAuthorization.toTuple(authorization) // [!code focus]
 * // @log: [
 * // @log:   '0x174876e800',
 * // @log:   [['0x20c0000000000000000000000000000000000001', '0xf4240']],
 * // @log:   '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
 * // @log:   'secp256k1',
 * // @log: ]
 * ```
 *
 * @param authorization - The {@link ox#KeyAuthorization.KeyAuthorization}.
 * @returns A Tempo Key Authorization tuple.
 */
export function toTuple(authorization) {
    const { address, chainId, scopes, expiry, limits, witness, isAdmin, account, } = authorization;
    if (witness !== undefined)
        assertWitness(witness);
    const signature = authorization.signature
        ? SignatureEnvelope.serialize(authorization.signature)
        : undefined;
    const type = (() => {
        switch (authorization.type) {
            case 'secp256k1':
                return '0x';
            case 'p256':
                return '0x01';
            case 'webAuthn':
                return '0x02';
            default:
                throw new Error(`Invalid key type: ${authorization.type}`);
        }
    })();
    const limitsValue = limits?.map((limit) => {
        const tuple = [limit.token, bigintToHex(limit.limit)];
        // Canonical: omit period when 0 (one-time limit)
        if (limit.period && limit.period > 0)
            tuple.push(numberToHex(limit.period));
        return tuple;
    });
    // Group flat scopes by address for wire format
    const callsValue = (() => {
        if (!scopes)
            return undefined;
        const grouped = new Map();
        for (const scope of scopes) {
            const key = scope.address;
            if (!grouped.has(key))
                grouped.set(key, []);
            if (scope.selector) {
                grouped
                    .get(key)
                    .push([
                    resolveSelector(scope.selector),
                    (scope.recipients ??
                        []),
                ]);
            }
        }
        return [...grouped.entries()].map(([address, selectorRules]) => [
            address,
            selectorRules.map(([selector, recipients]) => [selector, recipients]),
        ]);
    })();
    // Optional trailing fields in wire order. Each entry's `placeholder` is
    // emitted when this field is skipped but a later field is present.
    //
    // Placeholder convention:
    // - `'0x'` (RLP null) is the canonical placeholder for fields added at or
    //   after TIP-1053. The node decodes it as `None` (unrestricted).
    // - `limits` keeps `[]` as its skipped placeholder for pre-TIP-1053 wire
    //   shapes — preserving byte-for-byte equivalence with signed payloads
    //   produced before TIP-1053 was added. When any TIP-1053+ field is
    //   present, the canonical `'0x'` placeholder is used instead.
    //
    // To add a new optional trailing field (e.g. from a future TIP): append a
    // single entry to this list with `placeholder: '0x'`.
    const hasTip1053Plus = witness !== undefined || isAdmin || account !== undefined;
    const optionals = [
        {
            value: expiry !== null && expiry !== undefined && expiry !== 0
                ? numberToHex(expiry)
                : undefined,
            placeholder: '0x',
        },
        {
            value: limitsValue,
            placeholder: hasTip1053Plus ? '0x' : [],
        },
        { value: callsValue, placeholder: '0x' },
        { value: witness, placeholder: '0x' },
        // TIP-1049: admin marker. Present = `0x01` (RLP integer 1); absent
        // skipped or omitted. Any other value is a hard decode error on the node.
        { value: isAdmin ? '0x01' : undefined, placeholder: '0x' },
        // TIP-1049: optional account binding. Last field — never a placeholder.
        { value: account, placeholder: '0x' },
    ];
    let lastPresent = -1;
    for (let i = optionals.length - 1; i >= 0; i--)
        if (optionals[i].value !== undefined) {
            lastPresent = i;
            break;
        }
    const trailing = optionals
        .slice(0, lastPresent + 1)
        .map(({ value, placeholder }) => value ?? placeholder);
    const authorizationTuple = [bigintToHex(chainId), type, address, ...trailing];
    return [authorizationTuple, ...(signature ? [signature] : [])];
}
function bigintToHex(value) {
    return value === 0n ? '0x' : Hex.fromNumber(value);
}
function numberToHex(value) {
    return value === 0 ? '0x' : Hex.fromNumber(value);
}
function hexToBigint(hex) {
    return hex === '0x' ? 0n : BigInt(hex);
}
function hexToNumber(hex) {
    return hex === '0x' ? 0 : Hex.toNumber(hex);
}
function normalizeSelector(selector) {
    if (typeof selector === 'string')
        return selector;
    if (Array.isArray(selector))
        return Hex.fromBytes(new Uint8Array(selector));
    return selector;
}
function resolveSelector(selector) {
    if (!selector)
        return undefined;
    if (selector.startsWith('0x'))
        return selector;
    return AbiItem.getSelector(selector);
}
function assertWitness(witness) {
    if (Hex.size(witness) !== 32)
        throw new InvalidWitnessSizeError(witness);
}
function isAbsent(value) {
    return value === undefined || value === '0x';
}
/** Thrown when a `witness` field is not exactly 32 bytes. */
export class InvalidWitnessSizeError extends Error {
    constructor(witness) {
        super(`Witness \`${witness}\` must be exactly 32 bytes (got ${Hex.size(witness)} bytes).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'KeyAuthorization.InvalidWitnessSizeError'
        });
    }
}
/** Thrown when a TIP-1049 admin marker has any value other than `0x01`. */
export class InvalidAdminMarkerError extends Error {
    constructor(marker) {
        super(`Admin marker \`${marker}\` is invalid; expected \`0x01\` (TIP-1049).`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'KeyAuthorization.InvalidAdminMarkerError'
        });
    }
}
//# sourceMappingURL=KeyAuthorization.js.map