import { type CaipNetworkId } from '@reown/appkit-common';
import { type GetBuyStatusResult } from '../utils/ExchangeUtil.js';
import type { CurrentPayment, Exchange, PayUrlParams, PaymentAsset } from '../utils/ExchangeUtil.js';
export declare const DEFAULT_STATE: ExchangeControllerState;
export interface ExchangeControllerState {
    amount: number | null;
    tokenAmount: number;
    priceLoading: boolean;
    error: string | null;
    isLoading: boolean;
    exchanges: Exchange[];
    currentPayment?: CurrentPayment;
    paymentAsset: PaymentAsset | null;
    isPaymentInProgress: boolean;
    paymentId: string;
    assets: PaymentAsset[];
}
type StateKey = keyof ExchangeControllerState;
export declare const ExchangeController: {
    state: ExchangeControllerState;
    subscribe(callback: (newState: ExchangeControllerState) => void): () => void;
    subscribeKey<K extends StateKey>(key: K, callback: (value: ExchangeControllerState[K]) => void): () => void;
    resetState(): void;
    getAssetsForNetwork(network: CaipNetworkId): Promise<{
        price: number;
        metadata: {
            iconUrl: string | undefined;
            name: string;
            symbol: string;
            decimals: number;
        };
        network: CaipNetworkId;
        asset: string;
    }[]>;
    getAssetsImageAndPrice(assets: PaymentAsset[]): Promise<import("../utils/TypeUtil.js").BlockchainApiTokenPriceResponse[]>;
    getTokenAmount(): number;
    setAmount(amount: number | null): void;
    setPaymentAsset(asset: PaymentAsset): void;
    isPayWithExchangeEnabled(): boolean | undefined;
    isPayWithExchangeSupported(): boolean | undefined;
    fetchExchanges(): Promise<void>;
    getPayUrl(exchangeId: string, params: PayUrlParams): Promise<import("../utils/ExchangeUtil.js").GetPayUrlResult>;
    handlePayWithExchange(exchangeId: string): Promise<void>;
    waitUntilComplete({ exchangeId, sessionId, paymentId, retries }: {
        exchangeId: string;
        sessionId: string;
        paymentId: string;
        retries?: number;
    }): Promise<GetBuyStatusResult>;
    getBuyStatus(exchangeId: string, sessionId: string, paymentId: string): Promise<GetBuyStatusResult>;
    reset(): void;
};
export {};
