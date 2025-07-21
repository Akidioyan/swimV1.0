import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { ShareType } from '../interface.js';
import { isClient, isMqqUA, callOnce, UA, isWKWebView } from '../utils/index.js';
import { NetworkType } from '../constants/index.js';

// 网络返回类型
var NETWORK_TYPE = {
  '-1': NetworkType.unknown,
  0: NetworkType.fail,
  1: NetworkType.wifi,
  2: NetworkType.second,
  3: NetworkType.third,
  4: NetworkType.fourth
};

// 分享文案类型
var SHARE_TYPE = {
  0: ShareType.qq,
  1: ShareType.qZone,
  2: ShareType.weixin,
  3: ShareType.timeLine
};

// qq api
var QQ_API = 'https://open.mobile.qq.com/sdk/qqapi.js?_bid=152';
// qq api wk
var QQ_API_WK = 'https://open.mobile.qq.com/sdk/qqapi.wk.js';
var Mqq = /*#__PURE__*/function () {
  function Mqq() {
    var _this = this;
    _classCallCheck(this, Mqq);
    _defineProperty(this, "isReady", false);
    _defineProperty(this, "isMqqUA", null);
    _defineProperty(this, "readyListener", []);
    _defineProperty(this, "qqSdkVersion", '');
    _defineProperty(this, "readyState", '');
    if (isClient() && typeof window.mqq !== 'undefined') {
      this.isReady = true;
      return;
    }
    var callback = callOnce(function () {
      _this.isReady = true;
      while (_this.readyListener.length) {
        _this.readyListener.pop()();
      }
    });
    this.isMqqUA = isMqqUA(UA);
    if (this.isMqqUA) {
      var script = document.createElement('script');
      var isWKWebViewCore = isWKWebView(UA);
      // 增加qq sdk版本显示
      if (isWKWebViewCore) {
        this.qqSdkVersion = 'wk';
      }
      // 根据内核不同，需要引入不同的JS SDK
      // 文档里没有说明，对接人@yussicahe
      script.src = isWKWebViewCore ? QQ_API_WK : QQ_API;
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
  _createClass(Mqq, [{
    key: "ready",
    value: function ready() {
      var _this2 = this;
      if (typeof window === 'undefined') {
        return Promise.reject(new Error('window not found'));
      }
      if (this.isReady) {
        return Promise.resolve(this);
      }
      if (!this.isMqqUA) {
        return Promise.reject(new Error('not mqq user-agent'));
      }
      return new Promise(function (resolve) {
        _this2.readyListener.push(function () {
          return resolve(_this2);
        });
      });
    }

    /**
     * 获取网络状态
     * @returns
     */
  }, {
    key: "getNetworkType",
    value: (function () {
      var _getNetworkType = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.ready();
            case 2:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                try {
                  var _window$mqq;
                  (_window$mqq = window.mqq) === null || _window$mqq === void 0 || (_window$mqq = _window$mqq.device) === null || _window$mqq === void 0 || _window$mqq.getNetworkType(function (res) {
                    /**
                     * -1: Unknown 未知类型网络
                     * 0: NotReachable
                     * 1: ReachableViaWiFi
                     * 2: ReachableVia2G
                     * 3: ReachableVia3G
                     * 4. 4G
                     */
                    var type = NETWORK_TYPE[res] || '';
                    resolve(type);
                  });
                } catch (error) {
                  reject(error);
                }
              }));
            case 3:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function getNetworkType() {
        return _getNetworkType.apply(this, arguments);
      }
      return getNetworkType;
    }()
    /**
     * 设置分享信息
     * @param options
     * @returns
     */
    )
  }, {
    key: "setShareInfo",
    value: (function () {
      var _setShareInfo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(options, onShare) {
        var _ref, _ref$title, title, _ref$desc, desc, imgUrl, _ref$sourceName, sourceName, _ref$back, back, _window$mqq2;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.ready();
            case 2:
              _ref = options || {}, _ref$title = _ref.title, title = _ref$title === void 0 ? '' : _ref$title, _ref$desc = _ref.desc, desc = _ref$desc === void 0 ? '' : _ref$desc, imgUrl = _ref.imgUrl, _ref$sourceName = _ref.sourceName, sourceName = _ref$sourceName === void 0 ? '腾讯新闻' : _ref$sourceName, _ref$back = _ref.back, back = _ref$back === void 0 ? true : _ref$back;
              try {
                (_window$mqq2 = window.mqq) === null || _window$mqq2 === void 0 || (_window$mqq2 = _window$mqq2.ui) === null || _window$mqq2 === void 0 || _window$mqq2.setOnShareHandler(function (result) {
                  var _window$mqq3;
                  var mergedOptions = {
                    title: title,
                    desc: desc,
                    share_url: document.location.href,
                    // QQ中不允许更改URL，否则设置会失败
                    image_url: imgUrl,
                    share_type: result,
                    // 分享的目标类型，0：QQ好友；1：QQ空间；2：微信好友；3：微信朋友圈。默认为 0
                    sourceName: sourceName,
                    // 消息来源名称
                    back: back // 分享成功之后是否返回到web页面
                  };
                  var shareMsg = SHARE_TYPE[result] || '';
                  onShare === null || onShare === void 0 || onShare({
                    target: shareMsg,
                    link: mergedOptions.share_url
                  });
                  (_window$mqq3 = window.mqq) === null || _window$mqq3 === void 0 || (_window$mqq3 = _window$mqq3.ui) === null || _window$mqq3 === void 0 || _window$mqq3.shareMessage(mergedOptions, function () {});
                });
              } catch (error) {
                console.error(error);
              }
            case 4:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function setShareInfo(_x, _x2) {
        return _setShareInfo.apply(this, arguments);
      }
      return setShareInfo;
    }())
  }]);
  return Mqq;
}();

export { Mqq as default };
