<template>
  <div v-if="isVisible" class="leaderboard-modal" @click="hideLeaderboard">
    <div class="leaderboard-panel" @click.stop>
      <!-- 标题栏 -->
      <div class="leaderboard-header">
        <div class="leaderboard-title">
          <img src="/vector/gold.svg" alt="奖杯图标" class="title-icon" />
          <span>排行榜</span>
        </div>
        <button class="close-btn" @click="hideLeaderboard">
          <div class="close-x"></div>
        </button>
      </div>
      
      <!-- 表头 -->
      <div class="table-header">
        <div class="header-bg"></div>
        <div class="header-labels">
          <span class="label-rank">排名</span>
          <span class="label-player">玩家</span>
          <span class="label-distance">距离</span>
          <span class="label-score">得分</span>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-text">正在加载排行榜...</div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="hasError" class="error-container">
        <div class="error-text">加载失败，正在使用模拟数据</div>
      </div>
      
      <!-- 排行榜内容 -->
      <div v-else class="leaderboard-content">
        <div 
          v-for="(player, index) in leaderboardData" 
          :key="index"
          class="player-row"
          :class="{ 'current-player': player.isCurrentPlayer }"
        >
          <span class="player-rank">{{ player.rank }}</span>
          <span class="player-name">{{ player.name }}</span>
          <span class="player-distance">{{ player.distance }}m</span>
          <span class="player-score">{{ player.score }}</span>
        </div>
      </div>
      
      <!-- 我的排名 -->
      <div class="my-rank-section">
        <div class="my-rank-bg"></div>
        <div class="my-rank-content">
          <span class="my-rank-label">我的排名</span>
          <div class="my-rank-row">
            <span class="player-rank">{{ currentPlayerRank }}</span>
            <span class="player-name">{{ currentPlayerName }}</span>
            <span class="player-distance">{{ currentPlayerDistance }}m</span>
            <span class="player-score">{{ currentPlayerScore }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { useUserStore } from '../stores/userStore'
import { getRankingOnly, parseScoreToStarsAndDistance } from '../utils/request'

export default {
  name: 'Leaderboard',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const gameStateStore = useGameStateStore()
    const userStore = useUserStore()
    
    // 数据状态
    const leaderboardData = ref([])
    const isLoading = ref(false)
    const hasError = ref(false)
    const bestRank = ref(null)
    
    // 模拟排行榜数据（作为fallback）
    const mockLeaderboardData = [
      { rank: 1, name: 'id：75134841', distance: 1602, score: 150 },
      { rank: 2, name: 'id：6511202', distance: 1602, score: 149 },
      { rank: 3, name: 'id：75134841', distance: 1607, score: 130 },
      { rank: 4, name: 'id：75134841', distance: 1555, score: 120 },
      { rank: 5, name: 'id：75134841', distance: 1408, score: 110 },
      { rank: 6, name: 'id：75134841', distance: 1452, score: 98 },
      { rank: 7, name: 'id：75134841', distance: 1252, score: 98 },
      { rank: 8, name: 'id：75134841', distance: 1350, score: 95 },
      { rank: 9, name: 'id：75134841', distance: 950, score: 80 }
    ]
    
    // 获取排行榜数据
    const fetchLeaderboardData = async () => {
      if (!props.isVisible) return
      
      isLoading.value = true
      hasError.value = false
      
      try {
        console.log('开始获取排行榜数据...')
        const response = await getRankingOnly()
        
        if (response && response.code === 0 && response.data) {
          const apiData = response.data
          
          // 处理排行榜数据
          if (apiData.ranking_board && Array.isArray(apiData.ranking_board)) {
            leaderboardData.value = apiData.ranking_board.map(entry => {
              const { stars, distance } = parseScoreToStarsAndDistance(entry.ranking.score)
              return {
                rank: entry.ranking.rank,
                name: (entry.user_info.nick && entry.user_info.nick.trim() !== '') 
                  ? entry.user_info.nick 
                  : `游泳挑战者${entry.ranking.rank}`,
                distance: distance,
                score: stars,
                head_url: entry.user_info.head_url || ''
              }
            })
          } else {
            // API数据格式异常，使用模拟数据
            leaderboardData.value = mockLeaderboardData
            hasError.value = true
          }
          
          // 处理用户最佳排名
          if (apiData.best_rank) {
            const { stars, distance } = parseScoreToStarsAndDistance(apiData.best_rank.score)
            bestRank.value = {
              rank: apiData.best_rank.rank,
              stars: stars,
              distance: distance
            }
          }
          
          console.log('排行榜数据获取成功:', leaderboardData.value)
          
        } else {
          throw new Error('API返回数据格式异常')
        }
        
      } catch (error) {
        console.error('获取排行榜数据失败:', error)
        hasError.value = true
        // 使用模拟数据作为fallback
        leaderboardData.value = mockLeaderboardData
      } finally {
        isLoading.value = false
      }
    }
    
    // 当前玩家信息
    const currentPlayerRank = computed(() => {
      if (bestRank.value && bestRank.value.rank) {
        return bestRank.value.rank
      }
      return '未上榜'
    })
    
    const currentPlayerName = computed(() => {
      if (userStore.hasLogin) {
        return '我'
      }
      return '我(登录后进入榜单)'
    })
    
    const currentPlayerDistance = computed(() => {
      if (bestRank.value && bestRank.value.distance) {
        return bestRank.value.distance
      }
      return Math.floor(gameStateStore.distance || 0)
    })
    
    const currentPlayerScore = computed(() => {
      if (bestRank.value && bestRank.value.stars) {
        return bestRank.value.stars
      }
      return gameStateStore.stars || 0
    })
    
    const hideLeaderboard = () => {
      emit('close')
    }
    
    // 监听visible变化，当显示时获取数据
    watch(() => props.isVisible, (newValue) => {
      if (newValue) {
        fetchLeaderboardData()
      }
    }, { immediate: true })
    
    return {
      leaderboardData,
      isLoading,
      hasError,
      currentPlayerRank,
      currentPlayerName,
      currentPlayerDistance,
      currentPlayerScore,
      hideLeaderboard
    }
  }
}
</script>

