<template>
  <div class="intro-scene">
    <!-- 背景容器 -->
    <div class="background-container">
      <img src="/intro.png" alt="背景图片" class="background-image" />
    </div>

    <!-- 主要UI层 -->
    <div class="ui-layer">
      
      <!-- Logo区域 (顶部中央) -->
      <div class="logo-container">
        <img src="/logo.png" alt="游戏Logo" class="logo-image" />
      </div>

      <!-- 导航和挑战容器 -->
      <div class="nav-challenge-container">
        <!-- 左侧导航按钮 - 排行榜 -->
        <div class="nav-button-left">
          <img 
            src="/rank.png" 
            alt="排行榜" 
            class="nav-button-image" 
            @click="handleShowRanking"
          />
        </div>

        <!-- 中央挑战按钮区域 -->
        <div class="challenge-area">
          <img 
            src="/go.png" 
            alt="立即挑战" 
            class="challenge-button-image" 
            @click="handleStartGame"
          />
        </div>

        <!-- 右侧导航按钮 - 游戏规则 -->
        <div class="nav-button-right">
          <img 
            src="/rule.png" 
            alt="游戏规则" 
            class="nav-button-image" 
            @click="handleShowRuleModal"
          />
        </div>
      </div>

      <!-- 参与人数信息 - 独立容器 -->
      <div class="participant-container">
        <div class="participant-info" v-if="!participantData.isLoading">
          {{ participantText }}
        </div>
        <div class="participant-info loading" v-else>
          正在获取参与人数...
        </div>
      </div>

    </div>

    <!-- 底部提示层 -->
    <div class="bottom-prompts">
      <!-- 登录提示：APP内未登录时显示 -->
      <div v-if="shouldShowLoginPrompt" class="login-prompt" @click="handleLogin">
        <img src="/login.png" alt="点击登录" class="prompt-image">
      </div>

      <!-- 打开APP提示：APP外时显示 -->
      <div v-if="!userStore.isInQQNewsApp" class="open-app-prompt" @click="handleOpenAppInIntro">
        <img src="/openAppAtIntro.png" alt="点击打开APP" class="prompt-image">
      </div>
    </div>

    <!-- 调试控制 (F1键控制) -->
    <div v-if="showDebugLayer" class="debug-layer">
      <!-- 调试登录提示 -->
      <div v-if="showDebugLogin" class="debug-login-prompt" @click="handleDebugLogin">
        <img src="/login.png" alt="调试登录" class="prompt-image">
        <div class="debug-label">调试登录</div>
      </div>

      <!-- 调试控制面板 -->
      <div class="debug-controls">
        <h4 class="debug-title">调试控制 (U键切换)</h4>
        <button @click="toggleAppEnvironment" class="debug-btn">
          {{ userStore.isInQQNewsApp ? '模拟非APP环境' : '模拟APP环境' }}
        </button>
        <button @click="toggleLoginStatus" class="debug-btn">
          {{ userStore.hasLogin ? '模拟未登录' : '模拟已登录' }}
        </button>
        <div class="debug-status">
          <div>初始化: {{ userStore.isInitialized ? '✅' : '❌' }}</div>
          <div>APP环境: {{ userStore.isInQQNewsApp ? '✅' : '❌' }}</div>
          <div>登录状态: {{ userStore.hasLogin ? '✅' : '❌' }}</div>
          <div>显示登录提示: {{ shouldShowLoginPrompt ? '✅' : '❌' }}</div>
        </div>
      </div>
    </div>

    <!-- 排行榜浮层 -->
    <Transition name="slide-up">
      <Leaderboard 
        :isVisible="isLeaderboardVisible" 
        :initialView="initialView"
        @close="handleCloseLeaderboard" 
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { useUserStore } from '../stores/userStore'
import { setShareInfo, showShareMenu, login } from '@tencent/qqnews-jsapi'
import { openNativeScheme } from '../utils/appDownload'
import { clickReport } from '../utils/report'
import audioManager from '../utils/audio-manager'
import Leaderboard from './Leaderboard.vue'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const userStore = useUserStore()
const isLeaderboardVisible = ref(false)
const initialView = ref('leaderboard') // 控制Leaderboard初始显示的视图

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
  const isInitialized = userStore.isInitialized;
  const isInApp = userStore.isInQQNewsApp;
  const hasLogin = userStore.hasLogin;
  const isLogging = isLoggingIn.value;
  
  // 只有在userStore初始化完成后才进行判断
  const shouldShow = isInitialized && isInApp && !hasLogin && !isLogging;
  
  // 添加详细的调试日志
  console.log('[IntroView] 🔐 登录提示显示判断:', {
    isInitialized: isInitialized,
    isInQQNewsApp: isInApp,
    hasLogin: hasLogin,
    isLoggingIn: isLogging,
    shouldShowLoginPrompt: shouldShow,
    userAgent: navigator.userAgent.substring(0, 100) + '...'
  });
  
  return shouldShow;
});

