var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ConstantsUtil } from '@reown/appkit-common';
import { AssetUtil, ChainController, ConnectionController, ConnectorController, ConstantsUtil as CoreConstantsUtil, CoreHelperUtil, EventsController, ExchangeController, OptionsController, RouterController, SnackController, getPreferredAccountType } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-avatar';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-icon-link';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-notice-card';
import '@reown/appkit-ui/wui-tabs';
import '@reown/appkit-ui/wui-tag';
import '@reown/appkit-ui/wui-text';
import '@reown/appkit-ui/wui-wallet-switch';
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils';
import '../w3m-account-auth-button/index.js';
import styles from './styles.js';
let W3mAccountDefaultWidget = class W3mAccountDefaultWidget extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.caipAddress = ChainController.getAccountData()?.caipAddress;
        this.address = CoreHelperUtil.getPlainAddress(ChainController.getAccountData()?.caipAddress);
        this.profileImage = ChainController.getAccountData()?.profileImage;
        this.profileName = ChainController.getAccountData()?.profileName;
        this.disconnecting = false;
        this.balance = ChainController.getAccountData()?.balance;
        this.balanceSymbol = ChainController.getAccountData()?.balanceSymbol;
        this.features = OptionsController.state.features;
        this.remoteFeatures = OptionsController.state.remoteFeatures;
        this.namespace = ChainController.state.activeChain;
        this.activeConnectorIds = ConnectorController.state.activeConnectorIds;
        this.unsubscribe.push(...[
            ChainController.subscribeChainProp('accountState', val => {
                this.address = CoreHelperUtil.getPlainAddress(val?.caipAddress);
                this.caipAddress = val?.caipAddress;
                this.balance = val?.balance;
                this.balanceSymbol = val?.balanceSymbol;
                this.profileName = val?.profileName;
                this.profileImage = val?.profileImage;
            }),
            OptionsController.subscribeKey('features', val => (this.features = val)),
            OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val)),
            ConnectorController.subscribeKey('activeConnectorIds', newActiveConnectorIds => {
                this.activeConnectorIds = newActiveConnectorIds;
            }),
            ChainController.subscribeKey('activeChain', val => (this.namespace = val)),
            ChainController.subscribeKey('activeCaipNetwork', val => {
                if (val?.chainNamespace) {
                    this.namespace = val?.chainNamespace;
                }
            })
        ]);
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        if (!this.caipAddress || !this.namespace) {
            return null;
        }
        const connectorId = this.activeConnectorIds[this.namespace];
        const connector = connectorId ? ConnectorController.getConnectorById(connectorId) : undefined;
        const connectorImage = AssetUtil.getConnectorImage(connector);
        const { value, decimals, symbol } = CoreHelperUtil.parseBalance(this.balance, this.balanceSymbol);
        return html `<wui-flex
        flexDirection="column"
        .padding=${['0', '5', '4', '5']}
        alignItems="center"
        gap="3"
      >
        <wui-avatar
          alt=${ifDefined(this.caipAddress)}
          address=${ifDefined(CoreHelperUtil.getPlainAddress(this.caipAddress))}
          imageSrc=${ifDefined(this.profileImage === null ? undefined : this.profileImage)}
          data-testid="single-account-avatar"
        ></wui-avatar>
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          imageSrc=${connectorImage}
          alt=${connector?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
        <div class="balance-container">
          <wui-text variant="h3-regular" color="primary">${value}</wui-text>
          <wui-text variant="h3-regular" color="secondary">.${decimals}</wui-text>
          <wui-text variant="h6-medium" color="primary" class="symbol">${symbol}</wui-text>
        </div>
        ${this.explorerBtnTemplate()}
      </wui-flex>

      <wui-flex flexDirection="column" gap="2" .padding=${['0', '3', '3', '3']}>
        ${this.authCardTemplate()} <w3m-account-auth-button></w3m-account-auth-button>
        ${this.orderedFeaturesTemplate()} ${this.activityTemplate()}
        <wui-list-item
          .rounded=${true}
          icon="power"
          iconColor="error"
          ?chevron=${false}
          .loading=${this.disconnecting}
          .rightIcon=${false}
          @click=${this.onDisconnect.bind(this)}
          data-testid="disconnect-button"
        >
          <wui-text variant="lg-regular" color="primary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>`;
    }
    fundWalletTemplate() {
        if (!this.namespace) {
            return null;
        }
        const isOnrampSupported = CoreConstantsUtil.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace);
        const isReceiveEnabled = Boolean(this.features?.receive);
        const isOnrampEnabled = this.remoteFeatures?.onramp && isOnrampSupported;
        const isPayWithExchangeEnabled = ExchangeController.isPayWithExchangeEnabled();
        if (!isOnrampEnabled && !isReceiveEnabled && !isPayWithExchangeEnabled) {
            return null;
        }
        return html `
      <wui-list-item
        .rounded=${true}
        data-testid="w3m-account-default-fund-wallet-button"
        iconVariant="blue"
        icon="dollar"
        ?chevron=${true}
        @click=${this.handleClickFundWallet.bind(this)}
      >
        <wui-text variant="lg-regular" color="primary">Fund wallet</wui-text>
      </wui-list-item>
    `;
    }
    orderedFeaturesTemplate() {
        const featuresOrder = this.features?.walletFeaturesOrder || CoreConstantsUtil.DEFAULT_FEATURES.walletFeaturesOrder;
        return featuresOrder.map(feature => {
            switch (feature) {
                case 'onramp':
                    return this.fundWalletTemplate();
                case 'swaps':
                    return this.swapsTemplate();
                case 'send':
                    return this.sendTemplate();
                default:
                    return null;
            }
        });
    }
    activityTemplate() {
        if (!this.namespace) {
            return null;
        }
        const isEnabled = this.remoteFeatures?.activity &&
            CoreConstantsUtil.ACTIVITY_ENABLED_CHAIN_NAMESPACES.includes(this.namespace);
        return isEnabled
            ? html ` <wui-list-item
          .rounded=${true}
          icon="clock"
          ?chevron=${true}
          @click=${this.onTransactions.bind(this)}
          data-testid="w3m-account-default-activity-button"
        >
          <wui-text variant="lg-regular" color="primary">Activity</wui-text>
        </wui-list-item>`
            : null;
    }
    swapsTemplate() {
        const isSwapsEnabled = this.remoteFeatures?.swaps;
        const isEvm = ChainController.state.activeChain === ConstantsUtil.CHAIN.EVM;
        if (!isSwapsEnabled || !isEvm) {
            return null;
        }
        return html `
      <wui-list-item
        .rounded=${true}
        icon="recycleHorizontal"
        ?chevron=${true}
        @click=${this.handleClickSwap.bind(this)}
        data-testid="w3m-account-default-swaps-button"
      >
        <wui-text variant="lg-regular" color="primary">Swap</wui-text>
      </wui-list-item>
    `;
    }
    sendTemplate() {
        const isSendEnabled = this.features?.send;
        const namespace = ChainController.state.activeChain;
        if (!namespace) {
            throw new Error('SendController:sendTemplate - namespace is required');
        }
        const isSendSupported = CoreConstantsUtil.SEND_SUPPORTED_NAMESPACES.includes(namespace);
        if (!isSendEnabled || !isSendSupported) {
            return null;
        }
        return html `
      <wui-list-item
        .rounded=${true}
        icon="send"
        ?chevron=${true}
        @click=${this.handleClickSend.bind(this)}
        data-testid="w3m-account-default-send-button"
      >
        <wui-text variant="lg-regular" color="primary">Send</wui-text>
      </wui-list-item>
    `;
    }
    authCardTemplate() {
        const namespace = ChainController.state.activeChain;
        if (!namespace) {
            throw new Error('AuthCardTemplate:authCardTemplate - namespace is required');
        }
        const connectorId = ConnectorController.getConnectorId(namespace);
        const authConnector = ConnectorController.getAuthConnector();
        const { origin } = location;
        if (!authConnector ||
            connectorId !== ConstantsUtil.CONNECTOR_ID.AUTH ||
            origin.includes(CoreConstantsUtil.SECURE_SITE)) {
            return null;
        }
        return html `
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `;
    }
    handleClickFundWallet() {
        RouterController.push('FundWallet');
    }
    handleClickSwap() {
        RouterController.push('Swap');
    }
    handleClickSend() {
        RouterController.push('WalletSend');
    }
    explorerBtnTemplate() {
        const addressExplorerUrl = ChainController.getAccountData()?.addressExplorerUrl;
        if (!addressExplorerUrl) {
            return null;
        }
        return html `
      <wui-button size="md" variant="accent-primary" @click=${this.onExplorer.bind(this)}>
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="compass"></wui-icon>
        Block Explorer
        <wui-icon size="sm" color="inherit" slot="iconRight" name="externalLink"></wui-icon>
      </wui-button>
    `;
    }
    onTransactions() {
        EventsController.sendEvent({
            type: 'track',
            event: 'CLICK_TRANSACTIONS',
            properties: {
                isSmartAccount: getPreferredAccountType(ChainController.state.activeChain) ===
                    W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
            }
        });
        RouterController.push('Transactions');
    }
    async onDisconnect() {
        try {
            this.disconnecting = true;
            const connectionsByNamespace = ConnectionController.getConnections(this.namespace);
            const hasConnections = connectionsByNamespace.length > 0;
            const connectorId = this.namespace && ConnectorController.state.activeConnectorIds[this.namespace];
            const isMultiWalletEnabled = this.remoteFeatures?.multiWallet;
            await ConnectionController.disconnect(isMultiWalletEnabled ? { id: connectorId, namespace: this.namespace } : {});
            if (hasConnections && isMultiWalletEnabled) {
                RouterController.push('ProfileWallets');
                SnackController.showSuccess('Wallet deleted');
            }
        }
        catch {
            EventsController.sendEvent({
                type: 'track',
                event: 'DISCONNECT_ERROR',
                properties: { message: 'Failed to disconnect' }
            });
            SnackController.showError('Failed to disconnect');
        }
        finally {
            this.disconnecting = false;
        }
    }
    onExplorer() {
        const addressExplorerUrl = ChainController.getAccountData()?.addressExplorerUrl;
        if (addressExplorerUrl) {
            CoreHelperUtil.openHref(addressExplorerUrl, '_blank');
        }
    }
    onGoToUpgradeView() {
        EventsController.sendEvent({ type: 'track', event: 'EMAIL_UPGRADE_FROM_MODAL' });
        RouterController.push('UpgradeEmailWallet');
    }
    onGoToProfileWalletsView() {
        RouterController.push('ProfileWallets');
    }
};
W3mAccountDefaultWidget.styles = styles;
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "caipAddress", void 0);
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "address", void 0);
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "profileImage", void 0);
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "profileName", void 0);
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "disconnecting", void 0);
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "balance", void 0);
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "balanceSymbol", void 0);
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "features", void 0);
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "remoteFeatures", void 0);
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "namespace", void 0);
__decorate([
    state()
], W3mAccountDefaultWidget.prototype, "activeConnectorIds", void 0);
W3mAccountDefaultWidget = __decorate([
    customElement('w3m-account-default-widget')
], W3mAccountDefaultWidget);
export { W3mAccountDefaultWidget };
//# sourceMappingURL=index.js.map