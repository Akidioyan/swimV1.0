<template>
  <div class="game-view">
    <!-- 游戏画布 -->
    <canvas 
      ref="gameCanvas"
      class="game-canvas"
      @click="handleCanvasClick"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
      tabindex="0"
    ></canvas>
    
    <!-- 游戏UI覆盖层 -->
    <div class="game-ui">
      <!-- 统一的顶部UI区域 -->
      <div class="ui-top">
        <!-- 生命显示 - 左上角 -->
        <div class="lives-display">
          <img src="/media/graphics/games/ui/lives-bg.png" alt="生命背景" class="ui-bg-image" />
          <div class="ui-overlay">
            <img v-for="i in gameStore.lives" :key="i" src="/media/graphics/games/ui/heart.png" alt="生命" class="heart" />
            <img v-for="i in (3 - gameStore.lives)" :key="'empty-' + i" src="/media/graphics/games/ui/heart-empty.png" alt="空生命" class="heart-empty" />
          </div>
        </div>
        
        <!-- 距离和得分合并显示 - 中央 -->
        <div class="combined-display">
          <img src="/media/graphics/games/ui/distance-bg.png" alt="信息背景" class="ui-bg-image" />
          <div class="ui-overlay combined-info">
            <div class="score-row">⭐{{ gameStore.score }}</div>
            <div class="distance-row">{{ gameStore.finalDistance }}m</div>
            <div class="speed-tier" :class="speedStatusClass">{{ gameStore.currentActualSpeed.speed }}{{ gameStore.currentActualSpeed.unit }}</div>
          </div>
        </div>
        
        <!-- 控制按钮区域 - 右上角 -->
        <div class="control-buttons">
          <!-- 计时器显示 -->
          <div class="timer-display">
            <span class="time-text" :class="{ 'low-time': isTimeLow }">{{ formattedTime }}</span>
          </div>
          
          <!-- 声音按钮 -->
          <div class="control-btn-wrapper" @click="toggleAllSound()">
            <img 
              :src="isSoundOn ? '/media/graphics/games/ui/sound-on.png' : '/media/graphics/games/ui/sound-off.png'" 
              alt="声音控制" 
              class="control-btn-image" 
            />
          </div>
          
          <!-- 暂停/继续按钮 -->
          <div class="control-btn-wrapper" @click="gameStore.togglePause()">
            <img 
              :src="gameStore.isPaused ? '/media/graphics/games/ui/play.png' : '/media/graphics/games/ui/pause.png'" 
              alt="暂停控制" 
              class="control-btn-image" 
            />
          </div>
        </div>
      </div>
      
      <!-- 冲刺状态指示器 -->
      <div 
        v-if="gameStore.rushActive" 
        class="rush-indicator"
      >
        <div class="rush-icon">🚀</div>
        <div class="rush-time">{{ Math.ceil(gameStore.rushTime / 60) }}s</div>
      </div>
      
      <!-- 无敌状态指示器 -->
      <div 
        v-if="gameStore.invulnerable && !gameStore.rushActive" 
        class="invulnerable-indicator"
      >
        <div class="invulnerable-icon">✨</div>
        <div class="invulnerable-time">{{ Math.ceil(gameStore.invulnerableTime / 60) }}s</div>
      </div>
      
      <!-- 0速度倒计时警告 -->
      <div 
        v-if="gameStore.currentSpeed <= 0 && gameStore.gameState === 'playing'" 
        class="zero-speed-warning"
      >
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">速度为0！</div>
        <div class="countdown-time">{{ Math.ceil((gameStore.maxZeroSpeedTime - gameStore.zeroSpeedTime) / 60) }}s</div>
      </div>
    </div>
    
    <!-- 暂停弹窗
    <div v-if="gameStore.isPaused" class="popup">
      <div class="popup-content">
        <div class="popup-title">⏸️ 游戏暂停</div>
        <div class="popup-text">
          <p>游泳距离：{{ gameStore.finalDistance }}米</p>
          <p>剩余生命：{{ gameStore.lives }}</p>
        </div>
        <div class="popup-buttons">
          <button class="btn btn-primary" @click="gameStore.togglePause()">
            ▶️ 继续游戏
          </button>
          <button class="btn btn-warning" @click="gameStore.backToMenu()">
            🏠 返回主菜单
          </button>
        </div>
      </div> -->
    <!-- </div> -->
    
    <!-- 等待状态提示 -->
    <div 
      v-if="gameStore.gameState === 'waiting'" 
      class="waiting-hint"
    >
      <div class="waiting-content">
        <div class="waiting-text">点击开始游泳！</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { rectangleCollision, isOutOfBounds } from '../utils/collisionDetection'
