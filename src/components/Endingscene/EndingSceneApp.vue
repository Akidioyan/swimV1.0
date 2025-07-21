<template>
  <div class="ending-scene-app">
    <div class="swimming-results">
      <h2>🏊‍♂️ 游泳挑战结果</h2>
      <div class="stats">
        <div class="stat-item">
          <span class="label">游泳距离:</span>
          <span class="value">{{ gameData.distance }}米</span>
        </div>
        <div class="stat-item">
          <span class="label">收集星星:</span>
          <span class="value">{{ gameData.score }}个</span>
        </div>
        <div class="stat-item">
          <span class="label">排名百分比:</span>
          <span class="value">{{ currentUserData.rankPercent }}</span>
        </div>
      </div>
    </div>
    
    <div class="leaderboard">
      <h3>🏆 排行榜 (按得分优先，距离次要)</h3>
      <div class="leaderboard-list">
        <div 
          v-for="entry in top50Data" 
          :key="entry.rank"
          class="leaderboard-entry"
          :class="{ 'current-user': entry.rank === currentUserData.rank }"
        >
          <span class="rank">{{ entry.rank }}</span>
          <span class="nickname">{{ entry.nick }}</span>
          <span class="score">{{ entry.score }}⭐</span>
          <span class="distance">{{ entry.distance }}m</span>
        </div>
      </div>
    </div>
    
    <div class="action-buttons">
      <button @click="playAgain" class="play-again-btn">
        🌊 再次挑战
      </button>
      <button @click="unlockAllLevels" class="unlock-btn">
        🔓 解锁全部关卡
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../../../../refData/stores/gameStore'
import { useUserStore } from '../../../../refData/stores/userStore'
import { reportSwimmingGameResult } from '../../../../refData/utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: white;
}

.play-again-btn:hover, .unlock-btn:hover {
  transform: scale(1.05);
}
</style>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useUserStore } from '../stores/userStore'
import { reportSwimmingGameResult } from '../utils/request'

const gameStore = useGameStore()
const userStore = useUserStore()

const gameData = ref({
  distance: 0,
  score: 0,
  gameEndReason: 'completed'
})

const currentUserData = ref({
  rank: 0,
  rankPercent: '0%',
  nickname: '我'
})

const top50Data = ref([])

onMounted(async () => {
  // 获取游戏数据
  gameData.value = {
    distance: gameStore.sessionDistance || 0,
    score: gameStore.sessionScore || 0,
    gameEndReason: gameStore.gameEndReason || 'completed'
  }
  
  try {
    const requestData = {
      deviceId: userStore.deviceId,
      qimei36: userStore.qimei36,
      hasLogin: userStore.hasLogin,
      isInQQNewsApp: userStore.isInQQNewsApp,
      userAgent: userStore.userAgent,
      distance: gameData.value.distance,
      score: gameData.value.score,
      gameEndReason: gameData.value.gameEndReason,
      trophiesEarned: gameStore.earnedTrophies || []
    }
    
    const response = await reportSwimmingGameResult(requestData)
    
    if (response && response.data) {
      // 更新当前用户数据
      if (response.data.rankPercent !== undefined) {
        currentUserData.value.rankPercent = response.data.rankPercent
      }
      
      if (response.data.currentUserEntry) {
        currentUserData.value = {
          ...currentUserData.value,
          ...response.data.currentUserEntry
        }
      }
      
      // 更新排行榜数据
      if (response.data.leaderboardEntries && Array.isArray(response.data.leaderboardEntries)) {
        top50Data.value = response.data.leaderboardEntries
      }
    }
  } catch (error) {
    console.error('获取游泳排行榜数据失败:', error)
  }
})

const playAgain = () => {
  gameStore.resetGame()
  // 跳转到游戏页面
}

const unlockAllLevels = () => {
  // 解锁全部关卡逻辑
  console.log('解锁全部游泳关卡')
}
</script>

<style scoped>
.ending-scene-app {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.swimming-results {
  text-align: center;
  margin-bottom: 30px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  opacity: 0.8;
}

.value {
  font-size: 18px;
  font-weight: bold;
  margin-top: 5px;
}

.leaderboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-entry.current-user {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.play-again-btn, .unlock-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-again-btn {
  background: #4CAF50;
  color: white;
}

.unlock-btn {
  background: #FF9800;
  color: