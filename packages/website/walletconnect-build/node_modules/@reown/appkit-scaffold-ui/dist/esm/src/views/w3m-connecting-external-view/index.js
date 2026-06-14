var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConstantsUtil as CommonConstantsUtil, ErrorUtil } from '@reown/appkit-common';
import { AppKitError, ConnectionController, ConnectionControllerUtil, ConnectorController, EventsController, ModalController, OptionsController, RouterController, SnackController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import { HelpersUtil } from '@reown/appkit-utils';
import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js';
let W3mConnectingExternalView = class W3mConnectingExternalView extends W3mConnectingWidget {
    constructor() {
        super();
        this.externalViewUnsubscribe = [];
        this.connectionsByNamespace = ConnectionController.getConnections(this.connector?.chain);
        this.hasMultipleConnections = this.connectionsByNamespace.length > 0;
        this.remoteFeatures = OptionsController.state.remoteFeatures;
        this.currentActiveConnectorId = ConnectorController.state.activeConnectorIds[this.connector?.chain];
        if (!this.connector) {
            throw new Error('w3m-connecting-view: No connector provided');
        }
        const namespace = this.connector?.chain;
        if (this.isAlreadyConnected(this.connector)) {
            this.secondaryBtnLabel = undefined;
            this.label = `This account is already linked, change your account in ${this.connector.name}`;
            this.secondaryLabel = `To link a new account, open ${this.connector.name} and switch to the account you want to link`;
        }
        EventsController.sendEvent({
            type: 'track',
            event: 'SELECT_WALLET',
            properties: {
                name: this.connector.name ?? 'Unknown',
                platform: 'browser',
                displayIndex: this.wallet?.display_index,
                walletRank: this.wallet?.order,
                view: RouterController.state.view
            }
        });
        this.onConnect = this.onConnectProxy.bind(this);
        this.onAutoConnect = this.onConnectProxy.bind(this);
        this.isWalletConnect = false;
        this.externalViewUnsubscribe.push(ConnectorController.subscribeKey('activeConnectorIds', val => {
            const newActiveConnectorId = val[namespace];
            const isMultiWalletEnabled = this.remoteFeatures?.multiWallet;
            const { redirectView } = RouterController.state.data ?? {};
            if (newActiveConnectorId !== this.currentActiveConnectorId) {
                if (this.hasMultipleConnections && isMultiWalletEnabled) {
                    RouterController.replace('ProfileWallets');
                    SnackController.showSuccess('New Wallet Added');
                }
                else if (redirectView) {
                    RouterController.replace(redirectView);
                }
                else {
                    ModalController.close();
                }
            }
        }), ConnectionController.subscribeKey('connections', this.onConnectionsChange.bind(this)));
    }
    disconnectedCallback() {
        this.externalViewUnsubscribe.forEach(unsubscribe => unsubscribe());
    }
    async onConnectProxy() {
        try {
            this.error = false;
            if (this.connector) {
                if (this.isAlreadyConnected(this.connector)) {
                    return;
                }
                if (this.connector.id !== CommonConstantsUtil.CONNECTOR_ID.COINBASE_SDK || !this.error) {
                    await ConnectionController.connectExternal(this.connector, this.connector.chain);
                }
            }
        }
        catch (error) {
            const isUserRejectedRequestError = error instanceof AppKitError &&
                error.originalName === ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST;
            if (isUserRejectedRequestError) {
                EventsController.sendEvent({
                    type: 'track',
                    event: 'USER_REJECTED',
                    properties: { message: error.message }
                });
            }
            else {
                EventsController.sendEvent({
                    type: 'track',
                    event: 'CONNECT_ERROR',
                    properties: { message: error?.message ?? 'Unknown' }
                });
            }
            this.error = true;
        }
    }
    onConnectionsChange(connections) {
        if (this.connector?.chain &&
            connections.get(this.connector.chain) &&
            this.isAlreadyConnected(this.connector)) {
            const newConnections = connections.get(this.connector.chain) ?? [];
            const isMultiWalletEnabled = this.remoteFeatures?.multiWallet;
            if (newConnections.length === 0) {
                RouterController.replace('Connect');
            }
            else {
                const accounts = ConnectionControllerUtil.getConnectionsByConnectorId(this.connectionsByNamespace, this.connector.id).flatMap(c => c.accounts);
                const newAccounts = ConnectionControllerUtil.getConnectionsByConnectorId(newConnections, this.connector.id).flatMap(c => c.accounts);
                if (newAccounts.length === 0) {
                    if (this.hasMultipleConnections && isMultiWalletEnabled) {
                        RouterController.replace('ProfileWallets');
                        SnackController.showSuccess('Wallet deleted');
                    }
                    else {
                        ModalController.close();
                    }
                }
                else {
                    const isAllAccountsSame = accounts.every(a => newAccounts.some(b => HelpersUtil.isLowerCaseMatch(a.address, b.address)));
                    if (!isAllAccountsSame && isMultiWalletEnabled) {
                        RouterController.replace('ProfileWallets');
                    }
                }
            }
        }
    }
    isAlreadyConnected(connector) {
        return (Boolean(connector) &&
            this.connectionsByNamespace.some(c => HelpersUtil.isLowerCaseMatch(c.connectorId, connector.id)));
    }
};
W3mConnectingExternalView = __decorate([
    customElement('w3m-connecting-external-view')
], W3mConnectingExternalView);
export { W3mConnectingExternalView };
//# sourceMappingURL=index.js.map