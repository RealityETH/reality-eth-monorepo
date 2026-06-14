import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, s, h, i) => {
  for (var e = i > 1 ? void 0 : i ? u(s, h) : s, l = a.length - 1, n; l >= 0; l--)
    (n = a[l]) && (e = (i ? n(s, h, e) : n(e)) || e);
  return i && e && M(s, h, e), e;
};
let t = class extends g {
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
    r`<path d="M216,36H168a4,4,0,0,0,0,8h38.35L154.82,95.52a76,76,0,1,0,5.66,5.66L212,49.66V88a4,4,0,0,0,8,0V40A4,4,0,0,0,216,36ZM152.07,200.11a68,68,0,1,1,0-96.18A68.08,68.08,0,0,1,152.07,200.11Z"/>`
  ],
  [
    "light",
    r`<path d="M216,34H168a6,6,0,0,0,0,12h33.52L154.72,92.79a78,78,0,1,0,4.42,114.4h0a78.11,78.11,0,0,0,4.07-105.91L210,54.49V88a6,6,0,0,0,12,0V40A6,6,0,0,0,216,34ZM150.66,198.7a66,66,0,1,1,0-93.36A66.1,66.1,0,0,1,150.66,198.7Z"/>`
  ],
  [
    "regular",
    r`<path d="M216,32H168a8,8,0,0,0,0,16h28.69L154.62,90.07a80,80,0,1,0,11.31,11.31L208,59.32V88a8,8,0,0,0,16,0V40A8,8,0,0,0,216,32ZM149.24,197.29a64,64,0,1,1,0-90.53A64.1,64.1,0,0,1,149.24,197.29Z"/>`
  ],
  [
    "bold",
    r`<path d="M216,28H168a12,12,0,0,0,0,24h19L154.28,84.74a84,84,0,1,0,17,17L204,69V88a12,12,0,0,0,24,0V40A12,12,0,0,0,216,28ZM146.41,194.46a60,60,0,1,1,0-84.87A60.1,60.1,0,0,1,146.41,194.46Z"/>`
  ],
  [
    "fill",
    r`<path d="M152,140a36,36,0,1,1-36-36A36,36,0,0,1,152,140ZM216,40V216a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V40A16,16,0,0,1,56,24H200A16,16,0,0,1,216,40ZM192,72a8,8,0,0,0-8-8H152a8,8,0,0,0,0,16h12.69l-18,18A52.08,52.08,0,1,0,158,109.35l18-18V104a8,8,0,0,0,16,0Z"/>`
  ],
  [
    "duotone",
    r`<path d="M154.91,202.91a72,72,0,1,1,0-101.82A72,72,0,0,1,154.91,202.91Z" opacity="0.2"/><path d="M216,32H168a8,8,0,0,0,0,16h28.69L154.62,90.07a80,80,0,1,0,11.31,11.31L208,59.32V88a8,8,0,0,0,16,0V40A8,8,0,0,0,216,32ZM149.24,197.29a64,64,0,1,1,0-90.53A64.1,64.1,0,0,1,149.24,197.29Z"/>`
  ]
]);
t.styles = f`
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
  c("ph-gender-male")
], t);
export {
  t as PhGenderMale
};
