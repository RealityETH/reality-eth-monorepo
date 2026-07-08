import { erc20Abi } from '../../constants/abis.js';
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js';
import { estimateContractGas } from '../public/estimateContractGas.js';
import { simulateContract, } from '../public/simulateContract.js';
import { writeContract } from '../wallet/writeContract.js';
import { defineCall, pickWriteParameters, resolveToken, toBaseUnits, } from './internal.js';
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
export async function approve(client, parameters) {
    return approve.inner(writeContract, client, parameters);
}
(function (approve) {
    /** @internal */
    async function inner(action, client, parameters) {
        return (await action(client, {
            ...parameters,
            ...approve.call(client, parameters),
        }));
    }
    approve.inner = inner;
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
    function call(client, parameters) {
        return defineCall(getCall(client, parameters));
    }
    approve.call = call;
    /**
     * Estimates the gas required to approve a spender. `amount.decimals` is
     * inferred from declared client tokens when omitted.
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The gas estimate.
     */
    async function estimateGas(client, parameters) {
        return estimateContractGas(client, {
            ...pickWriteParameters(parameters),
            ...approve.call(client, parameters),
        });
    }
    approve.estimateGas = estimateGas;
    /**
     * Simulates an approval of a spender. `amount.decimals` is inferred from
     * declared client tokens when omitted.
     *
     * @param client - Client.
     * @param parameters - Parameters.
     * @returns The simulation result and write request.
     */
    async function simulate(client, parameters) {
        return simulateContract(client, {
            ...pickWriteParameters(parameters),
            ...approve.call(client, parameters),
        });
    }
    approve.simulate = simulate;
    /**
     * Extracts the `Approval` event from logs.
     *
     * @param logs - The logs.
     * @returns The `Approval` event.
     */
    function extractEvent(logs) {
        const [log] = parseEventLogs({
            abi: erc20Abi,
            logs,
            eventName: 'Approval',
            strict: true,
        });
        if (!log)
            throw new Error('`Approval` event not found.');
        return log;
    }
    approve.extractEvent = extractEvent;
})(approve || (approve = {}));
/** Builds the underlying `approve` contract call. @internal */
function getCall(client, parameters) {
    const { amount, spender, token } = parameters;
    const { address, decimals } = resolveToken(client, { token });
    return {
        abi: erc20Abi,
        address,
        args: [spender, toBaseUnits(amount, decimals)],
        functionName: 'approve',
    };
}
//# sourceMappingURL=approve.js.map