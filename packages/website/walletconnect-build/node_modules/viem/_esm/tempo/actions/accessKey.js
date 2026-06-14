import { parseAccount } from '../../accounts/utils/parseAccount.js';
import { readContract } from '../../actions/public/readContract.js';
import { watchContractEvent } from '../../actions/public/watchContractEvent.js';
import { sendTransaction } from '../../actions/wallet/sendTransaction.js';
import { sendTransactionSync } from '../../actions/wallet/sendTransactionSync.js';
import { writeContract } from '../../actions/wallet/writeContract.js';
import { writeContractSync } from '../../actions/wallet/writeContractSync.js';
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js';
import * as Abis from '../Abis.js';
import { signKeyAuthorization } from '../Account.js';
import * as Addresses from '../Addresses.js';
import * as Hardfork from '../Hardfork.js';
import { defineCall } from '../internal/utils.js';
/** @internal */
const signatureTypes = {
    0: 'secp256k1',
    1: 'p256',
    2: 'webAuthn',
};
/** @internal */
const spendPolicies = {
    true: 'limited',
    false: 'unlimited',
};
/**
 * Authorizes an access key by signing a key authorization and sending a transaction.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, Account } from 'viem/tempo'
 * import { generatePrivateKey } from 'viem/accounts'
 *
 * const account = Account.from({ privateKey: '0x...' })
 * const client = createClient({
 *   account,
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const accessKey = Account.fromP256(generatePrivateKey(), {
 *   access: account,
 * })
 *
 * const hash = await Actions.accessKey.authorize(client, {
 *   accessKey,
 *   expiry: Math.floor((Date.now() + 30_000) / 1000),
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function authorize(client, parameters) {
    return authorize.inner(sendTransaction, client, parameters);
}
(function (authorize) {
    /** @internal */
    async function inner(action, client, parameters) {
        const { accessKey, admin, chainId = client.chain?.id, expiry, limits, scopes, witness, ...rest } = parameters;
        const account_ = rest.account ?? client.account;
        if (!account_)
            throw new Error('account is required.');
        if (!chainId)
            throw new Error('chainId is required.');
        const parsed = parseAccount(account_);
        const keyAuthorization = await signKeyAuthorization(parsed, {
            chainId: BigInt(chainId),
            key: accessKey,
            admin,
            expiry,
            limits,
            scopes,
            witness,
        });
        return (await action(client, {
            ...rest,
            keyAuthorization,
        }));
    }
    authorize.inner = inner;
    function extractEvent(logs) {
        const [log] = parseEventLogs({
            abi: Abis.accountKeychain,
            logs,
            eventName: 'KeyAuthorized',
            strict: true,
        });
        if (!log)
            throw new Error('`KeyAuthorized` event not found.');
        return log;
    }
    authorize.extractEvent = extractEvent;
})(authorize || (authorize = {}));
/**
 * Authorizes an access key and waits for the transaction receipt.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, Account } from 'viem/tempo'
 * import { generatePrivateKey } from 'viem/accounts'
 *
 * const account = Account.from({ privateKey: '0x...' })
 * const client = createClient({
 *   account,
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const accessKey = Account.fromP256(generatePrivateKey(), {
 *   access: account,
 * })
 *
 * const { receipt, ...result } = await Actions.accessKey.authorizeSync(client, {
 *   accessKey,
 *   expiry: Math.floor((Date.now() + 30_000) / 1000),
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function authorizeSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await authorize.inner(sendTransactionSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = authorize.extractEvent(receipt.logs);
    return {
        ...args,
        receipt,
    };
}
/**
 * Burns a key-authorization witness, invalidating any authorization bound to
 * it before it is submitted onchain.
 *
 * Once burned, an `authorizeKey` call carrying the same `witness` will revert.
 * This lets applications issue a signed authorization offchain (see
 * {@link authorize}) while retaining the ability to revoke it.
 *
 * [TIP-1053](https://tips.sh/1053)
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
 * const hash = await Actions.accessKey.burnWitness(client, {
 *   witness: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function burnWitness(client, parameters) {
    return burnWitness.inner(writeContract, client, parameters);
}
(function (burnWitness) {
    /** @internal */
    async function inner(action, client, parameters) {
        const { witness, ...rest } = parameters;
        const call = burnWitness.call({ witness });
        return (await action(client, {
            ...rest,
            ...call,
        }));
    }
    burnWitness.inner = inner;
    /**
     * Defines a call to the `burnKeyAuthorizationWitness` function.
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
     * const hash = await client.sendTransaction({
     *   calls: [
     *     Actions.accessKey.burnWitness.call({ witness: '0x...' }),
     *   ],
     * })
     * ```
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { witness } = args;
        return defineCall({
            address: Addresses.accountKeychain,
            abi: Abis.accountKeychain,
            functionName: 'burnKeyAuthorizationWitness',
            args: [witness],
        });
    }
    burnWitness.call = call;
    function extractEvent(logs) {
        const [log] = parseEventLogs({
            abi: Abis.accountKeychain,
            logs,
            eventName: 'KeyAuthorizationWitnessBurned',
            strict: true,
        });
        if (!log)
            throw new Error('`KeyAuthorizationWitnessBurned` event not found.');
        return log;
    }
    burnWitness.extractEvent = extractEvent;
})(burnWitness || (burnWitness = {}));
/**
 * Burns a key-authorization witness and waits for the transaction receipt.
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
 * const { receipt, ...result } = await Actions.accessKey.burnWitnessSync(client, {
 *   witness: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function burnWitnessSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await burnWitness.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = burnWitness.extractEvent(receipt.logs);
    return {
        ...args,
        receipt,
    };
}
/**
 * Gets access key information.
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
 * const key = await Actions.accessKey.getMetadata(client, {
 *   account: '0x...',
 *   accessKey: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The key information.
 */
