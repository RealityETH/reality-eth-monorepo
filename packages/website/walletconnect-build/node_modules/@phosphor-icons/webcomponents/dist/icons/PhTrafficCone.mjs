import "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/reactive-element.mjs";
import { svg as e, html as m } from "../node_modules/.pnpm/lit-html@3.1.4/node_modules/lit-html/lit-html.mjs";
import { LitElement as n } from "../node_modules/.pnpm/lit-element@4.0.6/node_modules/lit-element/lit-element.mjs";
import { customElement as Z } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/custom-element.mjs";
import { property as h } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/decorators/property.mjs";
import { css as f } from "../node_modules/.pnpm/@lit_reactive-element@2.0.4/node_modules/@lit/reactive-element/css-tag.mjs";
var M = Object.defineProperty, c = Object.getOwnPropertyDescriptor, a = (o, s, H, l) => {
  for (var r = l > 1 ? void 0 : l ? c(s, H) : s, i = o.length - 1, p; i >= 0; i--)
    (p = o[i]) && (r = (l ? p(s, H, r) : p(r)) || r);
  return l && r && M(s, H, r), r;
};
let t = class extends n {
  constructor() {
    super(...arguments), this.size = "1em", this.weight = "regular", this.color = "currentColor", this.mirrored = !1;
  }
  render() {
    var o;
    return m`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="${this.size}"
      height="${this.size}"
      fill="${this.color}"
      viewBox="0 0 256 256"
      transform=${this.mirrored ? "scale(-1, 1)" : null}
    >
      ${t.weightsMap.get((o = this.weight) != null ? o : "regular")}
    </svg>`;
  }
};
t.weightsMap = /* @__PURE__ */ new Map([
  [
    "thin",
    e`<path d="M232,212H210.84L149.65,36.06A12,12,0,0,0,138.31,28H117.69a12,12,0,0,0-11.34,8.06L45.16,212H24a4,4,0,0,0,0,8H232a4,4,0,0,0,0-8ZM92.58,100h70.84l19.47,56H73.11Zm21.33-61.31A4,4,0,0,1,117.69,36h20.62a4,4,0,0,1,3.78,2.69L160.63,92H95.37ZM70.32,164H185.68l16.69,48H53.63Z"/>`
  ],
  [
    "light",
    e`<path d="M232,210H212.27L151.54,35.4A14,14,0,0,0,138.31,26H117.69a14,14,0,0,0-13.23,9.4L43.73,210H24a6,6,0,0,0,0,12H232a6,6,0,0,0,0-12ZM94,102h68l18.08,52H75.92Zm21.8-62.66A2,2,0,0,1,117.69,38h20.62a2,2,0,0,1,1.89,1.34L157.82,90H98.18ZM71.74,166H184.26l15.3,44H56.44Z"/>`
  ],
  [
    "regular",
    e`<path d="M232,208H213.69L153.42,34.75A16,16,0,0,0,138.31,24H117.69a16,16,0,0,0-15.11,10.74L42.31,208H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM95.43,104h65.14l16.7,48H78.73Zm22.26-64h20.62L155,88H101ZM73.17,168H182.83l13.92,40H59.25Z"/>`
  ],
  [
    "bold",
    e`<path d="M232,204H216.53L157.2,33.43A20,20,0,0,0,138.31,20H117.69A20,20,0,0,0,98.8,33.43L39.47,204H24a12,12,0,0,0,0,24H232a12,12,0,0,0,0-24ZM98.27,108h59.46l13.91,40H84.36Zm22.26-64h14.94l13.91,40H106.62ZM76,172H180l11.13,32H64.88Z"/>`
  ],
  [
    "fill",
    e`<path d="M232,208H213.69L153.42,34.75A16,16,0,0,0,138.31,24H117.69a16,16,0,0,0-15.11,10.74L42.31,208H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM95.43,104h65.14l16.7,48H78.73Z"/>`
  ],
  [
    "duotone",
    e`<path d="M188.52,160h-121L89.74,96h76.52Z" opacity="0.2"/><path d="M232,208H213.69L153.42,34.75A16,16,0,0,0,138.31,24H117.69a16,16,0,0,0-15.11,10.74L42.31,208H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM117.69,40h20.62L155,88H101ZM95.43,104h65.14l16.7,48H78.73ZM59.25,208l13.92-40H182.83l13.92,40Z"/>`
  ]
]);
t.styles = f`
    :host {
      display: contents;
    }
  `;
a([
  h({ type: String, reflect: !0 })
], t.prototype, "size", 2);
a([
  h({ type: String, reflect: !0 })
], t.prototype, "weight", 2);
a([
  h({ type: String, reflect: !0 })
], t.prototype, "color", 2);
a([
  h({ type: Boolean, reflect: !0 })
], t.prototype, "mirrored", 2);
t = a([
  Z("ph-traffic-cone")
], t);
export {
  t as PhTrafficCone
};
