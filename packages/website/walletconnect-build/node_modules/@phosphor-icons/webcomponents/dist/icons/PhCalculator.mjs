import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as o } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, c = Object.getOwnPropertyDescriptor, m = (e, Z, s, A) => {
  for (var t = A > 1 ? void 0 : A ? c(Z, s) : Z, h = e.length - 1, i; h >= 0; h--)
    (i = e[h]) && (t = (A ? i(Z, s, t) : i(t)) || t);
  return A && t && n(Z, s, t), t;
};
let a = class extends l {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return p`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M176,60H80a4,4,0,0,0-4,4v48a4,4,0,0,0,4,4h96a4,4,0,0,0,4-4V64A4,4,0,0,0,176,60Zm-4,48H84V68h88Zm28-80H56A12,12,0,0,0,44,40V216a12,12,0,0,0,12,12H200a12,12,0,0,0,12-12V40A12,12,0,0,0,200,28Zm4,188a4,4,0,0,1-4,4H56a4,4,0,0,1-4-4V40a4,4,0,0,1,4-4H200a4,4,0,0,1,4,4ZM96,148a8,8,0,1,1-8-8A8,8,0,0,1,96,148Zm40,0a8,8,0,1,1-8-8A8,8,0,0,1,136,148Zm40,0a8,8,0,1,1-8-8A8,8,0,0,1,176,148ZM96,188a8,8,0,1,1-8-8A8,8,0,0,1,96,188Zm40,0a8,8,0,1,1-8-8A8,8,0,0,1,136,188Zm40,0a8,8,0,1,1-8-8A8,8,0,0,1,176,188Z"/>`
  ],
  [
    "light",
    r`<path d="M176,58H80a6,6,0,0,0-6,6v48a6,6,0,0,0,6,6h96a6,6,0,0,0,6-6V64A6,6,0,0,0,176,58Zm-6,48H86V70h84Zm30-80H56A14,14,0,0,0,42,40V216a14,14,0,0,0,14,14H200a14,14,0,0,0,14-14V40A14,14,0,0,0,200,26Zm2,190a2,2,0,0,1-2,2H56a2,2,0,0,1-2-2V40a2,2,0,0,1,2-2H200a2,2,0,0,1,2,2ZM98,148a10,10,0,1,1-10-10A10,10,0,0,1,98,148Zm40,0a10,10,0,1,1-10-10A10,10,0,0,1,138,148Zm40,0a10,10,0,1,1-10-10A10,10,0,0,1,178,148ZM98,188a10,10,0,1,1-10-10A10,10,0,0,1,98,188Zm40,0a10,10,0,1,1-10-10A10,10,0,0,1,138,188Zm40,0a10,10,0,1,1-10-10A10,10,0,0,1,178,188Z"/>`
  ],
  [
    "regular",
    r`<path d="M80,120h96a8,8,0,0,0,8-8V64a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v48A8,8,0,0,0,80,120Zm8-48h80v32H88ZM200,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24Zm0,192H56V40H200ZM100,148a12,12,0,1,1-12-12A12,12,0,0,1,100,148Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,140,148Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,180,148Zm-80,40a12,12,0,1,1-12-12A12,12,0,0,1,100,188Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,140,188Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,180,188Z"/>`
  ],
  [
    "bold",
    r`<path d="M200,20H56A20,20,0,0,0,36,40V216a20,20,0,0,0,20,20H200a20,20,0,0,0,20-20V40A20,20,0,0,0,200,20Zm-4,192H60V44H196ZM80,76A12,12,0,0,1,92,64h72a12,12,0,0,1,0,24H92A12,12,0,0,1,80,76Zm40,52a16,16,0,1,1-16-16A16,16,0,0,1,120,128Zm48,0a16,16,0,1,1-16-16A16,16,0,0,1,168,128Zm-48,48a16,16,0,1,1-16-16A16,16,0,0,1,120,176Zm48,0a16,16,0,1,1-16-16A16,16,0,0,1,168,176Z"/>`
  ],
  [
    "fill",
    r`<path d="M200,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24ZM88,200a12,12,0,1,1,12-12A12,12,0,0,1,88,200Zm0-40a12,12,0,1,1,12-12A12,12,0,0,1,88,160Zm40,40a12,12,0,1,1,12-12A12,12,0,0,1,128,200Zm0-40a12,12,0,1,1,12-12A12,12,0,0,1,128,160Zm40,40a12,12,0,1,1,12-12A12,12,0,0,1,168,200Zm0-40a12,12,0,1,1,12-12A12,12,0,0,1,168,160Zm16-56a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8Z"/>`
  ],
  [
    "duotone",
    r`<path d="M176,64v48H80V64Z" opacity="0.2"/><path d="M80,120h96a8,8,0,0,0,8-8V64a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v48A8,8,0,0,0,80,120Zm8-48h80v32H88ZM200,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V40A16,16,0,0,0,200,24Zm0,192H56V40H200ZM100,148a12,12,0,1,1-12-12A12,12,0,0,1,100,148Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,140,148Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,180,148Zm-80,40a12,12,0,1,1-12-12A12,12,0,0,1,100,188Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,140,188Zm40,0a12,12,0,1,1-12-12A12,12,0,0,1,180,188Z"/>`
  ]
]);
a.styles = V`
    :host {
      display: contents;
    }
  `;
m([
  o({ type: String, reflect: !0 })
], a.prototype, "size", 2);
m([
  o({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
m([
  o({ type: String, reflect: !0 })
], a.prototype, "color", 2);
m([
  o({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = m([
  H("ph-calculator")
], a);
export {
  a as PhCalculator
};
