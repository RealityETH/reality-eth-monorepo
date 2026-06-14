import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as v } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as l } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var Z = Object.defineProperty, M = Object.getOwnPropertyDescriptor, o = (e, s, V, H) => {
  for (var a = H > 1 ? void 0 : H ? M(s, V) : s, i = e.length - 1, p; i >= 0; i--)
    (p = e[i]) && (a = (H ? p(s, V, a) : p(a)) || a);
  return H && a && Z(s, V, a), a;
};
let t = class extends l {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return v`<svg
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
    r`<path d="M243.94,31.3a4,4,0,0,0-4.64-3.24l-224,40A4,4,0,0,0,16,76a4.14,4.14,0,0,0,.7-.06L124,56.78V100H64a28,28,0,0,0-28,28v64a28,28,0,0,0,28,28H192a28,28,0,0,0,28-28V128a28,28,0,0,0-28-28H132V55.35L240.7,35.94A4,4,0,0,0,243.94,31.3ZM100,164V108h56v56ZM64,108H92v56H44V128A20,20,0,0,1,64,108ZM192,212H64a20,20,0,0,1-20-20V172H212v20A20,20,0,0,1,192,212Zm20-84v36H164V108h28A20,20,0,0,1,212,128Z"/>`
  ],
  [
    "light",
    r`<path d="M245.91,31a6,6,0,0,0-7-4.85L15,66.1A6,6,0,0,0,16,78a6.53,6.53,0,0,0,1.07-.09L122,59.17V98H64a30,30,0,0,0-30,30v64a30,30,0,0,0,30,30H192a30,30,0,0,0,30-30V128a30,30,0,0,0-30-30H134V57L241.05,37.91A6,6,0,0,0,245.91,31ZM102,162V110h52v52ZM64,110H90v52H46V128A18,18,0,0,1,64,110ZM192,210H64a18,18,0,0,1-18-18V174H210v18A18,18,0,0,1,192,210Zm18-82v34H166V110h26A18,18,0,0,1,210,128Z"/>`
  ],
  [
    "regular",
    r`<path d="M247.87,30.59a8,8,0,0,0-9.28-6.46l-224,40A8,8,0,0,0,16,80a8.6,8.6,0,0,0,1.42-.12L120,61.55V96H64a32,32,0,0,0-32,32v64a32,32,0,0,0,32,32H192a32,32,0,0,0,32-32V128a32,32,0,0,0-32-32H136V58.7L241.4,39.88A8,8,0,0,0,247.87,30.59ZM104,160V112h48v48ZM64,112H88v48H48V128A16,16,0,0,1,64,112Zm128,96H64a16,16,0,0,1-16-16V176H208v16A16,16,0,0,1,192,208Zm16-80v32H168V112h24A16,16,0,0,1,208,128Z"/>`
  ],
  [
    "bold",
    r`<path d="M251.81,29.89a12,12,0,0,0-13.92-9.7l-224,40A12,12,0,0,0,16,84a11.77,11.77,0,0,0,2.12-.19L116,66.33V92H64a36,36,0,0,0-36,36v64a36,36,0,0,0,36,36H192a36,36,0,0,0,36-36V128a36,36,0,0,0-36-36H140V62.05L242.11,43.81A12,12,0,0,0,251.81,29.89ZM108,156V116h40v40ZM64,116H84v40H52V128A12,12,0,0,1,64,116Zm128,88H64a12,12,0,0,1-12-12V180H204v12A12,12,0,0,1,192,204Zm12-76v28H172V116h20A12,12,0,0,1,204,128Z"/>`
  ],
  [
    "fill",
    r`<path d="M247.87,30.59a8,8,0,0,0-9.28-6.46l-224,40A8,8,0,0,0,16,80a8.6,8.6,0,0,0,1.42-.12L120,61.56V96H64a32,32,0,0,0-32,32v64a32,32,0,0,0,32,32H192a32,32,0,0,0,32-32V128a32,32,0,0,0-32-32H136V58.7L241.4,39.88A8,8,0,0,0,247.87,30.59ZM104,160V112h48v48ZM64,112H88v48H48V128A16,16,0,0,1,64,112Zm144,16v32H168V112h24A16,16,0,0,1,208,128Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,128v40H40V128a24,24,0,0,1,24-24H192A24,24,0,0,1,216,128Z" opacity="0.2"/><path d="M247.87,30.59a8,8,0,0,0-9.28-6.46l-224,40A8,8,0,0,0,16,80a8.6,8.6,0,0,0,1.42-.12L120,61.56V96H64a32,32,0,0,0-32,32v64a32,32,0,0,0,32,32H192a32,32,0,0,0,32-32V128a32,32,0,0,0-32-32H136V58.7L241.4,39.88A8,8,0,0,0,247.87,30.59ZM104,160V112h48v48ZM64,112H88v48H48V128A16,16,0,0,1,64,112Zm128,96H64a16,16,0,0,1-16-16V176H208v16A16,16,0,0,1,192,208Zm16-80v32H168V112h24A16,16,0,0,1,208,128Z"/>`
  ]
]);
t.styles = A`
    :host {
      display: contents;
    }
  `;
o([
  h({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  h({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  h({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  h({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  m("ph-cable-car")
], t);
export {
  t as PhCableCar
};
