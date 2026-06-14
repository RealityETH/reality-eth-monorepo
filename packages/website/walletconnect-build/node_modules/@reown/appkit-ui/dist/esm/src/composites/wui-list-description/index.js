var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-icon-box/index.js';
import '../wui-tag/index.js';
import styles from './styles.js';
let WuiListDescription = class WuiListDescription extends LitElement {
    constructor() {
        super(...arguments);
        this.icon = 'card';
        this.text = '';
        this.description = '';
        this.tag = undefined;
        this.disabled = false;
    }
    render() {
        return html `
      <button ?disabled=${this.disabled}>
        <wui-flex alignItems="center" gap="3">
          <wui-icon-box padding="2" color="secondary" icon=${this.icon} size="lg"></wui-icon-box>
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.text}</wui-text>
            ${this.description
            ? html `<wui-text variant="md-regular" color="secondary">
                  ${this.description}</wui-text
                >`
            : null}
          </wui-flex>
        </wui-flex>

        <wui-flex class="tag-container" alignItems="center" gap="1" justifyContent="flex-end">
          ${this.tag ? html `<wui-tag tagType="main" size="sm">${this.tag}</wui-tag>` : null}
          <wui-icon size="md" name="chevronRight" color="default"></wui-icon>
        </wui-flex>
      </button>
    `;
    }
};
WuiListDescription.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiListDescription.prototype, "icon", void 0);
__decorate([
    property()
], WuiListDescription.prototype, "text", void 0);
__decorate([
    property()
], WuiListDescription.prototype, "description", void 0);
__decorate([
    property()
], WuiListDescription.prototype, "tag", void 0);
__decorate([
    property({ type: Boolean })
], WuiListDescription.prototype, "disabled", void 0);
WuiListDescription = __decorate([
    customElement('wui-list-description')
], WuiListDescription);
export { WuiListDescription };
//# sourceMappingURL=index.js.map