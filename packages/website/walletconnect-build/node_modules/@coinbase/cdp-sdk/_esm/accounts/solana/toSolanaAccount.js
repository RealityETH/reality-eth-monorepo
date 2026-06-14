import { requestFaucet } from "../../actions/solana/requestFaucet.js";
import { sendTransaction } from "../../actions/solana/sendTransaction.js";
import { signMessage } from "../../actions/solana/signMessage.js";
import { signTransaction } from "../../actions/solana/signTransaction.js";
import { transfer } from "../../actions/solana/transfer.js";
import { Analytics } from "../../analytics.js";
/**
 * Creates a Solana account instance with actions from an existing Solana account.
 * Use this to interact with previously deployed Solana accounts, rather than creating new ones.
 *
 * @param {CdpOpenApiClientType} apiClient - The API client.
 * @param {ToSolanaAccountOptions} options - Configuration options.
 * @param {Account} options.account - The Solana account that was previously created.
 * @returns {SolanaAccount} A configured SolanaAccount instance ready for signing.
 */
export function toSolanaAccount(apiClient, options) {
    const account = {
        address: options.account.address,
        name: options.account.name,
        policies: options.account.policies,
        async requestFaucet(options) {
            Analytics.trackAction({
                action: "request_faucet",
                accountType: "solana",
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
        async signMessage(options) {
            Analytics.trackAction({
                action: "sign_message",
                accountType: "solana",
            });
            try {
                return signMessage(apiClient, {
                    ...options,
                    address: account.address,
                });
            }
            catch (error) {
                Analytics.trackError(error, "signMessage");
                throw error;
            }
        },
        async signTransaction(options) {
            Analytics.trackAction({
                action: "sign_transaction",
                accountType: "solana",
            });
            try {
                return signTransaction(apiClient, {
                    ...options,
                    address: account.address,
                });
            }
            catch (error) {
                Analytics.trackError(error, "signTransaction");
                throw error;
            }
        },
        async sendTransaction(options) {
            Analytics.trackAction({
                action: "send_transaction",
                accountType: "solana",
            });
            try {
                return sendTransaction(apiClient, {
                    ...options,
                });
            }
            catch (error) {
                Analytics.trackError(error, "sendTransaction");
                throw error;
            }
        },
        async transfer(options) {
            Analytics.trackAction({
                action: "transfer",
                accountType: "solana",
                properties: {
                    network: options.network,
                },
            });
            try {
                return transfer(apiClient, {
                    ...options,
                    from: account.address,
                });
            }
            catch (error) {
                Analytics.trackError(error, "transfer");
                throw error;
            }
        },
    };
    return account;
}
//# sourceMappingURL=toSolanaAccount.js.map