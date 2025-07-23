<template>
  <div class="intro-scene">
    <!-- Low Version Tips Image -->
    <div v-if="showLowVersionTips" class="low-version-tips" @click="handleLowVersionTipsClick">
      <img src="https://mat1.gtimg.com/rain/apub2019/0f6f2de64195.tipsForLowVersion.png" alt="版本过低提示" class="low-version-tips-image">
    </div>

    <!-- Removed Play Limit Tips Image from here -->

    <div class="intro-content">
      <div class="action-button-container"> <!-- New wrapper -->
        <!-- Play Limit Tips Image -->
        <img 
          v-if="showNeedShareTips" 
          ref="tipsImageRef" 
          src="/assets/needShareToPlayTips.png" 
          class="play-limit-tips-image-intro" 
          alt="分享提示"
        >
        <!-- Start Button: Displayed when user can play -->
        <img 
          v-if="!showNeedShareTips" 
          src="/assets/start.png" 
          alt="开始挑战" 
          @click="handleStartGame" 
          class="start-button-image"
        >
        <!-- Share for Plays Button: Displayed when user needs to share -->
        <img 
          v-if="showNeedShareTips" 
          src="/assets/shareForPlays.png" 
          alt="分享获取次数" 
          @click="handleRequestBonusPlays" 
          class="share-for-plays-button-image"
        >
      </div>
      <p class="participant-text">
        已有 {{ participantCount }} 人参与过挑战
        <span v-if="rankPercent !== '—'">&nbsp;·&nbsp;击败 {{ rankPercent }} 的玩家</span>
      </p>
    </div>
    <!-- 规则按钮容器 -->
    <div class="rule-button-container" @click="handleShowRuleModal">
      <img src="/assets/IntroRuleButton.png" alt="游戏规则" class="rule-button-image">
    </div>
    <!-- 新增获奖名单按钮容器 -->
    <div class="win-list-button-container" @click="handleOpenWinList">
      <img src="/assets/winList.png" alt="获奖名单" class="win-list-button-image">
    </div>

    <!-- 规则说明浮层 -->
    <Transition name="slide-up">
      <!-- Re-introduce an overlay, but make it transparent for click-to-close on top half -->
      <div v-if="isRuleModalVisible" class="transparent-modal-backdrop" @click="handleCloseRuleModal">
        <div class="rule-modal-content" @click.stop>
          <div class="close-modal-button" @click="handleCloseRuleModal">×</div>
          <h2>挑战赛活动规则</h2>
          <div class="rules-text-container">
            <p><strong>一、活动目的</strong><br>
            《指尖乒乓挑战赛》是腾讯新闻为乒乓球爱好者开发的一个轻松有趣的线上互动游戏，通过指尖操作感受乒乓球的魅力，同时增强玩家之间的互动与交流，激发大家对乒乓球运动的热情。</p>
            
            <p><strong>二、参与方式</strong><br>
            玩家无需报名，只需下载并安装腾讯新闻客户端，搜索"指尖乒乓"进入后，即可直接参与挑战。</p>
            
            <p><strong>三、游戏规则</strong><br>
            游戏采用单人闯关模式，玩家通过用手指拖动乒乓球，击向桌面上的杯子，目标是在规定时间内击落所有杯子。每个关卡有特定的任务目标，玩家需要在限定时间内完成任务，方可过关。</p>
            
            <p><strong>特殊杯子</strong><br>
            每个关卡中会随机出现若干个铁杯子，这些铁杯子比普通杯子更难击落。</p>
            
            <p><strong>道具杯子</strong><br>
            每个关卡中还会随机出现若干个道具杯子，击落这些杯子可以获得不同的道具效果，帮助玩家完成关卡：<br>
            球变大：乒乓球的大小增加，更容易击中杯子。<br>
            球变小：乒乓球的大小减小，更灵活但击中难度增加。<br>
            加时间：增加关卡时间，为玩家提供更多时间完成任务。<br>
            减时间：减少关卡时间，增加游戏难度。<br>
            左弧线：乒乓球击出后会向左弧线偏移，适合击中左侧目标。<br>
            右弧线：乒乓球击出后会向右弧线偏移，适合击中右侧目标。<br>
            金属球：乒乓球变成金属材质，击中杯子时会更有力量，增加击落杯子的机会。</p>
            
            <p><strong>四、排行榜规则</strong><br>
            每完成一个关卡，系统会记录玩家的过关数、使用的乒乓球数量以及完成关卡的时间。排行榜依据：<br>
            优先级1：按过关数排序，过关数越多排名越靠前。<br>
            优先级2：若过关数相同，按使用的乒乓球数量排序，使用的乒乓球数量越少排名越靠前。<br>
            优先级3：若过关数和使用的乒乓球数量都相同，按最新完成关卡的时间排序，时间越早排名越靠前。<br>
            系统会实时更新排行榜，并在游戏内首页展示，玩家可以查看自己的排名和成绩。</p>
            
            <p><strong>五、奖品须知</strong><br>
            截至5月31日24点，系统将决出首期榜单TOP10，这些顶尖玩家们分别可获得以下精美礼品：<br>
            第 1 名：腾讯体育超级会员年卡1张，见证乒乓热爱；<br>
            第 2-3 名：腾讯体育超级会员月卡 1 张，畅享丰富体育资源；<br>
            第 4-5 名：乒乓球九宫格精美礼盒套装 1 件，收藏价值与实用价值兼备；<br>
            第 6-10 名：乒乓球元素小徽章 1 套，小巧精致，彰显乒乓激情。<br>
            我们将在6月1日公布获奖名单，请TOP10玩家于一周内联系我们领取奖品（腾讯新闻体育官方微信：qqolympic）。后续榜单更新，敬请期待更多好礼！<br>
            *本活动解释及说明的权利归腾讯新闻官方所有，并将依照相关法律法规合理行使。</p>
            
            <p><strong>六、用户授权与使用</strong><br>
            我们会收集玩家的头像和昵称，用于在游戏内排名榜单中展示玩家，以便玩家之间相互识别和交流，增加游戏的趣味性和竞技氛围。在游戏结果页的排名榜单中，以头像和昵称的形式展示玩家的排名信息，比赛成绩。</p>
            
            <p><strong>七、违规处理</strong><br>
            严禁使用外挂、作弊软件等非法手段进行游戏，一经发现，将取消游戏资格，并永久封禁用户账号。<br>
            禁止恶意辱骂、攻击其他玩家或游戏，如有此类行为，将给予警告、禁言、封号等处罚，情节严重者将追究法律责任。禁止使用虚假信息参与游戏。</p>
            
            <p><strong>八、其他说明</strong><br>
            凡参与本活动的用户，视为认可本活动规则。<br>
            如遇不可抗力因素导致游戏无法正常进行，我们将及时通知玩家，并根据实际情况调整游戏规则。<br>
            玩家在参与游戏过程中如有任何疑问或建议，可通过腾讯新闻官方联系方式与我们联系，我们将竭诚为您服务。<br>
            祝各位玩家在《指尖乒乓挑战赛》中享受游戏带来的快乐！</p>
          </div>
        </div>
      </div>
    </Transition>

    <!-- APP Outside Share Arrow Overlay -->
    <div v-if="showShareArrowOverlay" class="share-overlay-intro" @click="handleShareArrowOverlayClick">
      <img src="/assets/shareArrow.png" class="share-instruction-arrow-intro" alt="点击此处分享">
    </div>

    <!-- Login Prompt Area -->
    <div v-if="shouldShowLoginPrompt" class="login-prompt-container" @click="handleLogin">
      <img src="/assets/login.png" alt="点击登录" class="login-prompt-image">
    </div>
    <!-- Open App Prompt Area -->
    <div v-if="!userStore.isInQQNewsApp" class="open-app-prompt-container" @click="handleOpenAppInIntro">
      <img src="/assets/openAppAtIntro.png" alt="点击打开APP" class="open-app-prompt-image">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { setShareInfo, showShareMenu, login } from '@tencent/qqnews-jsapi'
