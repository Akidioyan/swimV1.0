<template>
  <div class="ending-scene">
    <!-- Top rank and trophy display from EndingSceneOutside.vue -->
    <div class="rank-container">
      <div class="rank-desc-text">
        <template v-if="gameStore.sessionLevelsCompleted === 0">
          止步在第一关，赶快点击左下角再次挑战！
        </template>
        <template v-else>
          成功挑战{{ gameStore.sessionLevelsCompleted }}关，超越了全网{{ currentUserData?.rankPercent }}%的球友，恭喜获得：
        </template>
      </div>
      <img :src="rankImageSrc" class="rank-image" alt="玩家称号">
      <!-- New container for backboard and lit trophies -->
      <div class="trophy-display-area">
        <img src="/assets/trophyBackboard.png" class="trophy-backboard-image" alt="奖杯底板">
        <!-- 动态点亮奖杯图片 -->
        <template v-for="(trophyKey, idx) in [
          'CUP_COLLECTOR_20',
          'CUP_COLLECTOR_100',
          'CUP_COLLECTOR_300',
          'METAL_BUSTER',
          'ONE_SHOT_CLEAR',
          'LEVEL_CONQUEROR_5'
        ]" :key="trophyKey">
          <img
            v-if="litTrophies.includes('CUP_COLLECTOR_20') && idx === 0"
            src="/assets/trophy/lit/1.png"
            class="lit-trophy-image"
            alt="点亮奖杯1"
          >
          <img
            v-if="litTrophies.includes('CUP_COLLECTOR_100') && idx === 1"
            src="/assets/trophy/lit/2.png"
            class="lit-trophy-image"
            alt="点亮奖杯2"
          >
          <img
            v-if="litTrophies.includes('CUP_COLLECTOR_300') && idx === 2"
            src="/assets/trophy/lit/3.png"
            class="lit-trophy-image"
            alt="点亮奖杯3"
          >
          <img
            v-if="litTrophies.includes('METAL_BUSTER') && idx === 3"
            src="/assets/trophy/lit/4.png"
            class="lit-trophy-image"
            alt="点亮奖杯4"
          >
          <img
            v-if="litTrophies.includes('ONE_SHOT_CLEAR') && idx === 4"
            src="/assets/trophy/lit/5.png"
            class="lit-trophy-image"
            alt="点亮奖杯5"
          >
          <img
            v-if="litTrophies.includes('LEVEL_CONQUEROR_5') && idx === 5"
            src="/assets/trophy/lit/6.png"
            class="lit-trophy-image"
            alt="点亮奖杯6"
          >
        </template>
      </div>
    </div>

    <!-- Leaderboard Start -->
    <div class="leaderboard-container">
      <div class="leaderboard-header">
        <span class="col-rank">排名</span>
        <span class="col-nick">昵称</span>
        <span class="col-levels">闯关数</span>
        <span class="col-cups">用球数</span>
      </div>
      <div class="leaderboard-list">
        <!-- Current User Row -->
        <div class="leaderboard-row current-user-row" v-if="currentUserData">
          <span class="col-rank">{{ currentUserData.rank }}</span>
          <span class="col-nick" :title="currentUserData.nick">{{ currentUserData.nick }}</span>
          <span class="col-levels">{{ currentUserData.levelsCompleted }}</span>
          <span class="col-cups">{{ currentUserData.ballsUsed }}</span>
        </div>
        <!-- Top 50 List -->
        <div class="leaderboard-row" v-for="player in top50Data" :key="player.rank" :class="{ 'current-user-in-list': player.nick === currentUserData?.nick && player.rank === currentUserData?.rank }">
          <span class="col-rank" :class="{ 'top-rank-text': player.rank <= 3 }">{{ player.rank }}</span>
          <span class="col-nick" :title="player.nick">{{ player.nick }}</span>
          <span class="col-levels">{{ player.levelsCompleted }}</span>
          <span class="col-cups">{{ player.ballsUsed }}</span>
        </div>
      </div>
    </div>
    <!-- Leaderboard End -->

    <!-- Play Limit Tips Image -->
    <img 
      v-if="showPlayLimitOverlay" 
      ref="tipsImageRef" 
      src="/assets/needShareToPlayTips.png" 
      class="play-limit-tips-image" 
      alt="分享提示"
    >

    <!-- Bottom image buttons from EndingSceneOutside.vue -->
    <div class="button-container">
      <img 
        src="/assets/tryAgain.png" 
        @click="handleRestartGame" 
        class="restart-image-button" 
        :class="{ 'disabled-button': isTryAgainDisabled }" 
        alt="再次挑战"
      >
      <img 
        src="/assets/shareToFriend.png" 
        @click="handleShareInApp" 
        class="share-image-button" 
        alt="喊好友一起"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'; // Import userStore
