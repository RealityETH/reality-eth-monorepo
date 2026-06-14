var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../../components/wui-text/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-logo/index.js';
import styles from './styles.js';
let WuiListNetwork = class WuiListNetwork extends LitElement {
    constructor() {
        super(...arguments);
        this.imageSrc = undefined;
        this.name = 'Ethereum';
        this.disabled = false;
    }
    render() {
        return html `
      <button ?disabled=${this.disabled} tabindex=${ifDefined(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          ${this.imageTemplate()}
          <wui-text variant="lg-regular" color="primary">${this.name}</wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `;
    }
    imageTemplate() {
        if (this.imageSrc) {
            return html `<wui-image ?boxed=${true} src=${this.imageSrc}></wui-image>`;
        }
        return html `<wui-image
      ?boxed=${true}
      icon="networkPlaceholder"
      size="lg"
      iconColor="default"
    ></wui-image>`;
    }
};
WuiListNetwork.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiListNetwork.prototype, "imageSrc", void 0);
__decorate([
    property()
], WuiListNetwork.prototype, "name", void 0);
__decorate([
    property()
], WuiListNetwork.prototype, "tabIdx", void 0);
__decorate([
    property({ type: Boolean })
], WuiListNetwork.prototype, "disabled", void 0);
WuiListNetwork = __decorate([
    customElement('wui-list-network')
], WuiListNetwork);
export { WuiListNetwork };
//# sourceMappingURL=index.js.map