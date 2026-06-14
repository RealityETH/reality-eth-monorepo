import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, c = Object.getOwnPropertyDescriptor, o = (a, s, h, i) => {
  for (var r = i > 1 ? void 0 : i ? c(s, h) : s, l = a.length - 1, m; l >= 0; l--)
    (m = a[l]) && (r = (i ? m(s, h, r) : m(r)) || r);
  return i && r && A(s, h, r), r;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return H`<svg
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
    e`<path d="M224,68H32A12,12,0,0,0,20,80v96a12,12,0,0,0,12,12H224a12,12,0,0,0,12-12V80A12,12,0,0,0,224,68Zm4,108a4,4,0,0,1-4,4H32a4,4,0,0,1-4-4V80a4,4,0,0,1,4-4H224a4,4,0,0,1,4,4Zm-32-48a8,8,0,1,1-8-8A8,8,0,0,1,196,128Z"/>`
  ],
  [
    "light",
    e`<path d="M224,66H32A14,14,0,0,0,18,80v96a14,14,0,0,0,14,14H224a14,14,0,0,0,14-14V80A14,14,0,0,0,224,66Zm2,110a2,2,0,0,1-2,2H32a2,2,0,0,1-2-2V80a2,2,0,0,1,2-2H224a2,2,0,0,1,2,2Zm-28-48a10,10,0,1,1-10-10A10,10,0,0,1,198,128Z"/>`
  ],
  [
    "regular",
    e`<path d="M224,64H32A16,16,0,0,0,16,80v96a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V80A16,16,0,0,0,224,64Zm0,112H32V80H224v96Zm-24-48a12,12,0,1,1-12-12A12,12,0,0,1,200,128Z"/>`
  ],
  [
    "bold",
    e`<path d="M224,60H32A20,20,0,0,0,12,80v96a20,20,0,0,0,20,20H224a20,20,0,0,0,20-20V80A20,20,0,0,0,224,60Zm-4,112H36V84H220Zm-56-44a16,16,0,1,1,16,16A16,16,0,0,1,164,128Z"/>`
  ],
  [
    "fill",
    e`<path d="M224,64H32A16,16,0,0,0,16,80v96a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V80A16,16,0,0,0,224,64Zm-36,76a12,12,0,1,1,12-12A12,12,0,0,1,188,140Z"/>`
  ],
  [
    "duotone",
    e`<path d="M232,80v96a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H224A8,8,0,0,1,232,80Z" opacity="0.2"/><path d="M224,64H32A16,16,0,0,0,16,80v96a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V80A16,16,0,0,0,224,64Zm0,112H32V80H224v96Zm-24-48a12,12,0,1,1-12-12A12,12,0,0,1,200,128Z"/>`
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
  v("ph-hard-drive")
], t);
export {
  t as PhHardDrive
};
