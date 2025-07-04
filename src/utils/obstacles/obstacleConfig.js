/**
 * 障碍物配置文件 - 新的0-6级难度系统
 * 基于新的表格数据重构的难度梯度系统
 */

/**
 * 游戏对象基础配置
 */
export const GAME_OBJECTS_CONFIG = {
  // 障碍物类型
  obs1: {
    name: 'obs1',
    category: 'obstacle',
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
    category: 'obstacle',
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
      speed: 1.5,
      bounceOnBoundary: true
    },
    description: '水平移动障碍物'
  },
  
  obs3: {
    name: 'obs3',
    category: 'obstacle',
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
      specialEffect: false
    },
    description: '自定义障碍物'
  },

  // 道具类型
  snorkel: {
    name: 'snorkel',
    category: 'powerup',
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
    category: 'powerup',
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
 * 0-6级难度配置表
 */
export const DIFFICULTY_CONFIG = {
  // 难度等级定义
  levels: [
    { // 0级
      level: 0,
      distanceRange: { min: 0, max: 20 }, // 米
      vwRange: { min: 0, max: 400 }, // vw
      probability: {
        obs1: 0.1,
        obs2: 0,
        obs3: 0,
        snorkel: 0.3,
        star: 0.6
      },
      objectsPer100vw: { min: 6, max: 15 },
      movementSpeed: 25, // vw/s
      spawnInterval: { min: 40, max: 45 } // vw
    },
    { // 1级
      level: 1,
      distanceRange: { min: 20, max: 80 }, // 米
      vwRange: { min: 400, max: 1600 }, // vw
      probability: {
        obs1: 0.29,
        obs2: 0.1,
        obs3: 0,
        snorkel: 0.11,
        star: 0.5
      },
      objectsPer100vw: { min: 8, max: 20 },
      movementSpeed: 30, // vw/s
      spawnInterval: { min: 30, max: 42 } // vw
    },
    { // 2级
      level: 2,
      distanceRange: { min: 80, max: 200 }, // 米
      vwRange: { min: 1600, max: 4000 }, // vw
      probability: {
        obs1: 0.2,
        obs2: 0.15,
        obs3: 0.1,
        snorkel: 0.05,
        star: 0.5
      },
      objectsPer100vw: { min: 12, max: 22 },
      movementSpeed: 34, // vw/s
      spawnInterval: { min: 25, max: 39 } // vw
    },
    { // 3级
      level: 3,
      distanceRange: { min: 200, max: 500 }, // 米
      vwRange: { min: 4000, max: 10000 }, // vw
      probability: {
        obs1: 0.3,
        obs2: 0.2,
        obs3: 0.15,
        snorkel: 0.05,
        star: 0.3
      },
      objectsPer100vw: { min: 15, max: 26 },
      movementSpeed: 38, // vw/s
      spawnInterval: { min: 21, max: 36 } // vw
    },
    { // 4级
      level: 4,
      distanceRange: { min: 500, max: 900 }, // 米
      vwRange: { min: 10000, max: 18000 }, // vw
      probability: {
        obs1: 0.37,
        obs2: 0.25,
        obs3: 0.15,
        snorkel: 0.03,
        star: 0.2
      },
      objectsPer100vw: { min: 18, max: 26 },
      movementSpeed: 42, // vw/s
      spawnInterval: { min: 21, max: 33 } // vw
    },
    { // 5级
      level: 5,
      distanceRange: { min: 900, max: 1600 }, // 米
      vwRange: { min: 18000, max: 32000 }, // vw
      probability: {
        obs1: 0.37,
        obs2: 0.26,
        obs3: 0.15,
        snorkel: 0.02,
        star: 0.2
      },
      objectsPer100vw: { min: 18, max: 35 },
      movementSpeed: 46, // vw/s
      spawnInterval: { min: 21, max: 33 } // vw
    },
    { // 6级
      level: 6,
      distanceRange: { min: 1600, max: Infinity }, // 米
      vwRange: { min: 32000, max: Infinity }, // vw
      probability: {
        obs1: 0.37,
        obs2: 0.27,
        obs3: 0.15,
        snorkel: 0.01,
        star: 0.2
      },
      objectsPer100vw: { min: 20, max: 40 },
      movementSpeed: 56, // vw/s
      spawnInterval: { min: 20, max: 33 } // vw
    }
  ],
  
  // 距离转换常数 - 根据表格数据重新计算
  // 20m = 400vw, 80m = 1600vw, 200m = 4000vw
  // 换算：1m = 20vw，所以 1vw = 0.05m
  vwToMeterRatio: 0.05, // 1vw = 0.05m
  meterToVwRatio: 20,   // 1m = 20vw
  
  // 最小间隔保证
  absoluteMinInterval: 19 // vw - 所有生成都不能低于这个间隔
}

/**
 * 生成配置
 */
export const SPAWN_CONFIG = {
  // 距离计算单位
  distanceUnit: 'vw',
  
  // 性能优化配置
  performance: {
    maxObjects: 60,
    updateBatchSize: 15
  }
}

/**
 * 新的难度系统核心函数
 */

/**
 * 验证换算关系是否正确
 * @returns {Object} 验证结果
 */
export function validateConversionRatio() {
  const testCases = [
    { meters: 20, expectedVw: 400 },
    { meters: 80, expectedVw: 1600 },
    { meters: 200, expectedVw: 4000 },
    { meters: 500, expectedVw: 10000 },
    { meters: 900, expectedVw: 18000 },
    { meters: 1600, expectedVw: 32000 }
  ]
  
  const results = testCases.map(test => {
    const calculatedVw = test.meters * DIFFICULTY_CONFIG.meterToVwRatio
    const calculatedMeters = test.expectedVw * DIFFICULTY_CONFIG.vwToMeterRatio
    return {
      meters: test.meters,
      expectedVw: test.expectedVw,
      calculatedVw,
      calculatedMeters,
      vwMatch: calculatedVw === test.expectedVw,
      metersMatch: Math.abs(calculatedMeters - test.meters) < 0.01
    }
  })
  
  const allValid = results.every(r => r.vwMatch && r.metersMatch)
  
  return {
    valid: allValid,
    testResults: results,
    currentRatios: {
      vwToMeter: DIFFICULTY_CONFIG.vwToMeterRatio,
      meterToVw: DIFFICULTY_CONFIG.meterToVwRatio
    }
  }
}

/**
 * 根据vw距离直接计算当前难度等级（主要函数）
 * @param {number} distanceVw - 游戏距离（vw单位）
 * @returns {number} 难度等级（0-6）
 */
export function getDifficultyLevelFromVw(distanceVw) {
  // 直接基于vw范围判断，无需转换
  for (const levelConfig of DIFFICULTY_CONFIG.levels) {
    if (distanceVw >= levelConfig.vwRange.min && 
        distanceVw < levelConfig.vwRange.max) {
      return levelConfig.level
    }
  }
  // 如果超出所有范围，返回最高级别
  return DIFFICULTY_CONFIG.levels[DIFFICULTY_CONFIG.levels.length - 1].level
}

/**
 * 根据距离（米）计算当前难度等级（兼容性函数）
 * @param {number} distanceMeters - 游戏距离（米）
 * @returns {number} 难度等级（0-6）
 */
export function getDifficultyLevel(distanceMeters) {
  // 转换为vw后使用主要函数
  const distanceVw = distanceMeters * DIFFICULTY_CONFIG.meterToVwRatio
  return getDifficultyLevelFromVw(distanceVw)
}

/**
 * 根据vw距离获取对应的米距离
 * @param {number} distanceVw - vw距离
 * @returns {number} 米距离
 */
export function convertVwToMeters(distanceVw) {
  return distanceVw * DIFFICULTY_CONFIG.vwToMeterRatio
}

/**
 * 根据米距离获取对应的vw距离
 * @param {number} distanceMeters - 米距离
 * @returns {number} vw距离
 */
export function convertMetersToVw(distanceMeters) {
  return distanceMeters * DIFFICULTY_CONFIG.meterToVwRatio
}

/**
 * 获取指定等级的配置
 * @param {number} level - 难度等级（0-6）
 * @returns {Object} 等级配置对象
 */
export function getLevelConfig(level) {
  return DIFFICULTY_CONFIG.levels.find(config => config.level === level) || 
         DIFFICULTY_CONFIG.levels[DIFFICULTY_CONFIG.levels.length - 1]
}

/**
 * 计算指定等级在100vw内应生成的对象数量
 * @param {number} level - 难度等级（0-6）
 * @returns {number} 对象数量
 */
export function getObjectCountPer100vw(level) {
  const levelConfig = getLevelConfig(level)
  const { min, max } = levelConfig.objectsPer100vw
  return Math.floor(min + Math.random() * (max - min + 1))
}

/**
 * 获取指定等级的运动速度
 * @param {number} level - 难度等级（0-6）
 * @returns {number} 运动速度（vw/s）
 */
export function getMovementSpeed(level) {
  const levelConfig = getLevelConfig(level)
  return levelConfig.movementSpeed
}

/**
 * 获取指定等级的生成间隔
 * @param {number} level - 难度等级（0-6）
 * @returns {number} 生成间隔（vw）
 */
export function getSpawnInterval(level) {
  const levelConfig = getLevelConfig(level)
  const { min, max } = levelConfig.spawnInterval
  const interval = min + Math.random() * (max - min)
  
  // 确保不低于绝对最小间隔
  return Math.max(interval, DIFFICULTY_CONFIG.absoluteMinInterval)
}

/**
 * 获取指定等级的概率分布
 * @param {number} level - 难度等级（0-6）
 * @returns {Object} 概率分布对象
 */
export function getProbabilityDistribution(level) {
  const levelConfig = getLevelConfig(level)
  return { ...levelConfig.probability }
}

/**
 * 根据概率分布生成对象类型
 * @param {number} level - 难度等级（0-6）
 * @returns {string} 对象类型名称
 */
export function generateRandomObjectType(level) {
  const distribution = getProbabilityDistribution(level)
  const random = Math.random()
  let cumulative = 0
  
  for (const [type, probability] of Object.entries(distribution)) {
    cumulative += probability
    if (random <= cumulative) {
      return type
    }
  }
  
  // 降级返回obs1
  return 'obs1'
}

/**
 * 根据等级和距离生成对象类型数组
 * @param {number} level - 难度等级（0-6）
 * @param {number} count - 要生成的对象总数
 * @returns {Array} 对象类型数组
 */
export function generateObjectTypesForLevel(level, count) {
  const types = []
  
  for (let i = 0; i < count; i++) {
    types.push(generateRandomObjectType(level))
  }
  
  // 打乱数组顺序
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[types[i], types[j]] = [types[j], types[i]]
  }
  
  return types
}

/**
 * 获取当前游戏的完整难度信息
 * @param {number} distanceVw - 当前距离（vw单位）
 * @returns {Object} 完整难度信息
 */
export function getCurrentDifficultyInfo(distanceVw) {
  const level = getDifficultyLevelFromVw(distanceVw)
  const levelConfig = getLevelConfig(level)
  const objectCount = getObjectCountPer100vw(level)
  const movementSpeed = getMovementSpeed(level)
  const spawnInterval = getSpawnInterval(level)
  const probability = getProbabilityDistribution(level)
  const distanceMeters = convertVwToMeters(distanceVw)
  
  return {
    level,
    distanceVw,
    distanceMeters,
    objectsPer100vw: objectCount,
    movementSpeed,
    spawnInterval,
    probability,
    levelConfig,
    description: `等级${level} (${levelConfig.vwRange.min}-${levelConfig.vwRange.max === Infinity ? '∞' : levelConfig.vwRange.max}vw)`,
    // 调试信息
    debug: {
      vwRange: levelConfig.vwRange,
      meterRange: levelConfig.distanceRange,
      conversionCheck: {
        vwToMeters: distanceVw * DIFFICULTY_CONFIG.vwToMeterRatio,
        metersToVw: distanceMeters * DIFFICULTY_CONFIG.meterToVwRatio,
        originalVw: distanceVw
      }
    }
  }
}

