// @ts-nocheck
export const LitThirdPartyLibs = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod2) =>
    function __require() {
      return (
        mod2 ||
          (0, cb[__getOwnPropNames(cb)[0]])(
            (mod2 = { exports: {} }).exports,
            mod2
          ),
        mod2.exports
      );
    };
  var __export = (target, all2) => {
    for (var name4 in all2)
      __defProp(target, name4, { get: all2[name4], enumerable: true });
  };
  var __copyProps = (to, from3, except, desc) => {
    if ((from3 && typeof from3 === 'object') || typeof from3 === 'function') {
      for (let key of __getOwnPropNames(from3))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from3[key],
            enumerable:
              !(desc = __getOwnPropDesc(from3, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toESM = (mod2, isNodeMode, target) => (
    (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}),
    __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod2 || !mod2.__esModule
        ? __defProp(target, 'default', { value: mod2, enumerable: true })
        : target,
      mod2
    )
  );
  var __toCommonJS = (mod2) =>
    __copyProps(__defProp({}, '__esModule', { value: true }), mod2);

  // node_modules/is-plain-obj/index.js
  var require_is_plain_obj = __commonJS({
    'node_modules/is-plain-obj/index.js'(exports2, module2) {
      'use strict';
      module2.exports = (value) => {
        if (Object.prototype.toString.call(value) !== '[object Object]') {
          return false;
        }
        const prototype = Object.getPrototypeOf(value);
        return prototype === null || prototype === Object.prototype;
      };
    },
  });

  // node_modules/merge-options/index.js
  var require_merge_options = __commonJS({
    'node_modules/merge-options/index.js'(exports2, module2) {
      'use strict';
      var isOptionObject = require_is_plain_obj();
      var { hasOwnProperty } = Object.prototype;
      var { propertyIsEnumerable } = Object;
      var defineProperty = (object, name4, value) =>
        Object.defineProperty(object, name4, {
          value,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      var globalThis2 = exports2;
      var defaultMergeOptions = {
        concatArrays: false,
        ignoreUndefined: false,
      };
      var getEnumerableOwnPropertyKeys = (value) => {
        const keys = [];
        for (const key in value) {
          if (hasOwnProperty.call(value, key)) {
            keys.push(key);
          }
        }
        if (Object.getOwnPropertySymbols) {
          const symbols = Object.getOwnPropertySymbols(value);
          for (const symbol2 of symbols) {
            if (propertyIsEnumerable.call(value, symbol2)) {
              keys.push(symbol2);
            }
          }
        }
        return keys;
      };
      function clone(value) {
        if (Array.isArray(value)) {
          return cloneArray(value);
        }
        if (isOptionObject(value)) {
          return cloneOptionObject(value);
        }
        return value;
      }
      function cloneArray(array) {
        const result = array.slice(0, 0);
        getEnumerableOwnPropertyKeys(array).forEach((key) => {
          defineProperty(result, key, clone(array[key]));
        });
        return result;
      }
      function cloneOptionObject(object) {
        const result =
          Object.getPrototypeOf(object) === null
            ? /* @__PURE__ */ Object.create(null)
            : {};
        getEnumerableOwnPropertyKeys(object).forEach((key) => {
          defineProperty(result, key, clone(object[key]));
        });
        return result;
      }
      var mergeKeys = (merged, source, keys, config) => {
        keys.forEach((key) => {
          if (typeof source[key] === 'undefined' && config.ignoreUndefined) {
            return;
          }
          if (key in merged && merged[key] !== Object.getPrototypeOf(merged)) {
            defineProperty(
              merged,
              key,
              merge(merged[key], source[key], config)
            );
          } else {
            defineProperty(merged, key, clone(source[key]));
          }
        });
        return merged;
      };
      var concatArrays = (merged, source, config) => {
        let result = merged.slice(0, 0);
        let resultIndex = 0;
        [merged, source].forEach((array) => {
          const indices = [];
          for (let k = 0; k < array.length; k++) {
            if (!hasOwnProperty.call(array, k)) {
              continue;
            }
            indices.push(String(k));
            if (array === merged) {
              defineProperty(result, resultIndex++, array[k]);
            } else {
              defineProperty(result, resultIndex++, clone(array[k]));
            }
          }
          result = mergeKeys(
            result,
            array,
            getEnumerableOwnPropertyKeys(array).filter(
              (key) => !indices.includes(key)
            ),
            config
          );
        });
        return result;
      };
      function merge(merged, source, config) {
        if (
          config.concatArrays &&
          Array.isArray(merged) &&
          Array.isArray(source)
        ) {
          return concatArrays(merged, source, config);
        }
        if (!isOptionObject(source) || !isOptionObject(merged)) {
          return clone(source);
        }
        return mergeKeys(
          merged,
          source,
          getEnumerableOwnPropertyKeys(source),
          config
        );
      }
      module2.exports = function (...options) {
        const config = merge(
          clone(defaultMergeOptions),
          (this !== globalThis2 && this) || {},
          defaultMergeOptions
        );
        let merged = { _: {} };
        for (const option of options) {
          if (option === void 0) {
            continue;
          }
          if (!isOptionObject(option)) {
            throw new TypeError('`' + option + '` is not an Option Object');
          }
          merged = merge(merged, { _: option }, config);
        }
        return merged._;
      };
    },
  });

  // node_modules/murmurhash3js-revisited/lib/murmurHash3js.js
  var require_murmurHash3js = __commonJS({
    'node_modules/murmurhash3js-revisited/lib/murmurHash3js.js'(
      exports2,
      module2
    ) {
      (function (root, undefined2) {
        'use strict';
        var library = {
          version: '3.0.0',
          x86: {},
          x64: {},
          inputValidation: true,
        };
        function _validBytes(bytes) {
          if (!Array.isArray(bytes) && !ArrayBuffer.isView(bytes)) {
            return false;
          }
          for (var i = 0; i < bytes.length; i++) {
            if (!Number.isInteger(bytes[i]) || bytes[i] < 0 || bytes[i] > 255) {
              return false;
            }
          }
          return true;
        }
        function _x86Multiply(m, n) {
          return (m & 65535) * n + ((((m >>> 16) * n) & 65535) << 16);
        }
        function _x86Rotl(m, n) {
          return (m << n) | (m >>> (32 - n));
        }
        function _x86Fmix(h) {
          h ^= h >>> 16;
          h = _x86Multiply(h, 2246822507);
          h ^= h >>> 13;
          h = _x86Multiply(h, 3266489909);
          h ^= h >>> 16;
          return h;
        }
        function _x64Add(m, n) {
          m = [m[0] >>> 16, m[0] & 65535, m[1] >>> 16, m[1] & 65535];
          n = [n[0] >>> 16, n[0] & 65535, n[1] >>> 16, n[1] & 65535];
          var o = [0, 0, 0, 0];
          o[3] += m[3] + n[3];
          o[2] += o[3] >>> 16;
          o[3] &= 65535;
          o[2] += m[2] + n[2];
          o[1] += o[2] >>> 16;
          o[2] &= 65535;
          o[1] += m[1] + n[1];
          o[0] += o[1] >>> 16;
          o[1] &= 65535;
          o[0] += m[0] + n[0];
          o[0] &= 65535;
          return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
        }
        function _x64Multiply(m, n) {
          m = [m[0] >>> 16, m[0] & 65535, m[1] >>> 16, m[1] & 65535];
          n = [n[0] >>> 16, n[0] & 65535, n[1] >>> 16, n[1] & 65535];
          var o = [0, 0, 0, 0];
          o[3] += m[3] * n[3];
          o[2] += o[3] >>> 16;
          o[3] &= 65535;
          o[2] += m[2] * n[3];
          o[1] += o[2] >>> 16;
          o[2] &= 65535;
          o[2] += m[3] * n[2];
          o[1] += o[2] >>> 16;
          o[2] &= 65535;
          o[1] += m[1] * n[3];
          o[0] += o[1] >>> 16;
          o[1] &= 65535;
          o[1] += m[2] * n[2];
          o[0] += o[1] >>> 16;
          o[1] &= 65535;
          o[1] += m[3] * n[1];
          o[0] += o[1] >>> 16;
          o[1] &= 65535;
          o[0] += m[0] * n[3] + m[1] * n[2] + m[2] * n[1] + m[3] * n[0];
          o[0] &= 65535;
          return [(o[0] << 16) | o[1], (o[2] << 16) | o[3]];
        }
        function _x64Rotl(m, n) {
          n %= 64;
          if (n === 32) {
            return [m[1], m[0]];
          } else if (n < 32) {
            return [
              (m[0] << n) | (m[1] >>> (32 - n)),
              (m[1] << n) | (m[0] >>> (32 - n)),
            ];
          } else {
            n -= 32;
            return [
              (m[1] << n) | (m[0] >>> (32 - n)),
              (m[0] << n) | (m[1] >>> (32 - n)),
            ];
          }
        }
        function _x64LeftShift(m, n) {
          n %= 64;
          if (n === 0) {
            return m;
          } else if (n < 32) {
            return [(m[0] << n) | (m[1] >>> (32 - n)), m[1] << n];
          } else {
            return [m[1] << (n - 32), 0];
          }
        }
        function _x64Xor(m, n) {
          return [m[0] ^ n[0], m[1] ^ n[1]];
        }
        function _x64Fmix(h) {
          h = _x64Xor(h, [0, h[0] >>> 1]);
          h = _x64Multiply(h, [4283543511, 3981806797]);
          h = _x64Xor(h, [0, h[0] >>> 1]);
          h = _x64Multiply(h, [3301882366, 444984403]);
          h = _x64Xor(h, [0, h[0] >>> 1]);
          return h;
        }
        library.x86.hash32 = function (bytes, seed) {
          if (library.inputValidation && !_validBytes(bytes)) {
            return undefined2;
          }
          seed = seed || 0;
          var remainder = bytes.length % 4;
          var blocks = bytes.length - remainder;
          var h1 = seed;
          var k1 = 0;
          var c1 = 3432918353;
          var c2 = 461845907;
          for (var i = 0; i < blocks; i = i + 4) {
            k1 =
              bytes[i] |
              (bytes[i + 1] << 8) |
              (bytes[i + 2] << 16) |
              (bytes[i + 3] << 24);
            k1 = _x86Multiply(k1, c1);
            k1 = _x86Rotl(k1, 15);
            k1 = _x86Multiply(k1, c2);
            h1 ^= k1;
            h1 = _x86Rotl(h1, 13);
            h1 = _x86Multiply(h1, 5) + 3864292196;
          }
          k1 = 0;
          switch (remainder) {
            case 3:
              k1 ^= bytes[i + 2] << 16;
            case 2:
              k1 ^= bytes[i + 1] << 8;
            case 1:
              k1 ^= bytes[i];
              k1 = _x86Multiply(k1, c1);
              k1 = _x86Rotl(k1, 15);
              k1 = _x86Multiply(k1, c2);
              h1 ^= k1;
          }
          h1 ^= bytes.length;
          h1 = _x86Fmix(h1);
          return h1 >>> 0;
        };
        library.x86.hash128 = function (bytes, seed) {
          if (library.inputValidation && !_validBytes(bytes)) {
            return undefined2;
          }
          seed = seed || 0;
          var remainder = bytes.length % 16;
          var blocks = bytes.length - remainder;
          var h1 = seed;
          var h2 = seed;
          var h3 = seed;
          var h4 = seed;
          var k1 = 0;
          var k2 = 0;
          var k3 = 0;
          var k4 = 0;
          var c1 = 597399067;
          var c2 = 2869860233;
          var c3 = 951274213;
          var c4 = 2716044179;
          for (var i = 0; i < blocks; i = i + 16) {
            k1 =
              bytes[i] |
              (bytes[i + 1] << 8) |
              (bytes[i + 2] << 16) |
              (bytes[i + 3] << 24);
            k2 =
              bytes[i + 4] |
              (bytes[i + 5] << 8) |
              (bytes[i + 6] << 16) |
              (bytes[i + 7] << 24);
            k3 =
              bytes[i + 8] |
              (bytes[i + 9] << 8) |
              (bytes[i + 10] << 16) |
              (bytes[i + 11] << 24);
            k4 =
              bytes[i + 12] |
              (bytes[i + 13] << 8) |
              (bytes[i + 14] << 16) |
              (bytes[i + 15] << 24);
            k1 = _x86Multiply(k1, c1);
            k1 = _x86Rotl(k1, 15);
            k1 = _x86Multiply(k1, c2);
            h1 ^= k1;
            h1 = _x86Rotl(h1, 19);
            h1 += h2;
            h1 = _x86Multiply(h1, 5) + 1444728091;
            k2 = _x86Multiply(k2, c2);
            k2 = _x86Rotl(k2, 16);
            k2 = _x86Multiply(k2, c3);
            h2 ^= k2;
            h2 = _x86Rotl(h2, 17);
            h2 += h3;
            h2 = _x86Multiply(h2, 5) + 197830471;
            k3 = _x86Multiply(k3, c3);
            k3 = _x86Rotl(k3, 17);
            k3 = _x86Multiply(k3, c4);
            h3 ^= k3;
            h3 = _x86Rotl(h3, 15);
            h3 += h4;
            h3 = _x86Multiply(h3, 5) + 2530024501;
            k4 = _x86Multiply(k4, c4);
            k4 = _x86Rotl(k4, 18);
            k4 = _x86Multiply(k4, c1);
            h4 ^= k4;
            h4 = _x86Rotl(h4, 13);
            h4 += h1;
            h4 = _x86Multiply(h4, 5) + 850148119;
          }
          k1 = 0;
          k2 = 0;
          k3 = 0;
          k4 = 0;
          switch (remainder) {
            case 15:
              k4 ^= bytes[i + 14] << 16;
            case 14:
              k4 ^= bytes[i + 13] << 8;
            case 13:
              k4 ^= bytes[i + 12];
              k4 = _x86Multiply(k4, c4);
              k4 = _x86Rotl(k4, 18);
              k4 = _x86Multiply(k4, c1);
              h4 ^= k4;
            case 12:
              k3 ^= bytes[i + 11] << 24;
            case 11:
              k3 ^= bytes[i + 10] << 16;
            case 10:
              k3 ^= bytes[i + 9] << 8;
            case 9:
              k3 ^= bytes[i + 8];
              k3 = _x86Multiply(k3, c3);
              k3 = _x86Rotl(k3, 17);
              k3 = _x86Multiply(k3, c4);
              h3 ^= k3;
            case 8:
              k2 ^= bytes[i + 7] << 24;
            case 7:
              k2 ^= bytes[i + 6] << 16;
            case 6:
              k2 ^= bytes[i + 5] << 8;
            case 5:
              k2 ^= bytes[i + 4];
              k2 = _x86Multiply(k2, c2);
              k2 = _x86Rotl(k2, 16);
              k2 = _x86Multiply(k2, c3);
              h2 ^= k2;
            case 4:
              k1 ^= bytes[i + 3] << 24;
            case 3:
              k1 ^= bytes[i + 2] << 16;
            case 2:
              k1 ^= bytes[i + 1] << 8;
            case 1:
              k1 ^= bytes[i];
              k1 = _x86Multiply(k1, c1);
              k1 = _x86Rotl(k1, 15);
              k1 = _x86Multiply(k1, c2);
              h1 ^= k1;
          }
          h1 ^= bytes.length;
          h2 ^= bytes.length;
          h3 ^= bytes.length;
          h4 ^= bytes.length;
          h1 += h2;
          h1 += h3;
          h1 += h4;
          h2 += h1;
          h3 += h1;
          h4 += h1;
          h1 = _x86Fmix(h1);
          h2 = _x86Fmix(h2);
          h3 = _x86Fmix(h3);
          h4 = _x86Fmix(h4);
          h1 += h2;
          h1 += h3;
          h1 += h4;
          h2 += h1;
          h3 += h1;
          h4 += h1;
          return (
            ('00000000' + (h1 >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h2 >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h3 >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h4 >>> 0).toString(16)).slice(-8)
          );
        };
        library.x64.hash128 = function (bytes, seed) {
          if (library.inputValidation && !_validBytes(bytes)) {
            return undefined2;
          }
          seed = seed || 0;
          var remainder = bytes.length % 16;
          var blocks = bytes.length - remainder;
          var h1 = [0, seed];
          var h2 = [0, seed];
          var k1 = [0, 0];
          var k2 = [0, 0];
          var c1 = [2277735313, 289559509];
          var c2 = [1291169091, 658871167];
          for (var i = 0; i < blocks; i = i + 16) {
            k1 = [
              bytes[i + 4] |
                (bytes[i + 5] << 8) |
                (bytes[i + 6] << 16) |
                (bytes[i + 7] << 24),
              bytes[i] |
                (bytes[i + 1] << 8) |
                (bytes[i + 2] << 16) |
                (bytes[i + 3] << 24),
            ];
            k2 = [
              bytes[i + 12] |
                (bytes[i + 13] << 8) |
                (bytes[i + 14] << 16) |
                (bytes[i + 15] << 24),
              bytes[i + 8] |
                (bytes[i + 9] << 8) |
                (bytes[i + 10] << 16) |
                (bytes[i + 11] << 24),
            ];
            k1 = _x64Multiply(k1, c1);
            k1 = _x64Rotl(k1, 31);
            k1 = _x64Multiply(k1, c2);
            h1 = _x64Xor(h1, k1);
            h1 = _x64Rotl(h1, 27);
            h1 = _x64Add(h1, h2);
            h1 = _x64Add(_x64Multiply(h1, [0, 5]), [0, 1390208809]);
            k2 = _x64Multiply(k2, c2);
            k2 = _x64Rotl(k2, 33);
            k2 = _x64Multiply(k2, c1);
            h2 = _x64Xor(h2, k2);
            h2 = _x64Rotl(h2, 31);
            h2 = _x64Add(h2, h1);
            h2 = _x64Add(_x64Multiply(h2, [0, 5]), [0, 944331445]);
          }
          k1 = [0, 0];
          k2 = [0, 0];
          switch (remainder) {
            case 15:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 14]], 48));
            case 14:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 13]], 40));
            case 13:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 12]], 32));
            case 12:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 11]], 24));
            case 11:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 10]], 16));
            case 10:
              k2 = _x64Xor(k2, _x64LeftShift([0, bytes[i + 9]], 8));
            case 9:
              k2 = _x64Xor(k2, [0, bytes[i + 8]]);
              k2 = _x64Multiply(k2, c2);
              k2 = _x64Rotl(k2, 33);
              k2 = _x64Multiply(k2, c1);
              h2 = _x64Xor(h2, k2);
            case 8:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 7]], 56));
            case 7:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 6]], 48));
            case 6:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 5]], 40));
            case 5:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 4]], 32));
            case 4:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 3]], 24));
            case 3:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 2]], 16));
            case 2:
              k1 = _x64Xor(k1, _x64LeftShift([0, bytes[i + 1]], 8));
            case 1:
              k1 = _x64Xor(k1, [0, bytes[i]]);
              k1 = _x64Multiply(k1, c1);
              k1 = _x64Rotl(k1, 31);
              k1 = _x64Multiply(k1, c2);
              h1 = _x64Xor(h1, k1);
          }
          h1 = _x64Xor(h1, [0, bytes.length]);
          h2 = _x64Xor(h2, [0, bytes.length]);
          h1 = _x64Add(h1, h2);
          h2 = _x64Add(h2, h1);
          h1 = _x64Fmix(h1);
          h2 = _x64Fmix(h2);
          h1 = _x64Add(h1, h2);
          h2 = _x64Add(h2, h1);
          return (
            ('00000000' + (h1[0] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h1[1] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h2[0] >>> 0).toString(16)).slice(-8) +
            ('00000000' + (h2[1] >>> 0).toString(16)).slice(-8)
          );
        };
        if (typeof exports2 !== 'undefined') {
          if (typeof module2 !== 'undefined' && module2.exports) {
            exports2 = module2.exports = library;
          }
          exports2.murmurHash3 = library;
        } else if (typeof define === 'function' && define.amd) {
          define([], function () {
            return library;
          });
        } else {
          library._murmurHash3 = root.murmurHash3;
          library.noConflict = function () {
            root.murmurHash3 = library._murmurHash3;
            library._murmurHash3 = undefined2;
            library.noConflict = undefined2;
            return library;
          };
          root.murmurHash3 = library;
        }
      })(exports2);
    },
  });

  // node_modules/murmurhash3js-revisited/index.js
  var require_murmurhash3js_revisited = __commonJS({
    'node_modules/murmurhash3js-revisited/index.js'(exports2, module2) {
      module2.exports = require_murmurHash3js();
    },
  });

  // node_modules/err-code/index.js
  var require_err_code = __commonJS({
    'node_modules/err-code/index.js'(exports2, module2) {
      'use strict';
      function assign(obj, props) {
        for (const key in props) {
          Object.defineProperty(obj, key, {
            value: props[key],
            enumerable: true,
            configurable: true,
          });
        }
        return obj;
      }
      function createError(err, code4, props) {
        if (!err || typeof err === 'string') {
          throw new TypeError('Please pass an Error to err-code');
        }
        if (!props) {
          props = {};
        }
        if (typeof code4 === 'object') {
          props = code4;
          code4 = '';
        }
        if (code4) {
          props.code = code4;
        }
        try {
          return assign(err, props);
        } catch (_) {
          props.message = err.message;
          props.stack = err.stack;
          const ErrClass = function () {};
          ErrClass.prototype = Object.create(Object.getPrototypeOf(err));
          const output = assign(new ErrClass(), props);
          return output;
        }
      }
      module2.exports = createError;
    },
  });

  // node_modules/@protobufjs/aspromise/index.js
  var require_aspromise = __commonJS({
    'node_modules/@protobufjs/aspromise/index.js'(exports2, module2) {
      'use strict';
      module2.exports = asPromise;
      function asPromise(fn, ctx) {
        var params = new Array(arguments.length - 1),
          offset = 0,
          index = 2,
          pending = true;
        while (index < arguments.length) params[offset++] = arguments[index++];
        return new Promise(function executor(resolve, reject) {
          params[offset] = function callback(err) {
            if (pending) {
              pending = false;
              if (err) reject(err);
              else {
                var params2 = new Array(arguments.length - 1),
                  offset2 = 0;
                while (offset2 < params2.length)
                  params2[offset2++] = arguments[offset2];
                resolve.apply(null, params2);
              }
            }
          };
          try {
            fn.apply(ctx || null, params);
          } catch (err) {
            if (pending) {
              pending = false;
              reject(err);
            }
          }
        });
      }
    },
  });

  // node_modules/@protobufjs/base64/index.js
  var require_base64 = __commonJS({
    'node_modules/@protobufjs/base64/index.js'(exports2) {
      'use strict';
      var base642 = exports2;
      base642.length = function length2(string2) {
        var p = string2.length;
        if (!p) return 0;
        var n = 0;
        while (--p % 4 > 1 && string2.charAt(p) === '=') ++n;
        return Math.ceil(string2.length * 3) / 4 - n;
      };
      var b64 = new Array(64);
      var s64 = new Array(123);
      for (i = 0; i < 64; )
        s64[
          (b64[i] =
            i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : (i - 59) | 43)
        ] = i++;
      var i;
      base642.encode = function encode7(buffer, start, end) {
        var parts = null,
          chunk = [];
        var i2 = 0,
          j = 0,
          t;
        while (start < end) {
          var b = buffer[start++];
          switch (j) {
            case 0:
              chunk[i2++] = b64[b >> 2];
              t = (b & 3) << 4;
              j = 1;
              break;
            case 1:
              chunk[i2++] = b64[t | (b >> 4)];
              t = (b & 15) << 2;
              j = 2;
              break;
            case 2:
              chunk[i2++] = b64[t | (b >> 6)];
              chunk[i2++] = b64[b & 63];
              j = 0;
              break;
          }
          if (i2 > 8191) {
            (parts || (parts = [])).push(
              String.fromCharCode.apply(String, chunk)
            );
            i2 = 0;
          }
        }
        if (j) {
          chunk[i2++] = b64[t];
          chunk[i2++] = 61;
          if (j === 1) chunk[i2++] = 61;
        }
        if (parts) {
          if (i2)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i2)));
          return parts.join('');
        }
        return String.fromCharCode.apply(String, chunk.slice(0, i2));
      };
      var invalidEncoding = 'invalid encoding';
      base642.decode = function decode8(string2, buffer, offset) {
        var start = offset;
        var j = 0,
          t;
        for (var i2 = 0; i2 < string2.length; ) {
          var c = string2.charCodeAt(i2++);
          if (c === 61 && j > 1) break;
          if ((c = s64[c]) === void 0) throw Error(invalidEncoding);
          switch (j) {
            case 0:
              t = c;
              j = 1;
              break;
            case 1:
              buffer[offset++] = (t << 2) | ((c & 48) >> 4);
              t = c;
              j = 2;
              break;
            case 2:
              buffer[offset++] = ((t & 15) << 4) | ((c & 60) >> 2);
              t = c;
              j = 3;
              break;
            case 3:
              buffer[offset++] = ((t & 3) << 6) | c;
              j = 0;
              break;
          }
        }
        if (j === 1) throw Error(invalidEncoding);
        return offset - start;
      };
      base642.test = function test(string2) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
          string2
        );
      };
    },
  });

  // node_modules/@protobufjs/eventemitter/index.js
  var require_eventemitter = __commonJS({
    'node_modules/@protobufjs/eventemitter/index.js'(exports2, module2) {
      'use strict';
      module2.exports = EventEmitter;
      function EventEmitter() {
        this._listeners = {};
      }
      EventEmitter.prototype.on = function on(evt, fn, ctx) {
        (this._listeners[evt] || (this._listeners[evt] = [])).push({
          fn,
          ctx: ctx || this,
        });
        return this;
      };
      EventEmitter.prototype.off = function off(evt, fn) {
        if (evt === void 0) this._listeners = {};
        else {
          if (fn === void 0) this._listeners[evt] = [];
          else {
            var listeners = this._listeners[evt];
            for (var i = 0; i < listeners.length; )
              if (listeners[i].fn === fn) listeners.splice(i, 1);
              else ++i;
          }
        }
        return this;
      };
      EventEmitter.prototype.emit = function emit(evt) {
        var listeners = this._listeners[evt];
        if (listeners) {
          var args = [],
            i = 1;
          for (; i < arguments.length; ) args.push(arguments[i++]);
          for (i = 0; i < listeners.length; )
            listeners[i].fn.apply(listeners[i++].ctx, args);
        }
        return this;
      };
    },
  });

  // node_modules/@protobufjs/float/index.js
  var require_float = __commonJS({
    'node_modules/@protobufjs/float/index.js'(exports2, module2) {
      'use strict';
      module2.exports = factory(factory);
      function factory(exports3) {
        if (typeof Float32Array !== 'undefined')
          (function () {
            var f32 = new Float32Array([-0]),
              f8b = new Uint8Array(f32.buffer),
              le = f8b[3] === 128;
            function writeFloat_f32_cpy(val, buf, pos) {
              f32[0] = val;
              buf[pos] = f8b[0];
              buf[pos + 1] = f8b[1];
              buf[pos + 2] = f8b[2];
              buf[pos + 3] = f8b[3];
            }
            function writeFloat_f32_rev(val, buf, pos) {
              f32[0] = val;
              buf[pos] = f8b[3];
              buf[pos + 1] = f8b[2];
              buf[pos + 2] = f8b[1];
              buf[pos + 3] = f8b[0];
            }
            exports3.writeFloatLE = le
              ? writeFloat_f32_cpy
              : writeFloat_f32_rev;
            exports3.writeFloatBE = le
              ? writeFloat_f32_rev
              : writeFloat_f32_cpy;
            function readFloat_f32_cpy(buf, pos) {
              f8b[0] = buf[pos];
              f8b[1] = buf[pos + 1];
              f8b[2] = buf[pos + 2];
              f8b[3] = buf[pos + 3];
              return f32[0];
            }
            function readFloat_f32_rev(buf, pos) {
              f8b[3] = buf[pos];
              f8b[2] = buf[pos + 1];
              f8b[1] = buf[pos + 2];
              f8b[0] = buf[pos + 3];
              return f32[0];
            }
            exports3.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
            exports3.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;
          })();
        else
          (function () {
            function writeFloat_ieee754(writeUint, val, buf, pos) {
              var sign = val < 0 ? 1 : 0;
              if (sign) val = -val;
              if (val === 0)
                writeUint(
                  1 / val > 0
                    ? /* positive */
                      0
                    : /* negative 0 */
                      2147483648,
                  buf,
                  pos
                );
              else if (isNaN(val)) writeUint(2143289344, buf, pos);
              else if (val > 34028234663852886e22)
                writeUint(((sign << 31) | 2139095040) >>> 0, buf, pos);
              else if (val < 11754943508222875e-54)
                writeUint(
                  ((sign << 31) | Math.round(val / 1401298464324817e-60)) >>> 0,
                  buf,
                  pos
                );
              else {
                var exponent = Math.floor(Math.log(val) / Math.LN2),
                  mantissa =
                    Math.round(val * Math.pow(2, -exponent) * 8388608) &
                    8388607;
                writeUint(
                  ((sign << 31) | ((exponent + 127) << 23) | mantissa) >>> 0,
                  buf,
                  pos
                );
              }
            }
            exports3.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
            exports3.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);
            function readFloat_ieee754(readUint, buf, pos) {
              var uint = readUint(buf, pos),
                sign = (uint >> 31) * 2 + 1,
                exponent = (uint >>> 23) & 255,
                mantissa = uint & 8388607;
              return exponent === 255
                ? mantissa
                  ? NaN
                  : sign * Infinity
                : exponent === 0
                ? sign * 1401298464324817e-60 * mantissa
                : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
            }
            exports3.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
            exports3.readFloatBE = readFloat_ieee754.bind(null, readUintBE);
          })();
        if (typeof Float64Array !== 'undefined')
          (function () {
            var f64 = new Float64Array([-0]),
              f8b = new Uint8Array(f64.buffer),
              le = f8b[7] === 128;
            function writeDouble_f64_cpy(val, buf, pos) {
              f64[0] = val;
              buf[pos] = f8b[0];
              buf[pos + 1] = f8b[1];
              buf[pos + 2] = f8b[2];
              buf[pos + 3] = f8b[3];
              buf[pos + 4] = f8b[4];
              buf[pos + 5] = f8b[5];
              buf[pos + 6] = f8b[6];
              buf[pos + 7] = f8b[7];
            }
            function writeDouble_f64_rev(val, buf, pos) {
              f64[0] = val;
              buf[pos] = f8b[7];
              buf[pos + 1] = f8b[6];
              buf[pos + 2] = f8b[5];
              buf[pos + 3] = f8b[4];
              buf[pos + 4] = f8b[3];
              buf[pos + 5] = f8b[2];
              buf[pos + 6] = f8b[1];
              buf[pos + 7] = f8b[0];
            }
            exports3.writeDoubleLE = le
              ? writeDouble_f64_cpy
              : writeDouble_f64_rev;
            exports3.writeDoubleBE = le
              ? writeDouble_f64_rev
              : writeDouble_f64_cpy;
            function readDouble_f64_cpy(buf, pos) {
              f8b[0] = buf[pos];
              f8b[1] = buf[pos + 1];
              f8b[2] = buf[pos + 2];
              f8b[3] = buf[pos + 3];
              f8b[4] = buf[pos + 4];
              f8b[5] = buf[pos + 5];
              f8b[6] = buf[pos + 6];
              f8b[7] = buf[pos + 7];
              return f64[0];
            }
            function readDouble_f64_rev(buf, pos) {
              f8b[7] = buf[pos];
              f8b[6] = buf[pos + 1];
              f8b[5] = buf[pos + 2];
              f8b[4] = buf[pos + 3];
              f8b[3] = buf[pos + 4];
              f8b[2] = buf[pos + 5];
              f8b[1] = buf[pos + 6];
              f8b[0] = buf[pos + 7];
              return f64[0];
            }
            exports3.readDoubleLE = le
              ? readDouble_f64_cpy
              : readDouble_f64_rev;
            exports3.readDoubleBE = le
              ? readDouble_f64_rev
              : readDouble_f64_cpy;
          })();
        else
          (function () {
            function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
              var sign = val < 0 ? 1 : 0;
              if (sign) val = -val;
              if (val === 0) {
                writeUint(0, buf, pos + off0);
                writeUint(
                  1 / val > 0
                    ? /* positive */
                      0
                    : /* negative 0 */
                      2147483648,
                  buf,
                  pos + off1
                );
              } else if (isNaN(val)) {
                writeUint(0, buf, pos + off0);
                writeUint(2146959360, buf, pos + off1);
              } else if (val > 17976931348623157e292) {
                writeUint(0, buf, pos + off0);
                writeUint(((sign << 31) | 2146435072) >>> 0, buf, pos + off1);
              } else {
                var mantissa;
                if (val < 22250738585072014e-324) {
                  mantissa = val / 5e-324;
                  writeUint(mantissa >>> 0, buf, pos + off0);
                  writeUint(
                    ((sign << 31) | (mantissa / 4294967296)) >>> 0,
                    buf,
                    pos + off1
                  );
                } else {
                  var exponent = Math.floor(Math.log(val) / Math.LN2);
                  if (exponent === 1024) exponent = 1023;
                  mantissa = val * Math.pow(2, -exponent);
                  writeUint(
                    (mantissa * 4503599627370496) >>> 0,
                    buf,
                    pos + off0
                  );
                  writeUint(
                    ((sign << 31) |
                      ((exponent + 1023) << 20) |
                      ((mantissa * 1048576) & 1048575)) >>>
                      0,
                    buf,
                    pos + off1
                  );
                }
              }
            }
            exports3.writeDoubleLE = writeDouble_ieee754.bind(
              null,
              writeUintLE,
              0,
              4
            );
            exports3.writeDoubleBE = writeDouble_ieee754.bind(
              null,
              writeUintBE,
              4,
              0
            );
            function readDouble_ieee754(readUint, off0, off1, buf, pos) {
              var lo = readUint(buf, pos + off0),
                hi = readUint(buf, pos + off1);
              var sign = (hi >> 31) * 2 + 1,
                exponent = (hi >>> 20) & 2047,
                mantissa = 4294967296 * (hi & 1048575) + lo;
              return exponent === 2047
                ? mantissa
                  ? NaN
                  : sign * Infinity
                : exponent === 0
                ? sign * 5e-324 * mantissa
                : sign *
                  Math.pow(2, exponent - 1075) *
                  (mantissa + 4503599627370496);
            }
            exports3.readDoubleLE = readDouble_ieee754.bind(
              null,
              readUintLE,
              0,
              4
            );
            exports3.readDoubleBE = readDouble_ieee754.bind(
              null,
              readUintBE,
              4,
              0
            );
          })();
        return exports3;
      }
      function writeUintLE(val, buf, pos) {
        buf[pos] = val & 255;
        buf[pos + 1] = (val >>> 8) & 255;
        buf[pos + 2] = (val >>> 16) & 255;
        buf[pos + 3] = val >>> 24;
      }
      function writeUintBE(val, buf, pos) {
        buf[pos] = val >>> 24;
        buf[pos + 1] = (val >>> 16) & 255;
        buf[pos + 2] = (val >>> 8) & 255;
        buf[pos + 3] = val & 255;
      }
      function readUintLE(buf, pos) {
        return (
          (buf[pos] |
            (buf[pos + 1] << 8) |
            (buf[pos + 2] << 16) |
            (buf[pos + 3] << 24)) >>>
          0
        );
      }
      function readUintBE(buf, pos) {
        return (
          ((buf[pos] << 24) |
            (buf[pos + 1] << 16) |
            (buf[pos + 2] << 8) |
            buf[pos + 3]) >>>
          0
        );
      }
    },
  });

  // node_modules/@protobufjs/inquire/index.js
  var require_inquire = __commonJS({
    'node_modules/@protobufjs/inquire/index.js'(exports, module) {
      'use strict';
      module.exports = inquire;
      function inquire(moduleName) {
        try {
          var mod = eval('quire'.replace(/^/, 're'))(moduleName);
          if (mod && (mod.length || Object.keys(mod).length)) return mod;
        } catch (e) {}
        return null;
      }
    },
  });

  // node_modules/@protobufjs/utf8/index.js
  var require_utf8 = __commonJS({
    'node_modules/@protobufjs/utf8/index.js'(exports2) {
      'use strict';
      var utf8 = exports2;
      utf8.length = function utf8_length(string2) {
        var len = 0,
          c = 0;
        for (var i = 0; i < string2.length; ++i) {
          c = string2.charCodeAt(i);
          if (c < 128) len += 1;
          else if (c < 2048) len += 2;
          else if (
            (c & 64512) === 55296 &&
            (string2.charCodeAt(i + 1) & 64512) === 56320
          ) {
            ++i;
            len += 4;
          } else len += 3;
        }
        return len;
      };
      utf8.read = function utf8_read(buffer, start, end) {
        var len = end - start;
        if (len < 1) return '';
        var parts = null,
          chunk = [],
          i = 0,
          t;
        while (start < end) {
          t = buffer[start++];
          if (t < 128) chunk[i++] = t;
          else if (t > 191 && t < 224)
            chunk[i++] = ((t & 31) << 6) | (buffer[start++] & 63);
          else if (t > 239 && t < 365) {
            t =
              (((t & 7) << 18) |
                ((buffer[start++] & 63) << 12) |
                ((buffer[start++] & 63) << 6) |
                (buffer[start++] & 63)) -
              65536;
            chunk[i++] = 55296 + (t >> 10);
            chunk[i++] = 56320 + (t & 1023);
          } else
            chunk[i++] =
              ((t & 15) << 12) |
              ((buffer[start++] & 63) << 6) |
              (buffer[start++] & 63);
          if (i > 8191) {
            (parts || (parts = [])).push(
              String.fromCharCode.apply(String, chunk)
            );
            i = 0;
          }
        }
        if (parts) {
          if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
          return parts.join('');
        }
        return String.fromCharCode.apply(String, chunk.slice(0, i));
      };
      utf8.write = function utf8_write(string2, buffer, offset) {
        var start = offset,
          c1,
          c2;
        for (var i = 0; i < string2.length; ++i) {
          c1 = string2.charCodeAt(i);
          if (c1 < 128) {
            buffer[offset++] = c1;
          } else if (c1 < 2048) {
            buffer[offset++] = (c1 >> 6) | 192;
            buffer[offset++] = (c1 & 63) | 128;
          } else if (
            (c1 & 64512) === 55296 &&
            ((c2 = string2.charCodeAt(i + 1)) & 64512) === 56320
          ) {
            c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
            ++i;
            buffer[offset++] = (c1 >> 18) | 240;
            buffer[offset++] = ((c1 >> 12) & 63) | 128;
            buffer[offset++] = ((c1 >> 6) & 63) | 128;
            buffer[offset++] = (c1 & 63) | 128;
          } else {
            buffer[offset++] = (c1 >> 12) | 224;
            buffer[offset++] = ((c1 >> 6) & 63) | 128;
            buffer[offset++] = (c1 & 63) | 128;
          }
        }
        return offset - start;
      };
    },
  });

  // node_modules/@protobufjs/pool/index.js
  var require_pool = __commonJS({
    'node_modules/@protobufjs/pool/index.js'(exports2, module2) {
      'use strict';
      module2.exports = pool;
      function pool(alloc2, slice, size) {
        var SIZE = size || 8192;
        var MAX = SIZE >>> 1;
        var slab = null;
        var offset = SIZE;
        return function pool_alloc(size2) {
          if (size2 < 1 || size2 > MAX) return alloc2(size2);
          if (offset + size2 > SIZE) {
            slab = alloc2(SIZE);
            offset = 0;
          }
          var buf = slice.call(slab, offset, (offset += size2));
          if (offset & 7) offset = (offset | 7) + 1;
          return buf;
        };
      }
    },
  });

  // node_modules/protobufjs/src/util/longbits.js
  var require_longbits = __commonJS({
    'node_modules/protobufjs/src/util/longbits.js'(exports2, module2) {
      'use strict';
      module2.exports = LongBits;
      var util = require_minimal();
      function LongBits(lo, hi) {
        this.lo = lo >>> 0;
        this.hi = hi >>> 0;
      }
      var zero = (LongBits.zero = new LongBits(0, 0));
      zero.toNumber = function () {
        return 0;
      };
      zero.zzEncode = zero.zzDecode = function () {
        return this;
      };
      zero.length = function () {
        return 1;
      };
      var zeroHash = (LongBits.zeroHash = '\0\0\0\0\0\0\0\0');
      LongBits.fromNumber = function fromNumber(value) {
        if (value === 0) return zero;
        var sign = value < 0;
        if (sign) value = -value;
        var lo = value >>> 0,
          hi = ((value - lo) / 4294967296) >>> 0;
        if (sign) {
          hi = ~hi >>> 0;
          lo = ~lo >>> 0;
          if (++lo > 4294967295) {
            lo = 0;
            if (++hi > 4294967295) hi = 0;
          }
        }
        return new LongBits(lo, hi);
      };
      LongBits.from = function from3(value) {
        if (typeof value === 'number') return LongBits.fromNumber(value);
        if (util.isString(value)) {
          if (util.Long) value = util.Long.fromString(value);
          else return LongBits.fromNumber(parseInt(value, 10));
        }
        return value.low || value.high
          ? new LongBits(value.low >>> 0, value.high >>> 0)
          : zero;
      };
      LongBits.prototype.toNumber = function toNumber(unsigned) {
        if (!unsigned && this.hi >>> 31) {
          var lo = (~this.lo + 1) >>> 0,
            hi = ~this.hi >>> 0;
          if (!lo) hi = (hi + 1) >>> 0;
          return -(lo + hi * 4294967296);
        }
        return this.lo + this.hi * 4294967296;
      };
      LongBits.prototype.toLong = function toLong(unsigned) {
        return util.Long
          ? new util.Long(this.lo | 0, this.hi | 0, Boolean(unsigned))
          : {
              low: this.lo | 0,
              high: this.hi | 0,
              unsigned: Boolean(unsigned),
            };
      };
      var charCodeAt = String.prototype.charCodeAt;
      LongBits.fromHash = function fromHash(hash) {
        if (hash === zeroHash) return zero;
        return new LongBits(
          (charCodeAt.call(hash, 0) |
            (charCodeAt.call(hash, 1) << 8) |
            (charCodeAt.call(hash, 2) << 16) |
            (charCodeAt.call(hash, 3) << 24)) >>>
            0,
          (charCodeAt.call(hash, 4) |
            (charCodeAt.call(hash, 5) << 8) |
            (charCodeAt.call(hash, 6) << 16) |
            (charCodeAt.call(hash, 7) << 24)) >>>
            0
        );
      };
      LongBits.prototype.toHash = function toHash() {
        return String.fromCharCode(
          this.lo & 255,
          (this.lo >>> 8) & 255,
          (this.lo >>> 16) & 255,
          this.lo >>> 24,
          this.hi & 255,
          (this.hi >>> 8) & 255,
          (this.hi >>> 16) & 255,
          this.hi >>> 24
        );
      };
      LongBits.prototype.zzEncode = function zzEncode() {
        var mask = this.hi >> 31;
        this.hi = (((this.hi << 1) | (this.lo >>> 31)) ^ mask) >>> 0;
        this.lo = ((this.lo << 1) ^ mask) >>> 0;
        return this;
      };
      LongBits.prototype.zzDecode = function zzDecode() {
        var mask = -(this.lo & 1);
        this.lo = (((this.lo >>> 1) | (this.hi << 31)) ^ mask) >>> 0;
        this.hi = ((this.hi >>> 1) ^ mask) >>> 0;
        return this;
      };
      LongBits.prototype.length = function length2() {
        var part0 = this.lo,
          part1 = ((this.lo >>> 28) | (this.hi << 4)) >>> 0,
          part2 = this.hi >>> 24;
        return part2 === 0
          ? part1 === 0
            ? part0 < 16384
              ? part0 < 128
                ? 1
                : 2
              : part0 < 2097152
              ? 3
              : 4
            : part1 < 16384
            ? part1 < 128
              ? 5
              : 6
            : part1 < 2097152
            ? 7
            : 8
          : part2 < 128
          ? 9
          : 10;
      };
    },
  });

  // node_modules/protobufjs/src/util/minimal.js
  var require_minimal = __commonJS({
    'node_modules/protobufjs/src/util/minimal.js'(exports2) {
      'use strict';
      var util = exports2;
      util.asPromise = require_aspromise();
      util.base64 = require_base64();
      util.EventEmitter = require_eventemitter();
      util.float = require_float();
      util.inquire = require_inquire();
      util.utf8 = require_utf8();
      util.pool = require_pool();
      util.LongBits = require_longbits();
      util.isNode = Boolean(
        typeof global !== 'undefined' &&
          global &&
          global.process &&
          global.process.versions &&
          global.process.versions.node
      );
      util.global =
        (util.isNode && global) ||
        (typeof window !== 'undefined' && window) ||
        (typeof self !== 'undefined' && self) ||
        exports2;
      util.emptyArray = Object.freeze
        ? Object.freeze([])
        : /* istanbul ignore next */
          [];
      util.emptyObject = Object.freeze
        ? Object.freeze({})
        : /* istanbul ignore next */
          {};
      util.isInteger =
        Number.isInteger /* istanbul ignore next */ ||
        function isInteger(value) {
          return (
            typeof value === 'number' &&
            isFinite(value) &&
            Math.floor(value) === value
          );
        };
      util.isString = function isString(value) {
        return typeof value === 'string' || value instanceof String;
      };
      util.isObject = function isObject(value) {
        return value && typeof value === 'object';
      };
      util.isset =
        /**
         * Checks if a property on a message is considered to be present.
         * @param {Object} obj Plain object or message instance
         * @param {string} prop Property name
         * @returns {boolean} `true` if considered to be present, otherwise `false`
         */
        util.isSet = function isSet(obj, prop) {
          var value = obj[prop];
          if (value != null && obj.hasOwnProperty(prop))
            return (
              typeof value !== 'object' ||
              (Array.isArray(value)
                ? value.length
                : Object.keys(value).length) > 0
            );
          return false;
        };
      util.Buffer = (function () {
        try {
          var Buffer2 = util.inquire('buffer').Buffer;
          return Buffer2.prototype.utf8Write
            ? Buffer2
            : /* istanbul ignore next */
              null;
        } catch (e) {
          return null;
        }
      })();
      util._Buffer_from = null;
      util._Buffer_allocUnsafe = null;
      util.newBuffer = function newBuffer(sizeOrArray) {
        return typeof sizeOrArray === 'number'
          ? util.Buffer
            ? util._Buffer_allocUnsafe(sizeOrArray)
            : new util.Array(sizeOrArray)
          : util.Buffer
          ? util._Buffer_from(sizeOrArray)
          : typeof Uint8Array === 'undefined'
          ? sizeOrArray
          : new Uint8Array(sizeOrArray);
      };
      util.Array = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
      util.Long =
        /* istanbul ignore next */
        (util.global.dcodeIO /* istanbul ignore next */ &&
          util.global.dcodeIO.Long) /* istanbul ignore next */ ||
        util.global.Long ||
        util.inquire('long');
      util.key2Re = /^true|false|0|1$/;
      util.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
      util.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
      util.longToHash = function longToHash(value) {
        return value
          ? util.LongBits.from(value).toHash()
          : util.LongBits.zeroHash;
      };
      util.longFromHash = function longFromHash(hash, unsigned) {
        var bits = util.LongBits.fromHash(hash);
        if (util.Long) return util.Long.fromBits(bits.lo, bits.hi, unsigned);
        return bits.toNumber(Boolean(unsigned));
      };
      function merge(dst, src2, ifNotSet) {
        for (var keys = Object.keys(src2), i = 0; i < keys.length; ++i)
          if (dst[keys[i]] === void 0 || !ifNotSet)
            dst[keys[i]] = src2[keys[i]];
        return dst;
      }
      util.merge = merge;
      util.lcFirst = function lcFirst(str) {
        return str.charAt(0).toLowerCase() + str.substring(1);
      };
      function newError(name4) {
        function CustomError(message, properties) {
          if (!(this instanceof CustomError))
            return new CustomError(message, properties);
          Object.defineProperty(this, 'message', {
            get: function () {
              return message;
            },
          });
          if (Error.captureStackTrace)
            Error.captureStackTrace(this, CustomError);
          else
            Object.defineProperty(this, 'stack', {
              value: new Error().stack || '',
            });
          if (properties) merge(this, properties);
        }
        CustomError.prototype = Object.create(Error.prototype, {
          constructor: {
            value: CustomError,
            writable: true,
            enumerable: false,
            configurable: true,
          },
          name: {
            get() {
              return name4;
            },
            set: void 0,
            enumerable: false,
            // configurable: false would accurately preserve the behavior of
            // the original, but I'm guessing that was not intentional.
            // For an actual error subclass, this property would
            // be configurable.
            configurable: true,
          },
          toString: {
            value() {
              return this.name + ': ' + this.message;
            },
            writable: true,
            enumerable: false,
            configurable: true,
          },
        });
        return CustomError;
      }
      util.newError = newError;
      util.ProtocolError = newError('ProtocolError');
      util.oneOfGetter = function getOneOf(fieldNames) {
        var fieldMap = {};
        for (var i = 0; i < fieldNames.length; ++i) fieldMap[fieldNames[i]] = 1;
        return function () {
          for (
            var keys = Object.keys(this), i2 = keys.length - 1;
            i2 > -1;
            --i2
          )
            if (
              fieldMap[keys[i2]] === 1 &&
              this[keys[i2]] !== void 0 &&
              this[keys[i2]] !== null
            )
              return keys[i2];
        };
      };
      util.oneOfSetter = function setOneOf(fieldNames) {
        return function (name4) {
          for (var i = 0; i < fieldNames.length; ++i)
            if (fieldNames[i] !== name4) delete this[fieldNames[i]];
        };
      };
      util.toJSONOptions = {
        longs: String,
        enums: String,
        bytes: String,
        json: true,
      };
      util._configure = function () {
        var Buffer2 = util.Buffer;
        if (!Buffer2) {
          util._Buffer_from = util._Buffer_allocUnsafe = null;
          return;
        }
        util._Buffer_from =
          (Buffer2.from !== Uint8Array.from &&
            Buffer2.from) /* istanbul ignore next */ ||
          function Buffer_from(value, encoding) {
            return new Buffer2(value, encoding);
          };
        util._Buffer_allocUnsafe =
          Buffer2.allocUnsafe /* istanbul ignore next */ ||
          function Buffer_allocUnsafe(size) {
            return new Buffer2(size);
          };
      };
    },
  });

  // node_modules/protobufjs/src/writer.js
  var require_writer = __commonJS({
    'node_modules/protobufjs/src/writer.js'(exports2, module2) {
      'use strict';
      module2.exports = Writer;
      var util = require_minimal();
      var BufferWriter;
      var LongBits = util.LongBits;
      var base642 = util.base64;
      var utf8 = util.utf8;
      function Op(fn, len, val) {
        this.fn = fn;
        this.len = len;
        this.next = void 0;
        this.val = val;
      }
      function noop() {}
      function State(writer) {
        this.head = writer.head;
        this.tail = writer.tail;
        this.len = writer.len;
        this.next = writer.states;
      }
      function Writer() {
        this.len = 0;
        this.head = new Op(noop, 0, 0);
        this.tail = this.head;
        this.states = null;
      }
      var create3 = function create4() {
        return util.Buffer
          ? function create_buffer_setup() {
              return (Writer.create = function create_buffer() {
                return new BufferWriter();
              })();
            }
          : function create_array() {
              return new Writer();
            };
      };
      Writer.create = create3();
      Writer.alloc = function alloc2(size) {
        return new util.Array(size);
      };
      if (util.Array !== Array)
        Writer.alloc = util.pool(Writer.alloc, util.Array.prototype.subarray);
      Writer.prototype._push = function push(fn, len, val) {
        this.tail = this.tail.next = new Op(fn, len, val);
        this.len += len;
        return this;
      };
      function writeByte(val, buf, pos) {
        buf[pos] = val & 255;
      }
      function writeVarint32(val, buf, pos) {
        while (val > 127) {
          buf[pos++] = (val & 127) | 128;
          val >>>= 7;
        }
        buf[pos] = val;
      }
      function VarintOp(len, val) {
        this.len = len;
        this.next = void 0;
        this.val = val;
      }
      VarintOp.prototype = Object.create(Op.prototype);
      VarintOp.prototype.fn = writeVarint32;
      Writer.prototype.uint32 = function write_uint32(value) {
        this.len += (this.tail = this.tail.next =
          new VarintOp(
            (value = value >>> 0) < 128
              ? 1
              : value < 16384
              ? 2
              : value < 2097152
              ? 3
              : value < 268435456
              ? 4
              : 5,
            value
          )).len;
        return this;
      };
      Writer.prototype.int32 = function write_int32(value) {
        return value < 0
          ? this._push(writeVarint64, 10, LongBits.fromNumber(value))
          : this.uint32(value);
      };
      Writer.prototype.sint32 = function write_sint32(value) {
        return this.uint32(((value << 1) ^ (value >> 31)) >>> 0);
      };
      function writeVarint64(val, buf, pos) {
        while (val.hi) {
          buf[pos++] = (val.lo & 127) | 128;
          val.lo = ((val.lo >>> 7) | (val.hi << 25)) >>> 0;
          val.hi >>>= 7;
        }
        while (val.lo > 127) {
          buf[pos++] = (val.lo & 127) | 128;
          val.lo = val.lo >>> 7;
        }
        buf[pos++] = val.lo;
      }
      Writer.prototype.uint64 = function write_uint64(value) {
        var bits = LongBits.from(value);
        return this._push(writeVarint64, bits.length(), bits);
      };
      Writer.prototype.int64 = Writer.prototype.uint64;
      Writer.prototype.sint64 = function write_sint64(value) {
        var bits = LongBits.from(value).zzEncode();
        return this._push(writeVarint64, bits.length(), bits);
      };
      Writer.prototype.bool = function write_bool(value) {
        return this._push(writeByte, 1, value ? 1 : 0);
      };
      function writeFixed32(val, buf, pos) {
        buf[pos] = val & 255;
        buf[pos + 1] = (val >>> 8) & 255;
        buf[pos + 2] = (val >>> 16) & 255;
        buf[pos + 3] = val >>> 24;
      }
      Writer.prototype.fixed32 = function write_fixed32(value) {
        return this._push(writeFixed32, 4, value >>> 0);
      };
      Writer.prototype.sfixed32 = Writer.prototype.fixed32;
      Writer.prototype.fixed64 = function write_fixed64(value) {
        var bits = LongBits.from(value);
        return this._push(writeFixed32, 4, bits.lo)._push(
          writeFixed32,
          4,
          bits.hi
        );
      };
      Writer.prototype.sfixed64 = Writer.prototype.fixed64;
      Writer.prototype.float = function write_float(value) {
        return this._push(util.float.writeFloatLE, 4, value);
      };
      Writer.prototype.double = function write_double(value) {
        return this._push(util.float.writeDoubleLE, 8, value);
      };
      var writeBytes = util.Array.prototype.set
        ? function writeBytes_set(val, buf, pos) {
            buf.set(val, pos);
          }
        : function writeBytes_for(val, buf, pos) {
            for (var i = 0; i < val.length; ++i) buf[pos + i] = val[i];
          };
      Writer.prototype.bytes = function write_bytes(value) {
        var len = value.length >>> 0;
        if (!len) return this._push(writeByte, 1, 0);
        if (util.isString(value)) {
          var buf = Writer.alloc((len = base642.length(value)));
          base642.decode(value, buf, 0);
          value = buf;
        }
        return this.uint32(len)._push(writeBytes, len, value);
      };
      Writer.prototype.string = function write_string(value) {
        var len = utf8.length(value);
        return len
          ? this.uint32(len)._push(utf8.write, len, value)
          : this._push(writeByte, 1, 0);
      };
      Writer.prototype.fork = function fork() {
        this.states = new State(this);
        this.head = this.tail = new Op(noop, 0, 0);
        this.len = 0;
        return this;
      };
      Writer.prototype.reset = function reset() {
        if (this.states) {
          this.head = this.states.head;
          this.tail = this.states.tail;
          this.len = this.states.len;
          this.states = this.states.next;
        } else {
          this.head = this.tail = new Op(noop, 0, 0);
          this.len = 0;
        }
        return this;
      };
      Writer.prototype.ldelim = function ldelim() {
        var head = this.head,
          tail = this.tail,
          len = this.len;
        this.reset().uint32(len);
        if (len) {
          this.tail.next = head.next;
          this.tail = tail;
          this.len += len;
        }
        return this;
      };
      Writer.prototype.finish = function finish() {
        var head = this.head.next,
          buf = this.constructor.alloc(this.len),
          pos = 0;
        while (head) {
          head.fn(head.val, buf, pos);
          pos += head.len;
          head = head.next;
        }
        return buf;
      };
      Writer._configure = function (BufferWriter_) {
        BufferWriter = BufferWriter_;
        Writer.create = create3();
        BufferWriter._configure();
      };
    },
  });

  // node_modules/protobufjs/src/writer_buffer.js
  var require_writer_buffer = __commonJS({
    'node_modules/protobufjs/src/writer_buffer.js'(exports2, module2) {
      'use strict';
      module2.exports = BufferWriter;
      var Writer = require_writer();
      (BufferWriter.prototype = Object.create(Writer.prototype)).constructor =
        BufferWriter;
      var util = require_minimal();
      function BufferWriter() {
        Writer.call(this);
      }
      BufferWriter._configure = function () {
        BufferWriter.alloc = util._Buffer_allocUnsafe;
        BufferWriter.writeBytesBuffer =
          util.Buffer &&
          util.Buffer.prototype instanceof Uint8Array &&
          util.Buffer.prototype.set.name === 'set'
            ? function writeBytesBuffer_set(val, buf, pos) {
                buf.set(val, pos);
              }
            : function writeBytesBuffer_copy(val, buf, pos) {
                if (val.copy) val.copy(buf, pos, 0, val.length);
                else for (var i = 0; i < val.length; ) buf[pos++] = val[i++];
              };
      };
      BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
        if (util.isString(value)) value = util._Buffer_from(value, 'base64');
        var len = value.length >>> 0;
        this.uint32(len);
        if (len) this._push(BufferWriter.writeBytesBuffer, len, value);
        return this;
      };
      function writeStringBuffer(val, buf, pos) {
        if (val.length < 40) util.utf8.write(val, buf, pos);
        else if (buf.utf8Write) buf.utf8Write(val, pos);
        else buf.write(val, pos);
      }
      BufferWriter.prototype.string = function write_string_buffer(value) {
        var len = util.Buffer.byteLength(value);
        this.uint32(len);
        if (len) this._push(writeStringBuffer, len, value);
        return this;
      };
      BufferWriter._configure();
    },
  });

  // node_modules/protobufjs/src/reader.js
  var require_reader = __commonJS({
    'node_modules/protobufjs/src/reader.js'(exports2, module2) {
      'use strict';
      module2.exports = Reader;
      var util = require_minimal();
      var BufferReader;
      var LongBits = util.LongBits;
      var utf8 = util.utf8;
      function indexOutOfRange(reader, writeLength) {
        return RangeError(
          'index out of range: ' +
            reader.pos +
            ' + ' +
            (writeLength || 1) +
            ' > ' +
            reader.len
        );
      }
      function Reader(buffer) {
        this.buf = buffer;
        this.pos = 0;
        this.len = buffer.length;
      }
      var create_array =
        typeof Uint8Array !== 'undefined'
          ? function create_typed_array(buffer) {
              if (buffer instanceof Uint8Array || Array.isArray(buffer))
                return new Reader(buffer);
              throw Error('illegal buffer');
            }
          : function create_array2(buffer) {
              if (Array.isArray(buffer)) return new Reader(buffer);
              throw Error('illegal buffer');
            };
      var create3 = function create4() {
        return util.Buffer
          ? function create_buffer_setup(buffer) {
              return (Reader.create = function create_buffer(buffer2) {
                return util.Buffer.isBuffer(buffer2)
                  ? new BufferReader(buffer2)
                  : create_array(buffer2);
              })(buffer);
            }
          : create_array;
      };
      Reader.create = create3();
      Reader.prototype._slice =
        util.Array.prototype.subarray /* istanbul ignore next */ ||
        util.Array.prototype.slice;
      Reader.prototype.uint32 = (function read_uint32_setup() {
        var value = 4294967295;
        return function read_uint32() {
          value = (this.buf[this.pos] & 127) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | ((this.buf[this.pos] & 127) << 7)) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | ((this.buf[this.pos] & 127) << 14)) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | ((this.buf[this.pos] & 127) << 21)) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          value = (value | ((this.buf[this.pos] & 15) << 28)) >>> 0;
          if (this.buf[this.pos++] < 128) return value;
          if ((this.pos += 5) > this.len) {
            this.pos = this.len;
            throw indexOutOfRange(this, 10);
          }
          return value;
        };
      })();
      Reader.prototype.int32 = function read_int32() {
        return this.uint32() | 0;
      };
      Reader.prototype.sint32 = function read_sint32() {
        var value = this.uint32();
        return ((value >>> 1) ^ -(value & 1)) | 0;
      };
      function readLongVarint() {
        var bits = new LongBits(0, 0);
        var i = 0;
        if (this.len - this.pos > 4) {
          for (; i < 4; ++i) {
            bits.lo = (bits.lo | ((this.buf[this.pos] & 127) << (i * 7))) >>> 0;
            if (this.buf[this.pos++] < 128) return bits;
          }
          bits.lo = (bits.lo | ((this.buf[this.pos] & 127) << 28)) >>> 0;
          bits.hi = (bits.hi | ((this.buf[this.pos] & 127) >> 4)) >>> 0;
          if (this.buf[this.pos++] < 128) return bits;
          i = 0;
        } else {
          for (; i < 3; ++i) {
            if (this.pos >= this.len) throw indexOutOfRange(this);
            bits.lo = (bits.lo | ((this.buf[this.pos] & 127) << (i * 7))) >>> 0;
            if (this.buf[this.pos++] < 128) return bits;
          }
          bits.lo = (bits.lo | ((this.buf[this.pos++] & 127) << (i * 7))) >>> 0;
          return bits;
        }
        if (this.len - this.pos > 4) {
          for (; i < 5; ++i) {
            bits.hi =
              (bits.hi | ((this.buf[this.pos] & 127) << (i * 7 + 3))) >>> 0;
            if (this.buf[this.pos++] < 128) return bits;
          }
        } else {
          for (; i < 5; ++i) {
            if (this.pos >= this.len) throw indexOutOfRange(this);
            bits.hi =
              (bits.hi | ((this.buf[this.pos] & 127) << (i * 7 + 3))) >>> 0;
            if (this.buf[this.pos++] < 128) return bits;
          }
        }
        throw Error('invalid varint encoding');
      }
      Reader.prototype.bool = function read_bool() {
        return this.uint32() !== 0;
      };
      function readFixed32_end(buf, end) {
        return (
          (buf[end - 4] |
            (buf[end - 3] << 8) |
            (buf[end - 2] << 16) |
            (buf[end - 1] << 24)) >>>
          0
        );
      }
      Reader.prototype.fixed32 = function read_fixed32() {
        if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4);
        return readFixed32_end(this.buf, (this.pos += 4));
      };
      Reader.prototype.sfixed32 = function read_sfixed32() {
        if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4);
        return readFixed32_end(this.buf, (this.pos += 4)) | 0;
      };
      function readFixed64() {
        if (this.pos + 8 > this.len) throw indexOutOfRange(this, 8);
        return new LongBits(
          readFixed32_end(this.buf, (this.pos += 4)),
          readFixed32_end(this.buf, (this.pos += 4))
        );
      }
      Reader.prototype.float = function read_float() {
        if (this.pos + 4 > this.len) throw indexOutOfRange(this, 4);
        var value = util.float.readFloatLE(this.buf, this.pos);
        this.pos += 4;
        return value;
      };
      Reader.prototype.double = function read_double() {
        if (this.pos + 8 > this.len) throw indexOutOfRange(this, 4);
        var value = util.float.readDoubleLE(this.buf, this.pos);
        this.pos += 8;
        return value;
      };
      Reader.prototype.bytes = function read_bytes() {
        var length2 = this.uint32(),
          start = this.pos,
          end = this.pos + length2;
        if (end > this.len) throw indexOutOfRange(this, length2);
        this.pos += length2;
        if (Array.isArray(this.buf)) return this.buf.slice(start, end);
        return start === end
          ? new this.buf.constructor(0)
          : this._slice.call(this.buf, start, end);
      };
      Reader.prototype.string = function read_string() {
        var bytes = this.bytes();
        return utf8.read(bytes, 0, bytes.length);
      };
      Reader.prototype.skip = function skip(length2) {
        if (typeof length2 === 'number') {
          if (this.pos + length2 > this.len)
            throw indexOutOfRange(this, length2);
          this.pos += length2;
        } else {
          do {
            if (this.pos >= this.len) throw indexOutOfRange(this);
          } while (this.buf[this.pos++] & 128);
        }
        return this;
      };
      Reader.prototype.skipType = function (wireType) {
        switch (wireType) {
          case 0:
            this.skip();
            break;
          case 1:
            this.skip(8);
            break;
          case 2:
            this.skip(this.uint32());
            break;
          case 3:
            while ((wireType = this.uint32() & 7) !== 4) {
              this.skipType(wireType);
            }
            break;
          case 5:
            this.skip(4);
            break;
          default:
            throw Error(
              'invalid wire type ' + wireType + ' at offset ' + this.pos
            );
        }
        return this;
      };
      Reader._configure = function (BufferReader_) {
        BufferReader = BufferReader_;
        Reader.create = create3();
        BufferReader._configure();
        var fn = util.Long
          ? 'toLong'
          : /* istanbul ignore next */
            'toNumber';
        util.merge(Reader.prototype, {
          int64: function read_int64() {
            return readLongVarint.call(this)[fn](false);
          },
          uint64: function read_uint64() {
            return readLongVarint.call(this)[fn](true);
          },
          sint64: function read_sint64() {
            return readLongVarint.call(this).zzDecode()[fn](false);
          },
          fixed64: function read_fixed64() {
            return readFixed64.call(this)[fn](true);
          },
          sfixed64: function read_sfixed64() {
            return readFixed64.call(this)[fn](false);
          },
        });
      };
    },
  });

  // node_modules/protobufjs/src/reader_buffer.js
  var require_reader_buffer = __commonJS({
    'node_modules/protobufjs/src/reader_buffer.js'(exports2, module2) {
      'use strict';
      module2.exports = BufferReader;
      var Reader = require_reader();
      (BufferReader.prototype = Object.create(Reader.prototype)).constructor =
        BufferReader;
      var util = require_minimal();
      function BufferReader(buffer) {
        Reader.call(this, buffer);
      }
      BufferReader._configure = function () {
        if (util.Buffer)
          BufferReader.prototype._slice = util.Buffer.prototype.slice;
      };
      BufferReader.prototype.string = function read_string_buffer() {
        var len = this.uint32();
        return this.buf.utf8Slice
          ? this.buf.utf8Slice(
              this.pos,
              (this.pos = Math.min(this.pos + len, this.len))
            )
          : this.buf.toString(
              'utf-8',
              this.pos,
              (this.pos = Math.min(this.pos + len, this.len))
            );
      };
      BufferReader._configure();
    },
  });

  // node_modules/protobufjs/src/rpc/service.js
  var require_service = __commonJS({
    'node_modules/protobufjs/src/rpc/service.js'(exports2, module2) {
      'use strict';
      module2.exports = Service;
      var util = require_minimal();
      (Service.prototype = Object.create(
        util.EventEmitter.prototype
      )).constructor = Service;
      function Service(rpcImpl, requestDelimited, responseDelimited) {
        if (typeof rpcImpl !== 'function')
          throw TypeError('rpcImpl must be a function');
        util.EventEmitter.call(this);
        this.rpcImpl = rpcImpl;
        this.requestDelimited = Boolean(requestDelimited);
        this.responseDelimited = Boolean(responseDelimited);
      }
      Service.prototype.rpcCall = function rpcCall(
        method,
        requestCtor,
        responseCtor,
        request,
        callback
      ) {
        if (!request) throw TypeError('request must be specified');
        var self2 = this;
        if (!callback)
          return util.asPromise(
            rpcCall,
            self2,
            method,
            requestCtor,
            responseCtor,
            request
          );
        if (!self2.rpcImpl) {
          setTimeout(function () {
            callback(Error('already ended'));
          }, 0);
          return void 0;
        }
        try {
          return self2.rpcImpl(
            method,
            requestCtor[self2.requestDelimited ? 'encodeDelimited' : 'encode'](
              request
            ).finish(),
            function rpcCallback(err, response) {
              if (err) {
                self2.emit('error', err, method);
                return callback(err);
              }
              if (response === null) {
                self2.end(
                  /* endedByRPC */
                  true
                );
                return void 0;
              }
              if (!(response instanceof responseCtor)) {
                try {
                  response =
                    responseCtor[
                      self2.responseDelimited ? 'decodeDelimited' : 'decode'
                    ](response);
                } catch (err2) {
                  self2.emit('error', err2, method);
                  return callback(err2);
                }
              }
              self2.emit('data', response, method);
              return callback(null, response);
            }
          );
        } catch (err) {
          self2.emit('error', err, method);
          setTimeout(function () {
            callback(err);
          }, 0);
          return void 0;
        }
      };
      Service.prototype.end = function end(endedByRPC) {
        if (this.rpcImpl) {
          if (!endedByRPC) this.rpcImpl(null, null, null);
          this.rpcImpl = null;
          this.emit('end').off();
        }
        return this;
      };
    },
  });

  // node_modules/protobufjs/src/rpc.js
  var require_rpc = __commonJS({
    'node_modules/protobufjs/src/rpc.js'(exports2) {
      'use strict';
      var rpc = exports2;
      rpc.Service = require_service();
    },
  });

  // node_modules/protobufjs/src/roots.js
  var require_roots = __commonJS({
    'node_modules/protobufjs/src/roots.js'(exports2, module2) {
      'use strict';
      module2.exports = {};
    },
  });

  // node_modules/protobufjs/src/index-minimal.js
  var require_index_minimal = __commonJS({
    'node_modules/protobufjs/src/index-minimal.js'(exports2) {
      'use strict';
      var protobuf = exports2;
      protobuf.build = 'minimal';
      protobuf.Writer = require_writer();
      protobuf.BufferWriter = require_writer_buffer();
      protobuf.Reader = require_reader();
      protobuf.BufferReader = require_reader_buffer();
      protobuf.util = require_minimal();
      protobuf.rpc = require_rpc();
      protobuf.roots = require_roots();
      protobuf.configure = configure;
      function configure() {
        protobuf.util._configure();
        protobuf.Writer._configure(protobuf.BufferWriter);
        protobuf.Reader._configure(protobuf.BufferReader);
      }
      configure();
    },
  });

  // node_modules/protobufjs/minimal.js
  var require_minimal2 = __commonJS({
    'node_modules/protobufjs/minimal.js'(exports2, module2) {
      'use strict';
      module2.exports = require_index_minimal();
    },
  });

  // node_modules/rabin-wasm/src/rabin.js
  var require_rabin = __commonJS({
    'node_modules/rabin-wasm/src/rabin.js'(exports2, module2) {
      var Rabin = class {
        /**
         * Creates an instance of Rabin.
         * @param { import("./../dist/rabin-wasm") } asModule
         * @param {number} [bits=12]
         * @param {number} [min=8 * 1024]
         * @param {number} [max=32 * 1024]
         * @param {number} polynomial
         * @memberof Rabin
         */
        constructor(
          asModule,
          bits = 12,
          min = 8 * 1024,
          max = 32 * 1024,
          windowSize = 64,
          polynomial
        ) {
          this.bits = bits;
          this.min = min;
          this.max = max;
          this.asModule = asModule;
          this.rabin = new asModule.Rabin(
            bits,
            min,
            max,
            windowSize,
            polynomial
          );
          this.polynomial = polynomial;
        }
        /**
         * Fingerprints the buffer
         *
         * @param {Uint8Array} buf
         * @returns {Array<number>}
         * @memberof Rabin
         */
        fingerprint(buf) {
          const {
            __retain,
            __release,
            __allocArray,
            __getInt32Array,
            Int32Array_ID,
            Uint8Array_ID,
          } = this.asModule;
          const lengths = new Int32Array(Math.ceil(buf.length / this.min));
          const lengthsPtr = __retain(__allocArray(Int32Array_ID, lengths));
          const pointer = __retain(__allocArray(Uint8Array_ID, buf));
          const out = this.rabin.fingerprint(pointer, lengthsPtr);
          const processed = __getInt32Array(out);
          __release(pointer);
          __release(lengthsPtr);
          const end = processed.indexOf(0);
          return end >= 0 ? processed.subarray(0, end) : processed;
        }
      };
      module2.exports = Rabin;
    },
  });

  // node_modules/@assemblyscript/loader/index.js
  var require_loader = __commonJS({
    'node_modules/@assemblyscript/loader/index.js'(exports2) {
      'use strict';
      var ID_OFFSET = -8;
      var SIZE_OFFSET = -4;
      var ARRAYBUFFER_ID = 0;
      var STRING_ID = 1;
      var ARRAYBUFFERVIEW = 1 << 0;
      var ARRAY = 1 << 1;
      var SET = 1 << 2;
      var MAP = 1 << 3;
      var VAL_ALIGN_OFFSET = 5;
      var VAL_ALIGN = 1 << VAL_ALIGN_OFFSET;
      var VAL_SIGNED = 1 << 10;
      var VAL_FLOAT = 1 << 11;
      var VAL_NULLABLE = 1 << 12;
      var VAL_MANAGED = 1 << 13;
      var KEY_ALIGN_OFFSET = 14;
      var KEY_ALIGN = 1 << KEY_ALIGN_OFFSET;
      var KEY_SIGNED = 1 << 19;
      var KEY_FLOAT = 1 << 20;
      var KEY_NULLABLE = 1 << 21;
      var KEY_MANAGED = 1 << 22;
      var ARRAYBUFFERVIEW_BUFFER_OFFSET = 0;
      var ARRAYBUFFERVIEW_DATASTART_OFFSET = 4;
      var ARRAYBUFFERVIEW_DATALENGTH_OFFSET = 8;
      var ARRAYBUFFERVIEW_SIZE = 12;
      var ARRAY_LENGTH_OFFSET = 12;
      var ARRAY_SIZE = 16;
      var BIGINT = typeof BigUint64Array !== 'undefined';
      var THIS = Symbol();
      var CHUNKSIZE = 1024;
      function getStringImpl(buffer, ptr) {
        const U32 = new Uint32Array(buffer);
        const U16 = new Uint16Array(buffer);
        var length2 = U32[(ptr + SIZE_OFFSET) >>> 2] >>> 1;
        var offset = ptr >>> 1;
        if (length2 <= CHUNKSIZE)
          return String.fromCharCode.apply(
            String,
            U16.subarray(offset, offset + length2)
          );
        const parts = [];
        do {
          const last = U16[offset + CHUNKSIZE - 1];
          const size =
            last >= 55296 && last < 56320 ? CHUNKSIZE - 1 : CHUNKSIZE;
          parts.push(
            String.fromCharCode.apply(
              String,
              U16.subarray(offset, (offset += size))
            )
          );
          length2 -= size;
        } while (length2 > CHUNKSIZE);
        return (
          parts.join('') +
          String.fromCharCode.apply(
            String,
            U16.subarray(offset, offset + length2)
          )
        );
      }
      function preInstantiate(imports) {
        const baseModule = {};
        function getString(memory, ptr) {
          if (!memory) return '<yet unknown>';
          return getStringImpl(memory.buffer, ptr);
        }
        const env = (imports.env = imports.env || {});
        env.abort =
          env.abort ||
          function abort(mesg, file, line, colm) {
            const memory = baseModule.memory || env.memory;
            throw Error(
              'abort: ' +
                getString(memory, mesg) +
                ' at ' +
                getString(memory, file) +
                ':' +
                line +
                ':' +
                colm
            );
          };
        env.trace =
          env.trace ||
          function trace(mesg, n) {
            const memory = baseModule.memory || env.memory;
            console.log(
              'trace: ' +
                getString(memory, mesg) +
                (n ? ' ' : '') +
                Array.prototype.slice.call(arguments, 2, 2 + n).join(', ')
            );
          };
        imports.Math = imports.Math || Math;
        imports.Date = imports.Date || Date;
        return baseModule;
      }
      function postInstantiate(baseModule, instance) {
        const rawExports = instance.exports;
        const memory = rawExports.memory;
        const table = rawExports.table;
        const alloc2 = rawExports['__alloc'];
        const retain = rawExports['__retain'];
        const rttiBase = rawExports['__rtti_base'] || ~0;
        function getInfo(id) {
          const U32 = new Uint32Array(memory.buffer);
          const count = U32[rttiBase >>> 2];
          if ((id >>>= 0) >= count) throw Error('invalid id: ' + id);
          return U32[((rttiBase + 4) >>> 2) + id * 2];
        }
        function getBase(id) {
          const U32 = new Uint32Array(memory.buffer);
          const count = U32[rttiBase >>> 2];
          if ((id >>>= 0) >= count) throw Error('invalid id: ' + id);
          return U32[((rttiBase + 4) >>> 2) + id * 2 + 1];
        }
        function getValueAlign(info) {
          return 31 - Math.clz32((info >>> VAL_ALIGN_OFFSET) & 31);
        }
        function getKeyAlign(info) {
          return 31 - Math.clz32((info >>> KEY_ALIGN_OFFSET) & 31);
        }
        function __allocString(str) {
          const length2 = str.length;
          const ptr = alloc2(length2 << 1, STRING_ID);
          const U16 = new Uint16Array(memory.buffer);
          for (var i = 0, p = ptr >>> 1; i < length2; ++i)
            U16[p + i] = str.charCodeAt(i);
          return ptr;
        }
        baseModule.__allocString = __allocString;
        function __getString(ptr) {
          const buffer = memory.buffer;
          const id = new Uint32Array(buffer)[(ptr + ID_OFFSET) >>> 2];
          if (id !== STRING_ID) throw Error('not a string: ' + ptr);
          return getStringImpl(buffer, ptr);
        }
        baseModule.__getString = __getString;
        function getView(alignLog2, signed, float) {
          const buffer = memory.buffer;
          if (float) {
            switch (alignLog2) {
              case 2:
                return new Float32Array(buffer);
              case 3:
                return new Float64Array(buffer);
            }
          } else {
            switch (alignLog2) {
              case 0:
                return new (signed ? Int8Array : Uint8Array)(buffer);
              case 1:
                return new (signed ? Int16Array : Uint16Array)(buffer);
              case 2:
                return new (signed ? Int32Array : Uint32Array)(buffer);
              case 3:
                return new (signed ? BigInt64Array : BigUint64Array)(buffer);
            }
          }
          throw Error('unsupported align: ' + alignLog2);
        }
        function __allocArray(id, values) {
          const info = getInfo(id);
          if (!(info & (ARRAYBUFFERVIEW | ARRAY)))
            throw Error('not an array: ' + id + ' @ ' + info);
          const align = getValueAlign(info);
          const length2 = values.length;
          const buf = alloc2(length2 << align, ARRAYBUFFER_ID);
          const arr = alloc2(
            info & ARRAY ? ARRAY_SIZE : ARRAYBUFFERVIEW_SIZE,
            id
          );
          const U32 = new Uint32Array(memory.buffer);
          U32[(arr + ARRAYBUFFERVIEW_BUFFER_OFFSET) >>> 2] = retain(buf);
          U32[(arr + ARRAYBUFFERVIEW_DATASTART_OFFSET) >>> 2] = buf;
          U32[(arr + ARRAYBUFFERVIEW_DATALENGTH_OFFSET) >>> 2] =
            length2 << align;
          if (info & ARRAY) U32[(arr + ARRAY_LENGTH_OFFSET) >>> 2] = length2;
          const view = getView(align, info & VAL_SIGNED, info & VAL_FLOAT);
          if (info & VAL_MANAGED) {
            for (let i = 0; i < length2; ++i)
              view[(buf >>> align) + i] = retain(values[i]);
          } else {
            view.set(values, buf >>> align);
          }
          return arr;
        }
        baseModule.__allocArray = __allocArray;
        function __getArrayView(arr) {
          const U32 = new Uint32Array(memory.buffer);
          const id = U32[(arr + ID_OFFSET) >>> 2];
          const info = getInfo(id);
          if (!(info & ARRAYBUFFERVIEW)) throw Error('not an array: ' + id);
          const align = getValueAlign(info);
          var buf = U32[(arr + ARRAYBUFFERVIEW_DATASTART_OFFSET) >>> 2];
          const length2 =
            info & ARRAY
              ? U32[(arr + ARRAY_LENGTH_OFFSET) >>> 2]
              : U32[(buf + SIZE_OFFSET) >>> 2] >>> align;
          return getView(align, info & VAL_SIGNED, info & VAL_FLOAT).subarray(
            (buf >>>= align),
            buf + length2
          );
        }
        baseModule.__getArrayView = __getArrayView;
        function __getArray(arr) {
          const input = __getArrayView(arr);
          const len = input.length;
          const out = new Array(len);
          for (let i = 0; i < len; i++) out[i] = input[i];
          return out;
        }
        baseModule.__getArray = __getArray;
        function __getArrayBuffer(ptr) {
          const buffer = memory.buffer;
          const length2 = new Uint32Array(buffer)[(ptr + SIZE_OFFSET) >>> 2];
          return buffer.slice(ptr, ptr + length2);
        }
        baseModule.__getArrayBuffer = __getArrayBuffer;
        function getTypedArray(Type, alignLog2, ptr) {
          return new Type(getTypedArrayView(Type, alignLog2, ptr));
        }
        function getTypedArrayView(Type, alignLog2, ptr) {
          const buffer = memory.buffer;
          const U32 = new Uint32Array(buffer);
          const bufPtr = U32[(ptr + ARRAYBUFFERVIEW_DATASTART_OFFSET) >>> 2];
          return new Type(
            buffer,
            bufPtr,
            U32[(bufPtr + SIZE_OFFSET) >>> 2] >>> alignLog2
          );
        }
        baseModule.__getInt8Array = getTypedArray.bind(null, Int8Array, 0);
        baseModule.__getInt8ArrayView = getTypedArrayView.bind(
          null,
          Int8Array,
          0
        );
        baseModule.__getUint8Array = getTypedArray.bind(null, Uint8Array, 0);
        baseModule.__getUint8ArrayView = getTypedArrayView.bind(
          null,
          Uint8Array,
          0
        );
        baseModule.__getUint8ClampedArray = getTypedArray.bind(
          null,
          Uint8ClampedArray,
          0
        );
        baseModule.__getUint8ClampedArrayView = getTypedArrayView.bind(
          null,
          Uint8ClampedArray,
          0
        );
        baseModule.__getInt16Array = getTypedArray.bind(null, Int16Array, 1);
        baseModule.__getInt16ArrayView = getTypedArrayView.bind(
          null,
          Int16Array,
          1
        );
        baseModule.__getUint16Array = getTypedArray.bind(null, Uint16Array, 1);
        baseModule.__getUint16ArrayView = getTypedArrayView.bind(
          null,
          Uint16Array,
          1
        );
        baseModule.__getInt32Array = getTypedArray.bind(null, Int32Array, 2);
        baseModule.__getInt32ArrayView = getTypedArrayView.bind(
          null,
          Int32Array,
          2
        );
        baseModule.__getUint32Array = getTypedArray.bind(null, Uint32Array, 2);
        baseModule.__getUint32ArrayView = getTypedArrayView.bind(
          null,
          Uint32Array,
          2
        );
        if (BIGINT) {
          baseModule.__getInt64Array = getTypedArray.bind(
            null,
            BigInt64Array,
            3
          );
          baseModule.__getInt64ArrayView = getTypedArrayView.bind(
            null,
            BigInt64Array,
            3
          );
          baseModule.__getUint64Array = getTypedArray.bind(
            null,
            BigUint64Array,
            3
          );
          baseModule.__getUint64ArrayView = getTypedArrayView.bind(
            null,
            BigUint64Array,
            3
          );
        }
        baseModule.__getFloat32Array = getTypedArray.bind(
          null,
          Float32Array,
          2
        );
        baseModule.__getFloat32ArrayView = getTypedArrayView.bind(
          null,
          Float32Array,
          2
        );
        baseModule.__getFloat64Array = getTypedArray.bind(
          null,
          Float64Array,
          3
        );
        baseModule.__getFloat64ArrayView = getTypedArrayView.bind(
          null,
          Float64Array,
          3
        );
        function __instanceof(ptr, baseId) {
          const U32 = new Uint32Array(memory.buffer);
          var id = U32[(ptr + ID_OFFSET) >>> 2];
          if (id <= U32[rttiBase >>> 2]) {
            do if (id == baseId) return true;
            while ((id = getBase(id)));
          }
          return false;
        }
        baseModule.__instanceof = __instanceof;
        baseModule.memory = baseModule.memory || memory;
        baseModule.table = baseModule.table || table;
        return demangle(rawExports, baseModule);
      }
      function isResponse(o) {
        return typeof Response !== 'undefined' && o instanceof Response;
      }
      async function instantiate(source, imports) {
        if (isResponse((source = await source)))
          return instantiateStreaming(source, imports);
        return postInstantiate(
          preInstantiate(imports || (imports = {})),
          await WebAssembly.instantiate(
            source instanceof WebAssembly.Module
              ? source
              : await WebAssembly.compile(source),
            imports
          )
        );
      }
      exports2.instantiate = instantiate;
      function instantiateSync(source, imports) {
        return postInstantiate(
          preInstantiate(imports || (imports = {})),
          new WebAssembly.Instance(
            source instanceof WebAssembly.Module
              ? source
              : new WebAssembly.Module(source),
            imports
          )
        );
      }
      exports2.instantiateSync = instantiateSync;
      async function instantiateStreaming(source, imports) {
        if (!WebAssembly.instantiateStreaming) {
          return instantiate(
            isResponse((source = await source)) ? source.arrayBuffer() : source,
            imports
          );
        }
        return postInstantiate(
          preInstantiate(imports || (imports = {})),
          (await WebAssembly.instantiateStreaming(source, imports)).instance
        );
      }
      exports2.instantiateStreaming = instantiateStreaming;
      function demangle(exports3, baseModule) {
        var module3 = baseModule ? Object.create(baseModule) : {};
        var setArgumentsLength = exports3['__argumentsLength']
          ? function (length2) {
              exports3['__argumentsLength'].value = length2;
            }
          : exports3['__setArgumentsLength'] ||
            exports3['__setargc'] ||
            function () {};
        for (let internalName in exports3) {
          if (!Object.prototype.hasOwnProperty.call(exports3, internalName))
            continue;
          const elem = exports3[internalName];
          let parts = internalName.split('.');
          let curr = module3;
          while (parts.length > 1) {
            let part = parts.shift();
            if (!Object.prototype.hasOwnProperty.call(curr, part))
              curr[part] = {};
            curr = curr[part];
          }
          let name4 = parts[0];
          let hash = name4.indexOf('#');
          if (hash >= 0) {
            let className = name4.substring(0, hash);
            let classElem = curr[className];
            if (typeof classElem === 'undefined' || !classElem.prototype) {
              let ctor = function (...args) {
                return ctor.wrap(ctor.prototype.constructor(0, ...args));
              };
              ctor.prototype = {
                valueOf: function valueOf() {
                  return this[THIS];
                },
              };
              ctor.wrap = function (thisValue) {
                return Object.create(ctor.prototype, {
                  [THIS]: { value: thisValue, writable: false },
                });
              };
              if (classElem)
                Object.getOwnPropertyNames(classElem).forEach((name5) =>
                  Object.defineProperty(
                    ctor,
                    name5,
                    Object.getOwnPropertyDescriptor(classElem, name5)
                  )
                );
              curr[className] = ctor;
            }
            name4 = name4.substring(hash + 1);
            curr = curr[className].prototype;
            if (/^(get|set):/.test(name4)) {
              if (
                !Object.prototype.hasOwnProperty.call(
                  curr,
                  (name4 = name4.substring(4))
                )
              ) {
                let getter = exports3[internalName.replace('set:', 'get:')];
                let setter = exports3[internalName.replace('get:', 'set:')];
                Object.defineProperty(curr, name4, {
                  get: function () {
                    return getter(this[THIS]);
                  },
                  set: function (value) {
                    setter(this[THIS], value);
                  },
                  enumerable: true,
                });
              }
            } else {
              if (name4 === 'constructor') {
                (curr[name4] = (...args) => {
                  setArgumentsLength(args.length);
                  return elem(...args);
                }).original = elem;
              } else {
                (curr[name4] = function (...args) {
                  setArgumentsLength(args.length);
                  return elem(this[THIS], ...args);
                }).original = elem;
              }
            }
          } else {
            if (/^(get|set):/.test(name4)) {
              if (
                !Object.prototype.hasOwnProperty.call(
                  curr,
                  (name4 = name4.substring(4))
                )
              ) {
                Object.defineProperty(curr, name4, {
                  get: exports3[internalName.replace('set:', 'get:')],
                  set: exports3[internalName.replace('get:', 'set:')],
                  enumerable: true,
                });
              }
            } else if (
              typeof elem === 'function' &&
              elem !== setArgumentsLength
            ) {
              (curr[name4] = (...args) => {
                setArgumentsLength(args.length);
                return elem(...args);
              }).original = elem;
            } else {
              curr[name4] = elem;
            }
          }
        }
        return module3;
      }
      exports2.demangle = demangle;
    },
  });

  // node_modules/rabin-wasm/dist/rabin-wasm.js
  var require_rabin_wasm = __commonJS({
    'node_modules/rabin-wasm/dist/rabin-wasm.js'(exports2, module2) {
      var { instantiate } = require_loader();
      loadWebAssembly.supported = typeof WebAssembly !== 'undefined';
      function loadWebAssembly(imp = {}) {
        if (!loadWebAssembly.supported) return null;
        var wasm = new Uint8Array([
          0, 97, 115, 109, 1, 0, 0, 0, 1, 78, 14, 96, 2, 127, 126, 0, 96, 1,
          127, 1, 126, 96, 2, 127, 127, 0, 96, 1, 127, 1, 127, 96, 1, 127, 0,
          96, 2, 127, 127, 1, 127, 96, 3, 127, 127, 127, 1, 127, 96, 0, 0, 96,
          3, 127, 127, 127, 0, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 0, 96,
          5, 127, 127, 127, 127, 127, 1, 127, 96, 1, 126, 1, 127, 96, 2, 126,
          126, 1, 126, 2, 13, 1, 3, 101, 110, 118, 5, 97, 98, 111, 114, 116, 0,
          10, 3, 54, 53, 2, 2, 8, 9, 3, 5, 2, 8, 6, 5, 3, 4, 2, 6, 9, 12, 13, 2,
          5, 11, 3, 2, 3, 2, 3, 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
          0, 1, 0, 1, 0, 1, 0, 6, 7, 7, 4, 4, 5, 3, 1, 0, 1, 6, 47, 9, 127, 1,
          65, 0, 11, 127, 1, 65, 0, 11, 127, 0, 65, 3, 11, 127, 0, 65, 4, 11,
          127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 1, 65, 0, 11, 127, 0, 65,
          240, 2, 11, 127, 0, 65, 6, 11, 7, 240, 5, 41, 6, 109, 101, 109, 111,
          114, 121, 2, 0, 7, 95, 95, 97, 108, 108, 111, 99, 0, 10, 8, 95, 95,
          114, 101, 116, 97, 105, 110, 0, 11, 9, 95, 95, 114, 101, 108, 101, 97,
          115, 101, 0, 12, 9, 95, 95, 99, 111, 108, 108, 101, 99, 116, 0, 51,
          11, 95, 95, 114, 116, 116, 105, 95, 98, 97, 115, 101, 3, 7, 13, 73,
          110, 116, 51, 50, 65, 114, 114, 97, 121, 95, 73, 68, 3, 2, 13, 85,
          105, 110, 116, 56, 65, 114, 114, 97, 121, 95, 73, 68, 3, 3, 6, 100,
          101, 103, 114, 101, 101, 0, 16, 3, 109, 111, 100, 0, 17, 5, 82, 97,
          98, 105, 110, 3, 8, 16, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58,
          119, 105, 110, 100, 111, 119, 0, 21, 16, 82, 97, 98, 105, 110, 35,
          115, 101, 116, 58, 119, 105, 110, 100, 111, 119, 0, 22, 21, 82, 97,
          98, 105, 110, 35, 103, 101, 116, 58, 119, 105, 110, 100, 111, 119, 95,
          115, 105, 122, 101, 0, 23, 21, 82, 97, 98, 105, 110, 35, 115, 101,
          116, 58, 119, 105, 110, 100, 111, 119, 95, 115, 105, 122, 101, 0, 24,
          14, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 119, 112, 111, 115,
          0, 25, 14, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 119, 112, 111,
          115, 0, 26, 15, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 99, 111,
          117, 110, 116, 0, 27, 15, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58,
          99, 111, 117, 110, 116, 0, 28, 13, 82, 97, 98, 105, 110, 35, 103, 101,
          116, 58, 112, 111, 115, 0, 29, 13, 82, 97, 98, 105, 110, 35, 115, 101,
          116, 58, 112, 111, 115, 0, 30, 15, 82, 97, 98, 105, 110, 35, 103, 101,
          116, 58, 115, 116, 97, 114, 116, 0, 31, 15, 82, 97, 98, 105, 110, 35,
          115, 101, 116, 58, 115, 116, 97, 114, 116, 0, 32, 16, 82, 97, 98, 105,
          110, 35, 103, 101, 116, 58, 100, 105, 103, 101, 115, 116, 0, 33, 16,
          82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 100, 105, 103, 101, 115,
          116, 0, 34, 21, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 99, 104,
          117, 110, 107, 95, 115, 116, 97, 114, 116, 0, 35, 21, 82, 97, 98, 105,
          110, 35, 115, 101, 116, 58, 99, 104, 117, 110, 107, 95, 115, 116, 97,
          114, 116, 0, 36, 22, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 99,
          104, 117, 110, 107, 95, 108, 101, 110, 103, 116, 104, 0, 37, 22, 82,
          97, 98, 105, 110, 35, 115, 101, 116, 58, 99, 104, 117, 110, 107, 95,
          108, 101, 110, 103, 116, 104, 0, 38, 31, 82, 97, 98, 105, 110, 35,
          103, 101, 116, 58, 99, 104, 117, 110, 107, 95, 99, 117, 116, 95, 102,
          105, 110, 103, 101, 114, 112, 114, 105, 110, 116, 0, 39, 31, 82, 97,
          98, 105, 110, 35, 115, 101, 116, 58, 99, 104, 117, 110, 107, 95, 99,
          117, 116, 95, 102, 105, 110, 103, 101, 114, 112, 114, 105, 110, 116,
          0, 40, 20, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 112, 111, 108,
          121, 110, 111, 109, 105, 97, 108, 0, 41, 20, 82, 97, 98, 105, 110, 35,
          115, 101, 116, 58, 112, 111, 108, 121, 110, 111, 109, 105, 97, 108, 0,
          42, 17, 82, 97, 98, 105, 110, 35, 103, 101, 116, 58, 109, 105, 110,
          115, 105, 122, 101, 0, 43, 17, 82, 97, 98, 105, 110, 35, 115, 101,
          116, 58, 109, 105, 110, 115, 105, 122, 101, 0, 44, 17, 82, 97, 98,
          105, 110, 35, 103, 101, 116, 58, 109, 97, 120, 115, 105, 122, 101, 0,
          45, 17, 82, 97, 98, 105, 110, 35, 115, 101, 116, 58, 109, 97, 120,
          115, 105, 122, 101, 0, 46, 14, 82, 97, 98, 105, 110, 35, 103, 101,
          116, 58, 109, 97, 115, 107, 0, 47, 14, 82, 97, 98, 105, 110, 35, 115,
          101, 116, 58, 109, 97, 115, 107, 0, 48, 17, 82, 97, 98, 105, 110, 35,
          99, 111, 110, 115, 116, 114, 117, 99, 116, 111, 114, 0, 20, 17, 82,
          97, 98, 105, 110, 35, 102, 105, 110, 103, 101, 114, 112, 114, 105,
          110, 116, 0, 49, 8, 1, 50, 10, 165, 31, 53, 199, 1, 1, 4, 127, 32, 1,
          40, 2, 0, 65, 124, 113, 34, 2, 65, 128, 2, 73, 4, 127, 32, 2, 65, 4,
          118, 33, 4, 65, 0, 5, 32, 2, 65, 31, 32, 2, 103, 107, 34, 3, 65, 4,
          107, 118, 65, 16, 115, 33, 4, 32, 3, 65, 7, 107, 11, 33, 3, 32, 1, 40,
          2, 20, 33, 2, 32, 1, 40, 2, 16, 34, 5, 4, 64, 32, 5, 32, 2, 54, 2, 20,
          11, 32, 2, 4, 64, 32, 2, 32, 5, 54, 2, 16, 11, 32, 1, 32, 0, 32, 4,
          32, 3, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 70, 4, 64, 32, 0,
          32, 4, 32, 3, 65, 4, 116, 106, 65, 2, 116, 106, 32, 2, 54, 2, 96, 32,
          2, 69, 4, 64, 32, 0, 32, 3, 65, 2, 116, 106, 32, 0, 32, 3, 65, 2, 116,
          106, 40, 2, 4, 65, 1, 32, 4, 116, 65, 127, 115, 113, 34, 1, 54, 2, 4,
          32, 1, 69, 4, 64, 32, 0, 32, 0, 40, 2, 0, 65, 1, 32, 3, 116, 65, 127,
          115, 113, 54, 2, 0, 11, 11, 11, 11, 226, 2, 1, 6, 127, 32, 1, 40, 2,
          0, 33, 3, 32, 1, 65, 16, 106, 32, 1, 40, 2, 0, 65, 124, 113, 106, 34,
          4, 40, 2, 0, 34, 5, 65, 1, 113, 4, 64, 32, 3, 65, 124, 113, 65, 16,
          106, 32, 5, 65, 124, 113, 106, 34, 2, 65, 240, 255, 255, 255, 3, 73,
          4, 64, 32, 0, 32, 4, 16, 1, 32, 1, 32, 2, 32, 3, 65, 3, 113, 114, 34,
          3, 54, 2, 0, 32, 1, 65, 16, 106, 32, 1, 40, 2, 0, 65, 124, 113, 106,
          34, 4, 40, 2, 0, 33, 5, 11, 11, 32, 3, 65, 2, 113, 4, 64, 32, 1, 65,
          4, 107, 40, 2, 0, 34, 2, 40, 2, 0, 34, 6, 65, 124, 113, 65, 16, 106,
          32, 3, 65, 124, 113, 106, 34, 7, 65, 240, 255, 255, 255, 3, 73, 4, 64,
          32, 0, 32, 2, 16, 1, 32, 2, 32, 7, 32, 6, 65, 3, 113, 114, 34, 3, 54,
          2, 0, 32, 2, 33, 1, 11, 11, 32, 4, 32, 5, 65, 2, 114, 54, 2, 0, 32, 4,
          65, 4, 107, 32, 1, 54, 2, 0, 32, 0, 32, 3, 65, 124, 113, 34, 2, 65,
          128, 2, 73, 4, 127, 32, 2, 65, 4, 118, 33, 4, 65, 0, 5, 32, 2, 65, 31,
          32, 2, 103, 107, 34, 2, 65, 4, 107, 118, 65, 16, 115, 33, 4, 32, 2,
          65, 7, 107, 11, 34, 3, 65, 4, 116, 32, 4, 106, 65, 2, 116, 106, 40, 2,
          96, 33, 2, 32, 1, 65, 0, 54, 2, 16, 32, 1, 32, 2, 54, 2, 20, 32, 2, 4,
          64, 32, 2, 32, 1, 54, 2, 16, 11, 32, 0, 32, 4, 32, 3, 65, 4, 116, 106,
          65, 2, 116, 106, 32, 1, 54, 2, 96, 32, 0, 32, 0, 40, 2, 0, 65, 1, 32,
          3, 116, 114, 54, 2, 0, 32, 0, 32, 3, 65, 2, 116, 106, 32, 0, 32, 3,
          65, 2, 116, 106, 40, 2, 4, 65, 1, 32, 4, 116, 114, 54, 2, 4, 11, 119,
          1, 1, 127, 32, 2, 2, 127, 32, 0, 40, 2, 160, 12, 34, 2, 4, 64, 32, 2,
          32, 1, 65, 16, 107, 70, 4, 64, 32, 2, 40, 2, 0, 33, 3, 32, 1, 65, 16,
          107, 33, 1, 11, 11, 32, 1, 11, 107, 34, 2, 65, 48, 73, 4, 64, 15, 11,
          32, 1, 32, 3, 65, 2, 113, 32, 2, 65, 32, 107, 65, 1, 114, 114, 54, 2,
          0, 32, 1, 65, 0, 54, 2, 16, 32, 1, 65, 0, 54, 2, 20, 32, 1, 32, 2,
          106, 65, 16, 107, 34, 2, 65, 2, 54, 2, 0, 32, 0, 32, 2, 54, 2, 160,
          12, 32, 0, 32, 1, 16, 2, 11, 155, 1, 1, 3, 127, 35, 0, 34, 0, 69, 4,
          64, 65, 1, 63, 0, 34, 0, 74, 4, 127, 65, 1, 32, 0, 107, 64, 0, 65, 0,
          72, 5, 65, 0, 11, 4, 64, 0, 11, 65, 176, 3, 34, 0, 65, 0, 54, 2, 0,
          65, 208, 15, 65, 0, 54, 2, 0, 3, 64, 32, 1, 65, 23, 73, 4, 64, 32, 1,
          65, 2, 116, 65, 176, 3, 106, 65, 0, 54, 2, 4, 65, 0, 33, 2, 3, 64, 32,
          2, 65, 16, 73, 4, 64, 32, 1, 65, 4, 116, 32, 2, 106, 65, 2, 116, 65,
          176, 3, 106, 65, 0, 54, 2, 96, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11,
          11, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11, 11, 65, 176, 3, 65, 224, 15,
          63, 0, 65, 16, 116, 16, 3, 65, 176, 3, 36, 0, 11, 32, 0, 11, 45, 0,
          32, 0, 65, 240, 255, 255, 255, 3, 79, 4, 64, 65, 32, 65, 224, 0, 65,
          201, 3, 65, 29, 16, 0, 0, 11, 32, 0, 65, 15, 106, 65, 112, 113, 34, 0,
          65, 16, 32, 0, 65, 16, 75, 27, 11, 169, 1, 1, 1, 127, 32, 0, 32, 1,
          65, 128, 2, 73, 4, 127, 32, 1, 65, 4, 118, 33, 1, 65, 0, 5, 32, 1, 65,
          248, 255, 255, 255, 1, 73, 4, 64, 32, 1, 65, 1, 65, 27, 32, 1, 103,
          107, 116, 106, 65, 1, 107, 33, 1, 11, 32, 1, 65, 31, 32, 1, 103, 107,
          34, 2, 65, 4, 107, 118, 65, 16, 115, 33, 1, 32, 2, 65, 7, 107, 11, 34,
          2, 65, 2, 116, 106, 40, 2, 4, 65, 127, 32, 1, 116, 113, 34, 1, 4, 127,
          32, 0, 32, 1, 104, 32, 2, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96,
          5, 32, 0, 40, 2, 0, 65, 127, 32, 2, 65, 1, 106, 116, 113, 34, 1, 4,
          127, 32, 0, 32, 0, 32, 1, 104, 34, 0, 65, 2, 116, 106, 40, 2, 4, 104,
          32, 0, 65, 4, 116, 106, 65, 2, 116, 106, 40, 2, 96, 5, 65, 0, 11, 11,
          11, 111, 1, 1, 127, 63, 0, 34, 2, 32, 1, 65, 248, 255, 255, 255, 1,
          73, 4, 127, 32, 1, 65, 1, 65, 27, 32, 1, 103, 107, 116, 65, 1, 107,
          106, 5, 32, 1, 11, 65, 16, 32, 0, 40, 2, 160, 12, 32, 2, 65, 16, 116,
          65, 16, 107, 71, 116, 106, 65, 255, 255, 3, 106, 65, 128, 128, 124,
          113, 65, 16, 118, 34, 1, 32, 2, 32, 1, 74, 27, 64, 0, 65, 0, 72, 4,
          64, 32, 1, 64, 0, 65, 0, 72, 4, 64, 0, 11, 11, 32, 0, 32, 2, 65, 16,
          116, 63, 0, 65, 16, 116, 16, 3, 11, 113, 1, 2, 127, 32, 1, 40, 2, 0,
          34, 3, 65, 124, 113, 32, 2, 107, 34, 4, 65, 32, 79, 4, 64, 32, 1, 32,
          2, 32, 3, 65, 2, 113, 114, 54, 2, 0, 32, 2, 32, 1, 65, 16, 106, 106,
          34, 1, 32, 4, 65, 16, 107, 65, 1, 114, 54, 2, 0, 32, 0, 32, 1, 16, 2,
          5, 32, 1, 32, 3, 65, 126, 113, 54, 2, 0, 32, 1, 65, 16, 106, 32, 1,
          40, 2, 0, 65, 124, 113, 106, 32, 1, 65, 16, 106, 32, 1, 40, 2, 0, 65,
          124, 113, 106, 40, 2, 0, 65, 125, 113, 54, 2, 0, 11, 11, 91, 1, 2,
          127, 32, 0, 32, 1, 16, 5, 34, 4, 16, 6, 34, 3, 69, 4, 64, 65, 1, 36,
          1, 65, 0, 36, 1, 32, 0, 32, 4, 16, 6, 34, 3, 69, 4, 64, 32, 0, 32, 4,
          16, 7, 32, 0, 32, 4, 16, 6, 33, 3, 11, 11, 32, 3, 65, 0, 54, 2, 4, 32,
          3, 32, 2, 54, 2, 8, 32, 3, 32, 1, 54, 2, 12, 32, 0, 32, 3, 16, 1, 32,
          0, 32, 3, 32, 4, 16, 8, 32, 3, 11, 13, 0, 16, 4, 32, 0, 32, 1, 16, 9,
          65, 16, 106, 11, 33, 1, 1, 127, 32, 0, 65, 172, 3, 75, 4, 64, 32, 0,
          65, 16, 107, 34, 1, 32, 1, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 32, 0,
          11, 18, 0, 32, 0, 65, 172, 3, 75, 4, 64, 32, 0, 65, 16, 107, 16, 52,
          11, 11, 140, 3, 1, 1, 127, 2, 64, 32, 1, 69, 13, 0, 32, 0, 65, 0, 58,
          0, 0, 32, 0, 32, 1, 106, 65, 1, 107, 65, 0, 58, 0, 0, 32, 1, 65, 2,
          77, 13, 0, 32, 0, 65, 1, 106, 65, 0, 58, 0, 0, 32, 0, 65, 2, 106, 65,
          0, 58, 0, 0, 32, 0, 32, 1, 106, 34, 2, 65, 2, 107, 65, 0, 58, 0, 0,
          32, 2, 65, 3, 107, 65, 0, 58, 0, 0, 32, 1, 65, 6, 77, 13, 0, 32, 0,
          65, 3, 106, 65, 0, 58, 0, 0, 32, 0, 32, 1, 106, 65, 4, 107, 65, 0, 58,
          0, 0, 32, 1, 65, 8, 77, 13, 0, 32, 1, 65, 0, 32, 0, 107, 65, 3, 113,
          34, 1, 107, 33, 2, 32, 0, 32, 1, 106, 34, 0, 65, 0, 54, 2, 0, 32, 0,
          32, 2, 65, 124, 113, 34, 1, 106, 65, 4, 107, 65, 0, 54, 2, 0, 32, 1,
          65, 8, 77, 13, 0, 32, 0, 65, 4, 106, 65, 0, 54, 2, 0, 32, 0, 65, 8,
          106, 65, 0, 54, 2, 0, 32, 0, 32, 1, 106, 34, 2, 65, 12, 107, 65, 0,
          54, 2, 0, 32, 2, 65, 8, 107, 65, 0, 54, 2, 0, 32, 1, 65, 24, 77, 13,
          0, 32, 0, 65, 12, 106, 65, 0, 54, 2, 0, 32, 0, 65, 16, 106, 65, 0, 54,
          2, 0, 32, 0, 65, 20, 106, 65, 0, 54, 2, 0, 32, 0, 65, 24, 106, 65, 0,
          54, 2, 0, 32, 0, 32, 1, 106, 34, 2, 65, 28, 107, 65, 0, 54, 2, 0, 32,
          2, 65, 24, 107, 65, 0, 54, 2, 0, 32, 2, 65, 20, 107, 65, 0, 54, 2, 0,
          32, 2, 65, 16, 107, 65, 0, 54, 2, 0, 32, 0, 32, 0, 65, 4, 113, 65, 24,
          106, 34, 2, 106, 33, 0, 32, 1, 32, 2, 107, 33, 1, 3, 64, 32, 1, 65,
          32, 79, 4, 64, 32, 0, 66, 0, 55, 3, 0, 32, 0, 65, 8, 106, 66, 0, 55,
          3, 0, 32, 0, 65, 16, 106, 66, 0, 55, 3, 0, 32, 0, 65, 24, 106, 66, 0,
          55, 3, 0, 32, 1, 65, 32, 107, 33, 1, 32, 0, 65, 32, 106, 33, 0, 12, 1,
          11, 11, 11, 11, 178, 1, 1, 3, 127, 32, 1, 65, 240, 255, 255, 255, 3,
          32, 2, 118, 75, 4, 64, 65, 144, 1, 65, 192, 1, 65, 23, 65, 56, 16, 0,
          0, 11, 32, 1, 32, 2, 116, 34, 3, 65, 0, 16, 10, 34, 2, 32, 3, 16, 13,
          32, 0, 69, 4, 64, 65, 12, 65, 2, 16, 10, 34, 0, 65, 172, 3, 75, 4, 64,
          32, 0, 65, 16, 107, 34, 1, 32, 1, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11,
          11, 32, 0, 65, 0, 54, 2, 0, 32, 0, 65, 0, 54, 2, 4, 32, 0, 65, 0, 54,
          2, 8, 32, 2, 34, 1, 32, 0, 40, 2, 0, 34, 4, 71, 4, 64, 32, 1, 65, 172,
          3, 75, 4, 64, 32, 1, 65, 16, 107, 34, 5, 32, 5, 40, 2, 4, 65, 1, 106,
          54, 2, 4, 11, 32, 4, 16, 12, 11, 32, 0, 32, 1, 54, 2, 0, 32, 0, 32, 2,
          54, 2, 4, 32, 0, 32, 3, 54, 2, 8, 32, 0, 11, 46, 1, 2, 127, 65, 12,
          65, 5, 16, 10, 34, 0, 65, 172, 3, 75, 4, 64, 32, 0, 65, 16, 107, 34,
          1, 32, 1, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 32, 0, 65, 128, 2, 65,
          3, 16, 14, 11, 9, 0, 65, 63, 32, 0, 121, 167, 107, 11, 49, 1, 2, 127,
          65, 63, 32, 1, 121, 167, 107, 33, 2, 3, 64, 65, 63, 32, 0, 121, 167,
          107, 32, 2, 107, 34, 3, 65, 0, 78, 4, 64, 32, 0, 32, 1, 32, 3, 172,
          134, 133, 33, 0, 12, 1, 11, 11, 32, 0, 11, 40, 0, 32, 1, 32, 0, 40, 2,
          8, 79, 4, 64, 65, 128, 2, 65, 192, 2, 65, 163, 1, 65, 44, 16, 0, 0,
          11, 32, 1, 32, 0, 40, 2, 4, 106, 65, 0, 58, 0, 0, 11, 38, 0, 32, 1,
          32, 0, 40, 2, 8, 79, 4, 64, 65, 128, 2, 65, 192, 2, 65, 152, 1, 65,
          44, 16, 0, 0, 11, 32, 1, 32, 0, 40, 2, 4, 106, 45, 0, 0, 11, 254, 5,
          2, 1, 127, 4, 126, 32, 0, 69, 4, 64, 65, 232, 0, 65, 6, 16, 10, 34, 0,
          65, 172, 3, 75, 4, 64, 32, 0, 65, 16, 107, 34, 5, 32, 5, 40, 2, 4, 65,
          1, 106, 54, 2, 4, 11, 11, 32, 0, 65, 0, 54, 2, 0, 32, 0, 65, 0, 54, 2,
          4, 32, 0, 65, 0, 54, 2, 8, 32, 0, 66, 0, 55, 3, 16, 32, 0, 66, 0, 55,
          3, 24, 32, 0, 66, 0, 55, 3, 32, 32, 0, 66, 0, 55, 3, 40, 32, 0, 66, 0,
          55, 3, 48, 32, 0, 66, 0, 55, 3, 56, 32, 0, 66, 0, 55, 3, 64, 32, 0,
          66, 0, 55, 3, 72, 32, 0, 66, 0, 55, 3, 80, 32, 0, 66, 0, 55, 3, 88,
          32, 0, 66, 0, 55, 3, 96, 32, 0, 32, 2, 173, 55, 3, 80, 32, 0, 32, 3,
          173, 55, 3, 88, 65, 12, 65, 4, 16, 10, 34, 2, 65, 172, 3, 75, 4, 64,
          32, 2, 65, 16, 107, 34, 3, 32, 3, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11,
          32, 2, 32, 4, 65, 0, 16, 14, 33, 2, 32, 0, 40, 2, 0, 16, 12, 32, 0,
          32, 2, 54, 2, 0, 32, 0, 32, 4, 54, 2, 4, 32, 0, 66, 1, 32, 1, 173,
          134, 66, 1, 125, 55, 3, 96, 32, 0, 66, 243, 130, 183, 218, 216, 230,
          232, 30, 55, 3, 72, 35, 4, 69, 4, 64, 65, 0, 33, 2, 3, 64, 32, 2, 65,
          128, 2, 72, 4, 64, 32, 2, 65, 255, 1, 113, 173, 33, 6, 32, 0, 41, 3,
          72, 34, 7, 33, 8, 65, 63, 32, 7, 121, 167, 107, 33, 1, 3, 64, 65, 63,
          32, 6, 121, 167, 107, 32, 1, 107, 34, 3, 65, 0, 78, 4, 64, 32, 6, 32,
          8, 32, 3, 172, 134, 133, 33, 6, 12, 1, 11, 11, 65, 0, 33, 4, 3, 64,
          32, 4, 32, 0, 40, 2, 4, 65, 1, 107, 72, 4, 64, 32, 6, 66, 8, 134, 33,
          6, 32, 0, 41, 3, 72, 34, 7, 33, 8, 65, 63, 32, 7, 121, 167, 107, 33,
          1, 3, 64, 65, 63, 32, 6, 121, 167, 107, 32, 1, 107, 34, 3, 65, 0, 78,
          4, 64, 32, 6, 32, 8, 32, 3, 172, 134, 133, 33, 6, 12, 1, 11, 11, 32,
          4, 65, 1, 106, 33, 4, 12, 1, 11, 11, 35, 6, 40, 2, 4, 32, 2, 65, 3,
          116, 106, 32, 6, 55, 3, 0, 32, 2, 65, 1, 106, 33, 2, 12, 1, 11, 11,
          65, 63, 32, 0, 41, 3, 72, 121, 167, 107, 172, 33, 7, 65, 0, 33, 2, 3,
          64, 32, 2, 65, 128, 2, 72, 4, 64, 35, 5, 33, 1, 32, 2, 172, 32, 7,
          134, 34, 8, 33, 6, 65, 63, 32, 0, 41, 3, 72, 34, 9, 121, 167, 107, 33,
          3, 3, 64, 65, 63, 32, 6, 121, 167, 107, 32, 3, 107, 34, 4, 65, 0, 78,
          4, 64, 32, 6, 32, 9, 32, 4, 172, 134, 133, 33, 6, 12, 1, 11, 11, 32,
          1, 40, 2, 4, 32, 2, 65, 3, 116, 106, 32, 6, 32, 8, 132, 55, 3, 0, 32,
          2, 65, 1, 106, 33, 2, 12, 1, 11, 11, 65, 1, 36, 4, 11, 32, 0, 66, 0,
          55, 3, 24, 32, 0, 66, 0, 55, 3, 32, 65, 0, 33, 2, 3, 64, 32, 2, 32, 0,
          40, 2, 4, 72, 4, 64, 32, 0, 40, 2, 0, 32, 2, 16, 18, 32, 2, 65, 1,
          106, 33, 2, 12, 1, 11, 11, 32, 0, 66, 0, 55, 3, 40, 32, 0, 65, 0, 54,
          2, 8, 32, 0, 66, 0, 55, 3, 16, 32, 0, 66, 0, 55, 3, 40, 32, 0, 40, 2,
          0, 32, 0, 40, 2, 8, 16, 19, 33, 1, 32, 0, 40, 2, 8, 32, 0, 40, 2, 0,
          40, 2, 4, 106, 65, 1, 58, 0, 0, 32, 0, 32, 0, 41, 3, 40, 35, 6, 40, 2,
          4, 32, 1, 65, 3, 116, 106, 41, 3, 0, 133, 55, 3, 40, 32, 0, 32, 0, 40,
          2, 8, 65, 1, 106, 32, 0, 40, 2, 4, 111, 54, 2, 8, 32, 0, 35, 5, 40, 2,
          4, 32, 0, 41, 3, 40, 34, 6, 66, 45, 136, 167, 65, 3, 116, 106, 41, 3,
          0, 32, 6, 66, 8, 134, 66, 1, 132, 133, 55, 3, 40, 32, 0, 11, 38, 1, 1,
          127, 32, 0, 40, 2, 0, 34, 0, 65, 172, 3, 75, 4, 64, 32, 0, 65, 16,
          107, 34, 1, 32, 1, 40, 2, 4, 65, 1, 106, 54, 2, 4, 11, 32, 0, 11, 55,
          1, 2, 127, 32, 1, 32, 0, 40, 2, 0, 34, 2, 71, 4, 64, 32, 1, 65, 172,
          3, 75, 4, 64, 32, 1, 65, 16, 107, 34, 3, 32, 3, 40, 2, 4, 65, 1, 106,
          54, 2, 4, 11, 32, 2, 16, 12, 11, 32, 0, 32, 1, 54, 2, 0, 11, 7, 0, 32,
          0, 40, 2, 4, 11, 9, 0, 32, 0, 32, 1, 54, 2, 4, 11, 7, 0, 32, 0, 40, 2,
          8, 11, 9, 0, 32, 0, 32, 1, 54, 2, 8, 11, 7, 0, 32, 0, 41, 3, 16, 11,
          9, 0, 32, 0, 32, 1, 55, 3, 16, 11, 7, 0, 32, 0, 41, 3, 24, 11, 9, 0,
          32, 0, 32, 1, 55, 3, 24, 11, 7, 0, 32, 0, 41, 3, 32, 11, 9, 0, 32, 0,
          32, 1, 55, 3, 32, 11, 7, 0, 32, 0, 41, 3, 40, 11, 9, 0, 32, 0, 32, 1,
          55, 3, 40, 11, 7, 0, 32, 0, 41, 3, 48, 11, 9, 0, 32, 0, 32, 1, 55, 3,
          48, 11, 7, 0, 32, 0, 41, 3, 56, 11, 9, 0, 32, 0, 32, 1, 55, 3, 56, 11,
          7, 0, 32, 0, 41, 3, 64, 11, 9, 0, 32, 0, 32, 1, 55, 3, 64, 11, 7, 0,
          32, 0, 41, 3, 72, 11, 9, 0, 32, 0, 32, 1, 55, 3, 72, 11, 7, 0, 32, 0,
          41, 3, 80, 11, 9, 0, 32, 0, 32, 1, 55, 3, 80, 11, 7, 0, 32, 0, 41, 3,
          88, 11, 9, 0, 32, 0, 32, 1, 55, 3, 88, 11, 7, 0, 32, 0, 41, 3, 96, 11,
          9, 0, 32, 0, 32, 1, 55, 3, 96, 11, 172, 4, 2, 5, 127, 1, 126, 32, 2,
          65, 172, 3, 75, 4, 64, 32, 2, 65, 16, 107, 34, 4, 32, 4, 40, 2, 4, 65,
          1, 106, 54, 2, 4, 11, 32, 2, 33, 4, 65, 0, 33, 2, 32, 1, 40, 2, 8, 33,
          5, 32, 1, 40, 2, 4, 33, 6, 3, 64, 2, 127, 65, 0, 33, 3, 3, 64, 32, 3,
          32, 5, 72, 4, 64, 32, 3, 32, 6, 106, 45, 0, 0, 33, 1, 32, 0, 40, 2, 0,
          32, 0, 40, 2, 8, 16, 19, 33, 7, 32, 0, 40, 2, 8, 32, 0, 40, 2, 0, 40,
          2, 4, 106, 32, 1, 58, 0, 0, 32, 0, 32, 0, 41, 3, 40, 35, 6, 40, 2, 4,
          32, 7, 65, 3, 116, 106, 41, 3, 0, 133, 55, 3, 40, 32, 0, 32, 0, 40, 2,
          8, 65, 1, 106, 32, 0, 40, 2, 4, 111, 54, 2, 8, 32, 0, 35, 5, 40, 2, 4,
          32, 0, 41, 3, 40, 34, 8, 66, 45, 136, 167, 65, 3, 116, 106, 41, 3, 0,
          32, 1, 173, 32, 8, 66, 8, 134, 132, 133, 55, 3, 40, 32, 0, 32, 0, 41,
          3, 16, 66, 1, 124, 55, 3, 16, 32, 0, 32, 0, 41, 3, 24, 66, 1, 124, 55,
          3, 24, 32, 0, 41, 3, 16, 32, 0, 41, 3, 80, 90, 4, 127, 32, 0, 41, 3,
          40, 32, 0, 41, 3, 96, 131, 80, 5, 65, 0, 11, 4, 127, 65, 1, 5, 32, 0,
          41, 3, 16, 32, 0, 41, 3, 88, 90, 11, 4, 64, 32, 0, 32, 0, 41, 3, 32,
          55, 3, 48, 32, 0, 32, 0, 41, 3, 16, 55, 3, 56, 32, 0, 32, 0, 41, 3,
          40, 55, 3, 64, 65, 0, 33, 1, 3, 64, 32, 1, 32, 0, 40, 2, 4, 72, 4, 64,
          32, 0, 40, 2, 0, 32, 1, 16, 18, 32, 1, 65, 1, 106, 33, 1, 12, 1, 11,
          11, 32, 0, 66, 0, 55, 3, 40, 32, 0, 65, 0, 54, 2, 8, 32, 0, 66, 0, 55,
          3, 16, 32, 0, 66, 0, 55, 3, 40, 32, 0, 40, 2, 0, 32, 0, 40, 2, 8, 16,
          19, 33, 1, 32, 0, 40, 2, 8, 32, 0, 40, 2, 0, 40, 2, 4, 106, 65, 1, 58,
          0, 0, 32, 0, 32, 0, 41, 3, 40, 35, 6, 40, 2, 4, 32, 1, 65, 3, 116,
          106, 41, 3, 0, 133, 55, 3, 40, 32, 0, 32, 0, 40, 2, 8, 65, 1, 106, 32,
          0, 40, 2, 4, 111, 54, 2, 8, 32, 0, 35, 5, 40, 2, 4, 32, 0, 41, 3, 40,
          34, 8, 66, 45, 136, 167, 65, 3, 116, 106, 41, 3, 0, 32, 8, 66, 8, 134,
          66, 1, 132, 133, 55, 3, 40, 32, 3, 65, 1, 106, 12, 3, 11, 32, 3, 65,
          1, 106, 33, 3, 12, 1, 11, 11, 65, 127, 11, 34, 1, 65, 0, 78, 4, 64,
          32, 5, 32, 1, 107, 33, 5, 32, 1, 32, 6, 106, 33, 6, 32, 2, 34, 1, 65,
          1, 106, 33, 2, 32, 4, 40, 2, 4, 32, 1, 65, 2, 116, 106, 32, 0, 41, 3,
          56, 62, 2, 0, 12, 1, 11, 11, 32, 4, 11, 10, 0, 16, 15, 36, 5, 16, 15,
          36, 6, 11, 3, 0, 1, 11, 73, 1, 2, 127, 32, 0, 40, 2, 4, 34, 1, 65,
          255, 255, 255, 255, 0, 113, 34, 2, 65, 1, 70, 4, 64, 32, 0, 65, 16,
          106, 16, 53, 32, 0, 32, 0, 40, 2, 0, 65, 1, 114, 54, 2, 0, 35, 0, 32,
          0, 16, 2, 5, 32, 0, 32, 2, 65, 1, 107, 32, 1, 65, 128, 128, 128, 128,
          127, 113, 114, 54, 2, 4, 11, 11, 58, 0, 2, 64, 2, 64, 2, 64, 32, 0,
          65, 8, 107, 40, 2, 0, 14, 7, 0, 0, 1, 1, 1, 1, 1, 2, 11, 15, 11, 32,
          0, 40, 2, 0, 34, 0, 4, 64, 32, 0, 65, 172, 3, 79, 4, 64, 32, 0, 65,
          16, 107, 16, 52, 11, 11, 15, 11, 0, 11, 11, 137, 3, 7, 0, 65, 16, 11,
          55, 40, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 40, 0, 0, 0, 97, 0, 108, 0,
          108, 0, 111, 0, 99, 0, 97, 0, 116, 0, 105, 0, 111, 0, 110, 0, 32, 0,
          116, 0, 111, 0, 111, 0, 32, 0, 108, 0, 97, 0, 114, 0, 103, 0, 101, 0,
          65, 208, 0, 11, 45, 30, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 30, 0, 0, 0,
          126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 114, 0, 116, 0, 47, 0, 116, 0,
          108, 0, 115, 0, 102, 0, 46, 0, 116, 0, 115, 0, 65, 128, 1, 11, 43, 28,
          0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 28, 0, 0, 0, 73, 0, 110, 0, 118, 0,
          97, 0, 108, 0, 105, 0, 100, 0, 32, 0, 108, 0, 101, 0, 110, 0, 103, 0,
          116, 0, 104, 0, 65, 176, 1, 11, 53, 38, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0,
          0, 38, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 97, 0, 114, 0,
          114, 0, 97, 0, 121, 0, 98, 0, 117, 0, 102, 0, 102, 0, 101, 0, 114, 0,
          46, 0, 116, 0, 115, 0, 65, 240, 1, 11, 51, 36, 0, 0, 0, 1, 0, 0, 0, 1,
          0, 0, 0, 36, 0, 0, 0, 73, 0, 110, 0, 100, 0, 101, 0, 120, 0, 32, 0,
          111, 0, 117, 0, 116, 0, 32, 0, 111, 0, 102, 0, 32, 0, 114, 0, 97, 0,
          110, 0, 103, 0, 101, 0, 65, 176, 2, 11, 51, 36, 0, 0, 0, 1, 0, 0, 0,
          1, 0, 0, 0, 36, 0, 0, 0, 126, 0, 108, 0, 105, 0, 98, 0, 47, 0, 116, 0,
          121, 0, 112, 0, 101, 0, 100, 0, 97, 0, 114, 0, 114, 0, 97, 0, 121, 0,
          46, 0, 116, 0, 115, 0, 65, 240, 2, 11, 53, 7, 0, 0, 0, 16, 0, 0, 0, 0,
          0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 0, 145, 4, 0,
          0, 2, 0, 0, 0, 49, 0, 0, 0, 2, 0, 0, 0, 17, 1, 0, 0, 2, 0, 0, 0, 16,
          0, 34, 16, 115, 111, 117, 114, 99, 101, 77, 97, 112, 112, 105, 110,
          103, 85, 82, 76, 16, 46, 47, 114, 97, 98, 105, 110, 46, 119, 97, 115,
          109, 46, 109, 97, 112,
        ]);
        return instantiate(
          new Response(new Blob([wasm], { type: 'application/wasm' })),
          imp
        );
      }
      module2.exports = loadWebAssembly;
    },
  });

  // node_modules/rabin-wasm/src/index.js
  var require_src = __commonJS({
    'node_modules/rabin-wasm/src/index.js'(exports2, module2) {
      var Rabin = require_rabin();
      var getRabin = require_rabin_wasm();
      var create3 = async (avg, min, max, windowSize, polynomial) => {
        const compiled = await getRabin();
        return new Rabin(compiled, avg, min, max, windowSize, polynomial);
      };
      module2.exports = {
        Rabin,
        create: create3,
      };
    },
  });

  // node_modules/sparse-array/index.js
  var require_sparse_array = __commonJS({
    'node_modules/sparse-array/index.js'(exports2, module2) {
      'use strict';
      var BITS_PER_BYTE = 7;
      module2.exports = class SparseArray {
        constructor() {
          this._bitArrays = [];
          this._data = [];
          this._length = 0;
          this._changedLength = false;
          this._changedData = false;
        }
        set(index, value) {
          let pos = this._internalPositionFor(index, false);
          if (value === void 0) {
            if (pos !== -1) {
              this._unsetInternalPos(pos);
              this._unsetBit(index);
              this._changedLength = true;
              this._changedData = true;
            }
          } else {
            let needsSort = false;
            if (pos === -1) {
              pos = this._data.length;
              this._setBit(index);
              this._changedData = true;
            } else {
              needsSort = true;
            }
            this._setInternalPos(pos, index, value, needsSort);
            this._changedLength = true;
          }
        }
        unset(index) {
          this.set(index, void 0);
        }
        get(index) {
          this._sortData();
          const pos = this._internalPositionFor(index, true);
          if (pos === -1) {
            return void 0;
          }
          return this._data[pos][1];
        }
        push(value) {
          this.set(this.length, value);
          return this.length;
        }
        get length() {
          this._sortData();
          if (this._changedLength) {
            const last = this._data[this._data.length - 1];
            this._length = last ? last[0] + 1 : 0;
            this._changedLength = false;
          }
          return this._length;
        }
        forEach(iterator) {
          let i = 0;
          while (i < this.length) {
            iterator(this.get(i), i, this);
            i++;
          }
        }
        map(iterator) {
          let i = 0;
          let mapped = new Array(this.length);
          while (i < this.length) {
            mapped[i] = iterator(this.get(i), i, this);
            i++;
          }
          return mapped;
        }
        reduce(reducer, initialValue) {
          let i = 0;
          let acc = initialValue;
          while (i < this.length) {
            const value = this.get(i);
            acc = reducer(acc, value, i);
            i++;
          }
          return acc;
        }
        find(finder) {
          let i = 0,
            found,
            last;
          while (i < this.length && !found) {
            last = this.get(i);
            found = finder(last);
            i++;
          }
          return found ? last : void 0;
        }
        _internalPositionFor(index, noCreate) {
          const bytePos = this._bytePosFor(index, noCreate);
          if (bytePos >= this._bitArrays.length) {
            return -1;
          }
          const byte = this._bitArrays[bytePos];
          const bitPos = index - bytePos * BITS_PER_BYTE;
          const exists2 = (byte & (1 << bitPos)) > 0;
          if (!exists2) {
            return -1;
          }
          const previousPopCount = this._bitArrays
            .slice(0, bytePos)
            .reduce(popCountReduce, 0);
          const mask = ~(4294967295 << (bitPos + 1));
          const bytePopCount = popCount(byte & mask);
          const arrayPos = previousPopCount + bytePopCount - 1;
          return arrayPos;
        }
        _bytePosFor(index, noCreate) {
          const bytePos = Math.floor(index / BITS_PER_BYTE);
          const targetLength = bytePos + 1;
          while (!noCreate && this._bitArrays.length < targetLength) {
            this._bitArrays.push(0);
          }
          return bytePos;
        }
        _setBit(index) {
          const bytePos = this._bytePosFor(index, false);
          this._bitArrays[bytePos] |= 1 << (index - bytePos * BITS_PER_BYTE);
        }
        _unsetBit(index) {
          const bytePos = this._bytePosFor(index, false);
          this._bitArrays[bytePos] &= ~(1 << (index - bytePos * BITS_PER_BYTE));
        }
        _setInternalPos(pos, index, value, needsSort) {
          const data = this._data;
          const elem = [index, value];
          if (needsSort) {
            this._sortData();
            data[pos] = elem;
          } else {
            if (data.length) {
              if (data[data.length - 1][0] >= index) {
                data.push(elem);
              } else if (data[0][0] <= index) {
                data.unshift(elem);
              } else {
                const randomIndex = Math.round(data.length / 2);
                this._data = data
                  .slice(0, randomIndex)
                  .concat(elem)
                  .concat(data.slice(randomIndex));
              }
            } else {
              this._data.push(elem);
            }
            this._changedData = true;
            this._changedLength = true;
          }
        }
        _unsetInternalPos(pos) {
          this._data.splice(pos, 1);
        }
        _sortData() {
          if (this._changedData) {
            this._data.sort(sortInternal);
          }
          this._changedData = false;
        }
        bitField() {
          const bytes = [];
          let pendingBitsForResultingByte = 8;
          let pendingBitsForNewByte = 0;
          let resultingByte = 0;
          let newByte;
          const pending = this._bitArrays.slice();
          while (pending.length || pendingBitsForNewByte) {
            if (pendingBitsForNewByte === 0) {
              newByte = pending.shift();
              pendingBitsForNewByte = 7;
            }
            const usingBits = Math.min(
              pendingBitsForNewByte,
              pendingBitsForResultingByte
            );
            const mask = ~(255 << usingBits);
            const masked = newByte & mask;
            resultingByte |= masked << (8 - pendingBitsForResultingByte);
            newByte = newByte >>> usingBits;
            pendingBitsForNewByte -= usingBits;
            pendingBitsForResultingByte -= usingBits;
            if (
              !pendingBitsForResultingByte ||
              (!pendingBitsForNewByte && !pending.length)
            ) {
              bytes.push(resultingByte);
              resultingByte = 0;
              pendingBitsForResultingByte = 8;
            }
          }
          for (var i = bytes.length - 1; i > 0; i--) {
            const value = bytes[i];
            if (value === 0) {
              bytes.pop();
            } else {
              break;
            }
          }
          return bytes;
        }
        compactArray() {
          this._sortData();
          return this._data.map(valueOnly);
        }
      };
      function popCountReduce(count, byte) {
        return count + popCount(byte);
      }
      function popCount(_v) {
        let v = _v;
        v = v - ((v >> 1) & 1431655765);
        v = (v & 858993459) + ((v >> 2) & 858993459);
        return (((v + (v >> 4)) & 252645135) * 16843009) >> 24;
      }
      function sortInternal(a, b) {
        return a[0] - b[0];
      }
      function valueOnly(elem) {
        return elem[1];
      }
    },
  });

  // index.js
  var es_bundler_exports = {};
  __export(es_bundler_exports, {
    MemoryBlockstore: () => MemoryBlockstore,
    importer: () => importer,
  });

  // node_modules/it-batch/dist/src/index.js
  async function* batch(source, size = 1) {
    let things = [];
    if (size < 1) {
      size = 1;
    }
    for await (const thing of source) {
      things.push(thing);
      while (things.length >= size) {
        yield things.slice(0, size);
        things = things.slice(size);
      }
    }
    while (things.length > 0) {
      yield things.slice(0, size);
      things = things.slice(size);
    }
  }

  // node_modules/it-parallel-batch/dist/src/index.js
  async function* parallelBatch(source, size = 1) {
    for await (const tasks of batch(source, size)) {
      const things = tasks.map(async (p) => {
        return await p().then(
          (value) => ({ ok: true, value }),
          (err) => ({ ok: false, err })
        );
      });
      for (let i = 0; i < things.length; i++) {
        const result = await things[i];
        if (result.ok) {
          yield result.value;
        } else {
          throw result.err;
        }
      }
    }
  }

  // node_modules/merge-options/index.mjs
  var import_index = __toESM(require_merge_options(), 1);
  var merge_options_default = import_index.default;

  // node_modules/multiformats/src/hashes/sha2-browser.js
  var sha2_browser_exports = {};
  __export(sha2_browser_exports, {
    sha256: () => sha256,
    sha512: () => sha512,
  });

  // node_modules/multiformats/src/bytes.js
  var bytes_exports = {};
  __export(bytes_exports, {
    coerce: () => coerce,
    empty: () => empty,
    equals: () => equals,
    fromHex: () => fromHex,
    fromString: () => fromString,
    isBinary: () => isBinary,
    toHex: () => toHex,
    toString: () => toString,
  });
  var empty = new Uint8Array(0);
  var toHex = (d) =>
    d.reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '');
  var fromHex = (hex) => {
    const hexes = hex.match(/../g);
    return hexes ? new Uint8Array(hexes.map((b) => parseInt(b, 16))) : empty;
  };
  var equals = (aa, bb) => {
    if (aa === bb) return true;
    if (aa.byteLength !== bb.byteLength) {
      return false;
    }
    for (let ii = 0; ii < aa.byteLength; ii++) {
      if (aa[ii] !== bb[ii]) {
        return false;
      }
    }
    return true;
  };
  var coerce = (o) => {
    if (o instanceof Uint8Array && o.constructor.name === 'Uint8Array')
      return o;
    if (o instanceof ArrayBuffer) return new Uint8Array(o);
    if (ArrayBuffer.isView(o)) {
      return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
    }
    throw new Error('Unknown type, must be binary type');
  };
  var isBinary = (o) => o instanceof ArrayBuffer || ArrayBuffer.isView(o);
  var fromString = (str) => new TextEncoder().encode(str);
  var toString = (b) => new TextDecoder().decode(b);

  // node_modules/multiformats/vendor/varint.js
  var encode_1 = encode;
  var MSB = 128;
  var REST = 127;
  var MSBALL = ~REST;
  var INT = Math.pow(2, 31);
  function encode(num, out, offset) {
    out = out || [];
    offset = offset || 0;
    var oldOffset = offset;
    while (num >= INT) {
      out[offset++] = (num & 255) | MSB;
      num /= 128;
    }
    while (num & MSBALL) {
      out[offset++] = (num & 255) | MSB;
      num >>>= 7;
    }
    out[offset] = num | 0;
    encode.bytes = offset - oldOffset + 1;
    return out;
  }
  var decode = read;
  var MSB$1 = 128;
  var REST$1 = 127;
  function read(buf, offset) {
    var res = 0,
      offset = offset || 0,
      shift = 0,
      counter = offset,
      b,
      l = buf.length;
    do {
      if (counter >= l) {
        read.bytes = 0;
        throw new RangeError('Could not decode varint');
      }
      b = buf[counter++];
      res +=
        shift < 28 ? (b & REST$1) << shift : (b & REST$1) * Math.pow(2, shift);
      shift += 7;
    } while (b >= MSB$1);
    read.bytes = counter - offset;
    return res;
  }
  var N1 = Math.pow(2, 7);
  var N2 = Math.pow(2, 14);
  var N3 = Math.pow(2, 21);
  var N4 = Math.pow(2, 28);
  var N5 = Math.pow(2, 35);
  var N6 = Math.pow(2, 42);
  var N7 = Math.pow(2, 49);
  var N8 = Math.pow(2, 56);
  var N9 = Math.pow(2, 63);
  var length = function (value) {
    return value < N1
      ? 1
      : value < N2
      ? 2
      : value < N3
      ? 3
      : value < N4
      ? 4
      : value < N5
      ? 5
      : value < N6
      ? 6
      : value < N7
      ? 7
      : value < N8
      ? 8
      : value < N9
      ? 9
      : 10;
  };
  var varint = {
    encode: encode_1,
    decode,
    encodingLength: length,
  };
  var _brrp_varint = varint;
  var varint_default = _brrp_varint;

  // node_modules/multiformats/src/varint.js
  var decode2 = (data, offset = 0) => {
    const code4 = varint_default.decode(data, offset);
    return [code4, varint_default.decode.bytes];
  };
  var encodeTo = (int, target, offset = 0) => {
    varint_default.encode(int, target, offset);
    return target;
  };
  var encodingLength = (int) => {
    return varint_default.encodingLength(int);
  };

  // node_modules/multiformats/src/hashes/digest.js
  var create = (code4, digest2) => {
    const size = digest2.byteLength;
    const sizeOffset = encodingLength(code4);
    const digestOffset = sizeOffset + encodingLength(size);
    const bytes = new Uint8Array(digestOffset + size);
    encodeTo(code4, bytes, 0);
    encodeTo(size, bytes, sizeOffset);
    bytes.set(digest2, digestOffset);
    return new Digest(code4, size, digest2, bytes);
  };
  var decode3 = (multihash) => {
    const bytes = coerce(multihash);
    const [code4, sizeOffset] = decode2(bytes);
    const [size, digestOffset] = decode2(bytes.subarray(sizeOffset));
    const digest2 = bytes.subarray(sizeOffset + digestOffset);
    if (digest2.byteLength !== size) {
      throw new Error('Incorrect length');
    }
    return new Digest(code4, size, digest2, bytes);
  };
  var equals2 = (a, b) => {
    if (a === b) {
      return true;
    } else {
      const data =
        /** @type {{code?:unknown, size?:unknown, bytes?:unknown}} */
        b;
      return (
        a.code === data.code &&
        a.size === data.size &&
        data.bytes instanceof Uint8Array &&
        equals(a.bytes, data.bytes)
      );
    }
  };
  var Digest = class {
    /**
     * Creates a multihash digest.
     *
     * @param {Code} code
     * @param {Size} size
     * @param {Uint8Array} digest
     * @param {Uint8Array} bytes
     */
    constructor(code4, size, digest2, bytes) {
      this.code = code4;
      this.size = size;
      this.digest = digest2;
      this.bytes = bytes;
    }
  };

  // node_modules/multiformats/src/hashes/hasher.js
  var from = ({ name: name4, code: code4, encode: encode7 }) =>
    new Hasher(name4, code4, encode7);
  var Hasher = class {
    /**
     *
     * @param {Name} name
     * @param {Code} code
     * @param {(input: Uint8Array) => Await<Uint8Array>} encode
     */
    constructor(name4, code4, encode7) {
      this.name = name4;
      this.code = code4;
      this.encode = encode7;
    }
    /**
     * @param {Uint8Array} input
     * @returns {Await<Digest.Digest<Code, number>>}
     */
    digest(input) {
      if (input instanceof Uint8Array) {
        const result = this.encode(input);
        return result instanceof Uint8Array
          ? create(this.code, result)
          : result.then((digest2) => create(this.code, digest2));
      } else {
        throw Error('Unknown type, must be binary type');
      }
    }
  };

  // node_modules/multiformats/src/hashes/sha2-browser.js
  var sha =
    (name4) =>
    /**
     * @param {Uint8Array} data
     */
    async (data) =>
      new Uint8Array(await crypto.subtle.digest(name4, data));
  var sha256 = from({
    name: 'sha2-256',
    code: 18,
    encode: sha('SHA-256'),
  });
  var sha512 = from({
    name: 'sha2-512',
    code: 19,
    encode: sha('SHA-512'),
  });

  // node_modules/multiformats/src/bases/base58.js
  var base58_exports = {};
  __export(base58_exports, {
    base58btc: () => base58btc,
    base58flickr: () => base58flickr,
  });

  // node_modules/multiformats/vendor/base-x.js
  function base(ALPHABET, name4) {
    if (ALPHABET.length >= 255) {
      throw new TypeError('Alphabet too long');
    }
    var BASE_MAP = new Uint8Array(256);
    for (var j = 0; j < BASE_MAP.length; j++) {
      BASE_MAP[j] = 255;
    }
    for (var i = 0; i < ALPHABET.length; i++) {
      var x = ALPHABET.charAt(i);
      var xc = x.charCodeAt(0);
      if (BASE_MAP[xc] !== 255) {
        throw new TypeError(x + ' is ambiguous');
      }
      BASE_MAP[xc] = i;
    }
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0);
    var FACTOR = Math.log(BASE) / Math.log(256);
    var iFACTOR = Math.log(256) / Math.log(BASE);
    function encode7(source) {
      if (source instanceof Uint8Array);
      else if (ArrayBuffer.isView(source)) {
        source = new Uint8Array(
          source.buffer,
          source.byteOffset,
          source.byteLength
        );
      } else if (Array.isArray(source)) {
        source = Uint8Array.from(source);
      }
      if (!(source instanceof Uint8Array)) {
        throw new TypeError('Expected Uint8Array');
      }
      if (source.length === 0) {
        return '';
      }
      var zeroes = 0;
      var length2 = 0;
      var pbegin = 0;
      var pend = source.length;
      while (pbegin !== pend && source[pbegin] === 0) {
        pbegin++;
        zeroes++;
      }
      var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
      var b58 = new Uint8Array(size);
      while (pbegin !== pend) {
        var carry = source[pbegin];
        var i2 = 0;
        for (
          var it1 = size - 1;
          (carry !== 0 || i2 < length2) && it1 !== -1;
          it1--, i2++
        ) {
          carry += (256 * b58[it1]) >>> 0;
          b58[it1] = carry % BASE >>> 0;
          carry = (carry / BASE) >>> 0;
        }
        if (carry !== 0) {
          throw new Error('Non-zero carry');
        }
        length2 = i2;
        pbegin++;
      }
      var it2 = size - length2;
      while (it2 !== size && b58[it2] === 0) {
        it2++;
      }
      var str = LEADER.repeat(zeroes);
      for (; it2 < size; ++it2) {
        str += ALPHABET.charAt(b58[it2]);
      }
      return str;
    }
    function decodeUnsafe(source) {
      if (typeof source !== 'string') {
        throw new TypeError('Expected String');
      }
      if (source.length === 0) {
        return new Uint8Array();
      }
      var psz = 0;
      if (source[psz] === ' ') {
        return;
      }
      var zeroes = 0;
      var length2 = 0;
      while (source[psz] === LEADER) {
        zeroes++;
        psz++;
      }
      var size = ((source.length - psz) * FACTOR + 1) >>> 0;
      var b256 = new Uint8Array(size);
      while (source[psz]) {
        var carry = BASE_MAP[source.charCodeAt(psz)];
        if (carry === 255) {
          return;
        }
        var i2 = 0;
        for (
          var it3 = size - 1;
          (carry !== 0 || i2 < length2) && it3 !== -1;
          it3--, i2++
        ) {
          carry += (BASE * b256[it3]) >>> 0;
          b256[it3] = carry % 256 >>> 0;
          carry = (carry / 256) >>> 0;
        }
        if (carry !== 0) {
          throw new Error('Non-zero carry');
        }
        length2 = i2;
        psz++;
      }
      if (source[psz] === ' ') {
        return;
      }
      var it4 = size - length2;
      while (it4 !== size && b256[it4] === 0) {
        it4++;
      }
      var vch = new Uint8Array(zeroes + (size - it4));
      var j2 = zeroes;
      while (it4 !== size) {
        vch[j2++] = b256[it4++];
      }
      return vch;
    }
    function decode8(string2) {
      var buffer = decodeUnsafe(string2);
      if (buffer) {
        return buffer;
      }
      throw new Error(`Non-${name4} character`);
    }
    return {
      encode: encode7,
      decodeUnsafe,
      decode: decode8,
    };
  }
  var src = base;
  var _brrp__multiformats_scope_baseX = src;
  var base_x_default = _brrp__multiformats_scope_baseX;

  // node_modules/multiformats/src/bases/base.js
  var Encoder = class {
    /**
     * @param {Base} name
     * @param {Prefix} prefix
     * @param {(bytes:Uint8Array) => string} baseEncode
     */
    constructor(name4, prefix, baseEncode) {
      this.name = name4;
      this.prefix = prefix;
      this.baseEncode = baseEncode;
    }
    /**
     * @param {Uint8Array} bytes
     * @returns {API.Multibase<Prefix>}
     */
    encode(bytes) {
      if (bytes instanceof Uint8Array) {
        return `${this.prefix}${this.baseEncode(bytes)}`;
      } else {
        throw Error('Unknown type, must be binary type');
      }
    }
  };
  var Decoder = class {
    /**
     * @param {Base} name
     * @param {Prefix} prefix
     * @param {(text:string) => Uint8Array} baseDecode
     */
    constructor(name4, prefix, baseDecode) {
      this.name = name4;
      this.prefix = prefix;
      if (prefix.codePointAt(0) === void 0) {
        throw new Error('Invalid prefix character');
      }
      this.prefixCodePoint = /** @type {number} */ prefix.codePointAt(0);
      this.baseDecode = baseDecode;
    }
    /**
     * @param {string} text
     */
    decode(text) {
      if (typeof text === 'string') {
        if (text.codePointAt(0) !== this.prefixCodePoint) {
          throw Error(
            `Unable to decode multibase string ${JSON.stringify(text)}, ${
              this.name
            } decoder only supports inputs prefixed with ${this.prefix}`
          );
        }
        return this.baseDecode(text.slice(this.prefix.length));
      } else {
        throw Error('Can only multibase decode strings');
      }
    }
    /**
     * @template {string} OtherPrefix
     * @param {API.UnibaseDecoder<OtherPrefix>|ComposedDecoder<OtherPrefix>} decoder
     * @returns {ComposedDecoder<Prefix|OtherPrefix>}
     */
    or(decoder) {
      return or(this, decoder);
    }
  };
  var ComposedDecoder = class {
    /**
     * @param {Decoders<Prefix>} decoders
     */
    constructor(decoders) {
      this.decoders = decoders;
    }
    /**
     * @template {string} OtherPrefix
     * @param {API.UnibaseDecoder<OtherPrefix>|ComposedDecoder<OtherPrefix>} decoder
     * @returns {ComposedDecoder<Prefix|OtherPrefix>}
     */
    or(decoder) {
      return or(this, decoder);
    }
    /**
     * @param {string} input
     * @returns {Uint8Array}
     */
    decode(input) {
      const prefix =
        /** @type {Prefix} */
        input[0];
      const decoder = this.decoders[prefix];
      if (decoder) {
        return decoder.decode(input);
      } else {
        throw RangeError(
          `Unable to decode multibase string ${JSON.stringify(
            input
          )}, only inputs prefixed with ${Object.keys(
            this.decoders
          )} are supported`
        );
      }
    }
  };
  var or = (left, right) =>
    new ComposedDecoder(
      /** @type {Decoders<L|R>} */
      {
        ...(left.decoders || {
          [/** @type API.UnibaseDecoder<L> */
          left.prefix]: left,
        }),
        ...(right.decoders || {
          [/** @type API.UnibaseDecoder<R> */
          right.prefix]: right,
        }),
      }
    );
  var Codec = class {
    /**
     * @param {Base} name
     * @param {Prefix} prefix
     * @param {(bytes:Uint8Array) => string} baseEncode
     * @param {(text:string) => Uint8Array} baseDecode
     */
    constructor(name4, prefix, baseEncode, baseDecode) {
      this.name = name4;
      this.prefix = prefix;
      this.baseEncode = baseEncode;
      this.baseDecode = baseDecode;
      this.encoder = new Encoder(name4, prefix, baseEncode);
      this.decoder = new Decoder(name4, prefix, baseDecode);
    }
    /**
     * @param {Uint8Array} input
     */
    encode(input) {
      return this.encoder.encode(input);
    }
    /**
     * @param {string} input
     */
    decode(input) {
      return this.decoder.decode(input);
    }
  };
  var from2 = ({ name: name4, prefix, encode: encode7, decode: decode8 }) =>
    new Codec(name4, prefix, encode7, decode8);
  var baseX = ({ prefix, name: name4, alphabet: alphabet2 }) => {
    const { encode: encode7, decode: decode8 } = base_x_default(
      alphabet2,
      name4
    );
    return from2({
      prefix,
      name: name4,
      encode: encode7,
      /**
       * @param {string} text
       */
      decode: (text) => coerce(decode8(text)),
    });
  };
  var decode4 = (string2, alphabet2, bitsPerChar, name4) => {
    const codes = {};
    for (let i = 0; i < alphabet2.length; ++i) {
      codes[alphabet2[i]] = i;
    }
    let end = string2.length;
    while (string2[end - 1] === '=') {
      --end;
    }
    const out = new Uint8Array(((end * bitsPerChar) / 8) | 0);
    let bits = 0;
    let buffer = 0;
    let written = 0;
    for (let i = 0; i < end; ++i) {
      const value = codes[string2[i]];
      if (value === void 0) {
        throw new SyntaxError(`Non-${name4} character`);
      }
      buffer = (buffer << bitsPerChar) | value;
      bits += bitsPerChar;
      if (bits >= 8) {
        bits -= 8;
        out[written++] = 255 & (buffer >> bits);
      }
    }
    if (bits >= bitsPerChar || 255 & (buffer << (8 - bits))) {
      throw new SyntaxError('Unexpected end of data');
    }
    return out;
  };
  var encode2 = (data, alphabet2, bitsPerChar) => {
    const pad = alphabet2[alphabet2.length - 1] === '=';
    const mask = (1 << bitsPerChar) - 1;
    let out = '';
    let bits = 0;
    let buffer = 0;
    for (let i = 0; i < data.length; ++i) {
      buffer = (buffer << 8) | data[i];
      bits += 8;
      while (bits > bitsPerChar) {
        bits -= bitsPerChar;
        out += alphabet2[mask & (buffer >> bits)];
      }
    }
    if (bits) {
      out += alphabet2[mask & (buffer << (bitsPerChar - bits))];
    }
    if (pad) {
      while ((out.length * bitsPerChar) & 7) {
        out += '=';
      }
    }
    return out;
  };
  var rfc4648 = ({ name: name4, prefix, bitsPerChar, alphabet: alphabet2 }) => {
    return from2({
      prefix,
      name: name4,
      encode(input) {
        return encode2(input, alphabet2, bitsPerChar);
      },
      decode(input) {
        return decode4(input, alphabet2, bitsPerChar, name4);
      },
    });
  };

  // node_modules/multiformats/src/bases/base58.js
  var base58btc = baseX({
    name: 'base58btc',
    prefix: 'z',
    alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  });
  var base58flickr = baseX({
    name: 'base58flickr',
    prefix: 'Z',
    alphabet: '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
  });

  // node_modules/multiformats/src/bases/base32.js
  var base32_exports = {};
  __export(base32_exports, {
    base32: () => base32,
    base32hex: () => base32hex,
    base32hexpad: () => base32hexpad,
    base32hexpadupper: () => base32hexpadupper,
    base32hexupper: () => base32hexupper,
    base32pad: () => base32pad,
    base32padupper: () => base32padupper,
    base32upper: () => base32upper,
    base32z: () => base32z,
  });
  var base32 = rfc4648({
    prefix: 'b',
    name: 'base32',
    alphabet: 'abcdefghijklmnopqrstuvwxyz234567',
    bitsPerChar: 5,
  });
  var base32upper = rfc4648({
    prefix: 'B',
    name: 'base32upper',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
    bitsPerChar: 5,
  });
  var base32pad = rfc4648({
    prefix: 'c',
    name: 'base32pad',
    alphabet: 'abcdefghijklmnopqrstuvwxyz234567=',
    bitsPerChar: 5,
  });
  var base32padupper = rfc4648({
    prefix: 'C',
    name: 'base32padupper',
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=',
    bitsPerChar: 5,
  });
  var base32hex = rfc4648({
    prefix: 'v',
    name: 'base32hex',
    alphabet: '0123456789abcdefghijklmnopqrstuv',
    bitsPerChar: 5,
  });
  var base32hexupper = rfc4648({
    prefix: 'V',
    name: 'base32hexupper',
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
    bitsPerChar: 5,
  });
  var base32hexpad = rfc4648({
    prefix: 't',
    name: 'base32hexpad',
    alphabet: '0123456789abcdefghijklmnopqrstuv=',
    bitsPerChar: 5,
  });
  var base32hexpadupper = rfc4648({
    prefix: 'T',
    name: 'base32hexpadupper',
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV=',
    bitsPerChar: 5,
  });
  var base32z = rfc4648({
    prefix: 'h',
    name: 'base32z',
    alphabet: 'ybndrfg8ejkmcpqxot1uwisza345h769',
    bitsPerChar: 5,
  });

  // node_modules/multiformats/src/cid.js
  var format = (link, base3) => {
    const { bytes, version } = link;
    switch (version) {
      case 0:
        return toStringV0(
          bytes,
          baseCache(link),
          /** @type {API.MultibaseEncoder<"z">} */
          base3 || base58btc.encoder
        );
      default:
        return toStringV1(
          bytes,
          baseCache(link),
          /** @type {API.MultibaseEncoder<Prefix>} */
          base3 || base32.encoder
        );
    }
  };
  var cache = /* @__PURE__ */ new WeakMap();
  var baseCache = (cid) => {
    const baseCache2 = cache.get(cid);
    if (baseCache2 == null) {
      const baseCache3 = /* @__PURE__ */ new Map();
      cache.set(cid, baseCache3);
      return baseCache3;
    }
    return baseCache2;
  };
  var CID = class {
    /**
     * @param {Version} version - Version of the CID
     * @param {Format} code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param {API.MultihashDigest<Alg>} multihash - (Multi)hash of the of the content.
     * @param {Uint8Array} bytes
     *
     */
    constructor(version, code4, multihash, bytes) {
      this.code = code4;
      this.version = version;
      this.multihash = multihash;
      this.bytes = bytes;
      this['/'] = bytes;
    }
    /**
     * Signalling `cid.asCID === cid` has been replaced with `cid['/'] === cid.bytes`
     * please either use `CID.asCID(cid)` or switch to new signalling mechanism
     *
     * @deprecated
     */
    get asCID() {
      return this;
    }
    // ArrayBufferView
    get byteOffset() {
      return this.bytes.byteOffset;
    }
    // ArrayBufferView
    get byteLength() {
      return this.bytes.byteLength;
    }
    /**
     * @returns {CID<Data, API.DAG_PB, API.SHA_256, 0>}
     */
    toV0() {
      switch (this.version) {
        case 0: {
          return (
            /** @type {CID<Data, API.DAG_PB, API.SHA_256, 0>} */
            this
          );
        }
        case 1: {
          const { code: code4, multihash } = this;
          if (code4 !== DAG_PB_CODE) {
            throw new Error('Cannot convert a non dag-pb CID to CIDv0');
          }
          if (multihash.code !== SHA_256_CODE) {
            throw new Error(
              'Cannot convert non sha2-256 multihash CID to CIDv0'
            );
          }
          return (
            /** @type {CID<Data, API.DAG_PB, API.SHA_256, 0>} */
            CID.createV0(
              /** @type {API.MultihashDigest<API.SHA_256>} */
              multihash
            )
          );
        }
        default: {
          throw Error(
            `Can not convert CID version ${this.version} to version 0. This is a bug please report`
          );
        }
      }
    }
    /**
     * @returns {CID<Data, Format, Alg, 1>}
     */
    toV1() {
      switch (this.version) {
        case 0: {
          const { code: code4, digest: digest2 } = this.multihash;
          const multihash = create(code4, digest2);
          return (
            /** @type {CID<Data, Format, Alg, 1>} */
            CID.createV1(this.code, multihash)
          );
        }
        case 1: {
          return (
            /** @type {CID<Data, Format, Alg, 1>} */
            this
          );
        }
        default: {
          throw Error(
            `Can not convert CID version ${this.version} to version 1. This is a bug please report`
          );
        }
      }
    }
    /**
     * @param {unknown} other
     * @returns {other is CID<Data, Format, Alg, Version>}
     */
    equals(other) {
      return CID.equals(this, other);
    }
    /**
     * @template {unknown} Data
     * @template {number} Format
     * @template {number} Alg
     * @template {API.Version} Version
     * @param {API.Link<Data, Format, Alg, Version>} self
     * @param {unknown} other
     * @returns {other is CID}
     */
    static equals(self2, other) {
      const unknown =
        /** @type {{code?:unknown, version?:unknown, multihash?:unknown}} */
        other;
      return (
        unknown &&
        self2.code === unknown.code &&
        self2.version === unknown.version &&
        equals2(self2.multihash, unknown.multihash)
      );
    }
    /**
     * @param {API.MultibaseEncoder<string>} [base]
     * @returns {string}
     */
    toString(base3) {
      return format(this, base3);
    }
    toJSON() {
      return { '/': format(this) };
    }
    link() {
      return this;
    }
    get [Symbol.toStringTag]() {
      return 'CID';
    }
    // Legacy
    [Symbol.for('nodejs.util.inspect.custom')]() {
      return `CID(${this.toString()})`;
    }
    /**
     * Takes any input `value` and returns a `CID` instance if it was
     * a `CID` otherwise returns `null`. If `value` is instanceof `CID`
     * it will return value back. If `value` is not instance of this CID
     * class, but is compatible CID it will return new instance of this
     * `CID` class. Otherwise returns null.
     *
     * This allows two different incompatible versions of CID library to
     * co-exist and interop as long as binary interface is compatible.
     *
     * @template {unknown} Data
     * @template {number} Format
     * @template {number} Alg
     * @template {API.Version} Version
     * @template {unknown} U
     * @param {API.Link<Data, Format, Alg, Version>|U} input
     * @returns {CID<Data, Format, Alg, Version>|null}
     */
    static asCID(input) {
      if (input == null) {
        return null;
      }
      const value =
        /** @type {any} */
        input;
      if (value instanceof CID) {
        return value;
      } else if (
        (value['/'] != null && value['/'] === value.bytes) ||
        value.asCID === value
      ) {
        const { version, code: code4, multihash, bytes } = value;
        return new CID(
          version,
          code4,
          /** @type {API.MultihashDigest<Alg>} */
          multihash,
          bytes || encodeCID(version, code4, multihash.bytes)
        );
      } else if (value[cidSymbol] === true) {
        const { version, multihash, code: code4 } = value;
        const digest2 =
          /** @type {API.MultihashDigest<Alg>} */
          decode3(multihash);
        return CID.create(version, code4, digest2);
      } else {
        return null;
      }
    }
    /**
     *
     * @template {unknown} Data
     * @template {number} Format
     * @template {number} Alg
     * @template {API.Version} Version
     * @param {Version} version - Version of the CID
     * @param {Format} code - Code of the codec content is encoded in, see https://github.com/multiformats/multicodec/blob/master/table.csv
     * @param {API.MultihashDigest<Alg>} digest - (Multi)hash of the of the content.
     * @returns {CID<Data, Format, Alg, Version>}
     */
    static create(version, code4, digest2) {
      if (typeof code4 !== 'number') {
        throw new Error('String codecs are no longer supported');
      }
      if (!(digest2.bytes instanceof Uint8Array)) {
        throw new Error('Invalid digest');
      }
      switch (version) {
        case 0: {
          if (code4 !== DAG_PB_CODE) {
            throw new Error(
              `Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`
            );
          } else {
            return new CID(version, code4, digest2, digest2.bytes);
          }
        }
        case 1: {
          const bytes = encodeCID(version, code4, digest2.bytes);
          return new CID(version, code4, digest2, bytes);
        }
        default: {
          throw new Error('Invalid version');
        }
      }
    }
    /**
     * Simplified version of `create` for CIDv0.
     *
     * @template {unknown} [T=unknown]
     * @param {API.MultihashDigest<typeof SHA_256_CODE>} digest - Multihash.
     * @returns {CID<T, typeof DAG_PB_CODE, typeof SHA_256_CODE, 0>}
     */
    static createV0(digest2) {
      return CID.create(0, DAG_PB_CODE, digest2);
    }
    /**
     * Simplified version of `create` for CIDv1.
     *
     * @template {unknown} Data
     * @template {number} Code
     * @template {number} Alg
     * @param {Code} code - Content encoding format code.
     * @param {API.MultihashDigest<Alg>} digest - Miltihash of the content.
     * @returns {CID<Data, Code, Alg, 1>}
     */
    static createV1(code4, digest2) {
      return CID.create(1, code4, digest2);
    }
    /**
     * Decoded a CID from its binary representation. The byte array must contain
     * only the CID with no additional bytes.
     *
     * An error will be thrown if the bytes provided do not contain a valid
     * binary representation of a CID.
     *
     * @template {unknown} Data
     * @template {number} Code
     * @template {number} Alg
     * @template {API.Version} Ver
     * @param {API.ByteView<API.Link<Data, Code, Alg, Ver>>} bytes
     * @returns {CID<Data, Code, Alg, Ver>}
     */
    static decode(bytes) {
      const [cid, remainder] = CID.decodeFirst(bytes);
      if (remainder.length) {
        throw new Error('Incorrect length');
      }
      return cid;
    }
    /**
     * Decoded a CID from its binary representation at the beginning of a byte
     * array.
     *
     * Returns an array with the first element containing the CID and the second
     * element containing the remainder of the original byte array. The remainder
     * will be a zero-length byte array if the provided bytes only contained a
     * binary CID representation.
     *
     * @template {unknown} T
     * @template {number} C
     * @template {number} A
     * @template {API.Version} V
     * @param {API.ByteView<API.Link<T, C, A, V>>} bytes
     * @returns {[CID<T, C, A, V>, Uint8Array]}
     */
    static decodeFirst(bytes) {
      const specs = CID.inspectBytes(bytes);
      const prefixSize = specs.size - specs.multihashSize;
      const multihashBytes = coerce(
        bytes.subarray(prefixSize, prefixSize + specs.multihashSize)
      );
      if (multihashBytes.byteLength !== specs.multihashSize) {
        throw new Error('Incorrect length');
      }
      const digestBytes = multihashBytes.subarray(
        specs.multihashSize - specs.digestSize
      );
      const digest2 = new Digest(
        specs.multihashCode,
        specs.digestSize,
        digestBytes,
        multihashBytes
      );
      const cid =
        specs.version === 0
          ? CID.createV0(
              /** @type {API.MultihashDigest<API.SHA_256>} */
              digest2
            )
          : CID.createV1(specs.codec, digest2);
      return [
        /** @type {CID<T, C, A, V>} */
        cid,
        bytes.subarray(specs.size),
      ];
    }
    /**
     * Inspect the initial bytes of a CID to determine its properties.
     *
     * Involves decoding up to 4 varints. Typically this will require only 4 to 6
     * bytes but for larger multicodec code values and larger multihash digest
     * lengths these varints can be quite large. It is recommended that at least
     * 10 bytes be made available in the `initialBytes` argument for a complete
     * inspection.
     *
     * @template {unknown} T
     * @template {number} C
     * @template {number} A
     * @template {API.Version} V
     * @param {API.ByteView<API.Link<T, C, A, V>>} initialBytes
     * @returns {{ version:V, codec:C, multihashCode:A, digestSize:number, multihashSize:number, size:number }}
     */
    static inspectBytes(initialBytes) {
      let offset = 0;
      const next = () => {
        const [i, length2] = decode2(initialBytes.subarray(offset));
        offset += length2;
        return i;
      };
      let version =
        /** @type {V} */
        next();
      let codec =
        /** @type {C} */
        DAG_PB_CODE;
      if (
        /** @type {number} */
        version === 18
      ) {
        version = /** @type {V} */ 0;
        offset = 0;
      } else {
        codec = /** @type {C} */ next();
      }
      if (version !== 0 && version !== 1) {
        throw new RangeError(`Invalid CID version ${version}`);
      }
      const prefixSize = offset;
      const multihashCode =
        /** @type {A} */
        next();
      const digestSize = next();
      const size = offset + digestSize;
      const multihashSize = size - prefixSize;
      return { version, codec, multihashCode, digestSize, multihashSize, size };
    }
    /**
     * Takes cid in a string representation and creates an instance. If `base`
     * decoder is not provided will use a default from the configuration. It will
     * throw an error if encoding of the CID is not compatible with supplied (or
     * a default decoder).
     *
     * @template {string} Prefix
     * @template {unknown} Data
     * @template {number} Code
     * @template {number} Alg
     * @template {API.Version} Ver
     * @param {API.ToString<API.Link<Data, Code, Alg, Ver>, Prefix>} source
     * @param {API.MultibaseDecoder<Prefix>} [base]
     * @returns {CID<Data, Code, Alg, Ver>}
     */
    static parse(source, base3) {
      const [prefix, bytes] = parseCIDtoBytes(source, base3);
      const cid = CID.decode(bytes);
      if (cid.version === 0 && source[0] !== 'Q') {
        throw Error('Version 0 CID string must not include multibase prefix');
      }
      baseCache(cid).set(prefix, source);
      return cid;
    }
  };
  var parseCIDtoBytes = (source, base3) => {
    switch (source[0]) {
      case 'Q': {
        const decoder = base3 || base58btc;
        return [
          /** @type {Prefix} */
          base58btc.prefix,
          decoder.decode(`${base58btc.prefix}${source}`),
        ];
      }
      case base58btc.prefix: {
        const decoder = base3 || base58btc;
        return [
          /** @type {Prefix} */
          base58btc.prefix,
          decoder.decode(source),
        ];
      }
      case base32.prefix: {
        const decoder = base3 || base32;
        return [
          /** @type {Prefix} */
          base32.prefix,
          decoder.decode(source),
        ];
      }
      default: {
        if (base3 == null) {
          throw Error(
            'To parse non base32 or base58btc encoded CID multibase decoder must be provided'
          );
        }
        return [
          /** @type {Prefix} */
          source[0],
          base3.decode(source),
        ];
      }
    }
  };
  var toStringV0 = (bytes, cache2, base3) => {
    const { prefix } = base3;
    if (prefix !== base58btc.prefix) {
      throw Error(`Cannot string encode V0 in ${base3.name} encoding`);
    }
    const cid = cache2.get(prefix);
    if (cid == null) {
      const cid2 = base3.encode(bytes).slice(1);
      cache2.set(prefix, cid2);
      return cid2;
    } else {
      return cid;
    }
  };
  var toStringV1 = (bytes, cache2, base3) => {
    const { prefix } = base3;
    const cid = cache2.get(prefix);
    if (cid == null) {
      const cid2 = base3.encode(bytes);
      cache2.set(prefix, cid2);
      return cid2;
    } else {
      return cid;
    }
  };
  var DAG_PB_CODE = 112;
  var SHA_256_CODE = 18;
  var encodeCID = (version, code4, multihash) => {
    const codeOffset = encodingLength(version);
    const hashOffset = codeOffset + encodingLength(code4);
    const bytes = new Uint8Array(hashOffset + multihash.byteLength);
    encodeTo(version, bytes, 0);
    encodeTo(code4, bytes, codeOffset);
    bytes.set(multihash, hashOffset);
    return bytes;
  };
  var cidSymbol = Symbol.for('@ipld/js-cid/CID');

  // node_modules/@multiformats/murmur3/src/index.js
  var import_murmurhash3js_revisited = __toESM(
    require_murmurhash3js_revisited(),
    1
  );
  function fromNumberTo32BitBuf(number) {
    const bytes = new Array(4);
    for (let i = 0; i < 4; i++) {
      bytes[i] = number & 255;
      number = number >> 8;
    }
    return new Uint8Array(bytes);
  }
  var murmur332 = from({
    name: 'murmur3-32',
    code: 35,
    encode: (input) =>
      fromNumberTo32BitBuf(
        import_murmurhash3js_revisited.default.x86.hash32(input)
      ),
  });
  var murmur3128 = from({
    name: 'murmur3-128',
    code: 34,
    encode: (input) =>
      bytes_exports.fromHex(
        import_murmurhash3js_revisited.default.x64.hash128(input)
      ),
  });
  var murmur364 = from({
    name: 'murmur3-x64-64',
    code: 34,
    encode: (input) =>
      bytes_exports
        .fromHex(import_murmurhash3js_revisited.default.x64.hash128(input))
        .subarray(0, 8),
  });

  // node_modules/ipfs-unixfs-importer/src/options.js
  async function hamtHashFn(buf) {
    return (await murmur3128.encode(buf)).slice(0, 8).reverse();
  }
  var defaultOptions = {
    chunker: 'fixed',
    strategy: 'balanced',
    // 'flat', 'trickle'
    rawLeaves: false,
    onlyHash: false,
    reduceSingleLeafToSelf: true,
    hasher: sha256,
    leafType: 'file',
    // 'raw'
    cidVersion: 0,
    progress: () => () => {},
    shardSplitThreshold: 1e3,
    fileImportConcurrency: 50,
    blockWriteConcurrency: 10,
    minChunkSize: 262144,
    maxChunkSize: 262144,
    avgChunkSize: 262144,
    window: 16,
    // FIXME: This number is too big for JavaScript
    // https://github.com/ipfs/go-ipfs-chunker/blob/d0125832512163708c0804a3cda060e21acddae4/rabin.go#L11
    polynomial: 17437180132763652,
    // eslint-disable-line no-loss-of-precision
    maxChildrenPerNode: 174,
    layerRepeat: 4,
    wrapWithDirectory: false,
    recursive: false,
    hidden: false,
    timeout: void 0,
    hamtHashFn,
    hamtHashCode: 34,
    hamtBucketBits: 8,
  };
  var options_default = (options = {}) => {
    const defaults = merge_options_default.bind({ ignoreUndefined: true });
    return defaults(defaultOptions, options);
  };

  // node_modules/ipfs-unixfs/src/index.js
  var import_err_code = __toESM(require_err_code(), 1);

  // node_modules/ipfs-unixfs/src/unixfs.js
  var import_minimal = __toESM(require_minimal2(), 1);
  var $Reader = import_minimal.default.Reader;
  var $Writer = import_minimal.default.Writer;
  var $util = import_minimal.default.util;
  var $root =
    import_minimal.default.roots['ipfs-unixfs'] ||
    (import_minimal.default.roots['ipfs-unixfs'] = {});
  var Data = ($root.Data = (() => {
    function Data2(p) {
      this.blocksizes = [];
      if (p) {
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
    }
    Data2.prototype.Type = 0;
    Data2.prototype.Data = $util.newBuffer([]);
    Data2.prototype.filesize = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
    Data2.prototype.blocksizes = $util.emptyArray;
    Data2.prototype.hashType = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
    Data2.prototype.fanout = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
    Data2.prototype.mode = 0;
    Data2.prototype.mtime = null;
    Data2.encode = function encode7(m, w) {
      if (!w) w = $Writer.create();
      w.uint32(8).int32(m.Type);
      if (m.Data != null && Object.hasOwnProperty.call(m, 'Data'))
        w.uint32(18).bytes(m.Data);
      if (m.filesize != null && Object.hasOwnProperty.call(m, 'filesize'))
        w.uint32(24).uint64(m.filesize);
      if (m.blocksizes != null && m.blocksizes.length) {
        for (var i = 0; i < m.blocksizes.length; ++i)
          w.uint32(32).uint64(m.blocksizes[i]);
      }
      if (m.hashType != null && Object.hasOwnProperty.call(m, 'hashType'))
        w.uint32(40).uint64(m.hashType);
      if (m.fanout != null && Object.hasOwnProperty.call(m, 'fanout'))
        w.uint32(48).uint64(m.fanout);
      if (m.mode != null && Object.hasOwnProperty.call(m, 'mode'))
        w.uint32(56).uint32(m.mode);
      if (m.mtime != null && Object.hasOwnProperty.call(m, 'mtime'))
        $root.UnixTime.encode(m.mtime, w.uint32(66).fork()).ldelim();
      return w;
    };
    Data2.decode = function decode8(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === void 0 ? r.len : r.pos + l,
        m = new $root.Data();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1:
            m.Type = r.int32();
            break;
          case 2:
            m.Data = r.bytes();
            break;
          case 3:
            m.filesize = r.uint64();
            break;
          case 4:
            if (!(m.blocksizes && m.blocksizes.length)) m.blocksizes = [];
            if ((t & 7) === 2) {
              var c2 = r.uint32() + r.pos;
              while (r.pos < c2) m.blocksizes.push(r.uint64());
            } else m.blocksizes.push(r.uint64());
            break;
          case 5:
            m.hashType = r.uint64();
            break;
          case 6:
            m.fanout = r.uint64();
            break;
          case 7:
            m.mode = r.uint32();
            break;
          case 8:
            m.mtime = $root.UnixTime.decode(r, r.uint32());
            break;
          default:
            r.skipType(t & 7);
            break;
        }
      }
      if (!m.hasOwnProperty('Type'))
        throw $util.ProtocolError("missing required 'Type'", { instance: m });
      return m;
    };
    Data2.fromObject = function fromObject(d) {
      if (d instanceof $root.Data) return d;
      var m = new $root.Data();
      switch (d.Type) {
        case 'Raw':
        case 0:
          m.Type = 0;
          break;
        case 'Directory':
        case 1:
          m.Type = 1;
          break;
        case 'File':
        case 2:
          m.Type = 2;
          break;
        case 'Metadata':
        case 3:
          m.Type = 3;
          break;
        case 'Symlink':
        case 4:
          m.Type = 4;
          break;
        case 'HAMTShard':
        case 5:
          m.Type = 5;
          break;
      }
      if (d.Data != null) {
        if (typeof d.Data === 'string')
          $util.base64.decode(
            d.Data,
            (m.Data = $util.newBuffer($util.base64.length(d.Data))),
            0
          );
        else if (d.Data.length) m.Data = d.Data;
      }
      if (d.filesize != null) {
        if ($util.Long)
          (m.filesize = $util.Long.fromValue(d.filesize)).unsigned = true;
        else if (typeof d.filesize === 'string')
          m.filesize = parseInt(d.filesize, 10);
        else if (typeof d.filesize === 'number') m.filesize = d.filesize;
        else if (typeof d.filesize === 'object')
          m.filesize = new $util.LongBits(
            d.filesize.low >>> 0,
            d.filesize.high >>> 0
          ).toNumber(true);
      }
      if (d.blocksizes) {
        if (!Array.isArray(d.blocksizes))
          throw TypeError('.Data.blocksizes: array expected');
        m.blocksizes = [];
        for (var i = 0; i < d.blocksizes.length; ++i) {
          if ($util.Long)
            (m.blocksizes[i] = $util.Long.fromValue(d.blocksizes[i])).unsigned =
              true;
          else if (typeof d.blocksizes[i] === 'string')
            m.blocksizes[i] = parseInt(d.blocksizes[i], 10);
          else if (typeof d.blocksizes[i] === 'number')
            m.blocksizes[i] = d.blocksizes[i];
          else if (typeof d.blocksizes[i] === 'object')
            m.blocksizes[i] = new $util.LongBits(
              d.blocksizes[i].low >>> 0,
              d.blocksizes[i].high >>> 0
            ).toNumber(true);
        }
      }
      if (d.hashType != null) {
        if ($util.Long)
          (m.hashType = $util.Long.fromValue(d.hashType)).unsigned = true;
        else if (typeof d.hashType === 'string')
          m.hashType = parseInt(d.hashType, 10);
        else if (typeof d.hashType === 'number') m.hashType = d.hashType;
        else if (typeof d.hashType === 'object')
          m.hashType = new $util.LongBits(
            d.hashType.low >>> 0,
            d.hashType.high >>> 0
          ).toNumber(true);
      }
      if (d.fanout != null) {
        if ($util.Long)
          (m.fanout = $util.Long.fromValue(d.fanout)).unsigned = true;
        else if (typeof d.fanout === 'string')
          m.fanout = parseInt(d.fanout, 10);
        else if (typeof d.fanout === 'number') m.fanout = d.fanout;
        else if (typeof d.fanout === 'object')
          m.fanout = new $util.LongBits(
            d.fanout.low >>> 0,
            d.fanout.high >>> 0
          ).toNumber(true);
      }
      if (d.mode != null) {
        m.mode = d.mode >>> 0;
      }
      if (d.mtime != null) {
        if (typeof d.mtime !== 'object')
          throw TypeError('.Data.mtime: object expected');
        m.mtime = $root.UnixTime.fromObject(d.mtime);
      }
      return m;
    };
    Data2.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.arrays || o.defaults) {
        d.blocksizes = [];
      }
      if (o.defaults) {
        d.Type = o.enums === String ? 'Raw' : 0;
        if (o.bytes === String) d.Data = '';
        else {
          d.Data = [];
          if (o.bytes !== Array) d.Data = $util.newBuffer(d.Data);
        }
        if ($util.Long) {
          var n = new $util.Long(0, 0, true);
          d.filesize =
            o.longs === String
              ? n.toString()
              : o.longs === Number
              ? n.toNumber()
              : n;
        } else d.filesize = o.longs === String ? '0' : 0;
        if ($util.Long) {
          var n = new $util.Long(0, 0, true);
          d.hashType =
            o.longs === String
              ? n.toString()
              : o.longs === Number
              ? n.toNumber()
              : n;
        } else d.hashType = o.longs === String ? '0' : 0;
        if ($util.Long) {
          var n = new $util.Long(0, 0, true);
          d.fanout =
            o.longs === String
              ? n.toString()
              : o.longs === Number
              ? n.toNumber()
              : n;
        } else d.fanout = o.longs === String ? '0' : 0;
        d.mode = 0;
        d.mtime = null;
      }
      if (m.Type != null && m.hasOwnProperty('Type')) {
        d.Type = o.enums === String ? $root.Data.DataType[m.Type] : m.Type;
      }
      if (m.Data != null && m.hasOwnProperty('Data')) {
        d.Data =
          o.bytes === String
            ? $util.base64.encode(m.Data, 0, m.Data.length)
            : o.bytes === Array
            ? Array.prototype.slice.call(m.Data)
            : m.Data;
      }
      if (m.filesize != null && m.hasOwnProperty('filesize')) {
        if (typeof m.filesize === 'number')
          d.filesize = o.longs === String ? String(m.filesize) : m.filesize;
        else
          d.filesize =
            o.longs === String
              ? $util.Long.prototype.toString.call(m.filesize)
              : o.longs === Number
              ? new $util.LongBits(
                  m.filesize.low >>> 0,
                  m.filesize.high >>> 0
                ).toNumber(true)
              : m.filesize;
      }
      if (m.blocksizes && m.blocksizes.length) {
        d.blocksizes = [];
        for (var j = 0; j < m.blocksizes.length; ++j) {
          if (typeof m.blocksizes[j] === 'number')
            d.blocksizes[j] =
              o.longs === String ? String(m.blocksizes[j]) : m.blocksizes[j];
          else
            d.blocksizes[j] =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.blocksizes[j])
                : o.longs === Number
                ? new $util.LongBits(
                    m.blocksizes[j].low >>> 0,
                    m.blocksizes[j].high >>> 0
                  ).toNumber(true)
                : m.blocksizes[j];
        }
      }
      if (m.hashType != null && m.hasOwnProperty('hashType')) {
        if (typeof m.hashType === 'number')
          d.hashType = o.longs === String ? String(m.hashType) : m.hashType;
        else
          d.hashType =
            o.longs === String
              ? $util.Long.prototype.toString.call(m.hashType)
              : o.longs === Number
              ? new $util.LongBits(
                  m.hashType.low >>> 0,
                  m.hashType.high >>> 0
                ).toNumber(true)
              : m.hashType;
      }
      if (m.fanout != null && m.hasOwnProperty('fanout')) {
        if (typeof m.fanout === 'number')
          d.fanout = o.longs === String ? String(m.fanout) : m.fanout;
        else
          d.fanout =
            o.longs === String
              ? $util.Long.prototype.toString.call(m.fanout)
              : o.longs === Number
              ? new $util.LongBits(
                  m.fanout.low >>> 0,
                  m.fanout.high >>> 0
                ).toNumber(true)
              : m.fanout;
      }
      if (m.mode != null && m.hasOwnProperty('mode')) {
        d.mode = m.mode;
      }
      if (m.mtime != null && m.hasOwnProperty('mtime')) {
        d.mtime = $root.UnixTime.toObject(m.mtime, o);
      }
      return d;
    };
    Data2.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(
        this,
        import_minimal.default.util.toJSONOptions
      );
    };
    Data2.DataType = (function () {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[0] = 'Raw')] = 0;
      values[(valuesById[1] = 'Directory')] = 1;
      values[(valuesById[2] = 'File')] = 2;
      values[(valuesById[3] = 'Metadata')] = 3;
      values[(valuesById[4] = 'Symlink')] = 4;
      values[(valuesById[5] = 'HAMTShard')] = 5;
      return values;
    })();
    return Data2;
  })());
  var UnixTime = ($root.UnixTime = (() => {
    function UnixTime2(p) {
      if (p) {
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
    }
    UnixTime2.prototype.Seconds = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;
    UnixTime2.prototype.FractionalNanoseconds = 0;
    UnixTime2.encode = function encode7(m, w) {
      if (!w) w = $Writer.create();
      w.uint32(8).int64(m.Seconds);
      if (
        m.FractionalNanoseconds != null &&
        Object.hasOwnProperty.call(m, 'FractionalNanoseconds')
      )
        w.uint32(21).fixed32(m.FractionalNanoseconds);
      return w;
    };
    UnixTime2.decode = function decode8(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === void 0 ? r.len : r.pos + l,
        m = new $root.UnixTime();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1:
            m.Seconds = r.int64();
            break;
          case 2:
            m.FractionalNanoseconds = r.fixed32();
            break;
          default:
            r.skipType(t & 7);
            break;
        }
      }
      if (!m.hasOwnProperty('Seconds'))
        throw $util.ProtocolError("missing required 'Seconds'", {
          instance: m,
        });
      return m;
    };
    UnixTime2.fromObject = function fromObject(d) {
      if (d instanceof $root.UnixTime) return d;
      var m = new $root.UnixTime();
      if (d.Seconds != null) {
        if ($util.Long)
          (m.Seconds = $util.Long.fromValue(d.Seconds)).unsigned = false;
        else if (typeof d.Seconds === 'string')
          m.Seconds = parseInt(d.Seconds, 10);
        else if (typeof d.Seconds === 'number') m.Seconds = d.Seconds;
        else if (typeof d.Seconds === 'object')
          m.Seconds = new $util.LongBits(
            d.Seconds.low >>> 0,
            d.Seconds.high >>> 0
          ).toNumber();
      }
      if (d.FractionalNanoseconds != null) {
        m.FractionalNanoseconds = d.FractionalNanoseconds >>> 0;
      }
      return m;
    };
    UnixTime2.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.defaults) {
        if ($util.Long) {
          var n = new $util.Long(0, 0, false);
          d.Seconds =
            o.longs === String
              ? n.toString()
              : o.longs === Number
              ? n.toNumber()
              : n;
        } else d.Seconds = o.longs === String ? '0' : 0;
        d.FractionalNanoseconds = 0;
      }
      if (m.Seconds != null && m.hasOwnProperty('Seconds')) {
        if (typeof m.Seconds === 'number')
          d.Seconds = o.longs === String ? String(m.Seconds) : m.Seconds;
        else
          d.Seconds =
            o.longs === String
              ? $util.Long.prototype.toString.call(m.Seconds)
              : o.longs === Number
              ? new $util.LongBits(
                  m.Seconds.low >>> 0,
                  m.Seconds.high >>> 0
                ).toNumber()
              : m.Seconds;
      }
      if (
        m.FractionalNanoseconds != null &&
        m.hasOwnProperty('FractionalNanoseconds')
      ) {
        d.FractionalNanoseconds = m.FractionalNanoseconds;
      }
      return d;
    };
    UnixTime2.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(
        this,
        import_minimal.default.util.toJSONOptions
      );
    };
    return UnixTime2;
  })());
  var Metadata = ($root.Metadata = (() => {
    function Metadata2(p) {
      if (p) {
        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
          if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
    }
    Metadata2.prototype.MimeType = '';
    Metadata2.encode = function encode7(m, w) {
      if (!w) w = $Writer.create();
      if (m.MimeType != null && Object.hasOwnProperty.call(m, 'MimeType'))
        w.uint32(10).string(m.MimeType);
      return w;
    };
    Metadata2.decode = function decode8(r, l) {
      if (!(r instanceof $Reader)) r = $Reader.create(r);
      var c = l === void 0 ? r.len : r.pos + l,
        m = new $root.Metadata();
      while (r.pos < c) {
        var t = r.uint32();
        switch (t >>> 3) {
          case 1:
            m.MimeType = r.string();
            break;
          default:
            r.skipType(t & 7);
            break;
        }
      }
      return m;
    };
    Metadata2.fromObject = function fromObject(d) {
      if (d instanceof $root.Metadata) return d;
      var m = new $root.Metadata();
      if (d.MimeType != null) {
        m.MimeType = String(d.MimeType);
      }
      return m;
    };
    Metadata2.toObject = function toObject(m, o) {
      if (!o) o = {};
      var d = {};
      if (o.defaults) {
        d.MimeType = '';
      }
      if (m.MimeType != null && m.hasOwnProperty('MimeType')) {
        d.MimeType = m.MimeType;
      }
      return d;
    };
    Metadata2.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(
        this,
        import_minimal.default.util.toJSONOptions
      );
    };
    return Metadata2;
  })());

  // node_modules/ipfs-unixfs/src/index.js
  var PBData = Data;
  var types = [
    'raw',
    'directory',
    'file',
    'metadata',
    'symlink',
    'hamt-sharded-directory',
  ];
  var dirTypes = ['directory', 'hamt-sharded-directory'];
  var DEFAULT_FILE_MODE = parseInt('0644', 8);
  var DEFAULT_DIRECTORY_MODE = parseInt('0755', 8);
  function parseMode(mode) {
    if (mode == null) {
      return void 0;
    }
    if (typeof mode === 'number') {
      return mode & 4095;
    }
    mode = mode.toString();
    if (mode.substring(0, 1) === '0') {
      return parseInt(mode, 8) & 4095;
    }
    return parseInt(mode, 10) & 4095;
  }
  function parseMtime(input) {
    if (input == null) {
      return void 0;
    }
    let mtime;
    if (input.secs != null) {
      mtime = {
        secs: input.secs,
        nsecs: input.nsecs,
      };
    }
    if (input.Seconds != null) {
      mtime = {
        secs: input.Seconds,
        nsecs: input.FractionalNanoseconds,
      };
    }
    if (Array.isArray(input)) {
      mtime = {
        secs: input[0],
        nsecs: input[1],
      };
    }
    if (input instanceof Date) {
      const ms = input.getTime();
      const secs = Math.floor(ms / 1e3);
      mtime = {
        secs,
        nsecs: (ms - secs * 1e3) * 1e3,
      };
    }
    if (!Object.prototype.hasOwnProperty.call(mtime, 'secs')) {
      return void 0;
    }
    if (
      mtime != null &&
      mtime.nsecs != null &&
      (mtime.nsecs < 0 || mtime.nsecs > 999999999)
    ) {
      throw (0, import_err_code.default)(
        new Error('mtime-nsecs must be within the range [0,999999999]'),
        'ERR_INVALID_MTIME_NSECS'
      );
    }
    return mtime;
  }
  var UnixFS = class {
    /**
     * Decode from protobuf https://github.com/ipfs/specs/blob/master/UNIXFS.md
     *
     * @param {Uint8Array} marshaled
     */
    static unmarshal(marshaled) {
      const message = PBData.decode(marshaled);
      const decoded = PBData.toObject(message, {
        defaults: false,
        arrays: true,
        longs: Number,
        objects: false,
      });
      const data = new UnixFS({
        type: types[decoded.Type],
        data: decoded.Data,
        blockSizes: decoded.blocksizes,
        mode: decoded.mode,
        mtime: decoded.mtime
          ? {
              secs: decoded.mtime.Seconds,
              nsecs: decoded.mtime.FractionalNanoseconds,
            }
          : void 0,
      });
      data._originalMode = decoded.mode || 0;
      return data;
    }
    /**
     * @param {object} [options]
     * @param {string} [options.type='file']
     * @param {Uint8Array} [options.data]
     * @param {number[]} [options.blockSizes]
     * @param {number} [options.hashType]
     * @param {number} [options.fanout]
     * @param {MtimeLike | null} [options.mtime]
     * @param {number | string} [options.mode]
     */
    constructor(
      options = {
        type: 'file',
      }
    ) {
      const { type, data, blockSizes, hashType, fanout, mtime, mode } = options;
      if (type && !types.includes(type)) {
        throw (0, import_err_code.default)(
          new Error('Type: ' + type + ' is not valid'),
          'ERR_INVALID_TYPE'
        );
      }
      this.type = type || 'file';
      this.data = data;
      this.hashType = hashType;
      this.fanout = fanout;
      this.blockSizes = blockSizes || [];
      this._originalMode = 0;
      this.mode = parseMode(mode);
      if (mtime) {
        this.mtime = parseMtime(mtime);
        if (this.mtime && !this.mtime.nsecs) {
          this.mtime.nsecs = 0;
        }
      }
    }
    /**
     * @param {number | undefined} mode
     */
    set mode(mode) {
      this._mode = this.isDirectory()
        ? DEFAULT_DIRECTORY_MODE
        : DEFAULT_FILE_MODE;
      const parsedMode = parseMode(mode);
      if (parsedMode !== void 0) {
        this._mode = parsedMode;
      }
    }
    /**
     * @returns {number | undefined}
     */
    get mode() {
      return this._mode;
    }
    isDirectory() {
      return Boolean(this.type && dirTypes.includes(this.type));
    }
    /**
     * @param {number} size
     */
    addBlockSize(size) {
      this.blockSizes.push(size);
    }
    /**
     * @param {number} index
     */
    removeBlockSize(index) {
      this.blockSizes.splice(index, 1);
    }
    /**
     * Returns `0` for directories or `data.length + sum(blockSizes)` for everything else
     */
    fileSize() {
      if (this.isDirectory()) {
        return 0;
      }
      let sum = 0;
      this.blockSizes.forEach((size) => {
        sum += size;
      });
      if (this.data) {
        sum += this.data.length;
      }
      return sum;
    }
    /**
     * encode to protobuf Uint8Array
     */
    marshal() {
      let type;
      switch (this.type) {
        case 'raw':
          type = PBData.DataType.Raw;
          break;
        case 'directory':
          type = PBData.DataType.Directory;
          break;
        case 'file':
          type = PBData.DataType.File;
          break;
        case 'metadata':
          type = PBData.DataType.Metadata;
          break;
        case 'symlink':
          type = PBData.DataType.Symlink;
          break;
        case 'hamt-sharded-directory':
          type = PBData.DataType.HAMTShard;
          break;
        default:
          throw (0, import_err_code.default)(
            new Error('Type: ' + type + ' is not valid'),
            'ERR_INVALID_TYPE'
          );
      }
      let data = this.data;
      if (!this.data || !this.data.length) {
        data = void 0;
      }
      let mode;
      if (this.mode != null) {
        mode = (this._originalMode & 4294963200) | (parseMode(this.mode) || 0);
        if (mode === DEFAULT_FILE_MODE && !this.isDirectory()) {
          mode = void 0;
        }
        if (mode === DEFAULT_DIRECTORY_MODE && this.isDirectory()) {
          mode = void 0;
        }
      }
      let mtime;
      if (this.mtime != null) {
        const parsed = parseMtime(this.mtime);
        if (parsed) {
          mtime = {
            Seconds: parsed.secs,
            FractionalNanoseconds: parsed.nsecs,
          };
          if (mtime.FractionalNanoseconds === 0) {
            delete mtime.FractionalNanoseconds;
          }
        }
      }
      const pbData = {
        Type: type,
        Data: data,
        filesize: this.isDirectory() ? void 0 : this.fileSize(),
        blocksizes: this.blockSizes,
        hashType: this.hashType,
        fanout: this.fanout,
        mode,
        mtime,
      };
      return PBData.encode(pbData).finish();
    }
  };

  // node_modules/@ipld/dag-pb/src/index.js
  var src_exports = {};
  __export(src_exports, {
    code: () => code,
    createLink: () => createLink,
    createNode: () => createNode,
    decode: () => decode5,
    encode: () => encode3,
    name: () => name,
    prepare: () => prepare,
    validate: () => validate,
  });

  // node_modules/@ipld/dag-pb/src/pb-decode.js
  var textDecoder = new TextDecoder();
  function decodeVarint(bytes, offset) {
    let v = 0;
    for (let shift = 0; ; shift += 7) {
      if (shift >= 64) {
        throw new Error('protobuf: varint overflow');
      }
      if (offset >= bytes.length) {
        throw new Error('protobuf: unexpected end of data');
      }
      const b = bytes[offset++];
      v += shift < 28 ? (b & 127) << shift : (b & 127) * 2 ** shift;
      if (b < 128) {
        break;
      }
    }
    return [v, offset];
  }
  function decodeBytes(bytes, offset) {
    let byteLen;
    [byteLen, offset] = decodeVarint(bytes, offset);
    const postOffset = offset + byteLen;
    if (byteLen < 0 || postOffset < 0) {
      throw new Error('protobuf: invalid length');
    }
    if (postOffset > bytes.length) {
      throw new Error('protobuf: unexpected end of data');
    }
    return [bytes.subarray(offset, postOffset), postOffset];
  }
  function decodeKey(bytes, index) {
    let wire;
    [wire, index] = decodeVarint(bytes, index);
    return [wire & 7, wire >> 3, index];
  }
  function decodeLink(bytes) {
    const link = {};
    const l = bytes.length;
    let index = 0;
    while (index < l) {
      let wireType, fieldNum;
      [wireType, fieldNum, index] = decodeKey(bytes, index);
      if (fieldNum === 1) {
        if (link.Hash) {
          throw new Error('protobuf: (PBLink) duplicate Hash section');
        }
        if (wireType !== 2) {
          throw new Error(
            `protobuf: (PBLink) wrong wireType (${wireType}) for Hash`
          );
        }
        if (link.Name !== void 0) {
          throw new Error(
            'protobuf: (PBLink) invalid order, found Name before Hash'
          );
        }
        if (link.Tsize !== void 0) {
          throw new Error(
            'protobuf: (PBLink) invalid order, found Tsize before Hash'
          );
        }
        [link.Hash, index] = decodeBytes(bytes, index);
      } else if (fieldNum === 2) {
        if (link.Name !== void 0) {
          throw new Error('protobuf: (PBLink) duplicate Name section');
        }
        if (wireType !== 2) {
          throw new Error(
            `protobuf: (PBLink) wrong wireType (${wireType}) for Name`
          );
        }
        if (link.Tsize !== void 0) {
          throw new Error(
            'protobuf: (PBLink) invalid order, found Tsize before Name'
          );
        }
        let byts;
        [byts, index] = decodeBytes(bytes, index);
        link.Name = textDecoder.decode(byts);
      } else if (fieldNum === 3) {
        if (link.Tsize !== void 0) {
          throw new Error('protobuf: (PBLink) duplicate Tsize section');
        }
        if (wireType !== 0) {
          throw new Error(
            `protobuf: (PBLink) wrong wireType (${wireType}) for Tsize`
          );
        }
        [link.Tsize, index] = decodeVarint(bytes, index);
      } else {
        throw new Error(
          `protobuf: (PBLink) invalid fieldNumber, expected 1, 2 or 3, got ${fieldNum}`
        );
      }
    }
    if (index > l) {
      throw new Error('protobuf: (PBLink) unexpected end of data');
    }
    return link;
  }
  function decodeNode(bytes) {
    const l = bytes.length;
    let index = 0;
    let links;
    let linksBeforeData = false;
    let data;
    while (index < l) {
      let wireType, fieldNum;
      [wireType, fieldNum, index] = decodeKey(bytes, index);
      if (wireType !== 2) {
        throw new Error(
          `protobuf: (PBNode) invalid wireType, expected 2, got ${wireType}`
        );
      }
      if (fieldNum === 1) {
        if (data) {
          throw new Error('protobuf: (PBNode) duplicate Data section');
        }
        [data, index] = decodeBytes(bytes, index);
        if (links) {
          linksBeforeData = true;
        }
      } else if (fieldNum === 2) {
        if (linksBeforeData) {
          throw new Error('protobuf: (PBNode) duplicate Links section');
        } else if (!links) {
          links = [];
        }
        let byts;
        [byts, index] = decodeBytes(bytes, index);
        links.push(decodeLink(byts));
      } else {
        throw new Error(
          `protobuf: (PBNode) invalid fieldNumber, expected 1 or 2, got ${fieldNum}`
        );
      }
    }
    if (index > l) {
      throw new Error('protobuf: (PBNode) unexpected end of data');
    }
    const node = {};
    if (data) {
      node.Data = data;
    }
    node.Links = links || [];
    return node;
  }

  // node_modules/@ipld/dag-pb/src/pb-encode.js
  var textEncoder = new TextEncoder();
  var maxInt32 = 2 ** 32;
  var maxUInt32 = 2 ** 31;
  function encodeLink(link, bytes) {
    let i = bytes.length;
    if (typeof link.Tsize === 'number') {
      if (link.Tsize < 0) {
        throw new Error('Tsize cannot be negative');
      }
      if (!Number.isSafeInteger(link.Tsize)) {
        throw new Error('Tsize too large for encoding');
      }
      i = encodeVarint(bytes, i, link.Tsize) - 1;
      bytes[i] = 24;
    }
    if (typeof link.Name === 'string') {
      const nameBytes = textEncoder.encode(link.Name);
      i -= nameBytes.length;
      bytes.set(nameBytes, i);
      i = encodeVarint(bytes, i, nameBytes.length) - 1;
      bytes[i] = 18;
    }
    if (link.Hash) {
      i -= link.Hash.length;
      bytes.set(link.Hash, i);
      i = encodeVarint(bytes, i, link.Hash.length) - 1;
      bytes[i] = 10;
    }
    return bytes.length - i;
  }
  function encodeNode(node) {
    const size = sizeNode(node);
    const bytes = new Uint8Array(size);
    let i = size;
    if (node.Data) {
      i -= node.Data.length;
      bytes.set(node.Data, i);
      i = encodeVarint(bytes, i, node.Data.length) - 1;
      bytes[i] = 10;
    }
    if (node.Links) {
      for (let index = node.Links.length - 1; index >= 0; index--) {
        const size2 = encodeLink(node.Links[index], bytes.subarray(0, i));
        i -= size2;
        i = encodeVarint(bytes, i, size2) - 1;
        bytes[i] = 18;
      }
    }
    return bytes;
  }
  function sizeLink(link) {
    let n = 0;
    if (link.Hash) {
      const l = link.Hash.length;
      n += 1 + l + sov(l);
    }
    if (typeof link.Name === 'string') {
      const l = textEncoder.encode(link.Name).length;
      n += 1 + l + sov(l);
    }
    if (typeof link.Tsize === 'number') {
      n += 1 + sov(link.Tsize);
    }
    return n;
  }
  function sizeNode(node) {
    let n = 0;
    if (node.Data) {
      const l = node.Data.length;
      n += 1 + l + sov(l);
    }
    if (node.Links) {
      for (const link of node.Links) {
        const l = sizeLink(link);
        n += 1 + l + sov(l);
      }
    }
    return n;
  }
  function encodeVarint(bytes, offset, v) {
    offset -= sov(v);
    const base3 = offset;
    while (v >= maxUInt32) {
      bytes[offset++] = (v & 127) | 128;
      v /= 128;
    }
    while (v >= 128) {
      bytes[offset++] = (v & 127) | 128;
      v >>>= 7;
    }
    bytes[offset] = v;
    return base3;
  }
  function sov(x) {
    if (x % 2 === 0) {
      x++;
    }
    return Math.floor((len64(x) + 6) / 7);
  }
  function len64(x) {
    let n = 0;
    if (x >= maxInt32) {
      x = Math.floor(x / maxInt32);
      n = 32;
    }
    if (x >= 1 << 16) {
      x >>>= 16;
      n += 16;
    }
    if (x >= 1 << 8) {
      x >>>= 8;
      n += 8;
    }
    return n + len8tab[x];
  }
  var len8tab = [
    0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
    8, 8, 8, 8, 8, 8,
  ];

  // node_modules/@ipld/dag-pb/src/util.js
  var pbNodeProperties = ['Data', 'Links'];
  var pbLinkProperties = ['Hash', 'Name', 'Tsize'];
  var textEncoder2 = new TextEncoder();
  function linkComparator(a, b) {
    if (a === b) {
      return 0;
    }
    const abuf = a.Name ? textEncoder2.encode(a.Name) : [];
    const bbuf = b.Name ? textEncoder2.encode(b.Name) : [];
    let x = abuf.length;
    let y = bbuf.length;
    for (let i = 0, len = Math.min(x, y); i < len; ++i) {
      if (abuf[i] !== bbuf[i]) {
        x = abuf[i];
        y = bbuf[i];
        break;
      }
    }
    return x < y ? -1 : y < x ? 1 : 0;
  }
  function hasOnlyProperties(node, properties) {
    return !Object.keys(node).some((p) => !properties.includes(p));
  }
  function asLink(link) {
    if (typeof link.asCID === 'object') {
      const Hash = CID.asCID(link);
      if (!Hash) {
        throw new TypeError('Invalid DAG-PB form');
      }
      return { Hash };
    }
    if (typeof link !== 'object' || Array.isArray(link)) {
      throw new TypeError('Invalid DAG-PB form');
    }
    const pbl = {};
    if (link.Hash) {
      let cid = CID.asCID(link.Hash);
      try {
        if (!cid) {
          if (typeof link.Hash === 'string') {
            cid = CID.parse(link.Hash);
          } else if (link.Hash instanceof Uint8Array) {
            cid = CID.decode(link.Hash);
          }
        }
      } catch (e) {
        throw new TypeError(`Invalid DAG-PB form: ${e.message}`);
      }
      if (cid) {
        pbl.Hash = cid;
      }
    }
    if (!pbl.Hash) {
      throw new TypeError('Invalid DAG-PB form');
    }
    if (typeof link.Name === 'string') {
      pbl.Name = link.Name;
    }
    if (typeof link.Tsize === 'number') {
      pbl.Tsize = link.Tsize;
    }
    return pbl;
  }
  function prepare(node) {
    if (node instanceof Uint8Array || typeof node === 'string') {
      node = { Data: node };
    }
    if (typeof node !== 'object' || Array.isArray(node)) {
      throw new TypeError('Invalid DAG-PB form');
    }
    const pbn = {};
    if (node.Data !== void 0) {
      if (typeof node.Data === 'string') {
        pbn.Data = textEncoder2.encode(node.Data);
      } else if (node.Data instanceof Uint8Array) {
        pbn.Data = node.Data;
      } else {
        throw new TypeError('Invalid DAG-PB form');
      }
    }
    if (node.Links !== void 0) {
      if (Array.isArray(node.Links)) {
        pbn.Links = node.Links.map(asLink);
        pbn.Links.sort(linkComparator);
      } else {
        throw new TypeError('Invalid DAG-PB form');
      }
    } else {
      pbn.Links = [];
    }
    return pbn;
  }
  function validate(node) {
    if (
      !node ||
      typeof node !== 'object' ||
      Array.isArray(node) ||
      node instanceof Uint8Array ||
      (node['/'] && node['/'] === node.bytes)
    ) {
      throw new TypeError('Invalid DAG-PB form');
    }
    if (!hasOnlyProperties(node, pbNodeProperties)) {
      throw new TypeError('Invalid DAG-PB form (extraneous properties)');
    }
    if (node.Data !== void 0 && !(node.Data instanceof Uint8Array)) {
      throw new TypeError('Invalid DAG-PB form (Data must be bytes)');
    }
    if (!Array.isArray(node.Links)) {
      throw new TypeError('Invalid DAG-PB form (Links must be a list)');
    }
    for (let i = 0; i < node.Links.length; i++) {
      const link = node.Links[i];
      if (
        !link ||
        typeof link !== 'object' ||
        Array.isArray(link) ||
        link instanceof Uint8Array ||
        (link['/'] && link['/'] === link.bytes)
      ) {
        throw new TypeError('Invalid DAG-PB form (bad link)');
      }
      if (!hasOnlyProperties(link, pbLinkProperties)) {
        throw new TypeError(
          'Invalid DAG-PB form (extraneous properties on link)'
        );
      }
      if (link.Hash === void 0) {
        throw new TypeError('Invalid DAG-PB form (link must have a Hash)');
      }
      if (
        link.Hash == null ||
        !link.Hash['/'] ||
        link.Hash['/'] !== link.Hash.bytes
      ) {
        throw new TypeError('Invalid DAG-PB form (link Hash must be a CID)');
      }
      if (link.Name !== void 0 && typeof link.Name !== 'string') {
        throw new TypeError('Invalid DAG-PB form (link Name must be a string)');
      }
      if (link.Tsize !== void 0) {
        if (typeof link.Tsize !== 'number' || link.Tsize % 1 !== 0) {
          throw new TypeError(
            'Invalid DAG-PB form (link Tsize must be an integer)'
          );
        }
        if (link.Tsize < 0) {
          throw new TypeError(
            'Invalid DAG-PB form (link Tsize cannot be negative)'
          );
        }
      }
      if (i > 0 && linkComparator(link, node.Links[i - 1]) === -1) {
        throw new TypeError(
          'Invalid DAG-PB form (links must be sorted by Name bytes)'
        );
      }
    }
  }
  function createNode(data, links = []) {
    return prepare({ Data: data, Links: links });
  }
  function createLink(name4, size, cid) {
    return asLink({ Hash: cid, Name: name4, Tsize: size });
  }

  // node_modules/@ipld/dag-pb/src/index.js
  var name = 'dag-pb';
  var code = 112;
  function encode3(node) {
    validate(node);
    const pbn = {};
    if (node.Links) {
      pbn.Links = node.Links.map((l) => {
        const link = {};
        if (l.Hash) {
          link.Hash = l.Hash.bytes;
        }
        if (l.Name !== void 0) {
          link.Name = l.Name;
        }
        if (l.Tsize !== void 0) {
          link.Tsize = l.Tsize;
        }
        return link;
      });
    }
    if (node.Data) {
      pbn.Data = node.Data;
    }
    return encodeNode(pbn);
  }
  function decode5(bytes) {
    const pbn = decodeNode(bytes);
    const node = {};
    if (pbn.Data) {
      node.Data = pbn.Data;
    }
    if (pbn.Links) {
      node.Links = pbn.Links.map((l) => {
        const link = {};
        try {
          link.Hash = CID.decode(l.Hash);
        } catch (e) {}
        if (!link.Hash) {
          throw new Error('Invalid Hash field found in link, expected CID');
        }
        if (l.Name !== void 0) {
          link.Name = l.Name;
        }
        if (l.Tsize !== void 0) {
          link.Tsize = l.Tsize;
        }
        return link;
      });
    }
    return node;
  }

  // node_modules/ipfs-unixfs-importer/src/utils/persist.js
  var persist = async (buffer, blockstore, options) => {
    if (!options.codec) {
      options.codec = src_exports;
    }
    if (!options.hasher) {
      options.hasher = sha256;
    }
    if (options.cidVersion === void 0) {
      options.cidVersion = 1;
    }
    if (options.codec === src_exports && options.hasher !== sha256) {
      options.cidVersion = 1;
    }
    const multihash = await options.hasher.digest(buffer);
    const cid = CID.create(options.cidVersion, options.codec.code, multihash);
    if (!options.onlyHash) {
      await blockstore.put(cid, buffer, {
        signal: options.signal,
      });
    }
    return cid;
  };
  var persist_default = persist;

  // node_modules/ipfs-unixfs-importer/src/dag-builder/dir.js
  var dirBuilder = async (item, blockstore, options) => {
    const unixfs = new UnixFS({
      type: 'directory',
      mtime: item.mtime,
      mode: item.mode,
    });
    const buffer = encode3(prepare({ Data: unixfs.marshal() }));
    const cid = await persist_default(buffer, blockstore, options);
    const path = item.path;
    return {
      cid,
      path,
      unixfs,
      size: buffer.length,
    };
  };
  var dir_default = dirBuilder;

  // node_modules/ipfs-unixfs-importer/src/dag-builder/file/index.js
  var import_err_code2 = __toESM(require_err_code(), 1);

  // node_modules/multiformats/src/codecs/raw.js
  var raw_exports = {};
  __export(raw_exports, {
    code: () => code2,
    decode: () => decode6,
    encode: () => encode4,
    name: () => name2,
  });
  var name2 = 'raw';
  var code2 = 85;
  var encode4 = (node) => coerce(node);
  var decode6 = (data) => coerce(data);

  // node_modules/it-all/dist/src/index.js
  async function all(source) {
    const arr = [];
    for await (const entry of source) {
      arr.push(entry);
    }
    return arr;
  }

  // node_modules/ipfs-unixfs-importer/src/dag-builder/file/flat.js
  async function flat(source, reduce2) {
    return reduce2(await all(source));
  }
  var flat_default = flat;

  // node_modules/ipfs-unixfs-importer/src/dag-builder/file/balanced.js
  function balanced(source, reduce2, options) {
    return reduceToParents(source, reduce2, options);
  }
  async function reduceToParents(source, reduce2, options) {
    const roots = [];
    for await (const chunked of batch(source, options.maxChildrenPerNode)) {
      roots.push(await reduce2(chunked));
    }
    if (roots.length > 1) {
      return reduceToParents(roots, reduce2, options);
    }
    return roots[0];
  }
  var balanced_default = balanced;

  // node_modules/ipfs-unixfs-importer/src/dag-builder/file/trickle.js
  async function trickleStream(source, reduce2, options) {
    const root = new Root(options.layerRepeat);
    let iteration = 0;
    let maxDepth = 1;
    let subTree = root;
    for await (const layer of batch(source, options.maxChildrenPerNode)) {
      if (subTree.isFull()) {
        if (subTree !== root) {
          root.addChild(await subTree.reduce(reduce2));
        }
        if (iteration && iteration % options.layerRepeat === 0) {
          maxDepth++;
        }
        subTree = new SubTree(maxDepth, options.layerRepeat, iteration);
        iteration++;
      }
      subTree.append(layer);
    }
    if (subTree && subTree !== root) {
      root.addChild(await subTree.reduce(reduce2));
    }
    return root.reduce(reduce2);
  }
  var trickle_default = trickleStream;
  var SubTree = class {
    /**
     * @param {number} maxDepth
     * @param {number} layerRepeat
     * @param {number} [iteration=0]
     */
    constructor(maxDepth, layerRepeat, iteration = 0) {
      this.maxDepth = maxDepth;
      this.layerRepeat = layerRepeat;
      this.currentDepth = 1;
      this.iteration = iteration;
      this.root =
        this.node =
        this.parent =
          {
            children: [],
            depth: this.currentDepth,
            maxDepth,
            maxChildren: (this.maxDepth - this.currentDepth) * this.layerRepeat,
          };
    }
    isFull() {
      if (!this.root.data) {
        return false;
      }
      if (this.currentDepth < this.maxDepth && this.node.maxChildren) {
        this._addNextNodeToParent(this.node);
        return false;
      }
      const distantRelative = this._findParent(this.node, this.currentDepth);
      if (distantRelative) {
        this._addNextNodeToParent(distantRelative);
        return false;
      }
      return true;
    }
    /**
     * @param {TrickleDagNode} parent
     */
    _addNextNodeToParent(parent) {
      this.parent = parent;
      const nextNode = {
        children: [],
        depth: parent.depth + 1,
        parent,
        maxDepth: this.maxDepth,
        maxChildren:
          Math.floor(parent.children.length / this.layerRepeat) *
          this.layerRepeat,
      };
      parent.children.push(nextNode);
      this.currentDepth = nextNode.depth;
      this.node = nextNode;
    }
    /**
     *
     * @param {InProgressImportResult[]} layer
     */
    append(layer) {
      this.node.data = layer;
    }
    /**
     * @param {Reducer} reduce
     */
    reduce(reduce2) {
      return this._reduce(this.root, reduce2);
    }
    /**
     * @param {TrickleDagNode} node
     * @param {Reducer} reduce
     * @returns {Promise<InProgressImportResult>}
     */
    async _reduce(node, reduce2) {
      let children = [];
      if (node.children.length) {
        children = await Promise.all(
          node.children
            .filter((child) => child.data)
            .map((child) => this._reduce(child, reduce2))
        );
      }
      return reduce2((node.data || []).concat(children));
    }
    /**
     * @param {TrickleDagNode} node
     * @param {number} depth
     * @returns {TrickleDagNode | undefined}
     */
    _findParent(node, depth) {
      const parent = node.parent;
      if (!parent || parent.depth === 0) {
        return;
      }
      if (
        parent.children.length === parent.maxChildren ||
        !parent.maxChildren
      ) {
        return this._findParent(parent, depth);
      }
      return parent;
    }
  };
  var Root = class extends SubTree {
    /**
     * @param {number} layerRepeat
     */
    constructor(layerRepeat) {
      super(0, layerRepeat);
      this.root.depth = 0;
      this.currentDepth = 1;
    }
    /**
     * @param {InProgressImportResult} child
     */
    addChild(child) {
      this.root.children.push(child);
    }
    /**
     * @param {Reducer} reduce
     */
    reduce(reduce2) {
      return reduce2((this.root.data || []).concat(this.root.children));
    }
  };

  // node_modules/ipfs-unixfs-importer/src/dag-builder/file/buffer-importer.js
  async function* bufferImporter(file, block, options) {
    for await (let buffer of file.content) {
      yield async () => {
        options.progress(buffer.length, file.path);
        let unixfs;
        const opts = {
          codec: src_exports,
          cidVersion: options.cidVersion,
          hasher: options.hasher,
          onlyHash: options.onlyHash,
        };
        if (options.rawLeaves) {
          opts.codec = raw_exports;
          opts.cidVersion = 1;
        } else {
          unixfs = new UnixFS({
            type: options.leafType,
            data: buffer,
          });
          buffer = encode3({
            Data: unixfs.marshal(),
            Links: [],
          });
        }
        return {
          cid: await persist_default(buffer, block, opts),
          unixfs,
          size: buffer.length,
        };
      };
    }
  }
  var buffer_importer_default = bufferImporter;

  // node_modules/ipfs-unixfs-importer/src/dag-builder/file/index.js
  var dagBuilders = {
    flat: flat_default,
    balanced: balanced_default,
    trickle: trickle_default,
  };
  async function* buildFileBatch(file, blockstore, options) {
    let count = -1;
    let previous;
    let bufferImporter2;
    if (typeof options.bufferImporter === 'function') {
      bufferImporter2 = options.bufferImporter;
    } else {
      bufferImporter2 = buffer_importer_default;
    }
    for await (const entry of parallelBatch(
      bufferImporter2(file, blockstore, options),
      options.blockWriteConcurrency
    )) {
      count++;
      if (count === 0) {
        previous = entry;
        continue;
      } else if (count === 1 && previous) {
        yield previous;
        previous = null;
      }
      yield entry;
    }
    if (previous) {
      previous.single = true;
      yield previous;
    }
  }
  var reduce = (file, blockstore, options) => {
    async function reducer(leaves) {
      if (
        leaves.length === 1 &&
        leaves[0].single &&
        options.reduceSingleLeafToSelf
      ) {
        const leaf = leaves[0];
        if (file.mtime !== void 0 || file.mode !== void 0) {
          let buffer2 = await blockstore.get(leaf.cid);
          leaf.unixfs = new UnixFS({
            type: 'file',
            mtime: file.mtime,
            mode: file.mode,
            data: buffer2,
          });
          buffer2 = encode3(prepare({ Data: leaf.unixfs.marshal() }));
          leaf.cid = await persist_default(buffer2, blockstore, {
            ...options,
            codec: src_exports,
            hasher: options.hasher,
            cidVersion: options.cidVersion,
          });
          leaf.size = buffer2.length;
        }
        return {
          cid: leaf.cid,
          path: file.path,
          unixfs: leaf.unixfs,
          size: leaf.size,
        };
      }
      const f = new UnixFS({
        type: 'file',
        mtime: file.mtime,
        mode: file.mode,
      });
      const links = leaves
        .filter((leaf) => {
          if (leaf.cid.code === code2 && leaf.size) {
            return true;
          }
          if (leaf.unixfs && !leaf.unixfs.data && leaf.unixfs.fileSize()) {
            return true;
          }
          return Boolean(
            leaf.unixfs && leaf.unixfs.data && leaf.unixfs.data.length
          );
        })
        .map((leaf) => {
          if (leaf.cid.code === code2) {
            f.addBlockSize(leaf.size);
            return {
              Name: '',
              Tsize: leaf.size,
              Hash: leaf.cid,
            };
          }
          if (!leaf.unixfs || !leaf.unixfs.data) {
            f.addBlockSize((leaf.unixfs && leaf.unixfs.fileSize()) || 0);
          } else {
            f.addBlockSize(leaf.unixfs.data.length);
          }
          return {
            Name: '',
            Tsize: leaf.size,
            Hash: leaf.cid,
          };
        });
      const node = {
        Data: f.marshal(),
        Links: links,
      };
      const buffer = encode3(prepare(node));
      const cid = await persist_default(buffer, blockstore, options);
      return {
        cid,
        path: file.path,
        unixfs: f,
        size:
          buffer.length + node.Links.reduce((acc, curr) => acc + curr.Tsize, 0),
      };
    }
    return reducer;
  };
  function fileBuilder(file, block, options) {
    const dagBuilder2 = dagBuilders[options.strategy];
    if (!dagBuilder2) {
      throw (0, import_err_code2.default)(
        new Error(`Unknown importer build strategy name: ${options.strategy}`),
        'ERR_BAD_STRATEGY'
      );
    }
    return dagBuilder2(
      buildFileBatch(file, block, options),
      reduce(file, block, options),
      options
    );
  }
  var file_default = fileBuilder;

  // node_modules/ipfs-unixfs-importer/src/dag-builder/index.js
  var import_err_code5 = __toESM(require_err_code(), 1);

  // node_modules/uint8arrays/dist/src/util/as-uint8array.js
  function asUint8Array(buf) {
    if (globalThis.Buffer != null) {
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    return buf;
  }

  // node_modules/uint8arrays/dist/src/alloc.js
  function alloc(size = 0) {
    if (globalThis.Buffer?.alloc != null) {
      return asUint8Array(globalThis.Buffer.alloc(size));
    }
    return new Uint8Array(size);
  }
  function allocUnsafe(size = 0) {
    if (globalThis.Buffer?.allocUnsafe != null) {
      return asUint8Array(globalThis.Buffer.allocUnsafe(size));
    }
    return new Uint8Array(size);
  }

  // node_modules/uint8arrays/dist/src/concat.js
  function concat(arrays, length2) {
    if (length2 == null) {
      length2 = arrays.reduce((acc, curr) => acc + curr.length, 0);
    }
    const output = allocUnsafe(length2);
    let offset = 0;
    for (const arr of arrays) {
      output.set(arr, offset);
      offset += arr.length;
    }
    return asUint8Array(output);
  }

  // node_modules/uint8arrays/dist/src/equals.js
  function equals3(a, b) {
    if (a === b) {
      return true;
    }
    if (a.byteLength !== b.byteLength) {
      return false;
    }
    for (let i = 0; i < a.byteLength; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  // node_modules/uint8arraylist/dist/src/index.js
  var symbol = Symbol.for('@achingbrain/uint8arraylist');
  function findBufAndOffset(bufs, index) {
    if (index == null || index < 0) {
      throw new RangeError('index is out of bounds');
    }
    let offset = 0;
    for (const buf of bufs) {
      const bufEnd = offset + buf.byteLength;
      if (index < bufEnd) {
        return {
          buf,
          index: index - offset,
        };
      }
      offset = bufEnd;
    }
    throw new RangeError('index is out of bounds');
  }
  function isUint8ArrayList(value) {
    return Boolean(value?.[symbol]);
  }
  var Uint8ArrayList = class {
    constructor(...data) {
      Object.defineProperty(this, symbol, { value: true });
      this.bufs = [];
      this.length = 0;
      if (data.length > 0) {
        this.appendAll(data);
      }
    }
    *[Symbol.iterator]() {
      yield* this.bufs;
    }
    get byteLength() {
      return this.length;
    }
    /**
     * Add one or more `bufs` to the end of this Uint8ArrayList
     */
    append(...bufs) {
      this.appendAll(bufs);
    }
    /**
     * Add all `bufs` to the end of this Uint8ArrayList
     */
    appendAll(bufs) {
      let length2 = 0;
      for (const buf of bufs) {
        if (buf instanceof Uint8Array) {
          length2 += buf.byteLength;
          this.bufs.push(buf);
        } else if (isUint8ArrayList(buf)) {
          length2 += buf.byteLength;
          this.bufs.push(...buf.bufs);
        } else {
          throw new Error(
            'Could not append value, must be an Uint8Array or a Uint8ArrayList'
          );
        }
      }
      this.length += length2;
    }
    /**
     * Add one or more `bufs` to the start of this Uint8ArrayList
     */
    prepend(...bufs) {
      this.prependAll(bufs);
    }
    /**
     * Add all `bufs` to the start of this Uint8ArrayList
     */
    prependAll(bufs) {
      let length2 = 0;
      for (const buf of bufs.reverse()) {
        if (buf instanceof Uint8Array) {
          length2 += buf.byteLength;
          this.bufs.unshift(buf);
        } else if (isUint8ArrayList(buf)) {
          length2 += buf.byteLength;
          this.bufs.unshift(...buf.bufs);
        } else {
          throw new Error(
            'Could not prepend value, must be an Uint8Array or a Uint8ArrayList'
          );
        }
      }
      this.length += length2;
    }
    /**
     * Read the value at `index`
     */
    get(index) {
      const res = findBufAndOffset(this.bufs, index);
      return res.buf[res.index];
    }
    /**
     * Set the value at `index` to `value`
     */
    set(index, value) {
      const res = findBufAndOffset(this.bufs, index);
      res.buf[res.index] = value;
    }
    /**
     * Copy bytes from `buf` to the index specified by `offset`
     */
    write(buf, offset = 0) {
      if (buf instanceof Uint8Array) {
        for (let i = 0; i < buf.length; i++) {
          this.set(offset + i, buf[i]);
        }
      } else if (isUint8ArrayList(buf)) {
        for (let i = 0; i < buf.length; i++) {
          this.set(offset + i, buf.get(i));
        }
      } else {
        throw new Error(
          'Could not write value, must be an Uint8Array or a Uint8ArrayList'
        );
      }
    }
    /**
     * Remove bytes from the front of the pool
     */
    consume(bytes) {
      bytes = Math.trunc(bytes);
      if (Number.isNaN(bytes) || bytes <= 0) {
        return;
      }
      if (bytes === this.byteLength) {
        this.bufs = [];
        this.length = 0;
        return;
      }
      while (this.bufs.length > 0) {
        if (bytes >= this.bufs[0].byteLength) {
          bytes -= this.bufs[0].byteLength;
          this.length -= this.bufs[0].byteLength;
          this.bufs.shift();
        } else {
          this.bufs[0] = this.bufs[0].subarray(bytes);
          this.length -= bytes;
          break;
        }
      }
    }
    /**
     * Extracts a section of an array and returns a new array.
     *
     * This is a copy operation as it is with Uint8Arrays and Arrays
     * - note this is different to the behaviour of Node Buffers.
     */
    slice(beginInclusive, endExclusive) {
      const { bufs, length: length2 } = this._subList(
        beginInclusive,
        endExclusive
      );
      return concat(bufs, length2);
    }
    /**
     * Returns a alloc from the given start and end element index.
     *
     * In the best case where the data extracted comes from a single Uint8Array
     * internally this is a no-copy operation otherwise it is a copy operation.
     */
    subarray(beginInclusive, endExclusive) {
      const { bufs, length: length2 } = this._subList(
        beginInclusive,
        endExclusive
      );
      if (bufs.length === 1) {
        return bufs[0];
      }
      return concat(bufs, length2);
    }
    /**
     * Returns a allocList from the given start and end element index.
     *
     * This is a no-copy operation.
     */
    sublist(beginInclusive, endExclusive) {
      const { bufs, length: length2 } = this._subList(
        beginInclusive,
        endExclusive
      );
      const list = new Uint8ArrayList();
      list.length = length2;
      list.bufs = bufs;
      return list;
    }
    _subList(beginInclusive, endExclusive) {
      beginInclusive = beginInclusive ?? 0;
      endExclusive = endExclusive ?? this.length;
      if (beginInclusive < 0) {
        beginInclusive = this.length + beginInclusive;
      }
      if (endExclusive < 0) {
        endExclusive = this.length + endExclusive;
      }
      if (beginInclusive < 0 || endExclusive > this.length) {
        throw new RangeError('index is out of bounds');
      }
      if (beginInclusive === endExclusive) {
        return { bufs: [], length: 0 };
      }
      if (beginInclusive === 0 && endExclusive === this.length) {
        return { bufs: [...this.bufs], length: this.length };
      }
      const bufs = [];
      let offset = 0;
      for (let i = 0; i < this.bufs.length; i++) {
        const buf = this.bufs[i];
        const bufStart = offset;
        const bufEnd = bufStart + buf.byteLength;
        offset = bufEnd;
        if (beginInclusive >= bufEnd) {
          continue;
        }
        const sliceStartInBuf =
          beginInclusive >= bufStart && beginInclusive < bufEnd;
        const sliceEndsInBuf =
          endExclusive > bufStart && endExclusive <= bufEnd;
        if (sliceStartInBuf && sliceEndsInBuf) {
          if (beginInclusive === bufStart && endExclusive === bufEnd) {
            bufs.push(buf);
            break;
          }
          const start = beginInclusive - bufStart;
          bufs.push(
            buf.subarray(start, start + (endExclusive - beginInclusive))
          );
          break;
        }
        if (sliceStartInBuf) {
          if (beginInclusive === 0) {
            bufs.push(buf);
            continue;
          }
          bufs.push(buf.subarray(beginInclusive - bufStart));
          continue;
        }
        if (sliceEndsInBuf) {
          if (endExclusive === bufEnd) {
            bufs.push(buf);
            break;
          }
          bufs.push(buf.subarray(0, endExclusive - bufStart));
          break;
        }
        bufs.push(buf);
      }
      return { bufs, length: endExclusive - beginInclusive };
    }
    indexOf(search, offset = 0) {
      if (!isUint8ArrayList(search) && !(search instanceof Uint8Array)) {
        throw new TypeError(
          'The "value" argument must be a Uint8ArrayList or Uint8Array'
        );
      }
      const needle = search instanceof Uint8Array ? search : search.subarray();
      offset = Number(offset ?? 0);
      if (isNaN(offset)) {
        offset = 0;
      }
      if (offset < 0) {
        offset = this.length + offset;
      }
      if (offset < 0) {
        offset = 0;
      }
      if (search.length === 0) {
        return offset > this.length ? this.length : offset;
      }
      const M = needle.byteLength;
      if (M === 0) {
        throw new TypeError('search must be at least 1 byte long');
      }
      const radix = 256;
      const rightmostPositions = new Int32Array(radix);
      for (let c = 0; c < radix; c++) {
        rightmostPositions[c] = -1;
      }
      for (let j = 0; j < M; j++) {
        rightmostPositions[needle[j]] = j;
      }
      const right = rightmostPositions;
      const lastIndex = this.byteLength - needle.byteLength;
      const lastPatIndex = needle.byteLength - 1;
      let skip;
      for (let i = offset; i <= lastIndex; i += skip) {
        skip = 0;
        for (let j = lastPatIndex; j >= 0; j--) {
          const char = this.get(i + j);
          if (needle[j] !== char) {
            skip = Math.max(1, j - right[char]);
            break;
          }
        }
        if (skip === 0) {
          return i;
        }
      }
      return -1;
    }
    getInt8(byteOffset) {
      const buf = this.subarray(byteOffset, byteOffset + 1);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      return view.getInt8(0);
    }
    setInt8(byteOffset, value) {
      const buf = allocUnsafe(1);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      view.setInt8(0, value);
      this.write(buf, byteOffset);
    }
    getInt16(byteOffset, littleEndian) {
      const buf = this.subarray(byteOffset, byteOffset + 2);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      return view.getInt16(0, littleEndian);
    }
    setInt16(byteOffset, value, littleEndian) {
      const buf = alloc(2);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      view.setInt16(0, value, littleEndian);
      this.write(buf, byteOffset);
    }
    getInt32(byteOffset, littleEndian) {
      const buf = this.subarray(byteOffset, byteOffset + 4);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      return view.getInt32(0, littleEndian);
    }
    setInt32(byteOffset, value, littleEndian) {
      const buf = alloc(4);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      view.setInt32(0, value, littleEndian);
      this.write(buf, byteOffset);
    }
    getBigInt64(byteOffset, littleEndian) {
      const buf = this.subarray(byteOffset, byteOffset + 8);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      return view.getBigInt64(0, littleEndian);
    }
    setBigInt64(byteOffset, value, littleEndian) {
      const buf = alloc(8);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      view.setBigInt64(0, value, littleEndian);
      this.write(buf, byteOffset);
    }
    getUint8(byteOffset) {
      const buf = this.subarray(byteOffset, byteOffset + 1);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      return view.getUint8(0);
    }
    setUint8(byteOffset, value) {
      const buf = allocUnsafe(1);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      view.setUint8(0, value);
      this.write(buf, byteOffset);
    }
    getUint16(byteOffset, littleEndian) {
      const buf = this.subarray(byteOffset, byteOffset + 2);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      return view.getUint16(0, littleEndian);
    }
    setUint16(byteOffset, value, littleEndian) {
      const buf = alloc(2);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      view.setUint16(0, value, littleEndian);
      this.write(buf, byteOffset);
    }
    getUint32(byteOffset, littleEndian) {
      const buf = this.subarray(byteOffset, byteOffset + 4);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      return view.getUint32(0, littleEndian);
    }
    setUint32(byteOffset, value, littleEndian) {
      const buf = alloc(4);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      view.setUint32(0, value, littleEndian);
      this.write(buf, byteOffset);
    }
    getBigUint64(byteOffset, littleEndian) {
      const buf = this.subarray(byteOffset, byteOffset + 8);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      return view.getBigUint64(0, littleEndian);
    }
    setBigUint64(byteOffset, value, littleEndian) {
      const buf = alloc(8);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      view.setBigUint64(0, value, littleEndian);
      this.write(buf, byteOffset);
    }
    getFloat32(byteOffset, littleEndian) {
      const buf = this.subarray(byteOffset, byteOffset + 4);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      return view.getFloat32(0, littleEndian);
    }
    setFloat32(byteOffset, value, littleEndian) {
      const buf = alloc(4);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      view.setFloat32(0, value, littleEndian);
      this.write(buf, byteOffset);
    }
    getFloat64(byteOffset, littleEndian) {
      const buf = this.subarray(byteOffset, byteOffset + 8);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      return view.getFloat64(0, littleEndian);
    }
    setFloat64(byteOffset, value, littleEndian) {
      const buf = alloc(8);
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      view.setFloat64(0, value, littleEndian);
      this.write(buf, byteOffset);
    }
    equals(other) {
      if (other == null) {
        return false;
      }
      if (!(other instanceof Uint8ArrayList)) {
        return false;
      }
      if (other.bufs.length !== this.bufs.length) {
        return false;
      }
      for (let i = 0; i < this.bufs.length; i++) {
        if (!equals3(this.bufs[i], other.bufs[i])) {
          return false;
        }
      }
      return true;
    }
    /**
     * Create a Uint8ArrayList from a pre-existing list of Uint8Arrays.  Use this
     * method if you know the total size of all the Uint8Arrays ahead of time.
     */
    static fromUint8Arrays(bufs, length2) {
      const list = new Uint8ArrayList();
      list.bufs = bufs;
      if (length2 == null) {
        length2 = bufs.reduce((acc, curr) => acc + curr.byteLength, 0);
      }
      list.length = length2;
      return list;
    }
  };

  // node_modules/ipfs-unixfs-importer/src/chunker/rabin.js
  var import_rabin_wasm = __toESM(require_src(), 1);
  var import_err_code3 = __toESM(require_err_code(), 1);
  async function* rabinChunker(source, options) {
    let min, max, avg;
    if (options.minChunkSize && options.maxChunkSize && options.avgChunkSize) {
      avg = options.avgChunkSize;
      min = options.minChunkSize;
      max = options.maxChunkSize;
    } else if (!options.avgChunkSize) {
      throw (0, import_err_code3.default)(
        new Error('please specify an average chunk size'),
        'ERR_INVALID_AVG_CHUNK_SIZE'
      );
    } else {
      avg = options.avgChunkSize;
      min = avg / 3;
      max = avg + avg / 2;
    }
    if (min < 16) {
      throw (0, import_err_code3.default)(
        new Error('rabin min must be greater than 16'),
        'ERR_INVALID_MIN_CHUNK_SIZE'
      );
    }
    if (max < min) {
      max = min;
    }
    if (avg < min) {
      avg = min;
    }
    const sizepow = Math.floor(Math.log2(avg));
    for await (const chunk of rabin(source, {
      min,
      max,
      bits: sizepow,
      window: options.window,
      polynomial: options.polynomial,
    })) {
      yield chunk;
    }
  }
  var rabin_default = rabinChunker;
  async function* rabin(source, options) {
    const r = await (0, import_rabin_wasm.create)(
      options.bits,
      options.min,
      options.max,
      options.window
    );
    const buffers = new Uint8ArrayList();
    for await (const chunk of source) {
      buffers.append(chunk);
      const sizes = r.fingerprint(chunk);
      for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        const buf = buffers.slice(0, size);
        buffers.consume(size);
        yield buf;
      }
    }
    if (buffers.length) {
      yield buffers.subarray(0);
    }
  }

  // node_modules/ipfs-unixfs-importer/src/chunker/fixed-size.js
  async function* fixedSizeChunker(source, options) {
    let list = new Uint8ArrayList();
    let currentLength = 0;
    let emitted = false;
    const maxChunkSize = options.maxChunkSize;
    for await (const buffer of source) {
      list.append(buffer);
      currentLength += buffer.length;
      while (currentLength >= maxChunkSize) {
        yield list.slice(0, maxChunkSize);
        emitted = true;
        if (maxChunkSize === list.length) {
          list = new Uint8ArrayList();
          currentLength = 0;
        } else {
          const newBl = new Uint8ArrayList();
          newBl.append(list.sublist(maxChunkSize));
          list = newBl;
          currentLength -= maxChunkSize;
        }
      }
    }
    if (!emitted || currentLength) {
      yield list.subarray(0, currentLength);
    }
  }
  var fixed_size_default = fixedSizeChunker;

  // node_modules/ipfs-unixfs-importer/src/dag-builder/validate-chunks.js
  var import_err_code4 = __toESM(require_err_code(), 1);

  // node_modules/multiformats/src/bases/identity.js
  var identity_exports = {};
  __export(identity_exports, {
    identity: () => identity,
  });
  var identity = from2({
    prefix: '\0',
    name: 'identity',
    encode: (buf) => toString(buf),
    decode: (str) => fromString(str),
  });

  // node_modules/multiformats/src/bases/base2.js
  var base2_exports = {};
  __export(base2_exports, {
    base2: () => base2,
  });
  var base2 = rfc4648({
    prefix: '0',
    name: 'base2',
    alphabet: '01',
    bitsPerChar: 1,
  });

  // node_modules/multiformats/src/bases/base8.js
  var base8_exports = {};
  __export(base8_exports, {
    base8: () => base8,
  });
  var base8 = rfc4648({
    prefix: '7',
    name: 'base8',
    alphabet: '01234567',
    bitsPerChar: 3,
  });

  // node_modules/multiformats/src/bases/base10.js
  var base10_exports = {};
  __export(base10_exports, {
    base10: () => base10,
  });
  var base10 = baseX({
    prefix: '9',
    name: 'base10',
    alphabet: '0123456789',
  });

  // node_modules/multiformats/src/bases/base16.js
  var base16_exports = {};
  __export(base16_exports, {
    base16: () => base16,
    base16upper: () => base16upper,
  });
  var base16 = rfc4648({
    prefix: 'f',
    name: 'base16',
    alphabet: '0123456789abcdef',
    bitsPerChar: 4,
  });
  var base16upper = rfc4648({
    prefix: 'F',
    name: 'base16upper',
    alphabet: '0123456789ABCDEF',
    bitsPerChar: 4,
  });

  // node_modules/multiformats/src/bases/base36.js
  var base36_exports = {};
  __export(base36_exports, {
    base36: () => base36,
    base36upper: () => base36upper,
  });
  var base36 = baseX({
    prefix: 'k',
    name: 'base36',
    alphabet: '0123456789abcdefghijklmnopqrstuvwxyz',
  });
  var base36upper = baseX({
    prefix: 'K',
    name: 'base36upper',
    alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  });

  // node_modules/multiformats/src/bases/base64.js
  var base64_exports = {};
  __export(base64_exports, {
    base64: () => base64,
    base64pad: () => base64pad,
    base64url: () => base64url,
    base64urlpad: () => base64urlpad,
  });
  var base64 = rfc4648({
    prefix: 'm',
    name: 'base64',
    alphabet:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    bitsPerChar: 6,
  });
  var base64pad = rfc4648({
    prefix: 'M',
    name: 'base64pad',
    alphabet:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    bitsPerChar: 6,
  });
  var base64url = rfc4648({
    prefix: 'u',
    name: 'base64url',
    alphabet:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
    bitsPerChar: 6,
  });
  var base64urlpad = rfc4648({
    prefix: 'U',
    name: 'base64urlpad',
    alphabet:
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=',
    bitsPerChar: 6,
  });

  // node_modules/multiformats/src/bases/base256emoji.js
  var base256emoji_exports = {};
  __export(base256emoji_exports, {
    base256emoji: () => base256emoji,
  });
  var alphabet = Array.from(
    '\u{1F680}\u{1FA90}\u2604\u{1F6F0}\u{1F30C}\u{1F311}\u{1F312}\u{1F313}\u{1F314}\u{1F315}\u{1F316}\u{1F317}\u{1F318}\u{1F30D}\u{1F30F}\u{1F30E}\u{1F409}\u2600\u{1F4BB}\u{1F5A5}\u{1F4BE}\u{1F4BF}\u{1F602}\u2764\u{1F60D}\u{1F923}\u{1F60A}\u{1F64F}\u{1F495}\u{1F62D}\u{1F618}\u{1F44D}\u{1F605}\u{1F44F}\u{1F601}\u{1F525}\u{1F970}\u{1F494}\u{1F496}\u{1F499}\u{1F622}\u{1F914}\u{1F606}\u{1F644}\u{1F4AA}\u{1F609}\u263A\u{1F44C}\u{1F917}\u{1F49C}\u{1F614}\u{1F60E}\u{1F607}\u{1F339}\u{1F926}\u{1F389}\u{1F49E}\u270C\u2728\u{1F937}\u{1F631}\u{1F60C}\u{1F338}\u{1F64C}\u{1F60B}\u{1F497}\u{1F49A}\u{1F60F}\u{1F49B}\u{1F642}\u{1F493}\u{1F929}\u{1F604}\u{1F600}\u{1F5A4}\u{1F603}\u{1F4AF}\u{1F648}\u{1F447}\u{1F3B6}\u{1F612}\u{1F92D}\u2763\u{1F61C}\u{1F48B}\u{1F440}\u{1F62A}\u{1F611}\u{1F4A5}\u{1F64B}\u{1F61E}\u{1F629}\u{1F621}\u{1F92A}\u{1F44A}\u{1F973}\u{1F625}\u{1F924}\u{1F449}\u{1F483}\u{1F633}\u270B\u{1F61A}\u{1F61D}\u{1F634}\u{1F31F}\u{1F62C}\u{1F643}\u{1F340}\u{1F337}\u{1F63B}\u{1F613}\u2B50\u2705\u{1F97A}\u{1F308}\u{1F608}\u{1F918}\u{1F4A6}\u2714\u{1F623}\u{1F3C3}\u{1F490}\u2639\u{1F38A}\u{1F498}\u{1F620}\u261D\u{1F615}\u{1F33A}\u{1F382}\u{1F33B}\u{1F610}\u{1F595}\u{1F49D}\u{1F64A}\u{1F639}\u{1F5E3}\u{1F4AB}\u{1F480}\u{1F451}\u{1F3B5}\u{1F91E}\u{1F61B}\u{1F534}\u{1F624}\u{1F33C}\u{1F62B}\u26BD\u{1F919}\u2615\u{1F3C6}\u{1F92B}\u{1F448}\u{1F62E}\u{1F646}\u{1F37B}\u{1F343}\u{1F436}\u{1F481}\u{1F632}\u{1F33F}\u{1F9E1}\u{1F381}\u26A1\u{1F31E}\u{1F388}\u274C\u270A\u{1F44B}\u{1F630}\u{1F928}\u{1F636}\u{1F91D}\u{1F6B6}\u{1F4B0}\u{1F353}\u{1F4A2}\u{1F91F}\u{1F641}\u{1F6A8}\u{1F4A8}\u{1F92C}\u2708\u{1F380}\u{1F37A}\u{1F913}\u{1F619}\u{1F49F}\u{1F331}\u{1F616}\u{1F476}\u{1F974}\u25B6\u27A1\u2753\u{1F48E}\u{1F4B8}\u2B07\u{1F628}\u{1F31A}\u{1F98B}\u{1F637}\u{1F57A}\u26A0\u{1F645}\u{1F61F}\u{1F635}\u{1F44E}\u{1F932}\u{1F920}\u{1F927}\u{1F4CC}\u{1F535}\u{1F485}\u{1F9D0}\u{1F43E}\u{1F352}\u{1F617}\u{1F911}\u{1F30A}\u{1F92F}\u{1F437}\u260E\u{1F4A7}\u{1F62F}\u{1F486}\u{1F446}\u{1F3A4}\u{1F647}\u{1F351}\u2744\u{1F334}\u{1F4A3}\u{1F438}\u{1F48C}\u{1F4CD}\u{1F940}\u{1F922}\u{1F445}\u{1F4A1}\u{1F4A9}\u{1F450}\u{1F4F8}\u{1F47B}\u{1F910}\u{1F92E}\u{1F3BC}\u{1F975}\u{1F6A9}\u{1F34E}\u{1F34A}\u{1F47C}\u{1F48D}\u{1F4E3}\u{1F942}'
  );
  var alphabetBytesToChars =
    /** @type {string[]} */
    alphabet.reduce(
      (p, c, i) => {
        p[i] = c;
        return p;
      },
      /** @type {string[]} */
      []
    );
  var alphabetCharsToBytes =
    /** @type {number[]} */
    alphabet.reduce(
      (p, c, i) => {
        p[
          /** @type {number} */
          c.codePointAt(0)
        ] = i;
        return p;
      },
      /** @type {number[]} */
      []
    );
  function encode5(data) {
    return data.reduce((p, c) => {
      p += alphabetBytesToChars[c];
      return p;
    }, '');
  }
  function decode7(str) {
    const byts = [];
    for (const char of str) {
      const byt =
        alphabetCharsToBytes[
          /** @type {number} */
          char.codePointAt(0)
        ];
      if (byt === void 0) {
        throw new Error(`Non-base256emoji character: ${char}`);
      }
      byts.push(byt);
    }
    return new Uint8Array(byts);
  }
  var base256emoji = from2({
    prefix: '\u{1F680}',
    name: 'base256emoji',
    encode: encode5,
    decode: decode7,
  });

  // node_modules/multiformats/src/hashes/identity.js
  var identity_exports2 = {};
  __export(identity_exports2, {
    identity: () => identity2,
  });
  var code3 = 0;
  var name3 = 'identity';
  var encode6 = coerce;
  var digest = (input) => create(code3, encode6(input));
  var identity2 = { code: code3, name: name3, encode: encode6, digest };

  // node_modules/multiformats/src/codecs/json.js
  var textEncoder3 = new TextEncoder();
  var textDecoder2 = new TextDecoder();

  // node_modules/multiformats/src/basics.js
  var bases = {
    ...identity_exports,
    ...base2_exports,
    ...base8_exports,
    ...base10_exports,
    ...base16_exports,
    ...base32_exports,
    ...base36_exports,
    ...base58_exports,
    ...base64_exports,
    ...base256emoji_exports,
  };
  var hashes = { ...sha2_browser_exports, ...identity_exports2 };

  // node_modules/uint8arrays/dist/src/util/bases.js
  function createCodec(name4, prefix, encode7, decode8) {
    return {
      name: name4,
      prefix,
      encoder: {
        name: name4,
        prefix,
        encode: encode7,
      },
      decoder: {
        decode: decode8,
      },
    };
  }
  var string = createCodec(
    'utf8',
    'u',
    (buf) => {
      const decoder = new TextDecoder('utf8');
      return 'u' + decoder.decode(buf);
    },
    (str) => {
      const encoder = new TextEncoder();
      return encoder.encode(str.substring(1));
    }
  );
  var ascii = createCodec(
    'ascii',
    'a',
    (buf) => {
      let string2 = 'a';
      for (let i = 0; i < buf.length; i++) {
        string2 += String.fromCharCode(buf[i]);
      }
      return string2;
    },
    (str) => {
      str = str.substring(1);
      const buf = allocUnsafe(str.length);
      for (let i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
      }
      return buf;
    }
  );
  var BASES = {
    utf8: string,
    'utf-8': string,
    hex: bases.base16,
    latin1: ascii,
    ascii,
    binary: ascii,
    ...bases,
  };
  var bases_default = BASES;

  // node_modules/uint8arrays/dist/src/from-string.js
  function fromString2(string2, encoding = 'utf8') {
    const base3 = bases_default[encoding];
    if (base3 == null) {
      throw new Error(`Unsupported encoding "${encoding}"`);
    }
    if (
      (encoding === 'utf8' || encoding === 'utf-8') &&
      globalThis.Buffer != null &&
      globalThis.Buffer.from != null
    ) {
      return asUint8Array(globalThis.Buffer.from(string2, 'utf-8'));
    }
    return base3.decoder.decode(`${base3.prefix}${string2}`);
  }

  // node_modules/ipfs-unixfs-importer/src/dag-builder/validate-chunks.js
  async function* validateChunks(source) {
    for await (const content of source) {
      if (content.length === void 0) {
        throw (0, import_err_code4.default)(
          new Error('Content was invalid'),
          'ERR_INVALID_CONTENT'
        );
      }
      if (typeof content === 'string' || content instanceof String) {
        yield fromString2(content.toString());
      } else if (Array.isArray(content)) {
        yield Uint8Array.from(content);
      } else if (content instanceof Uint8Array) {
        yield content;
      } else {
        throw (0, import_err_code4.default)(
          new Error('Content was invalid'),
          'ERR_INVALID_CONTENT'
        );
      }
    }
  }
  var validate_chunks_default = validateChunks;

  // node_modules/ipfs-unixfs-importer/src/dag-builder/index.js
  function isIterable(thing) {
    return Symbol.iterator in thing;
  }
  function isAsyncIterable(thing) {
    return Symbol.asyncIterator in thing;
  }
  function contentAsAsyncIterable(content) {
    try {
      if (content instanceof Uint8Array) {
        return (async function* () {
          yield content;
        })();
      } else if (isIterable(content)) {
        return (async function* () {
          yield* content;
        })();
      } else if (isAsyncIterable(content)) {
        return content;
      }
    } catch {
      throw (0, import_err_code5.default)(
        new Error('Content was invalid'),
        'ERR_INVALID_CONTENT'
      );
    }
    throw (0, import_err_code5.default)(
      new Error('Content was invalid'),
      'ERR_INVALID_CONTENT'
    );
  }
  async function* dagBuilder(source, blockstore, options) {
    for await (const entry of source) {
      if (entry.path) {
        if (entry.path.substring(0, 2) === './') {
          options.wrapWithDirectory = true;
        }
        entry.path = entry.path
          .split('/')
          .filter((path) => path && path !== '.')
          .join('/');
      }
      if (entry.content) {
        let chunker;
        if (typeof options.chunker === 'function') {
          chunker = options.chunker;
        } else if (options.chunker === 'rabin') {
          chunker = rabin_default;
        } else {
          chunker = fixed_size_default;
        }
        let chunkValidator;
        if (typeof options.chunkValidator === 'function') {
          chunkValidator = options.chunkValidator;
        } else {
          chunkValidator = validate_chunks_default;
        }
        const file = {
          path: entry.path,
          mtime: entry.mtime,
          mode: entry.mode,
          content: chunker(
            chunkValidator(contentAsAsyncIterable(entry.content), options),
            options
          ),
        };
        yield () => file_default(file, blockstore, options);
      } else if (entry.path) {
        const dir = {
          path: entry.path,
          mtime: entry.mtime,
          mode: entry.mode,
        };
        yield () => dir_default(dir, blockstore, options);
      } else {
        throw new Error('Import candidate must have content or path or both');
      }
    }
  }
  var dag_builder_default = dagBuilder;

  // node_modules/ipfs-unixfs-importer/src/dir.js
  var Dir = class {
    /**
     * @param {DirProps} props
     * @param {ImporterOptions} options
     */
    constructor(props, options) {
      this.options = options || {};
      this.root = props.root;
      this.dir = props.dir;
      this.path = props.path;
      this.dirty = props.dirty;
      this.flat = props.flat;
      this.parent = props.parent;
      this.parentKey = props.parentKey;
      this.unixfs = props.unixfs;
      this.mode = props.mode;
      this.mtime = props.mtime;
      this.cid = void 0;
      this.size = void 0;
    }
    /**
     * @param {string} name
     * @param {InProgressImportResult | Dir} value
     */
    async put(name4, value) {}
    /**
     * @param {string} name
     * @returns {Promise<InProgressImportResult | Dir | undefined>}
     */
    get(name4) {
      return Promise.resolve(this);
    }
    /**
     * @returns {AsyncIterable<{ key: string, child: InProgressImportResult | Dir}>}
     */
    async *eachChildSeries() {}
    /**
     * @param {Blockstore} blockstore
     * @returns {AsyncIterable<ImportResult>}
     */
    async *flush(blockstore) {}
  };
  var dir_default2 = Dir;

  // node_modules/ipfs-unixfs-importer/src/dir-flat.js
  var DirFlat = class extends dir_default2 {
    /**
     * @param {DirProps} props
     * @param {ImporterOptions} options
     */
    constructor(props, options) {
      super(props, options);
      this._children = {};
    }
    /**
     * @param {string} name
     * @param {InProgressImportResult | Dir} value
     */
    async put(name4, value) {
      this.cid = void 0;
      this.size = void 0;
      this._children[name4] = value;
    }
    /**
     * @param {string} name
     */
    get(name4) {
      return Promise.resolve(this._children[name4]);
    }
    childCount() {
      return Object.keys(this._children).length;
    }
    directChildrenCount() {
      return this.childCount();
    }
    onlyChild() {
      return this._children[Object.keys(this._children)[0]];
    }
    async *eachChildSeries() {
      const keys = Object.keys(this._children);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        yield {
          key,
          child: this._children[key],
        };
      }
    }
    /**
     * @param {Blockstore} block
     * @returns {AsyncIterable<ImportResult>}
     */
    async *flush(block) {
      const children = Object.keys(this._children);
      const links = [];
      for (let i = 0; i < children.length; i++) {
        let child = this._children[children[i]];
        if (child instanceof dir_default2) {
          for await (const entry of child.flush(block)) {
            child = entry;
            yield child;
          }
        }
        if (child.size != null && child.cid) {
          links.push({
            Name: children[i],
            Tsize: child.size,
            Hash: child.cid,
          });
        }
      }
      const unixfs = new UnixFS({
        type: 'directory',
        mtime: this.mtime,
        mode: this.mode,
      });
      const node = { Data: unixfs.marshal(), Links: links };
      const buffer = encode3(prepare(node));
      const cid = await persist_default(buffer, block, this.options);
      const size =
        buffer.length +
        node.Links.reduce(
          /**
           * @param {number} acc
           * @param {PBLink} curr
           */
          (acc, curr) => acc + (curr.Tsize == null ? 0 : curr.Tsize),
          0
        );
      this.cid = cid;
      this.size = size;
      yield {
        cid,
        unixfs,
        path: this.path,
        size,
      };
    }
  };
  var dir_flat_default = DirFlat;

  // node_modules/hamt-sharding/dist/src/bucket.js
  var import_sparse_array = __toESM(require_sparse_array(), 1);
  var Bucket = class {
    constructor(options, parent, posAtParent = 0) {
      this._options = options;
      this._popCount = 0;
      this._parent = parent;
      this._posAtParent = posAtParent;
      this._children = new import_sparse_array.default();
      this.key = null;
    }
    async put(key, value) {
      const place = await this._findNewBucketAndPos(key);
      await place.bucket._putAt(place, key, value);
    }
    async get(key) {
      const child = await this._findChild(key);
      if (child != null) {
        return child.value;
      }
    }
    async del(key) {
      const place = await this._findPlace(key);
      const child = place.bucket._at(place.pos);
      if (child != null && child.key === key) {
        place.bucket._delAt(place.pos);
      }
    }
    leafCount() {
      const children = this._children.compactArray();
      return children.reduce((acc, child) => {
        if (child instanceof Bucket) {
          return acc + child.leafCount();
        }
        return acc + 1;
      }, 0);
    }
    childrenCount() {
      return this._children.length;
    }
    onlyChild() {
      return this._children.get(0);
    }
    *eachLeafSeries() {
      const children = this._children.compactArray();
      for (const child of children) {
        if (child instanceof Bucket) {
          yield* child.eachLeafSeries();
        } else {
          yield child;
        }
      }
    }
    serialize(map, reduce2) {
      const acc = [];
      return reduce2(
        this._children.reduce((acc2, child, index) => {
          if (child != null) {
            if (child instanceof Bucket) {
              acc2.push(child.serialize(map, reduce2));
            } else {
              acc2.push(map(child, index));
            }
          }
          return acc2;
        }, acc)
      );
    }
    async asyncTransform(asyncMap, asyncReduce) {
      return await asyncTransformBucket(this, asyncMap, asyncReduce);
    }
    toJSON() {
      return this.serialize(mapNode, reduceNodes);
    }
    prettyPrint() {
      return JSON.stringify(this.toJSON(), null, '  ');
    }
    tableSize() {
      return Math.pow(2, this._options.bits);
    }
    async _findChild(key) {
      const result = await this._findPlace(key);
      const child = result.bucket._at(result.pos);
      if (child instanceof Bucket) {
        return void 0;
      }
      if (child != null && child.key === key) {
        return child;
      }
    }
    async _findPlace(key) {
      const hashValue = this._options.hash(
        typeof key === 'string' ? fromString2(key) : key
      );
      const index = await hashValue.take(this._options.bits);
      const child = this._children.get(index);
      if (child instanceof Bucket) {
        return await child._findPlace(hashValue);
      }
      return {
        bucket: this,
        pos: index,
        hash: hashValue,
        existingChild: child,
      };
    }
    async _findNewBucketAndPos(key) {
      const place = await this._findPlace(key);
      if (place.existingChild != null && place.existingChild.key !== key) {
        const bucket = new Bucket(this._options, place.bucket, place.pos);
        place.bucket._putObjectAt(place.pos, bucket);
        const newPlace = await bucket._findPlace(place.existingChild.hash);
        newPlace.bucket._putAt(
          newPlace,
          place.existingChild.key,
          place.existingChild.value
        );
        return await bucket._findNewBucketAndPos(place.hash);
      }
      return place;
    }
    _putAt(place, key, value) {
      this._putObjectAt(place.pos, {
        key,
        value,
        hash: place.hash,
      });
    }
    _putObjectAt(pos, object) {
      if (this._children.get(pos) == null) {
        this._popCount++;
      }
      this._children.set(pos, object);
    }
    _delAt(pos) {
      if (pos === -1) {
        throw new Error('Invalid position');
      }
      if (this._children.get(pos) != null) {
        this._popCount--;
      }
      this._children.unset(pos);
      this._level();
    }
    _level() {
      if (this._parent != null && this._popCount <= 1) {
        if (this._popCount === 1) {
          const onlyChild = this._children.find(exists);
          if (onlyChild != null && !(onlyChild instanceof Bucket)) {
            const hash = onlyChild.hash;
            hash.untake(this._options.bits);
            const place = {
              pos: this._posAtParent,
              hash,
              bucket: this._parent,
            };
            this._parent._putAt(place, onlyChild.key, onlyChild.value);
          }
        } else {
          this._parent._delAt(this._posAtParent);
        }
      }
    }
    _at(index) {
      return this._children.get(index);
    }
  };
  function exists(o) {
    return Boolean(o);
  }
  function mapNode(node, _) {
    return node.key;
  }
  function reduceNodes(nodes) {
    return nodes;
  }
  async function asyncTransformBucket(bucket, asyncMap, asyncReduce) {
    const output = [];
    for (const child of bucket._children.compactArray()) {
      if (child instanceof Bucket) {
        await asyncTransformBucket(child, asyncMap, asyncReduce);
      } else {
        const mappedChildren = await asyncMap(child);
        output.push({
          bitField: bucket._children.bitField(),
          children: mappedChildren,
        });
      }
    }
    return await asyncReduce(output);
  }

  // node_modules/hamt-sharding/dist/src/consumable-buffer.js
  var START_MASKS = [255, 254, 252, 248, 240, 224, 192, 128];
  var STOP_MASKS = [1, 3, 7, 15, 31, 63, 127, 255];
  var ConsumableBuffer = class {
    constructor(value) {
      this._value = value;
      this._currentBytePos = value.length - 1;
      this._currentBitPos = 7;
    }
    availableBits() {
      return this._currentBitPos + 1 + this._currentBytePos * 8;
    }
    totalBits() {
      return this._value.length * 8;
    }
    take(bits) {
      let pendingBits = bits;
      let result = 0;
      while (pendingBits > 0 && this._haveBits()) {
        const byte = this._value[this._currentBytePos];
        const availableBits = this._currentBitPos + 1;
        const taking = Math.min(availableBits, pendingBits);
        const value = byteBitsToInt(byte, availableBits - taking, taking);
        result = (result << taking) + value;
        pendingBits -= taking;
        this._currentBitPos -= taking;
        if (this._currentBitPos < 0) {
          this._currentBitPos = 7;
          this._currentBytePos--;
        }
      }
      return result;
    }
    untake(bits) {
      this._currentBitPos += bits;
      while (this._currentBitPos > 7) {
        this._currentBitPos -= 8;
        this._currentBytePos += 1;
      }
    }
    _haveBits() {
      return this._currentBytePos >= 0;
    }
  };
  function byteBitsToInt(byte, start, length2) {
    const mask = maskFor(start, length2);
    return (byte & mask) >>> start;
  }
  function maskFor(start, length2) {
    return START_MASKS[start] & STOP_MASKS[Math.min(length2 + start - 1, 7)];
  }

  // node_modules/hamt-sharding/dist/src/consumable-hash.js
  function wrapHash(hashFn) {
    function hashing(value) {
      if (value instanceof InfiniteHash) {
        return value;
      } else {
        return new InfiniteHash(value, hashFn);
      }
    }
    return hashing;
  }
  var InfiniteHash = class {
    constructor(value, hashFn) {
      if (!(value instanceof Uint8Array)) {
        throw new Error('can only hash Uint8Arrays');
      }
      this._value = value;
      this._hashFn = hashFn;
      this._depth = -1;
      this._availableBits = 0;
      this._currentBufferIndex = 0;
      this._buffers = [];
    }
    async take(bits) {
      let pendingBits = bits;
      while (this._availableBits < pendingBits) {
        await this._produceMoreBits();
      }
      let result = 0;
      while (pendingBits > 0) {
        const hash = this._buffers[this._currentBufferIndex];
        const available = Math.min(hash.availableBits(), pendingBits);
        const took = hash.take(available);
        result = (result << available) + took;
        pendingBits -= available;
        this._availableBits -= available;
        if (hash.availableBits() === 0) {
          this._currentBufferIndex++;
        }
      }
      return result;
    }
    untake(bits) {
      let pendingBits = bits;
      while (pendingBits > 0) {
        const hash = this._buffers[this._currentBufferIndex];
        const availableForUntake = Math.min(
          hash.totalBits() - hash.availableBits(),
          pendingBits
        );
        hash.untake(availableForUntake);
        pendingBits -= availableForUntake;
        this._availableBits += availableForUntake;
        if (
          this._currentBufferIndex > 0 &&
          hash.totalBits() === hash.availableBits()
        ) {
          this._depth--;
          this._currentBufferIndex--;
        }
      }
    }
    async _produceMoreBits() {
      this._depth++;
      const value =
        this._depth > 0
          ? concat([this._value, Uint8Array.from([this._depth])])
          : this._value;
      const hashValue = await this._hashFn(value);
      const buffer = new ConsumableBuffer(hashValue);
      this._buffers.push(buffer);
      this._availableBits += buffer.availableBits();
    }
  };

  // node_modules/hamt-sharding/dist/src/index.js
  function createHAMT(options) {
    if (options == null || options.hashFn == null) {
      throw new Error('please define an options.hashFn');
    }
    const bucketOptions = {
      bits: options.bits ?? 8,
      hash: wrapHash(options.hashFn),
    };
    return new Bucket(bucketOptions);
  }

  // node_modules/ipfs-unixfs-importer/src/dir-sharded.js
  var DirSharded = class extends dir_default2 {
    /**
     * @param {DirProps} props
     * @param {ImporterOptions} options
     */
    constructor(props, options) {
      super(props, options);
      this._bucket = createHAMT({
        hashFn: options.hamtHashFn,
        bits: options.hamtBucketBits,
      });
    }
    /**
     * @param {string} name
     * @param {InProgressImportResult | Dir} value
     */
    async put(name4, value) {
      await this._bucket.put(name4, value);
    }
    /**
     * @param {string} name
     */
    get(name4) {
      return this._bucket.get(name4);
    }
    childCount() {
      return this._bucket.leafCount();
    }
    directChildrenCount() {
      return this._bucket.childrenCount();
    }
    onlyChild() {
      return this._bucket.onlyChild();
    }
    async *eachChildSeries() {
      for await (const { key, value } of this._bucket.eachLeafSeries()) {
        yield {
          key,
          child: value,
        };
      }
    }
    /**
     * @param {Blockstore} blockstore
     * @returns {AsyncIterable<ImportResult>}
     */
    async *flush(blockstore) {
      for await (const entry of flush(
        this._bucket,
        blockstore,
        this,
        this.options
      )) {
        yield {
          ...entry,
          path: this.path,
        };
      }
    }
  };
  var dir_sharded_default = DirSharded;
  async function* flush(bucket, blockstore, shardRoot, options) {
    const children = bucket._children;
    const links = [];
    let childrenSize = 0;
    for (let i = 0; i < children.length; i++) {
      const child = children.get(i);
      if (!child) {
        continue;
      }
      const labelPrefix = i.toString(16).toUpperCase().padStart(2, '0');
      if (child instanceof Bucket) {
        let shard;
        for await (const subShard of await flush(
          child,
          blockstore,
          null,
          options
        )) {
          shard = subShard;
        }
        if (!shard) {
          throw new Error(
            'Could not flush sharded directory, no subshard found'
          );
        }
        links.push({
          Name: labelPrefix,
          Tsize: shard.size,
          Hash: shard.cid,
        });
        childrenSize += shard.size;
      } else if (typeof child.value.flush === 'function') {
        const dir2 = child.value;
        let flushedDir;
        for await (const entry of dir2.flush(blockstore)) {
          flushedDir = entry;
          yield flushedDir;
        }
        const label = labelPrefix + child.key;
        links.push({
          Name: label,
          Tsize: flushedDir.size,
          Hash: flushedDir.cid,
        });
        childrenSize += flushedDir.size;
      } else {
        const value = child.value;
        if (!value.cid) {
          continue;
        }
        const label = labelPrefix + child.key;
        const size2 = value.size;
        links.push({
          Name: label,
          Tsize: size2,
          Hash: value.cid,
        });
        childrenSize += size2;
      }
    }
    const data = Uint8Array.from(children.bitField().reverse());
    const dir = new UnixFS({
      type: 'hamt-sharded-directory',
      data,
      fanout: bucket.tableSize(),
      hashType: options.hamtHashCode,
      mtime: shardRoot && shardRoot.mtime,
      mode: shardRoot && shardRoot.mode,
    });
    const node = {
      Data: dir.marshal(),
      Links: links,
    };
    const buffer = encode3(prepare(node));
    const cid = await persist_default(buffer, blockstore, options);
    const size = buffer.length + childrenSize;
    yield {
      cid,
      unixfs: dir,
      size,
    };
  }

  // node_modules/ipfs-unixfs-importer/src/flat-to-shard.js
  async function flatToShard(child, dir, threshold, options) {
    let newDir = dir;
    if (
      dir instanceof dir_flat_default &&
      dir.directChildrenCount() >= threshold
    ) {
      newDir = await convertToShard(dir, options);
    }
    const parent = newDir.parent;
    if (parent) {
      if (newDir !== dir) {
        if (child) {
          child.parent = newDir;
        }
        if (!newDir.parentKey) {
          throw new Error('No parent key found');
        }
        await parent.put(newDir.parentKey, newDir);
      }
      return flatToShard(newDir, parent, threshold, options);
    }
    return newDir;
  }
  async function convertToShard(oldDir, options) {
    const newDir = new dir_sharded_default(
      {
        root: oldDir.root,
        dir: true,
        parent: oldDir.parent,
        parentKey: oldDir.parentKey,
        path: oldDir.path,
        dirty: oldDir.dirty,
        flat: false,
        mtime: oldDir.mtime,
        mode: oldDir.mode,
      },
      options
    );
    for await (const { key, child } of oldDir.eachChildSeries()) {
      await newDir.put(key, child);
    }
    return newDir;
  }
  var flat_to_shard_default = flatToShard;

  // node_modules/ipfs-unixfs-importer/src/utils/to-path-components.js
  var toPathComponents = (path = '') => {
    return (path.trim().match(/([^\\/]|\\\/)+/g) || []).filter(Boolean);
  };
  var to_path_components_default = toPathComponents;

  // node_modules/ipfs-unixfs-importer/src/tree-builder.js
  async function addToTree(elem, tree, options) {
    const pathElems = to_path_components_default(elem.path || '');
    const lastIndex = pathElems.length - 1;
    let parent = tree;
    let currentPath = '';
    for (let i = 0; i < pathElems.length; i++) {
      const pathElem = pathElems[i];
      currentPath += `${currentPath ? '/' : ''}${pathElem}`;
      const last = i === lastIndex;
      parent.dirty = true;
      parent.cid = void 0;
      parent.size = void 0;
      if (last) {
        await parent.put(pathElem, elem);
        tree = await flat_to_shard_default(
          null,
          parent,
          options.shardSplitThreshold,
          options
        );
      } else {
        let dir = await parent.get(pathElem);
        if (!dir || !(dir instanceof dir_default2)) {
          dir = new dir_flat_default(
            {
              root: false,
              dir: true,
              parent,
              parentKey: pathElem,
              path: currentPath,
              dirty: true,
              flat: true,
              mtime: dir && dir.unixfs && dir.unixfs.mtime,
              mode: dir && dir.unixfs && dir.unixfs.mode,
            },
            options
          );
        }
        await parent.put(pathElem, dir);
        parent = dir;
      }
    }
    return tree;
  }
  async function* flushAndYield(tree, blockstore) {
    if (!(tree instanceof dir_default2)) {
      if (tree && tree.unixfs && tree.unixfs.isDirectory()) {
        yield tree;
      }
      return;
    }
    yield* tree.flush(blockstore);
  }
  async function* treeBuilder(source, block, options) {
    let tree = new dir_flat_default(
      {
        root: true,
        dir: true,
        path: '',
        dirty: true,
        flat: true,
      },
      options
    );
    for await (const entry of source) {
      if (!entry) {
        continue;
      }
      tree = await addToTree(entry, tree, options);
      if (!entry.unixfs || !entry.unixfs.isDirectory()) {
        yield entry;
      }
    }
    if (options.wrapWithDirectory) {
      yield* flushAndYield(tree, block);
    } else {
      for await (const unwrapped of tree.eachChildSeries()) {
        if (!unwrapped) {
          continue;
        }
        yield* flushAndYield(unwrapped.child, block);
      }
    }
  }
  var tree_builder_default = treeBuilder;

  // node_modules/ipfs-unixfs-importer/src/index.js
  async function* importer(source, blockstore, options = {}) {
    const opts = options_default(options);
    let dagBuilder2;
    if (typeof options.dagBuilder === 'function') {
      dagBuilder2 = options.dagBuilder;
    } else {
      dagBuilder2 = dag_builder_default;
    }
    let treeBuilder2;
    if (typeof options.treeBuilder === 'function') {
      treeBuilder2 = options.treeBuilder;
    } else {
      treeBuilder2 = tree_builder_default;
    }
    let candidates;
    if (Symbol.asyncIterator in source || Symbol.iterator in source) {
      candidates = source;
    } else {
      candidates = [source];
    }
    for await (const entry of treeBuilder2(
      parallelBatch(
        dagBuilder2(candidates, blockstore, opts),
        opts.fileImportConcurrency
      ),
      blockstore,
      opts
    )) {
      yield {
        cid: entry.cid,
        path: entry.path,
        unixfs: entry.unixfs,
        size: entry.size,
      };
    }
  }

  // node_modules/it-drain/dist/src/index.js
  async function drain(source) {
    for await (const _ of source) {
    }
  }

  // node_modules/it-filter/dist/src/index.js
  async function* filter(source, fn) {
    for await (const entry of source) {
      if (await fn(entry)) {
        yield entry;
      }
    }
  }

  // node_modules/it-take/dist/src/index.js
  async function* take(source, limit) {
    let items = 0;
    if (limit < 1) {
      return;
    }
    for await (const entry of source) {
      yield entry;
      items++;
      if (items === limit) {
        return;
      }
    }
  }

  // node_modules/blockstore-core/src/base.js
  var sortAll = (iterable, sorter) => {
    return (async function* () {
      const values = await all(iterable);
      yield* values.sort(sorter);
    })();
  };
  var BaseBlockstore = class {
    /**
     * @returns {Promise<void>}
     */
    open() {
      return Promise.reject(new Error('.open is not implemented'));
    }
    /**
     * @returns {Promise<void>}
     */
    close() {
      return Promise.reject(new Error('.close is not implemented'));
    }
    /**
     * @param {CID} key
     * @param {Uint8Array} val
     * @param {Options} [options]
     * @returns {Promise<void>}
     */
    put(key, val, options) {
      return Promise.reject(new Error('.put is not implemented'));
    }
    /**
     * @param {CID} key
     * @param {Options} [options]
     * @returns {Promise<Uint8Array>}
     */
    get(key, options) {
      return Promise.reject(new Error('.get is not implemented'));
    }
    /**
     * @param {CID} key
     * @param {Options} [options]
     * @returns {Promise<boolean>}
     */
    has(key, options) {
      return Promise.reject(new Error('.has is not implemented'));
    }
    /**
     * @param {CID} key
     * @param {Options} [options]
     * @returns {Promise<void>}
     */
    delete(key, options) {
      return Promise.reject(new Error('.delete is not implemented'));
    }
    /**
     * @param {AwaitIterable<Pair>} source
     * @param {Options} [options]
     * @returns {AsyncIterable<Pair>}
     */
    async *putMany(source, options = {}) {
      for await (const { key, value } of source) {
        await this.put(key, value, options);
        yield { key, value };
      }
    }
    /**
     * @param {AwaitIterable<CID>} source
     * @param {Options} [options]
     * @returns {AsyncIterable<Uint8Array>}
     */
    async *getMany(source, options = {}) {
      for await (const key of source) {
        yield this.get(key, options);
      }
    }
    /**
     * @param {AwaitIterable<CID>} source
     * @param {Options} [options]
     * @returns {AsyncIterable<CID>}
     */
    async *deleteMany(source, options = {}) {
      for await (const key of source) {
        await this.delete(key, options);
        yield key;
      }
    }
    /**
     * @returns {Batch}
     */
    batch() {
      let puts = [];
      let dels = [];
      return {
        put(key, value) {
          puts.push({ key, value });
        },
        delete(key) {
          dels.push(key);
        },
        commit: async (options) => {
          await drain(this.putMany(puts, options));
          puts = [];
          await drain(this.deleteMany(dels, options));
          dels = [];
        },
      };
    }
    /**
     * Extending classes should override `query` or implement this method
     *
     * @param {Query} q
     * @param {Options} [options]
     * @returns {AsyncIterable<Pair>}
     */
    // eslint-disable-next-line require-yield
    async *_all(q, options) {
      throw new Error('._all is not implemented');
    }
    /**
     * Extending classes should override `queryKeys` or implement this method
     *
     * @param {KeyQuery} q
     * @param {Options} [options]
     * @returns {AsyncIterable<CID>}
     */
    // eslint-disable-next-line require-yield
    async *_allKeys(q, options) {
      throw new Error('._allKeys is not implemented');
    }
    /**
     * @param {Query} q
     * @param {Options} [options]
     */
    query(q, options) {
      let it = this._all(q, options);
      if (q.prefix != null) {
        it = filter(it, (e) => e.key.toString().startsWith(q.prefix || ''));
      }
      if (Array.isArray(q.filters)) {
        it = q.filters.reduce((it2, f) => filter(it2, f), it);
      }
      if (Array.isArray(q.orders)) {
        it = q.orders.reduce((it2, f) => sortAll(it2, f), it);
      }
      if (q.offset != null) {
        let i = 0;
        it = filter(it, () => i++ >= (q.offset || 0));
      }
      if (q.limit != null) {
        it = take(it, q.limit);
      }
      return it;
    }
    /**
     * @param {KeyQuery} q
     * @param {Options} [options]
     */
    queryKeys(q, options) {
      let it = this._allKeys(q, options);
      if (q.prefix != null) {
        it = filter(it, (cid) => cid.toString().startsWith(q.prefix || ''));
      }
      if (Array.isArray(q.filters)) {
        it = q.filters.reduce((it2, f) => filter(it2, f), it);
      }
      if (Array.isArray(q.orders)) {
        it = q.orders.reduce((it2, f) => sortAll(it2, f), it);
      }
      if (q.offset != null) {
        let i = 0;
        it = filter(it, () => i++ >= /** @type {number} */ q.offset);
      }
      if (q.limit != null) {
        it = take(it, q.limit);
      }
      return it;
    }
  };

  // node_modules/blockstore-core/src/errors.js
  var import_err_code6 = __toESM(require_err_code(), 1);
  function notFoundError(err) {
    err = err || new Error('Not Found');
    return (0, import_err_code6.default)(err, 'ERR_NOT_FOUND');
  }

  // node_modules/blockstore-core/src/memory.js
  var MemoryBlockstore = class extends BaseBlockstore {
    constructor() {
      super();
      this.data = {};
    }
    open() {
      return Promise.resolve();
    }
    close() {
      return Promise.resolve();
    }
    /**
     * @param {CID} key
     * @param {Uint8Array} val
     */
    async put(key, val) {
      this.data[base32.encode(key.multihash.bytes)] = val;
    }
    /**
     * @param {CID} key
     */
    async get(key) {
      const exists2 = await this.has(key);
      if (!exists2) throw notFoundError();
      return this.data[base32.encode(key.multihash.bytes)];
    }
    /**
     * @param {CID} key
     */
    async has(key) {
      return this.data[base32.encode(key.multihash.bytes)] !== void 0;
    }
    /**
     * @param {CID} key
     */
    async delete(key) {
      delete this.data[base32.encode(key.multihash.bytes)];
    }
    async *_all() {
      yield* Object.entries(this.data).map(([key, value]) => ({
        key: CID.createV1(code2, decode3(base32.decode(key))),
        value,
      }));
    }
    async *_allKeys() {
      yield* Object.entries(this.data).map(([key]) =>
        CID.createV1(code2, decode3(base32.decode(key)))
      );
    }
  };
  return __toCommonJS(es_bundler_exports);
})();
