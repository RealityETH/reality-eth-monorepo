var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { customElement } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-input-amount';
import '@reown/appkit-ui/wui-link';
import '@reown/appkit-ui/wui-text';
let W3mFundInput = class W3mFundInput extends LitElement {
    constructor() {
        super(...arguments);
        this.maxDecimals = undefined;
        this.maxIntegers = undefined;
    }
    render() {
        return html `
      <wui-flex alignItems="center" gap="1">
        <wui-input-amount
          widthVariant="fit"
          fontSize="h2"
          .maxDecimals=${ifDefined(this.maxDecimals)}
          .maxIntegers=${ifDefined(this.maxIntegers)}
          .value=${this.amount ? String(this.amount) : ''}
        ></wui-input-amount>
        <wui-text variant="md-regular" color="secondary">USD</wui-text>
      </wui-flex>
    `;
    }
};
__decorate([
    property({ type: Number })
], W3mFundInput.prototype, "amount", void 0);
__decorate([
    property({ type: Number })
], W3mFundInput.prototype, "maxDecimals", void 0);
__decorate([
    property({ type: Number })
], W3mFundInput.prototype, "maxIntegers", void 0);
W3mFundInput = __decorate([
    customElement('w3m-fund-input')
], W3mFundInput);
export { W3mFundInput };
//# sourceMappingURL=index.js.map