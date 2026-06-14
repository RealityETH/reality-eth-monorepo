import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-shimmer/index.js';
import '../../components/wui-text/index.js';
import '../../layout/wui-flex/index.js';
export declare class WuiTokenButton extends LitElement {
    static styles: import("lit").CSSResult[];
    size: 'lg' | 'md' | 'sm';
    imageSrc?: string;
    chainImageSrc?: string;
    disabled: boolean;
    text: string;
    loading: boolean;
    render(): import("lit").TemplateResult<1>;
    private imageTemplate;
    private textTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-token-button': WuiTokenButton;
    }
}
