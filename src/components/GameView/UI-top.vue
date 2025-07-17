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
          <img :src="isSoundOn ? '/vector/Sound-on.svg' : '/vector/Sound-off.svg'" alt="声音" class="control-icon" />
        </button>
      </div>
    </div>
  </div>
  <Leaderboard :isVisible="isLeaderboardVisible" @close="hideLeaderboard" />
  <div v-if="isGameRulesVisible" class="game-rules-modal" @click="hideGameRules">
    <div class="game-rules-panel" @click.stop>
      <div class="rules-header">
        <div class="rules-title">
          <img src="/vector/hint.svg" alt="规则图标" class="title-icon" />
          <span>游戏规则</span>
        </div>
        <button class="close-btn" @click="hideGameRules">
          <div class="close-x"></div>
        </button>
      </div>
      <div class="rules-content">
        <div class="rules-text">
          <h3>🏊 基本操作</h3>
          <p>• 点击屏幕左右区域在四条泳道之间切换</p>
          <p>• 长按屏幕可以加速冲刺</p>
          <h3>🎯 游戏目标</h3>
          <p>• 避开障碍物（石头、螃蟹、食人花）</p>
          <p>• 收集星星获得分数</p>
          <p>• 游泳距离越远分数越高</p>
          <h3>💫 特殊道具</h3>
          <p>• 呼吸管（🤿）：进入水底无敌状态</p>
          <h3>❤️ 生命系统</h3>
          <p>• 每位玩家有3次生命机会</p>
          <p>• 首次分享游戏可额外获得一次生命</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useGameStateStore } from '../../stores/gamestore/gameState'
import audioManager from '../../utils/audio-manager'
import Leaderboard from '../Leaderboard.vue'

export default {
  name: 'UITop',
  components: { Leaderboard },
  setup() {
    const gameStore = useGameStore()
    const gameStateStore = useGameStateStore()
    const isSettingsVisible = ref(false)
    const isLeaderboardVisible = ref(false)
    const isGameRulesVisible = ref(false)
    
    // 使用ref来创建响应式的音效状态
    const isSoundOn = ref(audioManager.isSoundOn)
    
    const showSettings = () => {
      isSettingsVisible.value = true
      if (gameStateStore.gameState === 'playing') gameStateStore.togglePause()
    }
    const hideSettings = () => { isSettingsVisible.value = false }
    const continueGame = () => {
      hideSettings()
      if (gameStateStore.gameState === 'paused') gameStateStore.togglePause()
    }
    const showLeaderboard = () => { hideSettings(); isLeaderboardVisible.value = true }
    const hideLeaderboard = () => { 
      isLeaderboardVisible.value = false
      isSettingsVisible.value = true  // 添加这行，显示设置页面
    }
    const showGameRules = () => { hideSettings(); isGameRulesVisible.value = true }
    const hideGameRules = () => { 
      isGameRulesVisible.value = false
      isSettingsVisible.value = true  // 添加这行，显示设置页面
    }
    const goHome = () => { 
      hideSettings(); 
      gameStateStore.backToMenu()  // 使用已有的方法
    }
    const restartGame = () => {
      hideSettings();
      
      // 首先重置游戏商店状态（障碍物、道具等）
      gameStore.resetGameState();
      
      // 然后调用游戏状态重新开始
      gameStateStore.restartGame();
    };
    const toggleSound = () => {
      console.log('切换前音效状态:', audioManager.isSoundOn)
      audioManager.toggleAllSound()
      
      // 手动更新响应式状态
      isSoundOn.value = audioManager.isSoundOn
      
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
      isGameRulesVisible,
      isSoundOn,
      showSettings,
      hideSettings,
      continueGame,
      showLeaderboard,
      hideLeaderboard,
      showGameRules,
      hideGameRules,
      goHome,
      restartGame,
      toggleSound
    }
  }
}
</script>

<style scoped>
.ui-top {
  position: fixed;
  top: 2.57dvh;
  left: 0;
  right: 0;
  width: 90dvw;
  height: 8dvw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-sizing: border-box;
  padding: 0; /* 减少padding */
  background: transparent;
  pointer-events: none;
  margin: 0 auto;
  padding: 0;
  border: 0;
  vertical-align: top;
}

.ui-block {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}
.ui-svg {
  object-fit: contain;
  object-position: center;
}
/* 重新分配宽度，总计约80dvw，确保能完整显示，统一高度 */
.ui-svg.heart { 
  width: 20dvw; 
  height: 8dvw; 
}
.ui-svg.distance { 
  width: 25dvw; 
  height: 8dvw; 
}
.ui-svg.star { 
  width: 21.5dvw; 
  height: 8.6dvw;
}
.ui-svg.set { 
  width: 8dvw; 
  height: 8dvw; 
}



.ui-value {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -45%);
  color: #72332E;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: 2dvh;
  line-height: 0.9;
  text-align: center;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
}

/* 为不同的ui-value设置不同的水平位置，确保在对应svg内 */
.ui-value.lives {
  left: 67%; /* 针对heart svg调整 */
}

.ui-value.distance {
  left: 60%; /* 针对distance svg调整 */
}

.ui-value.stars {
  left: 64%; /* 针对star svg调整 */
}

