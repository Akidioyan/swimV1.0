/**
 * 障碍物配置文件 - 动态难度系统重新设计
 * 实现明显的难度差异和游戏挑战性递增
 */

// 基础配置
export const GAME_CONFIG = {
  // 等级系统
  DISTANCE_PER_LEVEL: 12,    // 每级间隔12米
  MAX_LEVEL: 60,             // 最高60级
  
  // 难度突变点（关键等级节点）
  DIFFICULTY_BREAKPOINTS: [1, 5, 10, 20, 35, 50, 60],
  
  // 基础数量配置
  MIN_OBJECTS_PER_LEVEL: 8,  // 1级基础8个对象
  MAX_OBJECTS_PER_LEVEL: 60, // 60级最多60个对象
}

/**
 * 难度阶段定义
 */
export const DIFFICULTY_STAGES = {
  BEGINNER: { min: 1, max: 5, name: '入门期' },      // 1-5级：学习期
  EASY: { min: 6, max: 15, name: '简单期' },         // 6-15级：适应期  
  NORMAL: { min: 16, max: 30, name: '普通期' },      // 16-30级：挑战期
  HARD: { min: 31, max: 45, name: '困难期' },        // 31-45级：激烈期
  EXPERT: { min: 46, max: 60, name: '专家期' }       // 46-60级：极限期
}

/**
 * 计算当前等级
 * @param {number} distance - 当前距离（米）
 * @returns {number} 当前等级 (1-60)
 */
export function calculateLevel(distance) {
  const level = Math.floor(distance / GAME_CONFIG.DISTANCE_PER_LEVEL) + 1
  return Math.min(level, GAME_CONFIG.MAX_LEVEL)
}

/**
 * 获取当前难度阶段
 * @param {number} level - 等级
 * @returns {Object} 难度阶段信息
 */
export function getDifficultyStage(level) {
  for (const stage of Object.values(DIFFICULTY_STAGES)) {
    if (level >= stage.min && level <= stage.max) {
      return stage
    }
  }
  return DIFFICULTY_STAGES.EXPERT
}

/**
 * 动态计算生成配置
 * @param {number} level - 等级 (1-60)
 * @returns {Object} 动态生成配置
 */
export function calculateDynamicSpawnConfig(level) {
  const stage = getDifficultyStage(level)
  
  // 基础生成间隔（帧数）- 随等级显著减少
  let baseInterval
  let minInterval
  let maxSimultaneousObjects
  let batchSpawnChance
  
  switch (stage.name) {
    case '入门期': // 1-5级
      baseInterval = 45    // 最慢生成
      minInterval = 34
      maxSimultaneousObjects = 8
      batchSpawnChance = 0   // 无批量生成
      break
      
    case '简单期': // 6-15级  
      baseInterval = 35
      minInterval = 24
      maxSimultaneousObjects = 12
      batchSpawnChance = 0.1 // 10%批量生成概率
      break
      
    case '普通期': // 16-30级
      baseInterval = 25
      minInterval = 18
      maxSimultaneousObjects = 16
      batchSpawnChance = 0.2 // 20%批量生成概率
      break
      
    case '困难期': // 31-45级
      baseInterval = 17
      minInterval = 12
      maxSimultaneousObjects = 20
      batchSpawnChance = 0.35 // 35%批量生成概率
      break
      
    case '专家期': // 46-60级
      baseInterval = 12
      minInterval = 8
      maxSimultaneousObjects = 24
      batchSpawnChance = 0.5  // 50%批量生成概率
      break
      
    default:
      baseInterval = 45
      minInterval = 30
      maxSimultaneousObjects = 3
      batchSpawnChance = 0
  }
  
  // 在阶段内进行线性插值，实现平滑过渡
  const stageProgress = (level - stage.min) / (stage.max - stage.min)
  const nextStageMultiplier = 0.85 // 每阶段结束时速度提升15%
  
  const dynamicInterval = Math.round(baseInterval * (1 - stageProgress * (1 - nextStageMultiplier)))
  
  return {
    baseInterval: Math.max(dynamicInterval, minInterval),
    minInterval,
    maxSimultaneousObjects,
    batchSpawnChance,
    stage: stage.name,
    stageProgress: Math.round(stageProgress * 100)
  }
}

