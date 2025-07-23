<template>
  <div class="test-container">
    <h1>游泳游戏排行榜测试</h1>
    
    <!-- 游戏数据设置 -->
    <div class="game-data-panel">
      <h3>设置测试数据</h3>
      <div class="input-group">
        <label>游泳距离（米）:</label>
        <input v-model.number="testGameData.distance" type="number" min="0" max="2000" />
      </div>
      <div class="input-group">
        <label>获得星星:</label>
        <input v-model.number="testGameData.stars" type="number" min="0" max="100" />
      </div>
      <div class="input-group">
        <label>游戏时长（秒）:</label>
        <input v-model.number="testGameData.gameTime" type="number" min="0" max="600" />
      </div>
      <div class="input-group">
        <label>结束原因:</label>
        <select v-model="testGameData.gameEndReason">
          <option value="completed">完成</option>
          <option value="collision">碰撞</option>
          <option value="timeout">超时</option>
        </select>
      </div>
      <button @click="setTestData" class="btn-primary">设置游戏数据</button>
      <button @click="endGame" class="btn-success">结束游戏并查看排行榜</button>
    </div>

    <!-- 当前游戏状态 -->
    <div class="current-state">
      <h3>当前游戏状态</h3>
      <p>距离: {{ gameStore.distance }}米</p>
      <p>星星: {{ gameStore.stars }}个</p>
      <p>分数: {{ gameStore.score }}分</p>
      <p>游戏状态: {{ gameStore.isGameActive ? '进行中' : '已结束' }}</p>
      <p>用户环境: {{ userStore.isInQQNewsApp ? 'APP内' : 'APP外' }}</p>
      <p>剩余游戏次数: {{ userStore.remainingPlays }}</p>
    </div>

    <!-- 环境切换 -->
    <div class="environment-panel">
      <h3>环境测试</h3>
      <button @click="toggleEnvironment" class="btn-secondary">
        切换到{{ userStore.isInQQNewsApp ? 'APP外' : 'APP内' }}环境
      </button>
      <button @click="toggleLogin" class="btn-secondary">
        切换登录状态 (当前: {{ userStore.hasLogin ? '已登录' : '未登录' }})
      </button>
    </div>

    <!-- 排行榜组件 -->
    <div class="leaderboard-section">
      <h3>排行榜展示</h3>
      <component :is="currentEndingScene" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import EndingSceneApp from './Endingscene/EndingSceneApp.vue'
import EndingSceneOutside from './Endingscene/EndingSceneOutside.vue'

const gameStore = useGameStore()
const userStore = useUserStore()

// 测试数据
const testGameData = ref({
  distance: 500,
  stars: 25,
  gameTime: 120,
  gameEndReason: 'completed'
})

// 根据环境选择组件
const currentEndingScene = computed(() => {
  return userStore.isInQQNewsApp ? EndingSceneApp : EndingSceneOutside
})

// 设置测试数据
const setTestData = () => {
  gameStore.startSwimmingGame()
  gameStore.updateSwimmingDistance(testGameData.value.distance)
  gameStore.updateSwimmingScore(testGameData.value.stars)
  gameStore.swimming.gameTime = testGameData.value.gameTime
  gameStore.swimming.gameEndReason = testGameData.value.gameEndReason
  console.log('✅ 测试数据已设置:', testGameData.value)
}

// 结束游戏
const endGame = () => {
  if (!gameStore.isGameActive) {
    gameStore.startSwimmingGame()
    gameStore.updateSwimmingDistance(testGameData.value.distance)
    gameStore.updateSwimmingScore(testGameData.value.stars)
  }
  gameStore.endSwimmingGame(testGameData.value.gameEndReason)
  console.log('🏁 游戏已结束，显示排行榜')
}

// 切换环境
const toggleEnvironment = () => {
  userStore.isInQQNewsApp = !userStore.isInQQNewsApp
  console.log('🔄 环境已切换到:', userStore.isInQQNewsApp ? 'APP内' : 'APP外')
}

// 切换登录状态
const toggleLogin = () => {
  userStore.hasLogin = !userStore.hasLogin
  console.log('🔄 登录状态已切换:', userStore.hasLogin ? '已登录' : '未登录')
}

// 初始化
setTestData()
</script>

<style scoped>
.test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.game-data-panel,
.current-state,
.environment-panel {
  background: #f5f5f5;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.input-group {
  display: flex;
  align-items: center;
  margin: 10px 0;
  gap: 10px;
}

.input-group label {
  min-width: 120px;
  font-weight: 500;
}

.input-group input,
.input-group select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.btn-primary,
.btn-success,
.btn-secondary {
  padding: 10px 20px;
  margin: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.current-state p {
  margin: 8px 0;
  font-size: 14px;
}

.leaderboard-section {
  margin-top: 30px;
  border: 2px solid #007bff;
  border-radius: 8px;
  overflow: hidden;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

h3 {
  color: #555;
  margin-bottom: 15px;
  border-bottom: 2px solid #eee;
  padding-bottom: 5px;
}
</style> 