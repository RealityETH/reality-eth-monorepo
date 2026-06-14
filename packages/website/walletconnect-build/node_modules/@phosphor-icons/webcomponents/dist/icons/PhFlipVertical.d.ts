import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-flip-vertical": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-flip-vertical": IconAttrs;
        }
    }
}
declare class PhFlipVertical extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhFlipVertical };
