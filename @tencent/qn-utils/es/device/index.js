function ua(lower) {
  var _window;
  var userAgent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var ua = userAgent || typeof window !== 'undefined' && ((_window = window) === null || _window === void 0 || (_window = _window.navigator) === null || _window === void 0 ? void 0 : _window.userAgent); // 兼容 SSR 渲染
  return lower ? ua.toLowerCase() : ua;
}
function isWindowSystem(userAgent) {
  return /windows|win32|win64|wow32|win64/i.test(userAgent || ua('l'));
}
var isMobile = function isMobile(userAgent) {
  return /android|webos|iphone|ipad|ipod|blackberry|opera mini|harmony|mobile/i.test(ua('l', userAgent));
};
var isPC = function isPC(userAgent) {
  return !isMobile(userAgent);
};
var iPhone = function iPhone(userAgent) {
  return /iPhone/.test(ua('', userAgent));
};

/**
 * 判断是否为 iPhone X 设备
 * 检查设备的像素比例 > 2,屏幕的宽度大于等于375,屏幕的高度大于等于812
*/
function isIphoneXmodel() {
  // X XS, XS Max, XR...
  var isIPhoneX = /iphone/gi.test(ua()) && window.devicePixelRatio && window.devicePixelRatio >= 2 && window.screen.width >= 375 && window.screen.height >= 812;
  return isIPhoneX;
}
function ieVersion() {
  var uakit = ua();
  var msie = uakit.indexOf('MSIE ');
  if (msie > 0) {
    return parseInt(uakit.substring(msie + 5, uakit.indexOf('.', msie)), 10);
  }
  var trident = uakit.indexOf('Trident/');
  if (trident > 0) {
    var rv = uakit.indexOf('rv:');
    return parseInt(uakit.substring(rv + 3, uakit.indexOf('.', rv)), 10);
  }
  var edge = uakit.indexOf('Edge/');
  if (edge > 0) {
    return parseInt(uakit.substring(edge + 5, uakit.indexOf('.', edge)), 10);
  }
  return '';
}
function isIE() {
  return ieVersion() > 0;
}
function isWorkWeixin() {
  return /wxwork/gi.test(ua()); // 企业微信
}
function isQQNews() {
  return /qqnews/.test(ua()); // 腾讯新闻app
}
function isTenvideo() {
  return /qqlivebrowser/.test(ua('l')); // 腾讯视频
}
function isYuanBaoApp() {
  return /yuanbao/i.test(ua('l')); // 元宝
}

// 腾讯微视
var isWeiShi = function isWeiShi(userAgent) {
  return /weishi/.test(ua('l', userAgent));
};

// qq音乐
function isQQMusic() {
  return /qqmusic/.test(ua('l'));
}

// QQ浏览器
function isQQbrowser() {
  return !isWorkWeixin() && !isYuanBaoApp() && !isIma() && /mqqbrowser\//.test(ua('l')) && !/qq\//.test(ua('l'));
}

// 百度浏览器或百度APP
function isBaiduBrowser() {
  return /baidubrowser\/|baiduboxapp\//.test(ua('l'));
}

// 百度地图
function isBaiduMap() {
  return /bdmap/.test(ua('l'));
}

// 快手普版
function isKuaiShouNormal() {
  return /kwai/.test(ua('l'));
}

// 快手极速版
function isKuaiShouJiSu() {
  return /ksnebula/.test(ua('l'));
}

// 快手，不区分版本
function isKuaiShou() {
  return isKuaiShouNormal() || isKuaiShouJiSu();
}

// Ima
function isIma() {
  return /ima\.?copilot/.test(ua('l'));
}

// UC浏览器
function isUCBrowser() {
  return /ucbrowser\//.test(ua('l'));
}

// 华为
function isHuaWei() {
  return /huawei/.test(ua('l'));
}

// 荣耀
function isHonor() {
  return /honor/.test(ua('l'));
}

// OPPO
function isOppo() {
  return /oppo|p\w{3}\d{2}/.test(ua('l'));
}

// VIVO
function isVivo() {
  return /vivo|v\d{4}(a|t)/.test(ua('l'));
}

// 三星
function isSamsung() {
  return /sm-/.test(ua('l'));
}

// 小米
function isXiaomi() {
  // mi/mix/redmi/ 以字母m(可选)和4位年月数字开始，3至5位数字或字母，c或cp结尾
  return /\smi\s|\smix\s|\sredmi\s|\sm?\d{4}[0-9a-z]{3,5}cp?\s/.test(ua('l'));
}

// 真我
function isRealme() {
  return /realme|rmx\d{4}/.test(ua('l'));
}

// 联想
function isLenovo() {
  return /lenovo/.test(ua('l'));
}

// 魅族
function isMeizu() {
  return /meizu/.test(ua('l'));
}

/**
 * @description 是否是一加手机
 * 机型汇总：https://khwang9883.github.io/MobileModels/brands/oneplus.html
 */
function isOnePlus() {
  var regex1 = /ONE(\s[A-Z]\d{4,5})?/;
  var regex2 = /ONEPLUS(\s[A-Z]\d{4})?/;
  var regex3 = /GM\d{4}|HD\d{4}|IN\d{4}|KB\d{4}|LE\d{4}|MT\d{4}|NE\d{4}/;
  var regex4 = /PG[KM]\d{2}|CPH\d{4}|PH[BK]\d{2}|PJ[ADFJXZ]\d{2}/;
  var regex5 = /AC\d{4}|DN\d{4}|EB\d{4}|IV\d{4}|BE\d{4}|GN\d{4}|dre9|DE\d{4}|OPD\d{4}/;
  return [regex1, regex2, regex3, regex4, regex5].some(function (r) {
    return r.test(ua());
  });
}

export { iPhone, ieVersion, isBaiduBrowser, isBaiduMap, isHonor, isHuaWei, isIE, isIma, isIphoneXmodel, isKuaiShou, isKuaiShouJiSu, isKuaiShouNormal, isLenovo, isMeizu, isMobile, isOnePlus, isOppo, isPC, isQQMusic, isQQNews, isQQbrowser, isRealme, isSamsung, isTenvideo, isUCBrowser, isVivo, isWeiShi, isWindowSystem, isWorkWeixin, isXiaomi, isYuanBaoApp, ua };
