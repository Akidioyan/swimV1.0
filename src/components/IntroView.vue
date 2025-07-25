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
          <p class="participant-count" v-if="!participantData.isLoading">
            {{ participantText }}
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
      <div v-if="isRuleModalVisible" class="game-rules-modal" @click="handleCloseRuleModal">
        <div class="game-rules-panel" @click.stop>
          <!-- 标题栏 -->
          <div class="rules-header">
            <div class="rules-title">
              <img src="/vector/gold.svg" alt="奖杯图标" class="title-icon" />
              <span>游戏规则</span>
            </div>
            <button class="close-btn" @click="handleCloseRuleModal">
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
                    <span class="operation-text">长按能量按钮加速冲刺</span>
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
    </Transition>

    <!-- 排行榜浮层 -->
    <Transition name="slide-up">
      <Leaderboard :isVisible="isLeaderboardVisible" @close="handleCloseLeaderboard" />
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
import Leaderboard from './Leaderboard.vue'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const userStore = useUserStore()
const isRuleModalVisible = ref(false)
const isLeaderboardVisible = ref(false)

// 设备检测弹窗状态
const showDeviceModal = ref(false)

// 添加视频预准备相关状态
const videoPrepared = ref(false)
const preparedVideoElement = ref(null)

// PV 参与人数相关状态
const participantData = ref({
  currentPv: 26851, // 显示的最终参与人数（基数 + API返回值×3）
  nextNo: 26852,    // 下一个用户编号
  isLoading: false, // 加载状态
  lastUpdated: null, // 最后更新时间
  apiCurrentPv: 0   // 从API获取的原始current_pv值
})

// 登录提示显示条件：在QQ新闻App内且未登录
const shouldShowLoginPrompt = computed(() => {
  return userStore.isInQQNewsApp && !userStore.hasLogin;
});

// 格式化参与人数显示 - 显示精确数字
const formattedParticipants = computed(() => {
  // 使用toLocaleString()来添加千分位分隔符，显示精确数字
  return participantData.value.currentPv.toLocaleString('zh-CN');
});

// 参与人数文本
const participantText = computed(() => {
  return `—— 已有${formattedParticipants.value}人参与过挑战 ——`;
});

// 视频预准备函数
const prepareVideo = () => {
  if (videoPrepared.value) return
  
  console.log('🎬 IntroView: 开始预准备视频')
  
  // 获取预加载的视频资源
  const loadedResources = gameStateStore.getLoadedResources()
  
  if (loadedResources && loadedResources.videoElement) {
    try {
      // 创建新的video元素用于预准备
      const video = document.createElement('video')
      video.src = '/video/OpeningVideo.mp4'
      video.muted = true
      video.playsInline = true
      video.preload = 'auto'
      video.currentTime = 0
      
      // 监听视频准备就绪事件
      video.oncanplay = () => {
        console.log('🎬 IntroView: 视频预准备完成')
        preparedVideoElement.value = video
        videoPrepared.value = true
      }
      
      video.onerror = (error) => {
        console.warn('⚠️ IntroView: 视频预准备失败:', error)
      }
      
      // 开始预加载
      video.load()
      
    } catch (error) {
      console.error('❌ IntroView: 视频预准备异常:', error)
    }
  }
}

