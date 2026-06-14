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
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { UiHelperUtil } from '../../utils/UiHelperUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiWalletSwitch = class WuiWalletSwitch extends LitElement {
    constructor() {
        super(...arguments);
        this.address = '';
        this.profileName = '';
        this.alt = '';
        this.imageSrc = '';
        this.icon = undefined;
        this.iconSize = 'md';
        this.enableGreenCircle = true;
        this.loading = false;
        this.charsStart = 4;
        this.charsEnd = 6;
    }
    render() {
        return html `
      <button>
        ${this.leftImageTemplate()} ${this.textTemplate()} ${this.rightImageTemplate()}
      </button>
    `;
    }
    leftImageTemplate() {
        const imageOrIconContent = this.icon
            ? html `<wui-icon
          size=${ifDefined(this.iconSize)}
          color="default"
          name=${this.icon}
          class="icon"
        ></wui-icon>`
            : html `<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`;
        return html `
      <wui-flex
        alignItems="center"
        justifyContent="center"
        class="icon-box"
        data-active=${Boolean(this.icon)}
      >
        ${imageOrIconContent}
        ${this.enableGreenCircle ? html `<wui-flex class="circle"></wui-flex>` : null}
      </wui-flex>
    `;
    }
    textTemplate() {
        return html `
      <wui-text variant="lg-regular" color="primary">
        ${UiHelperUtil.getTruncateString({
            string: this.profileName || this.address,
            charsStart: this.profileName ? 16 : this.charsStart,
            charsEnd: this.profileName ? 0 : this.charsEnd,
            truncate: this.profileName ? 'end' : 'middle'
        })}
      </wui-text>
    `;
    }
    rightImageTemplate() {
        return html `<wui-icon name="chevronBottom" size="sm" color="default"></wui-icon>`;
    }
};
WuiWalletSwitch.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiWalletSwitch.prototype, "address", void 0);
__decorate([
    property()
], WuiWalletSwitch.prototype, "profileName", void 0);
__decorate([
    property()
], WuiWalletSwitch.prototype, "alt", void 0);
__decorate([
    property()
], WuiWalletSwitch.prototype, "imageSrc", void 0);
__decorate([
    property()
], WuiWalletSwitch.prototype, "icon", void 0);
__decorate([
    property()
], WuiWalletSwitch.prototype, "iconSize", void 0);
__decorate([
    property({ type: Boolean })
], WuiWalletSwitch.prototype, "enableGreenCircle", void 0);
__decorate([
    property({ type: Boolean })
], WuiWalletSwitch.prototype, "loading", void 0);
__decorate([
    property({ type: Number })
], WuiWalletSwitch.prototype, "charsStart", void 0);
__decorate([
    property({ type: Number })
], WuiWalletSwitch.prototype, "charsEnd", void 0);
WuiWalletSwitch = __decorate([
    customElement('wui-wallet-switch')
], WuiWalletSwitch);
export { WuiWalletSwitch };
//# sourceMappingURL=index.js.map