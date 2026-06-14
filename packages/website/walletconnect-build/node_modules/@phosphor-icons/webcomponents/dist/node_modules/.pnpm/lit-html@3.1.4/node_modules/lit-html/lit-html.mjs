/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const y = globalThis, S = y.trustedTypes, I = S ? S.createPolicy("lit-html", { createHTML: (h) => h }) : void 0, W = "$lit$", p = `lit$${Math.random().toFixed(9).slice(2)}$`, k = "?" + p, F = `<${k}>`, v = document, x = () => v.createComment(""), H = (h) => h === null || typeof h != "object" && typeof h != "function", D = Array.isArray, Z = (h) => D(h) || typeof (h == null ? void 0 : h[Symbol.iterator]) == "function", w = `[ 	
\f\r]`, m = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, B = /-->/g, P = />/g, u = RegExp(`>|${w}(?:([^\\s"'>=/]+)(${w}*=${w}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), R = /'/g, U = /"/g, V = /^(?:script|style|textarea|title)$/i, O = (h) => (t, ...e) => ({ _$litType$: h, strings: t, values: e }), Y = O(1), tt = O(2), N = Symbol.for("lit-noChange"), _ = Symbol.for("lit-nothing"), j = /* @__PURE__ */ new WeakMap(), g = v.createTreeWalker(v, 129);
function z(h, t) {
  if (!Array.isArray(h) || !h.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return I !== void 0 ? I.createHTML(t) : t;
}
const q = (h, t) => {
  const e = h.length - 1, s = [];
  let i, o = t === 2 ? "<svg>" : "", n = m;
  for (let A = 0; A < e; A++) {
    const r = h[A];
    let a, $, l = -1, c = 0;
    for (; c < r.length && (n.lastIndex = c, $ = n.exec(r), $ !== null); ) c = n.lastIndex, n === m ? $[1] === "!--" ? n = B : $[1] !== void 0 ? n = P : $[2] !== void 0 ? (V.test($[2]) && (i = RegExp("</" + $[2], "g")), n = u) : $[3] !== void 0 && (n = u) : n === u ? $[0] === ">" ? (n = i != null ? i : m, l = -1) : $[1] === void 0 ? l = -2 : (l = n.lastIndex - $[2].length, a = $[1], n = $[3] === void 0 ? u : $[3] === '"' ? U : R) : n === U || n === R ? n = u : n === B || n === P ? n = m : (n = u, i = void 0);
    const d = n === u && h[A + 1].startsWith("/>") ? " " : "";
    o += n === m ? r + F : l >= 0 ? (s.push(a), r.slice(0, l) + W + r.slice(l) + p + d) : r + p + (l === -2 ? A : d);
  }
  return [z(h, o + (h[e] || "<?>") + (t === 2 ? "</svg>" : "")), s];
};
class T {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let o = 0, n = 0;
    const A = t.length - 1, r = this.parts, [a, $] = q(t, e);
    if (this.el = T.createElement(a, s), g.currentNode = this.el.content, e === 2) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (i = g.nextNode()) !== null && r.length < A; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const l of i.getAttributeNames()) if (l.endsWith(W)) {
          const c = $[n++], d = i.getAttribute(l).split(p), C = /([.?@])?(.*)/.exec(c);
          r.push({ type: 1, index: o, name: C[2], strings: d, ctor: C[1] === "." ? J : C[1] === "?" ? K : C[1] === "@" ? Q : M }), i.removeAttribute(l);
        } else l.startsWith(p) && (r.push({ type: 6, index: o }), i.removeAttribute(l));
        if (V.test(i.tagName)) {
          const l = i.textContent.split(p), c = l.length - 1;
          if (c > 0) {
            i.textContent = S ? S.emptyScript : "";
            for (let d = 0; d < c; d++) i.append(l[d], x()), g.nextNode(), r.push({ type: 2, index: ++o });
            i.append(l[c], x());
          }
        }
      } else if (i.nodeType === 8) if (i.data === k) r.push({ type: 2, index: o });
      else {
        let l = -1;
        for (; (l = i.data.indexOf(p, l + 1)) !== -1; ) r.push({ type: 7, index: o }), l += p.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const s = v.createElement("template");
    return s.innerHTML = t, s;
  }
}
function f(h, t, e = h, s) {
  var n, A, r;
  if (t === N) return t;
  let i = s !== void 0 ? (n = e._$Co) == null ? void 0 : n[s] : e._$Cl;
  const o = H(t) ? void 0 : t._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== o && ((A = i == null ? void 0 : i._$AO) == null || A.call(i, !1), o === void 0 ? i = void 0 : (i = new o(h), i._$AT(h, e, s)), s !== void 0 ? ((r = e._$Co) != null ? r : e._$Co = [])[s] = i : e._$Cl = i), i !== void 0 && (t = f(h, i._$AS(h, t.values), i, s)), t;
}
class G {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    var a;
    const { el: { content: e }, parts: s } = this._$AD, i = ((a = t == null ? void 0 : t.creationScope) != null ? a : v).importNode(e, !0);
    g.currentNode = i;
    let o = g.nextNode(), n = 0, A = 0, r = s[0];
    for (; r !== void 0; ) {
      if (n === r.index) {
        let $;
        r.type === 2 ? $ = new b(o, o.nextSibling, this, t) : r.type === 1 ? $ = new r.ctor(o, r.name, r.strings, this, t) : r.type === 6 && ($ = new X(o, this, t)), this._$AV.push($), r = s[++A];
      }
      n !== (r == null ? void 0 : r.index) && (o = g.nextNode(), n++);
    }
    return g.currentNode = v, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class b {
  get _$AU() {
    var t, e;
    return (e = (t = this._$AM) == null ? void 0 : t._$AU) != null ? e : this._$Cv;
  }
  constructor(t, e, s, i) {
    var o;
    this.type = 2, this._$AH = _, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = (o = i == null ? void 0 : i.isConnected) != null ? o : !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = f(this, t, e), H(t) ? t === _ || t == null || t === "" ? (this._$AH !== _ && this._$AR(), this._$AH = _) : t !== this._$AH && t !== N && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Z(t) ? this.k(t) : this._(t);
  }
  S(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.S(t));
  }
  _(t) {
    this._$AH !== _ && H(this._$AH) ? this._$AA.nextSibling.data = t : this.T(v.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var o;
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = T.createElement(z(s.h, s.h[0]), this.options)), s);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === i) this._$AH.p(e);
    else {
      const n = new G(i, this), A = n.u(this.options);
      n.p(e), this.T(A), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = j.get(t.strings);
    return e === void 0 && j.set(t.strings, e = new T(t)), e;
  }
  k(t) {
    D(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const o of t) i === e.length ? e.push(s = new b(this.S(x()), this.S(x()), this, this.options)) : s = e[i], s._$AI(o), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var s;
    for ((s = this._$AP) == null ? void 0 : s.call(this, !1, !0, e); t && t !== this._$AB; ) {
      const i = t.nextSibling;
      t.remove(), t = i;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class M {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, o) {
    this.type = 1, this._$AH = _, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = _;
  }
  _$AI(t, e = this, s, i) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = f(this, t, e, 0), n = !H(t) || t !== this._$AH && t !== N, n && (this._$AH = t);
    else {
      const A = t;
      let r, a;
      for (t = o[0], r = 0; r < o.length - 1; r++) a = f(this, A[s + r], e, r), a === N && (a = this._$AH[r]), n || (n = !H(a) || a !== this._$AH[r]), a === _ ? t = _ : t !== _ && (t += (a != null ? a : "") + o[r + 1]), this._$AH[r] = a;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === _ ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t != null ? t : "");
  }
}
class J extends M {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === _ ? void 0 : t;
  }
}
class K extends M {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== _);
  }
}
class Q extends M {
  constructor(t, e, s, i, o) {
    super(t, e, s, i, o), this.type = 5;
  }
  _$AI(t, e = this) {
    var n;
    if ((t = (n = f(this, t, e, 0)) != null ? n : _) === N) return;
    const s = this._$AH, i = t === _ && s !== _ || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== _ && (s === _ || i);
    i && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e, s;
    typeof this._$AH == "function" ? this._$AH.call((s = (e = this.options) == null ? void 0 : e.host) != null ? s : this.element, t) : this._$AH.handleEvent(t);
  }
}
class X {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    f(this, t);
  }
}
const E = y.litHtmlPolyfillSupport;
var L;
E == null || E(T, b), ((L = y.litHtmlVersions) != null ? L : y.litHtmlVersions = []).push("3.1.4");
const et = (h, t, e) => {
  var o, n;
  const s = (o = e == null ? void 0 : e.renderBefore) != null ? o : t;
  let i = s._$litPart$;
  if (i === void 0) {
    const A = (n = e == null ? void 0 : e.renderBefore) != null ? n : null;
    s._$litPart$ = i = new b(t.insertBefore(x(), A), A, void 0, e != null ? e : {});
  }
  return i._$AI(h), i;
};
export {
  Y as html,
  N as noChange,
  _ as nothing,
  et as render,
  tt as svg
};
