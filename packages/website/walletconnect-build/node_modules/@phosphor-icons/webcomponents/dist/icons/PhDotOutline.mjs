import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as u } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as a } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, d = Object.getOwnPropertyDescriptor, s = (o, i, l, p) => {
  for (var e = p > 1 ? void 0 : p ? d(i, l) : i, h = o.length - 1, m; h >= 0; h--)
    (m = o[h]) && (e = (p ? m(i, l, e) : m(e)) || e);
  return p && e && f(i, l, e), e;
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
  [
    "thin",
    r`<path d="M128,100a28,28,0,1,0,28,28A28,28,0,0,0,128,100Zm0,48a20,20,0,1,1,20-20A20,20,0,0,1,128,148Z"/>`
  ],
  [
    "light",
    r`<path d="M128,98a30,30,0,1,0,30,30A30,30,0,0,0,128,98Zm0,48a18,18,0,1,1,18-18A18,18,0,0,1,128,146Z"/>`
  ],
  [
    "regular",
    r`<path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,144Z"/>`
  ],
  [
    "bold",
    r`<path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,40a8,8,0,1,1,8-8A8,8,0,0,1,128,136Z"/>`
  ],
  ["fill", r`<path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128Z"/>`],
  [
    "duotone",
    r`<path d="M152,128a24,24,0,1,1-24-24A24,24,0,0,1,152,128Z" opacity="0.2"/><path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,144Z"/>`
  ]
]);
t.styles = c`
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
  u("ph-dot-outline")
], t);
export {
  t as PhDotOutline
};
