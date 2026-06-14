import { type Address, type CaipNetwork, type ChainNamespace } from '@reown/appkit-common';
import { type PaymentAsset } from '@reown/appkit-controllers';
import type { PaymentOptions } from '../types/options.js';
import type { Quote } from '../types/quote.js';
interface EvmPaymentParams {
    recipient: Address;
    amount: number | string;
    fromAddress?: Address;
}
interface EnsureNetworkOptions {
    paymentAssetNetwork: string;
    activeCaipNetwork: CaipNetwork;
    approvedCaipNetworkIds: string[] | undefined;
    requestedCaipNetworks: CaipNetwork[] | undefined;
}
interface GetDirectTransferQuoteParams {
    sourceToken: PaymentAsset;
    toToken: PaymentAsset;
    recipient: string;
    amount: string;
}
export declare function ensureCorrectNetwork(options: EnsureNetworkOptions): Promise<void>;
export declare function ensureCorrectAddress(): void;
export declare function processEvmNativePayment(paymentAsset: PaymentOptions['paymentAsset'], chainNamespace: ChainNamespace, params: EvmPaymentParams): Promise<string | undefined>;
export declare function processEvmErc20Payment(paymentAsset: PaymentOptions['paymentAsset'], params: EvmPaymentParams): Promise<string | undefined>;
interface SolanaPaymentParams {
    recipient: string;
    amount: number | string;
    fromAddress?: string;
    tokenMint?: string;
}
export declare function processSolanaPayment(chainNamespace: ChainNamespace, params: SolanaPaymentParams): Promise<string | undefined>;
export declare function getDirectTransferQuote({ sourceToken, toToken, amount, recipient }: GetDirectTransferQuoteParams): Promise<Quote>;
export declare function getTransferStep(quote?: Quote): import("../types/quote.js").QuoteDepositStep | null;
export declare function getTransactionsSteps(quote?: Quote, completedTransactionsCount?: number): import("../types/quote.js").QuoteTransactionStep[];
export {};
