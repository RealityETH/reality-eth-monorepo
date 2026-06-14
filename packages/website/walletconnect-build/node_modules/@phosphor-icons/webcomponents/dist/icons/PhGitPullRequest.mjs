import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, s = (r, o, l, i) => {
  for (var a = i > 1 ? void 0 : i ? g(o, l) : o, h = r.length - 1, m; h >= 0; h--)
    (m = r[h]) && (a = (i ? m(o, l, a) : m(a)) || a);
  return i && a && n(o, l, a), a;
};
let t = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return A`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M100,64A28,28,0,1,0,68,91.71v72.58a28,28,0,1,0,8,0V91.71A28,28,0,0,0,100,64ZM52,64A20,20,0,1,1,72,84,20,20,0,0,1,52,64ZM92,192a20,20,0,1,1-20-20A20,20,0,0,1,92,192Zm112-27.71V110.63a19.89,19.89,0,0,0-5.86-14.15L153.66,52H192a4,4,0,0,0,0-8H144a4,4,0,0,0-4,4V96a4,4,0,0,0,8,0V57.66l44.49,44.48a12,12,0,0,1,3.51,8.49v53.66a28,28,0,1,0,8,0ZM200,212a20,20,0,1,1,20-20A20,20,0,0,1,200,212Z"/>`
  ],
  [
    "light",
    e`<path d="M102,64A30,30,0,1,0,66,93.4v69.2a30,30,0,1,0,12,0V93.4A30.05,30.05,0,0,0,102,64ZM54,64A18,18,0,1,1,72,82,18,18,0,0,1,54,64ZM90,192a18,18,0,1,1-18-18A18,18,0,0,1,90,192Zm116-29.4v-52a21.88,21.88,0,0,0-6.44-15.56L158.48,54H192a6,6,0,0,0,0-12H144a6,6,0,0,0-6,6V96a6,6,0,0,0,12,0V62.48l41.07,41.08a9.91,9.91,0,0,1,2.93,7.07v52a30,30,0,1,0,12,0ZM200,210a18,18,0,1,1,18-18A18,18,0,0,1,200,210Z"/>`
  ],
  [
    "regular",
    e`<path d="M104,64A32,32,0,1,0,64,95v66a32,32,0,1,0,16,0V95A32.06,32.06,0,0,0,104,64ZM56,64A16,16,0,1,1,72,80,16,16,0,0,1,56,64ZM88,192a16,16,0,1,1-16-16A16,16,0,0,1,88,192Zm120-31V110.63a23.85,23.85,0,0,0-7-17L163.31,56H192a8,8,0,0,0,0-16H144a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V67.31L189.66,105a8,8,0,0,1,2.34,5.66V161a32,32,0,1,0,16,0Zm-8,47a16,16,0,1,1,16-16A16,16,0,0,1,200,208Z"/>`
  ],
  [
    "bold",
    e`<path d="M108,64A36,36,0,1,0,60,97.94v60.12a36,36,0,1,0,24,0V97.94A36.07,36.07,0,0,0,108,64ZM72,52A12,12,0,1,1,60,64,12,12,0,0,1,72,52Zm0,152a12,12,0,1,1,12-12A12,12,0,0,1,72,204Zm140-45.94V110.63a27.81,27.81,0,0,0-8.2-19.8L173,60h19a12,12,0,0,0,0-24H144a12,12,0,0,0-12,12V96a12,12,0,0,0,24,0V77l30.83,30.83a4,4,0,0,1,1.17,2.83v47.43a36,36,0,1,0,24,0ZM200,204a12,12,0,1,1,12-12A12,12,0,0,1,200,204Z"/>`
  ],
  [
    "fill",
    e`<path d="M104,64A32,32,0,1,0,64,95v66a32,32,0,1,0,16,0V95A32.06,32.06,0,0,0,104,64ZM88,192a16,16,0,1,1-16-16A16,16,0,0,1,88,192Zm144,0a32,32,0,1,1-40-31V110.63a8,8,0,0,0-2.34-5.66L152,67.31V96a8,8,0,0,1-16,0V48a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H163.31L201,93.66a23.85,23.85,0,0,1,7,17V161A32.06,32.06,0,0,1,232,192Z"/>`
  ],
  [
    "duotone",
    e`<path d="M96,64A24,24,0,1,1,72,40,24,24,0,0,1,96,64ZM200,168a24,24,0,1,0,24,24A24,24,0,0,0,200,168Z" opacity="0.2"/><path d="M104,64A32,32,0,1,0,64,95v66a32,32,0,1,0,16,0V95A32.06,32.06,0,0,0,104,64ZM56,64A16,16,0,1,1,72,80,16,16,0,0,1,56,64ZM88,192a16,16,0,1,1-16-16A16,16,0,0,1,88,192Zm120-31V110.63a23.85,23.85,0,0,0-7-17L163.31,56H192a8,8,0,0,0,0-16H144a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V67.31L189.66,105a8,8,0,0,1,2.34,5.66V161a32,32,0,1,0,16,0Zm-8,47a16,16,0,1,1,16-16A16,16,0,0,1,200,208Z"/>`
  ]
]);
t.styles = M`
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
  V("ph-git-pull-request")
], t);
export {
  t as PhGitPullRequest
};
