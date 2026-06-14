import { LitElement, type PropertyValues } from 'lit';
import type { ChainNamespace } from '@reown/appkit-common';
import type { IWalletImage, IconType, TagType } from '@reown/appkit-ui';
import '@reown/appkit-ui/wui-list-wallet';
export declare class W3mListWallet extends LitElement {
    static styles: import("lit").CSSResult;
    private intersectionObserver?;
    private hasImpressionSent;
    walletImages?: IWalletImage[];
    imageSrc?: string | undefined;
    name: string;
    size?: 'sm' | 'md';
    tagLabel?: string;
    tagVariant?: TagType;
    walletIcon?: IconType;
    tabIdx?: number;
    disabled: boolean;
    showAllWallets: boolean;
    loading: boolean;
    loadingSpinnerColor: string;
    rdnsId?: string;
    displayIndex?: number;
    walletRank?: number;
    namespaces?: ChainNamespace[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    updated(changedProperties: PropertyValues): void;
    private setupIntersectionObserver;
    private cleanupIntersectionObserver;
    private sendImpressionEvent;
    private handleGetWalletNamespaces;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'w3m-list-wallet': W3mListWallet;
    }
}
