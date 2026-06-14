import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as L } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as u } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, f = Object.getOwnPropertyDescriptor, l = (e, o, i, s) => {
  for (var a = s > 1 ? void 0 : s ? f(o, i) : o, p = e.length - 1, h; p >= 0; p--)
    (h = e[p]) && (a = (s ? h(o, i, a) : h(a)) || a);
  return s && a && c(o, i, a), a;
};
let t = class extends n {
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
      ${t.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M232.49,76.2,179.8,23.51a12,12,0,0,0-17,0L23.51,162.83a12,12,0,0,0,0,17L76.2,232.49a12,12,0,0,0,17,0L232.49,93.17A12,12,0,0,0,232.49,76.2Zm-5.66,11.31L87.51,226.83a4,4,0,0,1-5.65,0L29.17,174.14a4,4,0,0,1,0-5.65L64,133.66l29.17,29.17a4,4,0,1,0,5.66-5.66L69.65,128,96,101.66l29.17,29.17a4,4,0,0,0,5.66-5.66L101.65,96,128,69.66l29.17,29.17a4,4,0,1,0,5.66-5.66L133.66,64l34.83-34.83a4,4,0,0,1,5.65,0l52.69,52.69A4,4,0,0,1,226.83,87.51Z"/>`
  ],
  [
    "light",
    r`<path d="M233.91,74.79,181.22,22.1a14,14,0,0,0-19.8,0L22.09,161.41a14,14,0,0,0,0,19.8L74.78,233.9a14,14,0,0,0,19.8,0L233.91,94.59A14,14,0,0,0,233.91,74.79ZM225.42,86.1,86.1,225.41h0a2,2,0,0,1-2.83,0L30.58,172.73a2,2,0,0,1,0-2.83L64,136.48l27.76,27.76a6,6,0,1,0,8.48-8.48L72.48,128,96,104.48l27.76,27.76a6,6,0,0,0,8.48-8.48L104.48,96,128,72.49l27.76,27.75a6,6,0,0,0,8.48-8.48L136.49,64,169.9,30.59a2,2,0,0,1,2.83,0l52.69,52.68A2,2,0,0,1,225.42,86.1Z"/>`
  ],
  [
    "regular",
    r`<path d="M235.32,73.37,182.63,20.69a16,16,0,0,0-22.63,0L20.68,160a16,16,0,0,0,0,22.63l52.69,52.68a16,16,0,0,0,22.63,0L235.32,96A16,16,0,0,0,235.32,73.37ZM84.68,224,32,171.31l32-32,26.34,26.35a8,8,0,0,0,11.32-11.32L75.31,128,96,107.31l26.34,26.35a8,8,0,0,0,11.32-11.32L107.31,96,128,75.31l26.34,26.35a8,8,0,0,0,11.32-11.32L139.31,64l32-32L224,84.69Z"/>`
  ],
  [
    "bold",
    r`<path d="M238.15,70.54,185.46,17.86a20,20,0,0,0-28.29,0L17.85,157.17a20,20,0,0,0,0,28.29l52.69,52.68a20,20,0,0,0,28.29,0L238.15,98.83A20,20,0,0,0,238.15,70.54ZM84.68,218.34l-47-47L64,145l23.52,23.52a12,12,0,0,0,17-17L81,128l15-15,23.51,23.52a12,12,0,0,0,17-17L113,96l15-15,23.52,23.52a12,12,0,0,0,17-17L145,64l26.35-26.34,47,47Z"/>`
  ],
  [
    "fill",
    r`<path d="M235.32,96,96,235.31a16,16,0,0,1-22.63,0L20.68,182.63a16,16,0,0,1,0-22.63l29.17-29.17a4,4,0,0,1,5.66,0l34.83,34.83a8,8,0,0,0,11.71-.43,8.18,8.18,0,0,0-.6-11.09L66.82,119.51a4,4,0,0,1,0-5.65l15-15a4,4,0,0,1,5.66,0l34.83,34.83a8,8,0,0,0,11.71-.43,8.18,8.18,0,0,0-.6-11.09L98.83,87.51a4,4,0,0,1,0-5.65l15-15a4,4,0,0,1,5.65,0l34.83,34.83a8,8,0,0,0,11.72-.43,8.18,8.18,0,0,0-.61-11.09L130.83,55.51a4,4,0,0,1,0-5.65L160,20.69a16,16,0,0,1,22.63,0l52.69,52.68A16,16,0,0,1,235.32,96Z"/>`
  ],
  [
    "duotone",
    r`<path d="M229.66,90.34,90.34,229.66a8,8,0,0,1-11.31,0L26.34,177a8,8,0,0,1,0-11.31L165.66,26.34a8,8,0,0,1,11.31,0L229.66,79A8,8,0,0,1,229.66,90.34Z" opacity="0.2"/><path d="M235.32,73.37,182.63,20.69a16,16,0,0,0-22.63,0L20.68,160a16,16,0,0,0,0,22.63l52.69,52.68a16,16,0,0,0,22.63,0L235.32,96A16,16,0,0,0,235.32,73.37ZM84.68,224,32,171.31l32-32,26.34,26.35a8,8,0,0,0,11.32-11.32L75.31,128,96,107.31l26.34,26.35a8,8,0,0,0,11.32-11.32L107.31,96,128,75.31l26.34,26.35a8,8,0,0,0,11.32-11.32L139.31,64l32-32L224,84.69Z"/>`
  ]
]);
t.styles = u`
    :host {
      display: contents;
    }
  `;
l([
  L({ type: String, reflect: !0 })
], t.prototype, "size", 2);
l([
  L({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
l([
  L({ type: String, reflect: !0 })
], t.prototype, "color", 2);
l([
  L({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = l([
  g("ph-ruler")
], t);
export {
  t as PhRuler
};
