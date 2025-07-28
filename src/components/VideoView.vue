<template>
  <div class="video-scene">
    <!-- 添加占位图片，在视频加载前显示 -->
    <div 
      v-if="showPlaceholder" 
      class="placeholder-image"
      :style="{ backgroundImage: 'url(/OpeningImg.png)' }"
    >
    </div>
    
    <video 
      ref="videoElement"
      class="opening-video"
      :class="{ 'video-hidden': showPlaceholder }"
      @ended="handleVideoEnd"
      @error="handleVideoError"
      @loadstart="handleVideoLoadStart"
      @canplay="handleVideoCanPlay"
      @playing="handleVideoPlaying"
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStateStore } from '../stores/gamestore/gameState'
import audioManager from '../utils/audio-manager'

const gameStateStore = useGameStateStore()
const videoElement = ref(null)
const showSkipButton = ref(false)
const skipCountdown = ref(3)
const showPlaceholder = ref(true) // 新增：控制占位图显示

let skipTimer = null
let countdownTimer = null

// 新增：视频加载开始事件
const handleVideoLoadStart = () => {
  console.log('🎬 视频开始加载')
  showPlaceholder.value = true
}

// 新增：视频可以播放事件
const handleVideoCanPlay = () => {
  console.log('🎬 视频可以播放，隐藏占位图')
  showPlaceholder.value = false
}

// 新增：视频开始播放事件
const handleVideoPlaying = () => {
  console.log('🎬 视频开始播放')
  showPlaceholder.value = false
  
  // 0.3秒后显示跳过按钮
  if (!showSkipButton.value) {
    skipTimer = setTimeout(() => {
      showSkipButton.value = true
      startCountdown()
    }, 300)
  }
}

onMounted(() => {
  console.log('🎬 VideoView 组件挂载')
  
  // 开始播放背景音乐
  console.log('🎵 VideoView: 开始播放背景音乐')
  audioManager.playBackgroundMusic()
  
  // 初始显示占位图
  showPlaceholder.value = true
  
  // 优先使用IntroView预准备的视频
  const loadedResources = gameStateStore.getLoadedResources()
  
  if (loadedResources && loadedResources.preparedVideoElement) {
    console.log('✅ 发现IntroView预准备的视频，直接使用')
    const preparedVideo = loadedResources.preparedVideoElement
    
    if (videoElement.value) {
      try {
        // 将预准备的视频内容复制到当前video元素
        videoElement.value.src = preparedVideo.src
        videoElement.value.currentTime = 0
        videoElement.value.muted = true
        videoElement.value.playsInline = true
        
        console.log('🎬 使用预准备视频，立即播放')
        
        // 由于视频已经预准备，可以立即播放
        videoElement.value.play().then(() => {
          console.log('🎬 预准备视频播放成功')
        }).catch(error => {
          console.warn('⚠️ 预准备视频播放失败，回退到原方案:', error)
          handleVideoError()
        })
        
        // 清理预准备的视频资源
        delete loadedResources.preparedVideoElement
        
      } catch (error) {
        console.error('❌ 使用预准备视频失败:', error)
        handleVideoError()
      }
    }
  } else if (loadedResources && loadedResources.videoElement) {
    console.log('✅ 发现预加载的视频资源')
    const preloadedVideo = loadedResources.videoElement
    
    if (videoElement.value) {
      try {
        // 直接设置视频源，让浏览器处理缓存
        videoElement.value.src = '/video/OpeningVideo.mp4'
        videoElement.value.currentTime = 0
        videoElement.value.muted = true
        videoElement.value.playsInline = true
        
        console.log('🎬 开始播放视频')
        
        // 直接尝试播放
        videoElement.value.play().then(() => {
          console.log('🎬 视频播放成功')
        }).catch(error => {
          console.warn('⚠️ 视频播放失败:', error)
          handleVideoError()
        })
        
      } catch (error) {
        console.error('❌ 视频设置失败:', error)
        handleVideoError()
      }
    }
  } else {
    console.warn('⚠️ 视频资源未预加载，尝试直接播放')
    // 即使没有预加载，也尝试直接播放
    if (videoElement.value) {
      videoElement.value.src = '/video/OpeningVideo.mp4'
      videoElement.value.play().catch(error => {
        console.warn('⚠️ 直接播放失败:', error)
        handleVideoError()
      })
    }
  }
})

// 视频播放完毕，开始游戏
const handleVideoEnd = () => {
  gameStateStore.startGameFromVideo()
}

const handleVideoError = () => {
  console.error('视频播放失败，直接开始游戏')
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

/* 新增：占位图片样式 */
.placeholder-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
  transition: opacity 0.3s ease;
}

.opening-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  transition: opacity 0.3s ease;
}

/* 新增：视频隐藏状态 */
.video-hidden {
  opacity: 0;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .skip-button {
    top: 20px;
    right: 20px;
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .skip-button {
    top: 15px;
    right: 15px;
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>