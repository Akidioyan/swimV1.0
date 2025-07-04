/**
 * 障碍物管理器
 * 专门管理障碍物的生命周期、更新和碰撞检测
 */

import { Obstacle } from './Obstacle.js'
import { OBSTACLE_CONFIG, SPAWN_CONFIG, getPerformanceConfig } from './obstacleConfig.js'

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
   */
  updateObstacles(gameSpeed, gameLayoutStore) {
    this.obstacles = this.obstacles.filter(obstacle => {
      // 更新障碍物状态
      obstacle.update(gameSpeed, gameLayoutStore)
      
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
   */
  updateObstaclesOptimized(gameSpeed, gameLayoutStore, currentTime) {
    // 限制最大障碍物数量
    if (this.obstacles.length > this.performanceConfig.maxObjects) {
      // 移除最远的障碍物
      this.obstacles = this.obstacles
        .sort((a, b) => b.y - a.y)
        .slice(0, this.performanceConfig.maxObjects)
    }
    
    // 批量更新障碍物（分帧处理）
    const batchSize = this.performanceConfig.updateBatchSize
    const startIndex = this.updateBatchIndex
    const endIndex = Math.min(startIndex + batchSize, this.obstacles.length)
    
    // 更新当前批次的障碍物
    for (let i = startIndex; i < endIndex; i++) {
      if (this.obstacles[i]) {
        this.obstacles[i].update(gameSpeed, gameLayoutStore, currentTime)
      }
    }
    
    // 更新批次索引
    this.updateBatchIndex = endIndex >= this.obstacles.length ? 0 : endIndex
    
    // 移除超出屏幕的障碍物（每帧只检查部分）
    this.obstacles = this.obstacles.filter((obstacle, index) => {
      // 只检查当前批次的障碍物是否超出屏幕
      if (index >= startIndex && index < endIndex) {
        return !obstacle.isOffScreen(gameLayoutStore.canvas.height)
      }
      return true
    })
  }
  
  /**
   * 检查泳道是否可用
   * @param {number} lane - 泳道索引
   * @param {Object} gameLayoutStore - 游戏布局store
   * @returns {boolean} 泳道是否可用
   */
  isLaneAvailable(lane, gameLayoutStore) {
    const checkHeight = gameLayoutStore.canvas.height * SPAWN_CONFIG.laneOccupation.checkHeight
    
    return !this.obstacles.some(obstacle => 
      obstacle.lane === lane && 
      Math.abs(obstacle.y - (-obstacle.height)) < checkHeight
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
} 