var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../../components/wui-icon/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiIconBox = class WuiIconBox extends LitElement {
    constructor() {
        super(...arguments);
        this.icon = 'copy';
        this.size = 'md';
        this.padding = '1';
        this.color = 'default';
    }
    render() {
        this.dataset['padding'] = this.padding;
        this.dataset['color'] = this.color;
        return html `
      <wui-icon size=${ifDefined(this.size)} name=${this.icon} color="inherit"></wui-icon>
    `;
    }
};
WuiIconBox.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiIconBox.prototype, "icon", void 0);
__decorate([
    property()
], WuiIconBox.prototype, "size", void 0);
__decorate([
    property()
], WuiIconBox.prototype, "padding", void 0);
__decorate([
    property()
], WuiIconBox.prototype, "color", void 0);
WuiIconBox = __decorate([
    customElement('wui-icon-box')
], WuiIconBox);
export { WuiIconBox };
//# sourceMappingURL=index.js.map