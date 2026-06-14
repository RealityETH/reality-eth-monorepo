import { LitElement } from 'lit';
export declare class W3mRecentEmailsWidget extends LitElement {
    static styles: import("lit").CSSResult[];
    emails: string[];
    render(): import("lit").TemplateResult<1> | null;
    private item;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-recent-emails-widget': W3mRecentEmailsWidget;
    }
}
