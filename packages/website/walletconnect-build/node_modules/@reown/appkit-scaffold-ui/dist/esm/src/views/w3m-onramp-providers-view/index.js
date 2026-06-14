var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ChainController, CoreHelperUtil, EventsController, OnRampController, RouterController, getPreferredAccountType } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils';
import '../../partials/w3m-onramp-provider-item/index.js';
import '../../partials/w3m-onramp-providers-footer/index.js';
let W3mOnRampProvidersView = class W3mOnRampProvidersView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.providers = OnRampController.state.providers;
        this.unsubscribe.push(...[
            OnRampController.subscribeKey('providers', val => {
                this.providers = val;
            })
        ]);
    }
    render() {
        return html `
      <wui-flex flexDirection="column" .padding=${['0', '3', '3', '3']} gap="2">
        ${this.onRampProvidersTemplate()}
      </wui-flex>
    `;
    }
    onRampProvidersTemplate() {
        return this.providers
            .filter(provider => provider.supportedChains.includes(ChainController.state.activeChain ?? 'eip155'))
            .map(provider => html `
          <w3m-onramp-provider-item
            label=${provider.label}
            name=${provider.name}
            feeRange=${provider.feeRange}
            @click=${() => {
            this.onClickProvider(provider);
        }}
            ?disabled=${!provider.url}
            data-testid=${`onramp-provider-${provider.name}`}
          ></w3m-onramp-provider-item>
        `);
    }
    onClickProvider(provider) {
        OnRampController.setSelectedProvider(provider);
        RouterController.push('BuyInProgress');
        CoreHelperUtil.openHref(OnRampController.state.selectedProvider?.url || provider.url, 'popupWindow', 'width=600,height=800,scrollbars=yes');
        EventsController.sendEvent({
            type: 'track',
            event: 'SELECT_BUY_PROVIDER',
            properties: {
                provider: provider.name,
                isSmartAccount: getPreferredAccountType(ChainController.state.activeChain) ===
                    W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
            }
        });
    }
};
__decorate([
    state()
], W3mOnRampProvidersView.prototype, "providers", void 0);
W3mOnRampProvidersView = __decorate([
    customElement('w3m-onramp-providers-view')
], W3mOnRampProvidersView);
export { W3mOnRampProvidersView };
//# sourceMappingURL=index.js.map