import { setShareInfo, showShareMenu } from '@tencent/qqnews-jsapi' // Keep this for in-app sharing
// import { generateMockLeaderboardData } from '../utils/mockLeaderboardData'; // Comment out or remove mock data
import { submitAndFetchRealLeaderboardData } from '../utils/request'; // Import the new function
import { TrophyTypes } from '../game/trophyTypes.js'; // 新增：导入奖杯类型
import { clickReport } from '../utils/report';

const gameStore = useGameStore()
const userStore = useUserStore(); // Initialize userStore

const currentUserData = ref(null);
const top50Data = ref([]);
const isLoadingApi = ref(false); // Optional: for loading state
const apiError = ref(null);    // Optional: for error state

// New reactive state for play limits
const showPlayLimitOverlay = ref(false);
const isTryAgainDisabled = ref(false);
const tipsImageRef = ref(null); // For animating the tips image

// 新增：奖杯点亮数据
const litTrophies = ref([]); // 存储本局获得的奖杯ID数组

const rankImageSrc = computed(() => {
  const level = gameStore.sessionLevelsCompleted || 0;
  if (level <= 7) return 'assets/ranks/rank0.png';
  else if (level <= 15) return 'assets/ranks/rank1.png';
  else if (level <= 23) return 'assets/ranks/rank2.png';
  else if (level <= 31) return 'assets/ranks/rank3.png';
  else if (level <= 39) return 'assets/ranks/rank4.png';
  else if (level <= 47) return 'assets/ranks/rank5.png';
  else return 'assets/ranks/rank6.png'; // For 48 levels and above
})

// Computed property for dynamic nickname
const displayNick = computed(() => {
  try {
    if (userStore.hasLogin === true) {
      return "我";
    } else if (userStore.hasLogin === false) {
      return "我(登录后进入榜单)";
    }
    return "我"; // Fallback
  } catch (e) {
    console.warn('[EndingSceneApp] Error accessing userStore.hasLogin for displayNick, defaulting to \"我\"', e);
    return "我"; // Fallback in case of any error
  }
});

// Watch for changes in userStore.canPlay to update UI elements
watch(() => userStore.canPlay, (canStillPlay) => {
  console.log(`[EndingSceneApp] userStore.canPlay changed to: ${canStillPlay}`);
  isTryAgainDisabled.value = !canStillPlay;
  showPlayLimitOverlay.value = !canStillPlay;
  userStore.logCurrentPlayStats('[EndingSceneApp] Stats after canPlay changed');
}, { immediate: true });

onMounted(async () => { 
  console.log('[EndingSceneApp] Component mounted.');
  userStore.logCurrentPlayStats('[EndingSceneApp] Stats onMount');

  console.log('[EndingSceneApp] Attempting to fetch real leaderboard data...');
  isLoadingApi.value = true;
  apiError.value = null;
  try {
    const realDataResponse = await submitAndFetchRealLeaderboardData();
    console.log('[EndingSceneApp] Real data received from API (entire response):', JSON.parse(JSON.stringify(realDataResponse))); // Log entire response
    if (realDataResponse && realDataResponse.data) {
      console.log('[EndingSceneApp] Content of realDataResponse.data:', JSON.parse(JSON.stringify(realDataResponse.data))); // Specifically log the data part
    }

    if (realDataResponse && realDataResponse.code === 0 && realDataResponse.data) {
      const apiData = realDataResponse.data;
      //console.log('[EndingSceneApp] Content of apiData.trophies:', JSON.parse(JSON.stringify(apiData.trophies))); // Log trophies array

      if (apiData.history) { 
        currentUserData.value = {
          rank: apiData.history.rank,
          rankPercent: apiData.rank,
          nick: displayNick.value,
          levelsCompleted: apiData.history.level,
          ballsUsed: apiData.history.balls, 
        };
        //console.warn('successful get history data');
      } else {
        console.warn('[EndingSceneApp] API response missing data.history for currentUserData');
        currentUserData.value = {
          rank: null,
          rankPercent: apiData.rank,
          nick: displayNick.value,
          levelsCompleted: 0,
          ballsUsed: 0,
        };
      }

      if (apiData.leaderboard && Array.isArray(apiData.leaderboard)) {
        top50Data.value = apiData.leaderboard.map(player => ({
          rank: player.rank,
          nick: (player.nick && player.nick.trim() !== '') ? player.nick : "腾讯乒乓挑战者",
          levelsCompleted: player.level,
          ballsUsed: player.balls,
        }));
      } else {
        console.warn('[EndingSceneApp] API response missing or invalid data.leaderboard for top50Data');
        top50Data.value = [];
      }
      console.log('[EndingSceneApp] Parsed currentUserData:', currentUserData.value);
      console.log('[EndingSceneApp] Parsed top50Data:', top50Data.value);

      // 新增：赋值奖杯点亮数据
      litTrophies.value = Array.isArray(apiData.trophies) ? apiData.trophies : [];
    } else {
      console.error('[EndingSceneApp] API response error or malformed data:', realDataResponse);
      apiError.value = realDataResponse?.msg || 'API request failed or returned malformed data';
      currentUserData.value = null;
      top50Data.value = [];
      litTrophies.value = [];
    }
  } catch (error) {
    console.error('[EndingSceneApp] Error fetching real leaderboard data:', error);
    apiError.value = error.message || 'Failed to fetch data';
    // Ensure data is cleared on error too
    currentUserData.value = null;
    top50Data.value = [];
    litTrophies.value = [];
  } finally {
    isLoadingApi.value = false;
  }
});

