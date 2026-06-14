import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-smiley-wink": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-smiley-wink": IconAttrs;
        }
    }
}
declare class PhSmileyWink extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhSmileyWink };
