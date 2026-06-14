import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (e, s, i, m) => {
  for (var t = m > 1 ? void 0 : m ? g(s, i) : s, p = e.length - 1, V; p >= 0; p--)
    (V = e[p]) && (t = (m ? V(s, i, t) : V(t)) || t);
  return m && t && n(s, i, t), t;
};
let a = class extends l {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return Z`<svg
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
    r`<path d="M200,60H32A20,20,0,0,0,12,80v96a20,20,0,0,0,20,20H200a20,20,0,0,0,20-20V80A20,20,0,0,0,200,60Zm12,116a12,12,0,0,1-12,12H32a12,12,0,0,1-12-12V80A12,12,0,0,1,32,68H200a12,12,0,0,1,12,12ZM180,96v64a4,4,0,0,1-8,0V96a4,4,0,0,1,8,0Zm-40,0v64a4,4,0,0,1-8,0V96a4,4,0,0,1,8,0Zm-40,0v64a4,4,0,0,1-8,0V96a4,4,0,0,1,8,0ZM60,96v64a4,4,0,0,1-8,0V96a4,4,0,0,1,8,0Zm192,0v64a4,4,0,0,1-8,0V96a4,4,0,0,1,8,0Z"/>`
  ],
  [
    "light",
    r`<path d="M200,58H32A22,22,0,0,0,10,80v96a22,22,0,0,0,22,22H200a22,22,0,0,0,22-22V80A22,22,0,0,0,200,58Zm10,118a10,10,0,0,1-10,10H32a10,10,0,0,1-10-10V80A10,10,0,0,1,32,70H200a10,10,0,0,1,10,10ZM182,96v64a6,6,0,0,1-12,0V96a6,6,0,0,1,12,0Zm-40,0v64a6,6,0,0,1-12,0V96a6,6,0,0,1,12,0Zm-40,0v64a6,6,0,0,1-12,0V96a6,6,0,0,1,12,0ZM62,96v64a6,6,0,0,1-12,0V96a6,6,0,0,1,12,0Zm192,0v64a6,6,0,0,1-12,0V96a6,6,0,0,1,12,0Z"/>`
  ],
  [
    "regular",
    r`<path d="M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8ZM184,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm-40,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm-40,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM64,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm192,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "bold",
    r`<path d="M196,52H28A28,28,0,0,0,0,80v96a28,28,0,0,0,28,28H196a28,28,0,0,0,28-28V80A28,28,0,0,0,196,52Zm4,124a4,4,0,0,1-4,4H28a4,4,0,0,1-4-4V80a4,4,0,0,1,4-4H196a4,4,0,0,1,4,4Zm-16-72v48a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Zm-40,0v48a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Zm-40,0v48a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Zm-40,0v48a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Zm192,0v48a12,12,0,0,1-24,0V104a12,12,0,0,1,24,0Z"/>`
  ],
  [
    "fill",
    r`<path d="M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8ZM192,96v64a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H184A8,8,0,0,1,192,96Zm64,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,80v96a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V80A16,16,0,0,1,32,64H200A16,16,0,0,1,216,80Z" opacity="0.2"/><path d="M200,56H32A24,24,0,0,0,8,80v96a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V80A24,24,0,0,0,200,56Zm8,120a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H200a8,8,0,0,1,8,8ZM184,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm-40,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm-40,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM64,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm192,0v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"/>`
  ]
]);
a.styles = H`
    :host {
      display: contents;
    }
  `;
o([
  v({ type: String, reflect: !0 })
], a.prototype, "size", 2);
o([
  v({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
o([
  v({ type: String, reflect: !0 })
], a.prototype, "color", 2);
o([
  v({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = o([
  h("ph-battery-full")
], a);
export {
  a as PhBatteryFull
};
