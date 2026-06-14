"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.burn = burn;
exports.burnSync = burnSync;
exports.claim = claim;
exports.claimSync = claimSync;
exports.get = get;
exports.getBlockedBalance = getBlockedBalance;
exports.set = set;
exports.setSync = setSync;
exports.validate = validate;
exports.watchBlocked = watchBlocked;
exports.watchBurned = watchBurned;
exports.watchClaimed = watchClaimed;
exports.watchUpdated = watchUpdated;
const parseAccount_js_1 = require("../../accounts/utils/parseAccount.js");
const readContract_js_1 = require("../../actions/public/readContract.js");
const watchContractEvent_js_1 = require("../../actions/public/watchContractEvent.js");
const writeContract_js_1 = require("../../actions/wallet/writeContract.js");
const writeContractSync_js_1 = require("../../actions/wallet/writeContractSync.js");
const address_js_1 = require("../../constants/address.js");
const parseEventLogs_js_1 = require("../../utils/abi/parseEventLogs.js");
const index_js_1 = require("../../utils/index.js");
const Abis = require("../Abis.js");
const Addresses = require("../Addresses.js");
const utils_js_1 = require("../internal/utils.js");
const policyTypes = ['whitelist', 'blacklist'];
const rejectAllPolicyId = 0n;
const allowAllPolicyId = 1n;
const blockedReasons = ['none', 'tokenFilter', 'receivePolicy'];
async function burn(client, parameters) {
    return burn.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (burn) {
    async function inner(action, client, parameters) {
        const { account = client.account, chain = client.chain, receipt, ...rest } = parameters;
        if (!account)
            throw new Error('`account` is required');
        const call = burn.call({ receipt });
        return action(client, {
            ...rest,
            account,
            chain,
            ...call,
        });
    }
    burn.inner = inner;
    function call(args) {
        const { receipt } = args;
        return (0, utils_js_1.defineCall)({
            address: Addresses.receivePolicyGuard,
            abi: Abis.receivePolicyGuard,
            functionName: 'burnBlockedReceipt',
            args: [receipt],
        });
    }
    burn.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.receivePolicyGuard,
            logs,
            eventName: 'ReceiptBurned',
            strict: true,
        });
        if (!log)
            throw new Error('`ReceiptBurned` event not found.');
        return log;
    }
    burn.extractEvent = extractEvent;
})(burn || (exports.burn = burn = {}));
async function burnSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await burn.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = burn.extractEvent(receipt.logs);
    return {
        ...args,
        receipt,
    };
}
async function claim(client, parameters) {
    return claim.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (claim) {
    async function inner(action, client, parameters) {
        const { account = client.account, chain = client.chain, to, receipt, ...rest } = parameters;
        if (!account)
            throw new Error('`account` is required');
        const call = claim.call({ to, receipt });
        return action(client, {
            ...rest,
            account,
            chain,
            ...call,
        });
    }
    claim.inner = inner;
    function call(args) {
        const { to, receipt } = args;
        return (0, utils_js_1.defineCall)({
            address: Addresses.receivePolicyGuard,
            abi: Abis.receivePolicyGuard,
            functionName: 'claim',
            args: [to, receipt],
        });
    }
    claim.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.receivePolicyGuard,
            logs,
            eventName: 'ReceiptClaimed',
            strict: true,
        });
        if (!log)
            throw new Error('`ReceiptClaimed` event not found.');
        return log;
    }
    claim.extractEvent = extractEvent;
})(claim || (exports.claim = claim = {}));
async function claimSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await claim.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = claim.extractEvent(receipt.logs);
    return {
        ...args,
        receipt,
    };
}
async function get(client, parameters) {
    const { account: account_ = client.account, ...rest } = parameters;
    if (!account_)
        throw new Error('`account` is required.');
    const account = (0, parseAccount_js_1.parseAccount)(account_);
    const [hasReceivePolicy, senderPolicyId, senderPolicyType, tokenPolicyId, tokenPolicyType, recoveryAuthority,] = await (0, readContract_js_1.readContract)(client, {
        ...rest,
        account: null,
        ...get.call({ account: account.address }),
    });
    return {
        hasReceivePolicy,
        senderPolicyId: toPolicyRef(senderPolicyId),
        senderPolicyType: policyTypes[senderPolicyType] ?? 'whitelist',
        tokenPolicyId: toPolicyRef(tokenPolicyId),
        tokenPolicyType: policyTypes[tokenPolicyType] ?? 'whitelist',
        claimer: toClaimer(recoveryAuthority, account.address),
        recoveryAuthority,
    };
}
(function (get) {
    function call(args) {
        const { account } = args;
        return (0, utils_js_1.defineCall)({
            address: Addresses.tip403Registry,
            abi: Abis.tip403Registry,
            functionName: 'receivePolicy',
            args: [account],
        });
    }
    get.call = call;
})(get || (exports.get = get = {}));
async function getBlockedBalance(client, parameters) {
    const { receipt, ...rest } = parameters;
    return (0, readContract_js_1.readContract)(client, {
        ...rest,
        ...getBlockedBalance.call({ receipt }),
    });
}
(function (getBlockedBalance) {
    function call(args) {
        const { receipt } = args;
        return (0, utils_js_1.defineCall)({
            address: Addresses.receivePolicyGuard,
            abi: Abis.receivePolicyGuard,
            functionName: 'balanceOf',
            args: [receipt],
        });
    }
    getBlockedBalance.call = call;
})(getBlockedBalance || (exports.getBlockedBalance = getBlockedBalance = {}));
async function set(client, parameters) {
    return set.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (set) {
    async function inner(action, client, parameters) {
        const { account = client.account, chain = client.chain, senderPolicyId = 'allow-all', tokenPolicyId = 'allow-all', claimer = 'sender', ...rest } = parameters;
        if (!account)
            throw new Error('`account` is required');
        const address = (0, parseAccount_js_1.parseAccount)(account).address;
        const recoveryAuthority = resolveClaimer(claimer, address);
        const call = set.call({
            senderPolicyId: resolvePolicyRef(senderPolicyId),
            tokenFilterId: resolvePolicyRef(tokenPolicyId),
            recoveryAuthority,
        });
        return action(client, {
            ...rest,
            account,
            chain,
            ...call,
        });
    }
    set.inner = inner;
    function call(args) {
        const { senderPolicyId, tokenFilterId, recoveryAuthority } = args;
        return (0, utils_js_1.defineCall)({
            address: Addresses.tip403Registry,
            abi: Abis.tip403Registry,
            functionName: 'setReceivePolicy',
            args: [senderPolicyId, tokenFilterId, recoveryAuthority],
        });
    }
    set.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.tip403Registry,
            logs,
            eventName: 'ReceivePolicyUpdated',
            strict: true,
        });
        if (!log)
            throw new Error('`ReceivePolicyUpdated` event not found.');
        return log;
    }
    set.extractEvent = extractEvent;
})(set || (exports.set = set = {}));
async function setSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await set.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { tokenFilterId, ...args } = set.extractEvent(receipt.logs).args;
    return {
        ...args,
        senderPolicyId: toPolicyRef(args.senderPolicyId),
        tokenPolicyId: toPolicyRef(tokenFilterId),
        claimer: toClaimer(args.recoveryAuthority, args.account),
        receipt,
    };
}
async function validate(client, parameters) {
    const { token, sender, receiver, ...rest } = parameters;
    const [authorized, blockedReason] = await (0, readContract_js_1.readContract)(client, {
        ...rest,
        ...validate.call({ token, sender, receiver }),
    });
    return {
        authorized,
        blockedReason: blockedReasons[blockedReason] ?? 'none',
    };
}
(function (validate) {
    function call(args) {
        const { token, sender, receiver } = args;
        return (0, utils_js_1.defineCall)({
            address: Addresses.tip403Registry,
            abi: Abis.tip403Registry,
            functionName: 'validateReceivePolicy',
            args: [token, sender, receiver],
        });
    }
    validate.call = call;
})(validate || (exports.validate = validate = {}));
function watchBlocked(client, parameters) {
    const { onBlocked, ...rest } = parameters;
    return (0, watchContractEvent_js_1.watchContractEvent)(client, {
        ...rest,
        address: Addresses.receivePolicyGuard,
        abi: Abis.receivePolicyGuard,
        eventName: 'TransferBlocked',
        onLogs: (logs) => {
            for (const log of logs) {
                const { receipt, ...args } = log.args;
                onBlocked({ ...args, claimReceipt: receipt }, log);
            }
        },
        strict: true,
    });
}
function watchBurned(client, parameters) {
    const { onBurned, ...rest } = parameters;
    return (0, watchContractEvent_js_1.watchContractEvent)(client, {
        ...rest,
        address: Addresses.receivePolicyGuard,
        abi: Abis.receivePolicyGuard,
        eventName: 'ReceiptBurned',
        onLogs: (logs) => {
            for (const log of logs)
                onBurned(log.args, log);
        },
        strict: true,
    });
}
function watchClaimed(client, parameters) {
    const { onClaimed, ...rest } = parameters;
    return (0, watchContractEvent_js_1.watchContractEvent)(client, {
        ...rest,
        address: Addresses.receivePolicyGuard,
        abi: Abis.receivePolicyGuard,
        eventName: 'ReceiptClaimed',
        onLogs: (logs) => {
            for (const log of logs)
                onClaimed(log.args, log);
        },
        strict: true,
    });
}
function watchUpdated(client, parameters) {
    const { onUpdated, ...rest } = parameters;
    return (0, watchContractEvent_js_1.watchContractEvent)(client, {
        ...rest,
        address: Addresses.tip403Registry,
        abi: Abis.tip403Registry,
        eventName: 'ReceivePolicyUpdated',
        onLogs: (logs) => {
            for (const log of logs) {
                const { tokenFilterId, ...args } = log.args;
                onUpdated({
                    ...args,
                    senderPolicyId: toPolicyRef(args.senderPolicyId),
                    tokenPolicyId: toPolicyRef(tokenFilterId),
                    claimer: toClaimer(args.recoveryAuthority, args.account),
                }, log);
            }
        },
        strict: true,
    });
}
function resolvePolicyRef(ref) {
    if (ref === 'reject-all')
        return rejectAllPolicyId;
    if (ref === 'allow-all')
        return allowAllPolicyId;
    return ref;
}
function toPolicyRef(id) {
    if (id === rejectAllPolicyId)
        return 'reject-all';
    if (id === allowAllPolicyId)
        return 'allow-all';
    return id;
}
function resolveClaimer(claimer, self) {
    if (claimer === 'sender')
        return address_js_1.zeroAddress;
    if (claimer === 'self')
        return self;
    return claimer;
}
function toClaimer(recoveryAuthority, account) {
    if (recoveryAuthority === address_js_1.zeroAddress)
        return 'sender';
    if ((0, index_js_1.isAddressEqual)(recoveryAuthority, account))
        return 'self';
    return recoveryAuthority;
}
//# sourceMappingURL=receivePolicy.js.map