<style scoped>
.leaderboard-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.leaderboard-panel {
  width: 64vw; /* 240px / 375px * 100 */
  height: 55.33vh; /* 431px / 779px * 100 */
  background: rgb(255, 235, 210);
  border: 2px solid rgb(114, 51, 46);
  border-radius: 5.33vw; /* 20px / 375px * 100 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto; /* 添加这行来确保点击事件正常工作 */
}

/* 标题栏 */
.leaderboard-header {
  display: flex;
  justify-content: center; /* 改为center */
  align-items: center;
  margin-bottom: -2.13dvw; /* 与游戏规则一致 */
  position: relative; /* 添加相对定位 */
  height: 15dvw; /* 与游戏规则一致 */
  padding: 0 4dvw; /* 与游戏规则一致 */
  border-bottom: 0.17dvh solid rgb(182, 157, 134); /* 与游戏规则一致 */
  background: rgb(255, 235, 210); /* 添加背景色与游戏规则一致 */
}

.leaderboard-title {
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中图标 */
  gap: 2.13dvw; /* 图标与文字间距与游戏规则一致 */
  color: rgb(114, 51, 46);
  font-size: 5.33vw; /* 与游戏规则标题一致 */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 800; /* 与其他标题一致 */
  margin-left: -1.07dvw; /* 与游戏规则一致 */
}

.leaderboard-title .title-icon {
  width: 6.24vw; /* 与游戏规则图标大小一致 */
  height: 6.24vw;
  object-fit: contain; /* 保持图标比例 */
}

