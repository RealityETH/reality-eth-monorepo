import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as a, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, u = Object.getOwnPropertyDescriptor, s = (e, l, p, o) => {
  for (var r = o > 1 ? void 0 : o ? u(l, p) : l, h = e.length - 1, L; h >= 0; h--)
    (L = e[h]) && (r = (o ? L(l, p, r) : L(r)) || r);
  return o && r && A(l, p, r), r;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return n`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    a`<path d="M244,208a4,4,0,0,1-4,4H192a4,4,0,0,1-3.2-6.4L232,148A20,20,0,0,0,228,120,20,20,0,0,0,200,124a20.23,20.23,0,0,0-2.89,5.37,4,4,0,0,1-7.55-2.66,28.34,28.34,0,0,1,4-7.52,28,28,0,0,1,44.72,33.7L200,204h40A4,4,0,0,1,244,208ZM146.62,53a4,4,0,0,0-5.64.4L92,109.89,43,53.38a4,4,0,1,0-6,5.24L86.71,116,37,173.38a4,4,0,1,0,6,5.24l49-56.51,49,56.51a4,4,0,0,0,6-5.24L97.29,116,147,58.62A4,4,0,0,0,146.62,53Z"/>`
  ],
  [
    "light",
    a`<path d="M246,208a6,6,0,0,1-6,6H192a6,6,0,0,1-4.8-9.6l43.17-57.56A18,18,0,1,0,199,130a6,6,0,1,1-11.31-4A30,30,0,1,1,240,154.06L204,202h36A6,6,0,0,1,246,208ZM147.93,51.47a6,6,0,0,0-8.46.6L92,106.84,44.53,52.07a6,6,0,1,0-9.06,7.86L84.06,116,35.47,172.07a6,6,0,1,0,9.06,7.86L92,125.16l47.47,54.77a6,6,0,0,0,9.06-7.86L99.94,116l48.59-56.07A6,6,0,0,0,147.93,51.47Z"/>`
  ],
  [
    "regular",
    a`<path d="M248,208a8,8,0,0,1-8,8H192a8,8,0,0,1-6.4-12.8l43.17-57.56a16,16,0,1,0-27.86-15,8,8,0,0,1-15.09-5.34,32.18,32.18,0,0,1,4.63-8.59,32,32,0,0,1,51.11,38.52L208,200h32A8,8,0,0,1,248,208ZM149.24,50a8,8,0,0,0-11.29.81L92,103.78l-45.95-53A8,8,0,0,0,34,61.24L81.41,116,34,170.76a8,8,0,0,0,12.1,10.48l46-53,45.95,53a8,8,0,1,0,12.1-10.48L102.59,116l47.46-54.76A8,8,0,0,0,149.24,50Z"/>`
  ],
  [
    "bold",
    a`<path d="M252,208a12,12,0,0,1-12,12H192a12,12,0,0,1-9.6-19.2l43.17-57.56a12,12,0,0,0-2.35-16.82A12,12,0,0,0,204.68,132a12,12,0,0,1-22.63-8,36.3,36.3,0,0,1,5.2-9.67,36,36,0,0,1,57.5,43.34L216,196h24A12,12,0,0,1,252,208ZM151.86,46.93a12,12,0,0,0-16.93,1.21L92,97.68,49.07,48.14A12,12,0,0,0,30.93,63.86L76.12,116,30.93,168.14a12,12,0,0,0,18.14,15.72L92,134.32l42.93,49.54a12,12,0,1,0,18.14-15.72L107.88,116l45.19-52.14A12,12,0,0,0,151.86,46.93Z"/>`
  ],
  [
    "fill",
    a`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM126.55,147.41a8,8,0,1,1-13.1,9.18L92,126,70.55,156.59a8,8,0,1,1-13.1-9.18L82.23,112,57.45,76.59a8,8,0,0,1,13.1-9.18L92,98.05l21.45-30.64a8,8,0,0,1,13.1,9.18L101.77,112ZM192,192H152a8,8,0,0,1-6.4-12.8l36-48a12,12,0,1,0-19.15-14.46,13.06,13.06,0,0,0-2.58,4.81,8,8,0,1,1-15.68-3.18,28.17,28.17,0,1,1,50.2,22.44L168,176h24a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    a`<path d="M240,72V208H56a16,16,0,0,1-16-16V56H224A16,16,0,0,1,240,72Z" opacity="0.2"/><path d="M248,208a8,8,0,0,1-8,8H192a8,8,0,0,1-6.4-12.8l43.17-57.56a16,16,0,1,0-27.86-15,8,8,0,0,1-15.09-5.34,32.18,32.18,0,0,1,4.63-8.59,32,32,0,0,1,51.11,38.52L208,200h32A8,8,0,0,1,248,208ZM149.24,50a8,8,0,0,0-11.29.81L92,103.78l-45.95-53A8,8,0,0,0,34,61.24L81.41,116,34,170.76a8,8,0,0,0,12.1,10.48l46-53,45.95,53a8,8,0,1,0,12.1-10.48L102.59,116l47.46-54.76A8,8,0,0,0,149.24,50Z"/>`
  ]
]);
t.styles = g`
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
  c("ph-text-subscript")
], t);
export {
  t as PhTextSubscript
};
