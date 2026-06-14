var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common';
import { AssetController, ChainController, ConnectionController, ConnectorController, ConstantsUtil, CoreHelperUtil, EventsController, OptionsController, RouterController, SnackController } from '@reown/appkit-controllers';
import { UiHelperUtil, customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-avatar';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon-link';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-notice-card';
import '@reown/appkit-ui/wui-text';
import '../../partials/w3m-account-auth-button/index.js';
let W3mAccountSettingsView = class W3mAccountSettingsView extends LitElement {
    constructor() {
        super();
        this.usubscribe = [];
        this.networkImages = AssetController.state.networkImages;
        this.address = ChainController.getAccountData()?.address;
        this.profileImage = ChainController.getAccountData()?.profileImage;
        this.profileName = ChainController.getAccountData()?.profileName;
        this.network = ChainController.state.activeCaipNetwork;
        this.disconnecting = false;
        this.remoteFeatures = OptionsController.state.remoteFeatures;
        this.usubscribe.push(...[
            ChainController.subscribeChainProp('accountState', val => {
                if (val) {
                    this.address = val.address;
                    this.profileImage = val.profileImage;
                    this.profileName = val.profileName;
                }
            }),
            ChainController.subscribeKey('activeCaipNetwork', val => {
                if (val?.id) {
                    this.network = val;
                }
            }),
            OptionsController.subscribeKey('remoteFeatures', val => {
                this.remoteFeatures = val;
            })
        ]);
    }
    disconnectedCallback() {
        this.usubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        if (!this.address) {
            throw new Error('w3m-account-settings-view: No account provided');
        }
        const networkImage = this.networkImages[this.network?.assets?.imageId ?? ''];
        return html `
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding=${['0', '5', '3', '5']}
      >
        <wui-avatar
          alt=${this.address}
          address=${this.address}
          imageSrc=${ifDefined(this.profileImage)}
          size="lg"
        ></wui-avatar>
        <wui-flex flexDirection="column" alignItems="center">
          <wui-flex gap="1" alignItems="center" justifyContent="center">
            <wui-text variant="h5-medium" color="primary" data-testid="account-settings-address">
              ${UiHelperUtil.getTruncateString({
            string: this.address,
            charsStart: 4,
            charsEnd: 6,
            truncate: 'middle'
        })}
            </wui-text>
            <wui-icon-link
              size="md"
              icon="copy"
              iconColor="default"
              @click=${this.onCopyAddress}
            ></wui-icon-link>
          </wui-flex>
        </wui-flex>
      </wui-flex>
      <wui-flex flexDirection="column" gap="4">
        <wui-flex flexDirection="column" gap="2" .padding=${['6', '4', '3', '4']}>
          ${this.authCardTemplate()}
          <w3m-account-auth-button></w3m-account-auth-button>
          <wui-list-item
            imageSrc=${ifDefined(networkImage)}
            ?chevron=${this.isAllowedNetworkSwitch()}
            ?fullSize=${true}
            ?rounded=${true}
            @click=${this.onNetworks.bind(this)}
            data-testid="account-switch-network-button"
          >
            <wui-text variant="lg-regular" color="primary">
              ${this.network?.name ?? 'Unknown'}
            </wui-text>
          </wui-list-item>
          ${this.smartAccountSettingsTemplate()} ${this.chooseNameButtonTemplate()}
          <wui-list-item
            ?rounded=${true}
            icon="power"
            iconColor="error"
            ?chevron=${false}
            .loading=${this.disconnecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="lg-regular" color="primary">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `;
    }
    chooseNameButtonTemplate() {
        const namespace = this.network?.chainNamespace;
        const connectorId = ConnectorController.getConnectorId(namespace);
        const authConnector = ConnectorController.getAuthConnector();
        const hasNetworkSupport = ChainController.checkIfNamesSupported();
        if (!hasNetworkSupport ||
            !authConnector ||
            connectorId !== CommonConstantsUtil.CONNECTOR_ID.AUTH ||
            this.profileName) {
            return null;
        }
        return html `
      <wui-list-item
        icon="id"
        ?rounded=${true}
        ?chevron=${true}
        @click=${this.onChooseName.bind(this)}
        data-testid="account-choose-name-button"
      >
        <wui-text variant="lg-regular" color="primary">Choose account name </wui-text>
      </wui-list-item>
    `;
    }
    authCardTemplate() {
        const connectorId = ConnectorController.getConnectorId(this.network?.chainNamespace);
        const authConnector = ConnectorController.getAuthConnector();
        const { origin } = location;
        if (!authConnector ||
            connectorId !== CommonConstantsUtil.CONNECTOR_ID.AUTH ||
            origin.includes(ConstantsUtil.SECURE_SITE)) {
            return null;
        }
        return html `
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `;
    }
    isAllowedNetworkSwitch() {
        const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks();
        const isMultiNetwork = requestedCaipNetworks ? requestedCaipNetworks.length > 1 : false;
        const isValidNetwork = requestedCaipNetworks?.find(({ id }) => id === this.network?.id);
        return isMultiNetwork || !isValidNetwork;
    }
    onCopyAddress() {
        try {
            if (this.address) {
                CoreHelperUtil.copyToClopboard(this.address);
                SnackController.showSuccess('Address copied');
            }
        }
        catch {
            SnackController.showError('Failed to copy');
        }
    }
    smartAccountSettingsTemplate() {
        const namespace = this.network?.chainNamespace;
        const isNetworkEnabled = ChainController.checkIfSmartAccountEnabled();
        const connectorId = ConnectorController.getConnectorId(namespace);
        const authConnector = ConnectorController.getAuthConnector();
        if (!authConnector ||
            connectorId !== CommonConstantsUtil.CONNECTOR_ID.AUTH ||
            !isNetworkEnabled) {
            return null;
        }
        return html `
      <wui-list-item
        icon="user"
        ?rounded=${true}
        ?chevron=${true}
        @click=${this.onSmartAccountSettings.bind(this)}
        data-testid="account-smart-account-settings-button"
      >
        <wui-text variant="lg-regular" color="primary">Smart Account Settings</wui-text>
      </wui-list-item>
    `;
    }
    onChooseName() {
        RouterController.push('ChooseAccountName');
    }
    onNetworks() {
        if (this.isAllowedNetworkSwitch()) {
            RouterController.push('Networks');
        }
    }
    async onDisconnect() {
        try {
            this.disconnecting = true;
            const namespace = this.network?.chainNamespace;
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
    onGoToUpgradeView() {
        EventsController.sendEvent({ type: 'track', event: 'EMAIL_UPGRADE_FROM_MODAL' });
        RouterController.push('UpgradeEmailWallet');
    }
    onSmartAccountSettings() {
        RouterController.push('SmartAccountSettings');
    }
};
__decorate([
    state()
], W3mAccountSettingsView.prototype, "address", void 0);
__decorate([
    state()
], W3mAccountSettingsView.prototype, "profileImage", void 0);
__decorate([
    state()
], W3mAccountSettingsView.prototype, "profileName", void 0);
__decorate([
    state()
], W3mAccountSettingsView.prototype, "network", void 0);
__decorate([
    state()
], W3mAccountSettingsView.prototype, "disconnecting", void 0);
__decorate([
    state()
], W3mAccountSettingsView.prototype, "remoteFeatures", void 0);
W3mAccountSettingsView = __decorate([
    customElement('w3m-account-settings-view')
], W3mAccountSettingsView);
export { W3mAccountSettingsView };
//# sourceMappingURL=index.js.map