var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-icon/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiIconLink = class WuiIconLink extends LitElement {
    constructor() {
        super(...arguments);
        this.size = 'md';
        this.disabled = false;
        this.icon = 'copy';
        this.iconColor = 'default';
        this.variant = 'accent';
    }
    render() {
        const iconColors = {
            accent: 'accent-primary',
            primary: 'inverse',
            secondary: 'default'
        };
        return html `
      <button data-variant=${this.variant} ?disabled=${this.disabled} data-size=${this.size}>
        <wui-icon
          color=${iconColors[this.variant] || this.iconColor}
          size=${this.size}
          name=${this.icon}
        ></wui-icon>
      </button>
    `;
    }
};
WuiIconLink.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiIconLink.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], WuiIconLink.prototype, "disabled", void 0);
__decorate([
    property()
], WuiIconLink.prototype, "icon", void 0);
__decorate([
    property()
], WuiIconLink.prototype, "iconColor", void 0);
__decorate([
    property()
], WuiIconLink.prototype, "variant", void 0);
WuiIconLink = __decorate([
    customElement('wui-icon-link')
], WuiIconLink);
export { WuiIconLink };
//# sourceMappingURL=index.js.map