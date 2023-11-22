// @ts-nocheck
// node_modules/micromodal/dist/micromodal.es.js
function e(e2, t2) {
  for (var o2 = 0; o2 < t2.length; o2++) {
    var n2 = t2[o2];
    (n2.enumerable = n2.enumerable || false),
      (n2.configurable = true),
      'value' in n2 && (n2.writable = true),
      Object.defineProperty(e2, n2.key, n2);
  }
}
function t(e2) {
  return (
    (function (e3) {
      if (Array.isArray(e3)) return o(e3);
    })(e2) ||
    (function (e3) {
      if ('undefined' != typeof Symbol && Symbol.iterator in Object(e3))
        return Array.from(e3);
    })(e2) ||
    (function (e3, t2) {
      if (!e3) return;
      if ('string' == typeof e3) return o(e3, t2);
      var n2 = Object.prototype.toString.call(e3).slice(8, -1);
      'Object' === n2 && e3.constructor && (n2 = e3.constructor.name);
      if ('Map' === n2 || 'Set' === n2) return Array.from(e3);
      if (
        'Arguments' === n2 ||
        /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)
      )
        return o(e3, t2);
    })(e2) ||
    (function () {
      throw new TypeError(
        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
      );
    })()
  );
}
function o(e2, t2) {
  (null == t2 || t2 > e2.length) && (t2 = e2.length);
  for (var o2 = 0, n2 = new Array(t2); o2 < t2; o2++) n2[o2] = e2[o2];
  return n2;
}
var n;
var i;
var a;
var r;
var s;
var l =
  ((n = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
    'select:not([disabled]):not([aria-hidden])',
    'textarea:not([disabled]):not([aria-hidden])',
    'button:not([disabled]):not([aria-hidden])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex^="-"])',
  ]),
  (i = (function () {
    function o2(e2) {
      var n2 = e2.targetModal,
        i3 = e2.triggers,
        a3 = void 0 === i3 ? [] : i3,
        r3 = e2.onShow,
        s2 = void 0 === r3 ? function () {} : r3,
        l2 = e2.onClose,
        c = void 0 === l2 ? function () {} : l2,
        d = e2.openTrigger,
        u = void 0 === d ? 'data-micromodal-trigger' : d,
        f = e2.closeTrigger,
        h = void 0 === f ? 'data-micromodal-close' : f,
        v = e2.openClass,
        g = void 0 === v ? 'is-open' : v,
        m = e2.disableScroll,
        b = void 0 !== m && m,
        y = e2.disableFocus,
        p = void 0 !== y && y,
        w = e2.awaitCloseAnimation,
        E = void 0 !== w && w,
        k = e2.awaitOpenAnimation,
        M = void 0 !== k && k,
        A = e2.debugMode,
        C = void 0 !== A && A;
      !(function (e3, t2) {
        if (!(e3 instanceof t2))
          throw new TypeError('Cannot call a class as a function');
      })(this, o2),
        (this.modal = document.getElementById(n2)),
        (this.config = {
          debugMode: C,
          disableScroll: b,
          openTrigger: u,
          closeTrigger: h,
          openClass: g,
          onShow: s2,
          onClose: c,
          awaitCloseAnimation: E,
          awaitOpenAnimation: M,
          disableFocus: p,
        }),
        a3.length > 0 && this.registerTriggers.apply(this, t(a3)),
        (this.onClick = this.onClick.bind(this)),
        (this.onKeydown = this.onKeydown.bind(this));
    }
    var i2, a2, r2;
    return (
      (i2 = o2),
      (a2 = [
        {
          key: 'registerTriggers',
          value: function () {
            for (
              var e2 = this, t2 = arguments.length, o3 = new Array(t2), n2 = 0;
              n2 < t2;
              n2++
            )
              o3[n2] = arguments[n2];
            o3.filter(Boolean).forEach(function (t3) {
              t3.addEventListener('click', function (t4) {
                return e2.showModal(t4);
              });
            });
          },
        },
        {
          key: 'showModal',
          value: function () {
            var e2 = this,
              t2 =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : null;
            if (
              ((this.activeElement = document.activeElement),
              this.modal.setAttribute('aria-hidden', 'false'),
              this.modal.classList.add(this.config.openClass),
              this.scrollBehaviour('disable'),
              this.addEventListeners(),
              this.config.awaitOpenAnimation)
            ) {
              var o3 = function t3() {
                e2.modal.removeEventListener('animationend', t3, false),
                  e2.setFocusToFirstNode();
              };
              this.modal.addEventListener('animationend', o3, false);
            } else this.setFocusToFirstNode();
            this.config.onShow(this.modal, this.activeElement, t2);
          },
        },
        {
          key: 'closeModal',
          value: function () {
            var e2 =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : null,
              t2 = this.modal;
            if (
              (this.modal.setAttribute('aria-hidden', 'true'),
              this.removeEventListeners(),
              this.scrollBehaviour('enable'),
              this.activeElement &&
                this.activeElement.focus &&
                this.activeElement.focus(),
              this.config.onClose(this.modal, this.activeElement, e2),
              this.config.awaitCloseAnimation)
            ) {
              var o3 = this.config.openClass;
              this.modal.addEventListener(
                'animationend',
                function e3() {
                  t2.classList.remove(o3),
                    t2.removeEventListener('animationend', e3, false);
                },
                false
              );
            } else t2.classList.remove(this.config.openClass);
          },
        },
        {
          key: 'closeModalById',
          value: function (e2) {
            (this.modal = document.getElementById(e2)),
              this.modal && this.closeModal();
          },
        },
        {
          key: 'scrollBehaviour',
          value: function (e2) {
            if (this.config.disableScroll) {
              var t2 = document.querySelector('body');
              switch (e2) {
                case 'enable':
                  Object.assign(t2.style, { overflow: '' });
                  break;
                case 'disable':
                  Object.assign(t2.style, { overflow: 'hidden' });
              }
            }
          },
        },
        {
          key: 'addEventListeners',
          value: function () {
            this.modal.addEventListener('touchstart', this.onClick),
              this.modal.addEventListener('click', this.onClick),
              document.addEventListener('keydown', this.onKeydown);
          },
        },
        {
          key: 'removeEventListeners',
          value: function () {
            this.modal.removeEventListener('touchstart', this.onClick),
              this.modal.removeEventListener('click', this.onClick),
              document.removeEventListener('keydown', this.onKeydown);
          },
        },
        {
          key: 'onClick',
          value: function (e2) {
            (e2.target.hasAttribute(this.config.closeTrigger) ||
              e2.target.parentNode.hasAttribute(this.config.closeTrigger)) &&
              (e2.preventDefault(), e2.stopPropagation(), this.closeModal(e2));
          },
        },
        {
          key: 'onKeydown',
          value: function (e2) {
            27 === e2.keyCode && this.closeModal(e2),
              9 === e2.keyCode && this.retainFocus(e2);
          },
        },
        {
          key: 'getFocusableNodes',
          value: function () {
            var e2 = this.modal.querySelectorAll(n);
            return Array.apply(void 0, t(e2));
          },
        },
        {
          key: 'setFocusToFirstNode',
          value: function () {
            var e2 = this;
            if (!this.config.disableFocus) {
              var t2 = this.getFocusableNodes();
              if (0 !== t2.length) {
                var o3 = t2.filter(function (t3) {
                  return !t3.hasAttribute(e2.config.closeTrigger);
                });
                o3.length > 0 && o3[0].focus(),
                  0 === o3.length && t2[0].focus();
              }
            }
          },
        },
        {
          key: 'retainFocus',
          value: function (e2) {
            var t2 = this.getFocusableNodes();
            if (0 !== t2.length)
              if (
                ((t2 = t2.filter(function (e3) {
                  return null !== e3.offsetParent;
                })),
                this.modal.contains(document.activeElement))
              ) {
                var o3 = t2.indexOf(document.activeElement);
                e2.shiftKey &&
                  0 === o3 &&
                  (t2[t2.length - 1].focus(), e2.preventDefault()),
                  !e2.shiftKey &&
                    t2.length > 0 &&
                    o3 === t2.length - 1 &&
                    (t2[0].focus(), e2.preventDefault());
              } else t2[0].focus();
          },
        },
      ]) && e(i2.prototype, a2),
      r2 && e(i2, r2),
      o2
    );
  })()),
  (a = null),
  (r = function (e2) {
    if (!document.getElementById(e2))
      return (
        console.warn(
          "MicroModal: \u2757Seems like you have missed %c'".concat(e2, "'"),
          'background-color: #f8f9fa;color: #50596c;font-weight: bold;',
          'ID somewhere in your code. Refer example below to resolve it.'
        ),
        console.warn(
          '%cExample:',
          'background-color: #f8f9fa;color: #50596c;font-weight: bold;',
          '<div class="modal" id="'.concat(e2, '"></div>')
        ),
        false
      );
  }),
  (s = function (e2, t2) {
    if (
      ((function (e3) {
        e3.length <= 0 &&
          (console.warn(
            "MicroModal: \u2757Please specify at least one %c'micromodal-trigger'",
            'background-color: #f8f9fa;color: #50596c;font-weight: bold;',
            'data attribute.'
          ),
          console.warn(
            '%cExample:',
            'background-color: #f8f9fa;color: #50596c;font-weight: bold;',
            '<a href="#" data-micromodal-trigger="my-modal"></a>'
          ));
      })(e2),
      !t2)
    )
      return true;
    for (var o2 in t2) r(o2);
    return true;
  }),
  {
    init: function (e2) {
      var o2 = Object.assign(
          {},
          { openTrigger: 'data-micromodal-trigger' },
          e2
        ),
        n2 = t(document.querySelectorAll('['.concat(o2.openTrigger, ']'))),
        r2 = (function (e3, t2) {
          var o3 = [];
          return (
            e3.forEach(function (e4) {
              var n3 = e4.attributes[t2].value;
              void 0 === o3[n3] && (o3[n3] = []), o3[n3].push(e4);
            }),
            o3
          );
        })(n2, o2.openTrigger);
      if (true !== o2.debugMode || false !== s(n2, r2))
        for (var l2 in r2) {
          var c = r2[l2];
          (o2.targetModal = l2), (o2.triggers = t(c)), (a = new i(o2));
        }
    },
    show: function (e2, t2) {
      var o2 = t2 || {};
      (o2.targetModal = e2),
        (true === o2.debugMode && false === r(e2)) ||
          (a && a.removeEventListeners(), (a = new i(o2)).showModal());
    },
    close: function (e2) {
      e2 ? a.closeModalById(e2) : a.closeModal();
    },
  });
'undefined' != typeof window && (window.MicroModal = l);
var micromodal_es_default = l;

// esbuilder/lit-connect-modal/src/modal.css
var modal_default =
  '.modal {\n  font-family: -apple-system,BlinkMacSystemFont,avenir next,avenir,helvetica neue,helvetica,ubuntu,roboto,noto,segoe ui,arial,sans-serif;\n}\n\n.lcm-modal-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: rgba(0,0,0,0.6);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  z-index: 12;\n}\n\n.lcm-modal-container {\n  border: 1px solid rgba(129, 89, 217, 1);\n  background-color: #fff;\n  padding: 0 1.5rem;\n  max-width: 500px;\n  max-height: 100vh;\n  border-radius: 0.25rem;\n  overflow-y: auto;\n  box-sizing: border-box;\n}\n\n.lcm-modal-content {\n  margin-top: 2rem;\n  margin-bottom: 2rem;\n  line-height: 1.5;\n  color: rgba(0,0,0,.8);\n}\n\n.lcm-wallet-container {\n  display: flex;\n  align-items: center;\n  margin: 2rem 0.5rem;\n  transition-duration: 0.2s;\n  border-radius: 0.25rem;\n  padding: 2rem;\n  cursor: pointer;\n}\n\n.lcm-wallet-container:hover {\n  background-color: #d4d4d4;\n}\n\n.lcm-wallet-logo {\n  height: 2.5rem;\n  width: 3.75rem;\n  margin-right: 1.5rem;\n}\n\n.lcm-text-column {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n}\n\n.lcm-wallet-name {\n  font-weight: bold;\n  font-size: 1.2rem;\n  margin: 0;\n}\n\n.lcm-wallet-synopsis {\n  color: #777;\n  font-size: 0.9rem;\n  margin: 0;\n}\n\n\n@keyframes mmfadeIn {\n    from { opacity: 0; }\n      to { opacity: 1; }\n}\n\n@keyframes mmfadeOut {\n    from { opacity: 1; }\n      to { opacity: 0; }\n}\n\n@keyframes mmslideIn {\n  from { transform: translateY(15%); }\n    to { transform: translateY(0); }\n}\n\n@keyframes mmslideOut {\n    from { transform: translateY(0); }\n    to { transform: translateY(-10%); }\n}\n\n.micromodal-slide {\n  display: none;\n}\n\n.micromodal-slide.is-open {\n  display: block;\n}\n\n.micromodal-slide[aria-hidden="false"] .lcm-modal-overlay {\n  animation: mmfadeIn .3s cubic-bezier(0.0, 0.0, 0.2, 1);\n}\n\n.micromodal-slide[aria-hidden="false"] .lcm-modal-container {\n  animation: mmslideIn .3s cubic-bezier(0, 0, .2, 1);\n}\n\n.micromodal-slide[aria-hidden="true"] .lcm-modal-overlay {\n  animation: mmfadeOut .3s cubic-bezier(0.0, 0.0, 0.2, 1);\n}\n\n.micromodal-slide[aria-hidden="true"] .lcm-modal-container {\n  animation: mmslideOut .3s cubic-bezier(0, 0, .2, 1);\n}\n\n.micromodal-slide .lcm-modal-container,\n.micromodal-slide .lcm-modal-overlay {\n  will-change: transform;\n}\n';

