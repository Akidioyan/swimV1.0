/**
 * 检查当前平台
 */
const checkPlateform = () => {
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
  // 新闻客户端急速版
  if (ua.match(/qqnewslite\/([.\d]+)/i)) {
    return 'TencentNewslite';
  }
  // 微信浏览器
  if (/MicroMessenger/i.test(ua)) {
    return 'wechat';
  }
  if (/qzone/ig.test(ua)) {
    return 'qzone';
  }
  // 手机qq
  if (/QQ\//.test(ua)) {
    return 'qq';
  }
  if (ua.match(/MQQBrowser[\s/]*(\d+(\.\d+)*)/i)) {
    return 'QQBrowser';
  }
  // 浏览器
  return 'Browser';
};

/**
 * 获取URL参数
 */
const getQueryString = (paramName) => {
  if (typeof window === 'undefined') {
    return '';
  }
  const getQueryValue = (key, str) => {
    const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`);
    const splitArr = str.split('?');
    if (!splitArr?.[1]) return null;
    const matchs = splitArr[1].match(reg);
    if (matchs !== null) {
      let final;
      try {
        final = decodeURIComponent(matchs[2]);
      } catch (e) {
        final = matchs[2]; // 解码失败时使用原始值
      }
      return final;
    }
    return null;
  };
  return getQueryValue(paramName, location.href) || '';
};

// 定义事件类型
const renderEvents = {
  link: 'link',
  refresh: 'refresh'
};

/** 灯塔点击上报 */
export const clickReport = (params) => {
  if (!params) return;
  const deChannel = getQueryString('deChannel') || '';
  const platform = checkPlateform();
  const defaultParams = {
    pathname: 'https://h5.news.qq.com/maker/prod/publish/pingpang.html',
    uuid: params.id,
    app: platform,
    platform,
    channel: deChannel,
    deChannel
  };
  
  // 确保window.beacon存在
  if (typeof window !== 'undefined' && window.beacon) {
    window.beacon.onUserAction('button_click', defaultParams);
  }
};

/** 灯塔页面曝光上报 */
export const viewReport = () => {
  const deChannel = getQueryString('deChannel') || '';
  const platform = checkPlateform();
  
  // 确保window.beacon存在
  if (typeof window !== 'undefined' && window.beacon) {
    window.beacon.onDirectUserAction('page_view', {
      pathname: 'https://h5.news.qq.com/maker/prod/publish/pingpang.html',
      app: platform,
      platform,
      channel: deChannel,
      deChannel
    });
  }
};
