var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { CoreHelperUtil, ExchangeController, RouterController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-icon-box';
import '@reown/appkit-ui/wui-input-text';
import '@reown/appkit-ui/wui-link';
import '@reown/appkit-ui/wui-list-token';
import '@reown/appkit-ui/wui-separator';
import '@reown/appkit-ui/wui-text';
import styles from './styles.js';
let W3mDepositFromExchangeSelectAssetView = class W3mDepositFromExchangeSelectAssetView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.assets = ExchangeController.state.assets;
        this.search = '';
        this.onDebouncedSearch = CoreHelperUtil.debounce((value) => {
            this.search = value;
        });
        this.unsubscribe.push(...[
            ExchangeController.subscribe(val => {
                this.assets = val.assets;
            })
        ]);
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        return html `
      <wui-flex flexDirection="column">
        ${this.templateSearchInput()} <wui-separator></wui-separator> ${this.templateTokens()}
      </wui-flex>
    `;
    }
    templateSearchInput() {
        return html `
      <wui-flex gap="2" padding="3">
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `;
    }
    templateTokens() {
        const filteredAssets = this.assets.filter(asset => asset.metadata.name.toLowerCase().includes(this.search.toLowerCase()));
        const hasAssets = filteredAssets.length > 0;
        return html `
      <wui-flex
        class="contentContainer"
        flexDirection="column"
        .padding=${['0', '3', '0', '3']}
      >
        <wui-flex justifyContent="flex-start" .padding=${['4', '3', '3', '3']}>
          <wui-text variant="md-medium" color="secondary">Available tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="2">
          ${hasAssets
            ? filteredAssets.map(asset => html `<wui-list-item
                    .imageSrc=${asset.metadata.iconUrl}
                    ?clickable=${true}
                    @click=${this.handleTokenClick.bind(this, asset)}
                  >
                    <wui-text variant="md-medium" color="primary">${asset.metadata.name}</wui-text>
                    <wui-text variant="md-regular" color="secondary"
                      >${asset.metadata.symbol}</wui-text
                    >
                  </wui-list-item>`)
            : html `<wui-flex
                .padding=${['20', '0', '0', '0']}
                alignItems="center"
                flexDirection="column"
                gap="4"
              >
                <wui-icon-box icon="coinPlaceholder" color="default" size="lg"></wui-icon-box>
                <wui-flex
                  class="textContent"
                  gap="2"
                  flexDirection="column"
                  justifyContent="center"
                >
                  <wui-text variant="lg-medium" align="center" color="primary">
                    No tokens found
                  </wui-text>
                </wui-flex>
                <wui-link @click=${this.onBuyClick.bind(this)}>Buy</wui-link>
              </wui-flex>`}
        </wui-flex>
      </wui-flex>
    `;
    }
    onBuyClick() {
        RouterController.push('OnRampProviders');
    }
    onInputChange(event) {
        this.onDebouncedSearch(event.detail);
    }
    handleTokenClick(asset) {
        ExchangeController.setPaymentAsset(asset);
        RouterController.goBack();
    }
};
W3mDepositFromExchangeSelectAssetView.styles = styles;
__decorate([
    state()
], W3mDepositFromExchangeSelectAssetView.prototype, "assets", void 0);
__decorate([
    state()
], W3mDepositFromExchangeSelectAssetView.prototype, "search", void 0);
W3mDepositFromExchangeSelectAssetView = __decorate([
    customElement('w3m-deposit-from-exchange-select-asset-view')
], W3mDepositFromExchangeSelectAssetView);
export { W3mDepositFromExchangeSelectAssetView };
//# sourceMappingURL=index.js.map