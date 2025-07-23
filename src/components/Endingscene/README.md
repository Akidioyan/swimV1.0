# 游泳游戏结束页排行榜系统

## 系统架构

### 1. 核心组件
- **主组件**: `EndingScene.vue` - 根据用户环境（APP内/外）动态切换子组件
- **APP内组件**: `EndingSceneApp.vue` - 显示完整排行榜（前50名）
- **APP外组件**: `EndingSceneOutside.vue` - 显示简化排行榜（前10名）

### 2. 状态管理
- **gameStore.js**: 管理游泳游戏状态（距离、分数、星星等）
- **userStore.js**: 管理用户状态（登录、游戏次数、奖励等）

### 3. 数据流程
```
游戏结束 → gameStore更新数据 → EndingScene组件 → 上报API → 获取排行榜 → 渲染界面
```

## 主要功能

### 🏊‍♂️ 游戏数据管理
- 距离追踪（米）
- 分数/星星计数
- 游戏时长记录
- 奖杯系统

### 📊 排行榜显示
- **APP内**: 显示前50名完整排行榜，支持滚动
- **APP外**: 显示前10名精简排行榜
- **当前用户**: 高亮显示用户排名

### 🎮 游戏次数管理
- 每日游戏次数限制（基础5次）
- 分享奖励机制（额外3次）
- 次数耗尽提示

### 📱 环境适配
- 自动检测APP内/外环境
- 不同环境显示不同UI和功能
- 分享功能适配

## API接口

### 上报游戏结果
```javascript
POST /activity/pingpong_report
{
  "deviceId": "string",
  "qimei36": "string", 
  "hasLogin": boolean,
  "event": "swimming_game_ended",
  "distance": number,
  "score": number,
  "stars": number,
  "survivalTime": number,
  "gameTime": number,
  "gameEndReason": "string",
  "trophiesEarned": array
}
```

### 返回数据格式
```javascript
{
  "code": 0,
  "data": {
    "rankPercent": "85%",
    "currentUserEntry": {
      "rank": 156,
      "nick": "我",
      "distance": 500,
      "stars": 25
    },
    "leaderboardEntries": [...],
    "best": {
      "rank": 1,
      "distance": 1200,
      "stars": 80
    }
  }
}
```

## 模拟数据

当API调用失败时，系统会自动使用模拟数据：
- `mockLeaderboardData.js`: 生成合理的排行榜数据
- 智能算法确保数据的真实性
- 排名、昵称、分数等都符合游戏逻辑

## 使用方式

### 1. 在游戏结束时
```javascript
// 更新游戏数据
gameStore.updateSwimmingDistance(500)
gameStore.updateSwimmingScore(25)
gameStore.endSwimmingGame('completed')

// 切换到结束页
// EndingScene组件会自动处理数据上报和排行榜显示
```

### 2. 测试模式
当前使用乒乓球API进行测试，实际部署时只需要替换API端点即可。

## 响应式设计

- 支持不同屏幕尺寸
- 动态字体大小调整
- 移动端优化的滚动体验

## 状态持久化

- 游戏次数存储在localStorage
- 支持跨会话数据恢复
- 自动清理过期数据

## 错误处理

- API失败时自动降级到模拟数据
- 网络异常友好提示
- 数据格式容错处理 