"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidConfigError = exports.zeroSalt = exports.signatureTypeByte = exports.maxOwnerSignatureBytes = exports.maxOwners = void 0;
exports.assert = assert;
exports.from = from;
exports.fromTuple = fromTuple;
exports.getAddress = getAddress;
exports.getSignPayload = getSignPayload;
exports.toId = toId;
exports.toTuple = toTuple;
exports.validate = validate;
const Address = require("../core/Address.js");
const Errors = require("../core/Errors.js");
const Hash = require("../core/Hash.js");
const Hex = require("../core/Hex.js");
exports.maxOwners = 10;
exports.maxOwnerSignatureBytes = 2049;
exports.signatureTypeByte = '0x05';
exports.zeroSalt = `0x${'00'.repeat(32)}`;
const accountDomain = 'tempo:multisig:account';
const configDomain = 'tempo:multisig:config';
const signatureDomain = 'tempo:multisig:signature';
function assert(config) {
    const { salt, threshold, owners } = config;
    if (typeof salt !== 'undefined' && Hex.size(salt) !== 32)
        throw new InvalidConfigError({ reason: 'salt must be 32 bytes' });
    if (owners.length === 0)
        throw new InvalidConfigError({ reason: 'owners cannot be empty' });
    if (owners.length > exports.maxOwners)
        throw new InvalidConfigError({ reason: 'too many owners' });
    if (Number(threshold) < 1)
        throw new InvalidConfigError({ reason: 'threshold cannot be zero' });
    let totalWeight = 0;
    let previous;
    for (const owner of owners) {
        if (!Address.validate(owner.owner) || Hex.toBigInt(owner.owner) === 0n)
            throw new InvalidConfigError({ reason: 'owner cannot be zero' });
        if (Number(owner.weight) < 1)
            throw new InvalidConfigError({ reason: 'owner weight cannot be zero' });
        const current = Hex.toBigInt(owner.owner);
        if (typeof previous !== 'undefined' && previous >= current)
            throw new InvalidConfigError({
                reason: 'owners must be strictly ascending',
            });
        previous = current;
        totalWeight += Number(owner.weight);
    }
    if (totalWeight > 0xffffffff)
        throw new InvalidConfigError({
            reason: 'total owner weight exceeds u32 max',
        });
    if (Number(threshold) > totalWeight)
        throw new InvalidConfigError({
            reason: 'threshold exceeds total owner weight',
        });
}
function from(config) {
    const owners = [...config.owners].sort((a, b) => Hex.toBigInt(a.owner) < Hex.toBigInt(b.owner) ? -1 : 1);
    const normalized = {
        salt: config.salt ? Hex.padLeft(config.salt, 32) : exports.zeroSalt,
        threshold: config.threshold,
        owners,
    };
    assert(normalized);
    return normalized;
}
function fromTuple(tuple) {
    const [salt, threshold, owners] = tuple;
    return {
        salt: salt && salt !== '0x' ? Hex.padLeft(salt, 32) : exports.zeroSalt,
        threshold: threshold === '0x' ? 0 : Hex.toNumber(threshold),
        owners: owners.map((owner) => {
            const [ownerAddress, weight] = owner;
            return {
                owner: ownerAddress,
                weight: !weight || weight === '0x' ? 0 : Hex.toNumber(weight),
            };
        }),
    };
}
function getAddress(value) {
    const id = typeof value === 'object' && 'genesisConfigId' in value
        ? value.genesisConfigId
        : toId(value);
    const hash = Hash.keccak256(Hex.concat(Hex.fromString(accountDomain), id));
    return Address.from(Hex.slice(hash, 12, 32));
}
function getSignPayload(value) {
    const { payload } = value;
    const account = 'account' in value && value.account
        ? value.account
        : getAddress(value.genesisConfig);
    const genesisConfigId = 'genesisConfigId' in value && value.genesisConfigId
        ? value.genesisConfigId
        : toId(value.genesisConfig);
    return Hash.keccak256(Hex.concat(Hex.fromString(signatureDomain), Hex.from(payload), account, genesisConfigId));
}
function toId(config) {
    assert(config);
    const id = Hash.keccak256(Hex.concat(Hex.fromString(configDomain), Hex.padLeft(config.salt ?? exports.zeroSalt, 32), Hex.fromNumber(config.threshold, { size: 4 }), Hex.fromNumber(config.owners.length, { size: 4 }), ...config.owners.flatMap((owner) => [
        owner.owner,
        Hex.fromNumber(owner.weight, { size: 4 }),
    ])));
    if (Hex.toBigInt(id) === 0n)
        throw new InvalidConfigError({ reason: 'config ID cannot be zero' });
    return id;
}
function toTuple(config) {
    assert(config);
    const owners = config.owners.map((owner) => [owner.owner, Hex.fromNumber(owner.weight)]);
    const salt = config.salt ? Hex.padLeft(config.salt, 32) : exports.zeroSalt;
    return [salt, Hex.fromNumber(config.threshold), owners];
}
function validate(config) {
    try {
        assert(config);
        return true;
    }
    catch {
        return false;
    }
}
class InvalidConfigError extends Errors.BaseError {
    constructor({ reason }) {
        super(`Invalid native multisig config: ${reason}.`);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'MultisigConfig.InvalidConfigError'
        });
    }
}
exports.InvalidConfigError = InvalidConfigError;
//# sourceMappingURL=MultisigConfig.js.map