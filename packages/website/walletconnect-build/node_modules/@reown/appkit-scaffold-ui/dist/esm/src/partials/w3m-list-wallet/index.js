var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { AdapterController, EventsController, RouterController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-list-wallet';
import styles from './styles.js';
let W3mListWallet = class W3mListWallet extends LitElement {
    constructor() {
        super(...arguments);
        this.hasImpressionSent = false;
        this.walletImages = [];
        this.imageSrc = '';
        this.name = '';
        this.size = 'md';
        this.tabIdx = undefined;
        this.disabled = false;
        this.showAllWallets = false;
        this.loading = false;
        this.loadingSpinnerColor = 'accent-100';
        this.rdnsId = '';
        this.displayIndex = undefined;
        this.walletRank = undefined;
        this.namespaces = [];
    }
    connectedCallback() {
        super.connectedCallback();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.cleanupIntersectionObserver();
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('name') ||
            changedProperties.has('imageSrc') ||
            changedProperties.has('walletRank')) {
            this.hasImpressionSent = false;
        }
        const hasWalletRankChanged = changedProperties.has('walletRank') && this.walletRank;
        if (hasWalletRankChanged && !this.intersectionObserver) {
            this.setupIntersectionObserver();
        }
    }
    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.loading && !this.hasImpressionSent) {
                    this.sendImpressionEvent();
                }
            });
        }, { threshold: 0.1 });
        this.intersectionObserver.observe(this);
    }
    cleanupIntersectionObserver() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = undefined;
        }
    }
    sendImpressionEvent() {
        if (!this.name || this.hasImpressionSent || !this.walletRank) {
            return;
        }
        this.hasImpressionSent = true;
        if (this.rdnsId || this.name) {
            EventsController.sendWalletImpressionEvent({
                name: this.name,
                walletRank: this.walletRank,
                rdnsId: this.rdnsId,
                view: RouterController.state.view,
                displayIndex: this.displayIndex
            });
        }
    }
    handleGetWalletNamespaces() {
        const isMultiChain = Object.keys(AdapterController.state.adapters).length > 1;
        if (isMultiChain) {
            return this.namespaces;
        }
        return [];
    }
    render() {
        return html `
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${ifDefined(this.imageSrc)}
        name=${this.name}
        size=${ifDefined(this.size)}
        tagLabel=${ifDefined(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
        .namespaces=${this.handleGetWalletNamespaces()}
      ></wui-list-wallet>
    `;
    }
};
W3mListWallet.styles = styles;
__decorate([
    property({ type: Array })
], W3mListWallet.prototype, "walletImages", void 0);
__decorate([
    property()
], W3mListWallet.prototype, "imageSrc", void 0);
__decorate([
    property()
], W3mListWallet.prototype, "name", void 0);
__decorate([
    property()
], W3mListWallet.prototype, "size", void 0);
__decorate([
    property()
], W3mListWallet.prototype, "tagLabel", void 0);
__decorate([
    property()
], W3mListWallet.prototype, "tagVariant", void 0);
__decorate([
    property()
], W3mListWallet.prototype, "walletIcon", void 0);
__decorate([
    property()
], W3mListWallet.prototype, "tabIdx", void 0);
__decorate([
    property({ type: Boolean })
], W3mListWallet.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], W3mListWallet.prototype, "showAllWallets", void 0);
__decorate([
    property({ type: Boolean })
], W3mListWallet.prototype, "loading", void 0);
__decorate([
    property({ type: String })
], W3mListWallet.prototype, "loadingSpinnerColor", void 0);
__decorate([
    property()
], W3mListWallet.prototype, "rdnsId", void 0);
__decorate([
    property()
], W3mListWallet.prototype, "displayIndex", void 0);
__decorate([
    property()
], W3mListWallet.prototype, "walletRank", void 0);
__decorate([
    property({ type: Array })
], W3mListWallet.prototype, "namespaces", void 0);
W3mListWallet = __decorate([
    customElement('w3m-list-wallet')
], W3mListWallet);
export { W3mListWallet };
//# sourceMappingURL=index.js.map