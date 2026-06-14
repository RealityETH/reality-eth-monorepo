import { getTypesForEIP712Domain, serializeTransaction, hashMessage, } from "viem";
import { toNetworkScopedEvmServerAccount } from "./toNetworkScopedEvmServerAccount.js";
import { listTokenBalances, } from "../../actions/evm/listTokenBalances.js";
import { requestFaucet, } from "../../actions/evm/requestFaucet.js";
import { sendTransaction } from "../../actions/evm/sendTransaction.js";
import { useSpendPermission } from "../../actions/evm/spend-permissions/account.use.js";
import { createSwapQuote } from "../../actions/evm/swap/createSwapQuote.js";
import { sendSwapTransaction } from "../../actions/evm/swap/sendSwapTransaction.js";
import { accountTransferStrategy } from "../../actions/evm/transfer/accountTransferStrategy.js";
import { transfer } from "../../actions/evm/transfer/transfer.js";
import { Analytics } from "../../analytics.js";
/**
 * Creates a Server-managed EvmAccount instance from an existing EvmAccount.
 * Use this to interact with previously deployed EvmAccounts, rather than creating new ones.
 *
 * @param {CdpOpenApiClientType} apiClient - The API client.
 * @param {ToEvmServerAccountOptions} options - Configuration options.
 * @param {EvmAccount} options.account - The EvmAccount that was previously created.
 * @returns {EvmServerAccount} A configured EvmAccount instance ready for signing.
 */
export function toEvmServerAccount(apiClient, options) {
    const account = {
        address: options.account.address,
        async signMessage({ message }) {
            Analytics.trackAction({
                action: "sign_message",
                accountType: "evm_server",
            });
            try {
                if (typeof message === "string") {
                    const result = await apiClient.signEvmMessage(options.account.address, {
                        message,
                    });
                    return result.signature;
                }
                const result = await apiClient.signEvmHash(options.account.address, {
                    hash: hashMessage(message),
                });
                return result.signature;
            }
            catch (error) {
                Analytics.trackError(error, "signMessage");
                throw error;
            }
        },
        async sign(parameters) {
            Analytics.trackAction({
                action: "sign",
                accountType: "evm_server",
            });
            try {
                const result = await apiClient.signEvmHash(options.account.address, {
                    hash: parameters.hash,
                });
                return result.signature;
            }
            catch (error) {
                Analytics.trackError(error, "sign");
                throw error;
            }
        },
        async signTransaction(transaction) {
            Analytics.trackAction({
                action: "sign_transaction",
                accountType: "evm_server",
            });
            try {
                const result = await apiClient.signEvmTransaction(options.account.address, {
                    transaction: serializeTransaction(transaction),
                });
                return result.signedTransaction;
            }
            catch (error) {
                Analytics.trackError(error, "signTransaction");
                throw error;
            }
        },
        async signTypedData(parameters) {
            Analytics.trackAction({
                action: "sign_typed_data",
                accountType: "evm_server",
            });
            try {
                const { domain = {}, message, primaryType } = parameters;
                const types = {
                    EIP712Domain: getTypesForEIP712Domain({ domain }),
                    ...parameters.types,
                };
                const openApiMessage = {
                    domain: domain,
                    types,
                    primaryType,
                    message,
                };
                const result = await apiClient.signEvmTypedData(options.account.address, openApiMessage);
                return result.signature;
            }
            catch (error) {
                Analytics.trackError(error, "signTypedData");
                throw error;
            }
        },
        async transfer(transferArgs) {
            Analytics.trackAction({
                action: "transfer",
                accountType: "evm_server",
                properties: {
                    network: transferArgs.network,
                },
            });
            try {
                return transfer(apiClient, account, transferArgs, accountTransferStrategy);
            }
            catch (error) {
                Analytics.trackError(error, "transfer");
                throw error;
            }
        },
        async listTokenBalances(options) {
            Analytics.trackAction({
                action: "list_token_balances",
                accountType: "evm_server",
                properties: {
                    network: options.network,
                },
            });
            try {
                return listTokenBalances(apiClient, {
                    ...options,
                    address: this.address,
                });
            }
            catch (error) {
                Analytics.trackError(error, "listTokenBalances");
                throw error;
            }
        },
        async requestFaucet(options) {
            Analytics.trackAction({
                action: "request_faucet",
                accountType: "evm_server",
                properties: {
                    network: options.network,
                },
            });
            try {
                return requestFaucet(apiClient, {
                    ...options,
                    address: this.address,
                });
            }
            catch (error) {
                Analytics.trackError(error, "requestFaucet");
                throw error;
            }
        },
        async sendTransaction(options) {
            Analytics.trackAction({
                action: "send_transaction",
                accountType: "evm_server",
                properties: {
                    network: options.network,
                },
            });
            try {
                return sendTransaction(apiClient, {
                    ...options,
                    address: this.address,
                });
            }
            catch (error) {
                Analytics.trackError(error, "sendTransaction");
                throw error;
            }
        },
        async quoteSwap(options) {
            Analytics.trackAction({
                action: "quote_swap",
                accountType: "evm_server",
                properties: {
                    network: options.network,
                },
            });
            try {
                return createSwapQuote(apiClient, {
                    ...options,
                    taker: this.address,
                });
            }
            catch (error) {
                Analytics.trackError(error, "quoteSwap");
                throw error;
            }
        },
        async swap(options) {
            Analytics.trackAction({
                action: "swap",
                accountType: "evm_server",
                properties: {
                    network: "network" in options ? options.network : undefined,
                },
            });
            try {
                return sendSwapTransaction(apiClient, {
                    ...options,
                    address: this.address,
                    taker: this.address, // Always use account's address as taker
                });
            }
            catch (error) {
                Analytics.trackError(error, "swap");
                throw error;
            }
        },
        async useSpendPermission(options) {
            Analytics.trackAction({
                action: "use_spend_permission",
                accountType: "evm_server",
                properties: {
                    network: options.network,
                },
            });
            try {
                return useSpendPermission(apiClient, this.address, options);
            }
            catch (error) {
                Analytics.trackError(error, "useSpendPermission");
                throw error;
            }
        },
        name: options.account.name,
        type: "evm-server",
        policies: options.account.policies,
        useNetwork: async (networkOrRpcUrl) => {
            Analytics.trackAction({
                action: "use_network",
                accountType: "evm_server",
                properties: {
                    network: networkOrRpcUrl,
                },
            });
            try {
                return toNetworkScopedEvmServerAccount({
                    account,
                    network: networkOrRpcUrl,
                });
            }
            catch (error) {
                Analytics.trackError(error, "useNetwork");
                throw error;
            }
        },
    };
    return account;
}
//# sourceMappingURL=toEvmServerAccount.js.map