"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = decode;
exports.encode = encode;
exports.from = from;
exports.fromLog = fromLog;
exports.fromTransactionReceipt = fromTransactionReceipt;
const AbiEvent = require("../core/AbiEvent.js");
const AbiParameters = require("../core/AbiParameters.js");
const blockedReasons = ['none', 'tokenFilter', 'receivePolicy'];
const kinds = ['transfer', 'mint'];
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
const transferBlocked = AbiEvent.from('event TransferBlocked(address indexed token, address indexed receiver, uint64 indexed blockedNonce, uint256 amount, uint8 receiptVersion, bytes receipt)');
function decode(receipt) {
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
function encode(decoded) {
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
function from(value) {
    if (typeof value === 'string')
        return value;
    return encode(value);
}
function fromLog(log) {
    const { receipt } = AbiEvent.decode(transferBlocked, log);
    return receipt;
}
function fromTransactionReceipt(receipt) {
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