import request from '../utils/request'
import { clickReport } from '../utils/report'
import { openNativeScheme } from '../utils/appDownload'
const gameStore = useGameStore()
const userStore = useUserStore()
const isRuleModalVisible = ref(false)

// --- Play Limit and Share Logic State ---
// const isStartButtonDisabled = ref(false); // No longer needed
const showNeedShareTips = ref(false); // Controls needShareToPlayTips.png AND button swapping
const tipsImageRef = ref(null);      // For animating needShareToPlayTips.png (animation trigger might change)
const showShareArrowOverlay = ref(false); // Controls outside-app share arrow overlay
// --- End Play Limit and Share Logic State ---

// --- Login Prompt Logic State ---
const shouldShowLoginPrompt = computed(() => {
  return userStore.isInQQNewsApp && !userStore.hasLogin;
});

const handleLogin = async () => {
  if (userStore.isInQQNewsApp && !userStore.hasLogin) {
    try {
      console.log('[IntroScene] Attempting to invoke login...');
      clickReport({
        id: 'login',
      })
      // According to the screenshot, login() might return a promise.
      // The screenshot shows: isLogin (Boolean, required) in callback,
      // implying it's an async operation.
      await login(); // Assuming login itself handles the UI and resolves after attempt
      // Per user instruction, reload after login attempt.
      // The login() promise from JSAPI should ideally resolve *after* the native login UI flow is complete,
      // or if it resolves immediately, the reload will happen very fast.
      // We assume the JSAPI's login function resolves appropriately for a post-action reload.
      console.log('[IntroScene] Login process initiated by JSAPI, reloading page.');
      location.reload();
    } catch (error) {
      console.error('[IntroScene] Failed to invoke login or login was cancelled:', error);
      // Optionally, display a message to the user about the login failure.
    }
  }
};
// --- End Login Prompt Logic State ---