const handleRestartGame = () => {
  userStore.logCurrentPlayStats('[EndingSceneApp] handleRestartGame clicked');
  if (!userStore.canPlay) { // Or check isTryAgainDisabled.value
    //console.log('[EndingSceneApp] 'Try Again' clicked, but no plays left. Triggering tips animation.');
    if (tipsImageRef.value) {
      tipsImageRef.value.classList.add('tips-animate');
      setTimeout(() => {
        if (tipsImageRef.value) { // Check if still exists
            tipsImageRef.value.classList.remove('tips-animate');
        }
      }, 500); // Animation duration
    }
    return; // Do not restart game
  }
  gameStore.restartGame()
}

// Renamed from handleUnlockAllLevels and adapted for in-app sharing
const handleShareInApp = () => {
  userStore.logCurrentPlayStats('[EndingSceneApp] handleShareInApp clicked');
  console.log('[EndingSceneApp] Initiating in-app share...');
  clickReport({
    id: 'share_in_app',
  })

  const levelsCompleted = gameStore.sessionLevelsCompleted;
  const rankPercent = currentUserData.value?.rankPercent || 0; // Consistent fallback to 0
  let shareContent = '';

  if (levelsCompleted === 0) {
    shareContent = '用指尖与全网乒乓高手对决，一起来乒了个乓！';
  } else {
    shareContent = '成功挑战' + levelsCompleted + '关，超全网' + rankPercent + '%的球友，一起来乒了个乓！';
  }

  setShareInfo({
    title: '指尖乒乓挑战赛_腾讯新闻',
    longTitle: shareContent,
    content: shareContent,
    url: 'https://view.inews.qq.com/a/LNK2025052211684300?no-redirect=1',
    imgUrl: 'https://mat1.gtimg.com/rain/apub2019/42bd7e299fc4.shareimg.png', 
  });
  showShareMenu();

  console.log('[EndingSceneApp] Share menu shown (simulated). Starting 5s timer for bonus plays.');
  setTimeout(() => {
    console.log('[EndingSceneApp] 5s timer elapsed. Granting bonus plays for in-app share.');
    userStore.grantBonusPlays(3); // MODIFIED: Changed from 5 to 3 for App-in bonus
    // UI should update automatically via the watcher on userStore.canPlay
  }, 5000);
}
</script>

<style scoped>
.ending-scene {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Adjusted for overall centering of content blocks */
  align-items: center;
  background-color: #121212; /* Match EndingSceneOutside.vue background */
  position: relative;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden; /* Prevent scrollbars if elements slightly exceed due to vh units */
}

.rank-container {
  position: absolute;
  top: 5vh;
  left: 50%;
  transform: translateX(-50%);
  width: 90vw;
  max-width: 90vw; /* Ensure it doesn't get too wide on larger screens */
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rank-desc-text {
  font-size: 1.8vh;
  color: #fff;
  text-align: center;
  width: 100%;
  margin-bottom: 0.5vh;
  margin-left: 0.5vw;
  line-height: 1.2;
}

.rank-image {
  display: block;
  height: 11vh; /* Adjust height as needed */
  width: auto;
  max-width: 90vw;
  object-fit: contain;
  margin-bottom: 2vh; /* Space between rank image and trophy backboard */
}

/* New styles for trophy display area */
.trophy-display-area {
  position: relative; /* Crucial for absolute positioning of lit images */
  /* width and height will be determined by the trophy-backboard-image inside it */
  /* You might need to set explicit dimensions if the backboard image doesn't define them well */
  /* For example, if trophy-backboard-image has a specific height like 10vh: */
  /* height: 10vh; */ 
  /* width: auto; /* or a specific width that matches your backboard aspect ratio */
  line-height: 0; /* To remove any potential space below the backboard image if it's display: inline-block */
}

.trophy-backboard-image {
  display: block; /* Ensures it takes up space correctly and fills the .trophy-display-area if it has no explicit size */
  height: 10vh; /* Copied from existing style */
  width: auto;
  max-width: 100%;
  object-fit: contain;
  /* Make sure this is not absolutely positioned itself, or adjust .lit-trophy-image accordingly */
}

.lit-trophy-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; /* Match the .trophy-display-area size */
  height: 100%; /* Match the .trophy-display-area size */
  object-fit: contain; /* Adjust as needed, 'contain' is usually good for this */
  pointer-events: none; /* So they don't interfere with mouse events if any */
}

