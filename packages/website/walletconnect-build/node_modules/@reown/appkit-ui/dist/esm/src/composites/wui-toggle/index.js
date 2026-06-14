var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiToggle = class WuiToggle extends LitElement {
    constructor() {
        super(...arguments);
        this.inputElementRef = createRef();
        this.checked = false;
        this.disabled = false;
        this.size = 'md';
    }
    render() {
        return html `
      <label data-size=${this.size}>
        <input
          ${ref(this.inputElementRef)}
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `;
    }
    dispatchChangeEvent() {
        this.dispatchEvent(new CustomEvent('switchChange', {
            detail: this.inputElementRef.value?.checked,
            bubbles: true,
            composed: true
        }));
    }
};
WuiToggle.styles = [resetStyles, elementStyles, styles];
__decorate([
    property({ type: Boolean })
], WuiToggle.prototype, "checked", void 0);
__decorate([
    property({ type: Boolean })
], WuiToggle.prototype, "disabled", void 0);
__decorate([
    property()
], WuiToggle.prototype, "size", void 0);
WuiToggle = __decorate([
    customElement('wui-toggle')
], WuiToggle);
export { WuiToggle };
//# sourceMappingURL=index.js.map