<template>
  <div class="game-view">
    <!-- 游戏画布组件 -->
    <GameCanvas />
    
    <!-- 游戏UI覆盖层 -->
    <div class="game-ui">
      <!-- 统一的顶部UI区域 -->
      <UITop />
      
      <!-- 冲刺状态指示器 -->
      <div 
        v-if="playerControlStore.isRushing" 
        class="rush-indicator"
      >
        <div class="rush-icon">🚀</div>
        <div class="rush-time">{{ Math.ceil(playerControlStore.rushTime / 60) }}s</div>
      </div>
      
      <!-- 无敌状态指示器 -->
      <div 
        v-if="gameStateStore.invulnerable && !gameStateStore.rushActive" 
        class="invulnerable-indicator"
      >
        <div class="invulnerable-icon">✨</div>
        <div class="invulnerable-time">{{ Math.ceil(gameStateStore.invulnerableTime / 60) }}s</div>
      </div>
      
      <!-- 冲刺能量条 -->
      <div 
        class="sprint-energy-bar" 
        @mousedown="handleEnergyBarMouseDown"
        @mouseup="handleEnergyBarMouseUp"
        @mouseleave="handleEnergyBarMouseUp"
        @touchstart="handleEnergyBarTouchStart"
        @touchend="handleEnergyBarTouchEnd"
      >
        <div class="energy-label">冲刺能量</div>
        <div class="energy-bg">
          <div 
            class="energy-fill" 
            :class="{ 'energy-active': gameStateStore.isActiveSprinting }"
            :style="{ width: gameStateStore.sprintEnergy + '%' }"
          ></div>
        </div>
        <div class="energy-percentage" :class="{ 'no-energy-flash': gameStateStore.sprintEnergy < 20 }">
          {{ getEnergyText() }}
        </div>
      </div>
      
      <!-- 冲刺状态指示器 -->
      <div 
        v-if="gameStateStore.isActiveSprinting" 
        class="active-sprint-indicator"
      >
        <div class="sprint-icon">⚡</div>
        <div class="sprint-text">冲刺</div>
      </div>
    </div>
    
    <!-- 等待提示 -->
    <div 
      v-if="gameStateStore.gameState === 'waiting'" 
      class="waiting-hint"
    >
      <div class="waiting-content">
        <div class="waiting-text">点击泳道开始游泳！</div>
        <div class="waiting-subtext">
          触摸：点击左半屏向左移动，点击右半屏向右移动
        </div>
      </div>
    </div>
    
    <!-- 暂停提示 -->
    <div 
      v-if="gameStateStore.gameState === 'paused'" 
      class="pause-overlay"
    >
      <div class="pause-backdrop"></div>
      <div class="pause-hint" @click="handleResumeGame">
        <img src="/ui/play.png" alt="继续游戏" class="pause-play-icon" />
      </div>
    </div>
    
    <!-- 开发者调试面板 -->
    <DeveloperDebugPanel 
      :visible="showDebugPanel"
      @close="handleCloseDebugPanel"
      @jumpToLevel="handleJumpToLevel"
    />
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import GameCanvas from './GameView/GameCanvas.vue'
import UITop from './GameView/UI-top.vue'
import DeveloperDebugPanel from './DeveloperDebugPanel.vue'
import { useGameStore } from '../stores/gameStore'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { useGameLayoutStore } from '../stores/gamestore/gameLayout'
import { usePlayerControlStore } from '../stores/gamestore/playerControl'
import audioManager from '../utils/audio-manager'

export default {
  name: 'GameView',
  components: {
    GameCanvas,
    UITop,
    DeveloperDebugPanel
  },
  setup() {
    const gameStore = useGameStore()
    const gameStateStore = useGameStateStore()
    const gameLayoutStore = useGameLayoutStore()
    const playerControlStore = usePlayerControlStore()
    
    // 能量条防误触定时器
    const energyBarHoldTimer = ref(null)
    
    // 开发者调试面板状态
    const showDebugPanel = ref(false)
    
    onMounted(() => {
      // 在组件挂载时初始化音频 - 使用音频管理器
      audioManager.init()
      
      // 添加键盘事件监听（全局）
      document.addEventListener('keydown', handleGlobalKeyDown)
      document.addEventListener('keyup', handleGlobalKeyUp)
    })
    
    onUnmounted(() => {
      // 移除全局事件监听
      document.removeEventListener('keydown', handleGlobalKeyDown)
      document.removeEventListener('keyup', handleGlobalKeyUp)
      
      // 清理能量条定时器
      if (energyBarHoldTimer.value) {
        clearTimeout(energyBarHoldTimer.value)
        energyBarHoldTimer.value = null
      }
    })
    
    // 全局键盘事件处理
    const handleGlobalKeyDown = (event) => {
      // 开发者调试面板快捷键
      if (event.key === 'l' || event.key === 'L') {
        event.preventDefault()
        toggleDebugPanel()
        return
      }
      
      // 如果调试面板已打开，阻止其他按键操作
      if (showDebugPanel.value) {
        return
      }
      
      // 防止页面滚动等默认行为
      if (['ArrowLeft', 'ArrowRight', ' ', 'Escape'].includes(event.key)) {
        event.preventDefault()
      }
      
      // 如果游戏处于等待状态，任何按键都开始游戏
      if (gameStateStore.gameState === 'waiting') {
        gameStateStore.actuallyStartGame()
      }
      
      // 传递给玩家控制store处理
      playerControlStore.handleKeyDown(event.key)
    }
    
    const handleGlobalKeyUp = (event) => {
      // 如果调试面板已打开，阻止其他按键操作
      if (showDebugPanel.value) {
        return
      }
      
      playerControlStore.handleKeyUp(event.key)
    }
    
    // 开发者调试面板相关函数
    const toggleDebugPanel = () => {
      showDebugPanel.value = !showDebugPanel.value
      console.log('🛠️ 开发者调试面板:', showDebugPanel.value ? '打开' : '关闭')
    }
    
    const handleCloseDebugPanel = () => {
      showDebugPanel.value = false
    }
    
    const handleJumpToLevel = (jumpData) => {
      try {
        // 重置相关状态
        gameStore.resetGameState()
        
        // 强制刷新难度系统
        gameStore.forceNextSpawn = true
        gameStore.currentDifficultyLevel = jumpData.level
        
        console.log(`🚀 开发者跳跃成功: 等级${jumpData.level}, 距离${Math.round(jumpData.distance)}m (${Math.round(jumpData.distanceVw)}vw)`)
        
        // 关闭调试面板
        showDebugPanel.value = false
      } catch (error) {
        console.error('❌ 开发者跳跃失败:', error)
      }
    }
    
    // 处理点击暂停图标恢复游戏
    const handleResumeGame = () => {
      if (gameStateStore.gameState === 'paused') {
        gameStateStore.togglePause()
      }
    }
    
    // 处理能量条鼠标按下事件
    const handleEnergyBarMouseDown = () => {
      // 清除之前的定时器
      if (energyBarHoldTimer.value) {
        clearTimeout(energyBarHoldTimer.value)
      }
      
      // 设置延时启动，避免意外短按
      energyBarHoldTimer.value = setTimeout(() => {
        if (gameStateStore.gameState === 'playing' && gameStateStore.sprintEnergy > 5) {
          gameStateStore.startActiveSprint()
        }
        energyBarHoldTimer.value = null
      }, 150) // 150毫秒后才开始冲刺
    }
    
    // 处理能量条鼠标释放事件
    const handleEnergyBarMouseUp = () => {
      // 清除定时器，防止误触发
      if (energyBarHoldTimer.value) {
        clearTimeout(energyBarHoldTimer.value)
        energyBarHoldTimer.value = null
      }
      
      // 立即停止冲刺
      if (gameStateStore.isActiveSprinting) {
        gameStateStore.stopActiveSprint()
      }
    }
    
    // 处理能量条触摸开始事件
    const handleEnergyBarTouchStart = () => {
      // 清除之前的定时器
      if (energyBarHoldTimer.value) {
        clearTimeout(energyBarHoldTimer.value)
      }
      
      // 设置延时启动，避免意外短按
      energyBarHoldTimer.value = setTimeout(() => {
        if (gameStateStore.gameState === 'playing' && gameStateStore.sprintEnergy > 5) {
          gameStateStore.startActiveSprint()
        }
        energyBarHoldTimer.value = null
      }, 150) // 150毫秒后才开始冲刺
    }
    
    // 处理能量条触摸结束事件
    const handleEnergyBarTouchEnd = () => {
      // 清除定时器，防止误触发
      if (energyBarHoldTimer.value) {
        clearTimeout(energyBarHoldTimer.value)
        energyBarHoldTimer.value = null
      }
      
      // 立即停止冲刺
      if (gameStateStore.isActiveSprinting) {
        gameStateStore.stopActiveSprint()
      }
    }
    
    // 获取能量条文字显示
    const getEnergyText = () => {
      const energy = gameStateStore.sprintEnergy
      if (energy >= 100) {
        return 'GO'
      } else if (energy < 20) {
        return 'No Energy'
      } else {
        return Math.floor(energy) + '%'
      }
    }
    
    return {
      gameStore,
      gameStateStore,
      gameLayoutStore,
      playerControlStore,
      showDebugPanel,
      toggleDebugPanel,
      handleCloseDebugPanel,
      handleJumpToLevel,
      handleResumeGame,
      handleEnergyBarMouseDown,
      handleEnergyBarMouseUp,
      handleEnergyBarTouchStart,
      handleEnergyBarTouchEnd,
      getEnergyText
    }
  }
}
</script>

<style scoped>
/* 自定义字体 */
@font-face {
  font-family: 'FZLTCH';
  src: url('/font/FZLTCH.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

/* 游戏视图容器 */
.game-view {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

/* 游戏UI覆盖层 */
.game-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

/* 冲刺状态指示器 */
.rush-indicator {
  position: absolute;
  top: 15vh;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 215, 0, 0.9);
  color: #000;
  padding: 10px 20px;
  border-radius: 25px;
  font-family: 'FZLTCH', Arial, sans-serif;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: pulse 1s infinite;
  pointer-events: none;
  z-index: 20;
}

.rush-icon {
  font-size: 24px;
  /* 移除旋转动画，让小火箭图标保持静止 */
}

.rush-time {
  font-size: 16px;
}

/* 无敌状态指示器 */
.invulnerable-indicator {
  position: absolute;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  color: #000;
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'FZLTCH', Arial, sans-serif;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: pulse 0.5s infinite alternate;
  pointer-events: none;
  z-index: 20;
}

.invulnerable-icon {
  font-size: 20px;
  animation: sparkle 1s infinite;
}

/* 冲刺能量条 */
.sprint-energy-bar {
  position: absolute;
  bottom: 25vh;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 100px;
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%);
  border-radius: 50px;
  border: 1px solid #adb5bd;
  overflow: hidden;
  z-index: 1000;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.15),
    inset 0 1px 3px rgba(255, 255, 255, 0.6),
    inset 0 -1px 3px rgba(0, 0, 0, 0.1);
}

.sprint-energy-bar:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 
    0 12px 30px rgba(0, 0, 0, 0.2),
    inset 0 1px 3px rgba(255, 255, 255, 0.6),
    inset 0 -1px 3px rgba(0, 0, 0, 0.1);
}

.sprint-energy-bar:active {
  transform: translateX(-50%) scale(0.98);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.2),
    inset 0 2px 5px rgba(0, 0, 0, 0.2);
}

.energy-label {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  color: #495057;
  font-size: 14px;
  font-family: 'FZLTCH', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.energy-bg {
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  position: absolute;
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%);
  border-radius: 42px;
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.energy-fill {
  height: 100%;
  background: linear-gradient(135deg, 
    #4285f4 0%, 
    #1a73e8 25%, 
    #34a853 50%, 
    #1a73e8 75%, 
    #4285f4 100%);
  transition: width 0.3s ease;
  border-radius: 42px;
  position: relative;
  box-shadow: 
    0 0 20px rgba(66, 133, 244, 0.4),
    inset 0 1px 3px rgba(255, 255, 255, 0.4),
    inset 0 -1px 3px rgba(0, 0, 0, 0.1);
}

.energy-fill.energy-active {
  background: linear-gradient(135deg, 
    #ea4335 0%, 
    #fbbc04 25%, 
    #34a853 50%, 
    #fbbc04 75%, 
    #ea4335 100%);
  animation: energyActivePulse 0.8s ease-in-out infinite;
  box-shadow: 
    0 0 30px rgba(234, 67, 53, 0.6),
    inset 0 1px 3px rgba(255, 255, 255, 0.4),
    inset 0 -1px 3px rgba(0, 0, 0, 0.1);
}

.energy-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #2d3436;
  font-size: 18px;
  font-weight: 700;
  font-family: 'FZLTCH', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-shadow: 
    0 1px 2px rgba(255, 255, 255, 0.8),
    0 -1px 1px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 10;
}

.energy-percentage.no-energy-flash {
  animation: noEnergyFlash 1s ease-in-out infinite;
  color: #e74c3c;
  font-weight: 800;
}

/* 主动冲刺状态指示器 */
.active-sprint-indicator {
  position: absolute;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 0, 128, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-family: 'FZLTCH', Arial, sans-serif;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: sprintPulse 0.3s ease-in-out infinite;
  pointer-events: none;
  z-index: 1000;
}

.sprint-icon {
  font-size: 20px;
  animation: sparkle 0.5s ease-in-out infinite;
}

.sprint-text {
  font-size: 16px;
}

/* 等待提示 */
.waiting-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 30;
}

.waiting-content {
  background: rgba(0, 0, 0, 0.8);
  padding: 30px 40px;
  border-radius: 20px;
  border: 3px solid #FFD700;
}

.waiting-text {
  font-size: 28px;
  color: #FFD700;
  font-family: 'FZLTCH', Impact, Arial, sans-serif;
  font-weight: bold;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: pulse 2s infinite;
}

.waiting-subtext {
  font-size: 16px;
  color: #FFF;
  font-family: 'FZLTCH', Arial, sans-serif;
  line-height: 1.4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* 暂停覆盖层 */
.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 30;
  pointer-events: none;
}

/* 黑色底板 */
.pause-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

/* 暂停提示 */
.pause-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: pointer;
}

/* Play图标样式 */
.pause-play-icon {
  width: 80px;
  height: 80px;
  opacity: 0.9;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: pulse 2s ease-in-out infinite;
  transition: transform 0.2s ease;
}

.pause-play-icon:hover {
  transform: scale(1.1);
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% { 
    opacity: 0.9; 
    transform: scale(1); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.05); 
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes sparkle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
}

@keyframes energyActivePulse {
  0%, 100% { 
    box-shadow: 
      0 0 30px rgba(234, 67, 53, 0.6),
      inset 0 1px 3px rgba(255, 255, 255, 0.4),
      inset 0 -1px 3px rgba(0, 0, 0, 0.1);
    transform: scale(1);
  }
  50% { 
    box-shadow: 
      0 0 40px rgba(234, 67, 53, 0.8),
      inset 0 1px 3px rgba(255, 255, 255, 0.6),
      inset 0 -1px 3px rgba(0, 0, 0, 0.15);
    transform: scale(1.02);
  }
}

@keyframes noEnergyFlash {
  0%, 100% { 
    opacity: 1;
    color: #e74c3c;
  }
  50% { 
    opacity: 0.3;
    color: #c0392b;
  }
}

@keyframes sprintPulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.05); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rush-indicator {
    font-size: 16px;
    padding: 8px 16px;
  }
  
  .rush-icon {
    font-size: 20px;
  }
  
  .waiting-text {
    font-size: 24px;
  }
  
  .waiting-subtext {
    font-size: 14px;
  }
  
  .sprint-energy-bar {
    width: 225px;
    height: 52px;
    bottom: calc(15vh + 20px);
  }
  
  .energy-label {
    font-size: 14px;
    top: -25px;
  }
  
  .energy-percentage {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .waiting-content {
    padding: 20px 25px;
    margin: 0 20px;
  }
  
  .waiting-text {
    font-size: 20px;
  }
  
  .waiting-subtext {
    font-size: 12px;
  }
  
  .sprint-energy-bar {
    width: 180px;
    height: 42px;
    bottom: calc(12vh + 15px);
  }
  
  .energy-label {
    font-size: 12px;
    top: -20px;
  }
  
  .energy-percentage {
    font-size: 14px;
  }
}
</style>