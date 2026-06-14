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
const FONT_BY_SIZE = {
    sm: 'sm-regular',
    md: 'md-regular',
    lg: 'lg-regular'
};
let WuiChipButton = class WuiChipButton extends LitElement {
    constructor() {
        super(...arguments);
        this.type = 'accent';
        this.size = 'md';
        this.imageSrc = '';
        this.disabled = false;
        this.leftIcon = undefined;
        this.rightIcon = undefined;
        this.text = '';
    }
    render() {
        return html `
      <button ?disabled=${this.disabled} data-type=${this.type} data-size=${this.size}>
        ${this.imageSrc ? html `<wui-image src=${this.imageSrc}></wui-image>` : null}
        ${this.leftIcon
            ? html `<wui-icon name=${this.leftIcon} color="inherit" size="inherit"></wui-icon>`
            : null}
        <wui-text variant=${FONT_BY_SIZE[this.size]} color="inherit">${this.text}</wui-text>
        ${this.rightIcon
            ? html `<wui-icon name=${this.rightIcon} color="inherit" size="inherit"></wui-icon>`
            : null}
      </button>
    `;
    }
};
WuiChipButton.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiChipButton.prototype, "type", void 0);
__decorate([
    property()
], WuiChipButton.prototype, "size", void 0);
__decorate([
    property()
], WuiChipButton.prototype, "imageSrc", void 0);
__decorate([
    property({ type: Boolean })
], WuiChipButton.prototype, "disabled", void 0);
__decorate([
    property()
], WuiChipButton.prototype, "leftIcon", void 0);
__decorate([
    property()
], WuiChipButton.prototype, "rightIcon", void 0);
__decorate([
    property()
], WuiChipButton.prototype, "text", void 0);
WuiChipButton = __decorate([
    customElement('wui-chip-button')
], WuiChipButton);
export { WuiChipButton };
//# sourceMappingURL=index.js.map