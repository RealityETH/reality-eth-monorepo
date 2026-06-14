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
const TEXT_VARIANT_BY_SIZE = {
    lg: 'lg-regular',
    md: 'md-regular',
    sm: 'sm-regular'
};
const ICON_SIZE_BY_SIZE = {
    lg: 'lg',
    md: 'md',
    sm: 'sm'
};
let WuiSelect = class WuiSelect extends LitElement {
    constructor() {
        super(...arguments);
        this.imageSrc = '';
        this.text = '';
        this.size = 'lg';
        this.type = 'text-dropdown';
        this.disabled = false;
    }
    render() {
        return html `<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`;
    }
    textTemplate() {
        const textSize = TEXT_VARIANT_BY_SIZE[this.size];
        if (this.text) {
            return html `<wui-text color="primary" variant=${textSize}>${this.text}</wui-text>`;
        }
        return null;
    }
    imageTemplate() {
        if (this.imageSrc) {
            return html `<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;
        }
        const iconSize = ICON_SIZE_BY_SIZE[this.size];
        return html ` <wui-flex class="left-icon-container">
      <wui-icon size=${iconSize} name="networkPlaceholder"></wui-icon>
    </wui-flex>`;
    }
};
WuiSelect.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiSelect.prototype, "imageSrc", void 0);
__decorate([
    property()
], WuiSelect.prototype, "text", void 0);
__decorate([
    property()
], WuiSelect.prototype, "size", void 0);
__decorate([
    property()
], WuiSelect.prototype, "type", void 0);
__decorate([
    property({ type: Boolean })
], WuiSelect.prototype, "disabled", void 0);
WuiSelect = __decorate([
    customElement('wui-select')
], WuiSelect);
export { WuiSelect };
//# sourceMappingURL=index.js.map