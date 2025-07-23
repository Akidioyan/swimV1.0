<template>
  <div class="intro-scene">
    <!-- 设备检测弹窗 -->
    <div v-if="showDeviceModal" class="device-detection-modal" @click="handleDeviceModalBackdrop">
      <div class="modal-container" @click.stop>
        <!-- 主要弹窗内容 -->
        <div class="modal-content">
          <!-- 顶部提示头部 -->
          <div class="modal-header">
            <div class="header-banner">
              <span class="header-text">温馨提示</span>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="modal-body">
            <div class="warning-text">
              检测到当前设备不符合游戏要求，<br>
              请切换到竖屏模式或更换设备。
            </div>
            <div class="suggestion-text">
              腾讯体育游泳世锦赛专题有更多精彩内容：
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button class="action-button" @click="handleDeviceModalAction">
              <span class="button-text">进入体育频道 世锦赛专题</span>
              <img 
                src="/assets/device-detection-modal/Rectangle 14-x1.svg" 
                alt="箭头" 
                class="button-icon"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

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
          <p class="participant-count" v-if="!gameStore.activityData.isLoading">
            {{ gameStore.participantText }}
          </p>
          <p class="participant-count loading" v-else>
            —— 正在获取参与人数... ——
          </p>
        </button>
      </div>

    </div>

    <!-- 登录提示区域：APP内未登录时显示 -->
    <div v-if="shouldShowLoginPrompt" class="login-prompt-container" @click="handleLogin">
      <img src="/login.png" alt="点击登录" class="login-prompt-image">
    </div>

    <!-- 打开APP提示：APP外时显示 -->
    <div v-if="!userStore.isInQQNewsApp" class="open-app-prompt-container" @click="handleOpenApp">
      <img src="/openAppAtIntro.png" alt="点击打开APP" class="open-app-prompt-image">
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
import { ref, onMounted, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { useUserStore } from '../stores/userStore'
import { login } from '@tencent/qqnews-jsapi'
import { openNativeScheme } from '../utils/appDownload'
import { clickReport } from '../utils/report'
import { 
  checkDeviceCompatibility, 
  registerDeviceDetectionCallbacks,
  initDeviceDetectionListener 
} from '../utils/deviceDetection'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const userStore = useUserStore()
const isRuleModalVisible = ref(false)

// 设备检测弹窗状态
const showDeviceModal = ref(false)

// 登录提示显示条件：在QQ新闻App内且未登录
const shouldShowLoginPrompt = computed(() => {
  return userStore.isInQQNewsApp && !userStore.hasLogin;
});

// 组件挂载时获取参与人数数据并初始化设备检测
onMounted(async () => {
  console.log('🎮 IntroView 组件挂载，开始获取参与人数数据...')
  
  // 注册设备检测回调
  registerDeviceDetectionCallbacks({
    onShowModal: () => {
      showDeviceModal.value = true
    },
    onHideModal: () => {
      showDeviceModal.value = false
    },
    onAction: () => {
      handleDeviceModalAction()
    }
  })
  
  // 初始化设备检测监听
  initDeviceDetectionListener()
  
  // 检查设备兼容性
  checkDeviceCompatibility()
  
  try {
    await gameStore.fetchActivityPV()
    console.log('✅ 参与人数数据获取成功:', gameStore.formattedParticipants)
  } catch (error) {
    console.error('❌ 参与人数数据获取失败:', error)
  }
})

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

const handleLogin = async () => {
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    try {
      console.log('[IntroView] Attempting to invoke login...');
      clickReport({
        id: 'login',
      })
      // 根据参考文件，login() 可能返回一个promise
      await login(); // 假设login自身处理UI并在尝试后解析
      console.log('[IntroView] Login process initiated by JSAPI, reloading page.');
      location.reload();
    } catch (error) {
      console.error('[IntroView] Failed to invoke login or login was cancelled:', error);
      // 可选择性地向用户显示登录失败的消息
    }
  }
}

const handleOpenApp = () => {
  clickReport({
    id: 'open_app', // 使用更具体的ID来标识此操作
  });
  openNativeScheme('qqnews://article_9527?nm=LNK2025052211684300', 'swim');
}

