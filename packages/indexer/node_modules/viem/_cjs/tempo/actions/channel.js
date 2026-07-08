"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = close;
exports.closeSync = closeSync;
exports.getStates = getStates;
exports.open = open;
exports.openSync = openSync;
exports.requestClose = requestClose;
exports.requestCloseSync = requestCloseSync;
exports.settle = settle;
exports.settleSync = settleSync;
exports.signVoucher = signVoucher;
exports.topUp = topUp;
exports.topUpSync = topUpSync;
exports.withdraw = withdraw;
exports.withdrawSync = withdrawSync;
const Address = require("ox/Address");
const Hex = require("ox/Hex");
const tempo_1 = require("ox/tempo");
const parseAccount_js_1 = require("../../accounts/utils/parseAccount.js");
const readContract_js_1 = require("../../actions/public/readContract.js");
const writeContract_js_1 = require("../../actions/wallet/writeContract.js");
const writeContractSync_js_1 = require("../../actions/wallet/writeContractSync.js");
const address_js_1 = require("../../constants/address.js");
const parseEventLogs_js_1 = require("../../utils/abi/parseEventLogs.js");
const Abis = require("../Abis.js");
const Account_js_1 = require("../Account.js");
const utils_js_1 = require("../internal/utils.js");
async function close(client, parameters) {
    return close.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (close) {
    async function inner(action, client, parameters) {
        const { captureAmount, cumulativeAmount, channel, signature, ...rest } = parameters;
        return (await action(client, {
            ...rest,
            ...close.call({
                captureAmount,
                cumulativeAmount,
                channel,
                signature,
            }),
        }));
    }
    close.inner = inner;
    function call(args) {
        const { captureAmount, cumulativeAmount, channel, signature } = args;
        return (0, utils_js_1.defineCall)({
            address: tempo_1.Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'close',
            args: [
                tempo_1.Channel.from(channel),
                cumulativeAmount,
                captureAmount,
                signature,
            ],
        });
    }
    close.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.tip20ChannelReserve,
            logs,
            eventName: 'ChannelClosed',
            strict: true,
        });
        if (!log)
            throw new Error('`ChannelClosed` event not found.');
        return log;
    }
    close.extractEvent = extractEvent;
})(close || (exports.close = close = {}));
async function closeSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await close.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = close.extractEvent(receipt.logs);
    return { ...args, receipt };
}
async function getStates(client, parameters) {
    const chainId = client.chain?.id;
    const { channel, ...rest } = parameters;
    return (0, readContract_js_1.readContract)(client, {
        ...rest,
        ...getStates.call({ channel, chainId }),
    });
}
(function (getStates) {
    function call(args) {
        const { channel, chainId } = args;
        if (Array.isArray(channel)) {
            const channelIds = channel.map((channel) => {
                if (typeof channel === 'string')
                    return channel;
                if (chainId === undefined)
                    throw new Error('`chainId` is required for channel inputs.');
                return tempo_1.Channel.computeId(channel, { chainId });
            });
            return (0, utils_js_1.defineCall)({
                address: tempo_1.Channel.address,
                abi: Abis.tip20ChannelReserve,
                args: [channelIds],
                functionName: 'getChannelStatesBatch',
            });
        }
        const channel_ = channel;
        if (typeof channel_ === 'string')
            return (0, utils_js_1.defineCall)({
                address: tempo_1.Channel.address,
                abi: Abis.tip20ChannelReserve,
                args: [channel_],
                functionName: 'getChannelState',
            });
        if (chainId === undefined)
            throw new Error('`chainId` is required for channel inputs.');
        return (0, utils_js_1.defineCall)({
            address: tempo_1.Channel.address,
            abi: Abis.tip20ChannelReserve,
            args: [tempo_1.Channel.computeId(channel_, { chainId })],
            functionName: 'getChannelState',
        });
    }
    getStates.call = call;
})(getStates || (exports.getStates = getStates = {}));
async function open(client, parameters) {
    return open.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (open) {
    async function inner(action, client, parameters) {
        const { authorizedSigner, deposit, operator, payee, salt, token, ...rest } = parameters;
        return (await action(client, {
            ...rest,
            ...open.call({
                authorizedSigner,
                deposit,
                operator,
                payee,
                salt,
                token,
            }),
        }));
    }
    open.inner = inner;
    function call(args) {
        const { authorizedSigner = address_js_1.zeroAddress, deposit, operator = address_js_1.zeroAddress, payee, salt = Hex.random(32), token, } = args;
        return (0, utils_js_1.defineCall)({
            address: tempo_1.Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'open',
            args: [
                Address.from(payee),
                Address.from(operator),
                tempo_1.TokenId.toAddress(token),
                deposit,
                salt,
                Address.from(authorizedSigner),
            ],
        });
    }
    open.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.tip20ChannelReserve,
            logs,
            eventName: 'ChannelOpened',
            strict: true,
        });
        if (!log)
            throw new Error('`ChannelOpened` event not found.');
        return log;
    }
    open.extractEvent = extractEvent;
})(open || (exports.open = open = {}));
async function openSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await open.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = open.extractEvent(receipt.logs);
    return { ...args, receipt };
}
async function requestClose(client, parameters) {
    return requestClose.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (requestClose) {
    async function inner(action, client, parameters) {
        const { channel, ...rest } = parameters;
        return (await action(client, {
            ...rest,
            ...requestClose.call({ channel }),
        }));
    }
    requestClose.inner = inner;
    function call(args) {
        const { channel } = args;
        return (0, utils_js_1.defineCall)({
            address: tempo_1.Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'requestClose',
            args: [tempo_1.Channel.from(channel)],
        });
    }
    requestClose.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.tip20ChannelReserve,
            logs,
            eventName: 'CloseRequested',
            strict: true,
        });
        if (!log)
            throw new Error('`CloseRequested` event not found.');
        return log;
    }
    requestClose.extractEvent = extractEvent;
})(requestClose || (exports.requestClose = requestClose = {}));
async function requestCloseSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await requestClose.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = requestClose.extractEvent(receipt.logs);
    return { ...args, receipt };
}
async function settle(client, parameters) {
    return settle.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (settle) {
    async function inner(action, client, parameters) {
        const { cumulativeAmount, channel, signature, ...rest } = parameters;
        return (await action(client, {
            ...rest,
            ...settle.call({ cumulativeAmount, channel, signature }),
        }));
    }
    settle.inner = inner;
    function call(args) {
        const { cumulativeAmount, channel, signature } = args;
        return (0, utils_js_1.defineCall)({
            address: tempo_1.Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'settle',
            args: [tempo_1.Channel.from(channel), cumulativeAmount, signature],
        });
    }
    settle.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.tip20ChannelReserve,
            logs,
            eventName: 'Settled',
            strict: true,
        });
        if (!log)
            throw new Error('`Settled` event not found.');
        return log;
    }
    settle.extractEvent = extractEvent;
})(settle || (exports.settle = settle = {}));
async function settleSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await settle.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = settle.extractEvent(receipt.logs);
    return { ...args, receipt };
}
async function signVoucher(client, parameters) {
    const { account: account_ = client.account, chainId = client.chain?.id, channel, cumulativeAmount, } = parameters;
    if (!account_)
        throw new Error('account is required.');
    if (chainId === undefined)
        throw new Error('chainId is required.');
    const parsed = (0, parseAccount_js_1.parseAccount)(account_);
    if (!('sign' in parsed) || !parsed.sign)
        throw new Error('account.sign is required.');
    return (0, Account_js_1.signVoucher)(parsed, {
        chainId,
        channel,
        cumulativeAmount,
    });
}
async function topUp(client, parameters) {
    return topUp.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (topUp) {
    async function inner(action, client, parameters) {
        const { additionalDeposit, channel, ...rest } = parameters;
        return (await action(client, {
            ...rest,
            ...topUp.call({ additionalDeposit, channel }),
        }));
    }
    topUp.inner = inner;
    function call(args) {
        const { additionalDeposit, channel } = args;
        return (0, utils_js_1.defineCall)({
            address: tempo_1.Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'topUp',
            args: [tempo_1.Channel.from(channel), additionalDeposit],
        });
    }
    topUp.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.tip20ChannelReserve,
            logs,
            eventName: 'TopUp',
            strict: true,
        });
        if (!log)
            throw new Error('`TopUp` event not found.');
        return log;
    }
    topUp.extractEvent = extractEvent;
})(topUp || (exports.topUp = topUp = {}));
async function topUpSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await topUp.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = topUp.extractEvent(receipt.logs);
    return { ...args, receipt };
}
async function withdraw(client, parameters) {
    return withdraw.inner(writeContract_js_1.writeContract, client, parameters);
}
(function (withdraw) {
    async function inner(action, client, parameters) {
        const { channel, ...rest } = parameters;
        return (await action(client, {
            ...rest,
            ...withdraw.call({ channel }),
        }));
    }
    withdraw.inner = inner;
    function call(args) {
        const { channel } = args;
        return (0, utils_js_1.defineCall)({
            address: tempo_1.Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'withdraw',
            args: [tempo_1.Channel.from(channel)],
        });
    }
    withdraw.call = call;
    function extractEvent(logs) {
        const [log] = (0, parseEventLogs_js_1.parseEventLogs)({
            abi: Abis.tip20ChannelReserve,
            logs,
            eventName: 'ChannelClosed',
            strict: true,
        });
        if (!log)
            throw new Error('`ChannelClosed` event not found.');
        return log;
    }
    withdraw.extractEvent = extractEvent;
})(withdraw || (exports.withdraw = withdraw = {}));
async function withdrawSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await withdraw.inner(writeContractSync_js_1.writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = withdraw.extractEvent(receipt.logs);
    return { ...args, receipt };
}
//# sourceMappingURL=channel.js.map