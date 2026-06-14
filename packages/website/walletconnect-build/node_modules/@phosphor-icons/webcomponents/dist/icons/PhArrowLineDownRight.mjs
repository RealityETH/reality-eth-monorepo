import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, w = Object.getOwnPropertyDescriptor, o = (a, s, h, i) => {
  for (var r = i > 1 ? void 0 : i ? w(s, h) : s, l = a.length - 1, n; l >= 0; l--)
    (n = a[l]) && (r = (i ? n(s, h, r) : n(r)) || r);
  return i && r && f(s, h, r), r;
};
let t = class extends g {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return m`<svg
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
    e`<path d="M220,40a4,4,0,0,1-4,4H40a4,4,0,0,1,0-8H216A4,4,0,0,1,220,40Zm-28,60a4,4,0,0,0-4,4v86.34L82.83,85.17a4,4,0,0,0-5.66,5.66L182.34,196H96a4,4,0,0,0,0,8h96a4,4,0,0,0,4-4V104A4,4,0,0,0,192,100Z"/>`
  ],
  [
    "light",
    e`<path d="M222,40a6,6,0,0,1-6,6H40a6,6,0,0,1,0-12H216A6,6,0,0,1,222,40ZM192,98a6,6,0,0,0-6,6v81.52L84.24,83.76a6,6,0,0,0-8.48,8.48L177.52,194H96a6,6,0,0,0,0,12h96a6,6,0,0,0,6-6V104A6,6,0,0,0,192,98Z"/>`
  ],
  [
    "regular",
    e`<path d="M224,40a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40ZM192,96a8,8,0,0,0-8,8v76.69L85.66,82.34A8,8,0,0,0,74.34,93.66L172.69,192H96a8,8,0,0,0,0,16h96a8,8,0,0,0,8-8V104A8,8,0,0,0,192,96Z"/>`
  ],
  [
    "bold",
    e`<path d="M228,40a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,40ZM192,92a12,12,0,0,0-12,12v67L88.49,79.51a12,12,0,0,0-17,17L163,188H96a12,12,0,0,0,0,24h96a12,12,0,0,0,12-12V104A12,12,0,0,0,192,92Z"/>`
  ],
  [
    "fill",
    e`<path d="M224,40a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40ZM195.06,96.61a8,8,0,0,0-8.72,1.73L144,140.69,85.66,82.34A8,8,0,0,0,74.34,93.66L132.69,152,90.34,194.34A8,8,0,0,0,96,208h96a8,8,0,0,0,8-8V104A8,8,0,0,0,195.06,96.61Z"/>`
  ],
  [
    "duotone",
    e`<path d="M192,104v96H96Z" opacity="0.2"/><path d="M224,40a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40Zm-24,64v96a8,8,0,0,1-8,8H96a8,8,0,0,1-5.66-13.66L132.69,152,74.34,93.66A8,8,0,0,1,85.66,82.34L144,140.69l42.34-42.35A8,8,0,0,1,200,104Zm-16,19.31-34.34,34.35h0L115.31,192H184Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
o([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  H("ph-arrow-line-down-right")
], t);
export {
  t as PhArrowLineDownRight
};
