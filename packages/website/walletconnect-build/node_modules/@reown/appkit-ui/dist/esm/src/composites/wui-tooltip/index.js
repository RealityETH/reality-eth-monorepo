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
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
const TEXT_SIZE = {
    sm: 'sm-regular',
    md: 'md-regular'
};
let WuiTooltip = class WuiTooltip extends LitElement {
    constructor() {
        super(...arguments);
        this.placement = 'top';
        this.variant = 'fill';
        this.size = 'md';
        this.message = '';
    }
    render() {
        this.dataset['variant'] = this.variant;
        this.dataset['size'] = this.size;
        return html `<wui-icon data-placement=${this.placement} size="inherit" name="cursor"></wui-icon>
      <wui-text variant=${TEXT_SIZE[this.size]}>${this.message}</wui-text>`;
    }
};
WuiTooltip.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiTooltip.prototype, "placement", void 0);
__decorate([
    property()
], WuiTooltip.prototype, "variant", void 0);
__decorate([
    property()
], WuiTooltip.prototype, "size", void 0);
__decorate([
    property()
], WuiTooltip.prototype, "message", void 0);
WuiTooltip = __decorate([
    customElement('wui-tooltip')
], WuiTooltip);
export { WuiTooltip };
//# sourceMappingURL=index.js.map