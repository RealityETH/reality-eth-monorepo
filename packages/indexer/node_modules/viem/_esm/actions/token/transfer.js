import { erc20Abi } from '../../constants/abis.js';
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js';
import { estimateContractGas } from '../public/estimateContractGas.js';
import { simulateContract, } from '../public/simulateContract.js';
import { writeContract } from '../wallet/writeContract.js';
import { defineCall, pickWriteParameters, resolveToken, toBaseUnits, } from './internal.js';
/**
 * Transfers ERC-20 tokens to another address.
 *
 * Pass `from` to transfer on behalf of another address using an allowance
 * (calls `transferFrom`); otherwise transfers from the caller (calls
 * `transfer`).
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
 * const hash = await token.transfer(client, {
 *   amount: 100000000n,
 *   to: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @example
 * ```ts
 * // Transfer on behalf of another address (via an allowance).
 * const hash = await token.transfer(client, {
 *   amount: 100000000n,
 *   from: '0x...',
 *   to: '0x...',
 *   token: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function transfer(client, parameters) {
    return transfer.inner(writeContract, client, parameters);
}
(function (transfer) {
    /** @internal */
    async function inner(action, client, parameters) {
        return (await action(client, {
            ...parameters,
            ...transfer.call(client, parameters),
        }));
    }
    transfer.inner = inner;
    /**
     * Defines a call to the `transfer` (or `transferFrom`, when `from` is given)
     * function.
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
    function call(client, parameters) {
        return defineCall(getCall(client, parameters));
    }
    transfer.call = call;
    /**
     * Estimates the gas required to transfer ERC-20 tokens. `amount.decimals` is
     * inferred from declared client tokens when omitted.
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The gas estimate.
     */
    async function estimateGas(client, parameters) {
        return estimateContractGas(client, {
            ...pickWriteParameters(parameters),
            ...transfer.call(client, parameters),
        });
    }
    transfer.estimateGas = estimateGas;
    /**
     * Simulates a transfer of ERC-20 tokens. `amount.decimals` is inferred from
     * declared client tokens when omitted.
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The simulation result and write request.
     */
    async function simulate(client, parameters) {
        return simulateContract(client, {
            ...pickWriteParameters(parameters),
            ...transfer.call(client, parameters),
        });
    }
    transfer.simulate = simulate;
    /**
     * Extracts the `Transfer` event from logs.
     *
     * @param logs - The logs.
     * @returns The `Transfer` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
            abi: erc20Abi,
            logs,
            eventName: 'Transfer',
            strict: true,
        });
        if (!log)
            throw new Error('`Transfer` event not found.');
        return log;
    }
    transfer.extractEvent = extractEvent;
})(transfer || (transfer = {}));
/** Builds the underlying `transfer`/`transferFrom` contract call. @internal */
function getCall(client, parameters) {
    const { amount, from, to, token } = parameters;
    const { address, decimals } = resolveToken(client, { token });
    const value = toBaseUnits(amount, decimals);
    if (from)
        return {
            abi: erc20Abi,
            address,
            args: [from, to, value],
            functionName: 'transferFrom',
        };
    return {
        abi: erc20Abi,
        address,
        args: [to, value],
        functionName: 'transfer',
    };
}
//# sourceMappingURL=transfer.js.map