# 障碍物和道具生成系统

## 概述

全新的障碍物和道具生成系统，基于60级精确难度控制，实现动态概率分布和数量控制。

## 系统特点

### 1. 60级难度系统
- **等级计算**：每12米为一个等级，共60级
- **距离范围**：第n级 = [(n-1)×12, n×12]米
- **数量递增**：从1级8个对象线性递增至60级60个对象

### 2. 动态概率分布

#### 障碍物类型
- **obs1（静止障碍物）**：
  - 1-5级：100%（仅有obs1）
  - 6-60级：从70%逐步下调至30%
  
- **obs2（移动障碍物）**：
  - 6级开始：10%
  - 60级达到：29%
  
- **obs3（自定义障碍物）**：
  - 10级开始：10%
  - 60级达到：25%

#### 道具类型
- **snorkel（冲刺道具）**：
  - 1级：15%
  - 60级：1%（线性递减）
  
- **star（得分道具）**：
  - 1级：50%
  - 60级：15%（线性递减）

### 3. 精确计算公式

#### 对象总数量
```javascript
数量 = 8 + round((60-8)/(60-1)×(n-1))
```

#### 道具概率计算
```javascript
// snorkel概率
snorkel = 15 - round((15-1)/(60-1)×(n-1))

// star概率  
star = 50 - round((50-15)/(60-1)×(n-1))
```

## 系统架构

### 主要文件

1. **obstacleConfig.js** - 核心配置和计算函数
2. **gameStore.js** - 生成逻辑实现
3. **ObstacleManager.js** - 障碍物生命周期管理

### 核心函数

```javascript
// 计算当前等级
calculateLevel(distance)

// 计算对象数量  
calculateObjectCount(level)

// 计算概率分布
calculateProbabilities(level)

// 选择对象类型
selectObjectType(probabilities)
```

## 生成流程

1. **等级计算**：根据当前距离计算难度等级
2. **间隔计算**：根据等级动态调整生成间隔
3. **概率获取**：获取当前等级的精确概率分布
4. **类型选择**：根据概率随机选择对象类型
5. **泳道检查**：确保泳道可用性
6. **对象创建**：生成相应的障碍物或道具

## 性能优化

- **批量更新**：分帧处理障碍物更新
- **数量限制**：最大同时对象数量25个
- **智能清理**：自动清理超出屏幕的对象
- **碰撞优化**：精确的碰撞盒检测

## 配置参数

```javascript
SPAWN_CONFIG = {
  baseInterval: 60,      // 基础生成间隔
  minInterval: 20,       // 最小生成间隔
  laneOccupation: {
    minDistance: 120,    // 泳道最小距离
    checkHeight: 0.25    // 检查高度比例
  },
  performance: {
    maxObjects: 25,      // 最大对象数量
    updateBatchSize: 6   // 更新批次大小
  }
}
```

## 技术优势

1. **精确控制**：严格按照表格数据执行
2. **线性递增**：平滑的难度曲线
3. **概率保证**：确保100%概率分布
4. **性能优化**：高效的更新机制
5. **可扩展性**：易于添加新的障碍物和道具类型

## 游戏平衡

- **早期（1-5级）**：仅有静止障碍物，学习期
- **中期（6-30级）**：逐步引入移动障碍物，挑战期
- **后期（31-60级）**：全面的障碍物类型，竞技期
- **道具平衡**：随难度增加，道具获取变难，增加挑战性

## 📁 文件结构

```
src/utils/obstacles/
├── obstacleConfig.js     # 障碍物配置文件
├── Obstacle.js           # 障碍物类
├── ObstacleManager.js    # 障碍物管理器
├── AssetManager.js       # 资源管理器
├── test.js              # 测试文件
└── README.md            # 使用指南
```

## 🧹 代码简化更新 (最新)

### 已删除的重复代码
1. **删除了过时的资源管理器**：
   - `src/utils/spriteAnimation.js` 中的 `ObstacleAssets` 类（15帧雪碧图动画）
   - `src/utils/spriteAnimation.js` 中的 `PowerUpAssets` 类
   - 保留了 `SwimmerAnimation` 类（游泳者动画）

2. **简化了道具生成逻辑**：
   - 删除了 `gameStore.js` 中的 `generateGameObjects()` 方法
   - 删除了 `spawnPowerUpInLane()` 方法
   - 合并为统一的 `spawnPowerUp()` 方法
   - 添加了 `selectPowerUpType()` 和 `createPowerUp()` 辅助方法

3. **简化了布局配置**：
   - 保留兼容属性但简化注释
   - 统一使用 `displayWidth/displayHeight` 和 `collisionWidth/collisionHeight`

### 当前统一的资源管理
- **障碍物**: 使用 `AssetManager.js` 中的 `ObstacleAssets` 类
- **道具**: 使用 `AssetManager.js` 中的 `PowerUpAssets` 类  
- **游泳者**: 使用 `spriteAnimation.js` 中的 `SwimmerAnimation` 类

## 🎯 三种障碍物类型

### obs1 - 静止障碍物
```javascript
{
  type: 'static',
  folder: 'obs1',
  probability: 0.30,     // 30%生成概率
  description: '静止障碍物'
}
```
- **特点**: 保持在泳道中央，不移动
- **用途**: 基础障碍物，需要玩家躲避
- **概率**: 30%
- **资源**: `/obs/obs1.png`

### obs2 - 移动障碍物
```javascript
{
  type: 'moving',
  folder: 'obs2',
  probability: 0.15,     // 15%生成概率
  movement: {
    type: 'horizontal',
    speed: 1.5,           // 移动速度
    bounceOnBoundary: true
  },
  description: '水平移动障碍物（单帧图片）'
}
```
- **特点**: 在泳道内水平移动，碰到边界时反弹
- **图片**: 使用单帧PNG图片，不再是雪碧图动画
- **概率**: 15%
- **资源**: `/obs/obs2.png` (单帧图片)

### obs3 - 自定义障碍物
```javascript
{
  type: 'custom',
  folder: 'obs3',
  probability: 0.15,     // 15%生成概率
  custom: {
    behavior: 'default',
    specialEffect: false
  },
  description: '自定义障碍物'
}
```
- **特点**: 可扩展的自定义行为
- **用途**: 后期可添加特殊移动模式
- **概率**: 15%
- **资源**: `/obs/obs3.png`

## 🎁 道具系统

### 简化后的生成逻辑
```javascript
// 统一的道具生成方法 (gameStore.js)
spawnPowerUp(specificLane = null, specificType = null) {
  // 选择泳道和道具类型
  const lane = specificLane !== null ? specificLane : Math.floor(Math.random() * gameLayoutStore.lanes)
  const type = specificType || this.selectPowerUpType()
  
  // 检查泳道是否可用并创建道具
  if (!this.checkLaneOccupied(lane)) {
    const powerUp = this.createPowerUp(lane, type)
    this.powerUps.push(powerUp)
    return true
  }
  return false
}
```

### 生成概率配置
```javascript
// 在 selectPowerUpType() 方法中
const starProbability = 0.35    // 星星: 35%
const snorkelProbability = 0.05  // 潜水镜: 5%
// shield获得剩余概率: 60%
```

### 道具类型
- **⭐ Star (星星)**: 35%概率 - 增加10分
- **🤿 Snorkel (潜水镜)**: 5%概率 - 3秒无敌冲刺
- **🛡️ Shield (护盾)**: 60%概率 - 增加50分

## 🚀 性能优化特性

### 移动速度同步
所有游戏对象都与 `gameStateStore.gameSpeed` 保持同步：
```javascript
// 背景向上滚动
backgroundOffset -= gameSpeed

// 所有前景对象向下移动
obstacle.y += gameSpeed        // 障碍物
powerUp.y += gameSpeed        // 道具
particle.y += gameSpeed       // 粒子特效
starEffect.y += gameSpeed     // 星星特效
```

### 批量更新机制
```javascript
// 配置文件中的性能设置
performance: {
  maxObstacles: 20,        // 最大同时障碍物数量
  updateBatchSize: 5,      // 每帧更新的障碍物批次
  animationQuality: 'normal' // 动画质量控制
}
```

### 系统优化特性
- **统一图片格式**: 所有障碍物都使用单帧PNG图片
- **批量更新**: 分帧处理障碍物更新，提升性能
- **内存管理**: 限制最大障碍物数量，防止内存泄漏
- **简化渲染**: 统一的静态图片渲染逻辑
- **速度同步**: 所有游戏对象使用统一的移动速度
- **代码简化**: 删除重复逻辑，提高维护性

## 🛠️ 使用方法

### 1. 基础使用
```javascript
import { ObstacleManager } from './obstacles/ObstacleManager.js'
import { ObstacleAssets, PowerUpAssets } from './obstacles/AssetManager.js'

// 创建管理器
const obstacleManager = new ObstacleManager()
const obstacleAssets = new ObstacleAssets()
const powerUpAssets = new PowerUpAssets()

// 更新障碍物（性能优化版）
obstacleManager.updateObstaclesOptimized(gameSpeed, gameLayoutStore, currentTime)

// 渲染障碍物
const renderInfo = obstacleManager.getRenderInfo()
renderInfo.forEach(obstacle => {
  obstacleAssets.drawObstacle(ctx, obstacle.type, obstacle.x, obstacle.y, obstacle.width, obstacle.height)
})
```

### 2. 简化的道具生成
```javascript
// 随机生成道具
gameStore.spawnPowerUp()

// 在指定泳道生成特定道具
gameStore.spawnPowerUp(lane, 'star')

// 检查泳道是否可用
if (!gameStore.checkLaneOccupied(lane)) {
  // 泳道可用
}
```

### 3. 配置修改
在 `obstacleConfig.js` 中修改障碍物属性：

```javascript
// 修改obs2的移动速度
obs2: {
  movement: {
    speed: 2.0  // 提高速度
  }
}

// 调整性能设置
performance: {
  maxObstacles: 30,      // 增加最大数量
  updateBatchSize: 8     // 增加批次大小
}
```

### 4. 添加自定义行为
在 `Obstacle.js` 的 `updateCustomMovement` 方法中：

```javascript
updateCustomMovement(gameLayoutStore) {
  switch (this.customBehavior) {
    case 'zigzag':
      // 之字形移动
      this.x += Math.sin(this.animationFrame * 0.2) * 2
      break
    case 'circle':
      // 圆形移动
      const radius = 30
      this.x += Math.cos(this.animationFrame * 0.1) * radius
      this.y += Math.sin(this.animationFrame * 0.1) * radius
      break
  }
}
```

## 🧪 测试验证

运行测试验证系统功能：

```javascript
// 在浏览器控制台中
import('/src/utils/obstacles/test.js').then(module => module.runTests())
```

测试涵盖：
- ✅ 配置文件加载
- ✅ 障碍物类创建
- ✅ 管理器功能
- ✅ 性能优化特性
- ✅ 碰撞检测
- ✅ 渲染信息
- ✅ 简化后的道具生成逻辑

## 📊 性能监控

获取性能统计信息：

```javascript
// 获取障碍物性能信息
const obstacle = new Obstacle('obs2', 0, gameLayoutStore)
console.log(obstacle.getPerformanceInfo())

// 输出示例：
{
  type: 'obs2',
  updateInterval: 33.34,  // 更新间隔（毫秒）
  lastUpdateTime: 1234567890,
  animationFrame: 150,
  moveSpeedMultiplier: 0.8
}
```

## 🔧 故障排除

### 常见问题

1. **障碍物不显示**
   - 检查资源路径是否正确
   - 确认 AssetManager 已正确初始化
   - 查看浏览器控制台是否有加载错误

2. **性能问题**
   - 降低 `maxObstacles` 数量
   - 减少 `updateBatchSize`
   - 检查是否有内存泄漏

3. **obs2 移动异常**
   - 确认 `bounceOnBoundary` 设置
   - 检查泳道宽度配置
   - 验证移动速度设置

### 调试模式

启用详细日志：

```javascript
// 在 ObstacleManager 构造函数中添加
this.debugMode = true

// 在更新方法中添加日志
if (this.debugMode) {
  console.log('障碍物数量:', this.obstacles.length)
  console.log('批次索引:', this.updateBatchIndex)
}
```

## 🎨 资源要求

### 障碍物图片
- **obs1**: 静态PNG图片，建议尺寸 100x100px
- **obs2**: 静态PNG图片，建议尺寸 100x100px（不再是雪碧图）
- **obs3**: 静态PNG图片，建议尺寸 100x100px

### 道具图片
- **普通版本**: `snorkel.png`, `star.png`, `shield.png`
- **发光版本**: `snorkel-glow.png`, `star-glow.png`, `shield-glow.png`
- **特效**: `bubble.png` (护盾气泡效果)

## 📈 扩展建议

1. **新障碍物类型**: 在配置文件中添加 obs4, obs5 等
2. **动态难度**: 根据玩家表现调整障碍物属性
3. **特殊效果**: 添加粒子效果、音效等
4. **AI 预测**: 实现安全路径预测算法

---

💡 **提示**: 
- 修改配置后建议运行测试文件验证功能正常性
- 简化后的系统更易维护，新增功能时优先使用统一的接口
- 所有障碍物现在都使用单帧PNG图片，性能更优 