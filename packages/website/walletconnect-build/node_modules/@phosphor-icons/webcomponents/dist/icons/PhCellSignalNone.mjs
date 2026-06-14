import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as g } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as a } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, u = Object.getOwnPropertyDescriptor, s = (o, i, p, l) => {
  for (var e = l > 1 ? void 0 : l ? u(i, p) : i, h = o.length - 1, n; h >= 0; h--)
    (n = o[h]) && (e = (l ? n(i, p, e) : n(e)) || e);
  return l && e && f(i, p, e), e;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var o;
    return g`<svg
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
  ["thin", r`<path d="M44,192v8a4,4,0,0,1-8,0v-8a4,4,0,0,1,8,0Z"/>`],
  ["light", r`<path d="M46,192v8a6,6,0,0,1-12,0v-8a6,6,0,0,1,12,0Z"/>`],
  ["regular", r`<path d="M48,192v8a8,8,0,0,1-16,0v-8a8,8,0,0,1,16,0Z"/>`],
  ["bold", r`<path d="M52,192v8a12,12,0,0,1-24,0v-8a12,12,0,0,1,24,0Z"/>`],
  [
    "fill",
    r`<path d="M198.12,25.23a16,16,0,0,0-17.44,3.46l-160,160A16,16,0,0,0,32,216H192a16,16,0,0,0,16-16V40A15.94,15.94,0,0,0,198.12,25.23ZM192,200H32L192,40Z"/>`
  ],
  [
    "duotone",
    r`<path d="M198.12,25.23a16,16,0,0,0-17.43,3.47l-160,160A16,16,0,0,0,32,216H192a16,16,0,0,0,16-16V40A16,16,0,0,0,198.12,25.23ZM192,200H32L192,40Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
s([
  a({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  a({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  a({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  a({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  v("ph-cell-signal-none")
], t);
export {
  t as PhCellSignalNone
};