/* Leaderboard Styles Start */
.leaderboard-container {
  width: 100%; /* Take up most of the available width */
  max-width: 500px; /* Max width for very large screens */
  margin-top:  21vh; /* Space below rank images */
  margin-bottom: 2vh; /* Space above bottom buttons */
  /* background-color: rgba(0, 0, 0, 0.3); Commented out for transparency */
  background-color: transparent; /* Set to transparent */
  border-radius: 10px;
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* This container will be between top .rank-container and bottom .button-container */
  /* Let's ensure it's correctly positioned if those are absolute */
  /* We might need to adjust the .ending-scene flex properties or add a wrapper */
  position: relative; /* Fallback, ideally centered via flex on parent */
  /* Height will be determined by its content, up to a max with scrolling list */
  padding-right: 5px; /* Space for scrollbar if it appears, prevents content overlap */
  /* Hide scrollbar for Webkit browsers */
  &::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for Firefox */
  scrollbar-width: none;
  /* Hide scrollbar for IE/Edge (older versions) */
  -ms-overflow-style: none;
}

.leaderboard-header,
.leaderboard-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  color: white;
  font-size: 14px; /* Base font size for rows, adjust as needed */
}

.leaderboard-header {
  background-color: #192A6C; /* Dark blue for header */
  font-weight: bold;
}

.leaderboard-row.current-user-row {
  background-color: #3DCD58; /* Bright green for current user */
}

.leaderboard-row:not(.current-user-row) {
  background-color: #2F3A8F; /* Slightly lighter blue for other players */
}

.leaderboard-list {
  max-height: 45vh; /* As discussed, for scrolling */
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none; /* For Webkit browsers */
  }
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For IE/Edge (older versions) */
}

/* Scrollbar styling (optional, browser dependent) - Keeping this section commented out or removed if not needed at all */
/*
.leaderboard-list::-webkit-scrollbar {
  width: 5px;
}
.leaderboard-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}
.leaderboard-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
*/

.col-rank,
.col-levels,
.col-cups {
  flex-basis: 18%; /* Adjusted from 20% to give a bit more to nick, total 3*18 = 54% */
  text-align: center;
  white-space: nowrap;
}

.col-nick {
  flex-basis: 40%; /* As discussed */
  text-align: left; /* Nicknames usually left-aligned */
  padding-left: 10px; /* Indent nickname slightly */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-rank.top-rank-text {
  color: #3DCD58; /* Bright green for rank numbers 1-3 */
  font-weight: bold;
}

/* New styles for play limit UI */
.play-limit-tips-image {
  position: absolute;
  bottom: calc(5% + 6vh + 8px); /* Position above buttons: button bottom + button height + gap */
  left: 70%;
  transform: translateX(-50%);
  width: 60vw; /* Adjust as needed */
  max-width: 250px; /* Adjust as needed */
  height: auto;
  z-index: 10;
}

.tips-animate {
  animation: pulse-scale 0.5s ease-in-out;
}

@keyframes pulse-scale {
  0% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.15);
  }
  100% {
    transform: translateX(-50%) scale(1);
  }
}

/* Styles for the bottom button container, similar to EndingSceneOutside.vue */
.button-container {
  position: absolute;
  bottom: 5%; /* Positioned at the bottom */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px; /* Space between buttons */
  justify-content: center;
  align-items: center;
  width: 80%;
  max-width: 600px; /* Max width for the button row */
}

/* Styles for the image buttons, similar to EndingSceneOutside.vue */
.restart-image-button,
.share-image-button {
  height: 6vh; /* Adjust size as needed */
  width: auto;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  /* border-radius: 5px; (Optional, if you want rounded corners on images) */
}

.restart-image-button.disabled-button {
  opacity: 0.5;
  cursor: not-allowed; /* Optional: good for desktop, less relevant on mobile */
  /* transform: scale(0.95); Optional: slightly smaller when disabled */
}

.restart-image-button:not(.disabled-button):hover,
.share-image-button:hover {
  transform: scale(1.05);
}

/* Removed old .ending-content, .env-info, .action-button, .special-button styles as they are no longer used */
</style> 