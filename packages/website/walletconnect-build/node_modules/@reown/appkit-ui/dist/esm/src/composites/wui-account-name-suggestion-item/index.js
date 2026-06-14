var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import '../../composites/wui-tag/index.js';
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js';
import { customElement } from '../../utils/WebComponentsUtil.js';
import styles from './styles.js';
let WuiAccountNameSuggestionItem = class WuiAccountNameSuggestionItem extends LitElement {
    constructor() {
        super(...arguments);
        this.name = '';
        this.registered = false;
        this.loading = false;
        this.disabled = false;
    }
    render() {
        return html `
      <button ?disabled=${this.disabled}>
        <wui-text class="name" color="primary" variant="md-regular">${this.name}</wui-text>
        ${this.templateRightContent()}
      </button>
    `;
    }
    templateRightContent() {
        if (this.loading) {
            return html `<wui-loading-spinner size="lg" color="primary"></wui-loading-spinner>`;
        }
        return this.registered
            ? html `<wui-tag variant="info" size="sm">Registered</wui-tag>`
            : html `<wui-tag variant="success" size="sm">Available</wui-tag>`;
    }
};
WuiAccountNameSuggestionItem.styles = [resetStyles, elementStyles, styles];
__decorate([
    property()
], WuiAccountNameSuggestionItem.prototype, "name", void 0);
__decorate([
    property({ type: Boolean })
], WuiAccountNameSuggestionItem.prototype, "registered", void 0);
__decorate([
    property({ type: Boolean })
], WuiAccountNameSuggestionItem.prototype, "loading", void 0);
__decorate([
    property({ type: Boolean })
], WuiAccountNameSuggestionItem.prototype, "disabled", void 0);
WuiAccountNameSuggestionItem = __decorate([
    customElement('wui-account-name-suggestion-item')
], WuiAccountNameSuggestionItem);
export { WuiAccountNameSuggestionItem };
//# sourceMappingURL=index.js.map