import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as f } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var w = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, l, p, s) => {
  for (var r = s > 1 ? void 0 : s ? u(l, p) : l, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (r = (s ? n(l, p, r) : n(r)) || r);
  return s && r && w(l, p, r), r;
};
let t = class extends f {
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
    e`<path d="M234.83,98.83l-96,96a4,4,0,0,1-5.66,0L28,89.66V152a4,4,0,0,1-8,0V80a4,4,0,0,1,4-4H96a4,4,0,0,1,0,8H33.66L136,186.34l93.17-93.17a4,4,0,1,1,5.66,5.66Z"/>`
  ],
  [
    "light",
    e`<path d="M236.24,100.24l-96,96a6,6,0,0,1-8.48,0L30,94.48V152a6,6,0,0,1-12,0V80a6,6,0,0,1,6-6H96a6,6,0,0,1,0,12H38.48L136,183.51l91.76-91.75a6,6,0,0,1,8.48,8.48Z"/>`
  ],
  [
    "regular",
    e`<path d="M237.66,101.66l-96,96a8,8,0,0,1-11.32,0L32,99.31V152a8,8,0,0,1-16,0V80a8,8,0,0,1,8-8H96a8,8,0,0,1,0,16H43.31L136,180.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z"/>`
  ],
  [
    "bold",
    e`<path d="M240.49,104.49l-96,96a12,12,0,0,1-17,0L36,109v43a12,12,0,0,1-24,0V80A12,12,0,0,1,24,68H96a12,12,0,0,1,0,24H53l83,83,87.51-87.52a12,12,0,0,1,17,17Z"/>`
  ],
  [
    "fill",
    e`<path d="M237.66,101.66l-96,96a8,8,0,0,1-11.32,0L60,127.31,29.66,157.66A8,8,0,0,1,16,152V80a8,8,0,0,1,8-8H96a8,8,0,0,1,5.66,13.66L71.31,116,136,180.69l90.34-90.35a8,8,0,0,1,11.32,11.32Z"/>`
  ],
  [
    "duotone",
    e`<path d="M96,80,24,152V80Z" opacity="0.2"/><path d="M237.66,90.34a8,8,0,0,0-11.32,0L136,180.69,71.31,116l30.35-30.34A8,8,0,0,0,96,72H24a8,8,0,0,0-8,8v72a8,8,0,0,0,13.66,5.66L60,127.31l70.34,70.35a8,8,0,0,0,11.32,0l96-96A8,8,0,0,0,237.66,90.34ZM32,132.69V88H76.69Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
o([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  g("ph-arrow-elbow-left")
], t);
export {
  t as PhArrowElbowLeft
};
