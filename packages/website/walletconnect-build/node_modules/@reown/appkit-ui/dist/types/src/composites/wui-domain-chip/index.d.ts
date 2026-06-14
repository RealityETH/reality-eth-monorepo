import { LitElement } from 'lit';
import '../../components/wui-icon/index.js';
import '../../components/wui-image/index.js';
import '../../components/wui-text/index.js';
import type { DomainChipSize, DomainChipVariant } from '../../utils/TypeUtil.js';
export declare class WuiDomainChip extends LitElement {
    static styles: import("lit").CSSResult[];
    variant: DomainChipVariant;
    size: DomainChipSize;
    imageSrc: string;
    disabled: boolean;
    text: string;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-wui-domain-chip': WuiDomainChip;
    }
}
