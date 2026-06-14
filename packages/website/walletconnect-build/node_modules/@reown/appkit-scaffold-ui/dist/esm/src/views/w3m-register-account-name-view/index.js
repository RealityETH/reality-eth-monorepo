var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { ConstantsUtil } from '@reown/appkit-common';
import { ChainController, CoreHelperUtil, EnsController, EventsController, SnackController, getPreferredAccountType } from '@reown/appkit-controllers';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-account-name-suggestion-item';
import '@reown/appkit-ui/wui-ens-input';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-icon-link';
import '@reown/appkit-ui/wui-loading-spinner';
import '@reown/appkit-ui/wui-text';
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils';
import { HelpersUtil } from '../../utils/HelpersUtil.js';
import styles from './styles.js';
let W3mRegisterAccountNameView = class W3mRegisterAccountNameView extends LitElement {
    constructor() {
        super();
        this.formRef = createRef();
        this.usubscribe = [];
        this.name = '';
        this.error = '';
        this.loading = EnsController.state.loading;
        this.suggestions = EnsController.state.suggestions;
        this.profileName = ChainController.getAccountData()?.profileName;
        this.onDebouncedNameInputChange = CoreHelperUtil.debounce((value) => {
            if (value.length < 4) {
                this.error = 'Name must be at least 4 characters long';
            }
            else if (!HelpersUtil.isValidReownName(value)) {
                this.error = 'The value is not a valid username';
            }
            else {
                this.error = '';
                EnsController.getSuggestions(value);
            }
        });
        this.usubscribe.push(...[
            EnsController.subscribe(val => {
                this.suggestions = val.suggestions;
                this.loading = val.loading;
            }),
            ChainController.subscribeChainProp('accountState', val => {
                this.profileName = val?.profileName;
                if (val?.profileName) {
                    this.error = 'You already own a name';
                }
            })
        ]);
    }
    firstUpdated() {
        this.formRef.value?.addEventListener('keydown', this.onEnterKey.bind(this));
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.usubscribe.forEach(unsub => unsub());
        this.formRef.value?.removeEventListener('keydown', this.onEnterKey.bind(this));
    }
    render() {
        return html `
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding=${['1', '3', '4', '3']}
      >
        <form ${ref(this.formRef)} @submit=${this.onSubmitName.bind(this)}>
          <wui-ens-input
            @inputChange=${this.onNameInputChange.bind(this)}
            .errorMessage=${this.error}
            .value=${this.name}
            .onKeyDown=${this.onKeyDown.bind(this)}
          >
          </wui-ens-input>
          ${this.submitButtonTemplate()}
          <input type="submit" hidden />
        </form>
        ${this.templateSuggestions()}
      </wui-flex>
    `;
    }
    submitButtonTemplate() {
        const isRegistered = this.suggestions.find(s => s.name?.split('.')?.[0] === this.name && s.registered);
        if (this.loading) {
            return html `<wui-loading-spinner
        class="input-loading-spinner"
        color="secondary"
      ></wui-loading-spinner>`;
        }
        const reownName = `${this.name}${ConstantsUtil.WC_NAME_SUFFIX}`;
        return html `
      <wui-icon-link
        ?disabled=${Boolean(isRegistered)}
        class="input-submit-button"
        size="sm"
        icon="chevronRight"
        iconColor=${isRegistered ? 'default' : 'accent-primary'}
        @click=${() => this.onSubmitName(reownName)}
      >
      </wui-icon-link>
    `;
    }
    onNameInputChange(event) {
        const value = HelpersUtil.validateReownName(event.detail || '');
        this.name = value;
        this.onDebouncedNameInputChange(value);
    }
    onKeyDown(event) {
        if (event.key.length === 1 && !HelpersUtil.isValidReownName(event.key)) {
            event.preventDefault();
        }
    }
    templateSuggestions() {
        if (!this.name || this.name.length < 4 || this.error) {
            return null;
        }
        return html `<wui-flex flexDirection="column" gap="1" alignItems="center">
      ${this.suggestions.map(suggestion => html `<wui-account-name-suggestion-item
            name=${suggestion.name}
            ?registered=${suggestion.registered}
            ?loading=${this.loading}
            ?disabled=${suggestion.registered || this.loading}
            data-testid="account-name-suggestion"
            @click=${() => this.onSubmitName(suggestion.name)}
          ></wui-account-name-suggestion-item>`)}
    </wui-flex>`;
    }
    isAllowedToSubmit(name) {
        const pureName = name.split('.')?.[0];
        const isRegistered = this.suggestions.find(s => s.name?.split('.')?.[0] === pureName && s.registered);
        return (!this.loading &&
            !this.error &&
            !this.profileName &&
            pureName &&
            EnsController.validateName(pureName) &&
            !isRegistered);
    }
    async onSubmitName(name) {
        try {
            if (!this.isAllowedToSubmit(name)) {
                return;
            }
            EventsController.sendEvent({
                type: 'track',
                event: 'REGISTER_NAME_INITIATED',
                properties: {
                    isSmartAccount: getPreferredAccountType(ChainController.state.activeChain) ===
                        W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
                    ensName: name
                }
            });
            await EnsController.registerName(name);
            EventsController.sendEvent({
                type: 'track',
                event: 'REGISTER_NAME_SUCCESS',
                properties: {
                    isSmartAccount: getPreferredAccountType(ChainController.state.activeChain) ===
                        W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
                    ensName: name
                }
            });
        }
        catch (error) {
            SnackController.showError(error.message);
            EventsController.sendEvent({
                type: 'track',
                event: 'REGISTER_NAME_ERROR',
                properties: {
                    isSmartAccount: getPreferredAccountType(ChainController.state.activeChain) ===
                        W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT,
                    ensName: name,
                    error: CoreHelperUtil.parseError(error)
                }
            });
        }
    }
    onEnterKey(event) {
        if (event.key === 'Enter' && this.name && this.isAllowedToSubmit(this.name)) {
            const reownName = `${this.name}${ConstantsUtil.WC_NAME_SUFFIX}`;
            this.onSubmitName(reownName);
        }
    }
};
W3mRegisterAccountNameView.styles = styles;
__decorate([
    property()
], W3mRegisterAccountNameView.prototype, "errorMessage", void 0);
__decorate([
    state()
], W3mRegisterAccountNameView.prototype, "name", void 0);
__decorate([
    state()
], W3mRegisterAccountNameView.prototype, "error", void 0);
__decorate([
    state()
], W3mRegisterAccountNameView.prototype, "loading", void 0);
__decorate([
    state()
], W3mRegisterAccountNameView.prototype, "suggestions", void 0);
__decorate([
    state()
], W3mRegisterAccountNameView.prototype, "profileName", void 0);
W3mRegisterAccountNameView = __decorate([
    customElement('w3m-register-account-name-view')
], W3mRegisterAccountNameView);
export { W3mRegisterAccountNameView };
//# sourceMappingURL=index.js.map