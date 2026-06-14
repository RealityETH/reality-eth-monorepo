import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as n } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, u = Object.getOwnPropertyDescriptor, l = (a, o, p, s) => {
  for (var e = s > 1 ? void 0 : s ? u(o, p) : o, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (s ? m(o, p, e) : m(e)) || e);
  return s && e && g(o, p, e), e;
};
let t = class extends Z {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return n`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((a = this.weight) != null ? a : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M198.71,57.29A100,100,0,1,0,57.29,198.71,100,100,0,1,0,198.71,57.29Zm-5.66,135.76A92,92,0,1,1,220,128,91.37,91.37,0,0,1,193.05,193.05ZM162.83,85.17a4,4,0,0,1,0,5.66l-32,32a4,4,0,0,1-5.66,0l-32-32a4,4,0,0,1,5.66-5.66L128,114.34l29.17-29.17A4,4,0,0,1,162.83,85.17Zm0,56a4,4,0,0,1,0,5.66l-32,32a4,4,0,0,1-5.66,0l-32-32a4,4,0,0,1,5.66-5.66L128,170.34l29.17-29.17A4,4,0,0,1,162.83,141.17Z"/>`
  ],
  [
    "light",
    r`<path d="M200.12,55.87A102,102,0,0,0,55.87,200.12,102,102,0,1,0,200.12,55.87Zm-8.48,135.77a90,90,0,1,1,0-127.28A90.1,90.1,0,0,1,191.64,191.64ZM164.24,83.76a6,6,0,0,1,0,8.48l-32,32a6,6,0,0,1-8.48,0l-32-32a6,6,0,0,1,8.48-8.48L128,111.51l27.76-27.75A6,6,0,0,1,164.24,83.76Zm0,56a6,6,0,0,1,0,8.48l-32,32a6,6,0,0,1-8.48,0l-32-32a6,6,0,0,1,8.48-8.48L128,167.51l27.76-27.75A6,6,0,0,1,164.24,139.76Z"/>`
  ],
  [
    "regular",
    r`<path d="M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM190.23,190.23a88,88,0,1,1,0-124.46A88.11,88.11,0,0,1,190.23,190.23ZM165.66,82.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L128,108.69l26.34-26.35A8,8,0,0,1,165.66,82.34Zm0,56a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L128,164.69l26.34-26.35A8,8,0,0,1,165.66,138.34Z"/>`
  ],
  [
    "bold",
    r`<path d="M204.4,51.6a108,108,0,1,0,0,152.8A108.16,108.16,0,0,0,204.4,51.6Zm-17,135.82a84,84,0,1,1,0-118.84A84.12,84.12,0,0,1,187.42,187.42ZM168.5,79.49a12,12,0,0,1,0,17l-32,32a12,12,0,0,1-17,0l-32-32a12,12,0,1,1,17-17L128,103l23.53-23.53A12,12,0,0,1,168.5,79.49Zm0,56a12,12,0,0,1,0,17l-32,32a12,12,0,0,1-17,0l-32-32a12,12,0,1,1,17-17L128,159l23.53-23.52A12,12,0,0,1,168.5,135.52Z"/>`
  ],
  [
    "fill",
    r`<path d="M201.57,54.43A104.15,104.15,0,1,0,232,128,104.17,104.17,0,0,0,201.57,54.43Zm-35.9,95.24-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,1,1,11.32-11.32L128,164.71l26.35-26.36a8,8,0,1,1,11.32,11.32Zm0-56-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,1,1,11.32-11.32L128,108.68l26.35-26.36a8,8,0,1,1,11.32,11.32Z"/>`
  ],
  [
    "duotone",
    r`<path d="M195.88,195.88a96,96,0,1,1,0-135.76A96,96,0,0,1,195.88,195.88Z" opacity="0.2"/><path d="M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM190.23,190.23a88,88,0,1,1,0-124.46A88.11,88.11,0,0,1,190.23,190.23ZM165.66,82.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L128,108.69l26.34-26.35A8,8,0,0,1,165.66,82.34Zm0,56a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0l-32-32a8,8,0,0,1,11.32-11.32L128,164.69l26.34-26.35A8,8,0,0,1,165.66,138.34Z"/>`
  ]
]);
t.styles = A`
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
  c("ph-caret-circle-double-down")
], t);
export {
  t as PhCaretCircleDoubleDown
};
