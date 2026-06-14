import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as c } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var u = Object.defineProperty, V = Object.getOwnPropertyDescriptor, a = (l, o, p, s) => {
  for (var r = s > 1 ? void 0 : s ? V(o, p) : o, h = l.length - 1, n; h >= 0; h--)
    (n = l[h]) && (r = (s ? n(o, p, r) : n(r)) || r);
  return s && r && u(o, p, r), r;
};
let t = class extends c {
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
    e`<path d="M226.83,194.83l-32,32a4,4,0,0,1-5.66-5.66L214.34,196H80a4,4,0,0,1-4-4V49.66L50.83,74.83a4,4,0,0,1-5.66-5.66l32-32a4,4,0,0,1,5.66,0l32,32a4,4,0,0,1-5.66,5.66L84,49.66V188H214.34l-25.17-25.17a4,4,0,0,1,5.66-5.66l32,32A4,4,0,0,1,226.83,194.83Z"/>`
  ],
  [
    "light",
    e`<path d="M228.24,196.24l-32,32a6,6,0,0,1-8.48-8.48L209.51,198H80a6,6,0,0,1-6-6V54.49L52.24,76.24a6,6,0,0,1-8.48-8.48l32-32a6,6,0,0,1,8.48,0l32,32a6,6,0,1,1-8.48,8.48L86,54.49V186H209.51l-21.75-21.76a6,6,0,0,1,8.48-8.48l32,32A6,6,0,0,1,228.24,196.24Z"/>`
  ],
  [
    "regular",
    e`<path d="M229.66,197.66l-32,32a8,8,0,0,1-11.32-11.32L204.69,200H80a8,8,0,0,1-8-8V59.31L53.66,77.66A8,8,0,0,1,42.34,66.34l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L88,59.31V184H204.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,229.66,197.66Z"/>`
  ],
  [
    "bold",
    e`<path d="M232.49,200.49l-32,32a12,12,0,0,1-17-17L195,204H80a12,12,0,0,1-12-12V69L56.49,80.49a12,12,0,1,1-17-17l32-32a12,12,0,0,1,17,0l32,32a12,12,0,0,1-17,17L92,69V180H195l-11.52-11.51a12,12,0,0,1,17-17l32,32A12,12,0,0,1,232.49,200.49Z"/>`
  ],
  [
    "fill",
    e`<path d="M229.66,197.66l-32,32A8,8,0,0,1,184,224V200H80a8,8,0,0,1-8-8V80H48a8,8,0,0,1-5.66-13.66l32-32a8,8,0,0,1,11.32,0l32,32A8,8,0,0,1,112,80H88V184h96V160a8,8,0,0,1,13.66-5.66l32,32A8,8,0,0,1,229.66,197.66Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,56V192H80V40H208A16,16,0,0,1,224,56Z" opacity="0.2"/><path d="M229.66,197.66l-32,32a8,8,0,0,1-11.32-11.32L204.69,200H80a8,8,0,0,1-8-8V59.31L53.66,77.66A8,8,0,0,1,42.34,66.34l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32L88,59.31V184H204.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,229.66,197.66Z"/>`
  ]
]);
t.styles = f`
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
  g("ph-vector-two")
], t);
export {
  t as PhVectorTwo
};
