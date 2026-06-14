import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as a } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, f = Object.getOwnPropertyDescriptor, s = (o, i, h, p) => {
  for (var r = p > 1 ? void 0 : p ? f(i, h) : i, l = o.length - 1, m; l >= 0; l--)
    (m = o[l]) && (r = (p ? m(i, h, r) : m(r)) || r);
  return p && r && c(i, h, r), r;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var o;
    return A`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((o = this.weight) != null ? o : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm92,100a91.67,91.67,0,0,1-24.21,62.13L65.87,60.21A92,92,0,0,1,220,128ZM36,128A91.67,91.67,0,0,1,60.21,65.87L190.13,195.79A92,92,0,0,1,36,128Z"/>`
  ],
  [
    "light",
    e`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm90,102a89.6,89.6,0,0,1-22.29,59.22L68.78,60.29A89.95,89.95,0,0,1,218,128ZM38,128A89.6,89.6,0,0,1,60.29,68.78L187.22,195.71A89.95,89.95,0,0,1,38,128Z"/>`
  ],
  [
    "regular",
    e`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.56,87.56,0,0,1-20.41,56.28L71.72,60.4A88,88,0,0,1,216,128ZM40,128A87.56,87.56,0,0,1,60.41,71.72L184.28,195.6A88,88,0,0,1,40,128Z"/>`
  ],
  [
    "bold",
    e`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm84,108a83.6,83.6,0,0,1-16.75,50.28L77.72,60.75A84,84,0,0,1,212,128ZM44,128A83.6,83.6,0,0,1,60.75,77.72L178.28,195.25A84,84,0,0,1,44,128Z"/>`
  ],
  [
    "fill",
    e`<path d="M200,128a71.69,71.69,0,0,1-15.78,44.91L83.09,71.78A71.95,71.95,0,0,1,200,128ZM56,128a71.95,71.95,0,0,0,116.91,56.22L71.78,83.09A71.69,71.69,0,0,0,56,128Zm180,0A108,108,0,1,1,128,20,108.12,108.12,0,0,1,236,128Zm-20,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.56,87.56,0,0,1-20.41,56.28L71.72,60.4A88,88,0,0,1,216,128ZM40,128A87.56,87.56,0,0,1,60.41,71.72L184.28,195.6A88,88,0,0,1,40,128Z"/>`
  ]
]);
t.styles = Z`
    :host {
      display: contents;
    }
  `;
s([
  a({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  a({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  a({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  a({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  g("ph-prohibit")
], t);
export {
  t as PhProhibit
};
