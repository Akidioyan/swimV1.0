<template>
  <div class="ending-scene">
    <div class="rank-container">
      <div class="rank-desc-text">
        <template v-if="gameStore.sessionLevelsCompleted === 0">
          止步在第一关，赶快点击左下角再次挑战！
        </template>
        <template v-else>
          成功挑战{{ gameStore.sessionLevelsCompleted }}关，超越了全网{{ currentUserData?.rankPercent }}%的球友，获得：
        </template>
      </div>
      <img :src="rankImageSrc" class="rank-image" alt="玩家称号">
      <div class="trophy-display-area">
        <img src="/assets/trophyBackboard.png" class="trophy-backboard-image" alt="奖杯底板">
        <!-- 动态点亮奖杯图片 -->
        <img v-if="litTrophies.includes('CUP_COLLECTOR_20')" src="/assets/trophy/lit/1.png" class="lit-trophy-image" alt="点亮奖杯1">
        <img v-if="litTrophies.includes('CUP_COLLECTOR_100')" src="/assets/trophy/lit/2.png" class="lit-trophy-image" alt="点亮奖杯2">
        <img v-if="litTrophies.includes('CUP_COLLECTOR_300')" src="/assets/trophy/lit/3.png" class="lit-trophy-image" alt="点亮奖杯3">
        <img v-if="litTrophies.includes('METAL_BUSTER')" src="/assets/trophy/lit/4.png" class="lit-trophy-image" alt="点亮奖杯4">
        <img v-if="litTrophies.includes('ONE_SHOT_CLEAR')" src="/assets/trophy/lit/5.png" class="lit-trophy-image" alt="点亮奖杯5">
        <img v-if="litTrophies.includes('LEVEL_CONQUEROR_5')" src="/assets/trophy/lit/6.png" class="lit-trophy-image" alt="点亮奖杯6">
      </div>
    </div>

    <!-- Play Limit Tips Image (needShareToPlayTips.png) -->
    <img 
      v-if="showNeedShareTipsImage" 
      ref="tipsImageRef" 
      src="/assets/needShareToPlayTips.png" 
      class="play-limit-tips-image" 
      alt="分享提示"
    >

    <!-- <div class="ending-content">
      <h1>恭喜过关，这页正在开发中，你的乒乓准度值: {{ gameStore.totalFallenCupsThisSession }} ，使用腾讯新闻客户端解锁全部99局挑战，获得你的世界排名</h1>
      <div class="env-info">当前环境：APP 外 打开</div>
    </div> -->

    <!-- Centered "Open App" image button -->
    <div class="center-button-container">
      <img src="/assets/openApp.png" @click="handleOpenApp" class="open-app-image-button" alt="打开APP解锁全部关卡">
    </div>

    <!-- Bottom image buttons -->
    <div class="button-container">
      <img 
        src="/assets/tryAgain.png" 
        @click="handleRestartGame" 
        class="restart-image-button" 
        :class="{ 'disabled-button': isTryAgainDisabled }" 
        alt="再次挑战"
      >
      <img src="/assets/shareToFriend.png" @click="handleShareToFriendClick" class="share-image-button" alt="分享给朋友">
    </div>

    <!-- Share overlay and arrow -->
    <div v-if="shareArrowOverlayIsVisible" class="share-overlay" @click="handleOverlayClick">
      <img src="/assets/shareArrow.png" class="share-instruction-arrow" alt="点击此处分享">
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { openNativeScheme } from '../utils/appDownload'
import { submitAndFetchRealLeaderboardData } from '../utils/request'
import { TrophyTypes } from '../game/trophyTypes.js'
import { clickReport } from '../utils/report';

const gameStore = useGameStore()
const userStore = useUserStore()

const currentUserData = ref(null);
const shareArrowOverlayIsVisible = ref(false)

// Reactive state for play limits and the main "need to share" image
const showNeedShareTipsImage = ref(false)
const isTryAgainDisabled = ref(false)
const tipsImageRef = ref(null)
const litTrophies = ref([])

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

// Watch for changes in userStore.canPlay to update UI elements
watch(() => userStore.canPlay, (canStillPlay) => {
  console.log(`[EndingSceneOutside] userStore.canPlay changed to: ${canStillPlay}`)
  isTryAgainDisabled.value = !canStillPlay
  showNeedShareTipsImage.value = !canStillPlay
  userStore.logCurrentPlayStats('[EndingSceneOutside] Stats after canPlay changed')
}, { immediate: true })

