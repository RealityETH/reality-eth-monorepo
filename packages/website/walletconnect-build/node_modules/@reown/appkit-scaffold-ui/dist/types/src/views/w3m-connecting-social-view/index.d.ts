import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon-box';
import '@reown/appkit-ui/wui-loading-thumbnail';
import '@reown/appkit-ui/wui-logo';
import '@reown/appkit-ui/wui-text';
export declare class W3mConnectingSocialView extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    private socialProvider;
    private socialWindow;
    protected error: boolean;
    protected connecting: boolean;
    protected message: string;
    private remoteFeatures;
    private address;
    private connectionsByNamespace;
    private hasMultipleConnections;
    authConnector: import("@reown/appkit-controllers").AuthConnector | undefined;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
    private loaderTemplate;
    private parseURLError;
    private handleSocialConnection;
    private connectSocial;
    private updateMessage;
    private handleSocialError;
    private closeSocialWindow;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-connecting-social-view': W3mConnectingSocialView;
    }
}