// esbuilder/lit-connect-modal/src/logos/metamask.svg
var metamask_default =
  'data:image/svg+xml,<svg height="355" viewBox="0 0 397 355" width="397" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" transform="translate(-1 -1)"><path d="m114.622644 327.195472 52.004717 13.810198v-18.05949l4.245283-4.249292h29.716982v21.246459 14.872523h-31.839624l-39.268868-16.997169z" fill="%23cdbdb2"/><path d="m199.528305 327.195472 50.943397 13.810198v-18.05949l4.245283-4.249292h29.716981v21.246459 14.872523h-31.839623l-39.268868-16.997169z" fill="%23cdbdb2" transform="matrix(-1 0 0 1 483.96227 0)"/><path d="m170.872644 287.889523-4.245283 35.056657 5.306604-4.249292h55.18868l6.367925 4.249292-4.245284-35.056657-8.490565-5.311615-42.452832 1.062323z" fill="%23393939"/><path d="m142.216984 50.9915022 25.471698 59.4900858 11.674528 173.158643h41.391511l12.735849-173.158643 23.349056-59.4900858z" fill="%23f89c35"/><path d="m30.7783023 181.657226-29.71698153 86.048161 74.29245393-4.249293h47.7594343v-37.181303l-2.122641-76.487253-10.613208 8.498583z" fill="%23f89d35"/><path d="m87.0283032 191.218134 87.0283028 2.124646-9.551886 44.617563-41.391511-10.623229z" fill="%23d87c30"/><path d="m87.0283032 192.280457 36.0849058 33.994334v33.994334z" fill="%23ea8d3a"/><path d="m123.113209 227.337114 42.452831 10.623229 13.79717 45.679888-9.551886 5.311615-46.698115-27.620398z" fill="%23f89d35"/><path d="m123.113209 261.331448-8.490565 65.864024 56.25-39.305949z" fill="%23eb8f35"/><path d="m174.056606 193.34278 5.306604 90.297451-15.919812-46.211049z" fill="%23ea8e3a"/><path d="m74.2924539 262.393771 48.8207551-1.062323-8.490565 65.864024z" fill="%23d87c30"/><path d="m24.4103777 355.878193 90.2122663-28.682721-40.3301901-64.801701-73.23113313 5.311616z" fill="%23eb8f35"/><path d="m167.688682 110.481588-45.636793 38.243627-35.0235858 42.492919 87.0283028 3.186969z" fill="%23e8821e"/><path d="m114.622644 327.195472 56.25-39.305949-4.245283 33.994334v19.121813l-38.207548-7.43626z" fill="%23dfcec3"/><path d="m229.245286 327.195472 55.18868-39.305949-4.245283 33.994334v19.121813l-38.207548-7.43626z" fill="%23dfcec3" transform="matrix(-1 0 0 1 513.679252 0)"/><path d="m132.665096 212.464593-11.674528 24.433427 41.39151-10.623229z" fill="%23393939" transform="matrix(-1 0 0 1 283.372646 0)"/><path d="m23.349057 1.06232296 144.339625 109.41926504-24.410378-59.4900858z" fill="%23e88f35"/><path d="m23.349057 1.06232296-19.10377392 58.42776294 10.61320772 63.7393781-7.42924541 4.249292 10.61320771 9.560906-8.49056617 7.436261 11.67452847 10.623229-7.4292454 6.373938 16.9811323 21.246459 79.5990577-24.433428c38.915096-31.161473 58.018869-47.096318 57.311322-47.804533-.707548-.708215-48.820756-37.1813036-144.339625-109.41926504z" fill="%238e5a30"/><g transform="matrix(-1 0 0 1 399.056611 0)"><path d="m30.7783023 181.657226-29.71698153 86.048161 74.29245393-4.249293h47.7594343v-37.181303l-2.122641-76.487253-10.613208 8.498583z" fill="%23f89d35"/><path d="m87.0283032 191.218134 87.0283028 2.124646-9.551886 44.617563-41.391511-10.623229z" fill="%23d87c30"/><path d="m87.0283032 192.280457 36.0849058 33.994334v33.994334z" fill="%23ea8d3a"/><path d="m123.113209 227.337114 42.452831 10.623229 13.79717 45.679888-9.551886 5.311615-46.698115-27.620398z" fill="%23f89d35"/><path d="m123.113209 261.331448-8.490565 65.864024 55.18868-38.243626z" fill="%23eb8f35"/><path d="m174.056606 193.34278 5.306604 90.297451-15.919812-46.211049z" fill="%23ea8e3a"/><path d="m74.2924539 262.393771 48.8207551-1.062323-8.490565 65.864024z" fill="%23d87c30"/><path d="m24.4103777 355.878193 90.2122663-28.682721-40.3301901-64.801701-73.23113313 5.311616z" fill="%23eb8f35"/><path d="m167.688682 110.481588-45.636793 38.243627-35.0235858 42.492919 87.0283028 3.186969z" fill="%23e8821e"/><path d="m132.665096 212.464593-11.674528 24.433427 41.39151-10.623229z" fill="%23393939" transform="matrix(-1 0 0 1 283.372646 0)"/><path d="m23.349057 1.06232296 144.339625 109.41926504-24.410378-59.4900858z" fill="%23e88f35"/><path d="m23.349057 1.06232296-19.10377392 58.42776294 10.61320772 63.7393781-7.42924541 4.249292 10.61320771 9.560906-8.49056617 7.436261 11.67452847 10.623229-7.4292454 6.373938 16.9811323 21.246459 79.5990577-24.433428c38.915096-31.161473 58.018869-47.096318 57.311322-47.804533-.707548-.708215-48.820756-37.1813036-144.339625-109.41926504z" fill="%238e5a30"/></g></g></svg>';

// esbuilder/lit-connect-modal/src/logos/coinbase.svg
var coinbase_default =
  'data:image/svg+xml,<?xml version="1.0" encoding="utf-8"?>%0A<!-- Generator: Adobe Illustrator 24.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->%0A<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"%0A%09 viewBox="0 0 1101.64 196.79" style="enable-background:new 0 0 1101.64 196.79;" xml:space="preserve">%0A<style type="text/css">%0A%09.st0{fill:%230052FF;}%0A</style>%0A<path class="st0" d="M222.34,54.94c-40.02,0-71.29,30.38-71.29,71.05s30.48,70.79,71.29,70.79c40.81,0,71.82-30.64,71.82-71.05%0A%09C294.16,85.58,263.68,54.94,222.34,54.94z M222.61,167.47c-22.79,0-39.49-17.7-39.49-41.47c0-24.04,16.43-41.73,39.22-41.73%0A%09c23.06,0,39.75,17.96,39.75,41.73S245.4,167.47,222.61,167.47z M302.9,85.85h19.88v108.3h31.8V57.58H302.9V85.85z M71.02,84.26%0A%09c16.7,0,29.95,10.3,34.98,25.62h33.66c-6.1-32.75-33.13-54.94-68.37-54.94C31.27,54.94,0,85.32,0,126s30.48,70.79,71.29,70.79%0A%09c34.45,0,62.01-22.19,68.11-55.21H106c-4.77,15.32-18.02,25.89-34.72,25.89c-23.06,0-39.22-17.7-39.22-41.47%0A%09C32.07,101.96,47.97,84.26,71.02,84.26z M907.12,112.79l-23.32-3.43c-11.13-1.58-19.08-5.28-19.08-14%0A%09c0-9.51,10.34-14.26,24.38-14.26c15.37,0,25.18,6.6,27.3,17.43h30.74c-3.45-27.47-24.65-43.58-57.24-43.58%0A%09c-33.66,0-55.92,17.17-55.92,41.47c0,23.24,14.58,36.72,43.99,40.94l23.32,3.43c11.4,1.58,17.76,6.08,17.76,14.53%0A%09c0,10.83-11.13,15.32-26.5,15.32c-18.82,0-29.42-7.66-31.01-19.28h-31.27c2.92,26.68,23.85,45.43,62.01,45.43%0A%09c34.72,0,57.77-15.85,57.77-43.06C950.05,129.43,933.36,116.75,907.12,112.79z M338.68,1.32c-11.66,0-20.41,8.45-20.41,20.07%0A%09s8.74,20.07,20.41,20.07c11.66,0,20.41-8.45,20.41-20.07S350.34,1.32,338.68,1.32z M805.36,104.34c0-29.58-18.02-49.39-56.18-49.39%0A%09c-36.04,0-56.18,18.23-60.16,46.23h31.54c1.59-10.83,10.07-19.81,28.09-19.81c16.17,0,24.12,7.13,24.12,15.85%0A%09c0,11.36-14.58,14.26-32.6,16.11c-24.38,2.64-54.59,11.09-54.59,42.79c0,24.57,18.29,40.41,47.44,40.41%0A%09c22.79,0,37.1-9.51,44.26-24.57c1.06,13.47,11.13,22.19,25.18,22.19h18.55v-28.26h-15.64V104.34z M774.09,138.68%0A%09c0,18.23-15.9,31.7-35.25,31.7c-11.93,0-22-5.02-22-15.58c0-13.47,16.17-17.17,31.01-18.75c14.31-1.32,22.26-4.49,26.24-10.57%0A%09V138.68z M605.28,54.94c-17.76,0-32.6,7.4-43.2,19.81V0h-31.8v194.15h31.27v-17.96c10.6,12.94,25.71,20.6,43.73,20.6%0A%09c38.16,0,67.05-30.11,67.05-70.79S642.91,54.94,605.28,54.94z M600.51,167.47c-22.79,0-39.49-17.7-39.49-41.47%0A%09s16.96-41.73,39.75-41.73c23.06,0,39.22,17.7,39.22,41.73C639.99,149.77,623.3,167.47,600.51,167.47z M454.22,54.94%0A%09c-20.67,0-34.19,8.45-42.14,20.34v-17.7h-31.54v136.56h31.8v-74.22c0-20.87,13.25-35.66,32.86-35.66c18.29,0,29.68,12.94,29.68,31.7%0A%09v78.19h31.8v-80.56C506.69,79.24,488.94,54.94,454.22,54.94z M1101.64,121.51c0-39.09-28.62-66.56-67.05-66.56%0A%09c-40.81,0-70.76,30.64-70.76,71.05c0,42.53,32.07,70.79,71.29,70.79c33.13,0,59.1-19.55,65.72-47.28h-33.13%0A%09c-4.77,12.15-16.43,19.02-32.07,19.02c-20.41,0-35.78-12.68-39.22-34.87h105.21V121.51z M998.28,110.94%0A%09c5.04-19.02,19.35-28.26,35.78-28.26c18.02,0,31.8,10.3,34.98,28.26H998.28z"/>%0A</svg>%0A';

