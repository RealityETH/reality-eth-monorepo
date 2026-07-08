import * as Address from 'ox/Address';
import * as Hex from 'ox/Hex';
import { Channel as ox_Channel, TokenId } from 'ox/tempo';
import type { Account } from '../../accounts/types.js';
import type { ReadContractReturnType } from '../../actions/public/readContract.js';
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js';
import { writeContract } from '../../actions/wallet/writeContract.js';
import { writeContractSync } from '../../actions/wallet/writeContractSync.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import type { BaseErrorType } from '../../errors/base.js';
import type { Chain } from '../../types/chain.js';
import type { GetEventArgs } from '../../types/contract.js';
import type { Log } from '../../types/log.js';
import type { Compute } from '../../types/utils.js';
import * as Abis from '../Abis.js';
import type { GetAccountParameter, ReadParameters, WriteParameters } from '../internal/types.js';
import type { TransactionReceipt } from '../Transaction.js';
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
export declare function close<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: close.Parameters<chain, account>): Promise<close.ReturnValue>;
export declare namespace close {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** Amount to capture for the payee during close. */
        captureAmount: bigint;
        /** Total voucher amount signed for the channel. */
        cumulativeAmount: bigint;
        /** TIP-20 channel. */
        channel: ox_Channel.from.Value;
        /** Voucher signature. */
        signature: Hex.Hex;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
    /**
     * Defines a call to the `close` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "close";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }, {
                readonly type: "uint96";
                readonly name: "cumulativeAmount";
            }, {
                readonly type: "uint96";
                readonly name: "captureAmount";
            }, {
                readonly type: "bytes";
                readonly name: "signature";
            }];
            readonly outputs: readonly [];
        }];
        functionName: "close";
    } & {
        args: readonly [{
            payer: `0x${string}`;
            payee: `0x${string}`;
            operator: `0x${string}`;
            token: `0x${string}`;
            salt: `0x${string}`;
            authorizedSigner: `0x${string}`;
            expiringNonceHash: `0x${string}`;
        }, bigint, bigint, signature: `0x${string}`];
    } & {
        address: import("abitype").Address;
    } & {
        data: import("../../index.js").Hex;
        to: import("abitype").Address;
    };
    /**
     * Extracts the `ChannelClosed` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ChannelClosed` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "CLOSE_GRACE_PERIOD";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "VOUCHER_TYPEHASH";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "open";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
    }, {
        readonly name: "settle";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "topUp";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "close";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "captureAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "requestClose";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "withdraw";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getChannel";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }, {
                readonly type: "tuple";
                readonly name: "state";
                readonly components: readonly [{
                    readonly type: "uint96";
                    readonly name: "settled";
                }, {
                    readonly type: "uint96";
                    readonly name: "deposit";
                }, {
                    readonly type: "uint32";
                    readonly name: "closeRequestedAt";
                }];
            }];
        }];
    }, {
        readonly name: "getChannelState";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "getChannelStatesBatch";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32[]";
            readonly name: "channelIds";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple[]";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "computeChannelId";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payer";
        }, {
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "getVoucherDigest";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "domainSeparator";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "ChannelOpened";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }];
    }, {
        readonly name: "Settled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "deltaPaid";
        }, {
            readonly type: "uint96";
            readonly name: "newSettled";
        }];
    }, {
        readonly name: "TopUp";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }, {
            readonly type: "uint96";
            readonly name: "newDeposit";
        }];
    }, {
        readonly name: "CloseRequested";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "closeGraceEnd";
        }];
    }, {
        readonly name: "ChannelClosed";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "settledToPayee";
        }, {
            readonly type: "uint96";
            readonly name: "refundedToPayer";
        }];
    }, {
        readonly name: "CloseRequestCancelled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }];
    }, {
        readonly name: "ChannelAlreadyExists";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ChannelNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayer";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayeeOrOperator";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidPayee";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ZeroDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ExpiringNonceHashNotSet";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSignature";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountExceedsDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountNotIncreasing";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CaptureAmountInvalid";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CloseNotReady";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "DepositOverflow";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "ChannelClosed">;
}
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
export declare function closeSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: closeSync.Parameters<chain, account>): Promise<closeSync.ReturnValue>;
export declare namespace closeSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = close.Parameters<chain, account>;
    type Args = close.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.tip20ChannelReserve, 'ChannelClosed', {
        IndexedOnly: false;
        Required: true;
    }> & {
        /** Transaction receipt. */
        receipt: TransactionReceipt;
    }>;
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
export declare function getStates<chain extends Chain | undefined, const channel extends getStates.Channel | readonly getStates.Channel[]>(client: Client<Transport, chain>, parameters: getStates.Parameters<channel>): Promise<getStates.ReturnValue<channel>>;
export declare namespace getStates {
    type Parameters<channel extends Channel | readonly Channel[] = Channel | readonly Channel[]> = ReadParameters & {
        /** Channel ID, channel, or list of IDs and channels. */
        channel: channel;
    };
    type Args<channel extends Channel | readonly Channel[] = Channel | readonly Channel[]> = {
        /**
         * Chain ID used to compute IDs for channel inputs.
         *
         * Required for channel inputs when using `getStates.call` directly.
         */
        chainId?: number | undefined;
        /** Channel ID, channel, or list of IDs and channels. */
        channel: channel;
    };
    type Channel = Hex.Hex | ox_Channel.from.Value;
    type State = ReadContractReturnType<typeof Abis.tip20ChannelReserve, 'getChannelState', readonly [Hex.Hex]>;
    type ReturnValue<channel extends Channel | readonly Channel[]> = channel extends readonly Channel[] ? readonly State[] : State;
    type ErrorType = BaseErrorType;
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
    function call<const channel extends Channel | readonly Channel[]>(args: Args<channel>): ({
        abi: [{
            readonly name: "getChannelStatesBatch";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "bytes32[]";
                readonly name: "channelIds";
            }];
            readonly outputs: readonly [{
                readonly type: "tuple[]";
                readonly components: readonly [{
                    readonly type: "uint96";
                    readonly name: "settled";
                }, {
                    readonly type: "uint96";
                    readonly name: "deposit";
                }, {
                    readonly type: "uint32";
                    readonly name: "closeRequestedAt";
                }];
            }];
        }];
        functionName: "getChannelStatesBatch";
    } & {
        args: readonly [readonly `0x${string}`[]];
    } & {
        address: import("abitype").Address;
    } & {
        data: import("../../index.js").Hex;
        to: import("abitype").Address;
    }) | ({
        abi: [{
            readonly name: "getChannelState";
            readonly type: "function";
            readonly stateMutability: "view";
            readonly inputs: readonly [{
                readonly type: "bytes32";
                readonly name: "channelId";
            }];
            readonly outputs: readonly [{
                readonly type: "tuple";
                readonly components: readonly [{
                    readonly type: "uint96";
                    readonly name: "settled";
                }, {
                    readonly type: "uint96";
                    readonly name: "deposit";
                }, {
                    readonly type: "uint32";
                    readonly name: "closeRequestedAt";
                }];
            }];
        }];
        functionName: "getChannelState";
    } & {
        args: readonly [channelId: `0x${string}`];
    } & {
        address: import("abitype").Address;
    } & {
        data: import("../../index.js").Hex;
        to: import("abitype").Address;
    });
}
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
export declare function open<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: open.Parameters<chain, account>): Promise<open.ReturnValue>;
export declare namespace open {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** Optional signer for vouchers. Zero means `payer` signs. @default zeroAddress */
        authorizedSigner?: Address.Address | undefined;
        /** Amount of TIP-20 token to deposit. */
        deposit: bigint;
        /** Optional relayer allowed to submit `settle` for the payee. @default zeroAddress */
        operator?: Address.Address | undefined;
        /** Account that receives settled voucher payments. */
        payee: Address.Address;
        /** User-supplied salt to distinguish otherwise identical channels. @default Hex.random(32) */
        salt?: Hex.Hex | undefined;
        /** TIP-20 token address or ID held by the channel. */
        token: TokenId.TokenIdOrAddress<Address.Address>;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
    /**
     * Defines a call to the `open` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "open";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }];
            readonly outputs: readonly [{
                readonly type: "bytes32";
                readonly name: "channelId";
            }];
        }];
        functionName: "open";
    } & {
        args: readonly [payee: `0x${string}`, operator: `0x${string}`, token: `0x${string}`, deposit: bigint, salt: `0x${string}`, `0x${string}`];
    } & {
        address: import("abitype").Address;
    } & {
        data: import("../../index.js").Hex;
        to: import("abitype").Address;
    };
    /**
     * Extracts the `ChannelOpened` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ChannelOpened` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "CLOSE_GRACE_PERIOD";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "VOUCHER_TYPEHASH";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "open";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
    }, {
        readonly name: "settle";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "topUp";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "close";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "captureAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "requestClose";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "withdraw";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getChannel";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }, {
                readonly type: "tuple";
                readonly name: "state";
                readonly components: readonly [{
                    readonly type: "uint96";
                    readonly name: "settled";
                }, {
                    readonly type: "uint96";
                    readonly name: "deposit";
                }, {
                    readonly type: "uint32";
                    readonly name: "closeRequestedAt";
                }];
            }];
        }];
    }, {
        readonly name: "getChannelState";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "getChannelStatesBatch";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32[]";
            readonly name: "channelIds";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple[]";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "computeChannelId";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payer";
        }, {
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "getVoucherDigest";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "domainSeparator";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "ChannelOpened";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }];
    }, {
        readonly name: "Settled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "deltaPaid";
        }, {
            readonly type: "uint96";
            readonly name: "newSettled";
        }];
    }, {
        readonly name: "TopUp";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }, {
            readonly type: "uint96";
            readonly name: "newDeposit";
        }];
    }, {
        readonly name: "CloseRequested";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "closeGraceEnd";
        }];
    }, {
        readonly name: "ChannelClosed";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "settledToPayee";
        }, {
            readonly type: "uint96";
            readonly name: "refundedToPayer";
        }];
    }, {
        readonly name: "CloseRequestCancelled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }];
    }, {
        readonly name: "ChannelAlreadyExists";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ChannelNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayer";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayeeOrOperator";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidPayee";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ZeroDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ExpiringNonceHashNotSet";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSignature";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountExceedsDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountNotIncreasing";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CaptureAmountInvalid";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CloseNotReady";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "DepositOverflow";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "ChannelOpened">;
}
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
export declare function openSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: openSync.Parameters<chain, account>): Promise<openSync.ReturnValue>;
export declare namespace openSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = open.Parameters<chain, account>;
    type Args = open.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.tip20ChannelReserve, 'ChannelOpened', {
        IndexedOnly: false;
        Required: true;
    }> & {
        /** Transaction receipt. */
        receipt: TransactionReceipt;
    }>;
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
export declare function requestClose<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: requestClose.Parameters<chain, account>): Promise<requestClose.ReturnValue>;
export declare namespace requestClose {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** TIP-20 channel. */
        channel: ox_Channel.from.Value;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
    /**
     * Defines a call to the `requestClose` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "requestClose";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }];
            readonly outputs: readonly [];
        }];
        functionName: "requestClose";
    } & {
        args: readonly [{
            payer: `0x${string}`;
            payee: `0x${string}`;
            operator: `0x${string}`;
            token: `0x${string}`;
            salt: `0x${string}`;
            authorizedSigner: `0x${string}`;
            expiringNonceHash: `0x${string}`;
        }];
    } & {
        address: import("abitype").Address;
    } & {
        data: import("../../index.js").Hex;
        to: import("abitype").Address;
    };
    /**
     * Extracts the `CloseRequested` event from logs.
     *
     * @param logs - The logs.
     * @returns The `CloseRequested` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "CLOSE_GRACE_PERIOD";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "VOUCHER_TYPEHASH";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "open";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
    }, {
        readonly name: "settle";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "topUp";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "close";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "captureAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "requestClose";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "withdraw";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getChannel";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }, {
                readonly type: "tuple";
                readonly name: "state";
                readonly components: readonly [{
                    readonly type: "uint96";
                    readonly name: "settled";
                }, {
                    readonly type: "uint96";
                    readonly name: "deposit";
                }, {
                    readonly type: "uint32";
                    readonly name: "closeRequestedAt";
                }];
            }];
        }];
    }, {
        readonly name: "getChannelState";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "getChannelStatesBatch";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32[]";
            readonly name: "channelIds";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple[]";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "computeChannelId";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payer";
        }, {
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "getVoucherDigest";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "domainSeparator";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "ChannelOpened";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }];
    }, {
        readonly name: "Settled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "deltaPaid";
        }, {
            readonly type: "uint96";
            readonly name: "newSettled";
        }];
    }, {
        readonly name: "TopUp";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }, {
            readonly type: "uint96";
            readonly name: "newDeposit";
        }];
    }, {
        readonly name: "CloseRequested";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "closeGraceEnd";
        }];
    }, {
        readonly name: "ChannelClosed";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "settledToPayee";
        }, {
            readonly type: "uint96";
            readonly name: "refundedToPayer";
        }];
    }, {
        readonly name: "CloseRequestCancelled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }];
    }, {
        readonly name: "ChannelAlreadyExists";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ChannelNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayer";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayeeOrOperator";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidPayee";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ZeroDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ExpiringNonceHashNotSet";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSignature";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountExceedsDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountNotIncreasing";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CaptureAmountInvalid";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CloseNotReady";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "DepositOverflow";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "CloseRequested">;
}
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
export declare function requestCloseSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: requestCloseSync.Parameters<chain, account>): Promise<requestCloseSync.ReturnValue>;
export declare namespace requestCloseSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = requestClose.Parameters<chain, account>;
    type Args = requestClose.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.tip20ChannelReserve, 'CloseRequested', {
        IndexedOnly: false;
        Required: true;
    }> & {
        /** Transaction receipt. */
        receipt: TransactionReceipt;
    }>;
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
export declare function settle<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: settle.Parameters<chain, account>): Promise<settle.ReturnValue>;
export declare namespace settle {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** Total voucher amount signed for the channel. */
        cumulativeAmount: bigint;
        /** TIP-20 channel. */
        channel: ox_Channel.from.Value;
        /** Voucher signature. */
        signature: Hex.Hex;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
    /**
     * Defines a call to the `settle` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "settle";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }, {
                readonly type: "uint96";
                readonly name: "cumulativeAmount";
            }, {
                readonly type: "bytes";
                readonly name: "signature";
            }];
            readonly outputs: readonly [];
        }];
        functionName: "settle";
    } & {
        args: readonly [{
            payer: `0x${string}`;
            payee: `0x${string}`;
            operator: `0x${string}`;
            token: `0x${string}`;
            salt: `0x${string}`;
            authorizedSigner: `0x${string}`;
            expiringNonceHash: `0x${string}`;
        }, bigint, signature: `0x${string}`];
    } & {
        address: import("abitype").Address;
    } & {
        data: import("../../index.js").Hex;
        to: import("abitype").Address;
    };
    /**
     * Extracts the `Settled` event from logs.
     *
     * @param logs - The logs.
     * @returns The `Settled` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "CLOSE_GRACE_PERIOD";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "VOUCHER_TYPEHASH";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "open";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
    }, {
        readonly name: "settle";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "topUp";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "close";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "captureAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "requestClose";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "withdraw";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getChannel";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }, {
                readonly type: "tuple";
                readonly name: "state";
                readonly components: readonly [{
                    readonly type: "uint96";
                    readonly name: "settled";
                }, {
                    readonly type: "uint96";
                    readonly name: "deposit";
                }, {
                    readonly type: "uint32";
                    readonly name: "closeRequestedAt";
                }];
            }];
        }];
    }, {
        readonly name: "getChannelState";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "getChannelStatesBatch";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32[]";
            readonly name: "channelIds";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple[]";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "computeChannelId";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payer";
        }, {
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "getVoucherDigest";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "domainSeparator";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "ChannelOpened";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }];
    }, {
        readonly name: "Settled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "deltaPaid";
        }, {
            readonly type: "uint96";
            readonly name: "newSettled";
        }];
    }, {
        readonly name: "TopUp";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }, {
            readonly type: "uint96";
            readonly name: "newDeposit";
        }];
    }, {
        readonly name: "CloseRequested";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "closeGraceEnd";
        }];
    }, {
        readonly name: "ChannelClosed";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "settledToPayee";
        }, {
            readonly type: "uint96";
            readonly name: "refundedToPayer";
        }];
    }, {
        readonly name: "CloseRequestCancelled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }];
    }, {
        readonly name: "ChannelAlreadyExists";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ChannelNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayer";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayeeOrOperator";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidPayee";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ZeroDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ExpiringNonceHashNotSet";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSignature";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountExceedsDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountNotIncreasing";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CaptureAmountInvalid";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CloseNotReady";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "DepositOverflow";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "Settled">;
}
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
export declare function settleSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: settleSync.Parameters<chain, account>): Promise<settleSync.ReturnValue>;
export declare namespace settleSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = settle.Parameters<chain, account>;
    type Args = settle.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.tip20ChannelReserve, 'Settled', {
        IndexedOnly: false;
        Required: true;
    }> & {
        /** Transaction receipt. */
        receipt: TransactionReceipt;
    }>;
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
export declare function signVoucher<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: signVoucher.Parameters<account>): Promise<signVoucher.ReturnValue>;
export declare namespace signVoucher {
    type Parameters<account extends Account | undefined = Account | undefined> = GetAccountParameter<account> & Args;
    type Args = {
        /** Channel ID or channel. */
        channel: getStates.Channel;
        /** The chain ID. @default client.chain.id */
        chainId?: number | bigint | undefined;
        /** Total voucher amount signed for the channel. */
        cumulativeAmount: bigint;
    };
    type ReturnValue = Hex.Hex;
    type ErrorType = BaseErrorType;
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
export declare function topUp<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: topUp.Parameters<chain, account>): Promise<topUp.ReturnValue>;
export declare namespace topUp {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** Additional deposit to lock in the channel. */
        additionalDeposit: bigint;
        /** TIP-20 channel. */
        channel: ox_Channel.from.Value;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
    /**
     * Defines a call to the `topUp` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "topUp";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }, {
                readonly type: "uint96";
                readonly name: "additionalDeposit";
            }];
            readonly outputs: readonly [];
        }];
        functionName: "topUp";
    } & {
        args: readonly [{
            payer: `0x${string}`;
            payee: `0x${string}`;
            operator: `0x${string}`;
            token: `0x${string}`;
            salt: `0x${string}`;
            authorizedSigner: `0x${string}`;
            expiringNonceHash: `0x${string}`;
        }, bigint];
    } & {
        address: import("abitype").Address;
    } & {
        data: import("../../index.js").Hex;
        to: import("abitype").Address;
    };
    /**
     * Extracts the `TopUp` event from logs.
     *
     * @param logs - The logs.
     * @returns The `TopUp` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "CLOSE_GRACE_PERIOD";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "VOUCHER_TYPEHASH";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "open";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
    }, {
        readonly name: "settle";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "topUp";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "close";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "captureAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "requestClose";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "withdraw";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getChannel";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }, {
                readonly type: "tuple";
                readonly name: "state";
                readonly components: readonly [{
                    readonly type: "uint96";
                    readonly name: "settled";
                }, {
                    readonly type: "uint96";
                    readonly name: "deposit";
                }, {
                    readonly type: "uint32";
                    readonly name: "closeRequestedAt";
                }];
            }];
        }];
    }, {
        readonly name: "getChannelState";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "getChannelStatesBatch";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32[]";
            readonly name: "channelIds";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple[]";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "computeChannelId";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payer";
        }, {
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "getVoucherDigest";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "domainSeparator";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "ChannelOpened";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }];
    }, {
        readonly name: "Settled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "deltaPaid";
        }, {
            readonly type: "uint96";
            readonly name: "newSettled";
        }];
    }, {
        readonly name: "TopUp";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }, {
            readonly type: "uint96";
            readonly name: "newDeposit";
        }];
    }, {
        readonly name: "CloseRequested";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "closeGraceEnd";
        }];
    }, {
        readonly name: "ChannelClosed";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "settledToPayee";
        }, {
            readonly type: "uint96";
            readonly name: "refundedToPayer";
        }];
    }, {
        readonly name: "CloseRequestCancelled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }];
    }, {
        readonly name: "ChannelAlreadyExists";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ChannelNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayer";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayeeOrOperator";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidPayee";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ZeroDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ExpiringNonceHashNotSet";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSignature";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountExceedsDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountNotIncreasing";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CaptureAmountInvalid";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CloseNotReady";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "DepositOverflow";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "TopUp">;
}
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
export declare function topUpSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: topUpSync.Parameters<chain, account>): Promise<topUpSync.ReturnValue>;
export declare namespace topUpSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = topUp.Parameters<chain, account>;
    type Args = topUp.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.tip20ChannelReserve, 'TopUp', {
        IndexedOnly: false;
        Required: true;
    }> & {
        /** Transaction receipt. */
        receipt: TransactionReceipt;
    }>;
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
export declare function withdraw<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: withdraw.Parameters<chain, account>): Promise<withdraw.ReturnValue>;
export declare namespace withdraw {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = WriteParameters<chain, account> & Args;
    type Args = {
        /** TIP-20 channel. */
        channel: ox_Channel.from.Value;
    };
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined>(action: action, client: Client<Transport, chain, account>, parameters: Parameters<chain, account>): Promise<ReturnType<action>>;
    /**
     * Defines a call to the `withdraw` function.
     *
     * @param args - Arguments.
     * @returns The call.
     */
    function call(args: Args): {
        abi: [{
            readonly name: "withdraw";
            readonly type: "function";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }];
            readonly outputs: readonly [];
        }];
        functionName: "withdraw";
    } & {
        args: readonly [{
            payer: `0x${string}`;
            payee: `0x${string}`;
            operator: `0x${string}`;
            token: `0x${string}`;
            salt: `0x${string}`;
            authorizedSigner: `0x${string}`;
            expiringNonceHash: `0x${string}`;
        }];
    } & {
        address: import("abitype").Address;
    } & {
        data: import("../../index.js").Hex;
        to: import("abitype").Address;
    };
    /**
     * Extracts the `ChannelClosed` event from logs.
     *
     * @param logs - The logs.
     * @returns The `ChannelClosed` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly name: "CLOSE_GRACE_PERIOD";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint64";
        }];
    }, {
        readonly name: "VOUCHER_TYPEHASH";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "open";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
    }, {
        readonly name: "settle";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "topUp";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "close";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "captureAmount";
        }, {
            readonly type: "bytes";
            readonly name: "signature";
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "requestClose";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "withdraw";
        readonly type: "function";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [];
    }, {
        readonly name: "getChannel";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "tuple";
            readonly name: "descriptor";
            readonly components: readonly [{
                readonly type: "address";
                readonly name: "payer";
            }, {
                readonly type: "address";
                readonly name: "payee";
            }, {
                readonly type: "address";
                readonly name: "operator";
            }, {
                readonly type: "address";
                readonly name: "token";
            }, {
                readonly type: "bytes32";
                readonly name: "salt";
            }, {
                readonly type: "address";
                readonly name: "authorizedSigner";
            }, {
                readonly type: "bytes32";
                readonly name: "expiringNonceHash";
            }];
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "tuple";
                readonly name: "descriptor";
                readonly components: readonly [{
                    readonly type: "address";
                    readonly name: "payer";
                }, {
                    readonly type: "address";
                    readonly name: "payee";
                }, {
                    readonly type: "address";
                    readonly name: "operator";
                }, {
                    readonly type: "address";
                    readonly name: "token";
                }, {
                    readonly type: "bytes32";
                    readonly name: "salt";
                }, {
                    readonly type: "address";
                    readonly name: "authorizedSigner";
                }, {
                    readonly type: "bytes32";
                    readonly name: "expiringNonceHash";
                }];
            }, {
                readonly type: "tuple";
                readonly name: "state";
                readonly components: readonly [{
                    readonly type: "uint96";
                    readonly name: "settled";
                }, {
                    readonly type: "uint96";
                    readonly name: "deposit";
                }, {
                    readonly type: "uint32";
                    readonly name: "closeRequestedAt";
                }];
            }];
        }];
    }, {
        readonly name: "getChannelState";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "getChannelStatesBatch";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32[]";
            readonly name: "channelIds";
        }];
        readonly outputs: readonly [{
            readonly type: "tuple[]";
            readonly components: readonly [{
                readonly type: "uint96";
                readonly name: "settled";
            }, {
                readonly type: "uint96";
                readonly name: "deposit";
            }, {
                readonly type: "uint32";
                readonly name: "closeRequestedAt";
            }];
        }];
    }, {
        readonly name: "computeChannelId";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "address";
            readonly name: "payer";
        }, {
            readonly type: "address";
            readonly name: "payee";
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "getVoucherDigest";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "domainSeparator";
        readonly type: "function";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "bytes32";
        }];
    }, {
        readonly name: "ChannelOpened";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "operator";
        }, {
            readonly type: "address";
            readonly name: "token";
        }, {
            readonly type: "address";
            readonly name: "authorizedSigner";
        }, {
            readonly type: "bytes32";
            readonly name: "salt";
        }, {
            readonly type: "bytes32";
            readonly name: "expiringNonceHash";
        }, {
            readonly type: "uint96";
            readonly name: "deposit";
        }];
    }, {
        readonly name: "Settled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "cumulativeAmount";
        }, {
            readonly type: "uint96";
            readonly name: "deltaPaid";
        }, {
            readonly type: "uint96";
            readonly name: "newSettled";
        }];
    }, {
        readonly name: "TopUp";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "additionalDeposit";
        }, {
            readonly type: "uint96";
            readonly name: "newDeposit";
        }];
    }, {
        readonly name: "CloseRequested";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint256";
            readonly name: "closeGraceEnd";
        }];
    }, {
        readonly name: "ChannelClosed";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }, {
            readonly type: "uint96";
            readonly name: "settledToPayee";
        }, {
            readonly type: "uint96";
            readonly name: "refundedToPayer";
        }];
    }, {
        readonly name: "CloseRequestCancelled";
        readonly type: "event";
        readonly inputs: readonly [{
            readonly type: "bytes32";
            readonly name: "channelId";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payer";
            readonly indexed: true;
        }, {
            readonly type: "address";
            readonly name: "payee";
            readonly indexed: true;
        }];
    }, {
        readonly name: "ChannelAlreadyExists";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ChannelNotFound";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayer";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "NotPayeeOrOperator";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidPayee";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ZeroDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "ExpiringNonceHashNotSet";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "InvalidSignature";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountExceedsDeposit";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "AmountNotIncreasing";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CaptureAmountInvalid";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "CloseNotReady";
        readonly type: "error";
        readonly inputs: readonly [];
    }, {
        readonly name: "DepositOverflow";
        readonly type: "error";
        readonly inputs: readonly [];
    }], "ChannelClosed">;
}
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
export declare function withdrawSync<chain extends Chain | undefined, account extends Account | undefined>(client: Client<Transport, chain, account>, parameters: withdrawSync.Parameters<chain, account>): Promise<withdrawSync.ReturnValue>;
export declare namespace withdrawSync {
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined> = withdraw.Parameters<chain, account>;
    type Args = withdraw.Args;
    type ReturnValue = Compute<GetEventArgs<typeof Abis.tip20ChannelReserve, 'ChannelClosed', {
        IndexedOnly: false;
        Required: true;
    }> & {
        /** Transaction receipt. */
        receipt: TransactionReceipt;
    }>;
}
//# sourceMappingURL=channel.d.ts.map