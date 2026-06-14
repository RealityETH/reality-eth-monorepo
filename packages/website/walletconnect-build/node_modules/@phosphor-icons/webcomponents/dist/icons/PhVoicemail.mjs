import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, f = Object.getOwnPropertyDescriptor, o = (a, s, l, i) => {
  for (var e = i > 1 ? void 0 : i ? f(s, l) : s, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (i ? m(s, l, e) : m(e)) || e);
  return i && e && g(s, l, e), e;
};
let t = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return n`<svg
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
    r`<path d="M200,76a52,52,0,0,0-27.66,96H83.66A52,52,0,1,0,56,180H200a52,52,0,0,0,0-104ZM12,128a44,44,0,1,1,44,44A44.05,44.05,0,0,1,12,128Zm188,44a44,44,0,1,1,44-44A44.05,44.05,0,0,1,200,172Z"/>`
  ],
  [
    "light",
    r`<path d="M200,74a54,54,0,0,0-33.89,96H89.89A54,54,0,1,0,56,182H200a54,54,0,0,0,0-108ZM14,128a42,42,0,1,1,42,42A42,42,0,0,1,14,128Zm186,42a42,42,0,1,1,42-42A42,42,0,0,1,200,170Z"/>`
  ],
  [
    "regular",
    r`<path d="M200,72a56,56,0,0,0-39.14,96H95.14A56,56,0,1,0,56,184H200a56,56,0,0,0,0-112ZM16,128a40,40,0,1,1,40,40A40,40,0,0,1,16,128Zm184,40a40,40,0,1,1,40-40A40,40,0,0,1,200,168Z"/>`
  ],
  [
    "bold",
    r`<path d="M196,68a60,60,0,0,0-48,96H108a60,60,0,1,0-48,24H196a60,60,0,0,0,0-120ZM24,128a36,36,0,1,1,36,36A36,36,0,0,1,24,128Zm172,36a36,36,0,1,1,36-36A36,36,0,0,1,196,164Z"/>`
  ],
  [
    "fill",
    r`<path d="M200,72a56,56,0,0,0-39.14,96H95.14A56,56,0,1,0,56,184H200a56,56,0,0,0,0-112ZM56,168a40,40,0,1,1,40-40A40,40,0,0,1,56,168Zm144,0a40,40,0,1,1,40-40A40,40,0,0,1,200,168Zm24-40a24,24,0,1,1-24-24A24,24,0,0,1,224,128ZM80,128a24,24,0,1,1-24-24A24,24,0,0,1,80,128Z"/>`
  ],
  [
    "duotone",
    r`<path d="M104,128A48,48,0,1,1,56,80,48,48,0,0,1,104,128Zm96-48a48,48,0,1,0,48,48A48,48,0,0,0,200,80Z" opacity="0.2"/><path d="M200,72a56,56,0,0,0-39.14,96H95.14A56,56,0,1,0,56,184H200a56,56,0,0,0,0-112ZM16,128a40,40,0,1,1,40,40A40,40,0,0,1,16,128Zm184,40a40,40,0,1,1,40-40A40,40,0,0,1,200,168Z"/>`
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
  A("ph-voicemail")
], t);
export {
  t as PhVoicemail
};