// esbuilder/lit-connect-modal/src/logos/walletconnect.svg
var walletconnect_default =
  'data:image/svg+xml,<svg height="246" viewBox="0 0 400 246" width="400" xmlns="http://www.w3.org/2000/svg"><path d="m81.9180572 48.3416816c65.2149658-63.8508884 170.9493158-63.8508884 236.1642788 0l7.848727 7.6845565c3.260748 3.1925442 3.260748 8.3686816 0 11.5612272l-26.848927 26.2873374c-1.630375 1.5962734-4.273733 1.5962734-5.904108 0l-10.800779-10.5748639c-45.495589-44.5439756-119.258514-44.5439756-164.754105 0l-11.566741 11.3248068c-1.630376 1.5962721-4.273735 1.5962721-5.904108 0l-26.8489263-26.2873375c-3.2607483-3.1925456-3.2607483-8.3686829 0-11.5612272zm291.6903948 54.3649934 23.895596 23.395862c3.260732 3.19253 3.260751 8.368636.000041 11.561187l-107.746894 105.494845c-3.260726 3.192568-8.547443 3.192604-11.808214.000083-.000013-.000013-.000029-.000029-.000042-.000043l-76.472191-74.872762c-.815187-.798136-2.136867-.798136-2.952053 0-.000006.000005-.00001.00001-.000015.000014l-76.470562 74.872708c-3.260715 3.192576-8.547434 3.19263-11.808215.000116-.000019-.000018-.000039-.000037-.000059-.000058l-107.74989297-105.496247c-3.26074695-3.192544-3.26074695-8.368682 0-11.561226l23.89563947-23.395823c3.260747-3.1925446 8.5474652-3.1925446 11.8082136 0l76.4733029 74.873809c.815188.798136 2.136866.798136 2.952054 0 .000012-.000012.000023-.000023.000035-.000032l76.469471-74.873777c3.260673-3.1926181 8.547392-3.1927378 11.808214-.000267.000046.000045.000091.00009.000135.000135l76.473203 74.873909c.815186.798135 2.136866.798135 2.952053 0l76.471967-74.872433c3.260748-3.1925458 8.547465-3.1925458 11.808213 0z" fill="%233b99fc"/></svg>';