// 获取活动参与人数
const fetchActivityPV = async () => {
  if (participantData.value.isLoading) return;
  
  participantData.value.isLoading = true;
  
  try {
    console.log('正在获取活动参与人数...');
    const { getActivityPV } = await import('../utils/request');
    const response = await getActivityPV();
    
    console.log('API返回的完整数据:', response);
    
    // 支持多种API响应格式
    if (response && typeof response === 'object') {
      let participantCount = null;
      let nextNo = null;
      
      // 检查是否有data字段（新的API格式）
      if (response.data && typeof response.data === 'object') {
        console.log('使用response.data格式解析');
        participantCount = response.data.current_pv || response.data.total || response.data.pv;
        nextNo = response.data.next_no;
      } else {
        console.log('使用response直接格式解析');
        // 兼容旧格式：直接在response根级别
        participantCount = response.current_pv || response.total || response.pv;
        nextNo = response.next_no;
      }
      
      // 转换为数字（API可能返回字符串）
      if (participantCount) {
        const numParticipants = parseInt(participantCount, 10);
        if (!isNaN(numParticipants)) {
          participantData.value.apiCurrentPv = numParticipants;
          // PV计算公式：基数26851 + current_pv × 3
          const calculatedPv = 26851 + numParticipants * 3;
          participantData.value.currentPv = calculatedPv;
          participantData.value.lastUpdated = new Date();
          console.log('PV计算详情:');
          console.log(`  API返回的current_pv: ${numParticipants}`);
          console.log(`  计算公式: 26851 + ${numParticipants} × 3 = ${calculatedPv}`);
          console.log(`  最终显示: ${formattedParticipants.value}`);
        } else {
          console.warn('参与人数不是有效数字:', participantCount);
        }
      }
      
      // 处理next_no字段
      if (nextNo) {
        const numNextNo = parseInt(nextNo, 10);
        if (!isNaN(numNextNo)) {
          participantData.value.nextNo = numNextNo;
          console.log('下一个用户编号:', numNextNo);
        }
      }
      
      if (!participantCount) {
        console.warn('API返回数据中未找到有效的参与人数字段:', response);
      }
    }
  } catch (error) {
    console.error('获取活动参与人数失败:', error);
    // 保持默认值
  } finally {
    participantData.value.isLoading = false;
  }
};

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
  
  // 获取活动参与人数
  try {
    await fetchActivityPV()
    console.log('✅ 参与人数数据获取成功:', formattedParticipants.value)
  } catch (error) {
    console.error('❌ 参与人数数据获取失败:', error)
  }
  
  // 延迟一段时间后开始预准备视频，避免影响页面渲染
  setTimeout(() => {
    prepareVideo()
  }, 1000)
})

// 清理函数
onUnmounted(() => {
  if (preparedVideoElement.value) {
    preparedVideoElement.value.src = ''
    preparedVideoElement.value = null
  }
})

const handleStartGame = async () => {
  // 检查端内APP用户是否已登录
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    console.log('🚫 端内APP用户未登录，无法开始游戏，自动触发登录');
    
    // 上报点击事件
    clickReport({
      id: 'game_start_login_required',
    });
    
    try {
      // 自动触发登录流程
      await handleLogin();
      return; // 登录后需要重新加载页面，所以直接返回
    } catch (error) {
      console.error('🚫 登录失败，无法开始游戏:', error);
      // 登录失败时也返回，不开始游戏
      return;
    }
  }
  
  console.log('✅ 用户验证通过，开始游戏');
  
  // 如果视频已预准备，将其传递给VideoView
  if (videoPrepared.value && preparedVideoElement.value) {
    console.log('🎬 IntroView: 传递预准备的视频给VideoView')
    // 将预准备的视频元素存储到gameStateStore中
    const loadedResources = gameStateStore.getLoadedResources() || {}
    loadedResources.preparedVideoElement = preparedVideoElement.value
    gameStateStore.setLoadedResources(loadedResources)
  }
  
  // 上报游戏开始事件
  clickReport({
    id: 'game_start',
  });
  
  gameStateStore.startGame();
}

const handleShowRuleModal = () => {
  isRuleModalVisible.value = true
}

const handleCloseRuleModal = () => {
  isRuleModalVisible.value = false
}

const handleShowRanking = () => {
  console.log('🔍 排行榜按钮被点击了！')
  console.log('当前 isLeaderboardVisible 状态:', isLeaderboardVisible.value)
  
  isLeaderboardVisible.value = true
  
  console.log('设置后 isLeaderboardVisible 状态:', isLeaderboardVisible.value)
}

const handleCloseLeaderboard = () => {
  isLeaderboardVisible.value = false
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

/* 主场景容器 */
.intro-scene {
  width: 100%;
  height: 100vh; /* modern browsers */
  position: relative;
  background: linear-gradient(180deg, #a4d0f5 0%, #7bb3e0 50%, #5a9bd4 100%);
  font-family: 'FZLTCH', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .intro-scene {
    height: 100dvh;
  }
}

/* 设备检测弹窗 */
.device-detection-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .device-detection-modal {
    height: 100dvh;
  }
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
  /* 添加兼容性处理 */
  font-family: 'object-fit: cover;'; /* IE polyfill */
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
  top: 14.7vh; /* 游戏规则按钮开始位置: (3247-3132)/779*100 */
  display: flex;
  flex-direction: column;
  gap: 3.8vh; /* 两个按钮之间的间距: (3377-3247-116)/779*100 */
  z-index: 10;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .side-buttons {
    top: 14.7dvh; /* 游戏规则按钮开始位置: (3247-3132)/779*100 */
    gap: 3.8dvh; /* 两个按钮之间的间距: (3377-3247-116)/779*100 */
  }
}

.side-button {
  width: 13.9vw; /* 52/375*100 - 基于设计稿宽度 */
  height: 14.9vh; /* 116/779*100 - 基于设计稿高度 */
  background: #FDDE38; /* 基于设计稿颜色 rgb(253, 222, 56) */
  border: none;
  border-radius: 2.7vw 0 0 2.7vw; /* 10px圆角，右侧贴边 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0.5vw 2vw rgba(0, 0, 0, 0.1);
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .side-button {
    height: 14.9dvh; /* 116/779*100 - 基于设计稿高度 */
  }
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
  font-size: 5.3vw; /* 20px/375*100 - 基于设计稿字体大小 */
  font-weight: 600;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0px;
  line-height: 7.2vw; /* 28px/375*100 - 基于设计稿行高 */
}

/* 主挑战按钮区域 - 基于Figma精确位置 */
.challenge-section {
  position: absolute;
  left: 50%;
  top: 65.8vh; /* (3651-3132)/779*100 - 基于设计稿Y位置 */
  transform: translate(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .challenge-section {
    top: 65.8dvh; /* (3651-3132)/779*100 - 基于设计稿Y位置 */
  }
}

.challenge-button {
  width: 65.9vw; /* 247/375*100 - 基于设计稿宽度 */
  height: 12.2vh; /* 95/779*100 - 基于设计稿高度 */
  background: #0D71ED; /* 基于设计稿颜色 rgb(13, 113, 237) */
  border: none;
  border-radius: 2.7vw; /* 10px/375*100 - 基于设计稿圆角 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1vw 3vw rgba(13, 113, 237, 0.3);
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .challenge-button {
    height: 12.2dvh; /* 95/779*100 - 基于设计稿高度 */
  }
}

.challenge-button:hover {
  transform: translateY(-0.5vw);
  box-shadow: 0 1.5vw 4vw rgba(13, 113, 237, 0.4);
}

.challenge-button:active {
  transform: translateY(0);
}

.challenge-text {
  color: white;
  font-size: 12vw; /* 45px/375*100 - 基于设计稿字体大小 */
  font-weight: 600;
  line-height: 16.8vw; /* 63px/375*100 - 基于设计稿行高 */
  margin: 0;
}

.participant-count {
  color: white;
  font-size: 3.2vw; /* 12px/375*100 - 基于设计稿字体大小 */
  font-weight: 400;
  line-height: 4.5vw; /* 16.8px/375*100 - 基于设计稿行高 */
  margin: 0;
  text-align: center;
  width: 60.3vw; /* 226px/375*100 - 基于设计稿宽度 */
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

/* 游戏规则弹窗 - 基于Figma设计稿 */
.game-rules-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5vw;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .game-rules-modal {
    height: 100dvh;
  }
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
  box-shadow: 0 5vw 16vw rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
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
  margin-bottom: -2.13vw; /* -8px / 375px * 100 */
  position: relative;
  height: 15vw;
  padding: 0 4vw; /* 15px / 375px * 100 */
  border-bottom: 0.17vh solid rgb(182, 157, 134);
  background: rgb(255, 235, 210);
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .rules-header {
    border-bottom: 0.17dvh solid rgb(182, 157, 134);
  }
}

.rules-title {
  display: flex;
  align-items: center;
  gap: 2.13vw;
  color: rgb(114, 51, 46);
  font-size: 5.33vw; /* 20px / 375px * 100 */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600; /* 改为与排行榜标题一致 */
  margin-left: -1.07vw; /* -4px / 375px * 100 */
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
  width: 8.53vw;
  height: 8.53vw;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; /* 统一添加事件处理 */
  z-index: 10; /* 统一添加层级 */
}

.rules-header .close-x {
  position: relative;
  width: 6.4vw; /* 统一为6.4vw */
  height: 6.4vw;
}

.rules-header .close-x::before,
.rules-header .close-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6.4vw; /* 统一为6.4vw */
  height: 0.8vw; /* 统一为0.8vw */
  background: rgb(114, 51, 46);
  border-radius: 0.4vw; /* 统一为0.4vw */
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
  padding: 4vw;
  height: 100%;
  overflow-y: auto;
  /* 隐藏滚动条 - Firefox */
  scrollbar-width: none;
  /* 隐藏滚动条 - IE/Edge */
  -ms-overflow-style: none;
}

/* 隐藏滚动条 - Webkit浏览器 */
.rules-scroll-content::-webkit-scrollbar {
  display: none;
}

/* 规则章节 */
.rule-section {
  margin-bottom: 4vw;
}

.rule-section:last-child {
  margin-bottom: 2vw;
}

.rule-title {
  font-size: 3.73vw; /* 14px / 375px * 100 */
  font-weight: 400; /* 改为与排行榜正文一致 */
  color: rgb(114, 51, 46);
  margin-bottom: 2.13vw;
  display: flex;
  align-items: center;
  gap: 1.6vw;
}

.rule-description {
  font-size: 3.2vw; /* 12px / 375px * 100 */
  color: rgb(114, 51, 46);
  font-weight: 400; /* 添加字体权重与排行榜正文一致 */
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
  padding: 1.07vw 0;
  padding-left: 4.27vw;
  position: relative;
  font-size: 3.2vw;
  color: rgb(114, 51, 46);
  font-weight: 400; /* 添加字体权重与排行榜正文一致 */
  line-height: 1.4;
}

.rule-list li::before {
  content: '•';
  color: rgb(114, 51, 46);
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 1.07vw;
}

/* 操作和道具列表 */
.operation-list,
.items-list {
  display: flex;
  flex-direction: column;
  gap: 1.6vw;
  margin-top: 1.33vw;
}

.operation-item,
.item {
  display: flex;
  align-items: center;
  gap: 2.13vw;
  padding: 1.6vw 2.67vw;
  background: rgba(255, 235, 207, 0.8);
  border: 0.27vw solid rgba(114, 51, 46, 0.2);
  border-radius: 1.6vw;
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

/* 游戏规则弹窗 - 基于Figma设计稿 */
.game-rules-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5vw;
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
    font-size: 10vw;
  }
  
  .participant-count {
    font-size: 2.8vw;
  }
  
  .side-button-text {
    font-size: 4.8vw;
    line-height: 6.5vw;
  }
}

/* 响应式适配 - 基于原设计保持比例 */
@media (max-height: 600px) {
  .side-buttons {
    top: 12vh;
    gap: 3vh;
  }
  
  .challenge-section {
    top: 60vh;
  }
  
  .side-button {
    height: 12vh;
  }
  
  .challenge-button {
    height: 10vh;
  }
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
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
}

/* 向下兼容：不支持dvh的浏览器 */
@supports not (height: 100dvh) {
  .intro-scene,
  .device-detection-modal,
  .game-rules-modal {
    height: 100vh !important;
  }
}
</style>