/**
 * 兼容性函数 - 保持原有接口可用
 */

/**
 * 统一的随机对象选择函数（基于当前距离）
 * @param {number} distanceVw - 当前距离（vw单位）
 * @returns {string} 选中的对象类型名称
 */
export function getRandomGameObjectType(distanceVw = 0) {
  const level = getDifficultyLevelFromVw(distanceVw)
  return generateRandomObjectType(level)
}

/**
 * 获取对象配置
 * @param {string} type - 对象类型
 * @returns {Object} 配置对象
 */
export function getGameObjectConfig(type) {
  return GAME_OBJECTS_CONFIG[type] || null
}

/**
 * 检查对象是否为障碍物
 * @param {string} type - 对象类型
 * @returns {boolean} 是否为障碍物
 */
export function isObstacle(type) {
  const config = GAME_OBJECTS_CONFIG[type]
  return config && config.category === 'obstacle'
}

/**
 * 检查对象是否为道具
 * @param {string} type - 对象类型
 * @returns {boolean} 是否为道具
 */
export function isPowerUp(type) {
  const config = GAME_OBJECTS_CONFIG[type]
  return config && config.category === 'powerup'
}

/**
 * 获取所有障碍物类型
 * @returns {Array} 障碍物类型数组
 */
export function getAllObstacleTypes() {
  return Object.keys(GAME_OBJECTS_CONFIG).filter(type => 
    GAME_OBJECTS_CONFIG[type].category === 'obstacle'
  )
}

