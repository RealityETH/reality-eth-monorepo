import { LitElement } from 'lit';
import '@reown/appkit-ui/wui-avatar';
import '@reown/appkit-ui/wui-button';
import '@reown/appkit-ui/wui-flex';
import '@reown/appkit-ui/wui-icon';
import '@reown/appkit-ui/wui-icon-link';
import '@reown/appkit-ui/wui-list-item';
import '@reown/appkit-ui/wui-notice-card';
import '@reown/appkit-ui/wui-tabs';
import '@reown/appkit-ui/wui-tag';
import '@reown/appkit-ui/wui-text';
import '@reown/appkit-ui/wui-wallet-switch';
import '../w3m-account-auth-button/index.js';
export declare class W3mAccountDefaultWidget extends LitElement {
    static styles: import("lit").CSSResult;
    private unsubscribe;
    caipAddress: `eip155:${string}:${string}` | `eip155:${number}:${string}` | `solana:${string}:${string}` | `solana:${number}:${string}` | `polkadot:${string}:${string}` | `polkadot:${number}:${string}` | `bip122:${string}:${string}` | `bip122:${number}:${string}` | `cosmos:${string}:${string}` | `cosmos:${number}:${string}` | `sui:${string}:${string}` | `sui:${number}:${string}` | `stacks:${string}:${string}` | `stacks:${number}:${string}` | `ton:${string}:${string}` | `ton:${number}:${string}` | undefined;
    address: `0x${string}` | undefined;
    private profileImage;
    private profileName;
    private disconnecting;
    private balance;
    private balanceSymbol;
    private features;
    private remoteFeatures;
    private namespace;
    private activeConnectorIds;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit").TemplateResult<1> | null;
    private fundWalletTemplate;
    private orderedFeaturesTemplate;
    private activityTemplate;
    private swapsTemplate;
    private sendTemplate;
    private authCardTemplate;
    private handleClickFundWallet;
    private handleClickSwap;
    private handleClickSend;
    private explorerBtnTemplate;
    private onTransactions;
    private onDisconnect;
    private onExplorer;
    private onGoToUpgradeView;
    private onGoToProfileWalletsView;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-account-default-widget': W3mAccountDefaultWidget;
    }
}
