import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as H, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as s } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var Z = Object.defineProperty, g = Object.getOwnPropertyDescriptor, e = (r, h, p, o) => {
  for (var t = o > 1 ? void 0 : o ? g(h, p) : h, i = r.length - 1, l; i >= 0; i--)
    (l = r[i]) && (t = (o ? l(h, p, t) : l(t)) || t);
  return o && t && Z(h, p, t), t;
};
let a = class extends v {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return V`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    H`<path d="M240,84H106.47L83.58,38.21A4,4,0,0,0,80,36H48a4,4,0,0,0-4,4V84H24a4,4,0,0,0,0,8H44V212H24a4,4,0,0,0,0,8H128a4,4,0,0,0,0-8H108V92H212v92a4,4,0,0,1-4,4H192a4,4,0,0,1-4-4v-8a4,4,0,0,0-8,0v8a12,12,0,0,0,12,12h16a12,12,0,0,0,12-12V92h20a4,4,0,0,0,0-8ZM52,44H77.53l20,40H52Zm0,168V156h48v56Zm48-64H52V92h48Z"/>`
  ],
  [
    "light",
    H`<path d="M240,82H107.71L85.37,37.32A6,6,0,0,0,80,34H48a6,6,0,0,0-6,6V82H24a6,6,0,0,0,0,12H42V210H24a6,6,0,0,0,0,12H128a6,6,0,0,0,0-12H110V94H210v90a2,2,0,0,1-2,2H192a2,2,0,0,1-2-2v-8a6,6,0,0,0-12,0v8a14,14,0,0,0,14,14h16a14,14,0,0,0,14-14V94h18a6,6,0,0,0,0-12ZM54,46H76.29l18,36H54Zm0,164V158H98v52Zm44-64H54V94H98Z"/>`
  ],
  [
    "regular",
    H`<path d="M240,80H108.94L87.16,36.42A8,8,0,0,0,80,32H48a8,8,0,0,0-8,8V80H24a8,8,0,0,0,0,16H40V208H24a8,8,0,0,0,0,16H128a8,8,0,0,0,0-16H112V96h96v88H192v-8a8,8,0,0,0-16,0v8a16,16,0,0,0,16,16h16a16,16,0,0,0,16-16V96h16a8,8,0,0,0,0-16ZM56,48H75.06l16,32H56Zm0,160V160H96v48Zm40-64H56V96H96Z"/>`
  ],
  [
    "bold",
    H`<path d="M240,76H111.42L90.73,34.63A12,12,0,0,0,80,28H48A12,12,0,0,0,36,40V76H24a12,12,0,0,0,0,24H36V204H24a12,12,0,0,0,0,24H128a12,12,0,0,0,0-24H116V100h88v80H192v-4a12,12,0,0,0-24,0v8a20,20,0,0,0,20,20h20a20,20,0,0,0,20-20V100h12a12,12,0,0,0,0-24ZM60,52H72.58l12,24H60Zm0,152V164H92v40Zm32-64H60V100H92Z"/>`
  ],
  [
    "fill",
    H`<path d="M127.73,208H112V164a4,4,0,0,0-4-4H44a4,4,0,0,0-4,4v44H24.27A8.17,8.17,0,0,0,16,215.47,8,8,0,0,0,24,224H128a8,8,0,0,0,8-8.53A8.17,8.17,0,0,0,127.73,208Z"/><path d="M239.73,80H108.94L87.16,36.42A8,8,0,0,0,80,32H48a8,8,0,0,0-8,8V80H24.27A8.17,8.17,0,0,0,16,87.47,8,8,0,0,0,24,96H40v44a4,4,0,0,0,4,4h64a4,4,0,0,0,4-4V96h96v88H192v-7.73a8.18,8.18,0,0,0-7.47-8.25,8,8,0,0,0-8.53,8v8a16,16,0,0,0,16,16h16a16,16,0,0,0,16-16V96h16a8,8,0,0,0,8-8.53A8.17,8.17,0,0,0,239.73,80ZM56,80V48H75.06l16,32Z"/>`
  ],
  [
    "duotone",
    H`<path d="M104,88V216H48V40H80Z" opacity="0.2"/><path d="M240,80H108.94L87.16,36.42A8,8,0,0,0,80,32H48a8,8,0,0,0-8,8V80H24a8,8,0,0,0,0,16H40V208H24a8,8,0,0,0,0,16H128a8,8,0,0,0,0-16H112V96h96v88H192v-8a8,8,0,0,0-16,0v8a16,16,0,0,0,16,16h16a16,16,0,0,0,16-16V96h16a8,8,0,0,0,0-16ZM56,48H75.06l16,32H56Zm0,160V160H96v48Zm40-64H56V96H96Z"/>`
  ]
]);
a.styles = n`
    :host {
      display: contents;
    }
  `;
e([
  s({ type: String, reflect: !0 })
], a.prototype, "size", 2);
e([
  s({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
e([
  s({ type: String, reflect: !0 })
], a.prototype, "color", 2);
e([
  s({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = e([
  m("ph-crane-tower")
], a);
export {
  a as PhCraneTower
};
