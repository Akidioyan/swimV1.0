/**
 * 点击上报函数
 * @param {Object} params - 上报参数
 * @param {string} params.id - 上报ID
 */
export function clickReport(params = {}) {
  try {
    console.log('点击上报:', params);
    // 这里可以添加实际的上报逻辑
    // 如果有需要，可以从refData/utils/report.js复制更完整的实现
  } catch (error) {
    console.error('上报失败:', error);
  }
}

/**
 * 检查当前平台
 */
export function checkPlatform() {
  if (typeof window === 'undefined') {
    return 'Browser';
  }
  const ua = navigator.userAgent;
  // 新闻客户端
  if (ua.match(/qqnews\/([.\d]+)/i)) {
    // IOS系统
    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
      return 'TencentNewsIOS';
    }
    // Android系统
    if (/(Android)/i.test(navigator.userAgent)) {
      return 'TencentNewsAndroid';
    }
    // 别的系统
    return 'TencentNews';
  }
  return 'Browser';
}