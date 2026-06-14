import { type CaipAddress, type ChainNamespace } from '@reown/appkit-common';
import type { AuthConnector, Connector, ConnectorWithProviders, WcWallet } from '../utils/TypeUtil.js';
export interface ConnectorControllerState {
    allConnectors: Connector[];
    connectors: ConnectorWithProviders[];
    activeConnector: Connector | undefined;
    filterByNamespace: ChainNamespace | undefined;
    filterByNamespaceMap: Record<ChainNamespace, boolean>;
    activeConnectorIds: Record<ChainNamespace, string | undefined>;
}
type StateKey = keyof ConnectorControllerState;
export interface ConnectParameters {
    namespace?: ChainNamespace;
}
export declare const ConnectorController: {
    state: ConnectorControllerState;
    subscribe(callback: (value: ConnectorControllerState) => void): () => void;
    subscribeKey<K extends StateKey>(key: K, callback: (value: ConnectorControllerState[K]) => void): () => void;
    initialize(namespaces: ChainNamespace[]): void;
    setActiveConnector(connector: ConnectorControllerState["activeConnector"]): void;
    setConnectors(connectors: ConnectorControllerState["connectors"]): void;
    filterByNamespaces(enabledNamespaces: ChainNamespace[]): void;
    filterByNamespace(namespace: ChainNamespace, enabled: boolean): void;
    updateConnectorsForEnabledNamespaces(): void;
    getEnabledNamespaces(): ChainNamespace[];
    getEnabledConnectors(enabledNamespaces: ChainNamespace[]): Connector[];
    areAllNamespacesEnabled(): boolean;
    mergeMultiChainConnectors(connectors: Connector[]): ConnectorWithProviders[];
    generateConnectorMapByName(connectors: Connector[]): Map<string, Connector[]>;
    getConnectorName(name: string | undefined): string | undefined;
    getUniqueConnectorsByName(connectors: Connector[]): Connector[];
    addConnector(connector: Connector | AuthConnector): void;
    getAuthConnector(chainNamespace?: ChainNamespace): AuthConnector | undefined;
    getAnnouncedConnectorRdns(): (string | undefined)[];
    getConnectorById(id: string): ConnectorWithProviders | undefined;
    getConnector({ id, namespace }: {
        id: string;
        namespace: ChainNamespace;
    }): ConnectorWithProviders | undefined;
    syncIfAuthConnector(connector: Connector | AuthConnector): void;
    /**
     * Returns the connectors filtered by namespace.
     * @param namespace - The namespace to filter the connectors by.
     * @returns ConnectorWithProviders[].
     */
    getConnectorsByNamespace(namespace: ChainNamespace): ConnectorWithProviders[];
    canSwitchToSmartAccount(namespace: ChainNamespace): boolean;
    selectWalletConnector(wallet: WcWallet): void;
    /**
     * Returns the connectors. If a namespace is provided, the connectors are filtered by namespace.
     * @param namespace - The namespace to filter the connectors by. If not provided, all connectors are returned.
     * @returns ConnectorWithProviders[].
     */
    getConnectors(namespace?: ChainNamespace): ConnectorWithProviders[];
    /**
     * Sets the filter by namespace and updates the connectors.
     * @param namespace - The namespace to filter the connectors by.
     */
    setFilterByNamespace(namespace: ChainNamespace | undefined): void;
    setConnectorId(connectorId: string, namespace: ChainNamespace): void;
    removeConnectorId(namespace: ChainNamespace): void;
    getConnectorId(namespace: ChainNamespace | undefined): string | undefined;
    isConnected(namespace?: ChainNamespace): boolean;
    resetConnectorIds(): void;
    extendConnectorsWithExplorerWallets(explorerWallets: WcWallet[]): void;
    /**
     * Opens the connect modal and waits until the user connects their wallet.
     * @param params - Connection parameters.
     * @returns Promise resolving to the connected wallet's CAIP address.
     */
    connect(params?: ConnectParameters): Promise<{
        caipAddress: CaipAddress;
    }>;
};
export {};
