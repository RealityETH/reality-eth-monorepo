var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { CoreHelperUtil, EventsController, RouterController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-text';
let W3mDownloadsView = class W3mDownloadsView extends LitElement {
    constructor() {
        super(...arguments);
        this.wallet = RouterController.state.data?.wallet;
    }
    render() {
        if (!this.wallet) {
            throw new Error('w3m-downloads-view');
        }
        return html `
      <wui-flex gap="2" flexDirection="column" .padding=${['3', '3', '4', '3']}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `;
    }
    chromeTemplate() {
        if (!this.wallet?.chrome_store) {
            return null;
        }
        return html `<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Chrome Extension</wui-text>
    </wui-list-item>`;
    }
    iosTemplate() {
        if (!this.wallet?.app_store) {
            return null;
        }
        return html `<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">iOS App</wui-text>
    </wui-list-item>`;
    }
    androidTemplate() {
        if (!this.wallet?.play_store) {
            return null;
        }
        return html `<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Android App</wui-text>
    </wui-list-item>`;
    }
    homepageTemplate() {
        if (!this.wallet?.homepage) {
            return null;
        }
        return html `
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="md-medium" color="primary">Website</wui-text>
      </wui-list-item>
    `;
    }
    openStore(params) {
        if (params.href && this.wallet) {
            EventsController.sendEvent({
                type: 'track',
                event: 'GET_WALLET',
                properties: {
                    name: this.wallet.name,
                    walletRank: this.wallet.order,
                    explorerId: this.wallet.id,
                    type: params.type
                }
            });
            CoreHelperUtil.openHref(params.href, '_blank');
        }
    }
    onChromeStore() {
        if (this.wallet?.chrome_store) {
            this.openStore({ href: this.wallet.chrome_store, type: 'chrome_store' });
        }
    }
    onAppStore() {
        if (this.wallet?.app_store) {
            this.openStore({ href: this.wallet.app_store, type: 'app_store' });
        }
    }
    onPlayStore() {
        if (this.wallet?.play_store) {
            this.openStore({ href: this.wallet.play_store, type: 'play_store' });
        }
    }
    onHomePage() {
        if (this.wallet?.homepage) {
            this.openStore({ href: this.wallet.homepage, type: 'homepage' });
        }
    }
};
W3mDownloadsView = __decorate([
    customElement('w3m-downloads-view')
], W3mDownloadsView);
export { W3mDownloadsView };
//# sourceMappingURL=index.js.map