const handleOpenAppInIntro = () => {
  clickReport({
    id: 'open_app', // Using a more specific ID for this action
  });
  openNativeScheme('qqnews://article_9527?nm=LNK2025052211684300', 'pingpong');
};

// 新增获奖名单按钮处理函数
const handleOpenWinList = () => {
  clickReport({
    id: 'open_win_list', // 未来等活动上线会替换 活动文章scheme 地址
  })
  // 未来等活动上线会替换 活动文章scheme 地址
  openNativeScheme('qqnews://article_9527?nm=20250602A04SL100', 'pingpong')
}
// --- End Open App Prompt Logic ---

// 接口数据 (兜底值保证本地可跑)
const participantCount = ref('*****')  // 总参与人数，使用接口前的默认值
const rankPercent      = ref('—')    // 击败百分比 (新接口未提供，保留兜底)

// 添加低版本检测相关状态
const showLowVersionTips = ref(false)

const fetchParticipantCount = async () => {
  try {
    // request helper 会自动加 /api 前缀（开发环境）或使用 .env 中的 VITE_API_BASE（生产）
    const json = await request('/activity/pingpong/pv', { method: 'GET' });
    if (json?.code === 0 && typeof json.pv === 'number') {
      participantCount.value = json.pv;
    } else {
      // 如果响应码不是0或者数据结构不符合预期，也打印警告并使用兜底值
      console.warn('获取参与人数数据格式不符或code非0，使用兜底值', json);
    }
  } catch (err) {
    console.warn('获取参与人数失败，使用兜底值', err);
  }
}

// 检查安卓系统版本
const checkAndroidVersion = () => {
  const ua = navigator.userAgent
  // 检查是否是安卓设备
  const isAndroid = /Android/i.test(ua)
  
  if (isAndroid) {
    // 提取安卓版本号
    const match = ua.match(/Android (\d+)/)
    if (match) {
      const androidVersion = parseInt(match[1])
      console.log('[IntroScene] Detected Android version:', androidVersion)
      // 如果版本号小于12，显示提示图片
      showLowVersionTips.value = androidVersion && androidVersion < 12
    }
  }
}

const handleLowVersionTipsClick = () => {
  openNativeScheme('qqnews://article_9527?nm=UTR2025043005136600');
}

// 在组件挂载时检查版本
onMounted(() => {
  if (userStore.isInQQNewsApp) {
    checkAndroidVersion()
  }
  fetchParticipantCount()
})

// Watch for changes in userStore.canPlay to update UI elements
watch(() => userStore.canPlay, (canStillPlay) => {
  console.log(`[IntroScene] userStore.canPlay changed to: ${canStillPlay}`);
  // isStartButtonDisabled.value = !canStillPlay; // Removed
  showNeedShareTips.value = !canStillPlay; // This now controls which button is shown
  if (canStillPlay) {
    showShareArrowOverlay.value = false; // Hide arrow overlay if plays are restored
  }
  userStore.logCurrentPlayStats('[IntroScene] Stats after canPlay changed');
}, { immediate: true });

