var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import { resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-input-text/index.js';
import styles from './styles.js';
let WuiEnsInput = class WuiEnsInput extends LitElement {
    constructor() {
        super(...arguments);
        this.disabled = false;
        this.loading = false;
    }
    render() {
        return html `
      <wui-input-text
        value=${ifDefined(this.value)}
        ?disabled=${this.disabled}
        .value=${this.value || ''}
        data-testid="wui-ens-input"
        icon="search"
        inputRightPadding="5xl"
        .onKeyDown=${this.onKeyDown}
      ></wui-input-text>
    `;
    }
};
WuiEnsInput.styles = [resetStyles, styles];
__decorate([
    property()
], WuiEnsInput.prototype, "errorMessage", void 0);
__decorate([
    property({ type: Boolean })
], WuiEnsInput.prototype, "disabled", void 0);
__decorate([
    property()
], WuiEnsInput.prototype, "value", void 0);
__decorate([
    property({ type: Boolean })
], WuiEnsInput.prototype, "loading", void 0);
__decorate([
    property({ attribute: false })
], WuiEnsInput.prototype, "onKeyDown", void 0);
WuiEnsInput = __decorate([
    customElement('wui-ens-input')
], WuiEnsInput);
export { WuiEnsInput };
//# sourceMappingURL=index.js.map