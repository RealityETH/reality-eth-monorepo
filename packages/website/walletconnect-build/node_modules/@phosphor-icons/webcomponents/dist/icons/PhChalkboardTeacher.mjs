import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, c = Object.getOwnPropertyDescriptor, H = (e, o, i, s) => {
  for (var t = s > 1 ? void 0 : s ? c(o, i) : o, p = e.length - 1, l; p >= 0; p--)
    (l = e[p]) && (t = (s ? l(o, i, t) : l(t)) || t);
  return s && t && n(o, i, t), t;
};
let a = class extends A {
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
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M216,44H40A12,12,0,0,0,28,56V200a12,12,0,0,0,12,12H53.39A4,4,0,0,0,57,209.71a52,52,0,0,1,94,0,4,4,0,0,0,3.61,2.29H216a12,12,0,0,0,12-12V56A12,12,0,0,0,216,44Zm4,156a4,4,0,0,1-4,4H157.08a60.38,60.38,0,0,0-34.68-29.07,36,36,0,1,0-36.8,0A60.38,60.38,0,0,0,50.92,204H40a4,4,0,0,1-4-4V56a4,4,0,0,1,4-4H216a4,4,0,0,1,4,4ZM104,172a28,28,0,1,1,28-28A28,28,0,0,1,104,172Zm92-92v96a4,4,0,0,1-4,4H176a4,4,0,0,1,0-8h12V84H68V96a4,4,0,0,1-8,0V80a4,4,0,0,1,4-4H192A4,4,0,0,1,196,80Z"/>`
  ],
  [
    "light",
    r`<path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H53.39a6,6,0,0,0,5.42-3.43,50,50,0,0,1,90.38,0,6,6,0,0,0,5.42,3.43H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM78,144a26,26,0,1,1,26,26A26,26,0,0,1,78,144Zm140,56a2,2,0,0,1-2,2H158.27a62.34,62.34,0,0,0-31.48-27.61,38,38,0,1,0-45.58,0A62.34,62.34,0,0,0,49.73,202H40a2,2,0,0,1-2-2V56a2,2,0,0,1,2-2H216a2,2,0,0,1,2,2ZM198,80v96a6,6,0,0,1-6,6H176a6,6,0,0,1,0-12h10V86H70V96a6,6,0,0,1-12,0V80a6,6,0,0,1,6-6H192A6,6,0,0,1,198,80Z"/>`
  ],
  [
    "regular",
    r`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H53.39a8,8,0,0,0,7.23-4.57,48,48,0,0,1,86.76,0,8,8,0,0,0,7.23,4.57H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM80,144a24,24,0,1,1,24,24A24,24,0,0,1,80,144Zm136,56H159.43a64.39,64.39,0,0,0-28.83-26.16,40,40,0,1,0-53.2,0A64.39,64.39,0,0,0,48.57,200H40V56H216ZM56,96V80a8,8,0,0,1,8-8H192a8,8,0,0,1,8,8v96a8,8,0,0,1-8,8H176a8,8,0,0,1,0-16h8V88H72v8a8,8,0,0,1-16,0Z"/>`
  ],
  [
    "bold",
    r`<path d="M56,84A12,12,0,0,1,68,72H188a12,12,0,0,1,12,12v88a12,12,0,0,1-24,0V96H68A12,12,0,0,1,56,84ZM236,56V200a20,20,0,0,1-20,20H149.26a12,12,0,0,1-11.4-8.26,36,36,0,0,0-67.74,0A12,12,0,0,1,58.74,220H40a20,20,0,0,1-20-20V56A20,20,0,0,1,40,36H216A20,20,0,0,1,236,56ZM104,164a16,16,0,1,0-16-16A16,16,0,0,0,104,164ZM212,60H44V196h6.92a60.18,60.18,0,0,1,21.76-23.16,40,40,0,1,1,62.64,0A60.18,60.18,0,0,1,157.08,196H212Z"/>`
  ],
  [
    "fill",
    r`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H53.39a8,8,0,0,0,7.23-4.57,48,48,0,0,1,86.76,0,8,8,0,0,0,7.23,4.57H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM104,168a32,32,0,1,1,32-32A32,32,0,0,1,104,168Zm112,32H159.43a63.93,63.93,0,0,0-13.16-16H192a8,8,0,0,0,8-8V80a8,8,0,0,0-8-8H64a8,8,0,0,0-8,8v96a8,8,0,0,0,6,7.75A63.72,63.72,0,0,0,48.57,200H40V56H216Z"/>`
  ],
  [
    "duotone",
    r`<path d="M192,80v96H104a32,32,0,1,0-32-32H64V80Z" opacity="0.2"/><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H53.39a8,8,0,0,0,7.23-4.57,48,48,0,0,1,86.76,0,8,8,0,0,0,7.23,4.57H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM80,144a24,24,0,1,1,24,24A24,24,0,0,1,80,144Zm136,56H159.43a64.39,64.39,0,0,0-28.83-26.16,40,40,0,1,0-53.2,0A64.39,64.39,0,0,0,48.57,200H40V56H216ZM56,96V80a8,8,0,0,1,8-8H192a8,8,0,0,1,8,8v96a8,8,0,0,1-8,8H176a8,8,0,0,1,0-16h8V88H72v8a8,8,0,0,1-16,0Z"/>`
  ]
]);
a.styles = Z`
    :host {
      display: contents;
    }
  `;
H([
  h({ type: String, reflect: !0 })
], a.prototype, "size", 2);
H([
  h({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
H([
  h({ type: String, reflect: !0 })
], a.prototype, "color", 2);
H([
  h({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = H([
  m("ph-chalkboard-teacher")
], a);
export {
  a as PhChalkboardTeacher
};
