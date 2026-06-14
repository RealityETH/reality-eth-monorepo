import { onMounted, onUnmounted, ref } from 'vue';
import { ConstantsUtil } from '@reown/appkit-common';
import { AlertController } from '../src/controllers/AlertController.js';
import { AssetController } from '../src/controllers/AssetController.js';
import { ChainController } from '../src/controllers/ChainController.js';
import { ConnectionController } from '../src/controllers/ConnectionController.js';
import { ConnectorController } from '../src/controllers/ConnectorController.js';
import { OptionsController } from '../src/controllers/OptionsController.js';
import { getPreferredAccountType } from '../src/utils/ChainControllerUtil.js';
import { ConnectionControllerUtil } from '../src/utils/ConnectionControllerUtil.js';
import { CoreHelperUtil } from '../src/utils/CoreHelperUtil.js';
import { StorageUtil } from '../src/utils/StorageUtil.js';
import { AssetUtil } from './utils.js';
// -- Hooks ------------------------------------------------------------
export function useAppKitAccount(options) {
    const chainNamespace = ref(options?.namespace || ChainController.state.activeChain);
    const chains = ref(ChainController.state.chains);
    const state = ref({
        allAccounts: [],
        address: undefined,
        caipAddress: undefined,
        status: undefined,
        isConnected: false,
        embeddedWalletInfo: undefined
    });
    function updateState(_chains, _chainNamespace) {
        const activeConnectorId = StorageUtil.getConnectedConnectorId(_chainNamespace);
        const authConnector = _chainNamespace
            ? ConnectorController.getAuthConnector(_chainNamespace)
            : undefined;
        const activeChainNamespace = _chainNamespace || ChainController.state.activeChain;
        const accountState = activeChainNamespace
            ? _chains.get(activeChainNamespace)?.accountState
            : undefined;
        state.value.address = CoreHelperUtil.getPlainAddress(accountState?.caipAddress);
        state.value.caipAddress = accountState?.caipAddress;
        state.value.status = accountState?.status;
        state.value.isConnected = Boolean(accountState?.caipAddress);
        state.value.embeddedWalletInfo =
            authConnector && activeConnectorId === ConstantsUtil.CONNECTOR_ID.AUTH
                ? {
                    user: accountState?.user,
                    authProvider: accountState?.socialProvider ?? 'email',
                    accountType: getPreferredAccountType(activeChainNamespace),
                    isSmartAccountDeployed: Boolean(accountState?.smartAccountDeployed)
                }
                : undefined;
    }
    const unsubscribeActiveChain = ChainController.subscribeKey('activeChain', val => {
        chainNamespace.value = options?.namespace || val;
        updateState(chains.value, chainNamespace.value);
    });
    const unsubscribeChains = ChainController.subscribe(val => {
        chains.value = val['chains'];
        updateState(chains.value, chainNamespace.value);
    });
    onMounted(() => {
        updateState(chains.value, chainNamespace.value);
    });
    onUnmounted(() => {
        unsubscribeChains();
        unsubscribeActiveChain();
    });
    return state;
}
export function useDisconnect() {
    async function disconnect(props) {
        await ConnectionController.disconnect(props);
    }
    return { disconnect };
}
export function useAppKitConnections(namespace) {
    const state = ref({
        connections: [],
        recentConnections: []
    });
    const unsubscribe = [];
    function formatConnection(connection) {
        const connector = ConnectorController.getConnectorById(connection.connectorId);
        const name = ConnectorController.getConnectorName(connector?.name);
        const icon = AssetUtil.getConnectorImage(connector);
        const networkImage = AssetUtil.getNetworkImage(connection.caipNetwork);
        return {
            name,
            icon,
            networkIcon: networkImage,
            ...connection
        };
    }
    function updateConnections() {
        const chainNamespace = namespace ?? ChainController.state.activeChain;
        if (!chainNamespace) {
            state.value = {
                connections: [],
                recentConnections: []
            };
            return;
        }
        try {
            const { connections, recentConnections } = ConnectionControllerUtil.getConnectionsData(chainNamespace);
            state.value = {
                connections: connections.map(formatConnection),
                recentConnections: recentConnections.map(formatConnection)
            };
        }
        catch (error) {
            console.warn('Failed to get connections data:', error);
            state.value = {
                connections: [],
                recentConnections: []
            };
        }
    }
    unsubscribe.push(ConnectionController.subscribeKey('connections', () => {
        updateConnections();
    }));
    unsubscribe.push(ConnectorController.subscribeKey('connectors', () => {
        updateConnections();
    }));
    unsubscribe.push(AssetController.subscribeKey('connectorImages', () => {
        updateConnections();
    }));
    unsubscribe.push(AssetController.subscribeKey('networkImages', () => {
        updateConnections();
    }));
    unsubscribe.push(ChainController.subscribeKey('activeChain', () => {
        updateConnections();
    }));
    onMounted(() => {
        updateConnections();
    });
    onUnmounted(() => {
        unsubscribe.forEach(unsubscribe => unsubscribe());
    });
    const isMultiWalletEnabled = Boolean(OptionsController.state.remoteFeatures?.multiWallet);
    if (!isMultiWalletEnabled) {
        AlertController.open(ConstantsUtil.REMOTE_FEATURES_ALERTS.MULTI_WALLET_NOT_ENABLED.CONNECTIONS_HOOK, 'info');
        return ref({
            connections: [],
            recentConnections: []
        });
    }
    return state;
}
export function useAppKitConnection(props) {
    const { namespace, onSuccess, onError } = props;
    const unsubscribe = [];
    const state = ref({
        connection: undefined,
        isPending: false,
        switchConnection: () => Promise.resolve(undefined),
        deleteConnection: () => ({})
    });
    const forceUpdateCounter = ref(0);
    function updateConnection() {
        const chainNamespace = namespace ?? ChainController.state.activeChain;
        if (!chainNamespace) {
            state.value.connection = undefined;
            state.value.isPending = false;
            return;
        }
        const activeConnectorIds = ConnectorController.state.activeConnectorIds || {};
        const connections = ConnectionController.state.connections || new Map();
        const connectorId = activeConnectorIds[chainNamespace];
        const connList = connections.get(chainNamespace);
        const connection = connList?.find(c => c.connectorId.toLowerCase() === connectorId?.toLowerCase());
        state.value.connection = connection;
        state.value.isPending = ConnectionController.state.isSwitchingConnection || false;
    }
    async function switchConnection({ connection: _connection, address }) {
        const chainNamespace = namespace ?? ChainController.state.activeChain;
        if (!chainNamespace) {
            console.warn('No namespace found for switchConnection');
            return;
        }
        try {
            ConnectionController.setIsSwitchingConnection(true);
            await ConnectionController.switchConnection({
                connection: _connection,
                address,
                namespace: chainNamespace,
                onChange({ address: newAddress, namespace: newNamespace, hasSwitchedAccount, hasSwitchedWallet }) {
                    onSuccess?.({
                        address: newAddress,
                        namespace: newNamespace,
                        hasSwitchedAccount,
                        hasSwitchedWallet,
                        hasDeletedWallet: false
                    });
                }
            });
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error('Something went wrong');
            onError?.(error);
        }
        finally {
            ConnectionController.setIsSwitchingConnection(false);
        }
    }
    function deleteConnection({ address, connectorId }) {
        const chainNamespace = namespace ?? ChainController.state.activeChain;
        if (!chainNamespace) {
            console.warn('No namespace found for deleteConnection');
            return;
        }
        StorageUtil.deleteAddressFromConnection({ connectorId, address, namespace: chainNamespace });
        ConnectionController.syncStorageConnections();
        onSuccess?.({
            address,
            namespace: chainNamespace,
            hasSwitchedAccount: false,
            hasSwitchedWallet: false,
            hasDeletedWallet: true
        });
        forceUpdateCounter.value += 1;
    }
    state.value.switchConnection = switchConnection;
    state.value.deleteConnection = deleteConnection;
    unsubscribe.push(ConnectionController.subscribeKey('connections', () => {
        updateConnection();
    }));
    unsubscribe.push(ConnectionController.subscribeKey('isSwitchingConnection', () => {
        updateConnection();
    }));
    unsubscribe.push(ConnectorController.subscribeKey('activeConnectorIds', () => {
        updateConnection();
    }));
    unsubscribe.push(ChainController.subscribeKey('activeChain', () => {
        updateConnection();
    }));
    onMounted(() => {
        updateConnection();
    });
    onUnmounted(() => {
        unsubscribe.forEach(unsubscribe => unsubscribe());
    });
    const isMultiWalletEnabled = Boolean(OptionsController.state.remoteFeatures?.multiWallet);
    if (!isMultiWalletEnabled) {
        AlertController.open(ConstantsUtil.REMOTE_FEATURES_ALERTS.MULTI_WALLET_NOT_ENABLED.CONNECTION_HOOK, 'info');
        return ref({
            connection: undefined,
            isPending: false,
            switchConnection: () => Promise.resolve(undefined),
            deleteConnection: () => ({})
        });
    }
    return state;
}
//# sourceMappingURL=vue.js.map