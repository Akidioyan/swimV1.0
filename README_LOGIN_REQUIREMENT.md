# 🔐 端内APP登录要求功能

## 📋 功能概述

在腾讯新闻APP内的用户必须登录后才能进行游戏，确保能够获取用户信息进行排行榜统计。

## 🎯 实现原理

### 检测逻辑
```javascript
// 使用ua.js检测是否在腾讯新闻APP内
import { isQQNews } from '../utils/ua'

// 在userStore中检查登录状态
if (userStore.isInQQNewsApp && !userStore.hasLogin) {
  // 阻止游戏开始，要求登录
  return;
}
```

### 用户状态检查
- **`userStore.isInQQNewsApp`**: 通过 `isQQNews()` 函数检测，基于UserAgent判断
- **`userStore.hasLogin`**: 通过腾讯JSAPI获取登录状态

## 🚀 功能实现点

### 1. **主要游戏入口** - `IntroView.vue`
```javascript
const handleStartGame = async () => {
  // 检查端内APP用户是否已登录
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    console.log('🚫 端内APP用户未登录，无法开始游戏，自动触发登录');
    
    clickReport({ id: 'game_start_login_required' });
    
    try {
      await handleLogin(); // 自动触发登录流程
      return;
    } catch (error) {
      console.error('🚫 登录失败，无法开始游戏:', error);
      return;
    }
  }
  
  gameStateStore.startGame();
}
```

### 2. **端内结束页面重新开始** - `EndingSceneApp.vue`
```javascript
const handleRestartGame = async () => {
  // 检查端内APP用户是否已登录
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    console.log('🚫 端内APP用户未登录，无法重新开始游戏');
    clickReport({ id: 'restart_game_login_required' });
    return;
  }
  
  gameStateStore.restartGame();
}
```

### 3. **端外结束页面重新开始** - `EndingSceneOutside.vue`
```javascript
const handleRestartGame = () => {
  // 检查端内APP用户是否已登录
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    console.log('🚫 端内APP用户未登录，无法重新开始游戏');
    clickReport({ id: 'restart_game_login_required' });
    return;
  }
  
  gameStateStore.restartGame();
}
```

### 4. **游戏内设置重新开始** - `GameView/UI-top.vue`
```javascript
const restartGame = async () => {
  // 检查端内APP用户是否已登录
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    console.log('🚫 端内APP用户未登录，无法重新开始游戏');
    clickReport({ id: 'restart_game_settings_login_required' });
    return;
  }
  
  // 执行重新开始游戏的逻辑...
}
```

## 📊 用户体验流程

### 端内APP用户（未登录）
```
1. 点击"立即挑战" 
   ↓
2. 检测到未登录
   ↓  
3. 自动触发登录流程
   ↓
4. 用户完成登录后页面重新加载
   ↓
5. 再次点击"立即挑战"开始游戏
```

### 端内APP用户（已登录）
```
1. 点击"立即挑战"
   ↓
2. 检测到已登录
   ↓
3. 直接开始游戏
```

### 端外用户
```
1. 点击"立即挑战"
   ↓
2. 检测到在端外
   ↓
3. 直接开始游戏（使用假数据排行）
```

## 🔍 检查点覆盖

### 游戏开始入口
- ✅ **首页立即挑战按钮** (`IntroView.vue`)
- ✅ **端内结束页面再挑战按钮** (`EndingSceneApp.vue`) 
- ✅ **端外结束页面再挑战按钮** (`EndingSceneOutside.vue`)
- ✅ **游戏内设置重新开始按钮** (`GameView/UI-top.vue`)

### 数据收集点
- ✅ **登录要求触发事件**：`game_start_login_required`, `restart_game_login_required`, `restart_game_settings_login_required`
- ✅ **正常游戏开始事件**：`game_start`, `restart_game`, `restart_game_settings`

## ⚙️ 技术实现

### UA检测 (`src/utils/ua.js`)
```javascript
export function isQQNews() {
  return /qqnews/i.test(ua(true)); // 腾讯新闻app检测
}
```

### 用户状态初始化 (`src/stores/userStore.js`)
```javascript
async initEnvironment() {
  this.isInQQNewsApp = isQQNews();
  
  if (this.isInQQNewsApp) {
    try {
      const { isLogin } = await import('@tencent/qqnews-jsapi');
      this.hasLogin = await isLogin();
    } catch (error) {
      this.hasLogin = false;
    }
  }
}
```

### 登录流程 (`IntroView.vue`)
```javascript
const handleLogin = async () => {
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    try {
      const { login } = await import('@tencent/qqnews-jsapi');
      await login();
      location.reload(); // 登录后重新加载页面
    } catch (error) {
      console.error('登录失败:', error);
    }
  }
}
```

## 🎨 UI展示

### 登录提示区域
```vue
<!-- 登录提示区域：APP内未登录时显示 -->
<div v-if="shouldShowLoginPrompt" class="login-prompt-container" @click="handleLogin">
  <img src="/login.png" alt="点击登录" class="login-prompt-image">
</div>
```

### 显示条件
```javascript
const shouldShowLoginPrompt = computed(() => {
  return userStore.isInQQNewsApp && !userStore.hasLogin;
});
```

## 🛡️ 安全性考虑

1. **前端检查**：防止意外的游戏开始
2. **用户体验**：自动引导用户完成登录
3. **数据完整性**：确保排行榜数据的准确性
4. **状态同步**：登录状态与游戏状态保持一致

## 📈 数据统计

通过 `clickReport` 收集以下事件：
- `game_start_login_required`: 主页面要求登录次数
- `restart_game_login_required`: 结束页面要求登录次数  
- `restart_game_settings_login_required`: 设置页面要求登录次数
- `game_start`: 正常游戏开始次数
- `restart_game`: 正常重新开始次数
- `restart_game_settings`: 设置页面重新开始次数

这些数据可以帮助分析：
- 端内用户登录转化率
- 未登录用户的游戏尝试行为
- 不同入口的登录要求触发频率 