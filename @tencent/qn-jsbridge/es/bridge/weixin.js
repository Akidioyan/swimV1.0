import _objectWithoutProperties from '@babel/runtime/helpers/objectWithoutProperties';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { ShareType } from '../interface.js';
import { isClient, isInIframe, getParentWeixinJSBridge, waitForParentWeixinJSBridge } from '../utils/index.js';

var _excluded = ["imgUrl"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
var Weixin = /*#__PURE__*/function () {
  function Weixin() {
    var _this = this;
    _classCallCheck(this, Weixin);
    _defineProperty(this, "weixinJSBridge", null);
    /**
     * 分享给朋友 收藏
     * @param options
     */
    _defineProperty(this, "setShareInfo4Friend", function (options, onShare) {
      var _this$weixinJSBridge;
      (_this$weixinJSBridge = _this.weixinJSBridge) === null || _this$weixinJSBridge === void 0 || _this$weixinJSBridge.on('menu:share:appmessage', function () {
        var _this$weixinJSBridge2;
        onShare === null || onShare === void 0 || onShare({
          target: ShareType.weixin,
          link: options.link
        });
        (_this$weixinJSBridge2 = _this.weixinJSBridge) === null || _this$weixinJSBridge2 === void 0 || _this$weixinJSBridge2.invoke('sendAppMessage', options, function () {});
      });
    });
    /**
     * 分享到朋友圈
     * @param options
     */
    _defineProperty(this, "setShareInfo4Timeline", function (options, onShare) {
      var _this$weixinJSBridge3;
      (_this$weixinJSBridge3 = _this.weixinJSBridge) === null || _this$weixinJSBridge3 === void 0 || _this$weixinJSBridge3.on('menu:share:timeline', function () {
        var _this$weixinJSBridge4;
        onShare === null || onShare === void 0 || onShare({
          target: ShareType.timeLine,
          link: options.link
        });
        (_this$weixinJSBridge4 = _this.weixinJSBridge) === null || _this$weixinJSBridge4 === void 0 || _this$weixinJSBridge4.invoke('shareTimeline', options);
      });
    });
    /**
     * 分享到QQ
     * @param options
     */
    _defineProperty(this, "setShareInfo4QQ", function (options, onShare) {
      var _this$weixinJSBridge5;
      (_this$weixinJSBridge5 = _this.weixinJSBridge) === null || _this$weixinJSBridge5 === void 0 || _this$weixinJSBridge5.on('menu:share:qq', function () {
        var _this$weixinJSBridge6;
        onShare === null || onShare === void 0 || onShare({
          target: ShareType.qq,
          link: options.link
        });
        (_this$weixinJSBridge6 = _this.weixinJSBridge) === null || _this$weixinJSBridge6 === void 0 || _this$weixinJSBridge6.invoke('shareQQ', options, function () {});
      });
    });
    /**
     * 分享到QQ空间
     * @param options
     */
    _defineProperty(this, "setShareInfo4QZone", function (options, onShare) {
      var _this$weixinJSBridge7;
      (_this$weixinJSBridge7 = _this.weixinJSBridge) === null || _this$weixinJSBridge7 === void 0 || _this$weixinJSBridge7.on('menu:share:QZone', function () {
        var _this$weixinJSBridge8;
        onShare === null || onShare === void 0 || onShare({
          target: ShareType.qZone,
          link: options.link
        });
        (_this$weixinJSBridge8 = _this.weixinJSBridge) === null || _this$weixinJSBridge8 === void 0 || _this$weixinJSBridge8.invoke('shareQZone', options, function () {});
      });
    });
    this.ready();
  }
  _createClass(Weixin, [{
    key: "ready",
    value: function ready() {
      var _this2 = this;
      if (this.weixinJSBridge) {
        return Promise.resolve(this);
      }
      if (isClient() && typeof window.WeixinJSBridge !== 'undefined') {
        this.weixinJSBridge = window.WeixinJSBridge;
        return Promise.resolve(this);
      }
      if (isClient() && isInIframe()) {
        try {
          var weixinJSBridge = getParentWeixinJSBridge();
          if (weixinJSBridge) {
            this.weixinJSBridge = weixinJSBridge;
            return Promise.resolve(this);
          }
          // 300毫秒尝试一次，共尝试20次
          return waitForParentWeixinJSBridge(20, 300).then(function (weixinJSBridge) {
            _this2.weixinJSBridge = weixinJSBridge;
            return _this2;
          });
        } catch (error) {
          console.error("qn-jsbridge window.parent ".concat(error));
        }
      }
      return new Promise(function (resolve) {
        if (isClient()) {
          window.WeixinJSBridgeReady = function () {
            _this2.weixinJSBridge = window.WeixinJSBridge;
            resolve(_this2);
          };
          document.addEventListener('WeixinJSBridgeReady', window.WeixinJSBridgeReady, false);
        }
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
        var _this3 = this;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.ready();
            case 2:
              if (!this.weixinJSBridge) {
                console.error('qn-jsbridge getNetworkType weixinJSBridge null');
              }
              return _context.abrupt("return", new Promise(function (resolve) {
                var _this3$weixinJSBridge;
                (_this3$weixinJSBridge = _this3.weixinJSBridge) === null || _this3$weixinJSBridge === void 0 || _this3$weixinJSBridge.invoke('getNetworkType', {}, function (_ref) {
                  var err_msg = _ref.err_msg;
                  /**
                   * work_type:wifi Wifi网络
                   * network_type:wwan 2G/3G网络
                   * network_type:edge 2G/3G网络
                   * etwork_type:fail 无网络链接
                   */
                  var type = '';
                  if (err_msg === 'network_type:wifi') {
                    type = 'wifi';
                  } else if (err_msg === 'network_type:wwan' || err_msg === 'network_type:edge') {
                    type = '3g';
                  } else if (err_msg === 'network_type:fail') {
                    type = 'fail';
                  }
                  resolve(type);
                });
              }));
            case 4:
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
        var imgUrl, restOptions, mergedOptions;
        return _regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              imgUrl = options.imgUrl, restOptions = _objectWithoutProperties(options, _excluded);
              mergedOptions = _objectSpread({
                link: document.location.href,
                appid: '',
                img_width: '65',
                img_height: '65',
                img_url: imgUrl,
                imgUrl: imgUrl
              }, restOptions);
              _context2.next = 4;
              return this.ready();
            case 4:
              if (!this.weixinJSBridge) {
                console.error('qn-jsbridge setShareInfo weixinJSBridge null');
              }

              // 分享给朋友
              this.setShareInfo4Friend(mergedOptions, onShare);
              // 分享到朋友圈
              this.setShareInfo4Timeline(mergedOptions, onShare);
              // 分享到QQ
              this.setShareInfo4QQ(mergedOptions, onShare);
              // 分享到QQ空间
              this.setShareInfo4QZone(mergedOptions, onShare);
            case 9:
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
  return Weixin;
}();

export { Weixin as default };
