'use strict';

var qnStorage = require('@tencent/qn-storage');

var QQ_NEWS_START_REFERRER_KEY = 'start_referrer_key';
var DEFAULT_PREFIX = 'qq_news_';
var NO_REFERRER = 'no-referrer';
function getSessionStorage() {
  return qnStorage.getStorage(qnStorage.StorageType.session);
}
function getReferrer() {
  var _document;
  var referrer = NO_REFERRER;
  if (typeof document !== 'undefined' && (_document = document) !== null && _document !== void 0 && _document.referrer) {
    var _document2;
    referrer = (_document2 = document) === null || _document2 === void 0 ? void 0 : _document2.referrer;
  }
  return referrer;
}
function getDomainFromURL(urlString) {
  try {
    var url = new URL(urlString);
    return url.hostname;
  } catch (error) {
    return '';
  }
}
function getStartReferrer() {
  var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_PREFIX;
  return getSessionStorage().getItem("".concat(prefix).concat(QQ_NEWS_START_REFERRER_KEY));
}

/**
 * 第一次打开页面时把 Referrer 作为 start referrer 存起来，当前 Session 页面二次跳转或刷新都不再更新
 * 注意这里只存了域名
 */
function initStartReferrer() {
  var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_PREFIX;
  var startReferrer = getStartReferrer();
  // 如果 Session 中已经有值说明第一次进来的是空 referrer 没必要再写入了
  if (startReferrer) {
    return;
  }
  var referrerHostName = getDomainFromURL(getReferrer()) || NO_REFERRER;
  return getSessionStorage().setItem("".concat(prefix).concat(QQ_NEWS_START_REFERRER_KEY), referrerHostName);
}

exports.DEFAULT_PREFIX = DEFAULT_PREFIX;
exports.QQ_NEWS_START_REFERRER_KEY = QQ_NEWS_START_REFERRER_KEY;
exports.getDomainFromURL = getDomainFromURL;
exports.getReferrer = getReferrer;
exports.getStartReferrer = getStartReferrer;
exports.initStartReferrer = initStartReferrer;
