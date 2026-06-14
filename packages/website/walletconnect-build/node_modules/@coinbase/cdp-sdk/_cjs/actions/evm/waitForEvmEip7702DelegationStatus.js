"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForEvmEip7702DelegationOperationStatus = waitForEvmEip7702DelegationOperationStatus;
const index_js_1 = require("../../openapi-client/index.js");
const wait_js_1 = require("../../utils/wait.js");
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
async function waitForEvmEip7702DelegationOperationStatus(client, options) {
    const { delegationOperationId } = options;
    const reload = async () => {
        return client.getEvmEip7702DelegationOperationById(delegationOperationId);
    };
    const isTerminal = (operation) => {
        return (operation.status === index_js_1.EvmEip7702DelegationOperationStatus.COMPLETED ||
            operation.status === index_js_1.EvmEip7702DelegationOperationStatus.FAILED);
    };
    const waitOptions = options.waitOptions ?? { timeoutSeconds: 60 };
    return await (0, wait_js_1.wait)(reload, isTerminal, s => s, waitOptions);
}
//# sourceMappingURL=waitForEvmEip7702DelegationStatus.js.map