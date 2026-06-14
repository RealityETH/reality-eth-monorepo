var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import { resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-icon-box/index.js';
import styles from './styles.js';
let WuiSnackbar = class WuiSnackbar extends LitElement {
    constructor() {
        super(...arguments);
        this.message = '';
        this.variant = 'success';
    }
    render() {
        return html `
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `;
    }
    templateIcon() {
        const COLOR = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'default'
        };
        const ICON = {
            success: 'checkmark',
            error: 'warning',
            warning: 'warningCircle',
            info: 'info'
        };
        if (this.variant === 'loading') {
            return html `<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`;
        }
        return html `<wui-icon-box
      size="md"
      color=${COLOR[this.variant]}
      icon=${ICON[this.variant]}
    ></wui-icon-box>`;
    }
};
WuiSnackbar.styles = [resetStyles, styles];
__decorate([
    property()
], WuiSnackbar.prototype, "message", void 0);
__decorate([
    property()
], WuiSnackbar.prototype, "variant", void 0);
WuiSnackbar = __decorate([
    customElement('wui-snackbar')
], WuiSnackbar);
export { WuiSnackbar };
//# sourceMappingURL=index.js.map