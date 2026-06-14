import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as V } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (l, s, a, i) => {
  for (var e = i > 1 ? void 0 : i ? g(s, a) : s, h = l.length - 1, A; h >= 0; h--)
    (A = l[h]) && (e = (i ? A(s, a, e) : A(e)) || e);
  return i && e && c(s, a, e), e;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var l;
    return n`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((l = this.weight) != null ? l : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M209.15,60.17l-80-24A4,4,0,0,0,124,40V158.75A44,44,0,1,0,132,184V93.38l74.85,22.45A4,4,0,0,0,212,112V64A4,4,0,0,0,209.15,60.17ZM88,220a36,36,0,1,1,36-36A36,36,0,0,1,88,220ZM204,106.62,132,85V45.38L204,67Z"/>`
  ],
  [
    "light",
    r`<path d="M209.72,58.25l-80-24A6,6,0,0,0,122,40V153.05A46,46,0,1,0,134,184V96.06l72.28,21.69A6,6,0,0,0,214,112V64A6,6,0,0,0,209.72,58.25ZM88,218a34,34,0,1,1,34-34A34,34,0,0,1,88,218ZM202,103.94l-68-20.4V48.06l68,20.4Z"/>`
  ],
  [
    "regular",
    r`<path d="M210.3,56.34l-80-24A8,8,0,0,0,120,40V148.26A48,48,0,1,0,136,184V98.75l69.7,20.91A8,8,0,0,0,216,112V64A8,8,0,0,0,210.3,56.34ZM88,216a32,32,0,1,1,32-32A32,32,0,0,1,88,216ZM200,101.25l-64-19.2V50.75L200,70Z"/>`
  ],
  [
    "bold",
    r`<path d="M211.45,52.51l-80-24A12,12,0,0,0,116,40V140.22A52,52,0,1,0,140,184V104.13l64.55,19.36A12,12,0,0,0,220,112V64A12,12,0,0,0,211.45,52.51ZM88,212a28,28,0,1,1,28-28A28,28,0,0,1,88,212ZM196,95.87l-56-16.8V56.13l56,16.8Z"/>`
  ],
  [
    "fill",
    r`<path d="M210.3,56.34l-80-24A8,8,0,0,0,120,40V148.26A48,48,0,1,0,136,184V98.75l69.7,20.91A8,8,0,0,0,216,112V64A8,8,0,0,0,210.3,56.34Z"/>`
  ],
  [
    "duotone",
    r`<path d="M128,184a40,40,0,1,1-40-40A40,40,0,0,1,128,184Z" opacity="0.2"/><path d="M210.3,56.34l-80-24A8,8,0,0,0,120,40V148.26A48,48,0,1,0,136,184V98.75l69.7,20.91A8,8,0,0,0,216,112V64A8,8,0,0,0,210.3,56.34ZM88,216a32,32,0,1,1,32-32A32,32,0,0,1,88,216ZM200,101.25l-64-19.2V50.75L200,70Z"/>`
  ]
]);
t.styles = M`
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
  V("ph-music-note")
], t);
export {
  t as PhMusicNote
};
