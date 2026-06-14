import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as p } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as A } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as m } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, g = Object.getOwnPropertyDescriptor, V = (r, o, s, Z) => {
  for (var t = Z > 1 ? void 0 : Z ? g(o, s) : o, v = r.length - 1, l; v >= 0; v--)
    (l = r[v]) && (t = (Z ? l(o, s, t) : l(t)) || t);
  return Z && t && M(o, s, t), t;
};
let a = class extends A {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return p`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${a.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M132,16V48a4,4,0,0,1-8,0V16a4,4,0,0,1,8,0Zm44,44a4,4,0,0,0-4,4V96a4,4,0,0,0,8,0V64A4,4,0,0,0,176,60ZM128,204a4,4,0,0,0-4,4v32a4,4,0,0,0,8,0V208A4,4,0,0,0,128,204Zm0-120a4,4,0,0,0-4,4v80a4,4,0,0,0,8,0V88A4,4,0,0,0,128,84ZM80,60a4,4,0,0,0-4,4v56a4,4,0,0,0,8,0V64A4,4,0,0,0,80,60Zm96,72a4,4,0,0,0-4,4v56a4,4,0,0,0,8,0V136A4,4,0,0,0,176,132ZM32,108a4,4,0,0,0-4,4v32a4,4,0,0,0,8,0V112A4,4,0,0,0,32,108Zm48,48a4,4,0,0,0-4,4v32a4,4,0,0,0,8,0V160A4,4,0,0,0,80,156Zm144-48a4,4,0,0,0-4,4v32a4,4,0,0,0,8,0V112A4,4,0,0,0,224,108Z"/>`
  ],
  [
    "light",
    e`<path d="M134,16V48a6,6,0,0,1-12,0V16a6,6,0,0,1,12,0Zm42,42a6,6,0,0,0-6,6V96a6,6,0,0,0,12,0V64A6,6,0,0,0,176,58ZM128,202a6,6,0,0,0-6,6v32a6,6,0,0,0,12,0V208A6,6,0,0,0,128,202Zm0-120a6,6,0,0,0-6,6v80a6,6,0,0,0,12,0V88A6,6,0,0,0,128,82ZM80,58a6,6,0,0,0-6,6v56a6,6,0,0,0,12,0V64A6,6,0,0,0,80,58Zm96,72a6,6,0,0,0-6,6v56a6,6,0,0,0,12,0V136A6,6,0,0,0,176,130ZM32,106a6,6,0,0,0-6,6v32a6,6,0,0,0,12,0V112A6,6,0,0,0,32,106Zm48,48a6,6,0,0,0-6,6v32a6,6,0,0,0,12,0V160A6,6,0,0,0,80,154Zm144-48a6,6,0,0,0-6,6v32a6,6,0,0,0,12,0V112A6,6,0,0,0,224,106Z"/>`
  ],
  [
    "regular",
    e`<path d="M136,16V48a8,8,0,0,1-16,0V16a8,8,0,0,1,16,0Zm40,40a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V64A8,8,0,0,0,176,56ZM128,200a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V208A8,8,0,0,0,128,200Zm0-120a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,128,80ZM80,56a8,8,0,0,0-8,8v56a8,8,0,0,0,16,0V64A8,8,0,0,0,80,56Zm96,72a8,8,0,0,0-8,8v56a8,8,0,0,0,16,0V136A8,8,0,0,0,176,128ZM32,104a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V112A8,8,0,0,0,32,104Zm48,48a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V160A8,8,0,0,0,80,152Zm144-48a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V112A8,8,0,0,0,224,104Z"/>`
  ],
  [
    "bold",
    e`<path d="M140,16V48a12,12,0,0,1-24,0V16a12,12,0,0,1,24,0Zm36,36a12,12,0,0,0-12,12V96a12,12,0,0,0,24,0V64A12,12,0,0,0,176,52ZM128,196a12,12,0,0,0-12,12v32a12,12,0,0,0,24,0V208A12,12,0,0,0,128,196Zm0-120a12,12,0,0,0-12,12v80a12,12,0,0,0,24,0V88A12,12,0,0,0,128,76ZM80,52A12,12,0,0,0,68,64v56a12,12,0,0,0,24,0V64A12,12,0,0,0,80,52Zm96,72a12,12,0,0,0-12,12v56a12,12,0,0,0,24,0V136A12,12,0,0,0,176,124ZM32,100a12,12,0,0,0-12,12v32a12,12,0,0,0,24,0V112A12,12,0,0,0,32,100Zm48,48a12,12,0,0,0-12,12v32a12,12,0,0,0,24,0V160A12,12,0,0,0,80,148Zm144-48a12,12,0,0,0-12,12v32a12,12,0,0,0,24,0V112A12,12,0,0,0,224,100Z"/>`
  ],
  [
    "fill",
    e`<path d="M243.32,116.68l-104-104a16,16,0,0,0-22.64,0l-104,104a16,16,0,0,0,0,22.64l104,104a16,16,0,0,0,22.64,0l104-104A16,16,0,0,0,243.32,116.68ZM56,136a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm40,40a8,8,0,0,1-16,0V160a8,8,0,0,1,16,0Zm0-48a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Zm40,88a8,8,0,0,1-16,0V200a8,8,0,0,1,16,0Zm0-48a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Zm0-112a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0Zm40,120a8,8,0,0,1-16,0V128a8,8,0,0,1,16,0Zm0-80a8,8,0,0,1-16,0V80a8,8,0,0,1,16,0Zm40,40a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "duotone",
    e`<path d="M224,144l-96,96L32,144V112l96-96,96,96v32Z" opacity="0.2"/><path d="M136,16V48a8,8,0,0,1-16,0V16a8,8,0,0,1,16,0Zm40,40a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V64A8,8,0,0,0,176,56ZM128,200a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V208A8,8,0,0,0,128,200Zm0-120a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,128,80ZM80,56a8,8,0,0,0-8,8v56a8,8,0,0,0,16,0V64A8,8,0,0,0,80,56Zm96,72a8,8,0,0,0-8,8v56a8,8,0,0,0,16,0V136A8,8,0,0,0,176,128ZM32,104a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V112A8,8,0,0,0,32,104Zm48,48a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V160A8,8,0,0,0,80,152Zm144-48a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V112A8,8,0,0,0,224,104Z"/>`
  ]
]);
a.styles = h`
    :host {
      display: contents;
    }
  `;
V([
  m({ type: String, reflect: !0 })
], a.prototype, "size", 2);
V([
  m({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
V([
  m({ type: String, reflect: !0 })
], a.prototype, "color", 2);
V([
  m({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = V([
  i("ph-google-podcasts-logo")
], a);
export {
  a as PhGooglePodcastsLogo
};
