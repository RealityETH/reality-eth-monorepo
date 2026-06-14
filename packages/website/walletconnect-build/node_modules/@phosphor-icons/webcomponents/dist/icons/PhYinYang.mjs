import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, c = Object.getOwnPropertyDescriptor, o = (a, s, m, i) => {
  for (var r = i > 1 ? void 0 : i ? c(s, m) : s, l = a.length - 1, h; l >= 0; l--)
    (h = a[l]) && (r = (i ? h(s, m, r) : h(r)) || r);
  return i && r && M(s, m, r), r;
};
let t = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return A`<svg
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
    e`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28ZM36,128a92.1,92.1,0,0,1,92-92,44,44,0,0,1,0,88,52,52,0,0,0-37.44,88A92.14,92.14,0,0,1,36,128Zm92,92a44,44,0,0,1,0-88,52,52,0,0,0,37.44-88A92,92,0,0,1,128,220Zm8-44a8,8,0,1,1-8-8A8,8,0,0,1,136,176ZM120,80a8,8,0,1,1,8,8A8,8,0,0,1,120,80Z"/>`
  ],
  [
    "light",
    e`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26ZM38,128a90.1,90.1,0,0,1,90-90,42,42,0,0,1,0,84,54,54,0,0,0-44.88,84A90.06,90.06,0,0,1,38,128Zm90,90a42,42,0,0,1,0-84,54,54,0,0,0,44.88-84A90,90,0,0,1,128,218Zm10-42a10,10,0,1,1-10-10A10,10,0,0,1,138,176ZM118,80a10,10,0,1,1,10,10A10,10,0,0,1,118,80Z"/>`
  ],
  [
    "regular",
    e`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM40,128a88.1,88.1,0,0,1,88-88,40,40,0,0,1,0,80A56,56,0,0,0,77.39,200,88,88,0,0,1,40,128Zm88,88a40,40,0,0,1,0-80,56,56,0,0,0,50.61-79.95A88,88,0,0,1,128,216Zm12-40a12,12,0,1,1-12-12A12,12,0,0,1,140,176ZM116,80a12,12,0,1,1,12,12A12,12,0,0,1,116,80Z"/>`
  ],
  [
    "bold",
    e`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20ZM44,128a84.09,84.09,0,0,1,84-84,36,36,0,0,1,0,72,60,60,0,0,0-58.81,71.9A83.73,83.73,0,0,1,44,128Zm84,84a36,36,0,0,1,0-72,60,60,0,0,0,58.81-71.9A83.94,83.94,0,0,1,128,212Zm16-36a16,16,0,1,1-16-16A16,16,0,0,1,144,176ZM112,80a16,16,0,1,1,16,16A16,16,0,0,1,112,80Z"/>`
  ],
  [
    "fill",
    e`<path d="M140,80a12,12,0,1,1-12-12A12,12,0,0,1,140,80Zm92,48A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-92,48a12,12,0,1,0-12,12A12,12,0,0,0,140,176Zm32-92a44.05,44.05,0,0,0-44-44A88,88,0,0,0,81.09,202.42,52,52,0,0,1,128,128,44.05,44.05,0,0,0,172,84Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,128a96,96,0,0,1-96,96,48,48,0,0,1,0-96,48,48,0,0,0,0-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM40,128a88.1,88.1,0,0,1,88-88,40,40,0,0,1,0,80A56,56,0,0,0,77.39,200,88,88,0,0,1,40,128Zm88,88a40,40,0,0,1,0-80,56,56,0,0,0,50.61-79.95A88,88,0,0,1,128,216Zm12-40a12,12,0,1,1-12-12A12,12,0,0,1,140,176ZM116,80a12,12,0,1,1,12,12A12,12,0,0,1,116,80Z"/>`
  ]
]);
t.styles = g`
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
  n("ph-yin-yang")
], t);
export {
  t as PhYinYang
};
