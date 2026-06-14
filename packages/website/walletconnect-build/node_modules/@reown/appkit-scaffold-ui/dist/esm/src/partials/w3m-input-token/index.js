var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { NumberUtil } from '@reown/appkit-common';
import { RouterController, SendController } from '@reown/appkit-controllers';
import { UiHelperUtil, customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-input-amount';
import '@reown/appkit-ui/wui-link';
import '@reown/appkit-ui/wui-text';
import '@reown/appkit-ui/wui-token-button';
import styles from './styles.js';
let W3mInputToken = class W3mInputToken extends LitElement {
    constructor() {
        super(...arguments);
        this.readOnly = false;
        this.isInsufficientBalance = false;
    }
    render() {
        const isDisabled = this.readOnly || !this.token;
        return html ` <wui-flex
      flexDirection="column"
      gap="01"
      .padding=${['5', '3', '4', '3']}
    >
      <wui-flex alignItems="center">
        <wui-input-amount
          @inputChange=${this.onInputChange.bind(this)}
          ?disabled=${isDisabled}
          .value=${this.sendTokenAmount ? String(this.sendTokenAmount) : ''}
          ?error=${Boolean(this.isInsufficientBalance)}
        ></wui-input-amount>
        ${this.buttonTemplate()}
      </wui-flex>
      ${this.bottomTemplate()}
    </wui-flex>`;
    }
    buttonTemplate() {
        if (this.token) {
            return html `<wui-token-button
        text=${this.token.symbol}
        imageSrc=${this.token.iconUrl}
        @click=${this.handleSelectButtonClick.bind(this)}
      >
      </wui-token-button>`;
        }
        return html `<wui-button
      size="md"
      variant="neutral-secondary"
      @click=${this.handleSelectButtonClick.bind(this)}
      >Select token</wui-button
    >`;
    }
    handleSelectButtonClick() {
        if (!this.readOnly) {
            RouterController.push('WalletSendSelectToken');
        }
    }
    sendValueTemplate() {
        if (!this.readOnly && this.token && this.sendTokenAmount) {
            const price = this.token.price;
            const totalValue = price * this.sendTokenAmount;
            return html `<wui-text class="totalValue" variant="sm-regular" color="secondary"
        >${totalValue
                ? `$${NumberUtil.formatNumberToLocalString(totalValue, 2)}`
                : 'Incorrect value'}</wui-text
      >`;
        }
        return null;
    }
    maxAmountTemplate() {
        if (this.token) {
            return html ` <wui-text variant="sm-regular" color="secondary">
        ${UiHelperUtil.roundNumber(Number(this.token.quantity.numeric), 6, 5)}
      </wui-text>`;
        }
        return null;
    }
    actionTemplate() {
        if (this.token) {
            return html `<wui-link @click=${this.onMaxClick.bind(this)}>Max</wui-link>`;
        }
        return null;
    }
    bottomTemplate() {
        if (this.readOnly) {
            return null;
        }
        return html `<wui-flex alignItems="center" justifyContent="space-between">
      ${this.sendValueTemplate()}
      <wui-flex alignItems="center" gap="01" justifyContent="flex-end">
        ${this.maxAmountTemplate()} ${this.actionTemplate()}
      </wui-flex>
    </wui-flex>`;
    }
    onInputChange(event) {
        SendController.setTokenAmount(event.detail);
    }
    onMaxClick() {
        if (this.token) {
            const maxValue = NumberUtil.bigNumber(this.token.quantity.numeric);
            SendController.setTokenAmount(Number(maxValue.toFixed(20)));
        }
    }
};
W3mInputToken.styles = styles;
__decorate([
    property({ type: Object })
], W3mInputToken.prototype, "token", void 0);
__decorate([
    property({ type: Boolean })
], W3mInputToken.prototype, "readOnly", void 0);
__decorate([
    property({ type: Number })
], W3mInputToken.prototype, "sendTokenAmount", void 0);
__decorate([
    property({ type: Boolean })
], W3mInputToken.prototype, "isInsufficientBalance", void 0);
W3mInputToken = __decorate([
    customElement('w3m-input-token')
], W3mInputToken);
export { W3mInputToken };
//# sourceMappingURL=index.js.map