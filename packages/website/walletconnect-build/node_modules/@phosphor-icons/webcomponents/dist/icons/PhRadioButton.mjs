import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, c = Object.getOwnPropertyDescriptor, a = (o, s, m, i) => {
  for (var r = i > 1 ? void 0 : i ? c(s, m) : s, l = o.length - 1, h; l >= 0; l--)
    (h = o[l]) && (r = (i ? h(s, m, r) : h(r)) || r);
  return i && r && u(s, m, r), r;
};
let t = class extends A {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var o;
    return n`<svg
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
    e`<path d="M128,28A100,100,0,1,0,228,128,100.11,100.11,0,0,0,128,28Zm0,192a92,92,0,1,1,92-92A92.1,92.1,0,0,1,128,220Zm0-144a52,52,0,1,0,52,52A52.06,52.06,0,0,0,128,76Zm0,96a44,44,0,1,1,44-44A44.05,44.05,0,0,1,128,172Z"/>`
  ],
  [
    "light",
    e`<path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm0-144a54,54,0,1,0,54,54A54.06,54.06,0,0,0,128,74Zm0,96a42,42,0,1,1,42-42A42,42,0,0,1,128,170Z"/>`
  ],
  [
    "regular",
    e`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm0-144a56,56,0,1,0,56,56A56.06,56.06,0,0,0,128,72Zm0,96a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"/>`
  ],
  [
    "bold",
    e`<path d="M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm0-140a56,56,0,1,0,56,56A56.06,56.06,0,0,0,128,72Zm0,88a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/>`
  ],
  [
    "fill",
    e`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm56-88a56,56,0,1,1-56-56A56.06,56.06,0,0,1,184,128Z"/>`
  ],
  [
    "duotone",
    e`<path d="M176,128a48,48,0,1,1-48-48A48,48,0,0,1,176,128Z" opacity="0.2"/><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm0-144a56,56,0,1,0,56,56A56.06,56.06,0,0,0,128,72Zm0,96a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
a([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  Z("ph-radio-button")
], t);
export {
  t as PhRadioButton
};