/**
 * 计算各类型对象的概率分布（重新平衡）
 * @param {number} level - 等级 (1-60)
 * @returns {Object} 概率分布对象
 */
export function calculateProbabilities(level) {
  const probabilities = {
    obs1: 0,
    obs2: 0, 
    obs3: 0,
    snorkel: 0,
    star: 0
  }
  
  const stage = getDifficultyStage(level)
  
  // 根据难度阶段重新分配概率
  switch (stage.name) {
    case '入门期': // 1-5级：主要是静止障碍物和大量道具
      probabilities.obs1 = 40
      probabilities.obs2 = 0
      probabilities.obs3 = 0
      probabilities.snorkel = 20  // 多一些冲刺道具帮助学习
      probabilities.star = 40     // 多一些得分道具鼓励
      break
      
    case '简单期': // 6-15级：引入移动障碍物
      probabilities.obs1 = 45
      probabilities.obs2 = 15     // 开始出现移动障碍物
      probabilities.obs3 = 0
      probabilities.snorkel = 15
      probabilities.star = 25
      break
      
    case '普通期': // 16-30级：平衡各种类型
      probabilities.obs1 = 35
      probabilities.obs2 = 25
      probabilities.obs3 = 15     // 开始出现自定义障碍物
      probabilities.snorkel = 10
      probabilities.star = 15
      break
      
    case '困难期': // 31-45级：障碍物为主
      probabilities.obs1 = 30
      probabilities.obs2 = 30
      probabilities.obs3 = 25
      probabilities.snorkel = 8
      probabilities.star = 7
      break
      
    case '专家期': // 46-60级：极限挑战
      probabilities.obs1 = 25
      probabilities.obs2 = 35
      probabilities.obs3 = 30
      probabilities.snorkel = 5   // 道具变稀少
      probabilities.star = 5
      break
  }
  
  return probabilities
}

/**
 * 计算障碍物速度倍数（新增）
 * @param {number} level - 等级
 * @returns {number} 速度倍数
 */
export function calculateObstacleSpeedMultiplier(level) {
  const stage = getDifficultyStage(level)
  
  let baseSpeedMultiplier
  
  switch (stage.name) {
    case '入门期':
      baseSpeedMultiplier = 0.7   // 慢速
      break
    case '简单期':
      baseSpeedMultiplier = 0.9   
      break
    case '普通期':
      baseSpeedMultiplier = 1.0   // 标准速度
      break
    case '困难期':
      baseSpeedMultiplier = 1.3   
      break
    case '专家期':
      baseSpeedMultiplier = 1.6   // 高速
      break
    default:
      baseSpeedMultiplier = 1.0
  }
  
  // 在阶段内线性增长
  const stageProgress = (level - stage.min) / (stage.max - stage.min)
  const speedIncrease = stageProgress * 0.3 // 每阶段内最多增加30%速度
  
  return baseSpeedMultiplier + speedIncrease
}

/**
 * 计算批量生成配置（新增）
 * @param {number} level - 等级
 * @returns {Object} 批量生成配置
 */
export function calculateBatchSpawnConfig(level) {
  const dynamicConfig = calculateDynamicSpawnConfig(level)
  
  return {
    enabled: dynamicConfig.batchSpawnChance > 0,
    chance: dynamicConfig.batchSpawnChance,
    minObjects: Math.min(2, Math.floor(level / 10) + 1),
    maxObjects: Math.min(dynamicConfig.maxSimultaneousObjects, Math.floor(level / 5) + 2),
    cooldownFrames: Math.max(180 - level * 2, 60) // 随等级减少冷却时间
  }
}

/**
 * 根据概率选择对象类型
 * @param {Object} probabilities - 概率分布
 * @returns {string} 选中的对象类型
 */
export function selectObjectType(probabilities) {
  const random = Math.random() * 100
  let cumulative = 0
  
  for (const [type, probability] of Object.entries(probabilities)) {
    cumulative += probability
    if (random <= cumulative) {
      return type
    }
  }
  
  // 默认返回第一个类型
  return Object.keys(probabilities)[0]
}

/**
 * 障碍物基础配置
 */
export const OBSTACLE_CONFIG = {
  obs1: {
    name: 'obs1',
    type: 'static',
    folder: 'obs1',
    displaySize: {
      widthRatio: 0.10,
      heightRatio: 0.10
    },
    collisionSize: {
      widthRatio: 0.07,
      heightRatio: 0.07
    },
    color: '#696969',
    damage: 1,
    description: '静止障碍物'
  },
  
  obs2: {
    name: 'obs2',
    type: 'moving',
    folder: 'obs2',
    displaySize: {
      widthRatio: 0.10,
      heightRatio: 0.10
    },
    collisionSize: {
      widthRatio: 0.07,
      heightRatio: 0.07
    },
    color: '#696969',
    damage: 1,
    movement: {
      type: 'horizontal',
      baseSpeed: 1.5,           // 基础速度，会被倍数调整
      bounceOnBoundary: true
    },
    description: '水平移动障碍物'
  },
  
  obs3: {
    name: 'obs3',
    type: 'custom',
    folder: 'obs3',
    displaySize: {
      widthRatio: 0.10,
      heightRatio: 0.10
    },
    collisionSize: {
      widthRatio: 0.07,
      heightRatio: 0.07
    },
    color: '#696969',
    damage: 1,
    custom: {
      behavior: 'default',
      specialEffect: false,
      baseSpeed: 1.0            // 自定义障碍物基础速度
    },
    description: '自定义障碍物'
  }
}

/**
 * 道具基础配置
 */
export const POWERUP_CONFIG = {
  snorkel: {
    name: 'snorkel',
    type: 'rush',
    displaySize: {
      widthRatio: 0.08,
      heightRatio: 0.08
    },
    collisionSize: {
      widthRatio: 0.06,
      heightRatio: 0.06
    },
    effect: 'rush',
    duration: 240, // 4秒冲刺
    description: '冲刺道具'
  },
  
  star: {
    name: 'star',
    type: 'score',
    displaySize: {
      widthRatio: 0.06,
      heightRatio: 0.06
    },
    collisionSize: {
      widthRatio: 0.04,
      heightRatio: 0.04
    },
    effect: 'score',
    value: 10,
    description: '得分道具'
  }
}

/**
 * 生成配置（简化为基础设置）
 */
export const SPAWN_CONFIG = {
  // 泳道占用检测
  laneOccupation: {
    minDistance: 120,
    checkHeight: 0.15
  },
  
  // 性能优化配置
  performance: {
    maxObjects: 60,
    updateBatchSize: 15
  }
}

/**
 * 获取性能配置
 * @returns {Object} 性能配置
 */
export function getPerformanceConfig() {
  return SPAWN_CONFIG.performance
}

/**
 * 获取障碍物配置
 * @param {string} type - 障碍物类型
 * @returns {Object} 配置对象
 */
export function getObstacleConfig(type) {
  return OBSTACLE_CONFIG[type] || null
}

/**
 * 获取所有障碍物类型
 * @returns {Array} 障碍物类型数组
 */
export function getAllObstacleTypes() {
  return Object.keys(OBSTACLE_CONFIG)
}

/**
 * 获取难度诊断信息（用于调试）
 * @param {number} level - 等级
 * @returns {Object} 诊断信息
 */
export function getDifficultyDiagnostics(level) {
  const stage = getDifficultyStage(level)
  const spawnConfig = calculateDynamicSpawnConfig(level)
  const probabilities = calculateProbabilities(level)
  const speedMultiplier = calculateObstacleSpeedMultiplier(level)
  const batchConfig = calculateBatchSpawnConfig(level)
  
  return {
    level,
    stage: stage.name,
    stageProgress: spawnConfig.stageProgress + '%',
    spawnInterval: spawnConfig.baseInterval + '帧',
    maxObjects: spawnConfig.maxSimultaneousObjects,
    batchChance: Math.round(batchConfig.chance * 100) + '%',
    speedMultiplier: speedMultiplier.toFixed(2) + 'x',
    mainObstacle: Object.keys(probabilities).reduce((a, b) => 
      probabilities[a] > probabilities[b] ? a : b
    ),
    probabilities
  }
} 