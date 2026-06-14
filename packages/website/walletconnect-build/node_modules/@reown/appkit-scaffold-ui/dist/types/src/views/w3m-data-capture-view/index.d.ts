import { LitElement } from 'lit';
export declare class W3mDataCaptureView extends LitElement {
    static styles: import("lit").CSSResult[];
    private email;
    private address;
    private loading;
    private appName;
    private siwx;
    private isRequired;
    private recentEmails;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit").TemplateResult<1>;
    private hero;
    private heroRow;
    private heroIcon;
    private paragraph;
    private emailInput;
    private recentEmailsWidget;
    private footerActions;
    private onSubmit;
    private onSkip;
    private getRecentEmails;
    private pushRecentEmail;
    private isValidEmail;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-data-capture-view': W3mDataCaptureView;
    }
}
