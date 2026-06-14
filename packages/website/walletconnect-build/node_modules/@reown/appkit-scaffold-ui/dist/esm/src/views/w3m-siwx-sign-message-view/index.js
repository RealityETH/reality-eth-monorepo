var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { OptionsController, RouterController, SIWXUtil, SnackController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-text';
import '../../partials/w3m-siwx-sign-message-thumbnails/index.js';
let W3mSIWXSignMessageView = class W3mSIWXSignMessageView extends LitElement {
    constructor() {
        super(...arguments);
        this.dappName = OptionsController.state.metadata?.name;
        this.isCancelling = false;
        this.isSigning = false;
    }
    render() {
        return html `
      <wui-flex justifyContent="center" .padding=${['8', '0', '6', '0']}>
        <w3m-siwx-sign-message-thumbnails></w3m-siwx-sign-message-thumbnails>
      </wui-flex>
      <wui-flex .padding=${['0', '20', '5', '20']} gap="3" justifyContent="space-between">
        <wui-text variant="lg-medium" align="center" color="primary"
          >${this.dappName ?? 'Dapp'} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${['0', '10', '4', '10']} gap="3" justifyContent="space-between">
        <wui-text variant="md-regular" align="center" color="secondary"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${['4', '5', '5', '5']} gap="3" justifyContent="space-between">
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral-secondary"
          ?loading=${this.isCancelling}
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          ${this.isCancelling ? 'Cancelling...' : 'Cancel'}
        </wui-button>
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral-primary"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning ? 'Signing...' : 'Sign'}
        </wui-button>
      </wui-flex>
    `;
    }
    async onSign() {
        this.isSigning = true;
        try {
            await SIWXUtil.requestSignMessage();
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('OTP is required')) {
                SnackController.showError({
                    message: 'Something went wrong. We need to verify your account again.'
                });
                RouterController.replace('DataCapture');
                return;
            }
            throw error;
        }
        finally {
            this.isSigning = false;
        }
    }
    async onCancel() {
        this.isCancelling = true;
        await SIWXUtil.cancelSignMessage().finally(() => (this.isCancelling = false));
    }
};
__decorate([
    state()
], W3mSIWXSignMessageView.prototype, "isCancelling", void 0);
__decorate([
    state()
], W3mSIWXSignMessageView.prototype, "isSigning", void 0);
W3mSIWXSignMessageView = __decorate([
    customElement('w3m-siwx-sign-message-view')
], W3mSIWXSignMessageView);
export { W3mSIWXSignMessageView };
//# sourceMappingURL=index.js.map