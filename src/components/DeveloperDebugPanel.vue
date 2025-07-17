<template>
  <div class="developer-debug-panel" v-if="visible" @click.stop>
    <div class="debug-header">
      <h3>🛠️ 开发者调试面板</h3>
      <button class="close-btn" @click="closePanel">✕</button>
    </div>
    
    <div class="debug-content">
      <!-- 难度等级选择 -->
      <div class="difficulty-section">
        <h4>难度等级跳跃 (0-6级)</h4>
        
        <!-- 滑块控制 -->
        <div class="range-container">
          <label for="difficultyRange">当前等级: {{ selectedLevel }}</label>
          <div class="range-wrapper" :style="{ '--val': selectedLevel }">
            <input 
              id="difficultyRange"
              type="range" 
              min="0" 
              max="6" 
              step="1"
              v-model.number="selectedLevel"
              @input="updateRangeDisplay"
              class="difficulty-range"
            />
            <div class="range-labels">
              <span v-for="level in 7" :key="level-1" :class="{ active: selectedLevel === level-1 }">
                {{ level-1 }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 快捷按钮 -->
        <div class="quick-buttons">
          <button 
            v-for="level in 7" 
            :key="level-1"
            @click="selectLevel(level-1)"
            :class="{ active: selectedLevel === level-1 }"
            class="level-btn"
          >
            {{ level-1 }}级
          </button>
        </div>
        
        <!-- 当前等级信息 -->
        <div class="level-info" v-if="currentLevelInfo">
          <h5>等级 {{ currentLevelInfo.level }} 配置：</h5>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">距离范围:</span>
              <span class="value">{{ formatDistanceRange(currentLevelInfo.levelConfig.vwRange) }}</span>
            </div>
            <div class="info-item">
              <span class="label">运动速度:</span>
              <span class="value">{{ currentLevelInfo.levelConfig.movementSpeed }}vw/s</span>
            </div>
            <div class="info-item">
              <span class="label">生成间隔:</span>
              <span class="value">{{ currentLevelInfo.levelConfig.spawnInterval.min }}-{{ currentLevelInfo.levelConfig.spawnInterval.max }}vw</span>
            </div>
            <div class="info-item">
              <span class="label">对象数量:</span>
              <span class="value">{{ currentLevelInfo.levelConfig.objectsPer100vw.min }}-{{ currentLevelInfo.levelConfig.objectsPer100vw.max }}/100vw</span>
            </div>
          </div>
          
          <!-- 概率分布 -->
          <div class="probability-display">
            <h6>概率分布：</h6>
            <div class="prob-bars">
              <div class="prob-item" v-for="(prob, type) in currentLevelInfo.levelConfig.probability" :key="type">
                <span class="prob-label">{{ type }}</span>
                <div class="prob-bar">
                  <div class="prob-fill" :style="{ width: (prob * 100) + '%' }"></div>
                  <span class="prob-value">{{ Math.round(prob * 100) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 跳跃按钮 -->
        <div class="action-buttons">
          <button @click="jumpToLevel" class="jump-btn" :disabled="!canJump">
            🚀 跳跃到等级 {{ selectedLevel }}
          </button>
          <button @click="resetToCurrentLevel" class="reset-btn">
            🔄 重置到当前等级
          </button>
        </div>
      </div>
      
      <!-- 游戏状态信息 -->
      <div class="game-status">
        <h4>游戏状态</h4>
        <div class="status-grid">
          <div class="status-item">
            <span class="label">当前距离:</span>
            <span class="value">{{ Math.round(gameStateStore.distance) }}m ({{ Math.round(currentDistanceVw) }}vw)</span>
          </div>
          <div class="status-item">
            <span class="label">实际等级:</span>
            <span class="value">{{ gameStateStore.currentDifficultyLevel }}</span>
          </div>
          <div class="status-item">
            <span class="label">游戏速度:</span>
            <span class="value">{{ Math.round(gameStateStore.gameSpeed * 100) / 100 }}</span>
          </div>
          <div class="status-item">
            <span class="label">当前运动速度:</span>
            <span class="value">{{ gameStateStore.currentMovementSpeed }}vw/s</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="debug-footer">
      <span class="help-text">💡 提示: 按 L 键关闭面板</span>
    </div>
  </div>
  
  <!-- 背景遮罩 -->
  <div class="debug-overlay" v-if="visible" @click="closePanel"></div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { getCurrentDifficultyInfo, convertMetersToVw, convertVwToMeters, getLevelConfig } from '../utils/obstacles/obstacleConfig'

export default {
  name: 'DeveloperDebugPanel',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'jumpToLevel'],
  setup(props, { emit }) {
    const gameStateStore = useGameStateStore()
    const selectedLevel = ref(0)
    
    // 计算当前距离的vw值
    const currentDistanceVw = computed(() => {
      return convertMetersToVw(gameStateStore.distance)
    })
    
    // 获取当前等级信息
    const currentLevelInfo = computed(() => {
      if (selectedLevel.value >= 0 && selectedLevel.value <= 6) {
        const levelConfig = getLevelConfig(selectedLevel.value)
        return {
          level: selectedLevel.value,
          levelConfig
        }
      }
      return null
    })
    
    // 检查是否可以跳跃
    const canJump = computed(() => {
      return gameStateStore.gameState === 'playing' && 
             selectedLevel.value !== gameStateStore.currentDifficultyLevel
    })
    
    // 更新滑块显示
    const updateRangeDisplay = (event) => {
      const target = event.target
      target.parentNode.style.setProperty('--val', target.value)
    }
    
    // 选择等级
    const selectLevel = (level) => {
      selectedLevel.value = level
    }
    
    // 跳跃到指定等级
    const jumpToLevel = () => {
      if (!canJump.value) return
      
      const levelConfig = getLevelConfig(selectedLevel.value)
      const targetDistanceVw = levelConfig.vwRange.min + 10 // 跳到该等级范围的开始位置+10vw
      const targetDistanceMeters = convertVwToMeters(targetDistanceVw)
      
      // 更新游戏状态
      gameStateStore.distance = targetDistanceMeters
      
      // 发送跳跃事件
      emit('jumpToLevel', {
        level: selectedLevel.value,
        distance: targetDistanceMeters,
        distanceVw: targetDistanceVw
      })
      
      console.log(`🚀 开发者跳跃: 等级${selectedLevel.value}, 距离${Math.round(targetDistanceMeters)}m (${Math.round(targetDistanceVw)}vw)`)
    }
    
    // 重置到当前等级
    const resetToCurrentLevel = () => {
      selectedLevel.value = gameStateStore.currentDifficultyLevel
    }
    
    // 关闭面板
    const closePanel = () => {
      emit('close')
    }
    
    // 格式化距离范围
    const formatDistanceRange = (vwRange) => {
      if (vwRange.max === Infinity) {
        return `${vwRange.min}vw+`
      }
      return `${vwRange.min}-${vwRange.max}vw`
    }
    
    // 监听面板显示状态，自动同步当前等级
    watch(() => props.visible, (newVisible) => {
      if (newVisible) {
        selectedLevel.value = gameStateStore.currentDifficultyLevel
      }
    })
    
    return {
      gameStateStore,
      selectedLevel,
      currentDistanceVw,
      currentLevelInfo,
      canJump,
      updateRangeDisplay,
      selectLevel,
      jumpToLevel,
      resetToCurrentLevel,
      closePanel,
      formatDistanceRange
    }
  }
}
</script>

<style scoped>
.debug-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

.developer-debug-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 600px;
  max-height: 80vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #00ffff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 255, 255, 0.3);
  z-index: 9999;
  overflow-y: auto;
  color: #ffffff;
  font-family: 'Monaco', 'Consolas', monospace;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid #00ffff;
}

.debug-header h3 {
  margin: 0;
  color: #00ffff;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #ff6b6b;
  color: white;
}

.debug-content {
  padding: 20px;
}

.difficulty-section h4,
.game-status h4 {
  color: #00ffff;
  margin: 0 0 15px 0;
  font-size: 16px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding-bottom: 8px;
}

/* 滑块样式 */
.range-container {
  margin-bottom: 20px;
}

.range-container label {
  display: block;
  margin-bottom: 10px;
  color: #b8e6ff;
  font-weight: bold;
}

.range-wrapper {
  position: relative;
  margin-bottom: 10px;
}

.difficulty-range {
  width: 100%;
  height: 8px;
  background: linear-gradient(
    to right,
    #4facfe 0%,
    #00f2fe calc(var(--val) / 6 * 100%),
    #333 calc(var(--val) / 6 * 100%),
    #333 100%
  );
  border-radius: 4px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.difficulty-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #00ffff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.difficulty-range::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 20px rgba(0, 255, 255, 0.8);
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
}

.range-labels span {
  color: #888;
  transition: color 0.3s ease;
}

.range-labels span.active {
  color: #00ffff;
  font-weight: bold;
}

/* 快捷按钮 */
.quick-buttons {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.level-btn {
  padding: 8px 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #666;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.level-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

.level-btn.active {
  background: #00ffff;
  color: #1a1a2e;
  border-color: #00ffff;
  font-weight: bold;
}

/* 等级信息 */
.level-info {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.level-info h5 {
  margin: 0 0 12px 0;
  color: #00ffff;
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.info-item .label {
  color: #b8e6ff;
}

.info-item .value {
  color: #fff;
  font-weight: bold;
}

/* 概率分布 */
.probability-display h6 {
  margin: 0 0 10px 0;
  color: #00ffff;
  font-size: 13px;
}

.prob-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.prob-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.prob-label {
  width: 50px;
  color: #b8e6ff;
}

.prob-bar {
  flex: 1;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.prob-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  border-radius: 8px;
  transition: width 0.3s ease;
}

.prob-value {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.jump-btn,
.reset-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.jump-btn {
  background: linear-gradient(135deg, #00ffff, #0088cc);
  border: none;
  color: #1a1a2e;
}

.jump-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4);
}

.jump-btn:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #666;
  color: #fff;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #00ffff;
}

/* 游戏状态 */
.game-status {
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  padding-top: 20px;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 4px 0;
}

.status-item .label {
  color: #b8e6ff;
}

.status-item .value {
  color: #fff;
  font-weight: bold;
}

/* 页脚 */
.debug-footer {
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  text-align: center;
}

.help-text {
  color: #888;
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 600px) {
  .developer-debug-panel {
    width: 95vw;
    max-height: 90vh;
  }
  
  .quick-buttons {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .info-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style> 