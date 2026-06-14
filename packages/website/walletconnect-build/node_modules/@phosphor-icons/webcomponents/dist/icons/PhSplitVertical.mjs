import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var V = Object.defineProperty, f = Object.getOwnPropertyDescriptor, l = (e, s, p, o) => {
  for (var t = o > 1 ? void 0 : o ? f(s, p) : s, h = e.length - 1, H; h >= 0; h--)
    (H = e[h]) && (t = (o ? H(s, p, t) : H(t)) || t);
  return o && t && V(s, p, t), t;
};
let a = class extends n {
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
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M212,152a4,4,0,0,1-4,4H132v66.34l25.17-25.17a4,4,0,0,1,5.66,5.66l-32,32a4,4,0,0,1-5.66,0l-32-32a4,4,0,0,1,5.66-5.66L124,222.34V156H48a4,4,0,0,1,0-8H208A4,4,0,0,1,212,152ZM48,108H208a4,4,0,0,0,0-8H132V33.66l25.17,25.17a4,4,0,1,0,5.66-5.66l-32-32a4,4,0,0,0-5.66,0l-32,32a4,4,0,0,0,5.66,5.66L124,33.66V100H48a4,4,0,0,0,0,8Z"/>`
  ],
  [
    "light",
    r`<path d="M214,152a6,6,0,0,1-6,6H134v59.51l21.76-21.75a6,6,0,0,1,8.48,8.48l-32,32a6,6,0,0,1-8.48,0l-32-32a6,6,0,0,1,8.48-8.48L122,217.51V158H48a6,6,0,0,1,0-12H208A6,6,0,0,1,214,152ZM48,110H208a6,6,0,0,0,0-12H134V38.49l21.76,21.75a6,6,0,0,0,8.48-8.48l-32-32a6,6,0,0,0-8.48,0l-32,32a6,6,0,0,0,8.48,8.48L122,38.49V98H48a6,6,0,0,0,0,12Z"/>`
  ],
  [
    "regular",
    r`<path d="M216,152a8,8,0,0,1-8,8H136v52.69l18.34-18.35a8,8,0,0,1,11.32,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L120,212.69V160H48a8,8,0,0,1,0-16H208A8,8,0,0,1,216,152ZM48,112H208a8,8,0,0,0,0-16H136V43.31l18.34,18.35a8,8,0,0,0,11.32-11.32l-32-32a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L120,43.31V96H48a8,8,0,0,0,0,16Z"/>`
  ],
  [
    "bold",
    r`<path d="M220,152a12,12,0,0,1-12,12H140v39l11.51-11.52a12,12,0,0,1,17,17l-32,32a12,12,0,0,1-17,0l-32-32a12,12,0,0,1,17-17L116,203V164H48a12,12,0,0,1,0-24H208A12,12,0,0,1,220,152ZM48,116H208a12,12,0,0,0,0-24H140V53l11.51,11.52a12,12,0,1,0,17-17l-32-32a12,12,0,0,0-17,0l-32,32a12,12,0,1,0,17,17L116,53V92H48a12,12,0,0,0,0,24Z"/>`
  ],
  [
    "fill",
    r`<path d="M216,152a8,8,0,0,1-8,8H136v32h24a8,8,0,0,1,5.66,13.66l-32,32a8,8,0,0,1-11.32,0l-32-32A8,8,0,0,1,96,192h24V160H48a8,8,0,0,1,0-16H208A8,8,0,0,1,216,152ZM48,112H208a8,8,0,0,0,0-16H136V64h24a8,8,0,0,0,5.66-13.66l-32-32a8,8,0,0,0-11.32,0l-32,32A8,8,0,0,0,96,64h24V96H48a8,8,0,0,0,0,16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M160,56H96l32-32ZM128,232l32-32H96Z" opacity="0.2"/><path d="M208,144H48a8,8,0,0,0,0,16h72v32H96a8,8,0,0,0-5.66,13.66l32,32a8,8,0,0,0,11.32,0l32-32A8,8,0,0,0,160,192H136V160h72a8,8,0,0,0,0-16Zm-80,76.69L115.31,208h25.38ZM48,112H208a8,8,0,0,0,0-16H136V64h24a8,8,0,0,0,5.66-13.66l-32-32a8,8,0,0,0-11.32,0l-32,32A8,8,0,0,0,96,64h24V96H48a8,8,0,0,0,0,16Zm80-76.69L140.69,48H115.31Z"/>`
  ]
]);
a.styles = g`
    :host {
      display: contents;
    }
  `;
l([
  i({ type: String, reflect: !0 })
], a.prototype, "size", 2);
l([
  i({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
l([
  i({ type: String, reflect: !0 })
], a.prototype, "color", 2);
l([
  i({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = l([
  c("ph-split-vertical")
], a);
export {
  a as PhSplitVertical
};