// 添加登录状态防止重复调用
const isLoggingIn = ref(false);

// 调试功能：在开发环境显示登录提示
const showDebugLogin = ref(import.meta.env.DEV && true); // 开发环境默认显示
const isDev = import.meta.env.DEV; // 环境检测变量

// 调试控制层显示状态 (U键控制)
const showDebugLayer = ref(false);

// U键切换调试层
const handleKeyDown = (event) => {
  if (event.key === 'u' || event.key === 'U') {
    event.preventDefault(); // 阻止浏览器默认行为
    showDebugLayer.value = !showDebugLayer.value;
    console.log('[IntroView] U键切换调试层:', showDebugLayer.value);
  }
};

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
  
  // 等待userStore初始化完成
  console.log('[IntroView] 等待userStore初始化完成...');
  let waitCount = 0;
  while (!userStore.isInitialized && waitCount < 50) { // 最多等待5秒
    await new Promise(resolve => setTimeout(resolve, 100));
    waitCount++;
  }
  
  if (userStore.isInitialized) {
    console.log('[IntroView] ✅ userStore初始化完成，开始监听状态变化');
  } else {
    console.warn('[IntroView] ⚠️ userStore初始化超时，继续执行');
  }
  
  // 监听登录状态变化
  watch(() => userStore.hasLogin, (newValue, oldValue) => {
    console.log('[IntroView] 登录状态变化:', {
      oldValue: oldValue,
      newValue: newValue,
      isInQQNewsApp: userStore.isInQQNewsApp,
      shouldShowLoginPrompt: userStore.isInQQNewsApp && !newValue
    });
    
    // 如果从未登录变为已登录，记录成功日志
    if (!oldValue && newValue) {
      console.log('[IntroView] ✅ 用户登录成功！');
    }
  }, { immediate: true });
  
  // 监听APP环境状态变化
  watch(() => userStore.isInQQNewsApp, (newValue) => {
    console.log('[IntroView] APP环境状态:', {
      isInQQNewsApp: newValue,
      hasLogin: userStore.hasLogin,
      shouldShowLoginPrompt: newValue && !userStore.hasLogin
    });
  }, { immediate: true });
  
  // 监听登录提示显示状态变化
  watch(() => shouldShowLoginPrompt.value, (newValue) => {
    console.log('[IntroView] 🔐 登录提示显示状态变化:', {
      shouldShow: newValue,
      isInQQNewsApp: userStore.isInQQNewsApp,
      hasLogin: userStore.hasLogin,
      isLoggingIn: isLoggingIn.value
    });
  }, { immediate: true });
  
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
  
  // 添加键盘事件监听器
  document.addEventListener('keydown', handleKeyDown);
  console.log('[IntroView] ✅ 键盘事件监听器已添加 (U切换调试层)');
})

// 清理函数
onUnmounted(() => {
  // 重置登录状态
  isLoggingIn.value = false;
  
  if (preparedVideoElement.value) {
    preparedVideoElement.value.src = ''
    preparedVideoElement.value = null
  }
  
  // 移除键盘事件监听器
  document.removeEventListener('keydown', handleKeyDown);
  console.log('[IntroView] 🧹 键盘事件监听器已移除');
})

