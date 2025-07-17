<template>
  <div class="intro-scene">
    <!-- 背景图片 -->
    <div class="background-image">
      <img src="/intro.png" alt="背景图片" class="bg-img" />
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 右侧垂直按钮组 -->
      <div class="side-buttons">
        <button class="side-button" @click="handleShowRuleModal">
          <span class="side-button-text">游戏规则</span>
        </button>
        <button class="side-button" @click="handleShowRanking">
          <span class="side-button-text">排行榜</span>
        </button>
      </div>

      <!-- 主挑战按钮 -->
      <div class="challenge-section">
        <button class="challenge-button" @click="handleStartGame">
          <span class="challenge-text">立即挑战</span>
          <p class="participant-count">—— 已有481,151人参与过挑战 ——</p>
        </button>
      </div>

      <!-- 底部登录区域 -->
      <div class="login-section">
        <div class="login-prompt">
          <span class="login-text">登录后可获得更好的使用体验</span>
          <button class="login-button" @click="handleLogin">
            立即登录
          </button>
        </div>
      </div>
    </div>

    <!-- 规则说明浮层 -->
    <Transition name="slide-up">
      <div v-if="isRuleModalVisible" class="modal-backdrop" @click="handleCloseRuleModal">
        <div class="rule-modal-content" @click.stop>
          <div class="modal-header">
            <h2>游戏规则说明</h2>
            <button class="close-button" @click="handleCloseRuleModal">×</button>
          </div>
          
          <div class="rules-content">
            <div class="rule-section">
              <div class="rule-title">🎯 游戏目标</div>
              <p>控制游泳选手在不同泳道间灵活切换，尽可能游得更远，获得更高分数。</p>
            </div>

            <div class="rule-section">
              <div class="rule-title">🎮 基本操作</div>
              <div class="operation-list">
                <div class="operation-item">
                  <span class="operation-icon">👆</span>
                  <span>点击屏幕左右区域切换泳道</span>
                </div>
                <div class="operation-item">
                  <span class="operation-icon">⚡</span>
                  <span>长按能量条加速冲刺</span>
                </div>
              </div>
            </div>

            <div class="rule-section">
              <div class="rule-title">⚠️ 游戏规则</div>
              <ul class="rule-list">
                <li>每位玩家有3次生命机会</li>
                <li>碰到障碍物将损失一次生命</li>
                <li>失去所有生命后游戏结束</li>
                <li>首次分享游戏可获得额外生命</li>
              </ul>
            </div>

            <div class="rule-section">
              <div class="rule-title">🎁 特殊道具</div>
              <div class="items-list">
                <div class="item">
                  <span class="item-icon">🤿</span>
                  <span>呼吸管：进入无敌状态</span>
                </div>
                <div class="item">
                  <span class="item-icon">⭐</span>
                  <span>星星：唯一加分途径</span>
                </div>
              </div>
            </div>

            <div class="rule-section">
              <div class="rule-title">🏆 排行榜规则</div>
              <p>根据星星总数排名，星星相同时按游泳距离排序。</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useGameStateStore } from '../stores/gamestore/gameState'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const isRuleModalVisible = ref(false)

const handleStartGame = () => {
  gameStateStore.startGame()
}

const handleShowRuleModal = () => {
  isRuleModalVisible.value = true
}

const handleCloseRuleModal = () => {
  isRuleModalVisible.value = false
}

const handleShowRanking = () => {
  // TODO: 实现排行榜功能
  console.log('显示排行榜')
}

