import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as H } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, f = Object.getOwnPropertyDescriptor, a = (l, o, i, s) => {
  for (var r = s > 1 ? void 0 : s ? f(o, i) : o, h = l.length - 1, m; h >= 0; h--)
    (m = l[h]) && (r = (s ? m(o, i, r) : m(r)) || r);
  return s && r && c(o, i, r), r;
};
let t = class extends H {
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
    e`<path d="M242.07,49.48A12,12,0,0,0,232,44H88.81a12,12,0,0,0-11,7.08l-64.8,144A12,12,0,0,0,24,212H167.19a12,12,0,0,0,10.95-7.08l64.8-144A12,12,0,0,0,242.07,49.48Zm-6.43,8.16-64.8,144a4,4,0,0,1-3.65,2.36H24a4,4,0,0,1-3.65-5.64l64.8-144A4,4,0,0,1,88.81,52H232a4,4,0,0,1,3.65,5.64Z"/>`
  ],
  [
    "light",
    e`<path d="M243.75,48.4A14,14,0,0,0,232,42H88.81A14,14,0,0,0,76,50.25l-64.8,144A14,14,0,0,0,24,214H167.19A14,14,0,0,0,180,205.75l64.8-144A14,14,0,0,0,243.75,48.4Zm-9.93,8.42-64.8,144a2,2,0,0,1-1.83,1.18H24a2,2,0,0,1-1.83-2.82L87,55.18A2,2,0,0,1,88.81,54H232a2,2,0,0,1,1.83,2.82Z"/>`
  ],
  [
    "regular",
    e`<path d="M245.43,47.31A15.94,15.94,0,0,0,232,40H88.81a16,16,0,0,0-14.59,9.43l-64.8,144A16,16,0,0,0,24,216H167.19a16,16,0,0,0,14.59-9.43l64.8-144A16,16,0,0,0,245.43,47.31ZM167.19,200H24L88.81,56H232Z"/>`
  ],
  [
    "bold",
    e`<path d="M248.78,45.14A19.92,19.92,0,0,0,232,36H88.81A20,20,0,0,0,70.57,47.79l-64.8,144A20,20,0,0,0,24,220H167.19a20,20,0,0,0,18.24-11.79l64.8-144A19.9,19.9,0,0,0,248.78,45.14ZM164.6,196H30.2L91.4,60H225.8Z"/>`
  ],
  [
    "fill",
    e`<path d="M246.58,62.57l-64.8,144A16,16,0,0,1,167.19,216H24A16,16,0,0,1,9.42,193.43l64.8-144A16,16,0,0,1,88.81,40H232a16,16,0,0,1,14.59,22.57Z"/>`
  ],
  [
    "duotone",
    e`<path d="M239.29,59.28l-64.8,144a8,8,0,0,1-7.3,4.72H24a8,8,0,0,1-7.3-11.28l64.8-144A8,8,0,0,1,88.81,48H232A8,8,0,0,1,239.29,59.28Z" opacity="0.2"/><path d="M245.43,47.31A15.94,15.94,0,0,0,232,40H88.81a16,16,0,0,0-14.59,9.43l-64.8,144A16,16,0,0,0,24,216H167.19a16,16,0,0,0,14.59-9.43l64.8-144A16,16,0,0,0,245.43,47.31ZM167.19,200H24L88.81,56H232Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
a([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  n("ph-parallelogram")
], t);
export {
  t as PhParallelogram
};
