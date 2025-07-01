/**
 * 障碍物生成工具函数
 */

/**
 * 障碍物类型配置
 */
export const OBSTACLE_TYPES = {
  obs1: {
    name: 'obs1',
    width: 'dynamic',
    height: 'dynamic',
    color: '#696969',
    probability: 0.25,
    damage: 1,
    // 静止障碍物，无特殊属性
    isStatic: true
  },
  obs2: {
    name: 'obs2',
    width: 'dynamic',
    height: 'dynamic',
    color: '#696969',
    probability: 0.25,
    damage: 1,
    // 静止障碍物，删除动画和碰撞帧范围
    isStatic: true
  },
  obs3: {
    name: 'obs3',
    width: 'dynamic',
    height: 'dynamic',
    color: '#696969',
    probability: 0.25,
    damage: 1,
    // 移动障碍物 - 跨泳道移动属性
    canMoveBetweenLanes: true,
    laneChangeSpeed: 0.02,    // 泳道切换速度
    laneChangeInterval: 2000  // 泳道切换间隔(毫秒)
  },
  obs4: {
    name: 'obs4',
    width: 'dynamic',
    height: 'dynamic',
    color: '#696969',
    probability: 0.25,
    damage: 1,
    // 移动障碍物 - 跨泳道移动属性
    canMoveBetweenLanes: true,
    laneChangeSpeed: 0.03,    // 更快的泳道切换速度
    laneChangeInterval: 1500  // 更短的泳道切换间隔
  }
}

/**
 * 道具类型配置
 */
export const POWERUP_TYPES = {
  snorkel: {
    name: 'snorkel',
    width: 100,
    height: 100,
    color: '#FF4500', // 橙红色表示冲刺
    probability: 0.4,
    effect: 'rush',
    value: 1,
    duration: 300, // 5秒冲刺
    score: 0
  },
  shield: {
    name: 'shield',
    width: 100,
    height: 100,
    color: '#FFD700',
    probability: 0.3,
    effect: 'life',
    value: 1,
    duration: 0,
    score: 0
  },
  star: {
    name: 'star',
    width: 100,
    height: 100,
    color: '#FFD700',
    probability: 0.3,
    effect: 'score',
    value: 10,
    duration: 0,
    score: 10
  }
}

/**
 * 计算障碍物生成间隔（减半）
 * @param {number} baseInterval - 基础间隔
 * @param {number} difficulty - 难度等级
 * @param {number} score - 当前分数
 * @returns {number} - 计算后的间隔
 */
export function calculateObstacleInterval(baseInterval = 180, difficulty = 0, score = 0) {
  // 随着分数增加，间隔时间减少
  const scoreMultiplier = 1 - Math.min(score / 8000, 0.6) // 从10000改为8000，从0.5改为0.6，更快减少间隔
  const difficultyMultiplier = 1 - difficulty * 0.4 // 从0.3改为0.4，难度影响更大
  
  return Math.max(baseInterval * scoreMultiplier * difficultyMultiplier, 20) // 最小间隔从30改为20帧
}

/**
 * 生成随机障碍物
 * @param {number} canvasWidth - 画布宽度
 * @param {number} laneHeight - 泳道高度
 * @param {number} lanes - 泳道数量
 * @param {number} difficulty - 难度等级 (0-1)
 * @param {Object} gameStore - 游戏状态对象
 * @returns {Object} - 障碍物对象
 */
export function generateObstacle(canvasWidth, laneHeight, lanes = 4, difficulty = 0, gameStore = null) {
  const types = Object.values(OBSTACLE_TYPES)
  const selectedType = types[Math.floor(Math.random() * types.length)]
  
  return {
    x: canvasWidth,
    y: 0,
    width: gameStore ? gameStore.obstacleWidth : canvasWidth * 0.10,        // 显示宽度
    height: gameStore ? gameStore.obstacleHeight : canvasWidth * 0.04,      // 显示高度
    collisionWidth: gameStore ? gameStore.obstacleCollisionWidth : canvasWidth * 0.07,   // 碰撞宽度
    collisionHeight: gameStore ? gameStore.obstacleCollisionHeight : canvasWidth * 0.028, // 碰撞高度
    type: selectedType.name,
    color: selectedType.color,
    damage: selectedType.damage,
    lane: 0
  }
}

/**
 * 生成随机道具
 * @param {number} canvasWidth - 画布宽度
 * @param {number} laneHeight - 泳道高度
 * @param {number} lanes - 泳道数量
 * @param {number} difficulty - 难度等级 (0-1)
 * @param {Object} gameStore - 游戏状态对象
 * @returns {Object} - 道具对象
 */
export function generatePowerUp(canvasWidth, laneHeight, lanes = 3, difficulty = 0, gameStore = null) {
  const types = Object.values(POWERUP_TYPES)
  const lane = Math.floor(Math.random() * lanes)
  
  // 随机选择道具类型
  let selectedType
  const random = Math.random()
  let cumulativeProbability = 0
  
  for (const type of types) {
    // 难度越高，护盾道具概率越大
    let adjustedProbability = type.probability
    if (type.name === 'shield') {
      adjustedProbability *= (1 + difficulty * 0.3)
    }
    
    cumulativeProbability += adjustedProbability
    
    if (random <= cumulativeProbability) {
      selectedType = type
      break
    }
  }
  
  // 如果没有选中任何类型，使用第一个
  if (!selectedType) {
    selectedType = types[0]
  }
  
  // 计算道具位置
  let powerUpX = canvasWidth
  let powerUpY
  
  if (gameStore) {
    // 使用gameStore计算准确位置
    powerUpY = gameStore.getLaneY(lane)
    // 道具从屏幕右侧进入
    powerUpX = canvasWidth
  } else {
    // 降级方案
    powerUpY = laneHeight * (lane + 0.5) - selectedType.height / 2
  }
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    x: powerUpX,
    y: powerUpY,
    width: selectedType.width,
    height: selectedType.height,
    type: selectedType.name,
    lane: lane,
    color: selectedType.color,
    effect: selectedType.effect,
    value: selectedType.value,
    duration: selectedType.duration,
    score: selectedType.score,
    collected: false,
    glowPhase: 0, // 用于发光动画
    created: Date.now()
  }
}

// 删除这里重复的calculateObstacleInterval函数定义

/**
 * 计算道具生成间隔
 * @param {number} baseInterval - 基础间隔时间
 * @param {number} difficulty - 难度等级 (0-1)
 * @param {number} score - 当前分数
 * @returns {number} - 调整后的生成间隔
 */
export function calculatePowerUpInterval(baseInterval = 200, difficulty = 0, score = 0) {
  // 难度越高，道具生成越频繁
  const difficultyMultiplier = 1 - difficulty * 0.2 // 最多减少20%
  const scoreMultiplier = 1 - Math.min(score / 15000, 0.3) // 最多减少30%
  
  return Math.max(baseInterval * difficultyMultiplier * scoreMultiplier, 100) // 最小间隔100帧
}

/**
 * 检查是否可以在指定泳道生成对象
 * @param {number} lane - 目标泳道
 * @param {Array} existingObjects - 现有对象数组
 * @param {number} minDistance - 最小距离
 * @returns {boolean} - 是否可以生成
 */
export function canSpawnInLane(lane, existingObjects, minDistance = 100) {
  return !existingObjects.some(obj => 
    obj.lane === lane && obj.x > (800 - minDistance) // 假设画布宽度为800
  )
}

/**
 * 生成障碍物模式（连续障碍物）
 * @param {number} canvasWidth - 画布宽度
 * @param {number} laneHeight - 泳道高度
 * @param {number} lanes - 泳道数量
 * @param {string} pattern - 模式类型：'line', 'zigzag', 'random'
 * @returns {Array} - 障碍物数组
 */
export function generateObstaclePattern(canvasWidth, laneHeight, lanes = 3, pattern = 'random') {
  const obstacles = []
  const spacing = 150 // 障碍物间距
  
  switch (pattern) {
    case 'line':
      // 一条直线的障碍物
      const lineLane = Math.floor(Math.random() * lanes)
      for (let i = 0; i < 3; i++) {
        obstacles.push({
          ...generateObstacle(canvasWidth + i * spacing, laneHeight, lanes),
          lane: lineLane,
          y: laneHeight * (lineLane + 0.5) - 20
        })
      }
      break
      
    case 'zigzag':
      // 之字形障碍物
      for (let i = 0; i < 3; i++) {
        const lane = i % lanes
        obstacles.push({
          ...generateObstacle(canvasWidth + i * spacing, laneHeight, lanes),
          lane: lane,
          y: laneHeight * (lane + 0.5) - 20
        })
      }
      break
      
    case 'random':
    default:
      // 随机生成
      for (let i = 0; i < 2; i++) {
        obstacles.push(generateObstacle(canvasWidth + i * spacing, laneHeight, lanes))
      }
      break
  }
  
  return obstacles
}

/**
 * 获取当前难度等级
 * @param {number} score - 当前分数
 * @param {number} distance - 游泳距离
 * @returns {number} - 难度等级 (0-1)
 */
export function getDifficultyLevel(score = 0, distance = 0) {
  // 基于分数和距离计算难度
  const scoreFactor = Math.min(score / 10000, 0.6) // 分数因子，最大0.6
  const distanceFactor = Math.min(distance / 1000, 0.4) // 距离因子，最大0.4
  
  return Math.min(scoreFactor + distanceFactor, 1.0) // 总难度不超过1.0
}

/**
 * 预测下一个安全泳道
 * @param {Array} obstacles - 当前障碍物数组
 * @param {number} playerX - 玩家X位置
 * @param {number} lookAhead - 前瞻距离
 * @returns {number} - 推荐的安全泳道
 */
export function predictSafeLane(obstacles, playerX, lookAhead = 200) {
  const nearbyObstacles = obstacles.filter(obs => 
    obs.x > playerX && obs.x < playerX + lookAhead
  )
  
  if (nearbyObstacles.length === 0) {
    return -1 // 没有障碍物，任意泳道都安全
  }
  
  // 统计每个泳道的障碍物数量（4个泳道）
  const laneCounts = [0, 0, 0, 0]
  nearbyObstacles.forEach(obs => {
    if (obs.lane >= 0 && obs.lane < 4) {
      laneCounts[obs.lane]++
    }
  })
  
  // 返回障碍物最少的泳道
  let safestLane = 0
  let minCount = laneCounts[0]
  
  for (let i = 1; i < laneCounts.length; i++) {
    if (laneCounts[i] < minCount) {
      minCount = laneCounts[i]
      safestLane = i
    }
  }
  
  return safestLane
}