export async function getMetadata(client, parameters) {
    const { account: account_ = client.account, accessKey, ...rest } = parameters;
    if (!account_)
        throw new Error('account is required.');
    const account = parseAccount(account_);
    const result = await readContract(client, {
        ...rest,
        account: null,
        ...getMetadata.call({ account: account.address, accessKey }),
    });
    return {
        address: result.keyId,
        keyType: signatureTypes[result.signatureType] ??
            'secp256k1',
        expiry: result.expiry,
        spendPolicy: spendPolicies[`${result.enforceLimits}`],
        isRevoked: result.isRevoked,
    };
}
(function (getMetadata) {
    /**
     * Defines a call to the `getKey` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { account, accessKey } = args;
        return defineCall({
            address: Addresses.accountKeychain,
            abi: Abis.accountKeychain,
            functionName: 'getKey',
            args: [account, resolveAccessKeyAddress(accessKey)],
        });
    }
    getMetadata.call = call;
})(getMetadata || (getMetadata = {}));
/**
 * Gets the remaining spending limit for a key-token pair.
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
 * const { remaining, periodEnd } = await Actions.accessKey.getRemainingLimit(client, {
 *   account: '0x...',
 *   accessKey: '0x...',
 *   token: '0x...',
 * })
 *
 * console.log(remaining, periodEnd)
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The remaining spending amount and period end timestamp.
 */
export async function getRemainingLimit(client, parameters) {
    const { account: account_ = client.account, accessKey, token, ...rest } = parameters;
    if (!account_)
        throw new Error('account is required.');
    const account = parseAccount(account_);
    // TODO: remove pre-t3 branch once mainnet is on t3.
    const hardfork = client.chain?.hardfork;
    if (hardfork && Hardfork.lt(hardfork, 't3')) {
        const remaining = await readContract(client, {
            ...rest,
            ...getRemainingLimit.call({ account: account.address, accessKey, token }),
        });
        return { remaining, periodEnd: undefined };
    }
    const [remaining, periodEnd] = await readContract(client, {
        ...rest,
        ...getRemainingLimit.callWithPeriod({
            account: account.address,
            accessKey,
            token,
        }),
    });
    return { remaining, periodEnd };
}
(function (getRemainingLimit) {
    /**
     * Defines a call to the `getRemainingLimit` function (pre-T3).
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { account, accessKey, token } = args;
        return defineCall({
            address: Addresses.accountKeychain,
            abi: Abis.accountKeychain,
            functionName: 'getRemainingLimit',
            args: [account, resolveAccessKeyAddress(accessKey), token],
        });
    }
    getRemainingLimit.call = call;
    /**
     * Defines a call to the `getRemainingLimitWithPeriod` function (T3+).
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function callWithPeriod(args) {
        const { account, accessKey, token } = args;
        return defineCall({
            address: Addresses.accountKeychain,
            abi: Abis.accountKeychain,
            functionName: 'getRemainingLimitWithPeriod',
            args: [account, resolveAccessKeyAddress(accessKey), token],
        });
    }
    getRemainingLimit.callWithPeriod = callWithPeriod;
})(getRemainingLimit || (getRemainingLimit = {}));
/**
 * Checks whether an access key is an admin key for an account.
 *
 * Returns `true` for the account's root key or for an active admin access key
 * (see {@link authorize} with `admin: true`).
 *
 * [TIP-1049](https://tips.sh/1049)
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
 * const isAdmin = await Actions.accessKey.isAdmin(client, {
 *   account: '0x...',
 *   accessKey: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the access key is an admin key.
 */
export async function isAdmin(client, parameters) {
    const { account: account_ = client.account, accessKey, ...rest } = parameters;
    if (!account_)
        throw new Error('account is required.');
    const account = parseAccount(account_);
    return readContract(client, {
        ...rest,
        account: null,
        ...isAdmin.call({ account: account.address, accessKey }),
    });
}
(function (isAdmin) {
    /**
     * Defines a call to the `isAdminKey` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { account, accessKey } = args;
        return defineCall({
            address: Addresses.accountKeychain,
            abi: Abis.accountKeychain,
            functionName: 'isAdminKey',
            args: [account, resolveAccessKeyAddress(accessKey)],
        });
    }
    isAdmin.call = call;
})(isAdmin || (isAdmin = {}));
/**
 * Checks whether a key-authorization witness has been burned for an account.
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
 * const isBurned = await Actions.accessKey.isWitnessBurned(client, {
 *   account: '0x...',
 *   witness: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the witness has been burned.
 */
export async function isWitnessBurned(client, parameters) {
    const { account: account_ = client.account, witness, ...rest } = parameters;
    if (!account_)
        throw new Error('account is required.');
    const account = parseAccount(account_);
    return readContract(client, {
        ...rest,
        account: null,
        ...isWitnessBurned.call({ account: account.address, witness }),
    });
}
(function (isWitnessBurned) {
    /**
     * Defines a call to the `isKeyAuthorizationWitnessBurned` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { account, witness } = args;
        return defineCall({
            address: Addresses.accountKeychain,
            abi: Abis.accountKeychain,
            functionName: 'isKeyAuthorizationWitnessBurned',
            args: [account, witness],
        });
    }
    isWitnessBurned.call = call;
})(isWitnessBurned || (isWitnessBurned = {}));
/**
 * Revokes an authorized access key.
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
 * const hash = await Actions.accessKey.revoke(client, {
 *   accessKey: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function revoke(client, parameters) {
    return revoke.inner(writeContract, client, parameters);
}
(function (revoke) {
    /** @internal */
    async function inner(action, client, parameters) {
        const { accessKey, ...rest } = parameters;
        const call = revoke.call({ accessKey });
        return (await action(client, {
            ...rest,
            ...call,
        }));
    }
    revoke.inner = inner;
    /**
     * Defines a call to the `revokeKey` function.
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
     * const hash = await client.sendTransaction({
     *   calls: [
     *     Actions.accessKey.revoke.call({ accessKey: '0x...' }),
     *   ],
     * })
     * ```
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { accessKey } = args;
        return defineCall({
            address: Addresses.accountKeychain,
            abi: Abis.accountKeychain,
            functionName: 'revokeKey',
            args: [resolveAccessKeyAddress(accessKey)],
        });
    }
    revoke.call = call;
    function extractEvent(logs) {
        const [log] = parseEventLogs({
            abi: Abis.accountKeychain,
            logs,
            eventName: 'KeyRevoked',
            strict: true,
        });
        if (!log)
            throw new Error('`KeyRevoked` event not found.');
        return log;
    }
    revoke.extractEvent = extractEvent;
})(revoke || (revoke = {}));
/**
 * Revokes an authorized access key and waits for the transaction receipt.
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
 * const result = await Actions.accessKey.revokeSync(client, {
 *   accessKey: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function revokeSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await revoke.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = revoke.extractEvent(receipt.logs);
    return {
        ...args,
        receipt,
    };
}
/**
 * Signs a key authorization for an access key.
 *
 * @example
 * ```ts
 * import { generatePrivateKey } from 'viem/accounts'
 * import { Account, Actions } from 'viem/tempo'
 *
 * const account = Account.from({ privateKey: '0x...' })
 * const accessKey = Account.fromP256(generatePrivateKey(), {
 *   access: account,
 * })
 *
 * const keyAuthorization = await Actions.accessKey.signAuthorization(
 *   client,
 *   {
 *     account,
 *     accessKey,
 *     expiry: Math.floor((Date.now() + 30_000) / 1000),
 *   },
 * )
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The signed key authorization.
 */
export async function signAuthorization(client, parameters) {
    const { accessKey, chainId = client.chain?.id, ...rest } = parameters;
    const account_ = rest.account ?? client.account;
    if (!account_)
        throw new Error('account is required.');
    if (!chainId)
        throw new Error('chainId is required.');
    const parsed = parseAccount(account_);
    return signKeyAuthorization(parsed, {
        chainId: BigInt(chainId),
        key: accessKey,
        ...rest,
    });
}
/**
 * Updates the spending limit for a specific token on an authorized access key.
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
 * const hash = await Actions.accessKey.updateLimit(client, {
 *   accessKey: '0x...',
 *   token: '0x...',
 *   limit: 1000000000000000000n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function updateLimit(client, parameters) {
    return updateLimit.inner(writeContract, client, parameters);
}
(function (updateLimit) {
    /** @internal */
    async function inner(action, client, parameters) {
        const { accessKey, token, limit, ...rest } = parameters;
        const call = updateLimit.call({ accessKey, token, limit });
        return (await action(client, {
            ...rest,
            ...call,
        }));
    }
    updateLimit.inner = inner;
    /**
     * Defines a call to the `updateSpendingLimit` function.
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
     * const hash = await client.sendTransaction({
     *   calls: [
     *     Actions.accessKey.updateLimit.call({
     *       accessKey: '0x...',
     *       token: '0x...',
     *       limit: 1000000000000000000n,
     *     }),
     *   ],
     * })
     * ```
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { accessKey, token, limit } = args;
        return defineCall({
            address: Addresses.accountKeychain,
            abi: Abis.accountKeychain,
            functionName: 'updateSpendingLimit',
            args: [resolveAccessKeyAddress(accessKey), token, limit],
        });
    }
    updateLimit.call = call;
    function extractEvent(logs) {
        const [log] = parseEventLogs({
            abi: Abis.accountKeychain,
            logs,
            eventName: 'SpendingLimitUpdated',
            strict: true,
        });
        if (!log)
            throw new Error('`SpendingLimitUpdated` event not found.');
        return log;
    }
    updateLimit.extractEvent = extractEvent;
})(updateLimit || (updateLimit = {}));
/**
 * Updates the spending limit and waits for the transaction receipt.
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
 * const result = await Actions.accessKey.updateLimitSync(client, {
 *   accessKey: '0x...',
 *   token: '0x...',
 *   limit: 1000000000000000000n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and event data.
 */
export async function updateLimitSync(client, parameters) {
    const { throwOnReceiptRevert = true, ...rest } = parameters;
    const receipt = await updateLimit.inner(writeContractSync, client, {
        ...rest,
        throwOnReceiptRevert,
    });
    const { args } = updateLimit.extractEvent(receipt.logs);
    return {
        account: args.account,
        publicKey: args.publicKey,
        token: args.token,
        limit: args.newLimit,
        receipt,
    };
}
/**
 * Watches for admin key authorization events.
 *
 * Emitted when an admin key is authorized (see {@link authorize} with
 * `admin: true`).
 *
 * [TIP-1049](https://tips.sh/1049)
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
 * const unwatch = Actions.accessKey.watchAdminAuthorized(client, {
 *   onAuthorized: (args, log) => {
 *     console.log('Admin key authorized:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchAdminAuthorized(client, parameters) {
    const { onAuthorized, ...rest } = parameters;
    return watchContractEvent(client, {
        ...rest,
        address: Addresses.accountKeychain,
        abi: Abis.accountKeychain,
        eventName: 'AdminKeyAuthorized',
        onLogs: (logs) => {
            for (const log of logs)
                onAuthorized(log.args, log);
        },
        strict: true,
    });
}
/**
 * Watches for key-authorization witness events.
 *
 * Emitted when a key is authorized with a `witness` (see {@link authorize}).
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
 * const unwatch = Actions.accessKey.watchWitness(client, {
 *   onWitness: (args, log) => {
 *     console.log('Witness used:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchWitness(client, parameters) {
    const { onWitness, ...rest } = parameters;
    return watchContractEvent(client, {
        ...rest,
        address: Addresses.accountKeychain,
        abi: Abis.accountKeychain,
        eventName: 'KeyAuthorizationWitness',
        onLogs: (logs) => {
            for (const log of logs)
                onWitness(log.args, log);
        },
        strict: true,
    });
}
/**
 * Watches for key-authorization witness burned events.
 *
 * Emitted when a witness is burned (see {@link burnWitness}).
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
 * const unwatch = Actions.accessKey.watchWitnessBurned(client, {
 *   onBurned: (args, log) => {
 *     console.log('Witness burned:', args)
 *   },
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns A function to unsubscribe from the event.
 */
export function watchWitnessBurned(client, parameters) {
    const { onBurned, ...rest } = parameters;
    return watchContractEvent(client, {
        ...rest,
        address: Addresses.accountKeychain,
        abi: Abis.accountKeychain,
        eventName: 'KeyAuthorizationWitnessBurned',
        onLogs: (logs) => {
            for (const log of logs)
                onBurned(log.args, log);
        },
        strict: true,
    });
}
/**
 * Verifies that a keychain signature was produced by an active access key
 * for the expected account.
 *
 * By default (`admin: true`), returns `true` only if the signature was
 * produced by the account's root key or an active admin access key. Set
 * `admin: false` to accept any active access key.
 *
 * Returns `false` for account mismatches, unknown, revoked, or expired
 * access keys. [TIP-1049](https://tips.sh/1049)
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
 * const valid = await Actions.accessKey.verifyHash(client, {
 *   account: '0x...',
 *   hash: '0x...',
 *   signature: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Whether the keychain signature is valid for the account.
 */
export async function verifyHash(client, parameters) {
    const { account, admin, hash, signature, ...rest } = parameters;
    return readContract(client, {
        ...rest,
        ...verifyHash.call({ account, admin, hash, signature }),
    });
}
(function (verifyHash) {
    /**
     * Defines a call to `verifyKeychain` or `verifyKeychainAdmin` on the
     * Signature Verifier precompile (controlled by `admin`).
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args) {
        const { account, admin = true, hash, signature } = args;
        return defineCall({
            address: Addresses.signatureVerifier,
            abi: Abis.signatureVerifier,
            functionName: admin ? 'verifyKeychainAdmin' : 'verifyKeychain',
            args: [account, hash, signature],
        });
    }
    verifyHash.call = call;
})(verifyHash || (verifyHash = {}));
/** @internal */
function resolveAccessKeyAddress(accessKey) {
    if (typeof accessKey === 'string')
        return accessKey;
    return accessKey.accessKeyAddress;
}
//# sourceMappingURL=accessKey.js.map