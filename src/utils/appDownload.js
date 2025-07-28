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

// 腾讯新闻APP信息配置
export const QQNewsAppDownloadInfo = {
  packageName: 'com.tencent.news',
  downloadUrl: 'http://dldir1.qq.com/dlomg/inews/TencentNews_13690.apk',
  wxAppId: 'wx073f4a4daff0abe8',
  appleStoreId: '399363156',
  appName: '腾讯新闻-打开眼界',
  downLogo: QQNEWS_LOGO_NEW,
};

// 下载地址
export const DOWNLOAD_URL = 'https://xw.qq.com/mobile/news.html?downapp=auto';

/**
 * 打开URL（在腾讯新闻APP内使用）
 */
export const openUrl = ({ url }) => {
  window.location.href = url;
  return true;
};

/**
 * 下载APP类 - 封装AppDownload功能
 */
export class DownloadApp {
  constructor(param) {
    this.app = new AppDownload(param);
  }

  downloadApp(param = {}) {
    this.app.run(param.openUrl);
  }

  openApp() {
    this.app.openApp();
  }

  download() {
    this.app.download();
  }

  async checkAppIsInstalled() {
    return await this.app.checkAppIsInstalled();
  }

  showAppInfo(params) {
    this.app.showAppInfo(params);
  }
}

/**
 * 打开原生APP
 * @param {string} url - 要打开的URL scheme
 * @param {string} srcFrom - 来源标识
 */
export const openNativeScheme = async (url, srcFrom) => {
  // 如果在腾讯新闻APP内，直接打开URL
  if (isQQNews()) {
    return openUrl({ url });
  }
  // 创建下载APP对象
  const app = new DownloadApp(QQNewsAppDownloadInfo);
  const ua = window.navigator.userAgent;
  const isWorkWx = /wxwork/i.test(ua);
  if (isWorkWx) {
    setTimeout(() => {
      console.log('openUrl', url);
      location.href = `${DOWNLOAD_URL}&srcFrom=${srcFrom || 'swimming'}`
    }, 1000)
    app.downloadApp({ openUrl: url });
    return;
  }
  // 如果在微信或QQ内，先检查APP是否安装
  if (isWeixin() || isQQ()) {
    const isInstalled = await app.checkAppIsInstalled();
    if (!isInstalled) {
      // 如果未安装，打开下载页面
      return window.open(`${DOWNLOAD_URL}&srcFrom=${srcFrom || 'swimming'}`);
    }
  }
  
  // 尝试拉起APP
  app.downloadApp({ openUrl: url });
};  