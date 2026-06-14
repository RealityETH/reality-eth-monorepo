import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, M = Object.getOwnPropertyDescriptor, s = (a, o, h, l) => {
  for (var r = l > 1 ? void 0 : l ? M(o, h) : o, i = a.length - 1, p; i >= 0; i--)
    (p = a[i]) && (r = (l ? p(o, h, r) : p(r)) || r);
  return l && r && n(o, h, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return V`<svg
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
    e`<path d="M216,92H164V40a4,4,0,0,0-4-4H40a4,4,0,0,0-4,4V160a4,4,0,0,0,4,4H92v52a4,4,0,0,0,4,4H216a4,4,0,0,0,4-4V96A4,4,0,0,0,216,92ZM161.66,212l-48-48h44.68l48,48ZM164,158.34V113.66l48,48v44.68ZM212,100v50.34l-48-48V100ZM44,44H156V156H44Zm56,120h2.34l48,48H100Z"/>`
  ],
  [
    "light",
    e`<path d="M216,90H166V40a6,6,0,0,0-6-6H40a6,6,0,0,0-6,6V160a6,6,0,0,0,6,6H90v50a6,6,0,0,0,6,6H216a6,6,0,0,0,6-6V96A6,6,0,0,0,216,90ZM162.48,210l-44-44h39l44,44ZM166,157.52v-39l44,44v39Zm44-12L166.48,102H210ZM46,46H154V154H46Zm56,120.48L145.52,210H102Z"/>`
  ],
  [
    "regular",
    e`<path d="M224,160V96a8,8,0,0,0-8-8H168V40a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8V160a8,8,0,0,0,8,8H88v48a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V160Zm-60.69,48-40-40h33.38l40,40ZM168,156.69V123.31l40,40v33.38Zm40-16L171.31,104H208ZM48,48H152v56h0v48H48Zm56,123.31L140.69,208H104Z"/>`
  ],
  [
    "bold",
    e`<path d="M228,160V96a12,12,0,0,0-12-12H172V40a12,12,0,0,0-12-12H40A12,12,0,0,0,28,40V160a12,12,0,0,0,12,12H84v44a12,12,0,0,0,12,12H216a12,12,0,0,0,12-12V160Zm-63,44-32-32H155l32,32Zm7-49V133l32,32V187Zm32-24-23-23h23ZM52,52h96v52h0v44H52Zm56,129,23,23H108Z"/>`
  ],
  [
    "fill",
    e`<path d="M216,88H168V40a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8V160a8,8,0,0,0,8,8H88v48a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V96A8,8,0,0,0,216,88ZM48,48H152V152H48Z"/>`
  ],
  [
    "duotone",
    e`<path d="M216,96V216H96V160h64V96Z" opacity="0.2"/><path d="M216,88H168V40a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8V160a8,8,0,0,0,8,8H88v48a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V96A8,8,0,0,0,216,88ZM48,48H152V152H48ZM208,208H104V168h56a8,8,0,0,0,8-8V104h40Z"/>`
  ]
]);
t.styles = v`
    :host {
      display: contents;
    }
  `;
s([
  H({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  H({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  H({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  H({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  Z("ph-subtract-square")
], t);
export {
  t as PhSubtractSquare
};
