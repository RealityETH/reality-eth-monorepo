var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common';
import { ChainController, ConnectorController, ConnectorUtil, ConstantsUtil as CoreConstantsUtil, CoreHelperUtil, EventsController, ExchangeController, ModalController, OptionsController, RouterController, StorageUtil, getPreferredAccountType } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-balance';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-tabs';
import '@reown/appkit-ui/wui-tooltip';
import '@reown/appkit-ui/wui-wallet-switch';
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils';
import { HelpersUtil } from '../../utils/HelpersUtil.js';
import '../w3m-account-activity-widget/index.js';
import '../w3m-account-tokens-widget/index.js';
import '../w3m-tooltip-trigger/index.js';
import '../w3m-tooltip/index.js';
import styles from './styles.js';
let W3mAccountWalletFeaturesWidget = class W3mAccountWalletFeaturesWidget extends LitElement {
    constructor() {
        super(...arguments);
        this.unsubscribe = [];
        this.network = ChainController.state.activeCaipNetwork;
        this.profileName = ChainController.getAccountData()?.profileName;
        this.address = ChainController.getAccountData()?.address;
        this.currentTab = ChainController.getAccountData()?.currentTab;
        this.tokenBalance = ChainController.getAccountData()?.tokenBalance;
        this.features = OptionsController.state.features;
        this.namespace = ChainController.state.activeChain;
        this.activeConnectorIds = ConnectorController.state.activeConnectorIds;
        this.remoteFeatures = OptionsController.state.remoteFeatures;
    }
    firstUpdated() {
        ChainController.fetchTokenBalance();
        this.unsubscribe.push(...[
            ChainController.subscribeChainProp('accountState', val => {
                if (val?.address) {
                    this.address = val.address;
                    this.profileName = val.profileName;
                    this.currentTab = val.currentTab;
                    this.tokenBalance = val.tokenBalance;
                }
                else {
                    ModalController.close();
                }
            })
        ], ConnectorController.subscribeKey('activeConnectorIds', newActiveConnectorIds => {
            this.activeConnectorIds = newActiveConnectorIds;
        }), ChainController.subscribeKey('activeChain', val => (this.namespace = val)), ChainController.subscribeKey('activeCaipNetwork', val => (this.network = val)), OptionsController.subscribeKey('features', val => (this.features = val)), OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val)));
        this.watchSwapValues();
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
        clearInterval(this.watchTokenBalance);
    }
    render() {
        if (!this.address) {
            throw new Error('w3m-account-features-widget: No account provided');
        }
        if (!this.namespace) {
            return null;
        }
        const connectorId = this.activeConnectorIds[this.namespace];
        const connector = connectorId ? ConnectorController.getConnectorById(connectorId) : undefined;
        const { icon, iconSize } = this.getAuthData();
        return html `<wui-flex
      flexDirection="column"
      .padding=${['0', '3', '4', '3']}
      alignItems="center"
      gap="4"
      data-testid="w3m-account-wallet-features-widget"
    >
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center" gap="2">
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          icon=${icon}
          iconSize=${iconSize}
          alt=${connector?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        ${this.tokenBalanceTemplate()}
      </wui-flex>
      ${this.orderedWalletFeatures()} ${this.tabsTemplate()} ${this.listContentTemplate()}
    </wui-flex>`;
    }
    orderedWalletFeatures() {
        const walletFeaturesOrder = this.features?.walletFeaturesOrder || CoreConstantsUtil.DEFAULT_FEATURES.walletFeaturesOrder;
        const isAllDisabled = walletFeaturesOrder.every(feature => {
            if (feature === 'send' || feature === 'receive') {
                return !this.features?.[feature];
            }
            if (feature === 'swaps' || feature === 'onramp') {
                return !this.remoteFeatures?.[feature];
            }
            return true;
        });
        if (isAllDisabled) {
            return null;
        }
        const mergedFeaturesOrder = walletFeaturesOrder.map(feature => {
            if (feature === 'receive' || feature === 'onramp') {
                return 'fund';
            }
            return feature;
        });
        const deduplicatedFeaturesOrder = [...new Set(mergedFeaturesOrder)];
        return html `<wui-flex gap="2">
      ${deduplicatedFeaturesOrder.map(feature => {
            switch (feature) {
                case 'fund':
                    return this.fundWalletTemplate();
                case 'swaps':
                    return this.swapsTemplate();
                case 'send':
                    return this.sendTemplate();
                default:
                    return null;
            }
        })}
    </wui-flex>`;
    }
    fundWalletTemplate() {
        if (!this.namespace) {
            return null;
        }
        const isOnrampSupported = CoreConstantsUtil.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace);
        const isReceiveEnabled = this.features?.receive;
        const isOnrampEnabled = this.remoteFeatures?.onramp && isOnrampSupported;
        const isPayWithExchangeEnabled = ExchangeController.isPayWithExchangeEnabled();
        if (!isOnrampEnabled && !isReceiveEnabled && !isPayWithExchangeEnabled) {
            return null;
        }
        return html `
      <w3m-tooltip-trigger text="Fund wallet">
        <wui-button
          data-testid="wallet-features-fund-wallet-button"
          @click=${this.onFundWalletClick.bind(this)}
          variant="accent-secondary"
          size="lg"
          fullWidth
        >
          <wui-icon name="dollar"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `;
    }
    swapsTemplate() {
        const isSwapsEnabled = this.remoteFeatures?.swaps;
        const isEvm = ChainController.state.activeChain === CommonConstantsUtil.CHAIN.EVM;
        if (!isSwapsEnabled || !isEvm) {
            return null;
        }
        return html `
      <w3m-tooltip-trigger text="Swap">
        <wui-button
          fullWidth
          data-testid="wallet-features-swaps-button"
          @click=${this.onSwapClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="recycleHorizontal"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `;
    }
    sendTemplate() {
        const isSendEnabled = this.features?.send;
        const activeNamespace = ChainController.state.activeChain;
        const isSendSupported = CoreConstantsUtil.SEND_SUPPORTED_NAMESPACES.includes(activeNamespace);
        if (!isSendEnabled || !isSendSupported) {
            return null;
        }
        return html `
      <w3m-tooltip-trigger text="Send">
        <wui-button
          fullWidth
          data-testid="wallet-features-send-button"
          @click=${this.onSendClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="send"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `;
    }
    watchSwapValues() {
        this.watchTokenBalance = setInterval(() => ChainController.fetchTokenBalance(error => this.onTokenBalanceError(error)), 10_000);
    }
    onTokenBalanceError(error) {
        if (error instanceof Error && error.cause instanceof Response) {
            const statusCode = error.cause.status;
            if (statusCode === CommonConstantsUtil.HTTP_STATUS_CODES.SERVICE_UNAVAILABLE) {
                clearInterval(this.watchTokenBalance);
            }
        }
    }
    listContentTemplate() {
        if (this.currentTab === 0) {
            return html `<w3m-account-tokens-widget></w3m-account-tokens-widget>`;
        }
        if (this.currentTab === 1) {
            return html `<w3m-account-activity-widget></w3m-account-activity-widget>`;
        }
        return html `<w3m-account-tokens-widget></w3m-account-tokens-widget>`;
    }
    tokenBalanceTemplate() {
        if (this.tokenBalance && this.tokenBalance?.length >= 0) {
            const value = CoreHelperUtil.calculateBalance(this.tokenBalance);
            const { dollars = '0', pennies = '00' } = CoreHelperUtil.formatTokenBalance(value);
            return html `<wui-balance dollars=${dollars} pennies=${pennies}></wui-balance>`;
        }
        return html `<wui-balance dollars="0" pennies="00"></wui-balance>`;
    }
    tabsTemplate() {
        const tabsByNamespace = HelpersUtil.getTabsByNamespace(ChainController.state.activeChain);
        if (tabsByNamespace.length === 0) {
            return null;
        }
        return html `<wui-tabs
      .onTabChange=${this.onTabChange.bind(this)}
      .activeTab=${this.currentTab}
      .tabs=${tabsByNamespace}
    ></wui-tabs>`;
    }
    onTabChange(index) {
        ChainController.setAccountProp('currentTab', index, this.namespace);
    }
    onFundWalletClick() {
        RouterController.push('FundWallet');
    }
    onSwapClick() {
        if (this.network?.caipNetworkId &&
            !CoreConstantsUtil.SWAP_SUPPORTED_NETWORKS.includes(this.network?.caipNetworkId)) {
            RouterController.push('UnsupportedChain', {
                swapUnsupportedChain: true
            });
        }
        else {
            EventsController.sendEvent({
                type: 'track',
                event: 'OPEN_SWAP',
                properties: {
                    network: this.network?.caipNetworkId || '',
                    isSmartAccount: getPreferredAccountType(ChainController.state.activeChain) ===
                        W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
                }
            });
            RouterController.push('Swap');
        }
    }
    getAuthData() {
        const socialProvider = StorageUtil.getConnectedSocialProvider();
        const socialUsername = StorageUtil.getConnectedSocialUsername();
        const authConnector = ConnectorController.getAuthConnector();
        const email = authConnector?.provider.getEmail() ?? '';
        return {
            name: ConnectorUtil.getAuthName({
                email,
                socialUsername,
                socialProvider
            }),
            icon: socialProvider ?? 'mail',
            iconSize: socialProvider ? 'xl' : 'md'
        };
    }
    onGoToProfileWalletsView() {
        RouterController.push('ProfileWallets');
    }
    onSendClick() {
        EventsController.sendEvent({
            type: 'track',
            event: 'OPEN_SEND',
            properties: {
                network: this.network?.caipNetworkId || '',
                isSmartAccount: getPreferredAccountType(ChainController.state.activeChain) ===
                    W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
            }
        });
        RouterController.push('WalletSend');
    }
};
W3mAccountWalletFeaturesWidget.styles = styles;
__decorate([
    state()
], W3mAccountWalletFeaturesWidget.prototype, "watchTokenBalance", void 0);
__decorate([
    state()
], W3mAccountWalletFeaturesWidget.prototype, "network", void 0);
__decorate([
    state()
], W3mAccountWalletFeaturesWidget.prototype, "profileName", void 0);
__decorate([
    state()
], W3mAccountWalletFeaturesWidget.prototype, "address", void 0);
__decorate([
    state()
], W3mAccountWalletFeaturesWidget.prototype, "currentTab", void 0);
__decorate([
    state()
], W3mAccountWalletFeaturesWidget.prototype, "tokenBalance", void 0);
__decorate([
    state()
], W3mAccountWalletFeaturesWidget.prototype, "features", void 0);
__decorate([
    state()
], W3mAccountWalletFeaturesWidget.prototype, "namespace", void 0);
__decorate([
    state()
], W3mAccountWalletFeaturesWidget.prototype, "activeConnectorIds", void 0);
__decorate([
    state()
], W3mAccountWalletFeaturesWidget.prototype, "remoteFeatures", void 0);
W3mAccountWalletFeaturesWidget = __decorate([
    customElement('w3m-account-wallet-features-widget')
], W3mAccountWalletFeaturesWidget);
export { W3mAccountWalletFeaturesWidget };
//# sourceMappingURL=index.js.map