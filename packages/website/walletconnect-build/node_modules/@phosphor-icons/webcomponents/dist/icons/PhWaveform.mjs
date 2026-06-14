import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as h } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, f = Object.getOwnPropertyDescriptor, o = (e, s, i, m) => {
  for (var t = m > 1 ? void 0 : m ? f(s, i) : s, p = e.length - 1, l; p >= 0; p--)
    (l = e[p]) && (t = (m ? l(s, i, t) : l(t)) || t);
  return m && t && A(s, i, t), t;
};
let a = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return h`<svg
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
    r`<path d="M52,96v64a4,4,0,0,1-8,0V96a4,4,0,0,1,8,0ZM88,28a4,4,0,0,0-4,4V224a4,4,0,0,0,8,0V32A4,4,0,0,0,88,28Zm40,32a4,4,0,0,0-4,4V192a4,4,0,0,0,8,0V64A4,4,0,0,0,128,60Zm40,32a4,4,0,0,0-4,4v64a4,4,0,0,0,8,0V96A4,4,0,0,0,168,92Zm40-16a4,4,0,0,0-4,4v96a4,4,0,0,0,8,0V80A4,4,0,0,0,208,76Z"/>`
  ],
  [
    "light",
    r`<path d="M54,96v64a6,6,0,0,1-12,0V96a6,6,0,0,1,12,0ZM88,26a6,6,0,0,0-6,6V224a6,6,0,0,0,12,0V32A6,6,0,0,0,88,26Zm40,32a6,6,0,0,0-6,6V192a6,6,0,0,0,12,0V64A6,6,0,0,0,128,58Zm40,32a6,6,0,0,0-6,6v64a6,6,0,0,0,12,0V96A6,6,0,0,0,168,90Zm40-16a6,6,0,0,0-6,6v96a6,6,0,0,0,12,0V80A6,6,0,0,0,208,74Z"/>`
  ],
  [
    "regular",
    r`<path d="M56,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM88,24a8,8,0,0,0-8,8V224a8,8,0,0,0,16,0V32A8,8,0,0,0,88,24Zm40,32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V64A8,8,0,0,0,128,56Zm40,32a8,8,0,0,0-8,8v64a8,8,0,0,0,16,0V96A8,8,0,0,0,168,88Zm40-16a8,8,0,0,0-8,8v96a8,8,0,0,0,16,0V80A8,8,0,0,0,208,72Z"/>`
  ],
  [
    "bold",
    r`<path d="M60,96v64a12,12,0,0,1-24,0V96a12,12,0,0,1,24,0ZM88,20A12,12,0,0,0,76,32V224a12,12,0,0,0,24,0V32A12,12,0,0,0,88,20Zm40,32a12,12,0,0,0-12,12V192a12,12,0,0,0,24,0V64A12,12,0,0,0,128,52Zm40,32a12,12,0,0,0-12,12v64a12,12,0,0,0,24,0V96A12,12,0,0,0,168,84Zm40-16a12,12,0,0,0-12,12v96a12,12,0,0,0,24,0V80A12,12,0,0,0,208,68Z"/>`
  ],
  [
    "fill",
    r`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM72,152a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32,32a8,8,0,0,1-16,0V72a8,8,0,0,1,16,0Zm32-16a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Zm32-16a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32,8a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "duotone",
    r`<path d="M208,96v64H48V96Z" opacity="0.2"/><path d="M56,96v64a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0ZM88,24a8,8,0,0,0-8,8V224a8,8,0,0,0,16,0V32A8,8,0,0,0,88,24Zm40,32a8,8,0,0,0-8,8V192a8,8,0,0,0,16,0V64A8,8,0,0,0,128,56Zm40,32a8,8,0,0,0-8,8v64a8,8,0,0,0,16,0V96A8,8,0,0,0,168,88Zm40-16a8,8,0,0,0-8,8v96a8,8,0,0,0,16,0V80A8,8,0,0,0,208,72Z"/>`
  ]
]);
a.styles = n`
    :host {
      display: contents;
    }
  `;
o([
  V({ type: String, reflect: !0 })
], a.prototype, "size", 2);
o([
  V({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
o([
  V({ type: String, reflect: !0 })
], a.prototype, "color", 2);
o([
  V({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = o([
  v("ph-waveform")
], a);
export {
  a as PhWaveform
};
