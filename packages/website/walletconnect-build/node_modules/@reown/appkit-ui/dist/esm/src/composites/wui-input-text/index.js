var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiInputText = class WuiInputText extends LitElement {
    constructor() {
        super(...arguments);
        this.inputElementRef = createRef();
        this.disabled = false;
        this.loading = false;
        this.placeholder = '';
        this.type = 'text';
        this.value = '';
        this.size = 'md';
    }
    render() {
        return html ` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${ref(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${ifDefined(this.enterKeyHint)}
          ?disabled=${this.disabled}
          placeholder=${this.placeholder}
          @input=${this.dispatchInputChangeEvent.bind(this)}
          @keydown=${this.onKeyDown}
          .value=${this.value || ''}
        />
        ${this.templateSubmitButton()}
        <slot class="wui-input-text-slot"></slot>
      </div>
      ${this.templateError()} ${this.templateWarning()}`;
    }
    templateLeftIcon() {
        if (this.icon) {
            return html `<wui-icon
        class="wui-input-text-left-icon"
        size="md"
        data-size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`;
        }
        return null;
    }
    templateSubmitButton() {
        if (this.onSubmit) {
            return html `<button
        class="wui-input-text-submit-button ${this.loading ? 'loading' : ''}"
        @click=${this.onSubmit?.bind(this)}
        ?disabled=${this.disabled || this.loading}
      >
        ${this.loading
                ? html `<wui-icon name="spinner" size="md"></wui-icon>`
                : html `<wui-icon name="chevronRight" size="md"></wui-icon>`}
      </button>`;
        }
        return null;
    }
    templateError() {
        if (this.errorText) {
            return html `<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`;
        }
        return null;
    }
    templateWarning() {
        if (this.warningText) {
            return html `<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`;
        }
        return null;
    }
    dispatchInputChangeEvent() {
        this.dispatchEvent(new CustomEvent('inputChange', {
            detail: this.inputElementRef.value?.value,
            bubbles: true,
            composed: true
        }));
    }
};
WuiInputText.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiInputText.prototype, "icon", void 0);
__decorate([
    property({ type: Boolean })
], WuiInputText.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], WuiInputText.prototype, "loading", void 0);
__decorate([
    property()
], WuiInputText.prototype, "placeholder", void 0);
__decorate([
    property()
], WuiInputText.prototype, "type", void 0);
__decorate([
    property()
], WuiInputText.prototype, "value", void 0);
__decorate([
    property()
], WuiInputText.prototype, "errorText", void 0);
__decorate([
    property()
], WuiInputText.prototype, "warningText", void 0);
__decorate([
    property()
], WuiInputText.prototype, "onSubmit", void 0);
__decorate([
    property()
], WuiInputText.prototype, "size", void 0);
__decorate([
    property({ attribute: false })
], WuiInputText.prototype, "onKeyDown", void 0);
WuiInputText = __decorate([
    customElement('wui-input-text')
], WuiInputText);
export { WuiInputText };
//# sourceMappingURL=index.js.map