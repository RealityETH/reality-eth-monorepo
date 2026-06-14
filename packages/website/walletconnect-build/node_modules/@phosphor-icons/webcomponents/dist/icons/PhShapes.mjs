import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as Z } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, c = Object.getOwnPropertyDescriptor, s = (r, h, i, o) => {
  for (var a = o > 1 ? void 0 : o ? c(h, i) : h, l = r.length - 1, m; l >= 0; l--)
    (m = r[l]) && (a = (o ? m(h, i, a) : m(a)) || a);
  return o && a && g(h, i, a), a;
};
let t = class extends A {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return Z`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M67.79,62.74a4,4,0,0,0-7.58,0l-40,120A4,4,0,0,0,24,188h80a4,4,0,0,0,3.79-5.26ZM29.55,180,64,76.65,98.45,180ZM204,76a48,48,0,1,0-48,48A48.05,48.05,0,0,0,204,76Zm-88,0a40,40,0,1,1,40,40A40,40,0,0,1,116,76Zm108,72H136a4,4,0,0,0-4,4v56a4,4,0,0,0,4,4h88a4,4,0,0,0,4-4V152A4,4,0,0,0,224,148Zm-4,56H140V156h80Z"/>`
  ],
  [
    "light",
    e`<path d="M69.69,62.1a6,6,0,0,0-11.38,0l-40,120A6,6,0,0,0,24,190h80a6,6,0,0,0,5.69-7.9ZM32.32,178,64,83l31.68,95ZM206,76a50,50,0,1,0-50,50A50.06,50.06,0,0,0,206,76Zm-88,0a38,38,0,1,1,38,38A38,38,0,0,1,118,76Zm106,70H136a6,6,0,0,0-6,6v56a6,6,0,0,0,6,6h88a6,6,0,0,0,6-6V152A6,6,0,0,0,224,146Zm-6,56H142V158h76Z"/>`
  ],
  [
    "regular",
    e`<path d="M71.59,61.47a8,8,0,0,0-15.18,0l-40,120A8,8,0,0,0,24,192h80a8,8,0,0,0,7.59-10.53ZM35.1,176,64,89.3,92.9,176ZM208,76a52,52,0,1,0-52,52A52.06,52.06,0,0,0,208,76Zm-88,0a36,36,0,1,1,36,36A36,36,0,0,1,120,76Zm104,68H136a8,8,0,0,0-8,8v56a8,8,0,0,0,8,8h88a8,8,0,0,0,8-8V152A8,8,0,0,0,224,144Zm-8,56H144V160h72Z"/>`
  ],
  [
    "bold",
    e`<path d="M71.49,60.55a12,12,0,0,0-23,0l-36,120A12,12,0,0,0,24,196H96a12,12,0,0,0,11.49-15.45ZM40.13,172,60,105.76,79.87,172ZM212,74a54,54,0,1,0-54,54A54.06,54.06,0,0,0,212,74Zm-84,0a30,30,0,1,1,30,30A30,30,0,0,1,128,74Zm96,70H136a12,12,0,0,0-12,12v52a12,12,0,0,0,12,12h88a12,12,0,0,0,12-12V156A12,12,0,0,0,224,144Zm-12,52H148V168h64Z"/>`
  ],
  [
    "fill",
    e`<path d="M111.59,181.47A8,8,0,0,1,104,192H24a8,8,0,0,1-7.59-10.53l40-120a8,8,0,0,1,15.18,0ZM208,76a52,52,0,1,0-52,52A52.06,52.06,0,0,0,208,76Zm16,68H136a8,8,0,0,0-8,8v56a8,8,0,0,0,8,8h88a8,8,0,0,0,8-8V152A8,8,0,0,0,224,144Z"/>`
  ],
  [
    "duotone",
    e`<path d="M64,64l40,120H24ZM200,76a44,44,0,1,0-44,44A44,44,0,0,0,200,76Zm-64,76v56h88V152Z" opacity="0.2"/><path d="M224,144H136a8,8,0,0,0-8,8v56a8,8,0,0,0,8,8h88a8,8,0,0,0,8-8V152A8,8,0,0,0,224,144Zm-8,56H144V160h72ZM71.59,61.47a8,8,0,0,0-15.18,0l-40,120A8,8,0,0,0,24,192h80a8,8,0,0,0,7.59-10.53ZM35.1,176,64,89.3,92.9,176ZM208,76a52,52,0,1,0-52,52A52.06,52.06,0,0,0,208,76Zm-88,0a36,36,0,1,1,36,36A36,36,0,0,1,120,76Z"/>`
  ]
]);
t.styles = M`
    :host {
      display: contents;
    }
  `;
s([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  n("ph-shapes")
], t);
export {
  t as PhShapes
};
