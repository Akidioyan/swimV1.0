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
              <img src="/vector/left.svg" alt="上一张" class="arrow-svg" />
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
              <img src="/vector/right.svg" alt="下一张" class="arrow-svg" />
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
    <!-- 操作玩法教学页面 -->
    <div class="tutorial-page" @click="startGame">
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
              <div class="tutorial-arrow-left">👆</div>
              <p>点击左半屏<br>向左切换泳道</p>
            </div>
            <div class="right-instruction">
              <div class="tutorial-arrow-right">👆</div>
              <p>点击右半屏<br>向右切换泳道</p>
            </div>
          </div>
        </div>
        

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

// 初始化GSAP设置 - 修改为安全检查版本
const initGsapSettings = () => {
  // 只有在元素存在时才设置GSAP属性
  const bannerUp = document.querySelector('#obstacle-banner-up')
  const bannerBottom = document.querySelector('#obstacle-banner-bottom')
  
  if (bannerUp) {
    gsap.set('#obstacle-banner-up', { xPercent: -110 })
  }
  if (bannerBottom) {
    gsap.set('#obstacle-banner-bottom', { xPercent: 110 })
  }
}

// 监听横幅显示状态变化，执行GSAP动画
watch(() => showObstacleBanner.value, (isVisible) => {
  if (isVisible) {
    // 使用nextTick确保DOM已更新
    nextTick(() => {
      // 每次显示时重新设置初始位置
      const bannerUp = document.querySelector('#obstacle-banner-up')
      const bannerBottom = document.querySelector('#obstacle-banner-bottom')
      
      if (bannerUp && bannerBottom) {
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
      } else {
        console.warn('GSAP目标元素未找到，跳过动画')
      }
    })
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
  // 移除这里的initGsapSettings()调用，因为元素可能还不存在
})

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

// 修改开始游戏函数
const startGame = () => {
  showTutorial.value = false
  showReadyGo.value = false
  showPauseHint.value = false
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
  width: 65.87vw;
  height: 68vw;
  position: relative;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .card {
    width: 65.87dvw;
    height: 68dvw;
  }
}

.card-content {
  width: 100%;
  height: 100%;
  background: rgb(255, 235, 210);
  border: 2px solid rgb(114, 51, 46);
  border-radius: 5.29vw; /* 20px / 378px * 100 */
  display: flex;
  flex-direction: column;
  padding: 3.97vw 3.97vw 2.65vw; /* 15px 15px 10px */
  box-sizing: border-box;
  position: relative;
  /* 触摸体验优化 */
  user-select: none; /* 禁用文本选择 */
  -webkit-user-select: none;
  -webkit-touch-callout: none; /* 禁用iOS长按菜单 */
  touch-action: pan-y; /* 允许垂直滚动，但处理水平滑动 */
  cursor: grab; /* 鼠标悬停时显示可拖拽光标 */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .card-content {
    border-radius: 5.29dvw; /* 20px / 378px * 100 */
    padding: 3.97dvw 3.97dvw 2.65dvw; /* 15px 15px 10px */
  }
}

.title-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.85vw; /* 7px */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .title-section {
    margin-bottom: 1.85dvw; /* 7px */
  }
}

.title-text {
  margin: 0;
  color: rgb(114, 51, 46);
  font-size: 5.29vw; /* 20px */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  line-height: 7.41vw; /* 28px */
  text-align: center;
  display: flex;
  align-items: center;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .title-text {
    font-size: 5.29dvw; /* 20px */
    line-height: 7.41dvw; /* 28px */
  }
}

.hint-icon {
  width: 4.5vw; /* 17px */
  height: 5.29vw; /* 20px */
  margin-right: 2.12vw; /* 8px - 图标右侧间距 */
  margin-top: 0.53vw; /* 2px */
  vertical-align: middle; /* 确保图标与文字垂直对齐 */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .hint-icon {
    width: 4.5dvw; /* 17px */
    height: 5.29dvw; /* 20px */
    margin-right: 2.12dvw; /* 8px - 图标右侧间距 */
    margin-top: 0.53dvw; /* 2px */
  }
}

