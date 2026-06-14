var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import { resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiTag = class WuiTag extends LitElement {
    constructor() {
        super(...arguments);
        this.variant = 'accent';
        this.size = 'md';
        this.icon = undefined;
    }
    render() {
        this.dataset['variant'] = this.variant;
        this.dataset['size'] = this.size;
        const textVariant = this.size === 'md' ? 'md-medium' : 'sm-medium';
        const iconSize = this.size === 'md' ? 'md' : 'sm';
        return html `
      ${this.icon ? html `<wui-icon size=${iconSize} name=${this.icon}></wui-icon>` : null}
      <wui-text
        display="inline"
        data-variant=${this.variant}
        variant=${textVariant}
        color="inherit"
      >
        <slot></slot>
      </wui-text>
    `;
    }
};
WuiTag.styles = [resetStyles, styles];
__decorate([
    property()
], WuiTag.prototype, "variant", void 0);
__decorate([
    property()
], WuiTag.prototype, "size", void 0);
__decorate([
    property()
], WuiTag.prototype, "icon", void 0);
WuiTag = __decorate([
    customElement('wui-tag')
], WuiTag);
export { WuiTag };
//# sourceMappingURL=index.js.map