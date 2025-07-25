<template>
  <div class="view-container loading-view">
    <!-- 顶部状态栏 -->
    <div class="topbar"></div>
    

    
    <!-- 加载内容区域 -->
    <div class="loading-content">
      <!-- loading图片 -->
      <img 
        class="loading-image" 
        src="/loading/loading.png" 
        alt="loading"
      />
      
      <!-- 加载文本 -->
      <div class="loading-text">助力中国运动健儿赛场驰骋</div>
      
      <!-- 进度显示 -->
      <div class="progress-text">{{ progress }}%</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { ResourceManager } from '../utils/ResourceManager.js'

export default {
  name: 'LoadingView',
  setup() {
    const gameStateStore = useGameStateStore()
    const progress = ref(0)
    let resourceManager = null
    
    onMounted(() => {
      // 开始资源加载
      startResourceLoading()
    })
    
    const startResourceLoading = async () => {
      resourceManager = new ResourceManager()
      
      // 开始加载所有资源
      await resourceManager.loadAllResources(
        // 进度更新回调
        (progressValue) => {
          progress.value = progressValue
        },
        // 加载完成回调
        () => {
          // 将加载完成的资源保存到全局状态
          const loadedResources = resourceManager.getLoadedResources()
          gameStateStore.setLoadedResources(loadedResources)
          
          // 资源加载完成后立即跳转，不再等待1秒
            gameStateStore.setCurrentView('intro')
        }
      )
    }
    
    return {
      progress
    }
  }
}
</script>

<style scoped>
.loading-view {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #A4D0F5;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

/* 顶部状态栏 */
.topbar {
  width: 100%;
  height: 44px;
  background: transparent;
}

/* 音乐控制按钮 */
.music-control {
  position: absolute;
  top: 44px;
  right: 20px;
  z-index: 10;
}

.music-circle {
  width: 35px;
  height: 35px;
  background: rgb(52, 113, 212);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}


/* 加载内容区域 */
.loading-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.loading-image {
  width: 127px;
  height: 36px;
  object-fit: contain;
}

.loading-text {
  font-family: "PingFang SC", sans-serif;
  font-size: 10px;
  line-height: 24px;
  color: rgb(4, 4, 4);
  text-align: center;
  width: 120px;
}

.progress-text {
  font-family: "PingFang SC", sans-serif;
  font-size: 13px;
  line-height: 24px;
  color: rgb(0, 0, 0);
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-text {
    font-size: 10px;
  }
  
  .progress-text {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .loading-text {
    font-size: 10px;
  }
  
  .progress-text {
    font-size: 13px;
  }
}
</style>
