var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { vars } from '../../utils/ThemeHelperUtil.js';
import { resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
const DEFAULT_RINGS = 3;
const DEFAULT_DURATION = 2;
const DEFAULT_OPACITY = 0.3;
const DEFAULT_SIZE = '200px';
const COLOR_BY_VARIANT = {
    'accent-primary': vars.tokens.core.backgroundAccentPrimary
};
let WuiPulse = class WuiPulse extends LitElement {
    constructor() {
        super(...arguments);
        this.rings = DEFAULT_RINGS;
        this.duration = DEFAULT_DURATION;
        this.opacity = DEFAULT_OPACITY;
        this.size = DEFAULT_SIZE;
        this.variant = 'accent-primary';
    }
    render() {
        const color = COLOR_BY_VARIANT[this.variant];
        this.style.cssText = `
      --pulse-size: ${this.size};
      --pulse-duration: ${this.duration}s;
      --pulse-color: ${color};
      --pulse-opacity: ${this.opacity};
    `;
        const ringElements = Array.from({ length: this.rings }, (_, i) => this.renderRing(i, this.rings));
        return html `
      <div class="pulse-container">
        <div class="pulse-rings">${ringElements}</div>
        <div class="pulse-content">
          <slot></slot>
        </div>
      </div>
    `;
    }
    renderRing(index, total) {
        const delay = (index / total) * this.duration;
        const style = `animation-delay: ${delay}s;`;
        return html `<div class="pulse-ring" style=${style}></div>`;
    }
};
WuiPulse.styles = [resetStyles, styles];
__decorate([
    property({ type: Number })
], WuiPulse.prototype, "rings", void 0);
__decorate([
    property({ type: Number })
], WuiPulse.prototype, "duration", void 0);
__decorate([
    property({ type: Number })
], WuiPulse.prototype, "opacity", void 0);
__decorate([
    property()
], WuiPulse.prototype, "size", void 0);
__decorate([
    property()
], WuiPulse.prototype, "variant", void 0);
WuiPulse = __decorate([
    customElement('wui-pulse')
], WuiPulse);
export { WuiPulse };
//# sourceMappingURL=index.js.map