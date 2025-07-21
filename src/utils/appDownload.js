// APP拉起和下载功能
import { ua } from './ua.js'

// 环境检测函数
export const isWeixin = (userAgent) => /MicroMessenger/i.test(ua(true, userAgent));
export const isQQ = (userAgent) => /QQ\//i.test(ua(true, userAgent));
export const isQQNews = () => /qqnews/i.test(ua(true));

// 腾讯新闻APP信息配置
export const QQNewsAppDownloadInfo = {
  packageName: 'com.tencent.news',
  downloadUrl: 'http://dldir1.qq.com/dlomg/inews/TencentNews_13690.apk',
  wxAppId: 'wx073f4a4daff0abe8',
  appleStoreId: '399363156',
  appName: '腾讯新闻-打开眼界',
};

const DOWNLOAD_URL = 'https://news.qq.com/mobile/';

/**
 * 打开原生APP
 * @param {string} url - 要打开的URL scheme
 * @param {string} srcFrom - 来源标识
 */
export const openNativeScheme = async (url, srcFrom) => {
  // 如果在腾讯新闻APP内，直接打开URL
  if (isQQNews()) {
    try {
      const { openUrl } = await import('@tencent/qqnews-jsapi');
      return openUrl({ url });
    } catch (error) {
      console.error('打开URL失败:', error);
      return;
    }
  }
  
  // 如果在微信或QQ内，直接跳转下载页
  if (isWeixin() || isQQ()) {
    return window.open(`${DOWNLOAD_URL}&srcFrom=${srcFrom || 'swimming'}`);
  }
  
  // 其他环境尝试拉起APP
  try {
    // 尝试使用APP下载库
    const { DownloadApp } = await import('@tencent/gh-qqnews-downapp');
    const app = new DownloadApp(QQNewsAppDownloadInfo);
    app.downloadApp({ openUrl: url });
  } catch (error) {
    console.error('APP拉起失败:', error);
    // 降级到直接打开下载页
    window.open(`${DOWNLOAD_URL}&srcFrom=${srcFrom || 'swimming'}`);
  }
};