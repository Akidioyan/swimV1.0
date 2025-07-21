'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _classCallCheck = require('@babel/runtime/helpers/classCallCheck');
var _createClass = require('@babel/runtime/helpers/createClass');
var _defineProperty = require('@babel/runtime/helpers/defineProperty');
var mqq = require('./mqq.js');
var weixin = require('./weixin.js');
var qqbrowser = require('./qqbrowser.js');
var tencentVideo = require('./tencent-video.js');
var amap = require('./amap.js');
var index = require('../utils/index.js');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var _classCallCheck__default = /*#__PURE__*/_interopDefaultCompat(_classCallCheck);
var _createClass__default = /*#__PURE__*/_interopDefaultCompat(_createClass);
var _defineProperty__default = /*#__PURE__*/_interopDefaultCompat(_defineProperty);

var BridgeType = /*#__PURE__*/function (BridgeType) {
  BridgeType["mqq"] = "mqq";
  BridgeType["weixin"] = "weixin";
  BridgeType["qqBrowser"] = "qqBrowser";
  BridgeType["tencentVideo"] = "TencentVideo";
  BridgeType["amap"] = "amap";
  return BridgeType;
}({});
var type2BridgeMapping = _defineProperty__default.default(_defineProperty__default.default(_defineProperty__default.default(_defineProperty__default.default(_defineProperty__default.default({}, BridgeType.mqq, mqq), BridgeType.weixin, weixin), BridgeType.qqBrowser, qqbrowser), BridgeType.tencentVideo, tencentVideo), BridgeType.amap, amap);
var allTypes = Object.keys(type2BridgeMapping);
var JsBridge = /*#__PURE__*/function () {
  function JsBridge() {
    var _this = this;
    _classCallCheck__default.default(this, JsBridge);
    _defineProperty__default.default(this, "readyInstanceType", null);
    _defineProperty__default.default(this, "instances", {});
    _defineProperty__default.default(this, "readyInstance", null);
    _defineProperty__default.default(this, "readyListener", []);
    var callback = index.callOnce(function (_ref) {
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
  _createClass__default.default(JsBridge, [{
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

exports.BridgeType = BridgeType;
exports.default = JsBridge;
