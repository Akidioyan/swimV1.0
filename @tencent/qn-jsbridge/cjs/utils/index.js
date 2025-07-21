'use strict';

var callOnce = function callOnce(callback) {
  var called = false;
  return function () {
    if (called) {
      return;
    }
    called = true;
    return callback.apply(void 0, arguments);
  };
};
var isMqqUA = function isMqqUA(ua) {
  var pattern1 = /QQ\/(\d+\.(\d+)\.(\d+)\.(\d+))/i;
  var pattern2 = /V1_AND_SQ_([\d.]+)/;
  return pattern1.test(ua) || pattern2.test(ua);
};

// 判断是不是WKWebView，如果不是就按照UIWebView处理
var isWKWebView = function isWKWebView(ua) {
  return /Core\/WKWebView/.test(ua);
};
var isClient = function isClient() {
  return typeof window !== 'undefined';
};
var UA = isClient() ? navigator.userAgent : '';
function isInIframe() {
  return window.self !== window.top;
}
function getParentWeixinJSBridge() {
  return window.parent && typeof window.parent.WeixinJSBridge !== 'undefined' ? window.parent.WeixinJSBridge : null;
}
function waitForParentWeixinJSBridge(maxAttempts, interval) {
  return new Promise(function (resolve, reject) {
    var attempts = 0;
    var timer = setInterval(function () {
      attempts = attempts + 1;
      if (attempts > maxAttempts) {
        clearInterval(timer);
        reject('timeout');
      } else {
        var weixinJSBridge = getParentWeixinJSBridge();
        if (weixinJSBridge) {
          clearInterval(timer);
          resolve(weixinJSBridge);
        }
      }
    }, interval);
  });
}

exports.UA = UA;
exports.callOnce = callOnce;
exports.getParentWeixinJSBridge = getParentWeixinJSBridge;
exports.isClient = isClient;
exports.isInIframe = isInIframe;
exports.isMqqUA = isMqqUA;
exports.isWKWebView = isWKWebView;
exports.waitForParentWeixinJSBridge = waitForParentWeixinJSBridge;
