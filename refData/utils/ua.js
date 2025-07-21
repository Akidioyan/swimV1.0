/**
 * UA 工具函数
 * 用于检测用户代理和判断应用内外环境
 */

/**
 * 获取用户代理字符串
 * @param {boolean} lower 是否转换为小写
 * @param {string} userAgent 可选的用户代理字符串
 * @returns {string} 用户代理字符串
 */
export function ua(lower = false, userAgent = '') {
  const ua = userAgent || (typeof window !== 'undefined' && window?.navigator?.userAgent);
  return lower ? ua.toLowerCase() : ua;
}

/**
 * 判断是否在腾讯新闻APP内打开
 * @returns {boolean} 是否在腾讯新闻APP内
 */
export function isQQNews() {
  return /qqnews/i.test(ua(true)); // 腾讯新闻app，使用不区分大小写的正则
}

/**
 * 判断是否在微信内
 * @returns {boolean} 是否在微信内
 */
export function isWeixin() {
  return /MicroMessenger/i.test(ua(true));
}

/**
 * 判断是否在QQ内
 * @returns {boolean} 是否在QQ内
 */
export function isQQ() {
  return /qq\//i.test(ua(true));
}