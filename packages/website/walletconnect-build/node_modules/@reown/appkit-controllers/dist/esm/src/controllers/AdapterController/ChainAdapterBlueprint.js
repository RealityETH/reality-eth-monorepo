import UniversalProvider from '@walletconnect/universal-provider';
import { ConstantsUtil as CommonConstantsUtil, UserRejectedRequestError } from '@reown/appkit-common';
import { getPreferredAccountType } from '../../utils/ChainControllerUtil.js';
import { CoreHelperUtil } from '../../utils/CoreHelperUtil.js';
import { WcHelpersUtil } from '../../utils/WalletConnectUtil.js';
import {} from '../ChainController.js';
import { ChainController } from '../ChainController.js';
import { ConnectorController } from '../ConnectorController.js';
import { ProviderController } from '../ProviderController.js';
const IGNORED_CONNECTOR_IDS_FOR_LISTENER = [
    CommonConstantsUtil.CONNECTOR_ID.AUTH,
    CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
];
/**
 * Abstract class representing a chain adapter blueprint.
 * @template Connector - The type of connector extending ChainAdapterConnector
 */
export class AdapterBlueprint {
    /**
     * Creates an instance of AdapterBlueprint.
     * @param {AdapterBlueprint.Params} params - The parameters for initializing the adapter
     */
    constructor(params) {
        this.availableConnectors = [];
        this.availableConnections = [];
        this.providerHandlers = {};
        this.eventListeners = new Map();
        this.getCaipNetworks = (namespace) => ChainController.getCaipNetworks(namespace);
        this.getConnectorId = (namespace) => ConnectorController.getConnectorId(namespace);
        if (params) {
            this.construct(params);
        }
    }
    /**
     * Initializes the adapter with the given parameters.
     * @param {AdapterBlueprint.Params} params - The parameters for initializing the adapter
     */
    construct(params) {
        this.projectId = params.projectId;
        this.namespace = params.namespace;
        this.adapterType = params.adapterType;
    }
    /**
     * Gets the available connectors.
     * @returns {Connector[]} An array of available connectors
     */
    get connectors() {
        return this.availableConnectors;
    }
    /**
     * Gets the available connections.
     * @returns {Connection[]} An array of available connections
     */
    get connections() {
        return this.availableConnections;
    }
    /**
     * Gets the supported networks.
     * @returns {CaipNetwork[]} An array of supported networks
     */
    get networks() {
        return this.getCaipNetworks(this.namespace);
    }
    /**
     * Handles the auth connected event.
     * @param {W3mFrameTypes.Responses['FrameGetUserResponse']} user - The user response
     */
    onAuthConnected({ accounts, chainId }) {
        const caipNetwork = this.getCaipNetworks()
            .filter(n => n.chainNamespace === this.namespace)
            .find(n => n.id.toString() === chainId?.toString());
        if (accounts && caipNetwork) {
            this.addConnection({
                connectorId: CommonConstantsUtil.CONNECTOR_ID.AUTH,
                accounts,
                caipNetwork
            });
        }
    }
    /**
     * Sets the auth provider.
     * @param {W3mFrameProvider} authProvider - The auth provider instance
     */
    setAuthProvider(authProvider) {
        authProvider.onConnect(this.onAuthConnected.bind(this));
        authProvider.onSocialConnected(this.onAuthConnected.bind(this));
        this.addConnector({
            id: CommonConstantsUtil.CONNECTOR_ID.AUTH,
            type: 'AUTH',
            name: CommonConstantsUtil.CONNECTOR_NAMES.AUTH,
            provider: authProvider,
            imageId: undefined,
            chain: this.namespace,
            chains: []
        });
    }
    /**
     * Adds one or more connectors to the available connectors list.
     * @param {...Connector} connectors - The connectors to add
     */
    addConnector(...connectors) {
        const connectorsAdded = new Set();
        this.availableConnectors = [...connectors, ...this.availableConnectors].filter(connector => {
            if (connectorsAdded.has(connector.id)) {
                return false;
            }
            connectorsAdded.add(connector.id);
            return true;
        });
        this.emit('connectors', this.availableConnectors);
    }
    /**
     * Adds connections to the available connections list
     * @param {...Connection} connections - The connections to add
     */
    addConnection(...connections) {
        const connectionsAdded = new Set();
        this.availableConnections = [...connections, ...this.availableConnections].filter(connection => {
            if (connectionsAdded.has(connection.connectorId.toLowerCase())) {
                return false;
            }
            connectionsAdded.add(connection.connectorId.toLowerCase());
            return true;
        });
        this.emit('connections', this.availableConnections);
    }
    /**
     * Deletes a connection from the available connections list
     * @param {string} connectorId - The connector ID of the connection to delete
     */
    deleteConnection(connectorId) {
        this.availableConnections = this.availableConnections.filter(c => c.connectorId.toLowerCase() !== connectorId.toLowerCase());
        this.emit('connections', this.availableConnections);
    }
    /**
     * Clears all connections from the available connections list
     * @param {boolean} emit - Whether to emit the connections event
     */
    clearConnections(emit = false) {
        this.availableConnections = [];
        if (emit) {
            this.emit('connections', this.availableConnections);
        }
    }
    setStatus(status, chainNamespace) {
        ChainController.setAccountProp('status', status, chainNamespace);
    }
    /**
     * Adds an event listener for a specific event.
     * @template T
     * @param {T} eventName - The name of the event
     * @param {EventCallback<T>} callback - The callback function to be called when the event is emitted
     */
    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, new Set());
        }
        this.eventListeners.get(eventName)?.add(callback);
    }
    /**
     * Removes an event listener for a specific event.
     * @template T
     * @param {T} eventName - The name of the event
     * @param {EventCallback<T>} callback - The callback function to be removed
     */
    off(eventName, callback) {
        const listeners = this.eventListeners.get(eventName);
        if (listeners) {
            listeners.delete(callback);
        }
    }
    /**
     * Removes all event listeners.
     */
    removeAllEventListeners() {
        this.eventListeners.forEach(listeners => {
            listeners.clear();
        });
    }
    /**
     * Emits an event with the given name and optional data.
     * @template T
     * @param {T} eventName - The name of the event to emit
     * @param {EventData[T]} [data] - The optional data to be passed to the event listeners
     */
    emit(eventName, data) {
        const listeners = this.eventListeners.get(eventName);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }
    /**
     * Connects to WalletConnect.
     * @param {number | string} [_chainId] - Optional chain ID to connect to
     */
    async connectWalletConnect(_chainId) {
        try {
            const connector = this.getWalletConnectConnector();
            const result = await connector.connectWalletConnect();
            return { clientId: result.clientId };
        }
        catch (err) {
            if (WcHelpersUtil.isUserRejectedRequestError(err)) {
                throw new UserRejectedRequestError(err);
            }
            throw err;
        }
    }
    /**
     * Switches the network.
     * @param {AdapterBlueprint.SwitchNetworkParams} params - Network switching parameters
     */
    async switchNetwork(params) {
        const { caipNetwork } = params;
        const providerType = ProviderController.getProviderId(caipNetwork.chainNamespace);
        const provider = ProviderController.getProvider(caipNetwork.chainNamespace);
        if (!provider) {
            throw new Error('Provider not found');
        }
        if (providerType === 'WALLET_CONNECT') {
            const walletConnectProvider = provider;
            walletConnectProvider.setDefaultChain(caipNetwork.caipNetworkId);
            return;
        }
        if (providerType === 'AUTH') {
            const authProvider = ConnectorController.getAuthConnector()?.provider;
            if (!authProvider) {
                throw new Error('Auth provider not found');
            }
            const preferredAccountType = getPreferredAccountType(caipNetwork.chainNamespace);
            await authProvider.switchNetwork({ chainId: caipNetwork.caipNetworkId });
            const user = await authProvider.getUser({
                chainId: caipNetwork.caipNetworkId,
                preferredAccountType
            });
            this.emit('switchNetwork', user);
        }
    }
    getWalletConnectConnector() {
        const connector = this.connectors.find(c => c.id === 'walletConnect');
        if (!connector) {
            throw new Error('WalletConnectConnector not found');
        }
        // Review why this type assertion is necessary
        return connector;
    }
    /**
     * Handles connect event for a specific connector.
     * @param {string[]} accounts - The accounts that changed
     * @param {string} connectorId - The ID of the connector
     */
    onConnect(accounts, connectorId) {
        if (accounts.length > 0) {
            const { address, chainId } = CoreHelperUtil.getAccount(accounts[0]);
            const caipNetwork = this.getCaipNetworks()
                .filter(n => n.chainNamespace === this.namespace)
                .find(n => n.id.toString() === chainId?.toString());
            const connector = this.connectors.find(c => c.id === connectorId);
            if (address) {
                this.emit('accountChanged', {
                    address,
                    chainId,
                    connector
                });
                this.addConnection({
                    connectorId,
                    accounts: accounts.map(_account => {
                        const { address } = CoreHelperUtil.getAccount(_account);
                        return { address: address };
                    }),
                    caipNetwork
                });
            }
        }
    }
    /**
     * Handles accounts changed event for a specific connector.
     * @param {string[]} accounts - The accounts that changed
     * @param {string} connectorId - The ID of the connector
     */
    onAccountsChanged(accounts, connectorId, disconnectIfNoAccounts = true) {
        if (accounts.length > 0) {
            const { address } = CoreHelperUtil.getAccount(accounts[0]);
            const connection = this.getConnection({
                connectorId,
                connections: this.connections,
                connectors: this.connectors
            });
            if (address &&
                this.getConnectorId(CommonConstantsUtil.CHAIN.EVM)?.toLowerCase() ===
                    connectorId.toLowerCase()) {
                this.emit('accountChanged', {
                    address,
                    chainId: connection?.caipNetwork?.id,
                    connector: connection?.connector
                });
            }
            this.addConnection({
                connectorId,
                accounts: accounts.map(_account => {
                    const { address } = CoreHelperUtil.getAccount(_account);
                    return { address: address };
                }),
                caipNetwork: connection?.caipNetwork
            });
        }
        else if (disconnectIfNoAccounts) {
            this.onDisconnect(connectorId);
        }
    }
    /**
     * Handles disconnect event for a specific connector.
     * @param {string} connectorId - The ID of the connector
     */
    onDisconnect(connectorId) {
        this.removeProviderListeners(connectorId);
        this.deleteConnection(connectorId);
        if (this.getConnectorId(CommonConstantsUtil.CHAIN.EVM)?.toLowerCase() ===
            connectorId.toLowerCase()) {
            this.emitFirstAvailableConnection();
        }
        if (this.connections.length === 0) {
            this.emit('disconnect');
        }
    }
    /**
     * Handles chain changed event for a specific connector.
     * @param {string} chainId - The ID of the chain that changed
     * @param {string} connectorId - The ID of the connector
     */
    onChainChanged(chainId, connectorId) {
        const formattedChainId = typeof chainId === 'string' && chainId.startsWith('0x')
            ? parseInt(chainId, 16).toString()
            : chainId.toString();
        const connection = this.getConnection({
            connectorId,
            connections: this.connections,
            connectors: this.connectors
        });
        const caipNetwork = this.getCaipNetworks()
            .filter(n => n.chainNamespace === this.namespace)
            .find(n => n.id.toString() === formattedChainId);
        if (connection) {
            this.addConnection({
                connectorId,
                accounts: connection.accounts,
                caipNetwork
            });
        }
        if (this.getConnectorId(CommonConstantsUtil.CHAIN.EVM)?.toLowerCase() ===
            connectorId.toLowerCase()) {
            this.emit('switchNetwork', { chainId: formattedChainId });
        }
    }
    /**
     * Listens to provider events for a specific connector.
     * @param {string} connectorId - The ID of the connector
     * @param {Provider | CombinedProvider} provider - The provider to listen to
     */
    listenProviderEvents(connectorId, provider) {
        if (IGNORED_CONNECTOR_IDS_FOR_LISTENER.includes(connectorId)) {
            return;
        }
        const accountsChangedHandler = (accounts) => this.onAccountsChanged(accounts, connectorId);
        const chainChangedHandler = (chainId) => this.onChainChanged(chainId, connectorId);
        const disconnectHandler = () => this.onDisconnect(connectorId);
        if (!this.providerHandlers[connectorId]) {
            provider.on('disconnect', disconnectHandler);
            provider.on('accountsChanged', accountsChangedHandler);
            provider.on('chainChanged', chainChangedHandler);
            this.providerHandlers[connectorId] = {
                provider,
                disconnect: disconnectHandler,
                accountsChanged: accountsChangedHandler,
                chainChanged: chainChangedHandler
            };
        }
    }
    /**
     * Removes provider listeners for a specific connector.
     * @param {string} connectorId - The ID of the connector
     */
    removeProviderListeners(connectorId) {
        if (this.providerHandlers[connectorId]) {
            const { provider, disconnect, accountsChanged, chainChanged } = this.providerHandlers[connectorId];
            provider.removeListener('disconnect', disconnect);
            provider.removeListener('accountsChanged', accountsChanged);
            provider.removeListener('chainChanged', chainChanged);
            this.providerHandlers[connectorId] = null;
        }
    }
    /**
     * Emits the first available connection.
     */
    emitFirstAvailableConnection() {
        const connection = this.getConnection({
            connections: this.connections,
            connectors: this.connectors
        });
        if (connection) {
            const [account] = connection.accounts;
            this.emit('accountChanged', {
                address: account?.address,
                chainId: connection.caipNetwork?.id,
                connector: connection.connector
            });
        }
    }
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
    getConnection({ address, connectorId, connections, connectors }) {
        if (connectorId) {
            const connection = connections.find(c => c.connectorId.toLowerCase() === connectorId.toLowerCase());
            if (!connection) {
                return null;
            }
            const connector = connectors.find(c => c.id.toLowerCase() === connection.connectorId.toLowerCase());
            const account = address
                ? connection.accounts.find(a => a.address.toLowerCase() === address.toLowerCase())
                : connection.accounts[0];
            return { ...connection, account, connector };
        }
        const validConnection = connections.find(c => c.accounts.length > 0 &&
            connectors.some(conn => conn.id.toLowerCase() === c.connectorId.toLowerCase()));
        if (validConnection) {
            const [account] = validConnection.accounts;
            const connector = connectors.find(c => c.id.toLowerCase() === validConnection.connectorId.toLowerCase());
            return {
                ...validConnection,
                account,
                connector
            };
        }
        return null;
    }
}
//# sourceMappingURL=ChainAdapterBlueprint.js.map