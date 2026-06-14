var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-text';
import { PayController } from '../../controllers/PayController.js';
import styles from './styles.js';
let W3mPayOptionsEmpty = class W3mPayOptionsEmpty extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.selectedExchange = PayController.state.selectedExchange;
        this.unsubscribe.push(PayController.subscribeKey('selectedExchange', val => (this.selectedExchange = val)));
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        const isUsingExchange = Boolean(this.selectedExchange);
        return html `
      <wui-flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
        class="disabled-container"
      >
        <wui-icon name="coins" color="default" size="inherit"></wui-icon>

        <wui-text variant="md-regular" color="primary" align="center">
          You don't have enough funds to complete this transaction
        </wui-text>

        ${isUsingExchange
            ? null
            : html `<wui-button
              size="md"
              variant="neutral-secondary"
              @click=${this.dispatchConnectOtherWalletEvent.bind(this)}
              >Connect other wallet</wui-button
            >`}
      </wui-flex>
    `;
    }
    dispatchConnectOtherWalletEvent() {
        this.dispatchEvent(new CustomEvent('connectOtherWallet', {
            detail: true,
            bubbles: true,
            composed: true
        }));
    }
};
W3mPayOptionsEmpty.styles = [styles];
__decorate([
    property({ type: Array })
], W3mPayOptionsEmpty.prototype, "selectedExchange", void 0);
W3mPayOptionsEmpty = __decorate([
    customElement('w3m-pay-options-empty')
], W3mPayOptionsEmpty);
export { W3mPayOptionsEmpty };
//# sourceMappingURL=index.js.map