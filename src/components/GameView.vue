<template>
  <div class="game-view" @touchstart="handleTouchStart" @touchmove="handleTouchMove">
    <!-- 游戏画布组件 -->
    <GameCanvas />
    
    <!-- 游戏UI覆盖层 -->
    <div class="game-ui">
      <!-- 统一的顶部UI区域 -->
      <UITop />
      
      <!-- 加速倒计时指示器 -->
      <div 
        v-if="playerControlStore.isRushing || gameStateStore.rushActive" 
        class="rush-indicator"
      >
        <div class="rush-icon">🚀</div>
        <div class="rush-time">
          {{ Math.ceil((playerControlStore.rushTime || gameStateStore.rushTime) / 60) }}s
        </div>
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
        <div class="energy-bg">
          <div 
            class="energy-fill" 
            :class="{ 'energy-active': gameStateStore.isActiveSprinting }"
            :style="{ '--energy-percentage': gameStateStore.sprintEnergy + '%' }"
          ></div>
        </div>
        <div class="energy-percentage" :class="{ 'no-energy-flash': gameStateStore.sprintEnergy < 20 }">
          <!-- 删除所有文字，只保留图标 -->
        </div>
      </div>
      
    </div>


    <!-- 教学卡片组件 -->
    <TutorialCards 
      v-if="gameStateStore.gameState === 'waiting' || gameStateStore.isFirstTimeGame || gameStateStore.gameState === 'paused'"
      ref="tutorialCards"
    />
    
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
import TutorialCards from './TutorialCards.vue'
import DeveloperDebugPanel from './DeveloperDebugPanel.vue'
import { useGameStore } from '../stores/gameStore'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { useGameLayoutStore } from '../stores/gamestore/gameLayout'
import { usePlayerControlStore } from '../stores/gamestore/playerControl'
import { useGameObjectsStore } from '../stores/gamestore/gameObjects'
import audioManager from '../utils/audio-manager'

export default {
  name: 'GameView',
  components: {
    GameCanvas,
    UITop,
    TutorialCards,
    DeveloperDebugPanel
  },
  setup() {
    const gameStore = useGameStore()
    const gameStateStore = useGameStateStore()
    const gameLayoutStore = useGameLayoutStore()
    const playerControlStore = usePlayerControlStore()
    const gameObjectsStore = useGameObjectsStore()
    
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
        gameObjectsStore.resetGameObjectState()
        
        // 强制刷新难度系统
        gameObjectsStore.forceNextSpawn = true
        gameObjectsStore.currentDifficultyLevel = jumpData.level
        
        console.log(`🚀 开发者跳跃成功: 等级${jumpData.level}, 距离${Math.round(jumpData.distance)}m (${Math.round(jumpData.distanceVw)}vw)`)
        
        // 设置距离和其他状态
        gameStateStore.distance = jumpData.distance
        
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
      }, 1) // 1毫秒后才开始冲刺
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
    
    // 处理能量按钮触摸开始事件
    const handleEnergyBarTouchStart = () => {
      // 清除之前的定时器
      if (energyBarHoldTimer.value) {
        clearTimeout(energyBarHoldTimer.value)
      }
      
      // 立即响应：先预测加速状态，然后立即启动冲刺
      if (gameStateStore.gameState === 'playing' && gameStateStore.sprintEnergy > 5) {
        // 预测加速后的状态
        const predictedSprintState = {
          isActiveSprinting: true,
          sprintKeyHeld: true,
          energyDraining: true
        }
        
        // 立即启动冲刺，无延迟
        gameStateStore.startActiveSprint()
        
        // 可选：立即更新UI状态以提供视觉反馈
        // 这样用户能立即看到按钮被激活的效果
      }
    }
    
    // 处理能量按钮触摸结束事件
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
    
    // 防止水平滑动退出页面的触摸事件处理
    let startX = null
    let startY = null
    
    const handleTouchStart = (event) => {
      // 记录触摸起始位置
      if (event.touches && event.touches.length > 0) {
        startX = event.touches[0].clientX
        startY = event.touches[0].clientY
      }
    }
    
    const handleTouchMove = (event) => {
      // 如果没有起始位置，直接返回
      if (startX === null || startY === null) return
      
      // 获取当前触摸位置
      if (event.touches && event.touches.length > 0) {
        const currentX = event.touches[0].clientX
        const currentY = event.touches[0].clientY
        
        // 计算滑动距离
        const deltaX = Math.abs(currentX - startX)
        const deltaY = Math.abs(currentY - startY)
        
        // 如果水平滑动距离大于垂直滑动距离，且水平滑动距离超过阈值
        if (deltaX > deltaY && deltaX > 50) {
          // 阻止默认的浏览器左滑右滑行为
          event.preventDefault()
          event.stopPropagation()
        }
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
      handleTouchStart,
      handleTouchMove,
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
  /* 防止水平滑动退出页面 */
  touch-action: pan-y;
  overscroll-behavior-x: none;
  -webkit-overflow-scrolling: touch;
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
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  color: #fff;
  padding: 12px 20px;
  border-radius: 30px;
  font-family: 'FZLTCH', Arial, sans-serif;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: gentlePulse 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 20;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.rush-icon {
  font-size: 20px;
  opacity: 0.9;
}

.rush-time {
  font-size: 14px;
  font-weight: 500;
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

/* 冲刺能量条 - 环形进度按钮 */
.sprint-energy-bar {
  position: absolute;
  bottom: 25vh;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  z-index: 1000;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.sprint-energy-bar:hover {
  transform: translateX(-50%) scale(1.05);
}

.sprint-energy-bar:active {
  transform: translateX(-50%) scale(0.95);
}



/* 外层能量槽容器 */
.energy-bg {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 50%;
  background: white;
  border: 1px solid #72332E;
  box-shadow: 
    0 0px 0px rgba(0, 0, 0, 0.25),
    inset 0 0px 0 rgba(255, 255, 255, 0.3);
}

/* 环形进度条 */
.energy-fill {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #FF9E5D 0% var(--energy-percentage, 0%),
    transparent var(--energy-percentage, 0%) 100%
  );
  transition: all 0.3s ease;
  mask: radial-gradient(circle, transparent 45%, black 46%);
  -webkit-mask: radial-gradient(circle, transparent 45%, black 46%);
}

.energy-fill.energy-active {
  background: conic-gradient(
    from 0deg,
    #FF6B35 0% var(--energy-percentage, 0%),
    transparent var(--energy-percentage, 0%) 100%
  );
  animation: energyActivePulse 0.8s ease-in-out infinite;
}

/* 内层按钮 */
.energy-percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #FFEBCF;
  border: 0px solid #72332E;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #72332E;
  font-size: 12px;
  font-weight: 700;
  font-family: 'FZLTCH', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 0px 0px rgba(0, 0, 0, 0.15),
    inset 0 0px 0 rgba(255, 255, 255, 0.5);
  z-index: 10;
}

/* 闪电图标 */
.energy-percentage::before {
  content: '⚡';
  font-size: 28px;
  margin-bottom: 2px;
  opacity: 0.9;
}

.energy-percentage.no-energy-flash {
  animation: noEnergyFlash 1s ease-in-out infinite;
}

.energy-percentage.no-energy-flash::before {
  content: '⚠️';
  margin-bottom: 8px;
  opacity: 0.9; 
}

/* 主动冲刺状态指示器 */
.active-sprint-indicator {
  position: absolute;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  color: #fff;
  padding: 10px 18px;
  border-radius: 25px;
  font-weight: 600;
  font-family: 'FZLTCH', Arial, sans-serif;
  font-size: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: gentleGlow 1.5s ease-in-out infinite;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
}

.sprint-icon {
  font-size: 18px;
  opacity: 0.95;
}

.sprint-text {
  font-size: 14px;
  font-weight: 500;
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
/* 删除以下 CSS 样式 */
.pause-play-icon {
  width: 80px;
  height: 80px;
  opacity: 0.9;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  animation: pauseIconPulse 2s ease-in-out infinite;
  transition: transform 0.2s ease;
}

.pause-play-icon:hover {
  transform: scale(1.1);
}

/* 删除相关动画 */
@keyframes pauseIconPulse {
  0%, 100% { 
    opacity: 0.9; 
    transform: scale(1); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.05); 
  }
}

@keyframes gentlePulse {
  0%, 100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.9;
  }
  50% {
    transform: translateX(-50%) scale(1.05);
    opacity: 1;
  }
}

@keyframes gentleGlow {
  0%, 100% {
    opacity: 0.8;
    transform: translateX(-50%) scale(1);
    border-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.02);
    border-color: rgba(255, 255, 255, 1);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
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
    transform: translate(-50%, -50%) scale(1);
    filter: drop-shadow(0 0 10px rgba(255, 107, 53, 0.6));
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.05);
    filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.8));
  }
}

@keyframes noEnergyFlash {
  0%, 100% { 
    opacity: 1;
    color: #e74c3c;
    background: #ffecec;
  }
  50% { 
    opacity: 0.6;
    color: #c0392b;
    background: #FFEBCF;
  }
}

@keyframes sprintPulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.05); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rush-indicator {
    padding: 10px 16px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 1.5px;
  }
  
  .rush-icon {
    font-size: 18px;
  }
  
  .rush-time {
    font-size: 12px;
  }
  
  .active-sprint-indicator {
    font-size: 12px;
    padding: 8px 14px;
    border-width: 1.5px;
  }
  
  .sprint-icon {
    font-size: 16px;
  }
  
  .sprint-text {
    font-size: 12px;
  }
  
  .waiting-text {
    font-size: 24px;
  }
  
  .waiting-subtext {
    font-size: 14px;
  }
  
  .sprint-energy-bar {
    width: 35dvw;
    height: 35dvw;
    bottom: calc(15vh + 20px);
  }
  
  

}

@media (max-width: 480px) {
  .rush-indicator {
    font-size: 12px;
    padding: 8px 12px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 1px;
  }
  
  .rush-icon {
    font-size: 16px;
  }
  
  .rush-time {
    font-size: 11px;
  }
  
  .active-sprint-indicator {
    font-size: 11px;
    padding: 6px 12px;
    border-width: 1px;
  }
  
  .sprint-icon {
    font-size: 14px;
  }
  
  .sprint-text {
    font-size: 11px;
  }
  
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
    width: 85px;
    height: 85px;
    bottom: calc(12vh + 15px);
  }
  
  .energy-label {
    font-size: 11px;
    top: -25px;
  }
  

}


</style>