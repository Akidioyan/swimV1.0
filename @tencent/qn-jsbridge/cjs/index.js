'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./bridge/index.js');
var index$1 = require('./utils/index.js');

var JsBridge = index$1.isClient() ? new index.default() : {
  ready: function ready(type) {
    return Promise.resolve(type);
  },
  readyAny: function readyAny() {
    return Promise.resolve();
  }
};

exports.BridgeType = index.BridgeType;
exports.default = JsBridge;
