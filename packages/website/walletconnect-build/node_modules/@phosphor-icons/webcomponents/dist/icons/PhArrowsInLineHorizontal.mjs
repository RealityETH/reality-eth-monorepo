import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var Z = Object.defineProperty, c = Object.getOwnPropertyDescriptor, l = (e, o, p, s) => {
  for (var t = s > 1 ? void 0 : s ? c(o, p) : o, h = e.length - 1, n; h >= 0; h--)
    (n = e[h]) && (t = (s ? n(o, p, t) : n(t)) || t);
  return s && t && Z(o, p, t), t;
};
let a = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return H`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M132,40V216a4,4,0,0,1-8,0V40a4,4,0,0,1,8,0ZM66.83,93.17a4,4,0,0,0-5.66,5.66L86.34,124H16a4,4,0,0,0,0,8H86.34L61.17,157.17a4,4,0,0,0,5.66,5.66l32-32a4,4,0,0,0,0-5.66ZM240,124H169.66l25.17-25.17a4,4,0,1,0-5.66-5.66l-32,32a4,4,0,0,0,0,5.66l32,32a4,4,0,0,0,5.66-5.66L169.66,132H240a4,4,0,0,0,0-8Z"/>`
  ],
  [
    "light",
    r`<path d="M134,40V216a6,6,0,0,1-12,0V40a6,6,0,0,1,12,0ZM68.24,91.76a6,6,0,0,0-8.48,8.48L81.51,122H16a6,6,0,0,0,0,12H81.51L59.76,155.76a6,6,0,1,0,8.48,8.48l32-32a6,6,0,0,0,0-8.48ZM240,122H174.49l21.75-21.76a6,6,0,0,0-8.48-8.48l-32,32a6,6,0,0,0,0,8.48l32,32a6,6,0,0,0,8.48-8.48L174.49,134H240a6,6,0,0,0,0-12Z"/>`
  ],
  [
    "regular",
    r`<path d="M136,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0ZM69.66,90.34a8,8,0,0,0-11.32,11.32L76.69,120H16a8,8,0,0,0,0,16H76.69L58.34,154.34a8,8,0,0,0,11.32,11.32l32-32a8,8,0,0,0,0-11.32ZM240,120H179.31l18.35-18.34a8,8,0,0,0-11.32-11.32l-32,32a8,8,0,0,0,0,11.32l32,32a8,8,0,0,0,11.32-11.32L179.31,136H240a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "bold",
    r`<path d="M140,40V216a12,12,0,0,1-24,0V40a12,12,0,0,1,24,0ZM64.49,87.51a12,12,0,0,0-17,17L59,116H16a12,12,0,0,0,0,24H59L47.51,151.51a12,12,0,0,0,17,17l32-32a12,12,0,0,0,0-17ZM240,116H197l11.52-11.51a12,12,0,0,0-17-17l-32,32a12,12,0,0,0,0,17l32,32a12,12,0,0,0,17-17L197,140h43a12,12,0,0,0,0-24Z"/>`
  ],
  [
    "fill",
    r`<path d="M101.66,122.34a8,8,0,0,1,0,11.32l-32,32A8,8,0,0,1,56,160V136H16a8,8,0,0,1,0-16H56V96a8,8,0,0,1,13.66-5.66ZM240,120H200V96a8,8,0,0,0-13.66-5.66l-32,32a8,8,0,0,0,0,11.32l32,32A8,8,0,0,0,200,160V136h40a8,8,0,0,0,0-16ZM128,32a8,8,0,0,0-8,8V216a8,8,0,0,0,16,0V40A8,8,0,0,0,128,32Z"/>`
  ],
  [
    "duotone",
    r`<path d="M240,56V200a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V56A16,16,0,0,1,32,40H224A16,16,0,0,1,240,56Z" opacity="0.2"/><path d="M136,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0ZM69.66,90.34a8,8,0,0,0-11.32,11.32L76.69,120H16a8,8,0,0,0,0,16H76.69L58.34,154.34a8,8,0,0,0,11.32,11.32l32-32a8,8,0,0,0,0-11.32ZM240,120H179.31l18.35-18.34a8,8,0,0,0-11.32-11.32l-32,32a8,8,0,0,0,0,11.32l32,32a8,8,0,0,0,11.32-11.32L179.31,136H240a8,8,0,0,0,0-16Z"/>`
  ]
]);
a.styles = g`
    :host {
      display: contents;
    }
  `;
l([
  i({ type: String, reflect: !0 })
], a.prototype, "size", 2);
l([
  i({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
l([
  i({ type: String, reflect: !0 })
], a.prototype, "color", 2);
l([
  i({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = l([
  M("ph-arrows-in-line-horizontal")
], a);
export {
  a as PhArrowsInLineHorizontal
};
