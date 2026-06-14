import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, f = Object.getOwnPropertyDescriptor, o = (a, s, l, i) => {
  for (var e = i > 1 ? void 0 : i ? f(s, l) : s, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (i ? m(s, l, e) : m(e)) || e);
  return i && e && c(s, l, e), e;
};
let t = class extends A {
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
    r`<path d="M220,128a4,4,0,0,1-4,4H40a4,4,0,0,1,0-8H216A4,4,0,0,1,220,128ZM128,76a12,12,0,1,0-12-12A12,12,0,0,0,128,76Zm0,104a12,12,0,1,0,12,12A12,12,0,0,0,128,180Z"/>`
  ],
  [
    "light",
    r`<path d="M222,128a6,6,0,0,1-6,6H40a6,6,0,0,1,0-12H216A6,6,0,0,1,222,128ZM128,78a14,14,0,1,0-14-14A14,14,0,0,0,128,78Zm0,100a14,14,0,1,0,14,14A14,14,0,0,0,128,178Z"/>`
  ],
  [
    "regular",
    r`<path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM128,80a16,16,0,1,0-16-16A16,16,0,0,0,128,80Zm0,96a16,16,0,1,0,16,16A16,16,0,0,0,128,176Z"/>`
  ],
  [
    "bold",
    r`<path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM128,84a20,20,0,1,0-20-20A20,20,0,0,0,128,84Zm0,88a20,20,0,1,0,20,20A20,20,0,0,0,128,172Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM128,64a16,16,0,1,1-16,16A16,16,0,0,1,128,64Zm0,128a16,16,0,1,1,16-16A16,16,0,0,1,128,192Zm56-56H72a8,8,0,0,1,0-16H184a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z" opacity="0.2"/><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM128,80a16,16,0,1,0-16-16A16,16,0,0,0,128,80Zm0,96a16,16,0,1,0,16,16A16,16,0,0,0,128,176Z"/>`
  ]
]);
t.styles = Z`
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
  g("ph-divide")
], t);
export {
  t as PhDivide
};
