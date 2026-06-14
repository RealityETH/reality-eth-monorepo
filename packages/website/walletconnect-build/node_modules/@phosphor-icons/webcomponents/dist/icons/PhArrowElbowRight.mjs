import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var w = Object.defineProperty, u = Object.getOwnPropertyDescriptor, a = (o, s, p, l) => {
  for (var r = l > 1 ? void 0 : l ? u(s, p) : s, h = o.length - 1, m; h >= 0; h--)
    (m = o[h]) && (r = (l ? m(s, p, r) : m(r)) || r);
  return l && r && w(s, p, r), r;
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
    e`<path d="M236,80v72a4,4,0,0,1-8,0V89.66L122.83,194.83a4,4,0,0,1-5.66,0l-96-96a4,4,0,0,1,5.66-5.66L120,186.34,222.34,84H160a4,4,0,0,1,0-8h72A4,4,0,0,1,236,80Z"/>`
  ],
  [
    "light",
    e`<path d="M238,80v72a6,6,0,0,1-12,0V94.48L124.24,196.24a6,6,0,0,1-8.48,0l-96-96a6,6,0,0,1,8.48-8.48L120,183.51,217.52,86H160a6,6,0,0,1,0-12h72A6,6,0,0,1,238,80Z"/>`
  ],
  [
    "regular",
    e`<path d="M240,80v72a8,8,0,0,1-16,0V99.31l-98.34,98.35a8,8,0,0,1-11.32,0l-96-96A8,8,0,0,1,29.66,90.34L120,180.69,212.69,88H160a8,8,0,0,1,0-16h72A8,8,0,0,1,240,80Z"/>`
  ],
  [
    "bold",
    e`<path d="M244,80v72a12,12,0,0,1-24,0V109l-91.51,91.52a12,12,0,0,1-17,0l-96-96a12,12,0,0,1,17-17L120,175l83-83H160a12,12,0,0,1,0-24h72A12,12,0,0,1,244,80Z"/>`
  ],
  [
    "fill",
    e`<path d="M240,80v72a8,8,0,0,1-13.66,5.66L196,127.31l-70.34,70.35a8,8,0,0,1-11.32,0l-96-96A8,8,0,0,1,29.66,90.34L120,180.69,184.69,116,154.34,85.66A8,8,0,0,1,160,72h72A8,8,0,0,1,240,80Z"/>`
  ],
  [
    "duotone",
    e`<path d="M232,80v72L160,80Z" opacity="0.2"/><path d="M232,72H160a8,8,0,0,0-5.66,13.66L184.69,116,120,180.69,29.66,90.34a8,8,0,0,0-11.32,11.32l96,96a8,8,0,0,0,11.32,0L196,127.31l30.34,30.35A8,8,0,0,0,240,152V80A8,8,0,0,0,232,72Zm-8,60.69L179.31,88H224Z"/>`
  ]
]);
t.styles = f`
    :host {
      display: contents;
    }
  `;
a([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  c("ph-arrow-elbow-right")
], t);
export {
  t as PhArrowElbowRight
};
