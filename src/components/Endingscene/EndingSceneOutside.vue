<template>
  <div class="ending-scene-outside">
    <!-- 背景容器 -->
    <div class="background-container">
      
      <!-- 恭喜文字 -->
      <div class="congratulation-text">
        恭喜{{ currentUserData?.nickName || '您' }}获得
      </div>
      
      <!-- 称号区域 -->
      <div class="title-section">
        <div class="user-title">
          <div class="title-text">
            <span 
              v-for="(char, index) in getTitleByDistance(gameData.currentDistance).split('')" 
              :key="index"
              class="title-char"
            >
              {{ char }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 结果描述文字 -->
      <div class="result-description">
        <template v-if="gameData.currentDistance === 0">
          再次挑战！
        </template>
        <template v-else>
          你得到了 <span class="number-text">{{ gameData.stars }}</span> 分，{{ currentUserEntry?.rank ? '恭喜进入排行榜！' : '很遗憾没有进入排行榜。' }}
          <br>
          你游了 <span class="number-text">{{ gameData.currentDistance }}</span> 米，已超越 <span class="number-text">{{ currentUserData?.rankPercent || '0' }}%</span> 网友！
        </template>
      </div>

      <!-- openApp 大图 -->
      <div class="open-app-container">
        <img 
          src="/openApp.png" 
          @click="handleOpenApp" 
          class="open-app-image" 
          alt="打开APP解锁全部关卡"
        >
      </div>
      
      <!-- 排行榜标题 -->
      <div class="leaderboard-title">
        <img src="/vector/RankIcon.svg" class="rank-icon" alt="排行榜图标">
        <span class="title-text">指尖游泳排行榜</span>
      </div>
      
      <!-- 排行榜容器 -->
      <div class="leaderboard-container">
        <!-- 表头 -->
        <div class="leaderboard-header">
          <span class="header-rank">排名</span>
          <span class="header-name">名称</span>
          <span class="header-distance">距离</span>
          <span class="header-score">得分</span>
        </div>
        
        <!-- 可滚动的排行榜列表 -->
        <div class="leaderboard-scroll-container">
          <!-- 我的成绩（第一位，特殊样式） -->
          <div v-if="currentUserEntry" class="my-result-row">
            <div class="ranking-bg-container">
              <img src="/vector/MeRankingList.svg" class="ranking-bg" alt="我的排名背景">
            </div>
            <div class="ranking-content">
              <span class="rank-number my-rank">{{ currentUserEntry.rank || '未上榜' }}</span>
              <span class="player-name my-name">我的成绩</span>
              <span class="player-distance my-distance">{{ currentUserEntry.distance || gameData.currentDistance }}</span>
              <span class="player-score my-score">{{ currentUserEntry.stars || gameData.stars }}</span>
            </div>
          </div>
          
          <!-- 扩展排行榜列表（50人） -->
          <div 
            v-for="(player, index) in extendedLeaderboard" 
            :key="index"
            class="ranking-row"
          >
            <div class="ranking-bg-container">
              <img src="/vector/RankingList.svg" class="ranking-bg" alt="排名背景">
            </div>
            <div class="ranking-content">
              <span class="rank-number">{{ player.rank }}</span>
              <span class="player-name">{{ player.nick }}</span>
              <span class="player-distance">{{ player.distance }}</span>
              <span class="player-score">{{ player.stars || player.score }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部渐变遮罩 -->
      <div class="bottom-gradient"></div>
      
      <!-- 分享提示（当无法继续游戏时显示） -->
      <div v-if="showNeedShareTipsImage" class="share-tips">
        <img src="/needShareToPlayTips.png" alt="分享给好友，获得3次挑战机会" class="tips-background">
      </div>
      
      <!-- 底部按钮 -->
      <div class="bottom-buttons">
        <img 
          src="/tryAgain.png" 
          @click="handleRestartGame" 
          class="try-again-btn" 
          :class="{ 'disabled': isTryAgainDisabled }" 
          alt="再次挑战"
        >
        <img 
          src="/shareToFriend.png" 
          @click="handleShareToFriendClick" 
          class="share-friend-btn" 
          alt="分享给朋友"
        >
      </div>
    </div>

    <!-- 分享箭头遮罩 -->
    <div v-if="shareArrowOverlayIsVisible" class="share-overlay" @click="handleOverlayClick">
      <img src="/shareArrow.png" class="share-instruction-arrow" alt="点击此处分享">
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useGameStateStore } from '../../stores/gamestore/gameState'
import { useUserStore } from '../../stores/userStore'
import { openNativeScheme } from '../../utils/appDownload'
// 在import部分添加（约第130行）
import { reportSwimmingGameResult, getActivityPV } from '../../utils/request'

const gameStore = useGameStore()
const gameStateStore = useGameStateStore()
const userStore = useUserStore()

const currentUserData = ref(null)
const shareArrowOverlayIsVisible = ref(false)
const leaderboardData = ref([])
const currentUserEntry = ref(null)
const showNeedShareTipsImage = ref(false)
const isTryAgainDisabled = ref(false)

// 游戏数据
const gameData = computed(() => ({
  currentDistance: gameStateStore.finalDistance || gameStore.distance || 0,
  stars: gameStateStore.score || gameStore.stars || 0
}))

// 根据距离获取称号
const getTitleByDistance = (distance) => {
  if (distance >= 320) return '泳坛传奇'
  if (distance >= 280) return '泳坛王者'
  if (distance >= 240) return '水中蛟龙'
  if (distance >= 200) return '浪里白条'
  if (distance >= 160) return '浪里飞鱼'
  if (distance >= 120) return '泳池新星'
  if (distance >= 80) return '水中精灵'
  if (distance >= 40) return '泳池新手'
  return '初出茅庐'
}

// 扩展排行榜数据（50人）
const extendedLeaderboard = computed(() => {
  const extended = [...leaderboardData.value]
  
  // 如果不足50人，生成更多数据
  while (extended.length < 50) {
    const rank = extended.length + 1
    const nicknames = ['游泳健将', '水中飞鱼', '蛙泳大师', '自由泳选手', '仰泳高手', '蝶泳专家', '混合泳王者', '水中精灵']
    const baseStar = Math.max(1, 30 - rank + Math.floor(Math.random() * 5))
    const baseDistance = Math.max(50, 800 - rank * 10 + Math.floor(Math.random() * 50))
    
    extended.push({
      rank: rank,
      nick: `${nicknames[Math.floor(Math.random() * nicknames.length)]}_${Math.floor(Math.random() * 1000)}`,
      distance: baseDistance,
      stars: baseStar,
      score: baseStar
    })
  }
  
  return extended.slice(0, 50)
})

// 监听游戏次数变化
watch(() => userStore.canPlay, (canStillPlay) => {
  console.log(`[EndingSceneOutside] userStore.canPlay changed to: ${canStillPlay}`)
  isTryAgainDisabled.value = !canStillPlay
  showNeedShareTipsImage.value = !canStillPlay
  userStore.logCurrentPlayStats('[EndingSceneOutside] Stats after canPlay changed')
}, { immediate: true })

// 在script setup部分，修改数据处理逻辑

// 解析score为星星数和距离的函数
const parseScoreToStarsAndDistance = (score) => {
  const stars = Math.floor(score / 100000)
  const distance = score % 100000
  return { stars, distance }
}

// 计算击败百分比的函数
const calculateDefeatPercentage = (lessScoreCount, totalPV) => {
  if (!totalPV || totalPV === 0) return '0'
  return Math.round((lessScoreCount / totalPV) * 100)
}

// 修改onMounted函数（约第212行）
onMounted(async () => {
  try {
    // 1. 首先获取真实的PV数据
    let realCurrentPV = 100; // 默认值
    try {
      console.log('获取真实PV数据...');
      const pvResponse = await getActivityPV();
      if (pvResponse && pvResponse.data && pvResponse.data.current_pv) {
        realCurrentPV = parseInt(pvResponse.data.current_pv);
        console.log('获取到真实current_pv:', realCurrentPV);
      } else if (pvResponse && pvResponse.current_pv) {
        realCurrentPV = parseInt(pvResponse.current_pv);
        console.log('获取到真实current_pv:', realCurrentPV);
      }
    } catch (pvError) {
      console.error('获取PV数据失败，使用默认值:', pvError);
    }
    
    // 2. 上报游戏结果
    const gameResultData = {
      distance: gameData.value.currentDistance,
      score: gameData.value.stars,
      stars: gameData.value.stars,
      survivalTime: gameStore.survivalTime || gameStateStore.survivalTime || 0,
      gameTime: gameStore.gameTime || gameStateStore.gameTime || 0,
      gameEndReason: gameStore.gameEndReason || gameStateStore.gameEndReason || 'completed'
    }
    
    const realDataResponse = await reportSwimmingGameResult(gameResultData)
    if (realDataResponse && realDataResponse.code === 0 && realDataResponse.data) {
      const apiData = realDataResponse.data
      
      // 3. 使用真实的current_pv计算击败百分比
      const defeatPercentage = calculateDefeatPercentage(
        apiData.less_score_count || 0,
        realCurrentPV  // 使用真实的PV数据
      )
      
      console.log(`战胜比例计算: ${apiData.less_score_count || 0} / ${realCurrentPV} = ${defeatPercentage}%`);
      
      currentUserData.value = { 
        rankPercent: defeatPercentage,
        nickName: '您'
      }
      
      // 设置排行榜数据 - 适配新的API格式
      if (apiData.ranking_board && Array.isArray(apiData.ranking_board)) {
        leaderboardData.value = apiData.ranking_board.slice(0, 50).map(entry => {
          const { stars, distance } = parseScoreToStarsAndDistance(entry.ranking.score)
          return {
            rank: entry.ranking.rank,
            nick: (entry.user_info.nick && entry.user_info.nick.trim() !== '') ? entry.user_info.nick : "游泳挑战者",
            distance: distance,
            stars: stars,
            score: stars,
            head_url: entry.user_info.head_url || ''
          }
        })
      } else {
        leaderboardData.value = generateMockLeaderboard()
      }
      
      // 设置当前用户数据 - 使用best_rank信息
      if (apiData.best_rank) {
        const { stars, distance } = parseScoreToStarsAndDistance(apiData.best_rank.score)
        currentUserEntry.value = {
          rank: apiData.best_rank.rank,
          nick: "我",
          distance: distance,
          stars: stars
        }
      } else {
        currentUserEntry.value = {
          rank: '未上榜',
          nick: "我",
          distance: gameData.value.currentDistance,
          stars: gameData.value.stars
        }
      }
    } else {
      // 使用模拟数据
      leaderboardData.value = generateMockLeaderboard()
      currentUserData.value = { rankPercent: '33', nickName: '您' }
      currentUserEntry.value = {
        rank: Math.floor(Math.random() * 100) + 50,
        nick: "我",
        distance: gameData.value.currentDistance,
        stars: gameData.value.stars
      }
    }
  } catch (e) {
    // 使用模拟数据
    leaderboardData.value = generateMockLeaderboard()
    currentUserData.value = { rankPercent: '66', nickName: '大白兔吃奶糖' }
    currentUserEntry.value = {
      rank: Math.floor(Math.random() * 100) + 50,
      nick: "我",
      distance: gameData.value.currentDistance,
      stars: gameData.value.stars
    }
  }
})

// 生成模拟排行榜数据
function generateMockLeaderboard() {
  const mockData = []
  const nicknames = ['游泳健将', '水中飞鱼', '蛙泳大师']
  
  for (let i = 1; i <= 10; i++) {
    const stars = Math.max(1, 30 - i + Math.floor(Math.random() * 5))
    const distance = Math.max(100, 800 - i * 50 + Math.floor(Math.random() * 100))
    
    mockData.push({
      rank: i,
      nick: `${nicknames[Math.floor(Math.random() * nicknames.length)]}_${Math.floor(Math.random() * 1000)}`,
      distance: distance,
      stars: stars,
      score: stars
    })
  }
  
  return mockData
}

const handleRestartGame = () => {
  userStore.logCurrentPlayStats('[EndingSceneOutside] handleRestartGame clicked')
  if (!userStore.canPlay) {
    return
  }
  gameStateStore.restartGame()
}

const handleOpenApp = () => {
  clickReport({ id: 'open_app' })
  openNativeScheme('qqnews://article_9527?nm=LNK2025052211684300', 'swim')
}

const handleShareToFriendClick = () => {
  clickReport({ id: 'share_in_outside' })
  userStore.logCurrentPlayStats('[EndingSceneOutside] handleShareToFriendClick clicked')
  
  shareArrowOverlayIsVisible.value = true

  console.log('[EndingSceneOutside] Share action initiated (showing arrow). Simulating share & starting 5s timer for bonus plays.')
  setTimeout(() => {
    console.log('[EndingSceneOutside] 5s timer elapsed. Granting bonus plays for outside-app share.')
    userStore.grantBonusPlays(3)
  }, 5000)
}

const handleOverlayClick = () => {
  shareArrowOverlayIsVisible.value = false
}
</script>

<style scoped>
/* 导入字体 */
@import url('https://fonts.googleapis.com/css2?family=PingFang+SC:wght@300;400;600&display=swap');

.ending-scene-outside {
  width: 100%;
  height: 100dvh;
  background-color: #171717;
  position: relative;
  overflow: hidden;
  font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

.background-container {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 5.33vw; /* 20px at 375px width */
  box-sizing: border-box;
}

/* 恭喜文字 */
.congratulation-text {
  position: absolute;
  top: 4.15dvh; /* 30px at 723px height */
  left: 5.33vw; /* 20px at 375px width */
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 4vw; /* 15px at 375px width */
  line-height: 1.4;
  color: #E7E7E7;
}

/* 称号区域 */
.title-section {
  position: absolute;
  top: 6.65dvh; /* 保持与恭喜文字的间距 */
  left: 5.33vw; /* 与open-app-image对齐 */
  width: 89.6vw; /* 与open-app-image宽度一致，确保左右对齐 */
  height: 11dvh; /* 调整为11dvh */
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-title {
  position: relative;
  width: 100%;
  height: 100%; /* 占满整个title-section */
  display: flex;
  align-items: center;
  justify-content: center; /* 居中显示 */
  /* 移除背景色和背景渐变 */
  border-radius: 8px;
}

.title-text {
  font-family: 'MFYuanHei', 'PingFang SC', sans-serif;
  font-size: 22vw; /* 放大文字 */
  font-weight: bold;
  color: #5CBBF9; /* 设计稿中的蓝色 */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  /* 使用flex布局分散字符 */
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between; /* 字符之间均匀分布，首尾字符贴边 */
  align-items: center;
  
  /* 重置默认文字样式 */
  letter-spacing: 0; /* 重置字符间距，由flex控制 */
  line-height: 0.8; /* 减少行高以适应容器 */
  text-align: left; /* 重置文字对齐 */
}

.title-char {
  display: inline-block;
  line-height: 0.8;
  font-size: 22vw !important; /* 强制设置固定字体大小 */
  color: #5CBBF9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  font-family: 'MFYuanHei', 'PingFang SC', sans-serif;
  font-weight: bold;
}

/* 结果描述 */
.result-description {
  position: absolute;
  top: 18.75dvh; /* 称号区域结束(6.65+11=17.65) + 1.1dvh间距 = 18.75 */
  left: 5.33vw; /* 20px at 375px width */
  width: 89.07vw; /* 334px at 375px width */
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600; /* 加粗字体 */
  font-size: 4.5vw; /* 加大字号，从3.73vw增加到4.5vw */
  line-height: 1.4;
  color: #E7E7E7;
  margin-bottom: 1dvh; /* 确保底部至少有1dvh的间距 */
}

.number-text {
  font-family: 'RadikalW01Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #5CBBF9;
}

.open-app-container {
  position: absolute;
  top: 25.6dvh; 
  left: 5.33vw; /* 20px at 375px width */
  width: 89.6vw; /* 336px at 375px width */
  aspect-ratio: 21 / 17; /* 固定比例 21:17 */
  /* 移除固定高度 height: 37.62dvh; */
}

.open-app-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.open-app-image:hover {
  transform: scale(1.02);
}

/* 排行榜标题 */
.leaderboard-title {
  position: absolute;
  top: 62.32dvh; /* openApp结束(23.6+37.62=61.22) + 1.1dvh间距 = 62.32 */
  left: 5.33vw; /* 20px at 375px width */
  display: flex;
  align-items: center;
  gap: 2.13vw; /* 8px at 375px width */
}

.rank-icon {
  width: 3.47vw; /* 13px at 375px width */
  height: 3.47vw; /* 13px at 375px width */
}

.leaderboard-title .title-text {
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 4vw; /* 15px at 375px width */
  line-height: 1.4;
  color: #FFFFFF;
}

/* 排行榜容器 */
.leaderboard-container {
  position: absolute;
  top: 65.82dvh; /* 排行榜标题结束(约64.32) + 1.5dvh间距 = 65.82 */
  left: 5.33vw; /* 20px at 375px width */
  width: 89.6vw; /* 336px at 375px width */
  height: 28dvh; /* 增加高度，因为整体布局更紧凑 */
}

/* 表头 */
.leaderboard-header {
  display: flex;
  align-items: center;
  height: 3.32dvh; /* 24px at 723px height */
  margin-bottom: 1.11dvh; /* 8px at 723px height */
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 3.2vw; /* 12px at 375px width */
  color: #606060;
}

.header-rank {
  width: 15.2vw; /* 57px at 375px width */
  text-align: center;
}

.header-name {
  width: 26.67vw; /* 100px at 375px width */
  text-align: left;
  padding-left: 5.33vw; /* 20px at 375px width */
}

.header-distance {
  width: 23.73vw; /* 89px at 375px width */
  text-align: center;
}

.header-score {
  width: 24vw; /* 90px at 375px width */
  text-align: center;
}

/* 可滚动的排行榜容器 */
.leaderboard-scroll-container {
  height: 22.13dvh; /* 160px at 723px height */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.leaderboard-scroll-container::-webkit-scrollbar {
  width: 0;
  background: transparent; /* Chrome/Safari/Webkit */
}

/* 我的成绩行 */
.my-result-row {
  position: relative;
  width: 89.6vw; /* 336px at 375px width */
  height: 4.7dvh; /* 34px at 723px height */
  margin-bottom: 1.11dvh; /* 8px at 723px height */
}

/* 排行榜行 */
.ranking-row {
  position: relative;
  width: 89.6vw; /* 336px at 375px width */
  height: 4.7dvh; /* 34px at 723px height */
  margin-bottom: 1.11dvh; /* 8px at 723px height */
}

.ranking-bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 防止内容溢出 */
}

.ranking-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* 改为contain确保完整显示 */
}

.ranking-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 4vw; /* 15px at 375px width */
  z-index: 2;
}

.rank-number {
  width: 15.2vw; /* 57px at 375px width */
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #0B0B0B;
}

.my-rank {
  color: #0B0B0B;
}

.player-name {
  width: 26.67vw; /* 100px at 375px width */
  text-align: left;
  padding-left: 5.33vw; /* 20px at 375px width */
  font-family: 'PingFang SC', sans-serif;
  font-weight: 600;
  color: #E7E7E7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.my-name {
  color: #99CCFF;
}

.player-distance {
  width: 23.73vw; /* 89px at 375px width */
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #E7E7E7;
}

.my-distance {
  color: #E7E7E7;
}

.player-score {
  width: 24vw; /* 90px at 375px width */
  text-align: center;
  font-family: 'RadikalW01-Bold', 'PingFang SC', sans-serif;
  font-weight: bold;
  color: #E7E7E7;
}

.my-score {
  color: #E7E7E7;
}

/* 底部渐变 */
.bottom-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 14.94dvh; /* 108px at 723px height */
  background: linear-gradient(180deg, transparent 0%, rgba(23, 23, 23, 0.9) 60%, rgba(23, 23, 23, 1) 100%);
  pointer-events: none;
  z-index: 1;
}

