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
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import '../../composites/wui-icon-link/index.js';
import '../../layout/wui-flex/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { UiHelperUtil } from '../../utils/UiHelperUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import '../wui-button/index.js';
import '../wui-wallet-image/index.js';
import styles from './styles.js';
let WuiInactiveProfileWalletItem = class WuiInactiveProfileWalletItem extends LitElement {
    constructor() {
        super(...arguments);
        this.address = '';
        this.profileName = '';
        this.alt = '';
        this.buttonLabel = '';
        this.buttonVariant = 'accent-primary';
        this.imageSrc = '';
        this.icon = undefined;
        this.iconSize = 'md';
        this.iconBadgeSize = 'md';
        this.rightIcon = 'signOut';
        this.rightIconSize = 'md';
        this.loading = false;
        this.charsStart = 4;
        this.charsEnd = 6;
    }
    render() {
        return html `
      <wui-flex alignItems="center" columngap="2">
        ${this.imageOrIconTemplate()} ${this.labelAndDescriptionTemplate()}
        ${this.buttonActionTemplate()}
      </wui-flex>
    `;
    }
    imageOrIconTemplate() {
        if (this.icon) {
            return html `
        <wui-flex alignItems="center" justifyContent="center" class="icon-box">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon size="lg" color="default" name=${this.icon} class="custom-icon"></wui-icon>

            ${this.iconBadge
                ? html `<wui-icon
                  color="default"
                  size="inherit"
                  name=${this.iconBadge}
                  class="icon-badge"
                ></wui-icon>`
                : null}
          </wui-flex>
        </wui-flex>
      `;
        }
        return html `<wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>`;
    }
    labelAndDescriptionTemplate() {
        return html `
      <wui-flex
        flexDirection="column"
        flexGrow="1"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <wui-text variant="lg-regular" color="primary">
          ${UiHelperUtil.getTruncateString({
            string: this.profileName || this.address,
            charsStart: this.profileName ? 16 : this.charsStart,
            charsEnd: this.profileName ? 0 : this.charsEnd,
            truncate: this.profileName ? 'end' : 'middle'
        })}
        </wui-text>
      </wui-flex>
    `;
    }
    buttonActionTemplate() {
        return html `
      <wui-flex columngap="1" alignItems="center" justifyContent="center">
        <wui-button
          size="sm"
          variant=${this.buttonVariant}
          .loading=${this.loading}
          @click=${this.handleButtonClick}
          data-testid="wui-inactive-profile-wallet-item-button"
        >
          ${this.buttonLabel}
        </wui-button>

        <wui-icon-link
          variant="secondary"
          size="md"
          icon=${ifDefined(this.rightIcon)}
          class="right-icon"
          @click=${this.handleIconClick}
        ></wui-icon-link>
      </wui-flex>
    `;
    }
    handleButtonClick() {
        this.dispatchEvent(new CustomEvent('buttonClick', { bubbles: true, composed: true }));
    }
    handleIconClick() {
        this.dispatchEvent(new CustomEvent('iconClick', { bubbles: true, composed: true }));
    }
};
WuiInactiveProfileWalletItem.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "address", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "profileName", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "alt", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "buttonLabel", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "buttonVariant", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "imageSrc", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "icon", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "iconSize", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "iconBadge", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "iconBadgeSize", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "rightIcon", void 0);
__decorate([
    property()
], WuiInactiveProfileWalletItem.prototype, "rightIconSize", void 0);
__decorate([
    property({ type: Boolean })
], WuiInactiveProfileWalletItem.prototype, "loading", void 0);
__decorate([
    property({ type: Number })
], WuiInactiveProfileWalletItem.prototype, "charsStart", void 0);
__decorate([
    property({ type: Number })
], WuiInactiveProfileWalletItem.prototype, "charsEnd", void 0);
WuiInactiveProfileWalletItem = __decorate([
    customElement('wui-inactive-profile-wallet-item')
], WuiInactiveProfileWalletItem);
export { WuiInactiveProfileWalletItem };
//# sourceMappingURL=index.js.map