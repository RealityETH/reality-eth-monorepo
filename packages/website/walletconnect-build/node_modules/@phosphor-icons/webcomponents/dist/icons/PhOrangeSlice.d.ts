import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-orange-slice": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-orange-slice": IconAttrs;
        }
    }
}
declare class PhOrangeSlice extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhOrangeSlice };
