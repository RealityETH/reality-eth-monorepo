import type { WcWallet } from './TypeUtil.js';
export declare const ApiControllerUtil: {
    /**
     * Finds a wallet by ID across all wallet arrays (wallets, recommended, featured, search, etc.)
     * This is useful when a wallet might be in different arrays depending on the context
     */
    getWalletById(walletId: string | undefined): WcWallet | undefined;
};
