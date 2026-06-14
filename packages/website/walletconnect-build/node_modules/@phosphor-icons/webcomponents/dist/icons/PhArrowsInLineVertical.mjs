import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as V } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var Z = Object.defineProperty, f = Object.getOwnPropertyDescriptor, l = (e, o, p, s) => {
  for (var t = s > 1 ? void 0 : s ? f(o, p) : o, h = e.length - 1, m; h >= 0; h--)
    (m = e[h]) && (t = (s ? m(o, p, t) : m(t)) || t);
  return s && t && Z(o, p, t), t;
};
let a = class extends V {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return n`<svg
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
    r`<path d="M220,128a4,4,0,0,1-4,4H40a4,4,0,0,1,0-8H216A4,4,0,0,1,220,128ZM125.17,98.83a4,4,0,0,0,5.66,0l32-32a4,4,0,1,0-5.66-5.66L132,86.34V16a4,4,0,0,0-8,0V86.34L98.83,61.17a4,4,0,0,0-5.66,5.66Zm5.66,58.34a4,4,0,0,0-5.66,0l-32,32a4,4,0,0,0,5.66,5.66L124,169.66V240a4,4,0,0,0,8,0V169.66l25.17,25.17a4,4,0,0,0,5.66-5.66Z"/>`
  ],
  [
    "light",
    r`<path d="M222,128a6,6,0,0,1-6,6H40a6,6,0,0,1,0-12H216A6,6,0,0,1,222,128Zm-98.24-27.76a6,6,0,0,0,8.48,0l32-32a6,6,0,0,0-8.48-8.48L134,81.51V16a6,6,0,0,0-12,0V81.51L100.24,59.76a6,6,0,0,0-8.48,8.48Zm8.48,55.52a6,6,0,0,0-8.48,0l-32,32a6,6,0,0,0,8.48,8.48L122,174.49V240a6,6,0,0,0,12,0V174.49l21.76,21.75a6,6,0,0,0,8.48-8.48Z"/>`
  ],
  [
    "regular",
    r`<path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM122.34,101.66a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32L136,76.69V16a8,8,0,0,0-16,0V76.69L101.66,58.34A8,8,0,0,0,90.34,69.66Zm11.32,52.68a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L120,179.31V240a8,8,0,0,0,16,0V179.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z"/>`
  ],
  [
    "bold",
    r`<path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM119.51,96.49a12,12,0,0,0,17,0l32-32a12,12,0,0,0-17-17L140,59V16a12,12,0,0,0-24,0V59L104.49,47.51a12,12,0,0,0-17,17Zm17,63a12,12,0,0,0-17,0l-32,32a12,12,0,0,0,17,17L116,197v43a12,12,0,0,0,24,0V197l11.51,11.52a12,12,0,0,0,17-17Z"/>`
  ],
  [
    "fill",
    r`<path d="M90.34,69.66A8,8,0,0,1,96,56h24V16a8,8,0,0,1,16,0V56h24a8,8,0,0,1,5.66,13.66l-32,32a8,8,0,0,1-11.32,0Zm43.32,84.68a8,8,0,0,0-11.32,0l-32,32A8,8,0,0,0,96,200h24v40a8,8,0,0,0,16,0V200h24a8,8,0,0,0,5.66-13.66ZM216,120H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,32V224a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V32A16,16,0,0,1,56,16H200A16,16,0,0,1,216,32Z" opacity="0.2"/><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM122.34,101.66a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32L136,76.69V16a8,8,0,0,0-16,0V76.69L101.66,58.34A8,8,0,0,0,90.34,69.66Zm11.32,52.68a8,8,0,0,0-11.32,0l-32,32a8,8,0,0,0,11.32,11.32L120,179.31V240a8,8,0,0,0,16,0V179.31l18.34,18.35a8,8,0,0,0,11.32-11.32Z"/>`
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
  c("ph-arrows-in-line-vertical")
], a);
export {
  a as PhArrowsInLineVertical
};
