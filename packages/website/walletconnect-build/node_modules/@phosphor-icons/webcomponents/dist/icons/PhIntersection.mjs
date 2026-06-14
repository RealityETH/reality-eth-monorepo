import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as v } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, s, l, i) => {
  for (var e = i > 1 ? void 0 : i ? u(s, l) : s, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (e = (i ? n(s, l, e) : n(e)) || e);
  return i && e && f(s, l, e), e;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return v`<svg
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
    r`<path d="M204,120v80a4,4,0,0,1-8,0V120a68,68,0,0,0-136,0v80a4,4,0,0,1-8,0V120a76,76,0,0,1,152,0Z"/>`
  ],
  [
    "light",
    r`<path d="M206,120v80a6,6,0,0,1-12,0V120a66,66,0,0,0-132,0v80a6,6,0,0,1-12,0V120a78,78,0,0,1,156,0Z"/>`
  ],
  [
    "regular",
    r`<path d="M208,120v80a8,8,0,0,1-16,0V120a64,64,0,0,0-128,0v80a8,8,0,0,1-16,0V120a80,80,0,0,1,160,0Z"/>`
  ],
  [
    "bold",
    r`<path d="M212,120v80a12,12,0,0,1-24,0V120a60,60,0,0,0-120,0v80a12,12,0,0,1-24,0V120a84,84,0,0,1,168,0Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM184,176a8,8,0,0,1-16,0V120a40,40,0,0,0-80,0v56a8,8,0,0,1-16,0V120a56,56,0,0,1,112,0Z"/>`
  ],
  [
    "duotone",
    r`<path d="M200,120v80H56V120a72,72,0,0,1,144,0Z" opacity="0.2"/><path d="M208,120v80a8,8,0,0,1-16,0V120a64,64,0,0,0-128,0v80a8,8,0,0,1-16,0V120a80,80,0,0,1,160,0Z"/>`
  ]
]);
t.styles = g`
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
  c("ph-intersection")
], t);
export {
  t as PhIntersection
};
