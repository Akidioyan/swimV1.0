import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { isBrowser, isQQbrowser } from '@tencent/qn-utils';
import { callOnce } from '../utils/index.js';
import { NetworkType } from '../constants/index.js';

// 分享结果 0-分享成功，1-options 参数错误，2-options.title 参数错误
var SHARE_RESULT = {
  ok: 0,
  optionsError: 1,
  titleError: 2
};

// 网络返回类型
var NETWORK_TYPE = {
  wifi: NetworkType.wifi,
  '2g': NetworkType.second,
  '3g': NetworkType.third,
  '4g': NetworkType.fourth
};

// qqbrowser sdk
var qqBrowserSDK = 'https://jsapi.qq.com/get?api=app.isInstallApk,app.getBrowserParam,app.openAppKeyWithCallback,app.openUrl,app.setShareInfo,connection.*';
var QQBrowser = /*#__PURE__*/function () {
  function QQBrowser() {
    var _window,
      _this = this;
    _classCallCheck(this, QQBrowser);
    _defineProperty(this, "isReady", false);
    _defineProperty(this, "isQQBrowser", false);
    _defineProperty(this, "readyListener", []);
    _defineProperty(this, "readyState", '');
    if (isBrowser() && typeof ((_window = window) === null || _window === void 0 ? void 0 : _window.browser) !== 'undefined') {
      this.isReady = true;
      return;
    }
    var callback = callOnce(function () {
      _this.isReady = true;
      while (_this.readyListener.length) {
        _this.readyListener.pop()();
      }
    });
    this.isQQBrowser = isQQbrowser();
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
  _createClass(QQBrowser, [{
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
      var _setShareInfo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(options) {
        var _ref, _ref$title, title, _ref$desc, desc, imgUrl;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
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
      var _getNetworkType = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
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

export { QQBrowser as default };
