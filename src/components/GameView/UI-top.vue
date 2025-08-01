<template>
  <div class="ui-top">
    <!-- 生命 -->
    <div class="ui-block">
      <img src="/vector/heart.svg" class="ui-svg heart" alt="生命" />
      <span class="ui-value lives">{{ gameStateStore.lives }}/{{ gameStateStore.maxLives }}</span>
    </div>
    <!-- 星星 -->
    <div class="ui-block">
      <img src="/vector/Star.svg" class="ui-svg star" alt="星星" />
      <span class="ui-value stars">{{ gameStateStore.stars }}</span>
    </div>
    <!-- 距离 -->
    <div class="ui-block">
      <img src="/vector/Distance.svg" class="ui-svg distance" alt="距离" />
      <span class="ui-value distance">{{ Math.floor(gameStateStore.distance) }}m</span>
    </div>
    <!-- 设置 -->
    <div class="ui-block" @click="showSettings">
      <img src="/vector/set.svg" class="ui-svg set" alt="设置" />
    </div>
  </div>
  
  <!-- 设置弹窗等其余内容保持不变 -->
  <div v-if="isSettingsVisible" class="settings-modal" @click="hideSettings">
    <div class="settings-panel" @click.stop>
      <div class="settings-header">
        <div class="settings-title">
          <img src="/vector/set.svg" alt="设置图标" class="title-icon" />
          <span>设置</span>
        </div>
        <button class="close-btn" @click="continueGame">
          <div class="close-x"></div>
        </button>
      </div>
      <div class="button-bg">
        <button class="continue-btn" @click="continueGame">继续游戏</button>
        <button class="leaderboard-btn" @click="showLeaderboard">
          <img src="/vector/gold.svg" alt="排行榜" class="btn-icon" />
          排行榜
        </button>
      </div>
      <div class="control-buttons">
        <button class="control-btn" @click="restartGame">
          <img src="/vector/restart.svg" alt="重新开始" class="control-icon" />
        </button>
        <button class="control-btn" @click="showGameRules">
          <img src="/vector/Question.svg" alt="游戏规则" class="control-icon" />
        </button>
        <button class="control-btn" @click="toggleSound">
          <img :src="isSoundOn ? '/vector/SoundOn.svg' : '/vector/SoundOff.svg'" alt="声音" class="control-icon" />
        </button>
      </div>
    </div>
  </div>
  <Leaderboard 
    :isVisible="isLeaderboardVisible" 
    :initialView="leaderboardInitialView"
    @close="hideLeaderboard" 
  />
</template>

<script>
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useGameStateStore } from '../../stores/gamestore/gameState'
import { useUserStore } from '../../stores/userStore'
import audioManager from '../../utils/audio-manager'
import { clickReport } from '../../utils/report'
import Leaderboard from '../Leaderboard.vue'

