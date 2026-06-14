import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as H } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (e, s, V, h) => {
  for (var t = h > 1 ? void 0 : h ? g(s, V) : s, p = e.length - 1, l; p >= 0; p--)
    (l = e[p]) && (t = (h ? l(s, V, t) : l(t)) || t);
  return h && t && n(s, V, t), t;
};
let a = class extends H {
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
    r`<path d="M140,72V184a4,4,0,0,1-8,0V72a4,4,0,0,1,8,0Zm92-4H176a4,4,0,0,0-4,4V184a4,4,0,0,0,8,0V132h44a4,4,0,0,0,0-8H180V76h52a4,4,0,0,0,0-8ZM96,124H72a4,4,0,0,0,0,8H92v20a28,28,0,0,1-56,0V104A28,28,0,0,1,64,76c13,0,25,9,28.13,21a4,4,0,1,0,7.74-2C95.85,79.36,80.76,68,64,68a36,36,0,0,0-36,36v48a36,36,0,0,0,72,0V128A4,4,0,0,0,96,124Z"/>`
  ],
  [
    "light",
    r`<path d="M142,72V184a6,6,0,0,1-12,0V72a6,6,0,0,1,12,0Zm90-6H176a6,6,0,0,0-6,6V184a6,6,0,0,0,12,0V134h42a6,6,0,0,0,0-12H182V78h50a6,6,0,0,0,0-12ZM96,122H72a6,6,0,0,0,0,12H90v18a26,26,0,0,1-52,0V104A26,26,0,0,1,64,78c12.07,0,23.33,8.38,26.19,19.5a6,6,0,1,0,11.62-3C97.56,78,81.66,66,64,66a38,38,0,0,0-38,38v48a38,38,0,0,0,76,0V128A6,6,0,0,0,96,122Z"/>`
  ],
  [
    "regular",
    r`<path d="M144,72V184a8,8,0,0,1-16,0V72a8,8,0,0,1,16,0Zm88-8H176a8,8,0,0,0-8,8V184a8,8,0,0,0,16,0V136h40a8,8,0,0,0,0-16H184V80h48a8,8,0,0,0,0-16ZM96,120H72a8,8,0,0,0,0,16H88v16a24,24,0,0,1-48,0V104A24,24,0,0,1,64,80c11.19,0,21.61,7.74,24.25,18a8,8,0,0,0,15.5-4C99.27,76.62,82.56,64,64,64a40,40,0,0,0-40,40v48a40,40,0,0,0,80,0V128A8,8,0,0,0,96,120Z"/>`
  ],
  [
    "bold",
    r`<path d="M148,72V184a12,12,0,0,1-24,0V72a12,12,0,0,1,24,0Zm84,12a12,12,0,0,0,0-24H176a12,12,0,0,0-12,12V184a12,12,0,0,0,24,0V140h36a12,12,0,0,0,0-24H188V84ZM96,116H72a12,12,0,0,0,0,24H84v12a20,20,0,0,1-40,0V104A20,20,0,0,1,64,84c9.42,0,18.18,6.45,20.38,15a12,12,0,1,0,23.24-6C102.7,73.88,84.35,60,64,60a44.05,44.05,0,0,0-44,44v48a44,44,0,0,0,88,0V128A12,12,0,0,0,96,116Z"/>`
  ],
  [
    "fill",
    r`<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM112,144a32,32,0,0,1-64,0V112a32,32,0,0,1,55.85-21.33,8,8,0,1,1-11.92,10.66A16,16,0,0,0,64,112v32a16,16,0,0,0,32,0v-8H88a8,8,0,0,1,0-16h16a8,8,0,0,1,8,8Zm32,24a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Zm60-72H176v24h20a8,8,0,0,1,0,16H176v32a8,8,0,0,1-16,0V88a8,8,0,0,1,8-8h36a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M224,56V200a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V56A16,16,0,0,1,48,40H208A16,16,0,0,1,224,56Z" opacity="0.2"/><path d="M144,72V184a8,8,0,0,1-16,0V72a8,8,0,0,1,16,0Zm88-8H176a8,8,0,0,0-8,8V184a8,8,0,0,0,16,0V136h40a8,8,0,0,0,0-16H184V80h48a8,8,0,0,0,0-16ZM96,120H72a8,8,0,0,0,0,16H88v16a24,24,0,0,1-48,0V104A24,24,0,0,1,64,80c11.19,0,21.61,7.74,24.25,18a8,8,0,0,0,15.5-4C99.27,76.62,82.56,64,64,64a40,40,0,0,0-40,40v48a40,40,0,0,0,80,0V128A8,8,0,0,0,96,120Z"/>`
  ]
]);
a.styles = c`
    :host {
      display: contents;
    }
  `;
o([
  i({ type: String, reflect: !0 })
], a.prototype, "size", 2);
o([
  i({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
o([
  i({ type: String, reflect: !0 })
], a.prototype, "color", 2);
o([
  i({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = o([
  v("ph-gif")
], a);
export {
  a as PhGif
};