/**
 * 获取所有道具类型
 * @returns {Array} 道具类型数组
 */
export function getAllPowerUpTypes() {
  return Object.keys(GAME_OBJECTS_CONFIG).filter(type => 
    GAME_OBJECTS_CONFIG[type].category === 'powerup'
  )
}

/**
 * 获取性能配置
 * @returns {Object} 性能配置
 */
export function getPerformanceConfig() {
  return SPAWN_CONFIG.performance
}

// 向后兼容的函数
export const getObstacleConfig = getGameObjectConfig
export const getPowerUpConfig = getGameObjectConfig

/**
 * 根据距离动态计算生成间隔
 * @param {number} distanceVw - 当前距离（vw单位）
 * @returns {number} 生成间隔（vw单位）
 */
export function getDynamicSpawnIntervalFromDistance(distanceVw) {
  const level = getDifficultyLevelFromVw(distanceVw)
  return getSpawnInterval(level)
}

/**
 * 调试信息函数
 * @param {number} level - 难度等级
 * @returns {Object} 调试信息
 */
export function getDifficultyDebugInfo(level) {
  const levelConfig = getLevelConfig(level)
  const sampleObjectCounts = []
  const sampleIntervals = []
  
  // 生成10个样本用于调试
  for (let i = 0; i < 10; i++) {
    sampleObjectCounts.push(getObjectCountPer100vw(level))
    sampleIntervals.push(getSpawnInterval(level))
  }
  
  return {
    level,
    levelConfig,
    sampleObjectCounts,
    sampleIntervals,
    averageObjectCount: sampleObjectCounts.reduce((sum, val) => sum + val, 0) / sampleObjectCounts.length,
    averageInterval: sampleIntervals.reduce((sum, val) => sum + val, 0) / sampleIntervals.length,
    probabilitySum: Object.values(levelConfig.probability).reduce((sum, val) => sum + val, 0)
  }
}