const handleLogin = () => {
  // TODO: 实现登录功能
  console.log('立即登录')
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

.intro-scene {
  width: 100%;
  height: 100vh;
  position: relative;
  background: linear-gradient(180deg, #A4D0F5 0%, #7BB3E0 50%, #5A9BD4 100%);
  font-family: 'FZLTCH', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* 背景图片 */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 主要内容 */
.main-content {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}

/* 右侧垂直按钮组 */
.side-buttons {
  position: absolute;
  right: 0; 
  top: 14.8dvh; 
  display: flex;
  flex-direction: column;
  gap: 3.3dvh; 
  z-index: 10;
}

.side-button {
  width: 13.9dvw; /* 52/375*100 */
  height: 14.5dvh; /* 根据设计稿高度调整 */
  background: #FDDE38;
  border: none;
  border-radius: 2.7dvw 0 0 2.7dvw; /* 只有左侧有圆角，右侧贴边无圆角 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0.5dvw 2dvw rgba(0, 0, 0, 0.1);
}

.side-button:hover {
  opacity: 0.8;
  transform: scale(1.02);
}

.side-button:active {
  transform: scale(0.95);
}

.side-button-text {
  color: white;
  font-size: 5.3dvw; /* 20/375*100 */
  font-weight: 600;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0px;
  line-height: 7.5dvw; /* 28/375*100 */
}

/* 主挑战按钮区域 */
.challenge-section {
  position: absolute;
  left: 17.1dvw; /* (879-815)/375*100 */
  top: 66.6dvh; /* (2943-2424)/779*100 */
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.challenge-button {
  width: 65.9dvw; /* 247/375*100 */
  height: 12.2dvh; /* 95/779*100 */
  background: #0D71ED;
  border: none;
  border-radius: 2.7dvw; /* 10/375*100 */
  display: flex;
  flex-direction: column; /* 垂直排列内部元素 */
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1dvw 3dvw rgba(13, 113, 237, 0.3);
}

.challenge-button:hover {
  transform: translateY(-0.5dvw);
  box-shadow: 0 1.5dvw 4dvw rgba(13, 113, 237, 0.4);
}

.challenge-button:active {
  transform: translateY(0);
}

.challenge-text {
  color: white;
  font-size: 12dvw; /* 45/375*100 */
  font-weight: 600;
  line-height: 16.8dvw; /* 63/375*100 */
  margin: 0; /* 移除默认margin */
}

.participant-count {
  color: white;
  font-size: 3.2dvw; /* 12/375*100 */
  font-weight: 400;
  line-height: 4.5dvw; /* 16.8/375*100 */
  margin: 0;
  text-align: center;
  width: 60.3dvw; /* 226/375*100 */
}

/* 底部登录区域 */
.login-section {
  position: absolute;
  left: 8.8dvw; /* (848-815)/375*100 */
  top: 84.5dvh; /* (3082-2424)/779*100 */
  z-index: 10;
}

.login-prompt {
  width: 82.4dvw; /* 309/375*100 */
  height: 5.3dvh; /* 41/779*100 */
  background: #2B2B2B;
  border: 0.27dvw solid white; /* 1/375*100 */
  border-radius: 5.3dvw; /* 20/375*100 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5.1dvw; /* 19/375*100 */
  position: relative;
}

.login-text {
  color: white;
  font-size: 3.5dvw; /* 13/375*100 */
  font-weight: 400;
  line-height: 4.9dvw; /* 18.2/375*100 */
}

.login-button {
  width: 28.5dvw; /* 107/375*100 */
  height: 4.2dvh; /* 33/779*100 */
  background: #0D71ED;
  border: none;
  border-radius: 5.3dvw; /* 20/375*100 */
  color: white;
  font-size: 3.5dvw; /* 13/375*100 */
  font-weight: 400;
  line-height: 4.9dvw; /* 18.2/375*100 */
  cursor: pointer;
  transition: all 0.2s ease;
  position: absolute;
  right: 1.1dvw; /* 4/375*100 */
}

.login-button:hover {
  background: #0A5BC4;
}

.login-button:active {
  transform: scale(0.95);
}

/* 模态框样式 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5dvw;
}

.rule-modal-content {
  background: white;
  border-radius: 5dvw;
  width: 100%;
  max-width: 133dvw;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 5dvw 16dvw rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #FF9E5D, #FF6B35);
  color: white;
  padding: 5.3dvw;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 4dvw;
  font-weight: 700;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 4dvw;
  width: 9.3dvw;
  height: 9.3dvw;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.rules-content {
  padding: 5.3dvw;
  overflow-y: auto;
  flex: 1;
}

.rule-section {
  margin-bottom: 5.3dvw;
}

.rule-title {
  font-size: 3.2dvw;
  font-weight: 700;
  color: #72332E;
  margin-bottom: 2.7dvw;
  display: flex;
  align-items: center;
  gap: 2.1dvw;
}

.rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rule-list li {
  padding: 1.3dvw 0;
  padding-left: 5.3dvw;
  position: relative;
  font-size: 2.7dvw;
}

.rule-list li::before {
  content: '•';
  color: #FF9E5D;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.operation-list,
.items-list {
  display: flex;
  flex-direction: column;
  gap: 2.1dvw;
}

.operation-item,
.item {
  display: flex;
  align-items: center;
  gap: 2.7dvw;
  padding: 2.1dvw 3.2dvw;
  background: rgba(255, 158, 93, 0.1);
  border-radius: 2.1dvw;
  font-size: 2.7dvw;
}

.operation-icon,
.item-icon {
  font-size: 3.2dvw;
}

/* 过渡动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>