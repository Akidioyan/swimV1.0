/**
 * 障碍物类
 * 封装障碍物的属性和行为
 */

import { getGameObjectConfig } from './obstacleConfig.js'

export class Obstacle {
  constructor(type, lane, gameLayoutStore) {
    this.config = getGameObjectConfig(type)
    if (!this.config) {
      throw new Error(`未知的障碍物类型: ${type}`)
    }
    
    this.type = type
    this.lane = lane
    this.currentLane = lane
    this.targetLane = lane
    
    // 在创建时就固定选择一张图片变体
    this.imageVariantIndex = Math.floor(Math.random() * this.getVariantCount(type))
    
    // 获取画布宽度计算尺寸
    const canvasWidth = gameLayoutStore.canvas.width
    
    // 显示尺寸
    this.width = canvasWidth * this.config.displaySize.widthRatio
    this.height = canvasWidth * this.config.displaySize.heightRatio
    
    // 碰撞尺寸
    this.collisionWidth = canvasWidth * this.config.collisionSize.widthRatio
    this.collisionHeight = canvasWidth * this.config.collisionSize.heightRatio
    
    // 位置（居中对齐到泳道）
    this.x = gameLayoutStore.getLaneX(lane) - this.width / 2
    this.y = -this.height
    this.originalX = this.x
    
    // 动画和状态
    this.animationFrame = 0
    this.created = Date.now()
    
    // 性能优化：跟踪上次更新时间
    this.lastUpdateTime = 0
    this.updateInterval = this.calculateUpdateInterval()
    
    // 移动相关属性
    this.initMovementProperties()
    
    // 自定义属性
    this.initCustomProperties()
  }
  
  /**
   * 计算更新间隔（性能优化）
   */
  calculateUpdateInterval() {
    // 统一使用标准更新频率
    return 16.67 // 标准60fps
  }
  
  /**
   * 初始化移动属性
   */
  initMovementProperties() {
    this.moveSpeed = 0
    
    if (this.config.type === 'moving' && this.config.movement) {
      const movement = this.config.movement
      
      if (movement.type === 'horizontal') {
        // 使用配置中的移动速度，随机化移动方向
        const baseSpeed = movement.speed || 1.5
        this.moveDirection = Math.random() > 0.5 ? 1 : -1
        this.moveSpeed = baseSpeed * this.moveDirection
        this.bounceOnBoundary = movement.bounceOnBoundary || false
      }
    }
    
    // 跨泳道移动属性（为obs3预留）
    this.laneChangeTimer = 0
    this.nextLaneChangeTime = 0
  }
  
  /**
   * 初始化自定义属性
   */
  initCustomProperties() {
    if (this.config.type === 'custom' && this.config.custom) {
      // 为obs3自定义行为预留接口
      this.customBehavior = this.config.custom.behavior || 'default'
      this.specialEffect = this.config.custom.specialEffect || false
      
      // 添加自定义属性
      this.customPhase = 0
      this.customAmplitude = 2.0
    }
  }
  
  /**
   * 更新障碍物状态
   * @param {number} gameSpeed - 游戏速度
   * @param {Object} gameLayoutStore - 游戏布局store
   * @param {number} currentTime - 当前时间（可选，用于性能优化）
   * @param {Array} powerUps - 道具数组（用于碰撞检测）
   */
  update(gameSpeed, gameLayoutStore, currentTime = Date.now(), powerUps = []) {
    // 基础移动：向下移动（每帧只更新一次）
    this.y += gameSpeed
    
    // 调用复杂逻辑更新
    this.updateComplexLogic(gameLayoutStore, currentTime, powerUps)
  }
  