// 设备检测弹窗事件处理
const handleDeviceModalBackdrop = () => {
  // 由于设备不兼容，通常不允许关闭
  console.log('用户尝试关闭设备检测弹窗')
}

const handleDeviceModalAction = () => {
  // 处理用户点击"进入体育频道"按钮
  try {
    // 跳转到腾讯体育世锦赛专题页面
    window.open('https://sports.qq.com/swim2024/', '_blank')
  } catch (error) {
    console.error('跳转失败:', error)
    // 降级方案
    window.open('https://sports.qq.com/', '_blank')
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

.intro-scene {
  width: 100%;
  height: 100dvh;
  position: relative;
  background: linear-gradient(180deg, #A4D0F5 0%, #7BB3E0 50%, #5A9BD4 100%);
  font-family: 'FZLTCH', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* === 设备检测弹窗样式保持不变 === */
.device-detection-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.modal-container {
  width: min(336px, 90vw);
  height: auto;
  min-height: 226px;
  position: relative;
}

.modal-content {
  width: 100%;
  height: 100%;
  background: rgb(32, 32, 32);
  border: 2px solid rgb(13, 113, 237);
  border-radius: 11px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 顶部横幅 - 改为倒梯形并居中 */
.modal-header {
  position: relative;
  height: 25.83px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.header-banner {
  width: 229.5px;
  height: 25.83px;
  background: rgb(11, 106, 234);
  display: flex;
  align-items: center;
  justify-content: center;
  /* 倒梯形：上边较宽，下边较窄 */
  clip-path: polygon(
    0% 0%, 
    100% 0%, 
    calc(90% + 8px) calc(100% - 8px),
    90% 100%, 
    10% 100%, 
    calc(10% - 8px) calc(100% - 8px)
  );
}

.header-text {
  color: rgb(255, 255, 255);
  font-family: "PingFang SC", "PingFang-SC-Regular", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 12px;
  text-align: center;
}

/* 内容区域 */
.modal-body {
  flex: 1;
  padding: 24px 21px 16px 21px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.warning-text {
  color: rgb(231, 231, 231);
  font-family: "PingFang SC", "PingFangSC-Semibold", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 28px;
  text-align: center;
}

/* suggestion-text字体减一号：从14px改为13px */
.suggestion-text {
  color: rgb(218, 218, 218);
  font-family: "PingFang SC", "PingFang-SC-Regular", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 19px;
  text-align: center;
}

/* 底部按钮 */
.modal-footer {
  padding: 0 21px 20px 21px;
}

.action-button {
  width: 100%;
  height: 49.5px;
  background: transparent;
  border: 1.5px solid rgb(11, 106, 234);
  border-radius: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.action-button:hover {
  background: rgba(11, 106, 234, 0.1);
  transform: scale(1.02);
}

.action-button:active {
  transform: scale(0.98);
}

.button-text {
  color: rgb(11, 106, 234);
  font-family: "PingFang SC", "PingFangSC-Semibold", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 25px;
  text-align: center;
}

.button-icon {
  width: 12.36px;
  height: 12px;
  transition: transform 0.2s ease;
}

/* 设备检测弹窗响应式设计 */
@media (max-width: 480px) {
  .modal-container {
    width: 90%;
    max-width: 336px;
    margin: 0 20px;
  }

  .modal-content {
    height: auto;
    min-height: 226px;
  }

  .warning-text {
    font-size: 14px;
    line-height: 24px;
  }

  .suggestion-text {
    font-size: 11px;
    line-height: 17px;
  }

  .button-text {
    font-size: 14px;
  }
}

/* 设备检测弹窗辅助功能支持 */
.action-button:focus {
  outline: 2px solid rgb(11, 106, 234);
  outline-offset: 2px;
}

.action-button:hover .button-icon {
  transform: translateX(2px);
  transition: transform 0.2s ease;
}

/* === 主要内容布局 - 基于Figma精确位置 === */

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

/* 右侧垂直按钮组 - 基于Figma位置数据 */
.side-buttons {
  position: absolute;
  right: 0;
  top: 14.7dvh; /* 游戏规则按钮开始位置: (3247-3132)/779*100 */
  display: flex;
  flex-direction: column;
  gap: 3.8dvh; /* 两个按钮之间的间距: (3377-3247-116)/779*100 */
  z-index: 10;
}

.side-button {
  width: 13.9dvw; /* 52/375*100 - 基于设计稿宽度 */
  height: 14.9dvh; /* 116/779*100 - 基于设计稿高度 */
  background: #FDDE38; /* 基于设计稿颜色 rgb(253, 222, 56) */
  border: none;
  border-radius: 2.7dvw 0 0 2.7dvw; /* 10px圆角，右侧贴边 */
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
  font-size: 5.3dvw; /* 20px/375*100 - 基于设计稿字体大小 */
  font-weight: 600;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0px;
  line-height: 7.2dvw; /* 28px/375*100 - 基于设计稿行高 */
}

/* 主挑战按钮区域 - 基于Figma精确位置 */
.challenge-section {
  position: absolute;
  left: 50%;
  top: 65.8dvh; /* (3651-3132)/779*100 - 基于设计稿Y位置 */
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.challenge-button {
  width: 65.9dvw; /* 247/375*100 - 基于设计稿宽度 */
  height: 12.2dvh; /* 95/779*100 - 基于设计稿高度 */
  background: #0D71ED; /* 基于设计稿颜色 rgb(13, 113, 237) */
  border: none;
  border-radius: 2.7dvw; /* 10px/375*100 - 基于设计稿圆角 */
  display: flex;
  flex-direction: column;
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
  font-size: 12dvw; /* 45px/375*100 - 基于设计稿字体大小 */
  font-weight: 600;
  line-height: 16.8dvw; /* 63px/375*100 - 基于设计稿行高 */
  margin: 0;
}

.participant-count {
  color: white;
  font-size: 3.2dvw; /* 12px/375*100 - 基于设计稿字体大小 */
  font-weight: 400;
  line-height: 4.5dvw; /* 16.8px/375*100 - 基于设计稿行高 */
  margin: 0;
  text-align: center;
  width: 60.3dvw; /* 226px/375*100 - 基于设计稿宽度 */
  transition: opacity 0.3s ease;
}

.participant-count.loading {
  opacity: 0.7;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* 模态框样式 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
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
  max-height: 85dvh;
  overflow: hidden;
  box-shadow: 0 5dvw 16dvw rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.rule-modal-content .modal-header {
  background: linear-gradient(135deg, #FF9E5D, #FF6B35);
  color: white;
  padding: 5.3dvw;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-modal-content .modal-header h2 {
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

/* 登录提示样式 - 基于IntroScene.vue */
.login-prompt-container {
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom, 0); /* 考虑刘海屏的安全区域 */
  z-index: 100; /* 确保在其他intro内容之上但可能在模态框之下 */
  background-color: rgba(0,0,0,0.3); /* 可选：略微变暗提示区域背景以提高可见性 */
}

.login-prompt-image {
  width: 100%; /* 使图像占据其容器的全宽 */
  height: auto;
  display: block; /* 移除图像下方的额外空间 */
  cursor: pointer;
}

/* 打开APP提示样式 - 基于IntroScene.vue */
.open-app-prompt-container {
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 400px; /* 与登录提示保持一致 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom, 0);
  z-index: 100; /* 与登录提示相同的z-index，它们不会因为v-if条件而重叠 */
  background-color: rgba(0,0,0,0.3); /* 与登录提示保持一致 */
}

.open-app-prompt-image {
  width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
}

/* 响应式适配 - 基于原设计保持比例 */
@media (max-width: 480px) {
  .challenge-text {
    font-size: 10dvw;
  }
  
  .participant-count {
    font-size: 2.8dvw;
  }
  
  .side-button-text {
    font-size: 4.8dvw;
    line-height: 6.5dvw;
  }
}

@media (max-height: 600px) {
  .side-buttons {
    top: 12dvh;
    gap: 3dvh;
  }
  
  .challenge-section {
    top: 60dvh;
  }
  
  .side-button {
    height: 12dvh;
  }
  
  .challenge-button {
    height: 10dvh;
  }
}
</style>