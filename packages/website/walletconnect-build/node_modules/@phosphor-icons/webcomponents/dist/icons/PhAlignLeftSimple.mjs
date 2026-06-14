import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as H } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var V = Object.defineProperty, f = Object.getOwnPropertyDescriptor, s = (a, o, l, i) => {
  for (var e = i > 1 ? void 0 : i ? f(o, l) : o, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (i ? m(o, l, e) : m(e)) || e);
  return i && e && V(o, l, e), e;
};
let t = class extends H {
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
    r`<path d="M36,56V200a4,4,0,0,1-8,0V56a4,4,0,0,1,8,0ZM236,96v64a12,12,0,0,1-12,12H72a12,12,0,0,1-12-12V96A12,12,0,0,1,72,84H224A12,12,0,0,1,236,96Zm-8,0a4,4,0,0,0-4-4H72a4,4,0,0,0-4,4v64a4,4,0,0,0,4,4H224a4,4,0,0,0,4-4Z"/>`
  ],
  [
    "light",
    r`<path d="M38,56V200a6,6,0,0,1-12,0V56a6,6,0,0,1,12,0ZM238,96v64a14,14,0,0,1-14,14H72a14,14,0,0,1-14-14V96A14,14,0,0,1,72,82H224A14,14,0,0,1,238,96Zm-12,0a2,2,0,0,0-2-2H72a2,2,0,0,0-2,2v64a2,2,0,0,0,2,2H224a2,2,0,0,0,2-2Z"/>`
  ],
  [
    "regular",
    r`<path d="M40,56V200a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0ZM240,96v64a16,16,0,0,1-16,16H72a16,16,0,0,1-16-16V96A16,16,0,0,1,72,80H224A16,16,0,0,1,240,96Zm-16,64V96H72v64H224Z"/>`
  ],
  [
    "bold",
    r`<path d="M44,56V200a12,12,0,0,1-24,0V56a12,12,0,0,1,24,0ZM244,96v64a20,20,0,0,1-20,20H80a20,20,0,0,1-20-20V96A20,20,0,0,1,80,76H224A20,20,0,0,1,244,96Zm-24,4H84v56H220Z"/>`
  ],
  [
    "fill",
    r`<path d="M40,56V200a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0ZM224,80H72A16,16,0,0,0,56,96v64a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V96A16,16,0,0,0,224,80Z"/>`
  ],
  [
    "duotone",
    r`<path d="M232,96v64a8,8,0,0,1-8,8H72a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H224A8,8,0,0,1,232,96Z" opacity="0.2"/><path d="M40,56V200a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0ZM240,96v64a16,16,0,0,1-16,16H72a16,16,0,0,1-16-16V96A16,16,0,0,1,72,80H224A16,16,0,0,1,240,96Zm-16,64V96H72v64H224Z"/>`
  ]
]);
t.styles = g`
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
  v("ph-align-left-simple")
], t);
export {
  t as PhAlignLeftSimple
};
