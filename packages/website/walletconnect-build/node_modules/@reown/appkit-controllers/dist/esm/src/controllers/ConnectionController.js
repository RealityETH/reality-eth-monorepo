/* eslint-disable no-console */
import { proxy, ref, subscribe as sub } from 'valtio/vanilla';
import { subscribeKey as subKey } from 'valtio/vanilla/utils';
import { ConstantsUtil as CommonConstantsUtil, ParseUtil } from '@reown/appkit-common';
import { getPreferredAccountType } from '../utils/ChainControllerUtil.js';
import { ConnectionControllerUtil } from '../utils/ConnectionControllerUtil.js';
import { ConnectorControllerUtil } from '../utils/ConnectorControllerUtil.js';
import { CoreHelperUtil } from '../utils/CoreHelperUtil.js';
import { StorageUtil } from '../utils/StorageUtil.js';
import { AppKitError, withErrorBoundary } from '../utils/withErrorBoundary.js';
import { ChainController } from './ChainController.js';
import { ConnectorController } from './ConnectorController.js';
import { EventsController } from './EventsController.js';
import { ModalController } from './ModalController.js';
import { PublicStateController } from './PublicStateController.js';
import { RouterController } from './RouterController.js';
import { TransactionsController } from './TransactionsController.js';
// -- State --------------------------------------------- //
const state = proxy({
    connections: new Map(),
    recentConnections: new Map(),
    isSwitchingConnection: false,
    wcError: false,
    wcFetchingUri: false,
    buffering: false,
    status: 'disconnected'
});
// eslint-disable-next-line init-declarations
let wcConnectionPromise;
// -- Controller ---------------------------------------- //
const controller = {
    state,
    subscribe(callback) {
        return sub(state, () => callback(state));
    },
    subscribeKey(key, callback) {
        return subKey(state, key, callback);
    },
    _getClient() {
        return state._client;
    },
    setClient(client) {
        state._client = ref(client);
    },
    initialize(adapters) {
        const namespaces = adapters
            .filter((a) => Boolean(a.namespace))
            .map(a => a.namespace);
        ConnectionController.syncStorageConnections(namespaces);
    },
    syncStorageConnections(namespaces) {
        const storageConnections = StorageUtil.getConnections();
        const namespacesToSync = namespaces ?? Array.from(ChainController.state.chains.keys());
        for (const namespace of namespacesToSync) {
            const storageConnectionsByNamespace = storageConnections[namespace] ?? [];
            const recentConnectionsMap = new Map(state.recentConnections);
            recentConnectionsMap.set(namespace, storageConnectionsByNamespace);
            state.recentConnections = recentConnectionsMap;
        }
    },
    getConnections(namespace) {
        return namespace ? (state.connections.get(namespace) ?? []) : [];
    },
    hasAnyConnection(connectorId) {
        const connections = ConnectionController.state.connections;
        return Array.from(connections.values())
            .flatMap(_connections => _connections)
            .some(({ connectorId: _connectorId }) => _connectorId === connectorId);
    },
    async connectWalletConnect({ cache = 'auto' } = {}) {
        state.wcFetchingUri = true;
        const isInTelegramOrSafariIos = CoreHelperUtil.isTelegram() || (CoreHelperUtil.isSafari() && CoreHelperUtil.isIos());
        if (cache === 'always' || (cache === 'auto' && isInTelegramOrSafariIos)) {
            if (wcConnectionPromise) {
                await wcConnectionPromise;
                wcConnectionPromise = undefined;
                return;
            }
            if (!CoreHelperUtil.isPairingExpired(state?.wcPairingExpiry)) {
                const link = state.wcUri;
                state.wcUri = link;
                return;
            }
            wcConnectionPromise = ConnectionController._getClient()
                ?.connectWalletConnect?.()
                .catch(() => undefined);
            ConnectionController.state.status = 'connecting';
            await wcConnectionPromise;
            wcConnectionPromise = undefined;
            state.wcPairingExpiry = undefined;
            ConnectionController.state.status = 'connected';
        }
        else {
            await ConnectionController._getClient()?.connectWalletConnect?.();
        }
    },
    async connectExternal(options, chain, setChain = true) {
        const connectData = await ConnectionController._getClient()?.connectExternal?.(options);
        if (setChain) {
            ChainController.setActiveNamespace(chain);
        }
        const connector = ConnectorController.state.allConnectors.find(c => c.id === options?.id);
        const connectSuccessEventMethod = options.type === 'AUTH' ? 'email' : 'browser';
        EventsController.sendEvent({
            type: 'track',
            event: 'CONNECT_SUCCESS',
            properties: {
                method: connectSuccessEventMethod,
                name: connector?.name || 'Unknown',
                view: RouterController.state.view,
                walletRank: connector?.explorerWallet?.order
            }
        });
        return connectData;
    },
    async reconnectExternal(options) {
        await ConnectionController._getClient()?.reconnectExternal?.(options);
        const namespace = options.chain || ChainController.state.activeChain;
        if (namespace) {
            ConnectorController.setConnectorId(options.id, namespace);
        }
    },
    async setPreferredAccountType(accountType, namespace) {
        if (!namespace) {
            return;
        }
        ModalController.setLoading(true, ChainController.state.activeChain);
        const authConnector = ConnectorController.getAuthConnector();
        if (!authConnector) {
            return;
        }
        ChainController.setAccountProp('preferredAccountType', accountType, namespace);
        await authConnector.provider.setPreferredAccount(accountType);
        StorageUtil.setPreferredAccountTypes(Object.entries(ChainController.state.chains).reduce((acc, [key, _]) => {
            const namespace = key;
            const accountType = getPreferredAccountType(namespace);
            if (accountType !== undefined) {
                ;
                acc[namespace] = accountType;
            }
            return acc;
        }, {}));
        await ConnectionController.reconnectExternal(authConnector);
        ModalController.setLoading(false, ChainController.state.activeChain);
        EventsController.sendEvent({
            type: 'track',
            event: 'SET_PREFERRED_ACCOUNT_TYPE',
            properties: {
                accountType,
                network: ChainController.state.activeCaipNetwork?.caipNetworkId || ''
            }
        });
    },
    async signMessage(message) {
        return ConnectionController._getClient()?.signMessage(message);
    },
    parseUnits(value, decimals) {
        return ConnectionController._getClient()?.parseUnits(value, decimals);
    },
    formatUnits(value, decimals) {
        return ConnectionController._getClient()?.formatUnits(value, decimals);
    },
    updateBalance(namespace) {
        return ConnectionController._getClient()?.updateBalance(namespace);
    },
    async sendTransaction(args) {
        return ConnectionController._getClient()?.sendTransaction(args);
    },
    async getCapabilities(params) {
        return ConnectionController._getClient()?.getCapabilities(params);
    },
    async grantPermissions(params) {
        return ConnectionController._getClient()?.grantPermissions(params);
    },
    async walletGetAssets(params) {
        return ConnectionController._getClient()?.walletGetAssets(params) ?? {};
    },
    async estimateGas(args) {
        return ConnectionController._getClient()?.estimateGas(args);
    },
    async writeContract(args) {
        return ConnectionController._getClient()?.writeContract(args);
    },
    async writeSolanaTransaction(args) {
        return ConnectionController._getClient()?.writeSolanaTransaction(args);
    },
    async getEnsAddress(value) {
        return ConnectionController._getClient()?.getEnsAddress(value);
    },
    async getEnsAvatar(value) {
        return ConnectionController._getClient()?.getEnsAvatar(value);
    },
    checkInstalled(ids) {
        return ConnectionController._getClient()?.checkInstalled?.(ids) || false;
    },
    resetWcConnection() {
        state.wcUri = undefined;
        state.wcPairingExpiry = undefined;
        state.wcLinking = undefined;
        state.recentWallet = undefined;
        state.wcFetchingUri = false;
        state.status = 'disconnected';
        TransactionsController.resetTransactions();
        StorageUtil.deleteWalletConnectDeepLink();
        StorageUtil.deleteRecentWallet();
        PublicStateController.set({ connectingWallet: undefined });
    },
    resetUri() {
        state.wcUri = undefined;
        state.wcPairingExpiry = undefined;
        wcConnectionPromise = undefined;
        state.wcFetchingUri = false;
        PublicStateController.set({ connectingWallet: undefined });
    },
    finalizeWcConnection(address) {
        const { wcLinking, recentWallet } = ConnectionController.state;
        if (wcLinking) {
            StorageUtil.setWalletConnectDeepLink(wcLinking);
        }
        if (recentWallet) {
            StorageUtil.setAppKitRecent(recentWallet);
        }
        if (address) {
            EventsController.sendEvent({
                type: 'track',
                event: 'CONNECT_SUCCESS',
                address,
                properties: {
                    method: wcLinking ? 'mobile' : 'qrcode',
                    name: RouterController.state.data?.wallet?.name || 'Unknown',
                    view: RouterController.state.view,
                    walletRank: recentWallet?.order
                }
            });
        }
    },
    setWcBasic(wcBasic) {
        state.wcBasic = wcBasic;
    },
    setUri(uri) {
        state.wcUri = uri;
        state.wcFetchingUri = false;
        state.wcPairingExpiry = CoreHelperUtil.getPairingExpiry();
    },
    setWcLinking(wcLinking) {
        state.wcLinking = wcLinking;
    },
    setWcError(wcError) {
        state.wcError = wcError;
        state.wcFetchingUri = false;
        state.buffering = false;
    },
    setRecentWallet(wallet) {
        state.recentWallet = wallet;
    },
    setBuffering(buffering) {
        state.buffering = buffering;
    },
    setStatus(status) {
        state.status = status;
    },
    setIsSwitchingConnection(isSwitchingConnection) {
        state.isSwitchingConnection = isSwitchingConnection;
    },
    async disconnect({ id, namespace, initialDisconnect } = {}) {
        try {
            await ConnectionController._getClient()?.disconnect({
                id,
                chainNamespace: namespace,
                initialDisconnect
            });
        }
        catch (error) {
            throw new AppKitError('Failed to disconnect', 'INTERNAL_SDK_ERROR', error);
        }
    },
    async disconnectConnector({ id, namespace }) {
        try {
            await ConnectionController._getClient()?.disconnectConnector({ id, namespace });
        }
        catch (error) {
            throw new AppKitError('Failed to disconnect connector', 'INTERNAL_SDK_ERROR', error);
        }
    },
    setConnections(connections, chainNamespace) {
        const connectionsMap = new Map(state.connections);
        connectionsMap.set(chainNamespace, connections);
        state.connections = connectionsMap;
    },
    async handleAuthAccountSwitch({ address, namespace }) {
        const accountData = ChainController.getAccountData(namespace);
        const smartAccount = accountData?.user?.accounts?.find(c => c.type === 'smartAccount');
        const accountType = smartAccount &&
            smartAccount.address.toLowerCase() === address.toLowerCase() &&
            ConnectorControllerUtil.canSwitchToSmartAccount(namespace)
            ? 'smartAccount'
            : 'eoa';
        await ConnectionController.setPreferredAccountType(accountType, namespace);
    },
    async handleActiveConnection({ connection, namespace, address }) {
        const connector = ConnectorController.getConnectorById(connection.connectorId);
        const isAuthConnector = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH;
        if (!connector) {
            throw new Error(`No connector found for connection: ${connection.connectorId}`);
        }
        if (!isAuthConnector) {
            const connectData = await ConnectionController.connectExternal({
                id: connector.id,
                type: connector.type,
                provider: connector.provider,
                address,
                chain: namespace
            }, namespace);
            return connectData?.address;
        }
        else if (address) {
            await ConnectionController.handleAuthAccountSwitch({ address, namespace });
        }
        return address;
    },
    async handleDisconnectedConnection({ connection, namespace, address, closeModalOnConnect }) {
        const connector = ConnectorController.getConnectorById(connection.connectorId);
        const authName = connection.auth?.name?.toLowerCase();
        const isAuthConnector = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH;
        const isWCConnector = connection.connectorId === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT;
        if (!connector) {
            throw new Error(`No connector found for connection: ${connection.connectorId}`);
        }
        let newAddress = undefined;
        if (isAuthConnector) {
            if (authName && ConnectorControllerUtil.isSocialProvider(authName)) {
                const { address: socialAddress } = await ConnectorControllerUtil.connectSocial({
                    social: authName,
                    closeModalOnConnect,
                    onOpenFarcaster() {
                        ModalController.open({ view: 'ConnectingFarcaster' });
                    },
                    onConnect() {
                        RouterController.replace('ProfileWallets');
                    }
                });
                newAddress = socialAddress;
            }
            else {
                const { address: emailAddress } = await ConnectorControllerUtil.connectEmail({
                    closeModalOnConnect,
                    onOpen() {
                        ModalController.open({ view: 'EmailLogin' });
                    },
                    onConnect() {
                        RouterController.replace('ProfileWallets');
                    }
                });
                newAddress = emailAddress;
            }
        }
        else if (isWCConnector) {
            const { address: wcAddress } = await ConnectorControllerUtil.connectWalletConnect({
                walletConnect: true,
                connector,
                closeModalOnConnect,
                onOpen(isMobile) {
                    const view = isMobile ? 'AllWallets' : 'ConnectingWalletConnect';
                    if (ModalController.state.open) {
                        RouterController.push(view);
                    }
                    else {
                        ModalController.open({ view });
                    }
                },
                onConnect() {
                    RouterController.replace('ProfileWallets');
                }
            });
            newAddress = wcAddress;
        }
        else {
            const connectData = await ConnectionController.connectExternal({
                id: connector.id,
                type: connector.type,
                provider: connector.provider,
                chain: namespace
            }, namespace);
            if (connectData) {
                newAddress = connectData.address;
            }
        }
        if (isAuthConnector && address) {
            await ConnectionController.handleAuthAccountSwitch({ address, namespace });
        }
        return newAddress;
    },
    async switchConnection({ connection, address, namespace, closeModalOnConnect, onChange }) {
        let currentAddress = undefined;
        const caipAddress = ChainController.getAccountData(namespace)?.caipAddress;
        if (caipAddress) {
            const { address: currentAddressParsed } = ParseUtil.parseCaipAddress(caipAddress);
            currentAddress = currentAddressParsed;
        }
        const status = ConnectionControllerUtil.getConnectionStatus(connection, namespace);
        switch (status) {
            case 'connected':
            case 'active': {
                const newAddress = await ConnectionController.handleActiveConnection({
                    connection,
                    namespace,
                    address
                });
                if (currentAddress && newAddress) {
                    const hasSwitchedAccount = newAddress.toLowerCase() !== currentAddress.toLowerCase();
                    onChange?.({
                        address: newAddress,
                        namespace,
                        hasSwitchedAccount,
                        hasSwitchedWallet: status === 'active'
                    });
                }
                break;
            }
            case 'disconnected': {
                const newAddress = await ConnectionController.handleDisconnectedConnection({
                    connection,
                    namespace,
                    address,
                    closeModalOnConnect
                });
                if (newAddress) {
                    onChange?.({
                        address: newAddress,
                        namespace,
                        hasSwitchedAccount: true,
                        hasSwitchedWallet: true
                    });
                }
                break;
            }
            default:
                throw new Error(`Invalid connection status: ${status}`);
        }
    }
};
// Export the controller wrapped with our error boundary
export const ConnectionController = withErrorBoundary(controller);
//# sourceMappingURL=ConnectionController.js.map