import { 
  generateObstacle, 
  generatePowerUp, 
  calculateObstacleInterval,
  calculatePowerUpInterval,
  getDifficultyLevel 
} from '../utils/obstacleGenerator'
import { SwimmerAnimation, ObstacleAssets, PowerUpAssets } from '../utils/spriteAnimation'

export default {
  name: 'GameView',
  setup() {
    const gameStore = useGameStore()
    
    // Add this line to ensure the store is properly initialized
    if (!gameStore) console.error('Game store not initialized properly')
    
    const gameCanvas = ref(null)
    const hasInteracted = ref(false)
    
    // 添加键盘按键释放事件变量
    const isKeyCharging = ref(false) // 键盘蓄力状态
    
    // 手势控制相关变量
    const touchStartY = ref(0)
    const touchStartX = ref(0)
    const isSwiping = ref(false)
    const isCharging = ref(false) // 蓄力状态
    const swipeThreshold = 50 // 滑动阈值（像素）
    
    // 声音控制
    const isSoundOn = computed(() => {
      return gameStore.musicEnabled && gameStore.soundEnabled && !gameStore.musicPaused
    })
    
    // 速度状态样式类
    const speedStatusClass = computed(() => {
      const status = gameStore.currentActualSpeed.status
      return {
        'speed-critical': status === 'critical',
        'speed-warning': status === 'warning', 
        'speed-good': status === 'good'
      }
    })
    
    // 计时器显示逻辑
    const LOW_TIME_THRESHOLD = 10 // 低时间阈值（秒）
    
    // 计算属性：格式化剩余时间
    const formattedTime = computed(() => {
      const totalSeconds = Math.max(0, gameStore.remainingTime) // 确保不为负
      return `${Math.floor(totalSeconds)}s`
    })
    
    const isTimeLow = computed(() => {
      // 确保 remainingTime 是数字并且大于0才应用 low-time 逻辑
      return typeof gameStore.remainingTime === 'number' && 
             gameStore.remainingTime > 0 && 
             gameStore.remainingTime < LOW_TIME_THRESHOLD
    })
    
    const toggleAllSound = () => {
      const newState = !isSoundOn.value
      gameStore.musicEnabled = newState
      gameStore.soundEnabled = newState
      gameStore.musicPaused = !newState
      
      if (newState) {
        // 开启声音时播放背景音乐
        if (gameStore.gameState === 'playing') {
          gameStore.backgroundMusic?.play().catch(error => {
            console.log('背景音乐播放失败:', error)
          })
        }
      } else {
        // 关闭声音时暂停背景音乐
        gameStore.backgroundMusic?.pause()
      }
    }
    
    let animationId = null
    let lastTime = 0
    let swimmerAnimation = null
    let obstacleAssets = null
    let powerUpAssets = null
    let backgroundImage = null
    
    onMounted(async () => {
      await nextTick()
      initGame()
    })
    
    onUnmounted(() => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    })
    
    const initGame = () => {
      const canvas = gameCanvas.value
      if (!canvas) return
      
      // 设置画布为全屏
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      
      // 初始化游戏store
      gameStore.initGame(canvas)
      
      // 只有在currentView为game且gameState不是waiting时才重置游戏数据
      // 这样可以避免覆盖从视频进入的等待状态
      if (gameStore.currentView === 'game' && gameStore.gameState !== 'waiting') {
        gameStore.resetGameData()
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
      backgroundImage.src = '/media/graphics/games/bg-menu.png'
    }
    
    const resizeCanvas = () => {
      const canvas = gameCanvas.value
      if (!canvas) return
      
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      
      // 重新计算游戏布局
      gameStore.calculateGameLayout()
      
      // 更新所有对象位置以适应新的泳道布局
      gameStore.updateObjectPositions()
    }
    
    const gameLoop = (currentTime = 0) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      if (gameStore.gameState === 'playing') {
        updateGame(deltaTime)
      }
      
      drawGame(deltaTime)
      
      animationId = requestAnimationFrame(gameLoop)
    }
    
    const updateGame = (deltaTime) => {
      gameStore.animationFrame++
      
      // 计算背景移动速度（减半后的速度）
      const backgroundMoveSpeed = gameStore.gameSpeed * 2.5 // 与gameStore中的背景移动速度保持一致
      
      // 添加这行来更新游戏状态和距离
      gameStore.updateGame()
      
      // 更新游泳者动画
      if (swimmerAnimation) {
        swimmerAnimation.update(deltaTime)
      }
      
      // 更新障碍物动画
      if (obstacleAssets) {
        obstacleAssets.update(deltaTime)
      }
      
      // 只更新X坐标，Y坐标保持固定
      if (Math.abs(gameStore.player.x - gameStore.player.targetX) > 2) {
        gameStore.player.x += (gameStore.player.targetX - gameStore.player.x) * 0.15
      }
      
      // 确保Y坐标始终固定
      gameStore.player.y = gameStore.getLaneY()
      gameStore.player.targetY = gameStore.player.y
      
      // 更新障碍物位置和移动 - 使用背景移动速度
      gameStore.obstacles = gameStore.obstacles.filter(obstacle => {
        obstacle.y += backgroundMoveSpeed // 使用背景移动速度而不是gameSpeed
        
        // 障碍物移动逻辑
        if (obstacle.type === 'rock2') {
          // rock2类型左右移动
          obstacle.x += obstacle.moveSpeed
          
          // 边界检查，保持在泳道内
          const laneLeft = gameStore.getLaneX(obstacle.lane) - gameStore.laneWidth / 2
          const laneRight = gameStore.getLaneX(obstacle.lane) + gameStore.laneWidth / 2
          
          if (obstacle.x <= laneLeft || obstacle.x + obstacle.width >= laneRight) {
            obstacle.moveSpeed *= -1 // 反向移动
          }
        } else if (obstacle.type === 'rock4') {
          // rock4电动水母可以有特殊的移动模式
          obstacle.x += Math.sin(gameStore.animationFrame * 0.1) * 0.5
        }
        
        // 确保障害物始终在泳道中央（除了移动类型）
        if (obstacle.type !== 'rock2' && obstacle.type !== 'rock4') {
          obstacle.x = gameStore.getLaneX(obstacle.lane) - obstacle.width / 2
        }
        
        // 碰撞检测
        if (gameStore.checkCollision(gameStore.player, obstacle)) {
          if (!gameStore.invulnerable) {
            const gameOver = gameStore.takeDamage()
            if (!gameOver) {
              gameStore.addExplosion(obstacle.x, obstacle.y)
            }
            return false
          } else {
            gameStore.addExplosion(obstacle.x, obstacle.y)
            return false
          }
        }
        
        return obstacle.y < gameStore.canvas.height + 100
      })
      
      // 更新道具位置 - 使用背景移动速度
      gameStore.powerUps = gameStore.powerUps.filter(powerUp => {
        powerUp.y += backgroundMoveSpeed // 使用背景移动速度而不是gameSpeed
        powerUp.glowPhase += 0.2
        
        // 确保道具始终在泳道中央（图片中心对齐泳道中心线）
        powerUp.x = gameStore.getLaneX(powerUp.lane) - powerUp.width / 2
        
        // 收集检测
        if (gameStore.checkCollision(gameStore.player, powerUp) && !powerUp.collected) {
          powerUp.collected = true
          gameStore.collectPowerUp(powerUp)
          return false
        }
        
        return powerUp.y < gameStore.canvas.height + 100
      })
      
      // 更新粒子效果
      gameStore.particles = gameStore.particles.filter(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life--
        particle.vy += 0.2 // 重力
        return particle.life > 0
      })
    }
    
    const drawGame = (deltaTime) => {
      const ctx = gameStore.ctx
      const canvas = gameStore.canvas
      
      if (!ctx || !canvas) return
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 绘制背景
      drawBackground(ctx, canvas)
      
      // 绘制水背景
      drawWater(ctx, canvas)
      
      // 绘制泳道分隔线
      drawLanes(ctx, canvas)
      
      // 绘制游戏对象
      drawObstacles(ctx)
      drawPowerUps(ctx)
      drawPlayer(ctx)
      drawParticles(ctx)
      
      // 绘制护盾效果
      if (gameStore.shieldActive) {
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
        
        // 背景垂直循环偏移（改为垂直方向）
        const offsetY = -(gameStore.backgroundOffset % scaledHeight)
        
        // 绘制多个背景图片实现垂直无缝循环（改为垂直方向循环）
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
        // 降级背景 - 渐变色带移动效果（改为垂直渐变）
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
    
    const drawWater = (ctx, canvas) => {
      // 只在泳道区域绘制水波效果
      const gameAreaX = gameStore.gameAreaX
      const gameAreaWidth = gameStore.gameAreaWidth
      
      // 设置裁剪区域，只在泳道区域绘制
      ctx.save()
      ctx.beginPath()
      ctx.rect(gameAreaX, 0, gameAreaWidth, canvas.height)
      ctx.clip()
      
      // 绘制水波效果
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      
      for (let i = 0; i < 15; i++) {
        ctx.beginPath()
        for (let y = 0; y <= canvas.height; y += 10) {
          const x = gameAreaX + Math.sin((y + gameStore.waterOffset * 2) * 0.02 + i * 0.3) * 6 + i * (gameAreaWidth / 15)
          if (y === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }
      
      ctx.restore()
    }
    
    const drawLanes = (ctx, canvas) => {
      // 绘制泳道虚线分隔线
      const gameAreaX = gameStore.gameAreaX
      const gameAreaWidth = gameStore.gameAreaWidth
      const laneWidth = gameStore.laneWidth
      const lanes = gameStore.lanes
      
      // 设置虚线样式
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)' // 半透明白色
      ctx.lineWidth = 2
      ctx.setLineDash([10, 10]) // 设置虚线样式：10像素线段，10像素间隔
      
      // 绘制泳道区域边界线
      ctx.beginPath()
      ctx.moveTo(gameAreaX, 0)
      ctx.lineTo(gameAreaX, canvas.height)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(gameAreaX + gameAreaWidth, 0)
      ctx.lineTo(gameAreaX + gameAreaWidth, canvas.height)
      ctx.stroke()
      
      // 重置虚线设置，避免影响其他绘制
      ctx.setLineDash([])
    }
    
    const drawPlayer = (ctx) => {
      const player = gameStore.player
      
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
        if (powerUpAssets) {
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
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })
      
      ctx.globalAlpha = 1
    }
    
    const drawShield = (ctx) => {
      const player = gameStore.player
      const x = player.x + player.width / 2
      const y = player.y + player.height / 2
      const radius = 35 + Math.sin(gameStore.animationFrame * 0.3) * 3
      
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.stroke()
      
      ctx.globalAlpha = 1
    }
    
    // 鼠标点击处理 - 根据点击位置切换到相邻泳道
    // 修改点击处理，支持点击不同泳道切换
    const handleCanvasClick = (event) => {
      hasInteracted.value = true
      
      // 如果是等待状态，点击启动游戏
      if (gameStore.gameState === 'waiting') {
        const rect = gameCanvas.value.getBoundingClientRect()
        const clickX = event.clientX - rect.left
        
        // 计算点击位置对应的泳道
        const gameAreaX = gameStore.gameAreaX
        const laneWidth = gameStore.laneWidth
        
        if (clickX >= gameAreaX && clickX <= gameAreaX + gameStore.gameAreaWidth) {
          const relativeX = clickX - gameAreaX
          const targetLane = Math.floor(relativeX / laneWidth)
          gameStore.switchToLane(targetLane)
        } else {
          // 点击其他区域也启动游戏
          gameStore.actuallyStartGame()
        }
        return
      }
      
      if (gameStore.gameState === 'playing') {
        const rect = gameCanvas.value.getBoundingClientRect()
        const clickX = event.clientX - rect.left
        
        // 计算点击位置对应的泳道
        const gameAreaX = gameStore.gameAreaX
        const laneWidth = gameStore.laneWidth
        
        if (clickX >= gameAreaX && clickX <= gameAreaX + gameStore.gameAreaWidth) {
          const relativeX = clickX - gameAreaX
          const targetLane = Math.floor(relativeX / laneWidth)
          gameStore.switchToLane(targetLane)
        }
      }
    }
    
    // 在handleCanvasClick函数后添加
    const handleKeyDown = (event) => {
      hasInteracted.value = true
      
      // 如果是等待状态，任何按键都启动游戏
      if (gameStore.gameState === 'waiting') {
        switch(event.key) {
          case 'ArrowLeft':
            event.preventDefault()
            gameStore.switchLane(-1)
            break
          case 'ArrowRight':
            event.preventDefault()
            gameStore.switchLane(1)
            break
          case 'ArrowDown':
            event.preventDefault()
            gameStore.actuallyStartGame()
            break
          case ' ': // 空格键也能启动游戏
            event.preventDefault()
            gameStore.actuallyStartGame()
            break
          default:
            // 其他按键也能启动游戏
            gameStore.actuallyStartGame()
            break
        }
        return
      }
      
      if (gameStore.gameState === 'playing') {
        switch(event.key) {
          case 'ArrowLeft':
            event.preventDefault()
            gameStore.switchLane(-1)
            break
          case 'ArrowRight':
            event.preventDefault()
            gameStore.switchLane(1)
            break
          case 'ArrowDown':
            event.preventDefault()
            // 按下下方向键开始持续游泳
            if (!isKeyCharging.value) {
              isKeyCharging.value = true
              isCharging.value = true
              gameStore.startCharging()
            } else {
              // 持续按住时继续游泳
              gameStore.startCharging()
            }
            break
          case ' ': // 空格键暂停
            event.preventDefault()
            gameStore.togglePause()
            break
        }
      }
    }
    
    // 添加键盘按键释放事件处理
    const handleKeyUp = (event) => {
      if (gameStore.gameState === 'playing') {
        switch(event.key) {
          case 'ArrowDown':
            event.preventDefault()
            // 释放下方向键触发瞬时加速
            if (isKeyCharging.value) {
              isKeyCharging.value = false
              isCharging.value = false
              gameStore.triggerBoost()
            }
            break
        }
      }
    }
    
    // 鼠标事件处理
    const handleMouseDown = (event) => {
      const rect = gameCanvas.value.getBoundingClientRect();
      touchStartY.value = event.clientY;
      touchStartX.value = event.clientX;
      isSwiping.value = false;
      isCharging.value = false;
    }
    
    const handleMouseMove = (event) => {
      if (gameStore.gameState !== 'playing') return;
      
      const deltaY = touchStartY.value - event.clientY;
      
      // 向下拖拽时持续游泳
      if (deltaY < -swipeThreshold && !isCharging.value) {
        isCharging.value = true;
        gameStore.startCharging();
      }
      
      // 保持滑动状态时持续游泳
      if (isCharging.value) {
        gameStore.startCharging(); // 持续调用以维持游泳状态
      }
    }
    
    const handleMouseUp = (event) => {
      if (gameStore.gameState !== 'playing') return;
      
      // 松开鼠标停止游泳
      if (isCharging.value) {
        gameStore.triggerBoost(); // 停止游泳，速度开始衰减
      }
      
      isCharging.value = false;
      isSwiping.value = false;
    }
    
    // 触摸移动事件处理
    const handleTouchMove = (event) => {
      event.preventDefault();
      if (gameStore.gameState !== 'playing') return;
      
      const touch = event.touches[0];
      const deltaY = touchStartY.value - touch.clientY;
      
      // 向下拖拽时持续游泳
      if (deltaY < -swipeThreshold && !isCharging.value) {
        isCharging.value = true;
        gameStore.startCharging();
      }
      
      // 保持滑动状态时持续游泳
      if (isCharging.value) {
        gameStore.startCharging(); // 持续调用以维持游泳状态
      }
    }
    
    const handleTouchEnd = (event) => {
      event.preventDefault();
      
      const touch = event.changedTouches[0];
      const touchEndY = touch.clientY;
      const touchEndX = touch.clientX;
      const deltaY = touchStartY.value - touchEndY;
      const deltaX = touchStartX.value - touchEndX;
      
      // 检查是否为有效滑动
      if (Math.abs(deltaY) > swipeThreshold && gameStore.gameState === 'playing') {
        isSwiping.value = true;
        
        if (deltaY < 0) {
          // 向下滑动结束 - 停止游泳
          if (isCharging.value) {
            gameStore.triggerBoost();
          }
        }
      } else if (!isSwiping.value && gameStore.gameState === 'playing') {
        // 如果不是滑动，则处理泳道切换
        const rect = gameCanvas.value.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        
        // 计算触摸位置对应的泳道
        const gameAreaX = gameStore.gameAreaX;
        const laneWidth = gameStore.laneWidth;
        
        if (touchX >= gameAreaX && touchX <= gameAreaX + gameStore.gameAreaWidth) {
          const relativeX = touchX - gameAreaX;
          const targetLane = Math.floor(relativeX / laneWidth);
          gameStore.switchToLane(targetLane);
        }
      }
      
      // 重置滑动状态
      isSwiping.value = false;
      isCharging.value = false;
    }
    
    // 在return语句中添加所有需要的方法
    return {
      gameStore,
      gameCanvas,
      hasInteracted,
      isSoundOn,
      speedStatusClass,
      formattedTime,
      isTimeLow,
      toggleAllSound,
      handleCanvasClick,
      handleKeyDown,
      handleKeyUp,
      handleTouchStart: (event) => {
        event.preventDefault();
        hasInteracted.value = true;
        
        const touch = event.touches[0];
        touchStartY.value = touch.clientY;
        touchStartX.value = touch.clientX;
        isSwiping.value = false;
        isCharging.value = false;
        
        // 如果是等待状态，触摸任意位置都启动游戏
        if (gameStore.gameState === 'waiting') {
          const rect = gameCanvas.value.getBoundingClientRect();
          const touchX = touch.clientX - rect.left;
          
          // 计算触摸位置对应的泳道
          const gameAreaX = gameStore.gameAreaX;
          const laneWidth = gameStore.laneWidth;
          
          if (touchX >= gameAreaX && touchX <= gameAreaX + gameStore.gameAreaWidth) {
            const relativeX = touchX - gameAreaX;
            const targetLane = Math.floor(relativeX / laneWidth);
            gameStore.switchToLane(targetLane);
          } else {
            // 触摸其他区域也启动游戏
            gameStore.actuallyStartGame();
          }
        }
      },
      handleTouchEnd,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleTouchMove
    };
  }
}
</script>

