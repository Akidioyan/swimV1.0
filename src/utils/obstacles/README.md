# 障碍物和道具生成系统

## 概述

简化的统一生成系统，障碍物和道具使用共享的100%概率分布。

## 系统特点

### 1. 统一概率分布（共享100%）
- **obs1（静止障碍物）**：20%
- **obs2（移动障碍物）**：15%
- **obs3（自定义障碍物）**：15%
- **snorkel（冲刺道具）**：10%
- **star（得分道具）**：40%

### 2. 障碍物配置

#### obs1 - 静止障碍物
- **概率**：20%
- **特点**：保持在泳道中央，不移动
- **用途**：基础障碍物，需要玩家躲避

#### obs2 - 移动障碍物  
- **概率**：15%
- **特点**：在泳道内水平移动，碰到边界时反弹
- **速度**：1.5速度单位

#### obs3 - 自定义障碍物
- **概率**：15%
- **特点**：可扩展的自定义行为（目前为静止或波浪移动）
- **用途**：预留扩展接口

### 3. 道具配置

#### snorkel - 冲刺道具
- **概率**：10%
- **效果**：4秒无敌加速冲刺
- **用途**：帮助玩家穿越障碍物

#### star - 得分道具
- **概率**：40%
- **效果**：增加10分
- **用途**：提升玩家得分

## 系统架构

### 主要文件

1. **obstacleConfig.js** - 统一配置和选择函数
2. **gameStore.js** - 统一生成逻辑实现  
3. **ObstacleManager.js** - 障碍物生命周期管理
4. **Obstacle.js** - 障碍物类定义

### 核心函数

```javascript
// 统一随机选择游戏对象
getRandomGameObjectType()

// 获取对象配置信息
getGameObjectConfig(type)

// 检查对象类型
isObstacle(type)
isPowerUp(type)
```

## 生成流程

1. **间隔检查**：每60帧检查一次是否生成新对象
2. **统一选择**：根据100%概率分布随机选择对象类型
3. **类型判断**：判断选中的是障碍物还是道具
4. **泳道检查**：确保泳道可用性
5. **对象创建**：生成相应的障碍物或道具

## 配置参数

```javascript
SPAWN_CONFIG = {
  baseInterval: 60,             // 基础生成间隔（帧数）
  minInterval: 30,              // 最小生成间隔
  laneOccupation: {
    minDistance: 120,           // 泳道最小距离
    checkHeight: 0.15           // 检查高度比例
  },
  performance: {
    maxObjects: 60,             // 最大对象数量
    updateBatchSize: 15         // 更新批次大小
  }
}
```

## 使用方法

### 1. 基础使用
```javascript
import { ObstacleManager } from './obstacles/ObstacleManager.js'
import { getRandomGameObjectType, isObstacle, isPowerUp } from './obstacles/obstacleConfig.js'

// 创建管理器
const obstacleManager = new ObstacleManager()

// 统一随机生成对象
const objectType = getRandomGameObjectType()

if (isObstacle(objectType)) {
  // 生成障碍物
  const obstacle = obstacleManager.createObstacle(objectType, lane, gameLayoutStore)
} else if (isPowerUp(objectType)) {
  // 生成道具
  const powerUp = gameStore.createPowerUp(lane, objectType)
}
```

### 2. 修改概率
在 `obstacleConfig.js` 中修改概率：

```javascript
GAME_OBJECTS_CONFIG = {
  obs1: { probability: 0.25 },    // 25%
  obs2: { probability: 0.15 },    // 15%
  obs3: { probability: 0.10 },    // 10%
  snorkel: { probability: 0.15 }, // 15%
  star: { probability: 0.35 }     // 35%
  // 确保总和为100%
}
```

### 3. 调整生成间隔
```javascript
SPAWN_CONFIG = {
  baseInterval: 45,  // 更快生成（45帧）
}
```

## 技术特点

1. **统一逻辑**：障碍物和道具使用相同的生成流程
2. **概率透明**：100%概率分布，易于理解和调整
3. **性能友好**：单一随机选择函数，高效执行
4. **易于扩展**：添加新对象类型只需修改配置

## 文件结构

```
src/utils/obstacles/
├── obstacleConfig.js     # 统一配置文件
├── Obstacle.js           # 障碍物类
├── ObstacleManager.js    # 障碍物管理器
├── AssetManager.js       # 资源管理器
└── README.md            # 使用指南
```

## 概率分布

当前的100%概率分布：

| 对象类型 | 概率 | 分类 | 说明 |
|----------|------|------|------|
| obs1     | 20%  | 障碍物 | 静止障碍物 |
| obs2     | 15%  | 障碍物 | 移动障碍物 |
| obs3     | 15%  | 障碍物 | 自定义障碍物 |
| snorkel  | 10%  | 道具 | 冲刺道具 |
| star     | 40%  | 道具 | 得分道具 |

**障碍物总概率**: 50% (20% + 15% + 15%)
**道具总概率**: 50% (10% + 40%)

## 代码简化优势

1. **单一入口**：只需调用一个生成函数
2. **逻辑统一**：减少重复代码
3. **维护简单**：修改概率只需改一个地方
4. **理解容易**：清晰的100%分布

## 扩展建议

1. **新对象类型**：在GAME_OBJECTS_CONFIG中添加新条目
2. **动态概率**：根据游戏进度动态调整概率值
3. **特殊效果**：为obs3添加更多自定义行为
4. **概率检查**：添加概率总和验证功能

## 向后兼容

为保持兼容性，保留了以下函数：
```javascript
getObstacleConfig()     // 指向 getGameObjectConfig()
getPowerUpConfig()      // 指向 getGameObjectConfig()
getRandomObstacleType() // 过滤后只返回障碍物类型
getRandomPowerUpType()  // 过滤后只返回道具类型
```

---

💡 **提示**: 统一生成系统使代码更简洁，概率分布更直观。您可以轻松调整任何对象的生成概率。 