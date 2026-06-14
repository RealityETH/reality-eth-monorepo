import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as o } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var m = Object.defineProperty, g = Object.getOwnPropertyDescriptor, l = (e, s, p, H) => {
  for (var t = H > 1 ? void 0 : H ? g(s, p) : s, i = e.length - 1, h; i >= 0; i--)
    (h = e[i]) && (t = (H ? h(s, p, t) : h(t)) || t);
  return H && t && m(s, p, t), t;
};
let a = class extends v {
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
    r`<path d="M220,48V152a12,12,0,0,1-12,12H89.66l17.17,17.17a4,4,0,0,1-5.66,5.66l-24-24a4,4,0,0,1,0-5.66l24-24a4,4,0,0,1,5.66,5.66L89.66,156H208a4,4,0,0,0,4-4V48a4,4,0,0,0-4-4H96a4,4,0,0,0-4,4v8a4,4,0,0,1-8,0V48A12,12,0,0,1,96,36H208A12,12,0,0,1,220,48ZM168,196a4,4,0,0,0-4,4v8a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V104a4,4,0,0,1,4-4H166.34l-17.17,17.17a4,4,0,0,0,5.66,5.66l24-24a4,4,0,0,0,0-5.66l-24-24a4,4,0,0,0-5.66,5.66L166.34,92H48a12,12,0,0,0-12,12V208a12,12,0,0,0,12,12H160a12,12,0,0,0,12-12v-8A4,4,0,0,0,168,196Z"/>`
  ],
  [
    "light",
    r`<path d="M222,48V152a14,14,0,0,1-14,14H94.49l13.75,13.76a6,6,0,1,1-8.48,8.48l-24-24a6,6,0,0,1,0-8.48l24-24a6,6,0,0,1,8.48,8.48L94.49,154H208a2,2,0,0,0,2-2V48a2,2,0,0,0-2-2H96a2,2,0,0,0-2,2v8a6,6,0,0,1-12,0V48A14,14,0,0,1,96,34H208A14,14,0,0,1,222,48ZM168,194a6,6,0,0,0-6,6v8a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V104a2,2,0,0,1,2-2H161.51l-13.75,13.76a6,6,0,1,0,8.48,8.48l24-24a6,6,0,0,0,0-8.48l-24-24a6,6,0,0,0-8.48,8.48L161.51,90H48a14,14,0,0,0-14,14V208a14,14,0,0,0,14,14H160a14,14,0,0,0,14-14v-8A6,6,0,0,0,168,194Z"/>`
  ],
  [
    "regular",
    r`<path d="M224,48V152a16,16,0,0,1-16,16H99.31l10.35,10.34a8,8,0,0,1-11.32,11.32l-24-24a8,8,0,0,1,0-11.32l24-24a8,8,0,0,1,11.32,11.32L99.31,152H208V48H96v8a8,8,0,0,1-16,0V48A16,16,0,0,1,96,32H208A16,16,0,0,1,224,48ZM168,192a8,8,0,0,0-8,8v8H48V104H156.69l-10.35,10.34a8,8,0,0,0,11.32,11.32l24-24a8,8,0,0,0,0-11.32l-24-24a8,8,0,0,0-11.32,11.32L156.69,88H48a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16H160a16,16,0,0,0,16-16v-8A8,8,0,0,0,168,192Z"/>`
  ],
  [
    "bold",
    r`<path d="M228,48V152a20,20,0,0,1-20,20H112.92a12,12,0,0,1-17.41,16.49l-20-20a12,12,0,0,1,0-17l20-20A12,12,0,0,1,112.92,148H204V52H100a12,12,0,0,1-24,0V48A20,20,0,0,1,96,28H208A20,20,0,0,1,228,48ZM168,192a12,12,0,0,0-12,12H52V108h91.08a12,12,0,0,0,17.41,16.49l20-20a12,12,0,0,0,0-17l-20-20A12,12,0,0,0,143.08,84H48a20,20,0,0,0-20,20V208a20,20,0,0,0,20,20H160a20,20,0,0,0,20-20v-4A12,12,0,0,0,168,192Z"/>`
  ],
  [
    "fill",
    r`<path d="M224,48V152a16,16,0,0,1-16,16H112v16a8,8,0,0,1-13.66,5.66l-24-24a8,8,0,0,1,0-11.32l24-24A8,8,0,0,1,112,136v16h96V48H96v8a8,8,0,0,1-16,0V48A16,16,0,0,1,96,32H208A16,16,0,0,1,224,48ZM168,192a8,8,0,0,0-8,8v8H48V104h96v16a8,8,0,0,0,13.66,5.66l24-24a8,8,0,0,0,0-11.32l-24-24A8,8,0,0,0,144,72V88H48a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16H160a16,16,0,0,0,16-16v-8A8,8,0,0,0,168,192Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,48V152a8,8,0,0,1-8,8H168v48a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V104a8,8,0,0,1,8-8H88V48a8,8,0,0,1,8-8H208A8,8,0,0,1,216,48Z" opacity="0.2"/><path d="M224,48V152a16,16,0,0,1-16,16H99.31l10.35,10.34a8,8,0,0,1-11.32,11.32l-24-24a8,8,0,0,1,0-11.32l24-24a8,8,0,0,1,11.32,11.32L99.31,152H208V48H96v8a8,8,0,0,1-16,0V48A16,16,0,0,1,96,32H208A16,16,0,0,1,224,48ZM168,192a8,8,0,0,0-8,8v8H48V104H156.69l-10.35,10.34a8,8,0,0,0,11.32,11.32l24-24a8,8,0,0,0,0-11.32l-24-24a8,8,0,0,0-11.32,11.32L156.69,88H48a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16H160a16,16,0,0,0,16-16v-8A8,8,0,0,0,168,192Z"/>`
  ]
]);
a.styles = A`
    :host {
      display: contents;
    }
  `;
l([
  o({ type: String, reflect: !0 })
], a.prototype, "size", 2);
l([
  o({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
l([
  o({ type: String, reflect: !0 })
], a.prototype, "color", 2);
l([
  o({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = l([
  n("ph-swap")
], a);
export {
  a as PhSwap
};