export default {
  name: 'UITop',
  components: { Leaderboard },
  setup() {
    const gameStore = useGameStore()
    const gameStateStore = useGameStateStore()
    const userStore = useUserStore()
    const isSettingsVisible = ref(false)
    const isLeaderboardVisible = ref(false)
    const leaderboardInitialView = ref('leaderboard') // 控制Leaderboard显示的视图
    
    // 使用ref来创建响应式的音效状态
    const isSoundOn = ref(audioManager.isSoundOn)
    
    const showSettings = () => {
      // 播放按钮音效
      audioManager.playSoundEffect('button')
      
      isSettingsVisible.value = true
      if (gameStateStore.gameState === 'playing') gameStateStore.togglePause()
    }
    const hideSettings = () => { 
      // 播放按钮音效
      audioManager.playSoundEffect('button')
      
      isSettingsVisible.value = false 
    }
    const continueGame = () => {
      // 播放按钮音效
      audioManager.playSoundEffect('button')
      
      hideSettings()
      if (gameStateStore.gameState === 'paused') gameStateStore.togglePause()
    }
    const showLeaderboard = () => { 
      // 播放按钮音效
      audioManager.playSoundEffect('button')
      
      hideSettings(); 
      leaderboardInitialView.value = 'leaderboard'
      isLeaderboardVisible.value = true 
    }
    const hideLeaderboard = () => { 
      // 播放按钮音效
      audioManager.playSoundEffect('button')
      
      isLeaderboardVisible.value = false
      isSettingsVisible.value = true  // 添加这行，显示设置页面
    }
    const showGameRules = () => { 
      // 播放按钮音效
      audioManager.playSoundEffect('button')
      
      hideSettings(); 
      leaderboardInitialView.value = 'rules'
      isLeaderboardVisible.value = true 
    }
    const goHome = () => { 
      // 播放按钮音效
      audioManager.playSoundEffect('button')
      
      hideSettings(); 
      gameStateStore.backToMenu()  // 使用已有的方法
    }
    const restartGame = async () => {
      // 播放按钮音效
      audioManager.playSoundEffect('button')
      
      hideSettings();
      
      // 检查端内APP用户是否已登录
      if (userStore.isInQQNewsApp && !userStore.hasLogin) {
        console.log('🚫 端内APP用户未登录，无法重新开始游戏');
        
        // 上报点击事件
        clickReport({
          id: 'restart_game_settings_login_required',
        });
        
        return; // 阻止重新开始游戏
      }
      
      console.log('🔄 开始重新开始游戏...')
      
      // 上报重新开始游戏事件
      clickReport({
        id: 'restart_game_settings',
      });
      
      // 重置游戏状态store（主要的游戏状态和数据）
      gameStateStore.restartGame();
      
      // 重置游戏store（游泳游戏相关数据）
      gameStore.resetSwimmingGame();
      
      // 重置其他相关store
      try {
        // 动态导入其他store以避免循环依赖
        const { useGameObjectsStore } = await import('../../stores/gamestore/gameObjects')
        const { usePlayerControlStore } = await import('../../stores/gamestore/playerControl')
        const { useGameLayoutStore } = await import('../../stores/gamestore/gameLayout')
        
        const gameObjectsStore = useGameObjectsStore()
        const playerControlStore = usePlayerControlStore()
        const gameLayoutStore = useGameLayoutStore()
        
        // 重置游戏对象（障碍物、道具、粒子等）
        gameObjectsStore.resetGameObjectState()
        
        // 重置难度系统
        gameObjectsStore.resetDifficultySystem()
        
        // 重置玩家控制状态
        playerControlStore.resetPlayerControl()
        
        // 重置玩家位置
        gameLayoutStore.resetPlayerPosition()
        
        console.log('✅ 所有游戏状态已重置，游戏重新开始')
      } catch (error) {
        console.error('❌ 重置游戏状态时出错:', error)
      }
    };
    const toggleSound = () => {
      // 播放按钮音效（在切换音效状态之前播放）
      audioManager.playSoundEffect('button')
      
      console.log('切换前音效状态:', audioManager.isSoundOn)
      
      // 先预测切换后的状态并立即更新UI
      const willBeOn = !audioManager.isSoundOn
      isSoundOn.value = willBeOn
      
      // 然后执行实际的音频切换
      audioManager.toggleAllSound()
      
      console.log('切换后音效状态:', audioManager.isSoundOn)
      console.log('UI状态:', isSoundOn.value)
      
      // 同步更新游戏状态
      gameStateStore.musicEnabled = audioManager.musicEnabled
      gameStateStore.soundEnabled = audioManager.soundEnabled
    }
    return {
      gameStore,
      gameStateStore,
      isSettingsVisible,
      isLeaderboardVisible,
      leaderboardInitialView,
      isSoundOn,
      showSettings,
      hideSettings,
      continueGame,
      showLeaderboard,
      hideLeaderboard,
      showGameRules,
      goHome,
      restartGame,
      toggleSound
    }
  }
}
</script>

<style scoped>
/* 顶部UI容器 */
.ui-top {
  position: fixed;
  top: 2.57vh;
  left: 0;
  right: 0;
  width: 90vw;
  height: 8vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-sizing: border-box;
  background: transparent;
  pointer-events: none;
  margin: 0 auto;
  padding: 0 5vw;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .ui-top {
    top: 2.57dvh;
    height: 8dvh;
  }
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .ui-top {
    width: 90dvw;
  }
}

/* UI块容器样式 - 确保对齐 */
.ui-block {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  pointer-events: auto;
}

/* UI SVG图标样式 - 统一大小确保对齐 */
.ui-svg {
  width: auto;
  height: 100%;
  max-height: 6vh;
  object-fit: contain;
  display: block;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .ui-svg {
    max-height: 6dvh;
  }
}

/* 特定图标尺寸调整 */
.ui-svg.heart {
  width: 20vw;
  height: 8vh;
}

.ui-svg.distance {
  width: 25vw;
  height: 8vh;
}

.ui-svg.star {
  width: 21.5vw;
  height: 8.6vh;
}

.ui-svg.set {
  width: 8vw;
  height: 8vh;
  cursor: pointer;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .ui-svg.heart {
    height: 8dvh;
  }

  .ui-svg.distance {
    height: 8dvh;
  }

  .ui-svg.star {
    height: 8.6dvh;
  }

  .ui-svg.set {
    height: 8dvh;
  }
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .ui-svg.heart {
    width: 20dvw;
  }

  .ui-svg.distance {
    width: 25dvw;
  }

  .ui-svg.star {
    width: 21.5dvw;
  }

  .ui-svg.set {
    width: 8dvw;
  }
}

/* 动态值样式 - 改为相对定位 */
.ui-value {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -45%);
  color: #72332E;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: 2vh;
  line-height: 0.9;
  text-align: center;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  white-space: nowrap;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .ui-value {
    font-size: 2dvh;
  }
}

.ui-value.lives {
  left: 67%;
}

.ui-value.distance {
  left: 60%;
}

.ui-value.stars {
  left: 64%;
}

/* 暂停覆盖层 */
.pause-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 30;
}

/* 设置模态框 */
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .settings-modal {
    height: 100dvh;
  }
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .settings-modal {
    width: 100dvw;
  }
}