<style scoped>
/* 自定义字体 */
@font-face {
  font-family: 'HPQDGS';
  src: url('/media/graphics/games/font/HPQDGS.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.game-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: transparent;
}

.game-canvas {
  cursor: pointer;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

/* 游戏UI覆盖层 */
.game-ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

/* 统一的顶部UI区域 */
.ui-top {
  position: absolute;
  top: 15px;
  left: 0;
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 生命显示 - 左上角 */
.lives-display {
  position: relative;
  width: 173px; /* 根据865:361比例计算，如果高度为72px */
  height: 70px;
  pointer-events: auto;
}

/* 距离和得分合并显示 - 中央 */
.combined-display {
  position: relative;
  width: 120px;
  height: 45px;
  pointer-events: auto;
  flex: 1;
  max-width: 300px;
  margin: 0 8px;
}

/* 控制按钮区域 - 右上角 */
.control-buttons {
  display: flex;
  gap: 15px;
  pointer-events: auto;
  align-items: center; /* 添加垂直对齐 */
}

/* 计时器显示样式 */
.timer-display {
  width: calc(5vh * 3); /* 根据图片宽高比计算宽度 */
  height: 5vh; /* 计时器高度 */
  background-image: url('/media/graphics/games/timeRemaining.png'); /* 修正路径 */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center center;
}

.time-text {
  color: rgb(84, 236, 64); /* 绿色时间文字 */
  font-family: 'HPQDGS', 'Impact', 'Arial', monospace;
  font-size: 2.5vh; /* 文字大小 */
  text-align: center;
  transform-origin: center center;
  line-height: 0;
  position: relative;
  left: 10px; /* 向右偏移以适配背景图片 */
}

.time-text.low-time {
  color: #FF3B30; /* 低时间时显示红色 */
  animation: timeLowPulse 0.5s ease-in-out infinite;
}

/* UI背景图片 */
.ui-bg-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保持图片完整显示 */
  object-position: center; /* 图片在容器中居中 */
}

/* UI文字覆盖层 */
.ui-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(100%, 70px); /* 限制最大宽度，可根据需要调整 */
  height: min(100%, 70px); /* 限制最大高度，保持与宽度相同 */
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: 'HPQDGS', Impact, Arial, sans-serif;
  font-weight: bold;
  pointer-events: none;
  z-index: 1; /* 确保覆盖层在图片之上 */
}

/* 合并信息显示样式 */
.combined-info {
  flex-direction: column;
  gap: 2px;
}

.score-row {
  font-size: 16px;
  color: #FFD700;
  text-shadow: 
    2px 2px 0px #000,
    -2px -2px 0px #000,
    2px -2px 0px #000,
    -2px 2px 0px #000,
    0px 2px 4px rgba(0, 0, 0, 0.8);
}

.distance-row {
  font-size: 20px;
  color: #ffd500;
  text-shadow: 
    2px 2px 0px #000,
    -2px -2px 0px #000,
    2px -2px 0px #000,
    -2px 2px 0px #000,
    0px 2px 4px rgba(0, 0, 0, 0.8);
}

.speed-tier {
  font-size: 10px;
  color: #87CEEB;
  text-shadow: 
    1px 1px 0px #000,
    -1px -1px 0px #000,
    1px -1px 0px #000,
    -1px 1px 0px #000;
  margin-top: 2px;
}

/* 速度状态样式 */
.speed-tier.speed-good {
  color: #00FF00; /* 绿色 - 正常速度 */
}

.speed-tier.speed-warning {
  color: #FFA500; /* 橙色 - 减速警告 */
  animation: speedWarning 1s ease-in-out infinite;
}

.speed-tier.speed-critical {
  color: #FF0000; /* 红色 - 危险状态 */
  animation: speedCritical 0.5s ease-in-out infinite;
}

/* 生命心形图标 */
.heart {
  top: 50%;
  width: 26px;
  height: 20px;
  margin-right: 3px;
}

.heart-empty {
  top: 50%;
  width: 26px;
  height: 20px;
  margin-right: 3px;
  opacity: 0.4;
}

/* 控制按钮样式 */
.control-btn-wrapper {
  width: 35px;
  height: 35px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  overflow: hidden;
}

.control-btn-wrapper:hover {
  transform: scale(1.1);
  filter: brightness(1.2);
}

.control-btn-wrapper:active {
  transform: scale(0.95);
}

.control-btn-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* 冲刺状态指示器 */
.rush-indicator {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 69, 0, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-family: 'HPQDGS', Impact, Arial, sans-serif;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: rushPulse 0.5s ease-in-out infinite;
  pointer-events: none;
}

.rush-icon {
  font-size: 20px;
}

.rush-time {
  font-size: 16px;
}

/* 无敌状态指示器 */
.invulnerable-indicator {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 215, 0, 0.9);
  color: #333;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-family: 'HPQDGS', Impact, Arial, sans-serif;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: invulnerablePulse 1s ease-in-out infinite;
  pointer-events: none;
}

