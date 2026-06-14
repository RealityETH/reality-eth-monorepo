var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
const TEXT_VARIANT_BY_SIZE = {
    sm: 'sm-medium',
    md: 'lg-regular',
    lg: 'lg-regular'
};
const LEFT_ICON_SIZE = {
    sm: 'md',
    md: 'lg',
    lg: 'xl'
};
const RIGHT_ICON_SIZE = {
    sm: 'sm',
    md: 'sm',
    lg: 'md'
};
let WuiNetworkSwitch = class WuiNetworkSwitch extends LitElement {
    constructor() {
        super(...arguments);
        this.imageSrc = '';
        this.icon = 'networkPlaceholder';
        this.size = 'md';
        this.disabled = false;
    }
    render() {
        return html `
      <button ?disabled=${this.disabled}>
        ${this.leftIconTemplate()}
        <wui-text color="primary" variant=${TEXT_VARIANT_BY_SIZE[this.size]}>
          <slot></slot>
        </wui-text>
        <wui-icon size=${RIGHT_ICON_SIZE[this.size]} name="chevronBottom"></wui-icon>
      </button>
    `;
    }
    leftIconTemplate() {
        const iconSize = LEFT_ICON_SIZE[this.size];
        if (this.imageSrc) {
            return html `<wui-image src=${this.imageSrc} size=${iconSize} alt="select visual"></wui-image>`;
        }
        return html `<wui-icon size=${iconSize} name=${this.icon}></wui-icon>`;
    }
};
WuiNetworkSwitch.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiNetworkSwitch.prototype, "imageSrc", void 0);
__decorate([
    property()
], WuiNetworkSwitch.prototype, "icon", void 0);
__decorate([
    property()
], WuiNetworkSwitch.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], WuiNetworkSwitch.prototype, "disabled", void 0);
WuiNetworkSwitch = __decorate([
    customElement('wui-network-switch')
], WuiNetworkSwitch);
export { WuiNetworkSwitch };
//# sourceMappingURL=index.js.map