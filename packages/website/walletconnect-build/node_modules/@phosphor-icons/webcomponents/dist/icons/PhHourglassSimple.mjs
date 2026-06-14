import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as M } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var Z = Object.defineProperty, u = Object.getOwnPropertyDescriptor, s = (l, o, p, a) => {
  for (var r = a > 1 ? void 0 : a ? u(o, p) : o, h = l.length - 1, A; h >= 0; h--)
    (A = l[h]) && (r = (a ? A(o, p, r) : A(r)) || r);
  return a && r && Z(o, p, r), r;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var l;
    return m`<svg
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
    e`<path d="M133.78,128l74.68-71.51A12,12,0,0,0,200,36H56a12,12,0,0,0-8.49,20.49l.07.06L122.22,128,47.61,199.45l-.07.06A12,12,0,0,0,56,220H200a12,12,0,0,0,8.42-20.55ZM52.33,46.47A3.93,3.93,0,0,1,56,44H200a4,4,0,0,1,2.89,6.77L128,122.46,53.17,50.8A3.92,3.92,0,0,1,52.33,46.47ZM203.67,209.53A3.93,3.93,0,0,1,200,212H56a4,4,0,0,1-2.86-6.8L128,133.54l74.8,71.63A3.93,3.93,0,0,1,203.67,209.53Z"/>`
  ],
  [
    "light",
    e`<path d="M209.8,198l-73.12-70L209.8,58l.09-.09A14,14,0,0,0,200,34H56a14,14,0,0,0-9.9,23.9l.09.09,73.12,70L46.2,198l-.09.09A14,14,0,0,0,56,222H200a14,14,0,0,0,9.9-23.9ZM54.16,47.23A1.91,1.91,0,0,1,56,46H200a2,2,0,0,1,1.45,3.38L128,119.69,54.56,49.38A1.91,1.91,0,0,1,54.16,47.23ZM201.84,208.77A1.91,1.91,0,0,1,200,210H56a2,2,0,0,1-1.45-3.38L128,136.31l73.44,70.31A1.91,1.91,0,0,1,201.84,208.77Z"/>`
  ],
  [
    "regular",
    e`<path d="M211.18,196.56,139.57,128l71.61-68.56a1.59,1.59,0,0,1,.13-.13A16,16,0,0,0,200,32H56A16,16,0,0,0,44.7,59.31l.12.13L116.43,128,44.82,196.56l-.12.13A16,16,0,0,0,56,224H200a16,16,0,0,0,11.32-27.31A1.59,1.59,0,0,1,211.18,196.56ZM56,48h0v0Zm144,0-72,68.92L56,48ZM56,208l72-68.92L200,208Z"/>`
  ],
  [
    "bold",
    e`<path d="M214,193.68,145.35,128,214,62.32l.18-.18A20,20,0,0,0,200,28H56A20,20,0,0,0,41.87,62.14l.18.18L110.65,128l-68.6,65.68-.18.18A20,20,0,0,0,56,228H200a20,20,0,0,0,14.14-34.14ZM190,52l-62,59.39L66,52ZM66,204l62-59.39L190,204Z"/>`
  ],
  [
    "fill",
    e`<path d="M211.31,196.69A16,16,0,0,1,200,224H56a16,16,0,0,1-11.32-27.31,1.59,1.59,0,0,0,.13-.13L116.43,128,44.82,59.44a1.59,1.59,0,0,0-.13-.13A16,16,0,0,1,56,32H200a16,16,0,0,1,11.32,27.31,1.59,1.59,0,0,0-.13.13L139.57,128l71.61,68.56A1.59,1.59,0,0,0,211.31,196.69Z"/>`
  ],
  [
    "duotone",
    e`<path d="M205.64,53.66,128,128,50.36,53.66A8,8,0,0,1,56,40H200A8,8,0,0,1,205.64,53.66ZM128,128,50.36,202.34A8,8,0,0,0,56,216H200a8,8,0,0,0,5.66-13.66Z" opacity="0.2"/><path d="M211.18,196.56,139.57,128l71.61-68.56a1.59,1.59,0,0,1,.13-.13A16,16,0,0,0,200,32H56A16,16,0,0,0,44.69,59.31a1.59,1.59,0,0,1,.13.13L116.43,128,44.82,196.56a1.59,1.59,0,0,1-.13.13A16,16,0,0,0,56,224H200a16,16,0,0,0,11.32-27.31A1.59,1.59,0,0,1,211.18,196.56ZM56,48h0v0Zm144,0-72,68.92L56,48ZM56,208l72-68.92L200,208Z"/>`
  ]
]);
t.styles = M`
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
  g("ph-hourglass-simple")
], t);
export {
  t as PhHourglassSimple
};
