import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as f } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as u } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, H = Object.getOwnPropertyDescriptor, o = (a, s, i, p) => {
  for (var r = p > 1 ? void 0 : p ? H(s, i) : s, l = a.length - 1, n; l >= 0; l--)
    (n = a[l]) && (r = (p ? n(s, i, r) : n(r)) || r);
  return p && r && c(s, i, r), r;
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
    e`<path d="M220,128a84.09,84.09,0,0,1-84,84H64a4,4,0,0,1,0-8h72a76,76,0,0,0,0-152H64a4,4,0,0,1,0-8h72A84.09,84.09,0,0,1,220,128Z"/>`
  ],
  [
    "light",
    e`<path d="M222,128a86.1,86.1,0,0,1-86,86H64a6,6,0,0,1,0-12h72a74,74,0,0,0,0-148H64a6,6,0,0,1,0-12h72A86.1,86.1,0,0,1,222,128Z"/>`
  ],
  [
    "regular",
    e`<path d="M224,128a88.1,88.1,0,0,1-88,88H64a8,8,0,0,1,0-16h72a72,72,0,0,0,0-144H64a8,8,0,0,1,0-16h72A88.1,88.1,0,0,1,224,128Z"/>`
  ],
  [
    "bold",
    e`<path d="M228,128a92.1,92.1,0,0,1-92,92H64a12,12,0,0,1,0-24h72a68,68,0,0,0,0-136H64a12,12,0,0,1,0-24h72A92.1,92.1,0,0,1,228,128Z"/>`
  ],
  [
    "fill",
    e`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM128,192H80a8,8,0,0,1,0-16h48a48,48,0,0,0,0-96H80a8,8,0,0,1,0-16h48a64,64,0,0,1,0,128Z"/>`
  ],
  [
    "duotone",
    e`<path d="M216,128a80,80,0,0,1-80,80H64V48h72A80,80,0,0,1,216,128Z" opacity="0.2"/><path d="M224,128a88.1,88.1,0,0,1-88,88H64a8,8,0,0,1,0-16h72a72,72,0,0,0,0-144H64a8,8,0,0,1,0-16h72A88.1,88.1,0,0,1,224,128Z"/>`
  ]
]);
t.styles = u`
    :host {
      display: contents;
    }
  `;
o([
  h({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  h({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  h({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  h({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  g("ph-superset-proper-of")
], t);
export {
  t as PhSupersetProperOf
};
