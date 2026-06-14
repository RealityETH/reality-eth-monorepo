var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ChainController, ConstantsUtil as CoreConstantsUtil, ExchangeController, OptionsController, RouterController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-text';
let W3mFundWalletView = class W3mFundWalletView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.activeCaipNetwork = ChainController.state.activeCaipNetwork;
        this.features = OptionsController.state.features;
        this.remoteFeatures = OptionsController.state.remoteFeatures;
        this.exchangesLoading = ExchangeController.state.isLoading;
        this.exchanges = ExchangeController.state.exchanges;
        this.unsubscribe.push(...[
            OptionsController.subscribeKey('features', val => (this.features = val)),
            OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val)),
            ChainController.subscribeKey('activeCaipNetwork', val => {
                this.activeCaipNetwork = val;
                this.setDefaultPaymentAsset();
            }),
            ExchangeController.subscribeKey('isLoading', val => (this.exchangesLoading = val)),
            ExchangeController.subscribeKey('exchanges', val => (this.exchanges = val))
        ]);
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    async firstUpdated() {
        const isPayWithExchangeSupported = ExchangeController.isPayWithExchangeSupported();
        if (isPayWithExchangeSupported) {
            await this.setDefaultPaymentAsset();
            await ExchangeController.fetchExchanges();
        }
    }
    render() {
        return html `
      <wui-flex flexDirection="column" .padding=${['1', '3', '3', '3']} gap="2">
        ${this.onrampTemplate()} ${this.receiveTemplate()} ${this.depositFromExchangeTemplate()}
      </wui-flex>
    `;
    }
    async setDefaultPaymentAsset() {
        if (!this.activeCaipNetwork) {
            return;
        }
        const assets = await ExchangeController.getAssetsForNetwork(this.activeCaipNetwork.caipNetworkId);
        const usdc = assets.find(asset => asset.metadata.symbol === 'USDC') || assets[0];
        if (usdc) {
            ExchangeController.setPaymentAsset(usdc);
        }
    }
    onrampTemplate() {
        if (!this.activeCaipNetwork) {
            return null;
        }
        const isOnrampEnabled = this.remoteFeatures?.onramp;
        const hasNetworkSupport = CoreConstantsUtil.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.activeCaipNetwork.chainNamespace);
        if (!isOnrampEnabled || !hasNetworkSupport) {
            return null;
        }
        return html `
      <wui-list-item
        @click=${this.onBuyCrypto.bind(this)}
        icon="card"
        data-testid="wallet-features-onramp-button"
      >
        <wui-text variant="lg-regular" color="primary">Buy crypto</wui-text>
      </wui-list-item>
    `;
    }
    depositFromExchangeTemplate() {
        if (!this.activeCaipNetwork) {
            return null;
        }
        const isPayWithExchangeSupported = ExchangeController.isPayWithExchangeSupported();
        if (!isPayWithExchangeSupported) {
            return null;
        }
        return html `
      <wui-list-item
        @click=${this.onDepositFromExchange.bind(this)}
        icon="arrowBottomCircle"
        data-testid="wallet-features-deposit-from-exchange-button"
        ?loading=${this.exchangesLoading}
        ?disabled=${this.exchangesLoading || !this.exchanges.length}
      >
        <wui-text variant="lg-regular" color="primary">Deposit from exchange</wui-text>
      </wui-list-item>
    `;
    }
    receiveTemplate() {
        const isReceiveEnabled = Boolean(this.features?.receive);
        if (!isReceiveEnabled) {
            return null;
        }
        return html `
      <wui-list-item
        @click=${this.onReceive.bind(this)}
        icon="qrCode"
        data-testid="wallet-features-receive-button"
      >
        <wui-text variant="lg-regular" color="primary">Receive funds</wui-text>
      </wui-list-item>
    `;
    }
    onBuyCrypto() {
        RouterController.push('OnRampProviders');
    }
    onReceive() {
        RouterController.push('WalletReceive');
    }
    onDepositFromExchange() {
        ExchangeController.reset();
        RouterController.push('PayWithExchange', {
            redirectView: RouterController.state.data?.redirectView
        });
    }
};
__decorate([
    state()
], W3mFundWalletView.prototype, "activeCaipNetwork", void 0);
__decorate([
    state()
], W3mFundWalletView.prototype, "features", void 0);
__decorate([
    state()
], W3mFundWalletView.prototype, "remoteFeatures", void 0);
__decorate([
    state()
], W3mFundWalletView.prototype, "exchangesLoading", void 0);
__decorate([
    state()
], W3mFundWalletView.prototype, "exchanges", void 0);
W3mFundWalletView = __decorate([
    customElement('w3m-fund-wallet-view')
], W3mFundWalletView);
export { W3mFundWalletView };
//# sourceMappingURL=index.js.map