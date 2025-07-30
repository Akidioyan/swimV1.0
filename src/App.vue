<template>
  <div id="app" class="app">
    <!-- 设备检测弹窗 - 全局显示 -->
    <div v-if="showDeviceModal" class="device-detection-modal">
      <div class="modal-container">
        <!-- 主要弹窗内容 -->
        <div class="modal-content">
          <!-- 顶部提示头部 -->
          <div class="modal-header">
            <div class="header-banner">
              <span class="header-text">温馨提示</span>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="modal-body">
            <div class="warning-text">
              检测到当前设备不符合游戏要求，<br>
              请切换到竖屏模式或更换设备。
            </div>
            <div class="suggestion-text">
              腾讯体育游泳世锦赛专题有更多精彩内容：
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button class="action-button" @click="handleDeviceModalAction">
              <span class="button-text">进入体育频道 世锦赛专题</span>
              <img 
                src="/assets/device-detection-modal/Rectangle 14-x1.svg" 
                alt="箭头" 
                class="button-icon"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from './stores/gameStore'
import { useGameStateStore } from './stores/gamestore/gameState'
import { usePlayerControlStore } from './stores/gamestore/playerControl'
import { useUserStore } from './stores/userStore'
import LoadingView from './components/LoadingView.vue'
import IntroView from './components/IntroView.vue'
import VideoView from './components/VideoView.vue'
import GameView from './components/GameView.vue'
import EndingScene from './components/Endingscene/EndingScene.vue'
import { isQQNews } from './utils/ua'
import { clickReport } from './utils/report'
import { 
  checkDeviceCompatibility, 
  initDeviceDetectionListener, 
  registerDeviceDetectionCallbacks 
} from './utils/deviceDetection'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const playerControlStore = usePlayerControlStore()
const userStore = useUserStore()

// 设备检测弹窗状态
const showDeviceModal = ref(false)
// 记录游戏暂停前的状态
const wasGamePaused = ref(false)

// 注册设备检测回调函数
const registerDeviceCallbacks = () => {
  registerDeviceDetectionCallbacks({
    onShowModal: () => {
      console.log('[App] 收到设备检测显示弹窗回调')
      // 记录当前游戏是否已暂停
      wasGamePaused.value = gameStateStore.isPaused
      
      // 暂停游戏（如果在游戏界面且游戏正在运行）
      if (gameStateStore.currentView === 'game' && !gameStateStore.isPaused) {
        gameStateStore.togglePause()
        console.log('[App] 因设备检测暂停游戏')
      }
      
      showDeviceModal.value = true
    },
    
    onHideModal: () => {
      console.log('[App] 收到设备检测隐藏弹窗回调')
      showDeviceModal.value = false
      
      // 恢复游戏（如果在游戏界面且游戏当前已暂停且之前没有暂停）
      if (gameStateStore.currentView === 'game' && gameStateStore.isPaused && !wasGamePaused.value) {
        gameStateStore.togglePause()
        console.log('[App] 因设备检测恢复游戏')
      }
    },
    
    onAction: () => {
      console.log('[App] 收到设备检测按钮点击回调')
      handleDeviceModalAction()
    }
  })
}

// 监听弹窗状态变化，处理游戏暂停和恢复
watch(showDeviceModal, (newValue, oldValue) => {
  console.log('设备检测弹窗状态变化:', { from: oldValue, to: newValue })
  
  if (newValue && !oldValue) {
    // 弹窗显示时暂停游戏
    if (gameStateStore.currentView === 'game' && !gameStateStore.isPaused) {
      wasGamePaused.value = false
      gameStateStore.togglePause()
      console.log('因设备检测弹窗显示而暂停游戏')
    } else {
      wasGamePaused.value = gameStateStore.isPaused
    }
  } else if (!newValue && oldValue) {
    // 弹窗隐藏时恢复游戏
    if (gameStateStore.currentView === 'game' && gameStateStore.isPaused && !wasGamePaused.value) {
      gameStateStore.togglePause()
      console.log('因设备检测弹窗隐藏而恢复游戏')
    }
  }
})

onMounted(async () => {
  // 上报页面访问
  clickReport({ id: 'page_view' })
  
  // 移除加载动画
  document.querySelector('.loading-container')?.classList.add('hide')
  
  // 注册设备检测回调函数
  registerDeviceCallbacks()
  
  // 初始化设备检测监听器
  initDeviceDetectionListener()
  
  // 初始检测设备兼容性
  checkDeviceCompatibility()
  
  // 初始化分享信息
  if (isQQNews()) {
    // 腾讯新闻APP内分享设置
    try {
      const { setShareInfo } = await import('@tencent/qqnews-jsapi')
      setShareInfo({
        title: '指尖游泳挑战赛',
        longTitle: '别怀疑，你也游不到500米！一起来游泳挑战！',
        content: '别怀疑，你也游不到500米！一起来游泳挑战！',
        url: 'https://view.inews.qq.com/a/LNK2025072504936600?no-redirect=1',
        imgUrl: 'https://inews.gtimg.com/newsapp_bt/0/0728165827428_3945/0',
      })
    } catch (error) {
      console.log('腾讯新闻分享设置失败:', error)
    }
  } else {
    // 其他环境分享设置（如微信等）
    try {
      const JsBridge = await import('@tencent/qn-jsbridge')
      const instance = await JsBridge.default.readyAny()
      const shareInfo = {
        title: '指尖游泳挑战赛',
        desc: '别怀疑，你也游不到500米！一起来游泳挑战！',
        imgUrl: 'https://inews.gtimg.com/newsapp_bt/0/0728165827428_3945/0',
        link: 'https://view.inews.qq.com/a/LNK2025072504936600?no-redirect=1'
      }
      instance.setShareInfo(shareInfo)
    } catch (error) {
      console.log('JsBridge分享设置失败:', error)
    }
  }
  
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
  
  // 阻止移动端的缩放手势（移除touchmove阻止）
  document.addEventListener('gesturestart', preventZoom, { passive: false })
  document.addEventListener('gesturechange', preventZoom, { passive: false })
  document.addEventListener('gestureend', preventZoom, { passive: false })
  
  // 阻止双击缩放
  document.addEventListener('dblclick', preventDoubleClickZoom, { passive: false })
  // 删除这两行
  // document.addEventListener('touchstart', handleTouchStart, { passive: false })
  // document.addEventListener('touchend', handleTouchEnd, { passive: false })
  
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
  document.removeEventListener('gesturestart', preventZoom)
  document.removeEventListener('gesturechange', preventZoom)
  document.removeEventListener('gestureend', preventZoom)
  document.removeEventListener('dblclick', preventDoubleClickZoom)
  // 删除这两行
  // document.removeEventListener('touchstart', handleTouchStart)
  // document.removeEventListener('touchend', handleTouchEnd)
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

const closeDeviceModal = () => {
  console.log('用户手动关闭设备检测弹窗')
  showDeviceModal.value = false
}

// 设备检测弹窗事件处理
const handleDeviceModalBackdrop = () => {
  // 点击背景可以关闭弹窗
  console.log('用户点击弹窗背景，关闭弹窗')
  closeDeviceModal()
}

const handleDeviceModalAction = () => {
  // 处理用户点击"进入体育频道"按钮
  try {
    // 跳转到腾讯体育世锦赛专题页面
    window.open('https://sports.qq.com/swim2024/', '_blank')
  } catch (error) {
    console.error('跳转失败:', error)
    // 降级方案
    window.open('https://sports.qq.com/', '_blank')
  }
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
// 删除这些变量声明（第299-302行）
// let lastTouchEnd = 0
// let touchStartTime = 0
// let touchCount = 0

// 删除 handleTouchStart 函数（第304-314行）
// const handleTouchStart = (e) => {
//   touchStartTime = Date.now()
//   touchCount = e.touches.length
//   
//   // 如果是多指触摸，阻止缩放
//   if (e.touches.length > 1) {
//     e.preventDefault()
//     e.stopPropagation()
//     return false
//   }
// }

// 删除 handleTouchEnd 函数（第316-326行）
// const handleTouchEnd = (e) => {
//   const now = Date.now()
//   
//   // 检测快速双击（300ms内的两次点击）
//   if (now - lastTouchEnd <= 300) {
//     e.preventDefault()
//     e.stopPropagation()
//     return false
//   }
//   
//   lastTouchEnd = now
// }

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

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  #app.app {
    height: 100dvh;
  }
}

/* 设备检测弹窗样式 */
.device-detection-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.modal-container {
  width: min(360px, 85vw);
  height: auto;
  min-height: 240px;
  position: relative;
}

.modal-content {
  width: 100%;
  height: 100%;
  background: rgb(32, 32, 32);
  border: 2px solid rgb(13, 113, 237);
  border-radius: 11px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

.modal-header {
  position: relative;
  height: 25.83px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.header-banner {
  width: 229.5px;
  height: 25.83px;
  background: rgb(11, 106, 234);
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(0% 0%, 100% 0%, calc(90% + 8px) calc(100% - 8px), 90% 100%, 10% 100%, calc(10% - 8px) calc(100% - 8px));
}

.header-text {
  color: rgb(255, 255, 255);
  font-family: "PingFang SC", "PingFang-SC-Regular", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 12px;
  text-align: center;
}

.modal-body {
  flex: 1;
  padding: 24px 21px 16px 21px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.warning-text {
  color: rgb(231, 231, 231);
  font-family: "PingFang SC", "PingFangSC-Semibold", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 28px;
  text-align: center;
}

.suggestion-text {
  color: rgb(218, 218, 218);
  font-family: "PingFang SC", "PingFang-SC-Regular", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 19px;
  text-align: center;
}

.modal-footer {
  padding: 0 21px 20px 21px;
}

.action-button {
  width: 100%;
  height: 49.5px;
  background: transparent;
  border: 1.5px solid rgb(11, 106, 234);
  border-radius: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.action-button:hover {
  background: rgba(11, 106, 234, 0.1);
  transform: scale(1.02);
}

.action-button:active {
  transform: scale(0.98);
}

.button-text {
  color: rgb(11, 106, 234);
  font-family: "PingFang SC", "PingFangSC-Semibold", sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 25px;
  text-align: center;
}

.button-icon {
  width: 12.36px;
  height: 12px;
  transition: transform 0.2s ease;
}

.action-button:hover .button-icon {
  transform: translateX(2px);
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