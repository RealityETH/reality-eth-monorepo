import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (e, s, p, i) => {
  for (var a = i > 1 ? void 0 : i ? g(s, p) : s, H = e.length - 1, h; H >= 0; H--)
    (h = e[H]) && (a = (i ? h(s, p, a) : h(a)) || a);
  return i && a && A(s, p, a), a;
};
let t = class extends v {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return V`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M232,92H212V64a12,12,0,0,0-12-12H48A12,12,0,0,0,36,64V92H16a4,4,0,0,0,0,8H36v28a12,12,0,0,0,12,12H200a12,12,0,0,0,12-12V100h20a4,4,0,0,1,4,4v50a4,4,0,0,1-2.9,3.84L132.7,186.5A12,12,0,0,0,124,198v34a4,4,0,0,0,8,0V198a4,4,0,0,1,2.9-3.84L235.3,165.5A12,12,0,0,0,244,154V104A12,12,0,0,0,232,92Zm-28,36a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V64a4,4,0,0,1,4-4H200a4,4,0,0,1,4,4Z"/>`
  ],
  [
    "light",
    r`<path d="M232,90H214V64a14,14,0,0,0-14-14H48A14,14,0,0,0,34,64V90H16a6,6,0,0,0,0,12H34v26a14,14,0,0,0,14,14H200a14,14,0,0,0,14-14V102h18a2,2,0,0,1,2,2v50a2,2,0,0,1-1.45,1.92l-100.4,28.68A14.06,14.06,0,0,0,122,198v34a6,6,0,0,0,12,0V198a2,2,0,0,1,1.45-1.92l100.4-28.68A14.06,14.06,0,0,0,246,154V104A14,14,0,0,0,232,90Zm-30,38a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V64a2,2,0,0,1,2-2H200a2,2,0,0,1,2,2Z"/>`
  ],
  [
    "regular",
    r`<path d="M232,88H216V64a16,16,0,0,0-16-16H48A16,16,0,0,0,32,64V88H16a8,8,0,0,0,0,16H32v24a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V104h16v50L131.6,182.65A16.07,16.07,0,0,0,120,198v34a8,8,0,0,0,16,0V198l100.4-28.68A16.07,16.07,0,0,0,248,154V104A16,16,0,0,0,232,88Zm-32,40H48V64H200v64Z"/>`
  ],
  [
    "bold",
    r`<path d="M232,84H212V64a20,20,0,0,0-20-20H52A20,20,0,0,0,32,64V84H16a12,12,0,0,0,0,24H32v20a20,20,0,0,0,20,20H192a20,20,0,0,0,20-20V108h16V155L130.5,182.8A20.09,20.09,0,0,0,116,202v30a12,12,0,0,0,24,0V205.05l97.5-27.85A20.09,20.09,0,0,0,252,158V104A20,20,0,0,0,232,84Zm-44,40H56V68H188Z"/>`
  ],
  [
    "fill",
    r`<path d="M248,104v50a16.07,16.07,0,0,1-11.6,15.38L136,198v34a8,8,0,0,1-16,0V198a16.07,16.07,0,0,1,11.6-15.38L232,154V104H216v24a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V104H16a8,8,0,0,1,0-16H32V64A16,16,0,0,1,48,48H200a16,16,0,0,1,16,16V88h16A16,16,0,0,1,248,104Z"/>`
  ],
  [
    "duotone",
    r`<path d="M208,64v64a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H200A8,8,0,0,1,208,64Z" opacity="0.2"/><path d="M232,88H216V64a16,16,0,0,0-16-16H48A16,16,0,0,0,32,64V88H16a8,8,0,0,0,0,16H32v24a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V104h16v50L131.6,182.65A16.07,16.07,0,0,0,120,198v34a8,8,0,0,0,16,0V198l100.4-28.68A16.07,16.07,0,0,0,248,154V104A16,16,0,0,0,232,88Zm-32,40H48V64H200v64Z"/>`
  ]
]);
t.styles = n`
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
  m("ph-paint-roller")
], t);
export {
  t as PhPaintRoller
};