const handleStartGame = () => {
  userStore.logCurrentPlayStats('[IntroScene] handleStartGame clicked (canPlay must be true here)');
  // No need to check !userStore.canPlay here anymore, as this button is only shown when canPlay is true.
  // Animation for tipsImageRef when clicking a disabled button is no longer applicable in this setup.
  
  gameStore.startGame()
  gameStore.playBGM()
  clickReport({
    id: 'start_game',
  })
}

const handleRequestBonusPlays = () => {
  userStore.logCurrentPlayStats('[IntroScene] handleRequestBonusPlays clicked');
  console.log('[IntroScene] Requesting bonus plays. Checking environment...');

  // If tips image is currently shown, and user clicks share, we might want to animate it?
  // Or, simply proceed with share. For now, let's proceed with share directly.
  // If animation is desired on clicking shareForPlays button when tips are shown:
  /*
  if (tipsImageRef.value && showNeedShareTips.value) {
    tipsImageRef.value.classList.add('tips-animate');
    setTimeout(() => {
      if (tipsImageRef.value) {
        tipsImageRef.value.classList.remove('tips-animate');
      }
    }, 500);
  }
  */

  if (userStore.isInQQNewsApp) {
    console.log('[IntroScene] In-app environment. Triggering native share.');
    showShareMenu();

    console.log('[IntroScene] In-app share menu shown (simulated). Starting 5s timer for bonus plays.');
    setTimeout(() => {
      console.log('[IntroScene] 5s timer elapsed. Granting bonus plays for in-app share.');
      userStore.grantBonusPlays(3);
    }, 5000);
  } else {
    console.log('[IntroScene] Outside-app environment. Showing share arrow overlay.');
    showShareArrowOverlay.value = true;
    console.log('[IntroScene] Share arrow overlay shown. Starting 5s timer for bonus plays (simulating external share action).');
    setTimeout(() => {
      console.log('[IntroScene] 5s timer elapsed. Granting bonus plays for outside-app share.');
      userStore.grantBonusPlays(3);
    }, 5000);
  }
}

const handleShareArrowOverlayClick = () => {
  console.log('[IntroScene] Share arrow overlay clicked. Hiding overlay.');
  showShareArrowOverlay.value = false;
}

// 修改：处理规则按钮点击事件
const handleShowRuleModal = () => {
  isRuleModalVisible.value = true;
}

// 新增：关闭规则浮层
const handleCloseRuleModal = () => {
  isRuleModalVisible.value = false;
}
</script>

<style scoped>
.intro-scene {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background-image: url('/assets/intro.png');
  background-size: auto 100%;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative; 
}

.intro-content {
  text-align: center;
  margin-bottom: 5vh; /* Changed from 10vh to 5vh to move content down */
  display: flex; /* Added to help center the action-button-container and participant-text */
  flex-direction: column; /* Stack them vertically */
  align-items: center; /* Center them horizontally */
}

.action-button-container { /* New styles for the wrapper */
  position: relative; /* Anchor for the absolute positioned tips image */
  display: flex;
  flex-direction: column; /* Stack tips (if any) above button conceptually, though tips is absolute */
  align-items: center; /* Center the button horizontally */
  /* The height of this container will be determined by the button inside it (10vh) */
  /* Add some margin if needed, or let .intro-content handle spacing */
}

.start-button-image,
.share-for-plays-button-image {
  height: 10vh;
  cursor: pointer;
  transition: transform 0.2s ease-out;
  display: block; /* Already block, but good to keep in mind */
  /* margin-left/right: auto; are fine as they center block elements if text-align:center was on parent */
  /* No change needed here unless specific margin adjustments are required for the new parent */
}

.participant-text {
  color: #fff;
  font-size: 24px;
  margin-top: 1vh;
}

.rule-button-container {
  position: absolute;
  top: 25%;
  right: 0px; 
  transform: translateY(-50%); 
  z-index: 10;
  cursor: pointer;
}

.rule-button-image {
  height: 15vh; 
  display: block;
  transition: transform 0.2s ease-out;
}

.rule-button-image:hover {
  transform: scale(1.05);
}

/* 新增：透明背景板，用于点击关闭 */
.transparent-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent; /* 完全透明 */
  z-index: 999; /* 确保在规则内容之下，但在页面其他元素之上 */
  /* Transition will apply to this, and rule-modal-content will be its child */
}

