import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as v } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, u = Object.getOwnPropertyDescriptor, o = (a, s, p, i) => {
  for (var e = i > 1 ? void 0 : i ? u(s, p) : s, h = a.length - 1, n; h >= 0; h--)
    (n = a[h]) && (e = (i ? n(s, p, e) : n(e)) || e);
  return i && e && f(s, p, e), e;
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
    r`<path d="M84,152v48a4,4,0,0,1-8,0V152a4,4,0,0,1,8,0ZM40,188a4,4,0,0,0-4,4v8a4,4,0,0,0,8,0v-8A4,4,0,0,0,40,188Z"/>`
  ],
  [
    "light",
    r`<path d="M86,152v48a6,6,0,0,1-12,0V152a6,6,0,0,1,12,0ZM40,186a6,6,0,0,0-6,6v8a6,6,0,0,0,12,0v-8A6,6,0,0,0,40,186Z"/>`
  ],
  [
    "regular",
    r`<path d="M88,152v48a8,8,0,0,1-16,0V152a8,8,0,0,1,16,0ZM40,184a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-8A8,8,0,0,0,40,184Z"/>`
  ],
  [
    "bold",
    r`<path d="M92,152v48a12,12,0,0,1-24,0V152a12,12,0,0,1,24,0ZM40,180a12,12,0,0,0-12,12v8a12,12,0,0,0,24,0v-8A12,12,0,0,0,40,180Z"/>`
  ],
  [
    "fill",
    r`<path d="M198.12,25.23a16,16,0,0,0-17.44,3.46l-160,160A16,16,0,0,0,32,216H192a16,16,0,0,0,16-16V40A15.94,15.94,0,0,0,198.12,25.23ZM192,200H88V144L192,40Z"/>`
  ],
  [
    "duotone",
    r`<path d="M80,140.7V208H32a8,8,0,0,1-5.66-13.66Z" opacity="0.2"/><path d="M198.12,25.23a16,16,0,0,0-17.44,3.46l-160,160A16,16,0,0,0,32,216H192a16,16,0,0,0,16-16V40A15.94,15.94,0,0,0,198.12,25.23ZM72,160v40H32Zm120,40H88V144L192,40Z"/>`
  ]
]);
t.styles = c`
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
  g("ph-cell-signal-low")
], t);
export {
  t as PhCellSignalLow
};
