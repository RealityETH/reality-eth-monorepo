import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as H } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as v } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var n = Object.defineProperty, g = Object.getOwnPropertyDescriptor, o = (e, s, p, i) => {
  for (var t = i > 1 ? void 0 : i ? g(s, p) : s, h = e.length - 1, V; h >= 0; h--)
    (V = e[h]) && (t = (i ? V(s, p, t) : V(t)) || t);
  return i && t && n(s, p, t), t;
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
    r`<path d="M208,36H48A12,12,0,0,0,36,48V192a12,12,0,0,0,12,12H68v36a4,4,0,0,0,2.3,3.62A3.9,3.9,0,0,0,72,244a4,4,0,0,0,2.56-.93L121.45,204H165.1a12.06,12.06,0,0,0,7.69-2.78l42.89-35.75a11.93,11.93,0,0,0,4.32-9.22V48A12,12,0,0,0,208,36Zm4,120.25a4,4,0,0,1-1.44,3.08l-42.9,35.74a4,4,0,0,1-2.56.93H120a4,4,0,0,0-2.56.93L76,231.46V200a4,4,0,0,0-4-4H48a4,4,0,0,1-4-4V48a4,4,0,0,1,4-4H208a4,4,0,0,1,4,4ZM172,88v48a4,4,0,0,1-8,0V88a4,4,0,0,1,8,0Zm-48,0v48a4,4,0,0,1-8,0V88a4,4,0,0,1,8,0Z"/>`
  ],
  [
    "light",
    r`<path d="M208,34H48A14,14,0,0,0,34,48V192a14,14,0,0,0,14,14H66v34a6,6,0,0,0,9.84,4.61L122.17,206H165.1a14,14,0,0,0,9-3.25L217,167a14,14,0,0,0,5-10.76V48A14,14,0,0,0,208,34Zm2,122.25a2,2,0,0,1-.72,1.54l-42.9,35.75a2,2,0,0,1-1.28.46H120a6,6,0,0,0-3.84,1.39L78,227.19V200a6,6,0,0,0-6-6H48a2,2,0,0,1-2-2V48a2,2,0,0,1,2-2H208a2,2,0,0,1,2,2ZM174,88v48a6,6,0,0,1-12,0V88a6,6,0,0,1,12,0Zm-48,0v48a6,6,0,0,1-12,0V88a6,6,0,0,1,12,0Z"/>`
  ],
  [
    "regular",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V192a16,16,0,0,0,16,16H64v32a8,8,0,0,0,13.12,6.15L122.9,208h42.2a16,16,0,0,0,10.25-3.71l42.89-35.75A15.93,15.93,0,0,0,224,156.25V48A16,16,0,0,0,208,32Zm0,124.25L165.1,192H120a8,8,0,0,0-5.12,1.85L80,222.92V200a8,8,0,0,0-8-8H48V48H208ZM160,136V88a8,8,0,0,1,16,0v48a8,8,0,0,1-16,0Zm-48,0V88a8,8,0,0,1,16,0v48a8,8,0,0,1-16,0Z"/>`
  ],
  [
    "bold",
    r`<path d="M208,28H48A20,20,0,0,0,28,48V192a20,20,0,0,0,20,20H60v28a12,12,0,0,0,19.68,9.22L124.34,212H165.1a20.06,20.06,0,0,0,12.81-4.64l42.89-35.74a19.93,19.93,0,0,0,7.2-15.37V48A20,20,0,0,0,208,28Zm-4,126.38L163.66,188H120a12,12,0,0,0-7.68,2.78L84,214.38V200a12,12,0,0,0-12-12H52V52H204ZM156,136V88a12,12,0,0,1,24,0v48a12,12,0,0,1-24,0Zm-48,0V88a12,12,0,0,1,24,0v48a12,12,0,0,1-24,0Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V192a16,16,0,0,0,16,16H64v32a8,8,0,0,0,13.12,6.15L122.9,208h42.2a16,16,0,0,0,10.25-3.71l42.89-35.75A15.93,15.93,0,0,0,224,156.25V48A16,16,0,0,0,208,32ZM128,136a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Zm48,0a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,48V156.25a8,8,0,0,1-2.88,6.15l-42.89,35.75A8.05,8.05,0,0,1,165.1,200H120L72,240V200H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8H208A8,8,0,0,1,216,48Z" opacity="0.2"/><path d="M208,32H48A16,16,0,0,0,32,48V192a16,16,0,0,0,16,16H64v32a8,8,0,0,0,13.12,6.15L122.9,208h42.2a16,16,0,0,0,10.25-3.71l42.89-35.75A15.93,15.93,0,0,0,224,156.25V48A16,16,0,0,0,208,32Zm0,124.25L165.1,192H120a8,8,0,0,0-5.12,1.85L80,222.92V200a8,8,0,0,0-8-8H48V48H208ZM160,136V88a8,8,0,0,1,16,0v48a8,8,0,0,1-16,0Zm-48,0V88a8,8,0,0,1,16,0v48a8,8,0,0,1-16,0Z"/>`
  ]
]);
a.styles = Z`
    :host {
      display: contents;
    }
  `;
o([
  l({ type: String, reflect: !0 })
], a.prototype, "size", 2);
o([
  l({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
o([
  l({ type: String, reflect: !0 })
], a.prototype, "color", 2);
o([
  l({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = o([
  v("ph-twitch-logo")
], a);
export {
  a as PhTwitchLogo
};