  /**
   * 更新复杂逻辑（可分批处理的逻辑）
   * @param {Object} gameLayoutStore - 游戏布局store
   * @param {number} currentTime - 当前时间
   * @param {Array} powerUps - 道具数组（用于碰撞检测）
   */
  updateComplexLogic(gameLayoutStore, currentTime = Date.now(), powerUps = []) {
    // 性能优化：控制复杂逻辑的更新频率
    if (currentTime - this.lastUpdateTime < this.updateInterval) {
      // 跳过复杂的移动逻辑
      return
    }
    
    this.lastUpdateTime = currentTime
    
    // 更新动画帧
    this.animationFrame++
    
    // 根据类型执行特定的移动逻辑，传递powerUps引用
    this.updateMovement(gameLayoutStore, powerUps)
  }
  
  /**
   * 更新移动逻辑
   * @param {Object} gameLayoutStore - 游戏布局store
   * @param {Array} powerUps - 道具数组（用于碰撞检测）
   */
  updateMovement(gameLayoutStore, powerUps) {
    switch (this.config.type) {
      case 'static':
        this.updateStaticMovement(gameLayoutStore)
        break
      case 'moving':
        this.updateHorizontalMovement(gameLayoutStore, powerUps)
        break
      case 'custom':
        this.updateCustomMovement(gameLayoutStore)
        break
    }
  }
  
  /**
   * 更新静止障碍物（确保保持在泳道中央）
   * @param {Object} gameLayoutStore - 游戏布局store
   */
  updateStaticMovement(gameLayoutStore) {
    // 静止障碍物的X坐标在创建时已确定，不需要每帧重新计算
    // 这里可以添加其他静止障碍物的逻辑，但不修改X坐标
  }
  
  /**
   * 更新水平移动障碍物
   * @param {Object} gameLayoutStore - 游戏布局store
   * @param {Array} powerUps - 道具数组（用于碰撞检测）
   */
  updateHorizontalMovement(gameLayoutStore, powerUps) {
    // 保存当前位置，用于碰撞检测后的回退
    const oldX = this.x
    const oldLane = this.lane
    
    // 水平移动
    this.x += this.moveSpeed
    
    // 更新当前所在泳道（允许穿越泳道）
    if (this.type === 'obs2') {
      // 计算当前位置对应的泳道
      const currentLane = gameLayoutStore.getClosestLane(this.x + this.width / 2)
      if (currentLane !== undefined && currentLane >= 0) {
        this.lane = currentLane
      }
    }
    
    let shouldReverse = false
    
    if (this.bounceOnBoundary) {
      // 边界检查，检查是否碰到游戏区域边界
      const gameAreaLeft = gameLayoutStore.gameAreaX
      const gameAreaRight = gameLayoutStore.gameAreaX + gameLayoutStore.gameAreaWidth
      
      if (this.x <= gameAreaLeft || this.x + this.width >= gameAreaRight) {
        shouldReverse = true
      }
    }
    
    // 检测与其他障碍物和道具的碰撞（仅对obs2类型）
    if (this.type === 'obs2' && !shouldReverse) {
      const obstacleManager = gameLayoutStore.obstacleManager
      
      // 检测与其他障碍物的碰撞
      if (obstacleManager && obstacleManager.obstacles) {
        for (const otherObstacle of obstacleManager.obstacles) {
          // 跳过自己
          if (otherObstacle === this) continue
          
          // 检测碰撞
          if (this.checkCollision(otherObstacle)) {
            shouldReverse = true
            break
          }
        }
      }
      
      // 检测与道具的碰撞
      if (!shouldReverse && powerUps) {
        for (const powerUp of powerUps) {
          // 检测碰撞
          if (this.checkCollision(powerUp)) {
            shouldReverse = true
            break
          }
        }
      }
    }
    
    // 如果需要掉头，回退位置并反向移动速度
    if (shouldReverse) {
      this.x = oldX // 回退到移动前的位置
      this.lane = oldLane // 回退泳道
      this.moveSpeed *= -1 // 反向移动
    }
  }
  
