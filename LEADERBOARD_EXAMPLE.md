# 游泳游戏排行榜使用示例

## 快速开始

### 1. 基本集成

```vue
<template>
  <div>
    <!-- 游戏结束后显示排行榜 -->
    <EndingScene v-if="gameEnded" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import EndingScene from '@/components/Endingscene/EndingScene.vue'

const gameStore = useGameStore()
const gameEnded = ref(false)

// 游戏结束处理
const handleGameEnd = () => {
  // 更新游戏数据
  gameStore.updateSwimmingDistance(500)  // 游泳了500米
  gameStore.updateSwimmingScore(25)      // 获得25颗星星
  gameStore.endSwimmingGame('completed') // 游戏正常完成
  
  // 显示排行榜
  gameEnded.value = true
}
</script>
```

### 2. 手动设置游戏数据

```javascript
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

// 开始游戏
gameStore.startSwimmingGame()

// 更新游戏进度
gameStore.updateSwimmingDistance(300)  // 距离
gameStore.updateSwimmingScore(15)      // 分数/星星
gameStore.updateSurvivalTime(120)      // 生存时间120秒

// 添加奖杯
gameStore.earnSwimmingTrophy('DISTANCE_500M')

// 结束游戏
gameStore.endSwimmingGame('completed')
```

### 3. 用户环境管理

```javascript
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()

// 初始化用户环境
await userStore.initEnvironment()

// 检查是否可以游戏
if (userStore.canPlay) {
  console.log(`剩余次数: ${userStore.remainingPlays}`)
  // 开始游戏
} else {
  console.log('今日游戏次数已用完')
  // 显示分享提示
}

// 授予奖励次数（通过分享获得）
userStore.grantBonusPlays(3)
```

## 测试工具

### 使用测试组件

创建测试页面 `/test-leaderboard`：

```vue
<template>
  <EndingSceneTest />
</template>

<script setup>
import EndingSceneTest from '@/components/EndingSceneTest.vue'
</script>
```

### 测试不同场景

1. **APP内环境测试**：
   - 完整排行榜（前50名）
   - 分享功能
   - 登录状态显示

2. **APP外环境测试**：
   - 简化排行榜（前10名）
   - 打开APP提示
   - 分享箭头指引

3. **游戏次数测试**：
   - 次数耗尽提示
   - 分享获取奖励
   - 禁用按钮状态

## API 数据格式

### 上报数据
```javascript
{
  "deviceId": "device_123",
  "qimei36": "qimei_456", 
  "hasLogin": true,
  "event": "swimming_game_ended",
  "distance": 500,        // 游泳距离（米）
  "score": 25,           // 分数
  "stars": 25,           // 星星数
  "survivalTime": 120,   // 生存时间（秒）
  "gameTime": 180,       // 总游戏时间（秒）
  "gameEndReason": "completed",  // 结束原因
  "trophiesEarned": ["DISTANCE_500M"]  // 获得的奖杯
}
```

### 返回数据
```javascript
{
  "code": 0,
  "data": {
    "rankPercent": "85%",  // 超越百分比
    "currentUserEntry": {
      "rank": 156,
      "nick": "我",
      "distance": 500,
      "stars": 25
    },
    "leaderboardEntries": [
      {
        "rank": 1,
        "nick": "游泳健将_001",
        "distance": 1200,
        "stars": 80
      }
      // ... 更多排行数据
    ],
    "best": {              // 历史最好成绩
      "rank": 1,
      "distance": 1200,
      "stars": 80
    }
  }
}
```

## 样式定制

### 修改排行榜颜色
```css
/* 当前用户行高亮 */
.current-user-row {
  background-color: #3DCD58; /* 绿色 */
}

/* 前三名特殊颜色 */
.top-rank-text {
  color: #3DCD58;
  font-weight: bold;
}

/* 排行榜背景 */
.leaderboard-container {
  background-color: transparent;
}
```

### 自定义等级图片
```javascript
// 在组件中修改等级图片逻辑
const rankImageSrc = computed(() => {
  const distance = gameData.value.currentDistance || 0
  if (distance < 100) return '/ranks/beginner.png'      // 新手
  else if (distance < 300) return '/ranks/amateur.png'  // 业余
  else if (distance < 600) return '/ranks/pro.png'      // 专业
  else if (distance < 1000) return '/ranks/expert.png'  // 专家
  else return '/ranks/master.png'                       // 大师
})
```

## 故障排除

### 常见问题

1. **排行榜不显示**
   - 检查 `gameStore.distance` 和 `gameStore.stars` 是否有值
   - 确认 `endSwimmingGame()` 已调用

2. **API 调用失败**
   - 网络问题会自动降级到模拟数据
   - 检查控制台错误信息

3. **环境检测错误**
   - 开发模式下会强制为APP内环境
   - 生产环境依赖 User-Agent 检测

### 调试技巧

```javascript
// 开启详细日志
localStorage.setItem('debug', 'true')

// 查看当前状态
console.log('Game State:', gameStore.$state)
console.log('User State:', userStore.$state)

// 强制设置环境
userStore.isInQQNewsApp = true  // 模拟APP内
userStore.hasLogin = true       // 模拟已登录
```

## 下一步

1. 替换测试API为正式API
2. 添加更多游戏数据字段
3. 实现实时排行榜更新
4. 添加更多奖杯类型 