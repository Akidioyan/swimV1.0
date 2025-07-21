import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import Mqq from './mqq.js';
import Weixin from './weixin.js';
import QQBrowser from './qqbrowser.js';
import TencentVideo from './tencent-video.js';
import Amap from './amap.js';
import { callOnce } from '../utils/index.js';

var BridgeType = /*#__PURE__*/function (BridgeType) {
  BridgeType["mqq"] = "mqq";
  BridgeType["weixin"] = "weixin";
  BridgeType["qqBrowser"] = "qqBrowser";
  BridgeType["tencentVideo"] = "TencentVideo";
  BridgeType["amap"] = "amap";
  return BridgeType;
}({});
var type2BridgeMapping = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, BridgeType.mqq, Mqq), BridgeType.weixin, Weixin), BridgeType.qqBrowser, QQBrowser), BridgeType.tencentVideo, TencentVideo), BridgeType.amap, Amap);
var allTypes = Object.keys(type2BridgeMapping);
var JsBridge = /*#__PURE__*/function () {
  function JsBridge() {
    var _this = this;
    _classCallCheck(this, JsBridge);
    _defineProperty(this, "readyInstanceType", null);
    _defineProperty(this, "instances", {});
    _defineProperty(this, "readyInstance", null);
    _defineProperty(this, "readyListener", []);
    var callback = callOnce(function (_ref) {
      var type = _ref.type,
        instance = _ref.instance;
      _this.readyInstanceType = type;
      _this.readyInstance = instance;
      while (_this.readyListener.length) {
        _this.readyListener.pop()();
      }
    });
    allTypes.forEach(function (type) {
      var instance = new type2BridgeMapping[type]();
      _this.instances[type] = instance;
      instance.ready().then(function () {
        return callback({
          type: type,
          instance: instance
        });
      })["catch"](function () {});
    });
  }
  _createClass(JsBridge, [{
    key: "ready",
    value: function ready(type) {
      var _this$instances;
      if (!type2BridgeMapping[type]) {
        throw new TypeError("unsupported bridge type ".concat(type));
      }
      return (_this$instances = this.instances) === null || _this$instances === void 0 ? void 0 : _this$instances[type].ready();
    }
  }, {
    key: "readyAny",
    value: function readyAny() {
      var _this2 = this;
      if (this.readyInstance) {
        return Promise.resolve(this.readyInstance);
      }
      return new Promise(function (resolve) {
        _this2.readyListener.push(function () {
          return resolve(_this2.readyInstance);
        });
      });
    }
  }]);
  return JsBridge;
}();

export { BridgeType, JsBridge as default };
