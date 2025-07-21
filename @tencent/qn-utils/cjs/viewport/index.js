'use strict';

var helper = require('../env/helper.js');

// 获取浏览器高度
var getWindowHeight = function getWindowHeight() {
  var defaultHeight = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  if (!helper.isBrowser()) return defaultHeight;
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
};

// 获取浏览器宽度
var getWindowWidth = function getWindowWidth() {
  var defaultWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  if (!helper.isBrowser()) return defaultWidth;
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

exports.getWindowHeight = getWindowHeight;
exports.getWindowWidth = getWindowWidth;
