var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { NumberUtil } from '@reown/appkit-common';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiListToken = class WuiListToken extends LitElement {
    constructor() {
        super(...arguments);
        this.tokenName = '';
        this.tokenImageUrl = '';
        this.tokenValue = 0.0;
        this.tokenAmount = '0.0';
        this.tokenCurrency = '';
        this.clickable = false;
    }
    render() {
        return html `
      <button data-clickable=${String(this.clickable)}>
        <wui-flex gap="2" alignItems="center">
          ${this.visualTemplate()}
          <wui-flex
            flexDirection="column"
            justifyContent="space-between"
            gap="1"
            class="token-name-container"
          >
            <wui-text variant="md-regular" color="primary" lineClamp="1">
              ${this.tokenName}
            </wui-text>
            <wui-text variant="sm-regular-mono" color="secondary">
              ${NumberUtil.formatNumberToLocalString(this.tokenAmount, 4)} ${this.tokenCurrency}
            </wui-text>
          </wui-flex>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          justifyContent="space-between"
          gap="1"
          alignItems="flex-end"
          width="auto"
        >
          <wui-text variant="md-regular-mono" color="primary"
            >$${this.tokenValue.toFixed(2)}</wui-text
          >
          <wui-text variant="sm-regular-mono" color="secondary">
            ${NumberUtil.formatNumberToLocalString(this.tokenAmount, 4)}
          </wui-text>
        </wui-flex>
      </button>
    `;
    }
    visualTemplate() {
        if (this.tokenName && this.tokenImageUrl) {
            return html `<wui-image alt=${this.tokenName} src=${this.tokenImageUrl}></wui-image>`;
        }
        return html `<wui-icon name="coinPlaceholder" color="default"></wui-icon>`;
    }
};
WuiListToken.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiListToken.prototype, "tokenName", void 0);
__decorate([
    property()
], WuiListToken.prototype, "tokenImageUrl", void 0);
__decorate([
    property({ type: Number })
], WuiListToken.prototype, "tokenValue", void 0);
__decorate([
    property()
], WuiListToken.prototype, "tokenAmount", void 0);
__decorate([
    property()
], WuiListToken.prototype, "tokenCurrency", void 0);
__decorate([
    property({ type: Boolean })
], WuiListToken.prototype, "clickable", void 0);
WuiListToken = __decorate([
    customElement('wui-list-token')
], WuiListToken);
export { WuiListToken };
//# sourceMappingURL=index.js.map