.invulnerable-icon {
  font-size: 20px;
}

.invulnerable-time {
  font-size: 16px;
}

/* 0速度倒计时警告 */
.zero-speed-warning {
  position: absolute;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 0, 0, 0.95);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: bold;
  font-family: 'HPQDGS', Impact, Arial, sans-serif;
  box-shadow: 0 6px 20px rgba(255, 0, 0, 0.4);
  animation: criticalWarning 0.5s ease-in-out infinite;
  pointer-events: none;
  z-index: 150;
}

.warning-icon {
  font-size: 24px;
}

.warning-text {
  font-size: 18px;
}

.countdown-time {
  font-size: 20px;
  color: #FFFF00;
}

/* 等待状态提示 */
.waiting-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 30px 40px;
  border-radius: 20px;
  text-align: center;
  animation: waitingPulse 2s ease-in-out infinite;
  z-index: 200;
  backdrop-filter: blur(5px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  font-family: 'HPQDGS', Arial, sans-serif;
  pointer-events: auto;
}

.waiting-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.waiting-icon {
  font-size: 48px;
  animation: swim 1.5s ease-in-out infinite;
}

.waiting-title {
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
}

.waiting-text {
    font-size: 16px;
    opacity: 0.9;
  }

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'HPQDGS', Arial, sans-serif;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-warning {
  background: #ffc107;
  color: #333;
}

