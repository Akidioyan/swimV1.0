<template>
  <div class="intro-scene">
    <div class="intro-content">
      <div class="action-button-container">
        <!-- 开始游戏按钮 -->
        <img 
          src="/media/graphics/games/start.png" 
          alt="开始游戏" 
          @click="handleStartGame" 
          class="start-button-image"
        >
      </div>
    </div>
    
    <!-- 规则按钮容器 -->
    <div class="rule-button-container" @click="handleShowRuleModal">
      <img src="/media/graphics/games/rule.png" alt="游戏规则" class="rule-button-image">
      <!-- 添加占位符图片 -->
      <img src="/media/graphics/games/placeholder.png" alt="排行榜" class="rule-button-image">
    </div>

    <!-- 规则说明浮层 -->
    <Transition name="slide-up">
      <div v-if="isRuleModalVisible" class="transparent-modal-backdrop" @click="handleCloseRuleModal">
        <div class="rule-modal-content" @click.stop>
          <div class="close-modal-button" @click="handleCloseRuleModal">×</div>
          <h2>🏊 游戏规则</h2>
          <div class="rules-text-container">
            <ul class="rules-list">
              <li>点击屏幕或按空格键切换泳道</li>
              <li>避开岩石、海草和水母等障碍物</li>
              <li>收集呼吸管 🤿 提升游泳速度</li>
              <li>收集护盾 🛡️ 获得临时保护</li>
              <li>游泳距离越远，分数越高</li>
              <li>随着游戏进行，难度会逐渐增加</li>
              <li>碰到障碍物游戏结束</li>
              <li>支持键盘快捷键：ESC暂停，R重开，M音乐，S音效</li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const isRuleModalVisible = ref(false)

const handleStartGame = () => {
  gameStore.startGame()
}

const handleShowRuleModal = () => {
  isRuleModalVisible.value = true
}

const handleCloseRuleModal = () => {
  isRuleModalVisible.value = false
}
</script>

<style scoped>
.intro-scene {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background-image: url('/media/graphics/games/intro.png');
  background-size: auto 100%;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  min-height: 100vh;
  background-color: #a4d0f5;
}

.intro-content {
  text-align: center;
  margin-bottom: 5vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-button-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.start-button-image {
  height: 10vh;
  cursor: pointer;
  transition: transform 0.2s ease-out;
  display: block;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.settings-buttons {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  z-index: 10;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
  min-width: 70px;
  opacity: 0.7;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  color: white;
  cursor: pointer;
}

.control-btn.active {
  opacity: 1;
  background: linear-gradient(45deg, #56ab2f, #a8e6cf);
}

.btn-label {
  font-size: 12px;
  font-weight: normal;
}

.rule-button-container {
  position: absolute;
  top: 25%;
  right: 0px;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
  /* 添加容器尺寸 */
  width: 120px;
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: flex-end; /* 改为右对齐，让图片贴右边 */
  justify-content: flex-start;
  /* 添加2%屏幕宽度的间距 */
  gap: 2vw;
}

.rule-button-image {
  display: block;
  transition: transform 0.2s ease-out;
  /* 调整图片高度以适应容器 */
  height: 110px;
  width: auto;
}

.rule-button-image:hover {
  transform: scale(1.05);
}

/* 响应式设计更新 */
@media (max-width: 1024px) {
  .rule-button-container {
    width: 80px;
    height: 160px;
    gap: 1.5vw; /* 在小屏幕上稍微减少间距 */
    align-items: flex-end; /* 保持右对齐 */
  }
  
  .rule-button-image {
    height: 75px;
  }
}

@media (max-width: 768px) {
  .rule-button-container {
    width: 70px;
    height: 140px;
    gap: 1vw; /* 在更小屏幕上进一步减少间距 */
    align-items: flex-end; /* 保持右对齐 */
  }
  
  .rule-button-image {
    height: 65px;
  }
}

@media (max-width: 480px) {
  .rule-button-container {
    width: 60px;
    height: 120px;
    gap: 0.8vw; /* 在最小屏幕上最小间距 */
    align-items: flex-end; /* 保持右对齐 */
  }
  
  .rule-button-image {
    height: 55px;
  }
}

/* 透明背景板，用于点击关闭 */
.transparent-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 999;
}

.rule-modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50vh;
  background-color: #000;
  color: #fff;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border-top: 1px solid #333;
}

.rule-modal-content h2 {
  text-align: center;
  margin-top: 30px;
  margin-bottom: 15px;
  padding: 0 20px;
  font-size: 1.8em;
}

.rules-text-container {
  flex-grow: 1;
  overflow-y: auto;
  font-size: 1em;
  line-height: 1.6;
  padding: 0 20px 20px 20px;
  box-sizing: border-box;
}

.rules-text-container::-webkit-scrollbar {
  width: 6px;
}

.rules-text-container::-webkit-scrollbar-track {
  background: transparent;
}

.rules-text-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.rules-list li {
  margin-bottom: 1em;
  padding-left: 1.5em;
  position: relative;
}

.rules-list li:before {
  content: '•';
  color: #56ab2f;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.close-modal-button {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: normal;
  color: #888;
  cursor: pointer;
  z-index: 1001;
  line-height: 1;
}

.close-modal-button:hover {
  color: #fff;
}

/* 动画应用于透明背景板 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.3s ease-out;
}

.slide-up-enter-active .rule-modal-content,
.slide-up-leave-active .rule-modal-content {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from .rule-modal-content,
.slide-up-leave-to .rule-modal-content {
  transform: translateY(100%);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
}

.slide-up-enter-to .rule-modal-content,
.slide-up-leave-from .rule-modal-content {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .start-button-image {
    height: 8vh;
  }
  
  .rule-button-image {
    height: 12vh;
  }
}

@media (max-width: 768px) {
  .intro-content {
    margin-bottom: 3vh;
  }
  
  .start-button-image {
    height: 7vh;
  }
  
  .rule-button-image {
    height: 10vh;
  }
  
  .settings-buttons {
    top: 15px;
    left: 15px;
    gap: 10px;
  }
  
  .control-btn {
    padding: 10px 12px;
    min-width: 60px;
  }
}

@media (max-width: 480px) {
  .start-button-image {
    height: 6vh;
  }
  
  .rule-button-image {
    height: 8vh;
  }
  
  .rule-modal-content {
    height: 60vh;
  }
  
  .rule-modal-content h2 {
    font-size: 1.5em;
    margin-top: 20px;
  }
  
  .rules-text-container {
    font-size: 0.9em;
  }
}
</style>