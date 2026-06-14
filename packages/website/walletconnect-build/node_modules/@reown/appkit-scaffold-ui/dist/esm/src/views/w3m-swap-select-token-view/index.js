var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { RouterController, SwapController } from '@reown/appkit-controllers';
import { MathUtil, customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-input-text';
import '@reown/appkit-ui/wui-text';
import '@reown/appkit-ui/wui-token-button';
import '@reown/appkit-ui/wui-token-list-item';
import '@reown/appkit-ui/wui-token-list-item-loader';
import styles from './styles.js';
let W3mSwapSelectTokenView = class W3mSwapSelectTokenView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.targetToken = RouterController.state.data?.target;
        this.sourceToken = SwapController.state.sourceToken;
        this.sourceTokenAmount = SwapController.state.sourceTokenAmount;
        this.toToken = SwapController.state.toToken;
        this.myTokensWithBalance = SwapController.state.myTokensWithBalance;
        this.popularTokens = SwapController.state.popularTokens;
        this.suggestedTokens = SwapController.state.suggestedTokens;
        this.tokensLoading = SwapController.state.tokensLoading;
        this.searchValue = '';
        this.unsubscribe.push(SwapController.subscribe(newState => {
            this.sourceToken = newState.sourceToken;
            this.toToken = newState.toToken;
            this.myTokensWithBalance = newState.myTokensWithBalance;
            this.popularTokens = newState.popularTokens;
            this.suggestedTokens = newState.suggestedTokens;
            this.tokensLoading = newState.tokensLoading;
        }));
    }
    async firstUpdated() {
        await SwapController.getTokenList();
    }
    updated() {
        const suggestedTokensContainer = this.renderRoot?.querySelector('.suggested-tokens-container');
        suggestedTokensContainer?.addEventListener('scroll', this.handleSuggestedTokensScroll.bind(this));
        const tokensList = this.renderRoot?.querySelector('.tokens');
        tokensList?.addEventListener('scroll', this.handleTokenListScroll.bind(this));
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        const suggestedTokensContainer = this.renderRoot?.querySelector('.suggested-tokens-container');
        const tokensList = this.renderRoot?.querySelector('.tokens');
        suggestedTokensContainer?.removeEventListener('scroll', this.handleSuggestedTokensScroll.bind(this));
        tokensList?.removeEventListener('scroll', this.handleTokenListScroll.bind(this));
        clearInterval(this.interval);
    }
    render() {
        return html `
      <wui-flex flexDirection="column" gap="3">
        ${this.templateSearchInput()} ${this.templateSuggestedTokens()} ${this.templateTokens()}
      </wui-flex>
    `;
    }
    onSelectToken(token) {
        if (this.targetToken === 'sourceToken') {
            SwapController.setSourceToken(token);
        }
        else {
            SwapController.setToToken(token);
            if (this.sourceToken && this.sourceTokenAmount) {
                SwapController.swapTokens();
            }
        }
        RouterController.goBack();
    }
    templateSearchInput() {
        return html `
      <wui-flex .padding=${['1', '3', '0', '3']} gap="2">
        <wui-input-text
          data-testid="swap-select-token-search-input"
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
          .value=${this.searchValue}
          @inputChange=${this.onSearchInputChange.bind(this)}
        ></wui-input-text>
      </wui-flex>
    `;
    }
    templateMyTokens() {
        const yourTokens = this.myTokensWithBalance ? Object.values(this.myTokensWithBalance) : [];
        const filteredYourTokens = this.filterTokensWithText(yourTokens, this.searchValue);
        if (filteredYourTokens?.length > 0) {
            return html `<wui-flex justifyContent="flex-start" padding="2">
          <wui-text variant="md-medium" color="secondary">Your tokens</wui-text>
        </wui-flex>
        ${filteredYourTokens.map(token => {
                const selected = token.symbol === this.sourceToken?.symbol || token.symbol === this.toToken?.symbol;
                return html `
            <wui-token-list-item
              data-testid="swap-select-token-item-${token.symbol}"
              name=${token.name}
              ?disabled=${selected}
              symbol=${token.symbol}
              price=${token?.price}
              amount=${token?.quantity?.numeric}
              imageSrc=${token.logoUri}
              @click=${() => {
                    if (!selected) {
                        this.onSelectToken(token);
                    }
                }}
            >
            </wui-token-list-item>
          `;
            })}`;
        }
        return null;
    }
    templateAllTokens() {
        const tokens = this.popularTokens ? this.popularTokens : [];
        const filteredTokens = this.filterTokensWithText(tokens, this.searchValue);
        if (this.tokensLoading) {
            return html `
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
      `;
        }
        if (filteredTokens?.length > 0) {
            return html `
        ${filteredTokens.map(token => html `
            <wui-token-list-item
              data-testid="swap-select-token-item-${token.symbol}"
              name=${token.name}
              symbol=${token.symbol}
              imageSrc=${token.logoUri}
              @click=${() => this.onSelectToken(token)}
            >
            </wui-token-list-item>
          `)}
      `;
        }
        return null;
    }
    templateTokens() {
        return html `
      <wui-flex class="tokens-container">
        <wui-flex class="tokens" .padding=${['0', '2', '2', '2']} flexDirection="column">
          ${this.templateMyTokens()}
          <wui-flex justifyContent="flex-start" padding="3">
            <wui-text variant="md-medium" color="secondary">Tokens</wui-text>
          </wui-flex>
          ${this.templateAllTokens()}
        </wui-flex>
      </wui-flex>
    `;
    }
    templateSuggestedTokens() {
        const tokens = this.suggestedTokens ? this.suggestedTokens.slice(0, 8) : null;
        if (this.tokensLoading) {
            return html `
        <wui-flex
          class="suggested-tokens-container"
          .padding=${['0', '3', '0', '3']}
          gap="2"
        >
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
          <wui-token-button loading></wui-token-button>
        </wui-flex>
      `;
        }
        if (!tokens) {
            return null;
        }
        return html `
      <wui-flex
        class="suggested-tokens-container"
        .padding=${['0', '3', '0', '3']}
        gap="2"
      >
        ${tokens.map(token => html `
            <wui-token-button
              text=${token.symbol}
              imageSrc=${token.logoUri}
              @click=${() => this.onSelectToken(token)}
            >
            </wui-token-button>
          `)}
      </wui-flex>
    `;
    }
    onSearchInputChange(event) {
        this.searchValue = event.detail;
    }
    handleSuggestedTokensScroll() {
        const container = this.renderRoot?.querySelector('.suggested-tokens-container');
        if (!container) {
            return;
        }
        container.style.setProperty('--suggested-tokens-scroll--left-opacity', MathUtil.interpolate([0, 100], [0, 1], container.scrollLeft).toString());
        container.style.setProperty('--suggested-tokens-scroll--right-opacity', MathUtil.interpolate([0, 100], [0, 1], container.scrollWidth - container.scrollLeft - container.offsetWidth).toString());
    }
    handleTokenListScroll() {
        const container = this.renderRoot?.querySelector('.tokens');
        if (!container) {
            return;
        }
        container.style.setProperty('--tokens-scroll--top-opacity', MathUtil.interpolate([0, 100], [0, 1], container.scrollTop).toString());
        container.style.setProperty('--tokens-scroll--bottom-opacity', MathUtil.interpolate([0, 100], [0, 1], container.scrollHeight - container.scrollTop - container.offsetHeight).toString());
    }
    filterTokensWithText(tokens, text) {
        return tokens
            .filter(token => `${token.symbol} ${token.name} ${token.address}`.toLowerCase().includes(text.toLowerCase()))
            .sort((a, b) => {
            const aText = `${a.symbol} ${a.name} ${a.address}`.toLowerCase();
            const bText = `${b.symbol} ${b.name} ${b.address}`.toLowerCase();
            const aIndex = aText.indexOf(text.toLowerCase());
            const bIndex = bText.indexOf(text.toLowerCase());
            return aIndex - bIndex;
        });
    }
};
W3mSwapSelectTokenView.styles = styles;
__decorate([
    state()
], W3mSwapSelectTokenView.prototype, "interval", void 0);
__decorate([
    state()
], W3mSwapSelectTokenView.prototype, "targetToken", void 0);
__decorate([
    state()
], W3mSwapSelectTokenView.prototype, "sourceToken", void 0);
__decorate([
    state()
], W3mSwapSelectTokenView.prototype, "sourceTokenAmount", void 0);
__decorate([
    state()
], W3mSwapSelectTokenView.prototype, "toToken", void 0);
__decorate([
    state()
], W3mSwapSelectTokenView.prototype, "myTokensWithBalance", void 0);
__decorate([
    state()
], W3mSwapSelectTokenView.prototype, "popularTokens", void 0);
__decorate([
    state()
], W3mSwapSelectTokenView.prototype, "suggestedTokens", void 0);
__decorate([
    state()
], W3mSwapSelectTokenView.prototype, "tokensLoading", void 0);
__decorate([
    state()
], W3mSwapSelectTokenView.prototype, "searchValue", void 0);
W3mSwapSelectTokenView = __decorate([
    customElement('w3m-swap-select-token-view')
], W3mSwapSelectTokenView);
export { W3mSwapSelectTokenView };
//# sourceMappingURL=index.js.map