/**
 * 碰撞边界调试工具
 * 按P键切换显示所有物体的碰撞边界*/
export class CollisionDebugger {
  constructor() {
    this.isEnabled = false
    this.showLanes = false // 新增：泳道分界线显示状态
    this.setupKeyListener()
  }

  // 设置键盘监听
  setupKeyListener() {
    document.addEventListener('keydown', (event) => {
      if (event.key.toLowerCase() === 'p') {
        this.toggle()
        console.log(`碰撞边界显示: ${this.isEnabled ? '开启' : '关闭'}`)
      }
      
    })
  }

  // 切换显示状态
  toggle() {
    this.isEnabled = !this.isEnabled
  }

  // 新增：切换泳道分界线显示状态
  toggleLanes() {
    this.showLanes = !this.showLanes
  }

  // 绘制玩家碰撞边界 - 圆形
  drawPlayerCollisionBox(ctx, player, gameLayoutStore) {
    if (!this.isEnabled) return

    const radius = Math.min(gameLayoutStore.playerCollisionWidth, gameLayoutStore.playerCollisionHeight) / 2
    const centerX = player.x + player.width / 2
    const centerY = player.y + player.height / 2

    ctx.save()
    ctx.strokeStyle = '#00FF00' // 绿色表示玩家
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5]) // 虚线
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // 绘制障碍物碰撞边界 - 圆形
  drawObstacleCollisionBox(ctx, obstacle, gameLayoutStore) {
    if (!this.isEnabled) return

    const radius = Math.min(gameLayoutStore.obstacleCollisionWidth, gameLayoutStore.obstacleCollisionHeight) / 2
    const centerX = obstacle.x + obstacle.width / 2
    const centerY = obstacle.y + obstacle.height / 2

    ctx.save()
    ctx.strokeStyle = '#FF0000' // 红色表示障碍物
    ctx.lineWidth = 2
    ctx.setLineDash([3, 3]) // 虚线
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // 绘制道具碰撞边界 - 圆形
  drawPowerUpCollisionBox(ctx, powerUp, gameLayoutStore) {
    if (!this.isEnabled) return

    const radius = Math.min(gameLayoutStore.powerUpCollisionWidth, gameLayoutStore.powerUpCollisionHeight) / 2
    const centerX = powerUp.x + powerUp.width / 2
    const centerY = powerUp.y + powerUp.height / 2

    ctx.save()
    ctx.strokeStyle = '#0080FF' // 蓝色表示道具
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4]) // 虚线
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // 绘制所有碰撞边界
  drawAllCollisionBoxes(ctx, gameStore, gameLayoutStore) {
    if (!this.isEnabled) return

    // 绘制玩家碰撞边界
    if (gameLayoutStore.player) {
      this.drawPlayerCollisionBox(ctx, gameLayoutStore.player, gameLayoutStore)
    }

    // 绘制障碍物碰撞边界
    if (gameStore.obstacles) {
      gameStore.obstacles.forEach(obstacle => {
        this.drawObstacleCollisionBox(ctx, obstacle, gameLayoutStore)
      })
    }

    // 绘制道具碰撞边界
    if (gameStore.powerUps) {
      gameStore.powerUps.forEach(powerUp => {
        this.drawPowerUpCollisionBox(ctx, powerUp, gameLayoutStore)
      })
    }

    // 显示调试信息
    this.drawDebugInfo(ctx)
  }

  // 新增：绘制所有调试元素（包括泳道线）
  drawAllDebugElements(ctx, gameStore, gameLayoutStore, canvasWidth, canvasHeight) {
    // 绘制泳道分界线
    this.drawLaneLines(ctx, canvasWidth, canvasHeight)
    
    // 绘制碰撞边界
    this.drawAllCollisionBoxes(ctx, gameStore, gameLayoutStore)
  }

  // 显示调试信息
  drawDebugInfo(ctx) {
    if (!this.isEnabled && !this.showLanes) return

    const infoHeight = this.isEnabled && this.showLanes ? 120 : 100
    
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(10, 10, 220, infoHeight)
    
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '14px Arial'
    
    let yPos = 30
    
    if (this.isEnabled) {
      ctx.fillText('碰撞边界调试模式 (P键)', 20, yPos)
      yPos += 20
      ctx.fillText('绿色: 玩家碰撞圆', 20, yPos)
      yPos += 15
      ctx.fillText('红色: 障碍物碰撞圆', 20, yPos)
      yPos += 15
      ctx.fillText('蓝色: 道具碰撞圆', 20, yPos)
      yPos += 20
    }
    
    if (this.showLanes) {
      ctx.fillText('泳道分界线显示 (Y键)', 20, yPos)
      yPos += 15
      ctx.fillText('黄色: 泳道分界线', 20, yPos)
    }
    
    ctx.restore()
  }

  // 获取当前状态
  getState() {
    return {
      collisionDebug: this.isEnabled,
      laneLines: this.showLanes
    }
  }

  // 新增：获取泳道线显示状态
  getLaneState() {
    return this.showLanes
  }
}

// 创建全局实例
export const collisionDebugger = new CollisionDebugger()