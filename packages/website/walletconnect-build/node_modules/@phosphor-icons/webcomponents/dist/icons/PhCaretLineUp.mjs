import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, M = Object.getOwnPropertyDescriptor, o = (a, s, p, l) => {
  for (var e = l > 1 ? void 0 : l ? M(s, p) : s, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (e = (l ? n(s, p, e) : n(e)) || e);
  return l && e && u(s, p, e), e;
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
    r`<path d="M210.83,194.83a4,4,0,0,1-5.66,0L128,117.66,50.83,194.83a4,4,0,0,1-5.66-5.66l80-80a4,4,0,0,1,5.66,0l80,80A4,4,0,0,1,210.83,194.83ZM48,76H208a4,4,0,0,0,0-8H48a4,4,0,0,0,0,8Z"/>`
  ],
  [
    "light",
    r`<path d="M212.24,196.24a6,6,0,0,1-8.48,0L128,120.49,52.24,196.24a6,6,0,0,1-8.48-8.48l80-80a6,6,0,0,1,8.48,0l80,80A6,6,0,0,1,212.24,196.24ZM48,78H208a6,6,0,0,0,0-12H48a6,6,0,0,0,0,12Z"/>`
  ],
  [
    "regular",
    r`<path d="M213.66,197.66a8,8,0,0,1-11.32,0L128,123.31,53.66,197.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,197.66ZM48,80H208a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Z"/>`
  ],
  [
    "bold",
    r`<path d="M216.49,183.51a12,12,0,0,1-17,17L128,129,56.49,200.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0ZM48,84H208a12,12,0,0,0,0-24H48a12,12,0,0,0,0,24Z"/>`
  ],
  [
    "fill",
    r`<path d="M213.66,186.34A8,8,0,0,1,208,200H48a8,8,0,0,1-5.66-13.66l80-80a8,8,0,0,1,11.32,0ZM48,80H208a8,8,0,0,0,0-16H48a8,8,0,0,0,0,16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M208,192H48l80-80Z" opacity="0.2"/><path d="M133.66,106.34a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,48,200H208a8,8,0,0,0,5.66-13.66ZM67.31,184,128,123.31,188.69,184ZM40,72a8,8,0,0,1,8-8H208a8,8,0,0,1,0,16H48A8,8,0,0,1,40,72Z"/>`
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
  c("ph-caret-line-up")
], t);
export {
  t as PhCaretLineUp
};
