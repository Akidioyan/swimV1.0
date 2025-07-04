<template>
  <div id="app">
    <!-- 加载页面 -->
    <LoadingView v-if="gameStore.currentView === 'loading'" />
    
    <!-- 介绍页面 -->
    <IntroView v-else-if="gameStore.currentView === 'intro'" />
    
    <!-- 过场视频页面 -->
    <VideoView v-else-if="gameStore.currentView === 'video'" />
    
    <!-- 游戏页面 -->
    <GameView v-else-if="gameStore.currentView === 'game'" />
    
    <!-- 结果页面 -->
    <ResultView v-else-if="gameStore.currentView === 'result'" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import LoadingView from './components/LoadingView.vue'
import IntroView from './components/IntroView.vue'
import VideoView from './components/VideoView.vue'
import GameView from './components/GameView.vue'
import ResultView from './components/ResultView.vue'

const gameStore = useGameStore()

onMounted(() => {
  // 启用全屏模式
  enableFullscreen()
  
  // 模拟加载过程
  setTimeout(() => {
    gameStore.setCurrentView('intro')
  }, 2000)
  
  // 添加全局键盘事件监听
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
  
  // 阻止移动端的默认行为
  document.addEventListener('touchmove', preventScroll, { passive: false })
  document.addEventListener('gesturestart', preventZoom)
  document.addEventListener('gesturechange', preventZoom)
  document.addEventListener('gestureend', preventZoom)
})

onUnmounted(() => {
  // 移除事件监听器
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('touchmove', preventScroll)
  document.removeEventListener('gesturestart', preventZoom)
  document.removeEventListener('gesturechange', preventZoom)
  document.removeEventListener('gestureend', preventZoom)
})

const enableFullscreen = () => {
  // 全屏逻辑
}

const handleKeyDown = (event) => {
  // 只在游戏进行时处理键盘事件
  if (gameStore.currentView === 'game' && gameStore.gameState === 'playing') {
    switch(event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        gameStore.switchLane(-1) // 向左切换泳道
        break
      case 'ArrowRight':
        event.preventDefault()
        gameStore.switchLane(1)  // 向右切换泳道
        break
      case ' ': // 空格键暂停
        event.preventDefault()
        gameStore.togglePause()
        break
    }
  }
}

const handleKeyUp = (event) => {
  // 键盘释放处理逻辑（如果需要的话）
  event.preventDefault()
}

const handleResize = () => {
  // 窗口大小变化处理逻辑
}

const preventScroll = (event) => {
  // 阻止滚动逻辑
}

const preventZoom = (event) => {
  // 阻止缩放逻辑
}
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: url('/media/graphics/games/bg-menu.png') center/cover no-repeat;
  /* 移除游戏容器类，直接应用样式 */
}


/* 禁用移动端的缩放和滚动 */
html, body {
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -ms-content-zooming: none;
  -ms-touch-action: manipulation;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
}

body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>