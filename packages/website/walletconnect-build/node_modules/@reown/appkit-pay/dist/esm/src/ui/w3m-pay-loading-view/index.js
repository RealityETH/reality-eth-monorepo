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
import { AssetUtil, ChainController, ConnectorController } from '@reown/appkit-controllers';
import { UiHelperUtil, customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-image';
import '@reown/appkit-ui/wui-loading-spinner';
import '@reown/appkit-ui/wui-pulse';
import '@reown/appkit-ui/wui-separator';
import '@reown/appkit-ui/wui-text';
import { HelpersUtil } from '@reown/appkit-utils';
import { PayController } from '../../controllers/PayController.js';
import { formatAmount } from '../../utils/AssetUtil.js';
import { STEPS, TERMINAL_STATES } from './constants.js';
import styles from './styles.js';
const STEP_COMPLETED_STATUSES = {
    received: ['pending', 'success', 'submitted'],
    processing: ['success', 'submitted'],
    sending: ['success', 'submitted']
};
const POLLING_INTERVAL_MS = 3000;
let W3mPayLoadingView = class W3mPayLoadingView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.pollingInterval = null;
        this.paymentAsset = PayController.state.paymentAsset;
        this.quoteStatus = PayController.state.quoteStatus;
        this.quote = PayController.state.quote;
        this.amount = PayController.state.amount;
        this.namespace = undefined;
        this.caipAddress = undefined;
        this.profileName = null;
        this.activeConnectorIds = ConnectorController.state.activeConnectorIds;
        this.selectedExchange = PayController.state.selectedExchange;
        this.initializeNamespace();
        this.unsubscribe.push(...[
            PayController.subscribeKey('quoteStatus', val => (this.quoteStatus = val)),
            PayController.subscribeKey('quote', val => (this.quote = val)),
            ConnectorController.subscribeKey('activeConnectorIds', ids => (this.activeConnectorIds = ids)),
            PayController.subscribeKey('selectedExchange', val => (this.selectedExchange = val))
        ]);
    }
    connectedCallback() {
        super.connectedCallback();
        this.startPolling();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.stopPolling();
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        return html `
      <wui-flex flexDirection="column" .padding=${['3', '0', '0', '0']} gap="2">
        ${this.tokenTemplate()} ${this.paymentTemplate()} ${this.paymentLifecycleTemplate()}
      </wui-flex>
    `;
    }
    tokenTemplate() {
        const amount = formatAmount(this.amount || '0');
        const symbol = this.paymentAsset.metadata.symbol ?? 'Unknown';
        const allNetworks = ChainController.getAllRequestedCaipNetworks();
        const targetNetwork = allNetworks.find(net => net.caipNetworkId === this.paymentAsset.network);
        const hasTransactionFailed = this.quoteStatus === 'failure' ||
            this.quoteStatus === 'timeout' ||
            this.quoteStatus === 'refund';
        const hasTransactionSucceeded = this.quoteStatus === 'success' || this.quoteStatus === 'submitted';
        if (hasTransactionSucceeded) {
            return html `<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image success">
          <wui-icon name="checkmark" color="success" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`;
        }
        if (hasTransactionFailed) {
            return html `<wui-flex alignItems="center" justifyContent="center">
        <wui-flex justifyContent="center" alignItems="center" class="token-image error">
          <wui-icon name="close" color="error" size="inherit"></wui-icon>
        </wui-flex>
      </wui-flex>`;
        }
        return html `
      <wui-flex alignItems="center" justifyContent="center">
        <wui-flex class="token-image-container">
          <wui-pulse size="125px" rings="3" duration="4" opacity="0.5" variant="accent-primary">
            <wui-flex justifyContent="center" alignItems="center" class="token-image loading">
              <wui-icon name="paperPlaneTitle" color="accent-primary" size="inherit"></wui-icon>
            </wui-flex>
          </wui-pulse>

          <wui-flex
            justifyContent="center"
            alignItems="center"
            class="token-badge-container loading"
          >
            <wui-flex
              alignItems="center"
              justifyContent="center"
              gap="01"
              padding="1"
              class="token-badge"
            >
              <wui-image
                src=${ifDefined(AssetUtil.getNetworkImage(targetNetwork))}
                class="chain-image"
                size="mdl"
              ></wui-image>

              <wui-text variant="lg-regular" color="primary">${amount} ${symbol}</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `;
    }
    paymentTemplate() {
        return html `
      <wui-flex flexDirection="column" gap="2" .padding=${['0', '6', '0', '6']}>
        ${this.renderPayment()}
        <wui-separator></wui-separator>
        ${this.renderWallet()}
      </wui-flex>
    `;
    }
    paymentLifecycleTemplate() {
        const stepsWithStatus = this.getStepsWithStatus();
        return html `
      <wui-flex flexDirection="column" padding="4" gap="2" class="payment-lifecycle-container">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">PAYMENT CYCLE</wui-text>

          ${this.renderPaymentCycleBadge()}
        </wui-flex>

        <wui-flex flexDirection="column" gap="5" .padding=${['2', '0', '2', '0']}>
          ${stepsWithStatus.map(step => this.renderStep(step))}
        </wui-flex>
      </wui-flex>
    `;
    }
    renderPaymentCycleBadge() {
        const hasTransactionFailed = this.quoteStatus === 'failure' ||
            this.quoteStatus === 'timeout' ||
            this.quoteStatus === 'refund';
        const hasTransactionSucceeded = this.quoteStatus === 'success' || this.quoteStatus === 'submitted';
        if (hasTransactionFailed) {
            return html `
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge error"
          gap="1"
        >
          <wui-icon name="close" color="error" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="error">Failed</wui-text>
        </wui-flex>
      `;
        }
        if (hasTransactionSucceeded) {
            return html `
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge success"
          gap="1"
        >
          <wui-icon name="checkmark" color="success" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="success">Completed</wui-text>
        </wui-flex>
      `;
        }
        const timeEstimate = this.quote?.timeInSeconds ?? 0;
        return html `
      <wui-flex alignItems="center" justifyContent="space-between" gap="3">
        <wui-flex
          justifyContent="center"
          alignItems="center"
          class="payment-step-badge loading"
          gap="1"
        >
          <wui-icon name="clock" color="default" size="xs"></wui-icon>
          <wui-text variant="sm-regular" color="primary">Est. ${timeEstimate} sec</wui-text>
        </wui-flex>

        <wui-icon name="chevronBottom" color="default" size="xxs"></wui-icon>
      </wui-flex>
    `;
    }
    renderPayment() {
        const allNetworks = ChainController.getAllRequestedCaipNetworks();
        const targetNetwork = allNetworks.find(net => {
            const network = this.quote?.origin.currency.network;
            if (!network) {
                return false;
            }
            const { chainId } = ParseUtil.parseCaipNetworkId(network);
            return HelpersUtil.isLowerCaseMatch(net.id.toString(), chainId.toString());
        });
        const formatBigNumber = NumberUtil.formatNumber(this.quote?.origin.amount || '0', {
            decimals: this.quote?.origin.currency.metadata.decimals ?? 0
        }).toString();
        const formattedAmount = formatAmount(formatBigNumber);
        const symbol = this.quote?.origin.currency.metadata.symbol ?? 'Unknown';
        return html `
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${['3', '0', '3', '0']}
      >
        <wui-text variant="lg-regular" color="secondary">Payment Method</wui-text>

        <wui-flex flexDirection="column" alignItems="flex-end" gap="1">
          <wui-flex alignItems="center" gap="01">
            <wui-text variant="lg-regular" color="primary">${formattedAmount}</wui-text>
            <wui-text variant="lg-regular" color="secondary">${symbol}</wui-text>
          </wui-flex>

          <wui-flex alignItems="center" gap="1">
            <wui-text variant="md-regular" color="secondary">on</wui-text>
            <wui-image
              src=${ifDefined(AssetUtil.getNetworkImage(targetNetwork))}
              size="xs"
            ></wui-image>
            <wui-text variant="md-regular" color="secondary">${targetNetwork?.name}</wui-text>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `;
    }
    renderWallet() {
        return html `
      <wui-flex
        alignItems="flex-start"
        justifyContent="space-between"
        .padding=${['3', '0', '3', '0']}
      >
        <wui-text variant="lg-regular" color="secondary">Wallet</wui-text>

        ${this.renderWalletText()}
      </wui-flex>
    `;
    }
    renderWalletText() {
        const { image } = this.getWalletProperties({ namespace: this.namespace });
        const { address } = this.caipAddress ? ParseUtil.parseCaipAddress(this.caipAddress) : {};
        const exchangeName = this.selectedExchange?.name;
        if (this.selectedExchange) {
            return html `
        <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
          <wui-text variant="lg-regular" color="primary">${exchangeName}</wui-text>
          <wui-image src=${ifDefined(this.selectedExchange.imageUrl)} size="mdl"></wui-image>
        </wui-flex>
      `;
        }
        return html `
      <wui-flex alignItems="center" justifyContent="flex-end" gap="1">
        <wui-text variant="lg-regular" color="primary">
          ${UiHelperUtil.getTruncateString({
            string: this.profileName || address || exchangeName || '',
            charsStart: this.profileName ? 16 : 4,
            charsEnd: this.profileName ? 0 : 6,
            truncate: this.profileName ? 'end' : 'middle'
        })}
        </wui-text>

        <wui-image src=${ifDefined(image)} size="mdl"></wui-image>
      </wui-flex>
    `;
    }
    getStepsWithStatus() {
        const hasTransactionFailed = this.quoteStatus === 'failure' ||
            this.quoteStatus === 'timeout' ||
            this.quoteStatus === 'refund';
        if (hasTransactionFailed) {
            return STEPS.map(step => ({ ...step, status: 'failed' }));
        }
        return STEPS.map(step => {
            const completedStatuses = STEP_COMPLETED_STATUSES[step.id] ?? [];
            const status = completedStatuses.includes(this.quoteStatus) ? 'completed' : 'pending';
            return { ...step, status };
        });
    }
    renderStep({ title, icon, status }) {
        const classes = {
            'step-icon-box': true,
            success: status === 'completed'
        };
        return html `
      <wui-flex alignItems="center" gap="3">
        <wui-flex justifyContent="center" alignItems="center" class="step-icon-container">
          <wui-icon name=${icon} color="default" size="mdl"></wui-icon>

          <wui-flex alignItems="center" justifyContent="center" class=${classMap(classes)}>
            ${this.renderStatusIndicator(status)}
          </wui-flex>
        </wui-flex>

        <wui-text variant="md-regular" color="primary">${title}</wui-text>
      </wui-flex>
    `;
    }
    renderStatusIndicator(status) {
        if (status === 'completed') {
            return html `<wui-icon size="sm" color="success" name="checkmark"></wui-icon>`;
        }
        if (status === 'failed') {
            return html `<wui-icon size="sm" color="error" name="close"></wui-icon>`;
        }
        if (status === 'pending') {
            return html `<wui-loading-spinner color="accent-primary" size="sm"></wui-loading-spinner>`;
        }
        return null;
    }
    startPolling() {
        if (!this.pollingInterval) {
            this.fetchQuoteStatus();
            this.pollingInterval = setInterval(() => {
                this.fetchQuoteStatus();
            }, POLLING_INTERVAL_MS);
        }
    }
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
    async fetchQuoteStatus() {
        const requestId = PayController.state.requestId;
        if (!requestId || TERMINAL_STATES.includes(this.quoteStatus)) {
            this.stopPolling();
        }
        else {
            try {
                await PayController.fetchQuoteStatus({ requestId });
                if (TERMINAL_STATES.includes(this.quoteStatus)) {
                    this.stopPolling();
                }
            }
            catch {
                this.stopPolling();
            }
        }
    }
    initializeNamespace() {
        const namespace = ChainController.state.activeChain;
        this.namespace = namespace;
        this.caipAddress = ChainController.getAccountData(namespace)?.caipAddress;
        this.profileName = ChainController.getAccountData(namespace)?.profileName ?? null;
        this.unsubscribe.push(ChainController.subscribeChainProp('accountState', accountState => {
            this.caipAddress = accountState?.caipAddress;
            this.profileName = accountState?.profileName ?? null;
        }, namespace));
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
};
W3mPayLoadingView.styles = styles;
__decorate([
    state()
], W3mPayLoadingView.prototype, "paymentAsset", void 0);
__decorate([
    state()
], W3mPayLoadingView.prototype, "quoteStatus", void 0);
__decorate([
    state()
], W3mPayLoadingView.prototype, "quote", void 0);
__decorate([
    state()
], W3mPayLoadingView.prototype, "amount", void 0);
__decorate([
    state()
], W3mPayLoadingView.prototype, "namespace", void 0);
__decorate([
    state()
], W3mPayLoadingView.prototype, "caipAddress", void 0);
__decorate([
    state()
], W3mPayLoadingView.prototype, "profileName", void 0);
__decorate([
    state()
], W3mPayLoadingView.prototype, "activeConnectorIds", void 0);
__decorate([
    state()
], W3mPayLoadingView.prototype, "selectedExchange", void 0);
W3mPayLoadingView = __decorate([
    customElement('w3m-pay-loading-view')
], W3mPayLoadingView);
export { W3mPayLoadingView };
//# sourceMappingURL=index.js.map