// esbuilder/lit-connect-modal/src/helpers/walletList.js
var metaMaskSingle = {
  htmlId: 'lcm-metaMask',
  id: 'metamask',
  logo: metamask_default,
  name: 'MetaMask',
  provider: globalThis.ethereum,
  synopsis: 'Connect your MetaMask Wallet',
  checkIfPresent: () => {
    if (
      typeof globalThis.ethereum !== 'undefined' &&
      globalThis.ethereum.isMetaMask
    ) {
      return true;
    } else {
      return false;
    }
  },
};
var coinbaseSingle = {
  htmlId: 'lcm-coinbase',
  id: 'coinbase',
  logo: coinbase_default,
  name: 'Coinbase',
  provider: globalThis.ethereum,
  synopsis: 'Connect your Coinbase Wallet',
  checkIfPresent: () => {
    if (
      typeof globalThis.ethereum !== 'undefined' &&
      globalThis.ethereum.isCoinbaseWallet
    ) {
      return true;
    } else {
      return false;
    }
  },
};
var rawListOfWalletsArray = [
  {
    htmlId: 'lcm-metaMask',
    id: 'metamask',
    logo: metamask_default,
    name: 'MetaMask',
    provider: globalThis.ethereum?.providers?.find((p) => p.isMetaMask),
    synopsis: 'Connect your MetaMask Wallet',
    checkIfPresent: () => {
      return !!globalThis.ethereum?.providers?.find((p) => p.isMetaMask);
    },
  },
  {
    htmlId: 'lcm-coinbase',
    id: 'coinbase',
    logo: coinbase_default,
    name: 'Coinbase',
    provider: globalThis.ethereum?.providers?.find((p) => p.isCoinbaseWallet),
    synopsis: 'Connect your Coinbase Wallet',
    checkIfPresent: () => {
      return !!globalThis.ethereum?.providers?.find((p) => p.isCoinbaseWallet);
    },
  },
  {
    htmlId: 'lcm-walletConnect',
    id: 'walletconnect',
    logo: walletconnect_default,
    name: 'WalletConnect',
    provider: null,
    synopsis: 'Scan with WalletConnect to connect',
  },
];

