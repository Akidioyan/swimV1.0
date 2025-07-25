// 游戏对象管理模块
// 1. 障碍物系统：管理障碍物生成、更新、碰撞检测
// 2. 道具系统：管理道具生成、收集、特效
// 3. 粒子系统：管理各种视觉特效粒子
// 4. 动态难度：根据游戏进度动态调整难度
// 5. 生成系统：统一管理所有游戏对象的生成逻辑
import { defineStore } from 'pinia'
import { ObstacleManager } from '../../utils/obstacles/ObstacleManager.js'
import { 
  getRandomGameObjectType,
  getGameObjectConfig,
  isObstacle,
  isPowerUp,
  DIFFICULTY_CONFIG,
  getDifficultyLevelFromVw,
  getObjectCountPer100vw,
  generateObjectTypesForLevel,
  getCurrentDifficultyInfo,
  getSpawnInterval,
  getDynamicSpawnIntervalFromDistance,
  convertMetersToVw
} from '../../utils/obstacles/obstacleConfig.js'
import audioManager from '../../utils/audio-manager'
import vibrationManager from '../../utils/vibration.js'

export const useGameObjectsStore = defineStore('gameObjects', {
  state: () => ({
    // 游戏对象
    powerUps: [],
    particles: [],
    
    // 障碍物管理器
    obstacleManager: new ObstacleManager(),
    
    // 动态难度生成系统
    lastSpawnDistance: 0,
    forceNextSpawn: true, // 强制下次生成标志
    currentDifficultyLevel: 3, // 改为从第3级开始
    pendingObjectTypes: [], // 待生成的对象类型队列
    lastLevelUpdate: 0, // 上次等级更新时的距离
    
    // 动画相关
    animationFrame: 0,
    waterOffset: 0,
    backgroundOffset: 0,
  }),
  
  getters: {
    // 获取所有障碍物（兼容旧代码）
    obstacles: (state) => state.obstacleManager.obstacles,
    
    // 获取障碍物数量
    getObstacleCount: (state) => {
      return state.obstacleManager.getObstacleCount()
    }
  },
  
  actions: {
    // 重置游戏对象状态
    resetGameObjectState() {
      this.powerUps = []
      this.particles = []
      this.obstacleManager.reset()
      this.lastSpawnDistance = 0
      this.animationFrame = 0
      this.waterOffset = 0
      this.backgroundOffset = 0
      
      // 重置动态难度系统
      this.forceNextSpawn = true
      this.currentDifficultyLevel = 1 // 改为从第1级开始
      this.pendingObjectTypes = []
      this.lastLevelUpdate = 0
    },

    // 动态难度生成系统
    updateSpawnSystem(gameSpeed, gameLayoutStore, gameStateStore) {
      // 只在playing状态下生成
      if (gameStateStore.gameState !== 'playing') return
      
      // 将当前距离（米）转换为vw
      const currentDistanceVw = convertMetersToVw(gameStateStore.distance)
      
      // 更新难度等级
      this.updateDifficultyLevel(currentDistanceVw)
      
      // 使用动态间隔系统计算生成间隔
      const dynamicInterval = getDynamicSpawnIntervalFromDistance(currentDistanceVw)
      
      // 检查是否需要生成新对象（基于动态间隔）
      const shouldSpawn = this.forceNextSpawn || 
                         (currentDistanceVw - this.lastSpawnDistance >= dynamicInterval)
      
      if (shouldSpawn) {
        // 打印间隔信息（调试用）
        console.log(`等级 ${this.currentDifficultyLevel} 生成信息:`, {
          当前距离: Math.round(currentDistanceVw),
          当前间隔: Math.round(dynamicInterval * 10) / 10,
          上次生成距离: Math.round(this.lastSpawnDistance)
        })
        
        this.lastSpawnDistance = currentDistanceVw
        this.forceNextSpawn = false
        
        // 使用动态难度系统生成对象
        this.spawnObjectsForCurrentLevel(gameLayoutStore)
      }
    },

    // 更新难度等级
    updateDifficultyLevel(currentDistanceVw) {
      const newLevel = getDifficultyLevelFromVw(currentDistanceVw)
      
      if (newLevel !== this.currentDifficultyLevel) {
        console.log(`难度等级提升: ${this.currentDifficultyLevel} → ${newLevel}`)
        this.currentDifficultyLevel = newLevel
        this.lastLevelUpdate = currentDistanceVw
        
        // 清空待生成队列，重新生成新等级的对象类型
        this.pendingObjectTypes = []
      }
    },

    // 为当前等级生成对象
    spawnObjectsForCurrentLevel(gameLayoutStore) {
      // 如果没有待生成的对象，生成新的对象类型列表
      if (this.pendingObjectTypes.length === 0) {
        // 计算本次应生成的对象数量（基于100vw的数量动态调整）
        const objectsPer100vw = getObjectCountPer100vw(this.currentDifficultyLevel)
        // 根据实际间隔调整数量（间隔越大，单次生成越少）
        const currentInterval = getSpawnInterval(this.currentDifficultyLevel)
        const adjustedCount = Math.max(1, Math.round(objectsPer100vw * (currentInterval / 100)))
        
        this.pendingObjectTypes = generateObjectTypesForLevel(this.currentDifficultyLevel, adjustedCount)
        
        // 打印当前等级信息（调试用）
        const difficultyInfo = getCurrentDifficultyInfo(this.lastSpawnDistance)
        console.log(`等级 ${difficultyInfo.level} 生成配置:`, {
          基础数量: objectsPer100vw,
          调整数量: adjustedCount,
          概率分布: difficultyInfo.probability,
          生成列表: this.pendingObjectTypes
        })
      }
      
      // 根据难度等级确定每批最大生成数量
      let maxSpawnPerBatch = Math.min(4, this.pendingObjectTypes.length) // 默认最多4个
      
      const spawnBatch = this.pendingObjectTypes.splice(0, maxSpawnPerBatch)
      
      // 获取可用泳道
      const availableLanes = this.getAvailableLanes(gameLayoutStore)
      
      // 根据等级和概率确定实际最大生成数量
      let actualMaxSpawn = this.determineMaxSpawnForLevel(availableLanes.length)
      
      // 生成这批对象
      let spawnedCount = 0
      for (const objectType of spawnBatch) {
        if (availableLanes.length === 0 || spawnedCount >= actualMaxSpawn) {
          // 没有可用泳道了或达到最大生成数量，把剩余对象放回队列前面
          this.pendingObjectTypes.unshift(...spawnBatch.slice(spawnedCount))
          break
        }
        
        // 随机选择一个可用泳道
        const laneIndex = Math.floor(Math.random() * availableLanes.length)
        const lane = availableLanes[laneIndex]
        
        // 生成对象
        if (this.spawnSingleObject(objectType, lane, gameLayoutStore)) {
          spawnedCount++
          // 移除已使用的泳道（避免在同一泳道生成多个对象）
          availableLanes.splice(laneIndex, 1)
        } else {
          // 生成失败，把对象放回队列
          this.pendingObjectTypes.unshift(objectType)
        }
      }
      
      // 添加调试信息
      if (this.currentDifficultyLevel >= 4) {
        console.log(`🎯 等级${this.currentDifficultyLevel} 生成结果: 预定最多${actualMaxSpawn}个对象，实际生成${spawnedCount}个`)
      }
    },

    // 根据等级和概率确定最大生成数量
    determineMaxSpawnForLevel(availableLanesCount) {
      // 等级3：作为最低级别，保持较低的生成数量（通常0-2个）
      if (this.currentDifficultyLevel === 3) {
        return Math.min(availableLanesCount, 2) // 等级3最多2个，相对简单
      }
      
      // 等级4-6：根据概率决定是否生成3个对象
      const randomValue = Math.random() * 100 // 0-100的随机数
      let threeObjectProbability = 0
      
      switch (this.currentDifficultyLevel) {
        case 4:
          threeObjectProbability = 10 // 10%概率生成3个
          break
        case 5:
          threeObjectProbability = 25 // 25%概率生成3个
          break
        case 6:
        default:
          threeObjectProbability = 40 // 40%概率生成3个（等级6及以上）
          break
      }
      
      // 根据概率决定最大生成数量
      if (randomValue < threeObjectProbability) {
        // 生成3个对象（如果有足够的泳道）
        const maxSpawn = Math.min(availableLanesCount, 3)
        console.log(`🎲 等级${this.currentDifficultyLevel} 概率触发: ${threeObjectProbability}% 概率生成3个对象，实际最多${maxSpawn}个`)
        return maxSpawn
      } else {
        // 生成0-2个对象（和等级3一样）
        const maxSpawn = Math.min(availableLanesCount, 2)
        console.log(`🎲 等级${this.currentDifficultyLevel} 正常生成: 最多${maxSpawn}个对象`)
        return maxSpawn
      }
    },

    // 获取可用泳道列表
    getAvailableLanes(gameLayoutStore) {
      const allLanes = Array.from({length: gameLayoutStore.lanes}, (_, i) => i)
      return allLanes.filter(lane => this.isLaneAvailable(lane, gameLayoutStore))
    },

    // 生成单个对象
    spawnSingleObject(objectType, lane, gameLayoutStore) {
      if (isObstacle(objectType)) {
        return this.spawnSpecificObstacle(objectType, lane, gameLayoutStore)
      } else if (isPowerUp(objectType)) {
        return this.spawnPowerUp(lane, objectType, gameLayoutStore)
      }
      return false
    },

    // 生成指定类型的障碍物
    spawnSpecificObstacle(obstacleType, lane, gameLayoutStore) {
      const obstacle = this.obstacleManager.createObstacle(obstacleType, lane, gameLayoutStore)
      if (obstacle) {
        this.obstacleManager.obstacles.push(obstacle)
        return true
      }
      return false
    },

    // 检查泳道是否可用（基于新的19vw最小距离要求）
    isLaneAvailable(lane, gameLayoutStore) {
      // 基于新的19vw最小距离要求
      const minDistanceVw = DIFFICULTY_CONFIG.absoluteMinInterval // 19vw
      const minDistancePx = gameLayoutStore.canvas.width * (minDistanceVw / 100)
      
      // 检查障碍物
      const hasObstacle = this.obstacleManager.obstacles.some(obstacle => 
        obstacle.lane === lane && 
        Math.abs(obstacle.y - (-obstacle.height)) < minDistancePx
      )
      
      // 检查道具
      const hasPowerUp = this.powerUps.some(powerUp => 
        powerUp.lane === lane && 
        Math.abs(powerUp.y - (-gameLayoutStore.powerUpDisplayHeight)) < minDistancePx
      )
      
      return !hasObstacle && !hasPowerUp
    },
    
    // 更新障碍物系统
    updateObstacleSystem(gameSpeed, gameLayoutStore, gameStateStore) {
      // 将obstacleManager引用传递给gameLayoutStore，以便障碍物可以访问
      gameLayoutStore.obstacleManager = this.obstacleManager
      
      // 更新现有障碍物，传递powerUps引用
      this.obstacleManager.updateObstacles(gameSpeed, gameLayoutStore, this.powerUps)
      
      // 使用统一生成系统
      this.updateSpawnSystem(gameSpeed, gameLayoutStore, gameStateStore)
    },
    
    // 性能优化版本的障碍物更新系统
    updateObstacleSystemOptimized(gameSpeed, gameLayoutStore, gameStateStore, currentTime) {
      // 将obstacleManager引用传递给gameLayoutStore，以便障碍物可以访问
      gameLayoutStore.obstacleManager = this.obstacleManager
      
      // 使用性能优化的更新方法，传递powerUps引用
      this.obstacleManager.updateObstaclesOptimized(gameSpeed, gameLayoutStore, currentTime, this.powerUps)
      
      // 使用统一生成系统
      this.updateSpawnSystem(gameSpeed, gameLayoutStore, gameStateStore)
    },
    
    // 检查玩家与障碍物的碰撞
    checkObstacleCollision(player) {
      for (const obstacle of this.obstacleManager.obstacles) {
        if (this.checkCollision(player, obstacle)) {
          return obstacle
        }
      }
      return null
    },
    
    // 新增：检查障碍物碰撞（支持雪碧图和obs3特殊规则）
    checkObstacleCollisionWithSpriteAssets(player, spriteAssets = null) {
      for (const obstacle of this.obstacleManager.obstacles) {
        // 首先检查物理碰撞
        if (this.checkCollision(player, obstacle)) {
          // 然后检查是否应该触发碰撞（考虑obs3的特殊规则）
          if (obstacle.shouldTriggerCollision && obstacle.shouldTriggerCollision(spriteAssets)) {
            return obstacle
          } else if (!obstacle.shouldTriggerCollision) {
            // 向后兼容：如果障碍物没有shouldTriggerCollision方法，使用默认规则
            return obstacle
          }
        }
      }
      return null
    },
    
    // 移除障碍物并添加爆炸效果
    removeObstacleWithEffect(obstacle) {
      this.addExplosion(obstacle.x, obstacle.y)
      this.obstacleManager.removeObstacle(obstacle)
    },
    
    // 获取障碍物渲染信息
    getObstacleRenderInfo() {
      return this.obstacleManager.getRenderInfo()
    },
    
    // 预测安全泳道
    predictSafeLane(playerX, lookAhead, lanes) {
      return this.obstacleManager.predictSafeLane(playerX, lookAhead, lanes)
    },
    
    // 收集道具
    collectPowerUp(powerUp, gameStateStore, playerControlStore) {
      if (powerUp.type === 'snorkel') {
        // 重置snorkel加速效果，以最新获得的为准
        playerControlStore.isRushing = true
        playerControlStore.invulnerable = true
        playerControlStore.rushTime = 180 // 3秒
        playerControlStore.invulnerableTime = 180
        
        // 同步到gameState
        gameStateStore.rushActive = true
        gameStateStore.rushTime = 180
        gameStateStore.invulnerable = true
        gameStateStore.invulnerableTime = 180
        
        // 收集呼吸管道具时触发中等震动
        vibrationManager.mediumVibration()
        console.log('🏊‍♀️ 收集呼吸管道具，触发中等震动')
      } else if (powerUp.type === 'star') {
        // 调用gameStateStore的collectStar方法，同时增加stars和score
        gameStateStore.collectStar()
        
        // 检查是否达到新的最佳分数
        if (gameStateStore.score > gameStateStore.bestScore) {
          gameStateStore.bestScore = gameStateStore.score
          localStorage.setItem('bestScore', gameStateStore.bestScore.toString())
        }
        
        // 收集星星时触发轻微震动
        vibrationManager.lightVibration()
        console.log('⭐ 收集星星，触发轻微震动')
      }
      
      // 添加收集特效
      this.addCollectEffect(powerUp.x, powerUp.y)
    },
    
    // 创建道具对象
    createPowerUp(lane, type, gameLayoutStore) {
      const laneX = gameLayoutStore.getLaneX(lane)
      
      return {
        x: laneX - gameLayoutStore.powerUpDisplayWidth / 2,
        y: -gameLayoutStore.powerUpDisplayHeight,
        width: gameLayoutStore.powerUpDisplayWidth,
        height: gameLayoutStore.powerUpDisplayHeight,
        collisionWidth: gameLayoutStore.powerUpCollisionWidth,
        collisionHeight: gameLayoutStore.powerUpCollisionHeight,
        type: type,
        lane: lane,
        collected: false,
        glowPhase: 0
      }
    },
    
    // 生成道具
    spawnPowerUp(specificLane = null, specificType = null, gameLayoutStore = null) {
      // 选择泳道和道具类型
      const lane = specificLane !== null ? specificLane : Math.floor(Math.random() * gameLayoutStore.lanes)
      const type = specificType || getRandomGameObjectType()
      
      // 检查泳道是否可用
      if (this.isLaneAvailable(lane, gameLayoutStore)) {
        // 创建并添加道具
        const powerUp = this.createPowerUp(lane, type, gameLayoutStore)
        this.powerUps.push(powerUp)
        return true
      }
      return false
    },
    
    // 碰撞检测 - 使用圆形碰撞检测
    checkCollision(obj1, obj2) {
      // 获取对象1的碰撞圆信息
      const obj1CollisionWidth = obj1.collisionWidth || obj1.width
      const obj1CollisionHeight = obj1.collisionHeight || obj1.height
      const obj1Radius = Math.min(obj1CollisionWidth, obj1CollisionHeight) / 2
      const obj1CenterX = obj1.x + obj1.width / 2
      const obj1CenterY = obj1.y + obj1.height / 2
      
      // 获取对象2的碰撞圆信息
      const obj2CollisionWidth = obj2.collisionWidth || obj2.width
      const obj2CollisionHeight = obj2.collisionHeight || obj2.height
      const obj2Radius = Math.min(obj2CollisionWidth, obj2CollisionHeight) / 2
      const obj2CenterX = obj2.x + obj2.width / 2
      const obj2CenterY = obj2.y + obj2.height / 2
      
      // 计算两个圆心之间的距离
      const dx = obj1CenterX - obj2CenterX
      const dy = obj1CenterY - obj2CenterY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // 如果距离小于两个半径之和，则发生碰撞
      return distance < (obj1Radius + obj2Radius)
    },
    
    // 更新对象位置
    updateObjectPositions(gameLayoutStore) {
      // 障碍物位置由ObstacleManager管理，这里只更新道具
      this.powerUps.forEach(powerUp => {
        powerUp.x = gameLayoutStore.getLaneX(powerUp.lane) - powerUp.width / 2
      })
    },  // 添加这个逗号

    // 粒子效果函数 - 已禁用但保留接口
    addSplash(x, y, gameLayoutStore) {
      // 水花效果已禁用
      return
    },

    addCollectEffect(x, y) {
      // 收集特效已禁用
      return
    },

    addExplosion(x, y) {
      // 爆炸特效已禁用
      return
    },

    resetDifficultySystem() {
      this.currentDifficultyLevel = 3 // 改为从第3级开始
      this.lastSpawnDistance = 0
      this.lastLevelUpdate = 0
      this.pendingObjectTypes = []
      this.forceNextSpawn = true
      console.log('🔄 难度系统已重置到第3级')
    }
  }
})