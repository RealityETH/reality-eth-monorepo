import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-text/index.js';
import type { ButtonLinkVariant, ButtonSize, IconType } from '../../utils/TypeUtil.js';
export declare class WuiLink extends LitElement {
    static styles: import("lit").CSSResult[];
    size: Exclude<ButtonSize, 'lg'>;
    disabled: boolean;
    variant: ButtonLinkVariant;
    icon?: IconType;
    render(): import("lit").TemplateResult<1>;
    private iconTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-link': WuiLink;
    }
}
