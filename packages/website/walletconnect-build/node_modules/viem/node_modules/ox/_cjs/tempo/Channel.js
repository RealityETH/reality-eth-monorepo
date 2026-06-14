"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voucherTypehash = exports.closeGracePeriod = exports.address = void 0;
exports.from = from;
exports.computeId = computeId;
exports.domainSeparator = domainSeparator;
exports.getVoucherSignPayload = getVoucherSignPayload;
const AbiParameters = require("../core/AbiParameters.js");
const Address = require("../core/Address.js");
const Hash = require("../core/Hash.js");
const Hex = require("../core/Hex.js");
const TokenId = require("./TokenId.js");
const channelIdParameters = AbiParameters.from('address, address, address, address, bytes32, address, bytes32, address, uint256');
const domainSeparatorParameters = AbiParameters.from('bytes32, bytes32, bytes32, uint256, address');
const voucherHashParameters = AbiParameters.from('bytes32, bytes32, uint96');
const eip712DomainTypehash = Hash.keccak256(Hex.fromString('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'));
const nameHash = Hash.keccak256(Hex.fromString('TIP20 Channel Reserve'));
const versionHash = Hash.keccak256(Hex.fromString('1'));
const zeroAddress = '0x0000000000000000000000000000000000000000';
exports.address = '0x4d50500000000000000000000000000000000000';
exports.closeGracePeriod = 900n;
exports.voucherTypehash = Hash.keccak256(Hex.fromString('Voucher(bytes32 channelId,uint96 cumulativeAmount)'));
function from(value) {
    const { authorizedSigner = zeroAddress, expiringNonceHash, operator = zeroAddress, payee, payer, salt, token, } = value;
    return {
        authorizedSigner: resolveAddress(authorizedSigner),
        expiringNonceHash,
        operator: resolveAddress(operator),
        payee: resolveAddress(payee),
        payer: resolveAddress(payer),
        salt,
        token: typeof token === 'string'
            ? resolveAddress(token)
            : TokenId.toAddress(token),
    };
}
function computeId(channel, options) {
    const channel_ = from(channel);
    return Hash.keccak256(AbiParameters.encode(channelIdParameters, [
        channel_.payer,
        channel_.payee,
        channel_.operator,
        channel_.token,
        channel_.salt,
        channel_.authorizedSigner,
        channel_.expiringNonceHash,
        exports.address,
        BigInt(options.chainId),
    ]));
}
function domainSeparator(value) {
    return Hash.keccak256(AbiParameters.encode(domainSeparatorParameters, [
        eip712DomainTypehash,
        nameHash,
        versionHash,
        BigInt(value.chainId),
        exports.address,
    ]));
}
function getVoucherSignPayload(value) {
    const voucherHash = Hash.keccak256(AbiParameters.encode(voucherHashParameters, [
        exports.voucherTypehash,
        value.channelId,
        value.cumulativeAmount,
    ]));
    return Hash.keccak256(Hex.concat('0x1901', domainSeparator({ chainId: value.chainId }), voucherHash));
}
function resolveAddress(address) {
    return Address.from(address);
}
//# sourceMappingURL=Channel.js.map