<template>
  <div v-if="isVisible" class="leaderboard-modal" @click="hideLeaderboard">
    <div class="leaderboard-panel" @click.stop>
      <!-- 标题栏 -->
      <div class="leaderboard-header">
        <div class="leaderboard-title">
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
      
      <!-- 排行榜内容 -->
      <div class="leaderboard-content">
        <div 
          v-for="(player, index) in leaderboardData" 
          :key="index"
          class="player-row"
          :class="{ 'current-player': player.isCurrentPlayer }"
        >
          <span class="player-rank">{{ player.rank }}</span>
          <span class="player-name">{{ player.name }}</span>
          <span class="player-distance">{{ player.distance }}</span>
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
            <span class="player-distance">{{ currentPlayerDistance }}</span>
            <span class="player-score">{{ currentPlayerScore }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useGameStateStore } from '../stores/gamestore/gameState'

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
    
    // 模拟排行榜数据
    const leaderboardData = ref([
      { rank: 1, name: 'id：75134841', distance: '1602m', score: 150 },
      { rank: 2, name: 'id：6511202', distance: '1602m', score: 149 },
      { rank: 3, name: 'id：75134841', distance: '1607m', score: 130 },
      { rank: 4, name: 'id：75134841', distance: '1555m', score: 120 },
      { rank: 5, name: 'id：75134841', distance: '1408m', score: 110 },
      { rank: 6, name: 'id：75134841', distance: '1452m', score: 98 },
      { rank: 7, name: 'id：75134841', distance: '1252m', score: 98 },
      { rank: 8, name: 'id：75134841', distance: '1350m', score: 95 },
      { rank: 9, name: 'id：75134841', distance: '950m', score: 80 }
    ])
    
    // 当前玩家信息
    const currentPlayerRank = computed(() => 55)
    const currentPlayerName = computed(() => 'id：75134841')
    const currentPlayerDistance = computed(() => `${Math.floor(gameStateStore.distance)}m`)
    const currentPlayerScore = computed(() => gameStateStore.stars)
    
    const hideLeaderboard = () => {
      emit('close')
    }
    
    return {
      leaderboardData,
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
  margin-bottom: 0.2dvh; /* 与其他header一致 */
  position: relative; /* 添加相对定位 */
  height: 8.53dvw; /* 统一高度 */
  padding: 0 8.53dvw; /* 左右padding为关闭按钮宽度 */
  border-bottom: 1px solid rgb(182, 157, 134);
}

.leaderboard-title {
  color: rgb(114, 51, 46);
  font-size: 6.4dvw; /* 与其他标题一致 */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 800; /* 与其他标题一致 */
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
  text-align: left;
}

.label-player {
  width: 20.54vw; /* 77px / 375px * 100 */
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
}

.label-distance {
  width: 13.55vw;
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
}

.label-score {
  width: 9.87vw; /* 37px / 375px * 100 */
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
  width: 4.53vw; /* 17px / 375px * 100 */
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: left;
}

.player-name {
  width: 20.54vw;
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
  width: 9.87vw;
  color: rgb(114, 51, 46);
  font-size: 2.67vw;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  text-align: center;
}

.player-score {
  width: 9.87vw;
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