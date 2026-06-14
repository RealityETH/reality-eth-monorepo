var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import '../../components/wui-shimmer/index.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import { resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-transaction-thumbnail/index.js';
import styles from './styles.js';
let WuiTransactionListItemLoader = class WuiTransactionListItemLoader extends LitElement {
    render() {
        return html `
      <wui-flex alignItems="center" .padding=${['1', '2', '1', '2']}>
        <wui-shimmer width="40px" height="40px" rounded></wui-shimmer>
        <wui-flex flexDirection="column" gap="1">
          <wui-shimmer width="124px" height="16px" rounded></wui-shimmer>
          <wui-shimmer width="60px" height="14px" rounded></wui-shimmer>
        </wui-flex>
        <wui-shimmer width="24px" height="12px" rounded></wui-shimmer>
      </wui-flex>
    `;
    }
};
WuiTransactionListItemLoader.styles = [resetStyles, styles];
WuiTransactionListItemLoader = __decorate([
    customElement('wui-transaction-list-item-loader')
], WuiTransactionListItemLoader);
export { WuiTransactionListItemLoader };
//# sourceMappingURL=index.js.map