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
  <Leaderboard :isVisible="isLeaderboardVisible" @close="hideLeaderboard" />
  <div v-if="isGameRulesVisible" class="game-rules-modal" @click="hideGameRules">
    <div class="game-rules-panel" @click.stop>
      <!-- 标题栏 -->
      <div class="rules-header">
        <div class="rules-title">
          <img src="/vector/gold.svg" alt="奖杯图标" class="title-icon" />
          <span>游戏规则</span>
        </div>
        <button class="close-btn" @click="hideGameRules">
          <div class="close-x"></div>
        </button>
      </div>
      
      <!-- 规则内容区域 -->
      <div class="rules-content-area">
        <div class="rules-scroll-content">
          
          <!-- 游戏目标 -->
          <div class="rule-section">
            <div class="rule-title">🎯 游戏目标</div>
            <p class="rule-description">控制游泳选手在不同泳道间灵活切换，尽可能游得更远，获得更高分数。</p>
          </div>

          <!-- 基本操作 -->
          <div class="rule-section">
            <div class="rule-title">🎮 基本操作</div>
            <div class="operation-list">
              <div class="operation-item">
                <span class="operation-icon">👆</span>
                <span class="operation-text">点击屏幕左右区域切换泳道</span>
              </div>
              <div class="operation-item">
                <span class="operation-icon">⚡</span>
                <span class="operation-text">长按能量条加速冲刺</span>
              </div>
            </div>
          </div>

          <!-- 游戏规则 -->
          <div class="rule-section">
            <div class="rule-title">⚠️ 游戏规则</div>
            <ul class="rule-list">
              <li>每位玩家有3次生命机会</li>
              <li>碰到障碍物将损失一次生命</li>
              <li>失去所有生命后游戏结束</li>
              <li>首次分享游戏可获得额外生命</li>
            </ul>
          </div>

          <!-- 特殊道具 -->
          <div class="rule-section">
            <div class="rule-title">🎁 特殊道具</div>
            <div class="items-list">
              <div class="item">
                <span class="item-icon">🤿</span>
                <span class="item-text">呼吸管：进入无敌状态</span>
              </div>
              <div class="item">
                <span class="item-icon">⭐</span>
                <span class="item-text">星星：唯一加分途径</span>
              </div>
            </div>
          </div>

          <!-- 排行榜规则 -->
          <div class="rule-section">
            <div class="rule-title">🏆 排行榜规则</div>
            <p class="rule-description">根据星星总数排名，星星相同时按游泳距离排序。</p>
          </div>
          
        </div>
      </div>
    </div>
  </div>
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
    const restartGame = async () => {
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
  top: 50%; /* 统一为50%垂直居中 */
  transform: translateY(-50%); /* 添加垂直居中变换 */
  width: 8.53dvw; /* 32px / 375px * 100 */
  height: 8.53dvw;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; /* 统一添加事件处理 */
  z-index: 10; /* 统一添加层级 */
}

.close-x {
  position: relative;
  width: 6.4dvw; /* 统一为6.4dvw */
  height: 6.4dvw;
}

.close-x::before,
.close-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6.4dvw; /* 统一为6.4dvw */
  height: 0.8dvw; /* 统一为0.8dvw */
  background: rgb(114, 51, 46);
  border-radius: 0.4dvw; /* 统一为0.4dvw */
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
  width: 14.67dvw;
  height: 14.67dvw;
  background: rgb(255, 235, 207);
  border: 0.53dvw solid rgb(114, 51, 46);
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

.control-btn:active {
  background: rgb(255, 235, 207) !important;
  border: 0.53dvw solid rgb(114, 51, 46) !important;
  outline: none;
  box-shadow: none;
}

.control-icon {
  width: 6.4dvw; /* 24px / 375px * 100 */
  height: 6.4dvw;
  object-fit: contain;
  object-position: center;
  transform: translate(0, 0);
}

