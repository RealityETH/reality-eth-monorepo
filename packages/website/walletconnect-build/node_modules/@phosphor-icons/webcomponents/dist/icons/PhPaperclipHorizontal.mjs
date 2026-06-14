import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (e, s, H, p) => {
  for (var a = p > 1 ? void 0 : p ? u(s, H) : s, l = e.length - 1, h; l >= 0; l--)
    (h = e[l]) && (a = (p ? h(s, H, a) : h(a)) || a);
  return p && a && f(s, H, a), a;
};
let t = class extends m {
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
      ${t.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M244,128a52.06,52.06,0,0,1-52,52H48a36,36,0,0,1,0-72H192a20,20,0,0,1,0,40H80a4,4,0,0,1,0-8H192a12,12,0,0,0,0-24H48a28,28,0,0,0,0,56H192a44,44,0,0,0,0-88H80a4,4,0,0,1,0-8H192A52.06,52.06,0,0,1,244,128Z"/>`
  ],
  [
    "light",
    r`<path d="M246,128a54.06,54.06,0,0,1-54,54H48a38,38,0,0,1,0-76H192a22,22,0,0,1,0,44H80a6,6,0,0,1,0-12H192a10,10,0,0,0,0-20H48a26,26,0,0,0,0,52H192a42,42,0,0,0,0-84H80a6,6,0,0,1,0-12H192A54.06,54.06,0,0,1,246,128Z"/>`
  ],
  [
    "regular",
    r`<path d="M248,128a56.06,56.06,0,0,1-56,56H48a40,40,0,0,1,0-80H192a24,24,0,0,1,0,48H80a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H48a24,24,0,0,0,0,48H192a40,40,0,0,0,0-80H80a8,8,0,0,1,0-16H192A56.06,56.06,0,0,1,248,128Z"/>`
  ],
  [
    "bold",
    r`<path d="M252,128a60.07,60.07,0,0,1-60,60H44a40,40,0,0,1,0-80H184a12,12,0,0,1,0,24H44a16,16,0,0,0,0,32H192a36,36,0,0,0,0-72H80a12,12,0,0,1,0-24H192A60.07,60.07,0,0,1,252,128Z"/>`
  ],
  [
    "fill",
    r`<path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm40,144H72a24,24,0,0,1,0-48h96a8,8,0,0,1,0,16H72a8,8,0,0,0,0,16h96a24,24,0,0,0,0-48H96a8,8,0,0,1,0-16h72a40,40,0,0,1,0,80Z"/>`
  ],
  [
    "duotone",
    r`<path d="M240,128a48,48,0,0,1-48,48H48a32,32,0,0,1,0-64H80V80H192A48,48,0,0,1,240,128Z" opacity="0.2"/><path d="M248,128a56.06,56.06,0,0,1-56,56H48a40,40,0,0,1,0-80H192a24,24,0,0,1,0,48H80a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H48a24,24,0,0,0,0,48H192a40,40,0,0,0,0-80H80a8,8,0,0,1,0-16H192A56.06,56.06,0,0,1,248,128Z"/>`
  ]
]);
t.styles = g`
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
  c("ph-paperclip-horizontal")
], t);
export {
  t as PhPaperclipHorizontal
};
