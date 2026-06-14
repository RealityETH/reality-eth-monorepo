import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-flex';
export declare class W3mConnectorList extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    tabIdx?: number;
    private explorerWallets?;
    private connections;
    private connectorImages;
    private loadingTelegram;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private connectorListTemplate;
    private getConnectorNamespaces;
    private renderConnector;
    private onClickConnector;
    private renderWallet;
    private onClickWallet;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-connector-list': W3mConnectorList;
    }
}
