import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var v = Object.defineProperty, c = Object.getOwnPropertyDescriptor, o = (l, a, p, s) => {
  for (var r = s > 1 ? void 0 : s ? c(a, p) : a, h = l.length - 1, m; h >= 0; h--)
    (m = l[h]) && (r = (s ? m(a, p, r) : m(r)) || r);
  return s && r && v(a, p, r), r;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var l;
    return V`<svg
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
    e`<path d="M184,36H72A12,12,0,0,0,60,48V224a4,4,0,0,0,6.12,3.39L128,188.72l61.89,38.67A4,4,0,0,0,192,228a4.06,4.06,0,0,0,1.94-.5A4,4,0,0,0,196,224V48A12,12,0,0,0,184,36ZM72,44H184a4,4,0,0,1,4,4V168.78l-57.89-36.17a4,4,0,0,0-4.24,0L68,168.78V48A4,4,0,0,1,72,44Zm58.11,136.61a4,4,0,0,0-4.24,0L68,216.78V178.22l60-37.5,60,37.5v38.56Z"/>`
  ],
  [
    "light",
    e`<path d="M184,34H72A14,14,0,0,0,58,48V224a6,6,0,0,0,9.18,5.09l60.81-38,60.83,38A6,6,0,0,0,198,224V48A14,14,0,0,0,184,34ZM72,46H184a2,2,0,0,1,2,2V165.18l-54.83-34.27a6,6,0,0,0-6.36,0L70,165.17V48A2,2,0,0,1,72,46Zm59.17,132.91a6,6,0,0,0-6.36,0L70,213.17V179.33l58-36.25,58,36.25v33.84Z"/>`
  ],
  [
    "regular",
    e`<path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,16V161.57l-51.77-32.35a8,8,0,0,0-8.48,0L72,161.56V48ZM132.23,177.22a8,8,0,0,0-8.48,0L72,209.57V180.43l56-35,56,35v29.14Z"/>`
  ],
  [
    "bold",
    e`<path d="M184,28H72A20,20,0,0,0,52,48V224a12,12,0,0,0,18.36,10.18l57.63-36,57.65,36A12,12,0,0,0,204,224V48A20,20,0,0,0,184,28Zm-4,24V154.35l-45.65-28.53a12,12,0,0,0-12.72,0L76,154.35V52ZM134.35,173.82a12,12,0,0,0-12.72,0L76,202.35v-19.7l52-32.5,52,32.5v19.7Z"/>`
  ],
  [
    "fill",
    e`<path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32ZM132.23,177.22a8,8,0,0,0-8.48,0L72,209.57V180.43l56-35,56,35v29.14Z"/>`
  ],
  [
    "duotone",
    e`<path d="M192,176v48l-64-40L64,224V176l64-40Z" opacity="0.2"/><path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,16V161.57l-51.77-32.35a8,8,0,0,0-8.48,0L72,161.56V48ZM132.23,177.22a8,8,0,0,0-8.48,0L72,209.57V180.43l56-35,56,35v29.14Z"/>`
  ]
]);
t.styles = g`
    :host {
      display: contents;
    }
  `;
o([
  i({ type: String, reflect: !0 })
], t.prototype, "size", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
o([
  i({ type: String, reflect: !0 })
], t.prototype, "color", 2);
o([
  i({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = o([
  A("ph-bookmark")
], t);
export {
  t as PhBookmark
};
