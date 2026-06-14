var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ChainController, EventsController, OptionsController, RouterController, getPreferredAccountType } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-list-description';
import '@reown/appkit-ui/wui-list-token';
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils';
import styles from './styles.js';
let W3mAccountTokensWidget = class W3mAccountTokensWidget extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.tokenBalance = ChainController.getAccountData()?.tokenBalance;
        this.remoteFeatures = OptionsController.state.remoteFeatures;
        this.unsubscribe.push(...[
            ChainController.subscribeChainProp('accountState', val => {
                this.tokenBalance = val?.tokenBalance;
            }),
            OptionsController.subscribeKey('remoteFeatures', val => {
                this.remoteFeatures = val;
            })
        ]);
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        return html `${this.tokenTemplate()}`;
    }
    tokenTemplate() {
        if (this.tokenBalance && this.tokenBalance?.length > 0) {
            return html `<wui-flex class="contentContainer" flexDirection="column" gap="2">
        ${this.tokenItemTemplate()}
      </wui-flex>`;
        }
        return html ` <wui-flex flexDirection="column">
      ${this.onRampTemplate()}
      <wui-list-description
        @click=${this.onReceiveClick.bind(this)}
        text="Receive funds"
        description="Scan the QR code and receive funds"
        icon="qrCode"
        iconColor="fg-200"
        iconBackgroundColor="fg-200"
        data-testid="w3m-account-receive-button"
      ></wui-list-description
    ></wui-flex>`;
    }
    onRampTemplate() {
        if (this.remoteFeatures?.onramp) {
            return html `<wui-list-description
        @click=${this.onBuyClick.bind(this)}
        text="Buy Crypto"
        description="Easy with card or bank account"
        icon="card"
        iconColor="success-100"
        iconBackgroundColor="success-100"
        tag="popular"
        data-testid="w3m-account-onramp-button"
      ></wui-list-description>`;
        }
        return html ``;
    }
    tokenItemTemplate() {
        return this.tokenBalance?.map(token => html `<wui-list-token
          tokenName=${token.name}
          tokenImageUrl=${token.iconUrl}
          tokenAmount=${token.quantity.numeric}
          tokenValue=${token.value}
          tokenCurrency=${token.symbol}
        ></wui-list-token>`);
    }
    onReceiveClick() {
        RouterController.push('WalletReceive');
    }
    onBuyClick() {
        EventsController.sendEvent({
            type: 'track',
            event: 'SELECT_BUY_CRYPTO',
            properties: {
                isSmartAccount: getPreferredAccountType(ChainController.state.activeChain) ===
                    W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
            }
        });
        RouterController.push('OnRampProviders');
    }
};
W3mAccountTokensWidget.styles = styles;
__decorate([
    state()
], W3mAccountTokensWidget.prototype, "tokenBalance", void 0);
__decorate([
    state()
], W3mAccountTokensWidget.prototype, "remoteFeatures", void 0);
W3mAccountTokensWidget = __decorate([
    customElement('w3m-account-tokens-widget')
], W3mAccountTokensWidget);
export { W3mAccountTokensWidget };
//# sourceMappingURL=index.js.map