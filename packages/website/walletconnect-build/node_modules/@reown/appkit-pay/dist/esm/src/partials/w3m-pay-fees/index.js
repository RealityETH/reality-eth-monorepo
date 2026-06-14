var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { NumberUtil } from '@reown/appkit-common';
import { AssetUtil, ChainController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-image';
import '@reown/appkit-ui/wui-text';
import { HelpersUtil } from '@reown/appkit-utils';
import { PayController } from '../../controllers/PayController.js';
import styles from './styles.js';
let W3mPayFees = class W3mPayFees extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.quote = PayController.state.quote;
        this.unsubscribe.push(PayController.subscribeKey('quote', val => (this.quote = val)));
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        const amount = NumberUtil.formatNumber(this.quote?.origin.amount || '0', {
            decimals: this.quote?.origin.currency.metadata.decimals ?? 0,
            round: 6
        }).toString();
        return html `
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-text variant="md-regular" color="primary">
            ${amount} ${this.quote?.origin.currency.metadata.symbol || 'Unknown'}
          </wui-text>
        </wui-flex>

        ${this.quote && this.quote.fees.length > 0
            ? this.quote.fees.map(fee => this.renderFee(fee))
            : null}
      </wui-flex>
    `;
    }
    renderFee(fee) {
        const isNetworkFee = fee.id === 'network';
        const feeAmount = NumberUtil.formatNumber(fee.amount || '0', {
            decimals: fee.currency.metadata.decimals ?? 0,
            round: 6
        }).toString();
        if (isNetworkFee) {
            const allNetworks = ChainController.getAllRequestedCaipNetworks();
            const targetNetwork = allNetworks.find(net => HelpersUtil.isLowerCaseMatch(net.caipNetworkId, fee.currency.network));
            return html `
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">${fee.label}</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-text variant="md-regular" color="primary">
              ${feeAmount} ${fee.currency.metadata.symbol || 'Unknown'}
            </wui-text>

            <wui-flex alignItems="center" gap="01">
              <wui-image
                src=${ifDefined(AssetUtil.getNetworkImage(targetNetwork))}
                size="xs"
              ></wui-image>
              <wui-text variant="sm-regular" color="secondary">
                ${targetNetwork?.name || 'Unknown'}
              </wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      `;
        }
        return html `
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-text variant="md-regular" color="secondary">${fee.label}</wui-text>
        <wui-text variant="md-regular" color="primary">
          ${feeAmount} ${fee.currency.metadata.symbol || 'Unknown'}
        </wui-text>
      </wui-flex>
    `;
    }
};
W3mPayFees.styles = [styles];
__decorate([
    state()
], W3mPayFees.prototype, "quote", void 0);
W3mPayFees = __decorate([
    customElement('w3m-pay-fees')
], W3mPayFees);
export { W3mPayFees };
//# sourceMappingURL=index.js.map