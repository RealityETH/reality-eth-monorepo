var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
const TEXT_VARIANT_BY_SIZE = {
    lg: 'lg-regular',
    md: 'md-regular',
    sm: 'sm-regular'
};
const ICON_SIZE = {
    lg: 'md',
    md: 'sm',
    sm: 'sm'
};
let WuiTab = class WuiTab extends LitElement {
    constructor() {
        super(...arguments);
        this.icon = 'mobile';
        this.size = 'md';
        this.label = '';
        this.active = false;
    }
    render() {
        return html `
      <button data-active=${this.active}>
        ${this.icon
            ? html `<wui-icon size=${ICON_SIZE[this.size]} name=${this.icon}></wui-icon>`
            : ''}
        <wui-text variant=${TEXT_VARIANT_BY_SIZE[this.size]}> ${this.label} </wui-text>
      </button>
    `;
    }
};
WuiTab.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiTab.prototype, "icon", void 0);
__decorate([
    property()
], WuiTab.prototype, "size", void 0);
__decorate([
    property()
], WuiTab.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], WuiTab.prototype, "active", void 0);
WuiTab = __decorate([
    customElement('wui-tab-item')
], WuiTab);
export { WuiTab };
//# sourceMappingURL=index.js.map