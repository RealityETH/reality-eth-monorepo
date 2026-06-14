var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ConstantsUtil } from '@reown/appkit-common';
import { BlockchainApiController, ChainController, ConnectorController, StorageUtil } from '@reown/appkit-controllers';
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils';
import '../../components/wui-image/index.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import '../../composites/wui-icon-box/index.js';
import '../../layout/wui-flex/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { UiHelperUtil } from '../../utils/UiHelperUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-avatar/index.js';
import styles from './styles.js';
let WuiListAccount = class WuiListAccount extends LitElement {
    constructor() {
        super(...arguments);
        this.accountAddress = '';
        this.accountType = '';
        this.labels = ChainController.getAccountData()?.addressLabels;
        this.caipNetwork = ChainController.state.activeCaipNetwork;
        this.socialProvider = StorageUtil.getConnectedSocialProvider();
        this.balance = 0;
        this.fetchingBalance = true;
        this.shouldShowIcon = false;
        this.selected = false;
    }
    connectedCallback() {
        super.connectedCallback();
        BlockchainApiController.getBalance(this.accountAddress, this.caipNetwork?.caipNetworkId)
            .then(response => {
            let total = this.balance;
            if (response.balances.length > 0) {
                total = response.balances.reduce((acc, balance) => acc + (balance?.value || 0), 0);
            }
            this.balance = total;
            this.fetchingBalance = false;
            this.requestUpdate();
        })
            .catch(() => {
            this.fetchingBalance = false;
            this.requestUpdate();
        });
    }
    render() {
        const label = this.getLabel();
        const connectorId = ConnectorController.getConnectorId(ChainController.state.activeChain);
        this.shouldShowIcon = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH;
        return html `
      <wui-flex
        flexDirection="row"
        justifyContent="space-between"
        .padding=${['0', '0', '3', '2']}
      >
        <wui-flex gap="l" alignItems="center">
          <wui-avatar address=${this.accountAddress}></wui-avatar>
          ${this.shouldShowIcon
            ? html `<wui-icon-box
                size="sm"
                color="default"
                icon=${this.accountType === W3mFrameRpcConstants.ACCOUNT_TYPES.EOA
                ? (this.socialProvider ?? 'mail')
                : 'lightbulb'}
              ></wui-icon-box>`
            : html `<wui-flex .padding="${['0', '0', '0', '2']}"></wui-flex>`}
          <wui-flex flexDirection="column">
            <wui-text class="address" variant="md-medium" color="primary"
              >${UiHelperUtil.getTruncateString({
            string: this.accountAddress,
            charsStart: 4,
            charsEnd: 6,
            truncate: 'middle'
        })}</wui-text
            >
            <wui-text class="address-description" variant="sm-regular">${label}</wui-text></wui-flex
          >
        </wui-flex>
        <wui-flex gap="3" alignItems="center">
          <slot name="action"></slot>
          ${this.fetchingBalance
            ? html `<wui-loading-spinner size="sm" color="accent-100"></wui-loading-spinner>`
            : html ` <wui-text variant="sm-regular">$${this.balance.toFixed(2)}</wui-text>`}
        </wui-flex>
      </wui-flex>
    `;
    }
    getLabel() {
        let label = this.labels?.get(this.accountAddress);
        const connectorId = ConnectorController.getConnectorId(ChainController.state.activeChain);
        if (!label && connectorId === ConstantsUtil.CONNECTOR_ID.AUTH) {
            label = `${this.accountType === 'eoa' ? (this.socialProvider ?? 'Email') : 'Smart'} Account`;
        }
        else if (!label) {
            label = 'EOA';
        }
        return label;
    }
};
WuiListAccount.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiListAccount.prototype, "accountAddress", void 0);
__decorate([
    property()
], WuiListAccount.prototype, "accountType", void 0);
__decorate([
    property({ type: Boolean })
], WuiListAccount.prototype, "selected", void 0);
__decorate([
    property({ type: Function })
], WuiListAccount.prototype, "onSelect", void 0);
WuiListAccount = __decorate([
    customElement('wui-list-account')
], WuiListAccount);
export { WuiListAccount };
//# sourceMappingURL=index.js.map