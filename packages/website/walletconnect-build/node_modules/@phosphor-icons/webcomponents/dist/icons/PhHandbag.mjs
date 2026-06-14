import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, M = Object.getOwnPropertyDescriptor, l = (e, o, i, s) => {
  for (var t = s > 1 ? void 0 : s ? M(o, i) : o, p = e.length - 1, H; p >= 0; p--)
    (H = e[p]) && (t = (s ? H(o, i, t) : H(t)) || t);
  return s && t && A(o, i, t), t;
};
let a = class extends v {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return n`<svg
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
    r`<path d="M235.92,198.59l-14.26-120a12,12,0,0,0-12-10.59H172V64a44,44,0,0,0-88,0v4H46.33a12,12,0,0,0-12,10.59l-14.26,120A12,12,0,0,0,23,207.94,12.11,12.11,0,0,0,32.08,212H223.92a12.11,12.11,0,0,0,9.06-4.06A12,12,0,0,0,235.92,198.59ZM92,64a36,36,0,0,1,72,0v4H92ZM227,202.63a4.08,4.08,0,0,1-3.08,1.37H32.08A4.08,4.08,0,0,1,29,202.63a3.9,3.9,0,0,1-1-3.09l14.25-120a4,4,0,0,1,4-3.54H84v28a4,4,0,0,0,8,0V76h72v28a4,4,0,0,0,8,0V76h37.67a4,4,0,0,1,4.05,3.54l14.25,120A3.9,3.9,0,0,1,227,202.63Z"/>`
  ],
  [
    "light",
    r`<path d="M237.9,198.36l-14.25-120a14.06,14.06,0,0,0-14-12.36H174V64a46,46,0,0,0-92,0v2H46.33a14.06,14.06,0,0,0-14,12.36l-14.25,120a14,14,0,0,0,14,15.64H223.92a14,14,0,0,0,14-15.64ZM94,64a34,34,0,0,1,68,0v2H94ZM225.5,201.3a2.07,2.07,0,0,1-1.58.7H32.08a2.07,2.07,0,0,1-1.58-.7,1.92,1.92,0,0,1-.49-1.53l14.26-120A2,2,0,0,1,46.33,78H82v26a6,6,0,0,0,12,0V78h68v26a6,6,0,0,0,12,0V78h35.67a2,2,0,0,1,2.06,1.77l14.26,120A1.92,1.92,0,0,1,225.5,201.3Z"/>`
  ],
  [
    "regular",
    r`<path d="M239.89,198.12l-14.26-120a16,16,0,0,0-16-14.12H176a48,48,0,0,0-96,0H46.33a16,16,0,0,0-16,14.12l-14.26,120A16,16,0,0,0,20,210.6a16.13,16.13,0,0,0,12,5.4H223.92A16.13,16.13,0,0,0,236,210.6,16,16,0,0,0,239.89,198.12ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32ZM32,200,46.33,80H80v24a8,8,0,0,0,16,0V80h64v24a8,8,0,0,0,16,0V80h33.75l14.17,120Z"/>`
  ],
  [
    "bold",
    r`<path d="M243.86,197.65l-14.25-120A20.06,20.06,0,0,0,209.67,60H179.83A52,52,0,0,0,76.17,60H46.33A20.06,20.06,0,0,0,26.39,77.65l-14.25,120A20,20,0,0,0,32.08,220H223.92a20,20,0,0,0,19.94-22.35ZM128,36a28,28,0,0,1,27.71,24H100.29A28,28,0,0,1,128,36ZM36.5,196,49.81,84H76v20a12,12,0,0,0,24,0V84h56v20a12,12,0,0,0,24,0V84h26.19L219.5,196Z"/>`
  ],
  [
    "fill",
    r`<path d="M239.89,198.12l-14.26-120a16,16,0,0,0-16-14.12H176a48,48,0,0,0-96,0H46.33a16,16,0,0,0-16,14.12l-14.26,120A16,16,0,0,0,20,210.6a16.13,16.13,0,0,0,12,5.4H223.92A16.13,16.13,0,0,0,236,210.6,16,16,0,0,0,239.89,198.12ZM96,104a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Zm32-72a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32Zm48,72a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "duotone",
    r`<path d="M223.92,208H32.08a8,8,0,0,1-8-8.93l14.25-120a8.06,8.06,0,0,1,8-7.07H209.67a8.06,8.06,0,0,1,8,7.07l14.25,120A8,8,0,0,1,223.92,208Z" opacity="0.2"/><path d="M239.89,198.12l-14.26-120a16,16,0,0,0-16-14.12H176a48,48,0,0,0-96,0H46.33a16,16,0,0,0-16,14.12l-14.26,120A16,16,0,0,0,20,210.6a16.13,16.13,0,0,0,12,5.4H223.92A16.13,16.13,0,0,0,236,210.6,16,16,0,0,0,239.89,198.12ZM128,32a32,32,0,0,1,32,32H96A32,32,0,0,1,128,32ZM32,200,46.33,80H80v24a8,8,0,0,0,16,0V80h64v24a8,8,0,0,0,16,0V80h33.75l14.17,120Z"/>`
  ]
]);
a.styles = g`
    :host {
      display: contents;
    }
  `;
l([
  h({ type: String, reflect: !0 })
], a.prototype, "size", 2);
l([
  h({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
l([
  h({ type: String, reflect: !0 })
], a.prototype, "color", 2);
l([
  h({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = l([
  m("ph-handbag")
], a);
export {
  a as PhHandbag
};
