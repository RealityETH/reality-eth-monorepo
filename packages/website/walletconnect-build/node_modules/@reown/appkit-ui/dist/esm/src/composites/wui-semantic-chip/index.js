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
const TEXT_BY_SIZE = {
    sm: 'md-regular',
    md: 'lg-regular',
    lg: 'lg-regular'
};
const ICON_BY_TYPE = {
    success: 'sealCheck',
    error: 'warning',
    warning: 'exclamationCircle'
};
let WuiSemanticChip = class WuiSemanticChip extends LitElement {
    constructor() {
        super(...arguments);
        this.type = 'success';
        this.size = 'md';
        this.imageSrc = undefined;
        this.disabled = false;
        this.href = '';
        this.text = undefined;
    }
    render() {
        return html `
      <a
        rel="noreferrer"
        target="_blank"
        href=${this.href}
        class=${this.disabled ? 'disabled' : ''}
        data-type=${this.type}
        data-size=${this.size}
      >
        ${this.imageTemplate()}
        <wui-text variant=${TEXT_BY_SIZE[this.size]} color="inherit">${this.text}</wui-text>
      </a>
    `;
    }
    imageTemplate() {
        if (this.imageSrc) {
            return html `<wui-image src=${this.imageSrc} size="inherit"></wui-image>`;
        }
        return html `<wui-icon
      name=${ICON_BY_TYPE[this.type]}
      weight="fill"
      color="inherit"
      size="inherit"
      class="image-icon"
    ></wui-icon>`;
    }
};
WuiSemanticChip.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiSemanticChip.prototype, "type", void 0);
__decorate([
    property()
], WuiSemanticChip.prototype, "size", void 0);
__decorate([
    property()
], WuiSemanticChip.prototype, "imageSrc", void 0);
__decorate([
    property({ type: Boolean })
], WuiSemanticChip.prototype, "disabled", void 0);
__decorate([
    property()
], WuiSemanticChip.prototype, "href", void 0);
__decorate([
    property()
], WuiSemanticChip.prototype, "text", void 0);
WuiSemanticChip = __decorate([
    customElement('wui-semantic-chip')
], WuiSemanticChip);
export { WuiSemanticChip };
//# sourceMappingURL=index.js.map