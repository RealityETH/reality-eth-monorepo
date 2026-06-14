import { type Balance, type CaipAddress, type CaipNetwork, type CaipNetworkId, type ChainNamespace, type SocialProvider } from '@reown/appkit-common';
import type { AdapterNetworkState, ChainAdapter, ConnectedWalletInfo, NamespaceTypeMap, User } from '../utils/TypeUtil.js';
import { type ConnectionControllerClient } from './ConnectionController.js';
export type ChainControllerClients = {
    connectionControllerClient: ConnectionControllerClient;
};
export interface AccountState {
    currentTab: number;
    caipAddress?: CaipAddress;
    user?: User;
    address?: string;
    addressLabels: Map<string, string>;
    balance?: string;
    balanceSymbol?: string;
    balanceLoading?: boolean;
    profileName?: string | null;
    profileImage?: string | null;
    addressExplorerUrl?: string;
    smartAccountDeployed?: boolean;
    socialProvider?: SocialProvider;
    tokenBalance?: Balance[];
    shouldUpdateToAddress?: string;
    connectedWalletInfo?: ConnectedWalletInfo;
    preferredAccountType?: NamespaceTypeMap[keyof NamespaceTypeMap];
    socialWindow?: Window;
    farcasterUrl?: string;
    status?: 'reconnecting' | 'connected' | 'disconnected' | 'connecting';
    lastRetry?: number;
}
export interface ChainControllerState {
    activeChain: ChainNamespace | undefined;
    activeCaipAddress: CaipAddress | undefined;
    activeCaipNetwork?: CaipNetwork;
    chains: Map<ChainNamespace, ChainAdapter>;
    universalAdapter: Pick<ChainAdapter, 'connectionControllerClient'>;
    noAdapters: boolean;
    isSwitchingNamespace: boolean;
    lastConnectedSIWECaipNetwork?: CaipNetwork;
}
type ChainControllerStateKey = keyof ChainControllerState;
export interface SwitchActiveNetworkOptions {
    throwOnFailure?: boolean;
}
export declare const ChainController: {
    state: ChainControllerState;
    subscribe(callback: (value: ChainControllerState) => void): () => void;
    subscribeKey<K extends ChainControllerStateKey>(key: K, callback: (value: ChainControllerState[K]) => void): () => void;
    subscribeAccountStateProp(property: keyof AccountState, callback: (value: AccountState[keyof AccountState]) => void, chain?: ChainNamespace): () => void;
    subscribeChainProp<K extends keyof ChainAdapter>(property: K, callback: (value: ChainAdapter[K] | undefined) => void, chain?: ChainNamespace): () => void;
    initialize(adapters: ChainAdapter[], caipNetworks: CaipNetwork[] | undefined, clients: {
        connectionControllerClient: ConnectionControllerClient;
    }): void;
    removeAdapter(namespace: ChainNamespace): void;
    addAdapter(adapter: ChainAdapter, { connectionControllerClient }: ChainControllerClients, caipNetworks: [CaipNetwork, ...CaipNetwork[]]): void;
    addNetwork(network: CaipNetwork): void;
    removeNetwork(namespace: ChainNamespace, networkId: string | number): void;
    setAdapterNetworkState(chain: ChainNamespace, props: Partial<AdapterNetworkState>): void;
    setChainAccountData(chain: ChainNamespace | undefined, accountProps: Partial<AccountState>, _unknown?: boolean): void;
    setChainNetworkData(chain: ChainNamespace | undefined, networkProps: Partial<AdapterNetworkState>): void;
    setAccountProp(prop: keyof AccountState, value: AccountState[keyof AccountState], chain: ChainNamespace | undefined, replaceState?: boolean): void;
    setActiveNamespace(chain: ChainNamespace | undefined): void;
    setActiveCaipNetwork(caipNetwork: AdapterNetworkState["caipNetwork"]): void;
    addCaipNetwork(caipNetwork: AdapterNetworkState["caipNetwork"]): void;
    switchActiveNamespace(namespace: ChainNamespace | undefined): Promise<void>;
    switchActiveNetwork(network: CaipNetwork, { throwOnFailure }?: SwitchActiveNetworkOptions): Promise<void>;
    getConnectionControllerClient(_chain?: ChainNamespace): ConnectionControllerClient;
    getNetworkProp<K extends keyof AdapterNetworkState>(key: K, namespace: ChainNamespace): AdapterNetworkState[K] | undefined;
    getRequestedCaipNetworks(chainToFilter: ChainNamespace): CaipNetwork[];
    getAllRequestedCaipNetworks(): CaipNetwork[];
    setRequestedCaipNetworks(caipNetworks: CaipNetwork[], chain: ChainNamespace): void;
    getAllApprovedCaipNetworkIds(): CaipNetworkId[];
    getActiveCaipNetwork(chainNamespace?: ChainNamespace): CaipNetwork | undefined;
    getActiveCaipAddress(): `eip155:${string}:${string}` | `eip155:${number}:${string}` | `solana:${string}:${string}` | `solana:${number}:${string}` | `polkadot:${string}:${string}` | `polkadot:${number}:${string}` | `bip122:${string}:${string}` | `bip122:${number}:${string}` | `cosmos:${string}:${string}` | `cosmos:${number}:${string}` | `sui:${string}:${string}` | `sui:${number}:${string}` | `stacks:${string}:${string}` | `stacks:${number}:${string}` | `ton:${string}:${string}` | `ton:${number}:${string}` | undefined;
    getApprovedCaipNetworkIds(namespace: ChainNamespace): CaipNetworkId[];
    setApprovedCaipNetworksData(namespace: ChainNamespace, params: {
        approvedCaipNetworkIds: CaipNetworkId[];
        supportsAllNetworks: boolean;
    }): void;
    checkIfSupportedNetwork(namespace: ChainNamespace, caipNetworkId?: CaipNetworkId): boolean;
    checkIfSupportedChainId(chainId: number | string): boolean;
    checkIfSmartAccountEnabled(): boolean;
    showUnsupportedChainUI(): void;
    checkIfNamesSupported(): boolean;
    resetNetwork(namespace: ChainNamespace): void;
    resetAccount(chain: ChainNamespace | undefined): void;
    setIsSwitchingNamespace(isSwitchingNamespace: boolean): void;
    getFirstCaipNetworkSupportsAuthConnector(): CaipNetwork | undefined;
    getAccountData(chainNamespace?: ChainNamespace): AccountState | undefined;
    getNetworkData(chainNamespace?: ChainNamespace): AdapterNetworkState | undefined;
    getCaipNetworkByNamespace(chainNamespace: ChainNamespace | undefined, chainId?: string | number | undefined): CaipNetwork | undefined;
    /**
     * Get the requested CaipNetwork IDs for a given namespace. If namespace is not provided, all requested CaipNetwork IDs will be returned
     * @param namespace - The namespace to get the requested CaipNetwork IDs for
     * @returns The requested CaipNetwork IDs
     */
    getRequestedCaipNetworkIds(): (`eip155:${string}` | `eip155:${number}` | `solana:${string}` | `solana:${number}` | `polkadot:${string}` | `polkadot:${number}` | `bip122:${string}` | `bip122:${number}` | `cosmos:${string}` | `cosmos:${number}` | `sui:${string}` | `sui:${number}` | `stacks:${string}` | `stacks:${number}` | `ton:${string}` | `ton:${number}`)[];
    getCaipNetworks(namespace?: ChainNamespace): CaipNetwork[];
    getCaipNetworkById(id: string | number, namespace?: ChainNamespace): CaipNetwork | undefined;
    setLastConnectedSIWECaipNetwork(network: CaipNetwork | undefined): void;
    getLastConnectedSIWECaipNetwork(): CaipNetwork | undefined;
    fetchTokenBalance(onError?: (error: unknown) => void): Promise<Balance[]>;
    isCaipNetworkDisabled(network: CaipNetwork): boolean;
};
export {};
