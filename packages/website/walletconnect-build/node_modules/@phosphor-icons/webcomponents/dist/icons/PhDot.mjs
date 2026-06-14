import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as a } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, d = Object.getOwnPropertyDescriptor, s = (o, i, l, p) => {
  for (var r = p > 1 ? void 0 : p ? d(i, l) : i, h = o.length - 1, m; h >= 0; h--)
    (m = o[h]) && (r = (p ? m(i, l, r) : m(r)) || r);
  return p && r && u(i, l, r), r;
};
let t = class extends g {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var o;
    return n`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((o = this.weight) != null ? o : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  ["thin", e`<path d="M136,128a8,8,0,1,1-8-8A8,8,0,0,1,136,128Z"/>`],
  ["light", e`<path d="M138,128a10,10,0,1,1-10-10A10,10,0,0,1,138,128Z"/>`],
  [
    "regular",
    e`<path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Z"/>`
  ],
  ["bold", e`<path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128Z"/>`],
  [
    "fill",
    e`<path d="M128,80a48,48,0,1,0,48,48A48,48,0,0,0,128,80Zm0,60a12,12,0,1,1,12-12A12,12,0,0,1,128,140Z"/>`
  ],
  [
    "duotone",
    e`<path d="M176,128a48,48,0,1,1-48-48A48,48,0,0,1,176,128Z" opacity="0.2"/><path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Z"/>`
  ]
]);
t.styles = f`
    :host {
      display: contents;
    }
  `;
s([
  a({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  a({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  a({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  a({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  c("ph-dot")
], t);
export {
  t as PhDot
};
