var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { state } from 'lit/decorators.js';
import { SafeLocalStorage, SafeLocalStorageKeys } from '@reown/appkit-common';
import { ChainController, OptionsController, RouterController, SnackController } from '@reown/appkit-controllers';
import { ReownAuthentication } from '@reown/appkit-controllers/features';
import { UiHelperUtil, customElement } from '@reown/appkit-ui';
import styles from './styles.js';
let W3mDataCaptureView = class W3mDataCaptureView extends LitElement {
    constructor() {
        super(...arguments);
        this.email = RouterController.state.data?.email ?? ChainController.getAccountData()?.user?.email ?? '';
        this.address = ChainController.getAccountData()?.address ?? '';
        this.loading = false;
        this.appName = OptionsController.state.metadata?.name ?? 'AppKit';
        this.siwx = OptionsController.state.siwx;
        this.isRequired = Array.isArray(OptionsController.state.remoteFeatures?.emailCapture) &&
            OptionsController.state.remoteFeatures?.emailCapture.includes('required');
        this.recentEmails = this.getRecentEmails();
    }
    connectedCallback() {
        if (!this.siwx || !(this.siwx instanceof ReownAuthentication)) {
            SnackController.showError('ReownAuthentication is not initialized. Please contact support.');
        }
        super.connectedCallback();
    }
    firstUpdated() {
        this.loading = false;
        this.recentEmails = this.getRecentEmails();
        if (this.email) {
            this.onSubmit();
        }
    }
    render() {
        return html `
      <wui-flex flexDirection="column" .padding=${['3xs', 'm', 'm', 'm']} gap="l">
        ${this.hero()} ${this.paragraph()} ${this.emailInput()} ${this.recentEmailsWidget()}
        ${this.footerActions()}
      </wui-flex>
    `;
    }
    hero() {
        return html `
      <div class="hero" data-state=${this.loading ? 'loading' : 'default'}>
        ${this.heroRow(['id', 'mail', 'wallet', 'x', 'solana', 'qrCode'])}
        ${this.heroRow(['mail', 'farcaster', 'wallet', 'discord', 'mobile', 'qrCode'])}
        <div class="hero-row">
          ${this.heroIcon('github')} ${this.heroIcon('bank')}
          <wui-icon-box
            size="xl"
            iconSize="xxl"
            iconColor=${this.loading ? 'fg-100' : 'accent-100'}
            backgroundColor=${this.loading ? 'fg-100' : 'accent-100'}
            icon=${this.loading ? 'id' : 'user'}
            isOpaque
            class="hero-main-icon"
            data-state=${this.loading ? 'loading' : 'default'}
          >
          </wui-icon-box>
          ${this.heroIcon('id')} ${this.heroIcon('card')}
        </div>
        ${this.heroRow(['google', 'id', 'github', 'verify', 'apple', 'mobile'])}
      </div>
    `;
    }
    heroRow(icons) {
        return html `
      <div class="hero-row" data-state=${this.loading ? 'loading' : 'default'}>
        ${icons.map(this.heroIcon.bind(this))}
      </div>
    `;
    }
    heroIcon(icon) {
        return html `
      <wui-icon-box
        size="xl"
        iconSize="xxl"
        iconColor="fg-100"
        backgroundColor="fg-100"
        icon=${icon}
        data-state=${this.loading ? 'loading' : 'default'}
        isOpaque
        class="hero-row-icon"
      >
      </wui-icon-box>
    `;
    }
    paragraph() {
        if (this.loading) {
            return html `
        <wui-text variant="paragraph-400" color="fg-200" align="center"
          >We are verifying your account with email
          <wui-text variant="paragraph-600" color="accent-100">${this.email}</wui-text> and address
          <wui-text variant="paragraph-600" color="fg-100">
            ${UiHelperUtil.getTruncateString({
                string: this.address,
                charsEnd: 4,
                charsStart: 4,
                truncate: 'middle'
            })} </wui-text
          >, please wait a moment.</wui-text
        >
      `;
        }
        if (this.isRequired) {
            return html `
        <wui-text variant="paragraph-600" color="fg-100" align="center">
          ${this.appName} requires your email for authentication.
        </wui-text>
      `;
        }
        return html `
      <wui-flex flexDirection="column" gap="xs" alignItems="center">
        <wui-text variant="paragraph-600" color="fg-100" align="center" size>
          ${this.appName} would like to collect your email.
        </wui-text>

        <wui-text variant="small-400" color="fg-200" align="center">
          Don't worry, it's optional&mdash;you can skip this step.
        </wui-text>
      </wui-flex>
    `;
    }
    emailInput() {
        if (this.loading) {
            return null;
        }
        const keydownHandler = (event) => {
            if (event.key === 'Enter') {
                this.onSubmit();
            }
        };
        const changeHandler = (event) => {
            this.email = event.detail;
        };
        return html `
      <wui-flex flexDirection="column">
        <wui-email-input
          .value=${this.email}
          .disabled=${this.loading}
          @inputChange=${changeHandler}
          @keydown=${keydownHandler}
        ></wui-email-input>

        <w3m-email-suffixes-widget
          .email=${this.email}
          @change=${changeHandler}
        ></w3m-email-suffixes-widget>
      </wui-flex>
    `;
    }
    recentEmailsWidget() {
        if (this.recentEmails.length === 0 || this.loading) {
            return null;
        }
        const recentEmailSelectHandler = (event) => {
            this.email = event.detail;
            this.onSubmit();
        };
        return html `
      <w3m-recent-emails-widget
        .emails=${this.recentEmails}
        @select=${recentEmailSelectHandler}
      ></w3m-recent-emails-widget>
    `;
    }
    footerActions() {
        return html `
      <wui-flex flexDirection="row" fullWidth gap="s">
        ${this.isRequired
            ? null
            : html `<wui-button
              size="lg"
              variant="neutral"
              fullWidth
              .disabled=${this.loading}
              @click=${this.onSkip.bind(this)}
              >Skip this step</wui-button
            >`}

        <wui-button
          size="lg"
          variant="main"
          type="submit"
          fullWidth
          .disabled=${!this.email || !this.isValidEmail(this.email)}
          .loading=${this.loading}
          @click=${this.onSubmit.bind(this)}
        >
          Continue
        </wui-button>
      </wui-flex>
    `;
    }
    async onSubmit() {
        if (!(this.siwx instanceof ReownAuthentication)) {
            SnackController.showError('ReownAuthentication is not initialized. Please contact support.');
            return;
        }
        const account = ChainController.getActiveCaipAddress();
        if (!account) {
            throw new Error('Account is not connected.');
        }
        if (!this.isValidEmail(this.email)) {
            SnackController.showError('Please provide a valid email.');
            return;
        }
        try {
            this.loading = true;
            const otp = await this.siwx.requestEmailOtp({
                email: this.email,
                account
            });
            this.pushRecentEmail(this.email);
            if (otp.uuid === null) {
                RouterController.replace('SIWXSignMessage');
            }
            else {
                RouterController.replace('DataCaptureOtpConfirm', { email: this.email });
            }
        }
        catch (error) {
            SnackController.showError('Failed to send email OTP');
            this.loading = false;
        }
    }
    onSkip() {
        RouterController.replace('SIWXSignMessage');
    }
    getRecentEmails() {
        const recentEmails = SafeLocalStorage.getItem(SafeLocalStorageKeys.RECENT_EMAILS);
        const parsedEmails = recentEmails ? recentEmails.split(',') : [];
        return parsedEmails.filter(this.isValidEmail.bind(this)).slice(0, 3);
    }
    pushRecentEmail(email) {
        const recentEmails = this.getRecentEmails();
        const newEmails = Array.from(new Set([email, ...recentEmails])).slice(0, 3);
        SafeLocalStorage.setItem(SafeLocalStorageKeys.RECENT_EMAILS, newEmails.join(','));
    }
    isValidEmail(email) {
        return /^\S+@\S+\.\S+$/u.test(email);
    }
};
W3mDataCaptureView.styles = [styles];
__decorate([
    state()
], W3mDataCaptureView.prototype, "email", void 0);
__decorate([
    state()
], W3mDataCaptureView.prototype, "address", void 0);
__decorate([
    state()
], W3mDataCaptureView.prototype, "loading", void 0);
__decorate([
    state()
], W3mDataCaptureView.prototype, "appName", void 0);
__decorate([
    state()
], W3mDataCaptureView.prototype, "siwx", void 0);
__decorate([
    state()
], W3mDataCaptureView.prototype, "isRequired", void 0);
__decorate([
    state()
], W3mDataCaptureView.prototype, "recentEmails", void 0);
W3mDataCaptureView = __decorate([
    customElement('w3m-data-capture-view')
], W3mDataCaptureView);
export { W3mDataCaptureView };
//# sourceMappingURL=index.js.map