var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-icon-box/index.js';
import '../wui-tag/index.js';
import styles from './styles.js';
let WuiListSelectWallet = class WuiListSelectWallet extends LitElement {
    constructor() {
        super(...arguments);
        this.imageSrc = '';
        this.name = '';
        this.qrCode = false;
        this.allWallets = false;
        this.disabled = false;
    }
    render() {
        return html `
      <button ?disabled=${this.disabled}>
        ${this.leftImageTemplate()}
        <wui-text color="primary" variant="lg-regular" lineClamp="1">${this.name}</wui-text>
        <wui-tag variant=${this.allWallets ? 'info' : 'accent'} size="sm">${this.tagLabel}</wui-tag>
      </button>
    `;
    }
    leftImageTemplate() {
        if (this.allWallets) {
            return html `<wui-icon-box
        iconColor="accent"
        iconSize="xl"
        backgroundColor="foregroundAccent010"
        icon="allWallets"
      ></wui-icon-box>`;
        }
        if (this.qrCode) {
            return html `<wui-icon-box color="default" iconSize="xl" icon="qrCode"></wui-icon-box>`;
        }
        if (this.imageSrc) {
            return html `<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`;
        }
        return null;
    }
};
WuiListSelectWallet.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiListSelectWallet.prototype, "imageSrc", void 0);
__decorate([
    property()
], WuiListSelectWallet.prototype, "name", void 0);
__decorate([
    property()
], WuiListSelectWallet.prototype, "tagLabel", void 0);
__decorate([
    property({ type: Boolean })
], WuiListSelectWallet.prototype, "qrCode", void 0);
__decorate([
    property({ type: Boolean })
], WuiListSelectWallet.prototype, "allWallets", void 0);
__decorate([
    property({ type: Boolean })
], WuiListSelectWallet.prototype, "disabled", void 0);
WuiListSelectWallet = __decorate([
    customElement('wui-list-select-wallet')
], WuiListSelectWallet);
export { WuiListSelectWallet };
//# sourceMappingURL=index.js.map