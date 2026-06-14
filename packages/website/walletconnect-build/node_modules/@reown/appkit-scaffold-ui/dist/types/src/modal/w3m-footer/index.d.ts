import { LitElement } from 'lit';
import '../../partials/w3m-legal-footer/index.js';
import '../../partials/w3m-onramp-providers-footer/index.js';
export declare class W3mFooter extends LitElement {
    static styles: import("lit").CSSResult[];
    private resizeObserver?;
    private unsubscribe;
    private status;
    private view;
    firstUpdated(): void;
    render(): import("lit").TemplateResult<1>;
    private templatePageContainer;
    private templateFooter;
    private templateNetworksFooter;
    private onNetworkHelp;
    private getWrapper;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-footer': W3mFooter;
    }
}
