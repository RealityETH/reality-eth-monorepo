import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import type { TransactionThumbnailSize, TransactionThumbnailType } from '../../utils/TypeUtil.js';
import '../wui-icon-box/index.js';
export declare class WuiTransactionThumbnail extends LitElement {
    static styles: import("lit").CSSResult[];
    type: TransactionThumbnailType;
    size: TransactionThumbnailSize;
    statusImageUrl?: string | undefined;
    images: string[];
    render(): import("lit").TemplateResult<1>;
    private templateVisual;
    private swapTemplate;
    private fiatTemplate;
    private unknownTemplate;
    private tokenTemplate;
    private templateIcon;
    private getTemplateIcon;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-transaction-thumbnail': WuiTransactionThumbnail;
    }
}
