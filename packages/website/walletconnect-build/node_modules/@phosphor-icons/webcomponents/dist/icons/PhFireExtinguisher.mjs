import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as v } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, f = Object.getOwnPropertyDescriptor, s = (r, o, h, V) => {
  for (var a = V > 1 ? void 0 : V ? f(o, h) : o, l = r.length - 1, p; l >= 0; l--)
    (p = r[l]) && (a = (V ? p(o, h, a) : p(a)) || a);
  return V && a && g(o, h, a), a;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return v`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((r = this.weight) != null ? r : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M217.15,52.17l-70.34-21.1,39-19.49a4,4,0,1,0-3.58-7.16L135,28a76.07,76.07,0,0,0-75,76V208a4,4,0,0,0,8,0V172H92v60a12,12,0,0,0,12,12h64a12,12,0,0,0,12-12V104a44.06,44.06,0,0,0-40-43.81V37.38l74.85,22.45A3.82,3.82,0,0,0,216,60a4,4,0,0,0,1.15-7.83ZM68,164V104a68.08,68.08,0,0,1,64-67.87V60.19A44.06,44.06,0,0,0,92,104v60Zm100,72H104a4,4,0,0,1-4-4V172h72v60A4,4,0,0,1,168,236Zm4-132v60H100V104a36,36,0,0,1,72,0Z"/>`
  ],
  [
    "light",
    e`<path d="M217.72,50.25,152.21,30.6l34.47-17.23a6,6,0,1,0-5.36-10.74L134.51,26A78.07,78.07,0,0,0,58,104V208a6,6,0,0,0,12,0V174H90v58a14,14,0,0,0,14,14h64a14,14,0,0,0,14-14V104a46.07,46.07,0,0,0-40-45.6V40.07l72.27,21.68A6.14,6.14,0,0,0,216,62a6,6,0,0,0,1.72-11.75ZM70,162V104a66.07,66.07,0,0,1,60-65.71V58.4A46.07,46.07,0,0,0,90,104v58Zm98,72H104a2,2,0,0,1-2-2V174h68v58A2,2,0,0,1,168,234Zm2-130v58H102V104a34,34,0,0,1,68,0Z"/>`
  ],
  [
    "regular",
    e`<path d="M218.3,48.34l-60.68-18.2,30-15A8,8,0,0,0,180.42.85L134,24.05a80.08,80.08,0,0,0-78,80V208a8,8,0,0,0,16,0V176H88v56a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V104a48.07,48.07,0,0,0-40-47.32V42.75l69.7,20.91a8,8,0,1,0,4.6-15.32ZM72,160V104a64.07,64.07,0,0,1,56-63.48V56.68A48.07,48.07,0,0,0,88,104v56Zm96,72H104V176h64v56Zm0-128v56H104V104a32,32,0,0,1,64,0Z"/>`
  ],
  [
    "bold",
    e`<path d="M219.45,44.51,170.07,29.7,185,22.93A12,12,0,1,0,175,1.08l-41.78,19A84.09,84.09,0,0,0,52,104V208a12,12,0,0,0,24,0V180H92v52a20,20,0,0,0,20,20h48a20,20,0,0,0,20-20V104a44.08,44.08,0,0,0-32-42.32V48.13L212.55,67.5A11.81,11.81,0,0,0,216,68a12,12,0,0,0,3.45-23.49ZM76,156V104a60.1,60.1,0,0,1,48-58.79V61.68A44.06,44.06,0,0,0,92,104v52Zm40,72V180h40v48Zm40-124v52H116V104a20,20,0,0,1,40,0Z"/>`
  ],
  [
    "fill",
    e`<path d="M218.3,48.34l-60.68-18.2,30-15A8,8,0,0,0,180.42.85L134,24.05a80.08,80.08,0,0,0-78,80V208a8,8,0,0,0,16,0V176H88v56a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V104a48.07,48.07,0,0,0-40-47.32V42.75l69.7,20.91a8,8,0,1,0,4.6-15.32ZM72,160V104a64.07,64.07,0,0,1,56-63.48V56.68A48.07,48.07,0,0,0,88,104v56Zm96-56v56H104V104a32,32,0,0,1,64,0Z"/>`
  ],
  [
    "duotone",
    e`<path d="M176,168v64a8,8,0,0,1-8,8H104a8,8,0,0,1-8-8V168Z" opacity="0.2"/><path d="M218.3,48.34l-60.68-18.2,30-15A8,8,0,0,0,180.42.85L134,24.05a80.08,80.08,0,0,0-78,80V208a8,8,0,0,0,16,0V176H88v56a16,16,0,0,0,16,16h64a16,16,0,0,0,16-16V104a48.07,48.07,0,0,0-40-47.32V42.75l69.7,20.91a8,8,0,1,0,4.6-15.32ZM88,104v56H72V104a64.07,64.07,0,0,1,56-63.48V56.68A48.07,48.07,0,0,0,88,104Zm80,128H104V176h64Zm0-128v56H104V104a32,32,0,0,1,64,0Z"/>`
  ]
]);
t.styles = Z`
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
  n("ph-fire-extinguisher")
], t);
export {
  t as PhFireExtinguisher
};
