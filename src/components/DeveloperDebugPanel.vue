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
      
      <!-- 震动功能测试 -->
      <div class="vibration-section">
        <h4>震动功能测试</h4>
        <div class="vibration-status">
          <span class="status-label">震动支持状态:</span>
          <span class="status-value" :class="{ supported: vibrationSupported, unsupported: !vibrationSupported }">
            {{ vibrationSupported ? '✅ 支持' : '❌ 不支持' }}
          </span>
        </div>
        <div class="vibration-status">
          <span class="status-label">音频同步状态:</span>
          <span class="status-value" :class="{ supported: audioEnabled, unsupported: !audioEnabled }">
            {{ audioEnabled ? '🔊 音频开启' : '🔇 音频关闭' }}
          </span>
        </div>
        <div class="vibration-info">
          <p class="info-text">💡 震动功能会自动跟随音频状态：</p>
          <ul class="info-list">
            <li>🔊 音频开启时 → 震动启用</li>
            <li>🔇 音频关闭/静音时 → 震动禁用</li>
            <li>🎚️ 音量为0时 → 震动禁用</li>
          </ul>
        </div>
        <div class="vibration-toggle">
          <label>
            <input type="checkbox" v-model="vibrationEnabled" @change="toggleVibration">
            手动控制震动（覆盖音频同步）
          </label>
        </div>
        <div class="vibration-buttons">
          <button @click="testLightVibration" class="vibration-btn light" :disabled="!vibrationSupported || !vibrationEnabled">
            轻微震动 (收集星星)
          </button>
          <button @click="testMediumVibration" class="vibration-btn medium" :disabled="!vibrationSupported || !vibrationEnabled">
            中等震动 (收集道具)
          </button>
          <button @click="testHeavyVibration" class="vibration-btn heavy" :disabled="!vibrationSupported || !vibrationEnabled">
            重度震动 (碰撞障碍物)
          </button>
          <button @click="testGameOverVibration" class="vibration-btn gameover" :disabled="!vibrationSupported || !vibrationEnabled">
            游戏结束震动
          </button>
          <button @click="testAllVibrations" class="vibration-btn all" :disabled="!vibrationSupported || !vibrationEnabled">
            📳 全功能测试
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
import vibrationManager from '../utils/vibration.js'
import audioManager from '../utils/audio-manager.js'

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
    
    // 震动相关状态
    const vibrationSupported = ref(vibrationManager.isSupported)
    const vibrationEnabled = ref(vibrationManager.isEnabled)
    
    // 音频状态
    const audioEnabled = computed(() => {
      return audioManager.musicEnabled && audioManager.soundEnabled && !audioManager.musicPaused && audioManager.masterVolume > 0
    })
    
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
    
    // 震动功能方法
    const toggleVibration = () => {
      // 使用手动控制模式
      vibrationManager.setEnabled(vibrationEnabled.value, true)
      console.log(`震动功能${vibrationEnabled.value ? '已启用' : '已禁用'} (手动控制)`)
    }
    
    const testLightVibration = () => {
      vibrationManager.lightVibration()
      console.log('🧪 测试轻微震动 (收集星星)')
    }
    
    const testMediumVibration = () => {
      vibrationManager.mediumVibration()
      console.log('🧪 测试中等震动 (收集道具)')
    }
    
    const testHeavyVibration = () => {
      vibrationManager.heavyVibration()
      console.log('🧪 测试重度震动 (碰撞障碍物)')
    }
    
    const testGameOverVibration = () => {
      vibrationManager.gameOverVibration()
      console.log('🧪 测试游戏结束震动')
    }

    const testAllVibrations = () => {
      console.log('🧪 开始全功能震动测试...')
      console.log('📳 轻微震动 (收集星星) - 1秒后开始')
      
      // 立即开始第一个测试
      vibrationManager.lightVibration()
      console.log('✅ 轻微震动测试完成')
      
      // 2秒后测试中等震动
      setTimeout(() => {
        console.log('📳 中等震动 (收集道具)')
        vibrationManager.mediumVibration()
        console.log('✅ 中等震动测试完成')
      }, 1500)
      
      // 4秒后测试重度震动
      setTimeout(() => {
        console.log('📳 重度震动 (碰撞障碍物)')
        vibrationManager.heavyVibration()
        console.log('✅ 重度震动测试完成')
      }, 3000)
      
      // 6秒后测试游戏结束震动
      setTimeout(() => {
        console.log('📳 游戏结束震动')
        vibrationManager.gameOverVibration()
        console.log('✅ 游戏结束震动测试完成')
        console.log('🎉 全功能震动测试完成！')
      }, 5000)
    }
    
    // 监听面板显示状态，自动同步当前等级
    watch(() => props.visible, (newVisible) => {
      if (newVisible) {
        selectedLevel.value = gameStateStore.currentDifficultyLevel
        // 同步震动状态
        vibrationEnabled.value = vibrationManager.isEnabled
        
        // 开始监听音频状态变化
        const audioCheckInterval = setInterval(() => {
          if (!props.visible) {
            clearInterval(audioCheckInterval)
            return
          }
          
          // 实时更新震动状态显示
          vibrationEnabled.value = vibrationManager.isEnabled
        }, 500) // 每500ms检查一次
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
      formatDistanceRange,
      // 震动相关
      vibrationSupported,
      vibrationEnabled,
      toggleVibration,
      testLightVibration,
      testMediumVibration,
      testHeavyVibration,
      testGameOverVibration,
      testAllVibrations,
      // 音频状态
      audioEnabled
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
  /* 添加移动端触摸滚动支持 */
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
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
  appearance: none;
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

/* 震动功能测试区域 */
.vibration-section {
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  padding-top: 20px;
  margin-bottom: 20px;
}

.vibration-section h4 {
  color: #00ffff;
  margin: 0 0 15px 0;
  font-size: 16px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding-bottom: 8px;
}

.vibration-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.status-label {
  color: #b8e6ff;
}

.status-value {
  font-weight: bold;
}

.status-value.supported {
  color: #4ade80;
}

.status-value.unsupported {
  color: #f87171;
}

.vibration-info {
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 6px;
}

.info-text {
  margin-bottom: 8px;
  color: #b8e6ff;
  font-size: 13px;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: #888;
}

.info-list li {
  margin-bottom: 4px;
}

.vibration-toggle {
  margin-bottom: 15px;
}

.vibration-toggle label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b8e6ff;
  font-size: 14px;
  cursor: pointer;
}

.vibration-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #00ffff;
}

.vibration-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.vibration-btn {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s ease;
  border: 1px solid;
  color: white;
}

.vibration-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vibration-btn.light {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border-color: #16a34a;
}

.vibration-btn.light:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(74, 222, 128, 0.4);
}

.vibration-btn.medium {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: #1d4ed8;
}

.vibration-btn.medium:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.vibration-btn.heavy {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-color: #b45309;
}

.vibration-btn.heavy:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.vibration-btn.gameover {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-color: #b91c1c;
}

.vibration-btn.gameover:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.vibration-btn.all {
  grid-column: 1 / -1; /* 让全功能测试按钮占据整行 */
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-color: #4f46e5;
}

.vibration-btn.all:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
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