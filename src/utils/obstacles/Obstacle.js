/**
 * 障碍物类
 * 封装障碍物的属性和行为
 */

import { getObstacleConfig } from './obstacleConfig.js'

export class Obstacle {
  constructor(type, lane, gameLayoutStore) {
    this.config = getObstacleConfig(type)
    if (!this.config) {
      throw new Error(`未知的障碍物类型: ${type}`)
    }
    
    this.type = type
    this.lane = lane
    this.currentLane = lane
    this.targetLane = lane
    
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
    this.baseSpeed = 0
    this.moveSpeed = 0
    this.speedMultiplier = 1.0
    
    if (this.config.type === 'moving' && this.config.movement) {
      const movement = this.config.movement
      
      if (movement.type === 'horizontal') {
        // 使用配置中的基础移动速度
        this.baseSpeed = movement.baseSpeed || movement.speed || 1.5
        // 随机化移动方向
        this.moveDirection = Math.random() > 0.5 ? 1 : -1
        this.moveSpeed = this.baseSpeed * this.moveDirection
        this.bounceOnBoundary = movement.bounceOnBoundary || false
      }
    } else if (this.config.type === 'custom' && this.config.custom) {
      // 自定义障碍物的基础速度
      this.baseSpeed = this.config.custom.baseSpeed || 1.0
      this.moveSpeed = this.baseSpeed
    }
    
    // 跨泳道移动属性（为obs3预留）
    this.laneChangeTimer = 0
    this.nextLaneChangeTime = 0
  }
  
  /**
   * 应用速度倍数
   * @param {number} multiplier - 速度倍数
   */
  applySpeedMultiplier(multiplier) {
    this.speedMultiplier = multiplier
    
    if (this.config.type === 'moving') {
      // 对移动障碍物应用速度倍数，保持移动方向
      const direction = this.moveSpeed >= 0 ? 1 : -1
      this.moveSpeed = this.baseSpeed * this.speedMultiplier * direction
    } else if (this.config.type === 'custom') {
      // 对自定义障碍物应用速度倍数
      this.moveSpeed = this.baseSpeed * this.speedMultiplier
    }
  }
  
  /**
   * 初始化自定义属性
   */
  initCustomProperties() {
    if (this.config.type === 'custom' && this.config.custom) {
      // 为obs3自定义行为预留接口
      this.customBehavior = this.config.custom.behavior || 'default'
      this.specialEffect = this.config.custom.specialEffect || false
      
      // 添加更多自定义属性
      this.customPhase = 0
      this.customAmplitude = 2.0
    }
  }
  
  /**
   * 更新障碍物状态
   * @param {number} gameSpeed - 游戏速度
   * @param {Object} gameLayoutStore - 游戏布局store
   * @param {number} currentTime - 当前时间（可选，用于性能优化）
   */
  update(gameSpeed, gameLayoutStore, currentTime = Date.now()) {
    // 性能优化：控制更新频率
    if (currentTime - this.lastUpdateTime < this.updateInterval) {
      // 只更新基础位置，跳过复杂的移动逻辑
      this.y += gameSpeed
      return
    }
    
    this.lastUpdateTime = currentTime
    
    // 基础移动：向下移动
    this.y += gameSpeed
    
    // 更新动画帧
    this.animationFrame++
    
    // 根据类型执行特定的移动逻辑
    this.updateMovement(gameLayoutStore)
  }
  
  /**
   * 更新移动逻辑
   * @param {Object} gameLayoutStore - 游戏布局store
   */
  updateMovement(gameLayoutStore) {
    switch (this.config.type) {
      case 'static':
        this.updateStaticMovement(gameLayoutStore)
        break
      case 'moving':
        this.updateHorizontalMovement(gameLayoutStore)
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
    // 确保静止障碍物始终在泳道中央
    this.x = gameLayoutStore.getLaneX(this.lane) - this.width / 2
  }
  
  /**
   * 更新水平移动障碍物
   * @param {Object} gameLayoutStore - 游戏布局store
   */
  updateHorizontalMovement(gameLayoutStore) {
    // 水平移动（已应用速度倍数）
    this.x += this.moveSpeed
    
    if (this.bounceOnBoundary) {
      // 边界检查，保持在泳道内
      const laneLeft = gameLayoutStore.getLaneX(this.lane) - gameLayoutStore.laneWidth / 2
      const laneRight = gameLayoutStore.getLaneX(this.lane) + gameLayoutStore.laneWidth / 2
      
      if (this.x <= laneLeft || this.x + this.width >= laneRight) {
        this.moveSpeed *= -1 // 反向移动
      }
    }
  }
  
  /**
   * 更新自定义障碍物（obs3）- 增强版
   * @param {Object} gameLayoutStore - 游戏布局store
   */
  updateCustomMovement(gameLayoutStore) {
    const baseLaneX = gameLayoutStore.getLaneX(this.lane) - this.width / 2
    
    // 更新自定义相位
    this.customPhase += 0.08 * this.speedMultiplier
    
    // 根据自定义行为模式移动
    switch (this.customBehavior) {
      case 'default':
        // 默认行为：保持在泳道中央
        this.x = baseLaneX
        break
        
      case 'wave':
        // 波浪移动（受速度倍数影响）
        this.x = baseLaneX + Math.sin(this.customPhase) * this.customAmplitude * this.speedMultiplier
        break
        
      case 'circle':
        // 圆形移动
        const radius = 15 * this.speedMultiplier
        this.x = baseLaneX + Math.cos(this.customPhase) * radius
        break
        
      case 'zigzag':
        // 之字形移动
        const zigzagSpeed = this.moveSpeed * this.speedMultiplier
        this.x += zigzagSpeed
        
        // 边界反弹
        const laneLeft = gameLayoutStore.getLaneX(this.lane) - gameLayoutStore.laneWidth / 2
        const laneRight = gameLayoutStore.getLaneX(this.lane) + gameLayoutStore.laneWidth / 2
        
        if (this.x <= laneLeft || this.x + this.width >= laneRight) {
          this.moveSpeed *= -1
        }
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
   * 碰撞检测
   * @param {Object} other - 另一个对象
   * @returns {boolean} 是否发生碰撞
   */
  checkCollision(other) {
    const myBox = this.getCollisionBox()
    
    // 获取对方的碰撞盒
    let otherBox
    if (other.getCollisionBox) {
      otherBox = other.getCollisionBox()
    } else {
      // 兼容旧格式
      const otherCollisionWidth = other.collisionWidth || other.width
      const otherCollisionHeight = other.collisionHeight || other.height
      const otherOffsetX = (other.width - otherCollisionWidth) / 2
      const otherOffsetY = (other.height - otherCollisionHeight) / 2
      
      otherBox = {
        x: other.x + otherOffsetX,
        y: other.y + otherOffsetY,
        width: otherCollisionWidth,
        height: otherCollisionHeight
      }
    }
    
    // AABB碰撞检测
    return myBox.x < otherBox.x + otherBox.width &&
           myBox.x + myBox.width > otherBox.x &&
           myBox.y < otherBox.y + otherBox.height &&
           myBox.y + myBox.height > otherBox.y
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
      animationFrame: this.animationFrame,
      color: this.config.color,
      // 添加可见性标志
      visible: true,
      // 添加速度信息用于调试
      speedMultiplier: this.speedMultiplier,
      moveSpeed: this.moveSpeed
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
      baseSpeed: this.baseSpeed,
      moveSpeed: this.moveSpeed,
      speedMultiplier: this.speedMultiplier
    }
  }
} 