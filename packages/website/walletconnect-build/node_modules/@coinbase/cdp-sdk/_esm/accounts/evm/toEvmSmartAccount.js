import { createPublicClient, http } from "viem";
import { wrapSignatureWithEip6492IfUndeployed } from "./eip6492.js";
import { resolveNetworkToChain } from "./networkToChainResolver.js";
import { toNetworkScopedEvmSmartAccount } from "./toNetworkScopedEvmSmartAccount.js";
import { getUserOperation } from "../../actions/evm/getUserOperation.js";
import { listTokenBalances, } from "../../actions/evm/listTokenBalances.js";
import { requestFaucet, } from "../../actions/evm/requestFaucet.js";
import { sendUserOperation, } from "../../actions/evm/sendUserOperation.js";
import { signAndWrapTypedDataForSmartAccount } from "../../actions/evm/signAndWrapTypedDataForSmartAccount.js";
import { useSpendPermission } from "../../actions/evm/spend-permissions/smartAccount.use.js";
import { createSwapQuote } from "../../actions/evm/swap/createSwapQuote.js";
import { sendSwapOperation } from "../../actions/evm/swap/sendSwapOperation.js";
import { smartAccountTransferStrategy } from "../../actions/evm/transfer/smartAccountTransferStrategy.js";
import { transfer } from "../../actions/evm/transfer/transfer.js";
import { waitForUserOperation, } from "../../actions/evm/waitForUserOperation.js";
import { Analytics } from "../../analytics.js";
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
export function toEvmSmartAccount(apiClient, options) {
    const account = {
        address: options.smartAccount.address,
        owners: [options.owner],
        policies: options.smartAccount.policies,
        async transfer(transferArgs) {
            Analytics.trackAction({
                action: "transfer",
                accountType: "evm_smart",
                properties: {
                    network: transferArgs.network,
                },
            });
            try {
                return transfer(apiClient, account, transferArgs, smartAccountTransferStrategy);
            }
            catch (error) {
                Analytics.trackError(error, "transfer");
                throw error;
            }
        },
        async listTokenBalances(options) {
            Analytics.trackAction({
                action: "list_token_balances",
                accountType: "evm_smart",
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
        async sendUserOperation(options) {
            Analytics.trackAction({
                action: "send_user_operation",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                return sendUserOperation(apiClient, {
                    ...options,
                    smartAccount: account,
                });
            }
            catch (error) {
                Analytics.trackError(error, "sendUserOperation");
                throw error;
            }
        },
        async waitForUserOperation(options) {
            Analytics.trackAction({
                action: "wait_for_user_operation",
                accountType: "evm_smart",
            });
            try {
                return waitForUserOperation(apiClient, {
                    ...options,
                    smartAccountAddress: account.address,
                });
            }
            catch (error) {
                Analytics.trackError(error, "waitForUserOperation");
                throw error;
            }
        },
        async getUserOperation(options) {
            Analytics.trackAction({
                action: "get_user_operation",
                accountType: "evm_smart",
            });
            try {
                return getUserOperation(apiClient, {
                    ...options,
                    smartAccount: account,
                });
            }
            catch (error) {
                Analytics.trackError(error, "getUserOperation");
                throw error;
            }
        },
        async requestFaucet(options) {
            Analytics.trackAction({
                action: "request_faucet",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                return requestFaucet(apiClient, {
                    ...options,
                    address: account.address,
                });
            }
            catch (error) {
                Analytics.trackError(error, "requestFaucet");
                throw error;
            }
        },
        async quoteSwap(options) {
            Analytics.trackAction({
                action: "quote_swap",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                return createSwapQuote(apiClient, {
                    ...options,
                    taker: this.address, // Always use smart account's address as taker
                    signerAddress: this.owners[0].address, // Always use owner's address as signer
                    smartAccount: account, // Pass smart account for execute method support
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
                accountType: "evm_smart",
                properties: {
                    network: "network" in options ? options.network : undefined,
                },
            });
            try {
                return sendSwapOperation(apiClient, {
                    ...options,
                    smartAccount: account,
                    taker: this.address, // Always use smart account's address as taker
                    signerAddress: this.owners[0].address, // Always use owner's address as signer
                });
            }
            catch (error) {
                Analytics.trackError(error, "swap");
                throw error;
            }
        },
        async signTypedData(options) {
            Analytics.trackAction({
                action: "sign_typed_data",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                const chain = resolveNetworkToChain(options.network);
                const result = await signAndWrapTypedDataForSmartAccount(apiClient, {
                    chainId: BigInt(chain.id),
                    smartAccount: account,
                    typedData: options,
                });
                const publicClient = createPublicClient({ chain, transport: http() });
                return wrapSignatureWithEip6492IfUndeployed(publicClient, account.address, account.owners[0].address, result.signature);
            }
            catch (error) {
                Analytics.trackError(error, "signTypedData");
                throw error;
            }
        },
        async useSpendPermission(options) {
            Analytics.trackAction({
                action: "use_spend_permission",
                accountType: "evm_smart",
                properties: {
                    network: options.network,
                },
            });
            try {
                return useSpendPermission(apiClient, account, options);
            }
            catch (error) {
                Analytics.trackError(error, "useSpendPermission");
                throw error;
            }
        },
        name: options.smartAccount.name,
        type: "evm-smart",
        useNetwork: async (network) => {
            Analytics.trackAction({
                action: "use_network",
                accountType: "evm_smart",
                properties: {
                    network,
                },
            });
            try {
                return toNetworkScopedEvmSmartAccount(apiClient, {
                    smartAccount: account,
                    owner: options.owner,
                    network,
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
//# sourceMappingURL=toEvmSmartAccount.js.map