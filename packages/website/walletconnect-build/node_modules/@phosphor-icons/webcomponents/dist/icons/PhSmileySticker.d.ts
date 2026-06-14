import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-smiley-sticker": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-smiley-sticker": IconAttrs;
        }
    }
}
declare class PhSmileySticker extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhSmileySticker };
