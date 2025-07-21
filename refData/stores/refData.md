# 乒乓球挑战游戏 - 双端测试与排行榜数据调取技术文档

## 1. 双端测试架构概述

本项目实现了完整的双端测试架构，支持在腾讯新闻APP内和APP外两种环境下的不同用户体验。

### 1.1 核心设计理念
- **环境自动检测**：通过UA检测自动识别用户所在环境
- **动态组件切换**：根据环境动态加载不同的结束页组件
- **统一数据流**：两端共享相同的数据获取逻辑
- **差异化体验**：针对不同环境提供定制化的用户界面

## 2. 双端测试相关文件结构

### 2.1 环境检测文件

#### `refData/utils/ua.js`
```javascript
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
function isQQNews() {
  return /qqnews/i.test(ua(true)); // 腾讯新闻app，使用不区分大小写的正则
}
```

#### `refData/stores/userStore.js`
环境初始化逻辑：
```javascript
async initEnvironment() {
  console.log('[userStore] initEnvironment function called')
  this.loadPlayCountFromLocalStorage();
  if (typeof window !== 'undefined') {
    this.userAgent = window.navigator.userAgent
    
    // 开发模式下强制为 true（用于PC端调试）
    if (process.env.NODE_ENV === 'development') {
      this.isInQQNewsApp = true;
      console.warn('[Dev Mode] isInQQNewsApp has been forced to true');
    } else {
      this.isInQQNewsApp = isQQNews()
    }
    
    // 获取设备ID
    this.deviceId = getOrCreateDeviceId()
    
    // 如果在腾讯新闻APP内，获取APP特有信息
    if (this.isInQQNewsApp) {
      try {
        setActionBtnStyle({ type: 1 });
        const appInfo = await getAppInfo()
        this.qimei36 = appInfo.QIMEI36
        const loginStatus = await isLogin()
        this.hasLogin = loginStatus.hasLogin
      } catch (error) {
        console.error('[userStore] Error fetching QQNews App info:', error)
      }
    }
  }
}
```

### 2.2 组件架构文件

#### `refData/components/EndingScene.vue`
动态组件路由器：
```vue
<template>
  <component :is="currentEndingScene" />
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import EndingSceneApp from './EndingSceneApp.vue'
import EndingSceneOutside from './EndingSceneOutside.vue'

const userStore = useUserStore()

const currentEndingScene = computed(() => {
  return userStore.isInQQNewsApp ? EndingSceneApp : EndingSceneOutside
})
</script>
```

#### `refData/components/EndingSceneApp.vue`
APP内结束页组件（针对腾讯新闻APP内用户）

#### `refData/components/EndingSceneOutside.vue`
APP外结束页组件（针对浏览器用户）

### 2.3 APP拉起与下载功能

#### `refData/utils/appDownload.js`
```javascript
// 环境检测函数
export const isWeixin = (userAgent) => /MicroMessenger/i.test(ua(true, userAgent));
export const isQQ = (userAgent) => /qq\/i.test(ua(true, userAgent));

// 腾讯新闻APP信息配置
export const QQNewsAppDownloadInfo = {
  packageName: 'com.tencent.news',
  downloadUrl: 'http://dldir1.qq.com/dlomg/inews/TencentNews_13690.apk',
  wxAppId: 'wx073f4a4daff0abe8',
  appleStoreId: '399363156',
  appName: '腾讯新闻-打开眼界',
};

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
  
  // 如果在微信或QQ内，先检查APP是否安装
  if (isWeixin() || isQQ()) {
    const isInstalled = await app.checkAppIsInstalled();
    if (!isInstalled) {
      return window.open(`${DOWNLOAD_URL}&srcFrom=${srcFrom || 'pingpong'}`);
    }
  }
  
  // 尝试拉起APP
  app.downloadApp({ openUrl: url });
};
```

## 3. 排行榜数据调取系统

### 3.1 API接口定义

根据 `refData/utils/api_spec_updated.csv`：

- **API ①**: `POST /api/activity/pingpong/init` - 初始用户数据上报
- **API ②**: `GET /api/activity/pingpong/pv` - 获取活动总人数
- **API ③**: `POST /api/activity/pingpong/result` - 游戏结束数据上报并获取排行榜

### 3.2 核心API调用文件

#### `refData/utils/request.js`

```javascript
/**
 * 提交游戏结果并获取真实排行榜数据
 */
export async function submitAndFetchRealLeaderboardData(gameData) {
  const userStore = useUserStore()
  const gameStore = useGameStore()
  
  const requestBody = {
    deviceId: userStore.deviceId,
    qimei36: userStore.qimei36,
    hasLogin: userStore.hasLogin,
    isInQQNewsApp: userStore.isInQQNewsApp,
    userAgent: userStore.userAgent,
    event: 'game_ended',
    data: {
      levelsCompleted: gameData.levelsCompleted,
      ballsUsed: gameData.ballsUsed,
      gameEndReason: gameData.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies
    }
  }
  
  return await request('/activity/pingpong/result', {
    method: 'POST',
    body: JSON.stringify(requestBody)
  })
}

/**
 * 获取活动总人数
 */
export async function getPingPangPV() {
  return await request('/activity/pingpong/pv', {
    method: 'GET'
  })
}
```

