import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var w = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, s, p, l) => {
  for (var r = l > 1 ? void 0 : l ? u(s, p) : s, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (r = (l ? n(s, p, r) : n(r)) || r);
  return l && r && w(s, p, r), r;
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
    e`<path d="M53.17,114.83a4,4,0,0,1,5.66-5.66L124,174.34V32a4,4,0,0,1,8,0V174.34l65.17-65.17a4,4,0,1,1,5.66,5.66l-72,72a4,4,0,0,1-5.66,0ZM216,212H40a4,4,0,0,0,0,8H216a4,4,0,0,0,0-8Z"/>`
  ],
  [
    "light",
    e`<path d="M51.76,116.24a6,6,0,0,1,8.48-8.48L122,169.51V32a6,6,0,0,1,12,0V169.51l61.76-61.75a6,6,0,0,1,8.48,8.48l-72,72a6,6,0,0,1-8.48,0ZM216,210H40a6,6,0,0,0,0,12H216a6,6,0,0,0,0-12Z"/>`
  ],
  [
    "regular",
    e`<path d="M50.34,117.66a8,8,0,0,1,11.32-11.32L120,164.69V32a8,8,0,0,1,16,0V164.69l58.34-58.35a8,8,0,0,1,11.32,11.32l-72,72a8,8,0,0,1-11.32,0ZM216,208H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "bold",
    e`<path d="M47.51,112.49a12,12,0,0,1,17-17L116,147V32a12,12,0,0,1,24,0V147l51.51-51.52a12,12,0,0,1,17,17l-72,72a12,12,0,0,1-17,0ZM216,204H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z"/>`
  ],
  [
    "fill",
    e`<path d="M50.34,117.66A8,8,0,0,1,56,104h64V32a8,8,0,0,1,16,0v72h64a8,8,0,0,1,5.66,13.66l-72,72a8,8,0,0,1-11.32,0ZM216,208H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/>`
  ],
  [
    "duotone",
    e`<path d="M200,112l-72,72L56,112Z" opacity="0.2"/><path d="M122.34,189.66a8,8,0,0,0,11.32,0l72-72A8,8,0,0,0,200,104H136V32a8,8,0,0,0-16,0v72H56a8,8,0,0,0-5.66,13.66ZM180.69,120,128,172.69,75.31,120ZM224,216a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,216Z"/>`
  ]
]);
t.styles = f`
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
  c("ph-arrow-line-down")
], t);
export {
  t as PhArrowLineDown
};
