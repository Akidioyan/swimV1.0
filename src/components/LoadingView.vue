<template>
  <div class="view-container loading-view">
    <!-- 使用VideoView样式的loading-overlay -->
    <div class="loading-overlay">
      <div class="loading-animation">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
        
        <div class="loading-progress">
          <div 
            class="loading-bar" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        
        <!-- 显示当前提示 -->
        <div class="loading-tip">{{ currentTip }}</div>
      </div>
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
    const loadingText = ref('正在初始化...')
    const currentTip = ref('')
    
    const tips = [
      '💡 点击屏幕可以切换泳道',
      '💡 收集呼吸管可以潜入水下冲刺',
      '💡 护盾可以保护你免受障碍物伤害',
      '💡 避开岩石、海草和水母',
      '💡 游得越远分数越高',
      '💡 支持触摸操作，移动端友好',
      '💡 横屏游戏体验更佳',
      '💡 使用键盘快捷键：ESC暂停，M音乐，S音效'
    ]
    
    let tipInterval = null
    let resourceManager = null
    
    onMounted(() => {
      // 循环显示提示
      let tipIndex = 0
      currentTip.value = tips[tipIndex]
      
      tipInterval = setInterval(() => {
        tipIndex = (tipIndex + 1) % tips.length
        currentTip.value = tips[tipIndex]
      }, 3000)
      
      // 开始真正的资源加载
      startResourceLoading()
    })
    
    const startResourceLoading = async () => {
      resourceManager = new ResourceManager()
      
      // 开始加载所有资源
      await resourceManager.loadAllResources(
        // 进度更新回调
        (progressValue, textValue) => {
          progress.value = progressValue
          loadingText.value = textValue
        },
        // 加载完成回调
        () => {
          // 将加载完成的资源保存到全局状态
          const loadedResources = resourceManager.getLoadedResources()
          gameStateStore.setLoadedResources(loadedResources)
          
          // 延迟一秒让用户看到100%完成状态
          setTimeout(() => {
            loadingText.value = '即将进入游戏...'
            
            // 再延迟一秒后切换到介绍页面
            setTimeout(() => {
              gameStateStore.setCurrentView('intro')
            }, 1000)
          }, 1000)
        }
      )
    }
    
    onUnmounted(() => {
      if (tipInterval) {
        clearInterval(tipInterval)
      }
    })
    
    return {
      progress,
      loadingText,
      currentTip
    }
  }
}
</script>

<style scoped>
.loading-view {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #a4d0f5 url('/intro.png') center center no-repeat;
  background-size: auto 100vh;
  overflow: hidden;
}

/* 采用VideoView的loading-overlay样式 */
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

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  max-width: 500px;
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: rgb(0, 0, 0);
  font-size: 24px;
  font-weight: bold;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-progress {
  width: 300px;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-bar {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
  background-size: 200% 200%;
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: progressShine 2s ease-in-out infinite;
}

.loading-tip {
  color: rgb(60, 60, 60);
  font-size: 16px;
  font-style: italic;
  opacity: 0.8;
  max-width: 400px;
  line-height: 1.4;
  animation: tipFade 3s ease-in-out infinite;
}

@keyframes progressShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes tipFade {
  0%, 80%, 100% { opacity: 0.8; }
  10%, 70% { opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-text {
    font-size: 20px;
  }
  
  .loading-progress {
    width: 250px;
  }
  
  .loading-tip {
    font-size: 14px;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .loading-text {
    font-size: 18px;
  }
  
  .loading-progress {
    width: 200px;
  }
  
  .loading-tip {
    font-size: 12px;
    max-width: 250px;
  }
}
</style>
