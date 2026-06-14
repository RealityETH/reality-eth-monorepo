import UniversalProvider from '@walletconnect/universal-provider';
import { type Address, type CaipAddress, type CaipNetwork, type ChainNamespace, type Connection, type Hex, type ParsedCaipAddress } from '@reown/appkit-common';
import type { W3mFrameProvider } from '@reown/appkit-wallet';
import type { AccountType, Connector as AppKitConnector, CombinedProvider, Provider, SolanaTransactionRequest, Tokens, WriteContractArgs } from '../../utils/TypeUtil.js';
import { type AccountState } from '../ChainController.js';
import type { WalletConnectConnector } from './WalletConnectConnector.js';
import type { ChainAdapterConnector } from './types.js';
type EventName = 'disconnect' | 'accountChanged' | 'connections' | 'switchNetwork' | 'connectors' | 'pendingTransactions';
type EventData = {
    disconnect: () => void;
    accountChanged: {
        address: string;
        chainId?: number | string;
        connector?: ChainAdapterConnector;
    };
    switchNetwork: {
        address?: string;
        chainId: number | string;
    };
    connections: Connection[];
    connectors: ChainAdapterConnector[];
    pendingTransactions: () => void;
};
type EventCallback<T extends EventName> = (data: EventData[T]) => void;
/**
 * Abstract class representing a chain adapter blueprint.
 * @template Connector - The type of connector extending ChainAdapterConnector
 */
