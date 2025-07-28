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
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'
import GameCanvas from './GameView/GameCanvas.vue'
import UITop from './GameView/UI-top.vue'
import TutorialCards from './TutorialCards.vue'
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
    TutorialCards
  },
  setup() {
    const gameStore = useGameStore()
    const gameStateStore = useGameStateStore()
    const gameLayoutStore = useGameLayoutStore()
    const playerControlStore = usePlayerControlStore()
    const gameObjectsStore = useGameObjectsStore()
    
    // 能量条防误触定时器
    const energyBarHoldTimer = ref(null)
    
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
      playerControlStore.handleKeyUp(event.key)
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
          // 播放加速音效
          audioManager.playSoundEffect('accelerate')
          
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
        // 播放加速音效
        audioManager.playSoundEffect('accelerate')
        
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

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .game-view {
    height: 100dvh;
  }
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

/* 加速倒计时指示器 - 居中显示 */
.rush-indicator {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 215, 0, 0.9); /* 金黄色背景，体现加速效果 */
  color: #000;
  padding: 12px 20px;
  border-radius: 25px;
  font-family: 'FZLTCH', Arial, sans-serif;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: pulse 0.8s infinite alternate;
  pointer-events: none;
  z-index: 25; /* 高于无敌状态指示器 */
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
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
  bottom: 15vh; /* 使用vh作为基础值 */
  left: 50%;
  transform: translateX(-50%);
  width: 15vw; /* 使用vw作为基础值 */
  height: 15vw; /* 保持正方形比例 */
  min-width: 80px; /* 低端机型最小尺寸 */
  min-height: 80px;
  max-width: 120px; /* 添加最大尺寸限制 */
  max-height: 120px;
  z-index: 1000;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s ease;
}

/* 分别处理dvh和dvw支持，避免复合查询失败 */
@supports (height: 100dvh) {
  .sprint-energy-bar {
    bottom: 15dvh;
  }
}

@supports (width: 100dvw) {
  .sprint-energy-bar {
    width: 15dvw;
    height: 15dvw;
  }
}

/* 只有在同时支持时才应用最大尺寸限制 */
@supports (height: 100dvh) and (width: 100dvw) {
  .sprint-energy-bar {
    max-width: 15dvw;
    max-height: 15dvw;
  }
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

/* 环形进度条 - 提供多级兼容性支持 */
.energy-fill {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  
  /* 低端设备fallback：使用简单的linear-gradient */
  background: linear-gradient(
    45deg,
    #FF9E5D 0%,
    #FF9E5D 25%,
    transparent 25%,
    transparent 100%
  );
  
  /* 现代浏览器：使用conic-gradient */
  background: conic-gradient(
    from 0deg,
    #FF9E5D 0% var(--energy-percentage, 0%),
    transparent var(--energy-percentage, 0%) 100%
  );
  
  transition: all 0.3s ease;
  
  /* 创建环形效果的多种方案 */
  /* 方案1：使用mask（现代浏览器） */
  mask: radial-gradient(circle, transparent 45%, black 46%);
  -webkit-mask: radial-gradient(circle, transparent 45%, black 46%);
  
  /* 方案2：使用伪元素创建内圈（兼容性fallback） */
}

/* 为不支持mask的设备提供伪元素fallback */
.energy-fill::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45%;
  height: 45%;
  background: white;
  border-radius: 50%;
  z-index: 1;
}

/* 当支持mask时隐藏伪元素 */
@supports (mask: radial-gradient(circle, transparent 45%, black 46%)) {
  .energy-fill::before {
    display: none;
  }
}

@supports (-webkit-mask: radial-gradient(circle, transparent 45%, black 46%)) {
  .energy-fill::before {
    display: none;
  }
}

.energy-fill.energy-active {
  background: linear-gradient(
    45deg,
    #FF6B35 0%,
    #FF6B35 25%,
    transparent 25%,
    transparent 100%
  );
  
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
  width: 80%; /* 相对于父容器的百分比 */
  height: 80%;
  border-radius: 50%;
  background: #FFEBCF;
  border: 0px solid #72332E;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #72332E;
  font-size: clamp(10px, 2.5vw, 14px); /* 使用vw作为基础值 */
  font-weight: 700;
  font-family: 'FZLTCH', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-shadow: 
    0 1px 0 rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 0px 0px rgba(0, 0, 0, 0.15),
    inset 0 0px 0 rgba(255, 255, 255, 0.5);
  z-index: 10;
}

/* 如果支持dvw,则使用dvw覆盖clamp中的vw值 */
@supports (width: 100dvw) {
  .energy-percentage {
    font-size: clamp(10px, 2.5dvw, 14px);
  }
}

/* 闪电图标 */
.energy-percentage::before {
  content: '⚡';
  font-size: clamp(20px, 5vw, 32px); /* 使用vw作为基础值 */
  margin-bottom: 2px;
  opacity: 0.9;
}

/* 如果支持dvw,则使用dvw覆盖clamp中的vw值 */
@supports (width: 100dvw) {
  .energy-percentage::before {
    font-size: clamp(20px, 5dvw, 32px);
  }
}

.energy-percentage.no-energy-flash {
  animation: noEnergyFlash 1s ease-in-out infinite;
}

.energy-percentage.no-energy-flash::before {
  content: '⚠️';
  margin-bottom: 8px;
  opacity: 0.9; 
}

/* 添加缺失的动画定义 */
@keyframes energyActivePulse {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.85;
    transform: translate(-50%, -50%) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes sparkle {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  25% {
    opacity: 0.8;
    transform: scale(1.1) rotate(90deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
  75% {
    opacity: 0.8;
    transform: scale(1.1) rotate(270deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(360deg);
  }
}

@keyframes noEnergyFlash {
  0% {
    background: #FFEBCF;
    border-color: #72332E;
  }
  50% {
    background: #FFD6D6;
    border-color: #CC4444;
  }
  100% {
    background: #FFEBCF;
    border-color: #72332E;
  }
}

/* 低端设备兼容性增强 */
@media screen and (max-device-width: 768px) {
  .sprint-energy-bar {
    /* 确保在低端设备上有合理的最小尺寸 */
    min-width: 70px;
    min-height: 70px;
  }
  
  .energy-percentage::before {
    /* 在小屏设备上适当减小图标尺寸 */
    font-size: clamp(18px, 4vw, 28px);
  }
}

/* 为非常老的浏览器提供基础样式 */
@supports not (transform: translate(-50%, -50%)) {
  .energy-percentage {
    /* 使用margin作为fallback */
    position: absolute;
    top: 10%;
    left: 10%;
    width: 80%;
    height: 80%;
    margin: 0;
  }
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

</style>