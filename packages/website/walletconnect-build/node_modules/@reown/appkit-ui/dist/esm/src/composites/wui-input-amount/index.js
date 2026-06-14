var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { vars } from '../../utils/ThemeHelperUtil.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { UiHelperUtil } from '../../utils/UiHelperUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiInputAmount = class WuiInputAmount extends LitElement {
    constructor() {
        super(...arguments);
        this.inputElementRef = createRef();
        this.disabled = false;
        this.value = '';
        this.placeholder = '0';
        this.widthVariant = 'auto';
        this.maxDecimals = undefined;
        this.maxIntegers = undefined;
        this.fontSize = 'h4';
        this.error = false;
    }
    firstUpdated() {
        this.resizeInput();
    }
    updated() {
        this.style.setProperty('--local-font-size', vars.textSize[this.fontSize]);
        this.resizeInput();
    }
    render() {
        this.dataset['widthVariant'] = this.widthVariant;
        this.dataset['error'] = String(this.error);
        if (this.inputElementRef?.value && this.value) {
            this.inputElementRef.value.value = this.value;
        }
        if (this.widthVariant === 'auto') {
            return this.inputTemplate();
        }
        return html `
      <div class="wui-input-amount-fit-width">
        <span class="wui-input-amount-fit-mirror"></span>
        ${this.inputTemplate()}
      </div>
    `;
    }
    inputTemplate() {
        return html `<input
      ${ref(this.inputElementRef)}
      type="text"
      inputmode="decimal"
      pattern="[0-9,.]*"
      placeholder=${this.placeholder}
      ?disabled=${this.disabled}
      autofocus
      value=${this.value ?? ''}
      @input=${this.dispatchInputChangeEvent.bind(this)}
    />`;
    }
    dispatchInputChangeEvent() {
        if (this.inputElementRef.value) {
            this.inputElementRef.value.value = UiHelperUtil.maskInput({
                value: this.inputElementRef.value.value,
                decimals: this.maxDecimals,
                integers: this.maxIntegers
            });
            this.dispatchEvent(new CustomEvent('inputChange', {
                detail: this.inputElementRef.value.value,
                bubbles: true,
                composed: true
            }));
            this.resizeInput();
        }
    }
    resizeInput() {
        if (this.widthVariant === 'fit') {
            const inputElement = this.inputElementRef.value;
            if (inputElement) {
                const mirror = inputElement.previousElementSibling;
                if (mirror) {
                    mirror.textContent = inputElement.value || '0';
                    inputElement.style.width = `${mirror.offsetWidth}px`;
                }
            }
        }
    }
};
WuiInputAmount.styles = [resetStyles, elementStyles, styles];
__decorate([
    property({ type: Boolean })
], WuiInputAmount.prototype, "disabled", void 0);
__decorate([
    property({ type: String })
], WuiInputAmount.prototype, "value", void 0);
__decorate([
    property({ type: String })
], WuiInputAmount.prototype, "placeholder", void 0);
__decorate([
    property({ type: String })
], WuiInputAmount.prototype, "widthVariant", void 0);
__decorate([
    property({ type: Number })
], WuiInputAmount.prototype, "maxDecimals", void 0);
__decorate([
    property({ type: Number })
], WuiInputAmount.prototype, "maxIntegers", void 0);
__decorate([
    property({ type: String })
], WuiInputAmount.prototype, "fontSize", void 0);
__decorate([
    property({ type: Boolean })
], WuiInputAmount.prototype, "error", void 0);
WuiInputAmount = __decorate([
    customElement('wui-input-amount')
], WuiInputAmount);
export { WuiInputAmount };
//# sourceMappingURL=index.js.map