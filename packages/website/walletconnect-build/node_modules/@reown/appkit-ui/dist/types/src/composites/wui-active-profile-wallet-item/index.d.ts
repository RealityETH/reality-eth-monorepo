import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-loading-spinner/index.js';
import '../../components/wui-text/index.js';
import '../../composites/wui-icon-link/index.js';
import '../../layout/wui-flex/index.js';
import type { ButtonVariant, IconSizeType, IconType, TagType } from '../../utils/TypeUtil.js';
import '../wui-button/index.js';
import '../wui-tag/index.js';
import '../wui-wallet-image/index.js';
type ContentItem = {
    address: string;
    profileName?: string;
    alignItems?: 'center' | 'flex-start' | 'flex-end';
    label?: string;
    description?: string;
    tagLabel: string;
    tagVariant: TagType;
    enableButton?: boolean;
    buttonType: 'disconnect' | 'switch';
    buttonLabel: string;
    buttonVariant: ButtonVariant;
};
export declare class WuiActiveProfileWalletItem extends LitElement {
    static styles: import("lit").CSSResult[];
    address: string;
    profileName: string;
    content: ContentItem[];
    alt: string;
    imageSrc: string;
    icon?: IconType;
    iconSize?: IconSizeType;
    iconBadge?: IconType | undefined;
    iconBadgeSize?: IconSizeType;
    buttonVariant: ButtonVariant;
    enableMoreButton: boolean;
    charsStart: number;
    charsEnd: number;
    render(): import("lit").TemplateResult<1>;
    topTemplate(): import("lit").TemplateResult<1>;
    bottomTemplate(): import("lit").TemplateResult<1>;
    private imageOrIconTemplate;
    private contentTemplate;
    private labelAndTagTemplate;
    buttonTemplate({ buttonType, buttonLabel, buttonVariant }: Pick<ContentItem, 'buttonType' | 'buttonLabel' | 'buttonVariant'>): import("lit").TemplateResult<1>;
    private dispatchDisconnectEvent;
    private dispatchSwitchEvent;
    private dispatchExternalLinkEvent;
    private dispatchMoreButtonEvent;
    private dispatchCopyEvent;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-active-profile-wallet-item': WuiActiveProfileWalletItem;
    }
}
export {};
