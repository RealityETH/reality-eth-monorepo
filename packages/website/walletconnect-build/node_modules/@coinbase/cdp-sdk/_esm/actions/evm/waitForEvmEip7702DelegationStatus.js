import { EvmEip7702DelegationOperationStatus, } from "../../openapi-client/index.js";
import { wait } from "../../utils/wait.js";
/**
 * Polls getEvmEip7702DelegationOperationById until the status is COMPLETED or FAILED, or a timeout occurs.
 *
 * @example
 * ```ts
 * import { waitForEvmEip7702DelegationOperationStatus } from "@coinbase/cdp-sdk";
 *
 * const operation = await waitForEvmEip7702DelegationOperationStatus(client, {
 *   delegationOperationId: "delegation-op-123",
 *   waitOptions: {
 *     timeoutSeconds: 60,
 *   },
 * });
 * ```
 *
 * @param {CdpOpenApiClientType} client - The client to use.
 * @param {WaitForEvmEip7702DelegationOperationStatusOptions} options - The options for the wait operation.
 * @returns {Promise<EvmEip7702DelegationOperation>} The delegation operation once it reaches a terminal status.
 */
export async function waitForEvmEip7702DelegationOperationStatus(client, options) {
    const { delegationOperationId } = options;
    const reload = async () => {
        return client.getEvmEip7702DelegationOperationById(delegationOperationId);
    };
    const isTerminal = (operation) => {
        return (operation.status === EvmEip7702DelegationOperationStatus.COMPLETED ||
            operation.status === EvmEip7702DelegationOperationStatus.FAILED);
    };
    const waitOptions = options.waitOptions ?? { timeoutSeconds: 60 };
    return await wait(reload, isTerminal, s => s, waitOptions);
}
//# sourceMappingURL=waitForEvmEip7702DelegationStatus.js.map