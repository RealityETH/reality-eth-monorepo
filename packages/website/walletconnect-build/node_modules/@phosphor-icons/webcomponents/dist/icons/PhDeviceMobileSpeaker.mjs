import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as a, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var V = Object.defineProperty, f = Object.getOwnPropertyDescriptor, h = (r, o, p, s) => {
  for (var e = s > 1 ? void 0 : s ? f(o, p) : o, l = r.length - 1, m; l >= 0; l--)
    (m = r[l]) && (e = (s ? m(o, p, e) : m(e)) || e);
  return s && e && V(o, p, e), e;
};
let t = class extends A {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return n`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    a`<path d="M176,20H80A20,20,0,0,0,60,40V216a20,20,0,0,0,20,20h96a20,20,0,0,0,20-20V40A20,20,0,0,0,176,20Zm12,196a12,12,0,0,1-12,12H80a12,12,0,0,1-12-12V40A12,12,0,0,1,80,28h96a12,12,0,0,1,12,12ZM164,56a4,4,0,0,1-4,4H96a4,4,0,0,1,0-8h64A4,4,0,0,1,164,56Z"/>`
  ],
  [
    "light",
    a`<path d="M176,18H80A22,22,0,0,0,58,40V216a22,22,0,0,0,22,22h96a22,22,0,0,0,22-22V40A22,22,0,0,0,176,18Zm10,198a10,10,0,0,1-10,10H80a10,10,0,0,1-10-10V40A10,10,0,0,1,80,30h96a10,10,0,0,1,10,10ZM166,56a6,6,0,0,1-6,6H96a6,6,0,0,1,0-12h64A6,6,0,0,1,166,56Z"/>`
  ],
  [
    "regular",
    a`<path d="M176,16H80A24,24,0,0,0,56,40V216a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V40A24,24,0,0,0,176,16Zm8,200a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8ZM168,56a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,56Z"/>`
  ],
  [
    "bold",
    a`<path d="M176,12H80A28,28,0,0,0,52,40V216a28,28,0,0,0,28,28h96a28,28,0,0,0,28-28V40A28,28,0,0,0,176,12Zm4,204a4,4,0,0,1-4,4H80a4,4,0,0,1-4-4V40a4,4,0,0,1,4-4h96a4,4,0,0,1,4,4ZM164,64a12,12,0,0,1-12,12H104a12,12,0,0,1,0-24h48A12,12,0,0,1,164,64Z"/>`
  ],
  [
    "fill",
    a`<path d="M176,16H80A24,24,0,0,0,56,40V216a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V40A24,24,0,0,0,176,16ZM160,64H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    a`<path d="M192,40V216a16,16,0,0,1-16,16H80a16,16,0,0,1-16-16V40A16,16,0,0,1,80,24h96A16,16,0,0,1,192,40Z" opacity="0.2"/><path d="M176,16H80A24,24,0,0,0,56,40V216a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V40A24,24,0,0,0,176,16Zm8,200a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8ZM168,56a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,56Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
h([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
h([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
h([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
h([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = h([
  c("ph-device-mobile-speaker")
], t);
export {
  t as PhDeviceMobileSpeaker
};
