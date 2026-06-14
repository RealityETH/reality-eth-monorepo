var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import '../../composites/wui-icon-box/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-all-wallets-image/index.js';
import '../wui-tag/index.js';
import '../wui-wallet-image/index.js';
import styles from './styles.js';
const NAMESPACE_ICONS = {
    eip155: 'ethereum',
    solana: 'solana',
    bip122: 'bitcoin',
    polkadot: undefined,
    cosmos: undefined,
    sui: undefined,
    stacks: undefined,
    ton: 'ton'
};
let WuiListWallet = class WuiListWallet extends LitElement {
    constructor() {
        super(...arguments);
        this.walletImages = [];
        this.imageSrc = '';
        this.name = '';
        this.size = 'md';
        this.tabIdx = undefined;
        this.namespaces = [];
        this.disabled = false;
        this.showAllWallets = false;
        this.loading = false;
        this.loadingSpinnerColor = 'accent-100';
    }
    render() {
        this.dataset['size'] = this.size;
        return html `
      <button
        ?disabled=${this.disabled}
        data-all-wallets=${this.showAllWallets}
        tabindex=${ifDefined(this.tabIdx)}
      >
        ${this.templateAllWallets()} ${this.templateWalletImage()}
        <wui-flex flexDirection="column" justifyContent="center" alignItems="flex-start" gap="1">
          <wui-text variant="lg-regular" color="inherit">${this.name}</wui-text>
          ${this.templateNamespaces()}
        </wui-flex>
        ${this.templateStatus()}
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `;
    }
    templateNamespaces() {
        if (this.namespaces?.length) {
            return html `<wui-flex alignItems="center" gap="0">
        ${this.namespaces.map((namespace, index) => html `<wui-flex
              alignItems="center"
              justifyContent="center"
              zIndex=${(this.namespaces?.length ?? 0) * 2 - index}
              class="namespace-icon"
            >
              <wui-icon
                name=${ifDefined(NAMESPACE_ICONS[namespace])}
                size="sm"
                color="default"
              ></wui-icon>
            </wui-flex>`)}
      </wui-flex>`;
        }
        return null;
    }
    templateAllWallets() {
        if (this.showAllWallets && this.imageSrc) {
            return html ` <wui-all-wallets-image .imageeSrc=${this.imageSrc}> </wui-all-wallets-image> `;
        }
        else if (this.showAllWallets && this.walletIcon) {
            return html ` <wui-wallet-image .walletIcon=${this.walletIcon} size="sm"> </wui-wallet-image> `;
        }
        return null;
    }
    templateWalletImage() {
        if (!this.showAllWallets && this.imageSrc) {
            return html `<wui-wallet-image
        size=${ifDefined(this.size === 'sm' ? 'sm' : 'md')}
        imageSrc=${this.imageSrc}
        name=${this.name}
      ></wui-wallet-image>`;
        }
        else if (!this.showAllWallets && !this.imageSrc) {
            return html `<wui-wallet-image size="sm" name=${this.name}></wui-wallet-image>`;
        }
        return null;
    }
    templateStatus() {
        if (this.loading) {
            return html `<wui-loading-spinner size="lg" color="accent-primary"></wui-loading-spinner>`;
        }
        else if (this.tagLabel && this.tagVariant) {
            return html `<wui-tag size="sm" variant=${this.tagVariant}>${this.tagLabel}</wui-tag>`;
        }
        return null;
    }
};
WuiListWallet.styles = [resetStyles, elementStyles, styles];
__decorate([
    property({ type: Array })
], WuiListWallet.prototype, "walletImages", void 0);
__decorate([
    property()
], WuiListWallet.prototype, "imageSrc", void 0);
__decorate([
    property()
], WuiListWallet.prototype, "name", void 0);
__decorate([
    property()
], WuiListWallet.prototype, "size", void 0);
__decorate([
    property()
], WuiListWallet.prototype, "tagLabel", void 0);
__decorate([
    property()
], WuiListWallet.prototype, "tagVariant", void 0);
__decorate([
    property()
], WuiListWallet.prototype, "walletIcon", void 0);
__decorate([
    property()
], WuiListWallet.prototype, "tabIdx", void 0);
__decorate([
    property({ type: Array })
], WuiListWallet.prototype, "namespaces", void 0);
__decorate([
    property({ type: Boolean })
], WuiListWallet.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], WuiListWallet.prototype, "showAllWallets", void 0);
__decorate([
    property({ type: Boolean })
], WuiListWallet.prototype, "loading", void 0);
__decorate([
    property({ type: String })
], WuiListWallet.prototype, "loadingSpinnerColor", void 0);
WuiListWallet = __decorate([
    customElement('wui-list-wallet')
], WuiListWallet);
export { WuiListWallet };
//# sourceMappingURL=index.js.map