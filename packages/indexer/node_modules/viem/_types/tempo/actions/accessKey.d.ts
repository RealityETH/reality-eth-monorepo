import type { Address } from 'abitype';
import type { KeyAuthorization } from 'ox/tempo';
import type { Account } from '../../accounts/types.js';
import type { ReadContractReturnType } from '../../actions/public/readContract.js';
import type { WatchContractEventParameters } from '../../actions/public/watchContractEvent.js';
import { sendTransaction } from '../../actions/wallet/sendTransaction.js';
import { sendTransactionSync } from '../../actions/wallet/sendTransactionSync.js';
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
import type { AccessKeyAccount, resolveAccessKey } from '../Account.js';
import { signKeyAuthorization } from '../Account.js';
import type { GetAccountParameter, ReadParameters, WriteParameters } from '../internal/types.js';
import type { TransactionReceipt } from '../Transaction.js';
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
export declare function authorize<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: authorize.Parameters<chain, account>): Promise<authorize.ReturnValue>;
export declare namespace authorize {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** The access key to authorize. */
        accessKey: resolveAccessKey.Parameters;
        /**
         * Whether to authorize the key as an admin key. Admin keys are unrestricted
         * and can manage the account's other access keys; `expiry`, `limits`, and
         * `scopes` are ignored. Requires the T6 hardfork.
         *
         * [TIP-1049](https://tips.sh/1049)
         */
        admin?: boolean | undefined;
        /** The chain ID. */
        chainId?: number | undefined;
        /** Unix timestamp when the key expires. */
        expiry?: number | undefined;
        /** Spending limits per token. */
        limits?: {
            token: Address;
            limit: bigint;
            period?: number | undefined;
        }[] | undefined;
        /** Call scopes restricting which contracts/selectors this key can call. */
        scopes?: KeyAuthorization.Scope[] | undefined;
        /**
         * Optional 32-byte witness bound into the authorization's signing hash.
         *
         * Applications use this to bind a single signature to an arbitrary offchain
         * context (e.g. a server-issued challenge), or as a revocation handle that
         * can be burned onchain (see {@link burnWitness}) to invalidate the
         * authorization before it is submitted.
         *
         * [TIP-1053](https://tips.sh/1053)
         */
        witness?: Hex | undefined;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof sendTransaction | typeof sendTransactionSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: authorize.Parameters<chain, account>): Promise<ReturnType<action>>;
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "uint64";
            readonly name: "expiry";
        }, {
            readonly type: "bool";
            readonly name: "enforceLimits";
        }, {
            readonly type: "tuple[]";
            readonly name: "limits";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "uint256";
                readonly name: "amount";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "tuple";
            readonly name: "config";
            readonly components: readonly [{
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "tuple[]";
                readonly name: "limits";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "uint256";
                    readonly name: "amount";
                }, {
                    readonly type: "uint64";
                    readonly name: "period";
                }];
            }, {
                readonly type: "bool";
                readonly name: "allowAnyCalls";
            }, {
                readonly type: "tuple[]";
                readonly name: "allowedCalls";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "target";
                }, {
                    readonly type: "tuple[]";
                    readonly name: "selectorRules";
                    readonly components: readonly [{
                        readonly type: "bytes4";
                        readonly name: "selector";
                    }, {
                        readonly type: "address[]";
                        readonly name: "recipients";
                    }];
                }];
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "tuple";
            readonly name: "config";
            readonly components: readonly [{
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "tuple[]";
                readonly name: "limits";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "uint256";
                    readonly name: "amount";
                }, {
                    readonly type: "uint64";
                    readonly name: "period";
                }];
            }, {
                readonly type: "bool";
                readonly name: "allowAnyCalls";
            }, {
                readonly type: "tuple[]";
                readonly name: "allowedCalls";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "target";
                }, {
                    readonly type: "tuple[]";
                    readonly name: "selectorRules";
                    readonly components: readonly [{
                        readonly type: "bytes4";
                        readonly name: "selector";
                    }, {
                        readonly type: "address[]";
                        readonly name: "recipients";
                    }];
                }];
            }];
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeAdminKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "burnKeyAuthorizationWitness";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "revokeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "updateSpendingLimit";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "uint256";
            readonly name: "newLimit";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "setAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "tuple[]";
            readonly name: "scopes";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "target";
            }, {
                readonly type: "tuple[]";
                readonly name: "selectorRules";
                readonly components: readonly [{
                    readonly type: "bytes4";
                    readonly name: "selector";
                }, {
                    readonly type: "address[]";
                    readonly name: "recipients";
                }];
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "removeAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "target";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "uint8";
                readonly name: "signatureType";
            }, {
                readonly type: "address";
                readonly name: "keyId";
            }, {
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "bool";
                readonly name: "isRevoked";
            }];
        }];
    }, {
        readonly name: "getRemainingLimit";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
            readonly name: "remaining";
        }];
    }, {
        readonly name: "getRemainingLimitWithPeriod";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
            readonly name: "remaining";
        }, {
            readonly type: "uint64";
            readonly name: "periodEnd";
        }];
    }, {
        readonly name: "getAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
            readonly name: "isScoped";
        }, {
            readonly type: "tuple[]";
            readonly name: "scopes";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "target";
            }, {
                readonly type: "tuple[]";
                readonly name: "selectorRules";
                readonly components: readonly [{
                    readonly type: "bytes4";
                    readonly name: "selector";
                }, {
                    readonly type: "address[]";
                    readonly name: "recipients";
                }];
            }];
        }];
    }, {
        readonly name: "isKeyAuthorizationWitnessBurned";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "isAdminKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "getTransactionKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "KeyAuthorized";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "uint64";
            readonly name: "expiry";
        }];
    }, {
        readonly name: "AdminKeyAuthorized";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }];
    }, {
        readonly name: "KeyRevoked";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }];
    }, {
        readonly name: "SpendingLimitUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "newLimit";
        }];
    }, {
        readonly name: "AccessKeySpend";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "uint256";
            readonly name: "remainingLimit";
        }];
    }, {
        readonly name: "KeyAuthorizationWitness";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
            readonly indexed: true;
        }];
    }, {
        readonly name: "KeyAuthorizationWitnessBurned";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
            readonly indexed: true;
        }];
    }, {
        readonly name: "UnauthorizedCaller";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAlreadyExists";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyExpired";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "SpendingLimitExceeded";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSpendingLimit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSignatureType";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ZeroPublicKey";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ExpiryInPast";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAlreadyRevoked";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "SignatureTypeMismatch";
        readonly type: "error";
        readonly inputs: readonly [{
            readonly type: "uint8";
            readonly name: "expected";
        }, {
            readonly type: "uint8";
            readonly name: "actual";
        }];
    }, {
        readonly name: "CallNotAllowed";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidCallScope";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidKeyId";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidKeyAuthorizationWitness";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAuthorizationWitnessAlreadyBurned";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "LegacyAuthorizeKeySelectorChanged";
        readonly type: "error";
        readonly inputs: readonly [{
            readonly type: "bytes4";
            readonly name: "newSelector";
        }];
    }], "KeyAuthorized">;
}
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
export declare function authorizeSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: authorizeSync.Parameters<chain, account>): Promise<authorizeSync.ReturnValue>;
export declare namespace authorizeSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = authorize.Parameters<chain, account>;
    type Args = authorize.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.accountKeychain, 'KeyAuthorized', {
        IndexedOnly: false;
        Required: true;
    }> & {
        receipt: TransactionReceipt;
    }>;
    type ErrorType = BaseErrorType;
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
export declare function burnWitness<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: burnWitness.Parameters<chain, account>): Promise<burnWitness.ReturnValue>;
export declare namespace burnWitness {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** The 32-byte witness to burn. */
        witness: Hex;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: burnWitness.Parameters<chain, account>): Promise<ReturnType<action>>;
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
    function call(args: Args): {
        abi: [{
            readonly name: "burnKeyAuthorizationWitness";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "bytes32";
                readonly name: "witness";
            }];
            readonly outputs: readonly [];
        }];
        functionName: "burnKeyAuthorizationWitness";
    } & {
        args: readonly [`0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "uint64";
            readonly name: "expiry";
        }, {
            readonly type: "bool";
            readonly name: "enforceLimits";
        }, {
            readonly type: "tuple[]";
            readonly name: "limits";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "uint256";
                readonly name: "amount";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "tuple";
            readonly name: "config";
            readonly components: readonly [{
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "tuple[]";
                readonly name: "limits";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "uint256";
                    readonly name: "amount";
                }, {
                    readonly type: "uint64";
                    readonly name: "period";
                }];
            }, {
                readonly type: "bool";
                readonly name: "allowAnyCalls";
            }, {
                readonly type: "tuple[]";
                readonly name: "allowedCalls";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "target";
                }, {
                    readonly type: "tuple[]";
                    readonly name: "selectorRules";
                    readonly components: readonly [{
                        readonly type: "bytes4";
                        readonly name: "selector";
                    }, {
                        readonly type: "address[]";
                        readonly name: "recipients";
                    }];
                }];
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "tuple";
            readonly name: "config";
            readonly components: readonly [{
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "tuple[]";
                readonly name: "limits";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "uint256";
                    readonly name: "amount";
                }, {
                    readonly type: "uint64";
                    readonly name: "period";
                }];
            }, {
                readonly type: "bool";
                readonly name: "allowAnyCalls";
            }, {
                readonly type: "tuple[]";
                readonly name: "allowedCalls";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "target";
                }, {
                    readonly type: "tuple[]";
                    readonly name: "selectorRules";
                    readonly components: readonly [{
                        readonly type: "bytes4";
                        readonly name: "selector";
                    }, {
                        readonly type: "address[]";
                        readonly name: "recipients";
                    }];
                }];
            }];
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeAdminKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "burnKeyAuthorizationWitness";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "revokeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "updateSpendingLimit";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "uint256";
            readonly name: "newLimit";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "setAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "tuple[]";
            readonly name: "scopes";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "target";
            }, {
                readonly type: "tuple[]";
                readonly name: "selectorRules";
                readonly components: readonly [{
                    readonly type: "bytes4";
                    readonly name: "selector";
                }, {
                    readonly type: "address[]";
                    readonly name: "recipients";
                }];
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "removeAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "target";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "uint8";
                readonly name: "signatureType";
            }, {
                readonly type: "address";
                readonly name: "keyId";
            }, {
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "bool";
                readonly name: "isRevoked";
            }];
        }];
    }, {
        readonly name: "getRemainingLimit";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
            readonly name: "remaining";
        }];
    }, {
        readonly name: "getRemainingLimitWithPeriod";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
            readonly name: "remaining";
        }, {
            readonly type: "uint64";
            readonly name: "periodEnd";
        }];
    }, {
        readonly name: "getAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
            readonly name: "isScoped";
        }, {
            readonly type: "tuple[]";
            readonly name: "scopes";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "target";
            }, {
                readonly type: "tuple[]";
                readonly name: "selectorRules";
                readonly components: readonly [{
                    readonly type: "bytes4";
                    readonly name: "selector";
                }, {
                    readonly type: "address[]";
                    readonly name: "recipients";
                }];
            }];
        }];
    }, {
        readonly name: "isKeyAuthorizationWitnessBurned";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "isAdminKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "getTransactionKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "KeyAuthorized";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "uint64";
            readonly name: "expiry";
        }];
    }, {
        readonly name: "AdminKeyAuthorized";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }];
    }, {
        readonly name: "KeyRevoked";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }];
    }, {
        readonly name: "SpendingLimitUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "newLimit";
        }];
    }, {
        readonly name: "AccessKeySpend";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "uint256";
            readonly name: "remainingLimit";
        }];
    }, {
        readonly name: "KeyAuthorizationWitness";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
            readonly indexed: true;
        }];
    }, {
        readonly name: "KeyAuthorizationWitnessBurned";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
            readonly indexed: true;
        }];
    }, {
        readonly name: "UnauthorizedCaller";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAlreadyExists";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyExpired";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "SpendingLimitExceeded";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSpendingLimit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSignatureType";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ZeroPublicKey";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ExpiryInPast";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAlreadyRevoked";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "SignatureTypeMismatch";
        readonly type: "error";
        readonly inputs: readonly [{
            readonly type: "uint8";
            readonly name: "expected";
        }, {
            readonly type: "uint8";
            readonly name: "actual";
        }];
    }, {
        readonly name: "CallNotAllowed";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidCallScope";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidKeyId";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidKeyAuthorizationWitness";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAuthorizationWitnessAlreadyBurned";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "LegacyAuthorizeKeySelectorChanged";
        readonly type: "error";
        readonly inputs: readonly [{
            readonly type: "bytes4";
            readonly name: "newSelector";
        }];
    }], "KeyAuthorizationWitnessBurned">;
}
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
export declare function burnWitnessSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: burnWitnessSync.Parameters<chain, account>): Promise<burnWitnessSync.ReturnValue>;
export declare namespace burnWitnessSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = burnWitness.Parameters<chain, account>;
    type Args = burnWitness.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.accountKeychain, 'KeyAuthorizationWitnessBurned', {
        IndexedOnly: false;
        Required: true;
    }> & {
        receipt: TransactionReceipt;
    }>;
    type ErrorType = BaseErrorType;
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
export declare function getMetadata<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: getMetadata.Parameters<account>): Promise<getMetadata.ReturnValue>;
export declare namespace getMetadata {
    type Parameters<account extends Account | undefined = Account | undefined> = ReadParameters & GetAccountParameter<account> & Pick<Args, 'accessKey'>;
    type Args = {
        /** Account address. */
        account: Address;
        /** The access key. */
        accessKey: Address | AccessKeyAccount;
    };
    type ReturnValue = {
        /** The access key address. */
        address: Address;
        /** The key type. */
        keyType: 'secp256k1' | 'p256' | 'webAuthn';
        /** The expiry timestamp. */
        expiry: bigint;
        /** The spending policy. */
        spendPolicy: 'limited' | 'unlimited';
        /** Whether the key is revoked. */
        isRevoked: boolean;
    };
    /**
     * Defines a call to the `getKey` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "getKey";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "account";
            }, {
                readonly type: "address";
                readonly name: "keyId";
            }];
            readonly outputs: readonly [{
                readonly type: "tuple";
                readonly components: readonly [{
                    readonly type: "uint8";
                    readonly name: "signatureType";
                }, {
                    readonly type: "address";
                    readonly name: "keyId";
                }, {
                    readonly type: "uint64";
                    readonly name: "expiry";
                }, {
                    readonly type: "bool";
                    readonly name: "enforceLimits";
                }, {
                    readonly type: "bool";
                    readonly name: "isRevoked";
                }];
            }];
        }];
        functionName: "getKey";
    } & {
        args: readonly [account: `0x${string}`, `0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
}
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
export declare function getRemainingLimit<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: getRemainingLimit.Parameters<account>): Promise<getRemainingLimit.ReturnValue>;
export declare namespace getRemainingLimit {
    type Parameters<account extends Account | undefined = Account | undefined> = ReadParameters & GetAccountParameter<account> & Pick<Args, 'accessKey' | 'token'>;
    type Args = {
        /** Account address. */
        account: Address;
        /** The access key. */
        accessKey: Address | AccessKeyAccount;
        /** The token address. */
        token: Address;
    };
    type ReturnValue = {
        remaining: bigint;
        periodEnd: bigint | undefined;
    };
    /**
     * Defines a call to the `getRemainingLimit` function (pre-T3).
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "getRemainingLimit";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "account";
            }, {
                readonly type: "address";
                readonly name: "keyId";
            }, {
                readonly type: "address";
                readonly name: "token";
            }];
            readonly outputs: readonly [{
                readonly type: "uint256";
                readonly name: "remaining";
            }];
        }];
        functionName: "getRemainingLimit";
    } & {
        args: readonly [account: `0x${string}`, `0x${string}`, token: `0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
    /**
     * Defines a call to the `getRemainingLimitWithPeriod` function (T3+).
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function callWithPeriod(args: Args): {
        abi: [{
            readonly name: "getRemainingLimitWithPeriod";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "account";
            }, {
                readonly type: "address";
                readonly name: "keyId";
            }, {
                readonly type: "address";
                readonly name: "token";
            }];
            readonly outputs: readonly [{
                readonly type: "uint256";
                readonly name: "remaining";
            }, {
                readonly type: "uint64";
                readonly name: "periodEnd";
            }];
        }];
        functionName: "getRemainingLimitWithPeriod";
    } & {
        args: readonly [account: `0x${string}`, `0x${string}`, token: `0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
}
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
export declare function isAdmin<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: isAdmin.Parameters<account>): Promise<isAdmin.ReturnValue>;
export declare namespace isAdmin {
    type Parameters<account extends Account | undefined = Account | undefined> = ReadParameters & GetAccountParameter<account> & Pick<Args, 'accessKey'>;
    type Args = {
        /** Account address. */
        account: Address;
        /** The access key. */
        accessKey: Address | AccessKeyAccount;
    };
    type ReturnValue = ReadContractReturnType<typeof Abis.accountKeychain, 'isAdminKey', never>;
    /**
     * Defines a call to the `isAdminKey` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "isAdminKey";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "account";
            }, {
                readonly type: "address";
                readonly name: "keyId";
            }];
            readonly outputs: readonly [{
                readonly type: "bool";
            }];
        }];
        functionName: "isAdminKey";
    } & {
        args: readonly [account: `0x${string}`, `0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
}
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
export declare function isWitnessBurned<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: isWitnessBurned.Parameters<account>): Promise<isWitnessBurned.ReturnValue>;
export declare namespace isWitnessBurned {
    type Parameters<account extends Account | undefined = Account | undefined> = ReadParameters & GetAccountParameter<account> & Pick<Args, 'witness'>;
    type Args = {
        /** Account address. */
        account: Address;
        /** The 32-byte witness to check. */
        witness: Hex;
    };
    type ReturnValue = ReadContractReturnType<typeof Abis.accountKeychain, 'isKeyAuthorizationWitnessBurned', never>;
    /**
     * Defines a call to the `isKeyAuthorizationWitnessBurned` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "isKeyAuthorizationWitnessBurned";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "account";
            }, {
                readonly type: "bytes32";
                readonly name: "witness";
            }];
            readonly outputs: readonly [{
                readonly type: "bool";
            }];
        }];
        functionName: "isKeyAuthorizationWitnessBurned";
    } & {
        args: readonly [account: `0x${string}`, `0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
}
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
export declare function revoke<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: revoke.Parameters<chain, account>): Promise<revoke.ReturnValue>;
export declare namespace revoke {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** The access key to revoke. */
        accessKey: Address | AccessKeyAccount;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: revoke.Parameters<chain, account>): Promise<ReturnType<action>>;
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
    function call(args: Args): {
        abi: [{
            readonly name: "revokeKey";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "keyId";
            }];
            readonly outputs: readonly [];
        }];
        functionName: "revokeKey";
    } & {
        args: readonly [`0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "uint64";
            readonly name: "expiry";
        }, {
            readonly type: "bool";
            readonly name: "enforceLimits";
        }, {
            readonly type: "tuple[]";
            readonly name: "limits";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "uint256";
                readonly name: "amount";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "tuple";
            readonly name: "config";
            readonly components: readonly [{
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "tuple[]";
                readonly name: "limits";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "uint256";
                    readonly name: "amount";
                }, {
                    readonly type: "uint64";
                    readonly name: "period";
                }];
            }, {
                readonly type: "bool";
                readonly name: "allowAnyCalls";
            }, {
                readonly type: "tuple[]";
                readonly name: "allowedCalls";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "target";
                }, {
                    readonly type: "tuple[]";
                    readonly name: "selectorRules";
                    readonly components: readonly [{
                        readonly type: "bytes4";
                        readonly name: "selector";
                    }, {
                        readonly type: "address[]";
                        readonly name: "recipients";
                    }];
                }];
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "tuple";
            readonly name: "config";
            readonly components: readonly [{
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "tuple[]";
                readonly name: "limits";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "uint256";
                    readonly name: "amount";
                }, {
                    readonly type: "uint64";
                    readonly name: "period";
                }];
            }, {
                readonly type: "bool";
                readonly name: "allowAnyCalls";
            }, {
                readonly type: "tuple[]";
                readonly name: "allowedCalls";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "target";
                }, {
                    readonly type: "tuple[]";
                    readonly name: "selectorRules";
                    readonly components: readonly [{
                        readonly type: "bytes4";
                        readonly name: "selector";
                    }, {
                        readonly type: "address[]";
                        readonly name: "recipients";
                    }];
                }];
            }];
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeAdminKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "burnKeyAuthorizationWitness";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "revokeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "updateSpendingLimit";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "uint256";
            readonly name: "newLimit";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "setAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "tuple[]";
            readonly name: "scopes";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "target";
            }, {
                readonly type: "tuple[]";
                readonly name: "selectorRules";
                readonly components: readonly [{
                    readonly type: "bytes4";
                    readonly name: "selector";
                }, {
                    readonly type: "address[]";
                    readonly name: "recipients";
                }];
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "removeAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "target";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "uint8";
                readonly name: "signatureType";
            }, {
                readonly type: "address";
                readonly name: "keyId";
            }, {
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "bool";
                readonly name: "isRevoked";
            }];
        }];
    }, {
        readonly name: "getRemainingLimit";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
            readonly name: "remaining";
        }];
    }, {
        readonly name: "getRemainingLimitWithPeriod";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
            readonly name: "remaining";
        }, {
            readonly type: "uint64";
            readonly name: "periodEnd";
        }];
    }, {
        readonly name: "getAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
            readonly name: "isScoped";
        }, {
            readonly type: "tuple[]";
            readonly name: "scopes";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "target";
            }, {
                readonly type: "tuple[]";
                readonly name: "selectorRules";
                readonly components: readonly [{
                    readonly type: "bytes4";
                    readonly name: "selector";
                }, {
                    readonly type: "address[]";
                    readonly name: "recipients";
                }];
            }];
        }];
    }, {
        readonly name: "isKeyAuthorizationWitnessBurned";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "isAdminKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "getTransactionKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "KeyAuthorized";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "uint64";
            readonly name: "expiry";
        }];
    }, {
        readonly name: "AdminKeyAuthorized";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }];
    }, {
        readonly name: "KeyRevoked";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }];
    }, {
        readonly name: "SpendingLimitUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "newLimit";
        }];
    }, {
        readonly name: "AccessKeySpend";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "uint256";
            readonly name: "remainingLimit";
        }];
    }, {
        readonly name: "KeyAuthorizationWitness";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
            readonly indexed: true;
        }];
    }, {
        readonly name: "KeyAuthorizationWitnessBurned";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
            readonly indexed: true;
        }];
    }, {
        readonly name: "UnauthorizedCaller";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAlreadyExists";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyExpired";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "SpendingLimitExceeded";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSpendingLimit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSignatureType";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ZeroPublicKey";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ExpiryInPast";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAlreadyRevoked";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "SignatureTypeMismatch";
        readonly type: "error";
        readonly inputs: readonly [{
            readonly type: "uint8";
            readonly name: "expected";
        }, {
            readonly type: "uint8";
            readonly name: "actual";
        }];
    }, {
        readonly name: "CallNotAllowed";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidCallScope";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidKeyId";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidKeyAuthorizationWitness";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAuthorizationWitnessAlreadyBurned";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "LegacyAuthorizeKeySelectorChanged";
        readonly type: "error";
        readonly inputs: readonly [{
            readonly type: "bytes4";
            readonly name: "newSelector";
        }];
    }], "KeyRevoked">;
}
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
export declare function revokeSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: revokeSync.Parameters<chain, account>): Promise<revokeSync.ReturnValue>;
export declare namespace revokeSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = revoke.Parameters<chain, account>;
    type Args = revoke.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.accountKeychain, 'KeyRevoked', {
        IndexedOnly: false;
        Required: true;
    }> & {
        receipt: TransactionReceipt;
    }>;
    type ErrorType = BaseErrorType;
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
export declare function signAuthorization<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: signAuthorization.Parameters<account>): Promise<signAuthorization.ReturnValue>;
export declare namespace signAuthorization {
    type Parameters<account extends Account | undefined = Account | undefined> = GetAccountParameter<account> & {
        /** The access key to authorize. */
        accessKey: resolveAccessKey.Parameters;
        /**
         * Whether to authorize the key as an admin key. Admin keys are unrestricted
         * and can manage the account's other access keys; `expiry`, `limits`, and
         * `scopes` are ignored. Requires the T6 hardfork.
         *
         * [TIP-1049](https://tips.sh/1049)
         */
        admin?: boolean | undefined;
        /** The chain ID. */
        chainId?: number | undefined;
        /** Unix timestamp when the key expires. */
        expiry?: number | undefined;
        /** Spending limits per token. */
        limits?: {
            token: Address;
            limit: bigint;
            period?: number | undefined;
        }[] | undefined;
        /** Call scopes restricting which contracts/selectors this key can call. */
        scopes?: KeyAuthorization.Scope[] | undefined;
        /**
         * Optional 32-byte witness bound into the authorization's signing hash.
         *
         * Applications use this to bind a single signature to an arbitrary offchain
         * context (e.g. a server-issued challenge), or as a revocation handle that
         * can be burned onchain (see {@link burnWitness}) to invalidate the
         * authorization before it is submitted.
         *
         * [TIP-1053](https://tips.sh/1053)
         */
        witness?: Hex | undefined;
    };
    type ReturnValue = Awaited<ReturnType<typeof signKeyAuthorization>>;
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
export declare function updateLimit<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: updateLimit.Parameters<chain, account>): Promise<updateLimit.ReturnValue>;
export declare namespace updateLimit {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** The access key to update. */
        accessKey: Address | AccessKeyAccount;
        /** The token address. */
        token: Address;
        /** The new spending limit. */
        limit: bigint;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: updateLimit.Parameters<chain, account>): Promise<ReturnType<action>>;
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
    function call(args: Args): {
        abi: [{
            readonly name: "updateSpendingLimit";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "keyId";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "uint256";
                readonly name: "newLimit";
            }];
            readonly outputs: readonly [];
        }];
        functionName: "updateSpendingLimit";
    } & {
        args: readonly [`0x${string}`, token: `0x${string}`, newLimit: bigint];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "uint64";
            readonly name: "expiry";
        }, {
            readonly type: "bool";
            readonly name: "enforceLimits";
        }, {
            readonly type: "tuple[]";
            readonly name: "limits";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "uint256";
                readonly name: "amount";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "tuple";
            readonly name: "config";
            readonly components: readonly [{
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "tuple[]";
                readonly name: "limits";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "uint256";
                    readonly name: "amount";
                }, {
                    readonly type: "uint64";
                    readonly name: "period";
                }];
            }, {
                readonly type: "bool";
                readonly name: "allowAnyCalls";
            }, {
                readonly type: "tuple[]";
                readonly name: "allowedCalls";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "target";
                }, {
                    readonly type: "tuple[]";
                    readonly name: "selectorRules";
                    readonly components: readonly [{
                        readonly type: "bytes4";
                        readonly name: "selector";
                    }, {
                        readonly type: "address[]";
                        readonly name: "recipients";
                    }];
                }];
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "tuple";
            readonly name: "config";
            readonly components: readonly [{
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "tuple[]";
                readonly name: "limits";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "uint256";
                    readonly name: "amount";
                }, {
                    readonly type: "uint64";
                    readonly name: "period";
                }];
            }, {
                readonly type: "bool";
                readonly name: "allowAnyCalls";
            }, {
                readonly type: "tuple[]";
                readonly name: "allowedCalls";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "target";
                }, {
                    readonly type: "tuple[]";
                    readonly name: "selectorRules";
                    readonly components: readonly [{
                        readonly type: "bytes4";
                        readonly name: "selector";
                    }, {
                        readonly type: "address[]";
                        readonly name: "recipients";
                    }];
                }];
            }];
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "authorizeAdminKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "burnKeyAuthorizationWitness";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "revokeKey";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "updateSpendingLimit";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "uint256";
            readonly name: "newLimit";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "setAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "tuple[]";
            readonly name: "scopes";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "target";
            }, {
                readonly type: "tuple[]";
                readonly name: "selectorRules";
                readonly components: readonly [{
                    readonly type: "bytes4";
                    readonly name: "selector";
                }, {
                    readonly type: "address[]";
                    readonly name: "recipients";
                }];
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "removeAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "target";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "uint8";
                readonly name: "signatureType";
            }, {
                readonly type: "address";
                readonly name: "keyId";
            }, {
                readonly type: "uint64";
                readonly name: "expiry";
            }, {
                readonly type: "bool";
                readonly name: "enforceLimits";
            }, {
                readonly type: "bool";
                readonly name: "isRevoked";
            }];
        }];
    }, {
        readonly name: "getRemainingLimit";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
            readonly name: "remaining";
        }];
    }, {
        readonly name: "getRemainingLimitWithPeriod";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }, {
            readonly type: "address";
            readonly name: "token";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
            readonly name: "remaining";
        }, {
            readonly type: "uint64";
            readonly name: "periodEnd";
        }];
    }, {
        readonly name: "getAllowedCalls";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
            readonly name: "isScoped";
        }, {
            readonly type: "tuple[]";
            readonly name: "scopes";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "target";
            }, {
                readonly type: "tuple[]";
                readonly name: "selectorRules";
                readonly components: readonly [{
                    readonly type: "bytes4";
                    readonly name: "selector";
                }, {
                    readonly type: "address[]";
                    readonly name: "recipients";
                }];
            }];
        }];
    }, {
        readonly name: "isKeyAuthorizationWitnessBurned";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "isAdminKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
        }, {
            readonly type: "address";
            readonly name: "keyId";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly name: "getTransactionKey";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "address";
        }];
    }, {
        readonly name: "KeyAuthorized";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "uint8";
            readonly name: "signatureType";
        }, {
            readonly type: "uint64";
            readonly name: "expiry";
        }];
    }, {
        readonly name: "AdminKeyAuthorized";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }];
    }, {
        readonly name: "KeyRevoked";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }];
    }, {
        readonly name: "SpendingLimitUpdated";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "newLimit";
        }];
    }, {
        readonly name: "AccessKeySpend";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "publicKey";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "token";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "amount";
        }, {
            readonly type: "uint256";
            readonly name: "remainingLimit";
        }];
    }, {
        readonly name: "KeyAuthorizationWitness";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
            readonly indexed: true;
        }];
    }, {
        readonly name: "KeyAuthorizationWitnessBurned";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "account";
            readonly indexed: true;
        }, {
            readonly type: "bytes32";
            readonly name: "witness";
            readonly indexed: true;
        }];
    }, {
        readonly name: "UnauthorizedCaller";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAlreadyExists";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyExpired";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "SpendingLimitExceeded";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSpendingLimit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSignatureType";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ZeroPublicKey";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ExpiryInPast";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAlreadyRevoked";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "SignatureTypeMismatch";
        readonly type: "error";
        readonly inputs: readonly [{
            readonly type: "uint8";
            readonly name: "expected";
        }, {
            readonly type: "uint8";
            readonly name: "actual";
        }];
    }, {
        readonly name: "CallNotAllowed";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidCallScope";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidKeyId";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidKeyAuthorizationWitness";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "KeyAuthorizationWitnessAlreadyBurned";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "LegacyAuthorizeKeySelectorChanged";
        readonly type: "error";
        readonly inputs: readonly [{
            readonly type: "bytes4";
            readonly name: "newSelector";
        }];
    }], "SpendingLimitUpdated">;
}
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
export declare function updateLimitSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: updateLimitSync.Parameters<chain, account>): Promise<updateLimitSync.ReturnValue>;
export declare namespace updateLimitSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = updateLimit.Parameters<chain, account>;
    type Args = updateLimit.Args;
    type ReturnValue = {
        /** The account that owns the key. */
        account: Address;
        /** The access key address. */
        publicKey: Address;
        /** The token address. */
        token: Address;
        /** The new spending limit. */
        limit: bigint;
        /** The transaction receipt. */
        receipt: TransactionReceipt;
    };
    type ErrorType = BaseErrorType;
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
export declare function watchAdminAuthorized<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: watchAdminAuthorized.Parameters): import("../../actions/public/watchContractEvent.js").WatchContractEventReturnType;
export declare namespace watchAdminAuthorized {
    type Args = Compute<GetEventArgs<typeof Abis.accountKeychain, 'AdminKeyAuthorized', {
        IndexedOnly: false;
        Required: true;
    }>>;
    type Log = viem_Log<bigint, number, false, ExtractAbiItem<typeof Abis.accountKeychain, 'AdminKeyAuthorized'>, true>;
    type Parameters = UnionOmit<WatchContractEventParameters<typeof Abis.accountKeychain, 'AdminKeyAuthorized', true>, 'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'> & {
        /** Callback to invoke when an admin key is authorized. */
        onAuthorized: (args: Args, log: Log) => void;
    };
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
export declare function watchWitness<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: watchWitness.Parameters): import("../../actions/public/watchContractEvent.js").WatchContractEventReturnType;
export declare namespace watchWitness {
    type Args = Compute<GetEventArgs<typeof Abis.accountKeychain, 'KeyAuthorizationWitness', {
        IndexedOnly: false;
        Required: true;
    }>>;
    type Log = viem_Log<bigint, number, false, ExtractAbiItem<typeof Abis.accountKeychain, 'KeyAuthorizationWitness'>, true>;
    type Parameters = UnionOmit<WatchContractEventParameters<typeof Abis.accountKeychain, 'KeyAuthorizationWitness', true>, 'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'> & {
        /** Callback to invoke when a witness is used. */
        onWitness: (args: Args, log: Log) => void;
    };
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
export declare function watchWitnessBurned<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: watchWitnessBurned.Parameters): import("../../actions/public/watchContractEvent.js").WatchContractEventReturnType;
export declare namespace watchWitnessBurned {
    type Args = Compute<GetEventArgs<typeof Abis.accountKeychain, 'KeyAuthorizationWitnessBurned', {
        IndexedOnly: false;
        Required: true;
    }>>;
    type Log = viem_Log<bigint, number, false, ExtractAbiItem<typeof Abis.accountKeychain, 'KeyAuthorizationWitnessBurned'>, true>;
    type Parameters = UnionOmit<WatchContractEventParameters<typeof Abis.accountKeychain, 'KeyAuthorizationWitnessBurned', true>, 'abi' | 'address' | 'batch' | 'eventName' | 'onLogs' | 'strict'> & {
        /** Callback to invoke when a witness is burned. */
        onBurned: (args: Args, log: Log) => void;
    };
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
export declare function verifyHash<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: verifyHash.Parameters): Promise<verifyHash.ReturnValue>;
export declare namespace verifyHash {
    type Parameters = ReadParameters & Args;
    type Args = {
        /** Account address the signature is expected to belong to. */
        account: Address;
        /**
         * Whether to require the signer to be the account's root key or an
         * active admin access key. Defaults to `true`. Set to `false` to accept
         * any active access key.
         */
        admin?: boolean | undefined;
        /** Original message hash that was signed. */
        hash: Hex;
        /** Keychain signature envelope (V2). */
        signature: Hex;
    };
    type ReturnValue = ReadContractReturnType<typeof Abis.signatureVerifier, 'verifyKeychain' | 'verifyKeychainAdmin', never>;
    /**
     * Defines a call to `verifyKeychain` or `verifyKeychainAdmin` on the
     * Signature Verifier precompile (controlled by `admin`).
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "verifyKeychain";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "account";
            }, {
                readonly type: "bytes32";
                readonly name: "hash";
            }, {
                readonly type: "bytes";
                readonly name: "signature";
            }];
            readonly outputs: readonly [{
                readonly type: "bool";
            }];
        } | {
            readonly name: "verifyKeychainAdmin";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "account";
            }, {
                readonly type: "bytes32";
                readonly name: "hash";
            }, {
                readonly type: "bytes";
                readonly name: "signature";
            }];
            readonly outputs: readonly [{
                readonly type: "bool";
            }];
        }];
        functionName: "verifyKeychain" | "verifyKeychainAdmin";
    } & {
        args: readonly [account: `0x${string}`, hash: `0x${string}`, signature: `0x${string}`];
    } & {
        address: Address;
    } & {
        data: Hex;
        to: Address;
    };
}
//# sourceMappingURL=accessKey.d.ts.map