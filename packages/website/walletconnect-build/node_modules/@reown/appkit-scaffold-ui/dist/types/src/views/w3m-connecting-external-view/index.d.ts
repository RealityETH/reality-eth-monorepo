import { W3mConnectingWidget } from '../../utils/w3m-connecting-widget/index.js';
export declare class W3mConnectingExternalView extends W3mConnectingWidget {
    private externalViewUnsubscribe;
    private connectionsByNamespace;
    private hasMultipleConnections;
    private remoteFeatures;
    private currentActiveConnectorId;
    constructor();
    disconnectedCallback(): void;
    private onConnectProxy;
    private onConnectionsChange;
    private isAlreadyConnected;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-connecting-external-view': W3mConnectingExternalView;
    }
}