.btn-warning:hover {
  background: #e0a800;
}

/* 动画效果 */
@keyframes rushPulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.1); }
}

@keyframes invulnerablePulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.05); }
}

@keyframes waitingPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.02); }
}

@keyframes swim {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}

/* 速度状态动画 */
@keyframes speedWarning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes speedCritical {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.5; 
    transform: scale(1.1);
  }
}

/* 危险警告动画 */
@keyframes criticalWarning {
  0%, 100% { 
    transform: translateX(-50%) scale(1);
    background: rgba(255, 0, 0, 0.95);
  }
  50% { 
    transform: translateX(-50%) scale(1.05);
    background: rgba(255, 100, 100, 0.95);
  }
}

/* 低时间脉冲动画 */
@keyframes timeLowPulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.6;
    transform: scale(1.1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ui-top {
    padding: 0 15px;
  }
  
  .lives-display {
    width: 100px;
    height: 50px;
  }
  
  .combined-display {
    width: 160px;
    height: 60px;
    margin: 0 15px;
  }
  
  .score-row {
    font-size: 20px;
  }
  
  .distance-row {
    font-size: 26px;
  }
  
  .control-btn-wrapper {
    width: 45px;
    height: 45px;
  }
  
  .heart, .heart-empty {
    width: 16px;
    height: 16px;
  }
  
  .waiting-hint {
    padding: 25px 30px;
    border-radius: 15px;
  }
  
  .waiting-icon {
    font-size: 40px;
  }
  
  .waiting-title {
    font-size: 20px;
  }
  
  .waiting-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .ui-top {
    padding: 0 10px;
  }
  
  .lives-display {
    width: 80px;
    height: 40px;
  }
  
  .combined-display {
    width: 120px;
    height: 45px;
    margin: 0 8px;
  }
  
  .score-row {
    font-size: 16px;
  }
  
  .distance-row {
    font-size: 20px;
  }
  
  .control-btn-wrapper {
    width: 35px;
    height: 35px;
  }
  
  .control-buttons {
    gap: 8px;
  }
  
  .heart, .heart-empty {
    width: 12px;
    height: 12px;
    margin-right: 1px;
  }
  
  .waiting-hint {
    padding: 15px 20px;
    border-radius: 10px;
  }
  
  .waiting-icon {
    font-size: 36px;
  }
  
  .waiting-title {
    font-size: 18px;
  }
  
  .waiting-text {
    font-size: 13px;
  }
}
</style>