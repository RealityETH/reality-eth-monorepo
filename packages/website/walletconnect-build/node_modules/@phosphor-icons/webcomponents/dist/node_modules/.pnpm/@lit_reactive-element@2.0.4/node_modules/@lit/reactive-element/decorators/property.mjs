var h = Object.defineProperty, f = Object.defineProperties;
var y = Object.getOwnPropertyDescriptors;
var p = Object.getOwnPropertySymbols;
var g = Object.prototype.hasOwnProperty, P = Object.prototype.propertyIsEnumerable;
var d = (e, t, r) => t in e ? h(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, l = (e, t) => {
  for (var r in t || (t = {}))
    g.call(t, r) && d(e, r, t[r]);
  if (p)
    for (var r of p(t))
      P.call(t, r) && d(e, r, t[r]);
  return e;
}, u = (e, t) => f(e, y(t));
import { defaultConverter as m, notEqual as v } from "../reactive-element.mjs";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const b = { attribute: !0, type: String, converter: m, reflect: !1, hasChanged: v }, w = (e = b, t, r) => {
  const { kind: n, metadata: s } = r;
  let a = globalThis.litPropertyMetadata.get(s);
  if (a === void 0 && globalThis.litPropertyMetadata.set(s, a = /* @__PURE__ */ new Map()), a.set(r.name, e), n === "accessor") {
    const { name: o } = r;
    return { set(i) {
      const c = t.get.call(this);
      t.set.call(this, i), this.requestUpdate(o, c, e);
    }, init(i) {
      return i !== void 0 && this.P(o, void 0, e), i;
    } };
  }
  if (n === "setter") {
    const { name: o } = r;
    return function(i) {
      const c = this[o];
      t.call(this, i), this.requestUpdate(o, c, e);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function O(e) {
  return (t, r) => typeof r == "object" ? w(e, t, r) : ((n, s, a) => {
    const o = s.hasOwnProperty(a);
    return s.constructor.createProperty(a, o ? u(l({}, n), { wrapped: !0 }) : n), o ? Object.getOwnPropertyDescriptor(s, a) : void 0;
  })(e, t, r);
}
export {
  O as property,
  w as standardProperty
};
