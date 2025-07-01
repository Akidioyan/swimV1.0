<template>
  <canvas 
    ref="gameCanvas" 
    class="game-canvas"
    @click="handleCanvasClick"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  ></canvas>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useGameStateStore } from '../../stores/gamestore/gameState'
import { useGameLayoutStore } from '../../stores/gamestore/gameLayout'
import { usePlayerControlStore } from '../../stores/gamestore/playerControl'
import { SwimmerAnimation, ObstacleAssets, PowerUpAssets } from '../../utils/spriteAnimation.js'

export default {
  name: 'GameCanvas',
  setup() {
    const gameStore = useGameStore()
    const gameStateStore = useGameStateStore()
    const gameLayoutStore = useGameLayoutStore()
    const playerControlStore = usePlayerControlStore()
    const gameCanvas = ref(null)
    const hasInteracted = ref(false)
    
    // 手势控制相关变量
    const touchStartY = ref(0)
    const isSwiping = ref(false)
    const swipeThreshold = 50 // 滑动阈值（像素）
    
    // 添加长按冲刺相关变量
    const isTouchingPlayer = ref(false)
    const touchHoldTimer = ref(null)
    const holdThreshold = 50 // 长按阈值（毫秒）
    
    let animationId = null
    let lastTime = 0
    let swimmerAnimation = null
    let obstacleAssets = null
    let powerUpAssets = null
    let backgroundImage = null
    
    onMounted(async () => {
      await nextTick()
      initGame()
      
      // 添加键盘事件监听
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('keyup', handleKeyUp)
    })
    
    onUnmounted(() => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    })
    
    const initGame = () => {
      const canvas = gameCanvas.value
      if (!canvas) return
      
      // 设置画布为全屏
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      
      // 初始化游戏布局store
      gameLayoutStore.initCanvas(canvas, canvas.getContext('2d'))
      
      // 只有在currentView为game且gameState不是waiting时才重置游戏数据
      if (gameStateStore.currentView === 'game' && gameStateStore.gameState !== 'waiting') {
        gameStateStore.resetGameData()
        playerControlStore.resetPlayerControl()
        gameLayoutStore.resetPlayerPosition()
      }
      
      // 初始化动画和资源
      initAssets()
      
      // 开始游戏循环
      gameLoop()
      
      // 添加窗口大小变化监听
      window.addEventListener('resize', resizeCanvas)
    }
    
    const initAssets = () => {
      // 初始化游泳者动画
      swimmerAnimation = new SwimmerAnimation()
      
      // 初始化障碍物资源
      obstacleAssets = new ObstacleAssets()
      
      // 初始化道具资源
      powerUpAssets = new PowerUpAssets()
      
      // 加载背景图片
      backgroundImage = new Image()
      backgroundImage.src = '/bg-menu.png'
    }
    
    const resizeCanvas = () => {
      const canvas = gameCanvas.value
      if (!canvas) return
      
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      
      // 重新计算游戏布局
      gameLayoutStore.calculateGameLayout()
      
      // 更新所有对象位置
      gameStore.updateObjectPositions()
    }
    
    const gameLoop = (currentTime = 0) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      if (gameStateStore.gameState === 'playing') {
        updateGame(deltaTime)
      }
      
      drawGame(deltaTime)
      
      animationId = requestAnimationFrame(gameLoop)
    }
    
    const updateGame = (deltaTime) => {
      gameStore.animationFrame++
      gameStore.waterOffset += gameStateStore.gameSpeed
      gameStore.backgroundOffset -= gameStateStore.gameSpeed
      
      // 更新游戏速度和距离
      gameStateStore.gameSpeed = gameStateStore.baseSpeed * gameStateStore.currentSpeedMultiplier
      
      // 更新游戏状态和距离
      gameStateStore.updateDistanceAndScore(gameStateStore.gameSpeed)
      gameStateStore.updateGameState()
      
      // 更新游泳者动画
      if (swimmerAnimation) {
        swimmerAnimation.update(deltaTime)
      }
      
      // 更新障碍物动画
      if (obstacleAssets) {
        obstacleAssets.update(deltaTime)
      }
      
      // 更新玩家状态
      playerControlStore.updatePlayerState(deltaTime)
      
      // 更新玩家位置
      gameLayoutStore.updatePlayerPosition(gameStateStore.isActiveSprinting)
      
      // 使用统一的游戏对象生成系统
      gameStore.gameObjectTimer++
      if (gameStore.gameObjectTimer > 30) { // 每0.5秒检查一次
        gameStore.generateGameObjects()
        gameStore.gameObjectTimer = 0
      }
      
      // 更新障碍物位置
      updateObstacles()
      
      // 更新道具位置
      updatePowerUps()
      
      // 更新粒子效果
      updateParticles()
    }
    
    const updateObstacles = () => {
      gameStore.obstacles = gameStore.obstacles.filter(obstacle => {
        // 更新障碍物位置
        obstacle.y += gameStateStore.gameSpeed
        
        // 更新障碍物动画帧
        if (obstacle.animationFrame !== undefined) {
          obstacle.animationFrame++
        }
        
        // 处理不同类型障碍物的移动逻辑
        if (obstacle.type === 'obs2') {
          // obs2类型左右移动
          obstacle.x += obstacle.moveSpeed
          
          // 边界检查，保持在泳道内
          const laneLeft = gameLayoutStore.getLaneX(obstacle.lane) - gameLayoutStore.laneWidth / 2
          const laneRight = gameLayoutStore.getLaneX(obstacle.lane) + gameLayoutStore.laneWidth / 2
          
          if (obstacle.x <= laneLeft || obstacle.x + obstacle.width >= laneRight) {
            obstacle.moveSpeed *= -1 // 反向移动
          }
        } else if (obstacle.type === 'obs3' || obstacle.type === 'obs4') {
          // obs3和obs4跨泳道移动
          const currentTime = Date.now()
          
          // 检查是否需要切换目标泳道
          if (currentTime >= obstacle.nextLaneChangeTime) {
            // 随机选择新的目标泳道
            const availableLanes = []
            for (let i = 0; i < gameLayoutStore.lanes; i++) {
              if (i !== obstacle.currentLane) {
                availableLanes.push(i)
              }
            }
            
            if (availableLanes.length > 0) {
              obstacle.targetLane = availableLanes[Math.floor(Math.random() * availableLanes.length)]
              obstacle.nextLaneChangeTime = currentTime + 
                (obstacle.type === 'obs3' ? 2000 : 1500) + Math.random() * 1000
            }
          }
          
          // 平滑移动到目标泳道
          if (obstacle.targetLane !== obstacle.currentLane) {
            const targetX = gameLayoutStore.getLaneX(obstacle.targetLane) - obstacle.width / 2
            const currentX = obstacle.x + obstacle.width / 2
            const targetCenterX = targetX + obstacle.width / 2
            
            const moveSpeed = obstacle.type === 'obs3' ? 0.02 : 0.03
            const deltaX = (targetCenterX - currentX) * moveSpeed
            
            obstacle.x += deltaX
            
            // 检查是否到达目标泳道
            if (Math.abs(targetCenterX - currentX) < 5) {
              obstacle.currentLane = obstacle.targetLane
              obstacle.lane = obstacle.targetLane // 更新泳道信息
              obstacle.x = targetX // 精确对齐
            }
          }
          
          // obs4额外的波浪移动效果
          if (obstacle.type === 'obs4') {
            obstacle.x += Math.sin(gameStore.animationFrame * 0.1) * 0.5
          }
        } else {
          // 确保其他障碍物始终在泳道中央
          obstacle.x = gameLayoutStore.getLaneX(obstacle.lane) - obstacle.width / 2
        }
        
        // 碰撞检测
        const player = {
          x: gameLayoutStore.player.x,
          y: gameLayoutStore.player.y,
          width: gameLayoutStore.player.width,
          height: gameLayoutStore.player.height,
          collisionWidth: gameLayoutStore.player.collisionWidth,
          collisionHeight: gameLayoutStore.player.collisionHeight
        }
        
        if (gameStore.checkCollision(player, obstacle)) {
          if (!playerControlStore.invulnerable) {
            const gameOver = gameStateStore.takeDamage()
            if (!gameOver) {
              gameStore.addExplosion(obstacle.x, obstacle.y)
            }
            return false
          } else {
            gameStore.addExplosion(obstacle.x, obstacle.y)
            return false
          }
        }
        
        return obstacle.y < gameLayoutStore.canvas.height + 100
      })
    }
    
    const updatePowerUps = () => {
      gameStore.powerUps = gameStore.powerUps.filter(powerUp => {
        // 更新道具位置
        powerUp.y += gameStateStore.gameSpeed
        powerUp.glowPhase += 0.2
        
        // 确保道具始终在泳道中央（图片中心对齐泳道中心线）
        powerUp.x = gameLayoutStore.getLaneX(powerUp.lane) - powerUp.width / 2
        
        // 收集检测
        const player = {
          x: gameLayoutStore.player.x,
          y: gameLayoutStore.player.y,
          width: gameLayoutStore.player.width,
          height: gameLayoutStore.player.height,
          collisionWidth: gameLayoutStore.player.collisionWidth,
          collisionHeight: gameLayoutStore.player.collisionHeight
        }
        
        if (gameStore.checkCollision(player, powerUp) && !powerUp.collected) {
          powerUp.collected = true
          gameStore.collectPowerUp(powerUp)
          return false
        }
        
        return powerUp.y < gameLayoutStore.canvas.height + 100
      })
    }
    
    const updateParticles = () => {
      gameStore.particles = gameStore.particles.filter(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life--
        particle.vy += 0.2 // 重力
        return particle.life > 0
      })
    }
    
    const drawGame = (deltaTime) => {
      const ctx = gameLayoutStore.ctx
      const canvas = gameLayoutStore.canvas
      
      if (!ctx || !canvas) return
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制背景
      drawBackground(ctx, canvas)
      
      // 绘制游戏对象
      drawObstacles(ctx)
      drawPowerUps(ctx)
      drawPlayer(ctx)
      drawParticles(ctx)
      
      // 绘制护盾效果
      if (playerControlStore.invulnerable) {
        drawShield(ctx)
      }
    }
    
    const drawBackground = (ctx, canvas) => {
      if (backgroundImage && backgroundImage.complete) {
        // 计算背景偏移
        const bgWidth = backgroundImage.width
        const bgHeight = backgroundImage.height
        
        // 计算缩放比例以填满屏幕
        const scaleX = canvas.width / bgWidth
        const scaleY = canvas.height / bgHeight
        const scale = Math.max(scaleX, scaleY)
        
        const scaledWidth = bgWidth * scale
        const scaledHeight = bgHeight * scale
        
        // 背景垂直循环偏移
        const offsetY = -(gameStore.backgroundOffset % scaledHeight)
        
        // 绘制多个背景图片实现垂直无缝循环
        for (let i = -1; i <= Math.ceil(canvas.height / scaledHeight) + 1; i++) {
          ctx.drawImage(
            backgroundImage, 
            (canvas.width - scaledWidth) / 2, 
            offsetY + i * scaledHeight, 
            scaledWidth, 
            scaledHeight
          )
        }
      } else {
        // 降级背景 - 渐变色带移动效果
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        const offset = (gameStore.backgroundOffset * 0.5) % (canvas.height * 2)
        
        gradient.addColorStop(0, '#87CEEB')
        gradient.addColorStop(0.25, '#4682B4')
        gradient.addColorStop(0.5, '#1e3c72')
        gradient.addColorStop(0.75, '#4682B4')
        gradient.addColorStop(1, '#87CEEB')
        
        ctx.save()
        ctx.translate(0, -offset)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height * 3)
        ctx.restore()
      }
    }
    
    const drawPlayer = (ctx) => {
      const player = gameLayoutStore.player
      
      // 无敌状态闪烁效果
      if (playerControlStore.invulnerable && Math.floor(gameStore.animationFrame / 10) % 2) {
        ctx.globalAlpha = 0.5
      }
      
      if (swimmerAnimation) {
        // 计算保持宽高比的尺寸
        const originalAspectRatio = swimmerAnimation.animations.swim?.frameWidth / swimmerAnimation.animations.swim?.frameHeight || 0.8
        let width = player.width
        let height = player.height
        
        // 根据宽度计算高度，保持宽高比
        if (originalAspectRatio > 0) {
          height = width / originalAspectRatio
        }
        
        swimmerAnimation.draw(ctx, player.x, player.y, width, height)
      } else {
        // 降级绘制
        drawFallbackPlayer(ctx, player)
      }
      
      ctx.globalAlpha = 1
    }
    
    const drawFallbackPlayer = (ctx, player) => {
      const x = player.x
      const y = player.y
      const w = player.width
      const h = player.height
      
      // 游泳者身体
      ctx.fillStyle = '#FFB6C1'
      ctx.fillRect(x + 10, y + 5, w - 20, h - 10)
      
      // 头部
      ctx.fillStyle = '#FDBCB4'
      ctx.beginPath()
      ctx.arc(x + w - 15, y + h/2, 8, 0, Math.PI * 2)
      ctx.fill()
      
      // 游泳动作
      const armOffset = Math.sin(gameStore.animationFrame * 0.3) * 5
      ctx.fillStyle = '#FFB6C1'
      ctx.fillRect(x + armOffset, y + h/2 - 2, 15, 4)
      ctx.fillRect(x + 5 - armOffset, y + h/2 + 5, 15, 4)
      
      // 护目镜
      ctx.fillStyle = '#4169E1'
      ctx.beginPath()
      ctx.arc(x + w - 15, y + h/2, 6, 0, Math.PI * 2)
      ctx.fill()
    }
    
    const drawObstacles = (ctx) => {
      gameStore.obstacles.forEach(obstacle => {
        if (obstacleAssets) {
          obstacleAssets.drawObstacle(ctx, obstacle.type, obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        }
      })
    }
    
    const drawPowerUps = (ctx) => {
      gameStore.powerUps.forEach(powerUp => {
        if (powerUpAssets && !powerUp.collected) {
          const glowing = Math.sin(powerUp.glowPhase) > 0.5
          powerUpAssets.drawPowerUp(ctx, powerUp.type, powerUp.x, powerUp.y, powerUp.width, powerUp.height, glowing)
        }
      })
    }
    
    const drawParticles = (ctx) => {
      gameStore.particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife
        const color = particle.color || 'white'
        
        ctx.fillStyle = color
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size || 3, 0, Math.PI * 2)
        ctx.fill()
      })
      
      ctx.globalAlpha = 1
    }
    
    const drawShield = (ctx) => {
      const player = gameLayoutStore.player
      const x = player.x + player.width / 2
      const y = player.y + player.height / 2 + 10 // 向下偏移10像素
      
      // 使用bubble.png包裹玩家
      const bubbleImage = powerUpAssets?.images?.['bubble']
      if (bubbleImage) {
        const bubbleSize = 100 + Math.sin(gameStore.animationFrame * 0.3) * 5 // 增大气泡尺寸
        ctx.globalAlpha = 0.8
        ctx.drawImage(
          bubbleImage,
          x - bubbleSize / 2,
          y - bubbleSize / 2,
          bubbleSize,
          bubbleSize
        )
        ctx.globalAlpha = 1
      } else {
        // 如果bubble图片未加载，使用原来的圆圈效果作为备用
        const radius = 45 + Math.sin(gameStore.animationFrame * 0.3) * 3 // 增大备用圆圈尺寸
        ctx.strokeStyle = '#FFD700'
        ctx.lineWidth = 3
        ctx.globalAlpha = 0.7
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }
    
    // 键盘事件处理
    const handleKeyDown = (event) => {
      hasInteracted.value = true
      playerControlStore.handleKeyDown(event.key)
    }
    
    const handleKeyUp = (event) => {
      playerControlStore.handleKeyUp(event.key)
    }
    
    // 计算点击位置对应的最近泳道，并返回更多信息
    const calculateNearestLane = (touchX) => {
      const lanes = [0, 1, 2, 3]
      let nearestLane = 0
      let minDistance = Infinity
      let distances = {} // 记录到每个泳道的距离
      
      // 确保gameLayoutStore已经初始化
      if (!gameLayoutStore.canvas) {
        return {
          lane: 1,
          distances: {},
          minDistance: Infinity
        }
      }
      
      lanes.forEach(lane => {
        const laneX = gameLayoutStore.getLaneX(lane)
        const distance = Math.abs(touchX - laneX)
        distances[lane] = distance
        
        if (distance < minDistance) {
          minDistance = distance
          nearestLane = lane
        }
      })
      
      // 确保返回值在有效范围内
      nearestLane = Math.max(0, Math.min(3, nearestLane))
      
      return {
        lane: nearestLane,
        distances,
        minDistance
      }
    }
    
    // 修改鼠标点击处理
    const handleCanvasClick = (event) => {
      hasInteracted.value = true
      
      // 如果是等待状态，点击启动游戏
      if (gameStateStore.gameState === 'waiting') {
        const rect = gameCanvas.value.getBoundingClientRect()
        const clickX = event.clientX - rect.left
        
        // 根据左右半屏决定移动方向
        const screenWidth = rect.width
        const direction = clickX < screenWidth / 2 ? -1 : 1 // 左半屏向左，右半屏向右
        playerControlStore.switchLane(direction)
        return
      }
      
      if (gameStateStore.gameState === 'playing') {
        const rect = gameCanvas.value.getBoundingClientRect()
        const clickX = event.clientX - rect.left
        
        // 根据左右半屏决定移动方向
        const screenWidth = rect.width
        const direction = clickX < screenWidth / 2 ? -1 : 1 // 左半屏向左，右半屏向右
        playerControlStore.switchLane(direction)
      }
    }
    
    const handleTouchStart = (event) => {
      event.preventDefault()
      hasInteracted.value = true
      
      const touch = event.touches[0]
      const rect = gameCanvas.value.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top
      
      touchStartY.value = touchY
      isSwiping.value = false
      
      // 如果是等待状态，触摸任意位置都启动游戏
      if (gameStateStore.gameState === 'waiting') {
        const result = calculateNearestLane(touchX)
        playerControlStore.switchToLane(result.lane)
        return
      }
      
      // 检查是否触摸到玩家角色区域
      if (gameStateStore.gameState === 'playing') {
        const player = gameLayoutStore.player
        
        // 计算触摸点到各泳道的距离
        const result = calculateNearestLane(touchX)
        
        // 只要触摸点最接近玩家当前泳道，就允许冲刺
        if (result.lane === player.currentLane && 
            result.distances[player.currentLane] === result.minDistance) {
          // 触摸到当前泳道，开始长按检测
          isTouchingPlayer.value = true
          
          // 设置长按计时器
          touchHoldTimer.value = setTimeout(() => {
            if (isTouchingPlayer.value && !isSwiping.value) {
              // 长按生效，开始主动冲刺
              gameStateStore.startActiveSprint()
            }
          }, holdThreshold)
        } else {
          // 如果不是当前泳道，直接切换泳道
          playerControlStore.switchToLane(result.lane)
        }
      }
    }
    
    const handleTouchMove = (event) => {
      event.preventDefault()
      
      const touch = event.touches[0]
      const rect = gameCanvas.value.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchCurrentY = touch.clientY
      const deltaY = Math.abs(touchStartY.value - touchCurrentY)
      
      // 如果移动距离超过阈值，取消长按检测
      if (deltaY > 20) {
        isTouchingPlayer.value = false
        if (touchHoldTimer.value) {
          clearTimeout(touchHoldTimer.value)
          touchHoldTimer.value = null
        }
        
        // 如果移动距离足够大，标记为滑动
        if (deltaY > swipeThreshold) {
          isSwiping.value = true
        }
      } else {
        // 检查水平移动是否离开了当前泳道
        const result = calculateNearestLane(touchX)
        if (result.lane !== gameLayoutStore.player.currentLane) {
          // 如果移动到了其他泳道，取消冲刺
          isTouchingPlayer.value = false
          if (touchHoldTimer.value) {
            clearTimeout(touchHoldTimer.value)
            touchHoldTimer.value = null
          }
          // 切换到新泳道
          playerControlStore.switchToLane(result.lane)
        }
      }
    }
    
    const handleTouchEnd = (event) => {
      event.preventDefault()
      
      const touch = event.changedTouches[0]
      const rect = gameCanvas.value.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchEndY = touch.clientY
      const deltaY = touchStartY.value - touchEndY
      
      // 清除长按计时器
      if (touchHoldTimer.value) {
        clearTimeout(touchHoldTimer.value)
        touchHoldTimer.value = null
      }
      
      // 如果是触摸玩家角色后松开，停止主动冲刺
      if (isTouchingPlayer.value) {
        gameStateStore.stopActiveSprint()
        isTouchingPlayer.value = false
        return
      }
      
      // 检查是否为有效滑动
      if (Math.abs(deltaY) > swipeThreshold && gameStateStore.gameState === 'playing') {
        isSwiping.value = true
        
        if (deltaY > 0) {
          // 向上滑动 - 加速冲刺（道具冲刺）
          playerControlStore.startSprint()
        } else {
          // 向下滑动 - 减速
          playerControlStore.startSlowdown()
        }
      } else if (!isSwiping.value && gameStateStore.gameState === 'playing') {
        // 如果不是滑动，则处理泳道切换
        const result = calculateNearestLane(touchX)
        playerControlStore.switchToLane(result.lane)
      }
      
      // 重置所有状态
      isSwiping.value = false
      isTouchingPlayer.value = false
    }
    
    return {
      gameCanvas,
      gameStore,
      gameStateStore,
      gameLayoutStore,
      playerControlStore,
      hasInteracted,
      isTouchingPlayer,
      handleCanvasClick,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd
    }
  }
}
</script>

<style scoped>
.game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  cursor: pointer;
  touch-action: none;
}
</style>