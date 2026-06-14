import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-funnel-simple": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-funnel-simple": IconAttrs;
        }
    }
}
declare class PhFunnelSimple extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhFunnelSimple };
