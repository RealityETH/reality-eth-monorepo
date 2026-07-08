import { VirtualAddress } from 'ox/tempo';
import { parseAccount } from '../../accounts/utils/parseAccount.js';
import { readContract } from '../../actions/public/readContract.js';
import { watchContractEvent } from '../../actions/public/watchContractEvent.js';
import { writeContract } from '../../actions/wallet/writeContract.js';
import { writeContractSync } from '../../actions/wallet/writeContractSync.js';
import { zeroAddress } from '../../constants/address.js';
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js';
import { isAddressEqual } from '../../utils/index.js';
import * as Abis from '../Abis.js';
import * as Addresses from '../Addresses.js';
import { defineCall } from '../internal/utils.js';
/** @internal */
const policyTypes = ['whitelist', 'blacklist'];
/** @internal Built-in TIP-403 policy id that rejects everything. */
const rejectAllPolicyId = 0n;
/** @internal Built-in TIP-403 policy id that allows everything. */
const allowAllPolicyId = 1n;
/** @internal */
const blockedReasons = ['none', 'tokenFilter', 'receivePolicy'];
/** @internal 12-byte prefix shared by TIP-20 token addresses. */
const tip20Prefix = '0x20c000000000000000000000';
/** @internal */
const systemPrecompiles = [
    Addresses.accountKeychain,
    Addresses.accountRegistrar,
    Addresses.addressRegistry,
    Addresses.feeManager,
    Addresses.nonceManager,
    Addresses.receivePolicyGuard,
    Addresses.signatureVerifier,
    Addresses.stablecoinDex,
    Addresses.tip20ChannelReserve,
    Addresses.tip20Factory,
    Addresses.tip403Registry,
    Addresses.validator,
];
/**
 * Burns the funds backing a blocked receipt.
 *
 * Requires the caller to hold the token's `BURN_BLOCKED_ROLE`, and is only
 * valid when the receipt's policy subject is currently unauthorized as a sender
 * under the token's TIP-403 policy.
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
 * const hash = await Actions.receivePolicy.burn(client, {
 *   receipt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function burn(client, parameters) {
    return burn.inner(writeContract, client, parameters);
}
(function (burn) {
    /** @internal */
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
    /**
     * Defines a call to the `burnBlockedReceipt` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { receipt } = args;
        return defineCall({
            address: Addresses.receivePolicyGuard,
            abi: Abis.receivePolicyGuard,
            functionName: 'burnBlockedReceipt',
            args: [receipt],
        });
    }
    burn.call = call;
    /**
     * Extracts the `ReceiptBurned` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ReceiptBurned` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(burn || (burn = {}));
/**
 * Burns the funds backing a blocked receipt and waits for the receipt.
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
 * const { receipt, ...result } = await Actions.receivePolicy.burnSync(client, {
 *   receipt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function burnSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await burn.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = burn.extractEvent(receipt.logs);
    return {
        ...args,
        receipt,
    };
}
/**
 * Claims blocked funds for a receipt, releasing them to a destination.
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
 * const hash = await Actions.receivePolicy.claim(client, {
 *   to: '0x...',
 *   receipt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function claim(client, parameters) {
    return claim.inner(writeContract, client, parameters);
}
(function (claim) {
    /** @internal */
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
    /**
     * Defines a call to the `claim` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { to, receipt } = args;
        return defineCall({
            address: Addresses.receivePolicyGuard,
            abi: Abis.receivePolicyGuard,
            functionName: 'claim',
            args: [to, receipt],
        });
    }
    claim.call = call;
    /**
     * Extracts the `ReceiptClaimed` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ReceiptClaimed` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(claim || (claim = {}));
/**
 * Claims blocked funds for a receipt and waits for the receipt.
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
 * const { receipt, ...result } = await Actions.receivePolicy.claimSync(client, {
 *   to: '0x...',
 *   receipt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function claimSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await claim.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = claim.extractEvent(receipt.logs);
    return {
        ...args,
        receipt,
    };
}
/**
 * Gets the receive policy configured for an account.
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
 * const policy = await Actions.receivePolicy.get(client, {
 *   account: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The receive policy.
 */
