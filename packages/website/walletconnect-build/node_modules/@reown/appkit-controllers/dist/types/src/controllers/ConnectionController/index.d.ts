import type { ChainNamespace } from '@reown/appkit-common';
import type { Connector, WcWallet } from '../../utils/TypeUtil.js';
import { Connection } from './entities/Connection/index.js';
export type ConnectionStatus = 'initializing' | 'connecting' | 'connected' | 'disconnecting' | 'disconnected';
export type ConnectionControllerState = {
    isSwitchingConnection: boolean;
    connections: Map<ChainNamespace, Connection[]>;
    recentConnections: Map<ChainNamespace, Connection[]>;
    walletConnectManager: WalletConnectConnectionManager;
    recentWallet?: WcWallet;
    status?: ConnectionStatus;
};
export type WalletConnectConnectionManager = {
    connectWalletConnect: (params?: ConnectWalletConnectParameters) => Promise<void>;
    resetWcConnection: () => void;
    resetUri: () => void;
    finalizeWcConnection: () => void;
    setWcBasic: (value: boolean) => void;
    setUri: (value: string) => void;
    setWcLinking: (value: {
        href: string;
        name: string;
    }) => void;
    setWcError: (value: boolean) => void;
    setRecentWallet: (wallet?: WcWallet) => void;
    setBuffering: (value: boolean) => void;
    setStatus: (status?: ConnectionStatus) => void;
};
export type ConnectWalletConnectParameters = {
    cache?: 'auto' | 'always' | 'never';
};
export type DisconnectParameters = {
    id?: string;
    chainNamespace?: ChainNamespace;
    initialDisconnect?: boolean;
};
export type SwitchConnectionParameters = {
    connectionId: string;
    namespace: ChainNamespace;
    address?: string;
};
export type ConnectionControllerClient = {
    connect: (params: ConnectParameters) => Promise<void>;
    disconnect: (params?: DisconnectParameters) => Promise<void>;
    reconnect: (params: ReconnectParameters) => Promise<void>;
    switchConnection: (params: SwitchConnectionParameters) => Promise<void>;
};
export type ConnectParameters = {
    connectorId: string;
    namespace: ChainNamespace;
    caipNetwork?: unknown;
    preferredAccountType?: 'eoa' | 'smartAccount';
};
export type ReconnectParameters = {
    connectorId: string;
    namespace: ChainNamespace;
};
declare class ConnectionController {
    private state;
    constructor();
    private initializeState;
    private createWalletConnectManager;
    subscribe(_callback: (state: ConnectionControllerState) => void): () => void;
    subscribeKey<K extends keyof ConnectionControllerState>(_key: K, _callback: (value: ConnectionControllerState[K]) => void): () => void;
    connect(_params: ConnectParameters): Promise<void>;
    disconnect(_params?: DisconnectParameters): Promise<void>;
    reconnect(_params: ReconnectParameters): Promise<void>;
    switchConnection(_params: SwitchConnectionParameters): Promise<void>;
    getConnectors(): Connector[];
    getConnections(namespace?: ChainNamespace): Connection[];
    getActiveConnection(namespace: ChainNamespace): Connection | undefined;
    hasAnyConnection(): boolean;
}
export { ConnectionController };
