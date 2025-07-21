# qqnews-jsapi项目介绍
 - qqnews-jsapi(api组件库tnpm包)

 - 开发语言：ES6、TS

安装：tnpm install @tencent/qqnews-jsapi

CommonJS modules:
``` js
const { openUrl }  = require('qqnews-jsapi');
openUrl('');
```

Or use ES2015 modules:
``` js
import { openUrl } from 'qqnews-jsapi';
openUrl('');
```
x.x.x 版本号
Or use cdn link:
``` html
<script src="https://mat1.gtimg.com/qqcdn/tnewsh5/jsapi/x.x.x/qqnews-jsapi.min.js"></scirpt>
<script>
  QNJSAPI.openUrl('');
</script>
```

## config 说明
roullup 打包配置文件
- esm.js（打包ES2015 modules）
- min.js（打包js cdn link）
- umd.js（打包CommonJS modules）

## src 说明
- @types（jsapi相关类型声明文件）
- api（api调用function封装）
- utils 
  - polyfillUtils（工具类方法）
  - constant（常量文件封装）
- jsApi（调用新闻客户端api封装文件）


如何新增？ 以增加 `getAppInfo` 为例
```typescript
export enum ApiName {
  getAppInfo = 'getAppInfo',
}

// getAppInfo 客户端数据interface
export interface AppInfoRes {
  systemVersion: string; // 系统版本号(安卓6030用的int，6050起统一string)
  version: string; // 客户端版本号
  deviceId: string; // 设备id
  uid: string; // 设备uid
  omgMid: string; // omgMid
  omgBizid: string; // omgBizid
  // networkType
  networkStatus: NetworkType; // 网络状态。0-无网络、1-WiFi、2-移动网络
  idfa?: string; // 设备idfa（仅iOS）
  imei?: string; // 设备imei（仅安卓）
  oaid: string; // 广告标识符
  imsi?: string; // 设备imsi（仅Android）
  qimei: string; // 灯塔 qimei
  statusBarHeight?: number; // 安卓6.0.50添加，statusBar高度
}

/**
 * @description 获取客户端信息
 */
export const getAppInfo = (): Promise<AppInfoRes
& InvokeCommon> => promiseInvoke<AppInfoRes>({ eventName: ApiName.getAppInfo });
```

