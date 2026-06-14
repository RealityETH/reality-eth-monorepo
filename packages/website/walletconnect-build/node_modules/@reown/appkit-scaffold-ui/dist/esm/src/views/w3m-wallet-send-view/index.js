var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import {} from '@reown/appkit-common';
import { AssetUtil, ChainController, ConnectionController, ConstantsUtil, CoreHelperUtil, ModalController, RouterController, SendController, SnackController, SwapController } from '@reown/appkit-controllers';
import { BalanceUtil } from '@reown/appkit-controllers/utils';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon-box';
import '@reown/appkit-ui/wui-separator';
import '../../partials/w3m-input-address/index.js';
import '../../partials/w3m-input-token/index.js';
import styles from './styles.js';
const SEND_BUTTON_MESSAGE = {
    INSUFFICIENT_FUNDS: 'Insufficient Funds',
    INCORRECT_VALUE: 'Incorrect Value',
    INVALID_ADDRESS: 'Invalid Address',
    ADD_ADDRESS: 'Add Address',
    ADD_AMOUNT: 'Add Amount',
    SELECT_TOKEN: 'Select Token',
    PREVIEW_SEND: 'Preview Send'
};
let W3mWalletSendView = class W3mWalletSendView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.isTryingToChooseDifferentWallet = false;
        this.token = SendController.state.token;
        this.sendTokenAmount = SendController.state.sendTokenAmount;
        this.receiverAddress = SendController.state.receiverAddress;
        this.receiverProfileName = SendController.state.receiverProfileName;
        this.loading = SendController.state.loading;
        this.params = RouterController.state.data?.send;
        this.caipAddress = ChainController.getAccountData()?.caipAddress;
        this.message = SEND_BUTTON_MESSAGE.PREVIEW_SEND;
        this.disconnecting = false;
        if (this.token && !this.params) {
            this.fetchBalances();
            this.fetchNetworkPrice();
        }
        const unsubscribe = ChainController.subscribeKey('activeCaipAddress', val => {
            if (!val && this.isTryingToChooseDifferentWallet) {
                this.isTryingToChooseDifferentWallet = false;
                ModalController.open({
                    view: 'Connect',
                    data: {
                        redirectView: 'WalletSend'
                    }
                }).catch(() => null);
                unsubscribe();
            }
        });
        this.unsubscribe.push(...[
            ChainController.subscribeAccountStateProp('caipAddress', val => {
                this.caipAddress = val;
            }),
            SendController.subscribe(val => {
                this.token = val.token;
                this.sendTokenAmount = val.sendTokenAmount;
                this.receiverAddress = val.receiverAddress;
                this.receiverProfileName = val.receiverProfileName;
                this.loading = val.loading;
            })
        ]);
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    async firstUpdated() {
        await this.handleSendParameters();
    }
    render() {
        this.getMessage();
        const isReadOnly = Boolean(this.params);
        return html ` <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4']}>
      <wui-flex class="inputContainer" gap="2" flexDirection="column">
        <w3m-input-token
          .token=${this.token}
          .sendTokenAmount=${this.sendTokenAmount}
          ?readOnly=${isReadOnly}
          ?isInsufficientBalance=${this.message === SEND_BUTTON_MESSAGE.INSUFFICIENT_FUNDS}
        ></w3m-input-token>
        <wui-icon-box size="md" variant="secondary" icon="arrowBottom"></wui-icon-box>
        <w3m-input-address
          ?readOnly=${isReadOnly}
          .value=${this.receiverProfileName ? this.receiverProfileName : this.receiverAddress}
        ></w3m-input-address>
      </wui-flex>
      ${this.buttonTemplate()}
    </wui-flex>`;
    }
    async fetchBalances() {
        await SendController.fetchTokenBalance();
        SendController.fetchNetworkBalance();
    }
    async fetchNetworkPrice() {
        await SwapController.getNetworkTokenPrice();
    }
    onButtonClick() {
        RouterController.push('WalletSendPreview', {
            send: this.params
        });
    }
    onFundWalletClick() {
        RouterController.push('FundWallet', {
            redirectView: 'WalletSend'
        });
    }
    async onConnectDifferentWalletClick() {
        try {
            this.isTryingToChooseDifferentWallet = true;
            this.disconnecting = true;
            await ConnectionController.disconnect();
        }
        finally {
            this.disconnecting = false;
        }
    }
    getMessage() {
        this.message = SEND_BUTTON_MESSAGE.PREVIEW_SEND;
        if (this.receiverAddress &&
            !CoreHelperUtil.isAddress(this.receiverAddress, ChainController.state.activeChain)) {
            this.message = SEND_BUTTON_MESSAGE.INVALID_ADDRESS;
        }
        if (!this.receiverAddress) {
            this.message = SEND_BUTTON_MESSAGE.ADD_ADDRESS;
        }
        if (this.sendTokenAmount &&
            this.token &&
            this.sendTokenAmount > Number(this.token.quantity.numeric)) {
            this.message = SEND_BUTTON_MESSAGE.INSUFFICIENT_FUNDS;
        }
        if (!this.sendTokenAmount) {
            this.message = SEND_BUTTON_MESSAGE.ADD_AMOUNT;
        }
        if (this.sendTokenAmount && this.token?.price) {
            const value = this.sendTokenAmount * this.token.price;
            if (!value) {
                this.message = SEND_BUTTON_MESSAGE.INCORRECT_VALUE;
            }
        }
        if (!this.token) {
            this.message = SEND_BUTTON_MESSAGE.SELECT_TOKEN;
        }
    }
    buttonTemplate() {
        const isDisabled = !this.message.startsWith(SEND_BUTTON_MESSAGE.PREVIEW_SEND);
        const isInsufficientBalance = this.message === SEND_BUTTON_MESSAGE.INSUFFICIENT_FUNDS;
        const isReadOnly = Boolean(this.params);
        if (isInsufficientBalance && !isReadOnly) {
            return html `
        <wui-flex .margin=${['4', '0', '0', '0']} flexDirection="column" gap="4">
          <wui-button
            @click=${this.onFundWalletClick.bind(this)}
            size="lg"
            variant="accent-secondary"
            fullWidth
          >
            Fund Wallet
          </wui-button>

          <wui-separator data-testid="wui-separator" text="or"></wui-separator>

          <wui-button
            @click=${this.onConnectDifferentWalletClick.bind(this)}
            size="lg"
            variant="neutral-secondary"
            fullWidth
            ?loading=${this.disconnecting}
          >
            Connect a different wallet
          </wui-button>
        </wui-flex>
      `;
        }
        return html `<wui-flex .margin=${['4', '0', '0', '0']}>
      <wui-button
        @click=${this.onButtonClick.bind(this)}
        ?disabled=${isDisabled}
        size="lg"
        variant="accent-primary"
        ?loading=${this.loading}
        fullWidth
      >
        ${this.message}
      </wui-button>
    </wui-flex>`;
    }
    async handleSendParameters() {
        this.loading = true;
        if (!this.params) {
            this.loading = false;
            return;
        }
        const amount = Number(this.params.amount);
        if (isNaN(amount)) {
            SnackController.showError('Invalid amount');
            this.loading = false;
            return;
        }
        const { namespace, chainId, assetAddress } = this.params;
        if (!ConstantsUtil.SEND_PARAMS_SUPPORTED_CHAINS.includes(namespace)) {
            SnackController.showError(`Chain "${namespace}" is not supported for send parameters`);
            this.loading = false;
            return;
        }
        const caipNetwork = ChainController.getCaipNetworkById(chainId, namespace);
        if (!caipNetwork) {
            SnackController.showError(`Network with id "${chainId}" not found`);
            this.loading = false;
            return;
        }
        try {
            const { balance, name, symbol, decimals } = await BalanceUtil.fetchERC20Balance({
                caipAddress: this.caipAddress,
                assetAddress,
                caipNetwork
            });
            if (!name || !symbol || !decimals || !balance) {
                SnackController.showError('Token not found');
                return;
            }
            SendController.setToken({
                name,
                symbol,
                chainId: caipNetwork.id.toString(),
                address: `${caipNetwork.chainNamespace}:${caipNetwork.id}:${assetAddress}`,
                value: 0,
                price: 0,
                quantity: {
                    decimals: decimals.toString(),
                    numeric: balance.toString()
                },
                iconUrl: AssetUtil.getTokenImage(symbol) ?? ''
            });
            SendController.setTokenAmount(amount);
            SendController.setReceiverAddress(this.params.to);
        }
        catch (err) {
            console.error('Failed to load token information:', err);
            SnackController.showError('Failed to load token information');
        }
        finally {
            this.loading = false;
        }
    }
};
W3mWalletSendView.styles = styles;
__decorate([
    state()
], W3mWalletSendView.prototype, "token", void 0);
__decorate([
    state()
], W3mWalletSendView.prototype, "sendTokenAmount", void 0);
__decorate([
    state()
], W3mWalletSendView.prototype, "receiverAddress", void 0);
__decorate([
    state()
], W3mWalletSendView.prototype, "receiverProfileName", void 0);
__decorate([
    state()
], W3mWalletSendView.prototype, "loading", void 0);
__decorate([
    state()
], W3mWalletSendView.prototype, "params", void 0);
__decorate([
    state()
], W3mWalletSendView.prototype, "caipAddress", void 0);
__decorate([
    state()
], W3mWalletSendView.prototype, "message", void 0);
__decorate([
    state()
], W3mWalletSendView.prototype, "disconnecting", void 0);
W3mWalletSendView = __decorate([
    customElement('w3m-wallet-send-view')
], W3mWalletSendView);
export { W3mWalletSendView };
//# sourceMappingURL=index.js.map