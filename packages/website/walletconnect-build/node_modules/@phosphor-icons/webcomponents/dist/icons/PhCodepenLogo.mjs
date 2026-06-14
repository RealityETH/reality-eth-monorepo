import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as i } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as h } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as s } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var V = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (l, L, m, a) => {
  for (var e = a > 1 ? void 0 : a ? g(L, m) : L, p = l.length - 1, Z; p >= 0; p--)
    (Z = l[p]) && (e = (a ? Z(L, m, e) : Z(e)) || e);
  return a && e && V(L, m, e), e;
};
let t = class extends h {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var l;
    return i`<svg
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
    r`<path d="M234,92.55s-.05,0-.09-.07l-104-56a4,4,0,0,0-3.8,0l-104,56-.11.08A4,4,0,0,0,20,96v64a4,4,0,0,0,2,3.45.71.71,0,0,0,.09.07l104,56a4,4,0,0,0,3.8,0l104-56a.27.27,0,0,0,.08-.07,4,4,0,0,0,2-3.45V96A4,4,0,0,0,234,92.55Zm-6,60.75L181,128l47-25.3Zm-55.43-29.84L132,101.61V46.7L223.56,96Zm-44.57,24L91.87,128,128,108.54,164.13,128ZM124,46.7v54.91L83.43,123.46,32.44,96Zm-96,56L75,128,28,153.3Zm55.43,29.84L124,154.39V209.3L32.44,160ZM132,209.3V154.39l40.57-21.85,51,27.46Z"/>`
  ],
  [
    "light",
    r`<path d="M234.85,90.72h0l-104-56a6,6,0,0,0-5.68,0l-104,56h0A6,6,0,0,0,18,96v64a6,6,0,0,0,3.15,5.28h0l104,56a6,6,0,0,0,5.68,0l104-56h0A6,6,0,0,0,238,160V96A6,6,0,0,0,234.85,90.72ZM226,150,185.23,128l40.77-22Zm-53.43-28.77L134,100.42V50l85.34,46Zm-44.57,24L96.08,128,128,110.81,159.92,128ZM122,50v50.38L83.43,121.18,36.66,96Zm-92,56,40.77,22L30,150Zm53.43,28.76L122,155.58V206L36.66,160ZM134,206V155.58l38.57-20.77L219.34,160Z"/>`
  ],
  [
    "regular",
    r`<path d="M235.79,89l-104-56a8,8,0,0,0-7.58,0l-104,56A8,8,0,0,0,16,96v64a8,8,0,0,0,4.21,7.05l104,56a8,8,0,0,0,7.58,0l104-56A8,8,0,0,0,240,160V96A8,8,0,0,0,235.79,89ZM224,146.61,189.45,128,224,109.39Zm-51.43-27.7L136,99.22V53.39L215.13,96Zm-44.57,24L100.3,128,128,113.09,155.7,128Zm-8-89.52V99.22L83.43,118.91,40.87,96Zm-88,56L66.55,128,32,146.61Zm51.43,27.7L120,156.78v45.83L40.87,160ZM136,202.61V156.78l36.57-19.69L215.13,160Z"/>`
  ],
  [
    "bold",
    r`<path d="M237.68,85.43l-104-56a12,12,0,0,0-11.38,0l-104,56A12,12,0,0,0,12,96v64a12,12,0,0,0,6.32,10.57l104,56a12,12,0,0,0,11.38,0l104-56A12,12,0,0,0,244,160V96A12,12,0,0,0,237.68,85.43ZM220,139.91,197.88,128,220,116.09Zm-47.43-25.54L140,96.83V60.09L206.69,96Zm-44.57,24L108.74,128,128,117.63,147.26,128ZM116,60.09V96.83L83.43,114.37,49.31,96Zm-80,56L58.12,128,36,139.91Zm47.43,25.54L116,159.17v36.74L49.31,160ZM140,195.91V159.17l32.57-17.54L206.69,160Z"/>`
  ],
  [
    "fill",
    r`<path d="M235.79,89l-104-56a8,8,0,0,0-7.58,0l-104,56A8,8,0,0,0,16,96v64a8,8,0,0,0,4.21,7L114.1,217.6a4,4,0,0,0,5.9-3.52v-57.3L66.55,128,32,146.61V109.39L66.55,128l16.88-9.09L40.87,96,120,53.39V99.22L83.43,118.91l44.57,24,44.57-24L189.45,128,224,109.39v37.22L189.45,128,136,156.78v57.3a4,4,0,0,0,5.9,3.52L235.79,167a8,8,0,0,0,4.21-7V96A8,8,0,0,0,235.79,89Zm-63.22,30L136,99.22V53.39L215.13,96Z"/>`
  ],
  [
    "duotone",
    r`<path d="M232,160,128,216,24,160l104-56Z" opacity="0.2"/><path d="M235.79,89l-104-56a8,8,0,0,0-7.58,0l-104,56A8,8,0,0,0,16,96v64a8,8,0,0,0,4.21,7.05l104,56a8,8,0,0,0,7.58,0l104-56A8,8,0,0,0,240,160V96A8,8,0,0,0,235.79,89ZM224,146.61,189.45,128,224,109.39Zm-51.43-27.7L136,99.22V53.39L215.13,96Zm-44.57,24L100.3,128,128,113.09,155.7,128Zm-8-89.52V99.22L83.43,118.91,40.87,96Zm-88,56L66.55,128,32,146.61Zm51.43,27.7L120,156.78v45.83L40.87,160ZM136,202.61V156.78l36.57-19.69L215.13,160Z"/>`
  ]
]);
t.styles = v`
    :host {
      display: contents;
    }
  `;
o([
  s({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  s({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  s({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  s({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  n("ph-codepen-logo")
], t);
export {
  t as PhCodepenLogo
};
