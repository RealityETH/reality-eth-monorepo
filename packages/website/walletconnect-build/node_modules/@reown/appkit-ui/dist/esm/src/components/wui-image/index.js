var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiImage = class WuiImage extends LitElement {
    constructor() {
        super(...arguments);
        this.src = './path/to/image.jpg';
        this.alt = 'Image';
        this.size = undefined;
        this.boxed = false;
        this.rounded = false;
        this.fullSize = false;
    }
    render() {
        const getSize = {
            inherit: 'inherit',
            xxs: '2',
            xs: '3',
            sm: '4',
            md: '4',
            mdl: '5',
            lg: '5',
            xl: '6',
            xxl: '7',
            '3xl': '8',
            '4xl': '9',
            '5xl': '10'
        };
        this.style.cssText = `
      --local-width: ${this.size ? `var(--apkt-spacing-${getSize[this.size]});` : '100%'};
      --local-height: ${this.size ? `var(--apkt-spacing-${getSize[this.size]});` : '100%'};
      `;
        this.dataset['boxed'] = this.boxed ? 'true' : 'false';
        this.dataset['rounded'] = this.rounded ? 'true' : 'false';
        this.dataset['full'] = this.fullSize ? 'true' : 'false';
        this.dataset['icon'] = this.iconColor || 'inherit';
        if (this.icon) {
            return html `<wui-icon
        color=${this.iconColor || 'inherit'}
        name=${this.icon}
        size="lg"
      ></wui-icon> `;
        }
        if (this.logo) {
            return html `<wui-icon size="lg" color="inherit" name=${this.logo}></wui-icon> `;
        }
        return html `<img src=${ifDefined(this.src)} alt=${this.alt} @error=${this.handleImageError} />`;
    }
    handleImageError() {
        this.dispatchEvent(new CustomEvent('onLoadError', { bubbles: true, composed: true }));
    }
};
WuiImage.styles = [resetStyles, styles];
__decorate([
    property()
], WuiImage.prototype, "src", void 0);
__decorate([
    property()
], WuiImage.prototype, "logo", void 0);
__decorate([
    property()
], WuiImage.prototype, "icon", void 0);
__decorate([
    property()
], WuiImage.prototype, "iconColor", void 0);
__decorate([
    property()
], WuiImage.prototype, "alt", void 0);
__decorate([
    property()
], WuiImage.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], WuiImage.prototype, "boxed", void 0);
__decorate([
    property({ type: Boolean })
], WuiImage.prototype, "rounded", void 0);
__decorate([
    property({ type: Boolean })
], WuiImage.prototype, "fullSize", void 0);
WuiImage = __decorate([
    customElement('wui-image')
], WuiImage);
export { WuiImage };
//# sourceMappingURL=index.js.map