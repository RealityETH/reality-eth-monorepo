import * as AbiParameters from '../core/AbiParameters.js';
import * as Address from '../core/Address.js';
import * as Hash from '../core/Hash.js';
import * as Hex from '../core/Hex.js';
import * as TokenId from './TokenId.js';
const channelIdParameters = AbiParameters.from('address, address, address, address, bytes32, address, bytes32, address, uint256');
const domainSeparatorParameters = AbiParameters.from('bytes32, bytes32, bytes32, uint256, address');
const voucherHashParameters = AbiParameters.from('bytes32, bytes32, uint96');
const eip712DomainTypehash = Hash.keccak256(Hex.fromString('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'));
const nameHash = Hash.keccak256(Hex.fromString('TIP20 Channel Reserve'));
const versionHash = Hash.keccak256(Hex.fromString('1'));
const zeroAddress = '0x0000000000000000000000000000000000000000';
/**
 * TIP-20 channel reserve precompile address.
 */
export const address = '0x4d50500000000000000000000000000000000000';
/**
 * Delay between payer `requestClose` and `withdraw`, in seconds.
 */
export const closeGracePeriod = 900n;
/**
 * EIP-712 type hash for `Voucher(bytes32 channelId,uint96 cumulativeAmount)`.
 */
export const voucherTypehash = Hash.keccak256(Hex.fromString('Voucher(bytes32 channelId,uint96 cumulativeAmount)'));
/**
 * Instantiates a TIP-20 channel reserve descriptor.
 *
 * Accepts a TIP-20 token ID or address, and defaults `operator` and
 * `authorizedSigner` to the zero address.
 *
 * @example
 * ```ts twoslash
 * import { Channel } from 'ox/tempo'
 *
 * const channel = Channel.from({
 *   expiringNonceHash: '0x0000000000000000000000000000000000000000000000000000000000000002',
 *   payee: '0x2222222222222222222222222222222222222222',
 *   payer: '0x1111111111111111111111111111111111111111',
 *   salt: '0x0000000000000000000000000000000000000000000000000000000000000001',
 *   token: 1n,
 * })
 * ```
 *
 * @param value - The channel descriptor input.
 * @returns The normalized channel descriptor.
 */
export function from(value) {
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
/**
 * Computes the canonical TIP-20 channel id for a descriptor.
 *
 * Mirrors `computeChannelId` on the TIP-20 channel reserve precompile without
 * performing an RPC call.
 *
 * @example
 * ```ts twoslash
 * import { Channel } from 'ox/tempo'
 *
 * const channelId = Channel.computeId({
 *   authorizedSigner: '0x0000000000000000000000000000000000000000',
 *   expiringNonceHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
 *   operator: '0x0000000000000000000000000000000000000000',
 *   payee: '0x2222222222222222222222222222222222222222',
 *   payer: '0x1111111111111111111111111111111111111111',
 *   salt: '0x0000000000000000000000000000000000000000000000000000000000000001',
 *   token: 1n,
 * }, {
 *   chainId: 4217,
 * })
 * ```
 *
 * @param channel - Channel descriptor.
 * @param options - Options.
 * @returns The channel id.
 */
export function computeId(channel, options) {
    const channel_ = from(channel);
    return Hash.keccak256(AbiParameters.encode(channelIdParameters, [
        channel_.payer,
        channel_.payee,
        channel_.operator,
        channel_.token,
        channel_.salt,
        channel_.authorizedSigner,
        channel_.expiringNonceHash,
        address,
        BigInt(options.chainId),
    ]));
}
/**
 * Computes the EIP-712 domain separator for the TIP-20 channel reserve.
 *
 * Mirrors `domainSeparator` on the TIP-20 channel reserve precompile without
 * performing an RPC call.
 *
 * @example
 * ```ts twoslash
 * import { Channel } from 'ox/tempo'
 *
 * const separator = Channel.domainSeparator({ chainId: 4217 })
 * ```
 *
 * @param value - Chain id.
 * @returns The EIP-712 domain separator.
 */
export function domainSeparator(value) {
    return Hash.keccak256(AbiParameters.encode(domainSeparatorParameters, [
        eip712DomainTypehash,
        nameHash,
        versionHash,
        BigInt(value.chainId),
        address,
    ]));
}
/**
 * Computes the EIP-712 sign payload for a TIP-20 channel voucher.
 *
 * Mirrors `getVoucherDigest` on the TIP-20 channel reserve precompile without
 * performing an RPC call.
 *
 * @example
 * ```ts twoslash
 * import { Channel } from 'ox/tempo'
 *
 * const payload = Channel.getVoucherSignPayload({
 *   chainId: 4217,
 *   channelId: '0x0000000000000000000000000000000000000000000000000000000000000000',
 *   cumulativeAmount: 1n,
 * })
 * ```
 *
 * @param value - Voucher fields and chain id.
 * @returns The voucher sign payload.
 */
export function getVoucherSignPayload(value) {
    const voucherHash = Hash.keccak256(AbiParameters.encode(voucherHashParameters, [
        voucherTypehash,
        value.channelId,
        value.cumulativeAmount,
    ]));
    return Hash.keccak256(Hex.concat('0x1901', domainSeparator({ chainId: value.chainId }), voucherHash));
}
function resolveAddress(address) {
    return Address.from(address);
}
//# sourceMappingURL=Channel.js.map