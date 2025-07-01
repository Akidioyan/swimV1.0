<template>
  <!-- 中央区域：距离和得分垂直排列 -->
  <div class="center-stats">
    <!-- 距离显示 - 上方 -->
    <div class="distance-display">
      <img src="/ui/distance-bg.png" alt="距离背景" class="ui-bg-image" />
      <div class="ui-overlay distance-text">
        {{ gameStateStore.finalDistance }}m
      </div>
    </div>
    
    <!-- 得分显示 - 下方 -->
    <div class="game-score-display">
      <img src="/ui/distance-bg.png" alt="得分背景" class="ui-bg-image" />
      <div class="ui-overlay score-text">
        ⭐{{ gameStateStore.score }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStateStore } from '../../stores/gamestore/gameState'

const gameStateStore = useGameStateStore()
</script>

<style scoped>
/* 自定义字体 */
@font-face {
  font-family: 'FZLTCH';
  src: url('/font/FZLTCH.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

/* 中央区域：距离和得分垂直排列 */
.center-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* 距离显示 - 上方 */
.distance-display {
  position: relative;
  width: 180px;
  height: 60px;
  pointer-events: auto;
}

/* 得分显示 - 下方 */
.game-score-display {
  position: relative;
  width: 140px;
  height: 50px;
  pointer-events: auto;
}

/* UI背景图片 */
.ui-bg-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
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
  color: white;
  font-family: 'FZLTCH', Impact, Arial, sans-serif;
  font-weight: bold;
  pointer-events: none;
  z-index: 1;
}

/* 距离文字样式 */
.distance-text {
  font-size: 24px;
  color: #ffd500;
  font-family: 'FZLTCH', Impact, Arial, sans-serif;
  text-shadow: 
    2px 2px 0px #000,
    -2px -2px 0px #000,
    2px -2px 0px #000,
    -2px 2px 0px #000,
    0px 2px 4px rgba(0, 0, 0, 0.8);
}

/* 得分文字样式 */
.score-text {
  font-size: 18px;
  color: #FFD700;
  font-family: 'FZLTCH', Impact, Arial, sans-serif;
  text-shadow: 
    2px 2px 0px #000,
    -2px -2px 0px #000,
    2px -2px 0px #000,
    -2px 2px 0px #000,
    0px 2px 4px rgba(0, 0, 0, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .center-stats {
    margin: 0 15px;
    gap: 8px;
  }
  
  .distance-display {
    width: 160px;
    height: 50px;
  }
  
  .distance-text {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .center-stats {
    margin: 0 8px;
    gap: 5px;
  }
  
  .distance-display {
    width: 120px;
    height: 40px;
  }
  
  .distance-text {
    font-size: 22px;
  }
  
  .game-score-display {
    width: 100px;
    height: 35px;
  }
  
  .score-text {
    font-size: 20px;
  }
}
</style>