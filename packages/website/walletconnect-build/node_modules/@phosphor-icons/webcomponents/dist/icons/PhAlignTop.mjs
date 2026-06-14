import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as l } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, v = Object.getOwnPropertyDescriptor, h = (e, o, p, s) => {
  for (var t = s > 1 ? void 0 : s ? v(o, p) : o, m = e.length - 1, H; m >= 0; m--)
    (H = e[m]) && (t = (s ? H(o, p, t) : H(t)) || t);
  return s && t && n(o, p, t), t;
};
let a = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return l`<svg
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
    r`<path d="M220,40a4,4,0,0,1-4,4H40a4,4,0,0,1,0-8H216A4,4,0,0,1,220,40ZM204,80v96a12,12,0,0,1-12,12H152a12,12,0,0,1-12-12V80a12,12,0,0,1,12-12h40A12,12,0,0,1,204,80Zm-8,0a4,4,0,0,0-4-4H152a4,4,0,0,0-4,4v96a4,4,0,0,0,4,4h40a4,4,0,0,0,4-4Zm-80,0V216a12,12,0,0,1-12,12H64a12,12,0,0,1-12-12V80A12,12,0,0,1,64,68h40A12,12,0,0,1,116,80Zm-8,0a4,4,0,0,0-4-4H64a4,4,0,0,0-4,4V216a4,4,0,0,0,4,4h40a4,4,0,0,0,4-4Z"/>`
  ],
  [
    "light",
    r`<path d="M222,40a6,6,0,0,1-6,6H40a6,6,0,0,1,0-12H216A6,6,0,0,1,222,40ZM206,80v96a14,14,0,0,1-14,14H152a14,14,0,0,1-14-14V80a14,14,0,0,1,14-14h40A14,14,0,0,1,206,80Zm-12,0a2,2,0,0,0-2-2H152a2,2,0,0,0-2,2v96a2,2,0,0,0,2,2h40a2,2,0,0,0,2-2Zm-76,0V216a14,14,0,0,1-14,14H64a14,14,0,0,1-14-14V80A14,14,0,0,1,64,66h40A14,14,0,0,1,118,80Zm-12,0a2,2,0,0,0-2-2H64a2,2,0,0,0-2,2V216a2,2,0,0,0,2,2h40a2,2,0,0,0,2-2Z"/>`
  ],
  [
    "regular",
    r`<path d="M224,40a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40ZM208,80v96a16,16,0,0,1-16,16H152a16,16,0,0,1-16-16V80a16,16,0,0,1,16-16h40A16,16,0,0,1,208,80Zm-16,0H152v96h40Zm-72,0V216a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V80A16,16,0,0,1,64,64h40A16,16,0,0,1,120,80Zm-16,0H64V216h40Z"/>`
  ],
  [
    "bold",
    r`<path d="M228,40a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,40ZM212,88v88a20,20,0,0,1-20,20H156a20,20,0,0,1-20-20V88a20,20,0,0,1,20-20h36A20,20,0,0,1,212,88Zm-24,4H160v80h28Zm-68-4V216a20,20,0,0,1-20,20H64a20,20,0,0,1-20-20V88A20,20,0,0,1,64,68h36A20,20,0,0,1,120,88ZM96,92H68V212H96Z"/>`
  ],
  [
    "fill",
    r`<path d="M224,40a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40ZM192,64H152a16,16,0,0,0-16,16v96a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V80A16,16,0,0,0,192,64Zm-88,0H64A16,16,0,0,0,48,80V216a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V80A16,16,0,0,0,104,64Z"/>`
  ],
  [
    "duotone",
    r`<path d="M200,80v96a8,8,0,0,1-8,8H152a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8h40A8,8,0,0,1,200,80Zm-96-8H64a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8h40a8,8,0,0,0,8-8V80A8,8,0,0,0,104,72Z" opacity="0.2"/><path d="M224,40a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40ZM208,80v96a16,16,0,0,1-16,16H152a16,16,0,0,1-16-16V80a16,16,0,0,1,16-16h40A16,16,0,0,1,208,80Zm-16,0H152v96h40Zm-72,0V216a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V80A16,16,0,0,1,64,64h40A16,16,0,0,1,120,80Zm-16,0H64V216h40Z"/>`
  ]
]);
a.styles = V`
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
  A("ph-align-top")
], a);
export {
  a as PhAlignTop
};
