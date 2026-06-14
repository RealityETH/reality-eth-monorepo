import type { Balance, CaipNetworkId } from '@reown/appkit-common';
import type { PaymentAsset, PaymentAssetWithAmount } from '../types/options.js';
export declare function formatCaip19Asset(caipNetworkId: CaipNetworkId, asset: string): string;
export declare function isPayWithWalletSupported(networkId: CaipNetworkId): boolean;
export declare function formatBalanceToPaymentAsset(balance: Balance): PaymentAssetWithAmount;
export declare function formatPaymentAssetToBalance(paymentAsset: PaymentAsset): Balance;
export declare function formatAmount(amount: string | number): string;
export declare function isTestnetAsset(paymentAsset: PaymentAsset): boolean;
