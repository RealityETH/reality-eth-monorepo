import type { Address } from 'abitype';
import type { ReceivePolicyReceipt } from 'ox/tempo';
import type { Account } from '../../accounts/types.js';
import type { ReadContractReturnType } from '../../actions/public/readContract.js';
import type { WatchContractEventParameters } from '../../actions/public/watchContractEvent.js';
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js';
import { writeContract } from '../../actions/wallet/writeContract.js';
import { writeContractSync } from '../../actions/wallet/writeContractSync.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import type { BaseErrorType } from '../../errors/base.js';
import type { Chain } from '../../types/chain.js';
import type { ExtractAbiItem, GetEventArgs } from '../../types/contract.js';
import type { Log, Log as viem_Log } from '../../types/log.js';
import type { Hex } from '../../types/misc.js';
import type { Compute, UnionOmit } from '../../types/utils.js';
import * as Abis from '../Abis.js';
import type { GetAccountParameter, ReadParameters, WriteParameters } from '../internal/types.js';
import type { TransactionReceipt } from '../Transaction.js';
/** TIP-403 policy type. */
export type PolicyType = 'whitelist' | 'blacklist';
/**
 * Reference to a TIP-403 policy.
 *
 * - `'reject-all'` – built-in policy that rejects everything (id `0`).
 * - `'allow-all'` – built-in policy that allows everything (id `1`).
 * - `bigint` – a custom policy id (`>= 2`), e.g. one returned by
 *   {@link policy.create}.
 */
export type PolicyRef = 'reject-all' | 'allow-all' | bigint;
/** Reason an inbound transfer or mint was blocked by a receive policy. */
export type BlockedReason = ReceivePolicyReceipt.BlockedReason;
/**
 * Claimer authorized to reclaim blocked funds.
 *
 * - `'sender'` – the originator of the funds may reclaim them (default).
 * - `'self'` – the account configuring the policy may reclaim them.
 * - `Address` – a delegated third party may reclaim them.
 */
