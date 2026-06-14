import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as V } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as m } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as H } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, Z = Object.getOwnPropertyDescriptor, o = (e, h, p, s) => {
  for (var a = s > 1 ? void 0 : s ? Z(h, p) : h, l = e.length - 1, v; l >= 0; l--)
    (v = e[l]) && (a = (s ? v(h, p, a) : v(a)) || a);
  return s && a && g(h, p, a), a;
};
let t = class extends m {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var e;
    return V`<svg
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
    r`<path d="M148,56V176a4,4,0,0,1-8,0V120H44v56a4,4,0,0,1-8,0V56a4,4,0,0,1,8,0v56h96V56a4,4,0,0,1,8,0ZM252,184a4,4,0,0,1-4,4H236v20a4,4,0,0,1-8,0V188H176a4,4,0,0,1-3.16-6.46l56-72A4,4,0,0,1,236,112v68h12A4,4,0,0,1,252,184Zm-24-60.34L184.18,180H228Z"/>`
  ],
  [
    "light",
    r`<path d="M150,56V176a6,6,0,0,1-12,0V122H46v54a6,6,0,0,1-12,0V56a6,6,0,0,1,12,0v54h92V56a6,6,0,0,1,12,0ZM254,184a6,6,0,0,1-6,6H238v18a6,6,0,0,1-12,0V190H176a6,6,0,0,1-4.74-9.68l56-72A6,6,0,0,1,238,112v66h10A6,6,0,0,1,254,184Zm-28-54.51L188.27,178H226Z"/>`
  ],
  [
    "regular",
    r`<path d="M152,56V176a8,8,0,0,1-16,0V124H48v52a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0v52h88V56a8,8,0,0,1,16,0ZM256,184a8,8,0,0,1-8,8h-8v16a8,8,0,0,1-16,0V192H176a8,8,0,0,1-6.31-12.91l56-72A8,8,0,0,1,240,112v64h8A8,8,0,0,1,256,184Zm-32-48.68L192.36,176H224Z"/>`
  ],
  [
    "bold",
    r`<path d="M156,56V176a12,12,0,0,1-24,0V128H52v48a12,12,0,0,1-24,0V56a12,12,0,0,1,24,0v48h80V56a12,12,0,0,1,24,0ZM256,184a12,12,0,0,1-12,12v12a12,12,0,0,1-24,0V196H180a12,12,0,0,1-9.73-19l52-72A12,12,0,0,1,244,112v60A12,12,0,0,1,256,184Zm-36-34.89L203.47,172H220Z"/>`
  ],
  [
    "fill",
    r`<path d="M164.46,144,184,119.13V144ZM224,48V208a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32H208A16,16,0,0,1,224,48ZM128,80a8,8,0,0,0-16,0v32H72V80a8,8,0,0,0-16,0v80a8,8,0,0,0,16,0V128h40v32a8,8,0,0,0,16,0Zm84,72a8,8,0,0,0-8-8h-4V96a8,8,0,0,0-14.29-4.94l-44,56A8,8,0,0,0,148,160h36v16a8,8,0,0,0,16,0V160h4A8,8,0,0,0,212,152Z"/>`
  ],
  [
    "duotone",
    r`<path d="M248,72V192a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56H232A16,16,0,0,1,248,72Z" opacity="0.2"/><path d="M152,56V176a8,8,0,0,1-16,0V124H48v52a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0v52h88V56a8,8,0,0,1,16,0ZM256,184a8,8,0,0,1-8,8h-8v16a8,8,0,0,1-16,0V192H176a8,8,0,0,1-6.31-12.91l56-72A8,8,0,0,1,240,112v64h8A8,8,0,0,1,256,184Zm-32-48.68L192.36,176H224Z"/>`
  ]
]);
t.styles = H`
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
  n("ph-text-h-four")
], t);
export {
  t as PhTextHFour
};
