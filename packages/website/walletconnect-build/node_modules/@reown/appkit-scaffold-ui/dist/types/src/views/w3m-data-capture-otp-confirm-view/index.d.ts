import { type OnOtpResendFn, type OnOtpSubmitFn, W3mEmailOtpWidget } from '../../utils/w3m-email-otp-widget/index.js';
export declare class W3mDataCaptureOtpConfirmView extends W3mEmailOtpWidget {
    private siwx;
    connectedCallback(): void;
    onOtpSubmit: OnOtpSubmitFn;
    shouldSubmitOnOtpChange(): boolean;
    onOtpResend: OnOtpResendFn;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-data-capture-otp-confirm-view': W3mDataCaptureOtpConfirmView;
    }
}
