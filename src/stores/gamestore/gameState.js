// 游戏状态管理模块
import { defineStore } from 'pinia'
import audioManager from '../../utils/audio-manager'

export const useGameStateStore = defineStore('gameState', {
  state: () => ({
    // 游戏状态
    currentView: 'loading', // loading, intro, game, result, video
    gameState: 'ready', // ready, playing, paused, gameOver, waiting
    
    // 游戏控制
    isPaused: false,
    
    // 游戏设置 - 与音频管理器同步
    musicEnabled: true,
    soundEnabled: true,
    musicPaused: false,
    
    // 游戏统计
    lives: 3,
    maxLives: 3,
    distance: 0,
    score: 0,
    bestScore: parseInt(localStorage.getItem('bestScore') || '0'),
    bestDistance: parseInt(localStorage.getItem('bestDistance') || '0'),
    
    // 无敌和冲刺状态
    invulnerable: false,
    invulnerableTime: 0,
    rushActive: false,
    rushTime: 0,
    
    // 冲刺系统
    sprintEnergy: 100, // 冲刺能量，满值100
    maxSprintDistance: 50, // 最大冲刺距离
    isSprintCooldown: false, // 冲刺冷却状态
    sprintCooldownTime: 0, // 冲刺冷却时间
    
    // 主动冲刺系统
    isActiveSprinting: false, // 主动冲刺状态
    activeSprintTime: 0, // 主动冲刺时间
    sprintEnergyDrainRate: 1.8, // 冲刺能量消耗速率（每帧）
    sprintEnergyRecoverRate: 0.5, // 冲刺能量恢复速率（每帧）
    isSprintKeyHeld: false, // 空格键是否被按住
    
    // 游戏时间
    gameStartTime: 0,
    
    // 游戏速度
    gameSpeed: 2,
    baseSpeed: 2,
    speedMultiplier: 1.0,
  }),
  
  getters: {
    finalDistance: (state) => Math.floor(state.distance),
    
    // 格式化距离显示（例如：1234 → "1.23 km"）
    formattedDistance: (state) => {
      const distance = Math.floor(state.distance)
      if (distance < 1000) {
        return `${distance} m`
      }
      return `${(distance / 1000).toFixed(2)} km`
    },
    
    // 五档速度系统：使用vh单位，适应不同屏幕尺寸
    currentSpeedMultiplier: (state) => {
      const distance = Math.floor(state.distance)
      let baseSpeedMultiplier = 1.0
      
      // 获取视窗高度，转换vh为像素
      const viewportHeight = window.innerHeight
      
      if (distance < 15) {
        // 一档：0-15m，10vh/s
        const targetSpeed = (10 * viewportHeight / 100) / 60 // 转换为每帧像素(60fps)
        baseSpeedMultiplier = targetSpeed / state.baseSpeed
      } else if (distance < 200) {
        // 二档：15-200m，18vh/s
        const targetSpeed = (18 * viewportHeight / 100) / 60 // 转换为每帧像素(60fps)
        baseSpeedMultiplier = targetSpeed / state.baseSpeed
      } else if (distance < 500) {
        // 三档：200-500m，25vh/s
        const targetSpeed = (25 * viewportHeight / 100) / 60 // 转换为每帧像素(60fps)
        baseSpeedMultiplier = targetSpeed / state.baseSpeed
      } else if (distance < 2000) {
        // 四档：500-2000m，32vh/s
        const targetSpeed = (32 * viewportHeight / 100) / 60 // 转换为每帧像素(60fps)
        baseSpeedMultiplier = targetSpeed / state.baseSpeed
      } else {
        // 五档：2000m+，40vh/s
        const targetSpeed = (40 * viewportHeight / 100) / 60 // 转换为每帧像素(60fps)
        baseSpeedMultiplier = targetSpeed / state.baseSpeed
      }
      
      // 开发者测试模式：检查是否有开发者冲刺状态
      if (state.devSprintActive) {
        baseSpeedMultiplier *= 3.0 // 开发者测试3倍速度
      }
      // 道具冲刺状态处理（无敌冲刺）
      else if (state.rushActive) {
        const remainingTime = state.rushTime
        if (remainingTime > 60) { // 前2秒保持2倍速度
          baseSpeedMultiplier *= 2.0
        } else { // 后1秒衰减
          const decayFactor = 1.0 + (1.0 * remainingTime / 60) // 从2倍线性衰减到1倍
          baseSpeedMultiplier *= decayFactor
        }
      }
      // 主动冲刺状态处理（无无敌状态）
      else if (state.isActiveSprinting) {
        baseSpeedMultiplier *= 2.5 // 主动冲刺时2.5倍速度
      }
      
      return Math.max(0.1, baseSpeedMultiplier) // 确保最小速度
    }
  },
  
  actions: {
    // 设置当前视图
    setCurrentView(view) {
      this.currentView = view
    },
    
    // 开始游戏
    startGame() {
      // 先切换到视频播放页面
      this.currentView = 'video'
    },
    
    // 从视频直接开始游戏
    startGameFromVideo() {
      this.currentView = 'game'
      this.gameStartTime = Date.now()
      
      // 重置游戏数据并设置为等待状态
      this.resetGameData('waiting')
      
      // 同步音频状态
      this.syncAudioState()
    },
    
    // 实际开始游戏（从等待状态切换到游戏状态）
    actuallyStartGame() {
      if (this.gameState === 'waiting') {
        this.gameState = 'playing'
        // 开始播放背景音乐
        audioManager.playBackgroundMusic()
      }
    },
    
    // 重新开始游戏
    restartGame() {
      // 重置音频状态
      audioManager.reset()
      this.startGameFromVideo()
    },
    
    // 游戏结束
    gameOver() {
      this.gameState = 'gameOver'
      
      // 停止背景音乐
      audioManager.pauseBackgroundMusic()
      
      // 更新最佳分数
      if (this.score > this.bestScore) {
        this.bestScore = Math.floor(this.score)
        localStorage.setItem('bestScore', this.bestScore.toString())
      }
      
      // 更新最佳距离
      const currentDistance = Math.floor(this.distance)
      if (currentDistance > this.bestDistance) {
        this.bestDistance = currentDistance
        localStorage.setItem('bestDistance', this.bestDistance.toString())
      }
      
      // 切换到结果页面
      setTimeout(() => {
        this.currentView = 'result'
      }, 1000)
    },
    
    // 返回主菜单
    backToMenu() {
      this.currentView = 'intro'
      this.gameState = 'ready'
      // 停止所有音频
      audioManager.pauseBackgroundMusic()
    },
    
    // 切换暂停状态
    togglePause() {
      // 只允许在playing和paused状态之间切换
      if (this.gameState !== 'playing' && this.gameState !== 'paused') return
      
      this.isPaused = !this.isPaused
      
      // 更新游戏状态
      this.gameState = this.isPaused ? 'paused' : 'playing'
      
      // 控制背景音乐
      if (this.isPaused) {
        audioManager.pauseBackgroundMusic()
      } else {
        audioManager.playBackgroundMusic()
      }
    },
    
    // 切换音乐
    toggleMusic() {
      audioManager.toggleMusic()
      // 同步状态
      this.musicPaused = audioManager.musicPaused
    },
    
    // 切换音效
    toggleSound() {
      audioManager.toggleSound()
      // 同步状态
      this.soundEnabled = audioManager.soundEnabled
    },
    
    // 重置游戏数据
    resetGameData(initialGameState = 'playing') {
      this.gameState = initialGameState
      this.lives = 3
      this.distance = 0
      this.score = 0
      this.speedMultiplier = 1.0
      this.gameSpeed = this.baseSpeed
      this.invulnerable = false
      this.invulnerableTime = 0
      this.rushActive = false
      this.rushTime = 0
      this.isPaused = false
      this.gameStartTime = Date.now()
      
      // 重置冲刺系统
      this.sprintEnergy = 100
      this.isSprintCooldown = false
      this.sprintCooldownTime = 0
      
      // 重置主动冲刺系统
      this.isActiveSprinting = false
      this.activeSprintTime = 0
      this.isSprintKeyHeld = false
      
      // 同步音频状态
      this.syncAudioState()
    },
    
    // 受到伤害
    takeDamage() {
      if (this.invulnerable) return false
      
      this.lives--
      if (this.lives <= 0) {
        this.gameOver()
        return true
      } else {
        return false
      }
    },
    
    // 更新距离和得分
    updateDistanceAndScore(gameSpeed) {
      // 更新距离：100像素 = 1米
      this.distance += gameSpeed * 0.01 // 每像素代表0.01米
      
      // 距离得分：每1m +1分
      const newDistanceScore = Math.floor(this.distance)
      const oldDistanceScore = Math.floor(this.distance - gameSpeed * 0.01)
      if (newDistanceScore > oldDistanceScore) {
        this.score += (newDistanceScore - oldDistanceScore)
      }
    },
    
    // 更新游戏状态和计时器
    updateGameState() {
      // 更新无敌状态计时器
      if (this.invulnerableTime > 0) {
        this.invulnerableTime--
        if (this.invulnerableTime <= 0) {
          this.invulnerable = false
        }
      }
      
      // 更新冲刺状态计时器
      if (this.rushTime > 0) {
        this.rushTime--
        if (this.rushTime <= 0) {
          this.rushActive = false
        }
      }
      
      // 更新主动冲刺状态
      this.updateActiveSprint()
      
      // 更新冲刺冷却
      if (this.sprintCooldownTime > 0) {
        this.sprintCooldownTime--
        if (this.sprintCooldownTime <= 0) {
          this.isSprintCooldown = false
        }
      }
      
      // 冲刺能量恢复（只有在不进行主动冲刺时才恢复）
      if (!this.isActiveSprinting && !this.rushActive && !this.isSprintCooldown && this.sprintEnergy < 100) {
        this.sprintEnergy = Math.min(100, this.sprintEnergy + this.sprintEnergyRecoverRate)
      }
      
      // 更新游戏速度
      this.gameSpeed = this.baseSpeed * this.currentSpeedMultiplier
    },
    
    // 更新主动冲刺状态
    updateActiveSprint() {
      // 如果按键被按住且有能量，开始或继续冲刺
      if (this.isSprintKeyHeld && this.sprintEnergy > 0 && !this.rushActive) {
        if (!this.isActiveSprinting) {
          this.isActiveSprinting = true
          this.activeSprintTime = 0
        }
        
        // 消耗能量
        this.sprintEnergy = Math.max(0, this.sprintEnergy - this.sprintEnergyDrainRate)
        this.activeSprintTime++
        
        // 如果能量耗尽，停止冲刺
        if (this.sprintEnergy <= 0) {
          this.stopActiveSprint()
        }
      } else {
        // 停止主动冲刺
        if (this.isActiveSprinting) {
          this.stopActiveSprint()
        }
      }
    },
    
    // 开始主动冲刺
    startActiveSprint() {
      if (this.sprintEnergy > 0 && !this.rushActive && !this.isActiveSprinting) {
        this.isSprintKeyHeld = true
      }
    },
    
    // 停止主动冲刺
    stopActiveSprint() {
      this.isActiveSprinting = false
      this.isSprintKeyHeld = false
      this.activeSprintTime = 0
    },
    
    // 冲刺方法
    startSprint() {
      if (!this.isSprintCooldown && this.sprintEnergy >= 20 && !this.rushActive) {
        this.rushActive = true
        this.rushTime = 60 // 1秒冲刺
        this.sprintEnergy -= 20 // 消耗20能量
        
        // 设置冷却时间
        this.isSprintCooldown = true
        this.sprintCooldownTime = 120 // 2秒冷却
      }
    },
    
    // 减速方法
    startSlowdown() {
      // 临时降低游戏速度
      this.gameSpeed = Math.max(0.5, this.gameSpeed * 0.5)
      
      // 1秒后恢复正常速度
      setTimeout(() => {
        this.gameSpeed = this.baseSpeed * this.currentSpeedMultiplier
      }, 1000)
    },
    
    // 同步音频状态到本地状态
    syncAudioState() {
      this.musicEnabled = audioManager.musicEnabled
      this.soundEnabled = audioManager.soundEnabled
      this.musicPaused = audioManager.musicPaused
    }
  }
})
    
    // 开发者测试模式