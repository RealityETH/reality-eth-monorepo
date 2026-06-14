import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as L } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var H = Object.defineProperty, n = Object.getOwnPropertyDescriptor, s = (l, o, p, a) => {
  for (var r = a > 1 ? void 0 : a ? n(o, p) : o, h = l.length - 1, M; h >= 0; h--)
    (M = l[h]) && (r = (a ? M(o, p, r) : M(r)) || r);
  return a && r && H(o, p, r), r;
};
let t = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var l;
    return A`<svg
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
    e`<path d="M133.78,128l74.68-71.51A12,12,0,0,0,200,36H56a12,12,0,0,0-8.49,20.49l.07.06L122.22,128,47.61,199.45l-.07.06A12,12,0,0,0,56,220H200a12,12,0,0,0,8.42-20.55Zm34.38,44H87.84L128,133.54ZM52.33,46.47A3.93,3.93,0,0,1,56,44H200a4,4,0,0,1,2.89,6.77L128,122.46,53.17,50.8A3.92,3.92,0,0,1,52.33,46.47ZM203.67,209.53A3.93,3.93,0,0,1,200,212H56a4,4,0,0,1-2.86-6.8L79.49,180h97l26.28,25.17A3.93,3.93,0,0,1,203.67,209.53Z"/>`
  ],
  [
    "light",
    e`<path d="M209.8,198l-73.12-70L209.8,58l.09-.09A14,14,0,0,0,200,34H56a14,14,0,0,0-9.9,23.9l.09.09,73.12,70L46.2,198l-.09.09A14,14,0,0,0,56,222H200a14,14,0,0,0,9.9-23.9ZM54.56,49.38A2,2,0,0,1,56,46H200a2,2,0,0,1,1.45,3.38L128,119.69ZM128,136.31,163.19,170H92.81Zm73.84,72.46A1.91,1.91,0,0,1,200,210H56a2,2,0,0,1-1.45-3.38L80.28,182h95.44l25.72,24.62A1.91,1.91,0,0,1,201.84,208.77Z"/>`
  ],
  [
    "regular",
    e`<path d="M211.18,196.56,139.57,128l71.61-68.56a1.59,1.59,0,0,1,.13-.13A16,16,0,0,0,200,32H56A16,16,0,0,0,44.7,59.31l.12.13L116.43,128,44.82,196.56l-.12.13A16,16,0,0,0,56,224H200a16,16,0,0,0,11.32-27.31A1.59,1.59,0,0,1,211.18,196.56ZM56,48h0v0ZM158.21,168H97.79L128,139.08ZM200,48l-72,68.92L56,48ZM56,208l25.06-24h93.84L200,208Z"/>`
  ],
  [
    "bold",
    e`<path d="M214,193.68,145.35,128,214,62.32l.18-.18A20,20,0,0,0,200,28H56A20,20,0,0,0,41.87,62.14l.18.18L110.65,128l-68.6,65.68-.18.18A20,20,0,0,0,56,228H200a20,20,0,0,0,14.14-34.14ZM148.25,164h-40.5L128,144.61ZM190,52l-62,59.39L66,52ZM66,204l16.71-16h90.62L190,204Z"/>`
  ],
  [
    "fill",
    e`<path d="M211.18,196.56,139.57,128l71.61-68.56a1.59,1.59,0,0,1,.13-.13A16,16,0,0,0,200,32H56A16,16,0,0,0,44.69,59.31a1.59,1.59,0,0,1,.13.13L116.43,128,44.82,196.56a1.59,1.59,0,0,1-.13.13A16,16,0,0,0,56,224H200a16,16,0,0,0,11.32-27.31A1.59,1.59,0,0,1,211.18,196.56ZM56,48h0v0ZM158.21,168H97.79L128,139.08ZM200,48l-72,68.92L56,48Z"/>`
  ],
  [
    "duotone",
    e`<path d="M200,216H56a8,8,0,0,1-5.66-13.66L77.87,176H178.13l27.51,26.34A8,8,0,0,1,200,216Z" opacity="0.2"/><path d="M211.18,196.56,139.57,128l71.61-68.56a1.59,1.59,0,0,1,.13-.13A16,16,0,0,0,200,32H56A16,16,0,0,0,44.69,59.31a1.59,1.59,0,0,1,.13.13L116.43,128,44.82,196.56a1.59,1.59,0,0,1-.13.13A16,16,0,0,0,56,224H200a16,16,0,0,0,11.32-27.31A1.59,1.59,0,0,1,211.18,196.56ZM56,48h0v0ZM158.21,168H97.79L128,139.08ZM200,48l-72,68.92L56,48ZM56,208l25.06-24h93.84L200,208Z"/>`
  ]
]);
t.styles = L`
    :host {
      display: contents;
    }
  `;
s([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  m("ph-hourglass-simple-low")
], t);
export {
  t as PhHourglassSimpleLow
};
