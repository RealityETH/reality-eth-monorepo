var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-input-text/index.js';
import styles from './styles.js';
let WuiSearchBar = class WuiSearchBar extends LitElement {
    constructor() {
        super(...arguments);
        this.inputComponentRef = createRef();
        this.inputValue = '';
    }
    render() {
        return html `
      <wui-input-text
        ${ref(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
        @inputChange=${this.onInputChange}
      >
        ${this.inputValue
            ? html `<wui-icon
              @click=${this.clearValue}
              color="inherit"
              size="sm"
              name="close"
            ></wui-icon>`
            : null}
      </wui-input-text>
    `;
    }
    onInputChange(event) {
        this.inputValue = event.detail || '';
    }
    clearValue() {
        const component = this.inputComponentRef.value;
        const inputElement = component?.inputElementRef.value;
        if (inputElement) {
            inputElement.value = '';
            this.inputValue = '';
            inputElement.focus();
            inputElement.dispatchEvent(new Event('input'));
        }
    }
};
WuiSearchBar.styles = [resetStyles, styles];
__decorate([
    property()
], WuiSearchBar.prototype, "inputValue", void 0);
WuiSearchBar = __decorate([
    customElement('wui-search-bar')
], WuiSearchBar);
export { WuiSearchBar };
//# sourceMappingURL=index.js.map