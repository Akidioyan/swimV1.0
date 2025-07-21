'use strict';

var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var qnUtils = require('@tencent/qn-utils');
var index$1 = require('../utils/index.js');
var index = require('../constants/index.js');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultCompat(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultCompat(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultCompat(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultCompat(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultCompat(_regeneratorRuntime);

// 分享结果 0-分享成功，1-options 参数错误，2-options.title 参数错误
var SHARE_RESULT = {
  ok: 0,
  optionsError: 1,
  titleError: 2
};

// 网络返回类型
var NETWORK_TYPE = {
  wifi: index.NetworkType.wifi,
  '2g': index.NetworkType.second,
  '3g': index.NetworkType.third,
  '4g': index.NetworkType.fourth
};

// qqbrowser sdk
var qqBrowserSDK = 'https://jsapi.qq.com/get?api=app.isInstallApk,app.getBrowserParam,app.openAppKeyWithCallback,app.openUrl,app.setShareInfo,connection.*';
var QQBrowser = /*#__PURE__*/function () {
  function QQBrowser() {
    var _window,
      _this = this;
    _classCallCheck__default.default(this, QQBrowser);
    _defineProperty__default.default(this, "isReady", false);
    _defineProperty__default.default(this, "isQQBrowser", false);
    _defineProperty__default.default(this, "readyListener", []);
    _defineProperty__default.default(this, "readyState", '');
    if (qnUtils.isBrowser() && typeof ((_window = window) === null || _window === void 0 ? void 0 : _window.browser) !== 'undefined') {
      this.isReady = true;
      return;
    }
    var callback = index$1.callOnce(function () {
      _this.isReady = true;
      while (_this.readyListener.length) {
        _this.readyListener.pop()();
      }
    });
    this.isQQBrowser = qnUtils.isQQbrowser();
    if (this.isQQBrowser) {
      var script = document.createElement('script');
      script.src = qqBrowserSDK;
      script.async = true;
      script.onload = callback;
      script.onreadystatechange = function () {
        if (_this.readyState === 'complete') {
          callback();
        }
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }
  _createClass__default.default(QQBrowser, [{
    key: "ready",
    value: function ready() {
      var _this2 = this;
      if (typeof window === 'undefined') {
        return Promise.reject(new Error('window not found'));
      }
      if (this.isReady) {
        return Promise.resolve(this);
      }
      if (!this.isQQBrowser) {
        return Promise.reject(new Error('not qqbrowser user-agent'));
      }
      return new Promise(function (resolve) {
        _this2.readyListener.push(function () {
          return resolve(_this2);
        });
      });
    }

    /**
     * 设置分享信息
     * @param options
     * @returns`
     */
  }, {
    key: "setShareInfo",
    value: (function () {
      var _setShareInfo = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee(options) {
        var _ref, _ref$title, title, _ref$desc, desc, imgUrl;
        return _regeneratorRuntime__default.default.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.ready();
            case 2:
              _ref = options || {}, _ref$title = _ref.title, title = _ref$title === void 0 ? '' : _ref$title, _ref$desc = _ref.desc, desc = _ref$desc === void 0 ? '' : _ref$desc, imgUrl = _ref.imgUrl;
              return _context.abrupt("return", new Promise(function (resolve, rejects) {
                try {
                  var _window$browser;
                  (_window$browser = window.browser) === null || _window$browser === void 0 || (_window$browser = _window$browser.app) === null || _window$browser === void 0 || _window$browser.setShareInfo({
                    title: title,
                    url: document.location.href,
                    description: desc,
                    img_url: imgUrl
                  }, function (_ref2) {
                    var code = _ref2.code,
                      msg = _ref2.msg;
                    if (code === SHARE_RESULT.ok) {
                      resolve({
                        msg: msg
                      });
                    } else {
                      rejects(new Error('qqbrowser share fail'));
                    }
                  });
                } catch (error) {
                  rejects(error);
                }
              }));
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function setShareInfo(_x) {
        return _setShareInfo.apply(this, arguments);
      }
      return setShareInfo;
    }()
    /**
     * 获取网络状态
     * @returns
     */
    )
  }, {
    key: "getNetworkType",
    value: (function () {
      var _getNetworkType = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee2() {
        return _regeneratorRuntime__default.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.ready();
            case 2:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                try {
                  var _window2;
                  (_window2 = window) === null || _window2 === void 0 || (_window2 = _window2.browser) === null || _window2 === void 0 || (_window2 = _window2.connection) === null || _window2 === void 0 || _window2.getType(function (states) {
                    var type = NETWORK_TYPE[states] || 'Unknown';
                    resolve(type);
                  });
                } catch (error) {
                  reject(error);
                }
              }));
            case 3:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function getNetworkType() {
        return _getNetworkType.apply(this, arguments);
      }
      return getNetworkType;
    }())
  }]);
  return QQBrowser;
}();

module.exports = QQBrowser;
