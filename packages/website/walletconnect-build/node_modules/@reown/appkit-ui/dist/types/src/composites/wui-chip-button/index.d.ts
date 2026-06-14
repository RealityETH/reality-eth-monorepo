import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import type { ChipButtonSize, ChipButtonType, IconType } from '../../utils/TypeUtil.js';
export declare class WuiChipButton extends LitElement {
    static styles: import("lit").CSSResult[];
    type: ChipButtonType;
    size: ChipButtonSize;
    imageSrc: string;
    disabled: boolean;
    leftIcon?: IconType;
    rightIcon?: IconType;
    text: string;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-chip-button': WuiChipButton;
    }
}
