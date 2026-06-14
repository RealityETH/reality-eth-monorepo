import { type ChainNamespace } from '@reown/appkit-common';
import { type PaymentAsset } from '@reown/appkit-controllers';
import type { Exchange, ExchangeBuyStatus } from '../types/exchange.js';
import type { Quote, QuoteStatus } from '../types/quote.js';
export declare function getApiUrl(): string;
type GetExchangesParams = {
    page: number;
    includeOnly?: string[];
    exclude?: string[];
    asset?: string;
    amount?: string;
};
export type GetExchangesResult = {
    exchanges: Exchange[];
    total: number;
};
type GetPayUrlParams = {
    exchangeId: string;
    asset: string;
    amount: string;
    recipient: string;
};
type GetPayUrlResult = {
    url: string;
    sessionId: string;
};
type GetBuyStatusParams = {
    sessionId: string;
    exchangeId: string;
};
type GetBuyStatusResult = {
    status: ExchangeBuyStatus;
    txHash?: string;
};
type GetTransfersQuoteParams = {
    address?: string;
    sourceToken: PaymentAsset;
    toToken: PaymentAsset;
    recipient: string;
    amount: string;
};
type GetQuoteParams = {
    address?: string;
    sourceToken: PaymentAsset;
    toToken: PaymentAsset;
    recipient: string;
    amount: string;
};
type GetQuoteStatusParams = {
    requestId: string;
};
type GetQuoteStatusResult = {
    status: QuoteStatus;
};
type GetAssetsForExchangeResult = {
    exchangeId: string;
    assets: Record<ChainNamespace, PaymentAsset[]>;
};
export declare function getExchanges(params: GetExchangesParams): Promise<GetExchangesResult>;
export declare function getPayUrl(params: GetPayUrlParams): Promise<GetPayUrlResult>;
export declare function getBuyStatus(params: GetBuyStatusParams): Promise<GetBuyStatusResult>;
export declare function getTransfersQuote(params: GetTransfersQuoteParams): Promise<Quote>;
export declare function getQuote(params: GetQuoteParams): Promise<Quote>;
export declare function getQuoteStatus(params: GetQuoteStatusParams): Promise<GetQuoteStatusResult>;
export declare function getAssetsForExchange(exchangeId: string): Promise<GetAssetsForExchangeResult>;
export {};
