import type { CaipAddress, CaipNetworkId } from '@reown/appkit-common';
import { FetchUtil, type RequestArguments } from '../utils/FetchUtil.js';
import type { BlockchainApiBalanceResponse, BlockchainApiGasPriceRequest, BlockchainApiGasPriceResponse, BlockchainApiGenerateApproveCalldataRequest, BlockchainApiGenerateApproveCalldataResponse, BlockchainApiGenerateSwapCalldataRequest, BlockchainApiGenerateSwapCalldataResponse, BlockchainApiGetAddressBalanceRequest, BlockchainApiIdentityRequest, BlockchainApiIdentityResponse, BlockchainApiLookupEnsName, BlockchainApiRegisterNameParams, BlockchainApiSuggestionResponse, BlockchainApiSwapAllowanceRequest, BlockchainApiSwapQuoteRequest, BlockchainApiSwapQuoteResponse, BlockchainApiSwapTokensRequest, BlockchainApiSwapTokensResponse, BlockchainApiTokenPriceRequest, BlockchainApiTokenPriceResponse, BlockchainApiTransactionsRequest, BlockchainApiTransactionsResponse, GenerateOnRampUrlArgs, GetQuoteArgs, OnrampQuote, PaymentCurrency, PurchaseCurrency } from '../utils/TypeUtil.js';
export interface BlockchainApiControllerState {
    clientId: string | null;
    api: FetchUtil;
    supportedChains: {
        http: CaipNetworkId[];
        ws: CaipNetworkId[];
    };
}
export declare const BlockchainApiController: {
    state: BlockchainApiControllerState;
    get<T>(request: RequestArguments): Promise<T>;
    getSdkProperties(): {
        st: "appkit";
        sv: import("../utils/TypeUtil.js").SdkVersion;
    };
    isNetworkSupported(networkId?: CaipNetworkId): Promise<boolean>;
    getSupportedNetworks(): Promise<{
        http: CaipNetworkId[];
        ws: CaipNetworkId[];
    }>;
    fetchIdentity({ address }: BlockchainApiIdentityRequest): Promise<BlockchainApiIdentityResponse>;
    fetchTransactions({ account, cursor, signal, cache, chainId }: BlockchainApiTransactionsRequest): Promise<BlockchainApiTransactionsResponse | {
        data: never[];
        next: undefined;
    }>;
    fetchSwapQuote({ amount, userAddress, from, to, gasPrice }: BlockchainApiSwapQuoteRequest): Promise<BlockchainApiSwapQuoteResponse>;
    fetchSwapTokens({ chainId }: BlockchainApiSwapTokensRequest): Promise<BlockchainApiSwapTokensResponse>;
    getAddressBalance({ caipNetworkId, address }: BlockchainApiGetAddressBalanceRequest): Promise<string>;
    fetchTokenPrice({ addresses, caipNetworkId }: BlockchainApiTokenPriceRequest): Promise<BlockchainApiTokenPriceResponse>;
    fetchSwapAllowance({ tokenAddress, userAddress }: BlockchainApiSwapAllowanceRequest): Promise<{
        allowance: string;
    }>;
    fetchGasPrice({ chainId }: BlockchainApiGasPriceRequest): Promise<BlockchainApiGasPriceResponse>;
    generateSwapCalldata({ amount, from, to, userAddress, disableEstimate }: BlockchainApiGenerateSwapCalldataRequest): Promise<BlockchainApiGenerateSwapCalldataResponse>;
    generateApproveCalldata({ from, to, userAddress }: BlockchainApiGenerateApproveCalldataRequest): Promise<BlockchainApiGenerateApproveCalldataResponse>;
    getBalance(address: string, chainId?: string, forceUpdate?: string): Promise<BlockchainApiBalanceResponse>;
    lookupEnsName(name: string): Promise<BlockchainApiLookupEnsName | {
        addresses: {};
        attributes: never[];
    }>;
    reverseLookupEnsName({ address }: {
        address: string;
    }): Promise<BlockchainApiLookupEnsName[]>;
    getEnsNameSuggestions(name: string): Promise<BlockchainApiSuggestionResponse>;
    registerEnsName({ coinType, address, message, signature }: BlockchainApiRegisterNameParams): Promise<unknown>;
    generateOnRampURL({ destinationWallets, partnerUserId, defaultNetwork, purchaseAmount, paymentAmount }: GenerateOnRampUrlArgs): Promise<string>;
    getOnrampOptions(): Promise<{
        paymentCurrencies: PaymentCurrency[];
        purchaseCurrencies: PurchaseCurrency[];
    }>;
    getOnrampQuote({ purchaseCurrency, paymentCurrency, amount, network }: GetQuoteArgs): Promise<OnrampQuote | null>;
    getSmartSessions(caipAddress: CaipAddress): Promise<unknown>;
    revokeSmartSession(address: `0x${string}`, pci: string, signature: string): Promise<unknown>;
    setClientId(clientId: string | null): void;
};
