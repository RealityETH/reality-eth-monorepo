var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { NumberUtil, ParseUtil } from '@reown/appkit-common';
import { AssetUtil, ChainController, ConnectorController, CoreHelperUtil, ModalController, RouterController, SnackController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-text';
import '@reown/appkit-ui/wui-wallet-switch';
import { HelpersUtil } from '@reown/appkit-utils';
import { PayController } from '../../controllers/PayController.js';
import '../../partials/w3m-pay-fees-skeleton/index.js';
import '../../partials/w3m-pay-fees/index.js';
import '../../partials/w3m-pay-options-empty/index.js';
import '../../partials/w3m-pay-options-skeleton/index.js';
import '../../partials/w3m-pay-options/index.js';
import { formatAmount, formatBalanceToPaymentAsset } from '../../utils/AssetUtil.js';
import { getTransactionsSteps, getTransferStep } from '../../utils/PaymentUtil.js';
import styles from './styles.js';
const NAMESPACE_ICONS = {
    eip155: 'ethereum',
    solana: 'solana',
    bip122: 'bitcoin',
    ton: 'ton'
};
const NAMESPACE_LABELS = {
    eip155: { icon: NAMESPACE_ICONS.eip155, label: 'EVM' },
    solana: { icon: NAMESPACE_ICONS.solana, label: 'Solana' },
    bip122: { icon: NAMESPACE_ICONS.bip122, label: 'Bitcoin' },
    ton: { icon: NAMESPACE_ICONS.ton, label: 'Ton' }
};
let W3mPayQuoteView = class W3mPayQuoteView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.profileName = null;
        this.paymentAsset = PayController.state.paymentAsset;
        this.namespace = undefined;
        this.caipAddress = undefined;
        this.amount = PayController.state.amount;
        this.recipient = PayController.state.recipient;
        this.activeConnectorIds = ConnectorController.state.activeConnectorIds;
        this.selectedPaymentAsset = PayController.state.selectedPaymentAsset;
        this.selectedExchange = PayController.state.selectedExchange;
        this.isFetchingQuote = PayController.state.isFetchingQuote;
        this.quoteError = PayController.state.quoteError;
        this.quote = PayController.state.quote;
        this.isFetchingTokenBalances = PayController.state.isFetchingTokenBalances;
        this.tokenBalances = PayController.state.tokenBalances;
        this.isPaymentInProgress = PayController.state.isPaymentInProgress;
        this.exchangeUrlForQuote = PayController.state.exchangeUrlForQuote;
        this.completedTransactionsCount = 0;
        this.unsubscribe.push(PayController.subscribeKey('paymentAsset', val => (this.paymentAsset = val)));
        this.unsubscribe.push(PayController.subscribeKey('tokenBalances', val => this.onTokenBalancesChanged(val)));
        this.unsubscribe.push(PayController.subscribeKey('isFetchingTokenBalances', val => (this.isFetchingTokenBalances = val)));
        this.unsubscribe.push(ConnectorController.subscribeKey('activeConnectorIds', newActiveConnectorIds => (this.activeConnectorIds = newActiveConnectorIds)));
        this.unsubscribe.push(PayController.subscribeKey('selectedPaymentAsset', val => (this.selectedPaymentAsset = val)));
        this.unsubscribe.push(PayController.subscribeKey('isFetchingQuote', val => (this.isFetchingQuote = val)));
        this.unsubscribe.push(PayController.subscribeKey('quoteError', val => (this.quoteError = val)));
        this.unsubscribe.push(PayController.subscribeKey('quote', val => (this.quote = val)));
        this.unsubscribe.push(PayController.subscribeKey('amount', val => (this.amount = val)));
        this.unsubscribe.push(PayController.subscribeKey('recipient', val => (this.recipient = val)));
        this.unsubscribe.push(PayController.subscribeKey('isPaymentInProgress', val => (this.isPaymentInProgress = val)));
        this.unsubscribe.push(PayController.subscribeKey('selectedExchange', val => (this.selectedExchange = val)));
        this.unsubscribe.push(PayController.subscribeKey('exchangeUrlForQuote', val => (this.exchangeUrlForQuote = val)));
        this.resetQuoteState();
        this.initializeNamespace();
        this.fetchTokens();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.resetAssetsState();
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        const shouldFetchQuote = changedProperties.has('selectedPaymentAsset');
        if (shouldFetchQuote) {
            this.fetchQuote();
        }
    }
    render() {
        return html `
      <wui-flex flexDirection="column">
        ${this.profileTemplate()}

        <wui-flex
          flexDirection="column"
          gap="4"
          class="payment-methods-container"
          .padding=${['4', '4', '5', '4']}
        >
          ${this.paymentOptionsViewTemplate()} ${this.amountWithFeeTemplate()}

          <wui-flex
            alignItems="center"
            justifyContent="space-between"
            .padding=${['1', '0', '1', '0']}
          >
            <wui-separator></wui-separator>
          </wui-flex>

          ${this.paymentActionsTemplate()}
        </wui-flex>
      </wui-flex>
    `;
    }
    profileTemplate() {
        if (this.selectedExchange) {
            const amount = NumberUtil.formatNumber(this.quote?.origin.amount, {
                decimals: this.quote?.origin.currency.metadata.decimals ?? 0
            }).toString();
            return html `
        <wui-flex
          .padding=${['4', '3', '4', '3']}
          alignItems="center"
          justifyContent="space-between"
          gap="2"
        >
          <wui-text variant="lg-regular" color="secondary">Paying with</wui-text>

          ${this.quote
                ? html `<wui-text variant="lg-regular" color="primary">
                ${NumberUtil.bigNumber(amount, { safe: true }).round(6).toString()}
                ${this.quote.origin.currency.metadata.symbol}
              </wui-text>`
                : html `<wui-shimmer width="80px" height="18px" variant="light"></wui-shimmer>`}
        </wui-flex>
      `;
        }
        const address = CoreHelperUtil.getPlainAddress(this.caipAddress) ?? '';
        const { name, image } = this.getWalletProperties({ namespace: this.namespace });
        const { icon: chainIcon, label: chainLabel } = NAMESPACE_LABELS[this.namespace] ?? {};
        return html `
      <wui-flex
        .padding=${['4', '3', '4', '3']}
        alignItems="center"
        justifyContent="space-between"
        gap="2"
      >
        <wui-wallet-switch
          profileName=${ifDefined(this.profileName)}
          address=${ifDefined(address)}
          imageSrc=${ifDefined(image)}
          alt=${ifDefined(name)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        <wui-wallet-switch
          profileName=${ifDefined(chainLabel)}
          address=${ifDefined(address)}
          icon=${ifDefined(chainIcon)}
          iconSize="xs"
          .enableGreenCircle=${false}
          alt=${ifDefined(chainLabel)}
          @click=${this.onConnectOtherWallet.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
      </wui-flex>
    `;
    }
    initializeNamespace() {
        const namespace = ChainController.state.activeChain;
        this.namespace = namespace;
        this.caipAddress = ChainController.getAccountData(namespace)?.caipAddress;
        this.profileName = ChainController.getAccountData(namespace)?.profileName ?? null;
        this.unsubscribe.push(ChainController.subscribeChainProp('accountState', accountState => this.onAccountStateChanged(accountState), namespace));
    }
    async fetchTokens() {
        if (this.namespace) {
            let caipNetwork = undefined;
            if (this.caipAddress) {
                const { chainId, chainNamespace } = ParseUtil.parseCaipAddress(this.caipAddress);
                const caipNetworkId = `${chainNamespace}:${chainId}`;
                const allNetworks = ChainController.getAllRequestedCaipNetworks();
                caipNetwork = allNetworks.find(net => net.caipNetworkId === caipNetworkId);
            }
            await PayController.fetchTokens({
                caipAddress: this.caipAddress,
                caipNetwork,
                namespace: this.namespace
            });
        }
    }
    fetchQuote() {
        if (this.amount && this.recipient && this.selectedPaymentAsset && this.paymentAsset) {
            const { address } = this.caipAddress ? ParseUtil.parseCaipAddress(this.caipAddress) : {};
            PayController.fetchQuote({
                amount: this.amount.toString(),
                address,
                sourceToken: this.selectedPaymentAsset,
                toToken: this.paymentAsset,
                recipient: this.recipient
            });
        }
    }
    getWalletProperties({ namespace }) {
        if (!namespace) {
            return {
                name: undefined,
                image: undefined
            };
        }
        const connectorId = this.activeConnectorIds[namespace];
        if (!connectorId) {
            return {
                name: undefined,
                image: undefined
            };
        }
        const connector = ConnectorController.getConnector({ id: connectorId, namespace });
        if (!connector) {
            return {
                name: undefined,
                image: undefined
            };
        }
        const connectorImage = AssetUtil.getConnectorImage(connector);
        return {
            name: connector.name,
            image: connectorImage
        };
    }
    paymentOptionsViewTemplate() {
        return html `
      <wui-flex flexDirection="column" gap="2">
        <wui-text variant="sm-regular" color="secondary">CHOOSE PAYMENT OPTION</wui-text>
        <wui-flex class="pay-options-container">${this.paymentOptionsTemplate()}</wui-flex>
      </wui-flex>
    `;
    }
    paymentOptionsTemplate() {
        const paymentAssets = this.getPaymentAssetFromTokenBalances();
        if (this.isFetchingTokenBalances) {
            return html `<w3m-pay-options-skeleton></w3m-pay-options-skeleton>`;
        }
        if (paymentAssets.length === 0) {
            return html `<w3m-pay-options-empty
        @connectOtherWallet=${this.onConnectOtherWallet.bind(this)}
      ></w3m-pay-options-empty>`;
        }
        const classes = {
            disabled: this.isFetchingQuote
        };
        return html `<w3m-pay-options
      class=${classMap(classes)}
      .options=${paymentAssets}
      .selectedPaymentAsset=${ifDefined(this.selectedPaymentAsset)}
      .onSelect=${this.onSelectedPaymentAssetChanged.bind(this)}
    ></w3m-pay-options>`;
    }
    amountWithFeeTemplate() {
        if (this.isFetchingQuote || !this.selectedPaymentAsset || this.quoteError) {
            return html `<w3m-pay-fees-skeleton></w3m-pay-fees-skeleton>`;
        }
        return html `<w3m-pay-fees></w3m-pay-fees>`;
    }
    paymentActionsTemplate() {
        const isLoading = this.isFetchingQuote || this.isFetchingTokenBalances;
        const isDisabled = this.isFetchingQuote ||
            this.isFetchingTokenBalances ||
            !this.selectedPaymentAsset ||
            Boolean(this.quoteError);
        const amount = NumberUtil.formatNumber(this.quote?.origin.amount ?? 0, {
            decimals: this.quote?.origin.currency.metadata.decimals ?? 0
        }).toString();
        if (this.selectedExchange) {
            if (isLoading || isDisabled) {
                return html `
          <wui-shimmer width="100%" height="48px" variant="light" ?rounded=${true}></wui-shimmer>
        `;
            }
            return html `<wui-button
        size="lg"
        fullWidth
        variant="accent-secondary"
        @click=${this.onPayWithExchange.bind(this)}
      >
        ${`Continue in ${this.selectedExchange.name}`}

        <wui-icon name="arrowRight" color="inherit" size="sm" slot="iconRight"></wui-icon>
      </wui-button>`;
        }
        return html `
      <wui-flex alignItems="center" justifyContent="space-between">
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="md-regular" color="secondary">Order Total</wui-text>

          ${isLoading || isDisabled
            ? html `<wui-shimmer width="58px" height="32px" variant="light"></wui-shimmer>`
            : html `<wui-flex alignItems="center" gap="01">
                <wui-text variant="h4-regular" color="primary">${formatAmount(amount)}</wui-text>

                <wui-text variant="lg-regular" color="secondary">
                  ${this.quote?.origin.currency.metadata.symbol || 'Unknown'}
                </wui-text>
              </wui-flex>`}
        </wui-flex>

        ${this.actionButtonTemplate({ isLoading, isDisabled })}
      </wui-flex>
    `;
    }
    actionButtonTemplate(params) {
        const allTransactionSteps = getTransactionsSteps(this.quote);
        const { isLoading, isDisabled } = params;
        let label = 'Pay';
        const isApprovalRequired = allTransactionSteps.length > 1 && this.completedTransactionsCount === 0;
        if (isApprovalRequired) {
            label = 'Approve';
        }
        return html `
      <wui-button
        size="lg"
        variant="accent-primary"
        ?loading=${isLoading || this.isPaymentInProgress}
        ?disabled=${isDisabled || this.isPaymentInProgress}
        @click=${() => {
            if (allTransactionSteps.length > 0) {
                this.onSendTransactions();
            }
            else {
                this.onTransfer();
            }
        }}
      >
        ${label}
        ${isLoading
            ? null
            : html `<wui-icon
              name="arrowRight"
              color="inherit"
              size="sm"
              slot="iconRight"
            ></wui-icon>`}
      </wui-button>
    `;
    }
    getPaymentAssetFromTokenBalances() {
        if (!this.namespace) {
            return [];
        }
        const balances = this.tokenBalances[this.namespace] ?? [];
        const paymentOptionsWithFormattedBalances = balances
            .map(balance => {
            try {
                return formatBalanceToPaymentAsset(balance);
            }
            catch (err) {
                return null;
            }
        })
            .filter((option) => Boolean(option));
        const paymentOptionsToShow = paymentOptionsWithFormattedBalances.filter(option => {
            const { chainId: optionChainId } = ParseUtil.parseCaipNetworkId(option.network);
            const { chainId: paymentAssetChainId } = ParseUtil.parseCaipNetworkId(this.paymentAsset.network);
            if (HelpersUtil.isLowerCaseMatch(option.asset, this.paymentAsset.asset)) {
                return true;
            }
            if (this.selectedExchange) {
                return !HelpersUtil.isLowerCaseMatch(optionChainId.toString(), paymentAssetChainId.toString());
            }
            return true;
        });
        return paymentOptionsToShow;
    }
    onTokenBalancesChanged(tokenBalances) {
        this.tokenBalances = tokenBalances;
        const [paymentAsset] = this.getPaymentAssetFromTokenBalances();
        if (paymentAsset) {
            PayController.setSelectedPaymentAsset(paymentAsset);
        }
    }
    async onConnectOtherWallet() {
        await ConnectorController.connect();
        await ModalController.open({ view: 'PayQuote' });
    }
    onAccountStateChanged(accountState) {
        const { address: oldAddress } = this.caipAddress
            ? ParseUtil.parseCaipAddress(this.caipAddress)
            : {};
        this.caipAddress = accountState?.caipAddress;
        this.profileName = accountState?.profileName ?? null;
        if (oldAddress) {
            const { address: newAddress } = this.caipAddress
                ? ParseUtil.parseCaipAddress(this.caipAddress)
                : {};
            if (!newAddress) {
                ModalController.close();
            }
            else if (!HelpersUtil.isLowerCaseMatch(newAddress, oldAddress)) {
                this.resetAssetsState();
                this.resetQuoteState();
                this.fetchTokens();
            }
        }
    }
    onSelectedPaymentAssetChanged(paymentAsset) {
        if (!this.isFetchingQuote) {
            PayController.setSelectedPaymentAsset(paymentAsset);
        }
    }
    async onTransfer() {
        const transferStep = getTransferStep(this.quote);
        if (transferStep) {
            const isQuoteAssetSameAsSelectedPaymentAsset = HelpersUtil.isLowerCaseMatch(this.selectedPaymentAsset?.asset, transferStep.deposit.currency);
            if (!isQuoteAssetSameAsSelectedPaymentAsset) {
                throw new Error('Quote asset is not the same as the selected payment asset');
            }
            const currentAmount = this.selectedPaymentAsset?.amount ?? '0';
            const amountToTransfer = NumberUtil.formatNumber(transferStep.deposit.amount, {
                decimals: this.selectedPaymentAsset?.metadata.decimals ?? 0
            }).toString();
            const hasEnoughFunds = NumberUtil.bigNumber(currentAmount).gte(amountToTransfer);
            if (!hasEnoughFunds) {
                SnackController.showError('Insufficient funds');
                return;
            }
            if (this.quote && this.selectedPaymentAsset && this.caipAddress && this.namespace) {
                const { address: fromAddress } = ParseUtil.parseCaipAddress(this.caipAddress);
                await PayController.onTransfer({
                    chainNamespace: this.namespace,
                    fromAddress,
                    toAddress: transferStep.deposit.receiver,
                    amount: amountToTransfer,
                    paymentAsset: this.selectedPaymentAsset
                });
                PayController.setRequestId(transferStep.requestId);
                RouterController.push('PayLoading');
            }
        }
    }
    async onSendTransactions() {
        const currentAmount = this.selectedPaymentAsset?.amount ?? '0';
        const amountToSwap = NumberUtil.formatNumber(this.quote?.origin.amount ?? 0, {
            decimals: this.selectedPaymentAsset?.metadata.decimals ?? 0
        }).toString();
        const hasEnoughFunds = NumberUtil.bigNumber(currentAmount).gte(amountToSwap);
        if (!hasEnoughFunds) {
            SnackController.showError('Insufficient funds');
            return;
        }
        const allTransactionSteps = getTransactionsSteps(this.quote);
        const [transactionStep] = getTransactionsSteps(this.quote, this.completedTransactionsCount);
        if (transactionStep && this.namespace) {
            await PayController.onSendTransaction({
                namespace: this.namespace,
                transactionStep
            });
            this.completedTransactionsCount += 1;
            const hasCompletedAllTransactions = this.completedTransactionsCount === allTransactionSteps.length;
            if (hasCompletedAllTransactions) {
                PayController.setRequestId(transactionStep.requestId);
                RouterController.push('PayLoading');
            }
        }
    }
    onPayWithExchange() {
        if (this.exchangeUrlForQuote) {
            const popupWindow = CoreHelperUtil.returnOpenHref('', 'popupWindow', 'scrollbar=yes,width=480,height=720');
            if (!popupWindow) {
                throw new Error('Could not create popup window');
            }
            popupWindow.location.href = this.exchangeUrlForQuote;
            const transactionStep = getTransferStep(this.quote);
            if (transactionStep) {
                PayController.setRequestId(transactionStep.requestId);
            }
            PayController.initiatePayment();
            RouterController.push('PayLoading');
        }
    }
    resetAssetsState() {
        PayController.setSelectedPaymentAsset(null);
    }
    resetQuoteState() {
        PayController.resetQuoteState();
    }
};
W3mPayQuoteView.styles = styles;
__decorate([
    state()
], W3mPayQuoteView.prototype, "profileName", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "paymentAsset", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "namespace", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "caipAddress", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "amount", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "recipient", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "activeConnectorIds", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "selectedPaymentAsset", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "selectedExchange", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "isFetchingQuote", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "quoteError", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "quote", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "isFetchingTokenBalances", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "tokenBalances", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "isPaymentInProgress", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "exchangeUrlForQuote", void 0);
__decorate([
    state()
], W3mPayQuoteView.prototype, "completedTransactionsCount", void 0);
W3mPayQuoteView = __decorate([
    customElement('w3m-pay-quote-view')
], W3mPayQuoteView);
export { W3mPayQuoteView };
//# sourceMappingURL=index.js.map