/* 游戏规则弹窗 - 基于Figma设计稿 */
.game-rules-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 3000; /* 提高z-index确保在最上层 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5dvw;
}

.game-rules-panel {
  width: 88.21vw; /* 330.8px / 375px * 100 */
  height: 76.26vh; /* 594.06px / 779px * 100 */
  background: rgb(255, 235, 210); /* 基于设计稿 */
  border: 0.53vw solid rgb(114, 51, 46); /* 2px / 375px * 100 */
  border-radius: 5.33vw; /* 20px / 375px * 100 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 5dvw 16dvw rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  pointer-events: auto; /* 确保面板可以接收事件 */
}

@keyframes modalSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 标题栏 */
.rules-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: -2.13dvw; /* -8px / 375px * 100 */
  position: relative;
  height: 15dvw;
  padding: 0 4dvw; /* 15px / 375px * 100 */
  border-bottom: 0.17dvh solid rgb(182, 157, 134);
  background: rgb(255, 235, 210);
}

.rules-title {
  display: flex;
  align-items: center;
  gap: 2.13dvw;
  color: rgb(114, 51, 46);
  font-size: 5.33vw; /* 20px / 375px * 100 */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 700;
  margin-left: -1.07dvw; /* -4px / 375px * 100 */
}

.title-icon {
  width: 6.24vw; /* 23.43px / 375px * 100 */
  height: 6.24vw;
  object-fit: contain;
}

/* 关闭按钮 */
.rules-header .close-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8.53dvw;
  height: 8.53dvw;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; /* 确保按钮可以接收点击事件 */
  z-index: 10; /* 确保按钮在上层 */
}

.rules-header .close-x {
  position: relative;
  width: 6.4dvw; /* 统一为6.4dvw */
  height: 6.4dvw;
}

.rules-header .close-x::before,
.rules-header .close-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6.4dvw; /* 统一为6.4dvw */
  height: 0.8dvw; /* 统一为0.8dvw */
  background: rgb(114, 51, 46);
  border-radius: 0.4dvw; /* 统一为0.4dvw */
}

.rules-header .close-x::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.rules-header .close-x::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

/* 内容区域 */
.rules-content-area {
  flex: 1;
  background: rgb(217, 181, 149); /* 基于设计稿 */
  border-radius: 2.67vw; /* 10px / 375px * 100 */
  margin: 2.13vw 3.73vw; /* 8px 14px */
  overflow: hidden;
}

.rules-scroll-content {
  padding: 4dvw;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  /* 添加移动端触摸滚动支持 */
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.rules-scroll-content::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Webkit */
}

/* 规则章节 */
.rule-section {
  margin-bottom: 4dvw;
}

.rule-section:last-child {
  margin-bottom: 2dvw;
}

.rule-title {
  font-size: 3.73vw; /* 14px / 375px * 100 */
  font-weight: 700;
  color: rgb(114, 51, 46);
  margin-bottom: 2.13dvw;
  display: flex;
  align-items: center;
  gap: 1.6dvw;
}

.rule-description {
  font-size: 3.2vw; /* 12px / 375px * 100 */
  color: rgb(114, 51, 46);
  line-height: 1.5;
  margin: 0;
  margin-top: 1.33vw;
}

/* 规则列表 */
.rule-list {
  list-style: none;
  padding: 0;
  margin: 1.33vw 0 0 0;
}

.rule-list li {
  padding: 1.07dvw 0;
  padding-left: 4.27dvw;
  position: relative;
  font-size: 3.2vw;
  color: rgb(114, 51, 46);
  line-height: 1.4;
}

.rule-list li::before {
  content: '•';
  color: rgb(114, 51, 46);
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 1.07dvw;
}

/* 操作和道具列表 */
.operation-list,
.items-list {
  display: flex;
  flex-direction: column;
  gap: 1.6dvw;
  margin-top: 1.33vw;
}

.operation-item,
.item {
  display: flex;
  align-items: center;
  gap: 2.13dvw;
  padding: 1.6dvw 2.67vw;
  background: rgba(255, 235, 207, 0.8);
  border: 0.27vw solid rgba(114, 51, 46, 0.2);
  border-radius: 1.6dvw;
  font-size: 3.2vw;
}

.operation-icon,
.item-icon {
  font-size: 3.73vw;
  flex-shrink: 0;
}

.operation-text,
.item-text {
  font-size: 3.2vw;
  color: rgb(114, 51, 46);
  line-height: 1.3;
}
</style>
