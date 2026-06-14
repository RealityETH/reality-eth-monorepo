import { LitElement } from 'lit';
export declare class W3mEmailSuffixesWidget extends LitElement {
    static styles: import("lit").CSSResult[];
    email: string;
    render(): import("lit").TemplateResult<1> | null;
    private filter;
    private item;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-email-suffixes-widget': W3mEmailSuffixesWidget;
    }
}
