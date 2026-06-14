import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as r, html as A } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as L } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as i } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as g } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var c = Object.defineProperty, f = Object.getOwnPropertyDescriptor, l = (a, o, p, s) => {
  for (var e = s > 1 ? void 0 : s ? f(o, p) : o, h = a.length - 1, m; h >= 0; h--)
    (m = a[h]) && (e = (s ? m(o, p, e) : m(e)) || e);
  return s && e && c(o, p, e), e;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var a;
    return A`<svg
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
    r`<path d="M178.83,109.17a4,4,0,0,1,0,5.66l-32,32a4,4,0,0,1-5.66,0L112,117.66,82.83,146.83a4,4,0,0,1-5.66-5.66l32-32a4,4,0,0,1,5.66,0L144,138.34l29.17-29.17A4,4,0,0,1,178.83,109.17ZM228,128A100,100,0,0,1,79.5,215.47l-35.69,11.9a12,12,0,0,1-15.18-15.18l11.9-35.69A100,100,0,1,1,228,128Zm-8,0A92,92,0,1,0,48.35,174.07a4,4,0,0,1,.33,3.27L36.22,214.72a4,4,0,0,0,5.06,5.06l37.38-12.46a3.93,3.93,0,0,1,1.27-.21,4.05,4.05,0,0,1,2,.54A92,92,0,0,0,220,128Z"/>`
  ],
  [
    "light",
    r`<path d="M180.24,107.76a6,6,0,0,1,0,8.48l-32,32a6,6,0,0,1-8.48,0L112,120.49,84.24,148.24a6,6,0,0,1-8.48-8.48l32-32a6,6,0,0,1,8.48,0L144,135.51l27.76-27.75A6,6,0,0,1,180.24,107.76ZM230,128A102,102,0,0,1,79.31,217.65L44.44,229.27a14,14,0,0,1-17.71-17.71l11.62-34.87A102,102,0,1,1,230,128Zm-12,0A90,90,0,1,0,50.08,173.06a6,6,0,0,1,.5,4.91L38.12,215.35a2,2,0,0,0,2.53,2.53L78,205.42a6.2,6.2,0,0,1,1.9-.31,6.09,6.09,0,0,1,3,.81A90,90,0,0,0,218,128Z"/>`
  ],
  [
    "regular",
    r`<path d="M181.66,106.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0L112,123.31,85.66,149.66a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0L144,132.69l26.34-26.35A8,8,0,0,1,181.66,106.34ZM232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.52a8,8,0,0,1,6.54.67A88,88,0,0,0,216,128Z"/>`
  ],
  [
    "bold",
    r`<path d="M184.49,120.49l-32,32a12,12,0,0,1-17,0L112,129,88.49,152.49a12,12,0,0,1-17-17l32-32a12,12,0,0,1,17,0L144,127l23.51-23.52a12,12,0,0,1,17,17ZM236,128A108,108,0,0,1,78.77,224.15L46.34,235A20,20,0,0,1,21,209.66l10.81-32.43A108,108,0,1,1,236,128Zm-24,0A84,84,0,1,0,55.27,170.05a12,12,0,0,1,1,9.82l-9.93,29.79,29.79-9.93a12.1,12.1,0,0,1,3.8-.62,12,12,0,0,1,6,1.62A84,84,0,0,0,212,128Z"/>`
  ],
  [
    "fill",
    r`<path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm53.66,93.66-32,32a8,8,0,0,1-11.32,0L112,123.31,85.66,149.66a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0L144,132.69l26.34-26.35a8,8,0,0,1,11.32,11.32Z"/>`
  ],
  [
    "duotone",
    r`<path d="M224,128A96,96,0,0,1,79.93,211.11h0L42.54,223.58a8,8,0,0,1-10.12-10.12l12.47-37.39h0A96,96,0,1,1,224,128Z" opacity="0.2"/><path d="M181.66,106.34a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32,0L112,123.31,85.66,149.66a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0L144,132.69l26.34-26.35A8,8,0,0,1,181.66,106.34ZM232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.52a8,8,0,0,1,6.54.67A88,88,0,0,0,216,128Z"/>`
  ]
]);
t.styles = g`
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
  L("ph-messenger-logo")
], t);
export {
  t as PhMessengerLogo
};
