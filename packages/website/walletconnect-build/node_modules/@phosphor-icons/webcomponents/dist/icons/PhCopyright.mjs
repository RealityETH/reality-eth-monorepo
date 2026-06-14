import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as a } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, A = Object.getOwnPropertyDescriptor, s = (o, i, h, p) => {
  for (var r = p > 1 ? void 0 : p ? A(i, h) : i, l = o.length - 1, m; l >= 0; l--)
    (m = o[l]) && (r = (p ? m(i, h, r) : m(r)) || r);
  return p && r && f(i, h, r), r;
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
    e`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm0,192a92,92,0,1,1,92-92A92.1,92.1,0,0,1,128,220Zm35.2-65.59a44,44,0,1,1,0-52.82,4,4,0,0,1-6.4,4.81,36,36,0,1,0,0,43.2,4,4,0,0,1,6.4,4.81Z"/>`
  ],
  [
    "light",
    e`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218ZM94,128a34,34,0,0,0,61.2,20.4,6,6,0,0,1,9.6,7.21,46,46,0,1,1,0-55.22,6,6,0,0,1-9.6,7.21A34,34,0,0,0,94,128Z"/>`
  ],
  [
    "regular",
    e`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM96,128a32,32,0,0,0,57.6,19.2,8,8,0,0,1,12.8,9.61,48,48,0,1,1,0-57.62,8,8,0,0,1-12.8,9.61A32,32,0,0,0,96,128Z"/>`
  ],
  [
    "bold",
    e`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm41.59-52.79a52,52,0,1,1,0-62.43,12,12,0,1,1-19.18,14.42,28,28,0,1,0,0,33.6,12,12,0,1,1,19.18,14.41Z"/>`
  ],
  [
    "fill",
    e`<path d="M128,56a72,72,0,1,0,72,72A72.08,72.08,0,0,0,128,56Zm0,104a31.8,31.8,0,0,0,25.61-12.8,8,8,0,1,1,12.79,9.61,48,48,0,1,1,0-57.63,8,8,0,1,1-12.79,9.61A32,32,0,1,0,128,160Zm0-136A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM96,128a32,32,0,0,0,57.6,19.2,8,8,0,0,1,12.8,9.61,48,48,0,1,1,0-57.62,8,8,0,0,1-12.8,9.61A32,32,0,0,0,96,128Z"/>`
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
  Z("ph-copyright")
], t);
export {
  t as PhCopyright
};
