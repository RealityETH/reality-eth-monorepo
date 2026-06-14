import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as f } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, V = Object.getOwnPropertyDescriptor, l = (a, o, p, s) => {
  for (var r = s > 1 ? void 0 : s ? V(o, p) : o, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (r = (s ? n(o, p, r) : n(r)) || r);
  return s && r && u(o, p, r), r;
};
let t = class extends f {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return m`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((a = this.weight) != null ? a : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M228,128a4,4,0,0,1-4,4H81.66l65.17,65.17a4,4,0,0,1-5.66,5.66l-72-72a4,4,0,0,1,0-5.66l72-72a4,4,0,1,1,5.66,5.66L81.66,124H224A4,4,0,0,1,228,128ZM40,36a4,4,0,0,0-4,4V216a4,4,0,0,0,8,0V40A4,4,0,0,0,40,36Z"/>`
  ],
  [
    "light",
    e`<path d="M230,128a6,6,0,0,1-6,6H86.49l61.75,61.76a6,6,0,1,1-8.48,8.48l-72-72a6,6,0,0,1,0-8.48l72-72a6,6,0,0,1,8.48,8.48L86.49,122H224A6,6,0,0,1,230,128ZM40,34a6,6,0,0,0-6,6V216a6,6,0,0,0,12,0V40A6,6,0,0,0,40,34Z"/>`
  ],
  [
    "regular",
    e`<path d="M232,128a8,8,0,0,1-8,8H91.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L91.31,120H224A8,8,0,0,1,232,128ZM40,32a8,8,0,0,0-8,8V216a8,8,0,0,0,16,0V40A8,8,0,0,0,40,32Z"/>`
  ],
  [
    "bold",
    e`<path d="M236,128a12,12,0,0,1-12,12H109l51.52,51.51a12,12,0,0,1-17,17l-72-72a12,12,0,0,1,0-17l72-72a12,12,0,0,1,17,17L109,116H224A12,12,0,0,1,236,128ZM40,28A12,12,0,0,0,28,40V216a12,12,0,0,0,24,0V40A12,12,0,0,0,40,28Z"/>`
  ],
  [
    "fill",
    e`<path d="M48,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0Zm176,80H152V56a8,8,0,0,0-13.66-5.66l-72,72a8,8,0,0,0,0,11.32l72,72A8,8,0,0,0,152,200V136h72a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "duotone",
    e`<path d="M144,56V200L72,128Z" opacity="0.2"/><path d="M224,120H152V56a8,8,0,0,0-13.66-5.66l-72,72a8,8,0,0,0,0,11.32l72,72A8,8,0,0,0,152,200V136h72a8,8,0,0,0,0-16Zm-88,60.69L83.31,128,136,75.31ZM48,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
l([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
l([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
l([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
l([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = l([
  g("ph-arrow-line-left")
], t);
export {
  t as PhArrowLineLeft
};
