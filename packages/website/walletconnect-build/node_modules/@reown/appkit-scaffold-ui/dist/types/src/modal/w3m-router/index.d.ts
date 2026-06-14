import { LitElement } from 'lit';
import '../w3m-footer/index.js';
export declare class W3mRouter extends LitElement {
    static styles: import("lit").CSSResult[];
    private unsubscribe;
    private viewState;
    private history;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private templatePageContainer;
    private viewTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-router': W3mRouter;
    }
}
