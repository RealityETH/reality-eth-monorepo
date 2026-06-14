import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as L } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var V = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (a, h, i, s) => {
  for (var r = s > 1 ? void 0 : s ? g(h, i) : h, p = a.length - 1, H; p >= 0; p--)
    (H = a[p]) && (r = (s ? H(h, i, r) : H(r)) || r);
  return s && r && V(h, i, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return A`<svg
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
    e`<path d="M196,64V40a12,12,0,0,0-12-12H72A12,12,0,0,0,60,40V64A12,12,0,0,0,72,76H83.32L60.05,223.38A4,4,0,0,0,63.38,228,4.46,4.46,0,0,0,64,228,4,4,0,0,0,68,224.62L76.26,172H179.74l8.31,52.62A4,4,0,0,0,192,228a4.46,4.46,0,0,0,.63-.05,4,4,0,0,0,3.33-4.57L172.68,76H184A12,12,0,0,0,196,64ZM68,64V40a4,4,0,0,1,4-4H184a4,4,0,0,1,4,4V64a4,4,0,0,1-4,4H72A4,4,0,0,1,68,64ZM178.48,164h-101l13.9-88h73.16Z"/>`
  ],
  [
    "light",
    e`<path d="M198,64V40a14,14,0,0,0-14-14H72A14,14,0,0,0,58,40V64A14,14,0,0,0,72,78h9L58.07,223.06a6,6,0,0,0,5,6.87,6,6,0,0,0,6.86-5L78,174H178l8,50.93a6,6,0,1,0,11.86-1.87L175,78h9A14,14,0,0,0,198,64ZM70,64V40a2,2,0,0,1,2-2H184a2,2,0,0,1,2,2V64a2,2,0,0,1-2,2H72A2,2,0,0,1,70,64Zm106.14,98H79.86L93.13,78h69.74Z"/>`
  ],
  [
    "regular",
    e`<path d="M200,64V40a16,16,0,0,0-16-16H72A16,16,0,0,0,56,40V64A16,16,0,0,0,72,80h6.64L56.1,222.75a8,8,0,0,0,6.65,9.15A7.82,7.82,0,0,0,64,232a8,8,0,0,0,7.89-6.75L79.68,176h96.64l7.78,49.25A8,8,0,0,0,192,232a7.82,7.82,0,0,0,1.26-.1,8,8,0,0,0,6.65-9.15L177.36,80H184A16,16,0,0,0,200,64ZM72,40H184V64H72ZM173.79,160H82.21L94.84,80h66.32Z"/>`
  ],
  [
    "bold",
    e`<path d="M204,64V40a20,20,0,0,0-20-20H72A20,20,0,0,0,52,40V64A20,20,0,0,0,72,84h2L52.15,222.13a12,12,0,1,0,23.7,3.74L83.1,180h89.8l7.25,45.87a12,12,0,1,0,23.7-3.74L182,84h2A20,20,0,0,0,204,64ZM76,44H180V60H76Zm93.11,112H86.89L98.25,84h59.5Z"/>`
  ],
  [
    "fill",
    e`<path d="M200,64V40a16,16,0,0,0-16-16H72A16,16,0,0,0,56,40V64A16,16,0,0,0,72,80h6.64L56.1,222.75a8,8,0,0,0,6.65,9.15A7.82,7.82,0,0,0,64,232a8,8,0,0,0,7.89-6.75L79.68,176h96.64l7.78,49.25A8,8,0,0,0,192,232a7.82,7.82,0,0,0,1.26-.1,8,8,0,0,0,6.65-9.15L177.36,80H184A16,16,0,0,0,200,64Zm-26.21,96H82.21L94.84,80h66.32Z"/>`
  ],
  [
    "duotone",
    e`<path d="M192,40V64a8,8,0,0,1-8,8H72a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8H184A8,8,0,0,1,192,40Z" opacity="0.2"/><path d="M200,64V40a16,16,0,0,0-16-16H72A16,16,0,0,0,56,40V64A16,16,0,0,0,72,80h6.64L56.1,222.75a8,8,0,0,0,6.65,9.15A7.82,7.82,0,0,0,64,232a8,8,0,0,0,7.89-6.75L79.68,176h96.64l7.78,49.25A8,8,0,0,0,192,232a7.82,7.82,0,0,0,1.26-.1,8,8,0,0,0,6.65-9.15L177.36,80H184A16,16,0,0,0,200,64ZM72,40H184V64H72ZM173.79,160H82.21L94.84,80h66.32Z"/>`
  ]
]);
t.styles = n`
    :host {
      display: contents;
    }
  `;
o([
  l({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  l({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  l({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  l({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  L("ph-stool")
], t);
export {
  t as PhStool
};
