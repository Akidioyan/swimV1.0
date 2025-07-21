# 前端中常用的工具方法

在日常工作中，我们积累了很多的工具方法，帮助我们提升效率。

- demo 页面地址：[https://testgh.sparta.html5.qq.com/show/sdk-demo/index.html](https://testgh.sparta.html5.qq.com/show/sdk-demo/index.html) ，当前链接可在微信、手 Q、腾讯新闻、QQ 音乐和浏览器中打开测试！
- 其他公共库：[https://mirrors.tencent.com/#/private/npm/detail?repo_id=537&project_name=%40tencent%2Fgh-qqnews-sdk](https://mirrors.tencent.com/#/private/npm/detail?repo_id=537&project_name=%40tencent%2Fgh-qqnews-sdk)

## 安装

使用 npm:

```shell
$ npm install @tencent/gh-qqnews-utils --save
```

使用 yarn:

```shell
$ yarn add @tencent/gh-qqnews-utils
```

## 模块的名称

当前工具包中有如下的工具列表，各位开发者可以按需引入：

- cookie: 操作 cookie；
  - [setCookie](#cookie): 设置 cookie；
  - [getCookie](#cookie): 获取 cookie；
  - [delCookie](#cookie)：删除 cookie；
- date: 日期和时间的操作；
  - [isSameDay](#isSameDay): 两个时间戳或格式化的字符串是否在同一天；
  - [formatTime](#formatTime): 将时间戳转为格式化的字符串；
  - [getWeekStartAndEnd](#getWeekStartAndEnd): 获取当前星期的起始日期和结束日期
  - [sleep](#sleep): 延迟一段时间执行；
- string：字符串操作；
  - [strReplace](#strReplace): 替换字符串中{key}为具体的数据；
  - [truncate](#truncate): 截取字符串；
  - [loadScript](#loadScript): 加载 js 文件；
- ua：常用的 ua 判断
  - [getSystemInfo](#getSystemInfo): 获取当前系统和版本号；
  - [getBrowserInfo](#getBrowserInfo): 获取当前 APP 和版本号；
- url：URL 操作；
  - [getQueryString](#getQueryString): 获取 url 查询字符串中的参数；
  - [isAbsolute](#isAbsolute): url 是否是绝对地址；
  - [http2https](#http2https): 将 http 类型链接转为 https；
- [visibility](#visibility)： 页面的可见性；

## 引入

### 直接引入

```javascript
import cookie from '@tencent/gh-qqnews-utils/cookie';
```

或者

```javascript
import { setCookie, getCookie, delCookie } from '@tencent/gh-qqnews-utils';
```

## 如何使用

### cookie

操作 cookie

```javascript
import { setCookie, getCookie, delCookie } from '@tencent/gh-qqnews-utils';

setCookie('name', 'skeetershi', 30); // 设置cookie，有效期为30天，默认为365天
getCookie('name'); // 获取cookie
delCookie('name'); // 删除cookie
```

### date

日期的方法(date)

引入：

```javascript
import * as date from '@tencent/gh-qqnews-utils/date';

// 或单独按照方法分别引用也可以
import { isSameDay, formatTime, getWeekStartAndEnd, sleep } from '@tencent/gh-qqnews-utils';
```

#### isSameDay

判断两个日期或时间戳是否在同一天

第二个参数缺省时则使用当前时刻的时间戳进行比较。

```javascript
isSameDay('2020/05/06', '2020/05/07'); // 判断两个日期是否是同一天
isSameDay(1591283730344, 1591283720344); // 判断两个毫秒级的时间戳是否在同一天
isSameDay(1591283730344); // 判断此时间戳与当前时刻是否是同一天
```

#### formatTime

格式化时间戳。

根据输入的格式，格式化时间戳。

```javascript
/**
 * 格式化时间，时间戳->格式化
 * @param timestamp 传入的时间戳，单位（毫秒）
 * @param format 格式：yyyy/MM/dd hh:mm:ss
 * yyyy/MM/dd hh:mm:ss 分别表示年/月/日 时:分:秒
 */
formatTime(1591283730344, 'yyyy/MM/dd hh:mm:ss'); // 2020/06/04 23:15:30
formatTime(1591283730344, 'yyyy年MM月dd日 hh时mm分ss秒'); // 2020年06月04日 23时15分30秒
formatTime(1591283730344, 'hh:mm:ss'); // 23:15:30
```

#### getWeekStartAndEnd

获取给定时间戳的周一和周日的时间

格式的要求跟上面的一样。

```javascript
/**
 * 获取当前星期的起始日期和结束日期
 * @param {string} startFormat 周一的时间格式
 * @param {string} endFormat   周日的时间格式
 * @param {number} timestamp   所在周的时间戳，若不传入，则默认使用当前时刻的时间戳
 * @returns {string, string} {startDate, endDate} 返回的数据
 */

getWeekStartAndEnd('MM月dd日', 'MM月dd日', 1591283730344);
/**
 * startDate: "06月01日"
 * endDate: "06月07日"
 */
```

#### sleep

延迟一段时间后执行

```javascript
sleep(1000).then(() => {
  console.log('1000ms 后执行当前代码');
});

async function fn() {
  await sleep(800);
  console.log('800ms 后执行');
}
```

### string

字符串操作(string)

#### 引入

```javascript
import { strReplace, truncate, loadScript } from 'gh-qqnews-utils/string';
```

#### strReplace

替换字符串中的变量

```javascript
const str = 'my name is {name}, my age is {age}'; // 注意，此括号不是ES6中模板字符串的变量

strReplace(str, {
  name: 'wenzi',
  age: 24,
}); // "my name is wenzi, my age is 24"
```

#### truncate

截取字符串，并添加后缀

按照规定的长度 size 截取字符串，若 size 大于等于字符串的长度，或 size 小于等于 0，则字符串原样返回。

若 size 符合要求，则正常截取字符串，一个中文字符按照 1 个长度计算；结尾默认`...`结束，不过可以自行选择。

```javascript
truncate('hello world', 12); // hello world
truncate('hello world', 11); // hello world
truncate('hello world', 4); // hell...
truncate('hello world', 4, '***'); // hell***
```

#### loadScript

加载一个 js 文件

```javascript
loadScript('https://mat1.gtimg.com/libs/jquery/jquery-1.11.1.js')
  .then(() => {
    console.log('load js success');
  })
  .catch(() => {
    console.error('load js failed');
  });
```

### ua

获取 ua 中的数据(ua)

#### 引入

```javascript
import { getSystemInfo, getBrowserInfo } from 'gh-qqnews-utils/ua';
```

| 字段        | 数值                           | 说明                |
| ----------- | ------------------------------ | ------------------- |
| name        | iphone\|ipad\|android\|windows | 操作系统的名称      |
| version     | 6.0.1                          | 版本号              |
| ios         | true                           | 是否是 iOS 系统     |
| android     | false                          | 是否是 Android 系统 |
| manufacture | huawei                         | 手机的品牌          |
| model       | mt7-cl00                       | 型号                |
| build       | mt7-cl00                       | 构建的流水线        |

#### getSystemInfo

获取系统级的数据

```javascript
getSystemInfo();
/*
// iOS系统
{
    android: false,
    ios: true,
    manufacture: "",
    name: "iphone",
    version: "13.2.3"
}

// android系统
{
    android: true,
    ios: false,
    name: "android",
    version: "5.0",
    manufacture: "huawei",
    model: 'mt7-cl00',
    build: 'mt7-cl00'
}
*/
```

#### getBrowserInfo

获取所在 APP 或者浏览器的数据

```javascript
getBrowserInfo();
/*
// iOS系统
{
    name: "safari",
    version: "604.1",
    app: {
        weixin: true,
        qq: false
    }
}

// android
{
    name: "chrome",
    version: "81.0",
    app: {
        weixin: true,
        qq: false
    }
}
*/
```

### url

操作 url

#### 引入

```javascript
import { getQueryString, isAbsolute, http2https } from '@tencent/gh-qqnews-utils';
// format与stringify的操作一样
```

#### getQueryString

获取 url 查询字符串中的参数；

```javascript
getQueryString('name'); // abcd
getQueryString('name', '?name=abcd&age=123'); // abcd
```

#### isAbsolute

是否是绝对路径的链接

```javascript
isAbsolute('http://www.xiabingbao.com'); // true
isAbsolute('https://www.xiabingbao.com'); // true
isAbsolute('//www.xiabingbao.com'); // true
isAbsolute('qqnews://article_9500'); // true
isAbsolute('/article/1.html'); // false
```

#### http2https

将`http://`开头的链接改为`https://`的，其他格式的保持不变，原样返回。

```javascript
http2https('http://www.xiabingbao.com'); // https://www.xiabingbao.com
http2https('https://www.xiabingbao.com'); // https://www.xiabingbao.com
http2https('//www.xiabingbao.com'); // //www.xiabingbao.com
```

### visibility

页面可见性的检测

#### 引入

```javascript
import PageVisibility from 'gh-qqnews-utils/visibility';
```

#### 使用

```javascript
const visibility = new PageVisibility();

// 监听当前页面的变化
visibility.visibilityChange((isShow) => {
  console.log(isShow); // 可见性切换时触发
});

// 直接获取当前页面的可见性
visibility.isShow(); // 当前页面的可见性

visibility.destory(); // 销毁 visibilityChange 监听事件
```
