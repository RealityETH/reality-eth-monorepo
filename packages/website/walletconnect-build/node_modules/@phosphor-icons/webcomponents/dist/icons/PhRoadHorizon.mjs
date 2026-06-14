import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, L = Object.getOwnPropertyDescriptor, o = (e, s, h, i) => {
  for (var a = i > 1 ? void 0 : i ? L(s, h) : s, l = e.length - 1, H; l >= 0; l--)
    (H = e[l]) && (a = (i ? H(s, h, a) : H(a)) || a);
  return i && a && g(s, h, a), a;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return m`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M235.49,190a4,4,0,0,1-1.53,5.45,4.07,4.07,0,0,1-2,.51,4,4,0,0,1-3.49-2L157.66,68H132V80a4,4,0,0,1-8,0V68H98.34L27.49,194A4,4,0,0,1,24,196a4.07,4.07,0,0,1-2-.51A4,4,0,0,1,20.51,190L89.16,68H24a4,4,0,0,1,0-8H232a4,4,0,0,1,0,8H166.84ZM128,116a4,4,0,0,0-4,4v16a4,4,0,0,0,8,0V120A4,4,0,0,0,128,116Zm0,56a4,4,0,0,0-4,4v16a4,4,0,0,0,8,0V176A4,4,0,0,0,128,172Z"/>`
  ],
  [
    "light",
    r`<path d="M234.94,197.23a6,6,0,0,1-8.17-2.29L156.49,70H134V80a6,6,0,0,1-12,0V70H99.51L29.23,194.94a6,6,0,1,1-10.46-5.88L85.74,70H24a6,6,0,0,1,0-12H232a6,6,0,0,1,0,12H170.26l67,119.06A6,6,0,0,1,234.94,197.23ZM128,114a6,6,0,0,0-6,6v16a6,6,0,0,0,12,0V120A6,6,0,0,0,128,114Zm0,56a6,6,0,0,0-6,6v16a6,6,0,0,0,12,0V176A6,6,0,0,0,128,170Z"/>`
  ],
  [
    "regular",
    r`<path d="M235.92,199A8,8,0,0,1,225,195.92L155.32,72H136v8a8,8,0,0,1-16,0V72H100.68L31,195.92A8,8,0,0,1,17,188.08L82.32,72H24a8,8,0,0,1,0-16H232a8,8,0,0,1,0,16H173.68L239,188.08A8,8,0,0,1,235.92,199ZM128,112a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V120A8,8,0,0,0,128,112Zm0,56a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V176A8,8,0,0,0,128,168Z"/>`
  ],
  [
    "bold",
    r`<path d="M237.88,202.46a12,12,0,0,1-16.34-4.58L153,76H140v4a12,12,0,0,1-24,0V76H103L34.46,197.88a12,12,0,1,1-20.92-11.76L75.48,76H24a12,12,0,0,1,0-24H232a12,12,0,0,1,0,24H180.52l61.94,110.12A12,12,0,0,1,237.88,202.46ZM128,108a12,12,0,0,0-12,12v16a12,12,0,0,0,24,0V120A12,12,0,0,0,128,108Zm0,56a12,12,0,0,0-12,12v16a12,12,0,0,0,24,0V176A12,12,0,0,0,128,164Z"/>`
  ],
  [
    "fill",
    r`<path d="M239,188.08,173.68,72h58A8.17,8.17,0,0,0,240,64.53,8,8,0,0,0,232,56H24.27A8.17,8.17,0,0,0,16,63.47,8,8,0,0,0,24,72H82.32L17,188.08a8,8,0,0,0,1.17,9.43,8.24,8.24,0,0,0,6,2.49H116a4,4,0,0,0,4-4V176.27a8.17,8.17,0,0,1,7.47-8.25,8,8,0,0,1,8.53,8v20a4,4,0,0,0,4,4h91.77a8.24,8.24,0,0,0,6-2.49A8,8,0,0,0,239,188.08ZM136,140a8,8,0,0,1-16,0V124a8,8,0,0,1,16,0Zm0-52a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "duotone",
    r`<path d="M232,192H24L96,64h64Z" opacity="0.2"/><path d="M235.92,199A8,8,0,0,1,225,195.92L155.32,72H136v8a8,8,0,0,1-16,0V72H100.68L31,195.92A8,8,0,0,1,17,188.08L82.32,72H24a8,8,0,0,1,0-16H232a8,8,0,0,1,0,16H173.68L239,188.08A8,8,0,0,1,235.92,199ZM128,112a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V120A8,8,0,0,0,128,112Zm0,56a8,8,0,0,0-8,8v16a8,8,0,0,0,16,0V176A8,8,0,0,0,128,168Z"/>`
  ]
]);
t.styles = A`
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
  v("ph-road-horizon")
], t);
export {
  t as PhRoadHorizon
};
