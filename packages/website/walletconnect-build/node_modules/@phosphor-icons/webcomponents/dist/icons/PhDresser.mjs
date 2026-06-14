import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as V } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as o } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, n = Object.getOwnPropertyDescriptor, H = (e, s, i, h) => {
  for (var t = h > 1 ? void 0 : h ? n(s, i) : s, p = e.length - 1, Z; p >= 0; p--)
    (Z = e[p]) && (t = (h ? Z(s, i, t) : Z(t)) || t);
  return h && t && A(s, i, t), t;
};
let a = class extends V {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return m`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M140,192a4,4,0,0,1-4,4H120a4,4,0,0,1,0-8h16A4,4,0,0,1,140,192ZM120,68h16a4,4,0,0,0,0-8H120a4,4,0,0,0,0,8Zm16,56H120a4,4,0,0,0,0,8h16a4,4,0,0,0,0-8Zm76-84V216a12,12,0,0,1-12,12H56a12,12,0,0,1-12-12V40A12,12,0,0,1,56,28H200A12,12,0,0,1,212,40ZM52,156H204V100H52ZM52,40V92H204V40a4,4,0,0,0-4-4H56A4,4,0,0,0,52,40ZM204,216V164H52v52a4,4,0,0,0,4,4H200A4,4,0,0,0,204,216Z"/>`
  ],
  [
    "light",
    r`<path d="M142,192a6,6,0,0,1-6,6H120a6,6,0,0,1,0-12h16A6,6,0,0,1,142,192ZM120,70h16a6,6,0,0,0,0-12H120a6,6,0,0,0,0,12Zm16,52H120a6,6,0,0,0,0,12h16a6,6,0,0,0,0-12Zm78-82V216a14,14,0,0,1-14,14H56a14,14,0,0,1-14-14V40A14,14,0,0,1,56,26H200A14,14,0,0,1,214,40ZM54,154H202V102H54ZM54,40V90H202V40a2,2,0,0,0-2-2H56A2,2,0,0,0,54,40ZM202,216V166H54v50a2,2,0,0,0,2,2H200A2,2,0,0,0,202,216Z"/>`
  ],
  [
    "regular",
    r`<path d="M144,192a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,192ZM120,72h16a8,8,0,0,0,0-16H120a8,8,0,0,0,0,16Zm16,48H120a8,8,0,0,0,0,16h16a8,8,0,0,0,0-16Zm80-80V216a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V40A16,16,0,0,1,56,24H200A16,16,0,0,1,216,40ZM56,152H200V104H56ZM56,40V88H200V40ZM200,216V168H56v48H200Z"/>`
  ],
  [
    "bold",
    r`<path d="M148,176a12,12,0,0,1-12,12H120a12,12,0,0,1,0-24h16A12,12,0,0,1,148,176ZM120,92h16a12,12,0,0,0,0-24H120a12,12,0,0,0,0,24ZM220,40V216a20,20,0,0,1-20,20H56a20,20,0,0,1-20-20V40A20,20,0,0,1,56,20H200A20,20,0,0,1,220,40ZM60,44v72H196V44ZM196,212V140H60v72Z"/>`
  ],
  [
    "fill",
    r`<path d="M200,24H56A16,16,0,0,0,40,40V80a4,4,0,0,0,4,4H212a4,4,0,0,0,4-4V40A16,16,0,0,0,200,24ZM136,64H120a8,8,0,0,1,0-16h16a8,8,0,0,1,0,16Zm76,36H44a4,4,0,0,0-4,4v48a4,4,0,0,0,4,4H212a4,4,0,0,0,4-4V104A4,4,0,0,0,212,100Zm-76,36H120.27a8.18,8.18,0,0,1-8.25-7.47,8,8,0,0,1,8-8.53h15.73a8.18,8.18,0,0,1,8.25,7.47A8,8,0,0,1,136,136Zm76,36H44a4,4,0,0,0-4,4v40a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V176A4,4,0,0,0,212,172Zm-76,36H120a8,8,0,0,1,0-16h16a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M208,40V216a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8H200A8,8,0,0,1,208,40Z" opacity="0.2"/><path d="M144,192a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,192ZM120,72h16a8,8,0,0,0,0-16H120a8,8,0,0,0,0,16Zm16,48H120a8,8,0,0,0,0,16h16a8,8,0,0,0,0-16Zm80-80V216a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V40A16,16,0,0,1,56,24H200A16,16,0,0,1,216,40ZM56,152H200V104H56ZM56,40V88H200V40ZM200,216V168H56v48H200Z"/>`
  ]
]);
a.styles = M`
    :host {
      display: contents;
    }
  `;
H([
  o({ type: String, reflect: !0 })
], a.prototype, "size", 2);
H([
  o({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
H([
  o({ type: String, reflect: !0 })
], a.prototype, "color", 2);
H([
  o({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = H([
  l("ph-dresser")
], a);
export {
  a as PhDresser
};
