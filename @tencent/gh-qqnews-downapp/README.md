# 腾讯系打开和下载 APP

在微信，手机 QQ，腾讯视频等各种 APP 中的网页，能检测本地是否有安装 app，若已安装则打开 app，若未安装，则按指定的地址进行下载。

请注意：**当前功能只能在`*.qq.com`域名的网页中使用，其他域名调用当前模块是没有效果的**。

- demo 页面地址：[https://testgh.sparta.html5.qq.com/show/sdk-demo/index.html](https://testgh.sparta.html5.qq.com/show/sdk-demo/index.html) ，当前链接可在微信、手 Q、腾讯新闻、QQ 音乐和浏览器中打开测试！
- 其他公共库：[https://mirrors.tencent.com/#/private/npm/detail?repo_id=537&project_name=%40tencent%2Fgh-qqnews-sdk](https://mirrors.tencent.com/#/private/npm/detail?repo_id=537&project_name=%40tencent%2Fgh-qqnews-sdk)

## 安装

使用 npm:

```shell
$ npm install @tencent/gh-qqnews-downapp --save
```

使用 yarn:

```shell
$ yarn add @tencent/gh-qqnews-downapp
```

## 使用

使用方法，以 ES2015 的方式为例：

```javascript
import AppDownload from '@tencent/gh-qqnews-downapp';

const downapp = new AppDownload({
  openUrl: 'qqnews://article_9527?nm=RSS2018061501588400',
  packageName: 'com.tencent.news',
  downloadUrl: 'http://dldir1.qq.com/dlomg/inews/channel/TencentNews_3932.apk',
  wxAppId: 'wx073f4a4daff0abe8',
  appleStoreId: '399363156',
  appName: '腾讯新闻--百万现金红包派发中...',
  downLogo: 'http://mat1.gtimg.com/news/news/logo.png',
  developer: '腾讯科技有限公司',
  appVersion: '', // 要下载APP的版本号，参见下面参数讲解的部分
  privacyUrl: '', // 隐私政策，http链接
  permissionUrl: '', // 权限详情，http链接
});

// 监听是否开始下载
downapp.on('downloadStart', function () {
  // 开始下载
  alert('开始下载');
});

// 获取APP的安装状态
downapp.checkAppIsInstalled(function (status) {
  if (status) {
    document.querySelector('.btn').innerText = '打开新闻客户端';
  }
});

document.querySelector('.btn').addEventListener('click', function () {
  downapp.run();
});
```

## 参数说明

以下参数均为非必填参数。参数可以按照需要随意进行传入，若没有传入，则使用默认值。

> 默认值配置的都是腾讯新闻 APP 相关的信息，若不符合您的 APP 时，请一定要传入对应的值进行覆盖。

| 名称          | 说明                                                 | 默认值                                                                                                                |
| :------------ | :--------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| openUrl       | 打开地址                                             | qqnews://article_9500                                                                                                 |
| packageName   | APP 的包名                                           | com.tencent.news                                                                                                      |
| downloadUrl   | Android 系统里 APP 的下载地址                        | http://dldir1.qq.com/dlomg/inews/channel/TencentNews_3932.apk                                                         |
| wxAppId       | 在微信公众号注册的 ID，打开时能显示要打开 APP 的名称 | wx073f4a4daff0abe8                                                                                                    |
| appleStoreId  | iOS 系统里跳转到 app store 的 ID                     | 399363156                                                                                                             |
| appName       | Android 微信的中间下载页展示的标题                   | 腾讯新闻--百万现金红包派发中...                                                                                       |
| downLogo      | Android 微信的中间下载页展示的 logo                  | http://mat1.gtimg.com/news/news/logo.png                                                                              |
| developer     | 开发者，如“腾讯公司”                                 | 腾讯科技(北京)有限公司                                                                                                |
| appVersion    | 要下载 APP 的版本号                                  | 空                                                                                                                    |
| privacyUrl    | 隐私政策的链接                                       | https://privacy.qq.com/document/priview/4bd0bd84be654afe8c1a545ea9b64ec8                                              |
| permissionUrl | 权限详情的链接                                       | https://dldir1.qq.com/weixin/android/wechat_webview_download_appinfo_new.html?fun=permission&package=com.tencent.news |

developer、appVersion、privacyUrl 和 permissionUrl，根据工信部的要求，目前在 Android 版微信中是必传项，否则会导致无法下载 APP。

不过若下载的是`腾讯新闻`的话，这 4 个参数均可以不传入，组件内部有个判断，若`appVersion`的值为假（不传，或传入空字符串等），则自动从[https://api.prize.qq.com/v1/newsapp/answer/other/config?actname=download_app_info](https://api.prize.qq.com/v1/newsapp/answer/other/config?actname=download_app_info)接口获取腾讯新闻的 4 要素信息。

但若是下载的`其他 APP`，请注意一定要传入这 4 个参数。

## 方法说明

### checkAppIsInstalled

checkAppIsInstalled 的回调函数里，会返回一个 boolean 类型的数据，表示要检测 APP 的安装状态：`true`表示已安装， `false`表示未安装。

同时，有几个额外的情况要明确下：

1. 不在白名单中的 APP，使用当前方法检测，会直接返回`false`，不论当前设备是否已安装了 APP；
2. 浏览器中，默认返回 false！

```javascript
// 获取APP的安装状态
downapp.checkAppIsInstalled(function (isInstalled) {
  if (isInstalled) {
    alert('已安装');
  } else {
    alert('未安装');
  }
});
```

并且支持 Promise 类型：

```javascript
async function AA() {
  const isInstalled = await downapp.checkAppIsInstalled();
  console.log(isInstalled);
}
```

### run

调用`run()`方法后，若本设备已安装 APP，则直接打开指定的 openUrl；若未安装，则执行下载动作。当前方法不传参时，则打开初始化配置的 openUrl；否则打开传入的链接地址。

> 在打开未检测到安装状态的 APP 时，思路是首先尝试去拉起 APP，然后延迟下载。当拉起失败时，则执行到下载操作。在有时候操作过程中，会偶现明明已经拉起了客户端，但比如 QQ、浏览器中依然跳转到了下载的步骤！说明定时器没有被及时地清理！

```javascript
document.querySelector('.btn').addEventListener('click', function () {
  downapp.run(); // 打开
});

document.querySelector('.btn').addEventListener('click', function () {
  downapp.run('qqnews://article_9527?nm=20190307A0WEXN00'); // 打开
});
```

### openApp

只打开或尝试打开 APP，打开失败时，没有任何后续的操作。使用方式与`run()`方法一样，既可以传入参数，也可以不传！

在微信中打开时，若成功打开，则返回`Promise.resolve`的结果；若没有要打开的 APP，则会返回`Promise.reject`;

```javascript
document.querySelector('.btn').addEventListener('click', function () {
  downapp.openApp(); // 打开
});

document.querySelector('.btn').addEventListener('click', function () {
  downapp.openApp('qqnews://article_9527?nm=20190307A0WEXN00'); // 打开
});
```

### download

只下载初始化时配置的 APP，该方法无参数！

```javascript
// 下载
document.querySelector('.btn').addEventListener('click', function () {
  downapp.download();
});
```

### getNetworkType

获取网络的状态，type 有 3 个返回值：

- none: 无连接；
- wifi: wifi 状态
- wwan: 流量状态

```javascript
// 回调函数的方式
downapp.getNetworkType(function (type) {
  alert(type);
});

// Promise的方式
downapp.getNetworkType().then((type) => {
  alert(type);
});
```

### showBrowserGuide

在无法打开或者下载第三方 APP 的软件中，可以引导用户去浏览器打开，执行该方法后，会在页面中展示一个蒙层，指引用户点击“右上角”中的浏览器打开该页面。

```javascript
downapp.showBrowserGuide();
```

### showAppInfo

在 Android 中展示下载 5 要素，在 iOS 中展示打开按钮。

默认不用传任何参数：

```javascript
downapp.showAppInfo();
```

或者您可以传入一个 object 类型的参数，各字段均为可选，含义：

| 字段      | 类型              | 是否必选 | 含义                   | 默认值                       |
| :-------- | :---------------- | :------- | :--------------------- | ---------------------------- |
| container | string \| Element | 否       | 五要素展示区域的选择器 | document.body                |
| btnText   | string            | 否       | 按钮的文本             | 打开腾讯新闻 或 下载腾讯新闻 |
| color     | string            | 否       | 按钮的背景颜色         | #03CEBE                      |
| onClick   | () => void        | 否       | 按钮的点击事件         | 打开或者下载 APP             |
| config    | object            | 否       | 五要素                 | 新闻客户端的 5 要素          |

上面任何参数都是可选的。

config 里的字段：

```javascript
interface ShowInfoType {
  appname: Appname; // APP名称
  name: Appname; // 公司名称
  quanxian: AppnameUrl; // 权限的URL链接
  ver: Appname; // app版本号
  yinsi: AppnameUrl; // 隐私的URL链接
}
```

传入参数时：

```javascript
downapp.showAppInfo({
  // 可传入字符串或dom元素，五要素默认添加到body中，设置该属性，可以修改五要素添加的位置
  container: '.App',

  // 按钮的文案
  btnText: '腾讯新闻领取福利',

  // 按钮的点击事件，默认是打开/下载APP事件，即downapp.run();
  onClick() {
    console.log(Math.random());
  },
});
```

## 可监听的事件

### downloadStart

Android 下开始安装时触发

```javascript
// 开始下载时触发
downapp.on('downloadStart', function () {
  // 开始下载
  alert('开始下载');
});
```

### downloadSteps

在下载过程中执行，目前仅在 Android 版的手机 QQ 和腾讯视频里支持进度展示；iOS 里会自动跳转到 app store 里下载，无法监听到进度

```javascript
// 下载过程中
downapp.on('downloadSteps', function (step) {
  // step为当前的进度，取值0-100
  console.log(step);
});
```

### cancel

Android 版微信的下载中间页里，点击左上角的返回按钮取消下载

```javascript
// 点击左上角返回
downapp.on('cancel', function () {
  alert('返回啦');
});
```

### removed

Android 版微信的下载中间页里，已经开始下载，然后点击“取消下载”触发

```javascript
// 取消下载
downapp.on('removed', function () {
  alert('取消下载');
});
```

## 可能会出现的问题

在使用这个 js 文件过程中，有可能会出现下面的几个问题：

### 4.1 在微信或 QQ 中，没有任何反应

答： 请确认您项目当前的域名为`*.qq.com`中

### 4.2 微信中正常，QQ 中不能正常的打开或下载

答： QQ 中有一些特殊的 api 属于敏感 jsapi，需要将域名加入到他们的白名单中，才可以正常的使用

### 4.3 已经安装了 APP，点击打开了 APP，但又启动了下载

答： 在一些没有接入 jsapi 的场景中（如浏览器中），我们无法判断是否已安装了 APP，因此我们执行的是“尝试打开，然后延迟下载”的策略，那么在一些设备上启动 APP 比较慢时，会导致后续执行下载的定时器没有被挂起，然后开始执行下载过程。这是属于正常现象，或者您有更好的策略，也欢迎探讨。

### 4.4 微信或企业微信中，展示去浏览器打开的指引

因政策或白名单的缘故，有些功能无法正常使用，如 Android 微信中无法下载第三方 APP，iOS 企业微信无法跳转到 app store 等。这里改成了引用用户去浏览器打开该页面。
