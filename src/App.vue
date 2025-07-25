<template>
  <div id="app" class="app">
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/gameStore'
import { useGameStateStore } from './stores/gamestore/gameState'
import { usePlayerControlStore } from './stores/gamestore/playerControl'
import { useUserStore } from './stores/userStore'
import LoadingView from './components/LoadingView.vue'
import IntroView from './components/IntroView.vue'
import VideoView from './components/VideoView.vue'
import GameView from './components/GameView.vue'
import EndingScene from './components/Endingscene/EndingScene.vue'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const playerControlStore = usePlayerControlStore()
const userStore = useUserStore()

onMounted(async () => {
  // 初始化用户环境
  await userStore.initEnvironment()
  
  // 上报初始环境数据
  try {
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
  
  // 阻止移动端的缩放手势（移除touchmove阻止）
  document.addEventListener('gesturestart', preventZoom, { passive: false })
  document.addEventListener('gesturechange', preventZoom, { passive: false })
  document.addEventListener('gestureend', preventZoom, { passive: false })
  
  // 阻止双击缩放
  document.addEventListener('dblclick', preventDoubleClickZoom, { passive: false })
  document.addEventListener('touchstart', handleTouchStart, { passive: false })
  document.addEventListener('touchend', handleTouchEnd, { passive: false })
  
  // 阻止右键菜单和选择
  document.addEventListener('contextmenu', preventContextMenu, { passive: false })
  document.addEventListener('selectstart', preventSelect, { passive: false })
  
  // 阻止键盘缩放
  document.addEventListener('keydown', preventKeyboardZoom, { passive: false })
  
  // 阻止鼠标滚轮缩放
  document.addEventListener('wheel', preventWheelZoom, { passive: false })
})

onUnmounted(() => {
  // 移除事件监听器
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUp)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('gesturestart', preventZoom)
  document.removeEventListener('gesturechange', preventZoom)
  document.removeEventListener('gestureend', preventZoom)
  document.removeEventListener('dblclick', preventDoubleClickZoom)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
  document.removeEventListener('contextmenu', preventContextMenu)
  document.removeEventListener('selectstart', preventSelect)
  document.removeEventListener('keydown', preventKeyboardZoom)
  document.removeEventListener('wheel', preventWheelZoom)
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

// 阻止缩放手势
const preventZoom = (e) => {
  e.preventDefault()
  e.stopPropagation()
  return false
}

// 阻止双击缩放
const preventDoubleClickZoom = (e) => {
  e.preventDefault()
  e.stopPropagation()
  return false
}

// 触摸开始时间记录（用于检测双击）
let lastTouchEnd = 0
let touchStartTime = 0
let touchCount = 0

// 处理触摸开始
const handleTouchStart = (e) => {
  touchStartTime = Date.now()
  touchCount = e.touches.length
  
  // 如果是多指触摸，阻止缩放
  if (e.touches.length > 1) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
}

// 处理触摸结束
const handleTouchEnd = (e) => {
  const now = Date.now()
  
  // 检测快速双击（300ms内的两次点击）
  if (now - lastTouchEnd <= 300) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
  
  lastTouchEnd = now
}

// 阻止右键菜单
const preventContextMenu = (e) => {
  e.preventDefault()
  e.stopPropagation()
  return false
}

// 阻止文本选择
const preventSelect = (e) => {
  e.preventDefault()
  e.stopPropagation()
  return false
}

// 阻止键盘缩放（Ctrl/Cmd + +/-/0）
const preventKeyboardZoom = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=' || e.keyCode === 187 || e.keyCode === 189 || e.keyCode === 48)) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
}

// 阻止鼠标滚轮缩放
const preventWheelZoom = (e) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
}
</script>

<style scoped>
#app.app {
  width: 100vw;
  height: 100vh;
  background: url('/bg-menu.png') center/cover no-repeat;
  position: relative;
  /* iOS长按放大防护 */
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-text-size-adjust: 100% !important;
  -ms-text-size-adjust: 100% !important;
  touch-action: manipulation !important;
  -webkit-user-drag: none !important;
  -webkit-user-modify: read-only;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
}

body {
  -ms-overflow-style: none;
  scrollbar-width: none;
  zoom: 1;
}
</style>