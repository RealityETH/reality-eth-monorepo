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
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-icon-box/index.js';
import styles from './styles.js';
const ICON_SIZE = {
    sm: 'xxs',
    lg: 'md'
};
let WuiTransactionThumbnail = class WuiTransactionThumbnail extends LitElement {
    constructor() {
        super(...arguments);
        this.type = 'approve';
        this.size = 'lg';
        this.statusImageUrl = '';
        this.images = [];
    }
    render() {
        return html `<wui-flex>${this.templateVisual()} ${this.templateIcon()}</wui-flex>`;
    }
    templateVisual() {
        this.dataset['size'] = this.size;
        switch (this.type) {
            case 'trade':
                return this.swapTemplate();
            case 'fiat':
                return this.fiatTemplate();
            case 'unknown':
                return this.unknownTemplate();
            default:
                return this.tokenTemplate();
        }
    }
    swapTemplate() {
        const [firstImageUrl, secondImageUrl] = this.images;
        const twoImages = this.images.length === 2 && (firstImageUrl || secondImageUrl);
        if (twoImages) {
            return html `
        <wui-image class="swap-crop-left-image" src=${firstImageUrl} alt="Swap image"></wui-image>
        <wui-image class="swap-crop-right-image" src=${secondImageUrl} alt="Swap image"></wui-image>
      `;
        }
        if (firstImageUrl) {
            return html `<wui-image src=${firstImageUrl} alt="Swap image"></wui-image>`;
        }
        return null;
    }
    fiatTemplate() {
        return html `<wui-icon
      class="fallback-icon"
      size=${ICON_SIZE[this.size]}
      name="dollar"
    ></wui-icon>`;
    }
    unknownTemplate() {
        return html `<wui-icon
      class="fallback-icon"
      size=${ICON_SIZE[this.size]}
      name="questionMark"
    ></wui-icon>`;
    }
    tokenTemplate() {
        const [imageUrl] = this.images;
        if (imageUrl) {
            return html `<wui-image src=${imageUrl} alt="Token image"></wui-image> `;
        }
        return html `<wui-icon
      class="fallback-icon"
      name=${this.type === 'nft' ? 'image' : 'coinPlaceholder'}
    ></wui-icon>`;
    }
    templateIcon() {
        if (this.statusImageUrl) {
            return html `<wui-image
        class="status-image"
        src=${this.statusImageUrl}
        alt="Status image"
      ></wui-image>`;
        }
        return html `<wui-icon
      class="direction-icon"
      size=${ICON_SIZE[this.size]}
      name=${this.getTemplateIcon()}
    ></wui-icon>`;
    }
    getTemplateIcon() {
        if (this.type === 'trade') {
            return 'arrowClockWise';
        }
        return 'arrowBottom';
    }
};
WuiTransactionThumbnail.styles = [styles];
__decorate([
    property()
], WuiTransactionThumbnail.prototype, "type", void 0);
__decorate([
    property()
], WuiTransactionThumbnail.prototype, "size", void 0);
__decorate([
    property()
], WuiTransactionThumbnail.prototype, "statusImageUrl", void 0);
__decorate([
    property({ type: Array })
], WuiTransactionThumbnail.prototype, "images", void 0);
WuiTransactionThumbnail = __decorate([
    customElement('wui-transaction-thumbnail')
], WuiTransactionThumbnail);
export { WuiTransactionThumbnail };
//# sourceMappingURL=index.js.map