import * as Address from 'ox/Address';
import * as Hex from 'ox/Hex';
import { Channel as ox_Channel, TokenId } from 'ox/tempo';
import { parseAccount } from '../../accounts/utils/parseAccount.js';
import { readContract } from '../../actions/public/readContract.js';
import { writeContract } from '../../actions/wallet/writeContract.js';
import { writeContractSync } from '../../actions/wallet/writeContractSync.js';
import { zeroAddress } from '../../constants/address.js';
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js';
import * as Abis from '../Abis.js';
import { signVoucher as signVoucher_ } from '../Account.js';
import { defineCall } from '../internal/utils.js';
/**
 * Closes a TIP-20 channel reserve channel from the payee or operator side.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const hash = await Actions.channel.close(client, {
 *   captureAmount: 100n,
 *   cumulativeAmount: 100n,
 *   channel,
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function close(client, parameters) {
    return close.inner(writeContract, client, parameters);
}
(function (close) {
    /** @internal */
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
    /**
     * Defines a call to the `close` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { captureAmount, cumulativeAmount, channel, signature } = args;
        return defineCall({
            address: ox_Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'close',
            args: [
                ox_Channel.from(channel),
                cumulativeAmount,
                captureAmount,
                signature,
            ],
        });
    }
    close.call = call;
    /**
     * Extracts the `ChannelClosed` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ChannelClosed` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(close || (close = {}));
/**
 * Closes a TIP-20 channel reserve channel and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const result = await Actions.channel.closeSync(client, {
 *   captureAmount: 100n,
 *   cumulativeAmount: 100n,
 *   channel,
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function closeSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await close.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = close.extractEvent(receipt.logs);
    return { ...args, receipt };
}
/**
 * Gets TIP-20 channel reserve state for a channel ID or channel.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const state = await Actions.channel.getStates(client, {
 *   channel: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Channel state for a single channel, or channel states for multiple channels.
 */
