var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { ErrorUtil } from '@reown/appkit-common';
import { AppKitError, ChainController, EventsController, RouterController, SendController, SnackController } from '@reown/appkit-controllers';
import { UiHelperUtil, customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-preview-item';
import '@reown/appkit-ui/wui-text';
import '../../partials/w3m-wallet-send-details/index.js';
import styles from './styles.js';
let W3mWalletSendPreviewView = class W3mWalletSendPreviewView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.token = SendController.state.token;
        this.sendTokenAmount = SendController.state.sendTokenAmount;
        this.receiverAddress = SendController.state.receiverAddress;
        this.receiverProfileName = SendController.state.receiverProfileName;
        this.receiverProfileImageUrl = SendController.state.receiverProfileImageUrl;
        this.caipNetwork = ChainController.state.activeCaipNetwork;
        this.loading = SendController.state.loading;
        this.params = RouterController.state.data?.send;
        this.unsubscribe.push(...[
            SendController.subscribe(val => {
                this.token = val.token;
                this.sendTokenAmount = val.sendTokenAmount;
                this.receiverAddress = val.receiverAddress;
                this.receiverProfileName = val.receiverProfileName;
                this.receiverProfileImageUrl = val.receiverProfileImageUrl;
                this.loading = val.loading;
            }),
            ChainController.subscribeKey('activeCaipNetwork', val => (this.caipNetwork = val))
        ]);
    }
    disconnectedCallback() {
        this.unsubscribe.forEach(unsubscribe => unsubscribe());
    }
    render() {
        return html ` <wui-flex flexDirection="column" .padding=${['0', '4', '4', '4']}>
      <wui-flex gap="2" flexDirection="column" .padding=${['0', '2', '0', '2']}>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex flexDirection="column" gap="01">
            <wui-text variant="sm-regular" color="secondary">Send</wui-text>
            ${this.sendValueTemplate()}
          </wui-flex>
          <wui-preview-item
            text="${this.sendTokenAmount
            ? UiHelperUtil.roundNumber(this.sendTokenAmount, 6, 5)
            : 'unknown'} ${this.token?.symbol}"
            .imageSrc=${this.token?.iconUrl}
          ></wui-preview-item>
        </wui-flex>
        <wui-flex>
          <wui-icon color="default" size="md" name="arrowBottom"></wui-icon>
        </wui-flex>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="sm-regular" color="secondary">To</wui-text>
          <wui-preview-item
            text="${this.receiverProfileName
            ? UiHelperUtil.getTruncateString({
                string: this.receiverProfileName,
                charsStart: 20,
                charsEnd: 0,
                truncate: 'end'
            })
            : UiHelperUtil.getTruncateString({
                string: this.receiverAddress ? this.receiverAddress : '',
                charsStart: 4,
                charsEnd: 4,
                truncate: 'middle'
            })}"
            address=${this.receiverAddress ?? ''}
            .imageSrc=${this.receiverProfileImageUrl ?? undefined}
            .isAddress=${true}
          ></wui-preview-item>
        </wui-flex>
      </wui-flex>
      <wui-flex flexDirection="column" .padding=${['6', '0', '0', '0']}>
        <w3m-wallet-send-details
          .caipNetwork=${this.caipNetwork}
          .receiverAddress=${this.receiverAddress}
        ></w3m-wallet-send-details>
        <wui-flex justifyContent="center" gap="1" .padding=${['3', '0', '0', '0']}>
          <wui-icon size="sm" color="default" name="warningCircle"></wui-icon>
          <wui-text variant="sm-regular" color="secondary">Review transaction carefully</wui-text>
        </wui-flex>
        <wui-flex justifyContent="center" gap="3" .padding=${['4', '0', '0', '0']}>
          <wui-button
            class="cancelButton"
            @click=${this.onCancelClick.bind(this)}
            size="lg"
            variant="neutral-secondary"
          >
            Cancel
          </wui-button>
          <wui-button
            class="sendButton"
            @click=${this.onSendClick.bind(this)}
            size="lg"
            variant="accent-primary"
            .loading=${this.loading}
          >
            Send
          </wui-button>
        </wui-flex>
      </wui-flex></wui-flex
    >`;
    }
    sendValueTemplate() {
        if (!this.params && this.token && this.sendTokenAmount) {
            const price = this.token.price;
            const totalValue = price * this.sendTokenAmount;
            return html `<wui-text variant="md-regular" color="primary"
        >$${totalValue.toFixed(2)}</wui-text
      >`;
        }
        return null;
    }
    async onSendClick() {
        if (!this.sendTokenAmount || !this.receiverAddress) {
            SnackController.showError('Please enter a valid amount and receiver address');
            return;
        }
        try {
            await SendController.sendToken();
            if (this.params) {
                RouterController.reset('WalletSendConfirmed');
            }
            else {
                SnackController.showSuccess('Transaction started');
                RouterController.replace('Account');
            }
        }
        catch (error) {
            let errMessage = 'Failed to send transaction';
            const isUserRejectedRequestError = error instanceof AppKitError &&
                error.originalName === ErrorUtil.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST;
            const isSendTransactionError = error instanceof AppKitError &&
                error.originalName === ErrorUtil.PROVIDER_RPC_ERROR_NAME.SEND_TRANSACTION_ERROR;
            if (isUserRejectedRequestError || isSendTransactionError) {
                errMessage = error.message;
            }
            EventsController.sendEvent({
                type: 'track',
                event: isUserRejectedRequestError ? 'SEND_REJECTED' : 'SEND_ERROR',
                properties: SendController.getSdkEventProperties(error)
            });
            SnackController.showError(errMessage);
        }
    }
    onCancelClick() {
        RouterController.goBack();
    }
};
W3mWalletSendPreviewView.styles = styles;
__decorate([
    state()
], W3mWalletSendPreviewView.prototype, "token", void 0);
__decorate([
    state()
], W3mWalletSendPreviewView.prototype, "sendTokenAmount", void 0);
__decorate([
    state()
], W3mWalletSendPreviewView.prototype, "receiverAddress", void 0);
__decorate([
    state()
], W3mWalletSendPreviewView.prototype, "receiverProfileName", void 0);
__decorate([
    state()
], W3mWalletSendPreviewView.prototype, "receiverProfileImageUrl", void 0);
__decorate([
    state()
], W3mWalletSendPreviewView.prototype, "caipNetwork", void 0);
__decorate([
    state()
], W3mWalletSendPreviewView.prototype, "loading", void 0);
__decorate([
    state()
], W3mWalletSendPreviewView.prototype, "params", void 0);
W3mWalletSendPreviewView = __decorate([
    customElement('w3m-wallet-send-preview-view')
], W3mWalletSendPreviewView);
export { W3mWalletSendPreviewView };
//# sourceMappingURL=index.js.map