var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
const ICON_BY_VARIANT = {
    success: 'sealCheck',
    warning: 'exclamationCircle',
    error: 'warning'
};
const FONT_BY_SIZE = {
    sm: 'sm-regular',
    md: 'md-regular'
};
let WuiDomainChip = class WuiDomainChip extends LitElement {
    constructor() {
        super(...arguments);
        this.variant = 'success';
        this.size = 'md';
        this.imageSrc = '';
        this.disabled = false;
        this.text = '';
    }
    render() {
        return html `
      <button ?disabled=${this.disabled} data-variant=${this.variant} data-size=${this.size}>
        <wui-icon name=${ICON_BY_VARIANT[this.variant]}></wui-icon>
        ${this.text
            ? html `<wui-text variant=${FONT_BY_SIZE[this.size]} color="inherit"
              >${this.text}</wui-text
            >`
            : null}
      </button>
    `;
    }
};
WuiDomainChip.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiDomainChip.prototype, "variant", void 0);
__decorate([
    property()
], WuiDomainChip.prototype, "size", void 0);
__decorate([
    property()
], WuiDomainChip.prototype, "imageSrc", void 0);
__decorate([
    property({ type: Boolean })
], WuiDomainChip.prototype, "disabled", void 0);
__decorate([
    property()
], WuiDomainChip.prototype, "text", void 0);
WuiDomainChip = __decorate([
    customElement('wui-domain-chip')
], WuiDomainChip);
export { WuiDomainChip };
//# sourceMappingURL=index.js.map