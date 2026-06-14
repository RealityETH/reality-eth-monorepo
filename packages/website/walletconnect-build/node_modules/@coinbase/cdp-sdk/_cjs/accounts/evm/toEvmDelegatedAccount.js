"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEvmDelegatedAccount = toEvmDelegatedAccount;
const toEvmSmartAccount_js_1 = require("./toEvmSmartAccount.js");
const index_js_1 = require("../../openapi-client/index.js");
/**
 * Creates an EvmSmartAccount view of a server account for use after EIP-7702 delegation.
 * Uses the API client configured by your CdpClient instance.
 *
 * The returned account has the same address as the EOA and uses the server account as owner,
 * so you can call sendUserOperation, waitForUserOperation, etc.
 *
 * @param account - The server account (EOA) that has been delegated via EIP-7702.
 * @returns An EvmSmartAccount view ready for user operation submission.
 */
function toEvmDelegatedAccount(account) {
    return (0, toEvmSmartAccount_js_1.toEvmSmartAccount)(index_js_1.CdpOpenApiClient, {
        smartAccount: {
            address: account.address,
            owners: [account.address],
            name: account.name,
            policies: account.policies,
        },
        owner: account,
    });
}
//# sourceMappingURL=toEvmDelegatedAccount.js.map