<template>
  <div id="app">
    <!-- 测试入口页面 -->
    <TestEntry v-if="isTestEntryMode" />
    
    <!-- 正常游戏流程 -->
    <template v-else>
      <!-- 加载页面 -->
      <LoadingView v-if="gameStateStore.currentView === 'loading'" />
      
      <!-- 介绍页面 -->
      <IntroView v-else-if="gameStateStore.currentView === 'intro'" />
      
      <!-- 过场视频页面 -->
      <VideoView v-else-if="gameStateStore.currentView === 'video'" />
      
      <!-- 游戏页面 -->
      <GameView v-else-if="gameStateStore.currentView === 'game'" />
      
      <!-- 结果页面 -->
      <EndingScene v-else-if="gameStateStore.currentView === 'result'" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useGameStore } from './stores/gameStore'
import { useGameStateStore } from './stores/gamestore/gameState'
import { usePlayerControlStore } from './stores/gamestore/playerControl'
import { useUserStore } from './stores/userStore'
import LoadingView from './components/LoadingView.vue'
import IntroView from './components/IntroView.vue'
import VideoView from './components/VideoView.vue'
import GameView from './components/GameView.vue'
import EndingScene from './components/Endingscene/EndingScene.vue'
import TestEntry from './components/TestEntry.vue'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const playerControlStore = usePlayerControlStore()
const userStore = useUserStore()

// 检查测试模式类型
const testMode = computed(() => {
  if (process.env.NODE_ENV === 'development') {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('test') || localStorage.getItem('endingSceneTestMode')
  }
  return null
})

const isTestEntryMode = computed(() => {
  return testMode.value === 'entry' || testMode.value === null
})

onMounted(async () => {
  // 如果是测试模式，跳过正常初始化
  if (isTestEntryMode.value) {
    console.log('🧪 进入测试模式:', testMode.value)
    return
  }
  
  // 初始化用户环境
  await userStore.initEnvironment()
  
  // 上报初始环境数据
  try {
    // 修改：从 './dataStore/request' 改为 './utils/request'
    const { reportEnvironment } = await import('./utils/request')
    await reportEnvironment()
  } catch (error) {
    console.error('初始环境上报失败:', error)
  }
  
  // 启用全屏模式
  enableFullscreen()
  
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

// 处理窗口大小变化
const handleResize = () => {
  // 窗口大小变化处理逻辑
}

// 阻止滚动
const preventScroll = (e) => {
  e.preventDefault()
}

// 阻止缩放
const preventZoom = (e) => {
  e.preventDefault()
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