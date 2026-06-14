import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as a, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as A } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as p } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as c } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var g = Object.defineProperty, V = Object.getOwnPropertyDescriptor, s = (r, o, h, i) => {
  for (var e = i > 1 ? void 0 : i ? V(o, h) : o, l = r.length - 1, H; l >= 0; l--)
    (H = r[l]) && (e = (i ? H(o, h, e) : H(e)) || e);
  return i && e && g(o, h, e), e;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var r;
    return m`<svg
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
    a`<path d="M192,28H64A20,20,0,0,0,44,48V208a20,20,0,0,0,20,20H192a20,20,0,0,0,20-20V48A20,20,0,0,0,192,28Zm12,180a12,12,0,0,1-12,12H64a12,12,0,0,1-12-12V48A12,12,0,0,1,64,36H192a12,12,0,0,1,12,12ZM164,64a4,4,0,0,1-4,4H96a4,4,0,0,1,0-8h64A4,4,0,0,1,164,64Z"/>`
  ],
  [
    "light",
    a`<path d="M192,26H64A22,22,0,0,0,42,48V208a22,22,0,0,0,22,22H192a22,22,0,0,0,22-22V48A22,22,0,0,0,192,26Zm10,182a10,10,0,0,1-10,10H64a10,10,0,0,1-10-10V48A10,10,0,0,1,64,38H192a10,10,0,0,1,10,10ZM166,64a6,6,0,0,1-6,6H96a6,6,0,0,1,0-12h64A6,6,0,0,1,166,64Z"/>`
  ],
  [
    "regular",
    a`<path d="M192,24H64A24,24,0,0,0,40,48V208a24,24,0,0,0,24,24H192a24,24,0,0,0,24-24V48A24,24,0,0,0,192,24Zm8,184a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8H192a8,8,0,0,1,8,8ZM168,64a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,64Z"/>`
  ],
  [
    "bold",
    a`<path d="M192,20H64A28,28,0,0,0,36,48V208a28,28,0,0,0,28,28H192a28,28,0,0,0,28-28V48A28,28,0,0,0,192,20Zm4,188a4,4,0,0,1-4,4H64a4,4,0,0,1-4-4V48a4,4,0,0,1,4-4H192a4,4,0,0,1,4,4ZM172,72a12,12,0,0,1-12,12H96a12,12,0,0,1,0-24h64A12,12,0,0,1,172,72Z"/>`
  ],
  [
    "fill",
    a`<path d="M192,24H64A24,24,0,0,0,40,48V208a24,24,0,0,0,24,24H192a24,24,0,0,0,24-24V48A24,24,0,0,0,192,24ZM160,72H96a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Z"/>`
  ],
  [
    "duotone",
    a`<path d="M208,48V208a16,16,0,0,1-16,16H64a16,16,0,0,1-16-16V48A16,16,0,0,1,64,32H192A16,16,0,0,1,208,48Z" opacity="0.2"/><path d="M192,24H64A24,24,0,0,0,40,48V208a24,24,0,0,0,24,24H192a24,24,0,0,0,24-24V48A24,24,0,0,0,192,24Zm8,184a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8H192a8,8,0,0,1,8,8ZM168,64a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,64Z"/>`
  ]
]);
t.styles = c`
    :host {
      display: contents;
    }
  `;
s([
  p({ type: String, reflect: !0 })
], t.prototype, "size", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
s([
  p({ type: String, reflect: !0 })
], t.prototype, "color", 2);
s([
  p({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = s([
  A("ph-device-tablet-speaker")
], t);
export {
  t as PhDeviceTabletSpeaker
};
