import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-letter-circle-v": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-letter-circle-v": IconAttrs;
        }
    }
}
declare class PhLetterCircleV extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhLetterCircleV };
