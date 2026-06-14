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
import '../../layout/wui-flex/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-avatar/index.js';
import styles from './styles.js';
let WuiPreviewItem = class WuiPreviewItem extends LitElement {
    constructor() {
        super(...arguments);
        this.text = '';
    }
    render() {
        return html `<wui-text variant="lg-regular" color="primary">${this.text}</wui-text>
      ${this.imageTemplate()}`;
    }
    imageTemplate() {
        if (this.address) {
            return html `<wui-avatar address=${this.address} .imageSrc=${this.imageSrc}></wui-avatar>`;
        }
        else if (this.imageSrc) {
            return html `<wui-image src=${this.imageSrc}></wui-image>`;
        }
        return html `<wui-icon size="lg" color="inverse" name="networkPlaceholder"></wui-icon>`;
    }
};
WuiPreviewItem.styles = [resetStyles, elementStyles, styles];
__decorate([
    property({ type: String })
], WuiPreviewItem.prototype, "text", void 0);
__decorate([
    property({ type: String })
], WuiPreviewItem.prototype, "address", void 0);
__decorate([
    property({ type: String })
], WuiPreviewItem.prototype, "imageSrc", void 0);
WuiPreviewItem = __decorate([
    customElement('wui-preview-item')
], WuiPreviewItem);
export { WuiPreviewItem };
//# sourceMappingURL=index.js.map