<template>
  <div v-if="isVisible" class="leaderboard-modal" @click="hideLeaderboard">
    <div class="leaderboard-panel" @click.stop>
      <!-- 标题栏 -->
      <div class="leaderboard-header">
        <div class="leaderboard-title">
          <img v-if="currentView === 'leaderboard'" src="/vector/gold.svg" alt="奖杯图标" class="title-icon" />
          <img v-else src="/vector/gold.svg" alt="规则图标" class="title-icon" />
          <span>{{ currentView === 'leaderboard' ? '排行榜' : '游戏规则' }}</span>
        </div>
        
        <button class="close-btn" @click="hideLeaderboard">
          <div class="close-x"></div>
        </button>
      </div>
      
      <!-- 排行榜视图 -->
      <template v-if="currentView === 'leaderboard'">
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
          <div class="error-text">加载失败，请稍后重试</div>
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
      </template>
      
      <!-- 游戏规则视图 -->
      <template v-else>
        <!-- 规则内容区域 -->
        <div class="rules-content">
          <div class="rules-scroll-content">
            
            <!-- 奖品信息 -->
            <div class="rule-section">
              <div class="rule-description"><strong>冠军泳者将获得价值1300元的NBA ATELIER套装一份（卫衣+T恤+帽子），榜单截至2025年8月8日晚20:00。</strong></div>
            </div>

            <!-- 活动介绍 -->
            <div class="rule-section">
              <div class="rule-description">2025新加坡游泳世锦赛热血进行中，看比赛的你是不是有点心痒痒？腾讯新闻重磅推出《指尖游泳》挑战赛，邀你加入泳者行列，在手机上随时随地开始冲榜！</div>
            </div>

            <!-- 规则"怪谈" -->
            <div class="rule-section">
              <div class="rule-title"><strong>——————〈规则"怪谈"〉——————</strong></div>
              <ul class="rule-list">
                <li><strong>禁止滑动</strong>：只能点击屏幕左右区域切换泳道！长按能量按钮可加速冲刺</li>
                <li><strong>远离障碍物</strong>：碰到石头、螃蟹、食人花等将消耗1次生命机会！珍惜仅有3次机会吧</li>
                <li><strong>善用道具</strong>：抓住潜水镜可以秒变"潜水高手"，躲避一切障碍物！时间不长，但非常无敌</li>
                <li><strong>注意观星</strong>：努力捡到更多星星！排行榜根据星星总数进行排名，总数相同时才考虑距离</li>
              </ul>
            </div>

            <!-- 难度一览 -->
            <div class="rule-section">
              <div class="rule-title"><strong>——————〈难度一览〉——————</strong></div>
              <ul class="rule-list">
                <li><strong>前期（0-60米）</strong>：道具绝对充足，主要培养泳者的"游泳"习惯</li>
                <li><strong>中期（60-240米）</strong>：挑战逐步增加，考验泳技的时刻到了</li>
                <li><strong>后期（240米+）</strong>：冲刺不可能，技术？运气？或许都要必备才有可能突破……</li>
              </ul>
            </div>

            <!-- 其他说明 -->
            <div class="rule-section">
              <div class="rule-title"><strong>——————〈其他说明〉——————</strong></div>
              <ul class="rule-list">
                <li>我们会收集玩家头像和昵称，用于游戏内排名榜单展示，增加趣味性和竞技氛围，且会严格保护用户信息安全。</li>
                <li>严禁使用外挂、作弊软件等非法手段，禁止恶意辱骂、攻击等行为，违者将受严厉处罚，确保游戏环境公平公正。</li>
                <li>参与活动即视为认可规则，如遇不可抗力因素，我们将及时通知并调整规则。</li>
              </ul>
            </div>

            <!-- 结语 -->
            <div class="rule-section">
              <div class="rule-description">现在打开游戏，看看你能在 500 米大关前坚持多久吧！是止步新手区，还是成为朋友圈里的 "游泳大神"？灵动指尖，答案马上揭晓！</div>
            </div>
            
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useGameStateStore } from '../stores/gamestore/gameState'
import { useUserStore } from '../stores/userStore'
import { getRankingOnly, getRankingBoard, parseScoreToStarsAndDistance } from '../utils/request'

export default {
  name: 'Leaderboard',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    initialView: {
      type: String,
      default: 'leaderboard'
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
    
    // 视图状态
    const currentView = ref(props.initialView)
    
    // 获取排行榜数据
    const fetchLeaderboardData = async () => {
      if (!props.isVisible) return
      
      isLoading.value = true
      hasError.value = false
      
      try {
        console.log('开始获取排行榜数据...')
        
        // 根据用户状态选择不同的接口
        let response
        if (userStore.isInQQNewsApp && userStore.hasLogin) {
          // 端内已登录用户使用getRankingOnly（获取个人排名+排行榜）
          console.log('[Leaderboard] 端内已登录用户，使用getRankingOnly接口')
          response = await getRankingOnly()
        } else {
          // 端内未登录用户 或 端外用户 使用getRankingBoard（仅获取排行榜前50）
          if (userStore.isInQQNewsApp && !userStore.hasLogin) {
            console.log('[Leaderboard] 端内未登录用户，使用getRankingBoard接口')
          } else {
            console.log('[Leaderboard] 端外用户，使用getRankingBoard接口')
          }
          response = await getRankingBoard()
        }
        
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
            // API数据格式异常，显示空状态
            leaderboardData.value = []
            hasError.value = true
          }
          
          // 处理用户最佳排名（仅端内已登录用户有效）
          if (userStore.isInQQNewsApp && userStore.hasLogin && apiData.best_rank) {
            const { stars, distance } = parseScoreToStarsAndDistance(apiData.best_rank.score)
            bestRank.value = {
              rank: apiData.best_rank.rank,
              stars: stars,
              distance: distance
            }
            console.log('[Leaderboard] 端内已登录用户，显示个人排名:', bestRank.value)
          } else {
            // 端内未登录用户 或 端外用户 没有个人排名数据
            bestRank.value = null
            if (userStore.isInQQNewsApp && !userStore.hasLogin) {
              console.log('[Leaderboard] 端内未登录用户，不显示个人排名')
            } else if (!userStore.isInQQNewsApp) {
              console.log('[Leaderboard] 端外用户，不显示个人排名')
            }
          }
          
          console.log('排行榜数据获取成功:', leaderboardData.value)
          
        } else {
          throw new Error('API返回数据格式异常')
        }
        
      } catch (error) {
        console.error('获取排行榜数据失败:', error)
        hasError.value = true
        // 不再使用模拟数据，显示空状态
        leaderboardData.value = []
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
        // 设置为传入的初始视图
        currentView.value = props.initialView
        // 只有在排行榜视图时才获取排行榜数据
        if (props.initialView === 'leaderboard') {
          fetchLeaderboardData()
        }
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
      hideLeaderboard,
      currentView,
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
  margin-bottom: -2.13vw; /* 与游戏规则一致 */
  position: relative; /* 添加相对定位 */
  height: 15vw; /* 与游戏规则一致 */
  padding: 0 4vw; /* 与游戏规则一致 */
  border-bottom: 0.17vh solid rgb(182, 157, 134); /* 与游戏规则一致 */
  background: rgb(255, 235, 210); /* 添加背景色与游戏规则一致 */
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .leaderboard-header {
    border-bottom: 0.17dvh solid rgb(182, 157, 134); /* 与游戏规则一致 */
  }
}

.leaderboard-title {
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中图标 */
  gap: 2.13vw; /* 图标与文字间距与游戏规则一致 */
  color: rgb(114, 51, 46);
  font-size: 5.33vw; /* 与游戏规则标题一致 */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 800; /* 与其他标题一致 */
  margin-left: -1.07vw; /* 与游戏规则一致 */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .leaderboard-title {
    gap: 2.13dvw; /* 图标与文字间距与游戏规则一致 */
    margin-left: -1.07dvw; /* 与游戏规则一致 */
  }
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
  width: 8.53vw;
  height: 8.53vw;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto; /* 统一添加事件处理 */
  z-index: 10; /* 统一添加层级 */
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .leaderboard-header .close-btn {
    width: 8.53dvw;
    height: 8.53dvw;
  }
}

.leaderboard-header .close-x {
  position: relative;
  width: 6.4vw; /* 与其他close-x一致 */
  height: 6.4vw;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .leaderboard-header .close-x {
    width: 6.4dvw; /* 与其他close-x一致 */
    height: 6.4dvw;
  }
}

.leaderboard-header .close-x::before,
.leaderboard-header .close-x::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6.4vw; /* 与其他close-x一致 */
  height: 0.8vw; /* 与其他close-x一致 */
  background: rgb(114, 51, 46);
  border-radius: 0.4vw;
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .leaderboard-header .close-x::before,
  .leaderboard-header .close-x::after {
    width: 6.4dvw; /* 与其他close-x一致 */
    height: 0.8dvw; /* 与其他close-x一致 */
    border-radius: 0.4dvw;
  }
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
  border-radius: 1.33vw; /* 添加与my-rank-section相同的圆角 */
  /* 隐藏滚动条 - Firefox */
  scrollbar-width: none;
  /* 隐藏滚动条 - IE/Edge */
  -ms-overflow-style: none;
}

