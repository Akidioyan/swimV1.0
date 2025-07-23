<template>
  <div class="ending-scene-app-test">
    <div class="test-controls">
      <h2>EndingSceneApp 测试页面</h2>
      
      <!-- 环境控制 -->
      <div class="control-section">
        <h3>环境设置</h3>
        <div class="control-group">
          <label>
            <input 
              type="checkbox" 
              v-model="userStore.isInQQNewsApp"
              @change="updateEnvironment"
            >
            模拟端内APP环境
          </label>
          <label>
            <input 
              type="checkbox" 
              v-model="userStore.hasLogin"
              @change="updateEnvironment"
            >
            模拟登录状态
          </label>
        </div>
      </div>

      <!-- 游戏数据控制 -->
      <div class="control-section">
        <h3>游戏数据</h3>
        <div class="control-group">
          <label>
            游泳距离 (米):
            <input 
              type="number" 
              v-model="testGameData.distance" 
              min="0" 
              max="2000"
              @change="updateGameData"
            >
          </label>
          <label>
            星星数量:
            <input 
              type="number" 
              v-model="testGameData.stars" 
              min="0" 
              max="100"
              @change="updateGameData"
            >
          </label>
          <label>
            游戏时长 (秒):
            <input 
              type="number" 
              v-model="testGameData.gameTime" 
              min="0" 
              max="600"
              @change="updateGameData"
            >
          </label>
        </div>
      </div>

      <!-- 排行榜数据控制 -->
      <div class="control-section">
        <h3>排行榜数据</h3>
        <div class="control-group">
          <label>
            我的排名:
            <input 
              type="number" 
              v-model="testLeaderboardData.myRank" 
              min="1" 
              max="1000"
              @change="updateLeaderboardData"
            >
          </label>
          <label>
            超越百分比:
            <input 
              type="number" 
              v-model="testLeaderboardData.rankPercent" 
              min="0" 
              max="100"
              @change="updateLeaderboardData"
            >
          </label>
          <label>
            排行榜人数:
            <input 
              type="number" 
              v-model="testLeaderboardData.leaderboardCount" 
              min="10" 
              max="50"
              @change="updateLeaderboardData"
            >
          </label>
        </div>
      </div>

      <!-- 游戏次数控制 -->
      <div class="control-section">
        <h3>游戏次数</h3>
        <div class="control-group">
          <label>
            今日游戏次数:
            <input 
              type="number" 
              v-model="userStore.todayPlayCount" 
              min="0" 
              max="10"
              @change="updatePlayCount"
            >
          </label>
          <label>
            最大游戏次数:
            <span>{{ userStore.maxPlaysAllowed }}</span>
          </label>
          <label>
            剩余游戏次数:
            <span>{{ userStore.remainingPlays }}</span>
          </label>
          <label>
            是否可以游戏:
            <span :class="{ 'can-play': userStore.canPlay, 'cannot-play': !userStore.canPlay }">
              {{ userStore.canPlay ? '可以' : '不可以' }}
            </span>
          </label>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="control-section">
        <h3>操作</h3>
        <div class="button-group">
          <button @click="resetTestData" class="btn-secondary">重置测试数据</button>
          <button @click="grantBonusPlays" class="btn-secondary">获得分享奖励</button>
          <button @click="toggleFullscreen" class="btn-primary">切换全屏测试</button>
        </div>
      </div>

      <!-- 当前状态显示 -->
      <div class="control-section">
        <h3>当前状态</h3>
        <div class="status-display">
          <p><strong>环境:</strong> {{ userStore.isInQQNewsApp ? '端内APP' : '端外浏览器' }}</p>
          <p><strong>登录:</strong> {{ userStore.hasLogin ? '已登录' : '未登录' }}</p>
          <p><strong>距离:</strong> {{ gameStateStore.finalDistance }}m</p>
          <p><strong>星星:</strong> {{ gameStateStore.stars }}</p>
          <p><strong>游戏次数:</strong> {{ userStore.todayPlayCount }}/{{ userStore.maxPlaysAllowed }}</p>
        </div>
      </div>
    </div>

    <!-- 测试区域 -->
    <div class="test-area" :class="{ 'fullscreen': isFullscreen }">
      <div class="test-header">
        <h3>EndingSceneApp 预览</h3>
        <button @click="toggleFullscreen" class="btn-close">×</button>
      </div>
      <div class="component-container">
        <EndingSceneApp />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { useUserStore } from '../stores/userStore'
