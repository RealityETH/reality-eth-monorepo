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
import '../../components/wui-shimmer/index.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
const TEXT_VARIANT_BY_SIZE = {
    lg: 'lg-regular',
    md: 'lg-regular',
    sm: 'md-regular'
};
const ICON_SIZE_BY_SIZE = {
    lg: 'lg',
    md: 'md',
    sm: 'sm'
};
let WuiTokenButton = class WuiTokenButton extends LitElement {
    constructor() {
        super(...arguments);
        this.size = 'md';
        this.disabled = false;
        this.text = '';
        this.loading = false;
    }
    render() {
        if (this.loading) {
            return html ` <wui-flex alignItems="center" gap="01" padding="01">
        <wui-shimmer width="20px" height="20px"></wui-shimmer>
        <wui-shimmer width="32px" height="18px" borderRadius="4xs"></wui-shimmer>
      </wui-flex>`;
        }
        return html `
      <button ?disabled=${this.disabled} data-size=${this.size}>
        ${this.imageTemplate()} ${this.textTemplate()}
      </button>
    `;
    }
    imageTemplate() {
        if (this.imageSrc && this.chainImageSrc) {
            return html `<wui-flex class="left-image-container">
        <wui-image src=${this.imageSrc} class="token-image"></wui-image>
        <wui-image src=${this.chainImageSrc} class="chain-image"></wui-image>
      </wui-flex>`;
        }
        if (this.imageSrc) {
            return html `<wui-image src=${this.imageSrc} class="token-image"></wui-image>`;
        }
        const iconSize = ICON_SIZE_BY_SIZE[this.size];
        return html `<wui-flex class="left-icon-container">
      <wui-icon size=${iconSize} name="networkPlaceholder"></wui-icon>
    </wui-flex>`;
    }
    textTemplate() {
        const textVariant = TEXT_VARIANT_BY_SIZE[this.size];
        return html `<wui-text color="primary" variant=${textVariant}
      >${this.text}</wui-text
    >`;
    }
};
WuiTokenButton.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiTokenButton.prototype, "size", void 0);
__decorate([
    property()
], WuiTokenButton.prototype, "imageSrc", void 0);
__decorate([
    property()
], WuiTokenButton.prototype, "chainImageSrc", void 0);
__decorate([
    property({ type: Boolean })
], WuiTokenButton.prototype, "disabled", void 0);
__decorate([
    property()
], WuiTokenButton.prototype, "text", void 0);
__decorate([
    property({ type: Boolean })
], WuiTokenButton.prototype, "loading", void 0);
WuiTokenButton = __decorate([
    customElement('wui-token-button')
], WuiTokenButton);
export { WuiTokenButton };
//# sourceMappingURL=index.js.map