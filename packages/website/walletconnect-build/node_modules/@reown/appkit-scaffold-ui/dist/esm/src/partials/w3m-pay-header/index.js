var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ChainController } from '@reown/appkit-controllers';
import { PayController } from '@reown/appkit-pay';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-text';
import styles from './styles.js';
let W3mPayHeader = class W3mPayHeader extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.paymentAsset = PayController.state.paymentAsset;
        this.amount = PayController.state.amount;
        this.unsubscribe.push(PayController.subscribeKey('paymentAsset', val => {
            this.paymentAsset = val;
        }), PayController.subscribeKey('amount', val => {
            this.amount = val;
        }));
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        const allNetworks = ChainController.getAllRequestedCaipNetworks();
        const targetNetwork = allNetworks.find(net => net.caipNetworkId === this.paymentAsset.network);
        return html `<wui-flex
      alignItems="center"
      gap="1"
      .padding=${['1', '2', '1', '1']}
      class="transfers-badge"
    >
      <wui-image src=${ifDefined(this.paymentAsset.metadata.logoURI)} size="xl"></wui-image>
      <wui-text variant="lg-regular" color="primary">
        ${this.amount} ${this.paymentAsset.metadata.symbol}
      </wui-text>
      <wui-text variant="sm-regular" color="secondary">
        on ${targetNetwork?.name ?? 'Unknown'}
      </wui-text>
    </wui-flex>`;
    }
};
W3mPayHeader.styles = [styles];
__decorate([
    property()
], W3mPayHeader.prototype, "paymentAsset", void 0);
__decorate([
    property()
], W3mPayHeader.prototype, "amount", void 0);
W3mPayHeader = __decorate([
    customElement('w3m-pay-header')
], W3mPayHeader);
export { W3mPayHeader };
//# sourceMappingURL=index.js.map