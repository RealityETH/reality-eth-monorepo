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
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiIconButton = class WuiIconButton extends LitElement {
    constructor() {
        super(...arguments);
        this.icon = 'card';
        this.variant = 'primary';
        this.type = 'accent';
        this.size = 'md';
        this.iconSize = undefined;
        this.fullWidth = false;
        this.disabled = false;
    }
    render() {
        return html `<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${ifDefined(this.iconSize)}></wui-icon>
    </button>`;
    }
};
WuiIconButton.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiIconButton.prototype, "icon", void 0);
__decorate([
    property()
], WuiIconButton.prototype, "variant", void 0);
__decorate([
    property()
], WuiIconButton.prototype, "type", void 0);
__decorate([
    property()
], WuiIconButton.prototype, "size", void 0);
__decorate([
    property()
], WuiIconButton.prototype, "iconSize", void 0);
__decorate([
    property({ type: Boolean })
], WuiIconButton.prototype, "fullWidth", void 0);
__decorate([
    property({ type: Boolean })
], WuiIconButton.prototype, "disabled", void 0);
WuiIconButton = __decorate([
    customElement('wui-icon-button')
], WuiIconButton);
export { WuiIconButton };
//# sourceMappingURL=index.js.map