/* 隐藏滚动条 - Webkit浏览器 */
.leaderboard-content::-webkit-scrollbar {
  display: none;
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

/* 规则内容区域 */
.rules-content {
  flex: 1;
  overflow-y: auto;
  background: rgb(217, 181, 149);
  margin: 0 3.2vw;
  padding: 1.28vh 2.67vw;
  border: 1px solid rgb(182, 157, 134);
  border-radius: 1.33vw;
  /* 隐藏滚动条 - Firefox */
  scrollbar-width: none;
  /* 隐藏滚动条 - IE/Edge */
  -ms-overflow-style: none;
}

/* 如果支持dvh和dvw,则使用dvh和dvw覆盖上面的vh和vw值 */
@supports (height: 100dvh) and (width: 100dvw) {
  .rules-content {
    margin: 0 3.2dvw;
    padding: 1.28dvh 2.67dvw;
    border-radius: 1.33dvw;
  }
}

/* 隐藏滚动条 - Webkit浏览器 */
.rules-content::-webkit-scrollbar {
  display: none;
}

.rules-scroll-content {
  padding: 1.28vh 0; /* 10px / 779px * 100 vertical, 0 horizontal */
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .rules-scroll-content {
    padding: 1.28dvh 0;
  }
}

/* 规则区块 */
.rule-section {
  margin-bottom: 1.92vh; /* 15px / 779px * 100 */
}

.rule-section:last-child {
  margin-bottom: 0;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .rule-section {
    margin-bottom: 1.92dvh;
  }
}

/* 规则标题 */
.rule-section  {
  color: rgb(114, 51, 46);
  font-size: 3.5vw; /* 统一字体大小为3.5vw */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600; /* 统一字体粗细为600 */
  margin-bottom: 0.64vh;
  text-align: left;
}
.rule-title {
  color: rgb(114, 51, 46);
  font-size: 3.5vw; /* 统一字体大小为3.5vw */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600; /* 统一字体粗细为600 */
  margin-bottom: 0.64vh;
  text-align: center;
}
/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .rule-section .rule-title {
    margin-bottom: 0.64dvh;
  }
}

