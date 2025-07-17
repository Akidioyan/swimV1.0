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
import { SwimmerAnimation } from '../../utils/spriteAnimation.js'
import { ObstacleAssets, PowerUpAssets, StarEffects } from '../../utils/obstacles/AssetManager.js'
import { SpriteObstacleAssets } from '../../utils/obstacles/SpriteObstacleAssets.js'
import { collisionDebugger } from '../../utils/collisionDebugger.js'

export default {
  name: 'GameCanvas',
  setup() {
    const gameStore = useGameStore()
    const gameStateStore = useGameStateStore()
    const gameLayoutStore = useGameLayoutStore()
    const playerControlStore = usePlayerControlStore()
    const gameCanvas = ref(null)
    const hasInteracted = ref(false)
    
    let animationId = null
    let lastTime = 0
    let swimmerAnimation = null
    let obstacleAssets = null  // 旧的资源管理器（保留作为降级）
    let spriteObstacleAssets = null  // 新的雪碧图资源管理器
    let powerUpAssets = null
    let starEffects = null
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
      
      // 清理resize事件监听器
      window.removeEventListener('resize', resizeCanvas)
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
      
      // 完全重置所有游戏状态（无论当前状态如何）
      gameStore.resetGameState()
      gameStateStore.resetGameData('waiting')
      playerControlStore.resetPlayerControl()
      gameLayoutStore.resetPlayerPosition()
      
      // 初始化动画和资源
      initAssets()
      
      // 开始游戏循环
      gameLoop()
      
      // 添加窗口大小变化监听
      window.addEventListener('resize', resizeCanvas)
    }
    
    const initAssets = () => {
      // 使用预加载的资源
      const gameStateStore = useGameStateStore()
      const loadedResources = gameStateStore.getLoadedResources()
      
      if (loadedResources && loadedResources.isLoaded) {
        // 使用预加载的资源管理器
        swimmerAnimation = loadedResources.swimmerAnimation
        obstacleAssets = loadedResources.obstacleAssets
        powerUpAssets = loadedResources.powerUpAssets
        starEffects = loadedResources.starEffects
        backgroundImage = loadedResources.backgroundImage
        
        // 检查是否有新的雪碧图资源管理器
        if (loadedResources.spriteObstacleAssets) {
          spriteObstacleAssets = loadedResources.spriteObstacleAssets
        } else {
          // 如果没有预加载的雪碧图资源，创建新的
          spriteObstacleAssets = new SpriteObstacleAssets()
        }
        
        console.log('使用预加载的游戏资源')
      } else {
        // 降级方案：如果资源未预加载，则创建新的实例
        console.warn('资源未预加载，使用降级方案')
        
        swimmerAnimation = new SwimmerAnimation()
        obstacleAssets = new ObstacleAssets()
        spriteObstacleAssets = new SpriteObstacleAssets()  // 创建新的雪碧图资源管理器
        powerUpAssets = new PowerUpAssets()
        starEffects = new StarEffects()
        
        // 加载背景图片
        backgroundImage = new Image()
        backgroundImage.src = '/bg-menu.png'
      }
      
      // 设置全局游戏Store引用（用于障碍物碰撞检测）
      if (typeof window !== 'undefined') {
        window.gameStoreRef = gameStore
      }
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
      
      // 更新星星特效
      if (starEffects) {
        starEffects.update(gameStateStore.gameSpeed)
      }
      
      // 更新玩家状态
      playerControlStore.updatePlayerState(deltaTime)
      
      // 更新玩家位置
      gameLayoutStore.updatePlayerPosition(gameStateStore.isActiveSprinting)
      
      // 更新障碍物系统（使用性能优化版本）
      const currentTime = performance.now()
      gameStore.updateObstacleSystemOptimized(gameStateStore.gameSpeed, gameLayoutStore, gameStateStore, currentTime)
      
      // 更新道具位置
      updatePowerUps()
      
      // 更新粒子效果
      updateParticles()
      
      // 检查碰撞
      checkCollisions()
    }
    
    // 新增：统一的碰撞检测函数
    const checkCollisions = () => {
      const player = {
        x: gameLayoutStore.player.x,
        y: gameLayoutStore.player.y,
        width: gameLayoutStore.player.width,
        height: gameLayoutStore.player.height,
        collisionWidth: gameLayoutStore.player.collisionWidth,
        collisionHeight: gameLayoutStore.player.collisionHeight
      }
      
      // 检查障碍物碰撞 - 使用gameStateStore.invulnerable确保状态一致性
      if (!gameStateStore.invulnerable) {
        const collidedObstacle = gameStore.checkObstacleCollisionWithSpriteAssets(player, spriteObstacleAssets)
        if (collidedObstacle) {
          const gameOver = gameStateStore.takeDamage()
          if (!gameOver) {
            gameStore.removeObstacleWithEffect(collidedObstacle)
          }
        }
      }
    }
    
    const updatePowerUps = () => {
      gameStore.powerUps = gameStore.powerUps.filter(powerUp => {
        // 更新道具位置
        powerUp.y += gameStateStore.gameSpeed
        powerUp.glowPhase += 0.2
        
        // 道具的X坐标在创建时已确定，不需要每帧重新计算
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
        // 粒子自身的移动
        particle.x += particle.vx
        particle.y += particle.vy
        
        // 与游戏速度保持一致的向下移动
        particle.y += gameStateStore.gameSpeed
        
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
      
      // 绘制游戏对象 - 调整顺序让障碍物显示在玩家上面
      drawPowerUps(ctx)     // 1. 道具在最底层
      drawPlayer(ctx)       // 2. 玩家在中间层
      drawObstacles(ctx)    // 3. 障碍物在最上层（显示在玩家上面）
      
      // 绘制星星特效
      if (starEffects) {
        starEffects.draw(ctx)
      }
      
      // 绘制粒子效果
      drawParticles(ctx)
      
      // 绘制护盾效果 - 使用gameStateStore.invulnerable确保状态一致性
      if (gameStateStore.invulnerable) {
        drawShield(ctx)
      }
      
      // 绘制碰撞边界调试信息（只在按P键开启时显示）
      collisionDebugger.drawAllCollisionBoxes(ctx, gameStore, gameLayoutStore)
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
      
      // 无敌状态闪烁效果 - 使用gameStateStore.invulnerable确保状态一致性
      if (gameStateStore.invulnerable && Math.floor(gameStore.animationFrame / 10) % 2) {
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
      // 使用新的障碍物管理系统获取渲染信息
      const obstacleRenderInfo = gameStore.getObstacleRenderInfo()
      
      obstacleRenderInfo.forEach(obstacle => {
        // 优先使用雪碧图资源管理器
        if (spriteObstacleAssets && spriteObstacleAssets.checkAllLoaded()) {
          // 使用新的雪碧图系统绘制
          const animationFrame = obstacle.obs3AnimationFrame || obstacle.animationFrame
          const loopMode = obstacle.obs3LoopMode || 'complex'
          
          spriteObstacleAssets.drawObstacle(
            ctx, 
            obstacle.type, 
            obstacle.x, 
            obstacle.y, 
            obstacle.width, 
            obstacle.height, 
            animationFrame,
            loopMode
          )
        } else if (obstacleAssets) {
          // 降级到旧的资源管理器
          obstacleAssets.drawObstacle(ctx, obstacle.type, obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.imageVariantIndex)
        } else {
          // 最终降级渲染
          ctx.fillStyle = obstacle.color
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
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
      const y = player.y + player.height / 2
      
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
    
    // 鼠标点击处理
    const handleCanvasClick = (event) => {
      hasInteracted.value = true
      
      const rect = gameCanvas.value.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const canvasWidth = rect.width // 使用canvas宽度而非screenWidth
      
      // 如果是等待状态，点击任意位置启动游戏
      if (gameStateStore.gameState === 'waiting') {
        // 判断点击位置是左半屏还是右半屏
        if (clickX < canvasWidth / 2) {
          // 点击左半屏，向左移动一个泳道
          playerControlStore.switchLane(-1)
        } else {
          // 点击右半屏，向右移动一个泳道
          playerControlStore.switchLane(1)
        }
        return
      }
      
      if (gameStateStore.gameState === 'playing') {
        // 判断点击位置是左半屏还是右半屏
        if (clickX < canvasWidth / 2) {
          // 点击左半屏，向左移动一个泳道
          playerControlStore.switchLane(-1)
        } else {
          // 点击右半屏，向右移动一个泳道
          playerControlStore.switchLane(1)
        }
      }
    }

    const handleTouchStart = (event) => {
      event.preventDefault()
      hasInteracted.value = true
      
      const touch = event.touches[0]
      const rect = gameCanvas.value.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top
      const canvasWidth = rect.width // 使用canvas宽度而非screenWidth
      
      // 如果是等待状态，触摸任意位置都启动游戏
      if (gameStateStore.gameState === 'waiting') {
        // 判断触摸位置是左半屏还是右半屏
        if (touchX < canvasWidth / 2) {
          // 点击左半屏，向左移动一个泳道
          playerControlStore.switchLane(-1)
        } else {
          // 点击右半屏，向右移动一个泳道
          playerControlStore.switchLane(1)
        }
        return
      }
      
      // 如果是游戏进行状态
      if (gameStateStore.gameState === 'playing') {
        // 判断触摸位置是左半屏还是右半屏
        if (touchX < canvasWidth / 2) {
          // 点击左半屏，向左移动一个泳道
          playerControlStore.switchLane(-1)
        } else {
          // 点击右半屏，向右移动一个泳道
          playerControlStore.switchLane(1)
        }
      }
    }
    
    const handleTouchMove = (event) => {
      event.preventDefault()
    }
    
    const handleTouchEnd = (event) => {
      event.preventDefault()
    }
    
    return {
      gameCanvas,
      gameStore,
      gameStateStore,
      gameLayoutStore,
      playerControlStore,
      hasInteracted,
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