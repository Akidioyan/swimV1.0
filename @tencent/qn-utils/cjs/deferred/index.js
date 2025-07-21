'use strict';

var _createClass = require('@babel/runtime/helpers/createClass');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _createClass__default = /*#__PURE__*/_interopDefaultCompat(_createClass);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultCompat(_classCallCheck);

/**
 * 拆解Promise构造函数，使Promise对象、resolve方法、reject方法可以分开使用
 * 方便异步场景，例如确保js bridge是否成功注入
 * @example
 * ```ts
 * const d = new Deferred();
 * function onJsBridgeReady() { d.resolve() }
 * async function jsBridgeCall() {
 *   await d.promise;
 *   // Do js bridge call here
 * }
 * ```
 */
var Deferred = /*#__PURE__*/_createClass__default.default(function Deferred(options) {
  var _this = this;
  _classCallCheck__default.default(this, Deferred);
  var _ref = options || {},
    timeout = _ref.timeout,
    _ref$timeoutError = _ref.timeoutError,
    timeoutError = _ref$timeoutError === void 0 ? {
      code: -1,
      message: 'timeout'
    } : _ref$timeoutError;
  var timer;
  this.promise = new Promise(function (innerResolve, innerReject) {
    _this.resolve = function (v) {
      timer && clearTimeout(timer);
      innerResolve(v);
    };
    _this.reject = innerReject;
    // 如果设置了超时时间
    if (timeout) {
      timer = setTimeout(function () {
        // 超时reject
        innerReject(timeoutError);
      }, timeout);
    }
  });
});

module.exports = Deferred;
