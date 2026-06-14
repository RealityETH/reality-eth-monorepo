import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as f } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, s, l, i) => {
  for (var r = i > 1 ? void 0 : i ? u(s, l) : s, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (r = (i ? n(s, l, r) : n(r)) || r);
  return i && r && c(s, l, r), r;
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
    e`<path d="M228,208a4,4,0,0,1-4,4H48a4,4,0,0,1,0-8H224A4,4,0,0,1,228,208ZM72,148a4,4,0,0,0,4-4V57.66L181.17,162.83a4,4,0,0,0,5.66-5.66L81.66,52H168a4,4,0,0,0,0-8H72a4,4,0,0,0-4,4v96A4,4,0,0,0,72,148Z"/>`
  ],
  [
    "light",
    e`<path d="M230,208a6,6,0,0,1-6,6H48a6,6,0,0,1,0-12H224A6,6,0,0,1,230,208ZM72,150a6,6,0,0,0,6-6V62.49L179.76,164.24a6,6,0,0,0,8.48-8.48L86.49,54H168a6,6,0,0,0,0-12H72a6,6,0,0,0-6,6v96A6,6,0,0,0,72,150Z"/>`
  ],
  [
    "regular",
    e`<path d="M232,208a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208ZM72,152a8,8,0,0,0,8-8V67.31l98.34,98.35a8,8,0,0,0,11.32-11.32L91.31,56H168a8,8,0,0,0,0-16H72a8,8,0,0,0-8,8v96A8,8,0,0,0,72,152Z"/>`
  ],
  [
    "bold",
    e`<path d="M236,208a12,12,0,0,1-12,12H48a12,12,0,0,1,0-24H224A12,12,0,0,1,236,208ZM72,156a12,12,0,0,0,12-12V77l91.51,91.52a12,12,0,0,0,17-17L101,60h67a12,12,0,0,0,0-24H72A12,12,0,0,0,60,48v96A12,12,0,0,0,72,156Z"/>`
  ],
  [
    "fill",
    e`<path d="M64,144V48a8,8,0,0,1,8-8h96a8,8,0,0,1,5.66,13.66L131.31,96l58.35,58.34a8,8,0,0,1-11.32,11.32L120,107.31,77.66,149.66A8,8,0,0,1,64,144Zm160,56H48a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "duotone",
    e`<path d="M168,48,72,144V48Z" opacity="0.2"/><path d="M232,208a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H224A8,8,0,0,1,232,208ZM64,144V48a8,8,0,0,1,8-8h96a8,8,0,0,1,5.66,13.66L131.31,96l58.35,58.34a8,8,0,0,1-11.32,11.32L120,107.31,77.66,149.66A8,8,0,0,1,64,144Zm16-19.31,34.34-34.35h0L148.69,56H80Z"/>`
  ]
]);
t.styles = H`
    :host {
      display: contents;
    }
  `;
o([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  g("ph-arrow-line-up-left")
], t);
export {
  t as PhArrowLineUpLeft
};
