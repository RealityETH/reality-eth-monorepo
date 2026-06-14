var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ApiController, ConnectorController, OptionsController, WalletUtil } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-card-select-loader';
import '@reown/appkit-ui/wui-grid';
import '../w3m-all-wallets-list-item/index.js';
import styles from './styles.js';
const PAGINATOR_ID = 'local-paginator';
let W3mAllWalletsList = class W3mAllWalletsList extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.paginationObserver = undefined;
        this.loading = !ApiController.state.wallets.length;
        this.wallets = ApiController.state.wallets;
        this.mobileFullScreen = OptionsController.state.enableMobileFullScreen;
        this.unsubscribe.push(...[ApiController.subscribeKey('wallets', val => (this.wallets = val))]);
    }
    firstUpdated() {
        this.initialFetch();
        this.createPaginationObserver();
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
        this.paginationObserver?.disconnect();
    }
    render() {
        if (this.mobileFullScreen) {
            this.setAttribute('data-mobile-fullscreen', 'true');
        }
        return html `
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${['0', '3', '3', '3']}
        gap="2"
        justifyContent="space-between"
      >
        ${this.loading ? this.shimmerTemplate(16) : this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `;
    }
    async initialFetch() {
        this.loading = true;
        const gridEl = this.shadowRoot?.querySelector('wui-grid');
        if (gridEl) {
            await ApiController.fetchWalletsByPage({ page: 1 });
            await gridEl.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 200,
                fill: 'forwards',
                easing: 'ease'
            }).finished;
            this.loading = false;
            gridEl.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 200,
                fill: 'forwards',
                easing: 'ease'
            });
        }
    }
    shimmerTemplate(items, id) {
        return [...Array(items)].map(() => html `
        <wui-card-select-loader type="wallet" id=${ifDefined(id)}></wui-card-select-loader>
      `);
    }
    walletsTemplate() {
        return WalletUtil.getWalletConnectWallets(this.wallets).map((wallet, index) => html `
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${wallet.id}"
          @click=${() => this.onConnectWallet(wallet)}
          .wallet=${wallet}
          explorerId=${wallet.id}
          certified=${this.badge === 'certified'}
          displayIndex=${index}
        ></w3m-all-wallets-list-item>
      `);
    }
    paginationLoaderTemplate() {
        const { wallets, recommended, featured, count, mobileFilteredOutWalletsLength } = ApiController.state;
        const columns = window.innerWidth < 352 ? 3 : 4;
        const currentWallets = wallets.length + recommended.length;
        const minimumRows = Math.ceil(currentWallets / columns);
        let shimmerCount = minimumRows * columns - currentWallets + columns;
        shimmerCount -= wallets.length ? featured.length % columns : 0;
        if (count === 0 && featured.length > 0) {
            return null;
        }
        if (count === 0 ||
            [...featured, ...wallets, ...recommended].length <
                count - (mobileFilteredOutWalletsLength ?? 0)) {
            return this.shimmerTemplate(shimmerCount, PAGINATOR_ID);
        }
        return null;
    }
    createPaginationObserver() {
        const loaderEl = this.shadowRoot?.querySelector(`#${PAGINATOR_ID}`);
        if (loaderEl) {
            this.paginationObserver = new IntersectionObserver(([element]) => {
                if (element?.isIntersecting && !this.loading) {
                    const { page, count, wallets } = ApiController.state;
                    if (wallets.length < count) {
                        ApiController.fetchWalletsByPage({ page: page + 1 });
                    }
                }
            });
            this.paginationObserver.observe(loaderEl);
        }
    }
    onConnectWallet(wallet) {
        ConnectorController.selectWalletConnector(wallet);
    }
};
W3mAllWalletsList.styles = styles;
__decorate([
    state()
], W3mAllWalletsList.prototype, "loading", void 0);
__decorate([
    state()
], W3mAllWalletsList.prototype, "wallets", void 0);
__decorate([
    state()
], W3mAllWalletsList.prototype, "badge", void 0);
__decorate([
    state()
], W3mAllWalletsList.prototype, "mobileFullScreen", void 0);
W3mAllWalletsList = __decorate([
    customElement('w3m-all-wallets-list')
], W3mAllWalletsList);
export { W3mAllWalletsList };
//# sourceMappingURL=index.js.map