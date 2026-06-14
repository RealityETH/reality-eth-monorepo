var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from '@reown/appkit-ui';
import styles from './styles.js';
let W3mRecentEmailsWidget = class W3mRecentEmailsWidget extends LitElement {
    constructor() {
        super(...arguments);
        this.emails = [];
    }
    render() {
        if (this.emails.length === 0) {
            return null;
        }
        return html `<div class="recent-emails">
      <wui-text variant="micro-600" color="fg-200" class="recent-emails-heading"
        >Recently used emails</wui-text
      >
      ${this.emails.map(this.item.bind(this))}
    </div>`;
    }
    item(email) {
        const handleClick = () => {
            this.dispatchEvent(new CustomEvent('select', {
                detail: email,
                bubbles: true,
                composed: true
            }));
        };
        return html `<wui-list-item
      @click=${handleClick}
      ?chevron=${true}
      icon="mail"
      iconVariant="overlay"
      class="recent-emails-list-item"
    >
      <wui-text variant="paragraph-500" color="fg-100">${email}</wui-text>
    </wui-list-item>`;
    }
};
W3mRecentEmailsWidget.styles = [styles];
__decorate([
    property()
], W3mRecentEmailsWidget.prototype, "emails", void 0);
W3mRecentEmailsWidget = __decorate([
    customElement('w3m-recent-emails-widget')
], W3mRecentEmailsWidget);
export { W3mRecentEmailsWidget };
//# sourceMappingURL=index.js.map