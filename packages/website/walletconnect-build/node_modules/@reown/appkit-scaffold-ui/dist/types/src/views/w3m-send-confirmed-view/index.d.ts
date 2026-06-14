import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-text';
export declare class W3mSendConfirmedView extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    constructor();
    render(): import("lit").TemplateResult<1>;
    private onCloseClick;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-send-confirmed-view': W3mSendConfirmedView;
    }
}
