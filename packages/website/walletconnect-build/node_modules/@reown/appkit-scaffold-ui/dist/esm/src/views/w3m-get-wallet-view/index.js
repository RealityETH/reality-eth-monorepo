var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ApiController, AssetUtil, CoreHelperUtil, EventsController, OptionsController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-list-item';
const EXPLORER = 'https://walletconnect.com/explorer';
let W3mGetWalletView = class W3mGetWalletView extends LitElement {
    render() {
        return html `
      <wui-flex flexDirection="column" .padding=${['0', '3', '3', '3']} gap="2">
        ${this.recommendedWalletsTemplate()}
        <w3m-list-wallet
          name="Explore all"
          showAllWallets
          walletIcon="allWallets"
          icon="externalLink"
          size="sm"
          @click=${() => {
            CoreHelperUtil.openHref('https://walletconnect.com/explorer?type=wallet', '_blank');
        }}
        ></w3m-list-wallet>
      </wui-flex>
    `;
    }
    recommendedWalletsTemplate() {
        const { recommended, featured } = ApiController.state;
        const { customWallets } = OptionsController.state;
        const wallets = [...featured, ...(customWallets ?? []), ...recommended].slice(0, 4);
        return wallets.map((wallet, index) => html `
        <w3m-list-wallet
          displayIndex=${index}
          name=${wallet.name ?? 'Unknown'}
          tagVariant="accent"
          size="sm"
          imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
          @click=${() => {
            this.onWalletClick(wallet);
        }}
        ></w3m-list-wallet>
      `);
    }
    onWalletClick(wallet) {
        EventsController.sendEvent({
            type: 'track',
            event: 'GET_WALLET',
            properties: {
                name: wallet.name,
                walletRank: undefined,
                explorerId: wallet.id,
                type: 'homepage'
            }
        });
        CoreHelperUtil.openHref(wallet.homepage ?? EXPLORER, '_blank');
    }
};
W3mGetWalletView = __decorate([
    customElement('w3m-get-wallet-view')
], W3mGetWalletView);
export { W3mGetWalletView };
//# sourceMappingURL=index.js.map