  /**
   * 更新自定义障碍物（obs3）
   * @param {Object} gameLayoutStore - 游戏布局store
   */
  updateCustomMovement(gameLayoutStore) {
    const baseLaneX = gameLayoutStore.getLaneX(this.lane) - this.width / 2
    
    // 更新自定义相位
    this.customPhase += 0.08
    
    // 根据自定义行为模式移动
    switch (this.customBehavior) {
      case 'default':
        // 默认行为：保持在泳道中央
        this.x = baseLaneX
        break
        
      case 'wave':
        // 波浪移动
        this.x = baseLaneX + Math.sin(this.customPhase) * this.customAmplitude
        break
        
      default:
        this.x = baseLaneX
    }
  }
  
  /**
   * 检查障碍物是否超出屏幕
   * @param {number} canvasHeight - 画布高度
   * @returns {boolean} 是否超出屏幕
   */
  isOffScreen(canvasHeight) {
    return this.y > canvasHeight + 100
  }
  
  /**
   * 获取碰撞盒
   * @returns {Object} 碰撞盒信息
   */
  getCollisionBox() {
    const offsetX = (this.width - this.collisionWidth) / 2
    const offsetY = (this.height - this.collisionHeight) / 2
    
    return {
      x: this.x + offsetX,
      y: this.y + offsetY,
      width: this.collisionWidth,
      height: this.collisionHeight
    }
  }
  
  /**
   * 碰撞检测 - 使用圆形碰撞检测
   * @param {Object} other - 另一个对象
   * @returns {boolean} 是否发生碰撞
   */
  checkCollision(other) {
    // 获取自己的碰撞圆信息
    const myCollisionWidth = this.collisionWidth || this.width
    const myCollisionHeight = this.collisionHeight || this.height
    const myRadius = Math.min(myCollisionWidth, myCollisionHeight) / 2
    const myCenterX = this.x + this.width / 2
    const myCenterY = this.y + this.height / 2
    
    // 获取对方的碰撞圆信息
    const otherCollisionWidth = other.collisionWidth || other.width
    const otherCollisionHeight = other.collisionHeight || other.height
    const otherRadius = Math.min(otherCollisionWidth, otherCollisionHeight) / 2
    const otherCenterX = other.x + other.width / 2
    const otherCenterY = other.y + other.height / 2
    
    // 计算两个圆心之间的距离
    const dx = myCenterX - otherCenterX
    const dy = myCenterY - otherCenterY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // 如果距离小于两个半径之和，则发生碰撞
    return distance < (myRadius + otherRadius)
  }
  
  /**
   * 获取障碍物渲染信息
   * @returns {Object} 渲染信息
   */
  getRenderInfo() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      type: this.type,
      imageVariantIndex: this.imageVariantIndex, // 添加固定的图片变体索引
      animationFrame: this.animationFrame,
      color: this.config.color,
      visible: true
    }
  }
  
  /**
   * 设置新的泳道（用于跨泳道移动）
   * @param {number} newLane - 新泳道
   * @param {Object} gameLayoutStore - 游戏布局store
   */
  setLane(newLane, gameLayoutStore) {
    this.lane = newLane
    this.currentLane = newLane
    this.targetLane = newLane
    
    // 重新计算位置
    this.x = gameLayoutStore.getLaneX(newLane) - this.width / 2
    this.originalX = this.x
  }
  
  /**
   * 获取性能统计信息
   * @returns {Object} 性能信息
   */
  getPerformanceInfo() {
    return {
      type: this.type,
      updateInterval: this.updateInterval,
      lastUpdateTime: this.lastUpdateTime,
      animationFrame: this.animationFrame,
      moveSpeed: this.moveSpeed
    }
  }
  
  // 新增方法：获取指定类型的变体数量
  getVariantCount(type) {
    const variantCounts = {
      'obs1': 3,
      'obs2': 3, // 修改为3，因为现在有obs2-1.png, obs2-2.png, obs2-3.png
      'obs3': 1
    }
    return variantCounts[type] || 1
  }
}