import type { SessionTypes } from '@walletconnect/types';
import UniversalProvider from '@walletconnect/universal-provider';
import type { AppKitNetwork, AppKitSdkVersion, CaipAddress, CaipNetwork, CaipNetworkId, ChainNamespace, SdkVersion } from '@reown/appkit-common';
import type { AccountState, AdapterBlueprint, Adapters, ChainAdapterConnector, ConnectExternalOptions, ConnectMethod, ConnectedWalletInfo, ConnectionControllerClient, ConnectionControllerState, ConnectorType, EventsControllerState, Features, ModalControllerState, NamespaceTypeMap, OptionsControllerState, PublicStateControllerState, RemoteFeatures, RouterControllerState, SIWXConfig, SocialProvider, ThemeControllerState, UseAppKitAccountReturn, UseAppKitNetworkReturn, User, WalletFeature } from '@reown/appkit-controllers';
import { AssetUtil, BlockchainApiController, ChainController, ConnectionController, ConnectorController, EnsController, OptionsController, type ProviderControllerState, StorageUtil } from '@reown/appkit-controllers';
import type { AppKitOptions } from '../utils/index.js';
export interface AppKitOptionsWithSdk extends AppKitOptions {
    sdkVersion: SdkVersion | AppKitSdkVersion;
}
export type Views = 'Account' | 'Connect' | 'Networks' | 'ApproveTransaction' | 'OnRampProviders' | 'ConnectingWalletConnectBasic' | 'Swap' | 'WhatIsAWallet' | 'WhatIsANetwork' | 'AllWallets' | 'WalletSend' | 'ProfileWallets';
type ViewArguments = {
    Swap: NonNullable<RouterControllerState['data']>['swap'];
    WalletSend: NonNullable<RouterControllerState['data']>['send'];
};
export interface OpenOptions<V extends Views | undefined = Views> {
    view?: V;
    uri?: string;
    namespace?: ChainNamespace;
    arguments?: V extends 'Swap' ? ViewArguments['Swap'] : V extends 'WalletSend' ? ViewArguments['WalletSend'] : never;
}
interface AppKitSwitchNetworkOptions {
    throwOnFailure?: boolean;
}
export declare abstract class AppKitBaseClient {
    protected universalProvider?: UniversalProvider;
    protected connectionControllerClient?: ConnectionControllerClient;
    protected static instance?: AppKitBaseClient;
    protected universalProviderInitPromise?: Promise<void>;
    protected caipNetworks?: [CaipNetwork, ...CaipNetwork[]];
    protected defaultCaipNetwork?: CaipNetwork;
    chainAdapters: Adapters;
    chainNamespaces: ChainNamespace[];
    options: AppKitOptions;
    features: Features;
    remoteFeatures: RemoteFeatures;
    version: SdkVersion | AppKitSdkVersion;
    reportedAlertErrors: Record<string, boolean>;
    private readyPromise?;
    constructor(options: AppKitOptionsWithSdk);
    private getChainNamespacesSet;
    protected initialize(options: AppKitOptionsWithSdk): Promise<void>;
    private openSend;
    private toModalOptions;
    private checkAllowedOrigins;
    private createCleanupHandler;
    private sendInitializeEvent;
    protected initControllers(options: AppKitOptionsWithSdk): void;
    protected initAdapterController(): void;
    protected initializeThemeController(options: AppKitOptions): void;
    protected initializeChainController(options: AppKitOptions): void;
    protected initializeConnectionController(options: AppKitOptions): void;
    protected initializeConnectorController(): void;
    protected initializeProjectSettings(options: AppKitOptionsWithSdk): void;
    protected initializeOptionsController(options: AppKitOptionsWithSdk): void;
    protected getDefaultMetaData(): {
        name: string;
        description: string;
        url: string;
        icons: string[];
    } | null;
    protected setUnsupportedNetwork(chainId: string | number): void;
    protected getDefaultNetwork(): CaipNetwork | undefined;
    protected extendCaipNetwork(network: AppKitNetwork, options: AppKitOptions): CaipNetwork;
    protected extendCaipNetworks(options: AppKitOptions): [CaipNetwork, ...CaipNetwork[]];
    protected extendDefaultCaipNetwork(options: AppKitOptions): CaipNetwork | undefined;
    /**
     * Disconnects a connector with the given namespace and id. If the connector id is not provided, disconnects the adapter (namespace).
     * @param namespace ChainNamespace
     * @param id string
     * @returns
     */
    private disconnectConnector;
    protected createClients(): void;
    protected onConnectExternal(params: ConnectExternalOptions): Promise<{
        address: string;
        connectedCaipNetwork: CaipNetwork | undefined;
    } | undefined>;
    protected connectInactiveNamespaces(params: ConnectExternalOptions, connectResult: {
        address: string;
        connectedCaipNetwork: CaipNetwork | undefined;
    } | undefined): Promise<void>;
    protected getApprovedCaipNetworksData(): {
        supportsAllNetworks: boolean;
        approvedCaipNetworkIds: CaipNetworkId[];
    };
    protected switchCaipNetwork(caipNetwork: CaipNetwork): Promise<void>;
    protected getChainsFromNamespaces(namespaces?: SessionTypes.Namespaces): CaipNetworkId[];
    protected createAdapters(blueprints?: AdapterBlueprint[]): Adapters;
    protected initChainAdapter(namespace: ChainNamespace): Promise<void>;
    protected initChainAdapters(): Promise<void>;
    protected onConnectors(chainNamespace: ChainNamespace): void;
    protected listenAdapter(chainNamespace: ChainNamespace): void;
    /**
     * Checks the incoming connector and handles the previous connection in the connector's namespace, and if necessary (i.e multi-wallet is disabled) disconnects the previous connector
     * @param connector
     */
    protected handlePreviousConnectorConnection(connector: ChainAdapterConnector | undefined): Promise<void>;
    protected createUniversalProviderForAdapter(chainNamespace: ChainNamespace): Promise<void>;
    protected abstract injectModalUi(): Promise<void>;
    abstract syncIdentity(params: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
        chainNamespace: ChainNamespace;
    }): Promise<void>;
    protected syncExistingConnection(): Promise<void>;
    protected unSyncExistingConnection(): Promise<void>;
    protected reconnectWalletConnect(): Promise<void>;
    protected syncNamespaceConnection(namespace: ChainNamespace): Promise<void>;
    protected onDisconnectNamespace(options: {
        chainNamespace: ChainNamespace;
        closeModal?: boolean;
    }): void;
    protected syncAdapterConnections(): Promise<void>;
    protected syncAdapterConnection(namespace: ChainNamespace): Promise<void>;
    protected syncWalletConnectAccount(): Promise<void>;
    protected syncProvider({ type, provider, id, chainNamespace }: Pick<AdapterBlueprint.ConnectResult, 'type' | 'provider' | 'id'> & {
        chainNamespace: ChainNamespace;
    }): void;
    protected syncAccount(params: Pick<AdapterBlueprint.ConnectResult, 'address' | 'chainId'> & {
        chainNamespace: ChainNamespace;
    }): Promise<void>;
    private syncAccountInfo;
    protected syncReownName(address: string, chainNamespace: ChainNamespace): Promise<void>;
    protected syncConnectedWalletInfo(chainNamespace: ChainNamespace): void;
    protected syncBalance(params: {
        address: string;
        chainId: string | number | undefined;
        chainNamespace: ChainNamespace;
    }): Promise<void>;
    ready(): Promise<void>;
    updateNativeBalance(address: string, chainId: string | number, namespace: ChainNamespace): Promise<AdapterBlueprint.GetBalanceResult | undefined>;
    protected initializeUniversalAdapter(): Promise<void>;
    protected listenWalletConnect(): void;
    protected createUniversalProvider(): Promise<void> | undefined;
    getUniversalProvider(): Promise<UniversalProvider | undefined>;
    getDisabledCaipNetworks(): CaipNetwork[];
    protected handleAlertError(error: Error): void;
    protected getAdapter(namespace?: ChainNamespace): AdapterBlueprint<ChainAdapterConnector> | undefined;
    protected createAdapter(blueprint: AdapterBlueprint): void;
    getCaipNetwork: (chainNamespace?: ChainNamespace, id?: string | number) => CaipNetwork | undefined;
    getCaipNetworkId: <T extends number | string>() => T | undefined;
    getCaipNetworks: (namespace?: ChainNamespace) => CaipNetwork[];
    getActiveChainNamespace: () => ChainNamespace | undefined;
    setRequestedCaipNetworks: (typeof ChainController)['setRequestedCaipNetworks'];
    getApprovedCaipNetworkIds: (typeof ChainController)['getAllApprovedCaipNetworkIds'];
    getCaipAddress: (chainNamespace?: ChainNamespace) => `eip155:${string}:${string}` | `eip155:${number}:${string}` | `solana:${string}:${string}` | `solana:${number}:${string}` | `polkadot:${string}:${string}` | `polkadot:${number}:${string}` | `bip122:${string}:${string}` | `bip122:${number}:${string}` | `cosmos:${string}:${string}` | `cosmos:${number}:${string}` | `sui:${string}:${string}` | `sui:${number}:${string}` | `stacks:${string}:${string}` | `stacks:${number}:${string}` | `ton:${string}:${string}` | `ton:${number}:${string}` | undefined;
    setClientId: (typeof BlockchainApiController)['setClientId'];
    getProvider: <T>(namespace: ChainNamespace) => T | undefined;
    getProviderType: (namespace: ChainNamespace) => ConnectorType | undefined;
    getPreferredAccountType: (namespace: ChainNamespace) => "payment" | "eoa" | "smartAccount" | "ordinal" | "stx" | undefined;
    setCaipAddress: (caipAddress: CaipAddress | null, chain: ChainNamespace, shouldRefresh?: boolean) => void;
    setBalance: (balance: string, balanceSymbol: string, chain: ChainNamespace) => void;
    setProfileName: (profileName: string | null, chain: ChainNamespace) => void;
    setProfileImage: (profileImage: string | null, chain: ChainNamespace) => void;
    setUser: (user: User | null, chain: ChainNamespace) => void;
    resetAccount: (chain: ChainNamespace) => void;
    setCaipNetwork: (typeof ChainController)['setActiveCaipNetwork'];
    setCaipNetworkOfNamespace: (caipNetwork: CaipNetwork, chainNamespace: ChainNamespace) => void;
    setStatus: (status: AccountState["status"], chain: ChainNamespace) => void;
    getAddressByChainNamespace: (chainNamespace: ChainNamespace) => string | undefined;
    setConnectors: (typeof ConnectorController)['setConnectors'];
    setConnections: (typeof ConnectionController)['setConnections'];
    fetchIdentity: (typeof BlockchainApiController)['fetchIdentity'];
    getReownName: (typeof EnsController)['getNamesForAddress'];
    getConnectors: (typeof ConnectorController)['getConnectors'];
    getConnectorImage: (typeof AssetUtil)['getConnectorImage'];
    getConnections: (namespace: ChainNamespace) => import("@reown/appkit-common").Connection[];
    getRecentConnections: (namespace: ChainNamespace) => import("@reown/appkit-common").Connection[];
    switchConnection: (typeof ConnectionController)['switchConnection'];
    deleteConnection: (typeof StorageUtil)['deleteAddressFromConnection'];
    setConnectedWalletInfo: (connectedWalletInfo: ConnectedWalletInfo | null, chain: ChainNamespace) => void;
    open<View extends Views>(options?: OpenOptions<View>): Promise<void | {
        hash: string;
    }>;
    close(): Promise<void>;
    setLoading(loading: ModalControllerState['loading'], namespace?: ChainNamespace): void;
    disconnect(chainNamespace?: ChainNamespace): Promise<void>;
    getSIWX<SIWXConfigInterface = SIWXConfig>(): SIWXConfigInterface | undefined;
    getError(): string;
    getChainId(): string | number | undefined;
    switchNetwork(appKitNetwork: AppKitNetwork, { throwOnFailure }?: AppKitSwitchNetworkOptions): Promise<void>;
    getWalletProvider(): unknown;
    getWalletProviderType(): ConnectorType | undefined;
    subscribeProviders(callback: (providers: ProviderControllerState['providers']) => void): () => void;
    getThemeMode(): import("@reown/appkit-controllers").ThemeMode;
    getThemeVariables(): import("@reown/appkit-controllers").ThemeVariables;
    setThemeMode(themeMode: ThemeControllerState['themeMode']): void;
    setTermsConditionsUrl(termsConditionsUrl: string): void;
    setPrivacyPolicyUrl(privacyPolicyUrl: string): void;
    setThemeVariables(themeVariables: ThemeControllerState['themeVariables']): void;
    subscribeTheme(callback: (newState: ThemeControllerState) => void): () => void;
    subscribeConnections(callback: (newState: ConnectionControllerState) => void): () => void;
    getWalletInfo(namespace?: ChainNamespace): ConnectedWalletInfo | undefined;
    getAccount(_namespace?: ChainNamespace): {
        allAccounts: ({
            namespace: "eip155";
            address: string;
            type: "eoa" | "smartAccount";
            publicKey?: undefined;
            path?: undefined;
        } | {
            namespace: "solana";
            address: string;
            type: "eoa";
            publicKey?: undefined;
            path?: undefined;
        } | {
            namespace: "polkadot";
            address: string;
            type: "eoa";
            publicKey?: undefined;
            path?: undefined;
        } | {
            namespace: "bip122";
            address: string;
            type: "payment" | "ordinal" | "stx";
            publicKey?: string | undefined;
            path?: string | undefined;
        } | {
            namespace: "cosmos";
            address: string;
            type: "eoa";
            publicKey?: undefined;
            path?: undefined;
        } | {
            namespace: "sui";
            address: string;
            type: "eoa";
            publicKey?: undefined;
            path?: undefined;
        } | {
            namespace: "stacks";
            address: string;
            type: "eoa";
            publicKey?: undefined;
            path?: undefined;
        } | {
            namespace: "ton";
            address: string;
            type: "eoa";
            publicKey?: undefined;
            path?: undefined;
        })[];
        caipAddress: `eip155:${string}:${string}` | `eip155:${number}:${string}` | `solana:${string}:${string}` | `solana:${number}:${string}` | `polkadot:${string}:${string}` | `polkadot:${number}:${string}` | `bip122:${string}:${string}` | `bip122:${number}:${string}` | `cosmos:${string}:${string}` | `cosmos:${number}:${string}` | `sui:${string}:${string}` | `sui:${number}:${string}` | `stacks:${string}:${string}` | `stacks:${number}:${string}` | `ton:${string}:${string}` | `ton:${number}:${string}` | undefined;
        address: `0x${string}` | undefined;
        isConnected: boolean;
        status: "reconnecting" | "connected" | "disconnected" | "connecting" | undefined;
        embeddedWalletInfo: {
            user: {
                username: string | undefined;
                email?: string | null | undefined;
                accounts?: {
                    type: "eoa" | "smartAccount";
                    address: string;
                }[];
            } | undefined;
            authProvider: "email" | import("@reown/appkit-common").SocialProvider;
            accountType: "payment" | "eoa" | "smartAccount" | "ordinal" | "stx" | undefined;
            isSmartAccountDeployed: boolean;
        } | undefined;
    } | undefined;
    subscribeAccount(callback: (newState: UseAppKitAccountReturn) => void, namespace?: ChainNamespace): () => void;
    subscribeNetwork(callback: (newState: Omit<UseAppKitNetworkReturn, 'switchNetwork'>) => void): () => void;
    subscribeWalletInfo(callback: (newState?: ConnectedWalletInfo) => void, namespace?: ChainNamespace): () => void;
    subscribeShouldUpdateToAddress(callback: (newState?: string) => void): () => void;
    subscribeCaipNetworkChange(callback: (newState?: CaipNetwork) => void): () => void;
    getState(): PublicStateControllerState;
    getRemoteFeatures(): RemoteFeatures | undefined;
    subscribeState(callback: (newState: PublicStateControllerState) => void): () => void;
    subscribeRemoteFeatures(callback: (newState: RemoteFeatures | undefined) => void): () => void;
    showErrorMessage(message: string): void;
    showSuccessMessage(message: string): void;
    getEvent(): {
        timestamp: number;
        lastFlush: number;
        reportedErrors: Record<string, boolean>;
        data: import("@reown/appkit-controllers").Event;
        pendingEvents: import("@reown/appkit-controllers").PendingEvent[];
        subscribedToVisibilityChange: boolean;
        walletImpressions: (import("@reown/appkit-controllers").WalletImpressionItem | import("@reown/appkit-controllers").ConnectorImpressionItem)[];
    };
    subscribeEvents(callback: (newEvent: EventsControllerState) => void): () => void;
    replace(route: RouterControllerState['view']): void;
    redirect(route: RouterControllerState['view']): void;
    popTransactionStack(status: 'cancel' | 'error' | 'success'): void;
    isOpen(): boolean;
    isTransactionStackEmpty(): boolean;
    static getInstance(): AppKitBaseClient | undefined;
    getIsConnectedState: () => boolean;
    addAddressLabel: (address: string, label: string, chain: ChainNamespace) => void;
    removeAddressLabel: (address: string, chain: ChainNamespace) => void;
    getAddress: (chainNamespace?: ChainNamespace) => string | undefined;
    resetNetwork: (typeof ChainController)['resetNetwork'];
    addConnector: (typeof ConnectorController)['addConnector'];
    resetWcConnection: (typeof ConnectionController)['resetWcConnection'];
    setAddressExplorerUrl: (addressExplorerUrl: string, chain: ChainNamespace) => void;
    setSmartAccountDeployed: (isDeployed: boolean, chain: ChainNamespace) => void;
    setPreferredAccountType: (preferredAccountType: NamespaceTypeMap[ChainNamespace], chain: ChainNamespace) => void;
    setEIP6963Enabled: (typeof OptionsController)['setEIP6963Enabled'];
    handleUnsafeRPCRequest: () => void;
    updateFeatures(newFeatures: Partial<Features>): void;
    updateRemoteFeatures(newRemoteFeatures: Partial<RemoteFeatures>): void;
    updateOptions(newOptions: Partial<OptionsControllerState>): void;
    setConnectMethodsOrder(connectMethodsOrder: ConnectMethod[]): void;
    setWalletFeaturesOrder(walletFeaturesOrder: WalletFeature[]): void;
    setCollapseWallets(collapseWallets: boolean): void;
    setSocialsOrder(socialsOrder: SocialProvider[]): void;
    getConnectMethodsOrder(): ConnectMethod[];
    /**
     * Adds a network to an existing adapter in AppKit.
     * @param namespace - The chain namespace to add the network to (e.g. 'eip155', 'solana')
     * @param network - The network configuration to add
     * @throws Error if adapter for namespace doesn't exist
     */
    addNetwork(namespace: ChainNamespace, network: AppKitNetwork): void;
    /**
     * Removes a network from an existing adapter in AppKit.
     * @param namespace - The chain namespace the network belongs to
     * @param networkId - The network ID to remove
     * @throws Error if adapter for namespace doesn't exist or if removing last network
     */
    removeNetwork(namespace: ChainNamespace, networkId: string | number): void;
}
export {};