.rule-modal-content {
  position: absolute; /* 改为 absolute，相对于 transparent-modal-backdrop 定位 */
  bottom: 0;
  left: 0;
  width: 100%; 
  height: 50vh; 
  background-color: #000; 
  color: #fff; 
  padding: 0; /* 将 padding 移到内部容器或调整关闭按钮定位 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  z-index: 1000; /* 高于透明背景板 */
  border-top: 1px solid #333; 
  /* The slide-up transition applies to transparent-modal-backdrop, 
     rule-modal-content moves with it as a child */
}

.rule-modal-content h2 {
  text-align: center;
  margin-top: 30px; /* 增加顶部边距以适应更大的关闭按钮热区 */
  margin-bottom: 15px;
  padding: 0 20px; /* 标题左右留白 */
  font-size: 1.8em;
}

.rules-text-container {
  flex-grow: 1;
  overflow-y: auto; 
  font-size: 1em; 
  line-height: 1.6;
  padding: 0 20px 20px 20px; /* 文本容器的内边距，底部多一些 */
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

.rules-text-container p {
  margin-bottom: 1em;
}

.rules-text-container strong {
  font-weight: bold;
}

.close-modal-button {
  position: absolute;
  top: 0px;  /* 调整 top 和 right 使其在面板内 */
  right: 0px; 
  width: 60px; /* 显著增大宽度 */
  height: 60px; /* 显著增大高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px; 
  font-weight: normal; /* X 通常不是粗体 */
  color: #888; /* 灰色X，可按需调整 */
  cursor: pointer;
  z-index: 1001; 
  line-height: 1; /* 确保X在自定义大小的div内居中 */
}
.close-modal-button:hover {
  color: #fff; /* 悬停时变白 */
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

/* --- Styles for Play Limit and Share --- */
.play-limit-tips-image-intro {
  position: absolute;
  bottom: 90%; /* Position above the .action-button-container */
  left: 50%;
  transform: translateX(-50%) translateY(-8px); /* Adjust -8px for desired gap */
  width: 70vw; 
  max-width: 400px; 
  height: auto;
  z-index: 5;
  pointer-events: none;
}

/* Removed .tips-animate and @keyframes pulse-scale as they are no longer used */

/* .start-button-image.disabled-button { // This style is no longer needed
  opacity: 0.5;
  cursor: not-allowed;
} */

.share-for-plays-button-image {
  height: 10vh; /* Made same height as start-button-image for seamless replacement */
  cursor: pointer;
  transition: transform 0.2s ease-out;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 2vh;
}

.share-overlay-intro {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 998;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.share-instruction-arrow-intro {
  width: 100px;
  height: auto;
  margin-top: 20px;
  margin-right: 20px;
}
/* --- End Styles for Play Limit and Share --- */

/* Login Prompt Styles */
.login-prompt-container {
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom, 0); /* Consider safe areas for notch phones */
  z-index: 100; /* Ensure it's above other intro content but potentially below modals if any overlap */
  background-color: rgba(0,0,0,0.3); /* Optional: Slight dimming of area behind prompt for better visibility */
}

.login-prompt-image {
  width: 100%; /* Make image take full width of its container */
  /* max-width: 750px; Max width of the image itself, adjust as needed */
  height: auto;
  display: block; /* Remove extra space below image */
  cursor: pointer;
}
/* End Login Prompt Styles */

/* Open App Prompt Styles */
.open-app-prompt-container {
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 400px; /* Consistent with login prompt */
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom, 0);
  z-index: 100; /* Same z-index as login prompt, they won't overlap due to v-if conditions */
  background-color: rgba(0,0,0,0.3); /* Consistent with login prompt */
}

.open-app-prompt-image {
  width: 100%;
  /* max-width: 750px; Consistent with login prompt image */
  height: auto;
  display: block;
  cursor: pointer;
}
/* End Open App Prompt Styles */

/* 低版本提示样式 */
.low-version-tips {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.low-version-tips-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}


/* 新增获奖名单按钮样式 */
.win-list-button-container {
  position: absolute;
  top: 40.1%;
  right: 0px;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
}

.win-list-button-image {
  height: 15vh;
  display: block;
  transition: transform 0.2s ease-out;
}
/* End 新增获奖名单按钮样式 */
</style>