/* 设置弹窗样式 - 使用动态视口单位 */
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.settings-panel {
  width: 66.4dvw; /* 249px / 375px * 100 */
  background: #FFEBD2;
  border: 0.53dvw solid rgb(114, 51, 46); /* 2px / 375px * 100 */
  border-radius: 5.33dvw; /* 20px / 375px * 100 */
  padding: 3.2dvw; /* 12px / 375px * 100 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1dvh; 
  pointer-events: auto;
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.28dvh; /* 10px / 779px * 100 */
  position: relative;
  height: 8.53dvw; /* 与close-btn保持一致的高度 */
}

.settings-title {
  display: flex;
  align-items: center;
  gap: 2.13dvw; /* 8px / 375px * 100 */
  color: rgb(114, 51, 46);
  font-size: 6.4dvw; /* 24px / 375px * 100 */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 800;
  margin-left: -1.07dvw; /* -4px / 375px * 100 */
}

.title-icon {
  width: 6.4dvw; /* 24px / 375px * 100 */
  height: 6.4dvw;
}

.close-btn {
  position: absolute;
  right: 0;
  top: 0;
  width: 8.53dvw; /* 32px / 375px * 100 */
  height: 8.53dvw;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-x {
  position: relative;
  width: 6.4dvw; /* 24px / 375px * 100 */
  height: 6.4dvw;
}

.close-x::before,
.close-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6.4dvw;
  height: 0.8dvw; /* 3px / 375px * 100 */
  background: rgb(114, 51, 46);
  border-radius: 0.4dvw;
}

.close-x::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.close-x::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.button-bg {
  width: 57.87dvw; /* 217px / 375px * 100 */
  height: 19.9dvh; /* 155px / 779px * 100 */
  background: #D9B595;
  border-radius: 1.33dvw; /* 5px / 375px * 100 */
  box-shadow: inset 0 0.33dvh 0.33dvh 0 rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.57dvh; /* 20px / 779px * 100 */
  align-self: center;
  padding: 2dvh 3.8dvw; /* 25px / 779px * 100, 4px / 375px * 100 */
  margin: 0 1.07dvw;
}

.continue-btn,
.leaderboard-btn {
  width: calc(100% - 1.07dvw);
  height: 7.06dvh; /* 55px / 779px * 100 */
  background: rgb(255, 235, 207);
  border: 0.53dvw solid rgb(114, 51, 46); /* 2px / 375px * 100 */
  border-radius: 1.33dvw; /* 5px / 375px * 100 */
  color: rgb(114, 51, 46);
  font-size: 5.33dvw; /* 20px / 375px * 100 */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0px 0.17dvh 0.17dvh 0px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6dvw; /* 6px / 375px * 100 */
  box-sizing: border-box;
}

.continue-btn:hover,
.leaderboard-btn:hover {
  opacity: 0.8;
}

.continue-btn:active,
.leaderboard-btn:active {
  transform: scale(0.95);
}

.btn-icon {
  width: 4.53dvw; /* 17px / 375px * 100 */
  height: 4.53dvw;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 4dvw; /* 15px / 375px * 100 */
  margin-top: auto;
}

.control-btn {
  width: 14.67dvw; /* 55px / 375px * 100 */
  height: 14.67dvw;
  background: rgb(255, 235, 207);
  border: 0.53dvw solid rgb(114, 51, 46); /* 2px / 375px * 100 */
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:active {
  transform: scale(0.95);
  background: rgb(255, 235, 207);
}

.control-icon {
  width: 6.4dvw; /* 24px / 375px * 100 */
  height: 6.4dvw;
  object-fit: contain;
  object-position: center;
  transform: translate(0, 0);
}

/* 游戏规则弹窗 */
.game-rules-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.game-rules-panel {
  width: 80dvw;
  max-height: 70dvh;
  background: rgb(255, 235, 210);
  border: 0.53dvw solid rgb(114, 51, 46); /* 2px / 375px * 100 */
  border-radius: 5.33dvw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
}

.rules-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: -2.13dvw; /* -8px / 375px * 100 */
  position: relative;
  height: 15dvw;
  padding: 0 4dvw; /* 15px / 375px * 100 */
  border-bottom: 0.17dvh solid rgb(182, 157, 134);
}

.rules-title {
  display: flex;
  align-items: center;
  gap: 2.13dvw;
  color: rgb(114, 51, 46);
  font-size: 6.4dvw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 800;
  margin-left: -1.07dvw; /* -4px / 375px * 100 */
}

/* 游戏规则面板的X图标 */
.rules-header .close-x {
  position: relative;
  width: 6.4dvw;
  height: 6.4dvw;
}

.rules-header .close-x::before,
.rules-header .close-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6.4dvw;
  height: 0.8dvw;
  background: rgb(114, 51, 46);
  border-radius: 0.4dvw;
}

.rules-header .close-x::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.rules-header .close-x::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.rules-content {
  flex: 1;
  overflow-y: auto;
  padding: 3.2dvw;
}

.rules-text h3 {
  color: rgb(114, 51, 46);
  font-size: 4.8dvw; /* 18px / 375px * 100 */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  margin: 3.21dvh 0 1.67dvh; /* 25px 0 13px / 779px * 100 */
}

.rules-text p {
  color: rgb(114, 51, 46);
  font-size: 4dvw; /* 15px / 375px * 100 */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.5;
  margin: 0.64dvh 0; /* 5px 0 / 779px * 100 */
}
</style>
