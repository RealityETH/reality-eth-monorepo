import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as h, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var Z = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = (e, o, i, s) => {
  for (var t = s > 1 ? void 0 : s ? n(o, i) : o, V = e.length - 1, m; V >= 0; V--)
    (m = e[V]) && (t = (s ? m(o, i, t) : m(t)) || t);
  return s && t && Z(o, i, t), t;
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
    h`<path d="M144,20H112A60.07,60.07,0,0,0,52,80v96a60.07,60.07,0,0,0,60,60h32a60.07,60.07,0,0,0,60-60V80A60.07,60.07,0,0,0,144,20Zm52,60v28H148V88a12,12,0,0,0-12-12h-4V28h12A52.06,52.06,0,0,1,196,80Zm-80,8a4,4,0,0,1,4-4h16a4,4,0,0,1,4,4v48a4,4,0,0,1-4,4H120a4,4,0,0,1-4-4Zm-4-60h12V76h-4a12,12,0,0,0-12,12v20H60V80A52.06,52.06,0,0,1,112,28Zm32,200H112a52.06,52.06,0,0,1-52-52V116h48v20a12,12,0,0,0,12,12h16a12,12,0,0,0,12-12V116h48v60A52.06,52.06,0,0,1,144,228Z"/>`
  ],
  [
    "light",
    h`<path d="M144,18H112A62.07,62.07,0,0,0,50,80v96a62.07,62.07,0,0,0,62,62h32a62.07,62.07,0,0,0,62-62V80A62.07,62.07,0,0,0,144,18Zm50,62v26H150V88a14,14,0,0,0-14-14h-2V30h10A50.06,50.06,0,0,1,194,80Zm-76,8a2,2,0,0,1,2-2h16a2,2,0,0,1,2,2v48a2,2,0,0,1-2,2H120a2,2,0,0,1-2-2Zm-6-58h10V74h-2a14,14,0,0,0-14,14v18H62V80A50.06,50.06,0,0,1,112,30Zm32,196H112a50.06,50.06,0,0,1-50-50V118h44v18a14,14,0,0,0,14,14h16a14,14,0,0,0,14-14V118h44v58A50.06,50.06,0,0,1,144,226Z"/>`
  ],
  [
    "regular",
    h`<path d="M144,16H112A64.07,64.07,0,0,0,48,80v96a64.07,64.07,0,0,0,64,64h32a64.07,64.07,0,0,0,64-64V80A64.07,64.07,0,0,0,144,16Zm48,64v24H152V88a16,16,0,0,0-16-16V32h8A48.05,48.05,0,0,1,192,80Zm-56,56H120V88h16v23.9a.51.51,0,0,0,0,.2ZM112,32h8V72a16,16,0,0,0-16,16v16H64V80A48.05,48.05,0,0,1,112,32Zm32,192H112a48.05,48.05,0,0,1-48-48V120h40v16a16,16,0,0,0,16,16h16a16,16,0,0,0,16-16V120h40v56A48.05,48.05,0,0,1,144,224Z"/>`
  ],
  [
    "bold",
    h`<path d="M144,12H112A68.07,68.07,0,0,0,44,80v96a68.07,68.07,0,0,0,68,68h32a68.07,68.07,0,0,0,68-68V80A68.07,68.07,0,0,0,144,12Zm44,68v20H160V88a20,20,0,0,0-20-20V36h4A44.05,44.05,0,0,1,188,80ZM120,92h16v40H120Zm-8-56h4V68A20,20,0,0,0,96,88v12H68V80A44.05,44.05,0,0,1,112,36Zm32,184H112a44.05,44.05,0,0,1-44-44V124H96v12a20,20,0,0,0,20,20h24a20,20,0,0,0,20-20V124h28v52A44.05,44.05,0,0,1,144,220Z"/>`
  ],
  [
    "fill",
    h`<path d="M144,16H112A64.07,64.07,0,0,0,48,80v96a64.07,64.07,0,0,0,64,64h32a64.07,64.07,0,0,0,64-64V80A64.07,64.07,0,0,0,144,16Zm48,64v24H152V88a16,16,0,0,0-16-16V32h8A48.05,48.05,0,0,1,192,80ZM112,32h8V72a16,16,0,0,0-16,16v16H64V80A48.05,48.05,0,0,1,112,32Zm32,192H112a48.05,48.05,0,0,1-48-48V120h40v16a16,16,0,0,0,16,16h16a16,16,0,0,0,16-16V120h40v56A48.05,48.05,0,0,1,144,224Z"/>`
  ],
  [
    "duotone",
    h`<path d="M144,88v48a8,8,0,0,1-8,8H120a8,8,0,0,1-8-8V88a8,8,0,0,1,8-8h16A8,8,0,0,1,144,88Z" opacity="0.2"/><path d="M144,16H112A64.07,64.07,0,0,0,48,80v96a64.07,64.07,0,0,0,64,64h32a64.07,64.07,0,0,0,64-64V80A64.07,64.07,0,0,0,144,16Zm48,64v24H152V88a16,16,0,0,0-16-16V32h8A48.05,48.05,0,0,1,192,80Zm-56,56H120V88h16v23.9a.51.51,0,0,0,0,.2ZM112,32h8V72a16,16,0,0,0-16,16v16H64V80A48.05,48.05,0,0,1,112,32Zm32,192H112a48.05,48.05,0,0,1-48-48V120h40v16a16,16,0,0,0,16,16h16a16,16,0,0,0,16-16V120h40v56A48.05,48.05,0,0,1,144,224Z"/>`
  ]
]);
a.styles = H`
    :host {
      display: contents;
    }
  `;
r([
  v({ type: String, reflect: !0 })
], a.prototype, "size", 2);
r([
  v({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
r([
  v({ type: String, reflect: !0 })
], a.prototype, "color", 2);
r([
  v({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = r([
  A("ph-mouse-middle-click")
], a);
export {
  a as PhMouseMiddleClick
};
