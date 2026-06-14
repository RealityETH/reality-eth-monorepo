import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as L } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, a = (l, s, p, o) => {
  for (var e = o > 1 ? void 0 : o ? g(s, p) : s, h = l.length - 1, M; h >= 0; h--)
    (M = l[h]) && (e = (o ? M(s, p, e) : M(e)) || e);
  return o && e && n(s, p, e), e;
};
let t = class extends L {
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
    r`<path d="M133.78,128l74.68-71.51A12,12,0,0,0,200,36H56a12,12,0,0,0-8.49,20.49l.07.06L122.22,128,47.61,199.45l-.07.06A12,12,0,0,0,56,220H200a12,12,0,0,0,8.42-20.55ZM87.84,84h80.32L128,122.46ZM52.33,46.47A3.93,3.93,0,0,1,56,44H200a4,4,0,0,1,2.89,6.77L176.51,76h-97L53.17,50.8A3.92,3.92,0,0,1,52.33,46.47ZM203.67,209.53A3.93,3.93,0,0,1,200,212H56a4,4,0,0,1-2.86-6.8L124,137.37V168a4,4,0,0,0,8,0V137.37l70.8,67.8A3.93,3.93,0,0,1,203.67,209.53Z"/>`
  ],
  [
    "light",
    r`<path d="M209.8,198l-73.12-70L209.8,58l.09-.09A14,14,0,0,0,200,34H56a14,14,0,0,0-9.9,23.9l.09.09,73.12,70L46.2,198l-.09.09A14,14,0,0,0,56,222H200a14,14,0,0,0,9.9-23.9ZM92.81,86h70.38L128,119.69ZM54.16,47.23A1.91,1.91,0,0,1,56,46H200a2,2,0,0,1,1.45,3.38L175.72,74H80.28L54.56,49.38A1.91,1.91,0,0,1,54.16,47.23ZM201.84,208.77A1.91,1.91,0,0,1,200,210H56a2,2,0,0,1-1.45-3.38L122,142.05V168a6,6,0,0,0,12,0V142.05l67.44,64.57A1.91,1.91,0,0,1,201.84,208.77Z"/>`
  ],
  [
    "regular",
    r`<path d="M211.18,196.56,139.57,128l71.61-68.56a1.59,1.59,0,0,1,.13-.13A16,16,0,0,0,200,32H56A16,16,0,0,0,44.7,59.31l.12.13L116.43,128,44.82,196.56l-.12.13A16,16,0,0,0,56,224H200a16,16,0,0,0,11.32-27.31A1.59,1.59,0,0,1,211.18,196.56ZM56,48h0v0ZM97.79,88h60.42L128,116.92ZM200,48,174.92,72H81.08L56,48ZM56,208l64-61.26V168a8,8,0,0,0,16,0V146.74L200,208Z"/>`
  ],
  [
    "bold",
    r`<path d="M214,193.68,145.35,128,214,62.32l.18-.18A20,20,0,0,0,200,28H56A20,20,0,0,0,41.87,62.14l.18.18L110.65,128l-68.6,65.68-.18.18A20,20,0,0,0,56,228H200a20,20,0,0,0,14.14-34.14ZM107.75,92h40.5L128,111.39ZM190,52,173.31,68H82.69L66,52ZM66,204l50-47.9V168a12,12,0,0,0,24,0V156.1L190,204Z"/>`
  ],
  [
    "fill",
    r`<path d="M211.18,196.56,139.57,128l71.61-68.56a1.59,1.59,0,0,1,.13-.13A16,16,0,0,0,200,32H56A16,16,0,0,0,44.69,59.31a1.59,1.59,0,0,1,.13.13L116.43,128,44.82,196.56a1.59,1.59,0,0,1-.13.13A16,16,0,0,0,56,224H200a16,16,0,0,0,11.32-27.31A1.59,1.59,0,0,1,211.18,196.56ZM56,48h0v0Zm144,0L174.92,72H81.08L56,48ZM56,208l64-61.26V168a8,8,0,0,0,16,0V146.74L200,208Z"/>`
  ],
  [
    "duotone",
    r`<path d="M178.13,80,128,128,77.87,80Z" opacity="0.2"/><path d="M211.18,196.56,139.57,128l71.61-68.56a1.59,1.59,0,0,1,.13-.13A16,16,0,0,0,200,32H56A16,16,0,0,0,44.69,59.31a1.59,1.59,0,0,1,.13.13L116.43,128,44.82,196.56a1.59,1.59,0,0,1-.13.13A16,16,0,0,0,56,224H200a16,16,0,0,0,11.32-27.31A1.59,1.59,0,0,1,211.18,196.56ZM56,48h0v0ZM97.79,88h60.42L128,116.92ZM200,48,174.92,72H81.08L56,48ZM56,208l64-61.26V168a8,8,0,0,0,16,0V146.74L200,208Z"/>`
  ]
]);
t.styles = Z`
    :host {
      display: contents;
    }
  `;
a([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  A("ph-hourglass-simple-medium")
], t);
export {
  t as PhHourglassSimpleMedium
};
