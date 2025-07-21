import { isBrowser } from './helper.js';
export { isSSR } from './helper.js';

function ua() {
  var _window;
  var userAgent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var ua = userAgent || isBrowser() && ((_window = window) === null || _window === void 0 || (_window = _window.navigator) === null || _window === void 0 ? void 0 : _window.userAgent);
  // 在 SSR 环境取不到 ua 确保后续使用 ua.toLocaleLowerCase 不报错
  return typeof ua === 'string' ? ua : '';
}
var isIOS = function isIOS(userAgent) {
  return /iPad|iPhone|iPod/.test(ua(userAgent));
};
var isAndroid = function isAndroid(userAgent) {
  return /android/i.test(ua(userAgent));
};
var isHarmony = function isHarmony(userAgent) {
  return /Harmony|harmony/i.test(ua(userAgent));
};

// 鸿蒙 Next 从 API version 11起，Web组件基于 ArkWeb 的内核，因此使用 ArkWeb 判断是否是鸿蒙系统
var isHarmonyNext = function isHarmonyNext(userAgent) {
  return isHarmony(userAgent) && /ArkWeb/i.test(ua(userAgent));
};
var isIPad = function isIPad(userAgent) {
  return /iPad/.test(ua(userAgent));
};
var isWeixin = function isWeixin(userAgent) {
  return /MicroMessenger/i.test(ua(userAgent));
};
var isQQ = function isQQ(userAgent) {
  return /qq\//i.test(ua(userAgent));
};
var isWxApplets = function isWxApplets(userAgent) {
  return isWeixin() && /miniProgram/i.test(ua(userAgent)) || window.__wxjs_environment === 'miniprogram';
};

// 是否是 OPPO 手机系统浏览器环境
var isOppoSystemBrowser = function isOppoSystemBrowser(userAgent) {
  return /heytapbrowser\/(\d+\.\d+\.\d+)/gi.test(ua(userAgent).toLocaleLowerCase());
};

// 是否是 Vivo 手机系统浏览器
var isVivoSystemBrowser = function isVivoSystemBrowser(userAgent) {
  return /vivobrowser\/(\d+\.\d+\.\d+)/gi.test(ua(userAgent).toLocaleLowerCase());
};

// 是否是高德 App
var isAmap = function isAmap(userAgent) {
  return /amap\/(\d+\.\d+\.\d+.\d+)/gi.test(ua(userAgent).toLocaleLowerCase());
};

// 是否是汉王电子书
var isHanvon = function isHanvon(userAgent) {
  return /hanvon\/(\d+\.\d+)/gi.test(ua(userAgent).toLocaleLowerCase());
};

// 是否是大众点评
var isDianPing = function isDianPing(userAgent) {
  return /dianping/gi.test(ua(userAgent).toLocaleLowerCase());
};

// 是否是掌阅
var isIReader = function isIReader(userAgent) {
  return /ireader/gi.test(ua(userAgent).toLocaleLowerCase());
};

// 是否是喜马拉雅
var isXmly = function isXmly(userAgent) {
  return /xmly/gi.test(ua(userAgent).toLocaleLowerCase());
};

export { isAmap, isAndroid, isBrowser, isDianPing, isHanvon, isHarmony, isHarmonyNext, isIOS, isIPad, isIReader, isOppoSystemBrowser, isQQ, isVivoSystemBrowser, isWeixin, isWxApplets, isXmly };
