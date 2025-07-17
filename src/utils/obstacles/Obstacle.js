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
    
    // obs3专用动画状态
    if (this.type === 'obs3') {
      this.obs3AnimationFrame = 0  // obs3专用动画计数器
      this.obs3AnimationSpeed = 1  // 动画播放速度
      this.obs3LoopMode = Math.random() > 0.5 ? 'complex' : 'simple' // 随机选择初始循环模式
      this.obs3CurrentCycle = 0     // 当前循环进度
      this.obs3LastCycleFrame = -1  // 上次记录的循环帧，用于检测循环完成
    }
    
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
    // obs3需要更频繁的更新以支持动画
    if (this.type === 'obs3') {
      return 16 // 每16ms更新一次（约60fps）
    }
    
    switch (this.config.type) {
      case 'static':
        return 100 // 静止障碍物更新频率较低
      case 'moving':
        return 33  // 移动障碍物需要较高频率
      case 'custom':
        return 16  // 自定义障碍物需要高频率
      default:
        return 50
    }
  }
  
  /**
   * 初始化移动属性
   */
  initMovementProperties() {
    // 移动速度（为obs2设置）
    this.moveSpeed = 0
    this.maxMoveSpeed = 0
    this.acceleration = 0
    this.direction = 1
    
    if (this.config.movement) {
      this.moveSpeed = this.config.movement.speed || 0
      this.maxMoveSpeed = Math.abs(this.moveSpeed)
      this.direction = Math.random() > 0.5 ? 1 : -1
      this.moveSpeed *= this.direction
    }
    
    // 跨泳道移动属性（为obs3预留）
    this.crossLaneMovement = false
    this.laneTransitionSpeed = 0
  }
  
  /**
   * 初始化自定义属性
   */
  initCustomProperties() {
    // 为obs3自定义行为预留接口
    if (this.config.custom) {
      this.customBehavior = this.config.custom.behavior || 'default'
      this.specialEffect = this.config.custom.specialEffect || false
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
    // 性能优化：只在指定间隔内更新复杂逻辑
    if (currentTime - this.lastUpdateTime < this.updateInterval) {
      return
    }
    this.lastUpdateTime = currentTime
    
    // 更新动画帧
    this.animationFrame++
    
    // obs3专用动画更新
    if (this.type === 'obs3') {
      this.obs3AnimationFrame += this.obs3AnimationSpeed
      
      // 检测循环完成并切换模式
      this.checkAndSwitchLoopMode()
    }
    
    // 更新移动逻辑
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
    this.updateCurrentLane(gameLayoutStore)
    
    // 修复边界计算：严格控制在第1-4个泳道内（游戏区域边界）
    // 游戏区域从20vw到80vw，对应canvas宽度的20%到80%
    const gameAreaLeft = gameLayoutStore.canvas.width * 0.20  // 20vw - 游戏区域左边界
    const gameAreaRight = gameLayoutStore.canvas.width * 0.80 // 80vw - 游戏区域右边界
    
    // obs2的移动边界应该考虑障碍物宽度，确保整个障碍物都在游戏区域内
    const minX = gameAreaLeft  // 左边界：障碍物左侧贴着游戏区域左边界
    const maxX = gameAreaRight - this.width // 右边界：障碍物右侧贴着游戏区域右边界
    
    let shouldReverse = false
    
    if (this.type === 'obs2') {
      // 简化边界检测逻辑：直接检查障碍物是否超出边界
      if (this.x <= minX || this.x >= maxX) {
        shouldReverse = true
      }
    }
    
    // 检测与其他障碍物和道具的碰撞（仅对obs2类型）
    if (this.type === 'obs2' && !shouldReverse) {
      const gameStore = this.getGameStore()
      if (gameStore) {
        const collidedObstacle = gameStore.obstacleManager.checkObstacleCollisions(this)
        if (collidedObstacle) {
          shouldReverse = true
        }
        
        // 检查与道具的碰撞
        for (const powerUp of powerUps) {
          if (this.checkCollision(powerUp)) {
            shouldReverse = true
            break
          }
        }
      }
    }
    
    // 反弹逻辑
    if (shouldReverse && this.config.movement?.bounceOnBoundary) {
      this.x = oldX // 回退到原位置
      this.lane = oldLane
      this.moveSpeed *= -1 // 反向移动
      this.direction *= -1
    }
  }
  
  /**
   * 更新当前所在泳道
   * @param {Object} gameLayoutStore - 游戏布局store
   */
  updateCurrentLane(gameLayoutStore) {
    const centerX = this.x + this.width / 2
    
    for (let i = 0; i < gameLayoutStore.laneCount; i++) {
      const laneX = gameLayoutStore.getLaneX(i)
      const laneLeft = laneX - gameLayoutStore.laneWidth / 2
      const laneRight = laneX + gameLayoutStore.laneWidth / 2
      
      if (centerX >= laneLeft && centerX <= laneRight) {
        this.currentLane = i
        break
      }
    }
  }
  
  /**
   * 更新自定义障碍物（obs3）
   * @param {Object} gameLayoutStore - 游戏布局store
   */
  updateCustomMovement(gameLayoutStore) {
    // obs3的特殊行为可以在这里实现
    // 目前保持静止，只处理动画
    switch (this.customBehavior) {
      case 'wave':
        // 波浪移动（可选）
        this.x = this.originalX + Math.sin(this.animationFrame * 0.1) * 10
        break
      case 'default':
      default:
        // 保持静止
        break
    }
  }
  
  /**
   * 检查是否超出屏幕
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
   * 检查与其他对象的碰撞（圆形碰撞检测）
   * @param {Object} other - 其他对象
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
   * 检查是否应该触发碰撞（考虑obs3的特殊规则）
   * @param {Object} spriteAssets - 雪碧图资源管理器（用于obs3状态检测）
   * @returns {boolean} 是否应该触发碰撞
   */
  shouldTriggerCollision(spriteAssets = null) {
    switch (this.type) {
      case 'obs1':
      case 'obs2':
        // obs1和obs2始终触发碰撞
        return true
      case 'obs3':
        // obs3仅在危险状态时触发碰撞
        if (spriteAssets && spriteAssets.isObs3Dangerous) {
          return spriteAssets.isObs3Dangerous(this.obs3AnimationFrame, this.obs3LoopMode)
        }
        // 如果没有雪碧图资源，默认不触发碰撞（安全状态）
        return false
      default:
        return true
    }
  }
  
  /**
   * 获取障碍物渲染信息
   * @returns {Object} 渲染信息
   */
  getRenderInfo() {
    const renderInfo = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      type: this.type,
      imageVariantIndex: this.imageVariantIndex, // 添加固定的图片变体索引
      animationFrame: this.type === 'obs3' ? this.obs3AnimationFrame : this.animationFrame,
      color: this.config.color,
      visible: true,
      // obs3专用动画信息
      obs3AnimationFrame: this.type === 'obs3' ? this.obs3AnimationFrame : 0
    }
    
    // 为obs3添加循环模式信息
    if (this.type === 'obs3') {
      renderInfo.obs3LoopMode = this.obs3LoopMode
    }
    
    return renderInfo
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
      obs3AnimationFrame: this.obs3AnimationFrame || 0
    }
  }
  
  /**
   * 获取变体数量（向后兼容）
   * @param {string} type - 障碍物类型
   * @returns {number} 变体数量
   */
  getVariantCount(type) {
    // 在雪碧图系统中，obs1和obs2各有1个变体，obs3有动画
    const variantCounts = {
      'obs1': 1,
      'obs2': 1, 
      'obs3': 1
    }
    return variantCounts[type] || 1
  }
  
  /**
   * 获取游戏Store引用（用于碰撞检测）
   * @returns {Object|null} 游戏Store或null
   */
  getGameStore() {
    // 尝试获取全局游戏Store引用
    if (typeof window !== 'undefined' && window.gameStoreRef) {
      return window.gameStoreRef
    }
    return null
  }

  /**
   * 检查并切换obs3循环模式
   */
  checkAndSwitchLoopMode() {
    if (this.type !== 'obs3') return
    
    // 简化的循环完成检测：基于动画帧数
    const actualFrame = Math.floor(this.obs3AnimationFrame / 3)
    
    let cycleLength
    if (this.obs3LoopMode === 'simple') {
      cycleLength = 24 * 4 // 简单循环：96帧
    } else {
      cycleLength = 24 * 4 // 复杂循环：96帧 (24+24+24+24)
    }
    
    // 检查是否完成了一个循环
    const currentCycle = Math.floor(actualFrame / cycleLength)
    if (currentCycle > this.obs3CurrentCycle) {
      // 循环完成，随机选择下一个循环模式
      this.obs3LoopMode = Math.random() > 0.5 ? 'complex' : 'simple'
      this.obs3CurrentCycle = currentCycle
      
      console.log(`Obs3 循环完成，切换到: ${this.obs3LoopMode} 模式`)
    }
  }
}