import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-lastfm-logo": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-lastfm-logo": IconAttrs;
        }
    }
}
declare class PhLastfmLogo extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhLastfmLogo };
