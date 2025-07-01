import { defineStore } from 'pinia'
import { useGameStateStore } from './gamestore/gameState'
import { useGameLayoutStore } from './gamestore/gameLayout'
import { usePlayerControlStore } from './gamestore/playerControl'
import audioManager from '../utils/audio-manager'

export const useGameStore = defineStore('game', {
  state: () => ({
    // 游戏对象
    obstacles: [],
    powerUps: [],
    particles: [],
    
    // 障碍物距离追踪
    lastObstacleDistance: {}, // 记录每个泳道最后障碍物的距离
    
    // 生成计时器
    obstacleTimer: 0,
    powerUpTimer: 0,
    gameObjectTimer: 0, // 统一的游戏对象生成计时器
    
    // 智能障碍物生成系统
    difficultyLevel: 1, // 当前难度等级
    lastMultiObstacleTime: 0, // 上次生成多重障碍物的时间
    
    // 动画
    animationFrame: 0,
    waterOffset: 0,
    backgroundOffset: 0,
  }),
  
  getters: {
    // 调整难度，让障碍物更快出现
    getCurrentDifficulty: (state) => {
      const gameStateStore = useGameStateStore()
      // 基于距离的动态难度调整，初始间隔更短
      const baseInterval = 80 // 从120改为80，进一步减少间隔
      const difficultyFactor = Math.floor(gameStateStore.distance / 500)
      return Math.max(baseInterval - difficultyFactor * 15, 25) // 最小间隔从40改为25
    },
    
    // 获取当前难度下的障碍物生成间隔
    getObstacleSpawnInterval: (state) => {
      const baseDifficulty = state.getCurrentDifficulty
      const dynamicDifficulty = state.calculateDifficultyLevel
      
      // 根据动态难度调整间隔
      const difficultyMultiplier = Math.max(1 - (dynamicDifficulty * 0.05), 0.3) // 最多减少70%
      
      return Math.floor(baseDifficulty * difficultyMultiplier)
    }
  },
  
  actions: {
    // 计算当前难度等级
    getCurrentDifficultyLevel() {
      const gameStateStore = useGameStateStore()
      const distance = Math.floor(gameStateStore.distance)
      
      if (distance < 200) return 1
      if (distance < 500) return 2
      if (distance < 1000) return 3
      if (distance < 2000) return 4
      return 5
    },
    
    // 计算动态难度等级
    calculateDifficultyLevel() {
      const gameStateStore = useGameStateStore()
      // 基于距离的难度：每30米增加1级，从50米改为30米
      const distanceDifficulty = Math.floor(gameStateStore.distance / 30)
      
      // 基于时间的难度：每20秒增加1级，从30秒改为20秒
      const currentTime = Date.now()
      const timeDifficulty = Math.floor((currentTime - gameStateStore.gameStartTime) / 20000)
      
      // 返回较高的难度值，但限制最大难度为12，从10改为12
      const newDifficulty = Math.min(12, Math.max(distanceDifficulty, timeDifficulty))
      
      // 更新状态中的难度等级
      this.difficultyLevel = newDifficulty
      
      return newDifficulty
    },
    
    // 收集道具
    collectPowerUp(powerUp) {
      const gameStateStore = useGameStateStore()
      const playerControlStore = usePlayerControlStore()
      
      // 冲刺期间获得的道具无效
      if (gameStateStore.rushActive) return
      
      if (powerUp.type === 'snorkel') {
        // snorkel改为3秒无敌加速冲刺
        playerControlStore.isRushing = true
        playerControlStore.invulnerable = true
        playerControlStore.rushTime = 180 // 3秒
        playerControlStore.invulnerableTime = 180
        
        // 同步到gameState
        gameStateStore.rushActive = true
        gameStateStore.rushTime = 180
        gameStateStore.invulnerable = true
        gameStateStore.invulnerableTime = 180
      } else if (powerUp.type === 'star') {
        // star道具增加得分
        gameStateStore.score += 10
        // 检查是否达到新的最佳分数
        if (gameStateStore.score > gameStateStore.bestScore) {
          gameStateStore.bestScore = gameStateStore.score
          localStorage.setItem('bestScore', gameStateStore.bestScore.toString())
        }
      } else if (powerUp.type === 'shield') {
        // shield道具增加得分
        gameStateStore.score += 50
      }
      
      // 添加收集特效
      this.addCollectEffect(powerUp.x, powerUp.y)
    },
    
    // 检查是否可以放置障碍物
    canPlaceObstacle(lane, y) {
      const minDistance = 150 // 最小距离
      
      return !this.obstacles.some(obstacle => 
        obstacle.lane === lane && 
        Math.abs(obstacle.y - y) < minDistance
      )
    },
    
    // 检查障碍物最小距离
    canPlaceObstacleByDistance(lane, distance) {
      const lastDistance = this.lastObstacleDistance[lane] || 0
      return (distance - lastDistance) >= 3 // 最小3米距离
    },
    
    // 记录障碍物位置
    recordObstaclePosition(lane, distance) {
      this.lastObstacleDistance[lane] = distance
    },
    
    // 添加水花效果
    addSplash(x, y) {
      const gameLayoutStore = useGameLayoutStore()
      for (let i = 0; i < 8; i++) {
        this.particles.push({
          x: x + gameLayoutStore.player.width / 2,
          y: y + gameLayoutStore.player.height / 2,
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
      const gameStateStore = useGameStateStore()
      const gameLayoutStore = useGameLayoutStore()
      
      if (gameStateStore.gameState !== 'playing') return
      
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
      const gameLayoutStore = useGameLayoutStore()
      const gameStateStore = useGameStateStore()
      const lane = Math.floor(Math.random() * gameLayoutStore.lanes)
      const types = ['obs1', 'obs2', 'obs3', 'obs4']
      const type = types[Math.floor(Math.random() * types.length)]
      
      // 使用泳道中线坐标，障碍物居中对齐
      const laneX = gameLayoutStore.getLaneX(lane)
      
      const obstacle = {
        x: laneX - gameLayoutStore.obstacleDisplayWidth / 2, // 使用显示宽度居中
        y: -gameLayoutStore.obstacleDisplayHeight,
        width: gameLayoutStore.obstacleDisplayWidth,        // 显示宽度
        height: gameLayoutStore.obstacleDisplayHeight,      // 显示高度
        collisionWidth: gameLayoutStore.obstacleCollisionWidth,   // 碰撞宽度
        collisionHeight: gameLayoutStore.obstacleCollisionHeight, // 碰撞高度
        type: type,
        lane: lane,
        animationFrame: 0,
        originalX: laneX - gameLayoutStore.obstacleDisplayWidth / 2,
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
      this.recordObstaclePosition(lane, gameStateStore.distance)
    },
    
    // 智能生成多重障碍物（确保至少有一条安全通道）
    spawnMultipleObstacles(difficultyLevel) {
      const gameLayoutStore = useGameLayoutStore()
      const maxObstacles = Math.min(difficultyLevel - 1, gameLayoutStore.lanes - 1) // 最多生成lanes-1个障碍物
      const actualObstacles = Math.floor(Math.random() * maxObstacles) + 1 // 至少生成1个
      
      // 随机选择要阻塞的泳道
      const blockedLanes = new Set()
      const availableLanes = Array.from({length: gameLayoutStore.lanes}, (_, i) => i)
      
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
        const laneX = gameLayoutStore.getLaneX(lane)
        
        const obstacle = {
          x: laneX - gameLayoutStore.obstacleDisplayWidth / 2,
          y: -gameLayoutStore.obstacleDisplayHeight,
          width: gameLayoutStore.obstacleDisplayWidth,
          height: gameLayoutStore.obstacleDisplayHeight,
          collisionWidth: gameLayoutStore.obstacleCollisionWidth,
          collisionHeight: gameLayoutStore.obstacleCollisionHeight,
          type: type,
          lane: lane,
          animationFrame: 0,
          originalX: laneX - gameLayoutStore.obstacleDisplayWidth / 2,
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
        const gameStateStore = useGameStateStore()
        this.recordObstaclePosition(lane, gameStateStore.distance)
      })
    },
    
    // 生成道具
    spawnPowerUp() {
      const gameStateStore = useGameStateStore()
      const gameLayoutStore = useGameLayoutStore()
      
      if (gameStateStore.gameState !== 'playing') return
      
      const lane = Math.floor(Math.random() * gameLayoutStore.lanes)
      const types = ['snorkel', 'shield', 'star']
      const type = types[Math.floor(Math.random() * types.length)]
      
      // 使用泳道中线坐标，道具居中对齐
      const laneX = gameLayoutStore.getLaneX(lane)
      
      const powerUp = {
        x: laneX - gameLayoutStore.powerUpDisplayWidth / 2, // 使用显示宽度居中
        y: -gameLayoutStore.powerUpDisplayHeight,
        width: gameLayoutStore.powerUpDisplayWidth,         // 显示宽度
        height: gameLayoutStore.powerUpDisplayHeight,       // 显示高度
        collisionWidth: gameLayoutStore.powerUpCollisionWidth,   // 碰撞宽度
        collisionHeight: gameLayoutStore.powerUpCollisionHeight, // 碰撞高度
        type: type,
        lane: lane,
        collected: false,
        glowPhase: 0
      }
      
      this.powerUps.push(powerUp)
    },
    
    // 添加收集特效
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
    
    // 添加爆炸特效
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
      // 特殊处理：obs4的动画帧共有100帧，碰撞只在第51-100帧生效
      if (obj2.type === 'obs4' && obj2.animationFrame !== undefined) {
        const currentFrame = Math.floor(obj2.animationFrame / 10) % 100 + 1 // 帧数从1开始计算，共100帧
        if (currentFrame < 51 || currentFrame > 100) {
          return false // 不在碰撞帧范围内，不产生碰撞
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
    
    // 播放游泳音效
    playSwimmingSound() {
      audioManager.playSwimmingSound()
    },
    
    // 更新对象位置（根据泳道布局调整游戏对象位置）
    updateObjectPositions() {
      const gameLayoutStore = useGameLayoutStore()
      
      // 更新障碍物位置
      this.obstacles.forEach(obstacle => {
        obstacle.x = gameLayoutStore.getLaneX(obstacle.lane) - obstacle.width / 2
      })
      
      // 更新道具位置
      this.powerUps.forEach(powerUp => {
        powerUp.x = gameLayoutStore.getLaneX(powerUp.lane) - powerUp.width / 2
      })
    },
    
    // 统一的游戏对象生成方法
    generateGameObjects() {
      const difficultyLevel = this.calculateDifficultyLevel()
      const gameStateStore = useGameStateStore()
      
      // 生成概率计算 - 增加障碍物概率
      const starProbability = 0.3 // 星星30%概率
      const snorkelProbability = 0.05 // 潜水镜5%概率
      const obstacleProbability = 0.65 // 障碍物65%概率
      
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
        const gameLayoutStore = useGameLayoutStore()
        const lane = Math.floor(Math.random() * gameLayoutStore.lanes)
        
        // 检查该泳道是否已有对象
        const hasRecentObject = this.checkLaneOccupied(lane, gameStateStore.distance)
        
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
      const gameLayoutStore = useGameLayoutStore()
      
      // 检查障碍物
      for (let obstacle of this.obstacles) {
        if (obstacle.lane === lane && 
            Math.abs(obstacle.y - (-gameLayoutStore.obstacleDisplayHeight)) < gameLayoutStore.canvas.height * 0.3) {
          return true
        }
      }
      
      // 检查道具
      for (let powerUp of this.powerUps) {
        if (powerUp.lane === lane && 
            Math.abs(powerUp.y - (-gameLayoutStore.powerUpDisplayHeight)) < gameLayoutStore.canvas.height * 0.3) {
          return true
        }
      }
      
      return false
    },
    
    // 在指定泳道生成障碍物
    spawnObstacleInLane(lane, difficultyLevel) {
      const gameLayoutStore = useGameLayoutStore()
      
      if (this.checkLaneOccupied(lane, -100)) return false
      
      // 障碍物类型：obs1(静止), obs2(移动), obs3(移动), obs4(水下)
      const obstacleTypes = ['obs1', 'obs2', 'obs3', 'obs4']
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
      
      // 使用泳道中线坐标，障碍物居中对齐
      const laneX = gameLayoutStore.getLaneX(lane)
      
      const obstacle = {
        x: laneX - gameLayoutStore.obstacleDisplayWidth / 2,
        y: -gameLayoutStore.obstacleDisplayHeight,
        width: gameLayoutStore.obstacleDisplayWidth,
        height: gameLayoutStore.obstacleDisplayHeight,
        collisionWidth: gameLayoutStore.obstacleCollisionWidth,
        collisionHeight: gameLayoutStore.obstacleCollisionHeight,
        type: type,
        lane: lane,
        animationFrame: 0,
        originalX: laneX - gameLayoutStore.obstacleDisplayWidth / 2,
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
      
      const gameStateStore = useGameStateStore()
      this.recordObstaclePosition(lane, gameStateStore.distance)
      return true
    },
    
    // 在指定泳道生成道具
    spawnPowerUpInLane(lane, type) {
      const gameLayoutStore = useGameLayoutStore()
      
      if (this.checkLaneOccupied(lane, -100)) return false
      
      // 使用泳道中线坐标，道具居中对齐
      const laneX = gameLayoutStore.getLaneX(lane)
      
      const powerUp = {
        x: laneX - gameLayoutStore.powerUpDisplayWidth / 2, // 使用显示宽度居中
        y: -gameLayoutStore.powerUpDisplayHeight,
        width: gameLayoutStore.powerUpDisplayWidth,         // 显示宽度
        height: gameLayoutStore.powerUpDisplayHeight,       // 显示高度
        collisionWidth: gameLayoutStore.powerUpCollisionWidth,   // 碰撞宽度
        collisionHeight: gameLayoutStore.powerUpCollisionHeight, // 碰撞高度
        type: type,
        lane: lane,
        collected: false,
        glowPhase: 0
      }
      
      this.powerUps.push(powerUp)
      return true
    }
  }
})