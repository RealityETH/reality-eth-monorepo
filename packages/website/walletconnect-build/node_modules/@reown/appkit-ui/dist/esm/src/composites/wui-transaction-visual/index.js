var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-icon-box/index.js';
import styles from './styles.js';
let WuiTransactionVisual = class WuiTransactionVisual extends LitElement {
    constructor() {
        super(...arguments);
        this.images = [];
        this.secondImage = {
            type: undefined,
            url: ''
        };
        this.failedImageUrls = new Set();
    }
    handleImageError(url) {
        return (event) => {
            event.stopPropagation();
            this.failedImageUrls.add(url);
            this.requestUpdate();
        };
    }
    render() {
        const [firstImage, secondImage] = this.images;
        if (!this.images.length) {
            this.dataset['noImages'] = 'true';
        }
        const isLeftNFT = firstImage?.type === 'NFT';
        const isRightNFT = secondImage?.url ? secondImage.type === 'NFT' : isLeftNFT;
        const leftRadius = isLeftNFT ? 'var(--apkt-borderRadius-3)' : 'var(--apkt-borderRadius-5)';
        const rightRadius = isRightNFT ? 'var(--apkt-borderRadius-3)' : 'var(--apkt-borderRadius-5)';
        this.style.cssText = `
    --local-left-border-radius: ${leftRadius};
    --local-right-border-radius: ${rightRadius};
    `;
        return html `<wui-flex> ${this.templateVisual()} ${this.templateIcon()} </wui-flex>`;
    }
    templateVisual() {
        const [firstImage, secondImage] = this.images;
        const hasTwoImages = this.images.length === 2;
        if (hasTwoImages && (firstImage?.url || secondImage?.url)) {
            return this.renderSwapImages(firstImage, secondImage);
        }
        if (firstImage?.url && !this.failedImageUrls.has(firstImage.url)) {
            return this.renderSingleImage(firstImage);
        }
        if (firstImage?.type === 'NFT') {
            return this.renderPlaceholderIcon('nftPlaceholder');
        }
        return this.renderPlaceholderIcon('coinPlaceholder');
    }
    renderSwapImages(firstImage, secondImage) {
        return html `<div class="swap-images-container">
      ${firstImage?.url ? this.renderImageOrFallback(firstImage, 'first', true) : null}
      ${secondImage?.url ? this.renderImageOrFallback(secondImage, 'last', true) : null}
    </div>`;
    }
    renderSingleImage(image) {
        return this.renderImageOrFallback(image, undefined, false);
    }
    renderImageOrFallback(image, position, isInSwapContainer = false) {
        if (!image.url) {
            return null;
        }
        if (this.failedImageUrls.has(image.url)) {
            if (isInSwapContainer && position) {
                return this.renderFallbackIconInContainer(position);
            }
            return this.renderFallbackIcon();
        }
        return html `<wui-image
      src=${image.url}
      alt="Transaction image"
      @onLoadError=${this.handleImageError(image.url)}
    ></wui-image>`;
    }
    renderFallbackIconInContainer(position) {
        return html `<div class="swap-fallback-container ${position}">${this.renderFallbackIcon()}</div>`;
    }
    renderFallbackIcon() {
        return html `<wui-icon
      size="xl"
      weight="regular"
      color="default"
      name="networkPlaceholder"
    ></wui-icon>`;
    }
    renderPlaceholderIcon(iconName) {
        return html `<wui-icon size="xl" weight="regular" color="default" name=${iconName}></wui-icon>`;
    }
    templateIcon() {
        let color = 'accent-primary';
        let icon = undefined;
        icon = this.getIcon();
        if (this.status) {
            color = this.getStatusColor();
        }
        if (!icon) {
            return null;
        }
        return html `
      <wui-flex alignItems="center" justifyContent="center" class="status-box">
        <wui-icon-box size="sm" color=${color} icon=${icon}></wui-icon-box>
      </wui-flex>
    `;
    }
    getDirectionIcon() {
        switch (this.direction) {
            case 'in':
                return 'arrowBottom';
            case 'out':
                return 'arrowTop';
            default:
                return undefined;
        }
    }
    getIcon() {
        if (this.onlyDirectionIcon) {
            return this.getDirectionIcon();
        }
        if (this.type === 'trade') {
            return 'swapHorizontal';
        }
        else if (this.type === 'approve') {
            return 'checkmark';
        }
        else if (this.type === 'cancel') {
            return 'close';
        }
        return this.getDirectionIcon();
    }
    getStatusColor() {
        switch (this.status) {
            case 'confirmed':
                return 'success';
            case 'failed':
                return 'error';
            case 'pending':
                return 'inverse';
            default:
                return 'accent-primary';
        }
    }
};
WuiTransactionVisual.styles = [styles];
__decorate([
    property()
], WuiTransactionVisual.prototype, "type", void 0);
__decorate([
    property()
], WuiTransactionVisual.prototype, "status", void 0);
__decorate([
    property()
], WuiTransactionVisual.prototype, "direction", void 0);
__decorate([
    property({ type: Boolean })
], WuiTransactionVisual.prototype, "onlyDirectionIcon", void 0);
__decorate([
    property({ type: Array })
], WuiTransactionVisual.prototype, "images", void 0);
__decorate([
    property({ type: Object })
], WuiTransactionVisual.prototype, "secondImage", void 0);
__decorate([
    state()
], WuiTransactionVisual.prototype, "failedImageUrls", void 0);
WuiTransactionVisual = __decorate([
    customElement('wui-transaction-visual')
], WuiTransactionVisual);
export { WuiTransactionVisual };
//# sourceMappingURL=index.js.map