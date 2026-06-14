import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as u } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, f = Object.getOwnPropertyDescriptor, a = (l, o, p, s) => {
  for (var r = s > 1 ? void 0 : s ? f(o, p) : o, h = l.length - 1, m; h >= 0; h--)
    (m = l[h]) && (r = (s ? m(o, p, r) : m(r)) || r);
  return s && r && c(o, p, r), r;
};
let t = class extends g {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var l;
    return n`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((l = this.weight) != null ? l : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M226.83,106.83l-48,48a4,4,0,0,1-5.66-5.66L218.34,104,173.17,58.83a4,4,0,0,1,5.66-5.66l48,48A4,4,0,0,1,226.83,106.83Zm-48-5.66-48-48a4,4,0,1,0-5.66,5.66L166.34,100H128A100.11,100.11,0,0,0,28,200a4,4,0,0,0,8,0,92.1,92.1,0,0,1,92-92h38.34l-41.17,41.17a4,4,0,0,0,5.66,5.66l48-48A4,4,0,0,0,178.83,101.17Z"/>`
  ],
  [
    "light",
    e`<path d="M228.24,108.24l-48,48a6,6,0,0,1-8.48-8.48L215.51,104,171.76,60.24a6,6,0,0,1,8.48-8.48l48,48A6,6,0,0,1,228.24,108.24Zm-48-8.48-48-48a6,6,0,1,0-8.48,8.48L161.51,98H128A102.12,102.12,0,0,0,26,200a6,6,0,0,0,12,0,90.1,90.1,0,0,1,90-90h33.51l-37.75,37.76a6,6,0,1,0,8.48,8.48l48-48A6,6,0,0,0,180.24,99.76Z"/>`
  ],
  [
    "regular",
    e`<path d="M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L212.69,104,170.34,61.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,109.66Zm-48-11.32-48-48a8,8,0,0,0-11.32,11.32L156.69,96H128A104.11,104.11,0,0,0,24,200a8,8,0,0,0,16,0,88.1,88.1,0,0,1,88-88h28.69l-34.35,34.34a8,8,0,0,0,11.32,11.32l48-48A8,8,0,0,0,181.66,98.34Z"/>`
  ],
  [
    "bold",
    e`<path d="M232.49,112.49l-48,48a12,12,0,0,1-17-17L207,104,167.51,64.48a12,12,0,0,1,17-17l48,48A12,12,0,0,1,232.49,112.49Zm-56-17-48-48a12,12,0,1,0-17,17L139,92H128A108.12,108.12,0,0,0,20,200a12,12,0,0,0,24,0,84.09,84.09,0,0,1,84-84h11l-27.52,27.51a12,12,0,0,0,17,17l48-48A12,12,0,0,0,176.49,95.51Z"/>`
  ],
  [
    "fill",
    e`<path d="M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L212.69,104,170.34,61.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,109.66Zm-48-11.32-48-48A8,8,0,0,0,120,56V96.3A104.15,104.15,0,0,0,24,200a8,8,0,0,0,16,0,88.11,88.11,0,0,1,80-87.63V152a8,8,0,0,0,13.66,5.66l48-48A8,8,0,0,0,181.66,98.34Z"/>`
  ],
  [
    "duotone",
    e`<path d="M176,104l-48,48V56Z" opacity="0.2"/><path d="M229.66,109.66l-48,48a8,8,0,0,1-11.32-11.32L212.69,104,170.34,61.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,109.66Zm-48,0-48,48A8,8,0,0,1,120,152V112.37A88.11,88.11,0,0,0,40,200a8,8,0,0,1-16,0A104.15,104.15,0,0,1,120,96.3V56a8,8,0,0,1,13.66-5.66l48,48A8,8,0,0,1,181.66,109.66Zm-17-5.66L136,75.31v57.38Z"/>`
  ]
]);
t.styles = u`
    :host {
      display: contents;
    }
  `;
a([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  A("ph-arrow-bend-double-up-right")
], t);
export {
  t as PhArrowBendDoubleUpRight
};
