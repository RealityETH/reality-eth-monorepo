import type { Address } from 'abitype';
import type { Account } from '../../accounts/types.js';
import type { Client } from '../../clients/createClient.js';
import type { Transport } from '../../clients/transports/createTransport.js';
import { erc20Abi } from '../../constants/abis.js';
import type { BaseErrorType } from '../../errors/base.js';
import type { Tokens } from '../../tokens/defineToken.js';
import type { Chain } from '../../types/chain.js';
import type { Log } from '../../types/log.js';
import { type SimulateContractReturnType } from '../public/simulateContract.js';
import type { WriteContractReturnType } from '../wallet/writeContract.js';
import { writeContract } from '../wallet/writeContract.js';
import type { writeContractSync } from '../wallet/writeContractSync.js';
import { type AmountInput, type TokenParameter, type WriteParameters } from './internal.js';
/**
 * Approves a spender to transfer ERC-20 tokens on behalf of the caller.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { token } from 'viem/actions'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const hash = await token.approve(client, {
 *   amount: 100000000n,
 *   spender: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export declare function approve<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, parameters: approve.Parameters<chain, account, tokens>): Promise<approve.ReturnValue>;
export declare namespace approve {
    type Args<chain extends Chain | undefined = Chain | undefined, tokens extends Tokens | undefined = Tokens | undefined> = {
        /** Amount to approve in base units, or as a formatted helper. */
        amount: AmountInput;
        /** Address of the spender. */
        spender: Address;
    } & TokenParameter<chain, tokens>;
    type Parameters<chain extends Chain | undefined = Chain | undefined, account extends Account | undefined = Account | undefined, tokens extends Tokens | undefined = Tokens | undefined> = WriteParameters<chain, account> & Args<chain, tokens>;
    type ReturnValue = WriteContractReturnType;
    type ErrorType = BaseErrorType;
    /** @internal */
    function inner<action extends typeof writeContract | typeof writeContractSync, chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(action: action, client: Client<Transport, chain, account, undefined, undefined, tokens>, parameters: approve.Parameters<chain, account, tokens>): Promise<ReturnType<action>>;
    /**
     * Defines a call to the `approve` function.
     *
     * Can be passed as a parameter to `estimateContractGas`, `simulateContract`,
     * `sendCalls`, `sendTransaction` (`calls`), or `multicall`. The token is
     * selected by `token`, which is either a token symbol (resolved from the
     * client's `tokens` array) or a contract `address`; `amount.decimals`
     * is inferred from declared client tokens when omitted.
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The call.
     */
    function call<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, parameters: Args<chain, tokens>): {
        abi: [{
            readonly type: "function";
            readonly name: "approve";
            readonly stateMutability: "nonpayable";
            readonly inputs: readonly [{
                readonly name: "spender";
                readonly type: "address";
            }, {
                readonly name: "amount";
                readonly type: "uint256";
            }];
            readonly outputs: readonly [{
                readonly type: "bool";
            }];
        }];
        functionName: "approve";
    } & {
        args: readonly [spender: `0x${string}`, amount: bigint];
    } & {
        address: Address;
    } & {
        data: import("../../index.js").Hex;
        to: Address;
    };
    /**
     * Estimates the gas required to approve a spender. `amount.decimals` is
     * inferred from declared client tokens when omitted.
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The gas estimate.
     */
    function estimateGas<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, parameters: approve.Parameters<chain, account, tokens>): Promise<bigint>;
    /**
     * Simulates an approval of a spender. `amount.decimals` is inferred from
     * declared client tokens when omitted.
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The simulation result and write request.
     */
    function simulate<chain extends Chain | undefined, account extends Account | undefined, tokens extends Tokens | undefined = undefined>(client: Client<Transport, chain, account, undefined, undefined, tokens>, parameters: approve.Parameters<chain, account, tokens>): Promise<SimulateContractReturnType<typeof erc20Abi, 'approve'>>;
    /**
     * Extracts the `Approval` event from logs.
     *
     * @param logs - The logs.
     * @returns The `Approval` event.
     */
    function extractEvent(logs: Log[]): Log<bigint, number, false, undefined, true, readonly [{
        readonly type: "event";
        readonly name: "Approval";
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly name: "owner";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly name: "spender";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly name: "value";
            readonly type: "uint256";
        }];
    }, {
        readonly type: "event";
        readonly name: "Transfer";
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly name: "value";
            readonly type: "uint256";
        }];
    }, {
        readonly type: "function";
        readonly name: "allowance";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly name: "owner";
            readonly type: "address";
        }, {
            readonly name: "spender";
            readonly type: "address";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly type: "function";
        readonly name: "approve";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly name: "spender";
            readonly type: "address";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly type: "function";
        readonly name: "balanceOf";
        readonly stateMutability: "view";
        readonly inputs: readonly [{
            readonly name: "account";
            readonly type: "address";
        }];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly type: "function";
        readonly name: "decimals";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint8";
        }];
    }, {
        readonly type: "function";
        readonly name: "name";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "string";
        }];
    }, {
        readonly type: "function";
        readonly name: "symbol";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "string";
        }];
    }, {
        readonly type: "function";
        readonly name: "totalSupply";
        readonly stateMutability: "view";
        readonly inputs: readonly [];
        readonly outputs: readonly [{
            readonly type: "uint256";
        }];
    }, {
        readonly type: "function";
        readonly name: "transfer";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly name: "recipient";
            readonly type: "address";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }, {
        readonly type: "function";
        readonly name: "transferFrom";
        readonly stateMutability: "nonpayable";
        readonly inputs: readonly [{
            readonly name: "sender";
            readonly type: "address";
        }, {
            readonly name: "recipient";
            readonly type: "address";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly outputs: readonly [{
            readonly type: "bool";
        }];
    }], "Approval">;
}
//# sourceMappingURL=approve.d.ts.map