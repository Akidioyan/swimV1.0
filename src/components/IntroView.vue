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
      <div v-if="!userStore.isInQQNewsApp" class="open-app-prompt" @click="handleOpenApp">
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { useUserStore } from '../stores/userStore'
import { setShareInfo, showShareMenu, login } from '@tencent/qqnews-jsapi'
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
    console.log('🚫 端内APP用户未登录，无法开始游戏，请先登录');
    
    // 上报点击事件，但不自动触发登录
    clickReport({
      id: 'game_start_login_required',
    });
    
    // 不开始游戏，让用户点击登录提示来手动登录
    return;
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

const handleOpenApp = () => {
  clickReport({
    id: 'open_app', // 使用更具体的ID来标识此操作
  });
  openNativeScheme('qqnews://article_9527?nm=LNK2025072504936600', 'swim');
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

/* ============================================
   设备检测弹窗 - 居中显示
   ============================================ */
.device-detection-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.modal-container {
  width: min(360px, 85vw);
  height: auto;
  min-height: 240px;
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
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

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
  clip-path: polygon(0% 0%, 100% 0%, calc(90% + 8px) calc(100% - 8px), 90% 100%, 10% 100%, calc(10% - 8px) calc(100% - 8px));
}

.header-text {
  color: rgb(255, 255, 255);
  font-family: "PingFang SC", "PingFang-SC-Regular", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 12px;
  text-align: center;
}

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

.suggestion-text {
  color: rgb(218, 218, 218);
  font-family: "PingFang SC", "PingFang-SC-Regular", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 19px;
  text-align: center;
}

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

.action-button:hover .button-icon {
  transform: translateX(2px);
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
  width: 50dvw;
  cursor: pointer;
  transition: all 0.3s ease;
  object-fit: contain;
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
   游戏规则弹窗 - 居中显示
   ============================================ */
.game-rules-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.game-rules-panel {
  width: 380px;
  max-width: 90%;
  height: 550px;
  max-height: 85%;
  background: rgb(255, 235, 210);
  border: 2px solid rgb(114, 51, 46);
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

.rules-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 60px;
  padding: 0 16px;
  border-bottom: 1px solid rgb(182, 157, 134);
  background: rgb(255, 235, 210);
}

.rules-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgb(114, 51, 46);
  font-size: 20px;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
}

.title-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.close-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.close-x {
  position: relative;
  width: 24px;
  height: 24px;
}

.close-x::before,
.close-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 3px;
  background: rgb(114, 51, 46);
  border-radius: 2px;
}

.close-x::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.close-x::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.rules-content-area {
  flex: 1;
  background: rgb(217, 181, 149);
  border-radius: 8px;
  margin: 8px 12px;
  overflow: hidden;
}

.rules-scroll-content {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.rules-scroll-content::-webkit-scrollbar {
  display: none;
}

.rule-section {
  margin-bottom: 16px;
}

.rule-section:last-child {
  margin-bottom: 8px;
}

.rule-title {
  font-size: 14px;
  font-weight: 600;
  color: rgb(114, 51, 46);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.rule-description {
  font-size: 12px;
  color: rgb(114, 51, 46);
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  margin-top: 4px;
}

.rule-list {
  list-style: none;
  padding: 0;
  margin: 4px 0 0 0;
}

.rule-list li {
  padding: 4px 0;
  padding-left: 16px;
  position: relative;
  font-size: 12px;
  color: rgb(114, 51, 46);
  font-weight: 400;
  line-height: 1.4;
}

.rule-list li::before {
  content: '•';
  color: rgb(114, 51, 46);
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 4px;
}

.operation-list,
.items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.operation-item,
.item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(255, 235, 207, 0.8);
  border: 1px solid rgba(114, 51, 46, 0.2);
  border-radius: 6px;
  font-size: 12px;
}

.operation-icon,
.item-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.operation-text,
.item-text {
  font-size: 12px;
  color: rgb(114, 51, 46);
  line-height: 1.3;
  font-weight: 400;
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
   兼容性回退
   ============================================ */
@supports not (height: 100dvh) {
  .intro-scene,
  .device-detection-modal,
  .game-rules-modal {
    height: 100vh !important;
  }
}

@supports not (width: 100dvw) {
  .intro-scene,
  .device-detection-modal,
  .game-rules-modal {
    width: 100vw !important;
  }
}
</style>