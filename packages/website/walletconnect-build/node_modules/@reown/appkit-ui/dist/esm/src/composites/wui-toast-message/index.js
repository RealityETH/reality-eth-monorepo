var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { AlertController } from '@reown/appkit-controllers';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import { resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
const ICON_BY_VARIANT = {
    info: 'info',
    success: 'checkmark',
    warning: 'warningCircle',
    error: 'warning'
};
let WuiToastMessage = class WuiToastMessage extends LitElement {
    constructor() {
        super(...arguments);
        this.message = '';
        this.variant = 'info';
    }
    render() {
        this.dataset['variant'] = this.variant;
        return html `
      <wui-icon name=${ICON_BY_VARIANT[this.variant]}></wui-icon>
      <wui-text variant="md-medium" color="primary" data-testid="wui-toast-message-text">
        ${this.message}
      </wui-text>
      <wui-icon size="lg" name="close" @click=${this.onClose}></wui-icon>
    `;
    }
    onClose() {
        AlertController.close();
    }
};
WuiToastMessage.styles = [resetStyles, styles];
__decorate([
    property()
], WuiToastMessage.prototype, "message", void 0);
__decorate([
    property()
], WuiToastMessage.prototype, "variant", void 0);
WuiToastMessage = __decorate([
    customElement('wui-toast-message')
], WuiToastMessage);
export { WuiToastMessage };
//# sourceMappingURL=index.js.map