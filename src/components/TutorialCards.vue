<template>
  <!-- 教学卡片显示：只有在显示教学卡片且没有显示障碍物提示时才显示 -->
  <div v-if="showTutorial && !showObstacleBanner" class="tutorial-overlay">
    <!-- 简化的卡片容器 -->
    <div class="tutorial-main">
      <!-- 单张卡片显示 -->
      <div class="card">
        <div class="card-content"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- 顶部标题区域 -->
          <div class="title-section">
            <h2 class="title-text">
              <img src="/vector/hint.svg" class="hint-icon" alt="提示图标">
              提示
            </h2>
          </div>
          
          <!-- 分割线 -->
          <div class="divider-line"></div>
          
          <!-- 图片区域 -->
          <div class="image-section">
            <!-- 左箭头 -->
            <button 
              class="nav-arrow"
              @click="prevCard"
              :disabled="currentCardIndex === 0"
            >
              <img src="/vector/Vec-left.svg" alt="上一张" class="arrow-svg" />
            </button>
            
            <!-- 图片显示：统一使用雪碧图 -->
            <div class="image-container">
              <div 
                class="sprite-image"
                :class="getSpriteClass(currentCardIndex)"
              ></div>
            </div>
            
            <!-- 右箭头 -->
            <button 
              class="nav-arrow"
              @click="nextCard"
            >
              <img src="/vector/Vec-right.svg" alt="下一张" class="arrow-svg" />
            </button>
          </div>
          
          <!-- 底部描述文字 -->
          <div class="description-section">
            <p class="description-text" v-html="currentCard.description"></p>
          </div>
          
          <!-- 进度指示器 -->
          <div class="progress-indicator">
            <div 
              v-for="(card, index) in cards" 
              :key="index"
              class="progress-dot"
              :class="{ 'active': index === currentCardIndex }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Ready Go 动画 -->
    <div v-if="showReadyGo" class="ready-go-container">
      <Vue3Lottie 
        :animationData="readyGoAnimation" 
        :height="200" 
        :width="200" 
        @onComplete="onReadyGoComplete"
      />
    </div>
  </div>
  
  <!-- 三页式教学提示：替换原来的 pause-hint -->
  <div v-if="showPauseHint && !showObstacleBanner" class="tutorial-pages-container">
    <!-- 第一页：操作玩法提示 -->
    <div v-if="currentTutorialPage === 1" class="tutorial-page" @click="nextTutorialPage">
      <div class="tutorial-bg"></div>
      <div class="tutorial-content-1">
        <!-- 游戏界面展示 -->
        <div class="game-demo-area">
          <div class="swimmer-demo">🏊‍♂️</div>
          <div class="lane-indicators">
            <div class="lane"></div>
            <div class="lane"></div>
            <div class="lane"></div>
            <div class="lane"></div>
          </div>
        </div>
        
        <!-- 操作说明 -->
        <div class="operation-instructions">
          <div class="instruction-group">
            <div class="left-instruction">
              <div class="tutorial-arrow-left">←</div>
              <p>点左半屏，向左移动</p>
            </div>
            <div class="right-instruction">
              <div class="tutorial-arrow-right">→</div>
              <p>点右半屏，向右移动</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二页：Ready 准备页面 -->
    <div v-if="currentTutorialPage === 2" class="tutorial-page" @click="nextTutorialPage">
      <div class="tutorial-bg"></div>
      <div class="tutorial-content-2">
        <h1 class="ready-text">READY</h1>
        <div class="finger-emoji">👆</div>
      </div>
    </div>

    <!-- 第三页：GO 开始页面 -->
    <div v-if="currentTutorialPage === 3" class="tutorial-page" @click="startGame">
      <div class="tutorial-bg"></div>
      <div class="tutorial-content-3">
        <h1 class="go-text">GO</h1>
        <div class="finger-emoji">👆</div>
      </div>
    </div>
  </div>
  
  <!-- 障碍物横幅动画：替换原来的弹窗提示 -->
  <div v-if="showObstacleBanner" class="obstacle-banner-container">
    <!-- 上半部分横幅 - 使用左侧图片 -->
    <div id="obstacle-banner-up" class="obstacle-banner-part obstacle-banner-up">
      <img src="/card/tip1-left.png" alt="小心障碍物" class="banner-image banner-image-left">
    </div>
    
    <!-- 下半部分横幅 - 使用右侧图片 -->
    <div id="obstacle-banner-bottom" class="obstacle-banner-part obstacle-banner-bottom">
      <img src="/card/tip1-right.png" alt="避开障碍物" class="banner-image banner-image-right">
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Vue3Lottie } from 'vue3-lottie'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { gsap } from 'gsap'

