// 游戏布局计算相关
import { defineStore } from 'pinia'

export const useGameLayoutStore = defineStore('gameLayout', {
  state: () => ({
    canvas: null,
    ctx: null,
    
    // 游戏区域布局
    lanes: 4,
    laneWidth: 0,
    gameAreaWidth: 0,
    laneHeight: 0,
    gameAreaX: 0,
    
    // 玩家对象
    player: {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      currentLane: 1,
      width: 0,
      height: 0,
      displayWidth: 0,
      displayHeight: 0,
      collisionWidth: 0,
      collisionHeight: 0
    },
    
    // 全局玩家尺寸
    playerDisplayWidth: 0,
    playerDisplayHeight: 0,
    playerCollisionWidth: 0,
    playerCollisionHeight: 0,
    
    // 游戏对象尺寸（障碍物和道具共用）
    gameObjectDisplayWidth: 0,
    gameObjectDisplayHeight: 0,
    gameObjectCollisionWidth: 0,
    gameObjectCollisionHeight: 0,
    
    // 兼容属性（保留旧的命名以兼容现有代码）
    obstacleDisplayWidth: 0,
    obstacleDisplayHeight: 0,
    obstacleCollisionWidth: 0,
    obstacleCollisionHeight: 0,
    obstacleWidth: 0,
    obstacleHeight: 0,
    obstacleSize: 0,
    powerUpDisplayWidth: 0,
    powerUpDisplayHeight: 0,
    powerUpCollisionWidth: 0,
    powerUpCollisionHeight: 0,
    powerUpWidth: 0,
    powerUpHeight: 0,
    powerUpSize: 0,
    
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
    /**
     * 根据X坐标获取最接近的泳道索引
     * @param {number} x - X坐标
     * @returns {number} 泳道索引
     */
    getClosestLane(x) {
      let closestLane = 0
      let minDistance = Math.abs(x - this.getLaneX(0))
      
      for (let i = 1; i < this.lanes; i++) {
        const distance = Math.abs(x - this.getLaneX(i))
        if (distance < minDistance) {
          minDistance = distance
          closestLane = i
        }
      }
      
      return closestLane
    },
    
    // 获取指定泳道的X坐标（泳道中线）
    getLaneX(laneIndex) {
      if (!this.canvas) return 0 // 添加空值检查
      
      // 根据泳道索引返回对应的中线X坐标（使用canvas宽度而不是window宽度）
      // 泳道中线位置，从左到右分别是27.5vw、42.5vw、57.5vw、72.5vw
      const lanePositions = [27.5, 42.5, 57.5, 72.5];
      return (this.canvas.width * (lanePositions[laneIndex] || 27.5)) / 100;
    },
    
    // 修改getLaneY方法，让玩家距离底部屏幕40%
    getLaneY() {
      if (!this.canvas) return 0
      return this.canvas.height * 0.6 // 距离底部40%（Y坐标为屏幕高度的60%）
    },
    
    // 获取当前玩家Y坐标（考虑冲刺状态）
    getCurrentPlayerY(isActiveSprinting = false) {
      return this.getLaneY()
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
    // 计算游戏布局
    calculateGameLayout() {
      if (!this.canvas) return
      
      const canvasWidth = this.canvas.width
      const canvasHeight = this.canvas.height
      
      // 每个泳道宽度 = 15vw
      this.laneWidth = canvasWidth * 0.15
      
      // 游戏区域宽度 = 60vw (4个泳道总共60%)
      this.gameAreaWidth = canvasWidth * 0.6
      
      this.laneHeight = canvasHeight
      
      // 游戏区域X起始位置 = 20vw (左边景观20%)
      this.gameAreaX = canvasWidth * 0.2
      
      // 设置玩家尺寸 - 使用响应式单位
      this.player.displayWidth = canvasWidth * 0.2          // 显示宽度：20vw
      this.player.displayHeight = canvasWidth * 0.2         // 显示高度：20vh
      this.player.collisionWidth = canvasWidth * 0.1  // 碰撞宽度：显示宽度的0.5倍
      this.player.collisionHeight = canvasWidth * 0.1 // 碰撞高度：显示高度的0.5倍
      
      // 保留旧的属性以兼容现有代码
      this.player.width = this.player.displayWidth
      this.player.height = this.player.displayHeight
      
      // 设置全局玩家尺寸
      this.playerDisplayWidth = this.player.displayWidth
      this.playerDisplayHeight = this.player.displayHeight
      this.playerCollisionWidth = this.player.collisionWidth
      this.playerCollisionHeight = this.player.collisionHeight
      
      // 设置游戏对象尺寸（障碍物和道具共用）- 使用响应式单位
      this.gameObjectDisplayWidth = canvasWidth * 0.10         // 游戏对象显示宽度：10vw
      this.gameObjectDisplayHeight = canvasWidth * 0.10       // 游戏对象显示高度：10vw
      this.gameObjectCollisionWidth = canvasWidth * 0.07   // 游戏对象碰撞宽度：显示宽度的0.7倍
      this.gameObjectCollisionHeight = canvasWidth * 0.07 // 游戏对象碰撞高度：显示高度的0.7倍
      
      // 兼容属性 - 障碍物
      this.obstacleDisplayWidth = this.gameObjectDisplayWidth
      this.obstacleDisplayHeight = this.gameObjectDisplayHeight
      this.obstacleCollisionWidth = this.gameObjectCollisionWidth
      this.obstacleCollisionHeight = this.gameObjectCollisionHeight
      this.obstacleWidth = this.gameObjectDisplayWidth
      this.obstacleHeight = this.gameObjectDisplayHeight
      this.obstacleSize = this.gameObjectDisplayWidth
      
      // 兼容属性 - 道具
      this.powerUpDisplayWidth = this.gameObjectDisplayWidth
      this.powerUpDisplayHeight = this.gameObjectDisplayHeight
      this.powerUpCollisionWidth = this.gameObjectCollisionWidth
      this.powerUpCollisionHeight = this.gameObjectCollisionHeight
      this.powerUpWidth = this.gameObjectDisplayWidth
      this.powerUpHeight = this.gameObjectDisplayHeight
      this.powerUpSize = this.gameObjectDisplayWidth
    },
    
    // 更新玩家位置状态
    updatePlayerPosition(isActiveSprinting = false) {
      // 只更新X坐标，Y坐标保持固定
      if (Math.abs(this.player.x - this.player.targetX) > 2) {
        this.player.x += (this.player.targetX - this.player.x) * 0.15
      }
      
      // 确保Y坐标始终固定，但考虑冲刺状态
      this.player.y = this.getLaneY()
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
    }
  }
})


