import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var Z = Object.defineProperty, M = Object.getOwnPropertyDescriptor, o = (e, s, p, h) => {
  for (var t = h > 1 ? void 0 : h ? M(s, p) : s, l = e.length - 1, H; l >= 0; l--)
    (H = e[l]) && (t = (h ? H(s, p, t) : H(t)) || t);
  return h && t && Z(s, p, t), t;
};
let a = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return V`<svg
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
    r`<path d="M156,96V48a4,4,0,0,1,8,0V92h44a4,4,0,0,1,0,8H160A4,4,0,0,1,156,96ZM96,156H48a4,4,0,0,0,0,8H92v44a4,4,0,0,0,8,0V160A4,4,0,0,0,96,156Zm112,0H160a4,4,0,0,0-4,4v48a4,4,0,0,0,8,0V164h44a4,4,0,0,0,0-8ZM96,44a4,4,0,0,0-4,4V92H48a4,4,0,0,0,0,8H96a4,4,0,0,0,4-4V48A4,4,0,0,0,96,44Z"/>`
  ],
  [
    "light",
    r`<path d="M154,96V48a6,6,0,0,1,12,0V90h42a6,6,0,0,1,0,12H160A6,6,0,0,1,154,96ZM96,154H48a6,6,0,0,0,0,12H90v42a6,6,0,0,0,12,0V160A6,6,0,0,0,96,154Zm112,0H160a6,6,0,0,0-6,6v48a6,6,0,0,0,12,0V166h42a6,6,0,0,0,0-12ZM96,42a6,6,0,0,0-6,6V90H48a6,6,0,0,0,0,12H96a6,6,0,0,0,6-6V48A6,6,0,0,0,96,42Z"/>`
  ],
  [
    "regular",
    r`<path d="M152,96V48a8,8,0,0,1,16,0V88h40a8,8,0,0,1,0,16H160A8,8,0,0,1,152,96ZM96,152H48a8,8,0,0,0,0,16H88v40a8,8,0,0,0,16,0V160A8,8,0,0,0,96,152Zm112,0H160a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V168h40a8,8,0,0,0,0-16ZM96,40a8,8,0,0,0-8,8V88H48a8,8,0,0,0,0,16H96a8,8,0,0,0,8-8V48A8,8,0,0,0,96,40Z"/>`
  ],
  [
    "bold",
    r`<path d="M148,96V48a12,12,0,0,1,24,0V84h36a12,12,0,0,1,0,24H160A12,12,0,0,1,148,96ZM96,148H48a12,12,0,0,0,0,24H84v36a12,12,0,0,0,24,0V160A12,12,0,0,0,96,148Zm112,0H160a12,12,0,0,0-12,12v48a12,12,0,0,0,24,0V172h36a12,12,0,0,0,0-24ZM96,36A12,12,0,0,0,84,48V84H48a12,12,0,0,0,0,24H96a12,12,0,0,0,12-12V48A12,12,0,0,0,96,36Z"/>`
  ],
  [
    "fill",
    r`<path d="M152,96V48a8,8,0,0,1,13.66-5.66l48,48A8,8,0,0,1,208,104H160A8,8,0,0,1,152,96ZM96,152H48a8,8,0,0,0-5.66,13.66l48,48A8,8,0,0,0,104,208V160A8,8,0,0,0,96,152ZM99.06,40.61a8,8,0,0,0-8.72,1.73l-48,48A8,8,0,0,0,48,104H96a8,8,0,0,0,8-8V48A8,8,0,0,0,99.06,40.61ZM208,152H160a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66l48-48A8,8,0,0,0,208,152Z"/>`
  ],
  [
    "duotone",
    r`<path d="M208,64V192a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V64A16,16,0,0,1,64,48H192A16,16,0,0,1,208,64Z" opacity="0.2"/><path d="M152,96V48a8,8,0,0,1,16,0V88h40a8,8,0,0,1,0,16H160A8,8,0,0,1,152,96ZM96,152H48a8,8,0,0,0,0,16H88v40a8,8,0,0,0,16,0V160A8,8,0,0,0,96,152Zm112,0H160a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V168h40a8,8,0,0,0,0-16ZM96,40a8,8,0,0,0-8,8V88H48a8,8,0,0,0,0,16H96a8,8,0,0,0,8-8V48A8,8,0,0,0,96,40Z"/>`
  ]
]);
a.styles = A`
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
  n("ph-corners-in")
], a);
export {
  a as PhCornersIn
};
