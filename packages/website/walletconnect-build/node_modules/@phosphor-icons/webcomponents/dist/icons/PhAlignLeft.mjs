import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as V } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (r, s, m, h) => {
  for (var t = h > 1 ? void 0 : h ? g(s, m) : s, p = r.length - 1, l; p >= 0; p--)
    (l = r[p]) && (t = (h ? l(s, m, t) : l(t)) || t);
  return h && t && n(s, m, t), t;
};
let a = class extends V {
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
    e`<path d="M44,40V216a4,4,0,0,1-8,0V40a4,4,0,0,1,8,0Zm24,64V64A12,12,0,0,1,80,52h96a12,12,0,0,1,12,12v40a12,12,0,0,1-12,12H80A12,12,0,0,1,68,104Zm8,0a4,4,0,0,0,4,4h96a4,4,0,0,0,4-4V64a4,4,0,0,0-4-4H80a4,4,0,0,0-4,4Zm152,48v40a12,12,0,0,1-12,12H80a12,12,0,0,1-12-12V152a12,12,0,0,1,12-12H216A12,12,0,0,1,228,152Zm-8,0a4,4,0,0,0-4-4H80a4,4,0,0,0-4,4v40a4,4,0,0,0,4,4H216a4,4,0,0,0,4-4Z"/>`
  ],
  [
    "light",
    e`<path d="M46,40V216a6,6,0,0,1-12,0V40a6,6,0,0,1,12,0Zm20,64V64A14,14,0,0,1,80,50h96a14,14,0,0,1,14,14v40a14,14,0,0,1-14,14H80A14,14,0,0,1,66,104Zm12,0a2,2,0,0,0,2,2h96a2,2,0,0,0,2-2V64a2,2,0,0,0-2-2H80a2,2,0,0,0-2,2Zm152,48v40a14,14,0,0,1-14,14H80a14,14,0,0,1-14-14V152a14,14,0,0,1,14-14H216A14,14,0,0,1,230,152Zm-12,0a2,2,0,0,0-2-2H80a2,2,0,0,0-2,2v40a2,2,0,0,0,2,2H216a2,2,0,0,0,2-2Z"/>`
  ],
  [
    "regular",
    e`<path d="M48,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0Zm16,64V64A16,16,0,0,1,80,48h96a16,16,0,0,1,16,16v40a16,16,0,0,1-16,16H80A16,16,0,0,1,64,104Zm16,0h96V64H80Zm152,48v40a16,16,0,0,1-16,16H80a16,16,0,0,1-16-16V152a16,16,0,0,1,16-16H216A16,16,0,0,1,232,152Zm-16,40V152H80v40H216Z"/>`
  ],
  [
    "bold",
    e`<path d="M52,40V216a12,12,0,0,1-24,0V40a12,12,0,0,1,24,0Zm16,60V64A20,20,0,0,1,88,44h88a20,20,0,0,1,20,20v36a20,20,0,0,1-20,20H88A20,20,0,0,1,68,100Zm24-4h80V68H92Zm144,60v36a20,20,0,0,1-20,20H88a20,20,0,0,1-20-20V156a20,20,0,0,1,20-20H216A20,20,0,0,1,236,156Zm-24,4H92v28H212Z"/>`
  ],
  [
    "fill",
    e`<path d="M232,152v40a16,16,0,0,1-16,16H80a16,16,0,0,1-16-16V152a16,16,0,0,1,16-16H216A16,16,0,0,1,232,152ZM40,32a8,8,0,0,0-8,8V216a8,8,0,0,0,16,0V40A8,8,0,0,0,40,32Zm40,88h96a16,16,0,0,0,16-16V64a16,16,0,0,0-16-16H80A16,16,0,0,0,64,64v40A16,16,0,0,0,80,120Z"/>`
  ],
  [
    "duotone",
    e`<path d="M72,104V64a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8v40a8,8,0,0,1-8,8H80A8,8,0,0,1,72,104Zm144,40H80a8,8,0,0,0-8,8v40a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V152A8,8,0,0,0,216,144Z" opacity="0.2"/><path d="M216,136H80a16,16,0,0,0-16,16v40a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V152A16,16,0,0,0,216,136Zm0,56H80V152H216v40ZM48,40V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0Zm32,80h96a16,16,0,0,0,16-16V64a16,16,0,0,0-16-16H80A16,16,0,0,0,64,64v40A16,16,0,0,0,80,120Zm0-56h96v40H80Z"/>`
  ]
]);
a.styles = Z`
    :host {
      display: contents;
    }
  `;
o([
  i({ type: String, reflect: !0 })
], a.prototype, "size", 2);
o([
  i({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
o([
  i({ type: String, reflect: !0 })
], a.prototype, "color", 2);
o([
  i({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = o([
  v("ph-align-left")
], a);
export {
  a as PhAlignLeft
};
