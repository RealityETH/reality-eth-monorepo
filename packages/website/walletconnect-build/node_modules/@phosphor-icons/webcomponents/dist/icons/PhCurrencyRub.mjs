import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as v } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, g = Object.getOwnPropertyDescriptor, h = (a, o, p, s) => {
  for (var r = s > 1 ? void 0 : s ? g(o, p) : o, H = a.length - 1, l; H >= 0; H--)
    (l = a[H]) && (r = (s ? l(o, p, r) : l(r)) || r);
  return s && r && u(o, p, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return v`<svg
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
    e`<path d="M148,36H88a4,4,0,0,0-4,4V140H56a4,4,0,0,0,0,8H84v24H56a4,4,0,0,0,0,8H84v36a4,4,0,0,0,8,0V180h52a4,4,0,0,0,0-8H92V148h56a56,56,0,0,0,0-112Zm0,104H92V44h56a48,48,0,0,1,0,96Z"/>`
  ],
  [
    "light",
    e`<path d="M148,150a58,58,0,0,0,0-116H88a6,6,0,0,0-6,6v98H56a6,6,0,0,0,0,12H82v20H56a6,6,0,0,0,0,12H82v34a6,6,0,0,0,12,0V182h50a6,6,0,0,0,0-12H94V150ZM94,46h54a46,46,0,0,1,0,92H94Z"/>`
  ],
  [
    "regular",
    e`<path d="M148,152a60,60,0,0,0,0-120H88a8,8,0,0,0-8,8v96H56a8,8,0,0,0,0,16H80v16H56a8,8,0,0,0,0,16H80v32a8,8,0,0,0,16,0V184h48a8,8,0,0,0,0-16H96V152ZM96,48h52a44,44,0,0,1,0,88H96Z"/>`
  ],
  [
    "bold",
    e`<path d="M148,156a64,64,0,0,0,0-128H88A12,12,0,0,0,76,40v92H56a12,12,0,0,0,0,24H76v16H56a12,12,0,0,0,0,24H76v20a12,12,0,0,0,24,0V196h44a12,12,0,0,0,0-24H100V156ZM100,52h48a40,40,0,0,1,0,80H100Z"/>`
  ],
  [
    "fill",
    e`<path d="M168,104a24,24,0,0,1-24,24H112V80h32A24,24,0,0,1,168,104Zm64,24A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-48-24a40,40,0,0,0-40-40H104a8,8,0,0,0-8,8v56H88a8,8,0,0,0,0,16h8v16H88a8,8,0,0,0,0,16h8v16a8,8,0,0,0,16,0V176h40a8,8,0,0,0,0-16H112V144h32A40,40,0,0,0,184,104Z"/>`
  ],
  [
    "duotone",
    e`<path d="M200,92a52,52,0,0,1-52,52H88V40h60A52,52,0,0,1,200,92Z" opacity="0.2"/><path d="M148,152a60,60,0,0,0,0-120H88a8,8,0,0,0-8,8v96H56a8,8,0,0,0,0,16H80v16H56a8,8,0,0,0,0,16H80v32a8,8,0,0,0,16,0V184h48a8,8,0,0,0,0-16H96V152ZM96,48h52a44,44,0,0,1,0,88H96Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
h([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
h([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
h([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
h([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = h([
  n("ph-currency-rub")
], t);
export {
  t as PhCurrencyRub
};
