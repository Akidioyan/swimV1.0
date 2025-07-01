<template>
  <!-- 统一的顶部UI区域 -->
  <div class="ui-top">
    <!-- 生命显示 - 左上角 -->
    <div class="lives-display">
      <img src="/ui/lives-bg.png" alt="生命背景" class="ui-bg-image" />
      <div class="ui-overlay">
        <img v-for="i in gameStateStore.lives" :key="i" src="/ui/heart.png" alt="生命" class="heart" />
        <img v-for="i in (gameStateStore.maxLives - gameStateStore.lives)" :key="'empty-' + i" src="/ui/heart-empty.png" alt="空生命" class="heart-empty" />
      </div>
    </div>
    
    <!-- 中央统计区域 -->
    <div class="center-stats-container">
      <CenterStats />
    </div>
    
    <!-- 控制按钮区域 - 右上角 -->
    <div class="control-buttons">
      <!-- 声音按钮 -->
      <div class="control-btn-wrapper" @click="toggleAllSound()">
        <img 
          :src="isSoundOn ? '/ui/sound-on.png' : '/ui/sound-off.png'" 
          alt="声音控制" 
          class="control-btn-image" 
        />
      </div>
      
      <!-- 暂停/继续按钮 -->
      <div class="control-btn-wrapper" @click="gameStateStore.togglePause()">
        <img 
          :src="gameStateStore.isPaused ? '/ui/play.png' : '/ui/pause.png'" 
          alt="暂停控制" 
          class="control-btn-image" 
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import CenterStats from './CenterStats.vue'
import { useGameStore } from '../../stores/gameStore'
import { useGameStateStore } from '../../stores/gamestore/gameState'
import audioManager from '../../utils/audio-manager'

export default {
  name: 'UITop',
  components: {
    CenterStats
  },
  setup() {
    const gameStore = useGameStore()
    const gameStateStore = useGameStateStore()
    
    // 声音控制 - 使用音频管理器的状态
    const isSoundOn = computed(() => {
      return audioManager.isSoundOn
    })
    
    const toggleAllSound = () => {
      // 使用音频管理器的统一音效控制
      audioManager.toggleAllSound()
      
      // 同步状态到 gameStateStore（保持兼容性）
      gameStateStore.musicEnabled = audioManager.musicEnabled
      gameStateStore.soundEnabled = audioManager.soundEnabled
      gameStateStore.musicPaused = audioManager.musicPaused
    }
    
    return {
      gameStore,
      gameStateStore,
      isSoundOn,
      toggleAllSound
    }
  }
}
</script>

<style scoped>
/* 统一的顶部UI区域 */
.ui-top {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 5%; /* 两侧缝隙各5% */
  box-sizing: border-box;
  z-index: 1000;
  width: 100%;
}

/* 生命显示 - 左上角 */
.lives-display {
  position: relative;
  width: 20%; /* 占20%宽度 */
  height: 50px;
  pointer-events: auto;
  flex-shrink: 0;
}

/* UI背景图片 */
.ui-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  object-fit: contain;
}

/* UI文字覆盖层 */
.ui-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 1;
}

/* 生命图标 */
.heart, .heart-empty {
  width: 20px;
  height: 20px;
  margin: 0 1px;
}

/* 中央统计区域容器 */
.center-stats-container {
  width: 30%; /* 占30%宽度 */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

/* 控制按钮区域 - 右上角 */
.control-buttons {
  width: 20%; /* 占20%宽度 */
  display: flex;
  gap: 10px;
  justify-content: center; /* 改为居中对齐 */
  align-items: center;
  pointer-events: auto;
  flex-shrink: 0;
}

/* 控制按钮样式 */
.control-btn-wrapper {
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.control-btn-wrapper:hover {
  transform: scale(1.1);
  filter: brightness(1.2);
}

.control-btn-wrapper:active {
  transform: scale(0.95);
}

.control-btn-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ui-top {
    padding: 0 3%; /* 较小屏幕减少边距 */
  }
  
  .lives-display {
    width: 25%; /* 小屏幕稍微增加宽度 */
  }
  
  .center-stats-container {
    width: 35%; /* 小屏幕稍微增加中央区域 */
  }
  
  .control-buttons {
    width: 25%; /* 小屏幕稍微增加控制按钮区域 */
    gap: 8px;
  }
  
  .heart, .heart-empty {
    width: 16px;
    height: 16px;
  }
  
  .control-btn-wrapper {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .ui-top {
    padding: 0 2%; /* 最小屏幕进一步减少边距 */
  }
  
  .lives-display {
    width: 30%; /* 最小屏幕进一步增加宽度 */
  }
  
  .center-stats-container {
    width: 40%; /* 最小屏幕进一步增加中央区域 */
  }
  
  .control-buttons {
    width: 30%; /* 最小屏幕进一步增加控制按钮区域 */
    gap: 6px;
  }
  
  .heart, .heart-empty {
    width: 14px;
    height: 14px;
  }
  
  .control-btn-wrapper {
    width: 32px;
    height: 32px;
  }
}
</style>