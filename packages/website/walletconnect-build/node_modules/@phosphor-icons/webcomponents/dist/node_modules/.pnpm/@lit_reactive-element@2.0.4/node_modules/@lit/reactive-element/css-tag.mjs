/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const r = globalThis, c = r.ShadowRoot && (r.ShadyCSS === void 0 || r.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, a = Symbol(), i = /* @__PURE__ */ new WeakMap();
class l {
  constructor(s, t, o) {
    if (this._$cssResult$ = !0, o !== a) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = s, this.t = t;
  }
  get styleSheet() {
    let s = this.o;
    const t = this.t;
    if (c && s === void 0) {
      const o = t !== void 0 && t.length === 1;
      o && (s = i.get(t)), s === void 0 && ((this.o = s = new CSSStyleSheet()).replaceSync(this.cssText), o && i.set(t, s));
    }
    return s;
  }
  toString() {
    return this.cssText;
  }
}
const h = (e) => new l(typeof e == "string" ? e : e + "", void 0, a), p = (e, ...s) => {
  const t = e.length === 1 ? e[0] : s.reduce((o, S, u) => o + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(S) + e[u + 1], e[0]);
  return new l(t, e, a);
}, d = (e, s) => {
  if (c) e.adoptedStyleSheets = s.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of s) {
    const o = document.createElement("style"), S = r.litNonce;
    S !== void 0 && o.setAttribute("nonce", S), o.textContent = t.cssText, e.appendChild(o);
  }
}, y = c ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((s) => {
  let t = "";
  for (const o of s.cssRules) t += o.cssText;
  return h(t);
})(e) : e;
export {
  l as CSSResult,
  d as adoptStyles,
  p as css,
  y as getCompatibleStyle,
  c as supportsAdoptingStyleSheets,
  h as unsafeCSS
};
