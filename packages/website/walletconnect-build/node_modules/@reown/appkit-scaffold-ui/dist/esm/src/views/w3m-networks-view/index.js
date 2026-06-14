var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {} from '@reown/appkit-common';
import { AssetController, AssetUtil, ChainController, CoreHelperUtil, NetworkUtil } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-input-text';
import '@reown/appkit-ui/wui-link';
import '@reown/appkit-ui/wui-list-network';
import '@reown/appkit-ui/wui-text';
import styles from './styles.js';
let W3mNetworksView = class W3mNetworksView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.network = ChainController.state.activeCaipNetwork;
        this.requestedCaipNetworks = ChainController.getCaipNetworks();
        this.search = '';
        this.onDebouncedSearch = CoreHelperUtil.debounce((value) => {
            this.search = value;
        }, 100);
        this.unsubscribe.push(AssetController.subscribeNetworkImages(() => this.requestUpdate()), ChainController.subscribeKey('activeCaipNetwork', val => (this.network = val)), ChainController.subscribe(() => {
            this.requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks();
        }));
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        return html `
      ${this.templateSearchInput()}
      <wui-flex
        class="container"
        .padding=${['0', '3', '3', '3']}
        flexDirection="column"
        gap="2"
      >
        ${this.networksTemplate()}
      </wui-flex>
    `;
    }
    templateSearchInput() {
        return html `
      <wui-flex gap="2" .padding=${['0', '3', '3', '3']}>
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="md"
          placeholder="Search network"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `;
    }
    onInputChange(event) {
        this.onDebouncedSearch(event.detail);
    }
    networksTemplate() {
        const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds();
        const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(approvedCaipNetworkIds, this.requestedCaipNetworks);
        if (this.search) {
            this.filteredNetworks = sortedNetworks?.filter(network => network?.name?.toLowerCase().includes(this.search.toLowerCase()));
        }
        else {
            this.filteredNetworks = sortedNetworks;
        }
        return this.filteredNetworks?.map(network => html `
        <wui-list-network
          .selected=${this.network?.id === network.id}
          imageSrc=${ifDefined(AssetUtil.getNetworkImage(network))}
          type="network"
          name=${network.name ?? network.id}
          @click=${() => this.onSwitchNetwork(network)}
          .disabled=${ChainController.isCaipNetworkDisabled(network)}
          data-testid=${`w3m-network-switch-${network.name ?? network.id}`}
        ></wui-list-network>
      `);
    }
    onSwitchNetwork(network) {
        NetworkUtil.onSwitchNetwork({ network });
    }
};
W3mNetworksView.styles = styles;
__decorate([
    state()
], W3mNetworksView.prototype, "network", void 0);
__decorate([
    state()
], W3mNetworksView.prototype, "requestedCaipNetworks", void 0);
__decorate([
    state()
], W3mNetworksView.prototype, "filteredNetworks", void 0);
__decorate([
    state()
], W3mNetworksView.prototype, "search", void 0);
W3mNetworksView = __decorate([
    customElement('w3m-networks-view')
], W3mNetworksView);
export { W3mNetworksView };
//# sourceMappingURL=index.js.map