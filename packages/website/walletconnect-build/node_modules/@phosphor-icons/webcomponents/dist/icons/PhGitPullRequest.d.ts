import { LitElement } from "lit";
import type { IconWeight, IconAttrs } from "../types";
declare global {
    interface HTMLElementTagNameMap {
        "ph-git-pull-request": IconAttrs;
    }
    namespace JSX {
        interface IntrinsicElements {
            "ph-git-pull-request": IconAttrs;
        }
    }
}
declare class PhGitPullRequest extends LitElement {
    static weightsMap: Map<IconWeight, import("lit").TemplateResult<2>>;
    size?: string | number;
    weight?: IconWeight;
    color?: string;
    mirrored?: boolean;
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export { PhGitPullRequest };
