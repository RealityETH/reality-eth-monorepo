var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ConnectionController, CoreHelperUtil, OnRampController, RouterController, SnackController, ThemeController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-icon-box';
import '@reown/appkit-ui/wui-link';
import '@reown/appkit-ui/wui-loading-thumbnail';
import '@reown/appkit-ui/wui-text';
import '@reown/appkit-ui/wui-visual';
import styles from './styles.js';
let W3mBuyInProgressView = class W3mBuyInProgressView extends LitElement {
    constructor() {
        super();
        this.unsubscribe = [];
        this.selectedOnRampProvider = OnRampController.state.selectedProvider;
        this.uri = ConnectionController.state.wcUri;
        this.ready = false;
        this.showRetry = false;
        this.buffering = false;
        this.error = false;
        this.isMobile = false;
        this.onRetry = undefined;
        this.unsubscribe.push(...[
            OnRampController.subscribeKey('selectedProvider', val => {
                this.selectedOnRampProvider = val;
            })
        ]);
    }
    disconnectedCallback() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    render() {
        let label = 'Continue in external window';
        if (this.error) {
            label = 'Buy failed';
        }
        else if (this.selectedOnRampProvider) {
            label = `Buy in ${this.selectedOnRampProvider?.label}`;
        }
        const subLabel = this.error
            ? 'Buy can be declined from your side or due to and error on the provider app'
            : `We’ll notify you once your Buy is processed`;
        return html `
      <wui-flex
        data-error=${ifDefined(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${['10', '5', '5', '5']}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-visual
            name=${ifDefined(this.selectedOnRampProvider?.name)}
            size="lg"
            class="provider-image"
          >
          </wui-visual>

          ${this.error ? null : this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${['4', '0', '0', '0']}
        >
          <wui-text variant="md-medium" color=${this.error ? 'error' : 'primary'}>
            ${label}
          </wui-text>
          <wui-text align="center" variant="sm-medium" color="secondary">${subLabel}</wui-text>
        </wui-flex>

        ${this.error ? this.tryAgainTemplate() : null}
      </wui-flex>

      <wui-flex .padding=${['0', '5', '5', '5']} justifyContent="center">
        <wui-link @click=${this.onCopyUri} color="secondary">
          <wui-icon size="sm" color="default" slot="iconLeft" name="copy"></wui-icon>
          Copy link
        </wui-link>
      </wui-flex>
    `;
    }
    onTryAgain() {
        if (!this.selectedOnRampProvider) {
            return;
        }
        this.error = false;
        CoreHelperUtil.openHref(this.selectedOnRampProvider.url, 'popupWindow', 'width=600,height=800,scrollbars=yes');
    }
    tryAgainTemplate() {
        if (!this.selectedOnRampProvider?.url) {
            return null;
        }
        return html `<wui-button size="md" variant="accent" @click=${this.onTryAgain.bind(this)}>
      <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
      Try again
    </wui-button>`;
    }
    loaderTemplate() {
        const borderRadiusMaster = ThemeController.state.themeVariables['--w3m-border-radius-master'];
        const radius = borderRadiusMaster ? parseInt(borderRadiusMaster.replace('px', ''), 10) : 4;
        return html `<wui-loading-thumbnail radius=${radius * 9}></wui-loading-thumbnail>`;
    }
    onCopyUri() {
        if (!this.selectedOnRampProvider?.url) {
            SnackController.showError('No link found');
            RouterController.goBack();
            return;
        }
        try {
            CoreHelperUtil.copyToClopboard(this.selectedOnRampProvider.url);
            SnackController.showSuccess('Link copied');
        }
        catch {
            SnackController.showError('Failed to copy');
        }
    }
};
W3mBuyInProgressView.styles = styles;
__decorate([
    state()
], W3mBuyInProgressView.prototype, "intervalId", void 0);
__decorate([
    state()
], W3mBuyInProgressView.prototype, "selectedOnRampProvider", void 0);
__decorate([
    state()
], W3mBuyInProgressView.prototype, "uri", void 0);
__decorate([
    state()
], W3mBuyInProgressView.prototype, "ready", void 0);
__decorate([
    state()
], W3mBuyInProgressView.prototype, "showRetry", void 0);
__decorate([
    state()
], W3mBuyInProgressView.prototype, "buffering", void 0);
__decorate([
    state()
], W3mBuyInProgressView.prototype, "error", void 0);
__decorate([
    property({ type: Boolean })
], W3mBuyInProgressView.prototype, "isMobile", void 0);
__decorate([
    property()
], W3mBuyInProgressView.prototype, "onRetry", void 0);
W3mBuyInProgressView = __decorate([
    customElement('w3m-buy-in-progress-view')
], W3mBuyInProgressView);
export { W3mBuyInProgressView };
//# sourceMappingURL=index.js.map