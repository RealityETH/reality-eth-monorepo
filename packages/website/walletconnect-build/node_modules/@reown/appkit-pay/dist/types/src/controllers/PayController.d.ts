import { type Balance, type CaipAddress, type CaipNetwork, type ChainNamespace } from '@reown/appkit-common';
import { type AppKitPayErrorMessage } from '../types/errors.js';
import type { Exchange } from '../types/exchange.js';
import type { GetExchangesParams, PayUrlParams, PaymentAsset, PaymentAssetWithAmount, PaymentChoice, PaymentOptions } from '../types/options.js';
import type { Quote, QuoteStatus, QuoteTransactionStep } from '../types/quote.js';
export declare const DIRECT_TRANSFER_REQUEST_ID = "direct-transfer";
export declare const DIRECT_TRANSFER_DEPOSIT_TYPE = "deposit";
export declare const DIRECT_TRANSFER_TRANSACTION_TYPE = "transaction";
type PayStatus = 'UNKNOWN' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
type OpenPayUrlParams = {
    exchangeId: string;
    openInNewTab?: boolean;
};
export type CurrentPayment = {
    type: PaymentType;
    exchangeId?: string;
    sessionId?: string;
    status?: PayStatus;
    result?: string;
};
export type PayResult = CurrentPayment['result'];
export interface PayControllerState extends PaymentOptions {
    isConfigured: boolean;
    error: AppKitPayErrorMessage | null;
    isPaymentInProgress: boolean;
    isLoading: boolean;
    exchanges: Exchange[];
    currentPayment?: CurrentPayment;
    analyticsSet: boolean;
    paymentId?: string;
    choice: PaymentChoice;
    tokenBalances: Partial<Record<ChainNamespace, Balance[]>>;
    isFetchingTokenBalances: boolean;
    selectedPaymentAsset: PaymentAssetWithAmount | null;
    quote?: Quote;
    quoteStatus: QuoteStatus;
    quoteError: string | null;
    isFetchingQuote: boolean;
    selectedExchange?: Exchange;
    exchangeUrlForQuote?: string;
    exchangeSessionId?: string;
    requestId?: string;
}
interface FetchTokensParams {
    caipAddress?: CaipAddress;
    caipNetwork?: CaipNetwork;
    namespace: ChainNamespace;
}
interface FetchQuoteParams {
    address?: string;
    sourceToken: PaymentAsset;
    toToken: PaymentAsset;
    recipient: string;
    amount: string;
}
interface FetchQuoteStatusParams {
    requestId: string;
}
interface OnTransferParams {
    chainNamespace: ChainNamespace;
    fromAddress: string;
    toAddress: string;
    amount: number | string;
    paymentAsset: PaymentAsset;
}
interface GenerateExchangeUrlForQuoteParams {
    exchangeId: string;
    paymentAsset: PaymentAsset;
    amount: number | string;
    recipient: string;
}
interface FetchTokensFromEOAParams {
    caipAddress?: CaipAddress;
    caipNetwork?: CaipNetwork;
    namespace: ChainNamespace;
}
type StateKey = keyof PayControllerState;
type PaymentType = 'wallet' | 'exchange';
export declare const PayController: {
    state: PayControllerState;
    subscribe(callback: (newState: PayControllerState) => void): () => void;
    subscribeKey<K extends StateKey>(key: K, callback: (value: PayControllerState[K]) => void): () => void;
    handleOpenPay(options: PaymentOptions): Promise<void>;
    resetState(): void;
    resetQuoteState(): void;
    setPaymentConfig(config: PaymentOptions): void;
    setSelectedPaymentAsset(paymentAsset: PaymentAssetWithAmount | null): void;
    setSelectedExchange(exchange?: Exchange): void;
    setRequestId(requestId: string): void;
    setPaymentInProgress(isPaymentInProgress: boolean): void;
    getPaymentAsset(): PaymentAsset;
    getExchanges(): Exchange[];
    fetchExchanges(): Promise<void>;
    getAvailableExchanges(params?: GetExchangesParams): Promise<import("../utils/ApiUtil.js").GetExchangesResult>;
    getPayUrl(exchangeId: string, params: PayUrlParams, headless?: boolean): Promise<{
        url: string;
        sessionId: string;
    }>;
    generateExchangeUrlForQuote({ exchangeId, paymentAsset, amount, recipient }: GenerateExchangeUrlForQuoteParams): Promise<void>;
    openPayUrl(openParams: OpenPayUrlParams, params: PayUrlParams, headless?: boolean): Promise<{
        url: string;
        sessionId: string;
    }>;
    onTransfer({ chainNamespace, fromAddress, toAddress, amount, paymentAsset }: OnTransferParams): Promise<void>;
    onSendTransaction(params: {
        namespace: ChainNamespace;
        transactionStep: QuoteTransactionStep;
    }): Promise<void>;
    getExchangeById(exchangeId: string): Exchange | undefined;
    validatePayConfig(config: PaymentOptions): void;
    handlePayWithExchange(exchangeId: string): Promise<{
        url: string;
        openInNewTab: boolean | undefined;
    } | null>;
    getBuyStatus(exchangeId: string, sessionId: string): Promise<{
        status: import("../types/exchange.js").ExchangeBuyStatus;
        txHash?: string;
    }>;
    fetchTokensFromEOA({ caipAddress, caipNetwork, namespace }: FetchTokensFromEOAParams): Promise<Balance[]>;
    fetchTokensFromExchange(): Promise<Balance[]>;
    fetchTokens({ caipAddress, caipNetwork, namespace }: FetchTokensParams): Promise<void>;
    fetchQuote({ amount, address, sourceToken, toToken, recipient }: FetchQuoteParams): Promise<void>;
    fetchQuoteStatus({ requestId }: FetchQuoteStatusParams): Promise<void>;
    initiatePayment(): void;
    initializeAnalytics(): void;
    prepareTokenLogo(): Promise<void>;
};
export {};
