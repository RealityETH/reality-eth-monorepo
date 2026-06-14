var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiListItem = class WuiListItem extends LitElement {
    constructor() {
        super(...arguments);
        this.type = 'primary';
        this.imageSrc = 'google';
        this.imageSize = undefined;
        this.loading = false;
        this.boxColor = 'foregroundPrimary';
        this.disabled = false;
        this.rightIcon = true;
        this.boxed = true;
        this.rounded = false;
        this.fullSize = false;
    }
    render() {
        this.dataset['rounded'] = this.rounded ? 'true' : 'false';
        this.dataset['type'] = this.type;
        return html `
      <button
        ?disabled=${this.loading ? true : Boolean(this.disabled)}
        data-loading=${this.loading}
        tabindex=${ifDefined(this.tabIdx)}
      >
        <wui-flex gap="2" alignItems="center">
          ${this.templateLeftIcon()}
          <wui-flex gap="1">
            <slot></slot>
          </wui-flex>
        </wui-flex>
        ${this.templateRightIcon()}
      </button>
    `;
    }
    templateLeftIcon() {
        if (this.icon) {
            return html `<wui-image
        icon=${this.icon}
        iconColor=${ifDefined(this.iconColor)}
        ?boxed=${this.boxed}
        ?rounded=${this.rounded}
        boxColor=${this.boxColor}
      ></wui-image>`;
        }
        return html `<wui-image
      ?boxed=${this.boxed}
      ?rounded=${this.rounded}
      ?fullSize=${this.fullSize}
      size=${ifDefined(this.imageSize)}
      src=${this.imageSrc}
      boxColor=${this.boxColor}
    ></wui-image>`;
    }
    templateRightIcon() {
        if (!this.rightIcon) {
            return null;
        }
        if (this.loading) {
            return html `<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`;
        }
        return html `<wui-icon name="chevronRight" size="lg" color="default"></wui-icon>`;
    }
};
WuiListItem.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiListItem.prototype, "type", void 0);
__decorate([
    property()
], WuiListItem.prototype, "imageSrc", void 0);
__decorate([
    property()
], WuiListItem.prototype, "imageSize", void 0);
__decorate([
    property()
], WuiListItem.prototype, "icon", void 0);
__decorate([
    property()
], WuiListItem.prototype, "iconColor", void 0);
__decorate([
    property({ type: Boolean })
], WuiListItem.prototype, "loading", void 0);
__decorate([
    property()
], WuiListItem.prototype, "tabIdx", void 0);
__decorate([
    property()
], WuiListItem.prototype, "boxColor", void 0);
__decorate([
    property({ type: Boolean })
], WuiListItem.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], WuiListItem.prototype, "rightIcon", void 0);
__decorate([
    property({ type: Boolean })
], WuiListItem.prototype, "boxed", void 0);
__decorate([
    property({ type: Boolean })
], WuiListItem.prototype, "rounded", void 0);
__decorate([
    property({ type: Boolean })
], WuiListItem.prototype, "fullSize", void 0);
WuiListItem = __decorate([
    customElement('wui-list-item')
], WuiListItem);
export { WuiListItem };
//# sourceMappingURL=index.js.map