const handleStartGame = async () => {
  // 检查端内APP用户是否已登录
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    console.log('🔐 端内APP用户未登录，自动弹出登录组件');
    
    // 防止重复调用
    if (isLoggingIn.value) {
      console.log('[IntroView] 登录请求正在处理中，请稍候...');
      return;
    }
    
    isLoggingIn.value = true;
    
    try {
      console.log('[IntroView] 通过挑战按钮触发登录...');
    clickReport({
      id: 'game_start_login_required',
    });
    
      // 调用腾讯新闻JSAPI的登录方法
      await login();
      console.log('[IntroView] Login process initiated by JSAPI, reloading page.');
      location.reload(); // 登录完成后刷新页面
    } catch (error) {
      console.error('[IntroView] Failed to invoke login or login was cancelled:', error);
      // 可选择性地向用户显示登录失败的消息
    } finally {
      isLoggingIn.value = false;
    }
    
    return; // 登录流程完成后退出，不继续开始游戏
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

const handleShowRanking = () => {
  console.log('🔍 排行榜按钮被点击了！')
  console.log('当前 isLeaderboardVisible 状态:', isLeaderboardVisible.value)
  
  initialView.value = 'leaderboard'
  isLeaderboardVisible.value = true
  
  console.log('设置后 isLeaderboardVisible 状态:', isLeaderboardVisible.value)
}

const handleCloseLeaderboard = () => {
  isLeaderboardVisible.value = false
}

const handleShowRuleModal = () => {
  console.log('🔗 游戏规则按钮被点击了！')
  
  initialView.value = 'rules'
  isLeaderboardVisible.value = true
}

const handleLogin = async () => {
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    // 防止重复调用
    if (isLoggingIn.value) {
      console.log('[IntroView] 登录请求正在处理中，请稍候...');
      return;
    }
    
    isLoggingIn.value = true;
    
    try {
      console.log('[IntroView] Attempting to invoke login...');
      clickReport({
        id: 'login',
      })
      // 调用腾讯新闻JSAPI的登录方法
      await login();
      console.log('[IntroView] Login process initiated by JSAPI, reloading page.');
      location.reload(); // 登录完成后刷新页面
    } catch (error) {
      console.error('[IntroView] Failed to invoke login or login was cancelled:', error);
      // 可选择性地向用户显示登录失败的消息
    } finally {
      isLoggingIn.value = false;
    }
  }
}

// 调试登录处理函数
const handleDebugLogin = () => {
  console.log('[IntroView] 🐛 调试登录点击');
  console.log('[IntroView] 🐛 当前状态:', {
    isInitialized: userStore.isInitialized,
    isInQQNewsApp: userStore.isInQQNewsApp,
    hasLogin: userStore.hasLogin,
    isLoggingIn: isLoggingIn.value,
    shouldShowLoginPrompt: shouldShowLoginPrompt.value
  });
  
  // 临时切换登录状态用于测试
  if (isDev) {
    userStore.hasLogin = !userStore.hasLogin;
    console.log('[IntroView] 🐛 切换登录状态:', userStore.hasLogin);
  }
}

// 调试APP环境切换函数
const toggleAppEnvironment = () => {
  console.log('[IntroView] 🐛 调试APP环境切换');
  userStore.isInQQNewsApp = !userStore.isInQQNewsApp;
  console.log('[IntroView] 🐛 切换APP环境到:', userStore.isInQQNewsApp);
};

// 调试登录状态切换函数
const toggleLoginStatus = () => {
  console.log('[IntroView] 🐛 调试登录状态切换');
  userStore.hasLogin = !userStore.hasLogin;
  console.log('[IntroView] 🐛 切换登录状态到:', userStore.hasLogin);
};

const handleOpenAppInIntro = () => {
  clickReport({
    id: 'open_app', // Using a more specific ID for this action
  });
  openNativeScheme('qqnews://article_9527?nm=LNK2025072504936600', 'swimming');
};
</script>

<style scoped>
/* ============================================
   字体定义
   ============================================ */
