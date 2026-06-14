import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as g } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as u } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var f = Object.defineProperty, d = Object.getOwnPropertyDescriptor, l = (a, o, i, s) => {
  for (var e = s > 1 ? void 0 : s ? d(o, i) : o, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (s ? m(o, i, e) : m(e)) || e);
  return s && e && f(o, i, e), e;
};
let t = class extends g {
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
    r`<path d="M210.83,197.17a4,4,0,0,1-5.66,5.66L128,125.66,50.83,202.83a4,4,0,0,1-5.66-5.66l80-80a4,4,0,0,1,5.66,0Zm-160-74.34L128,45.66l77.17,77.17a4,4,0,1,0,5.66-5.66l-80-80a4,4,0,0,0-5.66,0l-80,80a4,4,0,0,0,5.66,5.66Z"/>`
  ],
  [
    "light",
    r`<path d="M212.24,195.76a6,6,0,1,1-8.48,8.48L128,128.49,52.24,204.24a6,6,0,0,1-8.48-8.48l80-80a6,6,0,0,1,8.48,0Zm-160-71.52L128,48.49l75.76,75.75a6,6,0,0,0,8.48-8.48l-80-80a6,6,0,0,0-8.48,0l-80,80a6,6,0,0,0,8.48,8.48Z"/>`
  ],
  [
    "regular",
    r`<path d="M213.66,194.34a8,8,0,0,1-11.32,11.32L128,131.31,53.66,205.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0Zm-160-68.68L128,51.31l74.34,74.35a8,8,0,0,0,11.32-11.32l-80-80a8,8,0,0,0-11.32,0l-80,80a8,8,0,0,0,11.32,11.32Z"/>`
  ],
  [
    "bold",
    r`<path d="M216.49,191.51a12,12,0,0,1-17,17L128,137,56.49,208.49a12,12,0,0,1-17-17l80-80a12,12,0,0,1,17,0Zm-160-63L128,57l71.51,71.52a12,12,0,0,0,17-17l-80-80a12,12,0,0,0-17,0l-80,80a12,12,0,0,0,17,17Z"/>`
  ],
  [
    "fill",
    r`<path d="M213.66,194.34A8,8,0,0,1,208,208H48a8,8,0,0,1-5.66-13.66L108.69,128H48a8,8,0,0,1-5.66-13.66l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,208,128H147.31Z"/>`
  ],
  [
    "duotone",
    r`<path d="M208,200H48l80-80Z" opacity="0.2"/><path d="M133.66,114.34a8,8,0,0,0-11.32,0l-80,80A8,8,0,0,0,48,208H208a8,8,0,0,0,5.66-13.66ZM67.31,192,128,131.31,188.69,192Zm-25-66.34a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,0l80,80a8,8,0,0,1-11.32,11.32L128,51.31,53.66,125.66A8,8,0,0,1,42.34,125.66Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
l([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
l([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
l([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
l([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = l([
  u("ph-caret-double-up")
], t);
export {
  t as PhCaretDoubleUp
};
