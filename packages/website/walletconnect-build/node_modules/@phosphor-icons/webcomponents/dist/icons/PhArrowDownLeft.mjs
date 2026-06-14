import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as f } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var w = Object.defineProperty, u = Object.getOwnPropertyDescriptor, a = (o, s, l, i) => {
  for (var r = i > 1 ? void 0 : i ? u(s, l) : s, h = o.length - 1, n; h >= 0; h--)
    (n = o[h]) && (r = (i ? n(s, l, r) : n(r)) || r);
  return i && r && w(s, l, r), r;
};
let t = class extends f {
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
  [
    "thin",
    e`<path d="M194.83,66.83,73.66,188H168a4,4,0,0,1,0,8H64a4,4,0,0,1-4-4V88a4,4,0,0,1,8,0v94.34L189.17,61.17a4,4,0,1,1,5.66,5.66Z"/>`
  ],
  [
    "light",
    e`<path d="M196.24,68.24,78.48,186H168a6,6,0,0,1,0,12H64a6,6,0,0,1-6-6V88a6,6,0,0,1,12,0v89.52L187.76,59.76a6,6,0,0,1,8.48,8.48Z"/>`
  ],
  [
    "regular",
    e`<path d="M197.66,69.66,83.31,184H168a8,8,0,0,1,0,16H64a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v84.69L186.34,58.34a8,8,0,0,1,11.32,11.32Z"/>`
  ],
  [
    "bold",
    e`<path d="M200.49,72.48,93,180h75a12,12,0,0,1,0,24H64a12,12,0,0,1-12-12V88a12,12,0,0,1,24,0v75L183.51,55.51a12,12,0,0,1,17,17Z"/>`
  ],
  [
    "fill",
    e`<path d="M197.66,69.66,127.31,140l46.35,46.34A8,8,0,0,1,168,200H64a8,8,0,0,1-8-8V88a8,8,0,0,1,13.66-5.66L116,128.69l70.34-70.35a8,8,0,0,1,11.32,11.32Z"/>`
  ],
  [
    "duotone",
    e`<path d="M168,192H64V88Z" opacity="0.2"/><path d="M197.66,58.34a8,8,0,0,0-11.32,0L116,128.69,69.66,82.34A8,8,0,0,0,56,88V192a8,8,0,0,0,8,8H168a8,8,0,0,0,5.66-13.66L127.31,140l70.35-70.34A8,8,0,0,0,197.66,58.34ZM72,184V107.31l38.34,38.34h0L148.69,184Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
a([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  g("ph-arrow-down-left")
], t);
export {
  t as PhArrowDownLeft
};