.leaderboard-header .close-btn {
  position: absolute; /* 改为绝对定位 */
  right: 0;
  top: 50%;
  transform: translateY(-50%); /* 垂直居中 */
  width: 8.53dvw;
  height: 8.53dvw;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; /* 统一添加事件处理 */
  z-index: 10; /* 统一添加层级 */
}

.leaderboard-header .close-x {
  position: relative;
  width: 6.4dvw; /* 与其他close-x一致 */
  height: 6.4dvw;
}

.leaderboard-header .close-x::before,
.leaderboard-header .close-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6.4dvw; /* 与其他close-x一致 */
  height: 0.8dvw; /* 与其他close-x一致 */
  background: rgb(114, 51, 46);
  border-radius: 0.4dvw;
}

.leaderboard-header .close-x::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.leaderboard-header .close-x::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

/* 表头 */
.table-header {
  position: relative;
  height: 2.31vh; /* 18px / 779px * 100 */
  background: rgb(217, 181, 149);
  border-radius: 2.67vw; /* 10px / 375px * 100 */
  margin: 0 3.2vw;
}

.header-labels {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 2.67vw;
  position: relative;
  z-index: 1;
}

.label-rank {
  width: 13.55vw; /* 50.81px / 375px * 100 */
  color: rgb(114, 51, 46);
  font-size: 2.67vw; /* 10px / 375px * 100 */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center; /* 改为居中对齐 */
}

.label-player {
  width: 26.67vw; /* 增加宽度以平衡布局 */
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
}

.label-distance {
  width: 15.47vw; /* 调整宽度 */
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
}

.label-score {
  width: 13.31vw; /* 调整宽度以平衡 */
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
}

/* 排行榜内容 */
.leaderboard-content {
  flex: 1;
  overflow-y: auto;
  background: rgb(217, 181, 149);
  margin: 0 3.2vw;
  padding: 1.28vh 0;
  border: 1px solid rgb(182, 157, 134);
}

.player-row {
  display: flex;
  align-items: center;
  height: 3.85vh; /* 30px / 779px * 100 */
  background: rgb(255, 235, 207);
  border: 1px solid rgb(182, 157, 134);
  border-radius: 1.33vw; /* 5px / 375px * 100 */
  margin: 0 0.8vw 0.64vh;
  padding: 0 2.67vw;
}

.player-row.current-player {
  background: rgba(255, 241, 41, 0.3);
}

.player-rank {
  width: 13.55vw; /* 与表头一致 */
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center; /* 改为居中对齐 */
}

.player-name {
  width: 26.67vw; /* 与表头一致 */
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-distance {
  width: 15.47vw; /* 与表头一致 */
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
}

.player-score {
  width: 13.31vw; /* 与表头一致 */
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
}

/* 我的排名 */
.my-rank-section {
  background: rgb(217, 181, 149);
  border: 1px solid rgb(182, 157, 134);
  border-radius: 1.33vw;
  margin: 1.28vh 3.2vw;
  padding: 1.28vh 2.67vw;
}

.my-rank-label {
  display: block;
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.64vh;
}

.my-rank-row {
  display: flex;
  align-items: center;
  height: 3.85vh;
  background: rgb(255, 235, 207);
  border: 1px solid rgb(182, 157, 134);
  border-radius: 1.33vw;
  padding: 0 2.67vw;
}

/* 加载和错误状态样式 */
.loading-container,
.error-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(217, 181, 149);
  margin: 0 3.2vw;
  border-radius: 1.33vw;
}

.loading-text,
.error-text {
  color: rgb(114, 51, 46);
  font-size: 3.5vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
}

.error-text {
  font-size: 3vw;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .leaderboard-panel {
    width: 85vw;
    height: 70vh;
  }
  
  .leaderboard-title {
    font-size: 4.5vw;
  }
  
  .label-rank,
  .label-player,
  .label-distance,
  .label-score,
  .player-rank,
  .player-name,
  .player-distance,
  .player-score,
  .my-rank-label {
    font-size: 3vw;
  }
}
</style>