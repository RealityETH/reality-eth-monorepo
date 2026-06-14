import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-google-podcasts-logo": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-google-podcasts-logo": IconAttrs;
        }
    }
}
declare class PhGooglePodcastsLogo extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhGooglePodcastsLogo };
