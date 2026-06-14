import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, u = Object.getOwnPropertyDescriptor, h = (e, o, p, s) => {
  for (var a = s > 1 ? void 0 : s ? u(o, p) : o, l = e.length - 1, H; l >= 0; l--)
    (H = e[l]) && (a = (s ? H(o, p, a) : H(a)) || a);
  return s && a && f(o, p, a), a;
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
    r`<path d="M20,128a44.05,44.05,0,0,0,44,44h40a4,4,0,0,1,0,8H64A52,52,0,0,1,64,76h40a4,4,0,0,1,0,8H64A44.05,44.05,0,0,0,20,128ZM192,76H152a4,4,0,0,0,0,8h40a44,44,0,0,1,0,88H152a4,4,0,0,0,0,8h40a52,52,0,0,0,0-104Z"/>`
  ],
  [
    "light",
    r`<path d="M22,128a42,42,0,0,0,42,42h40a6,6,0,0,1,0,12H64A54,54,0,0,1,64,74h40a6,6,0,0,1,0,12H64A42,42,0,0,0,22,128ZM192,74H152a6,6,0,0,0,0,12h40a42,42,0,0,1,0,84H152a6,6,0,0,0,0,12h40a54,54,0,0,0,0-108Z"/>`
  ],
  [
    "regular",
    r`<path d="M24,128a40,40,0,0,0,40,40h40a8,8,0,0,1,0,16H64A56,56,0,0,1,64,72h40a8,8,0,0,1,0,16H64A40,40,0,0,0,24,128ZM192,72H152a8,8,0,0,0,0,16h40a40,40,0,0,1,0,80H152a8,8,0,0,0,0,16h40a56,56,0,0,0,0-112Z"/>`
  ],
  [
    "bold",
    r`<path d="M28,128a36,36,0,0,0,36,36h40a12,12,0,0,1,0,24H64A60,60,0,0,1,64,68h40a12,12,0,0,1,0,24H64A36,36,0,0,0,28,128ZM192,68H152a12,12,0,0,0,0,24h40a36,36,0,0,1,0,72H152a12,12,0,0,0,0,24h40a60,60,0,0,0,0-120Z"/>`
  ],
  [
    "fill",
    r`<path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM112,168H80a40,40,0,0,1,0-80h32a8,8,0,0,1,0,16H80a24,24,0,0,0,0,48h32a8,8,0,0,1,0,16Zm64,0H144a8,8,0,0,1,0-16h32a24,24,0,0,0,0-48H144a8,8,0,0,1,0-16h32a40,40,0,0,1,0,80Z"/>`
  ],
  [
    "duotone",
    r`<path d="M240,128h0a48,48,0,0,1-48,48H64a48,48,0,0,1-48-48h0A48,48,0,0,1,64,80H192A48,48,0,0,1,240,128Z" opacity="0.2"/><path d="M24,128a40,40,0,0,0,40,40h40a8,8,0,0,1,0,16H64A56,56,0,0,1,64,72h40a8,8,0,0,1,0,16H64A40,40,0,0,0,24,128ZM192,72H152a8,8,0,0,0,0,16h40a40,40,0,0,1,0,80H152a8,8,0,0,0,0,16h40a56,56,0,0,0,0-112Z"/>`
  ]
]);
t.styles = c`
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
  g("ph-link-simple-horizontal-break")
], t);
export {
  t as PhLinkSimpleHorizontalBreak
};
