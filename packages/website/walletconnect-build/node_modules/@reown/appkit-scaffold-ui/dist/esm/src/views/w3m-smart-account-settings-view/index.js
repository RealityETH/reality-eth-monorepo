var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ConstantsUtil } from '@reown/appkit-common';
import { ChainController, ConnectionController, SendController, getPreferredAccountType } from '@reown/appkit-controllers';
import { ConnectorController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import { W3mFrameStorage } from '@reown/appkit-wallet';
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils';
let W3mSmartAccountSettingsView = class W3mSmartAccountSettingsView extends LitElement {
    constructor() {
        super(...arguments);
        this.loading = false;
        this.switched = false;
        this.text = '';
        this.network = ChainController.state.activeCaipNetwork;
    }
    render() {
        return html `
      <wui-flex flexDirection="column" gap="2" .padding=${['6', '4', '3', '4']}>
        ${this.togglePreferredAccountTypeTemplate()} ${this.toggleSmartAccountVersionTemplate()}
      </wui-flex>
    `;
    }
    toggleSmartAccountVersionTemplate() {
        return html `
      <w3m-tooltip-trigger text="Changing the smart account version will reload the page">
        <wui-list-item
          icon=${this.isV6() ? 'arrowTop' : 'arrowBottom'}
          ?rounded=${true}
          ?chevron=${true}
          data-testid="account-toggle-smart-account-version"
          @click=${this.toggleSmartAccountVersion.bind(this)}
        >
          <wui-text variant="lg-regular" color="primary"
            >Force Smart Account Version ${this.isV6() ? '7' : '6'}</wui-text
          >
        </wui-list-item>
      </w3m-tooltip-trigger>
    `;
    }
    isV6() {
        const currentVersion = W3mFrameStorage.get('dapp_smart_account_version') || 'v6';
        return currentVersion === 'v6';
    }
    toggleSmartAccountVersion() {
        W3mFrameStorage.set('dapp_smart_account_version', this.isV6() ? 'v7' : 'v6');
        if (typeof window !== 'undefined') {
            window?.location?.reload();
        }
    }
    togglePreferredAccountTypeTemplate() {
        const namespace = this.network?.chainNamespace;
        const isNetworkEnabled = ChainController.checkIfSmartAccountEnabled();
        const connectorId = ConnectorController.getConnectorId(namespace);
        const authConnector = ConnectorController.getAuthConnector();
        if (!authConnector || connectorId !== ConstantsUtil.CONNECTOR_ID.AUTH || !isNetworkEnabled) {
            return null;
        }
        if (!this.switched) {
            this.text =
                getPreferredAccountType(namespace) === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
                    ? 'Switch to your EOA'
                    : 'Switch to your Smart Account';
        }
        return html `
      <wui-list-item
        icon="swapHorizontal"
        ?rounded=${true}
        ?chevron=${true}
        ?loading=${this.loading}
        @click=${this.changePreferredAccountType.bind(this)}
        data-testid="account-toggle-preferred-account-type"
      >
        <wui-text variant="lg-regular" color="primary">${this.text}</wui-text>
      </wui-list-item>
    `;
    }
    async changePreferredAccountType() {
        const namespace = this.network?.chainNamespace;
        const isSmartAccountEnabled = ChainController.checkIfSmartAccountEnabled();
        const accountTypeTarget = getPreferredAccountType(namespace) === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT ||
            !isSmartAccountEnabled
            ? W3mFrameRpcConstants.ACCOUNT_TYPES.EOA
            : W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT;
        const authConnector = ConnectorController.getAuthConnector();
        if (!authConnector) {
            return;
        }
        this.loading = true;
        await ConnectionController.setPreferredAccountType(accountTypeTarget, namespace);
        this.text =
            accountTypeTarget === W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
                ? 'Switch to your EOA'
                : 'Switch to your Smart Account';
        this.switched = true;
        SendController.resetSend();
        this.loading = false;
        this.requestUpdate();
    }
};
__decorate([
    state()
], W3mSmartAccountSettingsView.prototype, "loading", void 0);
__decorate([
    state()
], W3mSmartAccountSettingsView.prototype, "switched", void 0);
__decorate([
    state()
], W3mSmartAccountSettingsView.prototype, "text", void 0);
__decorate([
    state()
], W3mSmartAccountSettingsView.prototype, "network", void 0);
W3mSmartAccountSettingsView = __decorate([
    customElement('w3m-smart-account-settings-view')
], W3mSmartAccountSettingsView);
export { W3mSmartAccountSettingsView };
//# sourceMappingURL=index.js.map