import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, s, p, i) => {
  for (var e = i > 1 ? void 0 : i ? u(s, p) : s, h = a.length - 1, H; h >= 0; h--)
    (H = a[h]) && (e = (i ? H(s, p, e) : H(e)) || e);
  return i && e && f(s, p, e), e;
};
let t = class extends m {
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
    r`<path d="M196,56a4,4,0,0,1-4,4H154.88L109.55,196H144a4,4,0,0,1,0,8H64a4,4,0,0,1,0-8h37.12L146.45,60H112a4,4,0,0,1,0-8h80A4,4,0,0,1,196,56Z"/>`
  ],
  [
    "light",
    r`<path d="M198,56a6,6,0,0,1-6,6H156.32l-44,132H144a6,6,0,0,1,0,12H64a6,6,0,0,1,0-12H99.68l44-132H112a6,6,0,0,1,0-12h80A6,6,0,0,1,198,56Z"/>`
  ],
  [
    "regular",
    r`<path d="M200,56a8,8,0,0,1-8,8H157.77L115.1,192H144a8,8,0,0,1,0,16H64a8,8,0,0,1,0-16H98.23L140.9,64H112a8,8,0,0,1,0-16h80A8,8,0,0,1,200,56Z"/>`
  ],
  [
    "bold",
    r`<path d="M204,56a12,12,0,0,1-12,12H160.65l-40,120H144a12,12,0,0,1,0,24H64a12,12,0,0,1,0-24H95.35l40-120H112a12,12,0,0,1,0-24h80A12,12,0,0,1,204,56Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM176,80H153.64l-34.29,96H136a8,8,0,0,1,0,16H80a8,8,0,0,1,0-16h22.36l34.29-96H120a8,8,0,0,1,0-16h56a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M192,56,144,200H64L112,56Z" opacity="0.2"/><path d="M200,56a8,8,0,0,1-8,8H157.77L115.1,192H144a8,8,0,0,1,0,16H64a8,8,0,0,1,0-16H98.23L140.9,64H112a8,8,0,0,1,0-16h80A8,8,0,0,1,200,56Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
o([
  l({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  l({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  l({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  l({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  c("ph-text-italic")
], t);
export {
  t as PhTextItalic
};