export async function get(client, parameters) {
    const { account: account_ = client.account, ...rest } = parameters;
    if (!account_)
        throw new Error('`account` is required.');
    const account = parseAccount(account_);
    const [hasReceivePolicy, senderPolicyId, senderPolicyType, tokenPolicyId, tokenPolicyType, recoveryAuthority,] = await readContract(client, {
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
    /**
     * Defines a call to the `receivePolicy` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { account } = args;
        return defineCall({
            address: Addresses.tip403Registry,
            abi: Abis.tip403Registry,
            functionName: 'receivePolicy',
            args: [account],
        });
    }
    get.call = call;
})(get || (get = {}));
/**
 * Gets the blocked balance for an encoded receipt.
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
 * const amount = await Actions.receivePolicy.getBlockedBalance(client, {
 *   receipt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The blocked amount for the receipt.
 */
export async function getBlockedBalance(client, parameters) {
    const { receipt, ...rest } = parameters;
    return readContract(client, {
        ...rest,
        ...getBlockedBalance.call({ receipt }),
    });
}
(function (getBlockedBalance) {
    /**
     * Defines a call to the `balanceOf` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { receipt } = args;
        return defineCall({
            address: Addresses.receivePolicyGuard,
            abi: Abis.receivePolicyGuard,
            functionName: 'balanceOf',
            args: [receipt],
        });
    }
    getBlockedBalance.call = call;
})(getBlockedBalance || (getBlockedBalance = {}));
/**
 * Sets the receive policy for the calling account.
 *
 * A receive policy controls which TIP-20 tokens and which senders an account
 * accepts. Inbound transfers and mints that violate the policy are not
 * reverted – instead the funds are redirected to the `ReceivePolicyGuard` and
 * can be reclaimed later (see {@link claim}).
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
 * const hash = await Actions.receivePolicy.set(client, {
 *   senderPolicyId: 'allow-all',
 *   tokenPolicyId: 'allow-all',
 *   claimer: 'self',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function set(client, parameters) {
    return set.inner(writeContract, client, parameters);
}
(function (set) {
    /** @internal */
    async function inner(action, client, parameters) {
        const { account = client.account, chain = client.chain, senderPolicyId = 'allow-all', tokenPolicyId = 'allow-all', claimer = 'sender', ...rest } = parameters;
        if (!account)
            throw new Error('`account` is required');
        const address = parseAccount(account).address;
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
    /**
     * Defines a call to the `setReceivePolicy` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { senderPolicyId, tokenFilterId, recoveryAuthority } = args;
        return defineCall({
            address: Addresses.tip403Registry,
            abi: Abis.tip403Registry,
            functionName: 'setReceivePolicy',
            args: [senderPolicyId, tokenFilterId, recoveryAuthority],
        });
    }
    set.call = call;
    /**
     * Extracts the `ReceivePolicyUpdated` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ReceivePolicyUpdated` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
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
})(set || (set = {}));
/**
 * Sets the receive policy for the calling account and waits for the receipt.
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
 * const { receipt, ...result } = await Actions.receivePolicy.setSync(client, {
 *   senderPolicyId: 'allow-all',
 *   tokenPolicyId: 'allow-all',
 *   claimer: 'self',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function setSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await set.inner(writeContractSync, client, {
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
/**
 * Checks whether a transfer or mint to a receiver is allowed by the receiver's
 * receive policy.
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
 * const { authorized, blockedReason } = await Actions.receivePolicy.validate(
 *   client,
 *   {
 *     token: '0x...',
 *     sender: '0x...',
 *     receiver: '0x...',
 *   },
 * )
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the transfer is authorized and, if not, why.
 */
export async function validate(client, parameters) {
    const { token, sender, receiver, ...rest } = parameters;
    const [authorized, blockedReason] = await readContract(client, {
        ...rest,
        ...validate.call({ token, sender, receiver }),
    });
    return {
        authorized,
        blockedReason: blockedReasons[blockedReason] ?? 'none',
    };
}
(function (validate) {
    /**
     * Defines a call to the `validateReceivePolicy` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { token, sender, receiver } = args;
        return defineCall({
            address: Addresses.tip403Registry,
            abi: Abis.tip403Registry,
            functionName: 'validateReceivePolicy',
            args: [token, sender, receiver],
        });
    }
    validate.call = call;
})(validate || (validate = {}));
/**
 * Watches for blocked transfer events.
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
 * const unwatch = Actions.receivePolicy.watchBlocked(client, {
 *   onBlocked: (args, log) => {
 *     console.log('Transfer blocked:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchBlocked(client, parameters) {
    const { onBlocked, ...rest } = parameters;
    return watchContractEvent(client, {
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
/**
 * Watches for receipt burned events.
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
 * const unwatch = Actions.receivePolicy.watchBurned(client, {
 *   onBurned: (args, log) => {
 *     console.log('Receipt burned:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchBurned(client, parameters) {
    const { onBurned, ...rest } = parameters;
    return watchContractEvent(client, {
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
/**
 * Watches for receipt claimed events.
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
 * const unwatch = Actions.receivePolicy.watchClaimed(client, {
 *   onClaimed: (args, log) => {
 *     console.log('Receipt claimed:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchClaimed(client, parameters) {
    const { onClaimed, ...rest } = parameters;
    return watchContractEvent(client, {
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
/**
 * Watches for receive policy update events.
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
 * const unwatch = Actions.receivePolicy.watchUpdated(client, {
 *   onUpdated: (args, log) => {
 *     console.log('Receive policy updated:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchUpdated(client, parameters) {
    const { onUpdated, ...rest } = parameters;
    return watchContractEvent(client, {
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
/** @internal */
function resolvePolicyRef(ref) {
    if (ref === 'reject-all')
        return rejectAllPolicyId;
    if (ref === 'allow-all')
        return allowAllPolicyId;
    return ref;
}
/** @internal */
function toPolicyRef(id) {
    if (id === rejectAllPolicyId)
        return 'reject-all';
    if (id === allowAllPolicyId)
        return 'allow-all';
    return id;
}
/** @internal */
function resolveClaimer(claimer, self) {
    const recoveryAuthority = claimer === 'sender' ? zeroAddress : claimer === 'self' ? self : claimer;
    assertValidRecoveryAuthority(recoveryAuthority);
    return recoveryAuthority;
}
/** @internal */
function assertValidRecoveryAuthority(recoveryAuthority) {
    if (isAddressEqual(recoveryAuthority, zeroAddress))
        return;
    if (VirtualAddress.isVirtual(recoveryAuthority))
        throw new Error('Recovery authority cannot be a TIP-1022 virtual address.');
    if (recoveryAuthority.toLowerCase().startsWith(tip20Prefix))
        throw new Error('Recovery authority cannot be a TIP-20 token address.');
    if (systemPrecompiles.some((address) => isAddressEqual(address, recoveryAuthority)))
        throw new Error('Recovery authority cannot be a Tempo system precompile.');
}
/** @internal */
function toClaimer(recoveryAuthority, account) {
    if (recoveryAuthority === zeroAddress)
        return 'sender';
    if (isAddressEqual(recoveryAuthority, account))
        return 'self';
    return recoveryAuthority;
}
//# sourceMappingURL=receivePolicy.js.map