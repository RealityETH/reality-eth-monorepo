import { LitElement } from 'lit';
import type { PulseVariant } from '../../utils/TypeUtil.js';
export declare class WuiPulse extends LitElement {
    static styles: import("lit").CSSResult[];
    rings: number;
    duration: number;
    opacity: number;
    size: string;
    variant: PulseVariant;
    render(): import("lit").TemplateResult<1>;
    private renderRing;
}
declare global {
    interface HTMLElementTagNameMap {
        'wui-pulse': WuiPulse;
    }
}