export async function getStates(client, parameters) {
    const chainId = client.chain?.id;
    const { channel, ...rest } = parameters;
    return readContract(client, {
        ...rest,
        ...getStates.call({ channel, chainId }),
    });
}
(function (getStates) {
    /**
     * Defines a call to the `getChannelState` or `getChannelStatesBatch` function.
     *
     * Can be passed as a parameter to:
     * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
     * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
     * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
     *
     * @example
     * ```ts
     * import { createClient, http, walletActions } from 'viem'
     * import { tempo } from 'viem/chains'
     * import { Actions } from 'viem/tempo'
     *
     * const client = createClient({
     *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
     *   transport: http(),
     * }).extend(walletActions)
     *
     * const calls = [Actions.channel.getStates.call({ channel: '0x...' })]
     * ```
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { channel, chainId } = args;
        if (Array.isArray(channel)) {
            const channelIds = channel.map((channel) => {
                if (typeof channel === 'string')
                    return channel;
                if (chainId === undefined)
                    throw new Error('`chainId` is required for channel inputs.');
                return ox_Channel.computeId(channel, { chainId });
            });
            return defineCall({
                address: ox_Channel.address,
                abi: Abis.tip20ChannelReserve,
                args: [channelIds],
                functionName: 'getChannelStatesBatch',
            });
        }
        const channel_ = channel;
        if (typeof channel_ === 'string')
            return defineCall({
                address: ox_Channel.address,
                abi: Abis.tip20ChannelReserve,
                args: [channel_],
                functionName: 'getChannelState',
            });
        if (chainId === undefined)
            throw new Error('`chainId` is required for channel inputs.');
        return defineCall({
            address: ox_Channel.address,
            abi: Abis.tip20ChannelReserve,
            args: [ox_Channel.computeId(channel_, { chainId })],
            functionName: 'getChannelState',
        });
    }
    getStates.call = call;
})(getStates || (getStates = {}));
/**
 * Opens and funds a TIP-20 channel reserve channel.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.channel.open(client, {
 *   deposit: 100n,
 *   payee: '0x...',
 *   token: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function open(client, parameters) {
    return open.inner(writeContract, client, parameters);
}
(function (open) {
    /** @internal */
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
    /**
     * Defines a call to the `open` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { authorizedSigner = zeroAddress, deposit, operator = zeroAddress, payee, salt = Hex.random(32), token, } = args;
        return defineCall({
            address: ox_Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'open',
            args: [
                Address.from(payee),
                Address.from(operator),
                TokenId.toAddress(token),
                deposit,
                salt,
                Address.from(authorizedSigner),
            ],
        });
    }
    open.call = call;
    /**
     * Extracts the `ChannelOpened` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ChannelOpened` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(open || (open = {}));
/**
 * Opens and funds a TIP-20 channel reserve channel and waits for the
 * transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const result = await Actions.channel.openSync(client, {
 *   deposit: 100n,
 *   payee: '0x...',
 *   token: 1n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function openSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await open.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = open.extractEvent(receipt.logs);
    return { ...args, receipt };
}
/**
 * Starts the payer close timer for a TIP-20 channel reserve channel.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const hash = await Actions.channel.requestClose(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function requestClose(client, parameters) {
    return requestClose.inner(writeContract, client, parameters);
}
(function (requestClose) {
    /** @internal */
    async function inner(action, client, parameters) {
        const { channel, ...rest } = parameters;
        return (await action(client, {
            ...rest,
            ...requestClose.call({ channel }),
        }));
    }
    requestClose.inner = inner;
    /**
     * Defines a call to the `requestClose` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { channel } = args;
        return defineCall({
            address: ox_Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'requestClose',
            args: [ox_Channel.from(channel)],
        });
    }
    requestClose.call = call;
    /**
     * Extracts the `CloseRequested` event from logs.
     *
     * @param logs - The logs.
     * @returns The `CloseRequested` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(requestClose || (requestClose = {}));
/**
 * Starts the payer close timer and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const result = await Actions.channel.requestCloseSync(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function requestCloseSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await requestClose.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = requestClose.extractEvent(receipt.logs);
    return { ...args, receipt };
}
/**
 * Settles a TIP-20 channel reserve voucher.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const hash = await Actions.channel.settle(client, {
 *   cumulativeAmount: 100n,
 *   channel,
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function settle(client, parameters) {
    return settle.inner(writeContract, client, parameters);
}
(function (settle) {
    /** @internal */
    async function inner(action, client, parameters) {
        const { cumulativeAmount, channel, signature, ...rest } = parameters;
        return (await action(client, {
            ...rest,
            ...settle.call({ cumulativeAmount, channel, signature }),
        }));
    }
    settle.inner = inner;
    /**
     * Defines a call to the `settle` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { cumulativeAmount, channel, signature } = args;
        return defineCall({
            address: ox_Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'settle',
            args: [ox_Channel.from(channel), cumulativeAmount, signature],
        });
    }
    settle.call = call;
    /**
     * Extracts the `Settled` event from logs.
     *
     * @param logs - The logs.
     * @returns The `Settled` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(settle || (settle = {}));
/**
 * Settles a TIP-20 channel reserve voucher and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const result = await Actions.channel.settleSync(client, {
 *   cumulativeAmount: 100n,
 *   channel,
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function settleSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await settle.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = settle.extractEvent(receipt.logs);
    return { ...args, receipt };
}
/**
 * Signs a TIP-20 channel reserve voucher.
 *
 * @example
 * ```ts
 * import { parseUnits } from 'viem'
 * import { Actions } from 'viem/tempo'
 *
 * const signature = await Actions.channel.signVoucher(client, {
 *   channel,
 *   cumulativeAmount: parseUnits('40', 6),
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The voucher signature.
 */
export async function signVoucher(client, parameters) {
    const { account: account_ = client.account, chainId = client.chain?.id, channel, cumulativeAmount, } = parameters;
    if (!account_)
        throw new Error('account is required.');
    if (chainId === undefined)
        throw new Error('chainId is required.');
    const parsed = parseAccount(account_);
    if (!('sign' in parsed) || !parsed.sign)
        throw new Error('account.sign is required.');
    return signVoucher_(parsed, {
        chainId,
        channel,
        cumulativeAmount,
    });
}
/**
 * Adds deposit to a TIP-20 channel reserve channel.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const hash = await Actions.channel.topUp(client, {
 *   additionalDeposit: 100n,
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function topUp(client, parameters) {
    return topUp.inner(writeContract, client, parameters);
}
(function (topUp) {
    /** @internal */
    async function inner(action, client, parameters) {
        const { additionalDeposit, channel, ...rest } = parameters;
        return (await action(client, {
            ...rest,
            ...topUp.call({ additionalDeposit, channel }),
        }));
    }
    topUp.inner = inner;
    /**
     * Defines a call to the `topUp` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { additionalDeposit, channel } = args;
        return defineCall({
            address: ox_Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'topUp',
            args: [ox_Channel.from(channel), additionalDeposit],
        });
    }
    topUp.call = call;
    /**
     * Extracts the `TopUp` event from logs.
     *
     * @param logs - The logs.
     * @returns The `TopUp` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(topUp || (topUp = {}));
/**
 * Adds deposit to a TIP-20 channel reserve channel and waits for the
 * transaction receipt.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const result = await Actions.channel.topUpSync(client, {
 *   additionalDeposit: 100n,
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function topUpSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await topUp.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = topUp.extractEvent(receipt.logs);
    return { ...args, receipt };
}
/**
 * Withdraws payer funds after the close grace period elapses.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const hash = await Actions.channel.withdraw(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function withdraw(client, parameters) {
    return withdraw.inner(writeContract, client, parameters);
}
(function (withdraw) {
    /** @internal */
    async function inner(action, client, parameters) {
        const { channel, ...rest } = parameters;
        return (await action(client, {
            ...rest,
            ...withdraw.call({ channel }),
        }));
    }
    withdraw.inner = inner;
    /**
     * Defines a call to the `withdraw` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { channel } = args;
        return defineCall({
            address: ox_Channel.address,
            abi: Abis.tip20ChannelReserve,
            functionName: 'withdraw',
            args: [ox_Channel.from(channel)],
        });
    }
    withdraw.call = call;
    /**
     * Extracts the `ChannelClosed` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ChannelClosed` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(withdraw || (withdraw = {}));
/**
 * Withdraws payer funds after the close grace period elapses and waits for the
 * transaction receipt.
 *
 * @example
 * ```ts
 * import { Actions } from 'viem/tempo'
 *
 * const result = await Actions.channel.withdrawSync(client, {
 *   channel,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function withdrawSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await withdraw.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = withdraw.extractEvent(receipt.logs);
    return { ...args, receipt };
}
//# sourceMappingURL=channel.js.map