.settings-panel {
  width: 66.4vw;
  background: rgb(255, 235, 210);
  border: 0.533vw solid rgb(114, 51, 46);
  border-radius: 5.33vw;
  padding: 3.2vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1vh;
  pointer-events: auto;
  overflow: hidden;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .settings-panel {
    gap: 1dvh;
  }
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .settings-panel {
    width: 66.4dvw;
  }
}

.settings-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.28vh; /* 10px / 779px * 100 */
  position: relative;
  height: 8.53vw;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .settings-header {
    margin-bottom: 1.28dvh; /* 10px / 779px * 100 */
  }
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .settings-header {
    height: 8.53dvw;
  }
}

.settings-title {
  display: flex;
  align-items: center;
  gap: 2.13vw;
  color: rgb(114, 51, 46);
  font-size: 6.4vw;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  margin-left: -1.07vw;
}

.settings-title .title-icon {
  width: 6.24vw;
  height: 6.24vw;
  object-fit: contain;
}

.close-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8.53vw;
  height: 8.53vw;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 10;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .close-btn {
    width: 8.53dvw;
    height: 8.53dvw;
  }
}

.close-x {
  position: relative;
  width: 6.4vw;
  height: 6.4vw;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .close-x {
    width: 6.4dvw;
    height: 6.4dvw;
  }
}

.close-x::before,
.close-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6.4vw;
  height: 0.8vw;
  background: rgb(114, 51, 46);
  border-radius: 0.4vw;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .close-x::before,
  .close-x::after {
    width: 6.4dvw;
    height: 0.8dvw;
    border-radius: 0.4dvw;
  }
}

.close-x::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.close-x::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.button-bg {
  width: 57.87vw; /* 217px / 375px * 100 */
  height: 19.9vh; /* 155px / 779px * 100 */
  background: #D9B595;
  border-radius: 1.33vw; /* 5px / 375px * 100 */
  box-shadow: inset 0 0.33vh 0.33vh 0 rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.57vh; /* 20px / 779px * 100 */
  align-self: center;
  padding: 2vh 3.8vw; /* 25px / 779px * 100, 4px / 375px * 100 */
  margin: 0 1.07vw;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .button-bg {
    height: 19.9dvh; /* 155px / 779px * 100 */
    box-shadow: inset 0 0.33dvh 0.33dvh 0 rgba(0, 0, 0, 0.25);
    gap: 1.57dvh; /* 20px / 779px * 100 */
    padding: 2dvh 3.8vw; /* 25px / 779px * 100, 4px / 375px * 100 */
  }
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .button-bg {
    width: 57.87dvw; /* 217px / 375px * 100 */
    padding: 2vh 3.8dvw; /* 25px / 779px * 100, 4px / 375px * 100 */
  }
  
  @supports (height: 100dvh) {
    .button-bg {
      padding: 2dvh 3.8dvw; /* 25px / 779px * 100, 4px / 375px * 100 */
    }
  }
}

.continue-btn,
.leaderboard-btn {
  width: calc(100% - 1.07vw);
  height: 7.06vh; /* 55px / 779px * 100 */
  background: rgb(255, 235, 207);
  border: 0.533vw solid rgb(114, 51, 46);
  border-radius: 1.33vw;
  color: rgb(114, 51, 46);
  font-size: 5.33vw;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0px 0.17vh 0.17vh 0px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6vw;
  box-sizing: border-box;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .continue-btn,
  .leaderboard-btn {
    height: 7.06dvh; /* 55px / 779px * 100 */
    box-shadow: 0px 0.17dvh 0.17dvh 0px rgba(0, 0, 0, 0.25);
  }
}

.continue-btn:hover,
.leaderboard-btn:hover {
  opacity: 0.8;
}

.continue-btn:active,
.leaderboard-btn:active {
  transform: scale(0.98);
}

.continue-btn .btn-icon,
.leaderboard-btn .btn-icon {
  width: 4.8vw;
  height: 4.8vw;
  object-fit: contain;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 4vw; /* 15px / 375px * 100 */
  margin-top: auto;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .control-buttons {
    gap: 4dvw; /* 15px / 375px * 100 */
  }
}

.control-btn {
  width: 14.67vw;
  height: 14.67vw;
  background: rgb(255, 235, 207);
  border: 0.53vw solid rgb(114, 51, 46);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 添加这些属性来重置浏览器默认样式 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .control-btn {
    width: 14.67dvw;
    height: 14.67dvw;
    border: 0.53dvw solid rgb(114, 51, 46);
  }
}

.control-btn:active {
  background: rgb(255, 235, 207) !important;
  border: 0.53vw solid rgb(114, 51, 46) !important;
  outline: none;
  box-shadow: none;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .control-btn:active {
    border: 0.53dvw solid rgb(114, 51, 46) !important;
  }
}

.control-icon {
  width: 6.4vw; /* 24px / 375px * 100 */
  height: 6.4vw;
  object-fit: contain;
  object-position: center;
  transform: translate(0, 0);
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .control-icon {
    width: 6.4dvw; /* 24px / 375px * 100 */
    height: 6.4dvw;
  }
}
</style>
