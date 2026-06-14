import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as H } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as Z } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as n } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as l } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var A = Object.defineProperty, c = Object.getOwnPropertyDescriptor, s = (e, o, p, i) => {
  for (var t = i > 1 ? void 0 : i ? c(o, p) : o, m = e.length - 1, h; m >= 0; m--)
    (h = e[m]) && (t = (i ? h(o, p, t) : h(t)) || t);
  return i && t && A(o, p, t), t;
};
let a = class extends Z {
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
      ${a.weightsMap.get((e = this.weight) != null ? e : "regular")}
    </svg>`;
  }
};
a.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    r`<path d="M36,64a4,4,0,0,1,4-4H216a4,4,0,0,1,0,8H40A4,4,0,0,1,36,64Zm4,68H160a4,4,0,0,0,0-8H40a4,4,0,0,0,0,8Zm72,56H40a4,4,0,0,0,0,8h72a4,4,0,0,0,0-8Zm131.83-62.85a4,4,0,0,1-5,2.68L204,117.38V192a28,28,0,1,1-8-19.57V112a4,4,0,0,1,5.15-3.83l40,12A4,4,0,0,1,243.83,125.15ZM196,192a20,20,0,1,0-20,20A20,20,0,0,0,196,192Z"/>`
  ],
  [
    "light",
    r`<path d="M34,64a6,6,0,0,1,6-6H216a6,6,0,0,1,0,12H40A6,6,0,0,1,34,64Zm6,70H160a6,6,0,0,0,0-12H40a6,6,0,0,0,0,12Zm72,52H40a6,6,0,0,0,0,12h72a6,6,0,0,0,0-12Zm133.75-60.28a6,6,0,0,1-7.48,4L206,120.06V192a30,30,0,1,1-12-24V112a6,6,0,0,1,7.72-5.75l40,12A6,6,0,0,1,245.75,125.72ZM194,192a18,18,0,1,0-18,18A18,18,0,0,0,194,192Z"/>`
  ],
  [
    "regular",
    r`<path d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64Zm8,72H160a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm72,48H40a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Zm135.66-57.7a8,8,0,0,1-10,5.36L208,122.75V192a32.05,32.05,0,1,1-16-27.69V112a8,8,0,0,1,10.3-7.66l40,12A8,8,0,0,1,247.66,126.3ZM192,192a16,16,0,1,0-16,16A16,16,0,0,0,192,192Z"/>`
  ],
  [
    "bold",
    r`<path d="M28,64A12,12,0,0,1,40,52H216a12,12,0,0,1,0,24H40A12,12,0,0,1,28,64Zm12,76H156a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24Zm68,40H40a12,12,0,0,0,0,24h68a12,12,0,0,0,0-24Zm143.49-52.55a12,12,0,0,1-14.94,8L212,128.13V192a36,36,0,1,1-24-33.94V112a12,12,0,0,1,15.45-11.49l40,12A12,12,0,0,1,251.49,127.45ZM188,192a12,12,0,1,0-12,12A12,12,0,0,0,188,192Z"/>`
  ],
  [
    "fill",
    r`<path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM64,72H192a8,8,0,0,1,0,16H64a8,8,0,0,1,0-16Zm0,48h72a8,8,0,0,1,0,16H64a8,8,0,0,1,0-16Zm40,64H64a8,8,0,0,1,0-16h40a8,8,0,0,1,0,16Zm103.59-53.47a8,8,0,0,1-10.12,5.06L184,131.1V176a24,24,0,1,1-16-22.62V120a8,8,0,0,1,10.53-7.59l24,8A8,8,0,0,1,207.59,130.53Z"/>`
  ],
  [
    "duotone",
    r`<path d="M200,192a24,24,0,1,1-24-24A24,24,0,0,1,200,192Z" opacity="0.2"/><path d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64Zm8,72H160a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm72,48H40a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Zm135.66-57.7a8,8,0,0,1-10,5.36L208,122.75V192a32.05,32.05,0,1,1-16-27.69V112a8,8,0,0,1,10.3-7.66l40,12A8,8,0,0,1,247.66,126.3ZM192,192a16,16,0,1,0-16,16A16,16,0,0,0,192,192Z"/>`
  ]
]);
a.styles = g`
    :host {
      display: contents;
    }
  `;
s([
  l({ type: String, reflect: !0 })
], a.prototype, "size", 2);
s([
  l({ type: String, reflect: !0 })
], a.prototype, "weight", 2);
s([
  l({ type: String, reflect: !0 })
], a.prototype, "color", 2);
s([
  l({ type: Boolean, reflect: !0 })
], a.prototype, "mirrored", 2);
a = s([
  n("ph-playlist")
], a);
export {
  a as PhPlaylist
};
