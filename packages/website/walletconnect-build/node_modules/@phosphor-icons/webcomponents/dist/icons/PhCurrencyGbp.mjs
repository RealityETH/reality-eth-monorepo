import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as a, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (e, s, i, h) => {
  for (var r = h > 1 ? void 0 : h ? u(s, i) : s, l = e.length - 1, H; l >= 0; l--)
    (H = e[l]) && (r = (h ? H(s, i, r) : H(r)) || r);
  return h && r && g(s, i, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return n`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    a`<path d="M188,208a4,4,0,0,1-4,4H56a4,4,0,0,1,0-8h4a32,32,0,0,0,32-32V132H56a4,4,0,0,1,0-8H92V84a48,48,0,0,1,78.53-37,4,4,0,1,1-5.09,6.17A40,40,0,0,0,100,84v40h36a4,4,0,0,1,0,8H100v40a40,40,0,0,1-16,32H184A4,4,0,0,1,188,208Z"/>`
  ],
  [
    "light",
    a`<path d="M190,208a6,6,0,0,1-6,6H56a6,6,0,0,1,0-12h4a30,30,0,0,0,30-30V134H56a6,6,0,0,1,0-12H90V84a50,50,0,0,1,81.81-38.58,6,6,0,1,1-7.64,9.26A38,38,0,0,0,102,84v38h34a6,6,0,0,1,0,12H102v38a41.88,41.88,0,0,1-12.63,30H184A6,6,0,0,1,190,208Z"/>`
  ],
  [
    "regular",
    a`<path d="M192,208a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16h4a28,28,0,0,0,28-28V136H56a8,8,0,0,1,0-16H88V84a52,52,0,0,1,85.08-40.12A8,8,0,1,1,162.9,56.22,36,36,0,0,0,104,84v36h32a8,8,0,0,1,0,16H104v36a43.82,43.82,0,0,1-10.08,28H184A8,8,0,0,1,192,208Z"/>`
  ],
  [
    "bold",
    a`<path d="M196,208a12,12,0,0,1-12,12H56a12,12,0,0,1,0-24h4a24,24,0,0,0,24-24V140H56a12,12,0,0,1,0-24H84V84a56,56,0,0,1,91.63-43.21A12,12,0,0,1,160.35,59.3,31.66,31.66,0,0,0,140,52a32,32,0,0,0-32,32v32h28a12,12,0,0,1,0,24H108v32a47.74,47.74,0,0,1-6.44,24H184A12,12,0,0,1,196,208Z"/>`
  ],
  [
    "fill",
    a`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm40,160H88a8,8,0,0,1,0-16,16,16,0,0,0,16-16V136H88a8,8,0,0,1,0-16h16V96a40,40,0,0,1,60-34.64,8,8,0,0,1-8,13.85A24,24,0,0,0,120,96v24h16a8,8,0,0,1,0,16H120v16a31.71,31.71,0,0,1-4.31,16H168a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    a`<path d="M168,208H60a36,36,0,0,0,36-36V84a44,44,0,0,1,72-33.95Z" opacity="0.2"/><path d="M192,208a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16h4a28,28,0,0,0,28-28V136H56a8,8,0,0,1,0-16H88V84a52,52,0,0,1,85.08-40.12A8,8,0,1,1,162.9,56.22,36,36,0,0,0,104,84v36h32a8,8,0,0,1,0,16H104v36a43.82,43.82,0,0,1-10.08,28H184A8,8,0,0,1,192,208Z"/>`
  ]
]);
t.styles = c`
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
  v("ph-currency-gbp")
], t);
export {
  t as PhCurrencyGbp
};
