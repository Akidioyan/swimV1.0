<template>
  <div id="app">
    <!-- 加载页面 -->
    <LoadingView v-if="gameStateStore.currentView === 'loading'" />
    
    <!-- 介绍页面 -->
    <IntroView v-else-if="gameStateStore.currentView === 'intro'" />
    
    <!-- 过场视频页面 -->
    <VideoView v-else-if="gameStateStore.currentView === 'video'" />
    
    <!-- 游戏页面 -->
    <GameView v-else-if="gameStateStore.currentView === 'game'" />
    
    <!-- 结果页面 -->
    <ResultView v-else-if="gameStateStore.currentView === 'result'" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import { useGameStateStore } from './stores/gamestore/gameState'
import { usePlayerControlStore } from './stores/gamestore/playerControl'
import LoadingView from './components/LoadingView.vue'
import IntroView from './components/IntroView.vue'
import VideoView from './components/VideoView.vue'
import GameView from './components/GameView.vue'
import ResultView from './components/ResultView.vue'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const playerControlStore = usePlayerControlStore()

onMounted(() => {
  // 启用全屏模式
  enableFullscreen()
  
  // 不再使用模拟加载，让LoadingView组件控制切换时机
  // setTimeout(() => {
  //   gameStateStore.setCurrentView('intro')
  // }, 2000)
  
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

// 处理键盘按下事件
const handleKeyDown = (event) => {
  playerControlStore.handleKeyDown(event.key)
}

// 处理键盘释放事件
const handleKeyUp = (event) => {
  playerControlStore.handleKeyUp(event.key)
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

<style scoped>
.app {
  width: 100vw;
  height: 100vh;
  background: url('/bg-menu.png') center/cover no-repeat;
  overflow: hidden;
  position: relative;
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