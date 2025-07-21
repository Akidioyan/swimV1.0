'use strict';

var _asyncToGenerator = require('@babel/runtime/helpers/asyncToGenerator');
var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var _regeneratorRuntime = require('@babel/runtime/regenerator');
var qnUtils = require('@tencent/qn-utils');
var index$1 = require('../utils/index.js');
var index = require('../constants/index.js');
var _interface = require('../interface.js');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultCompat(_asyncToGenerator);
var _classCallCheck__default = /*#__PURE__*/_interopDefaultCompat(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultCompat(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultCompat(_defineProperty);
var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultCompat(_regeneratorRuntime);

// amap sdk
var SDK = 'https://cache.amap.com/h5/h5/amapLib.1.1.2.js';
var Amap = /*#__PURE__*/function () {
  function Amap() {
    var _window,
      _this = this;
    _classCallCheck__default.default(this, Amap);
    _defineProperty__default.default(this, "isReady", false);
    _defineProperty__default.default(this, "isAmap", false);
    _defineProperty__default.default(this, "readyListener", []);
    _defineProperty__default.default(this, "readyState", '');
    // 已经挂载的情况
    if (qnUtils.isBrowser() && typeof ((_window = window) === null || _window === void 0 ? void 0 : _window.AmapApp) !== 'undefined') {
      this.isReady = true;
      return;
    }
    var callback = index$1.callOnce(function () {
      _this.isReady = true;
      while (_this.readyListener.length) {
        _this.readyListener.pop()();
      }
    });
    this.isAmap = qnUtils.isAmap();
    if (this.isAmap) {
      var script = document.createElement('script');
      script.src = SDK;
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
  _createClass__default.default(Amap, [{
    key: "ready",
    value: function ready() {
      var _this2 = this;
      if (typeof window === 'undefined') {
        return Promise.reject(new Error('window not found'));
      }
      if (this.isReady) {
        return Promise.resolve(this);
      }
      if (!this.isAmap) {
        return Promise.reject(new Error('not amap user-agent'));
      }
      return new Promise(function (resolve) {
        _this2.readyListener.push(function () {
          return resolve(_this2);
        });
      });
    }

    /**
     * 使用高德的 JSAPI 设置分享信息， 仅在高德 App 中起作用
     *
     * @param {string} options.title 分享标题
     * @param {string} options.desc 分享副标题
     * @param {string} options.imgUrl 分享图片
     * @param {CallbackFunction} onShare 回调方法，分享成功后调用
     * @returns Promise<boolean> 分享是否设置成功
     */
  }, {
    key: "setShareInfo",
    value: (function () {
      var _setShareInfo = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee(options, onShare) {
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
                  var _window3;
                  var setShare = function setShare() {
                    var _window2;
                    var shareUrl = window.location.href;

                    // 分享按钮： 微信、微信朋友圈、钉钉、微博
                    var list = ['weixin', 'pengyou', 'dingding', 'weibo'];
                    var content = list.map(function (item) {
                      return {
                        title: title,
                        imgUrl: imgUrl,
                        type: item,
                        message: desc,
                        shareType: 0,
                        url: shareUrl
                      };
                    });
                    var shareData = {
                      action: 'share',
                      content: content,
                      urlType: 0,
                      useCustomUrl: 1,
                      loadDirectly: 0,
                      callbackcase: 1,
                      hideMoreBtn: 1,
                      hideLinkCopyBtn: 1
                    };

                    // 设置分享信息
                    (_window2 = window) === null || _window2 === void 0 || _window2.AmapApp.bridge.send(shareData, function () {
                      onShare === null || onShare === void 0 || onShare({
                        target: _interface.ShareType.amap,
                        link: shareUrl
                      });
                    });
                  };
                  var shareConfig = {
                    action: 'registRightButton',
                    buttonText: '分享',
                    "function": {
                      action: 'jsCallBack'
                    }
                  };
                  // 设置高德右侧分享按钮
                  (_window3 = window) === null || _window3 === void 0 || (_window3 = _window3.AmapApp) === null || _window3 === void 0 || _window3.bridge.send(shareConfig, function (res) {
                    if (res) {
                      setShare();
                      resolve({
                        msg: 'ok'
                      });
                    } else {
                      rejects(new Error('failed to share'));
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
      function setShareInfo(_x, _x2) {
        return _setShareInfo.apply(this, arguments);
      }
      return setShareInfo;
    }() // 高德没有提供获取网络的方法，因此使用兜底值
    )
  }, {
    key: "getNetworkType",
    value: function () {
      var _getNetworkType = _asyncToGenerator__default.default( /*#__PURE__*/_regeneratorRuntime__default.default.mark(function _callee2() {
        return _regeneratorRuntime__default.default.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve) {
                resolve(index.NetworkType.unknown);
              }));
            case 1:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));
      function getNetworkType() {
        return _getNetworkType.apply(this, arguments);
      }
      return getNetworkType;
    }()
  }]);
  return Amap;
}();

module.exports = Amap;
