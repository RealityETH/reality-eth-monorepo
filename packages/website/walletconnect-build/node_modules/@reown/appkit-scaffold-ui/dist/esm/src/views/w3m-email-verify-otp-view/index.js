var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChainController, ConnectionController, CoreHelperUtil, EventsController, ModalController, OptionsController, RouterController, SnackController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import { W3mEmailOtpWidget } from '../../utils/w3m-email-otp-widget/index.js';
let W3mEmailVerifyOtpView = class W3mEmailVerifyOtpView extends W3mEmailOtpWidget {
    constructor() {
        super(...arguments);
        this.onOtpSubmit = async (otp) => {
            try {
                if (this.authConnector) {
                    const namespace = ChainController.state.activeChain;
                    const connectionsByNamespace = ConnectionController.getConnections(namespace);
                    const isMultiWalletEnabled = OptionsController.state.remoteFeatures?.multiWallet;
                    const hasConnections = connectionsByNamespace.length > 0;
                    await this.authConnector.provider.connectOtp({ otp });
                    EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' });
                    if (namespace) {
                        await ConnectionController.connectExternal(this.authConnector, namespace);
                    }
                    else {
                        throw new Error('Active chain is not set on ChainController');
                    }
                    if (OptionsController.state.remoteFeatures?.emailCapture) {
                        return;
                    }
                    if (OptionsController.state.siwx) {
                        ModalController.close();
                        return;
                    }
                    if (hasConnections && isMultiWalletEnabled) {
                        RouterController.replace('ProfileWallets');
                        SnackController.showSuccess('New Wallet Added');
                        return;
                    }
                    ModalController.close();
                }
            }
            catch (error) {
                EventsController.sendEvent({
                    type: 'track',
                    event: 'EMAIL_VERIFICATION_CODE_FAIL',
                    properties: { message: CoreHelperUtil.parseError(error) }
                });
                throw error;
            }
        };
        this.onOtpResend = async (email) => {
            if (this.authConnector) {
                await this.authConnector.provider.connectEmail({ email });
                EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_SENT' });
            }
        };
    }
};
W3mEmailVerifyOtpView = __decorate([
    customElement('w3m-email-verify-otp-view')
], W3mEmailVerifyOtpView);
export { W3mEmailVerifyOtpView };
//# sourceMappingURL=index.js.map