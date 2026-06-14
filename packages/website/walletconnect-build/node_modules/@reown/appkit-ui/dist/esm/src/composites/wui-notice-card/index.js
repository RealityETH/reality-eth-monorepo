var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-button/index.js';
import '../wui-icon-box/index.js';
import styles from './styles.js';
let WuiNoticeCard = class WuiNoticeCard extends LitElement {
    constructor() {
        super(...arguments);
        this.label = '';
        this.description = '';
        this.icon = 'wallet';
    }
    render() {
        return html `
      <button>
        <wui-flex gap="2" alignItems="center">
          <wui-icon weight="fill" size="lg" name=${this.icon} color="inherit"></wui-icon>
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.label}</wui-text>
            <wui-text variant="md-regular" color="tertiary">${this.description}</wui-text>
          </wui-flex>
        </wui-flex>
        <wui-icon size="lg" color="accent-primary" name="chevronRight"></wui-icon>
      </button>
    `;
    }
};
WuiNoticeCard.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiNoticeCard.prototype, "label", void 0);
__decorate([
    property()
], WuiNoticeCard.prototype, "description", void 0);
__decorate([
    property()
], WuiNoticeCard.prototype, "icon", void 0);
WuiNoticeCard = __decorate([
    customElement('wui-notice-card')
], WuiNoticeCard);
export { WuiNoticeCard };
//# sourceMappingURL=index.js.map