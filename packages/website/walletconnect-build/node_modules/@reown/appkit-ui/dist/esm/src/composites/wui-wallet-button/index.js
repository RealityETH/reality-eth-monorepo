var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
const TEXT_SIZE_BY_SIZE = {
    lg: 'lg-medium',
    md: 'md-medium',
    sm: 'sm-medium'
};
const ICON_SIZE_BY_SIZE = {
    lg: 'xl',
    md: 'lg',
    sm: 'md'
};
let WuiWalletButton = class WuiWalletButton extends LitElement {
    constructor() {
        super(...arguments);
        this.imageSrc = '';
        this.name = '';
        this.size = 'md';
        this.walletConnect = false;
        this.loading = false;
        this.error = false;
        this.disabled = false;
    }
    render() {
        this.dataset['error'] = `${this.error}`;
        return html `
      <button ?disabled=${this.disabled} data-size=${this.size} data-error=${this.error}>
        ${this.leftViewTemplate()} ${this.rightViewTemplate()}
      </button>
    `;
    }
    leftViewTemplate() {
        if (this.error) {
            return html `<wui-icon name="warningCircle" iconColor="inherit" size="md"></wui-icon>`;
        }
        if (this.loading) {
            return html `<wui-loading-spinner size="lg" color="inherit"></wui-loading-spinner>`;
        }
        if (this.imageSrc) {
            return html `<wui-image src=${this.imageSrc} alt=${ifDefined(this.name)}></wui-image>`;
        }
        if (this.icon) {
            return html `<wui-icon
        size=${ICON_SIZE_BY_SIZE[this.size]}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`;
        }
        return null;
    }
    rightViewTemplate() {
        return html `
      <wui-text variant=${TEXT_SIZE_BY_SIZE[this.size]} color="inherit"
        >${this.name || 'Unknown'}
      </wui-text>
    `;
    }
};
WuiWalletButton.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiWalletButton.prototype, "imageSrc", void 0);
__decorate([
    property()
], WuiWalletButton.prototype, "name", void 0);
__decorate([
    property()
], WuiWalletButton.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], WuiWalletButton.prototype, "walletConnect", void 0);
__decorate([
    property()
], WuiWalletButton.prototype, "icon", void 0);
__decorate([
    property({ type: Boolean })
], WuiWalletButton.prototype, "loading", void 0);
__decorate([
    property({ type: Boolean })
], WuiWalletButton.prototype, "error", void 0);
__decorate([
    property({ type: Boolean })
], WuiWalletButton.prototype, "disabled", void 0);
WuiWalletButton = __decorate([
    customElement('wui-wallet-button')
], WuiWalletButton);
export { WuiWalletButton };
//# sourceMappingURL=index.js.map