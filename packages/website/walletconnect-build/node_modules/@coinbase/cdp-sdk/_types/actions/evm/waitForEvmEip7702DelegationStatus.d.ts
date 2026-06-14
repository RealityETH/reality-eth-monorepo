import { CdpOpenApiClientType, EvmEip7702DelegationOperation } from "../../openapi-client/index.js";
import { WaitOptions } from "../../utils/wait.js";
/**
 * Options for waiting for an EIP-7702 delegation operation to complete.
 */
export type WaitForEvmEip7702DelegationOperationStatusOptions = {
    /** The delegation operation ID returned by createEvmEip7702Delegation. */
    delegationOperationId: string;
    /** Optional options for the wait operation. */
    waitOptions?: WaitOptions;
};
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
export declare function waitForEvmEip7702DelegationOperationStatus(client: CdpOpenApiClientType, options: WaitForEvmEip7702DelegationOperationStatusOptions): Promise<EvmEip7702DelegationOperation>;
//# sourceMappingURL=waitForEvmEip7702DelegationStatus.d.ts.map