import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, f = Object.getOwnPropertyDescriptor, o = (a, s, l, p) => {
  for (var e = p > 1 ? void 0 : p ? f(s, l) : s, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (e = (p ? n(s, l, e) : n(e)) || e);
  return p && e && c(s, l, e), e;
};
let t = class extends A {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return m`<svg
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
    r`<path d="M161.76,28.41a4,4,0,0,0-4.22.43L86.63,84H40A12,12,0,0,0,28,96v64a12,12,0,0,0,12,12H86.63l70.91,55.16A4.07,4.07,0,0,0,160,228a3.92,3.92,0,0,0,1.76-.41A4,4,0,0,0,164,224V32A4,4,0,0,0,161.76,28.41ZM156,215.82l-65.54-51A4.06,4.06,0,0,0,88,164H40a4,4,0,0,1-4-4V96a4,4,0,0,1,4-4H88a4.06,4.06,0,0,0,2.46-.84l65.54-51Z"/>`
  ],
  [
    "light",
    r`<path d="M162.64,26.61a6,6,0,0,0-6.32.65L85.94,82H40A14,14,0,0,0,26,96v64a14,14,0,0,0,14,14H85.94l70.38,54.74A6,6,0,0,0,166,224V32A6,6,0,0,0,162.64,26.61ZM154,211.73,91.68,163.26A6,6,0,0,0,88,162H40a2,2,0,0,1-2-2V96a2,2,0,0,1,2-2H88a6,6,0,0,0,3.68-1.26L154,44.27Z"/>`
  ],
  [
    "regular",
    r`<path d="M163.51,24.81a8,8,0,0,0-8.42.88L85.25,80H40A16,16,0,0,0,24,96v64a16,16,0,0,0,16,16H85.25l69.84,54.31A8,8,0,0,0,168,224V32A8,8,0,0,0,163.51,24.81ZM152,207.64,92.91,161.69A7.94,7.94,0,0,0,88,160H40V96H88a7.94,7.94,0,0,0,4.91-1.69L152,48.36Z"/>`
  ],
  [
    "bold",
    r`<path d="M165.27,21.22a12,12,0,0,0-12.64,1.31L83.88,76H40A20,20,0,0,0,20,96v64a20,20,0,0,0,20,20H83.88l68.75,53.47A12,12,0,0,0,172,224V32A12,12,0,0,0,165.27,21.22ZM148,199.46,95.37,158.53A12,12,0,0,0,88,156H44V100H88a12,12,0,0,0,7.37-2.53L148,56.54Z"/>`
  ],
  [
    "fill",
    r`<path d="M163.52,24.81a8,8,0,0,0-8.43.88L85.25,80H40A16,16,0,0,0,24,96v64a16,16,0,0,0,16,16H85.25l69.84,54.31A7.94,7.94,0,0,0,160,232a8,8,0,0,0,8-8V32A8,8,0,0,0,163.52,24.81Z"/>`
  ],
  [
    "duotone",
    r`<path d="M160,32V224L88,168H40a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H88Z" opacity="0.2"/><path d="M163.51,24.81a8,8,0,0,0-8.42.88L85.25,80H40A16,16,0,0,0,24,96v64a16,16,0,0,0,16,16H85.25l69.84,54.31A8,8,0,0,0,168,224V32A8,8,0,0,0,163.51,24.81ZM152,207.64,92.91,161.69A7.94,7.94,0,0,0,88,160H40V96H88a7.94,7.94,0,0,0,4.91-1.69L152,48.36Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
o([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  H("ph-speaker-simple-none")
], t);
export {
  t as PhSpeakerSimpleNone
};
