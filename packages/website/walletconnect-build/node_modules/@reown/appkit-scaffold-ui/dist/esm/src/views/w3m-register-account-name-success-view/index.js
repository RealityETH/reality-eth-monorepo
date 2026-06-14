var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { NavigationUtil } from '@reown/appkit-common';
import { CoreHelperUtil, RouterController } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-icon-box';
import '@reown/appkit-ui/wui-link';
import '@reown/appkit-ui/wui-text';
import styles from './styles.js';
let W3mRegisterAccountNameSuccess = class W3mRegisterAccountNameSuccess extends LitElement {
    render() {
        return html `
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="6"
        .padding=${['0', '0', '4', '0']}
      >
        ${this.onboardingTemplate()} ${this.buttonsTemplate()}
        <wui-link
          @click=${() => {
            CoreHelperUtil.openHref(NavigationUtil.URLS.FAQ, '_blank');
        }}
        >
          Learn more
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-link>
      </wui-flex>
    `;
    }
    onboardingTemplate() {
        return html ` <wui-flex
      flexDirection="column"
      gap="6"
      alignItems="center"
      .padding=${['0', '6', '0', '6']}
    >
      <wui-flex gap="3" alignItems="center" justifyContent="center">
        <wui-icon-box size="xl" color="success" icon="checkmark"></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="3">
        <wui-text align="center" variant="md-medium" color="primary">
          Account name chosen successfully
        </wui-text>
        <wui-text align="center" variant="md-regular" color="primary">
          You can now fund your account and trade crypto
        </wui-text>
      </wui-flex>
    </wui-flex>`;
    }
    buttonsTemplate() {
        return html `<wui-flex
      .padding=${['0', '4', '0', '4']}
      gap="3"
      class="continue-button-container"
    >
      <wui-button fullWidth size="lg" borderRadius="xs" @click=${this.redirectToAccount.bind(this)}
        >Let's Go!
      </wui-button>
    </wui-flex>`;
    }
    redirectToAccount() {
        RouterController.replace('Account');
    }
};
W3mRegisterAccountNameSuccess.styles = styles;
W3mRegisterAccountNameSuccess = __decorate([
    customElement('w3m-register-account-name-success-view')
], W3mRegisterAccountNameSuccess);
export { W3mRegisterAccountNameSuccess };
//# sourceMappingURL=index.js.map