/* 规则描述 */
.rule-section .rule-description {
  color: rgb(114, 51, 46);
  font-size: 3.5vw; /* 统一字体大小为3.5vw */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600; /* 统一字体粗细为600 */
  line-height: 1.4;
  text-align: left;
  margin-bottom: 1.28vh;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .rule-section .rule-description {
    margin-bottom: 1.28dvh;
  }
}

/* 操作列表 */
.rule-section .operation-list {
  display: flex;
  flex-direction: column;
  gap: 0.64vh;
  margin-bottom: 1.28vh;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .rule-section .operation-list {
    gap: 0.64dvh;
    margin-bottom: 1.28dvh;
  }
}

.operation-item {
  display: flex;
  align-items: center;
  gap: 1.07vw;
  color: rgb(114, 51, 46);
  font-size: 3.5vw; /* 统一字体大小为3.5vw */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600; /* 统一字体粗细为600 */
  text-align: left;
}

.operation-text {
  flex: 1;
  color: rgb(114, 51, 46);
  font-size: 3.5vw; /* 统一字体大小为3.5vw */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600; /* 统一字体粗细为600 */
  text-align: left;
}

/* 游戏规则列表 */
.rule-section .rule-list {
  list-style: none;
  padding: 0;
  margin: 0;
  color: rgb(114, 51, 46);
  font-size: 3.5vw; /* 统一字体大小为3.5vw */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600; /* 统一字体粗细为600 */
  line-height: 1.4;
}

.rule-list li {
  margin-bottom: 0.64vh;
  color: rgb(114, 51, 46);
  font-size: 3.5vw; /* 统一字体大小为3.5vw */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600; /* 统一字体粗细为600 */
  text-align: left;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .rule-list li {
    margin-bottom: 0.64dvh;
  }
}

/* 特殊道具列表 */
.rule-section .items-list {
  display: flex;
  flex-direction: column;
  gap: 0.64vh;
  margin-bottom: 1.28vh;
}

/* 如果支持dvh,则使用dvh覆盖上面的vh值 */
@supports (height: 100dvh) {
  .rule-section .items-list {
    gap: 0.64dvh;
    margin-bottom: 1.28dvh;
  }
}

.item {
  display: flex;
  align-items: center;
  gap: 1.07vw;
  color: rgb(114, 51, 46);
  font-size: 3.5vw; /* 统一字体大小为3.5vw */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600; /* 统一字体粗细为600 */
  text-align: left;
}

.item-text {
  flex: 1;
  color: rgb(114, 51, 46);
  font-size: 3.5vw; /* 统一字体大小为3.5vw */
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600; /* 统一字体粗细为600 */
  text-align: left;
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
  .my-rank-label,
  .rule-title,
  .rule-description,
  .operation-item,
  .operation-text,
  .rule-list li,
  .item,
  .item-text {
    font-size: 3.5vw; /* 统一字体大小为3.5vw */
  }
}

/* 如果支持dvw,则使用dvw覆盖上面的vw值 */
@supports (width: 100dvw) {
  .rule-section .rule-title {
    font-size: 3.5dvw; /* 统一字体大小为3.5dvw */
  }
  
  .rule-section .rule-description {
    font-size: 3.5dvw; /* 统一字体大小为3.5dvw */
  }
  
  .operation-item {
    gap: 1.07dvw;
    font-size: 3.5dvw; /* 统一字体大小为3.5dvw */
  }
  
  .operation-text {
    font-size: 3.5dvw; /* 统一字体大小为3.5dvw */
  }
  
  .rule-section .rule-list {
    font-size: 3.5dvw; /* 统一字体大小为3.5dvw */
  }
  
  .rule-list li {
    font-size: 3.5dvw; /* 统一字体大小为3.5dvw */
  }
  
  .item {
    gap: 1.07dvw;
    font-size: 3.5dvw; /* 统一字体大小为3.5dvw */
  }
  
  .item-text {
    font-size: 3.5dvw; /* 统一字体大小为3.5dvw */
  }
}
</style>