import { type CaipNetworkId, type ChainNamespace } from '@reown/appkit-common';
import type { Connection } from '@reown/appkit-common';
import type { BlockchainApiBalanceResponse, BlockchainApiIdentityResponse, BlockchainApiLookupEnsName, BlockchainApiTokenPriceResponse, BlockchainApiTransactionsResponse, ConnectionStatus, PreferredAccountTypes, SocialProvider, WcWallet } from './TypeUtil.js';
interface DeleteAddressFromConnectionParams {
    address: string;
    connectorId: string;
    namespace: ChainNamespace;
}
export declare const StorageUtil: {
    cacheExpiry: {
        portfolio: number;
        nativeBalance: number;
        ens: number;
        identity: number;
        transactionsHistory: number;
        tokenPrice: number;
        latestAppKitVersion: number;
        tonWallets: number;
    };
    isCacheExpired(timestamp: number, cacheExpiry: number): boolean;
    getActiveNetworkProps(): {
        namespace: ChainNamespace | undefined;
        caipNetworkId: CaipNetworkId | undefined;
        chainId: string | number | undefined;
    };
    setWalletConnectDeepLink({ name, href }: {
        href: string;
        name: string;
    }): void;
    getWalletConnectDeepLink(): any;
    deleteWalletConnectDeepLink(): void;
    setActiveNamespace(namespace: ChainNamespace): void;
    setActiveCaipNetworkId(caipNetworkId: CaipNetworkId): void;
    getActiveCaipNetworkId(): `eip155:${string}` | `solana:${string}` | `polkadot:${string}` | `bip122:${string}` | `cosmos:${string}` | `sui:${string}` | `stacks:${string}` | `ton:${string}` | undefined;
    deleteActiveCaipNetworkId(): void;
    deleteConnectedConnectorId(namespace: ChainNamespace): void;
    setAppKitRecent(wallet: WcWallet): void;
    getRecentWallets(): WcWallet[];
    getRecentWallet(): WcWallet | null;
    deleteRecentWallet(): void;
    setConnectedConnectorId(namespace: ChainNamespace, connectorId: string): void;
    getActiveNamespace(): ChainNamespace | undefined;
    getConnectedConnectorId(namespace: ChainNamespace | undefined): string | undefined;
    setConnectedSocialProvider(socialProvider: SocialProvider): void;
    getConnectedSocialProvider(): string | undefined;
    deleteConnectedSocialProvider(): void;
    getConnectedSocialUsername(): string | undefined;
    getStoredActiveCaipNetworkId(): string | undefined;
    setConnectionStatus(status: ConnectionStatus): void;
    getConnectionStatus(): ConnectionStatus | undefined;
    getConnectedNamespaces(): ChainNamespace[];
    setConnectedNamespaces(namespaces: ChainNamespace[]): void;
    addConnectedNamespace(namespace: ChainNamespace): void;
    removeConnectedNamespace(namespace: ChainNamespace): void;
    getTelegramSocialProvider(): SocialProvider | null | undefined;
    setTelegramSocialProvider(socialProvider: SocialProvider): void;
    removeTelegramSocialProvider(): void;
    getBalanceCache(): Record<string, {
        timestamp: number;
        balance: BlockchainApiBalanceResponse;
    }>;
    removeAddressFromBalanceCache(caipAddress: string): void;
    getBalanceCacheForCaipAddress(caipAddress: string): BlockchainApiBalanceResponse | undefined;
    updateBalanceCache(params: {
        caipAddress: string;
        balance: BlockchainApiBalanceResponse;
        timestamp: number;
    }): void;
    getNativeBalanceCache(): Record<string, {
        caipAddress: string;
        balance: string;
        symbol: string;
        timestamp: number;
    }>;
    removeAddressFromNativeBalanceCache(caipAddress: string): void;
    getNativeBalanceCacheForCaipAddress(caipAddress: string): {
        caipAddress: string;
        balance: string;
        symbol: string;
        timestamp: number;
    } | undefined;
    updateNativeBalanceCache(params: {
        caipAddress: string;
        balance: string;
        symbol: string;
        timestamp: number;
    }): void;
    getEnsCache(): Record<string, {
        ens: BlockchainApiLookupEnsName[];
        timestamp: number;
    }>;
    getEnsFromCacheForAddress(address: string): BlockchainApiLookupEnsName[] | undefined;
    updateEnsCache(params: {
        address: string;
        timestamp: number;
        ens: BlockchainApiLookupEnsName[];
    }): void;
    removeEnsFromCache(address: string): void;
    getIdentityCache(): Record<string, {
        identity: BlockchainApiIdentityResponse;
        timestamp: number;
    }>;
    getIdentityFromCacheForAddress(address: string): BlockchainApiIdentityResponse | undefined;
    updateIdentityCache(params: {
        address: string;
        timestamp: number;
        identity: BlockchainApiIdentityResponse;
    }): void;
    removeIdentityFromCache(address: string): void;
    getTonWalletsCache(): any;
    updateTonWalletsCache(wallets: unknown[]): void;
    removeTonWalletsCache(): void;
    clearAddressCache(): void;
    setPreferredAccountTypes(accountTypes: PreferredAccountTypes): void;
    getPreferredAccountTypes(): PreferredAccountTypes;
    setConnections(connections: Connection[], chainNamespace: ChainNamespace): void;
    getConnections(): {
        eip155: Connection[];
        solana: Connection[];
        polkadot: Connection[];
        bip122: Connection[];
        cosmos: Connection[];
        sui: Connection[];
        stacks: Connection[];
        ton: Connection[];
    };
    deleteAddressFromConnection({ connectorId, address, namespace }: DeleteAddressFromConnectionParams): void;
    getDisconnectedConnectorIds(): {
        eip155: string[];
        solana: string[];
        polkadot: string[];
        bip122: string[];
        cosmos: string[];
        sui: string[];
        stacks: string[];
        ton: string[];
    };
    addDisconnectedConnectorId(connectorId: string, chainNamespace: ChainNamespace): void;
    removeDisconnectedConnectorId(connectorId: string, chainNamespace: ChainNamespace): void;
    isConnectorDisconnected(connectorId: string, chainNamespace: ChainNamespace): boolean;
    getTransactionsCache(): any;
    getTransactionsCacheForAddress({ address, chainId }: {
        address: string;
        chainId?: string;
    }): any;
    updateTransactionsCache({ address, chainId, timestamp, transactions }: {
        address: string;
        chainId?: string;
        timestamp: number;
        transactions: BlockchainApiTransactionsResponse;
    }): void;
    removeTransactionsCache({ address, chainId }: {
        address: string;
        chainId: string;
    }): void;
    getTokenPriceCache(): any;
    getTokenPriceCacheForAddresses(addresses: string[]): any;
    updateTokenPriceCache(params: {
        addresses: string[];
        timestamp: number;
        tokenPrice: BlockchainApiTokenPriceResponse;
    }): void;
    removeTokenPriceCache(addresses: string[]): void;
    getLatestAppKitVersion(): any;
    getLatestAppKitVersionCache(): any;
    updateLatestAppKitVersion(params: {
        timestamp: number;
        version: string;
    }): void;
};
export {};
