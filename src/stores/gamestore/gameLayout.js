// 游戏布局计算相关
import { defineStore } from 'pinia'

export const useGameLayoutStore = defineStore('gameLayout', {
  state: () => ({
    // Canvas相关
    canvas: null,
    ctx: null,
    
    // 游戏区域布局
    lanes: 4,
    laneHeight: 0,
    laneWidth: 0,
    gameAreaWidth: 0,
    gameAreaX: 0, // 游戏区域X起始位置
    gameAreaHeight: 0,
    gameAreaY: 0,
    
    // 玩家数据
    player: {
      x: 100,
      y: 0,
      width: 0, // 将在calculateGameLayout中动态设置
      height: 0, // 将在calculateGameLayout中动态设置
      currentLane: 1, // 0, 1, 2, 3
      targetX: 0,
      targetY: 0,
      speed: 8,
      // 显示尺寸
      displayWidth: 0,
      displayHeight: 0,
      // 碰撞尺寸
      collisionWidth: 0,
      collisionHeight: 0,
    },
    
    // 玩家显示和碰撞尺寸
    playerDisplayWidth: 0,
    playerDisplayHeight: 0,
    playerCollisionWidth: 0,
    playerCollisionHeight: 0,
    
    // 障碍物尺寸
    obstacleDisplayWidth: 0,
    obstacleDisplayHeight: 0,
    obstacleCollisionWidth: 0,
    obstacleCollisionHeight: 0,
    obstacleWidth: 0, // 兼容属性
    obstacleHeight: 0, // 兼容属性
    obstacleSize: 0, // 兼容属性
    
    // 道具尺寸
    powerUpDisplayWidth: 0,
    powerUpDisplayHeight: 0,
    powerUpCollisionWidth: 0,
    powerUpCollisionHeight: 0,
    powerUpWidth: 0, // 兼容属性
    powerUpHeight: 0, // 兼容属性
    powerUpSize: 0, // 兼容属性
    
    // 玩家位置
    playerX: 0,
    playerY: 0,
  }),
  
  getters: {
    // 获取玩家当前所在的泳道中心X坐标
    playerCenterX: (state) => {
      return state.playerX
    },
    
    // 获取玩家当前Y坐标
    playerCenterY: (state) => {
      return state.playerY
    }
  },
  
  actions: {
    // 获取指定泳道的X坐标（泳道中线）
    getLaneX(laneIndex) {
      if (!this.canvas) return 0 // 添加空值检查
      
      const screenWidth = this.canvas.width
      
      // 根据泳道索引返回对应的中线X坐标
      switch(laneIndex) {
        case 0: // 第一泳道中线
          return screenWidth * 0.275
        case 1: // 第二泳道中线
          return screenWidth * 0.425
        case 2: // 第三泳道中线
          return screenWidth * 0.575
        case 3: // 第四泳道中线
          return screenWidth * 0.725
        default:
          return screenWidth * 0.275
      }
    },
    
    // 修改getLaneY方法，让玩家距离底部屏幕20%，再往上移20vh
    getLaneY(isActiveSprinting = false) {
      if (!this.canvas) return 0
      
      // 计算20vh对应的像素值（假设100vh = canvas.height）
      const vh20 = this.canvas.height * 0.2
      
      // 如果正在主动冲刺，玩家位置向前移动（Y坐标减少）
      if (isActiveSprinting) {
        return this.canvas.height * 0.65 - vh20 // 冲刺时移动到屏幕65%位置，再往上移20vh
      }
      
      return this.canvas.height * 0.8 - vh20 // 正常位置：距离底部20%，再往上移20vh（Y坐标为屏幕高度的60%）
    },
    
    // 获取当前玩家Y坐标（考虑冲刺状态）
    getCurrentPlayerY(isActiveSprinting = false) {
      return this.getLaneY(isActiveSprinting)
    },
    
    // 初始化Canvas
    initCanvas(canvas, ctx) {
      this.canvas = canvas
      this.ctx = ctx
      
      // 计算游戏区域布局
      this.calculateGameLayout()
      
      // 设置玩家初始位置
      this.player.x = this.getLaneX(1) - this.player.width / 2 // 玩家图片中点对齐泳道中心线
      this.player.targetX = this.player.x
      this.player.y = this.getLaneY() // 固定y坐标
      this.player.targetY = this.player.y
      
      // 设置玩家位置状态
      this.updatePlayerPosition()
    },
    
    // 计算游戏布局
    calculateGameLayout() {
      if (!this.canvas) return
      
      const screenWidth = this.canvas.width
      const screenHeight = this.canvas.height
      
      // 每个泳道宽度 = 屏幕宽度 * 0.15 (15%)
      this.laneWidth = screenWidth * 0.15
      
      // 游戏区域宽度 = 屏幕宽度 * 0.60 (4个泳道总共60%)
      this.gameAreaWidth = screenWidth * 0.6
      
      this.laneHeight = screenHeight
      
      // 游戏区域X起始位置 = 屏幕宽度 * 0.2 (左边景观20%)
      this.gameAreaX = screenWidth * 0.2
      
      // 设置玩家尺寸 - 显示尺寸和碰撞尺寸都加大1.5倍
      this.player.displayWidth = screenWidth * 0.15 * 1.5          // 显示宽度：15% * 1.5 = 22.5%
      this.player.displayHeight = screenWidth * 0.08 * 1.5         // 显示高度：8% * 1.5 = 12%
      this.player.collisionWidth = screenWidth * 0.105 * 1.5       // 碰撞宽度：10.5% * 1.5 = 15.75%
      this.player.collisionHeight = screenWidth * 0.056 * 1.5      // 碰撞高度：5.6% * 1.5 = 8.4%
      
      // 保留旧的属性以兼容现有代码
      this.player.width = this.player.displayWidth
      this.player.height = this.player.displayHeight
      
      // 设置全局玩家尺寸
      this.playerDisplayWidth = this.player.displayWidth
      this.playerDisplayHeight = this.player.displayHeight
      this.playerCollisionWidth = this.player.collisionWidth
      this.playerCollisionHeight = this.player.collisionHeight
      
      // 设置障碍物尺寸 - 显示尺寸 10% × 10%，碰撞尺寸 7% × 4%
      this.obstacleDisplayWidth = screenWidth * 0.10         // 障碍物显示宽度
      this.obstacleDisplayHeight = screenWidth * 0.10        // 障碍物显示高度
      this.obstacleCollisionWidth = screenWidth * 0.07       // 障碍物碰撞宽度
      this.obstacleCollisionHeight = screenWidth * 0.04      // 障碍物碰撞高度
      
      // 保留旧的属性以兼容现有代码
      this.obstacleWidth = this.obstacleDisplayWidth
      this.obstacleHeight = this.obstacleDisplayHeight
      this.obstacleSize = this.obstacleDisplayWidth
      
      // 设置道具尺寸 - 显示尺寸 10% × 10%，碰撞尺寸 7% × 7%
      this.powerUpDisplayWidth = screenWidth * 0.10          // 道具显示宽度
      this.powerUpDisplayHeight = screenWidth * 0.10         // 道具显示高度
      this.powerUpCollisionWidth = screenWidth * 0.07        // 道具碰撞宽度 (10% * 0.7)
      this.powerUpCollisionHeight = screenWidth * 0.07       // 道具碰撞高度 (10% * 0.7)
      
      // 保留旧的属性以兼容现有代码
      this.powerUpWidth = this.powerUpDisplayWidth
      this.powerUpHeight = this.powerUpDisplayHeight
      this.powerUpSize = this.powerUpDisplayWidth
    },
    
    // 更新玩家位置状态
    updatePlayerPosition(isActiveSprinting = false) {
      // 只更新X坐标，Y坐标保持固定
      if (Math.abs(this.player.x - this.player.targetX) > 2) {
        this.player.x += (this.player.targetX - this.player.x) * 0.15
      }
      
      // 确保Y坐标始终固定，但考虑冲刺状态
      this.player.y = this.getLaneY(isActiveSprinting)
      this.player.targetY = this.player.y
      
      // 更新全局玩家位置
      this.playerX = this.player.x + this.player.width / 2 // 玩家中心点
      this.playerY = this.player.y + this.player.height / 2
    },
    
    // 切换泳道
    switchToLane(targetLane) {
      if (targetLane < 0 || targetLane >= this.lanes) return
      
      if (targetLane !== this.player.currentLane) {
        this.player.currentLane = targetLane
        this.player.targetX = this.getLaneX(targetLane) - this.player.width / 2 // 玩家图片中点对齐泳道中心线
      }
    },
    
    // 更新对象位置（根据泳道布局调整游戏对象位置）
    updateObjectPositions() {
      // 更新玩家位置
      if (this.canvas) {
        this.player.x = this.getLaneX(this.player.currentLane) - this.player.width / 2
        this.player.targetX = this.player.x
        this.updatePlayerPosition()
      }
    },
    
    // 检查泳道是否被占用
    checkLaneOccupied(lane, yPosition, objects, minDistance = 100) {
      return objects.some(obj => 
        obj.lane === lane && 
        Math.abs(obj.y - yPosition) < minDistance
      )
    },
    
    // 重置玩家位置
    resetPlayerPosition() {
      this.player.currentLane = 1
      
      // 只有在canvas存在时才设置玩家位置
      if (this.canvas) {
        // 玩家X坐标设置为泳道中线减去玩家宽度的一半（居中对齐）
        const centerX = this.getLaneX(1)
        this.player.x = centerX - this.player.width / 2
        this.player.y = this.getLaneY() // 固定Y坐标
        this.player.targetX = this.player.x
        this.player.targetY = this.player.y // Y坐标目标值也固定
        
        this.updatePlayerPosition()
      }
    },
    
    // 窗口大小改变时重新计算布局
    handleResize() {
      this.calculateGameLayout()
    },
    
    // 获取指定泳道的X坐标（泳道中线）
    getLaneX(laneIndex) {
      if (!this.canvas) return 0 // 添加空值检查
      
      const screenWidth = this.canvas.width
      
      // 根据泳道索引返回对应的中线X坐标
      switch(laneIndex) {
        case 0: // 第一泳道中线
          return screenWidth * 0.275
        case 1: // 第二泳道中线
          return screenWidth * 0.425
        case 2: // 第三泳道中线
          return screenWidth * 0.575
        case 3: // 第四泳道中线
          return screenWidth * 0.725
        default:
          return screenWidth * 0.275
      }
    },
    
    // 修改getLaneY方法，让玩家距离底部屏幕20%
    getLaneY() {
      if (!this.canvas) return 0
      return this.canvas.height * 0.8 // 距离底部20%（Y坐标为屏幕高度的80%）
    }
  }
})