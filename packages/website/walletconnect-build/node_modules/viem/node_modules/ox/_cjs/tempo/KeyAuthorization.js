"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidAdminMarkerError = exports.InvalidWitnessSizeError = void 0;
exports.from = from;
exports.fromRpc = fromRpc;
exports.fromTuple = fromTuple;
exports.getSignPayload = getSignPayload;
exports.deserialize = deserialize;
exports.hash = hash;
exports.serialize = serialize;
exports.toRpc = toRpc;
exports.toTuple = toTuple;
const AbiItem = require("../core/AbiItem.js");
const Hash = require("../core/Hash.js");
const Hex = require("../core/Hex.js");
const Rlp = require("../core/Rlp.js");
const SignatureEnvelope = require("./SignatureEnvelope.js");
const TempoAddress = require("./TempoAddress.js");
function from(authorization, options = {}) {
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
function fromRpc(authorization) {
    const { allowedCalls, chainId, keyId, expiry, limits, keyType } = authorization;
    const witness = authorization.witness ?? undefined;
    const isAdmin = authorization.isAdmin ?? undefined;
    const account = authorization.account ?? undefined;
    const signature = SignatureEnvelope.fromRpc(authorization.signature);
    if (witness !== undefined)
        assertWitness(witness);
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
function fromTuple(tuple) {
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
            if (!Array.isArray(selectorRules) || selectorRules.length === 0)
                return [{ address }];
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
        if (rawIsAdmin !== '0x01')
            throw new InvalidAdminMarkerError(rawIsAdmin);
        return true;
    })();
    const account = isAbsent(rawAccount)
        ? undefined
        : rawAccount;
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
function getSignPayload(authorization) {
    return hash(authorization);
}
function deserialize(serialized) {
    const tuple = Rlp.toHex(serialized);
    return fromTuple(tuple);
}
function hash(authorization) {
    const [authorizationTuple] = toTuple(authorization);
    const serialized = Rlp.fromHex(authorizationTuple);
    return Hash.keccak256(serialized);
}
function serialize(authorization) {
    const tuple = toTuple(authorization);
    return Rlp.fromHex(tuple);
}
function toRpc(authorization) {
    const { address, scopes, chainId, expiry, limits, type, signature, witness, isAdmin, account, } = authorization;
    if (witness !== undefined)
        assertWitness(witness);
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
function toTuple(authorization) {
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
        if (limit.period && limit.period > 0)
            tuple.push(numberToHex(limit.period));
        return tuple;
    });
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
        { value: isAdmin ? '0x01' : undefined, placeholder: '0x' },
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
class InvalidWitnessSizeError extends Error {
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
exports.InvalidWitnessSizeError = InvalidWitnessSizeError;
class InvalidAdminMarkerError extends Error {
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
exports.InvalidAdminMarkerError = InvalidAdminMarkerError;
//# sourceMappingURL=KeyAuthorization.js.map