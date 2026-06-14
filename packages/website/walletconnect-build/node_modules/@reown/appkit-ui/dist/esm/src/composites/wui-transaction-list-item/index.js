var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../../components/wui-text/index.js';
import { resetStyles } from '../../utils/ThemeUtil.js';
import { TransactionTypePastTense } from '../../utils/TypeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-transaction-visual/index.js';
import styles from './styles.js';
let WuiTransactionListItem = class WuiTransactionListItem extends LitElement {
    constructor() {
        super(...arguments);
        this.type = 'approve';
        this.onlyDirectionIcon = false;
        this.images = [];
    }
    render() {
        return html `
      <wui-flex>
        <wui-transaction-visual
          .status=${this.status}
          direction=${ifDefined(this.direction)}
          type=${this.type}
          .onlyDirectionIcon=${this.onlyDirectionIcon}
          .images=${this.images}
        ></wui-transaction-visual>
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="lg-medium" color="primary">
            ${TransactionTypePastTense[this.type] || this.type}
          </wui-text>
          <wui-flex class="description-container">
            ${this.templateDescription()} ${this.templateSecondDescription()}
          </wui-flex>
        </wui-flex>
        <wui-text variant="sm-medium" color="secondary"><span>${this.date}</span></wui-text>
      </wui-flex>
    `;
    }
    templateDescription() {
        const description = this.descriptions?.[0];
        return description
            ? html `
          <wui-text variant="md-regular" color="secondary">
            <span>${description}</span>
          </wui-text>
        `
            : null;
    }
    templateSecondDescription() {
        const description = this.descriptions?.[1];
        return description
            ? html `
          <wui-icon class="description-separator-icon" size="sm" name="arrowRight"></wui-icon>
          <wui-text variant="md-regular" color="secondary">
            <span>${description}</span>
          </wui-text>
        `
            : null;
    }
};
WuiTransactionListItem.styles = [resetStyles, styles];
__decorate([
    property()
], WuiTransactionListItem.prototype, "type", void 0);
__decorate([
    property({ type: Array })
], WuiTransactionListItem.prototype, "descriptions", void 0);
__decorate([
    property()
], WuiTransactionListItem.prototype, "date", void 0);
__decorate([
    property({ type: Boolean })
], WuiTransactionListItem.prototype, "onlyDirectionIcon", void 0);
__decorate([
    property()
], WuiTransactionListItem.prototype, "status", void 0);
__decorate([
    property()
], WuiTransactionListItem.prototype, "direction", void 0);
__decorate([
    property({ type: Array })
], WuiTransactionListItem.prototype, "images", void 0);
WuiTransactionListItem = __decorate([
    customElement('wui-transaction-list-item')
], WuiTransactionListItem);
export { WuiTransactionListItem };
//# sourceMappingURL=index.js.map