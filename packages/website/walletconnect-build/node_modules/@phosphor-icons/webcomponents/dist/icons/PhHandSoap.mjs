import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as l } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as v } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, g = Object.getOwnPropertyDescriptor, h = (e, o, i, s) => {
  for (var t = s > 1 ? void 0 : s ? g(o, i) : o, V = e.length - 1, H; V >= 0; V--)
    (H = e[V]) && (t = (s ? H(o, i, t) : H(t)) || t);
  return s && t && A(o, i, t), t;
};
let a = class extends v {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return l`<svg
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
    r`<path d="M180,100.23V88a28,28,0,0,0-28-28H132V28h36a12,12,0,0,1,12,12,4,4,0,0,0,8,0,20,20,0,0,0-20-20H104a4,4,0,0,0,0,8h20V60H104A28,28,0,0,0,76,88v12.23A36,36,0,0,0,44,136v80a12,12,0,0,0,12,12H200a12,12,0,0,0,12-12V136A36,36,0,0,0,180,100.23ZM104,68h48a20,20,0,0,1,20,20v12H84V88A20,20,0,0,1,104,68ZM204,216a4,4,0,0,1-4,4H56a4,4,0,0,1-4-4V136a28,28,0,0,1,28-28h96a28,28,0,0,1,28,28Z"/>`
  ],
  [
    "light",
    r`<path d="M182,98.48V88a30,30,0,0,0-30-30H134V30h34a10,10,0,0,1,10,10,6,6,0,0,0,12,0,22,22,0,0,0-22-22H104a6,6,0,0,0,0,12h18V58H104A30,30,0,0,0,74,88V98.48A38.05,38.05,0,0,0,42,136v80a14,14,0,0,0,14,14H200a14,14,0,0,0,14-14V136A38.05,38.05,0,0,0,182,98.48ZM104,70h48a18,18,0,0,1,18,18V98H86V88A18,18,0,0,1,104,70Zm98,146a2,2,0,0,1-2,2H56a2,2,0,0,1-2-2V136a26,26,0,0,1,26-26h96a26,26,0,0,1,26,26Z"/>`
  ],
  [
    "regular",
    r`<path d="M184,96.8V88a32,32,0,0,0-32-32H136V32h32a8,8,0,0,1,8,8,8,8,0,0,0,16,0,24,24,0,0,0-24-24H104a8,8,0,0,0,0,16h16V56H104A32,32,0,0,0,72,88v8.8A40.07,40.07,0,0,0,40,136v80a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V136A40.07,40.07,0,0,0,184,96.8ZM104,72h48a16,16,0,0,1,16,16v8H88V88A16,16,0,0,1,104,72Zm96,144H56V136a24,24,0,0,1,24-24h96a24,24,0,0,1,24,24v80Z"/>`
  ],
  [
    "bold",
    r`<path d="M188,97.68V92a36,36,0,0,0-36-36H140V36h28a4,4,0,0,1,4,4,12,12,0,0,0,24,0,28,28,0,0,0-28-28H104a12,12,0,0,0,0,24h12V56H104A36,36,0,0,0,68,92v5.68A44.06,44.06,0,0,0,36,140v76a20,20,0,0,0,20,20H200a20,20,0,0,0,20-20V140A44.06,44.06,0,0,0,188,97.68ZM104,80h48a12,12,0,0,1,12,12v4H92V92A12,12,0,0,1,104,80Zm92,132H60V140a20,20,0,0,1,20-20h96a20,20,0,0,1,20,20Z"/>`
  ],
  [
    "fill",
    r`<path d="M184,96.8V88a32,32,0,0,0-32-32H136V32h32a8,8,0,0,1,8,8,8,8,0,0,0,16,0,24,24,0,0,0-24-24H104a8,8,0,0,0,0,16h16V56H104A32,32,0,0,0,72,88v8.8A40.07,40.07,0,0,0,40,136v80a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V136A40.07,40.07,0,0,0,184,96.8ZM104,72h48a16,16,0,0,1,16,16v8H88V88A16,16,0,0,1,104,72Z"/>`
  ],
  [
    "duotone",
    r`<path d="M208,136v80a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V136a32,32,0,0,1,32-32h96A32,32,0,0,1,208,136Z" opacity="0.2"/><path d="M184,96.8V88a32,32,0,0,0-32-32H136V32h32a8,8,0,0,1,8,8,8,8,0,0,0,16,0,24,24,0,0,0-24-24H104a8,8,0,0,0,0,16h16V56H104A32,32,0,0,0,72,88v8.8A40.07,40.07,0,0,0,40,136v80a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V136A40.07,40.07,0,0,0,184,96.8ZM104,72h48a16,16,0,0,1,16,16v8H88V88A16,16,0,0,1,104,72Zm96,144H56V136a24,24,0,0,1,24-24h96a24,24,0,0,1,24,24v80Z"/>`
  ]
]);
a.styles = n`
    :host {
      display: contents;
    }
  `;
h([
  p({ type: String, reflect: !0 })
], a.prototype, "size", 2);
h([
  p({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
h([
  p({ type: String, reflect: !0 })
], a.prototype, "color", 2);
h([
  p({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = h([
  m("ph-hand-soap")
], a);
export {
  a as PhHandSoap
};
