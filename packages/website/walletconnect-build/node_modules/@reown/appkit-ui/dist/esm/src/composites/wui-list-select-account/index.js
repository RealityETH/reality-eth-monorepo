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
import { UiHelperUtil } from '../../utils/UiHelperUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-avatar/index.js';
import styles from './styles.js';
let WuiListSelectAccount = class WuiListSelectAccount extends LitElement {
    constructor() {
        super(...arguments);
        this.address = '';
        this.description = 'Email';
        this.icon = 'mail';
        this.currency = 'USD';
        this.amount = 0;
        this.disabled = false;
    }
    render() {
        return html `
      <button ?disabled=${this.disabled}>
        <wui-avatar size="sm" address=${this.address}></wui-avatar>
        <wui-icon class="avatarIcon" size="xs" name=${this.icon}></wui-icon>

        <wui-flex
          flexDirection="column"
          alignItems="flex-start"
          justifyContent="center"
          flexGrow="1"
          flexShrink="0"
          rowGap="2"
          class="description"
        >
          <wui-text color="primary" variant="lg-regular">
            ${UiHelperUtil.getTruncateString({
            string: this.address,
            charsStart: 4,
            charsEnd: 4,
            truncate: 'middle'
        })}
          </wui-text>

          <wui-text color="secondary" variant="md-regular" lineClamp="1">
            ${this.description}
          </wui-text>
        </wui-flex>

        <wui-flex
          flexGrow="1"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          columnGap="2"
        >
          <wui-text color="secondary" variant="lg-regular-mono" lineClamp="1">
            ${UiHelperUtil.formatCurrency(this.amount, { currency: this.currency })}
          </wui-text>
          <wui-icon name="chevronRight" size="md"></wui-icon>
        </wui-flex>
      </button>
    `;
    }
};
WuiListSelectAccount.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiListSelectAccount.prototype, "address", void 0);
__decorate([
    property()
], WuiListSelectAccount.prototype, "description", void 0);
__decorate([
    property()
], WuiListSelectAccount.prototype, "icon", void 0);
__decorate([
    property()
], WuiListSelectAccount.prototype, "currency", void 0);
__decorate([
    property({ type: Number })
], WuiListSelectAccount.prototype, "amount", void 0);
__decorate([
    property({ type: Boolean })
], WuiListSelectAccount.prototype, "disabled", void 0);
WuiListSelectAccount = __decorate([
    customElement('wui-list-select-account')
], WuiListSelectAccount);
export { WuiListSelectAccount };
//# sourceMappingURL=index.js.map