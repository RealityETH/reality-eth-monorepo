import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as g } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var w = Object.defineProperty, d = Object.getOwnPropertyDescriptor, l = (o, s, p, a) => {
  for (var r = a > 1 ? void 0 : a ? d(s, p) : s, h = o.length - 1, n; h >= 0; h--)
    (n = o[h]) && (r = (a ? n(s, p, r) : n(r)) || r);
  return a && r && w(s, p, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var o;
    return g`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((o = this.weight) != null ? o : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M226.83,154.83l-48,48a4,4,0,0,1-5.66-5.66L214.34,156H128A100.11,100.11,0,0,1,28,56a4,4,0,0,1,8,0,92.1,92.1,0,0,0,92,92h86.34l-41.17-41.17a4,4,0,0,1,5.66-5.66l48,48A4,4,0,0,1,226.83,154.83Z"/>`
  ],
  [
    "light",
    e`<path d="M228.24,156.24l-48,48a6,6,0,0,1-8.48-8.48L209.51,158H128A102.12,102.12,0,0,1,26,56a6,6,0,0,1,12,0,90.1,90.1,0,0,0,90,90h81.51l-37.75-37.76a6,6,0,0,1,8.48-8.48l48,48A6,6,0,0,1,228.24,156.24Z"/>`
  ],
  [
    "regular",
    e`<path d="M229.66,157.66l-48,48a8,8,0,0,1-11.32-11.32L204.69,160H128A104.11,104.11,0,0,1,24,56a8,8,0,0,1,16,0,88.1,88.1,0,0,0,88,88h76.69l-34.35-34.34a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,229.66,157.66Z"/>`
  ],
  [
    "bold",
    e`<path d="M232.49,160.49l-48,48a12,12,0,0,1-17-17L195,164H128A108.12,108.12,0,0,1,20,56a12,12,0,0,1,24,0,84.09,84.09,0,0,0,84,84h67l-27.52-27.51a12,12,0,0,1,17-17l48,48A12,12,0,0,1,232.49,160.49Z"/>`
  ],
  [
    "fill",
    e`<path d="M229.66,157.66l-48,48A8,8,0,0,1,168,200V160H128A104.11,104.11,0,0,1,24,56a8,8,0,0,1,16,0,88.1,88.1,0,0,0,88,88h40V104a8,8,0,0,1,13.66-5.66l48,48A8,8,0,0,1,229.66,157.66Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,152l-48,48V104Z" opacity="0.2"/><path d="M229.66,146.34l-48-48A8,8,0,0,0,168,104v40H128A88.1,88.1,0,0,1,40,56a8,8,0,0,0-16,0A104.11,104.11,0,0,0,128,160h40v40a8,8,0,0,0,13.66,5.66l48-48A8,8,0,0,0,229.66,146.34ZM184,180.69V123.31L212.69,152Z"/>`
  ]
]);
t.styles = f`
    :host {
      display: contents;
    }
  `;
l([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
l([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
l([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
l([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = l([
  c("ph-arrow-bend-down-right")
], t);
export {
  t as PhArrowBendDownRight
};