export type Claimer = 'sender' | 'self' | Address;
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
export declare function burn<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: burn.Parameters<chain, account>): Promise<burn.ReturnValue>;
export declare namespace burn {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** The encoded claim receipt (witness from a `TransferBlocked` event). */
        receipt: Hex;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
    /**
     * Defines a call to the `burnBlockedReceipt` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "burnBlockedReceipt";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "bytes";
                readonly name: "receipt";
            }];
            readonly outputs: readonly [];
        }];
        functionName: "burnBlockedReceipt";
    } & {
        args: readonly [`0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
    /**
     * Extracts the `ReceiptBurned` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ReceiptBurned` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "balanceOf";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes";
            readonly name: "receipt";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "claim";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "bytes";
            readonly name: "receipt";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "burnBlockedReceipt";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes";
            readonly name: "receipt";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "TransferBlocked";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "receiver";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "blockedNonce";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "uint8";
            readonly name: "receiptVersion";
        }, {
            readonly type: "bytes";
            readonly name: "receipt";
        }];
    }, {
        readonly name: "ReceiptClaimed";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "receiver";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "blockedNonce";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "blockedAt";
        }, {
            readonly type: "uint8";
            readonly name: "receiptVersion";
        }, {
            readonly type: "address";
            readonly name: "originator";
        }, {
            readonly type: "address";
            readonly name: "recipient";
        }, {
            readonly type: "address";
            readonly name: "recoveryAuthority";
        }, {
            readonly type: "address";
            readonly name: "caller";
        }, {
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "ReceiptBurned";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "receiver";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "blockedNonce";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "blockedAt";
        }, {
            readonly type: "uint8";
            readonly name: "receiptVersion";
        }, {
            readonly type: "address";
            readonly name: "originator";
        }, {
            readonly type: "address";
            readonly name: "recipient";
        }, {
            readonly type: "address";
            readonly name: "recoveryAuthority";
        }, {
            readonly type: "address";
            readonly name: "caller";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "InvalidReceipt";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidClaimAddress";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "UnauthorizedClaimer";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AddressReserved";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "ReceiptBurned">;
}
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
export declare function burnSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: burnSync.Parameters<chain, account>): Promise<burnSync.ReturnValue>;
export declare namespace burnSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = burn.Parameters<chain, account>;
    type Args = burn.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.receivePolicyGuard, 'ReceiptBurned', {
        IndexedOnly: false;
        Required: true;
    }> & {
        receipt: TransactionReceipt;
    }>;
    type ErrorType = BaseErrorType;
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
export declare function claim<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: claim.Parameters<chain, account>): Promise<claim.ReturnValue>;
export declare namespace claim {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** Destination to release the blocked funds to. */
        to: Address;
        /** The encoded claim receipt (witness from a `TransferBlocked` event). */
        receipt: Hex;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
    /**
     * Defines a call to the `claim` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "claim";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "to";
            }, {
                readonly type: "bytes";
                readonly name: "receipt";
            }];
            readonly outputs: readonly [];
        }];
        functionName: "claim";
    } & {
        args: readonly [to: `0x${string}`, `0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
    /**
     * Extracts the `ReceiptClaimed` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ReceiptClaimed` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "balanceOf";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes";
            readonly name: "receipt";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "claim";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "bytes";
            readonly name: "receipt";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "burnBlockedReceipt";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes";
            readonly name: "receipt";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "TransferBlocked";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "receiver";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "blockedNonce";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "uint8";
            readonly name: "receiptVersion";
        }, {
            readonly type: "bytes";
            readonly name: "receipt";
        }];
    }, {
        readonly name: "ReceiptClaimed";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "receiver";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "blockedNonce";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "blockedAt";
        }, {
            readonly type: "uint8";
            readonly name: "receiptVersion";
        }, {
            readonly type: "address";
            readonly name: "originator";
        }, {
            readonly type: "address";
            readonly name: "recipient";
        }, {
            readonly type: "address";
            readonly name: "recoveryAuthority";
        }, {
            readonly type: "address";
            readonly name: "caller";
        }, {
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "ReceiptBurned";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "receiver";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "blockedNonce";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "blockedAt";
        }, {
            readonly type: "uint8";
            readonly name: "receiptVersion";
        }, {
            readonly type: "address";
            readonly name: "originator";
        }, {
            readonly type: "address";
            readonly name: "recipient";
        }, {
            readonly type: "address";
            readonly name: "recoveryAuthority";
        }, {
            readonly type: "address";
            readonly name: "caller";
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }];
    }, {
        readonly name: "InvalidReceipt";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidClaimAddress";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "UnauthorizedClaimer";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AddressReserved";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "ReceiptClaimed">;
}
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
export declare function claimSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: claimSync.Parameters<chain, account>): Promise<claimSync.ReturnValue>;
export declare namespace claimSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = claim.Parameters<chain, account>;
    type Args = claim.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.receivePolicyGuard, 'ReceiptClaimed', {
        IndexedOnly: false;
        Required: true;
    }> & {
        receipt: TransactionReceipt;
    }>;
    type ErrorType = BaseErrorType;
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
export declare function get<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: get.Parameters<account>): Promise<get.ReturnValue>;
export declare namespace get {
    type Parameters<account extends Account | undefined = Account | undefined> = ReadParameters & GetAccountParameter<account>;
    type Args = {
        /** Account address. */
        account: Address;
    };
    type ReturnValue = Compute<{
        /** Whether the account has a receive policy configured. */
        hasReceivePolicy: boolean;
        /** TIP-403 policy restricting which senders are allowed. */
        senderPolicyId: PolicyRef;
        /** Type of the sender policy. */
        senderPolicyType: PolicyType;
        /** TIP-403 policy restricting which tokens are allowed. */
        tokenPolicyId: PolicyRef;
        /** Type of the token policy. */
        tokenPolicyType: PolicyType;
        /** Who can reclaim funds blocked by this policy. */
        claimer: Claimer;
        /** Raw recovery authority address. */
        recoveryAuthority: Address;
    }>;
    /**
     * Defines a call to the `receivePolicy` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "receivePolicy";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "account";
            }];
            readonly outputs: readonly [{
                readonly type: "bool";
                readonly name: "hasReceivePolicy";
            }, {
                readonly type: "uint64";
                readonly name: "senderPolicyId";
            }, {
                readonly type: "uint8";
                readonly name: "senderPolicyType";
            }, {
                readonly type: "uint64";
                readonly name: "tokenFilterId";
            }, {
                readonly type: "uint8";
                readonly name: "tokenFilterType";
            }, {
                readonly type: "address";
                readonly name: "recoveryAuthority";
            }];
        }];
        functionName: "receivePolicy";
    } & {
        args: readonly [account: `0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
}
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
export declare function getBlockedBalance<chain extends Chain | undefined>(client: Client<Transport, chain>, parameters: getBlockedBalance.Parameters): Promise<getBlockedBalance.ReturnValue>;
export declare namespace getBlockedBalance {
    type Parameters = ReadParameters & Args;
    type Args = {
        /** The encoded claim receipt. */
        receipt: Hex;
    };
    type ReturnValue = ReadContractReturnType<typeof Abis.receivePolicyGuard, 'balanceOf', never>;
    /**
     * Defines a call to the `balanceOf` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "balanceOf";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "bytes";
                readonly name: "receipt";
            }];
            readonly outputs: readonly [{
                readonly type: "uint256";
                readonly name: "amount";
            }];
        }];
        functionName: "balanceOf";
    } & {
        args: readonly [`0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
}
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
export declare function set<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: set.Parameters<chain, account>): Promise<set.ReturnValue>;
export declare namespace set {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Omit<Args, 'recoveryAuthority'>;
    type Args = {
        /**
         * TIP-403 policy restricting which senders are allowed.
         * @default 'allow-all'
         */
        senderPolicyId?: PolicyRef | undefined;
        /**
         * TIP-403 policy restricting which tokens are allowed.
         * @default 'allow-all'
         */
        tokenPolicyId?: PolicyRef | undefined;
        /**
         * Who can reclaim funds blocked by this policy.
         * @default 'sender'
         */
        claimer?: Claimer | undefined;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
    /**
     * Defines a call to the `setReceivePolicy` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: {
        /** Resolved TIP-403 sender policy id. */
        senderPolicyId: bigint;
        /** Resolved TIP-403 token filter id. */
        tokenFilterId: bigint;
        /** Resolved recovery authority. */
        recoveryAuthority: Address;
    }): {
        abi: [{
            readonly name: "setReceivePolicy";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "uint64";
                readonly name: "senderPolicyId";
            }, {
                readonly type: "uint64";
                readonly name: "tokenFilterId";
            }, {
                readonly type: "address";
                readonly name: "recoveryAuthority";
            }];
            readonly outputs: readonly [];
        }];
        functionName: "setReceivePolicy";
    } & {
        args: readonly [bigint, bigint, `0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
    /**
     * Extracts the `ReceivePolicyUpdated` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ReceivePolicyUpdated` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "policyIdCounter";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "policyExists";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "policyData";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
        }];
        readonly outputs: readonly [{
            readonly type: "uint8";
            readonly name: "policyType";
        }, {
            readonly type: "address";
            readonly name: "admin";
        }];
    }, {
        readonly name: "isAuthorized";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
        }, {
            readonly type: "address";
            readonly name: "user";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "isAuthorizedSender";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
        }, {
            readonly type: "address";
            readonly name: "user";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "isAuthorizedRecipient";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
        }, {
            readonly type: "address";
            readonly name: "user";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "isAuthorizedMintRecipient";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
        }, {
            readonly type: "address";
            readonly name: "user";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "compoundPolicyData";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
        }];
        readonly outputs: readonly [{
            readonly type: "uint64";
            readonly name: "senderPolicyId";
        }, {
            readonly type: "uint64";
            readonly name: "recipientPolicyId";
        }, {
            readonly type: "uint64";
            readonly name: "mintRecipientPolicyId";
        }];
    }, {
        readonly name: "receivePolicy";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
            readonly name: "hasReceivePolicy";
        }, {
            readonly type: "uint64";
            readonly name: "senderPolicyId";
        }, {
            readonly type: "uint8";
            readonly name: "senderPolicyType";
        }, {
            readonly type: "uint64";
            readonly name: "tokenFilterId";
        }, {
            readonly type: "uint8";
            readonly name: "tokenFilterType";
        }, {
            readonly type: "address";
            readonly name: "recoveryAuthority";
        }];
    }, {
        readonly name: "validateReceivePolicy";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "address";
            readonly name: "sender";
        }, {
            readonly type: "address";
            readonly name: "receiver";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
            readonly name: "authorized";
        }, {
            readonly type: "uint8";
            readonly name: "blockedReason";
        }];
    }, {
        readonly name: "createPolicy";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "admin";
        }, {
            readonly type: "uint8";
            readonly name: "policyType";
        }];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "createPolicyWithAccounts";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "admin";
        }, {
            readonly type: "uint8";
            readonly name: "policyType";
        }, {
            readonly type: "address[]";
            readonly name: "accounts";
        }];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "setPolicyAdmin";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
        }, {
            readonly type: "address";
            readonly name: "admin";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "modifyPolicyWhitelist";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
        }, {
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "bool";
            readonly name: "allowed";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "modifyPolicyBlacklist";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
        }, {
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "bool";
            readonly name: "restricted";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "createCompoundPolicy";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "senderPolicyId";
        }, {
            readonly type: "uint64";
            readonly name: "recipientPolicyId";
        }, {
            readonly type: "uint64";
            readonly name: "mintRecipientPolicyId";
        }];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "setReceivePolicy";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "senderPolicyId";
        }, {
            readonly type: "uint64";
            readonly name: "tokenFilterId";
        }, {
            readonly type: "address";
            readonly name: "recoveryAuthority";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "PolicyAdminUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "admin";
            readonly indexed: true;
        }];
    }, {
        readonly name: "PolicyCreated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "uint8";
            readonly name: "policyType";
        }];
    }, {
        readonly name: "WhitelistUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "bool";
            readonly name: "allowed";
        }];
    }, {
        readonly name: "BlacklistUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "updater";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "bool";
            readonly name: "restricted";
        }];
    }, {
        readonly name: "CompoundPolicyCreated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "uint64";
            readonly name: "policyId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "creator";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "senderPolicyId";
        }, {
            readonly type: "uint64";
            readonly name: "recipientPolicyId";
        }, {
            readonly type: "uint64";
            readonly name: "mintRecipientPolicyId";
        }];
    }, {
        readonly name: "ReceivePolicyUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "uint64";
            readonly name: "senderPolicyId";
        }, {
            readonly type: "uint64";
            readonly name: "tokenFilterId";
        }, {
            readonly type: "address";
            readonly name: "recoveryAuthority";
        }];
    }, {
        readonly name: "Unauthorized";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "PolicyNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "PolicyNotSimple";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidPolicyType";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "IncompatiblePolicyType";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "VirtualAddressNotAllowed";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidReceivePolicyType";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidRecoveryAuthority";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "ReceivePolicyUpdated">;
}
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
export declare function setSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: setSync.Parameters<chain, account>): Promise<setSync.ReturnValue>;
export declare namespace setSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = set.Parameters<chain, account>;
    type Args = set.Args;
    type ReturnValue = Compute<UnionOmit<GetEventArgs<typeof Abis.tip403Registry, 'ReceivePolicyUpdated', {
        IndexedOnly: false;
        Required: true;
    }>, 'senderPolicyId' | 'tokenFilterId'> & {
        /** TIP-403 policy restricting which senders are allowed. */
        senderPolicyId: PolicyRef;
        /** TIP-403 policy restricting which tokens are allowed. */
        tokenPolicyId: PolicyRef;
        /** Who can reclaim funds blocked by this policy. */
        claimer: Claimer;
        receipt: TransactionReceipt;
    }>;
    type ErrorType = BaseErrorType;
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
export declare function validate<chain extends Chain | undefined>(client: Client<Transport, chain>, parameters: validate.Parameters): Promise<validate.ReturnValue>;
export declare namespace validate {
    type Parameters = ReadParameters & Args;
    type Args = {
        /** Token address. */
        token: Address;
        /** Sender address. */
        sender: Address;
        /** Receiver address. */
        receiver: Address;
    };
    type ReturnValue = Compute<{
        /** Whether the transfer is authorized. */
        authorized: boolean;
        /** Reason the transfer would be blocked. */
        blockedReason: BlockedReason;
    }>;
    /**
     * Defines a call to the `validateReceivePolicy` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "validateReceivePolicy";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "address";
                readonly name: "sender";
            }, {
                readonly type: "address";
                readonly name: "receiver";
            }];
            readonly outputs: readonly [{
                readonly type: "bool";
                readonly name: "authorized";
            }, {
                readonly type: "uint8";
                readonly name: "blockedReason";
            }];
        }];
        functionName: "validateReceivePolicy";
    } & {
        args: readonly [token: `0x${string}`, sender: `0x${string}`, receiver: `0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
}
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
export declare function watchBlocked<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: watchBlocked.Parameters): import("../../actions/public/watchContractEvent.js").WatchContractEventReturnType;
export declare namespace watchBlocked {
    type Args = Compute<UnionOmit<GetEventArgs<typeof Abis.receivePolicyGuard, 'TransferBlocked', {
        IndexedOnly: false;
        Required: true;
    }>, 'receipt'> & {
        /** The encoded claim receipt (witness for `claim`/`burn`). */
        claimReceipt: Hex;
    }>;
    type Log = viem_Log<bigint, number, false, ExtractAbiItem<typeof Abis.receivePolicyGuard, 'TransferBlocked'>, true>;
    type Parameters = UnionOmit<WatchContractEventParameters<typeof Abis.receivePolicyGuard, 'TransferBlocked', true>, 'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'> & {
        /** Callback to invoke when a transfer is blocked. */
        onBlocked: (args: Args, log: Log) => void;
    };
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
export declare function watchBurned<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: watchBurned.Parameters): import("../../actions/public/watchContractEvent.js").WatchContractEventReturnType;
export declare namespace watchBurned {
    type Args = Compute<GetEventArgs<typeof Abis.receivePolicyGuard, 'ReceiptBurned', {
        IndexedOnly: false;
        Required: true;
    }>>;
    type Log = viem_Log<bigint, number, false, ExtractAbiItem<typeof Abis.receivePolicyGuard, 'ReceiptBurned'>, true>;
    type Parameters = UnionOmit<WatchContractEventParameters<typeof Abis.receivePolicyGuard, 'ReceiptBurned', true>, 'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'> & {
        /** Callback to invoke when a receipt is burned. */
        onBurned: (args: Args, log: Log) => void;
    };
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
export declare function watchClaimed<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: watchClaimed.Parameters): import("../../actions/public/watchContractEvent.js").WatchContractEventReturnType;
export declare namespace watchClaimed {
    type Args = Compute<GetEventArgs<typeof Abis.receivePolicyGuard, 'ReceiptClaimed', {
        IndexedOnly: false;
        Required: true;
    }>>;
    type Log = viem_Log<bigint, number, false, ExtractAbiItem<typeof Abis.receivePolicyGuard, 'ReceiptClaimed'>, true>;
    type Parameters = UnionOmit<WatchContractEventParameters<typeof Abis.receivePolicyGuard, 'ReceiptClaimed', true>, 'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'> & {
        /** Callback to invoke when a receipt is claimed. */
        onClaimed: (args: Args, log: Log) => void;
    };
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
export declare function watchUpdated<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: watchUpdated.Parameters): import("../../actions/public/watchContractEvent.js").WatchContractEventReturnType;
export declare namespace watchUpdated {
    type Args = Compute<UnionOmit<GetEventArgs<typeof Abis.tip403Registry, 'ReceivePolicyUpdated', {
        IndexedOnly: false;
        Required: true;
    }>, 'senderPolicyId' | 'tokenFilterId'> & {
        /** TIP-403 policy restricting which senders are allowed. */
        senderPolicyId: PolicyRef;
        /** TIP-403 policy restricting which tokens are allowed. */
        tokenPolicyId: PolicyRef;
        /** Who can reclaim funds blocked by this policy. */
        claimer: Claimer;
    }>;
    type Log = viem_Log<bigint, number, false, ExtractAbiItem<typeof Abis.tip403Registry, 'ReceivePolicyUpdated'>, true>;
    type Parameters = UnionOmit<WatchContractEventParameters<typeof Abis.tip403Registry, 'ReceivePolicyUpdated', true>, 'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'> & {
        /** Callback to invoke when a receive policy is updated. */
        onUpdated: (args: Args, log: Log) => void;
    };
}
//# sourceMappingURL=receivePolicy.d.ts.map