/* 分享提示 */
.share-tips {
  position: absolute;
  bottom: 8.91dvh; /* 调整位置，让下边缘与按钮上边缘挨着 */
  left: 5.07vw; /* 19px at 375px width */
  width: 53.87vw; /* 202px at 375px width */
  height: 4.56dvh; /* 33px at 723px height */
  z-index: 2; /* 确保分享提示在遮罩层之上 */
}

.tips-background {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 确保图片内容完整显示 */
}

/* 底部按钮 */
.bottom-buttons {
  position: absolute;
  bottom: 3.73dvh; /* 27px at 723px height */
  left: 5.33vw; /* 20px at 375px width */
  width: 89.6vw; /* 336px at 375px width */
  height: auto; /* 改为auto，让按钮保持原始比例 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2; /* 确保按钮在遮罩层之上 */
}

.try-again-btn,
.share-friend-btn {
  width: 42.67vw; /* 160px at 375px width */
  height: auto; /* 删除固定高度，保持图片原始纵横比 */
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  z-index: 2; /* 确保按钮可以点击 */
  object-fit: contain; /* 确保图片内容完整显示 */
}

.try-again-btn:hover,
.share-friend-btn:hover {
  transform: scale(1.05);
}

.try-again-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.try-again-btn.disabled:hover {
  transform: none;
}

/* 底部按钮遮罩 */
.bottom-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 9.26dvh; /* 67px at 723px height - 覆盖按钮区域 */
  background: rgba(23, 23, 23, 0.95);
  z-index: 0;
}

/* 分享箭头遮罩 */
.share-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.share-instruction-arrow {
  width: 26.67vw; /* 100px at 375px width */
  height: auto;
  margin-top: 2.76dvh; /* 20px at 723px height */
  margin-right: 5.33vw; /* 20px at 375px width */
}

/* 响应式设计 */
@media (max-width: 414px) {
  .background-container {
    padding: 0 4.27vw; /* 16px at 375px equivalent */
  }
  
  .title-section {
    left: 4.27vw;
    width: calc(100% - 8.54vw);
  }
  
  .leaderboard-container {
    left: 4.27vw;
    width: calc(100% - 8.54vw);
  }
  
  .title-text {
    font-size: 11.2vw; /* 42px equivalent */
  }
}

@media (max-width: 375px) {
  .title-text {
    font-size: 10.13vw; /* 38px equivalent */
  }
  
  .result-description {
    font-size: 3.47vw; /* 13px equivalent */
  }
}
</style>