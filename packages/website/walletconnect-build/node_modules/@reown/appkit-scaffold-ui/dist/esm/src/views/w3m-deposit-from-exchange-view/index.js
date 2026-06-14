var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { AssetUtil, ChainController, ConnectionController, ExchangeController, RouterController, SnackController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-chip-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon-link';
import '@reown/appkit-ui/wui-image';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-shimmer';
import '@reown/appkit-ui/wui-text';
import '../../partials/w3m-fund-input/index.js';
import styles from './styles.js';
const PRESET_AMOUNTS = [10, 50, 100];
const MAX_DECIMALS = 6;
const MAX_INTEGERS = 10;
let W3mDepositFromExchangeView = class W3mDepositFromExchangeView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.network = ChainController.state.activeCaipNetwork;
        this.exchanges = ExchangeController.state.exchanges;
        this.isLoading = ExchangeController.state.isLoading;
        this.amount = ExchangeController.state.amount;
        this.tokenAmount = ExchangeController.state.tokenAmount;
        this.priceLoading = ExchangeController.state.priceLoading;
        this.isPaymentInProgress = ExchangeController.state.isPaymentInProgress;
        this.currentPayment = ExchangeController.state.currentPayment;
        this.paymentId = ExchangeController.state.paymentId;
        this.paymentAsset = ExchangeController.state.paymentAsset;
        this.unsubscribe.push(ChainController.subscribeKey('activeCaipNetwork', val => {
            this.network = val;
            this.setDefaultPaymentAsset();
        }), ExchangeController.subscribe(exchangeState => {
            this.exchanges = exchangeState.exchanges;
            this.isLoading = exchangeState.isLoading;
            this.amount = exchangeState.amount;
            this.tokenAmount = exchangeState.tokenAmount;
            this.priceLoading = exchangeState.priceLoading;
            this.paymentId = exchangeState.paymentId;
            this.isPaymentInProgress = exchangeState.isPaymentInProgress;
            this.currentPayment = exchangeState.currentPayment;
            this.paymentAsset = exchangeState.paymentAsset;
            const shouldHandlePaymentInProgress = exchangeState.isPaymentInProgress &&
                exchangeState.currentPayment?.exchangeId &&
                exchangeState.currentPayment?.sessionId &&
                exchangeState.paymentId;
            if (shouldHandlePaymentInProgress) {
                this.handlePaymentInProgress();
            }
        }));
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
        const isInProgress = ExchangeController.state.isPaymentInProgress;
        if (!isInProgress) {
            ExchangeController.reset();
        }
    }
    async firstUpdated() {
        await this.getPaymentAssets();
        if (!this.paymentAsset) {
            await this.setDefaultPaymentAsset();
        }
        ExchangeController.setAmount(PRESET_AMOUNTS[0]);
        await ExchangeController.fetchExchanges();
    }
    render() {
        return html `
      <wui-flex flexDirection="column" class="container">
        ${this.amountInputTemplate()} ${this.exchangesTemplate()}
      </wui-flex>
    `;
    }
    exchangesLoadingTemplate() {
        return Array.from({ length: 2 }).map(() => html `<wui-shimmer width="100%" height="65px" borderRadius="xxs"></wui-shimmer>`);
    }
    _exchangesTemplate() {
        return this.exchanges.length > 0
            ? this.exchanges.map(exchange => html `<wui-list-item
              @click=${() => this.onExchangeClick(exchange)}
              chevron
              variant="image"
              imageSrc=${exchange.imageUrl}
              ?loading=${this.isLoading}
            >
              <wui-text variant="md-regular" color="primary">
                Deposit from ${exchange.name}
              </wui-text>
            </wui-list-item>`)
            : html `<wui-flex flexDirection="column" alignItems="center" gap="4" padding="4">
          <wui-text variant="lg-medium" align="center" color="primary">
            No exchanges support this asset on this network
          </wui-text>
        </wui-flex>`;
    }
    exchangesTemplate() {
        return html `<wui-flex
      flexDirection="column"
      gap="2"
      .padding=${['3', '3', '3', '3']}
      class="exchanges-container"
    >
      ${this.isLoading ? this.exchangesLoadingTemplate() : this._exchangesTemplate()}
    </wui-flex>`;
    }
    amountInputTemplate() {
        return html `
      <wui-flex
        flexDirection="column"
        .padding=${['0', '3', '3', '3']}
        class="amount-input-container"
      >
        <wui-flex
          justifyContent="space-between"
          alignItems="center"
          .margin=${['0', '0', '6', '0']}
        >
          <wui-text variant="md-medium" color="secondary">Asset</wui-text>
          <wui-token-button
            data-testid="deposit-from-exchange-asset-button"
            flexDirection="row-reverse"
            text=${this.paymentAsset?.metadata.symbol || ''}
            imageSrc=${this.paymentAsset?.metadata.iconUrl || ''}
            @click=${() => RouterController.push('PayWithExchangeSelectAsset')}
            size="lg"
            .chainImageSrc=${ifDefined(AssetUtil.getNetworkImage(this.network))}
          >
          </wui-token-button>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          .margin=${['0', '0', '4', '0']}
        >
          <w3m-fund-input
            @inputChange=${this.onAmountChange.bind(this)}
            .amount=${this.amount}
            .maxDecimals=${MAX_DECIMALS}
            .maxIntegers=${MAX_INTEGERS}
          >
          </w3m-fund-input>
          ${this.tokenAmountTemplate()}
        </wui-flex>
        <wui-flex justifyContent="center" gap="2">
          ${PRESET_AMOUNTS.map(amount => html `<wui-chip-button
                @click=${() => ExchangeController.setAmount(amount)}
                type="neutral"
                size="lg"
                text=${`$${amount}`}
              ></wui-chip-button>`)}
        </wui-flex>
      </wui-flex>
    `;
    }
    tokenAmountTemplate() {
        if (this.priceLoading) {
            return html `<wui-shimmer
        width="65px"
        height="20px"
        borderRadius="xxs"
        variant="light"
      ></wui-shimmer>`;
        }
        return html `
      <wui-text variant="md-regular" color="secondary">
        ${this.tokenAmount.toFixed(4)} ${this.paymentAsset?.metadata.symbol}
      </wui-text>
    `;
    }
    async onExchangeClick(exchange) {
        if (!this.amount) {
            SnackController.showError('Please enter an amount');
            return;
        }
        await ExchangeController.handlePayWithExchange(exchange.id);
    }
    handlePaymentInProgress() {
        const namespace = ChainController.state.activeChain;
        const { redirectView = 'Account' } = RouterController.state.data ?? {};
        if (this.isPaymentInProgress &&
            this.currentPayment?.exchangeId &&
            this.currentPayment?.sessionId &&
            this.paymentId) {
            ExchangeController.waitUntilComplete({
                exchangeId: this.currentPayment.exchangeId,
                sessionId: this.currentPayment.sessionId,
                paymentId: this.paymentId
            }).then(status => {
                if (status.status === 'SUCCESS') {
                    SnackController.showSuccess('Deposit completed');
                    ExchangeController.reset();
                    if (namespace) {
                        ChainController.fetchTokenBalance();
                        ConnectionController.updateBalance(namespace);
                    }
                    RouterController.replace('Transactions');
                }
                else if (status.status === 'FAILED') {
                    SnackController.showError('Deposit failed');
                }
            });
            SnackController.showLoading('Deposit in progress...');
            RouterController.replace(redirectView);
        }
    }
    onAmountChange({ detail }) {
        ExchangeController.setAmount(detail ? Number(detail) : null);
    }
    async getPaymentAssets() {
        if (this.network) {
            await ExchangeController.getAssetsForNetwork(this.network.caipNetworkId);
        }
    }
    async setDefaultPaymentAsset() {
        if (this.network) {
            const paymentAssets = await ExchangeController.getAssetsForNetwork(this.network.caipNetworkId);
            if (paymentAssets[0]) {
                ExchangeController.setPaymentAsset(paymentAssets[0]);
            }
        }
    }
};
W3mDepositFromExchangeView.styles = styles;
__decorate([
    state()
], W3mDepositFromExchangeView.prototype, "network", void 0);
__decorate([
    state()
], W3mDepositFromExchangeView.prototype, "exchanges", void 0);
__decorate([
    state()
], W3mDepositFromExchangeView.prototype, "isLoading", void 0);
__decorate([
    state()
], W3mDepositFromExchangeView.prototype, "amount", void 0);
__decorate([
    state()
], W3mDepositFromExchangeView.prototype, "tokenAmount", void 0);
__decorate([
    state()
], W3mDepositFromExchangeView.prototype, "priceLoading", void 0);
__decorate([
    state()
], W3mDepositFromExchangeView.prototype, "isPaymentInProgress", void 0);
__decorate([
    state()
], W3mDepositFromExchangeView.prototype, "currentPayment", void 0);
__decorate([
    state()
], W3mDepositFromExchangeView.prototype, "paymentId", void 0);
__decorate([
    state()
], W3mDepositFromExchangeView.prototype, "paymentAsset", void 0);
W3mDepositFromExchangeView = __decorate([
    customElement('w3m-deposit-from-exchange-view')
], W3mDepositFromExchangeView);
export { W3mDepositFromExchangeView };
//# sourceMappingURL=index.js.map