.divider-line {
  width: 43.39vw; /* 164px */
  height: 0;
  border-top: 2px dashed rgb(114, 51, 46);
  margin: 0 auto 3.97vw; /* 15px */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .divider-line {
    width: 43.39dvw; /* 164px */
    margin: 0 auto 3.97dvw; /* 15px */
  }
}

.image-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3.7vw; /* 14px */
  height: 26.46vw; /* 100px */
  width: 100%;
  padding: 0 10.6vw; /* 为箭头预留空间 */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .image-section {
    margin-bottom: 3.7dvw; /* 14px */
    height: 26.46dvw; /* 100px */
    padding: 0 10.6dvw; /* 为箭头预留空间 */
  }
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26.46vw; /* 100px */
  height: 26.46vw; /* 100px */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .image-container {
    width: 26.46dvw; /* 100px */
    height: 26.46dvw; /* 100px */
  }
}

.card-image {
  width: 26.46vw; /* 100px */
  height: 26.46vw; /* 100px */
  object-fit: contain;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .card-image {
    width: 26.46dvw; /* 100px */
    height: 26.46dvw; /* 100px */
  }
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 7.41vw; /* 28px */
  height: 7.41vw; /* 28px */
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
  left: 0; /* 左箭头位于容器左边 */
}

.nav-arrow:last-child {
  right: 0; /* 右箭头位于容器右边 */
}

.nav-arrow:hover:not(:disabled) {
  background: rgba(114, 51, 46, 0.1);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .nav-arrow {
    width: 7.41dvw; /* 28px */
    height: 7.41dvw; /* 28px */
  }
}

.arrow-svg {
  width: 2.65vw; /* 10px */
  height: 3.97vw; /* 15px */
  object-fit: contain;
}

.nav-arrow:disabled .arrow-svg {
  opacity: 0.5;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .arrow-svg {
    width: 2.65dvw; /* 10px */
    height: 3.97dvw; /* 15px */
  }
}

.sprite-image {
  width: 26.46vw; /* 100px */
  height: 26.46vw; /* 100px */
  background-image: url('/card/tur_card.png');
  background-size: 200% 200%; /* 雪碧图是2列2行，所以放大2倍宽度，2倍高度 */
  background-repeat: no-repeat;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .sprite-image {
    width: 26.46dvw; /* 100px */
    height: 26.46dvw; /* 100px */
  }
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
  margin-bottom: 3.97vw; /* 15px */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .image-section-single {
    margin-bottom: 3.97dvw; /* 15px */
  }
}

/* 障碍物提示文字样式 */
.obstacle-hint-text {
  color: rgb(114, 51, 46);
  font-size: 5.03vw; /* 19px */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  line-height: 7.04vw; /* 26.6px */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .obstacle-hint-text {
    font-size: 5.03dvw; /* 19px */
    line-height: 7.04dvw; /* 26.6px */
  }
}

.description-section {
  text-align: center;
  margin-bottom: 3.7vw; /* 14px */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .description-section {
    margin-bottom: 3.7dvw; /* 14px */
  }
}

.description-text {
  margin: 0;
  color: rgb(114, 51, 46);
  font-size: 5.03vw; /* 19px */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  line-height: 7.04vw; /* 26.6px */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .description-text {
    font-size: 5.03dvw; /* 19px */
    line-height: 7.04dvw; /* 26.6px */
  }
}

.progress-indicator {
  display: flex;
  justify-content: center;
  gap: 2.12vw; /* 8px */
  margin-top: auto;
  padding-bottom: 1.32vw; /* 5px */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .progress-indicator {
    gap: 2.12dvw; /* 8px */
    padding-bottom: 1.32dvw; /* 5px */
  }
}

.progress-dot {
  width: 1.59vw; /* 6px */
  height: 1.59vw; /* 6px */
  border-radius: 50%;
  background: rgba(114, 51, 46, 0.3);
  transition: all 0.2s ease;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .progress-dot {
    width: 1.59dvw; /* 6px */
    height: 1.59dvw; /* 6px */
  }
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
  gap: 8vh;
  color: white;
  text-align: center;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .tutorial-content-1 {
    gap: 8dvh;
  }
}

.tutorial-title {
  margin-bottom: 3.7vw; /* 14px */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .tutorial-title {
    margin-bottom: 3.7dvw; /* 14px */
  }
}

.tutorial-title h2 {
  font-size: 6.2vw; /* 24px */
  font-weight: 600;
  line-height: 8.4vw; /* 32px */
  color: #fff;
  text-shadow: 0 1vh 2vh rgba(0, 0, 0, 0.5);
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .tutorial-title h2 {
    text-shadow: 0 1dvh 2dvh rgba(0, 0, 0, 0.5);
  }
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .tutorial-title h2 {
    font-size: 6.2dvw; /* 24px */
    line-height: 8.4dvw; /* 32px */
  }
}

.game-demo-area {
  position: relative;
  width: 54vw; /* 202.5/375*100 */
  height: 17.3vh; /* 135/779*100 */
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2.7vw;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .game-demo-area {
    height: 17.3dvh; /* 135/779*100 */
  }
}

.swimmer-demo {
  font-size: 8vw;
  animation: swimDemo 2s ease-in-out infinite;
}

@keyframes swimDemo {
  0%, 100% { 
    transform: translateX(-5vw) translateY(0); 
  }
  50% { 
    transform: translateX(5vw) translateY(-1vw); 
  }
}

/* 动画效果 */
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

/* 箭头脉冲动画 */
@keyframes arrowPulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.8;
  }
  50% { 
    transform: scale(1.1);
    opacity: 1;
  }
}

/* 障碍物横幅动画样式 */
.obstacle-banner-container {
  position: absolute;
  top: 25%; /* 屏幕上方20%位置 */
  left: 50%;
  transform: translate(-50%,-50%);
  width: 100%;
  max-width: 60vw;
  z-index: 20; 
  pointer-events: none;
  overflow: hidden;
  /* 关键：消除容器内的空白 */
  font-size: 0;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .obstacle-banner-container {
    max-width: 60dvw;
  }
}

.obstacle-banner-part {
  /* 消除div容器的影响 */
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 0;
  line-height: 0;
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


.banner-image-left {
  width: calc(100% / 3) !important;
  max-width: calc(80vw / 3) !important;
  height: auto;
  display: block;
  margin: 0 auto; /* 水平居中 */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .banner-image-left {
    max-width: calc(80dvw / 3) !important;
  }
}

.operation-instructions {
  width: 100%;
  margin-bottom: 4vh;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .operation-instructions {
    margin-bottom: 4dvh;
  }
}

.instruction-group {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 8vw;
  margin-bottom: 3.2vw;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .instruction-group {
    gap: 8dvw;
    margin-bottom: 3.2dvw;
  }
}

.left-instruction,
.right-instruction {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
  flex: 1;
}

.tutorial-arrow-left,
.tutorial-arrow-right {
  font-size: 8vw; /* 32px */
  margin-bottom: 2vw;
  animation: arrowPulse 1.5s ease-in-out infinite;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .tutorial-arrow-left,
  .tutorial-arrow-right {
    font-size: 8dvw; /* 32px */
    margin-bottom: 2dvw;
  }
}

.left-instruction p,
.right-instruction p {
  font-size: 4vw; /* 16px */
  font-weight: 500;
  line-height: 1.4;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .left-instruction p,
  .right-instruction p {
    font-size: 4dvw; /* 16px */
  }
}

.tap-to-start {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
  margin-top: 3vh;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .tap-to-start {
    margin-top: 3dvh;
  }
}

.tap-to-start .finger-emoji {
  font-size: 8vw; /* 32px */
  animation: fingerPulse 1.5s ease-in-out infinite;
  margin-bottom: 2vw;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .tap-to-start .finger-emoji {
    font-size: 8dvw; /* 32px */
    margin-bottom: 2dvw;
  }
}

.tap-to-start p {
  font-size: 4vw; /* 16px */
  font-weight: 500;
  line-height: 1.4;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .tap-to-start p {
    font-size: 4dvw; /* 16px */
  }
}

/* 箭头脉冲动画 */
@keyframes arrowPulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 0.8;
  }
  50% { 
    transform: scale(1.1);
    opacity: 1;
  }
}
</style>