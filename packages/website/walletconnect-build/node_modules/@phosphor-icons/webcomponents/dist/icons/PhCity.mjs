import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as V, html as i } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as h } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, n = Object.getOwnPropertyDescriptor, e = (r, Z, v, m) => {
  for (var t = m > 1 ? void 0 : m ? n(Z, v) : Z, o = r.length - 1, s; o >= 0; o--)
    (s = r[o]) && (t = (m ? s(Z, v, t) : s(t)) || t);
  return m && t && M(Z, v, t), t;
};
let a = class extends h {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return i`<svg
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
    V`<path d="M240,212H228V88a4,4,0,0,0-4-4H160a4,4,0,0,0-4,4v44H100V40a4,4,0,0,0-4-4H32a4,4,0,0,0-4,4V212H16a4,4,0,0,0,0,8H240a4,4,0,0,0,0-8ZM164,92h56V212H164Zm-8,48v72H100V140ZM36,44H92V212H36ZM68,72V88a4,4,0,0,1-8,0V72a4,4,0,0,1,8,0Zm0,48v16a4,4,0,0,1-8,0V120a4,4,0,0,1,8,0Zm0,48v16a4,4,0,0,1-8,0V168a4,4,0,0,1,8,0Zm56,16V168a4,4,0,0,1,8,0v16a4,4,0,0,1-8,0Zm64,0V168a4,4,0,0,1,8,0v16a4,4,0,0,1-8,0Zm0-48V120a4,4,0,0,1,8,0v16a4,4,0,0,1-8,0Z"/>`
  ],
  [
    "light",
    V`<path d="M240,210H230V88a6,6,0,0,0-6-6H160a6,6,0,0,0-6,6v42H102V40a6,6,0,0,0-6-6H32a6,6,0,0,0-6,6V210H16a6,6,0,0,0,0,12H240a6,6,0,0,0,0-12ZM166,94h52V210H166Zm-12,48v68H102V142ZM38,46H90V210H38ZM70,72V88a6,6,0,0,1-12,0V72a6,6,0,0,1,12,0Zm0,48v16a6,6,0,0,1-12,0V120a6,6,0,0,1,12,0Zm0,48v16a6,6,0,0,1-12,0V168a6,6,0,0,1,12,0Zm52,16V168a6,6,0,0,1,12,0v16a6,6,0,0,1-12,0Zm64,0V168a6,6,0,0,1,12,0v16a6,6,0,0,1-12,0Zm0-48V120a6,6,0,0,1,12,0v16a6,6,0,0,1-12,0Z"/>`
  ],
  [
    "regular",
    V`<path d="M240,208h-8V88a8,8,0,0,0-8-8H160a8,8,0,0,0-8,8v40H104V40a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM168,96h48V208H168Zm-16,48v64H104V144ZM40,48H88V208H40ZM72,72V88a8,8,0,0,1-16,0V72a8,8,0,0,1,16,0Zm0,48v16a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm0,48v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm48,16V168a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Zm64,0V168a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Zm0-48V120a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Z"/>`
  ],
  [
    "bold",
    V`<path d="M240,204h-4V88a12,12,0,0,0-12-12H152a12,12,0,0,0-12,12v36H116V40a12,12,0,0,0-12-12H32A12,12,0,0,0,20,40V204H16a12,12,0,0,0,0,24H240a12,12,0,0,0,0-24ZM164,100h48V204H164Zm-24,48v56H116V148ZM44,52H92V204H44ZM80,76v8a12,12,0,0,1-24,0V76a12,12,0,0,1,24,0Zm0,48v8a12,12,0,0,1-24,0v-8a12,12,0,0,1,24,0Zm0,48v8a12,12,0,0,1-24,0v-8a12,12,0,0,1,24,0Zm96,8v-8a12,12,0,0,1,24,0v8a12,12,0,0,1-24,0Zm0-48v-8a12,12,0,0,1,24,0v8a12,12,0,0,1-24,0Z"/>`
  ],
  [
    "fill",
    V`<path d="M240,208h-8V88a8,8,0,0,0-8-8H160a8,8,0,0,0-8,8v40H104V40a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM72,184a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm0-48a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm0-48a8,8,0,0,1-16,0V72a8,8,0,0,1,16,0Zm64,96a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm64,0a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm0-48a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "duotone",
    V`<path d="M32,40H96V216H32ZM160,88V216h64V88Z" opacity="0.2"/><path d="M240,208h-8V88a8,8,0,0,0-8-8H160a8,8,0,0,0-8,8v40H104V40a8,8,0,0,0-8-8H32a8,8,0,0,0-8,8V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM168,96h48V208H168Zm-16,48v64H104V144ZM40,48H88V208H40ZM72,72V88a8,8,0,0,1-16,0V72a8,8,0,0,1,16,0Zm0,48v16a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm0,48v16a8,8,0,0,1-16,0V168a8,8,0,0,1,16,0Zm48,16V168a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Zm64,0V168a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Zm0-48V120a8,8,0,0,1,16,0v16a8,8,0,0,1-16,0Z"/>`
  ]
]);
a.styles = l`
    :host {
      display: contents;
    }
  `;
e([
  H({ type: String, reflect: !0 })
], a.prototype, "size", 2);
e([
  H({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
e([
  H({ type: String, reflect: !0 })
], a.prototype, "color", 2);
e([
  H({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = e([
  p("ph-city")
], a);
export {
  a as PhCity
};
