"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEvmSmartAccount = toEvmSmartAccount;
const viem_1 = require("viem");
const eip6492_js_1 = require("./eip6492.js");
const networkToChainResolver_js_1 = require("./networkToChainResolver.js");
const toNetworkScopedEvmSmartAccount_js_1 = require("./toNetworkScopedEvmSmartAccount.js");
const getUserOperation_js_1 = require("../../actions/evm/getUserOperation.js");
const listTokenBalances_js_1 = require("../../actions/evm/listTokenBalances.js");
const requestFaucet_js_1 = require("../../actions/evm/requestFaucet.js");
const sendUserOperation_js_1 = require("../../actions/evm/sendUserOperation.js");
const signAndWrapTypedDataForSmartAccount_js_1 = require("../../actions/evm/signAndWrapTypedDataForSmartAccount.js");
const smartAccount_use_js_1 = require("../../actions/evm/spend-permissions/smartAccount.use.js");
const createSwapQuote_js_1 = require("../../actions/evm/swap/createSwapQuote.js");
const sendSwapOperation_js_1 = require("../../actions/evm/swap/sendSwapOperation.js");
const smartAccountTransferStrategy_js_1 = require("../../actions/evm/transfer/smartAccountTransferStrategy.js");
const transfer_js_1 = require("../../actions/evm/transfer/transfer.js");
const waitForUserOperation_js_1 = require("../../actions/evm/waitForUserOperation.js");
const analytics_js_1 = require("../../analytics.js");
/**
 * Creates a EvmSmartAccount instance from an existing EvmSmartAccount and owner.
 * Use this to interact with previously deployed EvmSmartAccounts, rather than creating new ones.
 *
 * The owner must be the original owner of the evm smart account.
 *
 * @param {CdpOpenApiClientType} apiClient - The API client.
 * @param {ToEvmSmartAccountOptions} options - Configuration options.
 * @param {EvmSmartAccount} options.smartAccount - The deployed evm smart account.
 * @param {EvmAccount} options.owner - The owner which signs for the smart account.
 * @returns {EvmSmartAccount} A configured EvmSmartAccount instance ready for user operation submission.
 */
function toEvmSmartAccount(apiClient, options) {
    const account = {
        address: options.smartAccount.address,
        owners: [options.owner],
        policies: options.smartAccount.policies,
        async transfer(transferArgs) {
            analytics_js_1.Analytics.trackAction({
                action: "transfer",
                accountType: "evm_smart",
                properties: {
                    network: transferArgs.network,
                },
            });
            try {
                return (0, transfer_js_1.transfer)(apiClient, account, transferArgs, smartAccountTransferStrategy_js_1.smartAccountTransferStrategy);
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "transfer");
                throw error;
            }
        },
        async listTokenBalances(options) {
            analytics_js_1.Analytics.trackAction({
                action: "list_token_balances",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                return (0, listTokenBalances_js_1.listTokenBalances)(apiClient, {
                    ...options,
                    address: this.address,
                });
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "listTokenBalances");
                throw error;
            }
        },
        async sendUserOperation(options) {
            analytics_js_1.Analytics.trackAction({
                action: "send_user_operation",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                return (0, sendUserOperation_js_1.sendUserOperation)(apiClient, {
                    ...options,
                    smartAccount: account,
                });
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "sendUserOperation");
                throw error;
            }
        },
        async waitForUserOperation(options) {
            analytics_js_1.Analytics.trackAction({
                action: "wait_for_user_operation",
                accountType: "evm_smart",
            });
            try {
                return (0, waitForUserOperation_js_1.waitForUserOperation)(apiClient, {
                    ...options,
                    smartAccountAddress: account.address,
                });
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "waitForUserOperation");
                throw error;
            }
        },
        async getUserOperation(options) {
            analytics_js_1.Analytics.trackAction({
                action: "get_user_operation",
                accountType: "evm_smart",
            });
            try {
                return (0, getUserOperation_js_1.getUserOperation)(apiClient, {
                    ...options,
                    smartAccount: account,
                });
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "getUserOperation");
                throw error;
            }
        },
        async requestFaucet(options) {
            analytics_js_1.Analytics.trackAction({
                action: "request_faucet",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                return (0, requestFaucet_js_1.requestFaucet)(apiClient, {
                    ...options,
                    address: account.address,
                });
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "requestFaucet");
                throw error;
            }
        },
        async quoteSwap(options) {
            analytics_js_1.Analytics.trackAction({
                action: "quote_swap",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                return (0, createSwapQuote_js_1.createSwapQuote)(apiClient, {
                    ...options,
                    taker: this.address, // Always use smart account's address as taker
                    signerAddress: this.owners[0].address, // Always use owner's address as signer
                    smartAccount: account, // Pass smart account for execute method support
                });
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "quoteSwap");
                throw error;
            }
        },
        async swap(options) {
            analytics_js_1.Analytics.trackAction({
                action: "swap",
                accountType: "evm_smart",
                properties: {
                    network: "network" in options ? options.network : undefined,
                },
            });
            try {
                return (0, sendSwapOperation_js_1.sendSwapOperation)(apiClient, {
                    ...options,
                    smartAccount: account,
                    taker: this.address, // Always use smart account's address as taker
                    signerAddress: this.owners[0].address, // Always use owner's address as signer
                });
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "swap");
                throw error;
            }
        },
        async signTypedData(options) {
            analytics_js_1.Analytics.trackAction({
                action: "sign_typed_data",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                const chain = (0, networkToChainResolver_js_1.resolveNetworkToChain)(options.network);
                const result = await (0, signAndWrapTypedDataForSmartAccount_js_1.signAndWrapTypedDataForSmartAccount)(apiClient, {
                    chainId: BigInt(chain.id),
                    smartAccount: account,
                    typedData: options,
                });
                const publicClient = (0, viem_1.createPublicClient)({ chain, transport: (0, viem_1.http)() });
                return (0, eip6492_js_1.wrapSignatureWithEip6492IfUndeployed)(publicClient, account.address, account.owners[0].address, result.signature);
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "signTypedData");
                throw error;
            }
        },
        async useSpendPermission(options) {
            analytics_js_1.Analytics.trackAction({
                action: "use_spend_permission",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                return (0, smartAccount_use_js_1.useSpendPermission)(apiClient, account, options);
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "useSpendPermission");
                throw error;
            }
        },
        name: options.smartAccount.name,
        type: "evm-smart",
        useNetwork: async (network) => {
            analytics_js_1.Analytics.trackAction({
                action: "use_network",
                accountType: "evm_smart",
                properties: {
                    network,
                },
            });
            try {
                return (0, toNetworkScopedEvmSmartAccount_js_1.toNetworkScopedEvmSmartAccount)(apiClient, {
                    smartAccount: account,
                    owner: options.owner,
                    network,
                });
            }
            catch (error) {
                analytics_js_1.Analytics.trackError(error, "useNetwork");
                throw error;
            }
        },
    };
    return account;
}
//# sourceMappingURL=toEvmSmartAccount.js.map