const gameStateStore = useGameStateStore()

// 修改组件状态初始化，根据游戏状态决定是否显示教学卡片
// 组件状态
const showTutorial = ref(gameStateStore.isFirstTimeGame)
const currentCardIndex = ref(0)
const showReadyGo = ref(false)
const showPauseHint = ref(false)
const showObstacleBanner = ref(false) // 新增横幅动画状态

// 触摸事件处理相关状态
const touchState = ref({
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  isTouching: false
})

// 滑动敏感度配置
const swipeConfig = {
  minDistance: 50, // 最小滑动距离（像素）
  maxVerticalDistance: 100 // 最大垂直偏移距离（像素）
}

// 触摸开始处理
const handleTouchStart = (event) => {
  const touch = event.touches[0]
  touchState.value = {
    startX: touch.clientX,
    startY: touch.clientY,
    currentX: touch.clientX,
    currentY: touch.clientY,
    isTouching: true
  }
}

// 触摸移动处理
const handleTouchMove = (event) => {
  if (!touchState.value.isTouching) return
  
  event.preventDefault() // 防止页面滚动
  const touch = event.touches[0]
  touchState.value.currentX = touch.clientX
  touchState.value.currentY = touch.clientY
}

// 触摸结束处理
const handleTouchEnd = (event) => {
  if (!touchState.value.isTouching) return
  
  const deltaX = touchState.value.currentX - touchState.value.startX
  const deltaY = touchState.value.currentY - touchState.value.startY
  
  // 检查是否为有效的水平滑动
  const isHorizontalSwipe = Math.abs(deltaX) >= swipeConfig.minDistance && 
                           Math.abs(deltaY) <= swipeConfig.maxVerticalDistance
  
  if (isHorizontalSwipe) {
    if (deltaX > 0) {
      // 向右滑动 - 显示上一张卡片
      prevCard()
    } else {
      // 向左滑动 - 显示下一张卡片  
      nextCard()
    }
  }
  
  // 重置触摸状态
  touchState.value.isTouching = false
}

// 预加载障碍物提示图片
const preloadObstacleImages = () => {
  const imageUrls = ['/card/tip1-left.png', '/card/tip1-right.png']
  imageUrls.forEach(url => {
    const img = new Image()
    img.src = url
  })
}

// 初始化GSAP设置
const initGsapSettings = () => {
  gsap.set('#obstacle-banner-up', { xPercent: -110 })
  gsap.set('#obstacle-banner-bottom', { xPercent: 110 })
}

// 如果不是首次游戏，直接开始游戏
if (!gameStateStore.isFirstTimeGame) {
  // 延迟调用以确保组件已挂载
  setTimeout(() => {
    gameStateStore.actuallyStartGame()
  }, 100)
}

// 监听障碍物提示事件（只在首次游戏时监听）
const handleShowObstacleHint = () => {
  console.log('📡 接收到障碍物提示事件', {
    isFirstTimeGame: gameStateStore.isFirstTimeGame,
    currentShowObstacleBanner: showObstacleBanner.value,
    currentGameState: gameStateStore.gameState
  })
  
  // 只有在首次游戏时才显示障碍物横幅动画
  if (gameStateStore.isFirstTimeGame) {
    // 不暂停游戏，直接显示横幅动画
    showObstacleBanner.value = true
    console.log('✅ 障碍物横幅动画已显示')
  } else {
    console.log('❌ 不是首次游戏，跳过障碍物提示')
  }
}

