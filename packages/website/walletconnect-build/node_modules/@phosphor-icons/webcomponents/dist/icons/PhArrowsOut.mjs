import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as M } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, v = Object.getOwnPropertyDescriptor, l = (e, o, i, s) => {
  for (var t = s > 1 ? void 0 : s ? v(o, i) : o, p = e.length - 1, V; p >= 0; p--)
    (V = e[p]) && (t = (s ? V(o, i, t) : V(t)) || t);
  return s && t && n(o, i, t), t;
};
let a = class extends M {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return H`<svg
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
    r`<path d="M212,48V96a4,4,0,0,1-8,0V57.66l-49.17,49.17a4,4,0,0,1-5.66-5.66L198.34,52H160a4,4,0,0,1,0-8h48A4,4,0,0,1,212,48ZM101.17,149.17,52,198.34V160a4,4,0,0,0-8,0v48a4,4,0,0,0,4,4H96a4,4,0,0,0,0-8H57.66l49.17-49.17a4,4,0,0,0-5.66-5.66ZM208,156a4,4,0,0,0-4,4v38.34l-49.17-49.17a4,4,0,0,0-5.66,5.66L198.34,204H160a4,4,0,0,0,0,8h48a4,4,0,0,0,4-4V160A4,4,0,0,0,208,156ZM57.66,52H96a4,4,0,0,0,0-8H48a4,4,0,0,0-4,4V96a4,4,0,0,0,8,0V57.66l49.17,49.17a4,4,0,0,0,5.66-5.66Z"/>`
  ],
  [
    "light",
    r`<path d="M214,48V96a6,6,0,0,1-12,0V62.48l-45.76,45.76a6,6,0,0,1-8.48-8.48L193.52,54H160a6,6,0,0,1,0-12h48A6,6,0,0,1,214,48ZM99.76,147.76,54,193.52V160a6,6,0,0,0-12,0v48a6,6,0,0,0,6,6H96a6,6,0,0,0,0-12H62.48l45.76-45.76a6,6,0,0,0-8.48-8.48ZM208,154a6,6,0,0,0-6,6v33.52l-45.76-45.76a6,6,0,0,0-8.48,8.48L193.52,202H160a6,6,0,0,0,0,12h48a6,6,0,0,0,6-6V160A6,6,0,0,0,208,154ZM62.48,54H96a6,6,0,0,0,0-12H48a6,6,0,0,0-6,6V96a6,6,0,0,0,12,0V62.48l45.76,45.76a6,6,0,0,0,8.48-8.48Z"/>`
  ],
  [
    "regular",
    r`<path d="M216,48V96a8,8,0,0,1-16,0V67.31l-42.34,42.35a8,8,0,0,1-11.32-11.32L188.69,56H160a8,8,0,0,1,0-16h48A8,8,0,0,1,216,48ZM98.34,146.34,56,188.69V160a8,8,0,0,0-16,0v48a8,8,0,0,0,8,8H96a8,8,0,0,0,0-16H67.31l42.35-42.34a8,8,0,0,0-11.32-11.32ZM208,152a8,8,0,0,0-8,8v28.69l-42.34-42.35a8,8,0,0,0-11.32,11.32L188.69,200H160a8,8,0,0,0,0,16h48a8,8,0,0,0,8-8V160A8,8,0,0,0,208,152ZM67.31,56H96a8,8,0,0,0,0-16H48a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V67.31l42.34,42.35a8,8,0,0,0,11.32-11.32Z"/>`
  ],
  [
    "bold",
    r`<path d="M220,48V96a12,12,0,0,1-24,0V77l-35.51,35.52a12,12,0,0,1-17-17L179,60H160a12,12,0,0,1,0-24h48A12,12,0,0,1,220,48ZM95.51,143.51,60,179V160a12,12,0,0,0-24,0v48a12,12,0,0,0,12,12H96a12,12,0,0,0,0-24H77l35.52-35.51a12,12,0,0,0-17-17ZM208,148a12,12,0,0,0-12,12v19l-35.51-35.52a12,12,0,0,0-17,17L179,196H160a12,12,0,0,0,0,24h48a12,12,0,0,0,12-12V160A12,12,0,0,0,208,148ZM77,60H96a12,12,0,0,0,0-24H48A12,12,0,0,0,36,48V96a12,12,0,0,0,24,0V77l35.51,35.52a12,12,0,0,0,17-17Z"/>`
  ],
  [
    "fill",
    r`<path d="M109.66,146.34a8,8,0,0,1,0,11.32L83.31,184l18.35,18.34A8,8,0,0,1,96,216H48a8,8,0,0,1-8-8V160a8,8,0,0,1,13.66-5.66L72,172.69l26.34-26.35A8,8,0,0,1,109.66,146.34ZM83.31,72l18.35-18.34A8,8,0,0,0,96,40H48a8,8,0,0,0-8,8V96a8,8,0,0,0,13.66,5.66L72,83.31l26.34,26.35a8,8,0,0,0,11.32-11.32ZM208,40H160a8,8,0,0,0-5.66,13.66L172.69,72,146.34,98.34a8,8,0,0,0,11.32,11.32L184,83.31l18.34,18.35A8,8,0,0,0,216,96V48A8,8,0,0,0,208,40Zm3.06,112.61a8,8,0,0,0-8.72,1.73L184,172.69l-26.34-26.35a8,8,0,0,0-11.32,11.32L172.69,184l-18.35,18.34A8,8,0,0,0,160,216h48a8,8,0,0,0,8-8V160A8,8,0,0,0,211.06,152.61Z"/>`
  ],
  [
    "duotone",
    r`<path d="M208,48V208H48V48Z" opacity="0.2"/><path d="M216,48V96a8,8,0,0,1-16,0V67.31l-42.34,42.35a8,8,0,0,1-11.32-11.32L188.69,56H160a8,8,0,0,1,0-16h48A8,8,0,0,1,216,48ZM98.34,146.34,56,188.69V160a8,8,0,0,0-16,0v48a8,8,0,0,0,8,8H96a8,8,0,0,0,0-16H67.31l42.35-42.34a8,8,0,0,0-11.32-11.32ZM208,152a8,8,0,0,0-8,8v28.69l-42.34-42.35a8,8,0,0,0-11.32,11.32L188.69,200H160a8,8,0,0,0,0,16h48a8,8,0,0,0,8-8V160A8,8,0,0,0,208,152ZM67.31,56H96a8,8,0,0,0,0-16H48a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V67.31l42.34,42.35a8,8,0,0,0,11.32-11.32Z"/>`
  ]
]);
a.styles = m`
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
  Z("ph-arrows-out")
], a);
export {
  a as PhArrowsOut
};
