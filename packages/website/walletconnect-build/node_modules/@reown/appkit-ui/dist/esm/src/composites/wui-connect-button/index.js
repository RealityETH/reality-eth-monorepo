var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiConnectButton = class WuiConnectButton extends LitElement {
    constructor() {
        super(...arguments);
        this.size = 'md';
        this.variant = 'primary';
        this.loading = false;
        this.text = 'Connect Wallet';
    }
    render() {
        return html `
      <button
        data-loading=${this.loading}
        data-variant=${this.variant}
        data-size=${this.size}
        ?disabled=${this.loading}
      >
        ${this.contentTemplate()}
      </button>
    `;
    }
    contentTemplate() {
        const textVariants = {
            lg: 'lg-regular',
            md: 'md-regular',
            sm: 'sm-regular'
        };
        const colors = {
            primary: 'invert',
            secondary: 'accent-primary'
        };
        if (!this.loading) {
            return html ` <wui-text variant=${textVariants[this.size]} color=${colors[this.variant]}>
        ${this.text}
      </wui-text>`;
        }
        return html `<wui-loading-spinner
      color=${colors[this.variant]}
      size=${this.size}
    ></wui-loading-spinner>`;
    }
};
WuiConnectButton.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiConnectButton.prototype, "size", void 0);
__decorate([
    property()
], WuiConnectButton.prototype, "variant", void 0);
__decorate([
    property({ type: Boolean })
], WuiConnectButton.prototype, "loading", void 0);
__decorate([
    property()
], WuiConnectButton.prototype, "text", void 0);
WuiConnectButton = __decorate([
    customElement('wui-connect-button')
], WuiConnectButton);
export { WuiConnectButton };
//# sourceMappingURL=index.js.map