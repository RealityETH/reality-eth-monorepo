var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { AssetUtil, ConnectionController, EventsController, RouterController, ThemeController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-link';
import '@reown/appkit-ui/wui-qr-code';
import '@reown/appkit-ui/wui-shimmer';
import '@reown/appkit-ui/wui-text';
import '@reown/appkit-ui/wui-ux-by-reown';
import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js';
import '../w3m-mobile-download-links/index.js';
import styles from './styles.js';
let W3mConnectingWcQrcode = class W3mConnectingWcQrcode extends W3mConnectingWidget {
    constructor() {
        super();
        this.basic = false;
    }
    firstUpdated() {
        if (!this.basic) {
            EventsController.sendEvent({
                type: 'track',
                event: 'SELECT_WALLET',
                properties: {
                    name: this.wallet?.name ?? 'WalletConnect',
                    platform: 'qrcode',
                    displayIndex: this.wallet?.display_index,
                    walletRank: this.wallet?.order,
                    view: RouterController.state.view
                }
            });
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribe?.forEach(unsub => unsub());
    }
    render() {
        this.onRenderProxy();
        return html `
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['0', '5', '5', '5']}
        gap="5"
      >
        <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>
        <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `;
    }
    onRenderProxy() {
        if (!this.ready && this.uri) {
            this.ready = true;
        }
    }
    qrCodeTemplate() {
        if (!this.uri || !this.ready) {
            return null;
        }
        const alt = this.wallet ? this.wallet.name : undefined;
        ConnectionController.setWcLinking(undefined);
        ConnectionController.setRecentWallet(this.wallet);
        const qrColor = ThemeController.state.themeVariables['--apkt-qr-color'] ??
            ThemeController.state.themeVariables['--w3m-qr-color'];
        return html ` <wui-qr-code
      theme=${ThemeController.state.themeMode}
      uri=${this.uri}
      imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet))}
      color=${ifDefined(qrColor)}
      alt=${ifDefined(alt)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`;
    }
    copyTemplate() {
        const inactive = !this.uri || !this.ready;
        return html `<wui-button
      .disabled=${inactive}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      Copy link
      <wui-icon size="sm" color="inherit" name="copy" slot="iconRight"></wui-icon>
    </wui-button>`;
    }
};
W3mConnectingWcQrcode.styles = styles;
__decorate([
    property({ type: Boolean })
], W3mConnectingWcQrcode.prototype, "basic", void 0);
W3mConnectingWcQrcode = __decorate([
    customElement('w3m-connecting-wc-qrcode')
], W3mConnectingWcQrcode);
export { W3mConnectingWcQrcode };
//# sourceMappingURL=index.js.map