@font-face {
  font-family: 'FZLTCH';
  src: url('/font/FZLTCH.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

/* ============================================
   主场景容器 - Flexbox布局
   ============================================ */
.intro-scene {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
  background: linear-gradient(180deg, #a4d0f5 0%, #7bb3e0 50%, #5a9bd4 100%);
  font-family: 'FZLTCH', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .intro-scene {
    height: 100dvh;
}
}

/* ============================================
   背景层 - 全屏背景，垂直填满，水平居中
   ============================================ */
.background-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* ============================================
   主要UI层 - 相对定位，为子元素提供定位上下文
   ============================================ */
.ui-layer {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

/* ============================================
   Logo区域 - 顶部中央绝对定位
   ============================================ */
.logo-container {
  position: absolute;
  top: 94vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.logo-image {
  height: auto;
  width: 25vw;
  object-fit: contain;
}

/* ============================================
   合并的导航和挑战容器 - 绝对定位
   ============================================ */
.nav-challenge-container {
  position: absolute;
  top: 68%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  z-index: 10;
}

/* ============================================
   导航按钮 - 相对定位，贴边显示
   ============================================ */
.nav-button-left {
  position: relative;
  flex-shrink: 0;
  margin-left: 0;
}

.nav-button-right {
  position: relative;
  flex-shrink: 0;
  margin-right: 0;
}

.nav-button-image {
  width: 6.5vw;
  height: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  object-fit: contain;
}

.nav-button-image:hover {
  transform: scale(1.05);
}

.nav-button-image:active {
  transform: scale(0.95);
}

/* ============================================
   中央挑战按钮区域 - 相对定位
   ============================================ */
.challenge-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 350px;
  margin: 0 20px;
}

.challenge-button-image {
  height: auto;
  width: 50vw; /* 使用vw作为基础值 */
  cursor: pointer;
  transition: all 0.3s ease;
  object-fit: contain;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .challenge-button-image {
    width: 50dvw;
  }
}

.challenge-button-image:hover {
  transform: scale(1.05);
}

.challenge-button-image:active {
  transform: scale(0.95);
}

/* ============================================
   参与人数信息容器 - 独立定位
   ============================================ */
.participant-container {
  position: absolute;
  top: 76%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.participant-info {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  margin: 0;
  text-align: center;
  transition: opacity 0.3s ease;
}

.participant-info.loading {
  opacity: 0.7;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* ============================================
   底部提示层 - 固定定位
   ============================================ */
.bottom-prompts {
  position: fixed;
  top: 83vh;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  z-index: 100;
}

.login-prompt,
.open-app-prompt {
  width: 100%;
  max-width: none;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.prompt-image {
  width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.prompt-image:hover {
  transform: scale(1.02);
}

.prompt-image:active {
  transform: scale(0.98);
}

/* ============================================
   调试控制 (开发环境)
   ============================================ */
/* ============================================
   调试控制 (U键控制) - 固定在左上角
   ============================================ */
.debug-layer {
  position: fixed;
  top: 30px;
  left: 30px;
  z-index: 10002;
  max-width: 280px;
}

.debug-login-prompt {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.debug-label {
  font-size: 12px;
  color: #007bff;
  font-weight: 600;
}

.debug-controls {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 15px;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.debug-title {
  font-size: 14px;
  color: #ffffff;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.debug-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  margin: 2px;
  transition: all 0.2s ease;
  display: block;
  width: 100%;
  text-align: center;
}

.debug-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

.debug-btn:active {
  transform: translateY(0);
}

.debug-status {
  font-size: 11px;
  color: #cccccc;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #555;
  line-height: 1.4;
}

.debug-status div {
  margin: 2px 0;
}

/* ============================================
   过渡动画
   ============================================ */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* ============================================
   兼容性回退 - 确保低端机型正常显示
   ============================================ */
@supports not (height: 100dvh) {
  .intro-scene {
    height: 100vh !important;
  }
}

@supports not (width: 100dvw) {
  .intro-scene {
    width: 100vw !important;
  }
  
  .challenge-button-image {
    width: 50vw !important;
  }
}

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
  0% { opacity: 1; transform: scale(1) rotate(0deg); }
  25% { opacity: 0.8; transform: scale(1.1) rotate(90deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  75% { opacity: 0.8; transform: scale(1.1) rotate(270deg); }
  100% { opacity: 1; transform: scale(1) rotate(360deg); }
}
</style>