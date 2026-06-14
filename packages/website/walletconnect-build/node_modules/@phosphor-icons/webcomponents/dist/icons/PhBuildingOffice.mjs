import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as t, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as p } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as s } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, f = Object.getOwnPropertyDescriptor, r = (e, h, V, o) => {
  for (var H = o > 1 ? void 0 : o ? f(h, V) : h, Z = e.length - 1, i; Z >= 0; Z--)
    (i = e[Z]) && (H = (o ? i(h, V, H) : i(H)) || H);
  return o && H && n(h, V, H), H;
};
let a = class extends p {
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
    t`<path d="M248,212H228V92h4a4,4,0,0,0,0-8H180V44h4a4,4,0,0,0,0-8H40a4,4,0,0,0,0,8h4V212H24a4,4,0,0,0,0,8H248a4,4,0,0,0,0-8ZM220,92V212H180V92ZM52,44H172V212H140V160a4,4,0,0,0-4-4H88a4,4,0,0,0-4,4v52H52Zm80,168H92V164h40ZM76,80a4,4,0,0,1,4-4H96a4,4,0,0,1,0,8H80A4,4,0,0,1,76,80Zm48,0a4,4,0,0,1,4-4h16a4,4,0,0,1,0,8H128A4,4,0,0,1,124,80ZM80,124a4,4,0,0,1,0-8H96a4,4,0,0,1,0,8Zm44-4a4,4,0,0,1,4-4h16a4,4,0,0,1,0,8H128A4,4,0,0,1,124,120Z"/>`
  ],
  [
    "light",
    t`<path d="M248,210H230V94h2a6,6,0,0,0,0-12H182V46h2a6,6,0,0,0,0-12H40a6,6,0,0,0,0,12h2V210H24a6,6,0,0,0,0,12H248a6,6,0,0,0,0-12ZM218,94V210H182V94ZM54,46H170V210H142V160a6,6,0,0,0-6-6H88a6,6,0,0,0-6,6v50H54Zm76,164H94V166h36ZM74,80a6,6,0,0,1,6-6H96a6,6,0,0,1,0,12H80A6,6,0,0,1,74,80Zm48,0a6,6,0,0,1,6-6h16a6,6,0,0,1,0,12H128A6,6,0,0,1,122,80ZM80,126a6,6,0,0,1,0-12H96a6,6,0,0,1,0,12Zm42-6a6,6,0,0,1,6-6h16a6,6,0,0,1,0,12H128A6,6,0,0,1,122,120Z"/>`
  ],
  [
    "regular",
    t`<path d="M248,208H232V96a8,8,0,0,0,0-16H184V48a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16V208H24a8,8,0,0,0,0,16H248a8,8,0,0,0,0-16ZM216,96V208H184V96ZM56,48H168V208H144V160a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v48H56Zm72,160H96V168h32ZM72,80a8,8,0,0,1,8-8H96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,80Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H128A8,8,0,0,1,120,80ZM72,120a8,8,0,0,1,8-8H96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,120Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H128A8,8,0,0,1,120,120Z"/>`
  ],
  [
    "bold",
    t`<path d="M244,204H232V99.3A12,12,0,0,0,228,76H188V51.3A12,12,0,0,0,184,28H40a12,12,0,0,0-4,23.3V204H24a12,12,0,0,0,0,24H244a12,12,0,0,0,0-24ZM208,100V204H188V100ZM60,52H164V204H148V160a12,12,0,0,0-12-12H88a12,12,0,0,0-12,12v44H60Zm64,152H100V172h24ZM72,80A12,12,0,0,1,84,68h8a12,12,0,0,1,0,24H84A12,12,0,0,1,72,80Zm48,0a12,12,0,0,1,12-12h8a12,12,0,0,1,0,24h-8A12,12,0,0,1,120,80ZM72,120a12,12,0,0,1,12-12h8a12,12,0,0,1,0,24H84A12,12,0,0,1,72,120Zm48,0a12,12,0,0,1,12-12h8a12,12,0,0,1,0,24h-8A12,12,0,0,1,120,120Z"/>`
  ],
  [
    "fill",
    t`<path d="M248,208H232V96a8,8,0,0,0,0-16H184V48a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16V208H24a8,8,0,0,0,0,16H248a8,8,0,0,0,0-16ZM80,72H96a8,8,0,0,1,0,16H80a8,8,0,0,1,0-16Zm-8,48a8,8,0,0,1,8-8H96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,120Zm64,88H88V160h48Zm8-80H128a8,8,0,0,1,0-16h16a8,8,0,0,1,0,16Zm0-40H128a8,8,0,0,1,0-16h16a8,8,0,0,1,0,16Zm72,120H184V96h32Z"/>`
  ],
  [
    "duotone",
    t`<path d="M176,40V216H136V160H88v56H48V40Z" opacity="0.2"/><path d="M248,208H232V96a8,8,0,0,0,0-16H184V48a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16V208H24a8,8,0,0,0,0,16H248a8,8,0,0,0,0-16ZM216,96V208H184V96ZM56,48H168V208H144V160a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v48H56Zm72,160H96V168h32ZM72,80a8,8,0,0,1,8-8H96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,80Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H128A8,8,0,0,1,120,80ZM72,120a8,8,0,0,1,8-8H96a8,8,0,0,1,0,16H80A8,8,0,0,1,72,120Zm48,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H128A8,8,0,0,1,120,120Z"/>`
  ]
]);
a.styles = M`
    :host {
      display: contents;
    }
  `;
r([
  s({ type: String, reflect: !0 })
], a.prototype, "size", 2);
r([
  s({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
r([
  s({ type: String, reflect: !0 })
], a.prototype, "color", 2);
r([
  s({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = r([
  l("ph-building-office")
], a);
export {
  a as PhBuildingOffice
};
