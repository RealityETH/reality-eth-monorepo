import { type CaipAddress, type CaipNetwork, type ChainNamespace, type Connection, type Hex } from '@reown/appkit-common';
import type { W3mFrameTypes } from '@reown/appkit-wallet';
import type { ChainAdapter, Connector, EstimateGasTransactionArgs, SendTransactionArgs, WalletGetAssetsParams, WalletGetAssetsResponse, WcWallet, WriteContractArgs, WriteSolanaTransactionArgs } from '../utils/TypeUtil.js';
import { type ChainControllerState } from './ChainController.js';
interface SwitchConnectionParams {
    connection: Connection;
    address?: string;
    namespace: ChainNamespace;
    closeModalOnConnect?: boolean;
    onChange?: (params: {
        address: string;
        namespace: ChainNamespace;
        hasSwitchedAccount: boolean;
        hasSwitchedWallet: boolean;
    }) => void;
}
interface HandleDisconnectedConnectionParams {
    connection: Connection;
    namespace: ChainNamespace;
    address?: string;
    closeModalOnConnect?: boolean;
}
interface HandleActiveConnectionParams {
    connection: Connection;
    namespace: ChainNamespace;
    address?: string;
}
interface DisconnectParams {
    id?: string;
    namespace?: ChainNamespace;
    initialDisconnect?: boolean;
}
export interface ConnectExternalOptions {
    id: Connector['id'];
    type: Connector['type'];
    provider?: Connector['provider'];
    address?: string;
    info?: Connector['info'];
    chain?: ChainNamespace;
    chainId?: number | string;
    caipNetwork?: CaipNetwork;
    socialUri?: string;
    preferredAccountType?: 'eoa' | 'smartAccount';
}
interface HandleAuthAccountSwitchParams {
    address: string;
    namespace: ChainNamespace;
}
export interface DisconnectParameters {
    id?: string;
    chainNamespace?: ChainNamespace;
    initialDisconnect?: boolean;
}
interface DisconnectConnectorParameters {
    id: string;
    namespace: ChainNamespace;
}
interface ConnectWalletConnectParameters {
    cache?: 'auto' | 'always' | 'never';
}
export interface ConnectionControllerClient {
    connectWalletConnect?: (params?: ConnectWalletConnectParameters) => Promise<void>;
    disconnect: (params?: DisconnectParameters) => Promise<void>;
    disconnectConnector: (params: DisconnectConnectorParameters) => Promise<void>;
    signMessage: (message: string) => Promise<string>;
    sendTransaction: (args: SendTransactionArgs) => Promise<string | null>;
    estimateGas: (args: EstimateGasTransactionArgs) => Promise<bigint>;
    parseUnits: (value: string, decimals: number) => bigint;
    formatUnits: (value: bigint, decimals: number) => string;
    connectExternal?: (options: ConnectExternalOptions) => Promise<{
        address: string;
    } | undefined>;
    reconnectExternal?: (options: ConnectExternalOptions) => Promise<void>;
    checkInstalled?: (ids?: string[]) => boolean;
    writeContract: (args: WriteContractArgs) => Promise<`0x${string}` | null>;
    writeSolanaTransaction: (args: WriteSolanaTransactionArgs) => Promise<string | null>;
    getEnsAddress: (value: string) => Promise<false | string>;
    getEnsAvatar: (value: string) => Promise<false | string>;
    grantPermissions: (params: readonly unknown[] | object) => Promise<unknown>;
    revokePermissions: (params: {
        pci: string;
        permissions: unknown[];
        expiry: number;
        address: CaipAddress;
    }) => Promise<Hex>;
    getCapabilities: (params: string) => Promise<unknown>;
    walletGetAssets: (params: WalletGetAssetsParams) => Promise<WalletGetAssetsResponse>;
    updateBalance: (chainNamespace: ChainNamespace) => void;
}
export interface ConnectionControllerState {
    isSwitchingConnection: boolean;
    connections: Map<ChainNamespace, Connection[]>;
    recentConnections: Map<ChainNamespace, Connection[]>;
    _client?: ConnectionControllerClient;
    wcUri?: string;
    wcPairingExpiry?: number;
    wcLinking?: {
        href: string;
        name: string;
    };
    wcBasic?: boolean;
    wcError?: boolean;
    wcFetchingUri: boolean;
    recentWallet?: WcWallet;
    buffering: boolean;
    status?: 'connecting' | 'connected' | 'disconnected';
    connectionControllerClient?: ConnectionControllerClient;
}
type StateKey = keyof ConnectionControllerState;
export declare const ConnectionController: {
    state: ConnectionControllerState;
    subscribe(callback: (newState: ConnectionControllerState) => void): () => void;
    subscribeKey<K extends StateKey>(key: K, callback: (value: ConnectionControllerState[K]) => void): () => void;
    _getClient(): ConnectionControllerClient | undefined;
    setClient(client: ConnectionControllerClient): void;
    initialize(adapters: ChainAdapter[]): void;
    syncStorageConnections(namespaces?: ChainNamespace[]): void;
    getConnections(namespace?: ChainNamespace): Connection[];
    hasAnyConnection(connectorId: string): boolean;
    connectWalletConnect({ cache }?: ConnectWalletConnectParameters): Promise<void>;
    connectExternal(options: ConnectExternalOptions, chain: ChainControllerState["activeChain"], setChain?: boolean): Promise<{
        address: string;
    } | undefined>;
    reconnectExternal(options: ConnectExternalOptions): Promise<void>;
    setPreferredAccountType(accountType: W3mFrameTypes.AccountType, namespace: ChainControllerState["activeChain"]): Promise<void>;
    signMessage(message: string): Promise<string | undefined>;
    parseUnits(value: string, decimals: number): bigint | undefined;
    formatUnits(value: bigint, decimals: number): string | undefined;
    updateBalance(namespace: ChainNamespace): void | undefined;
    sendTransaction(args: SendTransactionArgs): Promise<string | null | undefined>;
    getCapabilities(params: string): Promise<unknown>;
    grantPermissions(params: object | readonly unknown[]): Promise<unknown>;
    walletGetAssets(params: WalletGetAssetsParams): Promise<WalletGetAssetsResponse>;
    estimateGas(args: EstimateGasTransactionArgs): Promise<bigint | undefined>;
    writeContract(args: WriteContractArgs): Promise<`0x${string}` | null | undefined>;
    writeSolanaTransaction(args: WriteSolanaTransactionArgs): Promise<string | null | undefined>;
    getEnsAddress(value: string): Promise<string | false | undefined>;
    getEnsAvatar(value: string): Promise<string | false | undefined>;
    checkInstalled(ids?: string[]): boolean;
    resetWcConnection(): void;
    resetUri(): void;
    finalizeWcConnection(address?: string): void;
    setWcBasic(wcBasic: ConnectionControllerState["wcBasic"]): void;
    setUri(uri: string): void;
    setWcLinking(wcLinking: ConnectionControllerState["wcLinking"]): void;
    setWcError(wcError: ConnectionControllerState["wcError"]): void;
    setRecentWallet(wallet: ConnectionControllerState["recentWallet"]): void;
    setBuffering(buffering: ConnectionControllerState["buffering"]): void;
    setStatus(status: ConnectionControllerState["status"]): void;
    setIsSwitchingConnection(isSwitchingConnection: ConnectionControllerState["isSwitchingConnection"]): void;
    disconnect({ id, namespace, initialDisconnect }?: DisconnectParams): Promise<void>;
    disconnectConnector({ id, namespace }: DisconnectConnectorParameters): Promise<void>;
    setConnections(connections: Connection[], chainNamespace: ChainNamespace): void;
    handleAuthAccountSwitch({ address, namespace }: HandleAuthAccountSwitchParams): Promise<void>;
    handleActiveConnection({ connection, namespace, address }: HandleActiveConnectionParams): Promise<string | undefined>;
    handleDisconnectedConnection({ connection, namespace, address, closeModalOnConnect }: HandleDisconnectedConnectionParams): Promise<string | undefined>;
    switchConnection({ connection, address, namespace, closeModalOnConnect, onChange }: SwitchConnectionParams): Promise<void>;
};
export {};
