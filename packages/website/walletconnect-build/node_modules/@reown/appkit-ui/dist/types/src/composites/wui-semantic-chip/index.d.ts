import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import type { SemanticChipSize, SemanticChipType } from '../../utils/TypeUtil.js';
export declare class WuiSemanticChip extends LitElement {
    static styles: import("lit").CSSResult[];
    type: SemanticChipType;
    size: SemanticChipSize;
    imageSrc?: string;
    disabled: boolean;
    href: string;
    text?: string;
    render(): import("lit").TemplateResult<1>;
    private imageTemplate;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-semantic-chip': WuiSemanticChip;
    }
}
