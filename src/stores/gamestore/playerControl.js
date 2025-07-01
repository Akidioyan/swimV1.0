// 玩家控制相关
// 1. 冲刺系统 ：管理冲刺能量、冷却时间和冲刺状态
// 2. 状态管理 ：无敌状态、冲刺状态、减速状态
// 3. 速度计算 ：根据游戏进度和状态计算当前速度倍数
// 4. 泳道切换 ：处理键盘和触摸控制的泳道切换
// 5. 输入处理 ：键盘按键和触摸事件处理
// 6. 状态更新 ：更新各种计时器和状态
// 7. 重置功能 ：重置玩家控制相关状态
import { defineStore } from 'pinia'
import { useGameStateStore } from './gameState'
import { useGameLayoutStore } from './gameLayout'
import { useGameStore } from '../gameStore'
import audioManager from '../../utils/audio-manager'

export const usePlayerControlStore = defineStore('playerControl', {
  state: () => ({
    // 无敌状态
    invulnerable: false,
    invulnerableTime: 0,
    
    // 冲刺状态
    isRushing: false,
    rushTime: 0,
    
    // 键盘控制
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      space: false
    },
    
    // 键盘控制防抖
    lastKeyPressTime: 0,
    keyDebounceDelay: 100, // 100ms防抖延迟
    
    // 速度控制
    currentSpeedMultiplier: 1.0,
  }),
  
  getters: {
    // 是否处于无敌状态
    isInvulnerable: (state) => state.invulnerable,
    
    // 是否处于冲刺状态
    isInRush: (state) => state.isRushing,
  },
  
  actions: {
    // 重置玩家控制状态
    resetPlayerControl() {
      this.invulnerable = false
      this.invulnerableTime = 0
      this.isRushing = false
      this.rushTime = 0
      this.currentSpeedMultiplier = 1.0
      
      // 重置按键状态
      this.keys = {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false
      }
    },
    
    // 更新玩家状态
    updatePlayerState(deltaTime) {
      const gameStateStore = useGameStateStore()
      
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
          this.isRushing = false
        }
      }
      
      // 同步到gameState store
      gameStateStore.invulnerable = this.invulnerable
      gameStateStore.invulnerableTime = this.invulnerableTime
      gameStateStore.rushActive = this.isRushing
      gameStateStore.rushTime = this.rushTime
      
      // 更新速度倍数
      this.currentSpeedMultiplier = gameStateStore.currentSpeedMultiplier
    },
    
    // 处理键盘按下事件
    handleKeyDown(key) {
      const gameStateStore = useGameStateStore()
      
      // 如果是等待状态，任何按键都启动游戏
      if (gameStateStore.gameState === 'waiting') {
        switch(key) {
          case 'ArrowLeft':
            this.switchLane(-1)
            break
          case 'ArrowRight':
            this.switchLane(1)
            break
          case ' ': // 空格键也能启动游戏
            gameStateStore.actuallyStartGame()
            break
          default:
            // 其他按键也能启动游戏
            gameStateStore.actuallyStartGame()
            break
        }
        return
      }
      
      if (gameStateStore.gameState === 'playing') {
        switch(key) {
          case 'ArrowLeft':
            this.keys.left = true
            this.switchLane(-1)
            break
          case 'ArrowRight':
            this.keys.right = true
            this.switchLane(1)
            break
          case 'ArrowUp':
            this.keys.up = true
            // 开发者测试模式：按下上键开启无敌状态和3倍速度
            this.invulnerable = true
            this.invulnerableTime = 999999
            // 通过gameState设置开发者冲刺状态
            gameStateStore.devSprintActive = true
            break
            this.startSprint()
            break
          case 'ArrowDown':
            this.keys.down = true
            this.startSlowdown()
            break
          case ' ': // 空格键主动冲刺
            this.keys.space = true
            gameStateStore.startActiveSprint()
            break
        }
      }
    },
    
    // 处理键盘释放事件
    handleKeyUp(key) {
      const gameStateStore = useGameStateStore()
      
      switch(key) {
        case 'ArrowLeft':
          this.keys.left = false
          break
        case 'ArrowRight':
          this.keys.right = false
          break
        case 'ArrowUp':
          this.keys.up = false
          // 开发者测试模式：松开上键结束所有状态
          this.invulnerable = false
          this.invulnerableTime = 0
          // 关闭开发者冲刺状态
          gameStateStore.devSprintActive = false
          break
        case 'ArrowDown':
          this.keys.down = false
          break
        case ' ':
          this.keys.space = false
          gameStateStore.stopActiveSprint() // 停止主动冲刺
          break
      }
    },
    
    
    // 切换泳道（相对方向）
    switchLane(direction) {
      const gameStateStore = useGameStateStore()
      const gameLayoutStore = useGameLayoutStore()
      const gameStore = useGameStore()
      
      // 如果是等待状态，则启动游戏
      if (gameStateStore.gameState === 'waiting') {
        gameStateStore.actuallyStartGame()
      }
      
      if (gameStateStore.gameState !== 'playing') return
      
      // 防抖检查
      const currentTime = Date.now()
      if (currentTime - this.lastKeyPressTime < this.keyDebounceDelay) {
        return // 忽略过快的按键
      }
      this.lastKeyPressTime = currentTime
      
      const currentLane = gameLayoutStore.player.currentLane
      const targetLane = currentLane + direction
      
      // 确保目标泳道在有效范围内
      if (targetLane >= 0 && targetLane < gameLayoutStore.lanes) {
        this.switchToLane(targetLane)
      }
    },
    
    // 切换到指定泳道
    switchToLane(targetLane) {
      const gameStateStore = useGameStateStore()
      const gameLayoutStore = useGameLayoutStore()
      const gameStore = useGameStore()
      
      // 如果是等待状态，则启动游戏
      if (gameStateStore.gameState === 'waiting') {
        gameStateStore.actuallyStartGame()
      }
      
      if (gameStateStore.gameState !== 'playing') return
      if (targetLane < 0 || targetLane >= gameLayoutStore.lanes) return
      
      if (targetLane !== gameLayoutStore.player.currentLane) {
        gameLayoutStore.switchToLane(targetLane)
        
        // 添加水花效果
        gameStore.addSplash(gameLayoutStore.player.x, gameLayoutStore.player.y)
        
        // 播放游泳音效 - 使用音频管理器
        audioManager.playSwimmingSound()
      }
    },
    
    // 开始冲刺（开发者测试模式：不耗费能量，不限时长，无敌）
    startSprint() {
      const gameStateStore = useGameStateStore()
      
      // 开发者测试模式：移除所有限制条件
      this.isRushing = true
      this.rushTime = 999999 // 设置一个很大的值，实现不限时长
      
      // 设置无敌状态
      this.invulnerable = true
      this.invulnerableTime = 999999 // 设置一个很大的值，实现持续无敌
      
      // 同步到gameState（但不消耗能量）
      gameStateStore.rushActive = this.isRushing
      gameStateStore.rushTime = this.rushTime
      gameStateStore.invulnerable = this.invulnerable
      gameStateStore.invulnerableTime = this.invulnerableTime
      
      // 不调用 gameStateStore.startSprint() 以避免消耗能量
    },
    
    // 开始减速
    startSlowdown() {
      const gameStateStore = useGameStateStore()
      gameStateStore.startSlowdown()
    }
  }
})