import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as f } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as u } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, H = Object.getOwnPropertyDescriptor, o = (a, s, i, h) => {
  for (var r = h > 1 ? void 0 : h ? H(s, i) : s, l = a.length - 1, n; l >= 0; l--)
    (n = a[l]) && (r = (h ? n(s, i, r) : n(r)) || r);
  return h && r && c(s, i, r), r;
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
    e`<path d="M204,208a4,4,0,0,1-4,4H128a84,84,0,0,1,0-168h72a4,4,0,0,1,0,8H128a76,76,0,0,0,0,152h72A4,4,0,0,1,204,208Z"/>`
  ],
  [
    "light",
    e`<path d="M206,208a6,6,0,0,1-6,6H128a86,86,0,0,1,0-172h72a6,6,0,0,1,0,12H128a74,74,0,0,0,0,148h72A6,6,0,0,1,206,208Z"/>`
  ],
  [
    "regular",
    e`<path d="M208,208a8,8,0,0,1-8,8H128a88,88,0,0,1,0-176h72a8,8,0,0,1,0,16H128a72,72,0,0,0,0,144h72A8,8,0,0,1,208,208Z"/>`
  ],
  [
    "bold",
    e`<path d="M212,208a12,12,0,0,1-12,12H128a92,92,0,0,1,0-184h72a12,12,0,0,1,0,24H128a68,68,0,0,0,0,136h72A12,12,0,0,1,212,208Z"/>`
  ],
  [
    "fill",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM128,176h48a8,8,0,0,1,0,16H128a64,64,0,0,1,0-128h48a8,8,0,0,1,0,16H128a48,48,0,0,0,0,96Z"/>`
  ],
  [
    "duotone",
    e`<path d="M200,48V208H128a80,80,0,0,1-80-80h0a80,80,0,0,1,80-80Z" opacity="0.2"/><path d="M208,208a8,8,0,0,1-8,8H128a88,88,0,0,1,0-176h72a8,8,0,0,1,0,16H128a72,72,0,0,0,0,144h72A8,8,0,0,1,208,208Z"/>`
  ]
]);
t.styles = u`
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
  g("ph-subset-proper-of")
], t);
export {
  t as PhSubsetProperOf
};