export declare abstract class AdapterBlueprint<Connector extends ChainAdapterConnector = ChainAdapterConnector> {
    namespace: ChainNamespace | undefined;
    projectId?: string;
    adapterType: string | undefined;
    getCaipNetworks: (namespace?: ChainNamespace) => CaipNetwork[];
    getConnectorId: (namespace: ChainNamespace) => string | undefined;
    protected availableConnectors: Connector[];
    protected availableConnections: Connection[];
    protected connector?: Connector;
    protected provider?: Connector['provider'];
    protected providerHandlers: Record<string, {
        disconnect: () => void;
        accountsChanged: (accounts: string[]) => void;
        chainChanged: (chainId: string) => void;
        provider: Provider | CombinedProvider;
    } | null>;
    private eventListeners;
    /**
     * Creates an instance of AdapterBlueprint.
     * @param {AdapterBlueprint.Params} params - The parameters for initializing the adapter
     */
    constructor(params?: AdapterBlueprint.Params);
    /**
     * Initializes the adapter with the given parameters.
     * @param {AdapterBlueprint.Params} params - The parameters for initializing the adapter
     */
    construct(params: AdapterBlueprint.Params): void;
    /**
     * Gets the available connectors.
     * @returns {Connector[]} An array of available connectors
     */
    get connectors(): Connector[];
    /**
     * Gets the available connections.
     * @returns {Connection[]} An array of available connections
     */
    get connections(): Connection[];
    /**
     * Gets the supported networks.
     * @returns {CaipNetwork[]} An array of supported networks
     */
    get networks(): CaipNetwork[];
    /**
     * Sets the universal provider for WalletConnect.
     * @param {UniversalProvider} universalProvider - The universal provider instance
     */
    abstract setUniversalProvider(universalProvider: UniversalProvider): Promise<void>;
    /**
     * Handles the auth connected event.
     * @param {W3mFrameTypes.Responses['FrameGetUserResponse']} user - The user response
     */
    private onAuthConnected;
    /**
     * Sets the auth provider.
     * @param {W3mFrameProvider} authProvider - The auth provider instance
     */
    setAuthProvider(authProvider: W3mFrameProvider): void;
    /**
     * Adds one or more connectors to the available connectors list.
     * @param {...Connector} connectors - The connectors to add
     */
    protected addConnector(...connectors: Connector[]): void;
    /**
     * Adds connections to the available connections list
     * @param {...Connection} connections - The connections to add
     */
    protected addConnection(...connections: Connection[]): void;
    /**
     * Deletes a connection from the available connections list
     * @param {string} connectorId - The connector ID of the connection to delete
     */
    protected deleteConnection(connectorId: string): void;
    /**
     * Clears all connections from the available connections list
     * @param {boolean} emit - Whether to emit the connections event
     */
    protected clearConnections(emit?: boolean): void;
    protected setStatus(status: AccountState['status'], chainNamespace?: ChainNamespace): void;
    /**
     * Adds an event listener for a specific event.
     * @template T
     * @param {T} eventName - The name of the event
     * @param {EventCallback<T>} callback - The callback function to be called when the event is emitted
     */
    on<T extends EventName>(eventName: T, callback: EventCallback<T>): void;
    /**
     * Removes an event listener for a specific event.
     * @template T
     * @param {T} eventName - The name of the event
     * @param {EventCallback<T>} callback - The callback function to be removed
     */
    off<T extends EventName>(eventName: T, callback: EventCallback<T>): void;
    /**
     * Removes all event listeners.
     */
    removeAllEventListeners(): void;
    /**
     * Emits an event with the given name and optional data.
     * @template T
     * @param {T} eventName - The name of the event to emit
     * @param {EventData[T]} [data] - The optional data to be passed to the event listeners
     */
    protected emit<T extends EventName>(eventName: T, data?: EventData[T]): void;
    /**
     * Connects to WalletConnect.
     * @param {number | string} [_chainId] - Optional chain ID to connect to
     */
    connectWalletConnect(_chainId?: number | string): Promise<undefined | {
        clientId: string;
    }>;
    /**
     * Connects to a wallet.
     * @param {AdapterBlueprint.ConnectParams} params - Connection parameters
     * @returns {Promise<AdapterBlueprint.ConnectResult>} Connection result
     */
    abstract connect(params: AdapterBlueprint.ConnectParams): Promise<AdapterBlueprint.ConnectResult>;
    /**
     * Gets the accounts for the connected wallet.
     * @returns {Promise<AccountType[]>} An array of account objects with their associated type and namespace
     */
    abstract getAccounts(params: AdapterBlueprint.GetAccountsParams): Promise<AdapterBlueprint.GetAccountsResult>;
    /**
     * Switches the network.
     * @param {AdapterBlueprint.SwitchNetworkParams} params - Network switching parameters
     */
    switchNetwork(params: AdapterBlueprint.SwitchNetworkParams): Promise<void>;
    /**
     * Disconnects the current or all wallets
     * @param {AdapterBlueprint.DisconnectParams} params - Disconnection parameters
     * @returns {Promise<AdapterBlueprint.DisconnectResult>} Disconnection result
     */
    abstract disconnect(params?: AdapterBlueprint.DisconnectParams): Promise<AdapterBlueprint.DisconnectResult>;
    /**
     * Gets the balance for a given address and chain ID.
     * @param {AdapterBlueprint.GetBalanceParams} params - Balance retrieval parameters
     * @returns {Promise<AdapterBlueprint.GetBalanceResult>} Balance result
     */
    abstract getBalance(params: AdapterBlueprint.GetBalanceParams): Promise<AdapterBlueprint.GetBalanceResult>;
    /**
     * Synchronizes the connectors with the given options and AppKit instance.
     * @param {AppKitOptions} [options] - Optional AppKit options
     * @param {AppKit} [appKit] - Optional AppKit instance
     */
    abstract syncConnectors(): void | Promise<void>;
    /**
     * Synchronizes the connections with the given options and AppKit instance.
     * @param {AppKitOptions} [options] - Optional AppKit options
     * @param {AppKit} [appKit] - Optional AppKit instance
     */
    abstract syncConnections(params: AdapterBlueprint.SyncConnectionsParams): void | Promise<void>;
    /**
     * Synchronizes the connection with the given parameters.
     * @param {AdapterBlueprint.SyncConnectionParams} params - Synchronization parameters
     * @returns {Promise<AdapterBlueprint.ConnectResult>} Connection result
     */
    abstract syncConnection(params: AdapterBlueprint.SyncConnectionParams): Promise<AdapterBlueprint.ConnectResult>;
    /**
     * Signs a message with the connected wallet.
     * @param {AdapterBlueprint.SignMessageParams} params - Parameters including message to sign, address, and optional provider
     * @returns {Promise<AdapterBlueprint.SignMessageResult>} Object containing the signature
     */
    abstract signMessage(params: AdapterBlueprint.SignMessageParams): Promise<AdapterBlueprint.SignMessageResult>;
    /**
     * Estimates gas for a transaction.
     * @param {AdapterBlueprint.EstimateGasTransactionArgs} params - Parameters including address, to, data, and optional provider
     * @returns {Promise<AdapterBlueprint.EstimateGasTransactionResult>} Object containing the gas estimate
     */
    abstract estimateGas(params: AdapterBlueprint.EstimateGasTransactionArgs): Promise<AdapterBlueprint.EstimateGasTransactionResult>;
    /**
     * Sends a transaction.
     * @param {AdapterBlueprint.SendTransactionParams} params - Parameters including address, to, data, value, gasPrice, gas, and optional provider
     * @returns {Promise<AdapterBlueprint.SendTransactionResult>} Object containing the transaction hash
     */
    abstract sendTransaction(params: AdapterBlueprint.SendTransactionParams): Promise<AdapterBlueprint.SendTransactionResult>;
    /**
     * Writes a contract transaction.
     * @param {AdapterBlueprint.WriteContractParams} params - Parameters including receiver address, token amount, token address, from address, method, and ABI
     * @returns {Promise<AdapterBlueprint.WriteContractResult>} Object containing the transaction hash
     */
    abstract writeContract(params: AdapterBlueprint.WriteContractParams): Promise<AdapterBlueprint.WriteContractResult>;
    /**
     * Writes a solana contract transaction.
     * @param {AdapterBlueprint.WriteContractParams} params - Parameters including receiver address, token amount, token address, from address, method, and ABI
     * @returns {Promise<AdapterBlueprint.WriteContractResult>} Object containing the transaction hash
     */
    abstract writeSolanaTransaction(params: AdapterBlueprint.WriteSolanaTransactionParams): Promise<AdapterBlueprint.WriteSolanaTransactionResult>;
    /**
     * Parses a decimal string value into a bigint with the specified number of decimals.
     * @param {AdapterBlueprint.ParseUnitsParams} params - Parameters including value and decimals
     * @returns {AdapterBlueprint.ParseUnitsResult} The parsed bigint value
     */
    abstract parseUnits(params: AdapterBlueprint.ParseUnitsParams): AdapterBlueprint.ParseUnitsResult;
    /**
     * Formats a bigint value into a decimal string with the specified number of decimals.
     * @param {AdapterBlueprint.FormatUnitsParams} params - Parameters including value and decimals
     * @returns {AdapterBlueprint.FormatUnitsResult} The formatted decimal string
     */
    abstract formatUnits(params: AdapterBlueprint.FormatUnitsParams): AdapterBlueprint.FormatUnitsResult;
    /**
     * Gets the WalletConnect provider.
     * @param {AdapterBlueprint.GetWalletConnectProviderParams} params - Parameters including provider, caip networks, and active caip network
     * @returns {AdapterBlueprint.GetWalletConnectProviderResult} The WalletConnect provider
     */
    abstract getWalletConnectProvider(params: AdapterBlueprint.GetWalletConnectProviderParams): AdapterBlueprint.GetWalletConnectProviderResult;
    /**
     * Reconnects to a wallet.
     * @param {AdapterBlueprint.ReconnectParams} params - Reconnection parameters
     */
    reconnect?(params: AdapterBlueprint.ReconnectParams): Promise<void>;
    abstract getCapabilities(params: AdapterBlueprint.GetCapabilitiesParams): Promise<unknown>;
    abstract grantPermissions(params: AdapterBlueprint.GrantPermissionsParams): Promise<unknown>;
    abstract revokePermissions(params: AdapterBlueprint.RevokePermissionsParams): Promise<Hex>;
    abstract walletGetAssets(params: AdapterBlueprint.WalletGetAssetsParams): Promise<AdapterBlueprint.WalletGetAssetsResponse>;
    protected getWalletConnectConnector(): WalletConnectConnector;
    /**
     * Handles connect event for a specific connector.
     * @param {string[]} accounts - The accounts that changed
     * @param {string} connectorId - The ID of the connector
     */
    protected onConnect(accounts: (ParsedCaipAddress | string)[], connectorId: string): void;
    /**
     * Handles accounts changed event for a specific connector.
     * @param {string[]} accounts - The accounts that changed
     * @param {string} connectorId - The ID of the connector
     */
    protected onAccountsChanged(accounts: (ParsedCaipAddress | string)[], connectorId: string, disconnectIfNoAccounts?: boolean): void;
    /**
     * Handles disconnect event for a specific connector.
     * @param {string} connectorId - The ID of the connector
     */
    protected onDisconnect(connectorId: string): void;
    /**
     * Handles chain changed event for a specific connector.
     * @param {string} chainId - The ID of the chain that changed
     * @param {string} connectorId - The ID of the connector
     */
    protected onChainChanged(chainId: string | number, connectorId: string): void;
    /**
     * Listens to provider events for a specific connector.
     * @param {string} connectorId - The ID of the connector
     * @param {Provider | CombinedProvider} provider - The provider to listen to
     */
    protected listenProviderEvents(connectorId: string, provider: Provider | CombinedProvider): void;
    /**
     * Removes provider listeners for a specific connector.
     * @param {string} connectorId - The ID of the connector
     */
    protected removeProviderListeners(connectorId: string): void;
    /**
     * Emits the first available connection.
     */
    protected emitFirstAvailableConnection(): void;
    /**
     * Gets a connection based on provided parameters.
     * If connectorId is provided, returns connection for that specific connector.
     * Otherwise, returns the first available valid connection.
     *
     * @param params - Connection parameters
     * @param params.address - Optional address to filter by
     * @param params.connectorId - Optional connector ID to filter by
     * @param params.connections - List of available connections
     * @param params.connectors - List of available connectors
     * @returns Connection or null if none found
     */
    getConnection({ address, connectorId, connections, connectors }: AdapterBlueprint.GetConnectionParams): {
        account: {
            type?: string;
            address: string;
            publicKey?: string;
        } | undefined;
        connector: ChainAdapterConnector | undefined;
        name?: string;
        icon?: string;
        networkIcon?: string;
        accounts: {
            type?: string;
            address: string;
            publicKey?: string;
        }[];
        caipNetwork?: CaipNetwork;
        connectorId: string;
        auth?: {
            name: string | undefined;
            username: string | undefined;
        };
    } | null;
}
export declare namespace AdapterBlueprint {
    type Params = {
        namespace?: ChainNamespace;
        networks?: CaipNetwork[];
        projectId?: string;
        adapterType?: string;
    };
    type SwitchNetworkParams = {
        caipNetwork: CaipNetwork;
    };
    type GetBalanceParams = {
        address: string | undefined;
        chainId: number | string | undefined;
        caipNetwork?: CaipNetwork;
        tokens?: Tokens;
    };
    type DisconnectParams = {
        id?: string;
    };
    type ConnectParams = {
        id: string;
        address?: string;
        provider?: unknown;
        info?: unknown;
        type: string;
        chain?: ChainNamespace;
        chainId?: number | string;
        rpcUrl?: string;
        socialUri?: string;
    };
    type ReconnectParams = ConnectParams;
    type SyncConnectionParams = {
        id: string;
        namespace: ChainNamespace;
        chainId?: number | string;
        rpcUrl: string;
    };
    type SyncConnectionsParams = {
        connectToFirstConnector: boolean;
        caipNetwork?: CaipNetwork;
    };
    type SignMessageParams = {
        message: string;
        address: string;
        provider?: AppKitConnector['provider'];
    };
    type SignMessageResult = {
        signature: string;
    };
    type EstimateGasTransactionArgs = {
        address: string;
        to: string;
        data: string;
        caipNetwork: CaipNetwork;
        provider?: AppKitConnector['provider'];
        value?: bigint | number;
    };
    type EstimateGasTransactionResult = {
        gas: bigint;
    };
    type WriteContractParams = WriteContractArgs & {
        caipNetwork: CaipNetwork;
        provider?: AppKitConnector['provider'];
        caipAddress: CaipAddress;
    };
    type WriteSolanaTransactionParams = SolanaTransactionRequest & {
        caipNetwork: CaipNetwork;
        provider?: AppKitConnector['provider'];
        caipAddress: CaipAddress;
    };
    type WriteContractResult = {
        hash: string;
    };
    type WriteSolanaTransactionResult = {
        hash: string;
    };
    type ParseUnitsParams = {
        value: string;
        decimals: number;
    };
    type ParseUnitsResult = bigint;
    type FormatUnitsParams = {
        value: bigint;
        decimals: number;
    };
    type FormatUnitsResult = string;
    type GetWalletConnectProviderParams = {
        provider: AppKitConnector['provider'];
        caipNetworks: CaipNetwork[];
        activeCaipNetwork: CaipNetwork;
    };
    type GetWalletConnectProviderResult = AppKitConnector['provider'];
    type GetCapabilitiesParams = string;
    type GrantPermissionsParams = object | readonly unknown[];
    type RevokePermissionsParams = {
        pci: string;
        permissions: unknown[];
        expiry: number;
        address: CaipAddress;
    };
    type WalletGetAssetsParams = {
        account: Address;
        assetFilter?: Record<Address, (Address | 'native')[]>;
        assetTypeFilter?: ('NATIVE' | 'ERC20')[];
        chainFilter?: Address[];
    };
    type WalletGetAssetsResponse = Record<Address, {
        address: Address | 'native';
        balance: Hex;
        type: 'NATIVE' | 'ERC20';
        metadata: Record<string, unknown>;
    }[]>;
    type SendTransactionParams = {
        to: string;
        value: bigint | number;
        data?: string;
        gasPrice?: bigint | number;
        gas?: bigint | number;
        caipNetwork?: CaipNetwork;
        provider?: AppKitConnector['provider'];
        tokenMint?: string;
    };
    type SendTransactionResult = {
        hash: string;
    };
    type GetBalanceResult = {
        balance: string;
        symbol: string;
    };
    type DisconnectResult = {
        connections: Connection[];
    };
    type ConnectResult = {
        id: AppKitConnector['id'];
        type: AppKitConnector['type'];
        provider: AppKitConnector['provider'];
        chainId: number | string;
        address: string;
        accounts?: [];
    };
    type GetAccountsResult = {
        accounts: AccountType[];
    };
    type GetAccountsParams = {
        id: AppKitConnector['id'];
        namespace?: ChainNamespace;
    };
    interface GetConnectionParams<C extends ChainAdapterConnector = ChainAdapterConnector> {
        connectorId?: string;
        address?: string;
        connectors: C[];
        connections: Connection[];
    }
}
export {};
