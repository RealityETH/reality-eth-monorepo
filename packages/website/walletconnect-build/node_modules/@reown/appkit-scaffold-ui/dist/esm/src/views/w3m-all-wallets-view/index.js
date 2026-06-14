var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { CoreHelperUtil, RouterController, SnackController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-certified-switch';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon-box';
import '@reown/appkit-ui/wui-search-bar';
import '../../partials/w3m-all-wallets-list/index.js';
import '../../partials/w3m-all-wallets-search/index.js';
let W3mAllWalletsView = class W3mAllWalletsView extends LitElement {
    constructor() {
        super(...arguments);
        this.search = '';
        this.badge = undefined;
        this.onDebouncedSearch = CoreHelperUtil.debounce((value) => {
            this.search = value;
        });
    }
    render() {
        const isSearch = this.search.length >= 2;
        return html `
      <wui-flex .padding=${['1', '3', '3', '3']} gap="2" alignItems="center">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${this.badge === 'certified'}
          @certifiedSwitchChange=${this.onCertifiedSwitchChange.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${isSearch || this.badge
            ? html `<w3m-all-wallets-search
            query=${this.search}
            .badge=${this.badge}
          ></w3m-all-wallets-search>`
            : html `<w3m-all-wallets-list .badge=${this.badge}></w3m-all-wallets-list>`}
    `;
    }
    onInputChange(event) {
        this.onDebouncedSearch(event.detail);
    }
    onCertifiedSwitchChange(event) {
        if (event.detail) {
            this.badge = 'certified';
            SnackController.showSvg('Only WalletConnect certified', {
                icon: 'walletConnectBrown',
                iconColor: 'accent-100'
            });
        }
        else {
            this.badge = undefined;
        }
    }
    qrButtonTemplate() {
        if (CoreHelperUtil.isMobile()) {
            return html `
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `;
        }
        return null;
    }
    onWalletConnectQr() {
        RouterController.push('ConnectingWalletConnect');
    }
};
__decorate([
    state()
], W3mAllWalletsView.prototype, "search", void 0);
__decorate([
    state()
], W3mAllWalletsView.prototype, "badge", void 0);
W3mAllWalletsView = __decorate([
    customElement('w3m-all-wallets-view')
], W3mAllWalletsView);
export { W3mAllWalletsView };
//# sourceMappingURL=index.js.map