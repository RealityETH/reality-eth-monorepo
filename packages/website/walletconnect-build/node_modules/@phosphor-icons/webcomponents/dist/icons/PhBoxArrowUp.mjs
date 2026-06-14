import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, M = Object.getOwnPropertyDescriptor, l = (e, o, i, s) => {
  for (var a = s > 1 ? void 0 : s ? M(o, i) : o, V = e.length - 1, h; V >= 0; V--)
    (h = e[V]) && (a = (s ? h(o, i, a) : h(a)) || a);
  return s && a && A(o, i, a), a;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return H`<svg
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
    r`<path d="M219.58,70.21l-16-32A4,4,0,0,0,200,36H56a4,4,0,0,0-3.58,2.21l-16,32A4,4,0,0,0,36,72V208a12,12,0,0,0,12,12H208a12,12,0,0,0,12-12V72A4,4,0,0,0,219.58,70.21ZM58.47,44H197.53l12,24H46.47ZM208,212H48a4,4,0,0,1-4-4V76H212V208A4,4,0,0,1,208,212Zm-45.17-78.83a4,4,0,0,1-5.66,5.66L132,113.66V184a4,4,0,0,1-8,0V113.66L98.83,138.83a4,4,0,0,1-5.66-5.66l32-32a4,4,0,0,1,5.66,0Z"/>`
  ],
  [
    "light",
    r`<path d="M221.37,69.32l-16-32A6,6,0,0,0,200,34H56a6,6,0,0,0-5.37,3.32l-16,32A6.07,6.07,0,0,0,34,72V208a14,14,0,0,0,14,14H208a14,14,0,0,0,14-14V72A6.07,6.07,0,0,0,221.37,69.32ZM59.71,46H196.29l10,20H49.71ZM208,210H48a2,2,0,0,1-2-2V78H210V208A2,2,0,0,1,208,210Zm-43.76-78.24a6,6,0,1,1-8.48,8.48L134,118.49V184a6,6,0,0,1-12,0V118.49l-21.76,21.75a6,6,0,0,1-8.48-8.48l32-32a6,6,0,0,1,8.48,0Z"/>`
  ],
  [
    "regular",
    r`<path d="M223.16,68.42l-16-32A8,8,0,0,0,200,32H56a8,8,0,0,0-7.16,4.42l-16,32A8.08,8.08,0,0,0,32,72V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V72A8.08,8.08,0,0,0,223.16,68.42ZM60.94,48H195.06l8,16H52.94ZM208,208H48V80H208V208Zm-42.34-77.66a8,8,0,0,1-11.32,11.32L136,123.31V184a8,8,0,0,1-16,0V123.31l-18.34,18.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0Z"/>`
  ],
  [
    "bold",
    r`<path d="M226.73,66.63l-16-32A12,12,0,0,0,200,28H56a12,12,0,0,0-10.73,6.63l-16,32A12,12,0,0,0,28,72V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V72A12,12,0,0,0,226.73,66.63ZM192.58,52l6,12H57.42l6-12ZM52,204V88H204V204Zm116.49-68.49a12,12,0,0,1-17,17L140,141v39a12,12,0,0,1-24,0V141l-11.51,11.52a12,12,0,0,1-17-17l32-32a12,12,0,0,1,17,0Z"/>`
  ],
  [
    "fill",
    r`<path d="M223.16,68.42l-16-32A8,8,0,0,0,200,32H56a8,8,0,0,0-7.16,4.42l-16,32A8.08,8.08,0,0,0,32,72V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V72A8.08,8.08,0,0,0,223.16,68.42Zm-57.5,73.24a8,8,0,0,1-11.32,0L136,123.31V184a8,8,0,0,1-16,0V123.31l-18.34,18.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0l32,32A8,8,0,0,1,165.66,141.66ZM52.94,64l8-16H195.06l8,16Z"/>`
  ],
  [
    "duotone",
    r`<path d="M216,72V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V72Z" opacity="0.2"/><path d="M223.16,68.42l-16-32A8,8,0,0,0,200,32H56a8,8,0,0,0-7.16,4.42l-16,32A8.08,8.08,0,0,0,32,72V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V72A8.08,8.08,0,0,0,223.16,68.42ZM60.94,48H195.06l8,16H52.94ZM208,208H48V80H208V208Zm-42.34-77.66a8,8,0,0,1-11.32,11.32L136,123.31V184a8,8,0,0,1-16,0V123.31l-18.34,18.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0Z"/>`
  ]
]);
t.styles = n`
    :host {
      display: contents;
    }
  `;
l([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
l([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
l([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
l([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = l([
  Z("ph-box-arrow-up")
], t);
export {
  t as PhBoxArrowUp
};