// 监听横幅显示状态变化，执行GSAP动画
watch(() => showObstacleBanner.value, (isVisible) => {
  if (isVisible) {
    // 每次显示时重新设置初始位置
    gsap.set('#obstacle-banner-up', { xPercent: -110 })
    gsap.set('#obstacle-banner-bottom', { xPercent: 110 })

    // 确保设置完初始位置后再开始动画
    requestAnimationFrame(() => {
      const bannerTl = gsap.timeline({
        onComplete: () => {
          showObstacleBanner.value = false
          console.log('🎬 障碍物横幅动画完成')
        }
      });

      // 阶段1：滑入动画 (0.5秒)
      bannerTl.to(['#obstacle-banner-up', '#obstacle-banner-bottom'], {
        xPercent: 0,
        duration: 0.5,
        ease: "power2.out"
      });

      // 阶段2：暂停显示 (2秒)
      // 阶段3：滑出动画 (0.5秒) - 延迟2.5秒后开始
      bannerTl.to('#obstacle-banner-up', {
        xPercent: 100, 
        duration: 0.5,
        ease: "power2.in"
      }, 2.5);

      bannerTl.to('#obstacle-banner-bottom', {
        xPercent: -100, 
        duration: 0.5,
        ease: "power2.in"
      }, "<"); // 与上一个动画同时开始
    });
  } 
});

// 组件挂载时添加事件监听器和初始化
onMounted(() => {
  console.log('🎯 TutorialCards组件已挂载，添加障碍物提示事件监听器', {
    isFirstTimeGame: gameStateStore.isFirstTimeGame,
    hasShownObstacleHint: gameStateStore.hasShownObstacleHint
  })
  window.addEventListener('showObstacleHint', handleShowObstacleHint)
  preloadObstacleImages() // 预加载图片
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
  console.log('🎯 TutorialCards组件即将卸载，移除障碍物提示事件监听器')
  window.removeEventListener('showObstacleHint', handleShowObstacleHint)
})

// 教学卡片数据 - 整合两个文件的卡片数据
const cards = ref([
  {
    // 移除 image 属性，使用雪碧图第一帧（障碍物）
    description: '避开这些障碍物'
  },
  {
    // 移除 image 属性，使用雪碧图第二帧（星星）
    description: '星星可以加分'
  },
  {
    // 移除 image 属性，使用雪碧图第三帧（冲刺潜水）
    description: '在水底无敌冲刺'
  }
])

// 当前卡片
const currentCard = computed(() => cards.value[currentCardIndex.value])

// 获取雪碧图类名
const getSpriteClass = (index) => {
  return `sprite-${index + 1}`
}

// 下一张卡片
const nextCard = () => {
  if (currentCardIndex.value < cards.value.length - 1) {
    currentCardIndex.value++
  } else {
    // 在最后一张卡片（第三张），隐藏教学卡片并显示暂停提示
    showTutorial.value = false
    showPauseHint.value = true
  }
}

// 上一张卡片
const prevCard = () => {
  if (currentCardIndex.value > 0) {
    currentCardIndex.value--
  }
}

// Ready Go动画完成
const onReadyGoComplete = () => {
  startGame()
}

// 新增教学页面相关状态
const currentTutorialPage = ref(1) // 当前教学页面 (1, 2, 3)

// 下一个教学页面
const nextTutorialPage = () => {
  if (currentTutorialPage.value === 1) {
    // 从第一页到第二页
    currentTutorialPage.value = 2
  } else if (currentTutorialPage.value === 2) {
    // 从第二页到第三页
    currentTutorialPage.value = 3
  }
}

// 重置教学页面状态
const resetTutorialPages = () => {
  currentTutorialPage.value = 1
}

// 修改开始游戏函数
const startGame = () => {
  showTutorial.value = false
  showReadyGo.value = false
  showPauseHint.value = false
  resetTutorialPages() // 重置教学页面状态
  gameStateStore.actuallyStartGame()
}

// 暴露给父组件的方法
defineExpose({
  showTutorial,
  startGame
})
</script>

<style scoped>
.tutorial-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.tutorial-main {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  width: 65.87dvw;
  height: 68dvw;
  position: relative;
}

.card-content {
  width: 100%;
  height: 100%;
  background: rgb(255, 235, 210);
  border: 2px solid rgb(114, 51, 46);
  border-radius: 5.29dvw; /* 20px / 378px * 100 */
  display: flex;
  flex-direction: column;
  padding: 3.97dvw 3.97dvw 2.65dvw; /* 15px 15px 10px */
  box-sizing: border-box;
  position: relative;
  /* 触摸体验优化 */
  user-select: none; /* 禁用文本选择 */
  -webkit-user-select: none;
  -webkit-touch-callout: none; /* 禁用iOS长按菜单 */
  touch-action: pan-y; /* 允许垂直滚动，但处理水平滑动 */
  cursor: grab; /* 鼠标悬停时显示可拖拽光标 */
}

.card-content:active {
  cursor: grabbing; /* 触摸时显示抓取光标 */
}

.title-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.85dvw; /* 7px */
}

.title-text {
  margin: 0;
  color: rgb(114, 51, 46);
  font-size: 5.29dvw; /* 20px */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  line-height: 7.41dvw; /* 28px */
  text-align: center;
  display: flex;
  align-items: center;
}

.hint-icon {
  width: 4.5dvw; /* 17px */
  height: 5.29dvw; /* 20px */
  margin-right: 2.12dvw; /* 8px - 图标右侧间距 */
  margin-top: 0.53dvw; /* 2px */
  vertical-align: middle; /* 确保图标与文字垂直对齐 */
}

.divider-line {
  width: 43.39dvw; /* 164px */
  height: 0;
  border-top: 2px dashed rgb(114, 51, 46);
  margin: 0 auto 3.97dvw; /* 15px */
}

.image-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3.7dvw; /* 14px */
  height: 26.46dvw; /* 100px */
  width: 100%;
  padding: 0 10.6dvw; /* 为箭头预留空间 */
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26.46dvw; /* 100px */
  height: 26.46dvw; /* 100px */
}

.card-image {
  width: 26.46dvw; /* 100px */
  height: 26.46dvw; /* 100px */
  object-fit: contain;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 7.41dvw; /* 28px */
  height: 7.41dvw; /* 28px */
  border: 2px solid rgb(114, 51, 46);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-arrow:first-child {
  left: 0; /* 修改为0 */
}

.nav-arrow:last-child {
  right: 0; /* 修改为0 */
}

.nav-arrow:hover:not(:disabled) {
  background: rgba(114, 51, 46, 0.1);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.arrow-svg {
  width: 2.65dvw; /* 10px */
  height: 3.97dvw; /* 15px */
  object-fit: contain;
}

.nav-arrow:disabled .arrow-svg {
  opacity: 0.5;
}

.sprite-image {
  width: 26.46dvw; /* 100px */
  height: 26.46dvw; /* 100px */
  background-image: url('/card/tur_card.png');
  background-size: 200% 200%; /* 雪碧图是2列2行，所以放大2倍宽度，2倍高度 */
  background-repeat: no-repeat;
}

/* 第一行第一列 - 障碍物（教学卡片1） */
.sprite-1 {
  background-position: 0% 0%; /* 左上角第一帧 */
}

/* 第一行第二列 - 星星（教学卡片2） */
.sprite-2 {
  background-position: 100% 0%; /* 右上角第二帧 */
}

/* 第二行第一列 - 潜水镜（教学卡片3） */
.sprite-3 {
  background-position: 0% 100%; /* 左下角第三帧 */
}

/* 第二行第二列 - 障碍物提示卡片（首次碰到障碍物时） */
.sprite-4 {
  background-position: 100% 100%; /* 右下角第四帧 */
}

/* 保留sprite-5用于障碍物提示（使用第三帧） */
.sprite-5 {
  background-position: 0% 100%; /* 与sprite-3相同，左下角第三帧 */
}

/* 如果需要第四帧的别名 */
.sprite-6 {
  background-position: 100% 100%; /* 与sprite-4相同，右下角第四帧 */
}


/* 单独图片显示区域 */
.image-section-single {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3.97dvw; /* 15px */
}

/* 障碍物提示文字样式 */
.obstacle-hint-text {
  color: rgb(114, 51, 46);
  font-size: 5.03dvw; /* 19px */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  line-height: 7.04dvw; /* 26.6px */
}

.description-section {
  text-align: center;
  margin-bottom: 3.7dvw; /* 14px */
}

.description-text {
  margin: 0;
  color: rgb(114, 51, 46);
  font-size: 5.03dvw; /* 19px */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  line-height: 7.04dvw; /* 26.6px */
}

.progress-indicator {
  display: flex;
  justify-content: center;
  gap: 2.12dvw; /* 8px */
  margin-top: auto;
  padding-bottom: 1.32dvw; /* 5px */
}

.progress-dot {
  width: 1.59dvw; /* 6px */
  height: 1.59dvw; /* 6px */
  border-radius: 50%;
  background: rgba(114, 51, 46, 0.3);
  transition: all 0.2s ease;
}

.progress-dot.active {
  background: rgb(114, 51, 46);
}

.ready-go-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
}

/* 三页式教学提示样式 */
.tutorial-pages-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  cursor: pointer;
}

.tutorial-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tutorial-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1;
}

/* 第一页：操作玩法提示样式 */
.tutorial-content-1 {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8dvh;
  color: white;
  text-align: center;
}

.game-demo-area {
  position: relative;
  width: 54dvw; /* 202.5/375*100 */
  height: 17.3dvh; /* 135/779*100 */
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2.7dvw;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.swimmer-demo {
  font-size: 8dvw;
  animation: swimDemo 2s ease-in-out infinite;
}

.lane-indicators {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 2.7dvw;
}

.lane {
  width: 0.5dvw;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
}

.operation-instructions {
  width: 100%;
}

.instruction-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 84.5dvw;
  margin: 0 auto;
}

.left-instruction,
.right-instruction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.7dvw;
}

.left-instruction p,
.right-instruction p {
  font-size: 4dvw; 
  font-weight: 600;
  line-height: 5.6dvw;
  margin: 0;
  width: 36.8dvw; 
}

.tutorial-arrow-left,
.tutorial-arrow-right {
  width: 4.4dvw; 
  height: 8.8dvw; 
  border: 0.8dvw solid white; 
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.2dvw;
  color: white;
  border-radius: 1.3dvw;
}

/* 第二页和第三页：Ready/GO样式 */
.tutorial-content-2,
.tutorial-content-3 {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5.3dvh;
  color: white;
  text-align: center;
  width: 100%;
  justify-content: center;
  padding: 0 4dvw;
  box-sizing: border-box;
}

.ready-text,
.go-text {
  font-size: 12dvw; 
  font-weight: 600;
  line-height: 16.8dvw; /* 相应调整行高 */
  margin: 0;
  text-shadow: 0 1dvh 2dvh rgba(0, 0, 0, 0.5);
  text-align: center;
  width: 100%;
  display: block;
}

.finger-emoji {
  font-size: 12dvw; /* 手指emoji大小 */
  animation: fingerPulse 1.5s ease-in-out infinite;
  margin-top: 4dvh;
}

/* 动画效果 */
@keyframes swimDemo {
  0%, 100% { 
    transform: translateX(-5dvw) translateY(0); 
  }
  50% { 
    transform: translateX(5dvw) translateY(-1dvw); 
  }
}

@keyframes fingerPulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* 障碍物横幅动画样式 */
.obstacle-banner-container {
  position: absolute;
  top: 25%; /* 屏幕上方20%位置 */
  left: 50%;
  transform: translate(-50%,-50%);
  width: 100%;
  max-width: 60dvw;
  z-index: 20; 
  pointer-events: none;
  overflow: hidden;
  /* 关键：消除容器内的空白 */
  font-size: 0;
}

.obstacle-banner-part {
  /* 消除div容器的影响 */
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 0;
  line-height: 0;
}

.obstacle-banner-up {
  /* tip1-left 在上方 */
}

.obstacle-banner-bottom {
  /* tip1-right 在下方 */
}

.banner-image {
  display: block;
  width: 100%;
  height: auto; 
  position: relative;
  /* 关键：消除图片的默认样式影响 */
  margin: 0;
  padding: 0;
  border: 0;
  vertical-align: top; /* 消除baseline对齐造成的空隙 */
  font-size: 0;
  line-height: 0;
}

.banner-image-left {
  /* 确保上方图片紧贴 */
  margin-bottom: 0;
}

.banner-image-right {
  /* 确保下方图片紧贴 */
  margin-top: 0;
}

/* 在现有的 .banner-image 样式后添加以下样式 */

/* 修改 .banner-image-left 样式，添加居中对齐 */
.banner-image-left {
  width: calc(100% / 3) !important;
  max-width: calc(80dvw / 3) !important;
  height: auto;
  display: block;
  margin: 0 auto; /* 水平居中 */
}
</style>