/**
 * 全面测试新的难度系统
 * @returns {Object} 完整的测试结果
 */
export function testNewDifficultySystem() {
  const conversionTest = validateConversionRatio()
  
  // 测试各个关键距离点的级别判断
  const testDistances = [
    0, 100, 200, 300, 400,      // 0级范围
    500, 800, 1200, 1600,       // 1级范围
    2000, 3000, 4000,           // 2级范围
    5000, 7500, 10000,          // 3级范围
    12000, 15000, 18000,        // 4级范围
    20000, 25000, 32000,        // 5级范围
    35000, 50000, 100000        // 6级范围
  ]
  
  const levelTests = testDistances.map(vw => {
    const level = getDifficultyLevelFromVw(vw)
    const info = getCurrentDifficultyInfo(vw)
    return {
      distanceVw: vw,
      calculatedLevel: level,
      expectedLevel: getExpectedLevelForVw(vw),
      isCorrect: level === getExpectedLevelForVw(vw),
      difficultyInfo: info
    }
  })
  
  // 测试所有级别的配置完整性
  const levelConfigTests = DIFFICULTY_CONFIG.levels.map(config => {
    const debugInfo = getDifficultyDebugInfo(config.level)
    return {
      level: config.level,
      configValid: validateLevelConfig(config),
      debugInfo,
      probabilityValid: Math.abs(debugInfo.probabilitySum - 1.0) < 0.01 // 允许小的浮点误差
    }
  })
  
  return {
    conversionTest,
    levelTests,
    levelConfigTests,
    summary: {
      allConversionsValid: conversionTest.valid,
      allLevelTestsPassed: levelTests.every(t => t.isCorrect),
      allConfigsValid: levelConfigTests.every(t => t.configValid && t.probabilityValid),
      totalTestsPassed: levelTests.filter(t => t.isCorrect).length,
      totalTests: levelTests.length
    }
  }
}

/**
 * 根据vw距离获取期望的等级（用于测试）
 * @param {number} vw - vw距离
 * @returns {number} 期望的等级
 */
function getExpectedLevelForVw(vw) {
  if (vw < 400) return 0
  if (vw < 1600) return 1
  if (vw < 4000) return 2
  if (vw < 10000) return 3
  if (vw < 18000) return 4
  if (vw < 32000) return 5
  return 6
}

/**
 * 验证单个等级配置的有效性
 * @param {Object} config - 等级配置对象
 * @returns {boolean} 配置是否有效
 */
function validateLevelConfig(config) {
  const required = ['level', 'vwRange', 'probability', 'objectsPer100vw', 'movementSpeed', 'spawnInterval']
  const hasAllFields = required.every(field => config.hasOwnProperty(field))
  
  const vwRangeValid = config.vwRange.min >= 0 && config.vwRange.max > config.vwRange.min
  const objectCountValid = config.objectsPer100vw.min > 0 && config.objectsPer100vw.max >= config.objectsPer100vw.min
  const speedValid = config.movementSpeed > 0
  const intervalValid = config.spawnInterval.min > 0 && config.spawnInterval.max >= config.spawnInterval.min
  
  return hasAllFields && vwRangeValid && objectCountValid && speedValid && intervalValid
}

/**
 * 快速验证当前系统状态
 * @returns {Object} 系统状态
 */
export function quickSystemCheck() {
  const testResult = testNewDifficultySystem()
  return {
    systemHealthy: testResult.summary.allConversionsValid && 
                   testResult.summary.allLevelTestsPassed && 
                   testResult.summary.allConfigsValid,
    issues: [],
    successRate: testResult.summary.totalTestsPassed / testResult.summary.totalTests,
    timestamp: new Date().toISOString()
  }
}