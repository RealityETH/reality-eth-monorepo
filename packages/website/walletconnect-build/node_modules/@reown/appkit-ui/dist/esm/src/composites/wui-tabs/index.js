var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-tab-item/index.js';
import styles from './styles.js';
let WuiTabs = class WuiTabs extends LitElement {
    constructor() {
        super(...arguments);
        this.tabs = [];
        this.onTabChange = () => null;
        this.size = 'md';
        this.activeTab = 0;
    }
    render() {
        this.dataset['size'] = this.size;
        return this.tabs.map((tab, index) => {
            const isActive = index === this.activeTab;
            return html `
        <wui-tab-item
          @click=${() => this.onTabClick(index)}
          icon=${tab.icon}
          size=${this.size}
          label=${tab.label}
          ?active=${isActive}
          data-active=${isActive}
          data-testid="tab-${tab.label?.toLowerCase()}"
        ></wui-tab-item>
      `;
        });
    }
    onTabClick(index) {
        this.activeTab = index;
        this.onTabChange(index);
    }
};
WuiTabs.styles = [resetStyles, elementStyles, styles];
__decorate([
    property({ type: Array })
], WuiTabs.prototype, "tabs", void 0);
__decorate([
    property()
], WuiTabs.prototype, "onTabChange", void 0);
__decorate([
    property()
], WuiTabs.prototype, "size", void 0);
__decorate([
    state()
], WuiTabs.prototype, "activeTab", void 0);
WuiTabs = __decorate([
    customElement('wui-tabs')
], WuiTabs);
export { WuiTabs };
//# sourceMappingURL=index.js.map