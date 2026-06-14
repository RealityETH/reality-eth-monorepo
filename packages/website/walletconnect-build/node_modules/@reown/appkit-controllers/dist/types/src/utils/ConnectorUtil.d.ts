import type { Connector, ConnectorOrWalletItem, ConnectorTypeOrder, ConnectorWithProviders, CustomWallet, SocialProvider, WcWallet } from './TypeUtil.js';
interface GetConnectorTypeOrderParameters {
    recommended: WcWallet[];
    featured: WcWallet[];
    custom: CustomWallet[] | undefined;
    recent: WcWallet[];
    announced: WcWallet[];
    injected: WcWallet[];
    multiChain: WcWallet[];
    external: WcWallet[];
    overriddenConnectors?: ConnectorTypeOrder[];
}
export declare const ConnectorUtil: {
    getConnectorsByType(connectors: ConnectorWithProviders[], recommended: WcWallet[], featured: WcWallet[]): {
        custom: CustomWallet[] | undefined;
        recent: WcWallet[];
        external: ConnectorWithProviders[];
        multiChain: ConnectorWithProviders[];
        announced: ConnectorWithProviders[];
        injected: ConnectorWithProviders[];
        recommended: WcWallet[];
        featured: WcWallet[];
    };
    showConnector(connector: ConnectorWithProviders): boolean;
    /**
     * Returns true if the user is connected to a WalletConnect connector in the any of the available namespaces.
     * @returns boolean
     */
    getIsConnectedWithWC(): boolean;
    /**
     * Returns the connector positions in the order of the user's preference.
     * @returns ConnectorTypeOrder[]
     */
    getConnectorTypeOrder({ recommended, featured, custom, recent, announced, injected, multiChain, external, overriddenConnectors }: GetConnectorTypeOrderParameters): string[];
    sortConnectorsByExplorerWallet(connectors: ConnectorWithProviders[]): ConnectorWithProviders[];
    /**
     * Returns the priority of a connector. Base Account has highest priority, followed by Coinbase then the rest.
     *
     * This is needed because Base Account and Coinbase share the same explorer wallet ID.
     * Without prioritization, selecting Base Account could incorrectly trigger the Coinbase Wallet extension.
     *
     * @param connector - The connector to get the priority of.
     * @returns The priority of the connector.
     */
    getPriority(connector: ConnectorWithProviders): 1 | 0 | 2;
    /**
     * Sorts connectors by priority.
     * @param connectors - The connectors to sort.
     * @returns Sorted connectors.
     */
    sortConnectorsByPriority(connectors: ConnectorWithProviders[]): ConnectorWithProviders[];
    getAuthName({ email, socialUsername, socialProvider }: {
        email: string;
        socialUsername?: string | null;
        socialProvider?: SocialProvider | null;
    }): string;
    fetchProviderData(connector: Connector): Promise<{
        accounts: string[];
        chainId: number | undefined;
    }>;
    /**
     * Filter out duplicate custom wallets by RDNS
     * @param wallets
     */
    getFilteredCustomWallets(wallets: WcWallet[]): WcWallet[];
    hasWalletConnector(wallet: WcWallet): boolean;
    isWalletCompatibleWithCurrentChain(wallet: WcWallet): boolean;
    getFilteredRecentWallets(): WcWallet[];
    getCappedRecommendedWallets(wallets: WcWallet[]): WcWallet[];
    processConnectorsByType(connectors: ConnectorWithProviders[], shouldFilter?: boolean): ConnectorWithProviders[];
    connectorList(): ConnectorOrWalletItem[];
    hasInjectedConnectors(): number;
};
export {};
