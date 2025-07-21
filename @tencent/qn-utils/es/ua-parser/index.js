import { UAParser } from 'ua-parser-js';

/**
 * 为什么不是./env or ./device?  本方法有第3方依赖如果是简单逻辑无需使用此方法
 */
var CUSTOM_LIST_OF_BROWSERS = [[/(VivoBrowser)\/([\w.]+)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION], [/(BingSapphire)\/([\w.]+)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION], [/(FingerBrowser)\/([\w.]+)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION], [/(hanvon)\/([\w.]+)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION], [/(dianping)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION], [/(ireader)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION], [/(xmly)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION], [/(yuanbao)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION], [/(ima)\.?copilot/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION], [/(kwai)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION], [/(bdmap)/i], [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION]];

/**
 * 对 UAParser 进行扩展支持几种常见但没有被支持的浏览器
 * 如果需要覆盖一些与正则也要来修改这个方法
 *
 * @param  {string} userAgent 正常取值 navigator.userAgent ｜ request.headers["user-agent"]
 */
var getUAParser = function getUAParser() {
  var userAgent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var ua = userAgent;
  if (!userAgent && typeof window !== 'undefined') {
    ua = navigator.userAgent;
  }
  return new UAParser({
    browser: CUSTOM_LIST_OF_BROWSERS
  }).setUA(ua);
};

/**
 * 返回常见的浏览器名，如果不全请自行扩展
 */
var getBrowserName = function getBrowserName() {
  var _getUAParser$getBrows = getUAParser().getBrowser(),
    _getUAParser$getBrows2 = _getUAParser$getBrows.name,
    name = _getUAParser$getBrows2 === void 0 ? '' : _getUAParser$getBrows2;
  return name;
};

export { getBrowserName, getUAParser };