onMounted(async () => {
  try {
    const realDataResponse = await submitAndFetchRealLeaderboardData();
    if (realDataResponse && realDataResponse.code === 0 && realDataResponse.data) {
      const apiData = realDataResponse.data;
      litTrophies.value = Array.isArray(apiData.trophies) ? apiData.trophies : [];
      currentUserData.value = { rankPercent: apiData.rank };
    } else {
      litTrophies.value = [];
      currentUserData.value = { rankPercent: 33 };
    }
  } catch (e) {
    litTrophies.value = [];
    currentUserData.value = { rankPercent: 66 };
  }
})

const handleRestartGame = () => {
  userStore.logCurrentPlayStats('[EndingSceneOutside] handleRestartGame clicked')
  if (!userStore.canPlay) {
    if (showNeedShareTipsImage.value && tipsImageRef.value) {
      tipsImageRef.value.classList.add('tips-animate')
      setTimeout(() => {
        if (tipsImageRef.value) {
          tipsImageRef.value.classList.remove('tips-animate')
        }
      }, 500)
    }
    return
  }
  gameStore.restartGame()
}

const handleOpenApp = () => {
  clickReport({
    id: 'open_app',
  })
  openNativeScheme('qqnews://article_9527?nm=LNK2025052211684300', 'pingpong')
}

const handleShareToFriendClick = () => {
  clickReport({
    id: 'share_in_outside',
  })
  userStore.logCurrentPlayStats('[EndingSceneOutside] handleShareToFriendClick clicked')
  
  // If already can play, perhaps the user just wants to share normally?
  // For now, this button's primary function when plays are out is to get more plays.
  // If plays are available, it will still show the arrow and grant bonus on timeout for consistency.

  shareArrowOverlayIsVisible.value = true

  console.log('[EndingSceneOutside] Share action initiated (showing arrow). Simulating share & starting 5s timer for bonus plays.')
  setTimeout(() => {
    console.log('[EndingSceneOutside] 5s timer elapsed. Granting bonus plays for outside-app share.')
    userStore.grantBonusPlays(3)
    // shareArrowOverlayIsVisible.value = false // Optional: hide arrow after granting bonus
    // The watch on userStore.canPlay will hide showNeedShareTipsImage if plays are granted.
  }, 5000)
}

const handleOverlayClick = () => {
  shareArrowOverlayIsVisible.value = false
}
</script>

<style scoped>
.ending-scene {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #121212;
  position: relative;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.rank-container {
  position: absolute;
  top: 5vh;
  left: 50%;
  transform: translateX(-50%);
  width: 90vw;
  max-width: 90vw;
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
  line-height: 1.2;
}

.rank-image {
  display: block;
  height: 11vh;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

.trophy-display-area {
  position: relative;
  line-height: 0;
}

.trophy-backboard-image {
  display: block;
  height: 10vh;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

.lit-trophy-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.ending-content {
  text-align: center;
  color: white;
  padding-top: 20%;
  margin-bottom: 20px;
}

.env-info {
  margin-top: 20px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: white;
  font-size: 16px;
}

.center-button-container {
  position: absolute;
  left: 50%;
  top: 60%; 
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 85vw;
  padding: 0;
}

.open-app-image-button {
  display: block;
  height: 50vh;
  width: auto; 
  max-width: 100%;
  object-fit: contain;
  cursor: pointer;
}

.button-container {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  width: 80%;
  max-width: 600px;
}

.action-button {
  padding: 15px 30px;
  font-size: 18px;
  background-color: white;
  color: #39c09f;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s;
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
}

.restart-image-button,
.share-image-button {
  height: 6vh;
  width: auto;
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 5px;
}


.share-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.share-instruction-arrow {
  width: 100px;
  height: auto;
  margin-top: 20px;
  margin-right: 20px;
}

/* Styles for Play Limit and Disabled Button (copied from EndingSceneApp.vue) */
.disabled-button {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-limit-tips-image {
  position: absolute;
  bottom: calc(5% + 6vh + 5px);
  left: 70%;
  transform: translate(-50%, -50%);
  width: 70vw;
  max-width: 300px;
  z-index: 5;
  pointer-events: none;
}

.tips-animate {
  animation: pulse-scale 0.5s ease-in-out;
}

@keyframes pulse-scale {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}
</style> 