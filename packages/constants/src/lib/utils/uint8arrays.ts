// @ts-nocheck

var Uint8arrays = (() => {
    var Me = Object.defineProperty;
    var jt = (t) => Me(t, "__esModule", { value: !0 });
    var D = (t, e) => () => (t && (e = t((t = 0))), e);
    var j = (t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports),
      d = (t, e) => {
        jt(t);
        for (var r in e) Me(t, r, { get: e[r], enumerable: !0 });
      };
    var Oe = j((ee) => {
      "use strict";
      Object.defineProperty(ee, "__esModule", { value: !0 });
      function Ft(t, e) {
        for (let r = 0; r < t.byteLength; r++) {
          if (t[r] < e[r]) return -1;
          if (t[r] > e[r]) return 1;
        }
        return t.byteLength > e.byteLength
          ? 1
          : t.byteLength < e.byteLength
          ? -1
          : 0;
      }
      ee.compare = Ft;
    });
    var Ie = j((te) => {
      "use strict";
      Object.defineProperty(te, "__esModule", { value: !0 });
      function St(t, e) {
        e || (e = t.reduce((o, n) => o + n.length, 0));
        let r = new Uint8Array(e),
          s = 0;
        for (let o of t) r.set(o, s), (s += o.length);
        return r;
      }
      te.concat = St;
    });
    var Le = j((re) => {
      "use strict";
      Object.defineProperty(re, "__esModule", { value: !0 });
      function Bt(t, e) {
        if (t === e) return !0;
        if (t.byteLength !== e.byteLength) return !1;
        for (let r = 0; r < t.byteLength; r++) if (t[r] !== e[r]) return !1;
        return !0;
      }
      re.equals = Bt;
    });
    function Ut(t, e) {
      if (t.length >= 255) throw new TypeError("Alphabet too long");
      for (var r = new Uint8Array(256), s = 0; s < r.length; s++) r[s] = 255;
      for (var o = 0; o < t.length; o++) {
        var n = t.charAt(o),
          i = n.charCodeAt(0);
        if (r[i] !== 255) throw new TypeError(n + " is ambiguous");
        r[i] = o;
      }
      var c = t.length,
        f = t.charAt(0),
        L = Math.log(c) / Math.log(256),
        b = Math.log(256) / Math.log(c);
      function q(u) {
        if (
          (u instanceof Uint8Array ||
            (ArrayBuffer.isView(u)
              ? (u = new Uint8Array(u.buffer, u.byteOffset, u.byteLength))
              : Array.isArray(u) && (u = Uint8Array.from(u))),
          !(u instanceof Uint8Array))
        )
          throw new TypeError("Expected Uint8Array");
        if (u.length === 0) return "";
        for (var p = 0, M = 0, C = 0, w = u.length; C !== w && u[C] === 0; )
          C++, p++;
        for (var y = ((w - C) * b + 1) >>> 0, l = new Uint8Array(y); C !== w; ) {
          for (
            var x = u[C], F = 0, E = y - 1;
            (x !== 0 || F < M) && E !== -1;
            E--, F++
          )
            (x += (256 * l[E]) >>> 0), (l[E] = x % c >>> 0), (x = (x / c) >>> 0);
          if (x !== 0) throw new Error("Non-zero carry");
          (M = F), C++;
        }
        for (var A = y - M; A !== y && l[A] === 0; ) A++;
        for (var J = f.repeat(p); A < y; ++A) J += t.charAt(l[A]);
        return J;
      }
      function R(u) {
        if (typeof u != "string") throw new TypeError("Expected String");
        if (u.length === 0) return new Uint8Array();
        var p = 0;
        if (u[p] !== " ") {
          for (var M = 0, C = 0; u[p] === f; ) M++, p++;
          for (
            var w = ((u.length - p) * L + 1) >>> 0, y = new Uint8Array(w);
            u[p];
  
          ) {
            var l = r[u.charCodeAt(p)];
            if (l === 255) return;
            for (var x = 0, F = w - 1; (l !== 0 || x < C) && F !== -1; F--, x++)
              (l += (c * y[F]) >>> 0),
                (y[F] = l % 256 >>> 0),
                (l = (l / 256) >>> 0);
            if (l !== 0) throw new Error("Non-zero carry");
            (C = x), p++;
          }
          if (u[p] !== " ") {
            for (var E = w - C; E !== w && y[E] === 0; ) E++;
            for (var A = new Uint8Array(M + (w - E)), J = M; E !== w; )
              A[J++] = y[E++];
            return A;
          }
        }
      }
      function At(u) {
        var p = R(u);
        if (p) return p;
        throw new Error(`Non-${e} character`);
      }
      return { encode: q, decodeUnsafe: R, decode: At };
    }
    var zt,
      Mt,
      qe,
      Ne = D(() => {
        (zt = Ut), (Mt = zt), (qe = Mt);
      });
    var X = {};
    d(X, {
      coerce: () => m,
      empty: () => Pe,
      equals: () => se,
      fromHex: () => It,
      fromString: () => oe,
      isBinary: () => Lt,
      toHex: () => Ot,
      toString: () => ne,
    });
    var Pe,
      Ot,
      It,
      se,
      m,
      Lt,
      oe,
      ne,
      S = D(() => {
        (Pe = new Uint8Array(0)),
          (Ot = (t) =>
            t.reduce((e, r) => e + r.toString(16).padStart(2, "0"), "")),
          (It = (t) => {
            let e = t.match(/../g);
            return e ? new Uint8Array(e.map((r) => parseInt(r, 16))) : Pe;
          }),
          (se = (t, e) => {
            if (t === e) return !0;
            if (t.byteLength !== e.byteLength) return !1;
            for (let r = 0; r < t.byteLength; r++) if (t[r] !== e[r]) return !1;
            return !0;
          }),
          (m = (t) => {
            if (t instanceof Uint8Array && t.constructor.name === "Uint8Array")
              return t;
            if (t instanceof ArrayBuffer) return new Uint8Array(t);
            if (ArrayBuffer.isView(t))
              return new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
            throw new Error("Unknown type, must be binary type");
          }),
          (Lt = (t) => t instanceof ArrayBuffer || ArrayBuffer.isView(t)),
          (oe = (t) => new TextEncoder().encode(t)),
          (ne = (t) => new TextDecoder().decode(t));
      });
    var Te,
      Ve,
      ke,
      $e,
      _e,
      N,
      B,
      qt,
      Nt,
      a,
      g = D(() => {
        Ne();
        S();
        (Te = class {
          constructor(e, r, s) {
            (this.name = e), (this.prefix = r), (this.baseEncode = s);
          }
          encode(e) {
            if (e instanceof Uint8Array)
              return `${this.prefix}${this.baseEncode(e)}`;
            throw Error("Unknown type, must be binary type");
          }
        }),
          (Ve = class {
            constructor(e, r, s) {
              if (
                ((this.name = e), (this.prefix = r), r.codePointAt(0) === void 0)
              )
                throw new Error("Invalid prefix character");
              (this.prefixCodePoint = r.codePointAt(0)), (this.baseDecode = s);
            }
            decode(e) {
              if (typeof e == "string") {
                if (e.codePointAt(0) !== this.prefixCodePoint)
                  throw Error(
                    `Unable to decode multibase string ${JSON.stringify(e)}, ${
                      this.name
                    } decoder only supports inputs prefixed with ${this.prefix}`
                  );
                return this.baseDecode(e.slice(this.prefix.length));
              } else throw Error("Can only multibase decode strings");
            }
            or(e) {
              return $e(this, e);
            }
          }),
          (ke = class {
            constructor(e) {
              this.decoders = e;
            }
            or(e) {
              return $e(this, e);
            }
            decode(e) {
              let r = e[0],
                s = this.decoders[r];
              if (s) return s.decode(e);
              throw RangeError(
                `Unable to decode multibase string ${JSON.stringify(
                  e
                )}, only inputs prefixed with ${Object.keys(
                  this.decoders
                )} are supported`
              );
            }
          }),
          ($e = (t, e) =>
            new ke({
              ...(t.decoders || { [t.prefix]: t }),
              ...(e.decoders || { [e.prefix]: e }),
            })),
          (_e = class {
            constructor(e, r, s, o) {
              (this.name = e),
                (this.prefix = r),
                (this.baseEncode = s),
                (this.baseDecode = o),
                (this.encoder = new Te(e, r, s)),
                (this.decoder = new Ve(e, r, o));
            }
            encode(e) {
              return this.encoder.encode(e);
            }
            decode(e) {
              return this.decoder.decode(e);
            }
          }),
          (N = ({ name: t, prefix: e, encode: r, decode: s }) =>
            new _e(t, e, r, s)),
          (B = ({ prefix: t, name: e, alphabet: r }) => {
            let { encode: s, decode: o } = qe(r, e);
            return N({ prefix: t, name: e, encode: s, decode: (n) => m(o(n)) });
          }),
          (qt = (t, e, r, s) => {
            let o = {};
            for (let b = 0; b < e.length; ++b) o[e[b]] = b;
            let n = t.length;
            for (; t[n - 1] === "="; ) --n;
            let i = new Uint8Array(((n * r) / 8) | 0),
              c = 0,
              f = 0,
              L = 0;
            for (let b = 0; b < n; ++b) {
              let q = o[t[b]];
              if (q === void 0) throw new SyntaxError(`Non-${s} character`);
              (f = (f << r) | q),
                (c += r),
                c >= 8 && ((c -= 8), (i[L++] = 255 & (f >> c)));
            }
            if (c >= r || 255 & (f << (8 - c)))
              throw new SyntaxError("Unexpected end of data");
            return i;
          }),
          (Nt = (t, e, r) => {
            let s = e[e.length - 1] === "=",
              o = (1 << r) - 1,
              n = "",
              i = 0,
              c = 0;
            for (let f = 0; f < t.length; ++f)
              for (c = (c << 8) | t[f], i += 8; i > r; )
                (i -= r), (n += e[o & (c >> i)]);
            if ((i && (n += e[o & (c << (r - i))]), s))
              for (; (n.length * r) & 7; ) n += "=";
            return n;
          }),
          (a = ({ name: t, prefix: e, bitsPerChar: r, alphabet: s }) =>
            N({
              prefix: e,
              name: t,
              encode(o) {
                return Nt(o, s, r);
              },
              decode(o) {
                return qt(o, s, r, t);
              },
            }));
      });
    var ue = {};
    d(ue, { identity: () => Pt });
    var Pt,
      Re = D(() => {
        g();
        S();
        Pt = N({
          prefix: "\0",
          name: "identity",
          encode: (t) => ne(t),
          decode: (t) => oe(t),
        });
      });
    var De = {};
    d(De, { base2: () => Tt });
    var Tt,
      Je = D(() => {
        g();
        Tt = a({ prefix: "0", name: "base2", alphabet: "01", bitsPerChar: 1 });
      });
    var ie = {};
    d(ie, { base8: () => Vt });
    var Vt,
      Xe = D(() => {
        g();
        Vt = a({
          prefix: "7",
          name: "base8",
          alphabet: "01234567",
          bitsPerChar: 3,
        });
      });
    var ae = {};
    d(ae, { base10: () => kt });
    var kt,
      Ge = D(() => {
        g();
        kt = B({ prefix: "9", name: "base10", alphabet: "0123456789" });
      });
    var ce = {};
    d(ce, { base16: () => $t, base16upper: () => _t });
    var $t,
      _t,
      Ke = D(() => {
        g();
        ($t = a({
          prefix: "f",
          name: "base16",
          alphabet: "0123456789abcdef",
          bitsPerChar: 4,
        })),
          (_t = a({
            prefix: "F",
            name: "base16upper",
            alphabet: "0123456789ABCDEF",
            bitsPerChar: 4,
          }));
      });
    var de = {};
    d(de, {
      base32: () => P,
      base32hex: () => Gt,
      base32hexpad: () => Qt,
      base32hexpadupper: () => Ht,
      base32hexupper: () => Kt,
      base32pad: () => Jt,
      base32padupper: () => Xt,
      base32upper: () => Rt,
      base32z: () => Wt,
    });
    var P,
      Rt,
      Jt,
      Xt,
      Gt,
      Kt,
      Qt,
      Ht,
      Wt,
      he = D(() => {
        g();
        (P = a({
          prefix: "b",
          name: "base32",
          alphabet: "abcdefghijklmnopqrstuvwxyz234567",
          bitsPerChar: 5,
        })),
          (Rt = a({
            prefix: "B",
            name: "base32upper",
            alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
            bitsPerChar: 5,
          })),
          (Jt = a({
            prefix: "c",
            name: "base32pad",
            alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
            bitsPerChar: 5,
          })),
          (Xt = a({
            prefix: "C",
            name: "base32padupper",
            alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
            bitsPerChar: 5,
          })),
          (Gt = a({
            prefix: "v",
            name: "base32hex",
            alphabet: "0123456789abcdefghijklmnopqrstuv",
            bitsPerChar: 5,
          })),
          (Kt = a({
            prefix: "V",
            name: "base32hexupper",
            alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
            bitsPerChar: 5,
          })),
          (Qt = a({
            prefix: "t",
            name: "base32hexpad",
            alphabet: "0123456789abcdefghijklmnopqrstuv=",
            bitsPerChar: 5,
          })),
          (Ht = a({
            prefix: "T",
            name: "base32hexpadupper",
            alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
            bitsPerChar: 5,
          })),
          (Wt = a({
            prefix: "h",
            name: "base32z",
            alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
            bitsPerChar: 5,
          }));
      });
    var fe = {};
    d(fe, { base36: () => Zt, base36upper: () => Yt });
    var Zt,
      Yt,
      Qe = D(() => {
        g();
        (Zt = B({
          prefix: "k",
          name: "base36",
          alphabet: "0123456789abcdefghijklmnopqrstuvwxyz",
        })),
          (Yt = B({
            prefix: "K",
            name: "base36upper",
            alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          }));
      });
    var pe = {};
    d(pe, { base58btc: () => v, base58flickr: () => er });
    var v,
      er,
      be = D(() => {
        g();
        (v = B({
          name: "base58btc",
          prefix: "z",
          alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
        })),
          (er = B({
            name: "base58flickr",
            prefix: "Z",
            alphabet:
              "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ",
          }));
      });
    var le = {};
    d(le, {
      base64: () => tr,
      base64pad: () => rr,
      base64url: () => sr,
      base64urlpad: () => or,
    });
    var tr,
      rr,
      sr,
      or,
      He = D(() => {
        g();
        (tr = a({
          prefix: "m",
          name: "base64",
          alphabet:
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
          bitsPerChar: 6,
        })),
          (rr = a({
            prefix: "M",
            name: "base64pad",
            alphabet:
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            bitsPerChar: 6,
          })),
          (sr = a({
            prefix: "u",
            name: "base64url",
            alphabet:
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
            bitsPerChar: 6,
          })),
          (or = a({
            prefix: "U",
            name: "base64urlpad",
            alphabet:
              "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
            bitsPerChar: 6,
          }));
      });
    var me = {};
    d(me, { base256emoji: () => ar });
    function Dr(t) {
      return t.reduce((e, r) => ((e += nr[r]), e), "");
    }
    function ir(t) {
      let e = [];
      for (let r of t) {
        let s = ur[r.codePointAt(0)];
        if (s === void 0) throw new Error(`Non-base256emoji character: ${r}`);
        e.push(s);
      }
      return new Uint8Array(e);
    }
    var We,
      nr,
      ur,
      ar,
      Ze = D(() => {
        g();
        (We = Array.from(
          "\u{1F680}\u{1FA90}\u2604\u{1F6F0}\u{1F30C}\u{1F311}\u{1F312}\u{1F313}\u{1F314}\u{1F315}\u{1F316}\u{1F317}\u{1F318}\u{1F30D}\u{1F30F}\u{1F30E}\u{1F409}\u2600\u{1F4BB}\u{1F5A5}\u{1F4BE}\u{1F4BF}\u{1F602}\u2764\u{1F60D}\u{1F923}\u{1F60A}\u{1F64F}\u{1F495}\u{1F62D}\u{1F618}\u{1F44D}\u{1F605}\u{1F44F}\u{1F601}\u{1F525}\u{1F970}\u{1F494}\u{1F496}\u{1F499}\u{1F622}\u{1F914}\u{1F606}\u{1F644}\u{1F4AA}\u{1F609}\u263A\u{1F44C}\u{1F917}\u{1F49C}\u{1F614}\u{1F60E}\u{1F607}\u{1F339}\u{1F926}\u{1F389}\u{1F49E}\u270C\u2728\u{1F937}\u{1F631}\u{1F60C}\u{1F338}\u{1F64C}\u{1F60B}\u{1F497}\u{1F49A}\u{1F60F}\u{1F49B}\u{1F642}\u{1F493}\u{1F929}\u{1F604}\u{1F600}\u{1F5A4}\u{1F603}\u{1F4AF}\u{1F648}\u{1F447}\u{1F3B6}\u{1F612}\u{1F92D}\u2763\u{1F61C}\u{1F48B}\u{1F440}\u{1F62A}\u{1F611}\u{1F4A5}\u{1F64B}\u{1F61E}\u{1F629}\u{1F621}\u{1F92A}\u{1F44A}\u{1F973}\u{1F625}\u{1F924}\u{1F449}\u{1F483}\u{1F633}\u270B\u{1F61A}\u{1F61D}\u{1F634}\u{1F31F}\u{1F62C}\u{1F643}\u{1F340}\u{1F337}\u{1F63B}\u{1F613}\u2B50\u2705\u{1F97A}\u{1F308}\u{1F608}\u{1F918}\u{1F4A6}\u2714\u{1F623}\u{1F3C3}\u{1F490}\u2639\u{1F38A}\u{1F498}\u{1F620}\u261D\u{1F615}\u{1F33A}\u{1F382}\u{1F33B}\u{1F610}\u{1F595}\u{1F49D}\u{1F64A}\u{1F639}\u{1F5E3}\u{1F4AB}\u{1F480}\u{1F451}\u{1F3B5}\u{1F91E}\u{1F61B}\u{1F534}\u{1F624}\u{1F33C}\u{1F62B}\u26BD\u{1F919}\u2615\u{1F3C6}\u{1F92B}\u{1F448}\u{1F62E}\u{1F646}\u{1F37B}\u{1F343}\u{1F436}\u{1F481}\u{1F632}\u{1F33F}\u{1F9E1}\u{1F381}\u26A1\u{1F31E}\u{1F388}\u274C\u270A\u{1F44B}\u{1F630}\u{1F928}\u{1F636}\u{1F91D}\u{1F6B6}\u{1F4B0}\u{1F353}\u{1F4A2}\u{1F91F}\u{1F641}\u{1F6A8}\u{1F4A8}\u{1F92C}\u2708\u{1F380}\u{1F37A}\u{1F913}\u{1F619}\u{1F49F}\u{1F331}\u{1F616}\u{1F476}\u{1F974}\u25B6\u27A1\u2753\u{1F48E}\u{1F4B8}\u2B07\u{1F628}\u{1F31A}\u{1F98B}\u{1F637}\u{1F57A}\u26A0\u{1F645}\u{1F61F}\u{1F635}\u{1F44E}\u{1F932}\u{1F920}\u{1F927}\u{1F4CC}\u{1F535}\u{1F485}\u{1F9D0}\u{1F43E}\u{1F352}\u{1F617}\u{1F911}\u{1F30A}\u{1F92F}\u{1F437}\u260E\u{1F4A7}\u{1F62F}\u{1F486}\u{1F446}\u{1F3A4}\u{1F647}\u{1F351}\u2744\u{1F334}\u{1F4A3}\u{1F438}\u{1F48C}\u{1F4CD}\u{1F940}\u{1F922}\u{1F445}\u{1F4A1}\u{1F4A9}\u{1F450}\u{1F4F8}\u{1F47B}\u{1F910}\u{1F92E}\u{1F3BC}\u{1F975}\u{1F6A9}\u{1F34E}\u{1F34A}\u{1F47C}\u{1F48D}\u{1F4E3}\u{1F942}"
        )),
          (nr = We.reduce((t, e, r) => ((t[r] = e), t), [])),
          (ur = We.reduce((t, e, r) => ((t[e.codePointAt(0)] = r), t), []));
        ar = N({
          prefix: "\u{1F680}",
          name: "base256emoji",
          encode: Dr,
          decode: ir,
        });
      });
    function et(t, e, r) {
      (e = e || []), (r = r || 0);
      for (var s = r; t >= fr; ) (e[r++] = (t & 255) | Ye), (t /= 128);
      for (; t & hr; ) (e[r++] = (t & 255) | Ye), (t >>>= 7);
      return (e[r] = t | 0), (et.bytes = r - s + 1), e;
    }
    function Ce(t, e) {
      var r = 0,
        e = e || 0,
        s = 0,
        o = e,
        n,
        i = t.length;
      do {
        if (o >= i)
          throw ((Ce.bytes = 0), new RangeError("Could not decode varint"));
        (n = t[o++]),
          (r += s < 28 ? (n & tt) << s : (n & tt) * Math.pow(2, s)),
          (s += 7);
      } while (n >= br);
      return (Ce.bytes = o - e), r;
    }
    var cr,
      Ye,
      dr,
      hr,
      fr,
      pr,
      br,
      tt,
      lr,
      mr,
      Cr,
      Er,
      gr,
      wr,
      yr,
      xr,
      vr,
      Ar,
      jr,
      Fr,
      k,
      rt = D(() => {
        (cr = et), (Ye = 128), (dr = 127), (hr = ~dr), (fr = Math.pow(2, 31));
        (pr = Ce), (br = 128), (tt = 127);
        (lr = Math.pow(2, 7)),
          (mr = Math.pow(2, 14)),
          (Cr = Math.pow(2, 21)),
          (Er = Math.pow(2, 28)),
          (gr = Math.pow(2, 35)),
          (wr = Math.pow(2, 42)),
          (yr = Math.pow(2, 49)),
          (xr = Math.pow(2, 56)),
          (vr = Math.pow(2, 63)),
          (Ar = function (t) {
            return t < lr
              ? 1
              : t < mr
              ? 2
              : t < Cr
              ? 3
              : t < Er
              ? 4
              : t < gr
              ? 5
              : t < wr
              ? 6
              : t < yr
              ? 7
              : t < xr
              ? 8
              : t < vr
              ? 9
              : 10;
          }),
          (jr = { encode: cr, decode: pr, encodingLength: Ar }),
          (Fr = jr),
          (k = Fr);
      });
    var G = {};
    d(G, { decode: () => T, encodeTo: () => O, encodingLength: () => I });
    var T,
      O,
      I,
      K = D(() => {
        rt();
        (T = (t) => [k.decode(t), k.decode.bytes]),
          (O = (t, e, r = 0) => (k.encode(t, e, r), e)),
          (I = (t) => k.encodingLength(t));
      });
    var Q = {};
    d(Q, {
      Digest: () => V,
      create: () => U,
      decode: () => Ee,
      equals: () => ge,
    });
    var U,
      Ee,
      ge,
      V,
      $ = D(() => {
        S();
        K();
        (U = (t, e) => {
          let r = e.byteLength,
            s = I(t),
            o = s + I(r),
            n = new Uint8Array(o + r);
          return O(t, n, 0), O(r, n, s), n.set(e, o), new V(t, r, e, n);
        }),
          (Ee = (t) => {
            let e = m(t),
              [r, s] = T(e),
              [o, n] = T(e.subarray(s)),
              i = e.subarray(s + n);
            if (i.byteLength !== o) throw new Error("Incorrect length");
            return new V(r, o, i, e);
          }),
          (ge = (t, e) =>
            t === e
              ? !0
              : t.code === e.code && t.size === e.size && se(t.bytes, e.bytes)),
          (V = class {
            constructor(e, r, s, o) {
              (this.code = e),
                (this.size = r),
                (this.digest = s),
                (this.bytes = o);
            }
          });
      });
    var W = {};
    d(W, { Hasher: () => we, from: () => H });
    var H,
      we,
      ye = D(() => {
        $();
        (H = ({ name: t, code: e, encode: r }) => new we(t, e, r)),
          (we = class {
            constructor(e, r, s) {
              (this.name = e), (this.code = r), (this.encode = s);
            }
            digest(e) {
              if (e instanceof Uint8Array) {
                let r = this.encode(e);
                return r instanceof Uint8Array
                  ? U(this.code, r)
                  : r.then((s) => U(this.code, s));
              } else throw Error("Unknown type, must be binary type");
            }
          });
      });
    var xe = {};
    d(xe, { sha256: () => Sr, sha512: () => Br });
    var st,
      Sr,
      Br,
      ot = D(() => {
        ye();
        (st = (t) => async (e) =>
          new Uint8Array(await crypto.subtle.digest(t, e))),
          (Sr = H({ name: "sha2-256", code: 18, encode: st("SHA-256") })),
          (Br = H({ name: "sha2-512", code: 19, encode: st("SHA-512") }));
      });
    var ve = {};
    d(ve, { identity: () => Mr });
    var nt,
      Ur,
      ut,
      zr,
      Mr,
      Dt = D(() => {
        S();
        $();
        (nt = 0),
          (Ur = "identity"),
          (ut = m),
          (zr = (t) => U(nt, ut(t))),
          (Mr = { code: nt, name: Ur, encode: ut, digest: zr });
      });
    var Ae = {};
    d(Ae, {
      code: () => Ir,
      decode: () => qr,
      encode: () => Lr,
      name: () => Or,
    });
    var Or,
      Ir,
      Lr,
      qr,
      it = D(() => {
        S();
        (Or = "raw"), (Ir = 85), (Lr = (t) => m(t)), (qr = (t) => m(t));
      });
    var je = {};
    d(je, {
      code: () => Vr,
      decode: () => $r,
      encode: () => kr,
      name: () => Tr,
    });
    var Nr,
      Pr,
      Tr,
      Vr,
      kr,
      $r,
      at = D(() => {
        (Nr = new TextEncoder()),
          (Pr = new TextDecoder()),
          (Tr = "json"),
          (Vr = 512),
          (kr = (t) => Nr.encode(JSON.stringify(t))),
          ($r = (t) => JSON.parse(Pr.decode(t)));
      });
    var h,
      _r,
      Rr,
      Jr,
      _,
      Xr,
      ct,
      dt,
      Z,
      Y,
      Gr,
      Kr,
      Qr,
      ht = D(() => {
        K();
        $();
        be();
        he();
        S();
        (h = class {
          constructor(e, r, s, o) {
            (this.code = r),
              (this.version = e),
              (this.multihash = s),
              (this.bytes = o),
              (this.byteOffset = o.byteOffset),
              (this.byteLength = o.byteLength),
              (this.asCID = this),
              (this._baseCache = new Map()),
              Object.defineProperties(this, {
                byteOffset: Y,
                byteLength: Y,
                code: Z,
                version: Z,
                multihash: Z,
                bytes: Z,
                _baseCache: Y,
                asCID: Y,
              });
          }
          toV0() {
            switch (this.version) {
              case 0:
                return this;
              default: {
                let { code: e, multihash: r } = this;
                if (e !== _)
                  throw new Error("Cannot convert a non dag-pb CID to CIDv0");
                if (r.code !== Xr)
                  throw new Error(
                    "Cannot convert non sha2-256 multihash CID to CIDv0"
                  );
                return h.createV0(r);
              }
            }
          }
          toV1() {
            switch (this.version) {
              case 0: {
                let { code: e, digest: r } = this.multihash,
                  s = U(e, r);
                return h.createV1(this.code, s);
              }
              case 1:
                return this;
              default:
                throw Error(
                  `Can not convert CID version ${this.version} to version 0. This is a bug please report`
                );
            }
          }
          equals(e) {
            return (
              e &&
              this.code === e.code &&
              this.version === e.version &&
              ge(this.multihash, e.multihash)
            );
          }
          toString(e) {
            let { bytes: r, version: s, _baseCache: o } = this;
            switch (s) {
              case 0:
                return Rr(r, o, e || v.encoder);
              default:
                return Jr(r, o, e || P.encoder);
            }
          }
          toJSON() {
            return {
              code: this.code,
              version: this.version,
              hash: this.multihash.bytes,
            };
          }
          get [Symbol.toStringTag]() {
            return "CID";
          }
          [Symbol.for("nodejs.util.inspect.custom")]() {
            return "CID(" + this.toString() + ")";
          }
          static isCID(e) {
            return Kr(/^0\.0/, Qr), !!(e && (e[dt] || e.asCID === e));
          }
          get toBaseEncodedString() {
            throw new Error("Deprecated, use .toString()");
          }
          get codec() {
            throw new Error(
              '"codec" property is deprecated, use integer "code" property instead'
            );
          }
          get buffer() {
            throw new Error(
              "Deprecated .buffer property, use .bytes to get Uint8Array instead"
            );
          }
          get multibaseName() {
            throw new Error('"multibaseName" property is deprecated');
          }
          get prefix() {
            throw new Error('"prefix" property is deprecated');
          }
          static asCID(e) {
            if (e instanceof h) return e;
            if (e != null && e.asCID === e) {
              let { version: r, code: s, multihash: o, bytes: n } = e;
              return new h(r, s, o, n || ct(r, s, o.bytes));
            } else if (e != null && e[dt] === !0) {
              let { version: r, multihash: s, code: o } = e,
                n = Ee(s);
              return h.create(r, o, n);
            } else return null;
          }
          static create(e, r, s) {
            if (typeof r != "number")
              throw new Error("String codecs are no longer supported");
            switch (e) {
              case 0: {
                if (r !== _)
                  throw new Error(
                    `Version 0 CID must use dag-pb (code: ${_}) block encoding`
                  );
                return new h(e, r, s, s.bytes);
              }
              case 1: {
                let o = ct(e, r, s.bytes);
                return new h(e, r, s, o);
              }
              default:
                throw new Error("Invalid version");
            }
          }
          static createV0(e) {
            return h.create(0, _, e);
          }
          static createV1(e, r) {
            return h.create(1, e, r);
          }
          static decode(e) {
            let [r, s] = h.decodeFirst(e);
            if (s.length) throw new Error("Incorrect length");
            return r;
          }
          static decodeFirst(e) {
            let r = h.inspectBytes(e),
              s = r.size - r.multihashSize,
              o = m(e.subarray(s, s + r.multihashSize));
            if (o.byteLength !== r.multihashSize)
              throw new Error("Incorrect length");
            let n = o.subarray(r.multihashSize - r.digestSize),
              i = new V(r.multihashCode, r.digestSize, n, o);
            return [
              r.version === 0 ? h.createV0(i) : h.createV1(r.codec, i),
              e.subarray(r.size),
            ];
          }
          static inspectBytes(e) {
            let r = 0,
              s = () => {
                let [q, R] = T(e.subarray(r));
                return (r += R), q;
              },
              o = s(),
              n = _;
            if (
              (o === 18 ? ((o = 0), (r = 0)) : o === 1 && (n = s()),
              o !== 0 && o !== 1)
            )
              throw new RangeError(`Invalid CID version ${o}`);
            let i = r,
              c = s(),
              f = s(),
              L = r + f,
              b = L - i;
            return {
              version: o,
              codec: n,
              multihashCode: c,
              digestSize: f,
              multihashSize: b,
              size: L,
            };
          }
          static parse(e, r) {
            let [s, o] = _r(e, r),
              n = h.decode(o);
            return n._baseCache.set(s, e), n;
          }
        }),
          (_r = (t, e) => {
            switch (t[0]) {
              case "Q": {
                let r = e || v;
                return [v.prefix, r.decode(`${v.prefix}${t}`)];
              }
              case v.prefix: {
                let r = e || v;
                return [v.prefix, r.decode(t)];
              }
              case P.prefix: {
                let r = e || P;
                return [P.prefix, r.decode(t)];
              }
              default: {
                if (e == null)
                  throw Error(
                    "To parse non base32 or base58btc encoded CID multibase decoder must be provided"
                  );
                return [t[0], e.decode(t)];
              }
            }
          }),
          (Rr = (t, e, r) => {
            let { prefix: s } = r;
            if (s !== v.prefix)
              throw Error(`Cannot string encode V0 in ${r.name} encoding`);
            let o = e.get(s);
            if (o == null) {
              let n = r.encode(t).slice(1);
              return e.set(s, n), n;
            } else return o;
          }),
          (Jr = (t, e, r) => {
            let { prefix: s } = r,
              o = e.get(s);
            if (o == null) {
              let n = r.encode(t);
              return e.set(s, n), n;
            } else return o;
          }),
          (_ = 112),
          (Xr = 18),
          (ct = (t, e, r) => {
            let s = I(t),
              o = s + I(e),
              n = new Uint8Array(o + r.byteLength);
            return O(t, n, 0), O(e, n, s), n.set(r, o), n;
          }),
          (dt = Symbol.for("@ipld/js-cid/CID")),
          (Z = { writable: !1, configurable: !1, enumerable: !0 }),
          (Y = { writable: !1, enumerable: !1, configurable: !1 }),
          (Gr = "0.0.0-dev"),
          (Kr = (t, e) => {
            if (t.test(Gr)) console.warn(e);
            else throw new Error(e);
          }),
          (Qr = `CID.isCID(v) is deprecated and will be removed in the next major release.
    Following code pattern:
    
    if (CID.isCID(value)) {
      doSomethingWithCID(value)
    }
    
    Is replaced with:
    
    const cid = CID.asCID(value)
    if (cid) {
      // Make sure to use cid instead of value
      doSomethingWithCID(cid)
    }
    `);
      });
    var ft = D(() => {
      ht();
      K();
      S();
      ye();
      $();
    });
    var pt = {};
    d(pt, {
      CID: () => h,
      bases: () => Hr,
      bytes: () => X,
      codecs: () => Zr,
      digest: () => Q,
      hasher: () => W,
      hashes: () => Wr,
      varint: () => G,
    });
    var Hr,
      Wr,
      Zr,
      bt = D(() => {
        Re();
        Je();
        Xe();
        Ge();
        Ke();
        he();
        Qe();
        be();
        He();
        Ze();
        ot();
        Dt();
        it();
        at();
        ft();
        (Hr = {
          ...ue,
          ...De,
          ...ie,
          ...ae,
          ...ce,
          ...de,
          ...fe,
          ...pe,
          ...le,
          ...me,
        }),
          (Wr = { ...xe, ...ve }),
          (Zr = { raw: Ae, json: je });
      });
    var Se = j((Qs, Et) => {
      "use strict";
      var lt = (bt(), pt);
      function mt(t, e, r, s) {
        return {
          name: t,
          prefix: e,
          encoder: { name: t, prefix: e, encode: r },
          decoder: { decode: s },
        };
      }
      var Ct = mt(
          "utf8",
          "u",
          (t) => {
            let e = new TextDecoder("utf8");
            return "u" + e.decode(t);
          },
          (t) => new TextEncoder().encode(t.substring(1))
        ),
        Fe = mt(
          "ascii",
          "a",
          (t) => {
            let e = "a";
            for (let r = 0; r < t.length; r++) e += String.fromCharCode(t[r]);
            return e;
          },
          (t) => {
            t = t.substring(1);
            let e = new Uint8Array(t.length);
            for (let r = 0; r < t.length; r++) e[r] = t.charCodeAt(r);
            return e;
          }
        ),
        Yr = {
          utf8: Ct,
          "utf-8": Ct,
          hex: lt.bases.base16,
          latin1: Fe,
          ascii: Fe,
          binary: Fe,
          ...lt.bases,
        };
      Et.exports = Yr;
    });
    var gt = j((Be) => {
      "use strict";
      Object.defineProperty(Be, "__esModule", { value: !0 });
      var es = Se();
      function ts(t, e = "utf8") {
        let r = es[e];
        if (!r) throw new Error(`Unsupported encoding "${e}"`);
        return r.decoder.decode(`${r.prefix}${t}`);
      }
      Be.fromString = ts;
    });
    var wt = j((Ue) => {
      "use strict";
      Object.defineProperty(Ue, "__esModule", { value: !0 });
      var rs = Se();
      function ss(t, e = "utf8") {
        let r = rs[e];
        if (!r) throw new Error(`Unsupported encoding "${e}"`);
        return r.encoder.encode(t).substring(1);
      }
      Ue.toString = ss;
    });
    var yt = j((ze) => {
      "use strict";
      Object.defineProperty(ze, "__esModule", { value: !0 });
      function os(t, e) {
        if (t.length !== e.length)
          throw new Error("Inputs should have the same length");
        let r = new Uint8Array(t.length);
        for (let s = 0; s < t.length; s++) r[s] = t[s] ^ e[s];
        return r;
      }
      ze.xor = os;
    });
    var xt = j((z) => {
      "use strict";
      Object.defineProperty(z, "__esModule", { value: !0 });
      var ns = Oe(),
        us = Ie(),
        Ds = Le(),
        is = gt(),
        as = wt(),
        cs = yt();
      z.compare = ns.compare;
      z.concat = us.concat;
      z.equals = Ds.equals;
      z.fromString = is.fromString;
      z.toString = as.toString;
      z.xor = cs.xor;
    });
    var ds = j((eo, vt) => {
      vt.exports = xt();
    });
    return ds();
  })();
  
  export default Uint8arrays;
  