var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-text/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-icon-box/index.js';
import styles from './styles.js';
let WuiBanner = class WuiBanner extends LitElement {
    constructor() {
        super(...arguments);
        this.icon = 'externalLink';
        this.text = '';
        this.type = 'info';
    }
    render() {
        return html `
      <wui-flex alignItems="center" data-type=${this.type}>
        <wui-icon-box size="sm" color="inherit" icon=${this.icon}></wui-icon-box>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
      </wui-flex>
    `;
    }
};
WuiBanner.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiBanner.prototype, "icon", void 0);
__decorate([
    property()
], WuiBanner.prototype, "text", void 0);
__decorate([
    property()
], WuiBanner.prototype, "type", void 0);
WuiBanner = __decorate([
    customElement('wui-banner')
], WuiBanner);
export { WuiBanner };
//# sourceMappingURL=index.js.map