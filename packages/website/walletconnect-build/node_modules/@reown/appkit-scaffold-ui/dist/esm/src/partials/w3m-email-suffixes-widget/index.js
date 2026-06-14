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
const options = [
    '@gmail.com',
    '@outlook.com',
    '@yahoo.com',
    '@hotmail.com',
    '@aol.com',
    '@icloud.com',
    '@zoho.com'
];
let W3mEmailSuffixesWidget = class W3mEmailSuffixesWidget extends LitElement {
    constructor() {
        super(...arguments);
        this.email = '';
    }
    render() {
        const items = options.filter(this.filter.bind(this)).map(this.item.bind(this));
        if (items.length === 0) {
            return null;
        }
        return html `<div class="email-sufixes">${items}</div>`;
    }
    filter(option) {
        if (!this.email) {
            return false;
        }
        const pieces = this.email.split('@');
        if (pieces.length < 2) {
            return true;
        }
        const host = pieces.pop();
        return option.includes(host) && option !== `@${host}`;
    }
    item(option) {
        const handleClick = () => {
            const pieces = this.email.split('@');
            if (pieces.length > 1) {
                pieces.pop();
            }
            const newEmail = pieces[0] + option;
            this.dispatchEvent(new CustomEvent('change', {
                detail: newEmail,
                bubbles: true,
                composed: true
            }));
        };
        return html `<wui-button variant="neutral" size="sm" @click=${handleClick}
      >${option}</wui-button
    >`;
    }
};
W3mEmailSuffixesWidget.styles = [styles];
__decorate([
    property()
], W3mEmailSuffixesWidget.prototype, "email", void 0);
W3mEmailSuffixesWidget = __decorate([
    customElement('w3m-email-suffixes-widget')
], W3mEmailSuffixesWidget);
export { W3mEmailSuffixesWidget };
//# sourceMappingURL=index.js.map