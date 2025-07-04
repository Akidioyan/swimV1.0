import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    // 游戏状态
    currentView: 'loading', // loading, intro, game, result, video
    gameState: 'ready', // ready, playing, paused, gameOver, waiting
    
    // 游戏设置
    lanes: 4,
    laneHeight: 0,
    laneWidth: 0,
    gameAreaHeight: 0,
    gameAreaY: 0,
    gameSpeed: 2,
    baseSpeed: 2,
    speedMultiplier: 1.0,
    
    // 玩家数据
    player: {
      x: 100,
      y: 0,
      width: 0, // 将在calculateGameLayout中动态设置
      height: 0, // 将在calculateGameLayout中动态设置
      currentLane: 2, // 0, 1, 2, 3
      targetY: 0,
      speed: 8
    },
    
    // 游戏对象
    obstacles: [],
    powerUps: [],
    particles: [],
    
    // 游戏统计
    lives: 3, // 新增：生命系统
    distance: 0,
    score: 0, // 新增：得分系统
    bestScore: parseInt(localStorage.getItem('bestScore') || '0'),
    bestDistance: parseInt(localStorage.getItem('bestDistance') || '0'), // 新增：最佳距离
    invulnerable: false, // 新增：无敌状态
    invulnerableTime: 0, // 新增：无敌时间
    rushActive: false, // 新增：冲刺状态
    rushTime: 0, // 新增：冲刺时间
    
    // 冲刺系统
    sprintEnergy: 100, // 冲刺能量，满值100
    maxSprintDistance: 50, // 最大冲刺距离
    isSprintCooldown: false, // 冲刺冷却状态
    sprintCooldownTime: 0, // 冲刺冷却时间
    
    // 生成计时器
    obstacleTimer: 0,
    powerUpTimer: 0,
    gameObjectTimer: 0, // 新增：统一的游戏对象生成计时器
    
    // 障碍物距离追踪
    lastObstacleDistance: {}, // 新增：记录每个泳道最后障碍物的距离
    
    // 动画
    animationFrame: 0,
    waterOffset: 0,
    backgroundOffset: 0,
    
    // 游戏控制
    musicEnabled: true,
    soundEnabled: true,
    isPaused: false,
    
    // 键盘控制防抖
    lastKeyPressTime: 0,
    keyDebounceDelay: 10, // 50ms防抖延迟
    
    // 音频对象
    backgroundMusic: null,
    swimmingSound: null,
    
    // 画布引用
    canvas: null,
    ctx: null,
    
    // 智能障碍物生成系统
    difficultyLevel: 1, // 当前难度等级
    gameStartTime: 0, // 游戏开始时间
    lastMultiObstacleTime: 0, // 上次生成多重障碍物的时间
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
    
    currentSpeedMultiplier: (state) => {
      // 三档速度系统：100像素 = 1m
      const distance = Math.floor(state.distance)
      let baseSpeedMultiplier = 1.0
      
      if (distance < 100) {
        // 一档：0-100m，1m/s = 100像素/s = 1.67像素/帧(60fps)
        baseSpeedMultiplier = 1.67 / state.baseSpeed
      } else if (distance < 500) {
        // 二档：100-500m，2m/s = 200像素/s = 3.33像素/帧
        baseSpeedMultiplier = 3.33 / state.baseSpeed
      } else {
        // 三档：500m+，3.5m/s = 350像素/s = 5.83像素/帧
        baseSpeedMultiplier = 5.83 / state.baseSpeed
      }
      
      // 冲刺状态处理
      if (state.rushActive) {
        const remainingTime = state.rushTime
        if (remainingTime > 60) { // 前2秒保持2倍速度
          baseSpeedMultiplier *= 2.0
        } else { // 后1秒衰减
          const decayFactor = 1.0 + (1.0 * remainingTime / 60) // 从2倍线性衰减到1倍
          baseSpeedMultiplier *= decayFactor
        }
      }
      
      return baseSpeedMultiplier
    }
  },
  
  actions: {
    // 初始化游戏
    initGame(canvas) {
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
      
      // 计算游戏区域布局
      this.calculateGameLayout()
      
      // 在initGame函数中设置玩家初始位置
      // 设置玩家初始位置
      this.player.x = this.getLaneX(1) - this.player.width / 2 // 玩家图片中点对齐泳道中心线
      this.player.targetX = this.player.x
      this.player.y = this.getLaneY() // 固定y坐标
      this.player.targetY = this.player.y
      
      // 初始化音频
      this.initAudio()
    },
    
    // 初始化音频
    initAudio() {
      // 创建背景音乐对象
      this.backgroundMusic = new Audio('/media/graphics/games/Sound/BackgroundSound.mp3')
      this.backgroundMusic.loop = true
      this.backgroundMusic.volume = 0.5
      
      // 预加载音频
      this.backgroundMusic.load()
      
      // 创建游泳音效对象
      this.swimmingSound = new Audio('/media/graphics/games/Sound/swimming.MP3')
      this.swimmingSound.volume = 0.8
      
      // 预加载音频
      this.swimmingSound.load()
      
      // 删除这段重复播放的代码
      // if (this.musicEnabled && this.gameState === 'playing') {
      //   this.backgroundMusic.play().catch(error => {
      //     console.log('背景音乐初始化播放失败:', error)
      //   })
      // }
    },
    
    // 计算游戏区域布局
    calculateGameLayout() {
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
    
    // 获取指定泳道的X坐标（泳道中线）
    getLaneX(laneIndex) {
      if (!this.canvas) return 0; // 添加空值检查
      
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
    
    // 修改getLaneY方法，让玩家距离底部屏幕10%
    getLaneY() {
      if (!this.canvas) return 0;
      return this.canvas.height * 0.8; // 距离底部20%（Y坐标为屏幕高度的80%）
    },
    
    // 确保玩家Y坐标始终固定
    resetGameData(initialGameState = 'playing') {
      this.gameState = initialGameState
      this.lives = 3
      this.distance = 0
      this.score = 0  // 添加这行：重置分数为0
      this.speedMultiplier = 1.0
      this.gameSpeed = this.baseSpeed
      this.invulnerable = false
      this.invulnerableTime = 0
      this.rushActive = false
      this.rushTime = 0
      this.isPaused = false
      
      // 重置智能障碍物生成系统
      this.difficultyLevel = 1
      this.gameStartTime = Date.now()
      this.lastMultiObstacleTime = 0
      this.lastObstacleDistance = {}
      
      this.player.currentLane = 1
      
      // 只有在canvas存在时才设置玩家位置
      if (this.canvas) {
        // 玩家X坐标设置为泳道中线减去玩家宽度的一半（居中对齐）
        const centerX = this.getLaneX(1)
        this.player.x = centerX - this.player.width / 2
        this.player.y = this.getLaneY() // 固定Y坐标
        this.player.targetX = this.player.x
        this.player.targetY = this.player.y // Y坐标目标值也固定
      }
      
      this.obstacles = []
      this.powerUps = []
      this.particles = []
      
      // 重置计时器，让障碍物立即开始生成
      this.obstacleTimer = 0
      this.powerUpTimer = 0
      this.gameObjectTimer = 0
      
      // 只有在游戏状态为playing时才生成障碍物
      if (initialGameState === 'playing') {
        // 立即生成第一个障碍物
        setTimeout(() => {
          this.spawnObstacle()
        }, 1000) // 1秒后生成第一个障碍物
      }
    },
    
    // 调整难度，让障碍物更快出现
    getCurrentDifficulty() {
    // 基于距离的动态难度调整，初始间隔更短
    const baseInterval = 80 // 从120改为80，进一步减少间隔
    const difficultyFactor = Math.floor(this.distance / 500)
    return Math.max(baseInterval - difficultyFactor * 15, 25) // 最小间隔从40改为25
    },
    
    // 计算动态难度等级
    calculateDifficultyLevel() {
    // 基于距离的难度：每30米增加1级，从50米改为30米
    const distanceDifficulty = Math.floor(this.distance / 30)
    
    // 基于时间的难度：每20秒增加1级，从30秒改为20秒
    const currentTime = Date.now()
    const timeDifficulty = Math.floor((currentTime - this.gameStartTime) / 20000)
    
    // 返回较高的难度值，但限制最大难度为12，从10改为12
    return Math.min(12, Math.max(distanceDifficulty, timeDifficulty))
    },
    
    // 获取当前难度下的障碍物生成间隔
    getObstacleSpawnInterval() {
      const baseDifficulty = this.getCurrentDifficulty()
      const dynamicDifficulty = this.calculateDifficultyLevel()
      
      // 根据动态难度调整间隔
      const difficultyMultiplier = Math.max(1 - (dynamicDifficulty * 0.05), 0.3) // 最多减少70%
      
      return Math.floor(baseDifficulty * difficultyMultiplier)
    },
    
    // 修改收集道具方法
    collectPowerUp(powerUp) {
      // 冲刺期间获得的道具无效
      if (this.rushActive) return
      
      if (powerUp.type === 'snorkel') {
        // snorkel改为3秒无敌加速冲刺
        this.rushActive = true
        this.rushTime = 180 // 3秒 (60fps * 3s)
        this.invulnerable = true
        this.invulnerableTime = 180
      } else if (powerUp.type === 'star') {
        // star道具增加得分
        this.score += 10
        // 检查是否达到新的最佳分数
        if (this.score > this.bestScore) {
          this.bestScore = this.score
          localStorage.setItem('bestScore', this.bestScore.toString())
        }
      }
      
      this.addCollectEffect(powerUp.x, powerUp.y)
    },
    
    // 修改游戏结束逻辑
    takeDamage() {
      if (this.invulnerable) return false
      
      this.lives--
      if (this.lives <= 0) {
        this.gameOver()
        return true
      } else {
        // 移除短暂无敌时间
        // this.invulnerable = true
        // this.invulnerableTime = 30 // 0.5秒无敌
        return false
      }
    },
    
    // 检查障碍物最小距离
    canPlaceObstacle(lane, distance) {
      const lastDistance = this.lastObstacleDistance[lane] || 0
      return (distance - lastDistance) >= 3 // 最小3米距离
    },
    
    // 记录障碍物位置
    recordObstaclePosition(lane, distance) {
      this.lastObstacleDistance[lane] = distance
    },
    
    // 添加水花效果
    addSplash(x, y) {
      for (let i = 0; i < 8; i++) {
        this.particles.push({
          x: x + this.player.width / 2,
          y: y + this.player.height / 2,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 30,
          maxLife: 30,
          size: Math.random() * 4 + 2,
          color: 'white'
        })
      }
    },
    
    // 生成障碍物
    spawnObstacle() {
      const difficultyLevel = this.calculateDifficultyLevel()
      const currentTime = Date.now()
      
      // 根据难度决定是否生成多重障碍物 - 增加概率
      const shouldSpawnMultiple = difficultyLevel >= 2 && // 从3改为2，更早开始多重障碍物
                             (currentTime - this.lastMultiObstacleTime) > 3000 && // 从5000改为3000，间隔更短
                             Math.random() < (difficultyLevel * 0.15) // 从0.1改为0.15，概率更高
      
      if (shouldSpawnMultiple) {
        this.spawnMultipleObstacles(difficultyLevel)
        this.lastMultiObstacleTime = currentTime
      } else {
        this.spawnSingleObstacle()
      }
    },
    
    // 生成单个障碍物
    spawnSingleObstacle() {
      const lane = Math.floor(Math.random() * this.lanes)
      const types = ['obs1', 'obs2', 'obs3', 'obs4']
      const type = types[Math.floor(Math.random() * types.length)]
      
      // 使用泳道中线坐标，障碍物居中对齐
      const laneX = this.getLaneX(lane)
      
      this.obstacles.push({
        x: laneX - this.obstacleDisplayWidth / 2, // 使用显示宽度居中
        y: -this.obstacleDisplayHeight,
        width: this.obstacleDisplayWidth,        // 显示宽度
        height: this.obstacleDisplayHeight,      // 显示高度
        collisionWidth: this.obstacleCollisionWidth,   // 碰撞宽度
        collisionHeight: this.obstacleCollisionHeight, // 碰撞高度
        type: type,
        lane: lane
      })
      
      // 记录障碍物位置
      this.recordObstaclePosition(lane, this.distance)
    },
    
    // 智能生成多重障碍物（确保至少有一条安全通道）
    spawnMultipleObstacles(difficultyLevel) {
      const maxObstacles = Math.min(difficultyLevel - 1, this.lanes - 1) // 最多生成lanes-1个障碍物
      const actualObstacles = Math.floor(Math.random() * maxObstacles) + 1 // 至少生成1个
      
      // 随机选择要阻塞的泳道
      const blockedLanes = new Set()
      const availableLanes = Array.from({length: this.lanes}, (_, i) => i)
      
      // 随机选择要阻塞的泳道
      for (let i = 0; i < actualObstacles; i++) {
        if (availableLanes.length > 1) { // 确保至少留一条通道
          const randomIndex = Math.floor(Math.random() * availableLanes.length)
          const selectedLane = availableLanes.splice(randomIndex, 1)[0]
          blockedLanes.add(selectedLane)
        }
      }
      
      // 生成障碍物
      const types = ['obs1', 'obs2', 'obs3', 'obs4']
      blockedLanes.forEach(lane => {
        const type = types[Math.floor(Math.random() * types.length)]
        const laneX = this.getLaneX(lane)
        
        this.obstacles.push({
          x: laneX - this.obstacleDisplayWidth / 2,
          y: -this.obstacleDisplayHeight,
          width: this.obstacleDisplayWidth,
          height: this.obstacleDisplayHeight,
          collisionWidth: this.obstacleCollisionWidth,
          collisionHeight: this.obstacleCollisionHeight,
          type: type,
          lane: lane
        })
        
        // 记录障碍物位置
        this.recordObstaclePosition(lane, this.distance)
      })
    },
    
    // 生成道具
    spawnPowerUp() {
      const lane = Math.floor(Math.random() * this.lanes)
      const types = ['snorkel', 'shield']
      const type = types[Math.floor(Math.random() * types.length)]
      
      // 使用泳道中线坐标，道具居中对齐
      const laneX = this.getLaneX(lane)
      
      this.powerUps.push({
        x: laneX - this.powerUpDisplayWidth / 2, // 使用显示宽度居中
        y: -this.powerUpDisplayHeight,
        width: this.powerUpDisplayWidth,         // 显示宽度
        height: this.powerUpDisplayHeight,       // 显示高度
        collisionWidth: this.powerUpCollisionWidth,   // 碰撞宽度
        collisionHeight: this.powerUpCollisionHeight, // 碰撞高度
        type: type,
        lane: lane,
        collected: false
      })
    },
    
    // 添加收集效果
    addCollectEffect(x, y) {
      for (let i = 0; i < 12; i++) {
        this.particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 40,
          maxLife: 40,
          size: Math.random() * 3 + 1,
          color: 'gold'
        })
      }
    },
    
    // 添加爆炸效果
    addExplosion(x, y) {
      for (let i = 0; i < 15; i++) {
        this.particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 30,
          maxLife: 30,
          size: Math.random() * 4 + 2,
          color: 'orange'
        })
      }
    },
    
    // 碰撞检测 - 支持碰撞体系统和动画帧检测
    checkCollision(obj1, obj2) {
    // 特殊处理：obs2的碰撞只在第8-15帧生效
    if (obj2.type === 'obs2' && this.obstacleAssets && this.obstacleAssets.animations.obs2) {
    const currentFrame = this.obstacleAssets.animations.obs2.currentFrame + 1; // 帧数从1开始计算
    if (currentFrame < 8 || currentFrame > 15) {
    return false; // 不在碰撞帧范围内，不产生碰撞
    }
    }
    
    // 获取对象1的碰撞盒信息
    const obj1CollisionWidth = obj1.collisionWidth || obj1.width
    const obj1CollisionHeight = obj1.collisionHeight || obj1.height
    const obj1CollisionOffsetX = (obj1.width - obj1CollisionWidth) / 2
    const obj1CollisionOffsetY = (obj1.height - obj1CollisionHeight) / 2
    const obj1CollisionX = obj1.x + obj1CollisionOffsetX
    const obj1CollisionY = obj1.y + obj1CollisionOffsetY
    
    // 获取对象2的碰撞盒信息
    const obj2CollisionWidth = obj2.collisionWidth || obj2.width
    const obj2CollisionHeight = obj2.collisionHeight || obj2.height
    const obj2CollisionOffsetX = (obj2.width - obj2CollisionWidth) / 2
    const obj2CollisionOffsetY = (obj2.height - obj2CollisionHeight) / 2
    const obj2CollisionX = obj2.x + obj2CollisionOffsetX
    const obj2CollisionY = obj2.y + obj2CollisionOffsetY
    
    // 使用碰撞盒进行检测
    return obj1CollisionX < obj2CollisionX + obj2CollisionWidth &&
           obj1CollisionX + obj1CollisionWidth > obj2CollisionX &&
           obj1CollisionY < obj2CollisionY + obj2CollisionHeight &&
           obj1CollisionY + obj1CollisionHeight > obj2CollisionY
    },
    
    // 游戏结束
    gameOver() {
      this.gameState = 'gameOver'
      
      // 停止背景音乐
      if (this.backgroundMusic) {
        this.backgroundMusic.pause()
      }
      
      // 更新最佳分数
      if (this.score > this.bestScore) {
        this.bestScore = Math.floor(this.score)
        localStorage.setItem('bestScore', this.bestScore.toString())
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
      
      // 停止背景音乐
      if (this.backgroundMusic) {
        this.backgroundMusic.pause()
      }
    },
    
    // 重新开始游戏
    restartGame() {
      // 修改：直接调用 startGameFromVideo() 跳过视频
      this.startGameFromVideo()
    },
    
    // 切换音乐
    // 在 state 中添加
    musicPaused: false, // 音乐暂停状态
    
    // 修改 toggleMusic 方法
    toggleMusic() {
    this.musicPaused = !this.musicPaused
    
    if (this.backgroundMusic) {
    if (this.musicPaused) {
    // 暂停音乐
    this.backgroundMusic.pause()
    } else {
    // 继续播放音乐（只在游戏进行时）
    if (this.gameState === 'playing') {
    this.backgroundMusic.play().catch(error => {
    console.log('背景音乐播放失败:', error)
    })
    }
    }
    }
    },
    
    // 播放游泳音效
    playSwimmingSound() {
      if (this.soundEnabled && this.swimmingSound) {
        // 重置音效，确保每次都能播放
        this.swimmingSound.currentTime = 0
        this.swimmingSound.play().catch(error => {
          console.log('游泳音效播放失败:', error)
        })
      }
    },
    
    // 切换音效
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
    },
    
    // 切换暂停状态
    togglePause() {
      // 只允许在playing和paused状态之间切换
      if (this.gameState !== 'playing' && this.gameState !== 'paused') return
      
      this.isPaused = !this.isPaused
      
      // 暂停/继续背景音乐
      if (this.musicEnabled && !this.musicPaused && this.backgroundMusic) {
        if (this.isPaused) {
          this.backgroundMusic.pause()
        } else {
          this.backgroundMusic.play().catch(error => {
            console.log('背景音乐播放失败:', error)
          })
        }
      }
      
      // 更新游戏状态
      this.gameState = this.isPaused ? 'paused' : 'playing'
    },
    
    // 设置当前视图
    setCurrentView(view) {
      this.currentView = view
    },
    
    // 开始游戏
    // 修改 startGame 方法
    startGame() {
    // 先切换到视频播放页面
    this.currentView = 'video'
    },
    
    // 添加新方法：从视频直接开始游戏
    startGameFromVideo() {
      this.currentView = 'game'
      this.gameStartTime = Date.now()
      
      // 确保canvas已经初始化，如果没有则延迟执行
      if (!this.canvas) {
        // 如果canvas还未初始化，延迟执行
        setTimeout(() => {
          this.startGameFromVideo()
        }, 100)
        return
      }
      
      // 重置游戏数据并设置为等待状态
      this.resetGameData('waiting')
      
      // 不立即播放背景音乐，等待用户操作
    },
    
    // 实际开始游戏（从等待状态切换到游戏状态）
    actuallyStartGame() {
      if (this.gameState === 'waiting') {
        this.gameState = 'playing'
        
        // 播放背景音乐
        if (this.musicEnabled && !this.musicPaused && this.backgroundMusic) {
          this.backgroundMusic.play().catch(error => {
            console.log('背景音乐播放失败:', error)
          })
        }
        
        // 开始生成障碍物
        setTimeout(() => {
          this.spawnObstacle()
        }, 1000) // 1秒后生成第一个障碍物
      }
    },
    
    // 更新游戏速度和背景偏移
    updateGame() {
      // 更新距离：100像素 = 1米
      this.distance += this.gameSpeed * 0.01 // 每像素代表0.01米
      
      // 距离得分：每1m +1分
      const newDistanceScore = Math.floor(this.distance)
      const oldDistanceScore = Math.floor(this.distance - this.gameSpeed * 0.01)
      if (newDistanceScore > oldDistanceScore) {
        this.score += (newDistanceScore - oldDistanceScore)
      }
      
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
      
      // 更新冲刺冷却
      if (this.sprintCooldownTime > 0) {
        this.sprintCooldownTime--
        if (this.sprintCooldownTime <= 0) {
          this.isSprintCooldown = false
        }
      }
      
      // 冲刺能量恢复
      if (!this.rushActive && !this.isSprintCooldown && this.sprintEnergy < 100) {
        this.sprintEnergy = Math.min(100, this.sprintEnergy + 0.5) // 每帧恢复0.5能量
      }
      
      // 使用统一的游戏对象生成系统
      this.gameObjectTimer++
      if (this.gameObjectTimer > 30) { // 从60改为30，每0.5秒检查一次
        this.generateGameObjects()
        this.gameObjectTimer = 0
      }
    },
    
    // 添加冲刺方法
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
    
    // 添加减速方法
    startSlowdown() {
      // 临时降低游戏速度
      this.gameSpeed = Math.max(0.5, this.gameSpeed * 0.5)
      
      // 1秒后恢复正常速度
      setTimeout(() => {
        this.gameSpeed = this.baseSpeed * this.currentSpeedMultiplier
      }, 1000)
    },
    
    // 修改切换泳道方法，支持点击不同泳道直接切换
    switchToLane(targetLane) {
      // 如果是等待状态，则启动游戏
      if (this.gameState === 'waiting') {
        this.actuallyStartGame()
      }
      
      if (this.gameState !== 'playing') return
      if (targetLane < 0 || targetLane >= this.lanes) return
      
      if (targetLane !== this.player.currentLane) {
        this.player.currentLane = targetLane
        this.player.targetX = this.getLaneX(targetLane) - this.player.width / 2 // 玩家图片中点对齐泳道中心线
        
        // 添加水花效果
        this.addSplash(this.player.x, this.player.y)
        
        // 播放游泳音效
        this.playSwimmingSound()
      }
    }, 
    
    // 添加switchLane方法支持键盘控制
    switchLane(direction) {
      // 如果是等待状态，则启动游戏
      if (this.gameState === 'waiting') {
        this.actuallyStartGame()
      }
      
      if (this.gameState !== 'playing') return
      
      // 防抖检查
      const currentTime = Date.now()
      if (currentTime - this.lastKeyPressTime < this.keyDebounceDelay) {
        return // 忽略过快的按键
      }
      this.lastKeyPressTime = currentTime
      
      const currentLane = this.player.currentLane
      const targetLane = currentLane + direction
      
      // 确保目标泳道在有效范围内
      if (targetLane >= 0 && targetLane < this.lanes) {
        this.switchToLane(targetLane)
      }
    },
    
    // 更新所有对象位置以适应新的泳道布局
    updateObjectPositions() {
      // 更新玩家位置
      if (this.canvas) {
        this.player.x = this.getLaneX(this.player.currentLane) - this.player.width / 2
        this.player.targetX = this.player.x
      }
      
      // 更新障碍物位置
      this.obstacles.forEach(obstacle => {
        if (this.canvas) {
          obstacle.x = this.getLaneX(obstacle.lane) - obstacle.width / 2
        }
      })
      
      // 更新道具位置
      this.powerUps.forEach(powerUp => {
        if (this.canvas) {
          powerUp.x = this.getLaneX(powerUp.lane) - powerUp.width / 2
        }
      })
    },
    
    // 统一的游戏对象生成方法
    generateGameObjects() {
      const difficultyLevel = this.calculateDifficultyLevel()
      const currentDistance = this.distance
      
      // 生成概率计算 - 增加障碍物概率
      const starProbability = 0.3 // 星星30%概率，从40%降低
      const snorkelProbability = 0.1 // 潜水镜10%概率
      const obstacleProbability = 0.4 // 障碍物40%概率，从20%大幅提升
      
      // 随机选择要生成的对象类型
      const randomValue = Math.random()
      let objectType = null
      
      if (randomValue < obstacleProbability) {
        objectType = 'obstacle'
      } else if (randomValue < obstacleProbability + starProbability) {
        objectType = 'star'
      } else if (randomValue < obstacleProbability + starProbability + snorkelProbability) {
        objectType = 'snorkel'
      }
      
      if (objectType) {
        // 选择一个随机泳道
        const lane = Math.floor(Math.random() * this.lanes)
        
        // 检查该泳道是否已有对象
        const hasRecentObject = this.checkLaneOccupied(lane, currentDistance)
        
        if (!hasRecentObject) {
          if (objectType === 'obstacle') {
            this.spawnObstacleInLane(lane, difficultyLevel)
          } else {
            this.spawnPowerUpInLane(lane, objectType)
          }
        }
      }
    },
    
    // 检查泳道是否被占用
    checkLaneOccupied(lane, currentDistance) {
      const minDistance = 5 // 最小间距5米
      
      // 检查障碍物
      for (let obstacle of this.obstacles) {
        if (obstacle.lane === lane && 
            Math.abs(obstacle.y - (-this.obstacleDisplayHeight)) < this.canvas.height * 0.3) {
          return true
        }
      }
      
      // 检查道具
      for (let powerUp of this.powerUps) {
        if (powerUp.lane === lane && 
            Math.abs(powerUp.y - (-this.powerUpDisplayHeight)) < this.canvas.height * 0.3) {
          return true
        }
      }
      
      return false
    },
    
    // 在指定泳道生成障碍物
    // 在指定泳道生成障碍物
    spawnObstacleInLane(lane, difficultyLevel) {
    // 障碍物类型：obs1(静止), obs2(移动), obs3(水下), obs4(电动水母)
    const obstacleTypes = ['obs1', 'obs2', 'obs3', 'obs4']
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
    
    // 使用泳道中线坐标，障碍物居中对齐
    const laneX = this.getLaneX(lane)
    
    const obstacle = {
    x: laneX - this.obstacleDisplayWidth / 2,
    y: -this.obstacleDisplayHeight,
    width: this.obstacleDisplayWidth,
    height: this.obstacleDisplayHeight,
    collisionWidth: this.obstacleCollisionWidth,
    collisionHeight: this.obstacleCollisionHeight,
    type: type,
    lane: lane,
    originalX: laneX - this.obstacleDisplayWidth / 2,
    // 添加移动属性
    moveSpeed: type === 'obs2' ? (Math.random() - 0.5) * 2 : 0,
    // 添加跨泳道移动属性
    targetLane: lane,
    currentLane: lane,
    laneChangeTimer: 0,
    nextLaneChangeTime: type === 'obs3' || type === 'obs4' ?
      Date.now() + (type === 'obs3' ? 2000 : 1500) + Math.random() * 1000 : 0
    }
    
    this.obstacles.push(obstacle)
    
    // 记录障碍物位置
    this.recordObstaclePosition(lane, this.distance)
    },
    
    // 在指定泳道生成道具
    spawnPowerUpInLane(lane, type) {
      // 使用泳道中线坐标，道具居中对齐
      const laneX = this.getLaneX(lane)
      
      this.powerUps.push({
        x: laneX - this.powerUpDisplayWidth / 2, // 使用显示宽度居中
        y: -this.powerUpDisplayHeight,
        width: this.powerUpDisplayWidth,         // 显示宽度
        height: this.powerUpDisplayHeight,       // 显示高度
        collisionWidth: this.powerUpCollisionWidth,   // 碰撞宽度
        collisionHeight: this.powerUpCollisionHeight, // 碰撞高度
        type: type,
        lane: lane,
        collected: false,
        glowPhase: 0
      })
    }
  } // 关闭actions对象
}) // 关闭defineStore