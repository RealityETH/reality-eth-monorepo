import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-map-pin-line": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-map-pin-line": IconAttrs;
        }
    }
}
declare class PhMapPinLine extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhMapPinLine };
