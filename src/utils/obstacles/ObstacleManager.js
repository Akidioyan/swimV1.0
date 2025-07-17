/**
 * 障碍物管理器
 * 专门管理障碍物的生命周期、更新和碰撞检测
 */

import { Obstacle } from './Obstacle.js'
import { SPAWN_CONFIG, DIFFICULTY_CONFIG, getPerformanceConfig } from './obstacleConfig.js'

export class ObstacleManager {
  constructor() {
    this.obstacles = []
    this.lastObstacleDistance = {} // 记录每个泳道最后障碍物的距离
    
    // 性能优化相关
    this.performanceConfig = getPerformanceConfig()
    this.updateBatchIndex = 0 // 批量更新索引
  }
  
  /**
   * 更新所有障碍物
   * @param {number} gameSpeed - 游戏速度
   * @param {Object} gameLayoutStore - 游戏布局store
   * @param {Array} powerUps - 道具数组（可选）
   */
  updateObstacles(gameSpeed, gameLayoutStore, powerUps = []) {
    this.obstacles = this.obstacles.filter(obstacle => {
      // 更新障碍物状态，传递powerUps引用
      obstacle.update(gameSpeed, gameLayoutStore, Date.now(), powerUps)
      
      // 检查是否超出屏幕
      if (obstacle.isOffScreen(gameLayoutStore.canvas.height)) {
        return false
      }
      
      return true
    })
  }
  
  /**
   * 性能优化版本的障碍物更新
   * @param {number} gameSpeed - 游戏速度
   * @param {Object} gameLayoutStore - 游戏布局store
   * @param {number} currentTime - 当前时间
   * @param {Array} powerUps - 道具数组（可选）
   */
  updateObstaclesOptimized(gameSpeed, gameLayoutStore, currentTime, powerUps = []) {
    // 限制最大障碍物数量
    if (this.obstacles.length > this.performanceConfig.maxObjects) {
      // 移除最远的障碍物
      this.obstacles = this.obstacles
        .sort((a, b) => b.y - a.y)
        .slice(0, this.performanceConfig.maxObjects)
    }
    
    // 第一步：所有障碍物都更新基础Y坐标（确保与道具移动一致）
    this.obstacles.forEach(obstacle => {
      obstacle.y += gameSpeed
    })
    
    // 第二步：批量更新复杂逻辑（分帧处理）
    const batchSize = this.performanceConfig.updateBatchSize
    const startIndex = this.updateBatchIndex
    const endIndex = Math.min(startIndex + batchSize, this.obstacles.length)
    
    // 更新当前批次的障碍物的复杂逻辑
    for (let i = startIndex; i < endIndex; i++) {
      if (this.obstacles[i]) {
        // 调用updateComplexLogic而不是update，避免重复更新Y坐标
        this.obstacles[i].updateComplexLogic(gameLayoutStore, currentTime, powerUps)
      }
    }
    
    // 更新批次索引
    this.updateBatchIndex = endIndex >= this.obstacles.length ? 0 : endIndex
    
    // 移除超出屏幕的障碍物（每帧都检查）
    this.obstacles = this.obstacles.filter(obstacle => {
      return !obstacle.isOffScreen(gameLayoutStore.canvas.height)
    })
  }
  
  /**
   * 检查泳道是否可用
   * @param {number} lane - 泳道索引
   * @param {Object} gameLayoutStore - 游戏布局store
   * @returns {boolean} 泳道是否可用
   */
  /**
   * 检查泳道是否可用（更新为vw单位）
   */
  isLaneAvailable(lane, gameLayoutStore) {
    const minDistanceVw = DIFFICULTY_CONFIG.absoluteMinInterval // 19vw
    const minDistancePx = gameLayoutStore.canvas.width * (minDistanceVw / 100)
    
    return !this.obstacles.some(obstacle => 
      obstacle.lane === lane && 
      Math.abs(obstacle.y - (-obstacle.height)) < minDistancePx
    )
  }
  
  /**
   * 记录障碍物位置
   * @param {number} lane - 泳道索引
   * @param {number} distance - 距离
   */
  recordObstaclePosition(lane, distance) {
    this.lastObstacleDistance[lane] = distance
  }
  
  /**
   * 检查玩家与障碍物的碰撞
   * @param {Object} player - 玩家对象
   * @returns {Obstacle|null} 碰撞的障碍物或null
   */
  checkPlayerCollision(player) {
    for (const obstacle of this.obstacles) {
      if (obstacle.checkCollision(player)) {
        return obstacle
      }
    }
    return null
  }
  
  /**
   * 移除障碍物
   * @param {Obstacle} obstacle - 要移除的障碍物
   */
  removeObstacle(obstacle) {
    const index = this.obstacles.indexOf(obstacle)
    if (index > -1) {
      this.obstacles.splice(index, 1)
    }
  }
  
  /**
   * 获取所有障碍物的渲染信息
   * @returns {Array} 渲染信息数组
   */
  getRenderInfo() {
    return this.obstacles.map(obstacle => obstacle.getRenderInfo())
  }
  
  /**
   * 预测安全泳道
   * @param {number} playerX - 玩家X位置
   * @param {number} lookAhead - 前瞻距离
   * @param {number} lanes - 泳道数量
   * @returns {number} 推荐的安全泳道索引
   */
  predictSafeLane(playerX, lookAhead, lanes) {
    const nearbyObstacles = this.obstacles.filter(obstacle => 
      obstacle.x > playerX && obstacle.x < playerX + lookAhead
    )
    
    if (nearbyObstacles.length === 0) {
      return -1 // 没有障碍物，任意泳道都安全
    }
    
    // 统计每个泳道的障碍物数量
    const laneCounts = new Array(lanes).fill(0)
    nearbyObstacles.forEach(obstacle => {
      if (obstacle.lane >= 0 && obstacle.lane < lanes) {
        laneCounts[obstacle.lane]++
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
  
  /**
   * 重置管理器状态
   */
  reset() {
    this.obstacles = []
    this.lastObstacleDistance = {}
    this.updateBatchIndex = 0
  }
  
  /**
   * 获取当前障碍物数量
   * @returns {number} 障碍物数量
   */
  getObstacleCount() {
    return this.obstacles.length
  }
  
  /**
   * 创建指定类型的障碍物
   * @param {string} obstacleType - 障碍物类型
   * @param {number} lane - 泳道索引
   * @param {Object} gameLayoutStore - 游戏布局store
   * @returns {Obstacle|null} 创建的障碍物或null
   */
  createObstacle(obstacleType, lane, gameLayoutStore) {
    try {
      return new Obstacle(obstacleType, lane, gameLayoutStore)
    } catch (error) {
      console.warn(`Failed to create obstacle of type ${obstacleType}:`, error)
      return null
    }
  }

  /**
   * 获取指定泳道的所有障碍物（除了指定的障碍物）
   * @param {number} lane - 泳道索引
   * @param {Obstacle} excludeObstacle - 要排除的障碍物
   * @returns {Array} 障碍物数组
   */
  getObstaclesInLane(lane, excludeObstacle = null) {
    return this.obstacles.filter(obstacle => 
      obstacle.lane === lane && obstacle !== excludeObstacle
    )
  }
  
  /**
   * 检测障碍物与其他对象的碰撞（支持跨泳道检测）
   * @param {Obstacle} targetObstacle - 目标障碍物
   * @returns {Obstacle|null} 碰撞的障碍物或null
   */
  checkObstacleCollisions(targetObstacle) {
    for (const obstacle of this.obstacles) {
      if (obstacle === targetObstacle) continue
      
      // 对于obs2类型，检测所有泳道的障碍物
      if (targetObstacle.type === 'obs2') {
        if (targetObstacle.checkCollision(obstacle)) {
          return obstacle
        }
      } else {
        // 其他类型障碍物仍然只检测同一泳道
        if (obstacle.lane !== targetObstacle.lane) continue
        if (targetObstacle.checkCollision(obstacle)) {
          return obstacle
        }
      }
    }
    return null
  }
}