import { ua, isQQNews } from './ua';
import AppDownload from '@tencent/gh-qqnews-downapp';

/**
 * 腾讯新闻APP下载和拉起功能
 */

// 导入环境检测函数
export const isWeixin = (userAgent) => /MicroMessenger/i.test(ua(true, userAgent));
export const isQQ = (userAgent) => /qq\//i.test(ua(true, userAgent));

// 腾讯新闻logo图片地址，如果有需要可以替换为项目内实际地址
const QQNEWS_LOGO_NEW = 'https://mat1.gtimg.com/news/brand/qqnews_logo.png'; 

import { ua, isWeixin, isQQ } from './ua.js'

// 腾讯新闻APP信息配置
export const QQNewsAppDownloadInfo = {
  packageName: 'com.tencent.news',
  downloadUrl: 'http://dldir1.qq.com/dlomg/inews/TencentNews_13690.apk',
  wxAppId: 'wx073f4a4daff0abe8',
  appleStoreId: '399363156',
  appName: '腾讯新闻-游泳挑战',
};

/**
 * 打开原生APP
 * @param {string} url - 要打开的URL scheme
 * @param {string} srcFrom - 来源标识
 */
export const openNativeScheme = async (url, srcFrom = 'swimming') => {
  // 如果在腾讯新闻APP内，直接打开URL
  if (isQQNews()) {
    try {
      // 这里需要引入腾讯新闻JSAPI
      // const { openUrl } = await import('@tencent/qqnews-jsapi');
      // return openUrl({ url });
      console.log('在腾讯新闻APP内打开:', url);
      return true;
    } catch (error) {
      console.error('APP内打开失败:', error);
      return false;
    }
  }
  
  // 如果在微信或QQ内，引导下载
  if (isWeixin() || isQQ()) {
    const downloadUrl = `https://news.qq.com/download?srcFrom=${srcFrom}`;
    window.open(downloadUrl, '_blank');
    return true;
  }
  
  // 其他环境，尝试拉起APP
  try {
    window.location.href = url;
    
    // 设置超时，如果APP没有拉起成功，跳转到下载页
    setTimeout(() => {
      const downloadUrl = `https://news.qq.com/download?srcFrom=${srcFrom}`;
      window.open(downloadUrl, '_blank');
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('拉起APP失败:', error);
    return false;
  }
};

/**
 * 下载或拉起腾讯新闻APP
 * @param {string} srcFrom - 来源标识
 */
export const downloadQQNewsApp = (srcFrom = 'swimming') => {
  const scheme = `qqnews://swimming_challenge?srcFrom=${srcFrom}`;
  return openNativeScheme(scheme, srcFrom);
};
// 创建下载APP对象
  const app = new DownloadApp(QQNewsAppDownloadInfo);
  const ua = window.navigator.userAgent;
  const isWorkWx = /wxwork/i.test(ua);
  if (isWorkWx) {
    setTimeout(() => {
      console.log('openUrl', url);
      location.href = `${DOWNLOAD_URL}&srcFrom=${srcFrom || 'pingpong'}`
    }, 1000)
    app.downloadApp({ openUrl: url });
    return;
  }
  // 如果在微信或QQ内，先检查APP是否安装
  if (isWeixin() || isQQ()) {
    const isInstalled = await app.checkAppIsInstalled();
    if (!isInstalled) {
      // 如果未安装，打开下载页面
      return window.open(`${DOWNLOAD_URL}&srcFrom=${srcFrom || 'pingpong'}`);
    }
  }
  
  // 尝试拉起APP
  app.downloadApp({ openUrl: url });
// 删除多余的闭合括号
