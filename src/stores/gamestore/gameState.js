// 游戏状态管理模块
import { defineStore } from 'pinia'
import audioManager from '../../utils/audio-manager'
import vibrationManager from '../../utils/vibration.js'
import { getDifficultyLevelFromVw, getMovementSpeed, convertMetersToVw } from '../../utils/obstacles/obstacleConfig.js'

export const useGameStateStore = defineStore('gameState', {
  state: () => ({
    // 游戏状态
    currentView: 'loading',
    gameState: 'ready',
    
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
    stars: 0, // 添加星星计数
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
    
    // 首次游戏相关状态
    isFirstTimeGame: true, // 是否是首次游戏
    hasShownObstacleHint: false, // 是否已显示障碍物提示
    
    // 资源管理
    loadedResources: null, // 保存已加载的游戏资源
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
    
    // 动态难度系统：基于新的0-6级难度配置
    currentSpeedMultiplier: (state) => {
      // 将距离（米）转换为vw，然后获取当前难度等级
      const distanceVw = convertMetersToVw(state.distance)
      const currentLevel = getDifficultyLevelFromVw(distanceVw)
      const levelMovementSpeed = getMovementSpeed(currentLevel) // vw/s
      
      // 获取视窗宽度，转换vw/s为像素/帧
      const viewportWidth = window.innerWidth
      const targetSpeedPerFrame = (levelMovementSpeed * viewportWidth / 100) / 60 // 转换为每帧像素(60fps)
      const baseSpeedMultiplier = targetSpeedPerFrame / state.baseSpeed
      
      // 开发者测试模式：检查是否有开发者冲刺状态
      if (state.devSprintActive) {
        return baseSpeedMultiplier * 5.0 // 开发者测试5倍速度
      }
      // 道具冲刺状态处理（无敌冲刺）
      else if (state.rushActive) {
        const remainingTime = state.rushTime
        if (remainingTime > 60) { // 前2秒保持2.4倍速度
          return baseSpeedMultiplier * 2.4
        } else { // 后1秒衰减
          const decayFactor = 1.0 + (1.4 * remainingTime / 60) // 从2.4倍线性衰减到1倍
          return baseSpeedMultiplier * decayFactor
        }
      }
      // 主动冲刺状态处理（无无敌状态）
      else if (state.isActiveSprinting) {
        return baseSpeedMultiplier * 2.5 // 主动冲刺时2.5倍速度
      }
      
      return Math.max(0.1, baseSpeedMultiplier) // 确保最小速度
    },

    // 当前难度等级（调试用）
    currentDifficultyLevel: (state) => {
      const distanceVw = convertMetersToVw(state.distance)
      return getDifficultyLevelFromVw(distanceVw)
    },

    // 当前运动速度（调试用）
    currentMovementSpeed: (state) => {
      const distanceVw = convertMetersToVw(state.distance)
      const currentLevel = getDifficultyLevelFromVw(distanceVw)
      return getMovementSpeed(currentLevel)
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
        this.gameStartTime = Date.now() // 重新设置游戏开始时间
        
        // 开始播放背景音乐
        audioManager.playBackgroundMusic()
      }
    },
    
    // 重新开始游戏
    restartGame() {
      // 设置为非首次游戏（跳过所有教学内容）
      this.setNotFirstTimeGame()
      
      // 重置音频状态
      audioManager.reset()
      
      // 直接切换到游戏视图并立即开始游戏
      this.currentView = 'game'
      this.gameStartTime = Date.now()
      
      // 重置游戏数据并直接设置为游戏状态（跳过等待状态）
      this.resetGameData('playing')
      
      // 同步音频状态
      this.syncAudioState()
      
      // 立即开始播放背景音乐
      audioManager.playBackgroundMusic()
      
      console.log('🔄 游戏重新开始，跳过所有教学内容')
    },
    
    // 设置已加载的资源
    setLoadedResources(resources) {
      this.loadedResources = resources
    },
    
    // 获取已加载的资源
    getLoadedResources() {
      return this.loadedResources
    },
    
    // 检查资源是否已加载
    areResourcesLoaded() {
      return this.loadedResources && this.loadedResources.isLoaded
    },
    
    // 游戏结束
    async gameOver() {
      this.gameState = 'gameOver'
      
      // 游戏结束时触发游戏结束震动
      vibrationManager.gameOverVibration()
      console.log('🎮 游戏结束，触发游戏结束震动')
      
      // 计算游戏时长
      const gameEndTime = Date.now()
      const gameTime = Math.floor((gameEndTime - this.gameStartTime) / 1000) // 秒
      const survivalTime = gameTime
      
      // 如果是首次游戏，将其设置为非首次游戏
      if (this.isFirstTimeGame) {
        this.setNotFirstTimeGame()
      }
      
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
      
      // 准备游戏数据进行上报
      const gameData = {
        score: Math.floor(this.score),
        distance: currentDistance,
        stars: this.stars,
        survivalTime: survivalTime,
        gameTime: gameTime,
        deviceId: this.getDeviceId(),
        bestScore: this.bestScore,
        bestDistance: this.bestDistance,
        timestamp: gameEndTime
      }
      
      console.log('🎯 游戏结束，准备上报数据:', gameData)
      
      // 异步上报游戏数据到服务器
      try {
        // 动态导入gameStore以避免循环依赖
        const { useGameStore } = await import('../gameStore')
        const gameStore = useGameStore()
        
        console.log('📊 开始上报游戏结果到服务器...')
        const response = await gameStore.reportGameSummary(gameData)
        
        if (response) {
          console.log('✅ 游戏结果上报成功:', response)
          // 可以在这里处理服务器返回的排行榜数据
        }
      } catch (error) {
        console.error('❌ 游戏结果上报失败:', error)
        // 即使上报失败，游戏也应该正常结束
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
      this.stars = 0 // 重置星星计数
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
      
      // 注意：不重置 isFirstTimeGame 和 hasShownObstacleHint
      // 这些状态应该在整个游戏会话中保持
      
      // 同步音频状态
      this.syncAudioState()
    },
    
    // 受到伤害
    takeDamage() {
      if (this.invulnerable) return false
      
      // 首次游戏且首次碰撞时显示提示
      if (this.isFirstTimeGame && !this.hasShownObstacleHint) {
        console.log('🚨 首次碰撞检测到，触发障碍物提示事件', {
          isFirstTimeGame: this.isFirstTimeGame,
          hasShownObstacleHint: this.hasShownObstacleHint
        })
        this.hasShownObstacleHint = true
        // 通过事件总线通知显示障碍物提示
        window.dispatchEvent(new CustomEvent('showObstacleHint'))
        console.log('✅ 障碍物提示事件已触发')
      }
      
      // 碰撞障碍物时触发重度震动
      vibrationManager.heavyVibration()
      console.log('💥 碰撞障碍物，触发重度震动')
      
      this.lives--
      if (this.lives <= 0) {
        this.gameOver()
        return true
      } else {
        return false
      }
    },
    
    // 设置为非首次游戏（从"再次游戏"进入时调用）
    setNotFirstTimeGame() {
      this.isFirstTimeGame = false
    },
    
    // 重置为首次游戏状态
    resetToFirstTimeGame() {
      this.isFirstTimeGame = true
      this.hasShownObstacleHint = false
    },
    
    // 更新距离和得分
    updateDistanceAndScore(gameSpeed) {
      // 更新距离：100像素 = 1米
      this.distance += gameSpeed * 0.01 // 每像素代表0.01米
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
      
      // 冲刺能量恢复（在主动冲刺和冷却时暂停，但snorkel状态下可以恢复）
      if (!this.isActiveSprinting && !this.isSprintCooldown && this.sprintEnergy < 100) {
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
    
    // 收集星星
    collectStar() {
      this.stars++
      this.score += 1 // 每个星星增加1分
    },
    
    // 同步音频状态到本地状态
    syncAudioState() {
      this.musicEnabled = audioManager.musicEnabled
      this.soundEnabled = audioManager.soundEnabled
      this.musicPaused = audioManager.musicPaused
      
      // 同步震动状态
      if (vibrationManager && vibrationManager.syncWithAudioManager) {
        vibrationManager.syncWithAudioManager(audioManager)
      }
    },
    
    // 获取设备ID（用于用户识别）
    getDeviceId() {
      let deviceId = localStorage.getItem('deviceId')
      if (!deviceId) {
        // 生成一个简单的设备ID
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('deviceId', deviceId)
      }
      return deviceId
    }
  }
})