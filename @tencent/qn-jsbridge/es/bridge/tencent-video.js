import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import { isBrowser, isTenvideo } from '@tencent/qn-utils';
import { callOnce } from '../utils/index.js';
import { ShareType } from '../interface.js';
import { NetworkType } from '../constants/index.js';

/**
 * fixme later 视频 JSAPI 目前有问题，调用此方法无回调，后续视频侧修复后再放开 @changlin
 * 视频 JSAPI 检测到的网络类型
 */
// const NETWORK_TYPE = {
//   0: NetworkType.fail,
//   1: NetworkType.wifi,
//   2: NetworkType.second,
//   3: NetworkType.third,
//   4: NetworkType.fourth,
//   5: NetworkType.other,
// };
/**
 * 腾讯视频 App 中， 视频会自动注入 SDK ，无需再手动加载
 * 详细文档参考 README.md
 */
var TencentVideo = /*#__PURE__*/function () {
  function TencentVideo() {
    var _window,
      _this = this;
    _classCallCheck(this, TencentVideo);
    _defineProperty(this, "isReady", false);
    _defineProperty(this, "isTencentVideo", false);
    _defineProperty(this, "readyListener", []);
    _defineProperty(this, "readyState", '');
    // 已经挂载的情况
    if (isBrowser() && typeof ((_window = window) === null || _window === void 0 ? void 0 : _window.TenvideoJSBridge) !== 'undefined') {
      this.isReady = true;
      return;
    }
    var callback = callOnce(function () {
      _this.isReady = true;
      while (_this.readyListener.length) {
        _this.readyListener.pop()();
      }
    });
    this.isTencentVideo = isTenvideo();
    if (this.isTencentVideo) {
      document.addEventListener('onTenvideoJSBridgeReady', function () {
        callback();
      }, false);
    }
  }
  _createClass(TencentVideo, [{
    key: "ready",
    value: function ready() {
      var _this2 = this;
      if (typeof window === 'undefined') {
        return Promise.reject(new Error('window not found'));
      }
      if (this.isReady) {
        return Promise.resolve(this);
      }
      if (!this.isTencentVideo) {
        return Promise.reject(new Error('not qq video user-agent'));
      }
      return new Promise(function (resolve) {
        _this2.readyListener.push(function () {
          return resolve(_this2);
        });
      });
    }

    /**
     * 使用腾讯视频的 JSAPI 设置分享信息， 仅在腾讯视频 App 中起作用
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
      var _setShareInfo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(options, onShare) {
        var _ref, _ref$title, title, _ref$desc, desc, imgUrl;
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.ready();
            case 2:
              _ref = options || {}, _ref$title = _ref.title, title = _ref$title === void 0 ? '' : _ref$title, _ref$desc = _ref.desc, desc = _ref$desc === void 0 ? '' : _ref$desc, imgUrl = _ref.imgUrl;
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                try {
                  var _window2;
                  var shareInfo = {
                    shareInfo: {
                      title: title,
                      subTitle: desc,
                      imageUrl: imgUrl,
                      url: window.location.href
                    },
                    source: 'qqnews'
                  };
                  (_window2 = window) === null || _window2 === void 0 || _window2.TenvideoJSBridge.invoke('setMoreInfo', shareInfo, function (res) {
                    if (Number(res === null || res === void 0 ? void 0 : res.errCode) !== 0) {
                      reject(false);
                    } else {
                      onShare === null || onShare === void 0 || onShare({
                        target: ShareType.tencentVideo,
                        link: shareInfo.shareInfo.url
                      });
                      resolve(true);
                    }
                  });
                } catch (error) {
                  console.error(error);
                  reject(false);
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
    }()
    /**
     * 获取网络状态
     *
     * @returns Promise<stirng>
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
              return _context2.abrupt("return", new Promise(function (resolve) {
                // fixme later 视频 JSAPI 目前有问题，调用此方法无回调，后续视频侧修复后再放开 @changlin
                // try {
                //   window?.TenvideoJSBridge?.invoke(
                //     'getNetworkState',
                //     (res: TenvideoJSBridgeCallbackParams<{state: keyof typeof NETWORK_TYPE}>) => {
                //       if (Number(res?.errCode) !== 0) {
                //         reject(NetworkType.unknown);
                //       } else {
                //         const { state } = res?.result || {};
                //         resolve(NETWORK_TYPE?.[state] || NetworkType.unknown);
                //       }
                //     },
                //   );
                // } catch (error) {
                //   reject(error);
                // }
                resolve(NetworkType.other);
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
  return TencentVideo;
}();

export { TencentVideo as default };
