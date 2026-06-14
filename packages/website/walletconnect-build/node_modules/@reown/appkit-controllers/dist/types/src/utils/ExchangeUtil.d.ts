import { type CaipNetworkId } from '@reown/appkit-common';
type PayStatus = 'UNKNOWN' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
export type CurrentPayment = {
    type: PaymentType;
    exchangeId?: string;
    sessionId?: string;
    status?: PayStatus;
    result?: string;
};
export type PayResult = CurrentPayment['result'];
export type PaymentAsset = {
    network: CaipNetworkId;
    asset: string;
    metadata: {
        name: string;
        symbol: string;
        decimals: number;
        iconUrl?: string;
    };
    price?: number;
};
type PaymentType = 'wallet' | 'exchange';
export type Exchange = {
    id: string;
    imageUrl: string;
    name: string;
};
export type ExchangeBuyStatus = 'UNKNOWN' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
export type GetExchangesParams = {
    page?: number;
    asset?: string;
    amount?: number | string;
    network?: CaipNetworkId;
};
export type PayUrlParams = {
    network: CaipNetworkId;
    asset: string;
    amount: number | string;
    recipient: string;
};
export declare function getApiUrl(): string;
export type JsonRpcResponse<T> = {
    jsonrpc: string;
    id: number;
    result: T;
};
export type GetExchangesResult = {
    exchanges: Exchange[];
    total: number;
};
export type GetPayUrlParams = {
    exchangeId: string;
    asset: string;
    amount: string;
    recipient: string;
};
export type GetPayUrlResult = {
    url: string;
    sessionId: string;
};
export type GetBuyStatusParams = {
    sessionId: string;
    exchangeId: string;
};
export type GetBuyStatusResult = {
    status: ExchangeBuyStatus;
    txHash?: string;
};
export declare function getExchanges(params: GetExchangesParams): Promise<GetExchangesResult>;
export declare function getPayUrl(params: GetPayUrlParams): Promise<GetPayUrlResult>;
export declare function getBuyStatus(params: GetBuyStatusParams): Promise<GetBuyStatusResult>;
export declare function formatCaip19Asset(caipNetworkId: CaipNetworkId, asset: string): string;
export declare const baseUSDC: PaymentAsset;
export declare const baseSepoliaUSDC: PaymentAsset;
export declare const assets: {
    ethereumETH: PaymentAsset;
    baseETH: PaymentAsset;
    baseUSDC: PaymentAsset;
    baseSepoliaETH: PaymentAsset;
    ethereumUSDC: PaymentAsset;
    arbitrumUSDC: PaymentAsset;
    polygonUSDC: PaymentAsset;
    solanaUSDC: PaymentAsset;
    ethereumUSDT: PaymentAsset;
    optimismUSDT: PaymentAsset;
    arbitrumUSDT: PaymentAsset;
    polygonUSDT: PaymentAsset;
    solanaUSDT: PaymentAsset;
    solanaSOL: PaymentAsset;
};
export declare function getPaymentAssetsForNetwork(network: CaipNetworkId): PaymentAsset[];
export {};
