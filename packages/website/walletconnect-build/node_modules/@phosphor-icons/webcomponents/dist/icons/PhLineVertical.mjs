import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as c } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, V = Object.getOwnPropertyDescriptor, s = (o, a, l, i) => {
  for (var e = i > 1 ? void 0 : i ? V(a, l) : a, h = o.length - 1, n; h >= 0; h--)
    (n = o[h]) && (e = (i ? n(a, l, e) : n(e)) || e);
  return i && e && u(a, l, e), e;
};
let t = class extends c {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var o;
    return m`<svg
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
  ["thin", r`<path d="M132,24V232a4,4,0,0,1-8,0V24a4,4,0,0,1,8,0Z"/>`],
  ["light", r`<path d="M134,24V232a6,6,0,0,1-12,0V24a6,6,0,0,1,12,0Z"/>`],
  ["regular", r`<path d="M136,24V232a8,8,0,0,1-16,0V24a8,8,0,0,1,16,0Z"/>`],
  [
    "bold",
    r`<path d="M140,24V232a12,12,0,0,1-24,0V24a12,12,0,0,1,24,0Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM136,192a8,8,0,0,1-16,0V64a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "duotone",
    r`<path d="M224,48V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48Z" opacity="0.2"/><path d="M136,24V232a8,8,0,0,1-16,0V24a8,8,0,0,1,16,0Z"/>`
  ]
]);
t.styles = f`
    :host {
      display: contents;
    }
  `;
s([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  g("ph-line-vertical")
], t);
export {
  t as PhLineVertical
};