### 3.3 排行榜数据处理逻辑

#### 在 `refData/components/EndingSceneApp.vue` 中：

```javascript
onMounted(async () => {
  try {
    const gameData = {
      levelsCompleted: gameStore.sessionLevelsCompleted,
      ballsUsed: gameStore.sessionBallsUsed,
      gameEndReason: gameStore.gameEndReason
    }
    
    const response = await submitAndFetchRealLeaderboardData(gameData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value = {
          ...currentUserData.value,
          rankPercent: response.data.rankPercent
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboard && Array.isArray(response.data.leaderboard)) {
        top50Data.value = response.data.leaderboard
      }
      
      // 更新点亮的奖杯
      if (response.data.best && response.data.best.trophies) {
        litTrophies.value = response.data.best.trophies
      }
    }
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
    // 使用模拟数据作为后备
    const mockData = generateMockLeaderboardData()
    top50Data.value = mockData.top50Data
    currentUserData.value = mockData.currentUserData
  }
})
```

### 3.4 模拟数据支持

#### `refData/utils/mockLeaderboardData.js`

```javascript
/**
 * 生成模拟排行榜数据
 * @returns {Object} 包含top50Data和currentUserData的对象
 */
export function generateMockLeaderboardData() {
  const top50Data = []
  
  // 生成前50名数据
  for (let i = 1; i <= 50; i++) {
    top50Data.push({
      rank: i,
      nickname: getRandomNick(),
      levelsCompleted: getRandomInt(1, 99),
      ballsUsed: getRandomInt(50, 500)
    })
  }
  
  // 生成当前用户数据
  const currentUserData = {
    rank: getRandomInt(51, 10000),
    rankPercent: getRandomInt(10, 90),
    nickname: '我',
    levelsCompleted: getRandomInt(1, 20),
    ballsUsed: getRandomInt(50, 200)
  }
  
  return { top50Data, currentUserData }
}
```

## 4. 双端测试流程

### 4.1 开发环境测试

1. **强制APP内环境**：
   ```javascript
   // 在 userStore.js 中
   if (process.env.NODE_ENV === 'development') {
     this.isInQQNewsApp = true; // 强制为APP内环境
   }
   ```

2. **启动开发服务器**：
   ```bash
   npm run dev
   ```

3. **查看APP内结束页**：访问 `http://localhost:5173` 查看 `EndingSceneApp.vue`

### 4.2 生产环境测试

1. **APP外测试**：
   - 在普通浏览器中访问
   - 显示 `EndingSceneOutside.vue`
   - 包含"打开APP解锁全部关卡"按钮

2. **APP内测试**：
   - 在腾讯新闻APP内访问
   - 显示 `EndingSceneApp.vue`
   - 包含"解锁全部99局挑战"按钮

### 4.3 网络请求监控

在浏览器开发者工具中：
1. 打开 Network 面板
2. 过滤 XHR/Fetch 请求
3. 搜索 `pingpong` 关键词
4. 观察以下API调用：
   - `/api/activity/pingpong/init`
   - `/api/activity/pingpong/pv`
   - `/api/activity/pingpong/result`

## 5. 关键技术特性

### 5.1 环境检测精确性
- 使用正则表达式 `/qqnews/i` 检测腾讯新闻APP
- 支持大小写不敏感匹配
- 兼容SSR渲染环境

### 5.2 数据一致性保障
- 统一的API调用接口
- 共享的状态管理（Pinia）
- 一致的错误处理机制

### 5.3 用户体验优化
- 无缝的环境切换
- 智能的APP拉起逻辑
- 优雅的降级处理

### 5.4 开发调试支持
- 开发模式强制环境设置
- 详细的控制台日志
- 模拟数据后备方案

## 6. 部署与维护

### 6.1 环境变量配置
- 开发环境：`VITE_API_BASE_URL=/api`
- 生产环境：`VITE_API_BASE_URL=https://w.inews.qq.com`

### 6.2 依赖包管理
- `@tencent/gh-qqnews-downapp@1.5.5` - APP下载拉起功能
- `@tencent/qqnews-jsapi` - 腾讯新闻JSAPI集成

### 6.3 监控与日志
- 完整的用户行为日志记录
- API调用状态监控
- 错误异常捕获处理

## 7. 文件清单

### 7.1 核心文件
- `refData/utils/ua.js` - 环境检测工具
- `refData/stores/userStore.js` - 用户状态管理
- `refData/components/EndingScene.vue` - 动态组件路由器
- `refData/components/EndingSceneApp.vue` - APP内结束页
- `refData/components/EndingSceneOutside.vue` - APP外结束页
- `refData/utils/request.js` - API请求工具
- `refData/utils/appDownload.js` - APP拉起功能

### 7.2 数据文件
- `refData/utils/api_spec_updated.csv` - API接口规范
- `refData/utils/mockLeaderboardData.js` - 模拟数据生成
- `refData/game/trophyTypes.js` - 奖杯类型定义

### 7.3 配置文件
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `package.json` - 项目依赖配置

这套双端测试架构确保了游戏在不同环境下都能提供最佳的用户体验，同时为开发和维护提供了完善的工具支持。