import EndingSceneApp from './Endingscene/EndingSceneApp.vue'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const userStore = useUserStore()

// 测试数据
const testGameData = ref({
  distance: 500,
  stars: 25,
  gameTime: 120
})

const testLeaderboardData = ref({
  myRank: 156,
  rankPercent: 85,
  leaderboardCount: 50
})

const isFullscreen = ref(false)

// 初始化测试环境
onMounted(() => {
  console.log('🎮 EndingSceneApp 测试页面初始化')
  
  // 强制设置为端内APP环境
  userStore.isInQQNewsApp = true
  userStore.hasLogin = true
  
  // 设置初始测试数据
  updateGameData()
  updateLeaderboardData()
  updatePlayCount()
  
  console.log('✅ 测试环境初始化完成')
})

// 更新游戏数据
const updateGameData = () => {
  gameStateStore.finalDistance = testGameData.value.distance
  gameStateStore.stars = testGameData.value.stars
  gameStateStore.gameTime = testGameData.value.gameTime
  
  // 同步到gameStore
  gameStore.distance = testGameData.value.distance
  gameStore.stars = testGameData.value.stars
  
  console.log('📊 游戏数据已更新:', testGameData.value)
}

// 更新排行榜数据
const updateLeaderboardData = () => {
  // 这里可以模拟API返回的数据结构
  // 实际项目中，这些数据会通过API获取
  console.log('🏆 排行榜数据已更新:', testLeaderboardData.value)
}

// 更新游戏次数
const updatePlayCount = () => {
  userStore.savePlayDataToLocalStorage()
  console.log('🎯 游戏次数已更新:', userStore.todayPlayCount)
}

// 更新环境设置
const updateEnvironment = () => {
  console.log('🌍 环境设置已更新:', {
    isInQQNewsApp: userStore.isInQQNewsApp,
    hasLogin: userStore.hasLogin
  })
}

// 重置测试数据
const resetTestData = () => {
  testGameData.value = {
    distance: 500,
    stars: 25,
    gameTime: 120
  }
  
  testLeaderboardData.value = {
    myRank: 156,
    rankPercent: 85,
    leaderboardCount: 50
  }
  
  userStore.todayPlayCount = 0
  userStore.bonusPlaysGrantedToday = false
  
  updateGameData()
  updateLeaderboardData()
  updatePlayCount()
  
  console.log('🔄 测试数据已重置')
}

// 获得分享奖励
const grantBonusPlays = () => {
  userStore.grantBonusPlays(3)
  console.log('🎁 分享奖励已发放')
}

// 切换全屏模式
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  console.log('🖥️ 全屏模式:', isFullscreen.value ? '开启' : '关闭')
}

// 监听数据变化
watch(testGameData, updateGameData, { deep: true })
watch(testLeaderboardData, updateLeaderboardData, { deep: true })
</script>

<style scoped>
.ending-scene-app-test {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

.test-controls {
  width: 400px;
  padding: 20px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.test-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #171717;
  position: relative;
}

.test-area.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #333;
  color: white;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.component-container {
  flex: 1;
  position: relative;
}

.control-section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.control-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-group label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #555;
}

.control-group input[type="number"] {
  width: 80px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.control-group input[type="checkbox"] {
  margin: 0;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.status-display {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.status-display p {
  margin: 5px 0;
  color: #333;
}

.can-play {
  color: #28a745;
  font-weight: bold;
}

.cannot-play {
  color: #dc3545;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ending-scene-app-test {
    flex-direction: column;
  }
  
  .test-controls {
    width: 100%;
    height: auto;
    max-height: 50vh;
  }
  
  .test-area {
    height: 50vh;
  }
}
</style> 