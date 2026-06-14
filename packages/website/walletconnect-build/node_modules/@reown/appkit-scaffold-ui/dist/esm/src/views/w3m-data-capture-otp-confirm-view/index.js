var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { state } from 'lit/decorators.js';
import { ChainController, OptionsController, RouterController, SnackController } from '@reown/appkit-controllers';
import { ReownAuthentication } from '@reown/appkit-controllers/features';
import { customElement } from '@reown/appkit-ui';
import { W3mEmailOtpWidget } from '../../utils/w3m-email-otp-widget/index.js';
let W3mDataCaptureOtpConfirmView = class W3mDataCaptureOtpConfirmView extends W3mEmailOtpWidget {
    constructor() {
        super(...arguments);
        this.siwx = OptionsController.state.siwx;
        this.onOtpSubmit = async (otp) => {
            await this.siwx.confirmEmailOtp({ code: otp });
            RouterController.replace('SIWXSignMessage');
        };
        this.onOtpResend = async (email) => {
            const accountData = ChainController.getAccountData();
            if (!accountData?.caipAddress) {
                throw new Error('No account data found');
            }
            await this.siwx.requestEmailOtp({
                email,
                account: accountData.caipAddress
            });
        };
    }
    connectedCallback() {
        if (!this.siwx || !(this.siwx instanceof ReownAuthentication)) {
            SnackController.showError('ReownAuthentication is not initialized.');
        }
        super.connectedCallback();
    }
    shouldSubmitOnOtpChange() {
        return this.otp.length === W3mEmailOtpWidget.OTP_LENGTH;
    }
};
__decorate([
    state()
], W3mDataCaptureOtpConfirmView.prototype, "siwx", void 0);
W3mDataCaptureOtpConfirmView = __decorate([
    customElement('w3m-data-capture-otp-confirm-view')
], W3mDataCaptureOtpConfirmView);
export { W3mDataCaptureOtpConfirmView };
//# sourceMappingURL=index.js.map