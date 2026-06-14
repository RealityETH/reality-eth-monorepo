var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiDetailsGroupItem = class WuiDetailsGroupItem extends LitElement {
    constructor() {
        super(...arguments);
        this.name = '';
    }
    render() {
        return html `
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="secondary">${this.name}</wui-text>
        <wui-flex gap="2" alignItems="center">
          <slot></slot>
        </wui-flex>
      </wui-flex>
    `;
    }
};
WuiDetailsGroupItem.styles = [resetStyles, elementStyles, styles];
__decorate([
    property({ type: String })
], WuiDetailsGroupItem.prototype, "name", void 0);
WuiDetailsGroupItem = __decorate([
    customElement('wui-details-group-item')
], WuiDetailsGroupItem);
export { WuiDetailsGroupItem };
//# sourceMappingURL=index.js.map