// esbuilder/lit-connect-modal/src/helpers/providerMethods.js
var providerMethods = {
  walletconnect: (providerOptions, id) => {
    const walletConnectData = providerOptions.walletconnect;
    const walletConnectProvider = walletConnectData.provider;
    return walletConnectProvider;
  },
};
var providerMethods_default = providerMethods;

// esbuilder/lit-connect-modal/src/modal.js
var LitConnectModal = class {
  constructor({ providerOptions }) {
    this.dialog = micromodal_es_default;
    this.closeAction = void 0;
    this.parent = document.body;
    this.filteredListOfWalletsArray = [];
    this.providerOptions = providerOptions;
    this._filterListOfWallets();
    this._instantiateLitConnectModal();
    var style = document.createElement('style');
    style.innerHTML = modal_default;
    document.head.appendChild(style);
  }
  getWalletProvider() {
    const currentProvider = localStorage.getItem('lit-web3-provider');
    this.dialog.show('lit-connect-modal');
    return new Promise((resolve, reject) => {
      if (!!currentProvider) {
        const foundProvider = this.filteredListOfWalletsArray.find(
          (w) => w.id === currentProvider
        );
        resolve(foundProvider.provider);
        this._destroy();
        return;
      }
      this.filteredListOfWalletsArray.forEach((w) => {
        let walletEntry = document.getElementById(w.id);
        walletEntry.addEventListener('click', () => {
          localStorage.setItem('lit-web3-provider', w.id);
          resolve(w.provider);
          this._destroy();
          return;
        });
      });
      this.closeAction.addEventListener('click', () => {
        resolve(false);
        this._destroy();
        return;
      });
    });
  }
  _filterListOfWallets() {
    const filteredListOfWalletsArray = [];
    rawListOfWalletsArray.forEach((w) => {
      if (!!w['checkIfPresent'] && w['checkIfPresent']() === true) {
        filteredListOfWalletsArray.push(w);
      }
    });
    if (filteredListOfWalletsArray.length === 0) {
      if (globalThis.ethereum) {
        if (globalThis.ethereum.isMetaMask) {
          filteredListOfWalletsArray.push(metaMaskSingle);
        }
        if (globalThis.ethereum.isCoinbaseWallet) {
          filteredListOfWalletsArray.push(coinbaseSingle);
        }
      }
    }
    if (!!this.providerOptions['walletconnect']) {
      const cloneWalletInfo = rawListOfWalletsArray.find(
        (w) => w.id === 'walletconnect'
      );
      cloneWalletInfo['provider'] = providerMethods_default['walletconnect'](
        this.providerOptions,
        'walletconnect'
      );
      filteredListOfWalletsArray.push(cloneWalletInfo);
    }
    if (filteredListOfWalletsArray.length === 0) {
      alert('No wallets installed or provided.');
      throw new Error('No wallets installed or provided.');
    }
    this.filteredListOfWalletsArray = filteredListOfWalletsArray;
  }
  _instantiateLitConnectModal() {
    const connectModal = document.createElement('div');
    connectModal.setAttribute('id', 'lit-connect-modal-container');
    connectModal.innerHTML = `
        <div class="modal micromodal-slide" id="lit-connect-modal" aria-hidden="true">
            <div class="lcm-modal-overlay" id="lcm-modal-overlay" tabindex="-1" data-micromodal-close>
                <div class="lcm-modal-container" role="dialog" aria-modal="true" aria-labelledby="lit-connect-modal-title">
                    <main class="lcm-modal-content" id="lit-connect-modal-content">
                    </main>
                </div>
            </div>
        </div>
    `;
    this.parent.appendChild(connectModal);
    Object.assign(this, {
      trueButton: document.getElementById('lcm-continue-button'),
      closeAction: document.getElementById('lcm-modal-overlay'),
    });
    this._buildListOfWallets();
    this.dialog.init({
      disableScroll: true,
      disableFocus: false,
      awaitOpenAnimation: false,
      awaitCloseAnimation: false,
      debugMode: false,
    });
  }
  _buildListOfWallets() {
    const contentContainer = document.getElementById(
      'lit-connect-modal-content'
    );
    let walletListHtml = ``;
    this.filteredListOfWalletsArray.forEach((w) => {
      walletListHtml += `
        <div class="lcm-wallet-container" id="${w.id}">
          <img class="lcm-wallet-logo"  src='${w.logo}' />
          <div class="lcm-text-column">
            <p class="lcm-wallet-name" >${w.name}</p>
            <p class="lcm-wallet-synopsis" >${w.synopsis}</p>
          </div>
        </div>
      `;
    });
    contentContainer.innerHTML = walletListHtml;
  }
  _destroy() {
    const dialog = document.getElementById('lit-connect-modal-container');
    if (!!dialog) {
      dialog.remove();
    }
  }
};
export { LitConnectModal as default };
