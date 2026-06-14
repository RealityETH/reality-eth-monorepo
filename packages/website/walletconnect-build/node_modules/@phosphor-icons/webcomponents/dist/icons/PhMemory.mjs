import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as h, html as i } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as p } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, M = Object.getOwnPropertyDescriptor, r = (v, e, o, V) => {
  for (var t = V > 1 ? void 0 : V ? M(e, o) : e, s = v.length - 1, m; s >= 0; s--)
    (m = v[s]) && (t = (V ? m(e, o, t) : m(t)) || t);
  return V && t && n(e, o, t), t;
};
let a = class extends p {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var v;
    return i`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((v = this.weight) != null ? v : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    h`<path d="M232,60H24A12,12,0,0,0,12,72V200a4,4,0,0,0,8,0V180H44v20a4,4,0,0,0,8,0V180H76v20a4,4,0,0,0,8,0V180h24v20a4,4,0,0,0,8,0V180h24v20a4,4,0,0,0,8,0V180h24v20a4,4,0,0,0,8,0V180h24v20a4,4,0,0,0,8,0V180h24v20a4,4,0,0,0,8,0V72A12,12,0,0,0,232,60ZM20,72a4,4,0,0,1,4-4H232a4,4,0,0,1,4,4V172H20Zm92,76a4,4,0,0,0,4-4V96a4,4,0,0,0-4-4H48a4,4,0,0,0-4,4v48a4,4,0,0,0,4,4ZM52,100h56v40H52Zm92,48h64a4,4,0,0,0,4-4V96a4,4,0,0,0-4-4H144a4,4,0,0,0-4,4v48A4,4,0,0,0,144,148Zm4-48h56v40H148Z"/>`
  ],
  [
    "light",
    h`<path d="M232,58H24A14,14,0,0,0,10,72V200a6,6,0,0,0,12,0V182H42v18a6,6,0,0,0,12,0V182H74v18a6,6,0,0,0,12,0V182h20v18a6,6,0,0,0,12,0V182h20v18a6,6,0,0,0,12,0V182h20v18a6,6,0,0,0,12,0V182h20v18a6,6,0,0,0,12,0V182h20v18a6,6,0,0,0,12,0V72A14,14,0,0,0,232,58ZM22,72a2,2,0,0,1,2-2H232a2,2,0,0,1,2,2v98H22Zm90,78a6,6,0,0,0,6-6V96a6,6,0,0,0-6-6H48a6,6,0,0,0-6,6v48a6,6,0,0,0,6,6ZM54,102h52v36H54Zm90,48h64a6,6,0,0,0,6-6V96a6,6,0,0,0-6-6H144a6,6,0,0,0-6,6v48A6,6,0,0,0,144,150Zm6-48h52v36H150Z"/>`
  ],
  [
    "regular",
    h`<path d="M232,56H24A16,16,0,0,0,8,72V200a8,8,0,0,0,16,0V184H40v16a8,8,0,0,0,16,0V184H72v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V72A16,16,0,0,0,232,56ZM24,72H232v96H24Zm88,80a8,8,0,0,0,8-8V96a8,8,0,0,0-8-8H48a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8ZM56,104h48v32H56Zm88,48h64a8,8,0,0,0,8-8V96a8,8,0,0,0-8-8H144a8,8,0,0,0-8,8v48A8,8,0,0,0,144,152Zm8-48h48v32H152Z"/>`
  ],
  [
    "bold",
    h`<path d="M232,52H24A20,20,0,0,0,4,72V200a12,12,0,0,0,24,0V188H48v12a12,12,0,0,0,24,0V188H92v12a12,12,0,0,0,24,0V188h24v12a12,12,0,0,0,24,0V188h20v12a12,12,0,0,0,24,0V188h20v12a12,12,0,0,0,24,0V72A20,20,0,0,0,232,52ZM28,76H228v88H28Zm92,64V100a12,12,0,0,0-12-12H56a12,12,0,0,0-12,12v40a12,12,0,0,0,12,12h52A12,12,0,0,0,120,140ZM96,128H68V112H96Zm52,24h52a12,12,0,0,0,12-12V100a12,12,0,0,0-12-12H148a12,12,0,0,0-12,12v40A12,12,0,0,0,148,152Zm12-40h28v16H160Z"/>`
  ],
  [
    "fill",
    h`<path d="M232,56H24A16,16,0,0,0,8,72V200a8,8,0,0,0,16,0V184H40v16a8,8,0,0,0,16,0V184H72v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V72A16,16,0,0,0,232,56ZM208,96v48H144V96Zm-96,0v48H48V96Z"/>`
  ],
  [
    "duotone",
    h`<path d="M232,64H24a8,8,0,0,0-8,8V176H240V72A8,8,0,0,0,232,64ZM112,144H48V96h64Zm96,0H144V96h64Z" opacity="0.2"/><path d="M232,56H24A16,16,0,0,0,8,72V200a8,8,0,0,0,16,0V184H40v16a8,8,0,0,0,16,0V184H72v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V184h16v16a8,8,0,0,0,16,0V72A16,16,0,0,0,232,56ZM24,72H232v96H24Zm88,80a8,8,0,0,0,8-8V96a8,8,0,0,0-8-8H48a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8ZM56,104h48v32H56Zm88,48h64a8,8,0,0,0,8-8V96a8,8,0,0,0-8-8H144a8,8,0,0,0-8,8v48A8,8,0,0,0,144,152Zm8-48h48v32H152Z"/>`
  ]
]);
a.styles = l`
    :host {
      display: contents;
    }
  `;
r([
  H({ type: String, reflect: !0 })
], a.prototype, "size", 2);
r([
  H({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
r([
  H({ type: String, reflect: !0 })
], a.prototype, "color", 2);
r([
  H({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = r([
  Z("ph-memory")
], a);
export {
  a as PhMemory
};
