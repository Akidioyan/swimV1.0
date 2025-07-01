<template>
  <div class="video-scene">
    <video 
      ref="videoElement"
      class="opening-video"
      :src="videoSrc"
      @ended="handleVideoEnd"
      @loadeddata="handleVideoLoaded"
      @error="handleVideoError"
      autoplay
      muted
      playsinline
    >
      您的浏览器不支持视频播放。
    </video>
    
    <!-- 跳过按钮 -->
    <button 
      v-if="showSkipButton" 
      class="skip-button"
      @click="skipVideo"
    >
      跳过 {{ skipCountdown }}s
    </button>
    
    <!-- 加载提示 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-text">加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStateStore } from '../stores/gamestore/gameState'
const gameStateStore = useGameStateStore()
const videoElement = ref(null)
const isLoading = ref(true)
const showSkipButton = ref(false)
const skipCountdown = ref(3)

const videoSrc = '/OpeningVideo.mp4'

let skipTimer = null
let countdownTimer = null

const handleVideoLoaded = () => {
  isLoading.value = false
  // 3秒后显示跳过按钮
  skipTimer = setTimeout(() => {
    showSkipButton.value = true
    startCountdown()
  }, 3000)
}

const handleVideoEnd = () => {
  // 视频播放完毕，开始游戏
  gameStateStore.startGameFromVideo()
}

const handleVideoError = () => {
  console.error('视频加载失败，直接开始游戏')
  gameStateStore.startGameFromVideo()
}

const skipVideo = () => {
  // 跳过视频，直接开始游戏
  if (videoElement.value) {
    videoElement.value.pause()
  }
  gameStateStore.startGameFromVideo()
}

const startCountdown = () => {
  countdownTimer = setInterval(() => {
    skipCountdown.value--
    if (skipCountdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

onMounted(() => {
  // 确保视频元素存在
  if (videoElement.value) {
    videoElement.value.load()
  }
})

onUnmounted(() => {
  // 清理定时器
  if (skipTimer) clearTimeout(skipTimer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.video-scene {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.opening-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.skip-button {
  position: absolute;
  top: 30px;
  right: 30px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  z-index: 10;
}

.skip-button:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
}

.loading-text {
  color: rgb(0, 0, 0);
  font-size: 24px;
  font-weight: bold;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skip-button {
    top: 20px;
    right: 20px;
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .loading-text {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .skip-button {
    top: 15px;
    right: 15px;
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .loading-text {
    font-size: 18px;
  }
}
</style>