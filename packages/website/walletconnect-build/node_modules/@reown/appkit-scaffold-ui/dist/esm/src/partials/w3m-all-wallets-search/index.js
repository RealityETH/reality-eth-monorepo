var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ApiController, ConnectorController, OptionsController, WalletUtil } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-grid';
import '@reown/appkit-ui/wui-icon-box';
import '@reown/appkit-ui/wui-loading-spinner';
import '@reown/appkit-ui/wui-text';
import '../w3m-all-wallets-list-item/index.js';
import styles from './styles.js';
let W3mAllWalletsSearch = class W3mAllWalletsSearch extends LitElement {
    constructor() {
        super(...arguments);
        this.prevQuery = '';
        this.prevBadge = undefined;
        this.loading = true;
        this.mobileFullScreen = OptionsController.state.enableMobileFullScreen;
        this.query = '';
    }
    render() {
        if (this.mobileFullScreen) {
            this.setAttribute('data-mobile-fullscreen', 'true');
        }
        this.onSearch();
        return this.loading
            ? html `<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`
            : this.walletsTemplate();
    }
    async onSearch() {
        if (this.query.trim() !== this.prevQuery.trim() || this.badge !== this.prevBadge) {
            this.prevQuery = this.query;
            this.prevBadge = this.badge;
            this.loading = true;
            await ApiController.searchWallet({ search: this.query, badge: this.badge });
            this.loading = false;
        }
    }
    walletsTemplate() {
        const { search } = ApiController.state;
        const markedInstalledWallets = WalletUtil.markWalletsAsInstalled(search);
        const walletsByWcSupport = WalletUtil.filterWalletsByWcSupport(markedInstalledWallets);
        if (!walletsByWcSupport.length) {
            return html `
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="3"
          flexDirection="column"
        >
          <wui-icon-box size="lg" color="default" icon="wallet"></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="secondary" variant="md-medium">
            No Wallet found
          </wui-text>
        </wui-flex>
      `;
        }
        return html `
      <wui-grid
        data-testid="wallet-list"
        .padding=${['0', '3', '3', '3']}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${walletsByWcSupport.map((wallet, index) => html `
            <w3m-all-wallets-list-item
              @click=${() => this.onConnectWallet(wallet)}
              .wallet=${wallet}
              data-testid="wallet-search-item-${wallet.id}"
              explorerId=${wallet.id}
              certified=${this.badge === 'certified'}
              walletQuery=${this.query}
              displayIndex=${index}
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `;
    }
    onConnectWallet(wallet) {
        ConnectorController.selectWalletConnector(wallet);
    }
};
W3mAllWalletsSearch.styles = styles;
__decorate([
    state()
], W3mAllWalletsSearch.prototype, "loading", void 0);
__decorate([
    state()
], W3mAllWalletsSearch.prototype, "mobileFullScreen", void 0);
__decorate([
    property()
], W3mAllWalletsSearch.prototype, "query", void 0);
__decorate([
    property()
], W3mAllWalletsSearch.prototype, "badge", void 0);
W3mAllWalletsSearch = __decorate([
    customElement('w3m-all-wallets-search')
], W3mAllWalletsSearch);
export { W3mAllWalletsSearch };
//# sourceMappingURL=index.js.map