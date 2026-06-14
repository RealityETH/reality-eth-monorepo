import { type CaipAddress, type CaipNetwork } from '@reown/appkit-common';
import type { BlockchainApiBalanceResponse } from './TypeUtil.js';
interface FetchER20BalanceParams {
    caipAddress: CaipAddress;
    assetAddress: string;
    caipNetwork: CaipNetwork;
}
interface GetMyTokensWithBalanceParams {
    forceUpdate?: string;
    caipNetwork?: CaipNetwork;
    address?: string;
}
export declare const BalanceUtil: {
    /**
     * Get the balances of the user's tokens. If user connected with Auth provider or and on the EIP155 network,
     * it'll use the `wallet_getAssets` and `wallet_getCapabilities` calls to fetch the balance rather than Blockchain API
     * @param forceUpdate - If true, the balances will be fetched from the server
     * @returns The balances of the user's tokens
     */
    getMyTokensWithBalance(params?: GetMyTokensWithBalanceParams): Promise<BlockchainApiBalanceResponse["balances"]>;
    /**
     * Get the balances of the user's tokens on the EIP155 network using native `wallet_getAssets` and `wallet_getCapabilities` calls
     * @param address - The address of the user
     * @param caipNetwork - The CAIP network
     * @returns The balances of the user's tokens on the EIP155 network
     */
    getEIP155Balances(address: string, caipNetwork: CaipNetwork): Promise<import("@reown/appkit-common").Balance[] | null>;
    /**
     * The 1Inch API includes many low-quality tokens in the balance response,
     * which appear inconsistently. This filter prevents them from being displayed.
     */
    filterLowQualityTokens(balances: BlockchainApiBalanceResponse["balances"]): import("@reown/appkit-common").Balance[];
    fetchERC20Balance({ caipAddress, assetAddress, caipNetwork }: FetchER20BalanceParams): Promise<{
        name: string | undefined;
        symbol: string | undefined;
        decimals: number | undefined;
        balance: string;
    }>;
};
export {};
