import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var V = Object.defineProperty, c = Object.getOwnPropertyDescriptor, h = (r, o, m, s) => {
  for (var t = s > 1 ? void 0 : s ? c(o, m) : o, p = r.length - 1, l; p >= 0; p--)
    (l = r[p]) && (t = (s ? l(o, m, t) : l(t)) || t);
  return s && t && V(o, m, t), t;
};
let a = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return H`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M92,8a4,4,0,0,1,4-4h64a4,4,0,0,1,0,8H96A4,4,0,0,1,92,8ZM196,56V224a20,20,0,0,1-20,20H80a20,20,0,0,1-20-20V56A20,20,0,0,1,80,36h96A20,20,0,0,1,196,56Zm-8,0a12,12,0,0,0-12-12H80A12,12,0,0,0,68,56V224a12,12,0,0,0,12,12h96a12,12,0,0,0,12-12ZM160,156H96a4,4,0,0,0,0,8h64a4,4,0,0,0,0-8Zm0,40H96a4,4,0,0,0,0,8h64a4,4,0,0,0,0-8Z"/>`
  ],
  [
    "light",
    e`<path d="M90,8a6,6,0,0,1,6-6h64a6,6,0,0,1,0,12H96A6,6,0,0,1,90,8ZM198,56V224a22,22,0,0,1-22,22H80a22,22,0,0,1-22-22V56A22,22,0,0,1,80,34h96A22,22,0,0,1,198,56Zm-12,0a10,10,0,0,0-10-10H80A10,10,0,0,0,70,56V224a10,10,0,0,0,10,10h96a10,10,0,0,0,10-10Zm-26,98H96a6,6,0,0,0,0,12h64a6,6,0,0,0,0-12Zm0,40H96a6,6,0,0,0,0,12h64a6,6,0,0,0,0-12Z"/>`
  ],
  [
    "regular",
    e`<path d="M176,32H80A24,24,0,0,0,56,56V224a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V56A24,24,0,0,0,176,32Zm8,192a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8Zm-16-24a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,200ZM88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8Zm80,152a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,160Z"/>`
  ],
  [
    "bold",
    e`<path d="M92,12A12,12,0,0,1,104,0h48a12,12,0,0,1,0,24H104A12,12,0,0,1,92,12ZM204,60V228a28,28,0,0,1-28,28H80a28,28,0,0,1-28-28V60A28,28,0,0,1,80,32h96A28,28,0,0,1,204,60Zm-24,0a4,4,0,0,0-4-4H80a4,4,0,0,0-4,4V228a4,4,0,0,0,4,4h96a4,4,0,0,0,4-4Zm-24,92H100a12,12,0,0,0,0,24h56a12,12,0,0,0,0-24Zm0,40H100a12,12,0,0,0,0,24h56a12,12,0,0,0,0-24Z"/>`
  ],
  [
    "fill",
    e`<path d="M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8ZM200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Zm-24,88H96a8,8,0,0,0-8,8v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V152A8,8,0,0,0,160,144Z"/>`
  ],
  [
    "duotone",
    e`<path d="M192,56V224a16,16,0,0,1-16,16H80a16,16,0,0,1-16-16V56A16,16,0,0,1,80,40h96A16,16,0,0,1,192,56Z" opacity="0.2"/><path d="M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8ZM200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Zm-24,96H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm0,40H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z"/>`
  ]
]);
a.styles = n`
    :host {
      display: contents;
    }
  `;
h([
  i({ type: String, reflect: !0 })
], a.prototype, "size", 2);
h([
  i({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
h([
  i({ type: String, reflect: !0 })
], a.prototype, "color", 2);
h([
  i({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = h([
  A("ph-battery-vertical-medium")
], a);
export {
  a as PhBatteryVerticalMedium
};
