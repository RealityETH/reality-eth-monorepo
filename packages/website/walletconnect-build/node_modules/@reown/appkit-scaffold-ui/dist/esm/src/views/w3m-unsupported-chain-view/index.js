var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { AssetController, AssetUtil, ChainController, ConnectionController, ConnectorController, ConstantsUtil, CoreHelperUtil, EventsController, OptionsController, RouterController, SnackController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-list-network';
import '@reown/appkit-ui/wui-separator';
import '@reown/appkit-ui/wui-text';
import styles from './styles.js';
let W3mUnsupportedChainView = class W3mUnsupportedChainView extends LitElement {
    constructor() {
        super();
        this.swapUnsupportedChain = RouterController.state.data?.swapUnsupportedChain;
        this.unsubscribe = [];
        this.disconnecting = false;
        this.remoteFeatures = OptionsController.state.remoteFeatures;
        this.unsubscribe.push(AssetController.subscribeNetworkImages(() => this.requestUpdate()), OptionsController.subscribeKey('remoteFeatures', val => {
            this.remoteFeatures = val;
        }));
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        return html `
      <wui-flex class="container" flexDirection="column" gap="0">
        <wui-flex
          class="container"
          flexDirection="column"
          .padding=${['3', '5', '2', '5']}
          alignItems="center"
          gap="5"
        >
          ${this.descriptionTemplate()}
        </wui-flex>

        <wui-flex flexDirection="column" padding="3" gap="2"> ${this.networksTemplate()} </wui-flex>

        <wui-separator text="or"></wui-separator>
        <wui-flex flexDirection="column" padding="3" gap="2">
          <wui-list-item
            variant="icon"
            iconVariant="overlay"
            icon="signOut"
            ?chevron=${false}
            .loading=${this.disconnecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="md-medium" color="secondary">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `;
    }
    descriptionTemplate() {
        if (this.swapUnsupportedChain) {
            return html `
        <wui-text variant="sm-regular" color="secondary" align="center">
          The swap feature doesn’t support your current network. Switch to an available option to
          continue.
        </wui-text>
      `;
        }
        return html `
      <wui-text variant="sm-regular" color="secondary" align="center">
        This app doesn’t support your current network. Switch to an available option to continue.
      </wui-text>
    `;
    }
    networksTemplate() {
        const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks();
        const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds();
        const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(approvedCaipNetworkIds, requestedCaipNetworks);
        const filteredNetworks = this.swapUnsupportedChain
            ? sortedNetworks.filter(network => ConstantsUtil.SWAP_SUPPORTED_NETWORKS.includes(network.caipNetworkId))
            : sortedNetworks;
        return filteredNetworks.map(network => html `
        <wui-list-network
          imageSrc=${ifDefined(AssetUtil.getNetworkImage(network))}
          name=${network.name ?? 'Unknown'}
          @click=${() => this.onSwitchNetwork(network)}
        >
        </wui-list-network>
      `);
    }
    async onDisconnect() {
        try {
            this.disconnecting = true;
            const namespace = ChainController.state.activeChain;
            const connectionsByNamespace = ConnectionController.getConnections(namespace);
            const hasConnections = connectionsByNamespace.length > 0;
            const connectorId = namespace && ConnectorController.state.activeConnectorIds[namespace];
            const isMultiWalletEnabled = this.remoteFeatures?.multiWallet;
            await ConnectionController.disconnect(isMultiWalletEnabled ? { id: connectorId, namespace } : {});
            if (hasConnections && isMultiWalletEnabled) {
                RouterController.push('ProfileWallets');
                SnackController.showSuccess('Wallet deleted');
            }
        }
        catch {
            EventsController.sendEvent({
                type: 'track',
                event: 'DISCONNECT_ERROR',
                properties: { message: 'Failed to disconnect' }
            });
            SnackController.showError('Failed to disconnect');
        }
        finally {
            this.disconnecting = false;
        }
    }
    async onSwitchNetwork(network) {
        const caipAddress = ChainController.getActiveCaipAddress();
        const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds();
        const shouldSupportAllNetworks = ChainController.getNetworkProp('supportsAllNetworks', network.chainNamespace);
        const routerData = RouterController.state.data;
        if (caipAddress) {
            if (approvedCaipNetworkIds?.includes(network.caipNetworkId)) {
                await ChainController.switchActiveNetwork(network);
            }
            else if (shouldSupportAllNetworks) {
                RouterController.push('SwitchNetwork', { ...routerData, network });
            }
            else {
                RouterController.push('SwitchNetwork', { ...routerData, network });
            }
        }
        else if (!caipAddress) {
            ChainController.setActiveCaipNetwork(network);
            RouterController.push('Connect');
        }
    }
};
W3mUnsupportedChainView.styles = styles;
__decorate([
    state()
], W3mUnsupportedChainView.prototype, "disconnecting", void 0);
__decorate([
    state()
], W3mUnsupportedChainView.prototype, "remoteFeatures", void 0);
W3mUnsupportedChainView = __decorate([
    customElement('w3m-unsupported-chain-view')
], W3mUnsupportedChainView);
export { W3mUnsupportedChainView };
//# sourceMappingURL=index.js.map